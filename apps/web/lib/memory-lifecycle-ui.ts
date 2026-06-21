import type { MemoryItemLifecycle, PersonaMemoryBriefing } from "@station/types/persona";

export type MemoryLifecycleDisplayStatus =
  | "active"
  | "quarantined"
  | "rejected"
  | "expired"
  | "superseded"
  | "missing_lifecycle";

export type MemoryLifecycleItemLike = {
  lifecycle?: MemoryItemLifecycle | null;
};

export type MemoryRuntimeExplanationItemLike = MemoryLifecycleItemLike & {
  id: string;
  title?: string | null;
  summary?: string | null;
  source_type?: string | null;
  sourceType?: string | null;
  relevance_weight?: number | null;
  relevanceWeight?: number | null;
};

export interface RuntimeContextMemoryPreviewLike {
  sources?: Array<{
    id?: string | null;
    type?: string | null;
    title?: string | null;
    reason?: string | null;
  }>;
  trace?: {
    retrievalMode?: Record<string, string | null | undefined>;
    searched?: Record<string, number | null | undefined>;
    skipped?: Record<string, Record<string, number | null | undefined> | null | undefined>;
    selectedSources?: Array<{
      id?: string | null;
      type?: string | null;
      title?: string | null;
      reason?: string | null;
    }>;
  };
}

export interface MemoryRuntimeExplanationRow {
  targetLabel: string;
  sourceLabel: string;
  statusLabel: string;
  reason: string;
}

export interface MemoryRuntimeExplanation {
  selected: MemoryRuntimeExplanationRow[];
  heldOut: MemoryRuntimeExplanationRow[];
  fallbackNotes: string[];
}

export type MemoryLifecycleReviewRuntimeState =
  | "active_selected"
  | "active_not_selected"
  | "held_out";

export type MemoryLifecycleReviewActionState = "available" | "preview_only";

export interface MemoryLifecycleReviewRow {
  targetLabel: string;
  sourceLabel: string;
  statusLabel: string;
  runtimeState: MemoryLifecycleReviewRuntimeState;
  runtimeLabel: string;
  runtimeReason: string;
  actionState: MemoryLifecycleReviewActionState;
  actionLabel: string;
  actionReason: string;
  confidenceLabel: string;
  weightLabel: string;
}

const STATUS_ORDER: MemoryLifecycleDisplayStatus[] = [
  "active",
  "quarantined",
  "rejected",
  "expired",
  "superseded",
  "missing_lifecycle",
];

export function memoryLifecycleDisplayStatus(
  lifecycle?: MemoryItemLifecycle | null,
  now = Date.now(),
): MemoryLifecycleDisplayStatus {
  if (!lifecycle) return "missing_lifecycle";
  if (lifecycle.status !== "active") return lifecycle.status;
  if (lifecycle.supersededByMemoryItemId) return "superseded";
  if (lifecycle.expiresAt) {
    const expiresAt = Date.parse(lifecycle.expiresAt);
    if (!Number.isNaN(expiresAt) && expiresAt <= now) return "expired";
  }
  return "active";
}

export function memoryLifecycleStatusLabel(status: MemoryLifecycleDisplayStatus) {
  if (status === "missing_lifecycle") return "Missing lifecycle";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function memoryRuntimeCopy(status: MemoryLifecycleDisplayStatus) {
  if (status === "active") {
    return "Eligible for runtime context.";
  }

  if (status === "missing_lifecycle") {
    return "Held out until lifecycle state is restored by the owner.";
  }

  return `Held out of runtime context while ${memoryLifecycleStatusLabel(status).toLowerCase()}.`;
}

export function memoryLifecycleCounters(
  items: MemoryLifecycleItemLike[],
  briefing?: PersonaMemoryBriefing | null,
) {
  const counts = Object.fromEntries(STATUS_ORDER.map((status) => [status, 0])) as Record<MemoryLifecycleDisplayStatus, number>;

  if (items.length > 0) {
    for (const item of items) {
      const status = memoryLifecycleDisplayStatus(item.lifecycle);
      counts[status] += 1;
    }
    return STATUS_ORDER.map((status) => ({
      status,
      label: memoryLifecycleStatusLabel(status),
      value: counts[status],
    }));
  }

  const sourceCounts = briefing?.lifecycleCounts ?? {};
  for (const status of STATUS_ORDER) {
    counts[status] = sourceCounts[status] ?? 0;
  }
  counts.missing_lifecycle =
    sourceCounts.missing_lifecycle
    ?? sourceCounts.missing
    ?? sourceCounts.missingLifecycle
    ?? counts.missing_lifecycle;

  return STATUS_ORDER.map((status) => ({
    status,
    label: memoryLifecycleStatusLabel(status),
    value: counts[status],
  }));
}

export function memoryLifecycleActions(lifecycle?: MemoryItemLifecycle | null) {
  const status = memoryLifecycleDisplayStatus(lifecycle);
  return {
    showRestore: status !== "active",
    showQuarantine: status !== "quarantined",
    showReject: status !== "rejected",
  };
}

export function buildMemoryRuntimeExplanation(
  items: MemoryRuntimeExplanationItemLike[],
  preview?: RuntimeContextMemoryPreviewLike | null,
): MemoryRuntimeExplanation {
  const selectedIds = memoryRuntimeSelectedIds(preview);

  const selected: MemoryRuntimeExplanationRow[] = [];
  const heldOut: MemoryRuntimeExplanationRow[] = [];
  const previewAvailable = Boolean(preview);

  for (const item of items) {
    const status = memoryLifecycleDisplayStatus(item.lifecycle);
    const row = {
      targetLabel: memoryRuntimeTargetLabel(item),
      sourceLabel: memoryRuntimeSourceLabel(item.source_type ?? item.sourceType),
      statusLabel: memoryLifecycleStatusLabel(status),
      reason: memoryRuntimeSelectionReason(status, selectedIds.has(item.id), previewAvailable),
    };

    if (status === "active" && selectedIds.has(item.id)) {
      selected.push(row);
    } else {
      heldOut.push(row);
    }
  }

  return {
    selected,
    heldOut,
    fallbackNotes: memoryRuntimeFallbackNotes(preview),
  };
}

export function buildMemoryLifecycleReview(
  items: MemoryRuntimeExplanationItemLike[],
  preview?: RuntimeContextMemoryPreviewLike | null,
): MemoryLifecycleReviewRow[] {
  const selectedIds = memoryRuntimeSelectedIds(preview);
  const previewAvailable = Boolean(preview);

  return items.map((item) => {
    const status = memoryLifecycleDisplayStatus(item.lifecycle);
    const selected = status === "active" && selectedIds.has(item.id);
    const runtimeState = memoryLifecycleReviewRuntimeState(status, selected);

    return {
      targetLabel: memoryRuntimeTargetLabel(item),
      sourceLabel: memoryRuntimeSourceLabel(item.source_type ?? item.sourceType),
      statusLabel: memoryLifecycleStatusLabel(status),
      runtimeState,
      runtimeLabel: memoryLifecycleReviewRuntimeLabel(runtimeState),
      runtimeReason: memoryRuntimeSelectionReason(status, selected, previewAvailable),
      actionState: "available",
      actionLabel: memoryLifecycleReviewActionLabel(status),
      actionReason: memoryLifecycleReviewActionReason(status),
      confidenceLabel: `${Math.round((item.lifecycle?.confidence ?? 0.7) * 100)}%`,
      weightLabel: memoryLifecycleReviewWeightLabel(item),
    };
  });
}

function memoryRuntimeSelectedIds(preview?: RuntimeContextMemoryPreviewLike | null) {
  const selectedIds = new Set<string>();
  const selectedSources = [
    ...(preview?.sources ?? []),
    ...(preview?.trace?.selectedSources ?? []),
  ].filter((source) => source.type === "memory");

  for (const source of selectedSources) {
    if (source.id) selectedIds.add(source.id);
  }

  return selectedIds;
}

function memoryLifecycleReviewRuntimeState(
  status: MemoryLifecycleDisplayStatus,
  selected: boolean,
): MemoryLifecycleReviewRuntimeState {
  if (status !== "active") return "held_out";
  return selected ? "active_selected" : "active_not_selected";
}

function memoryLifecycleReviewRuntimeLabel(state: MemoryLifecycleReviewRuntimeState) {
  if (state === "active_selected") return "Selected for preview";
  if (state === "active_not_selected") return "Eligible, not selected";
  return "Held out";
}

function memoryLifecycleReviewActionLabel(status: MemoryLifecycleDisplayStatus) {
  if (status === "active") return "Lifecycle controls available";
  if (status === "missing_lifecycle") return "Restore creates lifecycle";
  return "Restore available";
}

function memoryLifecycleReviewActionReason(status: MemoryLifecycleDisplayStatus) {
  if (status === "active") {
    return "Use the existing item controls to reinforce, quarantine, or reject; runtime selection itself is preview readback.";
  }

  if (status === "missing_lifecycle") {
    return "Restore uses the existing owner-only lifecycle route before the item can be eligible again.";
  }

  return "Restore uses the existing owner-only lifecycle route; leaving it unchanged keeps it held out.";
}

function memoryLifecycleReviewWeightLabel(item: { relevance_weight?: number | null; relevanceWeight?: number | null }) {
  const weight = item.relevance_weight ?? item.relevanceWeight;
  return typeof weight === "number" ? weight.toFixed(2) : "not set";
}

function memoryRuntimeSelectionReason(
  status: MemoryLifecycleDisplayStatus,
  selected: boolean,
  previewAvailable: boolean,
) {
  if (status !== "active") return memoryRuntimeCopy(status);
  if (selected) return "Selected for this runtime preview.";
  if (!previewAvailable) return "Runtime preview is unavailable, so selection cannot be explained yet.";
  return "Eligible, but not selected for this preview query.";
}

function memoryRuntimeFallbackNotes(preview?: RuntimeContextMemoryPreviewLike | null) {
  if (!preview) return ["Runtime preview unavailable; showing lifecycle readiness only."];

  const notes: string[] = [];
  const memoryMode = sanitizeMemoryRuntimeLabel(preview.trace?.retrievalMode?.memory);
  const memoryFallback = sanitizeMemoryRuntimeLabel(preview.trace?.retrievalMode?.memoryFallback);
  const memorySearched = preview.trace?.searched?.memory;
  const memorySkipped = compactCountLabels(preview.trace?.skipped?.memory);
  const archiveSkipped = compactCountLabels(preview.trace?.skipped?.archive);

  if (memoryMode) notes.push(`Memory retrieval mode: ${labelizeMemoryRuntimeValue(memoryMode)}.`);
  if (memoryFallback) notes.push(`Memory fallback: ${labelizeMemoryRuntimeValue(memoryFallback)}.`);
  if (typeof memorySearched === "number") notes.push(`Memory searched: ${memorySearched}.`);
  if (memorySkipped) notes.push(`Memory held out by lifecycle/source gates: ${memorySkipped}.`);
  if (archiveSkipped) notes.push(`Archive/import held out by source readiness or lifecycle gates: ${archiveSkipped}.`);

  return notes.length > 0 ? notes : ["Runtime preview returned no extra retrieval notes."];
}

function compactCountLabels(counts?: Record<string, number | null | undefined> | null) {
  if (!counts) return null;
  const labels = Object.entries(counts)
    .filter(([, value]) => typeof value === "number" && value > 0)
    .map(([key, value]) => `${labelizeMemoryRuntimeValue(key)} ${value}`);
  return labels.length > 0 ? labels.join(", ") : null;
}

function memoryRuntimeTargetLabel(item: MemoryRuntimeExplanationItemLike) {
  const label = sanitizeMemoryRuntimeLabel(item.title) ?? sanitizeMemoryRuntimeLabel(item.summary);
  return label ?? "Untitled memory";
}

function memoryRuntimeSourceLabel(value?: string | null) {
  const label = sanitizeMemoryRuntimeLabel(value) ?? "memory";
  return labelizeMemoryRuntimeValue(label);
}

function sanitizeMemoryRuntimeLabel(value?: string | null) {
  if (!value) return null;
  const sanitized = value
    .replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/gi, "[id]")
    .replace(/https?:\/\/\S+/gi, "[redacted-url]")
    .replace(SECRET_SHAPED_VALUE_PATTERN, "[redacted-secret]")
    .replace(/\b(?:raw|private|system|user)[_-]?prompt\b\s*[:=]?\s*\S*/gi, "[redacted-prompt]")
    .replace(/\b(?:bearer)\s+\S+/gi, "bearer [redacted]")
    .replace(/\b(owner[_-]?user[_-]?id|owner[_-]?id|persona[_-]?id|trace[_-]?id|source[_-]?id)\b\s*[:=]\s*\S+/gi, "$1=[redacted]")
    .replace(/\b(token|cookie|authorization|api[_-]?key|x-api-key|secret|password)\b\s*[:=]\s*\S+/gi, "$1=[redacted]")
    .trim();

  if (!sanitized) return null;
  return sanitized.length > 96 ? `${sanitized.slice(0, 93).trim()}...` : sanitized;
}

function labelizeMemoryRuntimeValue(value: string) {
  return value.replace(/[_-]/g, " ").replace(/^./, (letter) => letter.toUpperCase());
}

const SECRET_SHAPED_VALUE_PATTERN = /\b(?:sk|pk|rk|whsec|ghp|pat)[_-][A-Za-z0-9._-]+/gi;
