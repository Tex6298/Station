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
const PERSONA_ENCOUNTER_CROSS_OWNER_CONSENT_PROVENANCE_SCHEMA =
  "station.persona_encounter.cross_owner_consent.v1";
const PERSONA_ENCOUNTER_CROSS_OWNER_RUNTIME_CONTEXT_CONTRACT_SCHEMA =
  "station.persona_encounter.cross_owner_runtime_context_contract.v1";
const PERSONA_ENCOUNTER_CROSS_OWNER_RUNTIME_ATTEMPT_PROVENANCE_SCHEMA =
  "station.persona_encounter.cross_owner_runtime_attempt.v1";
const PERSONA_ENCOUNTER_CROSS_OWNER_DISPOSABLE_PREVIEW_SCHEMA =
  "station.persona_encounter.cross_owner_disposable_preview.v1";
const CROSS_OWNER_RUNTIME_CONTEXT_CONTRACT_SCOPE_VERSION = 1;
const CROSS_OWNER_RUNTIME_CONTEXT_REQUIRED_SCOPE =
  "run_cross_owner_encounter" satisfies CrossOwnerConsentRequestedScope;
const CROSS_OWNER_RUNTIME_DENIED_CONTEXT_CLASSES = [
  "long_description",
  "awakening_prompt",
  "style_notes",
  "private_memory",
  "canon",
  "archive",
  "continuity",
  "transcripts",
  "source_bodies",
  "provider_payloads",
  "provider_config",
  "raw_owner_ids",
  "raw_persona_ids",
  "traces",
  "storage_paths",
  "generated_words",
] as const;
const CROSS_OWNER_RUNTIME_ATTEMPT_AUDIT_FIELDS = [
  "consentId",
  "actorRole",
  "initiatorRole",
  "responderRole",
  "consentStatus",
  "requestedScopeVersion",
  "requestedScope",
  "readinessCode",
  "lifecycleStatus",
  "createdAt",
  "completedAt",
] as const;
const CROSS_OWNER_RUNTIME_ATTEMPT_LIFECYCLE_STATUSES = [
  "blocked_before_provider",
  "provider_succeeded",
  "provider_failed",
  "provider_empty",
  "quota_exceeded",
  "rate_limited",
  "provider_unavailable",
] as const;
const CROSS_OWNER_CONSENT_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "cancelled",
  "revoked",
  "expired",
  "superseded",
  "blocked_by_deletion",
  "moderation_locked",
] as const;
const CROSS_OWNER_CONSENT_REQUESTED_SCOPES = [
  "run_cross_owner_encounter",
  "save_private_cross_owner_artifact",
  "share_participant_metadata_between_owners",
  "publish_metadata_only_public_exhibit",
  "publish_generated_words_excerpt",
  "publish_transcript",
  "publish_generated_summary",
] as const;
const CROSS_OWNER_CONSENT_REASON_CODES = [
  "not_aligned",
  "owner_request",
  "persona_deleted",
  "account_deleted",
  "moderation_safety",
  "scope_changed",
  "expired",
  "other",
] as const;
const CROSS_OWNER_CONSENT_AUDIT_EVENT_TYPES = [
  "invitation_created",
  "requester_approved",
  "requester_cancelled",
  "counterparty_approved",
  "counterparty_rejected",
  "participant_revoked",
  "invitation_expired",
  "scope_version_superseded",
  "persona_or_account_deletion_blocked",
  "moderation_lock_applied",
  "moderation_lock_cleared",
] as const;
const PRIVATE_SESSION_CURATION_TITLE_MAX_CHARS = 120;
const PRIVATE_SESSION_CURATION_SUMMARY_MAX_CHARS = 800;
const PRIVATE_SESSION_CURATION_TAG_MAX_CHARS = 40;
const PRIVATE_SESSION_CURATION_MAX_TAGS = 12;
const PUBLIC_EXHIBIT_TITLE_MAX_CHARS = 140;
const PUBLIC_EXHIBIT_SUMMARY_MAX_CHARS = 1000;
const PUBLIC_EXHIBIT_TAG_MAX_CHARS = 40;
const PUBLIC_EXHIBIT_MAX_TAGS = 12;
const PUBLIC_EXHIBIT_LIST_DEFAULT_LIMIT = 12;
const PUBLIC_EXHIBIT_LIST_MAX_LIMIT = 24;
const PUBLIC_EXHIBIT_LIST_DB_WINDOW = PUBLIC_EXHIBIT_LIST_MAX_LIMIT * 3 + 1;
const PUBLIC_EXHIBIT_PUBLIC_SELECT =
  "slug, public_title, public_summary, public_tags, initiator_name_snapshot, responder_name_snapshot, status, provenance_schema, reported_count, published_at, retracted_at, removed_at, removed_by, owner_user_id, private_session_id, id, created_at, updated_at";

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

const crossOwnerConsentRequestedScopeSchema = z.enum(CROSS_OWNER_CONSENT_REQUESTED_SCOPES);
const crossOwnerConsentReasonCodeSchema = z.enum(CROSS_OWNER_CONSENT_REASON_CODES);

const crossOwnerConsentRequestedScopesSchema = z.array(
  crossOwnerConsentRequestedScopeSchema,
).min(1).max(CROSS_OWNER_CONSENT_REQUESTED_SCOPES.length).transform((scopes) =>
  Array.from(new Set(scopes))
);

const crossOwnerConsentCreateSchema = z.object({
  requesterPersonaId: z.string().uuid(),
  counterpartyPersonaId: z.string().uuid(),
  requestedScopes: crossOwnerConsentRequestedScopesSchema
    .default(["run_cross_owner_encounter"] satisfies CrossOwnerConsentRequestedScope[]),
}).strict().refine((value) => value.requesterPersonaId !== value.counterpartyPersonaId, {
  message: "Select two different personas.",
  path: ["counterpartyPersonaId"],
});

const crossOwnerConsentReasonBodySchema = z.object({
  reasonCode: crossOwnerConsentReasonCodeSchema.optional(),
}).strict();

const crossOwnerRuntimeContextContractQuerySchema = z.object({
  initiatorPersonaId: z.string().uuid(),
  responderPersonaId: z.string().uuid(),
}).strict().refine((value) => value.initiatorPersonaId !== value.responderPersonaId, {
  message: "Select two different personas.",
  path: ["responderPersonaId"],
});

const crossOwnerDisposablePreviewSchema = z.object({
  initiatorPersonaId: z.string().uuid(),
  responderPersonaId: z.string().uuid(),
  setup: z.string().trim().min(1).max(ENCOUNTER_PREVIEW_MAX_SETUP_CHARS),
  maxOutputTokens: z.coerce.number().int().min(80).max(500).optional(),
}).strict().refine((value) => value.initiatorPersonaId !== value.responderPersonaId, {
  message: "Select two different personas.",
  path: ["responderPersonaId"],
});

const readinessSchema = z.object({
  initiatorPersonaId: z.string().uuid(),
  responderPersonaId: z.string().uuid(),
}).refine((value) => value.initiatorPersonaId !== value.responderPersonaId, {
  message: "Select two different personas.",
  path: ["responderPersonaId"],
});

const sessionIdSchema = z.string().uuid();
const publicExhibitSlugSchema = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*-[a-z0-9]{8}$/);
const publicExhibitListCursorSchema = z.object({
  publishedAt: z.string().datetime(),
  slug: publicExhibitSlugSchema,
});

type PublicExhibitListCursor = z.infer<typeof publicExhibitListCursorSchema>;
type CrossOwnerConsentStatus = typeof CROSS_OWNER_CONSENT_STATUSES[number];
type CrossOwnerConsentRequestedScope = typeof CROSS_OWNER_CONSENT_REQUESTED_SCOPES[number];
type CrossOwnerConsentReasonCode = typeof CROSS_OWNER_CONSENT_REASON_CODES[number];
type CrossOwnerConsentAuditEventType = typeof CROSS_OWNER_CONSENT_AUDIT_EVENT_TYPES[number];
type CrossOwnerConsentActorRole = "requester" | "counterparty" | "admin" | "system";
type CrossOwnerRuntimeParticipantRole = "requester" | "counterparty";
type CrossOwnerRuntimeAttemptLifecycleStatus = typeof CROSS_OWNER_RUNTIME_ATTEMPT_LIFECYCLE_STATUSES[number];

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

type EncounterCrossOwnerConsentRow = {
  id: string;
  requester_owner_user_id: string;
  requester_persona_id: string;
  requester_persona_name_snapshot: string;
  counterparty_owner_user_id: string;
  counterparty_persona_id: string;
  counterparty_persona_name_snapshot: string;
  status: CrossOwnerConsentStatus;
  requested_scopes: CrossOwnerConsentRequestedScope[];
  requested_scope_version: number;
  requester_approved_at: string | null;
  counterparty_approved_at: string | null;
  rejected_at: string | null;
  rejected_by: string | null;
  cancelled_at: string | null;
  cancelled_by: string | null;
  revoked_at: string | null;
  revoked_by: string | null;
  expired_at: string | null;
  superseded_at: string | null;
  blocked_by_deletion_at: string | null;
  moderation_locked_at: string | null;
  reason_code: CrossOwnerConsentReasonCode | null;
  provenance_schema: typeof PERSONA_ENCOUNTER_CROSS_OWNER_CONSENT_PROVENANCE_SCHEMA;
  created_at: string;
  updated_at: string;
};

type EncounterCrossOwnerConsentAuditRow = {
  id: string;
  consent_id: string;
  actor_user_id: string | null;
  actor_role: CrossOwnerConsentActorRole;
  event_type: CrossOwnerConsentAuditEventType;
  previous_status: CrossOwnerConsentStatus | null;
  next_status: CrossOwnerConsentStatus;
  requested_scopes: CrossOwnerConsentRequestedScope[];
  reason_code: CrossOwnerConsentReasonCode | null;
  created_at: string;
};

type EncounterCrossOwnerRuntimeAttemptRow = {
  id: string;
  consent_id: string;
  actor_role: CrossOwnerRuntimeParticipantRole;
  initiator_role: CrossOwnerRuntimeParticipantRole;
  responder_role: CrossOwnerRuntimeParticipantRole;
  consent_status: CrossOwnerConsentStatus;
  requested_scope_version: number;
  requested_scope: CrossOwnerConsentRequestedScope;
  readiness_code: string;
  lifecycle_status: CrossOwnerRuntimeAttemptLifecycleStatus;
  provenance_schema: typeof PERSONA_ENCOUNTER_CROSS_OWNER_RUNTIME_ATTEMPT_PROVENANCE_SCHEMA;
  created_at: string;
  completed_at: string | null;
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

personaEncountersRouter.get("/public-exhibits", async (req, res) => {
  const limit = publicExhibitListLimit(req.query.limit);
  const parsedCursor = decodePublicExhibitListCursor(req.query.cursor);
  if (!parsedCursor.ok) {
    return res.status(400).json({
      error: "Public encounter exhibit cursor is invalid.",
      code: "persona_encounter_public_exhibit_cursor_invalid",
    });
  }

  const result = await loadPublishedPublicExhibitList(getSupabaseAdmin(), {
    limit,
    cursor: parsedCursor.cursor,
  });

  if (!result.ok) {
    return res.status(500).json({
      error: "Public encounter exhibits could not be loaded.",
      code: "persona_encounter_public_exhibit_list_failed",
    });
  }

  return res.json({
    exhibits: result.rows.map(serializePublishedPublicExhibitListItem),
    pagination: {
      limit,
      nextCursor: result.nextCursor,
    },
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

personaEncountersRouter.post("/cross-owner-consents", requireAuth, async (req, res) => {
  const parsed = crossOwnerConsentCreateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const ownerUserId = req.user!.id;
  const sb = getSupabaseAdmin();
  const input = parsed.data;

  const [requesterPersona, counterpartyPersona] = await Promise.all([
    loadOwnedEncounterPersona(sb, input.requesterPersonaId, ownerUserId),
    loadEncounterPersona(sb, input.counterpartyPersonaId),
  ]);

  if (!requesterPersona) {
    return res.status(403).json({
      error: "Requester persona must belong to the current owner.",
      code: "persona_encounter_cross_owner_requester_persona_not_owned",
    });
  }

  if (!counterpartyPersona) {
    return res.status(403).json({
      error: "Counterparty persona is not available for a cross-owner consent invitation.",
      code: "persona_encounter_cross_owner_counterparty_persona_unavailable",
    });
  }

  if (counterpartyPersona.owner_user_id === ownerUserId) {
    return res.status(400).json({
      error: "Cross-owner consent invitations require personas owned by different owners.",
      code: "persona_encounter_cross_owner_required",
    });
  }

  const { data, error } = await sb.rpc("create_persona_encounter_cross_owner_consent", {
    p_requester_owner_user_id: ownerUserId,
    p_requester_persona_id: requesterPersona.id,
    p_requester_persona_name_snapshot: requesterPersona.name,
    p_counterparty_owner_user_id: counterpartyPersona.owner_user_id,
    p_counterparty_persona_id: counterpartyPersona.id,
    p_counterparty_persona_name_snapshot: counterpartyPersona.name,
    p_requested_scopes: input.requestedScopes,
    p_actor_user_id: ownerUserId,
  });

  const consent = coerceCrossOwnerConsentRpcRow(data);
  if (error || !consent) {
    return res.status(500).json({
      error: "Cross-owner encounter consent invitation could not be saved.",
      code: "persona_encounter_cross_owner_consent_save_failed",
    });
  }

  const audit = await loadCrossOwnerConsentAuditEvents(sb, consent.id);
  return res.status(201).json({
    consent: serializeCrossOwnerConsent(consent, ownerUserId, audit),
  });
});

personaEncountersRouter.get("/cross-owner-consents", requireAuth, async (req, res) => {
  const ownerUserId = req.user!.id;
  const sb = getSupabaseAdmin();
  const result = await loadCrossOwnerConsentsForParticipant(sb, ownerUserId);

  if (!result.ok) {
    return res.status(500).json({
      error: "Cross-owner encounter consent ledger could not be loaded.",
      code: "persona_encounter_cross_owner_consent_load_failed",
    });
  }

  return res.json({
    consents: result.rows.map((row) => serializeCrossOwnerConsent(row, ownerUserId)),
  });
});

personaEncountersRouter.post("/cross-owner-consents/:consentId/disposable-preview", requireAuth, async (req, res) => {
  const parsedId = sessionIdSchema.safeParse(req.params.consentId);
  if (!parsedId.success) return res.status(404).json({ error: "Cross-owner consent not found." });

  const parsedBody = crossOwnerDisposablePreviewSchema.safeParse(req.body);
  if (!parsedBody.success) return res.status(400).json({ error: parsedBody.error.flatten() });

  const ownerUserId = req.user!.id;
  const sb = getSupabaseAdmin();
  const result = await loadCrossOwnerConsentForParticipant(sb, parsedId.data, ownerUserId);
  if (!result.ok) return res.status(500).json(crossOwnerConsentLoadFailedBody());
  if (!result.row) return res.status(404).json({ error: "Cross-owner consent not found." });

  const input = parsedBody.data;
  const contract = buildCrossOwnerRuntimeContextContract({
    consent: result.row,
    actorOwnerUserId: ownerUserId,
    initiatorPersonaId: input.initiatorPersonaId,
    responderPersonaId: input.responderPersonaId,
  });

  if (!contract.eligible) {
    const audit = await recordCrossOwnerDisposablePreviewAttemptAudit(sb, {
      consent: result.row,
      actorOwnerUserId: ownerUserId,
      initiatorPersonaId: input.initiatorPersonaId,
      responderPersonaId: input.responderPersonaId,
      readinessCode: contract.readiness.code,
      lifecycleStatus: "blocked_before_provider",
    });
    if (!audit.ok) return res.status(500).json(crossOwnerRuntimeAttemptAuditFailedBody());

    return res.status(409).json({
      error: "Cross-owner disposable preview is not eligible.",
      code: "persona_encounter_cross_owner_preview_ineligible",
      readiness: contract.readiness,
      execution: {
        providerCalled: false,
        tokenAccountingRecorded: false,
        generatedWordsReturned: false,
      },
    });
  }

  const generation = await generateCrossOwnerDisposablePreviewReply({
    sb,
    ownerUserId,
    fallbackTier: req.user!.tier,
    consent: result.row,
    initiatorPersonaId: input.initiatorPersonaId,
    responderPersonaId: input.responderPersonaId,
    setup: input.setup,
    requestedMaxOutputTokens: input.maxOutputTokens,
  });
  if (generation.ok === false) return res.status(generation.status).json(generation.body);

  return res.json({
    preview: {
      reply: {
        role: "responder",
        content: generation.replyContent,
        generated: true,
        private: true,
        disposable: true,
        canonical: false,
        public: false,
        saved: false,
        transcript: false,
        summary: false,
        excerpt: false,
        shareable: false,
        sourceRetrieval: false,
      },
      rateLimit: generation.rateLimit,
    },
    provenance: {
      schema: PERSONA_ENCOUNTER_CROSS_OWNER_DISPOSABLE_PREVIEW_SCHEMA,
      setup: {
        label: "Actor-authored setup",
        stored: false,
      },
      consent: {
        id: result.row.id,
        participantRole: crossOwnerConsentParticipantRole(result.row, ownerUserId),
        requestedScope: CROSS_OWNER_RUNTIME_CONTEXT_REQUIRED_SCOPE,
        requestedScopeVersion: CROSS_OWNER_RUNTIME_CONTEXT_CONTRACT_SCOPE_VERSION,
        executable: false,
      },
      personas: {
        label: "Consent display snapshots",
        initiatorName: generation.initiatorName,
        responderName: generation.responderName,
      },
      reply: {
        label: "Model-generated responder reply",
        generated: true,
        private: true,
        disposable: true,
        nonCanonical: true,
        public: false,
      },
      persistence: {
        saved: false,
        privateSessionCreated: false,
        publicExhibitCreated: false,
        transcriptStored: false,
        summaryStored: false,
        excerptStored: false,
        shareable: false,
        sourceRetrieval: false,
        sourceBuckets: [],
        note: "Cross-owner disposable preview only; no private retrieval, Memory, Archive, Canon, Continuity, transcript, summary, excerpt, private session, or public exhibit was created.",
      },
    },
  });
});

personaEncountersRouter.get(
  "/cross-owner-consents/:consentId/runtime-context-contract",
  requireAuth,
  async (req, res) => {
    const parsedId = sessionIdSchema.safeParse(req.params.consentId);
    if (!parsedId.success) return res.status(404).json({ error: "Cross-owner consent not found." });

    const parsedQuery = crossOwnerRuntimeContextContractQuerySchema.safeParse(req.query);
    if (!parsedQuery.success) return res.status(400).json({ error: parsedQuery.error.flatten() });

    const ownerUserId = req.user!.id;
    const sb = getSupabaseAdmin();
    const result = await loadCrossOwnerConsentForParticipant(sb, parsedId.data, ownerUserId);
    if (!result.ok) {
      return res.status(500).json({
        error: "Cross-owner runtime context contract could not be loaded.",
        code: "persona_encounter_cross_owner_runtime_context_contract_load_failed",
      });
    }
    if (!result.row) return res.status(404).json({ error: "Cross-owner consent not found." });

    return res.json({
      contract: buildCrossOwnerRuntimeContextContract({
        consent: result.row,
        actorOwnerUserId: ownerUserId,
        initiatorPersonaId: parsedQuery.data.initiatorPersonaId,
        responderPersonaId: parsedQuery.data.responderPersonaId,
      }),
      consent: serializeCrossOwnerConsent(result.row, ownerUserId),
    });
  },
);

personaEncountersRouter.get("/cross-owner-consents/:consentId/runtime-attempts", requireAuth, async (req, res) => {
  const parsedId = sessionIdSchema.safeParse(req.params.consentId);
  if (!parsedId.success) return res.status(404).json({ error: "Cross-owner consent not found." });

  const ownerUserId = req.user!.id;
  const sb = getSupabaseAdmin();
  const result = await loadCrossOwnerConsentForParticipant(sb, parsedId.data, ownerUserId);
  if (!result.ok) {
    return res.status(500).json({
      error: "Cross-owner runtime attempts could not be loaded.",
      code: "persona_encounter_cross_owner_runtime_attempts_load_failed",
    });
  }
  if (!result.row) return res.status(404).json({ error: "Cross-owner consent not found." });

  const attempts = await loadCrossOwnerRuntimeAttempts(sb, result.row.id);
  if (!attempts.ok) {
    return res.status(500).json({
      error: "Cross-owner runtime attempts could not be loaded.",
      code: "persona_encounter_cross_owner_runtime_attempts_load_failed",
    });
  }

  return res.json({
    attempts: attempts.rows.map(serializeCrossOwnerRuntimeAttempt),
    consent: serializeCrossOwnerRuntimeAttemptConsentSummary(result.row, ownerUserId),
  });
});

personaEncountersRouter.get("/cross-owner-consents/:consentId", requireAuth, async (req, res) => {
  const parsedId = sessionIdSchema.safeParse(req.params.consentId);
  if (!parsedId.success) return res.status(404).json({ error: "Cross-owner consent not found." });

  const ownerUserId = req.user!.id;
  const sb = getSupabaseAdmin();
  const result = await loadCrossOwnerConsentForParticipant(sb, parsedId.data, ownerUserId);
  if (!result.ok) {
    return res.status(500).json({
      error: "Cross-owner encounter consent could not be loaded.",
      code: "persona_encounter_cross_owner_consent_load_failed",
    });
  }
  if (!result.row) return res.status(404).json({ error: "Cross-owner consent not found." });

  const audit = await loadCrossOwnerConsentAuditEvents(sb, result.row.id);
  return res.json({
    consent: serializeCrossOwnerConsent(result.row, ownerUserId, audit),
  });
});

personaEncountersRouter.patch("/cross-owner-consents/:consentId/approve", requireAuth, async (req, res) => {
  const parsedId = sessionIdSchema.safeParse(req.params.consentId);
  if (!parsedId.success) return res.status(404).json({ error: "Cross-owner consent not found." });

  const parsedBody = z.object({}).strict().safeParse(req.body ?? {});
  if (!parsedBody.success) return res.status(400).json({ error: parsedBody.error.flatten() });

  const ownerUserId = req.user!.id;
  const sb = getSupabaseAdmin();
  const result = await loadCrossOwnerConsentForParticipant(sb, parsedId.data, ownerUserId);
  if (!result.ok) {
    return res.status(500).json({
      error: "Cross-owner encounter consent could not be loaded.",
      code: "persona_encounter_cross_owner_consent_load_failed",
    });
  }
  if (!result.row) return res.status(404).json({ error: "Cross-owner consent not found." });

  const consent = result.row;
  if (ownerUserId !== consent.counterparty_owner_user_id) {
    return res.status(403).json({
      error: "Only the counterparty owner can approve this invitation.",
      code: "persona_encounter_cross_owner_consent_counterparty_required",
    });
  }
  if (consent.status !== "pending") return res.status(409).json(crossOwnerConsentInactiveBody(consent.status));

  const update = await transitionCrossOwnerConsent(sb, consent, ownerUserId, {
    nextStatus: "approved",
    actorRole: "counterparty",
    eventType: "counterparty_approved",
  });
  if (!update.ok) return res.status(500).json(crossOwnerConsentUpdateFailedBody());

  const audit = await loadCrossOwnerConsentAuditEvents(sb, update.row.id);
  return res.json({
    consent: serializeCrossOwnerConsent(update.row, ownerUserId, audit),
  });
});

personaEncountersRouter.patch("/cross-owner-consents/:consentId/reject", requireAuth, async (req, res) => {
  const parsedId = sessionIdSchema.safeParse(req.params.consentId);
  if (!parsedId.success) return res.status(404).json({ error: "Cross-owner consent not found." });

  const parsedBody = crossOwnerConsentReasonBodySchema.safeParse(req.body ?? {});
  if (!parsedBody.success) return res.status(400).json({ error: parsedBody.error.flatten() });

  const ownerUserId = req.user!.id;
  const sb = getSupabaseAdmin();
  const result = await loadCrossOwnerConsentForParticipant(sb, parsedId.data, ownerUserId);
  if (!result.ok) return res.status(500).json(crossOwnerConsentLoadFailedBody());
  if (!result.row) return res.status(404).json({ error: "Cross-owner consent not found." });

  const consent = result.row;
  if (ownerUserId !== consent.counterparty_owner_user_id) {
    return res.status(403).json({
      error: "Only the counterparty owner can reject this invitation.",
      code: "persona_encounter_cross_owner_consent_counterparty_required",
    });
  }
  if (consent.status !== "pending") return res.status(409).json(crossOwnerConsentInactiveBody(consent.status));

  const update = await transitionCrossOwnerConsent(sb, consent, ownerUserId, {
    nextStatus: "rejected",
    actorRole: "counterparty",
    eventType: "counterparty_rejected",
    reasonCode: parsedBody.data.reasonCode,
  });
  if (!update.ok) return res.status(500).json(crossOwnerConsentUpdateFailedBody());

  const audit = await loadCrossOwnerConsentAuditEvents(sb, update.row.id);
  return res.json({
    consent: serializeCrossOwnerConsent(update.row, ownerUserId, audit),
  });
});

personaEncountersRouter.patch("/cross-owner-consents/:consentId/cancel", requireAuth, async (req, res) => {
  const parsedId = sessionIdSchema.safeParse(req.params.consentId);
  if (!parsedId.success) return res.status(404).json({ error: "Cross-owner consent not found." });

  const parsedBody = crossOwnerConsentReasonBodySchema.safeParse(req.body ?? {});
  if (!parsedBody.success) return res.status(400).json({ error: parsedBody.error.flatten() });

  const ownerUserId = req.user!.id;
  const sb = getSupabaseAdmin();
  const result = await loadCrossOwnerConsentForParticipant(sb, parsedId.data, ownerUserId);
  if (!result.ok) return res.status(500).json(crossOwnerConsentLoadFailedBody());
  if (!result.row) return res.status(404).json({ error: "Cross-owner consent not found." });

  const consent = result.row;
  if (ownerUserId !== consent.requester_owner_user_id) {
    return res.status(403).json({
      error: "Only the requester owner can cancel this invitation.",
      code: "persona_encounter_cross_owner_consent_requester_required",
    });
  }
  if (consent.status !== "pending") return res.status(409).json(crossOwnerConsentInactiveBody(consent.status));

  const update = await transitionCrossOwnerConsent(sb, consent, ownerUserId, {
    nextStatus: "cancelled",
    actorRole: "requester",
    eventType: "requester_cancelled",
    reasonCode: parsedBody.data.reasonCode,
  });
  if (!update.ok) return res.status(500).json(crossOwnerConsentUpdateFailedBody());

  const audit = await loadCrossOwnerConsentAuditEvents(sb, update.row.id);
  return res.json({
    consent: serializeCrossOwnerConsent(update.row, ownerUserId, audit),
  });
});

personaEncountersRouter.patch("/cross-owner-consents/:consentId/revoke", requireAuth, async (req, res) => {
  const parsedId = sessionIdSchema.safeParse(req.params.consentId);
  if (!parsedId.success) return res.status(404).json({ error: "Cross-owner consent not found." });

  const parsedBody = crossOwnerConsentReasonBodySchema.safeParse(req.body ?? {});
  if (!parsedBody.success) return res.status(400).json({ error: parsedBody.error.flatten() });

  const ownerUserId = req.user!.id;
  const sb = getSupabaseAdmin();
  const result = await loadCrossOwnerConsentForParticipant(sb, parsedId.data, ownerUserId);
  if (!result.ok) return res.status(500).json(crossOwnerConsentLoadFailedBody());
  if (!result.row) return res.status(404).json({ error: "Cross-owner consent not found." });

  const consent = result.row;
  if (consent.status !== "approved") return res.status(409).json(crossOwnerConsentInactiveBody(consent.status));

  const actorRole = crossOwnerConsentParticipantRole(consent, ownerUserId);
  if (!actorRole) return res.status(404).json({ error: "Cross-owner consent not found." });

  const update = await transitionCrossOwnerConsent(sb, consent, ownerUserId, {
    nextStatus: "revoked",
    actorRole,
    eventType: "participant_revoked",
    reasonCode: parsedBody.data.reasonCode,
  });
  if (!update.ok) return res.status(500).json(crossOwnerConsentUpdateFailedBody());

  const audit = await loadCrossOwnerConsentAuditEvents(sb, update.row.id);
  return res.json({
    consent: serializeCrossOwnerConsent(update.row, ownerUserId, audit),
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

async function generateCrossOwnerDisposablePreviewReply(input: {
  sb: ReturnType<typeof getSupabaseAdmin>;
  ownerUserId: string;
  fallbackTier: string;
  consent: EncounterCrossOwnerConsentRow;
  initiatorPersonaId: string;
  responderPersonaId: string;
  setup: string;
  requestedMaxOutputTokens?: number;
}): Promise<
  | {
      ok: true;
      replyContent: string;
      initiatorName: string;
      responderName: string;
      rateLimit: { remaining: number | null; retryAfter: number | null };
    }
  | {
      ok: false;
      status: number;
      body: Record<string, unknown>;
    }
> {
  const actorRole = crossOwnerConsentParticipantRole(input.consent, input.ownerUserId);
  const initiatorParticipant = crossOwnerConsentPersonaParticipant(input.consent, input.initiatorPersonaId);
  const responderParticipant = crossOwnerConsentPersonaParticipant(input.consent, input.responderPersonaId);
  if (!actorRole || !initiatorParticipant || !responderParticipant || initiatorParticipant.role === responderParticipant.role) {
    return {
      ok: false,
      status: 409,
      body: {
        error: "Cross-owner disposable preview is not eligible.",
        code: "persona_encounter_cross_owner_preview_ineligible",
      },
    };
  }

  const beforeProviderAudit = await recordCrossOwnerDisposablePreviewAttemptAudit(input.sb, {
    consent: input.consent,
    actorOwnerUserId: input.ownerUserId,
    initiatorPersonaId: input.initiatorPersonaId,
    responderPersonaId: input.responderPersonaId,
    readinessCode: "ready",
    lifecycleStatus: "blocked_before_provider",
  });
  if (!beforeProviderAudit.ok) {
    return { ok: false, status: 500, body: crossOwnerRuntimeAttemptAuditFailedBody() };
  }

  const providerResolution = await resolveCrossOwnerDisposablePreviewProviderRoute(
    input.sb,
    input.ownerUserId,
    input.fallbackTier,
  );
  if (!providerResolution.configured) {
    const audit = await recordCrossOwnerDisposablePreviewAttemptAudit(input.sb, {
      consent: input.consent,
      actorOwnerUserId: input.ownerUserId,
      initiatorPersonaId: input.initiatorPersonaId,
      responderPersonaId: input.responderPersonaId,
      readinessCode: "ready",
      lifecycleStatus: "provider_unavailable",
      completedAt: new Date().toISOString(),
    });
    if (!audit.ok) return { ok: false, status: 500, body: crossOwnerRuntimeAttemptAuditFailedBody() };

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
  const systemPrompt = buildCrossOwnerDisposablePreviewSystemPrompt({
    initiatorName: initiatorParticipant.personaName,
    responderName: responderParticipant.personaName,
  });
  const userMessage = buildCrossOwnerDisposablePreviewUserMessage({
    initiatorName: initiatorParticipant.personaName,
    responderName: responderParticipant.personaName,
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
      const audit = await recordCrossOwnerDisposablePreviewAttemptAudit(input.sb, {
        consent: input.consent,
        actorOwnerUserId: input.ownerUserId,
        initiatorPersonaId: input.initiatorPersonaId,
        responderPersonaId: input.responderPersonaId,
        readinessCode: "ready",
        lifecycleStatus: "quota_exceeded",
        completedAt: new Date().toISOString(),
      });
      if (!audit.ok) return { ok: false, status: 500, body: crossOwnerRuntimeAttemptAuditFailedBody() };

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
    initiatorPersonaId: input.initiatorPersonaId,
    responderPersonaId: input.responderPersonaId,
  });
  if (!rateLimit.allowed) {
    const audit = await recordCrossOwnerDisposablePreviewAttemptAudit(input.sb, {
      consent: input.consent,
      actorOwnerUserId: input.ownerUserId,
      initiatorPersonaId: input.initiatorPersonaId,
      responderPersonaId: input.responderPersonaId,
      readinessCode: "ready",
      lifecycleStatus: "rate_limited",
      completedAt: new Date().toISOString(),
    });
    if (!audit.ok) return { ok: false, status: 500, body: crossOwnerRuntimeAttemptAuditFailedBody() };

    return {
      ok: false,
      status: rateLimit.status,
      body: rateLimit.body,
    };
  }

  let aiResponse: {
    content: string;
    model?: string;
    usage?: { inputTokens?: number; outputTokens?: number };
  };
  try {
    aiResponse = await chatRoute.provider.sendMessage({
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
      ...(chatRoute.routeLabel === "anthropic_platform" ? { model: chatRoute.modelLabel } : {}),
      maxOutputTokens,
    });
  } catch {
    const audit = await recordCrossOwnerDisposablePreviewAttemptAudit(input.sb, {
      consent: input.consent,
      actorOwnerUserId: input.ownerUserId,
      initiatorPersonaId: input.initiatorPersonaId,
      responderPersonaId: input.responderPersonaId,
      readinessCode: "ready",
      lifecycleStatus: "provider_failed",
      completedAt: new Date().toISOString(),
    });
    if (!audit.ok) return { ok: false, status: 500, body: crossOwnerRuntimeAttemptAuditFailedBody() };

    return {
      ok: false,
      status: 502,
      body: {
        error: "Encounter preview provider failed.",
        code: "persona_encounter_provider_failed",
      },
    };
  }

  const replyContent = boundEncounterReply(aiResponse.content);
  if (!replyContent) {
    const audit = await recordCrossOwnerDisposablePreviewAttemptAudit(input.sb, {
      consent: input.consent,
      actorOwnerUserId: input.ownerUserId,
      initiatorPersonaId: input.initiatorPersonaId,
      responderPersonaId: input.responderPersonaId,
      readinessCode: "ready",
      lifecycleStatus: "provider_empty",
      completedAt: new Date().toISOString(),
    });
    if (!audit.ok) return { ok: false, status: 500, body: crossOwnerRuntimeAttemptAuditFailedBody() };

    return {
      ok: false,
      status: 502,
      body: {
        error: "Encounter preview provider returned an empty reply.",
        code: "persona_encounter_provider_empty_reply",
      },
    };
  }

  const successAudit = await recordCrossOwnerDisposablePreviewAttemptAudit(input.sb, {
    consent: input.consent,
    actorOwnerUserId: input.ownerUserId,
    initiatorPersonaId: input.initiatorPersonaId,
    responderPersonaId: input.responderPersonaId,
    readinessCode: "ready",
    lifecycleStatus: "provider_succeeded",
    completedAt: new Date().toISOString(),
  });
  if (!successAudit.ok) return { ok: false, status: 500, body: crossOwnerRuntimeAttemptAuditFailedBody() };

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
    initiatorName: initiatorParticipant.personaName,
    responderName: responderParticipant.personaName,
    rateLimit: rateLimit.rateLimit,
  };
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
    tags: publicTags(row.public_tags),
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

function serializePublishedPublicExhibitListItem(row: EncounterPublicExhibitRow) {
  const detail = serializePublishedPublicExhibit(row);
  return {
    slug: detail.slug,
    routeHref: `/encounters/${detail.slug}`,
    title: detail.title,
    summary: detail.summary,
    tags: detail.tags,
    personas: detail.personas,
    status: detail.status,
    publishedAt: detail.publishedAt,
    provenance: detail.provenance,
  };
}

function serializeCrossOwnerConsent(
  row: EncounterCrossOwnerConsentRow,
  currentOwnerUserId: string,
  auditEvents: EncounterCrossOwnerConsentAuditRow[] = [],
) {
  const participantRole = crossOwnerConsentParticipantRole(row, currentOwnerUserId);

  return {
    id: row.id,
    status: row.status,
    participantRole,
    participants: {
      requester: {
        role: "requester",
        personaName: row.requester_persona_name_snapshot,
        currentUser: participantRole === "requester",
      },
      counterparty: {
        role: "counterparty",
        personaName: row.counterparty_persona_name_snapshot,
        currentUser: participantRole === "counterparty",
      },
    },
    requestedScopes: row.requested_scopes.map((scope) => ({
      scope,
      label: crossOwnerConsentScopeLabel(scope),
      executable: false,
      note: "Recorded for future review only; PR511A does not permit execution or publication.",
    })),
    requestedScopeVersion: row.requested_scope_version,
    ledger: {
      consentRecordActive: row.status === "approved",
      executable: false,
      permitsRuntime: false,
      permitsPrivateArtifact: false,
      permitsPublicExhibit: false,
      permitsGeneratedWords: false,
      permitsTranscript: false,
      permitsSummary: false,
      permitsPublicSurfacing: false,
      note: "Consent ledger only. Approval cannot be consumed to run an encounter, save artifacts, publish metadata or generated words, expose transcript/summary output, or surface anything publicly.",
    },
    timestamps: {
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      requesterApprovedAt: row.requester_approved_at,
      counterpartyApprovedAt: row.counterparty_approved_at,
      rejectedAt: row.rejected_at,
      cancelledAt: row.cancelled_at,
      revokedAt: row.revoked_at,
      expiredAt: row.expired_at,
      supersededAt: row.superseded_at,
      blockedByDeletionAt: row.blocked_by_deletion_at,
      moderationLockedAt: row.moderation_locked_at,
    },
    reasonCode: row.reason_code,
    provenance: {
      label: "Cross-owner consent ledger record",
      schema: row.provenance_schema,
      participantOwnerOnly: true,
      auditAppendOnly: true,
      public: false,
      note: "Readback is limited to participant owners and bounded audit metadata.",
    },
    audit: auditEvents.map(serializeCrossOwnerConsentAuditEvent),
  };
}

function serializeCrossOwnerConsentAuditEvent(row: EncounterCrossOwnerConsentAuditRow) {
  return {
    id: row.id,
    actorRole: row.actor_role,
    eventType: row.event_type,
    previousStatus: row.previous_status,
    nextStatus: row.next_status,
    requestedScopes: row.requested_scopes.map((scope) => ({
      scope,
      label: crossOwnerConsentScopeLabel(scope),
      executable: false,
    })),
    reasonCode: row.reason_code,
    createdAt: row.created_at,
  };
}

function serializeCrossOwnerRuntimeAttempt(row: EncounterCrossOwnerRuntimeAttemptRow) {
  return {
    id: row.id,
    consentId: row.consent_id,
    actorRole: row.actor_role,
    initiatorRole: row.initiator_role,
    responderRole: row.responder_role,
    consentStatus: row.consent_status,
    requestedScopeVersion: row.requested_scope_version,
    requestedScope: {
      scope: row.requested_scope,
      label: crossOwnerConsentScopeLabel(row.requested_scope),
      executable: false,
    },
    readinessCode: row.readiness_code,
    lifecycleStatus: row.lifecycle_status,
    timestamps: {
      createdAt: row.created_at,
      completedAt: row.completed_at,
    },
    provenance: {
      label: "Cross-owner runtime attempt audit",
      schema: row.provenance_schema,
      participantOwnerOnly: true,
      appendOnly: true,
      metadataOnly: true,
      public: false,
      note: "Bounded attempt metadata only. No prompt, generated output, provider payload, token row, private session, public exhibit, report, source body, raw owner id, or raw persona id is stored here.",
    },
  };
}

function serializeCrossOwnerRuntimeAttemptConsentSummary(
  row: EncounterCrossOwnerConsentRow,
  currentOwnerUserId: string,
) {
  return {
    id: row.id,
    status: row.status,
    participantRole: crossOwnerConsentParticipantRole(row, currentOwnerUserId),
    requestedScopeVersion: row.requested_scope_version,
    requestedScopes: row.requested_scopes.map((scope) => ({
      scope,
      label: crossOwnerConsentScopeLabel(scope),
      executable: false,
    })),
    ledger: {
      executable: false,
      permitsRuntime: false,
      note: "Attempt audit readback is metadata-only and does not grant runtime permission.",
    },
    provenance: {
      label: "Cross-owner runtime attempt consent summary",
      schema: PERSONA_ENCOUNTER_CROSS_OWNER_RUNTIME_ATTEMPT_PROVENANCE_SCHEMA,
      participantOwnerOnly: true,
      public: false,
    },
  };
}

function buildCrossOwnerRuntimeContextContract(input: {
  consent: EncounterCrossOwnerConsentRow;
  actorOwnerUserId: string;
  initiatorPersonaId: string;
  responderPersonaId: string;
}) {
  const actorRole = crossOwnerConsentParticipantRole(input.consent, input.actorOwnerUserId);
  const initiatorParticipant = crossOwnerConsentPersonaParticipant(input.consent, input.initiatorPersonaId);
  const responderParticipant = crossOwnerConsentPersonaParticipant(input.consent, input.responderPersonaId);
  const pairMatchesConsent = Boolean(
    initiatorParticipant &&
    responderParticipant &&
    initiatorParticipant.role !== responderParticipant.role,
  );
  const actorOwnsInitiator = Boolean(actorRole && initiatorParticipant?.role === actorRole);
  const responderIsOtherParticipant = Boolean(
    actorRole &&
    responderParticipant &&
    responderParticipant.role !== actorRole,
  );
  const requiredScopePresent = input.consent.requested_scopes.includes(CROSS_OWNER_RUNTIME_CONTEXT_REQUIRED_SCOPE);
  const requiredScopeVersionMatches =
    input.consent.requested_scope_version === CROSS_OWNER_RUNTIME_CONTEXT_CONTRACT_SCOPE_VERSION;
  const readiness = crossOwnerRuntimeContextReadiness({
    consent: input.consent,
    pairMatchesConsent,
    actorOwnsInitiator,
    responderIsOtherParticipant,
    requiredScopePresent,
    requiredScopeVersionMatches,
  });

  return {
    schema: PERSONA_ENCOUNTER_CROSS_OWNER_RUNTIME_CONTEXT_CONTRACT_SCHEMA,
    eligible: readiness.eligible,
    readiness,
    actor: {
      role: actorRole,
      participant: actorRole !== null,
    },
    requestedPair: {
      explicitConsentId: true,
      explicitInitiatorPersonaId: true,
      explicitResponderPersonaId: true,
      matchesConsentPair: pairMatchesConsent,
      actorOwnsInitiator,
      responderIsOtherParticipant,
      initiator: serializeCrossOwnerRuntimeContextParticipant(initiatorParticipant),
      responder: serializeCrossOwnerRuntimeContextParticipant(responderParticipant),
    },
    requirements: {
      consentStatusRequired: "approved",
      consentStatus: input.consent.status,
      requestedScopeRequired: CROSS_OWNER_RUNTIME_CONTEXT_REQUIRED_SCOPE,
      requestedScopePresent: requiredScopePresent,
      requestedScopeVersionRequired: CROSS_OWNER_RUNTIME_CONTEXT_CONTRACT_SCOPE_VERSION,
      requestedScopeVersion: input.consent.requested_scope_version,
      genericLedgerExecutable: false,
    },
    deniedContextClasses: CROSS_OWNER_RUNTIME_DENIED_CONTEXT_CLASSES.map((contextClass) => ({
      contextClass,
      denied: true,
    })),
    futureRuntimeAttemptAudit: {
      writtenInPr512A: false,
      implementedInPr513A: true,
      allowedMetadataOnlyFields: [...CROSS_OWNER_RUNTIME_ATTEMPT_AUDIT_FIELDS],
      forbiddenFields: [
        "rawOwnerIds",
        "rawPersonaIds",
        "prompts",
        "privateProfileFields",
        "providerPayloads",
        "generatedWords",
        "traces",
        "sqlDetails",
        "envValues",
        "cookies",
        "bearerValues",
        "secretValues",
      ],
    },
    execution: {
      providerCalled: false,
      promptAssembled: false,
      generatedWordsReturned: false,
      tokenAccountingRecorded: false,
      privateSessionCreated: false,
      publicExhibitCreated: false,
      reportCreated: false,
      storageWritten: false,
      publicSurfaceCreated: false,
    },
    note: "PR512A is readback-only. This contract does not execute a provider call or grant runtime permission.",
  };
}

function crossOwnerRuntimeContextReadiness(input: {
  consent: EncounterCrossOwnerConsentRow;
  pairMatchesConsent: boolean;
  actorOwnsInitiator: boolean;
  responderIsOtherParticipant: boolean;
  requiredScopePresent: boolean;
  requiredScopeVersionMatches: boolean;
}) {
  if (!input.pairMatchesConsent) {
    return {
      eligible: false,
      code: "wrong_pair",
      ineligibleState: "wrong_pair",
      message: "The supplied persona pair must match the consent participants.",
    };
  }

  if (!input.actorOwnsInitiator || !input.responderIsOtherParticipant) {
    return {
      eligible: false,
      code: "wrong_role",
      ineligibleState: "wrong_role",
      message: "The actor must initiate with their own participant persona and target the other participant persona.",
    };
  }

  if (input.consent.status !== "approved") {
    return {
      eligible: false,
      code: input.consent.status,
      ineligibleState: input.consent.status,
      message: "The consent ledger record is not approved for context-contract readiness.",
    };
  }

  if (!input.requiredScopeVersionMatches) {
    return {
      eligible: false,
      code: "wrong_version",
      ineligibleState: "wrong_version",
      message: "The consent scope version does not match the accepted runtime context contract version.",
    };
  }

  if (!input.requiredScopePresent) {
    return {
      eligible: false,
      code: "wrong_scope",
      ineligibleState: "wrong_scope",
      message: "The approved consent does not include the required cross-owner runtime scope.",
    };
  }

  return {
    eligible: true,
    code: "ready",
    ineligibleState: null,
    message: "The consent row satisfies the readback-only runtime context contract. Provider execution remains out of scope.",
  };
}

function crossOwnerConsentPersonaParticipant(
  row: EncounterCrossOwnerConsentRow,
  personaId: string,
): { role: "requester" | "counterparty"; personaName: string } | null {
  if (row.requester_persona_id === personaId) {
    return {
      role: "requester",
      personaName: row.requester_persona_name_snapshot,
    };
  }
  if (row.counterparty_persona_id === personaId) {
    return {
      role: "counterparty",
      personaName: row.counterparty_persona_name_snapshot,
    };
  }
  return null;
}

function serializeCrossOwnerRuntimeContextParticipant(
  participant: { role: "requester" | "counterparty"; personaName: string } | null,
) {
  return participant
    ? {
        role: participant.role,
        personaName: participant.personaName,
        matchedConsentParticipant: true,
      }
    : {
        role: null,
        personaName: null,
        matchedConsentParticipant: false,
      };
}

function crossOwnerConsentScopeLabel(scope: CrossOwnerConsentRequestedScope) {
  switch (scope) {
    case "run_cross_owner_encounter":
      return "Run cross-owner encounter";
    case "save_private_cross_owner_artifact":
      return "Save private cross-owner artifact";
    case "share_participant_metadata_between_owners":
      return "Share participant metadata between owners";
    case "publish_metadata_only_public_exhibit":
      return "Publish metadata-only public exhibit";
    case "publish_generated_words_excerpt":
      return "Publish generated-words excerpt";
    case "publish_transcript":
      return "Publish transcript";
    case "publish_generated_summary":
      return "Publish generated summary";
  }
}

function crossOwnerConsentParticipantRole(
  row: EncounterCrossOwnerConsentRow,
  ownerUserId: string,
): "requester" | "counterparty" | null {
  if (row.requester_owner_user_id === ownerUserId) return "requester";
  if (row.counterparty_owner_user_id === ownerUserId) return "counterparty";
  return null;
}

function crossOwnerConsentInactiveBody(status: CrossOwnerConsentStatus) {
  return {
    error: "Cross-owner consent is not pending or active for this transition.",
    code: "persona_encounter_cross_owner_consent_inactive",
    status,
    executable: false,
  };
}

function crossOwnerConsentLoadFailedBody() {
  return {
    error: "Cross-owner encounter consent could not be loaded.",
    code: "persona_encounter_cross_owner_consent_load_failed",
  };
}

function crossOwnerConsentUpdateFailedBody() {
  return {
    error: "Cross-owner encounter consent could not be updated.",
    code: "persona_encounter_cross_owner_consent_update_failed",
  };
}

function crossOwnerRuntimeAttemptAuditFailedBody() {
  return {
    error: "Cross-owner runtime attempt audit could not be recorded.",
    code: "persona_encounter_cross_owner_runtime_attempt_audit_failed",
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

async function loadEncounterPersona(
  sb: ReturnType<typeof getSupabaseAdmin>,
  personaId: string,
) {
  const { data } = await sb
    .from("personas")
    .select("id, owner_user_id, name, short_description, long_description, visibility, provider, awakening_prompt, style_notes")
    .eq("id", personaId)
    .maybeSingle();

  return (data ?? null) as EncounterPersonaRow | null;
}

async function loadCrossOwnerConsentsForParticipant(
  sb: ReturnType<typeof getSupabaseAdmin>,
  ownerUserId: string,
): Promise<{ ok: true; rows: EncounterCrossOwnerConsentRow[] } | { ok: false }> {
  const [requesterResult, counterpartyResult] = await Promise.all([
    sb
      .from("persona_encounter_cross_owner_consents")
      .select("*")
      .eq("requester_owner_user_id", ownerUserId)
      .order("created_at", { ascending: false })
      .limit(25),
    sb
      .from("persona_encounter_cross_owner_consents")
      .select("*")
      .eq("counterparty_owner_user_id", ownerUserId)
      .order("created_at", { ascending: false })
      .limit(25),
  ]);

  if (requesterResult.error || counterpartyResult.error) return { ok: false };

  const rowsById = new Map<string, EncounterCrossOwnerConsentRow>();
  for (const row of [
    ...((requesterResult.data ?? []) as EncounterCrossOwnerConsentRow[]),
    ...((counterpartyResult.data ?? []) as EncounterCrossOwnerConsentRow[]),
  ]) {
    rowsById.set(row.id, row);
  }

  const rows = [...rowsById.values()]
    .sort((a, b) => {
      if (a.created_at === b.created_at) return b.id.localeCompare(a.id);
      return b.created_at.localeCompare(a.created_at);
    })
    .slice(0, 25);

  return { ok: true, rows };
}

async function loadCrossOwnerConsentForParticipant(
  sb: ReturnType<typeof getSupabaseAdmin>,
  consentId: string,
  ownerUserId: string,
): Promise<{ ok: true; row: EncounterCrossOwnerConsentRow | null } | { ok: false }> {
  const { data, error } = await sb
    .from("persona_encounter_cross_owner_consents")
    .select("*")
    .eq("id", consentId)
    .maybeSingle();

  if (error) return { ok: false };

  const row = (data ?? null) as EncounterCrossOwnerConsentRow | null;
  if (!row || !crossOwnerConsentParticipantRole(row, ownerUserId)) {
    return { ok: true, row: null };
  }

  return { ok: true, row };
}

async function loadCrossOwnerConsentAuditEvents(
  sb: ReturnType<typeof getSupabaseAdmin>,
  consentId: string,
) {
  const { data, error } = await sb
    .from("persona_encounter_cross_owner_consent_audit_events")
    .select("*")
    .eq("consent_id", consentId)
    .order("created_at", { ascending: true })
    .limit(50);

  if (error) return [];
  return (data ?? []) as EncounterCrossOwnerConsentAuditRow[];
}

async function loadCrossOwnerRuntimeAttempts(
  sb: ReturnType<typeof getSupabaseAdmin>,
  consentId: string,
): Promise<{ ok: true; rows: EncounterCrossOwnerRuntimeAttemptRow[] } | { ok: false }> {
  const { data, error } = await sb
    .from("persona_encounter_cross_owner_runtime_attempts")
    .select("*")
    .eq("consent_id", consentId)
    .order("created_at", { ascending: false })
    .limit(25);

  if (error) return { ok: false };
  return { ok: true, rows: (data ?? []) as EncounterCrossOwnerRuntimeAttemptRow[] };
}

export async function recordCrossOwnerRuntimeAttemptAudit(
  sb: ReturnType<typeof getSupabaseAdmin>,
  input: {
    consentId: string;
    actorRole: CrossOwnerRuntimeParticipantRole;
    initiatorRole: CrossOwnerRuntimeParticipantRole;
    responderRole: CrossOwnerRuntimeParticipantRole;
    consentStatus: CrossOwnerConsentStatus;
    requestedScopeVersion: number;
    requestedScope: CrossOwnerConsentRequestedScope;
    readinessCode: string;
    lifecycleStatus: CrossOwnerRuntimeAttemptLifecycleStatus;
    completedAt?: string | null;
  },
): Promise<{ ok: true; row: EncounterCrossOwnerRuntimeAttemptRow } | { ok: false }> {
  if (!/^[a-z0-9_]{1,80}$/.test(input.readinessCode)) return { ok: false };

  const { data, error } = await sb.rpc("record_persona_encounter_cross_owner_runtime_attempt", {
    p_consent_id: input.consentId,
    p_actor_role: input.actorRole,
    p_initiator_role: input.initiatorRole,
    p_responder_role: input.responderRole,
    p_consent_status: input.consentStatus,
    p_requested_scope_version: input.requestedScopeVersion,
    p_requested_scope: input.requestedScope,
    p_readiness_code: input.readinessCode,
    p_lifecycle_status: input.lifecycleStatus,
    p_completed_at: input.completedAt ?? null,
  });

  const row = coerceCrossOwnerRuntimeAttemptRpcRow(data);
  if (error || !row) return { ok: false };

  return { ok: true, row };
}

async function recordCrossOwnerDisposablePreviewAttemptAudit(
  sb: ReturnType<typeof getSupabaseAdmin>,
  input: {
    consent: EncounterCrossOwnerConsentRow;
    actorOwnerUserId: string;
    initiatorPersonaId: string;
    responderPersonaId: string;
    readinessCode: string;
    lifecycleStatus: CrossOwnerRuntimeAttemptLifecycleStatus;
    completedAt?: string | null;
  },
): Promise<{ ok: true; recorded: boolean } | { ok: false }> {
  const actorRole = crossOwnerConsentParticipantRole(input.consent, input.actorOwnerUserId);
  const initiatorParticipant = crossOwnerConsentPersonaParticipant(input.consent, input.initiatorPersonaId);
  const responderParticipant = crossOwnerConsentPersonaParticipant(input.consent, input.responderPersonaId);
  if (
    !actorRole ||
    !initiatorParticipant ||
    !responderParticipant ||
    initiatorParticipant.role === responderParticipant.role
  ) {
    return { ok: true, recorded: false };
  }

  const result = await recordCrossOwnerRuntimeAttemptAudit(sb, {
    consentId: input.consent.id,
    actorRole,
    initiatorRole: initiatorParticipant.role,
    responderRole: responderParticipant.role,
    consentStatus: input.consent.status,
    requestedScopeVersion: input.consent.requested_scope_version,
    requestedScope: CROSS_OWNER_RUNTIME_CONTEXT_REQUIRED_SCOPE,
    readinessCode: input.readinessCode,
    lifecycleStatus: input.lifecycleStatus,
    completedAt: input.completedAt ?? null,
  });

  if (!result.ok) return { ok: false };
  return { ok: true, recorded: true };
}

async function transitionCrossOwnerConsent(
  sb: ReturnType<typeof getSupabaseAdmin>,
  consent: EncounterCrossOwnerConsentRow,
  actorUserId: string,
  input: {
    nextStatus: CrossOwnerConsentStatus;
    actorRole: "requester" | "counterparty";
    eventType: CrossOwnerConsentAuditEventType;
    reasonCode?: CrossOwnerConsentReasonCode;
  },
): Promise<{ ok: true; row: EncounterCrossOwnerConsentRow } | { ok: false }> {
  const { data, error } = await sb.rpc("transition_persona_encounter_cross_owner_consent", {
    p_consent_id: consent.id,
    p_expected_status: consent.status,
    p_next_status: input.nextStatus,
    p_actor_user_id: actorUserId,
    p_actor_role: input.actorRole,
    p_event_type: input.eventType,
    p_reason_code: input.reasonCode ?? null,
  });

  const row = coerceCrossOwnerConsentRpcRow(data);
  if (error || !row) return { ok: false };

  return { ok: true, row };
}

function coerceCrossOwnerConsentRpcRow(data: unknown): EncounterCrossOwnerConsentRow | null {
  const value = Array.isArray(data) ? data[0] : data;
  if (!value || typeof value !== "object") return null;
  return value as EncounterCrossOwnerConsentRow;
}

function coerceCrossOwnerRuntimeAttemptRpcRow(data: unknown): EncounterCrossOwnerRuntimeAttemptRow | null {
  const value = Array.isArray(data) ? data[0] : data;
  if (!value || typeof value !== "object") return null;
  return value as EncounterCrossOwnerRuntimeAttemptRow;
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
    .select(PUBLIC_EXHIBIT_PUBLIC_SELECT)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  const exhibit = (data ?? null) as EncounterPublicExhibitRow | null;
  if (!exhibit || exhibit.removed_at) return null;
  return exhibit;
}

async function loadPublishedPublicExhibitList(
  sb: ReturnType<typeof getSupabaseAdmin>,
  input: { limit: number; cursor: PublicExhibitListCursor | null },
): Promise<
  | { ok: true; rows: EncounterPublicExhibitRow[]; nextCursor: string | null }
  | { ok: false }
> {
  let query = sb
    .from("persona_encounter_public_exhibits")
    .select(PUBLIC_EXHIBIT_PUBLIC_SELECT)
    .eq("status", "published")
    .is("removed_at", null)
    .order("published_at", { ascending: false })
    .order("slug", { ascending: false })
    .limit(PUBLIC_EXHIBIT_LIST_DB_WINDOW);

  if (input.cursor) {
    query = query.or(
      [
        `published_at.lt.${input.cursor.publishedAt}`,
        `and(published_at.eq.${input.cursor.publishedAt},slug.lt.${input.cursor.slug})`,
      ].join(","),
    );
  }

  const { data, error } = await query;
  if (error) return { ok: false };

  const safeRows = ((data ?? []) as EncounterPublicExhibitRow[]).filter(isSafePublicExhibitListRow);
  const sourceBackedRows = await filterPublicExhibitsWithExistingSources(sb, safeRows);
  const pageRows = sourceBackedRows.slice(0, input.limit);
  const hasNextPage = sourceBackedRows.length > input.limit;

  return {
    ok: true,
    rows: pageRows,
    nextCursor: hasNextPage && pageRows.length > 0
      ? encodePublicExhibitListCursor(pageRows[pageRows.length - 1])
      : null,
  };
}

async function filterPublicExhibitsWithExistingSources(
  sb: ReturnType<typeof getSupabaseAdmin>,
  rows: EncounterPublicExhibitRow[],
) {
  if (rows.length === 0) return rows;

  const sessionIds = Array.from(new Set(rows.map((row) => row.private_session_id).filter(Boolean)));
  if (sessionIds.length === 0) return [];

  const { data, error } = await sb
    .from("persona_encounter_private_sessions")
    .select("id")
    .in("id", sessionIds);
  if (error) return [];

  const existingSessionIds = new Set((data ?? []).map((row: { id: string }) => row.id));
  return rows.filter((row) => existingSessionIds.has(row.private_session_id));
}

function isSafePublicExhibitListRow(row: EncounterPublicExhibitRow) {
  return (
    row.status === "published" &&
    !row.removed_at &&
    !row.retracted_at &&
    row.provenance_schema === PERSONA_ENCOUNTER_PUBLIC_EXHIBIT_PROVENANCE_SCHEMA &&
    publicExhibitSlugSchema.safeParse(row.slug).success
  );
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

async function resolveCrossOwnerDisposablePreviewProviderRoute(
  sb: ReturnType<typeof getSupabaseAdmin>,
  ownerUserId: string,
  fallbackTier: string,
) {
  const { data: profile } = await sb
    .from("profiles")
    .select("tier")
    .eq("id", ownerUserId)
    .maybeSingle();

  const stationModel = selectStationModel(profile?.tier ?? fallbackTier);
  const chatRoute = resolveChatProviderRuntimeRoute({
    provider: "platform",
    aiMode: "platform",
    byokOpenaiKey: null,
    byokAnthropicKey: null,
    byokDeepseekKey: null,
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

function buildCrossOwnerDisposablePreviewSystemPrompt(input: {
  initiatorName: string;
  responderName: string;
}) {
  return [
    "You are generating one private disposable cross-owner Studio persona encounter preview.",
    "Generate exactly one reply from the responder display name.",
    "Use only the consent display names and the actor-authored setup in the user message.",
    "Do not use, infer, request, or claim access to private profile fields, Memory, Archive, Canon, Continuity, retrieval, transcripts, source bodies, provider internals, storage paths, raw owner ids, raw persona ids, public routes, or shared private history.",
    "Do not continue the conversation, write both sides, summarize, excerpt, publish, save, or claim persistence.",
    `Initiator display name: ${clip(input.initiatorName, 120)}`,
    `Responder display name: ${clip(input.responderName, 120)}`,
  ].join("\n\n");
}

function buildCrossOwnerDisposablePreviewUserMessage(input: {
  initiatorName: string;
  responderName: string;
  setup: string;
}) {
  return [
    `Actor-authored setup for ${clip(input.initiatorName, 120)} to encounter ${clip(input.responderName, 120)}:`,
    input.setup,
    "",
    `Reply exactly once as ${clip(input.responderName, 120)}.`,
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

function publicExhibitListLimit(value: unknown) {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number.parseInt(String(raw ?? ""), 10);
  if (!Number.isFinite(parsed)) return PUBLIC_EXHIBIT_LIST_DEFAULT_LIMIT;
  return Math.min(PUBLIC_EXHIBIT_LIST_MAX_LIMIT, Math.max(1, parsed));
}

function encodePublicExhibitListCursor(row: EncounterPublicExhibitRow) {
  return Buffer.from(JSON.stringify({
    publishedAt: row.published_at,
    slug: row.slug,
  }), "utf8").toString("base64url");
}

function decodePublicExhibitListCursor(value: unknown):
  | { ok: true; cursor: PublicExhibitListCursor | null }
  | { ok: false } {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === undefined || raw === null || raw === "") return { ok: true, cursor: null };
  if (typeof raw !== "string" || raw.length > 240) return { ok: false };

  try {
    const parsed = publicExhibitListCursorSchema.safeParse(
      JSON.parse(Buffer.from(raw, "base64url").toString("utf8")),
    );
    if (!parsed.success) return { ok: false };
    return { ok: true, cursor: parsed.data };
  } catch {
    return { ok: false };
  }
}

function publicTags(value: string[] | null | undefined) {
  return Array.isArray(value) ? value.filter((tag) => typeof tag === "string") : [];
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
