const CATEGORY_DESCRIPTION_REPLACEMENTS: Array<[RegExp, string]> = [
  [/\u00c3\u00a2\u00c2\u0080\u00c2\u0094|\u00c3\u00a2\u20ac\u201a\u00ac\u00e2\u20ac\u009d|\u00e2\u20ac\u201d|\u00e2\u20ac\u201c/g, "-"],
];

export function forumCategoryDescriptionCopy(description?: string | null) {
  if (!description) return null;
  return CATEGORY_DESCRIPTION_REPLACEMENTS.reduce(
    (copy, [pattern, replacement]) => copy.replace(pattern, replacement),
    description
  );
}

export function forumCountLabel(count: number | null | undefined, singular: string, plural = `${singular}s`) {
  const safeCount = typeof count === "number" && Number.isFinite(count) ? Math.max(0, count) : 0;
  return `${safeCount} ${safeCount === 1 ? singular : plural}`;
}

export function forumParticipationReadbackLabel(target: "thread" | "comment" = "thread") {
  return target === "comment" ? "Comment feedback" : "Discussion feedback";
}

export function forumParticipationActionLabel(value: -1 | 1) {
  return value > 0 ? "Useful" : "Needs work";
}

export function forumThreadActivityLabel(value?: string | null, prefix = "Latest activity") {
  if (!value) return `${prefix} recently`;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return `${prefix} recently`;
  return `${prefix} ${date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`;
}

export function forumThreadVisibilityLabel(visibility?: string | null) {
  if (!visibility || visibility === "public") return "Public";
  if (visibility === "community") return "Community-visible";
  if (visibility === "members") return "Members";
  return visibility
    .split(/[_-]+/g)
    .filter(Boolean)
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(" ");
}

export function forumThreadCategoryLabel(title?: string | null) {
  const normalized = title?.trim();
  return normalized ? `Category: ${normalized}` : "Category";
}

export function forumThreadStatusLabel(status?: string | null) {
  if (!status || status === "active") return "Open discussion";
  if (status === "locked") return "Locked thread";
  return status
    .split(/[_-]+/g)
    .filter(Boolean)
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(" ");
}

export function forumThreadKindLabels(input: {
  isPinned?: boolean | null;
  linkedDocumentId?: string | null;
  visibility?: string | null;
}) {
  const labels: string[] = [];
  if (input.isPinned) labels.push("Pinned");
  if (input.linkedDocumentId) labels.push("Document discussion");
  const visibility = forumThreadVisibilityLabel(input.visibility);
  if (visibility !== "Public") labels.push(visibility);
  return labels;
}

export function forumCategoryEntryLabel(input?: { subcommunity?: { title?: string | null; type?: string | null; subcommunityType?: string | null } | null }) {
  const type = input?.subcommunity?.type ?? input?.subcommunity?.subcommunityType;
  if (type === "salon") return "Open Salon";
  if (input?.subcommunity) return "Open subcommunity";
  return "Open forum";
}
