import { randomUUID } from "node:crypto";
import { Router } from "express";
import { z } from "zod";
import { resolveChatProviderRuntimeRoute } from "@station/ai/providers/router";
import { requireAuth } from "../middleware/require-auth";
import { getSupabaseAdmin } from "../lib/supabase";
import { loadRuntimeAiProviderKeys, type RuntimeAiProviderKeys } from "../services/ai-provider-key.service";
import {
  TokenQuotaError,
  assertTokenBudgetForEstimate,
  estimateConversationTokens,
  estimateTokensFromText,
  recordLlmTokenUsage,
  selectStationModel,
} from "../services/token-credits.service";
import { incrementOperationalRateLimit } from "../services/operational-cache.service";

export const personaEncountersRouter = Router();

const ENCOUNTER_PREVIEW_MAX_SETUP_CHARS = 1600;
const ENCOUNTER_PREVIEW_MAX_OUTPUT_TOKENS = 360;
const ENCOUNTER_PREVIEW_NVIDIA_OUTPUT_TOKENS = 512;
const ENCOUNTER_PREVIEW_REPLY_MAX_CHARS = 2400;
const ENCOUNTER_PREVIEW_DAY_SECONDS = 24 * 60 * 60;
const ENCOUNTER_PREVIEW_PER_MINUTE = 2;
const ENCOUNTER_PREVIEW_PER_DAY = 20;
const PERSONA_ENCOUNTER_ALLOW_PLATFORM_NVIDIA_PRIVATE_CONTEXT =
  "PERSONA_ENCOUNTER_ALLOW_PLATFORM_NVIDIA_PRIVATE_CONTEXT";
const PERSONA_ENCOUNTER_PRIVATE_SESSION_PROVENANCE_SCHEMA =
  "station.persona_encounter.private_session.v1";
const PERSONA_ENCOUNTER_PRIVATE_SESSION_CURATION_SCHEMA =
  "station.persona_encounter.private_session_curation.v1";
const PERSONA_ENCOUNTER_PUBLIC_EXHIBIT_PROVENANCE_SCHEMA =
  "station.persona_encounter.public_exhibit.v1";
const PRIVATE_SESSION_CURATION_TITLE_MAX_CHARS = 120;
const PRIVATE_SESSION_CURATION_SUMMARY_MAX_CHARS = 800;
const PRIVATE_SESSION_CURATION_TAG_MAX_CHARS = 40;
const PRIVATE_SESSION_CURATION_MAX_TAGS = 12;
const PUBLIC_EXHIBIT_TITLE_MAX_CHARS = 140;
const PUBLIC_EXHIBIT_SUMMARY_MAX_CHARS = 1000;
const PUBLIC_EXHIBIT_TAG_MAX_CHARS = 40;
const PUBLIC_EXHIBIT_MAX_TAGS = 12;

const previewSchema = z.object({
  initiatorPersonaId: z.string().uuid(),
  responderPersonaId: z.string().uuid(),
  setup: z.string().trim().min(1).max(ENCOUNTER_PREVIEW_MAX_SETUP_CHARS),
  maxOutputTokens: z.coerce.number().int().min(80).max(500).optional(),
}).refine((value) => value.initiatorPersonaId !== value.responderPersonaId, {
  message: "Select two different personas.",
  path: ["responderPersonaId"],
});

const privateSessionCreateSchema = z.object({
  initiatorPersonaId: z.string().uuid(),
  responderPersonaId: z.string().uuid(),
  setup: z.string().trim().min(1).max(ENCOUNTER_PREVIEW_MAX_SETUP_CHARS),
  maxOutputTokens: z.coerce.number().int().min(80).max(500).optional(),
}).strict().refine((value) => value.initiatorPersonaId !== value.responderPersonaId, {
  message: "Select two different personas.",
  path: ["responderPersonaId"],
});

const optionalCurationText = (maxLength: number) => z.preprocess((value) => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }
  return value;
}, z.string().max(maxLength).nullable().optional());

const privateSessionCurationSchema = z.object({
  title: optionalCurationText(PRIVATE_SESSION_CURATION_TITLE_MAX_CHARS),
  summary: optionalCurationText(PRIVATE_SESSION_CURATION_SUMMARY_MAX_CHARS),
  tags: z.array(
    z.string().trim().min(1).max(PRIVATE_SESSION_CURATION_TAG_MAX_CHARS),
  ).max(PRIVATE_SESSION_CURATION_MAX_TAGS).optional(),
  publicationCandidate: z.boolean().optional(),
}).strict().refine((value) =>
  value.title !== undefined ||
  value.summary !== undefined ||
  value.tags !== undefined ||
  value.publicationCandidate !== undefined
, {
  message: "At least one curation field is required.",
});

const publicExhibitPublishSchema = z.object({
  confirmPublicExhibit: z.literal(true),
  title: z.string().trim().min(1).max(PUBLIC_EXHIBIT_TITLE_MAX_CHARS),
  summary: z.string().trim().min(1).max(PUBLIC_EXHIBIT_SUMMARY_MAX_CHARS),
  tags: z.array(
    z.string().trim().min(1).max(PUBLIC_EXHIBIT_TAG_MAX_CHARS),
  ).max(PUBLIC_EXHIBIT_MAX_TAGS).default([]),
}).strict();

const publicExhibitReportSchema = z.object({
  reason: z.string().trim().min(1).max(120),
  notes: z.string().trim().max(500).optional(),
}).strict();

const readinessSchema = z.object({
  initiatorPersonaId: z.string().uuid(),
  responderPersonaId: z.string().uuid(),
}).refine((value) => value.initiatorPersonaId !== value.responderPersonaId, {
  message: "Select two different personas.",
  path: ["responderPersonaId"],
});

const sessionIdSchema = z.string().uuid();
const publicExhibitSlugSchema = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*-[a-z0-9]{8}$/);

type EncounterPersonaRow = {
  id: string;
  owner_user_id: string;
  name: string;
  short_description?: string | null;
  long_description?: string | null;
  visibility: "private" | "public";
  provider: "platform" | "openai" | "anthropic" | "deepseek" | "gemini";
  awakening_prompt?: string | null;
  style_notes?: string | null;
};

type EncounterPrivateSessionRow = {
  id: string;
  owner_user_id: string;
  initiator_persona_id: string;
  responder_persona_id: string;
  owner_setup: string;
  responder_reply: string;
  initiator_name_snapshot: string;
  responder_name_snapshot: string;
  provenance_schema: typeof PERSONA_ENCOUNTER_PRIVATE_SESSION_PROVENANCE_SCHEMA;
  source_retrieval_used: boolean;
  shareable: boolean;
  public_visibility: "private";
  owner_title?: string | null;
  owner_summary?: string | null;
  owner_tags?: string[] | null;
  publication_candidate?: boolean | null;
  curation_schema?: typeof PERSONA_ENCOUNTER_PRIVATE_SESSION_CURATION_SCHEMA | null;
  created_at: string;
  updated_at: string;
};

type EncounterPublicExhibitRow = {
  id: string;
  owner_user_id: string;
  private_session_id: string;
  slug: string;
  public_title: string;
  public_summary: string;
  public_tags: string[];
  initiator_name_snapshot: string;
  responder_name_snapshot: string;
  status: "published" | "retracted" | "removed";
  provenance_schema: typeof PERSONA_ENCOUNTER_PUBLIC_EXHIBIT_PROVENANCE_SCHEMA;
  reported_count: number;
  published_at: string;
  retracted_at: string | null;
  removed_at: string | null;
  removed_by: string | null;
  created_at: string;
  updated_at: string;
};

personaEncountersRouter.get("/preview/readiness", requireAuth, async (req, res) => {
  const parsed = readinessSchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const ownerUserId = req.user!.id;
  const sb = getSupabaseAdmin();
  const input = parsed.data;

  const [initiator, responder] = await Promise.all([
    loadOwnedEncounterPersona(sb, input.initiatorPersonaId, ownerUserId),
    loadOwnedEncounterPersona(sb, input.responderPersonaId, ownerUserId),
  ]);

  if (!initiator || !responder) {
    return res.status(403).json({
      ready: false,
      message: "Both personas must belong to this owner before a preview can run.",
      code: "persona_encounter_persona_not_owned",
    });
  }

  const providerResolution = await resolveEncounterPreviewProviderRoute(sb, ownerUserId, req.user!.tier, responder);
  if (!providerResolution.configured) {
    return res.json({
      ready: false,
      message: "Encounter preview is paused because provider setup is unavailable.",
      code: providerResolution.body.code,
      classification: providerResolution.body.classification,
    });
  }

  return res.json({
    ready: true,
    message: "Encounter preview provider is ready.",
  });
});

personaEncountersRouter.post("/preview", requireAuth, async (req, res) => {
  const parsed = previewSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const ownerUserId = req.user!.id;
  const sb = getSupabaseAdmin();
  const input = parsed.data;

  const [initiator, responder] = await Promise.all([
    loadOwnedEncounterPersona(sb, input.initiatorPersonaId, ownerUserId),
    loadOwnedEncounterPersona(sb, input.responderPersonaId, ownerUserId),
  ]);

  if (!initiator || !responder) {
    return res.status(403).json({
      error: "Selected personas must belong to the current owner.",
      code: "persona_encounter_persona_not_owned",
    });
  }

  const generation = await generateEncounterResponderReply({
    sb,
    ownerUserId,
    fallbackTier: req.user!.tier,
    initiator,
    responder,
    setup: input.setup,
    requestedMaxOutputTokens: input.maxOutputTokens,
  });
  if (generation.ok === false) return res.status(generation.status).json(generation.body);

  return res.json({
    preview: {
      reply: {
        role: "responder",
        content: generation.replyContent,
      },
      rateLimit: generation.rateLimit,
    },
    provenance: {
      setup: {
        label: "Owner-authored setup",
        stored: false,
      },
      personas: {
        label: "Selected same-owner personas",
        initiatorName: initiator.name,
        responderName: responder.name,
      },
      reply: {
        label: "Model-generated responder reply",
        generated: true,
      },
      persistence: {
        saved: false,
        transcriptStored: false,
        shareable: false,
        sourceRetrieval: false,
        sourceBuckets: [],
        note: "Disposable preview only; no Memory, Archive, Canon, Continuity, Integrity, or transcript sources were retrieved.",
      },
    },
  });
});

personaEncountersRouter.post("/private-sessions", requireAuth, async (req, res) => {
  const parsed = privateSessionCreateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const ownerUserId = req.user!.id;
  const sb = getSupabaseAdmin();
  const input = parsed.data;

  const [initiator, responder] = await Promise.all([
    loadOwnedEncounterPersona(sb, input.initiatorPersonaId, ownerUserId),
    loadOwnedEncounterPersona(sb, input.responderPersonaId, ownerUserId),
  ]);

  if (!initiator || !responder) {
    return res.status(403).json({
      error: "Selected personas must belong to the current owner.",
      code: "persona_encounter_persona_not_owned",
    });
  }

  const generation = await generateEncounterResponderReply({
    sb,
    ownerUserId,
    fallbackTier: req.user!.tier,
    initiator,
    responder,
    setup: input.setup,
    requestedMaxOutputTokens: input.maxOutputTokens,
  });
  if (generation.ok === false) return res.status(generation.status).json(generation.body);

  const { data, error } = await sb
    .from("persona_encounter_private_sessions")
    .insert({
      owner_user_id: ownerUserId,
      initiator_persona_id: initiator.id,
      responder_persona_id: responder.id,
      owner_setup: input.setup,
      responder_reply: generation.replyContent,
      initiator_name_snapshot: initiator.name,
      responder_name_snapshot: responder.name,
      provenance_schema: PERSONA_ENCOUNTER_PRIVATE_SESSION_PROVENANCE_SCHEMA,
      source_retrieval_used: false,
      shareable: false,
      public_visibility: "private",
    })
    .select("*")
    .single();

  if (error || !data) {
    return res.status(500).json({
      error: "Private encounter session could not be saved.",
      code: "persona_encounter_private_session_save_failed",
    });
  }

  return res.status(201).json({
    session: serializePrivateSession(data as EncounterPrivateSessionRow),
  });
});

personaEncountersRouter.get("/private-sessions", requireAuth, async (req, res) => {
  const ownerUserId = req.user!.id;
  const sb = getSupabaseAdmin();

  const { data, error } = await sb
    .from("persona_encounter_private_sessions")
    .select("*")
    .eq("owner_user_id", ownerUserId)
    .order("created_at", { ascending: false })
    .limit(25);

  if (error) {
    return res.status(500).json({
      error: "Private encounter sessions could not be loaded.",
      code: "persona_encounter_private_session_load_failed",
    });
  }

  const rows = (data ?? []) as EncounterPrivateSessionRow[];
  const exhibits = await loadOwnerPublicExhibitsBySession(sb, ownerUserId, rows.map((row) => row.id));
  return res.json({
    sessions: rows.map((row) => serializePrivateSession(row, exhibits.get(row.id) ?? null)),
  });
});

personaEncountersRouter.get("/private-sessions/:sessionId", requireAuth, async (req, res) => {
  const parsed = sessionIdSchema.safeParse(req.params.sessionId);
  if (!parsed.success) return res.status(404).json({ error: "Private encounter session not found." });

  const ownerUserId = req.user!.id;
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("persona_encounter_private_sessions")
    .select("*")
    .eq("id", parsed.data)
    .eq("owner_user_id", ownerUserId)
    .maybeSingle();

  if (error) {
    return res.status(500).json({
      error: "Private encounter session could not be loaded.",
      code: "persona_encounter_private_session_load_failed",
    });
  }
  if (!data) return res.status(404).json({ error: "Private encounter session not found." });

  const exhibit = await loadOwnerPublicExhibitForSession(sb, ownerUserId, parsed.data);
  return res.json({
    session: serializePrivateSession(data as EncounterPrivateSessionRow, exhibit),
  });
});

personaEncountersRouter.patch("/private-sessions/:sessionId/curation", requireAuth, async (req, res) => {
  const parsedSessionId = sessionIdSchema.safeParse(req.params.sessionId);
  if (!parsedSessionId.success) return res.status(404).json({ error: "Private encounter session not found." });

  const parsedBody = privateSessionCurationSchema.safeParse(req.body);
  if (!parsedBody.success) return res.status(400).json({ error: parsedBody.error.flatten() });

  const ownerUserId = req.user!.id;
  const sb = getSupabaseAdmin();
  const input = parsedBody.data;
  const update: Record<string, unknown> = {
    curation_schema: PERSONA_ENCOUNTER_PRIVATE_SESSION_CURATION_SCHEMA,
  };

  if (Object.prototype.hasOwnProperty.call(input, "title")) update.owner_title = input.title;
  if (Object.prototype.hasOwnProperty.call(input, "summary")) update.owner_summary = input.summary;
  if (Object.prototype.hasOwnProperty.call(input, "tags")) update.owner_tags = input.tags;
  if (Object.prototype.hasOwnProperty.call(input, "publicationCandidate")) {
    update.publication_candidate = input.publicationCandidate;
  }

  const { data, error } = await sb
    .from("persona_encounter_private_sessions")
    .update(update)
    .eq("id", parsedSessionId.data)
    .eq("owner_user_id", ownerUserId)
    .select("*")
    .maybeSingle();

  if (error) {
    return res.status(500).json({
      error: "Private encounter curation could not be updated.",
      code: "persona_encounter_private_session_curation_failed",
    });
  }
  if (!data) return res.status(404).json({ error: "Private encounter session not found." });

  return res.json({
    session: serializePrivateSession(data as EncounterPrivateSessionRow, await loadOwnerPublicExhibitForSession(
      sb,
      ownerUserId,
      parsedSessionId.data,
    )),
  });
});

personaEncountersRouter.post("/private-sessions/:sessionId/public-exhibit", requireAuth, async (req, res) => {
  const parsedSessionId = sessionIdSchema.safeParse(req.params.sessionId);
  if (!parsedSessionId.success) return res.status(404).json({ error: "Private encounter session not found." });

  const parsedBody = publicExhibitPublishSchema.safeParse(req.body);
  if (!parsedBody.success) return res.status(400).json({ error: parsedBody.error.flatten() });

  const ownerUserId = req.user!.id;
  const sb = getSupabaseAdmin();
  const source = await loadOwnerPrivateSession(sb, ownerUserId, parsedSessionId.data);
  if (!source) return res.status(404).json({ error: "Private encounter session not found." });

  if (source.publication_candidate !== true) {
    return res.status(400).json({
      error: "Private encounter artifact must be marked as a private candidate before publishing metadata.",
      code: "persona_encounter_public_exhibit_candidate_required",
    });
  }

  const sameOwner = await privateSessionPersonasStillSameOwner(sb, source);
  if (!sameOwner) {
    return res.status(403).json({
      error: "Public exhibit requires same-owner source personas.",
      code: "persona_encounter_public_exhibit_same_owner_required",
    });
  }

  const existing = await loadOwnerPublicExhibitForSession(sb, ownerUserId, source.id);
  if (existing?.status === "removed") {
    return res.status(403).json({
      error: "Removed public exhibit metadata cannot be republished by the owner.",
      code: "persona_encounter_public_exhibit_removed",
    });
  }

  const now = new Date().toISOString();
  const payload = {
    owner_user_id: ownerUserId,
    private_session_id: source.id,
    slug: existing?.slug ?? publicExhibitSlug(parsedBody.data.title),
    public_title: parsedBody.data.title,
    public_summary: parsedBody.data.summary,
    public_tags: parsedBody.data.tags,
    initiator_name_snapshot: source.initiator_name_snapshot,
    responder_name_snapshot: source.responder_name_snapshot,
    status: "published" as const,
    provenance_schema: PERSONA_ENCOUNTER_PUBLIC_EXHIBIT_PROVENANCE_SCHEMA as typeof PERSONA_ENCOUNTER_PUBLIC_EXHIBIT_PROVENANCE_SCHEMA,
    published_at: existing?.published_at ?? now,
    retracted_at: null,
    removed_at: null,
    removed_by: null,
  };

  const result = existing
    ? await sb
      .from("persona_encounter_public_exhibits")
      .update(payload)
      .eq("slug", existing.slug)
      .eq("owner_user_id", ownerUserId)
      .select("*")
      .single()
    : await sb
      .from("persona_encounter_public_exhibits")
      .insert(payload)
      .select("*")
      .single();

  if (result.error || !result.data) {
    return res.status(500).json({
      error: "Public encounter exhibit metadata could not be saved.",
      code: "persona_encounter_public_exhibit_save_failed",
    });
  }

  const exhibit = result.data as EncounterPublicExhibitRow;
  return res.status(existing ? 200 : 201).json({
    session: serializePrivateSession(source, exhibit),
    exhibit: serializeOwnerPublicExhibit(exhibit),
  });
});

personaEncountersRouter.patch("/public-exhibits/:slug/retract", requireAuth, async (req, res) => {
  const parsedSlug = publicExhibitSlugSchema.safeParse(req.params.slug);
  if (!parsedSlug.success) return res.status(404).json({ error: "Public encounter exhibit not found." });

  const ownerUserId = req.user!.id;
  const sb = getSupabaseAdmin();
  const existing = await loadOwnerPublicExhibitBySlug(sb, ownerUserId, parsedSlug.data);
  if (!existing) return res.status(404).json({ error: "Public encounter exhibit not found." });
  if (existing.status === "removed") {
    return res.status(403).json({
      error: "Removed public exhibit metadata cannot be retracted by the owner.",
      code: "persona_encounter_public_exhibit_removed",
    });
  }

  const { data, error } = await sb
    .from("persona_encounter_public_exhibits")
    .update({
      status: "retracted",
      retracted_at: new Date().toISOString(),
    })
    .eq("slug", parsedSlug.data)
    .eq("owner_user_id", ownerUserId)
    .select("*")
    .single();

  if (error || !data) {
    return res.status(500).json({
      error: "Public encounter exhibit metadata could not be retracted.",
      code: "persona_encounter_public_exhibit_retract_failed",
    });
  }

  const exhibit = data as EncounterPublicExhibitRow;
  const source = await loadOwnerPrivateSession(sb, ownerUserId, exhibit.private_session_id);
  return res.json({
    ...(source ? { session: serializePrivateSession(source, exhibit) } : {}),
    exhibit: serializeOwnerPublicExhibit(exhibit),
  });
});

personaEncountersRouter.get("/public-exhibits/:slug", async (req, res) => {
  const parsedSlug = publicExhibitSlugSchema.safeParse(req.params.slug);
  if (!parsedSlug.success) return res.status(404).json({ error: "Public encounter exhibit not found." });

  const exhibit = await loadPublishedPublicExhibitBySlug(getSupabaseAdmin(), parsedSlug.data);
  if (!exhibit) return res.status(404).json({ error: "Public encounter exhibit not found." });

  return res.json({
    exhibit: serializePublishedPublicExhibit(exhibit),
  });
});

personaEncountersRouter.post("/public-exhibits/:slug/report", requireAuth, async (req, res) => {
  const parsedSlug = publicExhibitSlugSchema.safeParse(req.params.slug);
  if (!parsedSlug.success) return res.status(404).json({ error: "Public encounter exhibit not found." });

  const parsedBody = publicExhibitReportSchema.safeParse(req.body);
  if (!parsedBody.success) return res.status(400).json({ error: parsedBody.error.flatten() });

  const sb = getSupabaseAdmin();
  const exhibit = await loadPublishedPublicExhibitBySlug(sb, parsedSlug.data);
  if (!exhibit) return res.status(404).json({ error: "Public encounter exhibit not found." });

  const existing = await loadExistingPublicExhibitReport(
    sb,
    req.user!.id,
    exhibit.id,
    parsedBody.data.reason,
  );
  if (existing) {
    return res.status(200).json({
      report: { status: existing.status },
      duplicate: true,
    });
  }

  const { data, error } = await sb
    .from("moderation_reports")
    .insert({
      reporter_id: req.user!.id,
      target_type: "persona_encounter_public_exhibit",
      target_id: exhibit.id,
      reason: parsedBody.data.reason,
      notes: parsedBody.data.notes || null,
      status: "open",
    })
    .select("*")
    .single();

  if (error || !data) {
    return res.status(500).json({ error: "Failed to create report." });
  }

  await incrementPublicExhibitReportedCount(sb, exhibit.id);
  return res.status(201).json({
    report: { status: data.status },
    duplicate: false,
  });
});

personaEncountersRouter.delete("/private-sessions/:sessionId", requireAuth, async (req, res) => {
  const parsed = sessionIdSchema.safeParse(req.params.sessionId);
  if (!parsed.success) return res.status(404).json({ error: "Private encounter session not found." });

  const ownerUserId = req.user!.id;
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("persona_encounter_private_sessions")
    .select("id")
    .eq("id", parsed.data)
    .eq("owner_user_id", ownerUserId)
    .maybeSingle();

  if (error) {
    return res.status(500).json({
      error: "Private encounter session could not be deleted.",
      code: "persona_encounter_private_session_delete_failed",
    });
  }
  if (!data) return res.status(404).json({ error: "Private encounter session not found." });

  const { error: deleteError } = await sb
    .from("persona_encounter_private_sessions")
    .delete()
    .eq("id", parsed.data)
    .eq("owner_user_id", ownerUserId);

  if (deleteError) {
    return res.status(500).json({
      error: "Private encounter session could not be deleted.",
      code: "persona_encounter_private_session_delete_failed",
    });
  }

  return res.json({
    deleted: true,
    session: {
      id: parsed.data,
    },
  });
});

async function generateEncounterResponderReply(input: {
  sb: ReturnType<typeof getSupabaseAdmin>;
  ownerUserId: string;
  fallbackTier: string;
  initiator: EncounterPersonaRow;
  responder: EncounterPersonaRow;
  setup: string;
  requestedMaxOutputTokens?: number;
}): Promise<
  | {
      ok: true;
      replyContent: string;
      rateLimit: { remaining: number | null; retryAfter: number | null };
    }
  | {
      ok: false;
      status: number;
      body: Record<string, unknown>;
    }
> {
  const providerResolution = await resolveEncounterPreviewProviderRoute(
    input.sb,
    input.ownerUserId,
    input.fallbackTier,
    input.responder,
  );
  if (!providerResolution.configured) {
    return {
      ok: false,
      status: providerResolution.status,
      body: providerResolution.body,
    };
  }

  const { chatRoute } = providerResolution;
  const maxOutputTokens = selectEncounterPreviewMaxOutputTokens({
    requestedMaxOutputTokens: input.requestedMaxOutputTokens,
    routeLabel: chatRoute.routeLabel,
  });
  const systemPrompt = buildEncounterPreviewSystemPrompt({
    initiator: input.initiator,
    responder: input.responder,
  });
  const userMessage = buildEncounterPreviewUserMessage({
    initiatorName: input.initiator.name,
    responderName: input.responder.name,
    setup: input.setup,
  });
  const estimatedInputTokens = estimateConversationTokens({
    systemPrompt,
    userMessage,
  });
  const quotaTokenEstimate = estimatedInputTokens + maxOutputTokens;

  try {
    await assertTokenBudgetForEstimate(input.ownerUserId, quotaTokenEstimate);
  } catch (error) {
    if (error instanceof TokenQuotaError) {
      return {
        ok: false,
        status: 402,
        body: {
          error: "Encounter preview token budget exceeded.",
          code: "persona_encounter_quota_exceeded",
        },
      };
    }
    throw error;
  }

  const rateLimit = await checkEncounterPreviewRateLimit({
    ownerUserId: input.ownerUserId,
    initiatorPersonaId: input.initiator.id,
    responderPersonaId: input.responder.id,
  });
  if (!rateLimit.allowed) {
    return {
      ok: false,
      status: rateLimit.status,
      body: rateLimit.body,
    };
  }

  try {
    const aiResponse = await chatRoute.provider.sendMessage({
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
      ...(chatRoute.routeLabel === "anthropic_platform" ? { model: chatRoute.modelLabel } : {}),
      maxOutputTokens,
    });
    const replyContent = boundEncounterReply(aiResponse.content);
    if (!replyContent) {
      return {
        ok: false,
        status: 502,
        body: {
          error: "Encounter preview provider returned an empty reply.",
          code: "persona_encounter_provider_empty_reply",
        },
      };
    }

    const inputTokens = aiResponse.usage?.inputTokens ?? estimatedInputTokens;
    const outputTokens = aiResponse.usage?.outputTokens ?? estimateTokensFromText(aiResponse.content);

    await recordLlmTokenUsage({
      userId: input.ownerUserId,
      model: aiResponse.model || chatRoute.modelLabel,
      chatId: null,
      inputTokens,
      outputTokens,
    });

    return {
      ok: true,
      replyContent,
      rateLimit: rateLimit.rateLimit,
    };
  } catch {
    return {
      ok: false,
      status: 502,
      body: {
        error: "Encounter preview provider failed.",
        code: "persona_encounter_provider_failed",
      },
    };
  }
}

function serializePrivateSession(row: EncounterPrivateSessionRow, publicExhibit: EncounterPublicExhibitRow | null = null) {
  return {
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    setup: {
      label: "Owner-authored setup",
      content: row.owner_setup,
      stored: true,
    },
    personas: {
      label: "Selected same-owner personas",
      initiatorName: row.initiator_name_snapshot,
      responderName: row.responder_name_snapshot,
    },
    reply: {
      label: "Model-generated responder reply",
      role: "responder",
      content: row.responder_reply,
      generated: true,
    },
    provenance: {
      artifact: {
        label: "Private owner-only artifact",
        private: true,
        ownerOnly: true,
        serverCreated: true,
      },
      persistence: {
        saved: true,
        transcriptStored: false,
        shareable: false,
        public: false,
        sourceRetrieval: false,
        sourceBuckets: [],
        note: "Private saved encounter artifact; no Memory, Archive, Canon, Continuity, Integrity, or transcript sources were retrieved.",
      },
    },
    curation: {
      label: "Owner-authored private curation",
      title: row.owner_title ?? null,
      summary: row.owner_summary ?? null,
      tags: row.owner_tags ?? [],
      publicationCandidate: row.publication_candidate ?? false,
      schema: row.curation_schema ?? PERSONA_ENCOUNTER_PRIVATE_SESSION_CURATION_SCHEMA,
      note: "Private planning metadata only; not a public exhibit, share link, moderation state, or cross-owner consent.",
    },
    publicExhibit: publicExhibit ? serializeOwnerPublicExhibit(publicExhibit) : null,
  };
}

function serializeOwnerPublicExhibit(row: EncounterPublicExhibitRow) {
  return {
    slug: row.slug,
    routeHref: `/encounters/${row.slug}`,
    status: row.status,
    title: row.public_title,
    summary: row.public_summary,
    tags: row.public_tags,
    publishedAt: row.published_at,
    retractedAt: row.retracted_at,
    removedAt: row.removed_at,
    reportedCount: row.reported_count,
    provenance: {
      label: "Metadata-only public encounter exhibit",
      public: row.status === "published" && !row.removed_at,
      ownerCurated: true,
      sameOwner: true,
      source: "Derived from a private same-owner saved artifact",
      note: "Public output is newly owner-authored metadata only; no transcript, excerpt, raw reply, private setup, private curation, source retrieval, or cross-owner persona words are published.",
    },
  };
}

function serializePublishedPublicExhibit(row: EncounterPublicExhibitRow) {
  return {
    slug: row.slug,
    title: row.public_title,
    summary: row.public_summary,
    tags: row.public_tags,
    personas: {
      label: "Same-owner persona display snapshots",
      initiatorName: row.initiator_name_snapshot,
      responderName: row.responder_name_snapshot,
    },
    status: "published" as const,
    publishedAt: row.published_at,
    provenance: {
      label: "Metadata-only public encounter exhibit",
      ownerCurated: true,
      public: true,
      sameOwner: true,
      source: "Derived from a private same-owner saved artifact",
      note: "This public exhibit contains owner-authored metadata only. It does not publish transcripts, excerpts, raw replies, private setup, private curation, source retrieval, provider details, prompts, private context, or cross-owner persona words.",
    },
    report: {
      requiresSignIn: true,
      path: `/persona-encounters/public-exhibits/${row.slug}/report`,
    },
  };
}

async function loadOwnerPrivateSession(
  sb: ReturnType<typeof getSupabaseAdmin>,
  ownerUserId: string,
  sessionId: string,
) {
  const { data } = await sb
    .from("persona_encounter_private_sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("owner_user_id", ownerUserId)
    .maybeSingle();

  return (data ?? null) as EncounterPrivateSessionRow | null;
}

async function loadOwnerPublicExhibitsBySession(
  sb: ReturnType<typeof getSupabaseAdmin>,
  ownerUserId: string,
  sessionIds: string[],
) {
  const exhibits = new Map<string, EncounterPublicExhibitRow>();
  if (sessionIds.length === 0) return exhibits;

  const { data } = await sb
    .from("persona_encounter_public_exhibits")
    .select("*")
    .eq("owner_user_id", ownerUserId)
    .in("private_session_id", sessionIds);

  for (const row of (data ?? []) as EncounterPublicExhibitRow[]) {
    exhibits.set(row.private_session_id, row);
  }
  return exhibits;
}

async function loadOwnerPublicExhibitForSession(
  sb: ReturnType<typeof getSupabaseAdmin>,
  ownerUserId: string,
  sessionId: string,
) {
  const { data } = await sb
    .from("persona_encounter_public_exhibits")
    .select("*")
    .eq("owner_user_id", ownerUserId)
    .eq("private_session_id", sessionId)
    .maybeSingle();

  return (data ?? null) as EncounterPublicExhibitRow | null;
}

async function loadOwnerPublicExhibitBySlug(
  sb: ReturnType<typeof getSupabaseAdmin>,
  ownerUserId: string,
  slug: string,
) {
  const { data } = await sb
    .from("persona_encounter_public_exhibits")
    .select("*")
    .eq("owner_user_id", ownerUserId)
    .eq("slug", slug)
    .maybeSingle();

  return (data ?? null) as EncounterPublicExhibitRow | null;
}

async function loadPublishedPublicExhibitBySlug(
  sb: ReturnType<typeof getSupabaseAdmin>,
  slug: string,
) {
  const { data } = await sb
    .from("persona_encounter_public_exhibits")
    .select("slug, public_title, public_summary, public_tags, initiator_name_snapshot, responder_name_snapshot, status, provenance_schema, reported_count, published_at, retracted_at, removed_at, removed_by, owner_user_id, private_session_id, id, created_at, updated_at")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  const exhibit = (data ?? null) as EncounterPublicExhibitRow | null;
  if (!exhibit || exhibit.removed_at) return null;
  return exhibit;
}

async function privateSessionPersonasStillSameOwner(
  sb: ReturnType<typeof getSupabaseAdmin>,
  session: EncounterPrivateSessionRow,
) {
  const { data } = await sb
    .from("personas")
    .select("id, owner_user_id")
    .eq("owner_user_id", session.owner_user_id)
    .in("id", [session.initiator_persona_id, session.responder_persona_id]);

  const ids = new Set((data ?? []).map((row: { id: string }) => row.id));
  return ids.has(session.initiator_persona_id) && ids.has(session.responder_persona_id);
}

async function loadExistingPublicExhibitReport(
  sb: ReturnType<typeof getSupabaseAdmin>,
  reporterId: string,
  exhibitId: string,
  reason: string,
) {
  const { data } = await sb
    .from("moderation_reports")
    .select("*")
    .eq("reporter_id", reporterId)
    .eq("target_type", "persona_encounter_public_exhibit")
    .eq("target_id", exhibitId)
    .eq("reason", reason);

  return (data ?? []).find((row: { status: string }) => row.status === "open" || row.status === "reviewing") ?? null;
}

async function incrementPublicExhibitReportedCount(
  sb: ReturnType<typeof getSupabaseAdmin>,
  exhibitId: string,
) {
  const { data } = await sb
    .from("persona_encounter_public_exhibits")
    .select("id, reported_count")
    .eq("id", exhibitId)
    .maybeSingle();
  if (!data) return;

  await sb
    .from("persona_encounter_public_exhibits")
    .update({ reported_count: Number(data.reported_count ?? 0) + 1 })
    .eq("id", exhibitId);
}

async function loadOwnedEncounterPersona(
  sb: ReturnType<typeof getSupabaseAdmin>,
  personaId: string,
  ownerUserId: string,
) {
  const { data } = await sb
    .from("personas")
    .select("id, owner_user_id, name, short_description, long_description, visibility, provider, awakening_prompt, style_notes")
    .eq("id", personaId)
    .eq("owner_user_id", ownerUserId)
    .maybeSingle();

  return (data ?? null) as EncounterPersonaRow | null;
}

async function resolveEncounterPreviewProviderRoute(
  sb: ReturnType<typeof getSupabaseAdmin>,
  ownerUserId: string,
  fallbackTier: string,
  responder: EncounterPersonaRow,
) {
  const { data: profile } = await sb
    .from("profiles")
    .select("tier, ai_mode, byok_openai_key, byok_anthropic_key, byok_deepseek_key")
    .eq("id", ownerUserId)
    .maybeSingle();

  const aiMode = (profile?.ai_mode ?? "platform") as "platform" | "byok";
  let runtimeByokKeys: RuntimeAiProviderKeys = {
    openai: profile?.byok_openai_key?.trim() || null,
    anthropic: profile?.byok_anthropic_key?.trim() || null,
    deepseek: profile?.byok_deepseek_key?.trim() || null,
  };

  if (aiMode === "byok") {
    try {
      runtimeByokKeys = await loadRuntimeAiProviderKeys(ownerUserId, profile);
    } catch {
      return {
        configured: false as const,
        status: 503,
        body: {
          error: "Encounter preview provider keys are unavailable.",
          code: "persona_encounter_provider_unavailable",
          classification: "provider_config",
        },
      };
    }
  }

  const stationModel = selectStationModel(profile?.tier ?? fallbackTier);
  const chatRoute = resolveChatProviderRuntimeRoute({
    provider: responder.provider,
    aiMode,
    byokOpenaiKey: runtimeByokKeys.openai,
    byokAnthropicKey: runtimeByokKeys.anthropic,
    byokDeepseekKey: runtimeByokKeys.deepseek,
    platformDeepseekKey: process.env.DEEPSEEK_API_KEY,
    platformDeepseekBaseUrl: process.env.DEEPSEEK_BASE_URL,
    platformDeepseekModel: process.env.DEEPSEEK_MODEL,
    platformNvidiaKey: process.env.NVIDIA_AI_API_KEY?.trim() || undefined,
    platformNvidiaBaseUrl: process.env.NVIDIA_MODEL_BASE_URL,
    platformNvidiaModel: process.env.NVIDIA_MODEL,
    allowPlatformNvidia: personaEncounterPlatformNvidiaPrivateContextAllowed(),
    stationAnthropicKey: process.env.ANTHROPIC_API_KEY,
    stationAnthropicModel: stationModel.model,
  });

  if (!chatRoute.configured || !chatRoute.provider) {
    return {
      configured: false as const,
      status: 503,
      body: {
        error: "Encounter preview provider setup is unavailable.",
        code: "persona_encounter_provider_unavailable",
        classification: chatRoute.missingConfig?.classification ?? "provider_config",
      },
    };
  }

  return {
    configured: true as const,
    chatRoute,
  };
}

function personaEncounterPlatformNvidiaPrivateContextAllowed() {
  return process.env[PERSONA_ENCOUNTER_ALLOW_PLATFORM_NVIDIA_PRIVATE_CONTEXT] === "true";
}

async function checkEncounterPreviewRateLimit(input: {
  ownerUserId: string;
  initiatorPersonaId: string;
  responderPersonaId: string;
}) {
  const resourceId = `${input.initiatorPersonaId}:${input.responderPersonaId}`;
  const checks = [
    {
      scope: {
        ownerUserId: input.ownerUserId,
        personaId: input.responderPersonaId,
        resourceId,
        operation: "persona_encounter_preview_minute",
      },
      limit: positiveEnvInt("PERSONA_ENCOUNTER_PREVIEW_PER_MINUTE", ENCOUNTER_PREVIEW_PER_MINUTE),
      windowSeconds: 60,
      parts: ["persona-encounter-preview"],
    },
    {
      scope: {
        ownerUserId: input.ownerUserId,
        personaId: input.responderPersonaId,
        resourceId,
        operation: "persona_encounter_preview_day",
      },
      limit: positiveEnvInt("PERSONA_ENCOUNTER_PREVIEW_PER_DAY", ENCOUNTER_PREVIEW_PER_DAY),
      windowSeconds: ENCOUNTER_PREVIEW_DAY_SECONDS,
      parts: ["persona-encounter-preview"],
    },
  ];

  let mostRestrictive: { remaining: number | null; retryAfter: number | null } = {
    remaining: null,
    retryAfter: null,
  };

  try {
    for (const check of checks) {
      const result = await incrementOperationalRateLimit(check);
      if (!result.enabled) {
        return {
          allowed: false as const,
          status: 503,
          body: {
            error: "Encounter preview is temporarily unavailable.",
            code: "persona_encounter_rate_limit_unavailable",
          },
        };
      }

      if (!result.allowed) {
        return {
          allowed: false as const,
          status: 429,
          body: {
            error: "Encounter preview rate limit exceeded.",
            code: "persona_encounter_rate_limited",
            limit: result.limit,
            used: result.used,
            retryAfter: result.retryAfter ?? result.windowSeconds,
          },
        };
      }

      if (
        mostRestrictive.remaining === null ||
        (result.remaining !== null && result.remaining < mostRestrictive.remaining)
      ) {
        mostRestrictive = {
          remaining: result.remaining,
          retryAfter: result.retryAfter,
        };
      }
    }
  } catch {
    return {
      allowed: false as const,
      status: 503,
      body: {
        error: "Encounter preview is temporarily unavailable.",
        code: "persona_encounter_rate_limit_unavailable",
      },
    };
  }

  return {
    allowed: true as const,
    rateLimit: mostRestrictive,
  };
}

function buildEncounterPreviewSystemPrompt(input: {
  initiator: EncounterPersonaRow;
  responder: EncounterPersonaRow;
}) {
  return [
    "You are generating one disposable private Studio persona encounter preview.",
    "Generate exactly one reply from the responder persona.",
    "Do not continue the conversation, write both sides, claim persistence, or claim access to Memory, Archive, Canon, Continuity, Integrity, transcripts, source retrieval, public routes, or shared private history.",
    "Use only the owner-authored setup and the bounded persona profile notes below.",
    "Responder persona profile:",
    personaProfilePrompt(input.responder),
    "Initiator persona profile:",
    personaProfilePrompt(input.initiator),
  ].join("\n\n");
}

function buildEncounterPreviewUserMessage(input: {
  initiatorName: string;
  responderName: string;
  setup: string;
}) {
  return [
    `Owner-authored setup for ${input.initiatorName} to encounter ${input.responderName}:`,
    input.setup,
    "",
    `Reply once as ${input.responderName}.`,
  ].join("\n");
}

function personaProfilePrompt(persona: EncounterPersonaRow) {
  return [
    `Name: ${clip(persona.name, 120)}`,
    `Short description: ${clip(persona.short_description, 300)}`,
    `Long description: ${clip(persona.long_description, 800)}`,
    `Awakening prompt: ${clip(persona.awakening_prompt, 500)}`,
    `Style notes: ${clip(persona.style_notes, 500)}`,
  ].join("\n");
}

function boundEncounterReply(value: string) {
  const clean = value.trim();
  if (clean.length <= ENCOUNTER_PREVIEW_REPLY_MAX_CHARS) return clean;
  return `${clean.slice(0, ENCOUNTER_PREVIEW_REPLY_MAX_CHARS - 3).trimEnd()}...`;
}

function selectEncounterPreviewMaxOutputTokens(input: {
  requestedMaxOutputTokens?: number;
  routeLabel: string;
}) {
  const requested = input.requestedMaxOutputTokens ?? ENCOUNTER_PREVIEW_MAX_OUTPUT_TOKENS;
  if (input.routeLabel === "nvidia_openai_compatible") {
    return Math.max(requested, ENCOUNTER_PREVIEW_NVIDIA_OUTPUT_TOKENS);
  }
  return requested;
}

function publicExhibitSlug(title: string) {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 58)
    .replace(/-+$/g, "") || "encounter";
  return `${base}-${randomUUID().replace(/-/g, "").slice(0, 8)}`;
}

function clip(value: string | null | undefined, maxLength: number) {
  const clean = value?.trim();
  if (!clean) return "Not provided.";
  if (clean.length <= maxLength) return clean;
  return `${clean.slice(0, maxLength - 3).trimEnd()}...`;
}

function positiveEnvInt(name: string, fallback: number) {
  const value = Number.parseInt(process.env[name] ?? "", 10);
  return Number.isInteger(value) && value > 0 ? value : fallback;
}
