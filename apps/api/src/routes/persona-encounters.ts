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

const readinessSchema = z.object({
  initiatorPersonaId: z.string().uuid(),
  responderPersonaId: z.string().uuid(),
}).refine((value) => value.initiatorPersonaId !== value.responderPersonaId, {
  message: "Select two different personas.",
  path: ["responderPersonaId"],
});

const sessionIdSchema = z.string().uuid();

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

  return res.json({
    sessions: ((data ?? []) as EncounterPrivateSessionRow[]).map(serializePrivateSession),
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

  return res.json({
    session: serializePrivateSession(data as EncounterPrivateSessionRow),
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

function serializePrivateSession(row: EncounterPrivateSessionRow) {
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
  };
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
