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
  type?: string | null;
  source?: string | null;
  persona?: string | null;
  status?: string | null;
  match?: {
    field?: string | null;
    reason?: string | null;
  } | null;
}

export interface ArchiveSearchGroupRow {
  label: string;
  count: number;
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
      body: `${warningCount} archive source${warningCount === 1 ? "" : "s"} could not be searched in this response. Results that did load remain owner-only.`,
    };
  }

  if (resultCount === 0) {
    return {
      title: mode === "search" ? "No private matches" : "No archive items yet",
      body: mode === "search"
        ? "No owner-only archive items match this view. Existing material remains private; broaden the search or change filters."
        : "No owner-only archive items are ready for this overview yet. Add source material from a persona Archive tab when there is something worth preserving.",
    };
  }

  return {
    title: mode === "search" ? "Private search results" : "Private archive overview",
    body: mode === "search"
      ? "These matches come from owner-scoped archive sources only. Result snippets are sanitized readback, not raw private source dumps."
      : "This overview groups the newest owner-only archive material across stored sources before a specific search is applied.",
  };
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

function labelForArchiveSearchGroup(value: string | null | undefined, field: string) {
  const normalized = value?.trim();
  if (normalized) return normalized;
  if (field === "persona") return "Shared/global";
  if (field === "status") return "unknown";
  return "archive";
}
