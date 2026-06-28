import type { ContinuityRecord, ContinuityRecordType } from "@station/types/continuity";

export interface ContinuityDocumentLink {
  id: string;
  title: string;
  status: string;
  visibility: string;
  source_label?: string | null;
  updated_at?: string | null;
  created_at?: string | null;
}

export interface ContinuityConversationLink {
  id: string;
  title?: string | null;
  status?: "active" | "archived";
  message_count?: number;
  updated_at?: string | null;
  created_at?: string | null;
}

export interface ContinuitySourceOption {
  key: string;
  label: string;
  table: "documents" | "conversations";
  id: string;
  recordType: ContinuityRecordType;
  sourceLabel: string;
  sourceVersion: number;
}

export type RuntimeContextSourceType = "canon" | "integrity" | "continuity" | "memory" | "archive";

export interface RuntimeContextSourceLike {
  id: string;
  type: RuntimeContextSourceType;
  title: string | null;
  content?: string | null;
  priority?: number;
  reason: string;
  sourceType?: string | null;
  createdAt?: string | null;
}

export interface RuntimeContextPreviewLike {
  systemPrompt?: string;
  counts: Partial<Record<RuntimeContextSourceType, number>>;
  sources: RuntimeContextSourceLike[];
}

export interface RuntimeProvenanceReadbackRow {
  type: RuntimeContextSourceType;
  title: string;
  reason: string;
  sourceLabel: string;
  reviewTarget: string;
}

export interface RuntimeProvenanceReadbackGroup {
  type: RuntimeContextSourceType;
  label: string;
  count: number;
  empty: string;
  reviewTarget: string;
  rows: RuntimeProvenanceReadbackRow[];
}

export interface ContinuityReviewSignalRow {
  id: string;
  typeLabel: string;
  changed: string;
  why: string;
  support: string;
  reviewState: string;
  reviewTarget: string;
  timestamp: string;
}

const PERSONA_STUDIO_REVIEW_ROUTES: Record<string, string> = {
  "review in memory": "memory",
  "review in canon": "canon",
  "review integrity session": "calibration",
  "review in archive": "files",
  "review continuity record": "continuity",
  "review continuity candidate": "continuity",
};

const TYPE_LABELS: Record<ContinuityRecordType, string> = {
  memory: "Memory",
  canon: "Canon",
  integrity: "Integrity",
  archive_file: "Archive file",
  archive_import: "Archive import",
  archived_chat: "Archived chat",
  candidate: "Candidate",
  publication: "Publication",
  timeline: "Continuity marker",
};

export function continuityRecordTypeLabel(type: ContinuityRecordType) {
  return TYPE_LABELS[type] ?? "Continuity";
}

export function continuityRecordText(record: ContinuityRecord) {
  return record.summary || record.body || record.title || record.source?.label || record.sourceLabel || "Continuity marker";
}

export function continuityRecordTimestamp(record: ContinuityRecord) {
  return record.occurredAt || record.createdAt;
}

export function continuityRecordVisibilityLabel(visibility: string) {
  if (visibility === "private") return "Private";
  if (visibility === "community") return "Community";
  if (visibility === "public") return "Public";
  return labelize(visibility);
}

export function continuitySourceTableLabel(table?: string | null) {
  if (!table) return "No linked source";
  if (table === "documents") return "Document";
  if (table === "conversations") return "Conversation";
  if (table === "continuity_records") return "Continuity record";
  if (table === "archived_chat_transcripts") return "Archived chat";
  if (table === "memory_items") return "Memory";
  if (table === "canon_items") return "Canon";
  if (table === "integrity_sessions") return "Integrity Session";
  return labelize(table);
}

export function continuityRecordProvenanceLabels(record: ContinuityRecord) {
  const source = record.source;
  const sourceTable = source?.table ?? record.sourceTable;
  const sourceLabel = sanitizeContinuityLabel(source?.label ?? record.sourceLabel);
  const labels = [
    continuityRecordTypeLabel(record.recordType),
    continuityRecordVisibilityLabel(record.visibility),
    sourceLabel
      ? `${continuitySourceTableLabel(sourceTable)}: ${sourceLabel}`
      : continuitySourceTableLabel(sourceTable),
    `Source v${source?.version ?? record.sourceVersion ?? 1}`,
    `Record v${record.version ?? 1}`,
    `Created ${formatCompactDate(record.createdAt)}`,
  ];
  const occurred = record.occurredAt ? `Occurred ${formatCompactDate(record.occurredAt)}` : null;
  return [...labels, occurred].filter((label): label is string => Boolean(label));
}

export function continuityRecordSupportLabel(record: ContinuityRecord) {
  const source = record.source;
  const sourceTable = source?.table ?? record.sourceTable;
  const sourceLabel = sanitizeContinuityLabel(source?.label ?? record.sourceLabel);
  const tableLabel = continuitySourceTableLabel(sourceTable);
  const sourceVersion = source?.version ?? record.sourceVersion ?? 1;

  if (!sourceTable && !sourceLabel) {
    return "No linked source recorded";
  }

  return sourceLabel
    ? `${tableLabel}: ${sourceLabel} / source v${sourceVersion}`
    : `${tableLabel} / source v${sourceVersion}`;
}

export function continuityRecordReviewTarget(record: ContinuityRecord) {
  const sourceTable = record.source?.table ?? record.sourceTable;
  if (record.recordType === "memory" || sourceTable === "memory_items") return "Review in Memory";
  if (record.recordType === "canon" || sourceTable === "canon_items") return "Review in Canon";
  if (record.recordType === "integrity" || sourceTable === "integrity_sessions") return "Review Integrity Session";
  if (
    record.recordType === "archive_file"
    || record.recordType === "archive_import"
    || record.recordType === "archived_chat"
    || sourceTable === "archived_chat_transcripts"
  ) {
    return "Review in Archive";
  }
  if (record.recordType === "publication" || sourceTable === "documents") return "Review linked document";
  if (record.recordType === "candidate") return "Review continuity candidate";
  if (sourceTable === "conversations") return "Review linked conversation";
  return "Review continuity record";
}

export function continuityReviewTargetHref(personaId: string, reviewTarget: string) {
  const sanitizedTarget = sanitizeContinuityLabel(reviewTarget);
  if (!personaId || !sanitizedTarget) return null;

  const normalizedTarget = sanitizedTarget.toLowerCase();
  const route = PERSONA_STUDIO_REVIEW_ROUTES[normalizedTarget];
  const encodedPersonaId = encodeURIComponent(personaId);
  if (route) return `/studio/personas/${encodedPersonaId}/${route}`;
  if (normalizedTarget === "review linked document") return "/studio/publishing";
  return null;
}

export function buildContinuityReviewSignalRows(
  records: ContinuityRecord[],
  limit = 4,
): ContinuityReviewSignalRow[] {
  return sortContinuityRecords(records).slice(0, Math.max(0, limit)).map((record) => ({
    id: record.id,
    typeLabel: continuityRecordTypeLabel(record.recordType),
    changed: sanitizeContinuityLabel(continuityRecordText(record)) ?? "Continuity marker",
    why: continuityRecordWhyLabel(record),
    support: continuityRecordSupportLabel(record),
    reviewState: [
      continuityRecordVisibilityLabel(record.visibility),
      `Record v${record.version ?? 1}`,
      `Updated ${formatCompactDate(record.updatedAt ?? record.createdAt)}`,
    ].join(" / "),
    reviewTarget: continuityRecordReviewTarget(record),
    timestamp: formatCompactDate(continuityRecordTimestamp(record) ?? record.createdAt),
  }));
}

export const RUNTIME_CONTEXT_SECTIONS: Array<{ type: RuntimeContextSourceType; label: string; empty: string }> = [
  { type: "canon", label: "Canon", empty: "No canon material selected." },
  { type: "integrity", label: "Integrity", empty: "No Integrity Session outputs selected." },
  { type: "continuity", label: "Continuity", empty: "No continuity records selected." },
  { type: "memory", label: "Memory", empty: "No memory material selected." },
  { type: "archive", label: "Archive", empty: "No archive material selected." },
];

export function runtimeContextCountRows(preview: RuntimeContextPreviewLike) {
  return RUNTIME_CONTEXT_SECTIONS.map((section) => ({
    ...section,
    value: preview.counts[section.type] ?? 0,
  }));
}

export function runtimeContextSourcesByType(preview: RuntimeContextPreviewLike, type: RuntimeContextSourceType) {
  return preview.sources.filter((source) => source.type === type);
}

export function runtimeContextPreviewLabel(value: string | null | undefined, fallback: string) {
  return sanitizeContinuityLabel(value) ?? fallback;
}

export function runtimeProvenanceReviewTarget(type: RuntimeContextSourceType) {
  if (type === "canon") return "Review in Canon";
  if (type === "integrity") return "Review Integrity Session";
  if (type === "continuity") return "Review Continuity record";
  if (type === "memory") return "Review in Memory";
  return "Review in Archive";
}

export function buildRuntimeProvenanceReadback(
  preview?: RuntimeContextPreviewLike | null,
): RuntimeProvenanceReadbackGroup[] {
  const context = preview ?? { counts: {}, sources: [] };

  return RUNTIME_CONTEXT_SECTIONS.map((section) => {
    const sources = runtimeContextSourcesByType(context, section.type);
    const reviewTarget = runtimeProvenanceReviewTarget(section.type);

    return {
      type: section.type,
      label: section.label,
      count: context.counts[section.type] ?? sources.length,
      empty: section.empty,
      reviewTarget,
      rows: sources.map((source) => ({
        type: section.type,
        title: runtimeContextPreviewLabel(source.title, `${section.label} source`),
        reason: runtimeContextPreviewLabel(source.reason, "Selected for runtime context."),
        sourceLabel: runtimeProvenanceSourceLabel(section.type, source.sourceType),
        reviewTarget,
      })),
    };
  });
}

export function sortContinuityRecords(records: ContinuityRecord[]) {
  return [...records].sort((a, b) => {
    const left = Date.parse(continuityRecordTimestamp(a) ?? "") || 0;
    const right = Date.parse(continuityRecordTimestamp(b) ?? "") || 0;
    return right - left;
  });
}

export function buildContinuitySourceOptions(
  documents: ContinuityDocumentLink[],
  conversations: ContinuityConversationLink[]
): ContinuitySourceOption[] {
  const documentOptions = documents.map((document) => ({
    key: `document:${document.id}`,
    label: `Document: ${document.title}`,
    table: "documents" as const,
    id: document.id,
    recordType: "publication" as const,
    sourceLabel: document.source_label || `Document / ${document.visibility} / ${document.status}`,
    sourceVersion: 1,
  }));

  const conversationOptions = conversations.map((conversation) => {
    const archived = conversation.status === "archived";
    const title = conversation.title?.trim() || "Untitled conversation";
    return {
      key: `conversation:${conversation.id}`,
      label: `Conversation: ${title}`,
      table: "conversations" as const,
      id: conversation.id,
      recordType: archived ? "archived_chat" as const : "timeline" as const,
      sourceLabel: archived
        ? `Archived conversation / ${conversation.message_count ?? 0} messages`
        : "Active conversation",
      sourceVersion: Math.max(1, conversation.message_count ?? 1),
    };
  });

  return [...documentOptions, ...conversationOptions];
}

function sanitizeContinuityLabel(value?: string | null) {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^\s*(?:raw|private|system|user)[\s_-]?prompt\b\s*[:=]?/i.test(trimmed)) {
    return "[redacted-prompt]";
  }
  if (/^\s*(?:trace[\s_-]?body|provider[\s_-]?payload|completion|private[\s_-]?archive[\s_-]?excerpt)\b\s*[:=]?/i.test(trimmed)) {
    return "[redacted-private-source]";
  }
  if (
    /^\s*(?:token|cookie|authorization|api[\s_-]?key|x[\s_-]?api[\s_-]?key|service[\s_-]?role|secret|password|webhook[\s_-]?secret|db[\s_-]?url|database[\s_-]?url)\b\s*[:=]/i
      .test(trimmed)
  ) {
    return "[redacted-secret]";
  }

  const sanitized = trimmed
    .replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/gi, "[id]")
    .replace(/\b(?:postgres(?:ql)?|redis|mysql):\/\/\S+/gi, "[redacted-url]")
    .replace(/https?:\/\/\S+/gi, "[redacted-url]")
    .replace(SECRET_SHAPED_VALUE_PATTERN, "[redacted-secret]")
    .replace(/\b(?:bearer)\s+\S+/gi, "bearer [redacted]")
    .replace(
      /\b(owner[\s_-]?user[\s_-]?id|owner[\s_-]?id|persona[\s_-]?id|trace[\s_-]?id|source[\s_-]?id|memory[\s_-]?id|link[\s_-]?id)\b\s*[:=]\s*\S+/gi,
      "$1=[redacted]"
    )
    .replace(
      /\b(token|cookie|authorization|api[\s_-]?key|x[\s_-]?api[\s_-]?key|service[\s_-]?role|secret|password|webhook[\s_-]?secret|db[\s_-]?url|database[\s_-]?url)\b\s*[:=]\s*.*?(?=\s+(?:bearer\b|\[redacted-(?:url|secret)\])|$)/gi,
      "$1=[redacted]"
    );

  return sanitized.length > 120 ? `${sanitized.slice(0, 117).trim()}...` : sanitized;
}

function continuityRecordWhyLabel(record: ContinuityRecord) {
  const metadataReason = continuityMetadataText(record.metadata, ["why", "reason", "rationale", "reviewReason"]);
  if (metadataReason) return metadataReason;

  const sourceTable = record.source?.table ?? record.sourceTable;
  if (record.recordType === "integrity" || sourceTable === "integrity_sessions") {
    return "Integrity review output linked into durable continuity.";
  }
  if (record.recordType === "memory" || sourceTable === "memory_items") {
    return "Memory material was promoted or linked for runtime recall.";
  }
  if (record.recordType === "canon" || sourceTable === "canon_items") {
    return "Canon material was promoted or linked as higher-priority guidance.";
  }
  if (record.recordType === "archive_file" || record.recordType === "archive_import") {
    return "Archive material was linked so the owner can trace the preserved source.";
  }
  if (record.recordType === "archived_chat" || sourceTable === "archived_chat_transcripts") {
    return "Archived conversation material was linked for continuity review.";
  }
  if (record.recordType === "publication" || sourceTable === "documents") {
    return "Document material was linked to explain the continuity source.";
  }
  if (record.recordType === "candidate") {
    return "A candidate needs owner review before it becomes settled continuity.";
  }
  if (sourceTable === "conversations") {
    return "Conversation context was marked as worth preserving.";
  }
  return "Saved as an owner continuity marker.";
}

function continuityMetadataText(metadata: Record<string, unknown> | null | undefined, keys: string[]) {
  if (!metadata || typeof metadata !== "object") return null;
  for (const key of keys) {
    const value = metadata[key];
    if (typeof value !== "string") continue;
    const sanitized = sanitizeContinuityLabel(value);
    if (sanitized) return sanitized;
  }
  return null;
}

export function runtimeProvenanceSourceLabel(type: RuntimeContextSourceType, sourceType?: string | null) {
  const sourceLabel = sanitizeContinuityLabel(sourceType);
  if (sourceLabel) return labelize(sourceLabel);
  if (type === "canon") return "Canon source";
  if (type === "integrity") return "Integrity source";
  if (type === "continuity") return "Continuity source";
  if (type === "memory") return "Memory source";
  return "Archive source";
}

function formatCompactDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function labelize(value: string) {
  return value.replace(/_/g, " ").replace(/^./, (letter) => letter.toUpperCase());
}

const SECRET_SHAPED_VALUE_PATTERN = /\b(?:sk|pk|rk|whsec|ghp|pat)[_-][A-Za-z0-9._-]+/gi;
