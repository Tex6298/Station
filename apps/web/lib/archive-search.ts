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
