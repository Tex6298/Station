import type { PersonaHandoff, PersonaLifecycleEvent, PersonaLifecycleEventType } from "@station/types/persona";

const EVENT_LABELS: Record<PersonaLifecycleEventType, string> = {
  created: "Persona created",
  wake: "Wake event",
  handoff_in: "Handoff received",
  handoff_out: "Handoff sent",
  forked: "Persona forked",
  integrity_check: "Integrity check",
  layer_update: "Layer update",
  memory_graph_update: "Memory update",
};

const HANDOFF_STATUS_LABELS: Record<PersonaHandoff["status"], string> = {
  ready: "Ready",
  consumed: "Consumed",
  archived: "Archived",
};

export function lifecycleEventTypeLabel(type: PersonaLifecycleEventType) {
  return EVENT_LABELS[type] ?? labelize(type);
}

export function lifecycleEventReadback(event: PersonaLifecycleEvent) {
  return {
    label: lifecycleEventTypeLabel(event.eventType),
    detail: safePreviewText(event.eventLabel, "Owner lifecycle event recorded."),
  };
}

export function handoffStatusLabel(status: PersonaHandoff["status"]) {
  return HANDOFF_STATUS_LABELS[status] ?? labelize(status);
}

export function handoffSummaryPreview(handoff: Pick<PersonaHandoff, "summary">, maxLength = 140) {
  const sanitized = safePreviewText(handoff.summary, "No handoff summary was saved.");
  return sanitized.length > maxLength ? `${sanitized.slice(0, maxLength - 3).trim()}...` : sanitized;
}

export function handoffFreshnessCopy(count: number) {
  if (count === 0) return "No handoffs have been saved for this persona yet.";
  if (count === 1) return "1 recent handoff is ready for continuity review.";
  return `${count} recent handoffs are ready for continuity review.`;
}

export function memoryGraphReadback(nodes: number, edges: number) {
  if (nodes === 0) return "No memory graph nodes yet.";
  if (edges === 0) return `${nodes} memory node${nodes === 1 ? "" : "s"} with no graph edges yet.`;
  return `${nodes} memory node${nodes === 1 ? "" : "s"} connected by ${edges} edge${edges === 1 ? "" : "s"}.`;
}

function safePreviewText(value: string | null | undefined, fallback: string) {
  if (!value?.trim()) return fallback;
  const lines = value.split(/\r?\n/);
  let removedTranscriptLines = 0;
  const withoutTranscriptLines = lines.filter((line) => {
    const isTranscriptLine = /^\s*(?:user|assistant|system|developer|tool)\s*:/i.test(line);
    if (isTranscriptLine) removedTranscriptLines += 1;
    return !isTranscriptLine;
  });
  const sanitized = withoutTranscriptLines
    .join(" ")
    .replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/gi, "[id]")
    .replace(/https?:\/\/\S+/gi, "[redacted-url]")
    .replace(SECRET_SHAPED_VALUE_PATTERN, "[redacted-secret]")
    .replace(/\b(?:bearer)\s+\S+/gi, "bearer [redacted]")
    .replace(/\b(token|cookie|authorization|api[_-]?key|x-api-key|secret|password)\b\s*[:=]\s*\S+/gi, "$1=[redacted]")
    .replace(/\s+/g, " ")
    .trim();

  if (sanitized) {
    return removedTranscriptLines > 0 ? `${sanitized} [conversation turns hidden]` : sanitized;
  }

  return removedTranscriptLines > 0
    ? "Conversation handoff saved; transcript turns hidden."
    : fallback;
}

function labelize(value: string) {
  return value.replace(/_/g, " ").replace(/^./, (letter) => letter.toUpperCase());
}

const SECRET_SHAPED_VALUE_PATTERN = /\b(?:sk|pk|rk|whsec|ghp|pat)[_-][A-Za-z0-9._-]+/gi;
