export type AiTraceStatus = "running" | "completed" | "failed" | "skipped";

export type AiTraceLike = {
  source: string;
  status: AiTraceStatus | string;
  duration_ms?: number | null;
  total_input_tokens?: number | null;
  total_output_tokens?: number | null;
  total_estimated_cost_pence?: number | null;
  error_message?: string | null;
  metadata?: Record<string, unknown> | null;
};

export type AiTraceDetail = {
  trace: AiTraceDetailTrace;
  events: AiTraceDetailEvent[];
};

export type AiTraceDetailTrace = {
  id: string;
  source: string;
  status: AiTraceStatus | string;
  startedAt: string | null;
  completedAt: string | null;
  durationMs: number | null;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCostPence: number;
  failureReason: string | null;
  metadata?: Record<string, unknown> | null;
};

export type AiTraceDetailEvent = {
  eventType: string;
  label: string | null;
  status: AiTraceStatus | string;
  provider: string | null;
  model: string | null;
  createdAt: string | null;
  durationMs: number | null;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCostPence: number;
  failureReason: string | null;
  metadata?: Record<string, unknown> | null;
};

export function sourceLabel(source: string) {
  return source.replace(/_/g, " ");
}

export function statusTone(status: AiTraceStatus | string) {
  if (status === "failed") return "#fca5a5";
  if (status === "running") return "#facc15";
  if (status === "skipped") return "#93c5fd";
  return "#86efac";
}

export function formatTokens(tokens: number) {
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(tokens >= 10_000_000 ? 0 : 1)}M`;
  if (tokens >= 1_000) return `${Math.round(tokens / 1_000)}K`;
  return tokens.toLocaleString();
}

export function formatPence(pence: number) {
  if (pence < 1) return `${pence.toFixed(2)}p`;
  return `GBP ${(pence / 100).toFixed(2)}`;
}

export function formatDuration(ms: number) {
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
  return `${ms}ms`;
}

export function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function sanitizedFailureMessage(message?: string | null) {
  if (!message) return null;
  const normalized = message
    .replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/gi, "[id]")
    .replace(/https?:\/\/\S+/gi, "[redacted-url]")
    .replace(SECRET_SHAPED_VALUE_PATTERN, "[redacted-secret]")
    .replace(/\b(?:bearer)\s+\S+/gi, "bearer [redacted]")
    .replace(/\b(?:raw|private|system|user)[_-]?prompt\b\s*[:=]?.*/gi, "[redacted-prompt]")
    .replace(/\b(owner[_-]?user[_-]?id|owner[_-]?id|persona[_-]?id|conversation[_-]?id|trace[_-]?id|event[_-]?id|source[_-]?id)\b\s*[:=]\s*\S+/gi, "$1=[redacted]")
    .replace(/\b(token|cookie|authorization|api[_-]?key|x-api-key|secret|password|db[_-]?url|webhook[_-]?secret)\b\s*[:=]\s*\S+/gi, "$1=[redacted]");

  return normalized.length > 140 ? `${normalized.slice(0, 137).trim()}...` : normalized;
}

export function traceTokenTotal(trace: AiTraceLike) {
  return (trace.total_input_tokens ?? 0) + (trace.total_output_tokens ?? 0);
}

export function traceOperationalFacts(trace: AiTraceLike) {
  const facts = [
    `Source ${sourceLabel(trace.source)}`,
    `Status ${trace.status}`,
    trace.duration_ms ? `Duration ${formatDuration(trace.duration_ms)}` : null,
    `Tokens ${formatTokens(traceTokenTotal(trace))}`,
    `Cost ${formatPence(Number(trace.total_estimated_cost_pence ?? 0))}`,
    ...metadataFacts(trace.metadata),
  ];
  const failure = sanitizedFailureMessage(trace.error_message);
  if (failure) facts.push(`Failure ${failure}`);
  return facts.filter((fact): fact is string => Boolean(fact));
}

export function traceDetailOperationalFacts(trace: AiTraceDetailTrace) {
  const facts = [
    `Source ${safeDisplayLabel(trace.source) ?? "system"}`,
    `Status ${safeDisplayLabel(trace.status) ?? "unknown"}`,
    trace.durationMs ? `Duration ${formatDuration(trace.durationMs)}` : null,
    `Tokens ${formatTokens(trace.totalTokens)}`,
    `Cost ${formatPence(Number(trace.estimatedCostPence ?? 0))}`,
    ...metadataFacts(trace.metadata),
  ];
  const failure = sanitizedFailureMessage(trace.failureReason);
  if (failure) facts.push(`Failure ${failure}`);
  return facts.filter((fact): fact is string => Boolean(fact));
}

export function traceEventTitle(event: AiTraceDetailEvent) {
  const label = safeDisplayValue(event.label);
  return label ?? safeDisplayLabel(event.eventType) ?? "Event";
}

export function traceEventOperationalFacts(event: AiTraceDetailEvent) {
  const facts = [
    `Type ${safeDisplayLabel(event.eventType) ?? "event"}`,
    `Status ${safeDisplayLabel(event.status) ?? "unknown"}`,
    event.provider ? labelValue("Provider", event.provider) : null,
    event.model ? labelValue("Model", event.model) : null,
    event.durationMs ? `Duration ${formatDuration(event.durationMs)}` : null,
    `Tokens ${formatTokens(event.totalTokens)}`,
    `Cost ${formatPence(Number(event.estimatedCostPence ?? 0))}`,
    ...metadataFacts(event.metadata),
  ];
  const failure = sanitizedFailureMessage(event.failureReason);
  if (failure) facts.push(`Failure ${failure}`);
  return facts.filter((fact): fact is string => Boolean(fact));
}

export function metadataFacts(metadata?: Record<string, unknown> | null) {
  if (!metadata) return [];

  const runtimeBudget = asRecord(metadata.runtimeBudget);
  const budgetProvider = asRecord(runtimeBudget?.provider);
  const embedding = asRecord(metadata.embedding);
  const candidates = [
    labelValue("Route", metadata.providerRoute ?? metadata.route ?? budgetProvider?.route),
    labelValue("Profile", metadata.providerProfile ?? metadata.profile ?? metadata.profileCode ?? embedding?.profileCode),
    labelValue("Provider", metadata.provider ?? embedding?.provider),
    labelValue("Model", metadata.model ?? budgetProvider?.model),
    labelValue("Model tier", metadata.modelTier ?? runtimeBudget?.modelTier),
    labelValue("Policy", metadata.providerPolicy),
    labelValue("Posture", metadata.providerPosture),
    labelValue("Domain", metadata.domain),
  ];

  return candidates.filter((fact): fact is string => Boolean(fact));
}

function labelValue(label: string, value: unknown) {
  const safe = safeMetadataValue(value);
  return safe ? `${label} ${safe}` : null;
}

function safeMetadataValue(value: unknown) {
  if (typeof value !== "string" && typeof value !== "number" && typeof value !== "boolean") return null;
  const text = String(value).trim();
  if (!text) return null;
  if (/https?:\/\//i.test(text)) return null;
  if (SECRET_SHAPED_VALUE_PATTERN.test(text)) {
    SECRET_SHAPED_VALUE_PATTERN.lastIndex = 0;
    return null;
  }
  SECRET_SHAPED_VALUE_PATTERN.lastIndex = 0;
  if (/(token|cookie|authorization|api[_-]?key|secret|password|owner[_-]?user|persona[_-]?id|trace[_-]?id)/i.test(text)) return null;
  return text.length > 64 ? `${text.slice(0, 61).trim()}...` : text;
}

function safeDisplayValue(value: unknown) {
  const safe = sanitizedFailureMessage(typeof value === "string" ? value : null);
  if (!safe) return null;
  return safe.length > 80 ? `${safe.slice(0, 77).trim()}...` : safe;
}

function safeDisplayLabel(value: unknown) {
  const safe = safeDisplayValue(value);
  return safe ? sourceLabel(safe) : null;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

const SECRET_SHAPED_VALUE_PATTERN = /\b(?:sk|pk|rk|whsec|ghp|pat)[_-][A-Za-z0-9._-]+/gi;
