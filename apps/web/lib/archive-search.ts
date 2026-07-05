import { ownerVisibleText } from "./owner-visible-redaction";

export const ARCHIVE_SEARCH_FILTERS = [
  "All",
  "Shared/global",
  "Archive",
  "Memory",
  "Canon",
  "Continuity",
  "Import",
  "Conversation",
  "Document",
  "Image",
  "Data",
  "Integrity",
];

export interface ArchiveSearchItemLike {
  kind?: string | null;
  type?: string | null;
  source?: string | null;
  sourceLabel?: string | null;
  persona?: string | null;
  personaId?: string | null;
  status?: string | null;
  visibility?: string | null;
  privacy?: string | null;
  href?: string | null;
  match?: {
    field?: string | null;
    reason?: string | null;
  } | null;
}

export interface ArchiveResultProvenanceReadback {
  sourceClassLabel: string;
  visibilityLabel: string;
  statusLabel: string;
  personaLabel: string;
  matchLabel: string;
  evidenceLabel: string;
}

export interface ArchiveSearchGroupRow {
  label: string;
  count: number;
}

export interface GlobalArchiveTrustBoundaryRow {
  id: "global-archive" | "persona-archive" | "export-workspace" | "storage-quota";
  label: string;
  body: string;
  href: string;
  actionLabel: string;
}

export interface GlobalArchiveIntakeInput {
  personaId: string;
  sourceName: string;
  content: string;
  relevanceWeight: number;
}

export function globalArchiveTrustBoundaryRows(): GlobalArchiveTrustBoundaryRow[] {
  return [
    {
      id: "global-archive",
      label: "Global Archive",
      body: "Search preserved owner-only material and start pasted source intake for an owned persona without publishing the source.",
      href: "#global-archive-source-intake",
      actionLabel: "Add pasted source",
    },
    {
      id: "persona-archive",
      label: "Per-persona Archive",
      body: "Use persona Archive tabs for file upload, paste/upload import review, failed import readback, and persona-local continuity handoff.",
      href: "/studio",
      actionLabel: "Open persona workbench",
    },
    {
      id: "export-workspace",
      label: "Export Workspace",
      body: "Use Export Workspace for scoped package status and portable bundle readback. Global Archive search does not create public download URLs.",
      href: "/studio/export",
      actionLabel: "Review export trust",
    },
    {
      id: "storage-quota",
      label: "Storage and quota",
      body: "Use Settings for server-reported storage usage. Global Archive does not invent capacity or imply that failed search removes preserved material.",
      href: "/settings",
      actionLabel: "Check storage usage",
    },
  ];
}

export function archiveSearchUsesBackend(input: {
  filter: string;
  query: string;
  sort: string;
}) {
  return input.query.trim().length > 0
    || input.filter !== "All"
    || input.sort !== "date";
}

export function archiveSearchTypeParam(filter: string) {
  if (filter === "All") return null;
  if (filter === "Shared/global") return "global";
  return filter.toLowerCase();
}

export function archiveSearchPath(input: {
  filter: string;
  query: string;
  sort: string;
  limit?: number;
}) {
  if (!archiveSearchUsesBackend(input)) return "/imports/archive";

  const params = new URLSearchParams();
  const query = input.query.trim();
  const type = archiveSearchTypeParam(input.filter);

  if (query) params.set("q", query);
  if (type) params.set("type", type);
  params.set("sort", input.sort);
  params.set("limit", String(input.limit ?? 50));

  return `/imports/archive/search?${params.toString()}`;
}

export function archiveSearchModeLabel(input: {
  filter: string;
  query: string;
  sort: string;
}) {
  return archiveSearchUsesBackend(input) ? "Live private search" : "Archive overview";
}

export function archiveSearchReadbackCopy(input: {
  filter: string;
  query: string;
  sort: string;
}, resultCount: number, warningCount = 0) {
  const mode = archiveSearchUsesBackend(input) ? "search" : "overview";
  if (warningCount > 0) {
    return {
      title: "Partial private search",
      body: `${warningCount} archive source${warningCount === 1 ? "" : "s"} could not be searched in this response. Results that did load remain owner-only, and existing preserved material stays private.`,
    };
  }

  if (resultCount === 0) {
    return {
      title: mode === "search" ? "No private matches" : "No archive items yet",
      body: mode === "search"
        ? "No owner-only archive items match this view. Existing material remains private and preserved; broaden the search, change filters, or add pasted source material from Global Archive intake."
        : "No owner-only archive items are ready for this overview yet. Add pasted source material from Global Archive intake when there is something worth preserving.",
    };
  }

  return {
    title: mode === "search" ? "Private search results" : "Private archive overview",
    body: mode === "search"
      ? "These matches come from owner-scoped archive sources only. Result snippets are sanitized readback, not raw private source dumps."
      : "This overview groups the newest owner-only archive material across stored sources. Use Global Archive intake for pasted sources, persona Archive tabs for file upload and review, and Export Workspace for portable packages.",
  };
}

export function globalArchiveIntakePayload(input: GlobalArchiveIntakeInput) {
  return {
    personaId: input.personaId,
    sourceName: input.sourceName.trim() || "pasted-archive",
    content: input.content,
    relevanceWeight: input.relevanceWeight,
  };
}

export function globalArchiveIntakeCanSubmit(input: GlobalArchiveIntakeInput, submitting = false) {
  return !submitting && Boolean(input.personaId.trim()) && input.content.trim().length > 0;
}

export function globalArchiveIntakeErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  if (/persona not found|not authorised|not authorized/.test(message)) {
    return "Could not create import for that persona. Choose one of your owned personas and try again.";
  }

  if (/quota|storage|limit/.test(message)) {
    return "Pasted source import was blocked by storage or import quota. Existing archive material remains owner-only and safe.";
  }

  if (/too large|maximum|max|500000/.test(message)) {
    return "Pasted source import was too large. Existing archive material remains owner-only and safe.";
  }

  return "Pasted source import failed. Existing archive material remains owner-only and safe.";
}

export function globalArchiveIntakeSuccessMessage(sourceName: string | null | undefined, personaName: string | null | undefined) {
  const label = globalArchiveIntakeNoticeLabel(sourceName, "Pasted source");
  const safePersona = globalArchiveIntakeNoticeLabel(personaName, "");
  const persona = safePersona ? ` for ${safePersona}` : "";
  return `${label} was saved as private archive material${persona}. Global Archive refreshed; open the source row for persona Archive review.`;
}

export function archiveSearchGroupCounts(
  items: ArchiveSearchItemLike[],
  field: "type" | "source" | "persona" | "status",
  limit = 4,
): ArchiveSearchGroupRow[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    const label = labelForArchiveSearchGroup(item[field], field);
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
    .slice(0, limit);
}

export function archiveResultProvenanceReadback(item: ArchiveSearchItemLike): ArchiveResultProvenanceReadback {
  return {
    sourceClassLabel: archiveResultSourceClassLabel(item),
    visibilityLabel: archiveResultVisibilityLabel(item),
    statusLabel: archiveResultStatusLabel(item),
    personaLabel: archiveResultPersonaLabel(item),
    matchLabel: archiveResultMatchLabel(item),
    evidenceLabel: archiveResultEvidenceLabel(item.href),
  };
}

export function archiveResultEvidenceHref(item: ArchiveSearchItemLike) {
  const href = item.href?.trim() ?? "";
  if (!href.startsWith("/")) return null;
  if (href.startsWith("//") || /%2e/i.test(href)) return null;

  let parsed: URL;
  try {
    parsed = new URL(href, "https://station.local");
  } catch {
    return null;
  }

  const pathname = parsed.pathname.replace(
    /^\/studio\/personas\/([^/]+)\/timeline(?=\/|$)/i,
    "/studio/personas/$1/continuity",
  );

  if (/^\/(?:discover|public|forums?|space)(?:\/|$)/i.test(pathname)) return null;
  if (/^\/(?:studio|settings)(?:\/|$)/i.test(pathname)) {
    return `${pathname}${parsed.search}${parsed.hash}`;
  }

  return null;
}

function archiveResultSourceClassLabel(item: ArchiveSearchItemLike) {
  const haystack = [
    item.kind,
    item.type,
    item.source,
    item.sourceLabel,
    item.href,
  ].map((value) => value?.trim().toLowerCase() ?? "").join(" ");

  if (/\bmemory\b/.test(haystack)) return "Memory";
  if (/\bcanon\b/.test(haystack)) return "Canon";
  if (/persona[_ -]?file|\bfile\b|uploaded/.test(haystack)) return "Persona file";
  if (/import[_ -]?job|\bimport\b|pasted/.test(haystack)) return "Import job";
  if (/archived[_ -]?chat|conversation|chat transcript/.test(haystack)) return "Archived chat";
  if (/continuity|timeline/.test(haystack)) return "Continuity";
  if (/integrity|calibration/.test(haystack)) return "Integrity";
  if (/document|publishing|writing/.test(haystack)) return "Document";
  if (/archive/.test(haystack)) return "Archive";
  return "Unknown archive source";
}

function archiveResultVisibilityLabel(item: ArchiveSearchItemLike) {
  const visibility = `${item.privacy ?? ""} ${item.visibility ?? ""}`.toLowerCase();
  if (/owner/.test(visibility) || /private/.test(visibility)) return "Owner-only private";
  return "Owner-only archive readback";
}

function archiveResultStatusLabel(item: ArchiveSearchItemLike) {
  const label = archiveOwnerVisibleField(item.status, "Status not reported");
  if (label === "Status not reported") return label;
  return label.replace(/[_-]+/g, " ");
}

function archiveResultPersonaLabel(item: ArchiveSearchItemLike) {
  const persona = archiveOwnerVisibleField(item.persona, "");
  if (!persona) return item.personaId ? "Known persona" : "Shared/global";
  if (/^\[redacted-id\]$/.test(persona)) return "Known persona";
  return persona;
}

function archiveResultMatchLabel(item: ArchiveSearchItemLike) {
  const reason = archiveOwnerVisibleField(item.match?.reason, "");
  if (reason) return reason;

  const field = archiveOwnerVisibleField(item.match?.field, "");
  if (field) return `Matched ${field} field`;

  return "Included in this owner-only archive view";
}

function archiveResultEvidenceLabel(href?: string | null) {
  const normalized = archiveResultEvidenceHref({ href })?.toLowerCase() ?? "";
  if (!normalized) return "Owner evidence route unavailable";
  if (/^\/studio\/personas\/[^/]+\/memory(?:\/|$)/.test(normalized)) return "Open persona Memory";
  if (/^\/studio\/personas\/[^/]+\/canon(?:\/|$)/.test(normalized)) return "Open persona Canon";
  if (/^\/studio\/personas\/[^/]+\/files(?:\/|$)/.test(normalized)) return "Open persona Archive files";
  if (/^\/studio\/personas\/[^/]+\/continuity(?:\/|$)/.test(normalized)) return "Open continuity timeline";
  if (/^\/studio\/personas\/[^/]+\/calibration(?:\/|$)/.test(normalized)) return "Open Integrity";
  if (/^\/studio\/personas\/[^/]+(?:\/|$)/.test(normalized)) return "Open persona workspace";
  if (/^\/studio\/archive(?:\/|$)/.test(normalized)) return "Open Global Archive";
  if (/^\/studio\/publishing(?:\/|$)/.test(normalized)) return "Open publishing";
  if (/^\/studio\/export(?:\/|$)/.test(normalized)) return "Open Export Workspace";
  if (/^\/settings(?:\/|$)/.test(normalized)) return "Open settings";
  return "Open owner Studio";
}

function labelForArchiveSearchGroup(value: string | null | undefined, field: string) {
  const normalized = value?.trim();
  if (normalized) return normalized;
  if (field === "persona") return "Shared/global";
  if (field === "status") return "unknown";
  return "archive";
}

function globalArchiveIntakeNoticeLabel(value: string | null | undefined, fallback: string) {
  const trimmed = value?.trim();
  if (!trimmed) return fallback;

  const sanitized = trimmed
    .replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/gi, "[redacted-id]")
    .replace(/https?:\/\/\S+/gi, "[redacted-url]")
    .replace(/\b(?:sk|pk|rk|whsec|ghp|pat)[_-][A-Za-z0-9._-]+/gi, "[redacted-secret]")
    .replace(/\b(?:bearer)\s+\S+/gi, "bearer [redacted]")
    .replace(/\b(token|cookie|authorization|api[_-]?key|x-api-key|secret|password)\b\s*[:=]\s*\S+/gi, "$1=[redacted]")
    .replace(/\s+/g, " ")
    .trim();

  return sanitized.length > 120 ? `${sanitized.slice(0, 117).trim()}...` : sanitized;
}

function archiveOwnerVisibleField(value: string | null | undefined, fallback: string) {
  const redacted = ownerVisibleText(value, fallback)
    .replace(/https?:\/\/\S+/gi, "[redacted-url]")
    .replace(/\b(?:sk|pk|rk|whsec|ghp|pat)[_-][A-Za-z0-9._-]+/gi, "[redacted-secret]")
    .replace(/\b(?:bearer)\s+\S+/gi, "bearer [redacted]")
    .replace(/\b(token|cookie|authorization|api[_-]?key|x-api-key|secret|password)\b\s*[:=]\s*\S+/gi, "$1=[redacted]")
    .replace(/\s+/g, " ")
    .trim();

  if (!redacted) return fallback;
  if (/storage(?: path|_path|-path|Path)|signed(?: url|_url|-url|Url)|provider payload|source body|transcript|sql|stack trace|parser internal/i.test(redacted)) {
    return fallback;
  }

  return redacted.length > 120 ? `${redacted.slice(0, 117).trim()}...` : redacted;
}
