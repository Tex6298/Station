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
    .select("*")
    .eq("id", traceId)
    .eq("owner_user_id", ownerUserId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!trace) return null;

  const { data: events, error: eventsError } = await (sb as any)
    .from("ai_trace_events")
    .select("*")
    .eq("trace_id", traceId)
    .eq("owner_user_id", ownerUserId)
    .order("created_at", { ascending: true });

  if (eventsError) throw new Error(eventsError.message);
  return { trace, events: events ?? [] };
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
