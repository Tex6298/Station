import { getSupabaseAdmin } from "../lib/supabase";

export type AiTraceSource = "conversation" | "integrity_session" | "continuity" | "system" | "topup";
export type AiTraceEventType = "llm_call" | "tool_call" | "integrity_turn" | "quota_check" | "error" | "output_write";
export type AiTraceStatus = "running" | "completed" | "failed" | "skipped";

type JsonRecord = Record<string, unknown>;

export type AiTrace = {
  id: string;
};

type StartTraceInput = {
  ownerUserId: string;
  source: AiTraceSource;
  personaId?: string | null;
  conversationId?: string | null;
  metadata?: JsonRecord;
};

type RecordEventInput = {
  traceId?: string | null;
  ownerUserId: string;
  eventType: AiTraceEventType;
  label: string;
  status?: AiTraceStatus;
  provider?: string | null;
  model?: string | null;
  inputTokens?: number | null;
  outputTokens?: number | null;
  durationMs?: number | null;
  payload?: JsonRecord;
};

type CompleteTraceInput = {
  traceId?: string | null;
  inputTokens?: number | null;
  outputTokens?: number | null;
  model?: string | null;
  durationMs?: number | null;
};

export async function startAiTrace(input: StartTraceInput): Promise<AiTrace | null> {
  try {
    const sb = getSupabaseAdmin();
    const { data, error } = await (sb as any)
      .from("ai_trace_sessions")
      .insert({
        owner_user_id: input.ownerUserId,
        persona_id: input.personaId ?? null,
        conversation_id: input.conversationId ?? null,
        source: input.source,
        metadata: input.metadata ?? {},
      })
      .select("id")
      .single();

    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

export async function recordAiTraceEvent(input: RecordEventInput) {
  if (!input.traceId) return;

  const inputTokens = safeTokenCount(input.inputTokens);
  const outputTokens = safeTokenCount(input.outputTokens);
  const model = input.model ?? null;

  try {
    const sb = getSupabaseAdmin();
    await (sb as any)
      .from("ai_trace_events")
      .insert({
        trace_id: input.traceId,
        owner_user_id: input.ownerUserId,
        event_type: input.eventType,
        label: input.label,
        status: input.status ?? "completed",
        provider: input.provider ?? null,
        model,
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        estimated_cost_pence: estimateModelCostPence(model, inputTokens, outputTokens),
        duration_ms: input.durationMs ?? null,
        payload: input.payload ?? {},
      });
  } catch {
    // Observability should never block a user-facing AI operation.
  }
}

export async function completeAiTrace(input: CompleteTraceInput) {
  if (!input.traceId) return;

  const inputTokens = safeTokenCount(input.inputTokens);
  const outputTokens = safeTokenCount(input.outputTokens);

  try {
    const sb = getSupabaseAdmin();
    await (sb as any)
      .from("ai_trace_sessions")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        duration_ms: input.durationMs ?? null,
        total_input_tokens: inputTokens,
        total_output_tokens: outputTokens,
        total_estimated_cost_pence: estimateModelCostPence(input.model ?? null, inputTokens, outputTokens),
      })
      .eq("id", input.traceId);
  } catch {
    // Observability should never block a user-facing AI operation.
  }
}

export async function failAiTrace(traceId: string | null | undefined, error: unknown, durationMs?: number) {
  if (!traceId) return;

  try {
    const sb = getSupabaseAdmin();
    await (sb as any)
      .from("ai_trace_sessions")
      .update({
        status: "failed",
        completed_at: new Date().toISOString(),
        duration_ms: durationMs ?? null,
        error_message: error instanceof Error ? error.message : "AI operation failed.",
      })
      .eq("id", traceId);
  } catch {
    // Observability should never block a user-facing AI operation.
  }
}

export async function getAiTraceSummary(ownerUserId: string) {
  const sb = getSupabaseAdmin();
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await (sb as any)
    .from("ai_trace_sessions")
    .select("status, duration_ms, total_input_tokens, total_output_tokens, total_estimated_cost_pence, started_at")
    .eq("owner_user_id", ownerUserId)
    .gte("started_at", since);

  if (error) throw new Error(error.message);

  const traces = data ?? [];
  const totalTokens = traces.reduce((sum: number, trace: any) => sum + (trace.total_input_tokens ?? 0) + (trace.total_output_tokens ?? 0), 0);
  const totalCostPence = traces.reduce((sum: number, trace: any) => sum + Number(trace.total_estimated_cost_pence ?? 0), 0);
  const completedDurations = traces
    .map((trace: any) => trace.duration_ms)
    .filter((duration: unknown): duration is number => typeof duration === "number" && Number.isFinite(duration));
  const failedTraceCount = traces.filter((trace: any) => trace.status === "failed").length;

  return {
    windowDays: 7,
    traceCount: traces.length,
    failedTraceCount,
    totalTokens,
    totalEstimatedCostPence: roundPence(totalCostPence),
    averageLatencyMs: completedDurations.length
      ? Math.round(completedDurations.reduce((sum: number, duration: number) => sum + duration, 0) / completedDurations.length)
      : 0,
  };
}

export async function listAiTraces(ownerUserId: string, limit = 12) {
  const sb = getSupabaseAdmin();
  const { data, error } = await (sb as any)
    .from("ai_trace_sessions")
    .select("id, source, status, started_at, completed_at, duration_ms, total_input_tokens, total_output_tokens, total_estimated_cost_pence, error_message, metadata")
    .eq("owner_user_id", ownerUserId)
    .order("started_at", { ascending: false })
    .limit(Math.min(Math.max(limit, 1), 50));

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getAiTraceDetail(ownerUserId: string, traceId: string) {
  const sb = getSupabaseAdmin();
  const { data: trace, error } = await (sb as any)
    .from("ai_trace_sessions")
    .select("id, source, status, started_at, completed_at, duration_ms, total_input_tokens, total_output_tokens, total_estimated_cost_pence, error_message, metadata")
    .eq("id", traceId)
    .eq("owner_user_id", ownerUserId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!trace) return null;

  const { data: events, error: eventsError } = await (sb as any)
    .from("ai_trace_events")
    .select("event_type, label, status, provider, model, input_tokens, output_tokens, estimated_cost_pence, duration_ms, created_at, payload")
    .eq("trace_id", traceId)
    .eq("owner_user_id", ownerUserId)
    .order("created_at", { ascending: true });

  if (eventsError) throw new Error(eventsError.message);
  return {
    trace: serializeAiTraceDetail(trace),
    events: (events ?? []).map(serializeAiTraceEventDetail),
  };
}

function serializeAiTraceDetail(trace: any) {
  const inputTokens = safeTokenCount(trace.total_input_tokens);
  const outputTokens = safeTokenCount(trace.total_output_tokens);

  return {
    id: trace.id,
    source: safeLabel(trace.source) ?? "system",
    status: safeLabel(trace.status) ?? "running",
    startedAt: trace.started_at ?? null,
    completedAt: trace.completed_at ?? null,
    durationMs: safeNumber(trace.duration_ms),
    inputTokens,
    outputTokens,
    totalTokens: inputTokens + outputTokens,
    estimatedCostPence: safeCost(trace.total_estimated_cost_pence),
    failureReason: sanitizeTraceText(trace.error_message),
    metadata: sanitizeTraceMetadata(trace.metadata),
  };
}

function serializeAiTraceEventDetail(event: any) {
  const inputTokens = safeTokenCount(event.input_tokens);
  const outputTokens = safeTokenCount(event.output_tokens);
  const payload = asRecord(event.payload);

  return {
    eventType: safeLabel(event.event_type) ?? "event",
    label: sanitizeTraceText(event.label),
    status: safeLabel(event.status) ?? "completed",
    provider: sanitizeTraceText(event.provider),
    model: sanitizeTraceText(event.model),
    createdAt: event.created_at ?? null,
    durationMs: safeNumber(event.duration_ms),
    inputTokens,
    outputTokens,
    totalTokens: inputTokens + outputTokens,
    estimatedCostPence: safeCost(event.estimated_cost_pence),
    failureReason: sanitizeTraceText(payload?.failureReason ?? payload?.error ?? payload?.message),
    metadata: sanitizeTraceMetadata(payload),
  };
}

function sanitizeTraceMetadata(value: unknown) {
  const metadata = asRecord(value);
  if (!metadata) return {};

  const runtimeBudget = asRecord(metadata.runtimeBudget);
  const budgetProvider = asRecord(runtimeBudget?.provider);
  const embedding = asRecord(metadata.embedding);
  const answerContract = sanitizeAnswerContractMetadata(metadata.answerContract);
  const firstAnswerContract = sanitizeAnswerContractMetadata(metadata.firstAnswerContract);
  const retry = sanitizeAnswerContractRetryMetadata(metadata.retry);
  const candidates: Array<[string, unknown]> = [
    ["route", metadata.providerRoute ?? budgetProvider?.route],
    ["profile", metadata.providerProfile ?? metadata.profileCode ?? embedding?.profileCode],
    ["provider", metadata.provider ?? embedding?.provider],
    ["model", metadata.model ?? budgetProvider?.model],
    ["modelTier", metadata.modelTier ?? runtimeBudget?.modelTier],
    ["providerPolicy", metadata.providerPolicy],
    ["providerPosture", metadata.providerPosture],
    ["domain", metadata.domain],
  ];

  return {
    ...Object.fromEntries(
    candidates
      .map(([key, candidate]) => [key, safeMetadataValue(candidate)] as const)
      .filter((entry): entry is readonly [string, string | number | boolean] => entry[1] !== null)
    ),
    ...(answerContract ? { answerContract } : {}),
    ...(firstAnswerContract ? { firstAnswerContract } : {}),
    ...(retry ? { retry } : {}),
  };
}

function sanitizeAnswerContractMetadata(value: unknown) {
  const metadata = asRecord(value);
  if (!metadata) return null;

  const reasonCode = safeAnswerContractReasonCode(metadata.reasonCode);
  return {
    schema: metadata.schema === "station.selected_context_answer_contract.v1"
      ? "station.selected_context_answer_contract.v1"
      : "unknown",
    privatePersona: safeBoolean(metadata.privatePersona),
    directFactual: safeBoolean(metadata.directFactual),
    applicable: safeBoolean(metadata.applicable),
    selectedItemCount: safeNonNegativeInteger(metadata.selectedItemCount),
    selectedLabelCount: safeNonNegativeInteger(metadata.selectedLabelCount),
    selectedFactCount: safeNonNegativeInteger(metadata.selectedFactCount),
    matchedItemCount: safeNonNegativeInteger(metadata.matchedItemCount),
    matchedLabelCount: safeNonNegativeInteger(metadata.matchedLabelCount),
    matchedFactCount: safeNonNegativeInteger(metadata.matchedFactCount),
    reasonCode: reasonCode ?? "unknown",
    retryRecommended: safeBoolean(metadata.retryRecommended),
  };
}

function sanitizeAnswerContractRetryMetadata(value: unknown) {
  const metadata = asRecord(value);
  if (!metadata) return null;

  return {
    attempted: safeBoolean(metadata.attempted),
    failed: safeBoolean(metadata.failed),
    maxAttempts: safeNonNegativeInteger(metadata.maxAttempts),
    ...(safeAnswerContractReasonCode(metadata.reasonCode)
      ? { reasonCode: safeAnswerContractReasonCode(metadata.reasonCode) }
      : {}),
  };
}

function safeAnswerContractReasonCode(value: unknown) {
  if (typeof value !== "string") return null;
  return [
    "not_private_persona",
    "not_direct_factual",
    "no_selected_focus",
    "fulfilled",
    "missed_all_selected_focus",
    "missed_selected_labels",
    "missed_supporting_facts",
  ].includes(value)
    ? value
    : null;
}

function safeBoolean(value: unknown) {
  return value === true;
}

function safeNonNegativeInteger(value: unknown) {
  const numberValue = typeof value === "number" ? value : Number(value ?? 0);
  return Number.isInteger(numberValue) && numberValue >= 0 ? numberValue : 0;
}

function safeMetadataValue(value: unknown): string | number | boolean | null {
  if (typeof value !== "string" && typeof value !== "number" && typeof value !== "boolean") return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "boolean") return value;

  const text = value.trim();
  if (!text) return null;
  if (UNSAFE_TRACE_TEXT_PATTERN.test(text)) {
    UNSAFE_TRACE_TEXT_PATTERN.lastIndex = 0;
    return null;
  }
  UNSAFE_TRACE_TEXT_PATTERN.lastIndex = 0;
  if (PRIVATE_ID_KEY_PATTERN.test(text)) return null;
  return text.length > 80 ? `${text.slice(0, 77).trim()}...` : text;
}

function sanitizeTraceText(value: unknown) {
  if (typeof value !== "string" && typeof value !== "number" && typeof value !== "boolean") return null;
  let text = String(value).trim();
  if (!text) return null;
  text = text
    .replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/gi, "[id]")
    .replace(/https?:\/\/\S+/gi, "[redacted-url]")
    .replace(SECRET_SHAPED_VALUE_PATTERN, "[redacted-secret]")
    .replace(/\b(?:bearer)\s+\S+/gi, "bearer [redacted]")
    .replace(/\b(?:raw|private|system|user)[_-]?prompt\b\s*[:=]?.*/gi, "[redacted-prompt]")
    .replace(/\b(owner[_-]?user[_-]?id|owner[_-]?id|persona[_-]?id|conversation[_-]?id|trace[_-]?id|event[_-]?id|source[_-]?id)\b\s*[:=]\s*\S+/gi, "$1=[redacted]")
    .replace(/\b(api[_-]?key|x-api-key|secret|password)\b\s*[:=]\s*[^,;]*/gi, "$1=[redacted-secret]")
    .replace(/\b(token|cookie|authorization|db[_-]?url|webhook[_-]?secret)\b\s*[:=]\s*\S+/gi, "$1=[redacted]");
  return text.length > 160 ? `${text.slice(0, 157).trim()}...` : text;
}

function safeLabel(value: unknown) {
  const text = sanitizeTraceText(value);
  if (!text) return null;
  return text.replace(/[^\w.-]/g, "_").slice(0, 80);
}

function safeNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function safeCost(value: unknown) {
  const numberValue = typeof value === "number" ? value : Number(value ?? 0);
  return Number.isFinite(numberValue) ? roundPence(numberValue) : 0;
}

function asRecord(value: unknown): JsonRecord | null {
  return value && typeof value === "object" && !Array.isArray(value) ? value as JsonRecord : null;
}

export function estimateModelCostPence(model: string | null | undefined, inputTokens: number, outputTokens: number) {
  const key = (model ?? "").toLowerCase();
  const pricing = key.includes("sonnet")
    ? { inputPerMillionPence: 240, outputPerMillionPence: 1200 }
    : key.includes("haiku")
      ? { inputPerMillionPence: 64, outputPerMillionPence: 320 }
      : key.includes("deepseek")
        ? { inputPerMillionPence: 22, outputPerMillionPence: 88 }
        : { inputPerMillionPence: 100, outputPerMillionPence: 400 };

  return roundPence(
    (inputTokens / 1_000_000) * pricing.inputPerMillionPence
    + (outputTokens / 1_000_000) * pricing.outputPerMillionPence
  );
}

function safeTokenCount(value: number | null | undefined) {
  return Math.ceil(Math.max(0, value ?? 0));
}

function roundPence(value: number) {
  return Math.round(value * 10_000) / 10_000;
}

const SECRET_SHAPED_VALUE_PATTERN = /\b(?:sk|pk|rk|whsec|ghp|pat)[_-][A-Za-z0-9._-]+/gi;
const PRIVATE_ID_KEY_PATTERN = /(owner[_-]?user|owner[_-]?id|persona[_-]?id|conversation[_-]?id|trace[_-]?id|event[_-]?id|source[_-]?id)/i;
const UNSAFE_TRACE_TEXT_PATTERN = /https?:\/\/|\b(?:bearer)\s+\S+|\b(?:raw|private|system|user)[_-]?prompt\b|\b(?:token|cookie|authorization|api[_-]?key|x-api-key|secret|password|db[_-]?url|webhook[_-]?secret)\b|(?:sk|pk|rk|whsec|ghp|pat)[_-][A-Za-z0-9._-]+/gi;
