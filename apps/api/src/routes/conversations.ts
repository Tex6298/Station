import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/require-auth";
import { getSupabaseAdmin } from "../lib/supabase";
import { assemblePersonaRuntimeContext } from "@station/ai/retrieval/context-builder";
import { retrievePrivateArchive } from "@station/ai/retrieval/archive-retrieval";
import { describePlatformProviderRoute, resolveProvider } from "@station/ai/providers/router";
import { AnthropicProvider } from "@station/ai/providers/anthropic";
import { addMemoryItem, ingestTextIntoArchive, saveMessageAsMemory } from "../services/archive.service";
import { env } from "../lib/env";
import { storageErrorResponse } from "../services/storage.service";
import { updateMemoryLifecycle } from "../services/memory-continuity.service";
import { resolveEmbeddingApiKey } from "../services/embedding-key.service";
import {
  assertTokenBudgetForEstimate,
  estimateConversationTokens,
  estimateTokensFromText,
  recordLlmTokenUsage,
  selectStationModel,
  tokenErrorResponse,
} from "../services/token-credits.service";
import { enqueueLlmCall } from "../services/llm-queue.service";
import {
  buildChatRuntimeBudgetReport,
  includeRuntimeDebug,
  toChronologicalRuntimeHistory,
} from "../services/conversation-history.service";
import {
  completeAiTrace,
  failAiTrace,
  recordAiTraceEvent,
  startAiTrace,
} from "../services/ai-observability.service";

const chatSchema = z.object({
  content: z.string().min(1).max(8000),
  conversationId: z.string().uuid().optional(),
});

const contextPreviewSchema = z.object({
  query: z.string().max(8000).optional(),
});

const archiveRetrievalSchema = z.object({
  query: z.string().max(8000).optional(),
  limit: z.coerce.number().int().min(1).max(8).optional(),
  maxCharacters: z.coerce.number().int().min(80).max(4000).optional(),
});

const saveMemorySchema = z.object({
  messageId: z.string().uuid(),
  relevanceWeight: z.number().min(0.1).max(5).optional(),
});

const saveCanonSchema = z.object({
  messageId: z.string().uuid(),
  title: z.string().max(120).optional(),
  priority: z.number().int().min(1).max(10).optional(),
});

const candidateReviewSchema = z.object({
  action: z.enum(["accept", "reject"]),
  title: z.string().max(160).optional(),
  content: z.string().max(20000).optional(),
  priority: z.number().int().min(1).max(10).optional(),
  relevanceWeight: z.number().min(0.1).max(5).optional(),
});

const candidateListSchema = z.object({
  status: z.enum(["pending", "reviewed", "all"]).default("pending"),
  source: z.enum(["import", "all"]).default("import"),
});

type ConversationMessageRow = {
  id: string;
  role: "system" | "user" | "assistant";
  content: string;
  provider_used?: string | null;
  created_at: string;
};

type CandidateSeed = {
  candidate_type: "memory" | "canon";
  title: string;
  content: string;
  rationale: string;
  source_message_ids: string[];
};

export const conversationsRouter = Router();
conversationsRouter.use(requireAuth);

type ChatErrorClassification = "archived_state" | "provider_config" | "provider_failure" | "quota";

function chatError(status: number, code: string, classification: ChatErrorClassification, error: string) {
  return { status, body: { error, code, classification } };
}

function transcriptRow(row: any) {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    personaId: row.persona_id,
    title: row.title,
    transcriptMarkdown: row.transcript_markdown,
    messageCount: row.message_count,
    sourceSummary: row.source_summary,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function candidateRow(row: any) {
  return {
    id: row.id,
    archivedChatTranscriptId: row.archived_chat_transcript_id,
    personaId: row.persona_id,
    candidateType: row.candidate_type,
    title: row.title,
    content: row.content,
    rationale: row.rationale,
    sourceTable: row.source_table ?? null,
    sourceId: row.source_id ?? null,
    sourceLabel: row.source_label ?? null,
    status: row.status,
    sourceMessageIds: row.source_message_ids ?? [],
    acceptedTargetType: row.accepted_target_type,
    acceptedTargetId: row.accepted_target_id,
    acceptedAt: row.accepted_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function filterCandidateRows(
  rows: any[],
  filters: z.infer<typeof candidateListSchema>
) {
  return rows.filter((row) => {
    if (filters.source === "import" && row.source_table !== "persona_files") return false;
    if (filters.status === "pending") return row.status === "pending";
    if (filters.status === "reviewed") return row.status !== "pending";
    return true;
  });
}

function trimTo(value: string, maxLength: number) {
  const compact = value.replace(/\s+/g, " ").trim();
  if (compact.length <= maxLength) return compact;
  return `${compact.slice(0, Math.max(0, maxLength - 3)).trim()}...`;
}

function summarizeMessages(messages: ConversationMessageRow[]) {
  const firstUser = messages.find((message) => message.role === "user");
  const lastAssistant = [...messages].reverse().find((message) => message.role === "assistant");
  return [firstUser, lastAssistant]
    .filter((message): message is ConversationMessageRow => Boolean(message))
    .map((message) => `${message.role}: ${trimTo(message.content, 180)}`)
    .join("\n");
}

function buildTranscriptMarkdown(conversation: any, messages: ConversationMessageRow[]) {
  const title = conversation.title?.trim() || "Archived conversation";
  const lines = [
    `# ${title}`,
    "",
    `Conversation: ${conversation.id}`,
    `Archived: ${new Date().toISOString()}`,
    `Messages: ${messages.filter((message) => message.role !== "system").length}`,
    "",
  ];

  for (const message of messages) {
    if (message.role === "system") continue;
    lines.push(`## ${message.role === "assistant" ? "Persona" : "Owner"} - ${message.created_at}`);
    lines.push("");
    lines.push(message.content.trim());
    lines.push("");
  }

  return lines.join("\n").trim();
}

function generateContinuityCandidates(messages: ConversationMessageRow[]): CandidateSeed[] {
  const visible = messages.filter((message) => message.role !== "system" && message.content.trim());
  const ownerMessages = visible.filter((message) => message.role === "user");
  const assistantMessages = visible.filter((message) => message.role === "assistant");
  const candidateMessages = ownerMessages.length > 0 ? ownerMessages : visible;
  const memoryMessages = candidateMessages.slice(-3);
  const memoryContent = memoryMessages
    .map((message) => `- ${trimTo(message.content, 280)}`)
    .join("\n")
    .trim();

  const canonicalPattern = /\b(always|never|must|should|prefer|remember|rule|boundary|canon|principle)\b/i;
  const canonSource =
    visible.find((message) => canonicalPattern.test(message.content)) ??
    assistantMessages.at(-1) ??
    visible.at(-1);

  const seeds: CandidateSeed[] = [];
  if (memoryContent) {
    seeds.push({
      candidate_type: "memory",
      title: "Memory from archived chat",
      content: memoryContent,
      rationale: "Generated from owner-authored turns in the archived conversation.",
      source_message_ids: memoryMessages.map((message) => message.id),
    });
  }

  if (canonSource) {
    seeds.push({
      candidate_type: "canon",
      title: "Canon candidate from archived chat",
      content: trimTo(canonSource.content, 900),
      rationale: "Generated from a turn that reads like durable persona guidance.",
      source_message_ids: [canonSource.id],
    });
  }

  return seeds;
}

async function loadArchiveBundle(sb: ReturnType<typeof getSupabaseAdmin>, conversationId: string, ownerUserId: string) {
  const { data: transcript } = await sb
    .from("archived_chat_transcripts")
    .select("*")
    .eq("conversation_id", conversationId)
    .eq("owner_user_id", ownerUserId)
    .single();

  if (!transcript) return null;

  const { data: candidates } = await sb
    .from("continuity_candidates")
    .select("*")
    .eq("archived_chat_transcript_id", transcript.id)
    .eq("owner_user_id", ownerUserId)
    .order("created_at", { ascending: true });

  return {
    transcript: transcriptRow(transcript),
    candidates: (candidates ?? []).map(candidateRow),
  };
}

// -- List conversations for a persona -----------------------------------------
conversationsRouter.get("/persona/:personaId", async (req, res) => {
  const sb = getSupabaseAdmin();
  const userId = req.user!.id;

  const { data, error } = await sb
    .from("conversations")
    .select("id, persona_id, title, mode, status, archived_at, message_count, created_at, updated_at")
    .eq("persona_id", req.params.personaId)
    .eq("owner_user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ conversations: data });
});

// -- List continuity candidates for a persona ---------------------------------
conversationsRouter.get("/persona/:personaId/candidates", async (req, res) => {
  const parsed = candidateListSchema.safeParse({
    status: req.query.status,
    source: req.query.source,
  });
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const sb = getSupabaseAdmin();
  const userId = req.user!.id;
  const { personaId } = req.params;

  const { data: persona, error: personaError } = await sb
    .from("personas")
    .select("id, owner_user_id")
    .eq("id", personaId)
    .single();

  if (personaError || !persona) return res.status(404).json({ error: "Persona not found." });
  if (persona.owner_user_id !== userId) return res.status(403).json({ error: "Not your persona." });

  const { data, error } = await sb
    .from("continuity_candidates")
    .select("*")
    .eq("persona_id", personaId)
    .eq("owner_user_id", userId)
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });

  const allRows = data ?? [];
  const rows = filterCandidateRows(allRows, parsed.data);
  return res.json({
    candidates: rows.map(candidateRow),
    summary: {
      total: rows.length,
      pending: rows.filter((row) => row.status === "pending").length,
      reviewed: rows.filter((row) => row.status !== "pending").length,
      importBacked: rows.filter((row) => row.source_table === "persona_files").length,
    },
  });
});

// -- Preview the private continuity context that would be sent at runtime ------
conversationsRouter.get("/persona/:personaId/context-preview", async (req, res) => {
  const parsed = contextPreviewSchema.safeParse({ query: req.query.query });
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const sb = getSupabaseAdmin();
  const userId = req.user!.id;
  const { personaId } = req.params;

  const { data: persona, error: personaErr } = await sb
    .from("personas")
    .select("id, name, short_description, long_description, visibility, provider, awakening_prompt, style_notes, owner_user_id")
    .eq("id", personaId)
    .single();

  if (personaErr || !persona) return res.status(404).json({ error: "Persona not found." });
  if (persona.owner_user_id !== userId) return res.status(403).json({ error: "Not your persona." });

  const { data: profile } = await sb
    .from("profiles")
    .select("byok_openai_key")
    .eq("id", userId)
    .single();

  const query = parsed.data.query?.trim() || "Preview how this persona loads private continuity.";
  const context = await assemblePersonaRuntimeContext({
    supabase: sb,
    persona: {
      id: persona.id,
      name: persona.name,
      shortDescription: persona.short_description,
      longDescription: persona.long_description,
      visibility: persona.visibility as "private" | "public",
      awakeningPrompt: persona.awakening_prompt,
      styleNotes: persona.style_notes,
    },
    ownerUserId: userId,
    userQuery: query,
    embeddingApiKey: resolveEmbeddingApiKey(profile),
  });

  return res.json({ query, context });
});

// -- Retrieve private archive excerpts for a persona --------------------------
conversationsRouter.get("/persona/:personaId/archive-retrieval", async (req, res) => {
  const parsed = archiveRetrievalSchema.safeParse({
    query: req.query.query,
    limit: req.query.limit,
    maxCharacters: req.query.maxCharacters,
  });
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const sb = getSupabaseAdmin();
  const userId = req.user!.id;
  const { personaId } = req.params;

  const { data: persona, error: personaErr } = await sb
    .from("personas")
    .select("id, owner_user_id")
    .eq("id", personaId)
    .single();

  if (personaErr || !persona) return res.status(404).json({ error: "Persona not found." });
  if (persona.owner_user_id !== userId) return res.status(403).json({ error: "Not your persona." });

  const { data: profile } = await sb
    .from("profiles")
    .select("byok_openai_key")
    .eq("id", userId)
    .single();

  const query = parsed.data.query?.trim() || "Retrieve relevant private archive material.";
  const retrieval = await retrievePrivateArchive({
    supabase: sb,
    ownerUserId: userId,
    personaId: persona.id,
    query,
    limit: parsed.data.limit,
    maxCharacters: parsed.data.maxCharacters,
    embeddingApiKey: resolveEmbeddingApiKey(profile),
  });

  return res.json({ query, retrieval });
});

// -- Get a single conversation with messages -----------------------------------
conversationsRouter.get("/:conversationId", async (req, res) => {
  const sb = getSupabaseAdmin();
  const userId = req.user!.id;

  const { data: conv, error } = await sb
    .from("conversations")
    .select("*")
    .eq("id", req.params.conversationId)
    .eq("owner_user_id", userId)
    .single();

  if (error || !conv) return res.status(404).json({ error: "Conversation not found." });

  const { data: messages } = await sb
    .from("conversation_messages")
    .select("id, role, content, tokens_used, provider_used, created_at")
    .eq("conversation_id", conv.id)
    .order("created_at", { ascending: true });

  const archive = conv.status === "archived"
    ? await loadArchiveBundle(sb, conv.id, userId)
    : null;

  return res.json({ conversation: conv, messages: messages ?? [], archive });
});

// -- Send a message (main chat endpoint) --------------------------------------
conversationsRouter.post("/persona/:personaId/chat", async (req, res) => {
  const parsed = chatSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const sb = getSupabaseAdmin();
  const userId = req.user!.id;
  const { personaId } = req.params;
  const { content, conversationId } = parsed.data;

  // Load persona (verify ownership)
  const { data: persona, error: personaErr } = await sb
    .from("personas")
    .select("id, name, short_description, long_description, visibility, provider, awakening_prompt, style_notes, owner_user_id")
    .eq("id", personaId)
    .single();

  if (personaErr || !persona) return res.status(404).json({ error: "Persona not found." });
  if (persona.owner_user_id !== userId) return res.status(403).json({ error: "Not your persona." });

  // Load user profile for BYOK keys + ai_mode
  const { data: profile } = await sb
    .from("profiles")
    .select("ai_mode, byok_openai_key, byok_anthropic_key, byok_deepseek_key")
    .eq("id", userId)
    .single();

  // Get or create conversation
  let convId = conversationId;
  if (!convId) {
    const { data: newConv, error: convErr } = await sb
      .from("conversations")
      .insert({
        persona_id: personaId,
        owner_user_id: userId,
        title: `${persona.name} - ${new Date().toLocaleDateString("en-GB")}`,
        mode: "private",
      })
      .select("id")
      .single();

    if (convErr || !newConv) return res.status(500).json({ error: "Could not create conversation." });
    convId = newConv.id;
  } else {
    const { data: existingConv } = await sb
      .from("conversations")
      .select("id, persona_id, owner_user_id, status")
      .eq("id", convId)
      .single();

    if (!existingConv || existingConv.owner_user_id !== userId || existingConv.persona_id !== personaId) {
      return res.status(403).json({ error: "Not authorised for this conversation." });
    }

    if (existingConv.status === "archived") {
      const archived = chatError(
        409,
        "conversation_archived",
        "archived_state",
        "Archived conversations are read-only. Start a new chat to continue."
      );
      return res.status(archived.status).json(archived.body);
    }
  }

  // Load the most recent 20 prior turns for runtime context. Supabase applies
  // limit after ordering, so fetch newest-first and normalise back to chronological order.
  const { data: historyRows } = await sb
    .from("conversation_messages")
    .select("role, content, created_at")
    .eq("conversation_id", convId)
    .order("created_at", { ascending: false })
    .limit(20);
  const rawHistoryRows = historyRows ?? [];
  const historyLimit = 20;
  const history = toChronologicalRuntimeHistory(rawHistoryRows, historyLimit);

  // Save the user message
  await sb.from("conversation_messages").insert({
    conversation_id: convId,
    role: "user",
    content,
  });

  // Build RAG system prompt and a content-free runtime budget report.
  const runtimeContext = await assemblePersonaRuntimeContext({
    supabase: sb,
    persona: {
      id: persona.id,
      name: persona.name,
      shortDescription: persona.short_description,
      longDescription: persona.long_description,
      visibility: persona.visibility as "private" | "public",
      awakeningPrompt: persona.awakening_prompt,
      styleNotes: persona.style_notes,
    },
    ownerUserId: userId,
    userQuery: content,
    embeddingApiKey: resolveEmbeddingApiKey(profile),
  });
  const { systemPrompt } = runtimeContext;
  const {
    canon: canonCount,
    memory: memoryCount,
    integrity: integrityCount,
    archive: archiveCount,
  } = runtimeContext.counts;

  // Resolve provider
  const stationModel = selectStationModel(req.user!.tier);
  const platformNvidiaKey = env.NVIDIA_AI_API_KEY?.trim() || undefined;
  const useStationAnthropic = profile?.ai_mode !== "byok" && !platformNvidiaKey && Boolean(env.ANTHROPIC_API_KEY);
  const platformRoute = describePlatformProviderRoute({ platformNvidiaKey });
  const providerRoute = useStationAnthropic ? "anthropic_platform" : platformRoute.label;
  const providerModel = useStationAnthropic
    ? stationModel.model
    : platformRoute.label === "nvidia_openai_compatible"
      ? env.NVIDIA_MODEL
      : env.DEEPSEEK_MODEL;
  const runtimeBudget = buildChatRuntimeBudgetReport({
    systemPrompt,
    userMessage: content,
    history,
    rawHistoryCount: rawHistoryRows.length,
    historyLimit,
    runtimeContext,
    providerRoute,
    modelTier: stationModel.modelTier,
    model: providerModel,
  });

  const traceStartedAt = Date.now();
  const trace = await startAiTrace({
    ownerUserId: userId,
    personaId,
    conversationId: convId,
    source: "conversation",
    metadata: {
      contextCounts: { canonCount, memoryCount, integrityCount, archiveCount },
      runtimeBudget,
    },
  });
  await recordAiTraceEvent({
    traceId: trace?.id,
    ownerUserId: userId,
    eventType: "tool_call",
    label: "Chat runtime budget assembled",
    status: "completed",
    provider: providerRoute,
    model: providerModel,
    inputTokens: runtimeBudget.totals.estimatedInputTokens,
    payload: { runtimeBudget },
  });

  if (!useStationAnthropic && platformRoute.label === "deepseek_fallback" && !env.DEEPSEEK_API_KEY?.trim()) {
    const missingConfig = chatError(
      503,
      "provider_config_missing",
      "provider_config",
      "No Station chat provider is configured for this request."
    );
    await recordAiTraceEvent({
      traceId: trace?.id,
      ownerUserId: userId,
      eventType: "error",
      label: "Persona chat provider configuration missing",
      status: "failed",
      provider: providerRoute,
      model: providerModel,
      durationMs: Date.now() - traceStartedAt,
      payload: { code: missingConfig.body.code, classification: missingConfig.body.classification },
    });
    await failAiTrace(trace?.id, new Error(missingConfig.body.error), Date.now() - traceStartedAt);
    return res.status(missingConfig.status).json(missingConfig.body);
  }

  const provider = useStationAnthropic
    ? new AnthropicProvider({ apiKey: env.ANTHROPIC_API_KEY, model: stationModel.model })
    : resolveProvider({
    provider: persona.provider as "platform" | "openai" | "anthropic" | "deepseek" | "gemini",
    aiMode: (profile?.ai_mode ?? "platform") as "platform" | "byok",
    byokOpenaiKey: profile?.byok_openai_key,
    byokAnthropicKey: profile?.byok_anthropic_key,
    byokDeepseekKey: profile?.byok_deepseek_key,
    platformDeepseekKey: env.DEEPSEEK_API_KEY,
    platformDeepseekBaseUrl: env.DEEPSEEK_BASE_URL,
    platformDeepseekModel: env.DEEPSEEK_MODEL,
    platformNvidiaKey,
    platformNvidiaBaseUrl: env.NVIDIA_MODEL_BASE_URL,
    platformNvidiaModel: env.NVIDIA_MODEL,
  });

  // Send to LLM
  const messages = [
    ...history,
    { role: "user" as const, content },
  ];

  try {
    await assertTokenBudgetForEstimate(userId, estimateConversationTokens({
      systemPrompt,
      userMessage: content,
      history,
    }));
  } catch (error) {
    const quota = tokenErrorResponse(error);
    if (quota) {
      await recordAiTraceEvent({
        traceId: trace?.id,
        ownerUserId: userId,
        eventType: "quota_check",
        label: "Persona chat token budget blocked",
        status: "failed",
        provider: providerRoute,
        model: providerModel,
        inputTokens: runtimeBudget.totals.estimatedInputTokens,
        durationMs: Date.now() - traceStartedAt,
        payload: { code: quota.body.code, classification: quota.body.classification },
      });
      await failAiTrace(trace?.id, error, Date.now() - traceStartedAt);
      return res.status(quota.status).json(quota.body);
    }
    throw error;
  }

  let aiResponse;
  let inputTokens = 0;
  let outputTokens = 0;
  try {
    aiResponse = await enqueueLlmCall(provider, {
      system: systemPrompt,
      messages,
      ...(useStationAnthropic ? { model: stationModel.model } : {}),
    });
    inputTokens = aiResponse.usage?.inputTokens ?? estimateConversationTokens({ systemPrompt, userMessage: content, history });
    outputTokens = aiResponse.usage?.outputTokens ?? estimateTokensFromText(aiResponse.content);
    const durationMs = Date.now() - traceStartedAt;

    await recordAiTraceEvent({
      traceId: trace?.id,
      ownerUserId: userId,
      eventType: "llm_call",
      label: "Persona chat response",
      status: "completed",
      provider: useStationAnthropic ? "anthropic" : persona.provider,
      model: aiResponse.model,
      inputTokens,
      outputTokens,
      durationMs,
      payload: { runtimeBudget },
    });
    await completeAiTrace({
      traceId: trace?.id,
      inputTokens,
      outputTokens,
      model: aiResponse.model,
      durationMs,
    });
    await recordLlmTokenUsage({
      userId,
      model: aiResponse.model,
      chatId: convId,
      inputTokens,
      outputTokens,
    });
  } catch (error) {
    await recordAiTraceEvent({
      traceId: trace?.id,
      ownerUserId: userId,
      eventType: "error",
      label: "Persona chat response failed",
      status: "failed",
      provider: useStationAnthropic ? "anthropic" : persona.provider,
      durationMs: Date.now() - traceStartedAt,
      payload: { message: error instanceof Error ? error.message : "Unknown error" },
    });
    await failAiTrace(trace?.id, error, Date.now() - traceStartedAt);
    const providerFailure = chatError(
      502,
      "provider_failure",
      "provider_failure",
      "Persona chat provider failed."
    );
    return res.status(providerFailure.status).json(providerFailure.body);
  }

  // Save assistant reply
  const { data: savedReply } = await sb
    .from("conversation_messages")
    .insert({
      conversation_id: convId,
      role: "assistant",
      content: aiResponse.content,
      provider_used: aiResponse.model,
    })
    .select("id, role, content, provider_used, created_at")
    .single();

  // Touch conversation updated_at
  await sb
    .from("conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", convId);

  const responsePayload: Record<string, unknown> = {
    conversationId: convId,
    reply: savedReply,
  };

  if (includeRuntimeDebug(req.query.debug, process.env.NODE_ENV, env.STATION_EXPOSE_AI_DEBUG)) {
    responsePayload._debug = {
      canonCount,
      memoryCount,
      integrityCount,
      archiveCount,
      provider: aiResponse.model,
      runtimeBudget,
    };
  }

  return res.json(responsePayload);
});

// -- Save last assistant message as memory -------------------------------------
conversationsRouter.post("/:conversationId/save-memory", async (req, res) => {
  const parsed = saveMemorySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const sb = getSupabaseAdmin();
  const userId = req.user!.id;

  const { data: conv } = await sb
    .from("conversations")
    .select("persona_id, owner_user_id")
    .eq("id", req.params.conversationId)
    .single();

  if (!conv || conv.owner_user_id !== userId) return res.status(403).json({ error: "Not authorised." });

  const { data: message } = await sb
    .from("conversation_messages")
    .select("content, role")
    .eq("id", parsed.data.messageId)
    .eq("conversation_id", req.params.conversationId)
    .single();

  if (!message || message.role !== "assistant") {
    return res.status(400).json({ error: "Message not found or not an assistant message." });
  }

  const item = await saveMessageAsMemory({
    conversationId: req.params.conversationId,
    personaId: conv.persona_id,
    ownerUserId: userId,
    content: message.content,
    relevanceWeight: parsed.data.relevanceWeight,
  });

  return res.status(201).json({ memoryItem: item });
});

// -- Save last assistant message as canon --------------------------------------
conversationsRouter.post("/:conversationId/save-canon", async (req, res) => {
  const parsed = saveCanonSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const sb = getSupabaseAdmin();
  const userId = req.user!.id;

  const { data: conv } = await sb
    .from("conversations")
    .select("persona_id, owner_user_id")
    .eq("id", req.params.conversationId)
    .single();

  if (!conv || conv.owner_user_id !== userId) return res.status(403).json({ error: "Not authorised." });

  const { data: message } = await sb
    .from("conversation_messages")
    .select("content, role")
    .eq("id", parsed.data.messageId)
    .eq("conversation_id", req.params.conversationId)
    .single();

  if (!message || message.role !== "assistant") {
    return res.status(400).json({ error: "Message not found or not an assistant message." });
  }

  const { data: canon, error } = await sb
    .from("canon_items")
    .insert({
      persona_id: conv.persona_id,
      owner_user_id: userId,
      title: parsed.data.title ?? "Saved from chat",
      content: message.content,
      source_type: "chat",
      priority: parsed.data.priority ?? 2,
    })
    .select("*")
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json({ canonItem: canon });
});

// -- Archive a conversation into transcript + continuity candidates ------------
conversationsRouter.post("/:conversationId/archive", async (req, res) => {
  const sb = getSupabaseAdmin();
  const userId = req.user!.id;

  const { data: conv, error } = await sb
    .from("conversations")
    .select("*")
    .eq("id", req.params.conversationId)
    .single();

  if (error || !conv) return res.status(404).json({ error: "Conversation not found." });
  if (conv.owner_user_id !== userId) return res.status(403).json({ error: "Not authorised." });

  const existingArchive = await loadArchiveBundle(sb, conv.id, userId);
  if (conv.status === "archived" && existingArchive) {
    return res.json({ conversation: conv, archive: existingArchive });
  }

  const { data: messages, error: messageError } = await sb
    .from("conversation_messages")
    .select("id, role, content, provider_used, created_at")
    .eq("conversation_id", conv.id)
    .order("created_at", { ascending: true });

  if (messageError) return res.status(500).json({ error: messageError.message });

  const messageRows = (messages ?? []) as ConversationMessageRow[];
  const messageCount = messageRows.filter((message) => message.role !== "system").length;
  if (messageCount === 0) return res.status(400).json({ error: "Cannot archive an empty conversation." });

  const transcriptMarkdown = buildTranscriptMarkdown(conv, messageRows);
  const sourceSummary = summarizeMessages(messageRows);
  const archivedAt = new Date().toISOString();

  const { data: transcript, error: transcriptError } = await sb
    .from("archived_chat_transcripts")
    .insert({
      conversation_id: conv.id,
      persona_id: conv.persona_id,
      owner_user_id: userId,
      title: conv.title ?? "Archived conversation",
      transcript_markdown: transcriptMarkdown,
      message_count: messageCount,
      source_summary: sourceSummary || null,
    })
    .select("*")
    .single();

  if (transcriptError || !transcript) {
    return res.status(500).json({ error: transcriptError?.message ?? "Could not archive conversation." });
  }

  let archiveChunksCreated = 0;
  try {
    archiveChunksCreated = await ingestTextIntoArchive({
      personaId: conv.persona_id,
      ownerUserId: userId,
      text: transcriptMarkdown,
      sourceName: transcript.title,
      sourceType: "chat",
      relevanceWeight: 1.4,
      archiveSource: {
        type: "archived_chat_transcript",
        id: transcript.id,
        name: transcript.title,
      },
    });
  } catch (err) {
    await sb
      .from("archived_chat_transcripts")
      .delete()
      .eq("id", transcript.id)
      .eq("owner_user_id", userId);

    const storageError = storageErrorResponse(err);
    if (storageError) return res.status(storageError.status).json(storageError.body);
    return res.status(500).json({ error: err instanceof Error ? err.message : "Could not index archived conversation." });
  }

  const candidateSeeds = generateContinuityCandidates(messageRows);
  let candidates: any[] = [];
  if (candidateSeeds.length > 0) {
    const { data: candidateRows, error: candidateError } = await sb
      .from("continuity_candidates")
      .insert(candidateSeeds.map((seed) => ({
        archived_chat_transcript_id: transcript.id,
        persona_id: conv.persona_id,
        owner_user_id: userId,
        candidate_type: seed.candidate_type,
        title: seed.title,
        content: seed.content,
        rationale: seed.rationale,
        source_message_ids: seed.source_message_ids,
      })))
      .select("*");

    if (candidateError) return res.status(500).json({ error: candidateError.message });
    candidates = candidateRows ?? [];
  }

  const { data: archivedConversation } = await sb
    .from("conversations")
    .update({
      status: "archived",
      archived_at: archivedAt,
      message_count: messageCount,
      updated_at: archivedAt,
    })
    .eq("id", conv.id)
    .eq("owner_user_id", userId)
    .select("*")
    .single();

  return res.status(201).json({
    conversation: archivedConversation ?? {
      ...conv,
      status: "archived",
      archived_at: archivedAt,
      message_count: messageCount,
    },
    archive: {
      transcript: transcriptRow(transcript),
      candidates: (candidates ?? []).map(candidateRow),
      retrieval: {
        chunksCreated: archiveChunksCreated,
      },
    },
  });
});

// -- Read archived transcript + candidates for a conversation ------------------
conversationsRouter.get("/:conversationId/archive", async (req, res) => {
  const sb = getSupabaseAdmin();
  const userId = req.user!.id;

  const { data: conv } = await sb
    .from("conversations")
    .select("id, owner_user_id")
    .eq("id", req.params.conversationId)
    .single();

  if (!conv) return res.status(404).json({ error: "Conversation not found." });
  if (conv.owner_user_id !== userId) return res.status(403).json({ error: "Not authorised." });

  const archive = await loadArchiveBundle(sb, conv.id, userId);
  if (!archive) return res.status(404).json({ error: "Archive not found." });
  return res.json({ archive });
});

// -- Accept/edit/reject generated continuity candidates ------------------------
conversationsRouter.patch("/candidates/:candidateId", async (req, res) => {
  const parsed = candidateReviewSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const sb = getSupabaseAdmin();
  const userId = req.user!.id;
  const { action } = parsed.data;

  const { data: candidate } = await sb
    .from("continuity_candidates")
    .select("*")
    .eq("id", req.params.candidateId)
    .eq("owner_user_id", userId)
    .single();

  if (!candidate) return res.status(404).json({ error: "Continuity candidate not found." });
  if (candidate.status !== "pending") {
    return res.status(409).json({ error: "This candidate has already been reviewed." });
  }

  if (action === "reject") {
    const { data: rejected, error } = await sb
      .from("continuity_candidates")
      .update({ status: "rejected" })
      .eq("id", candidate.id)
      .eq("owner_user_id", userId)
      .select("*")
      .single();

    if (error || !rejected) return res.status(500).json({ error: error?.message ?? "Could not reject candidate." });
    return res.json({ candidate: candidateRow(rejected) });
  }

  const title = parsed.data.title?.trim() || candidate.title || "Accepted from archived chat";
  const content = parsed.data.content?.trim() || candidate.content;
  const acceptedAt = new Date().toISOString();
  const candidateSource = candidateSourceRef(candidate);

  let target: any;
  if (candidate.candidate_type === "memory") {
    try {
      target = await addMemoryItem({
        personaId: candidate.persona_id,
        ownerUserId: userId,
        title,
        content,
        summary: content.slice(0, 300),
        sourceType: candidateSource.sourceType,
        relevanceWeight: parsed.data.relevanceWeight ?? 1.5,
        archiveSource: candidateSource.archiveSource,
      });
    } catch (error) {
      return res.status(500).json({
        error: error instanceof Error ? error.message : "Could not accept memory candidate.",
      });
    }
    if (candidateSource.sourceType === "import") {
      await updateMemoryLifecycle({
        memoryItemId: target.id,
        ownerUserId: userId,
        status: "active",
        trustLevel: "user_stated",
        confidence: 1,
        evidence: [{
          sourceTable: candidate.source_table,
          sourceId: candidate.source_id,
          sourceLabel: candidate.source_label,
          candidateId: candidate.id,
        }],
      }).catch(() => undefined);
    }
  } else {
    const { data: canon, error } = await sb
      .from("canon_items")
      .insert({
        persona_id: candidate.persona_id,
        owner_user_id: userId,
        title,
        content,
        source_type: candidateSource.sourceType,
        priority: parsed.data.priority ?? 3,
      })
      .select("*")
      .single();

    if (error || !canon) return res.status(500).json({ error: error?.message ?? "Could not accept canon candidate." });
    target = canon;
  }

  const { data: accepted, error } = await sb
    .from("continuity_candidates")
    .update({
      status: "accepted",
      title,
      content,
      accepted_target_type: candidate.candidate_type,
      accepted_target_id: target.id,
      accepted_at: acceptedAt,
    })
    .eq("id", candidate.id)
    .eq("owner_user_id", userId)
    .select("*")
    .single();

  if (error || !accepted) return res.status(500).json({ error: error?.message ?? "Could not update candidate." });
  return res.json({
    candidate: candidateRow(accepted),
    target,
  });
});

function candidateSourceRef(candidate: any) {
  if (candidate.source_table === "persona_files" && candidate.source_id) {
    return {
      sourceType: "import" as const,
      archiveSource: {
        type: "persona_file" as const,
        id: candidate.source_id,
        name: candidate.source_label ?? candidate.title ?? "Imported conversation",
      },
    };
  }

  return {
    sourceType: "chat" as const,
    archiveSource: {
      type: "archived_chat_transcript" as const,
      id: candidate.archived_chat_transcript_id,
      name: candidate.title,
    },
  };
}

// -- Delete a conversation -----------------------------------------------------
conversationsRouter.delete("/:conversationId", async (req, res) => {
  const sb = getSupabaseAdmin();
  const userId = req.user!.id;

  const { error } = await sb
    .from("conversations")
    .delete()
    .eq("id", req.params.conversationId)
    .eq("owner_user_id", userId);

  if (error) return res.status(500).json({ error: error.message });
  return res.status(204).send();
});
