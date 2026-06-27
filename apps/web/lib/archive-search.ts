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

export interface GlobalArchiveTrustBoundaryRow {
  id: "global-archive" | "persona-archive" | "export-workspace" | "storage-quota";
  label: string;
  body: string;
  href: string;
  actionLabel: string;
}

export function globalArchiveTrustBoundaryRows(): GlobalArchiveTrustBoundaryRow[] {
  return [
    {
      id: "global-archive",
      label: "Global Archive",
      body: "Search preserved owner-only material across personas, shared sources, archived chats, Memory, Canon-adjacent notes, documents, and Integrity output.",
      href: "#archive-search-input",
      actionLabel: "Search owner-only material",
    },
    {
      id: "persona-archive",
      label: "Per-persona Archive",
      body: "Use persona Archive tabs for source intake, paste/upload import review, failed import readback, and persona-local continuity handoff.",
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
        ? "No owner-only archive items match this view. Existing material remains private and preserved; broaden the search, change filters, or add source material from a persona Archive tab."
        : "No owner-only archive items are ready for this overview yet. Add source material from a persona Archive tab when there is something worth preserving.",
    };
  }

  return {
    title: mode === "search" ? "Private search results" : "Private archive overview",
    body: mode === "search"
      ? "These matches come from owner-scoped archive sources only. Result snippets are sanitized readback, not raw private source dumps."
      : "This overview groups the newest owner-only archive material across stored sources. Use persona Archive tabs for source intake and Export Workspace for portable packages.",
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
