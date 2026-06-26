export type DiscoverFeedType = "document" | "thread" | "developer_space" | "space" | "persona";

export interface DiscoverFeedItem {
  id: string;
  type: DiscoverFeedType;
  title: string;
  excerpt: string | null;
  href: string;
  meta: string | null;
  visibility?: string | null;
  provenanceType?: string | null;
  sourceType?: string | null;
  sourceLabel?: string | null;
  discussionThreadId?: string | null;
  space: { slug: string; title: string } | null;
  author: { username: string; display_name: string | null; avatar_url: string | null } | null;
  persona: { id: string; name: string } | null;
  score: number;
  replyCount: number;
  createdAt: string;
  promoted: boolean;
  developerSpace?: {
    slug: string;
    visualisationType: string;
    nodeCount: number;
    eventCount: number;
    latestEventLabel?: string | null;
    latestEventType?: string | null;
    latestEventAt?: string | null;
    latestEventSummary?: string | null;
  };
}

type RawCuratedFeedItem = {
  id?: string | null;
  item_type?: string | null;
  item_id?: string | null;
  title?: string | null;
  description?: string | null;
  href?: string | null;
  created_at?: string | null;
  event_type?: string | null;
};

const SAFE_ROUTE_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const UUID_SHAPED_ROUTE_SLUG_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const DISCOVER_FEED_FILTERS = [
  { id: "all", label: "All" },
  { id: "essay", label: "Essay" },
  { id: "codex", label: "Codex" },
  { id: "manifesto", label: "Manifesto" },
  { id: "research", label: "Research" },
  { id: "field_log", label: "Field Log" },
  { id: "theory", label: "Theory" },
  { id: "space", label: "Spaces" },
  { id: "forum", label: "Forum" },
  { id: "developer_space", label: "Developer Spaces" },
] as const;

export type DiscoverFeedFilter = (typeof DISCOVER_FEED_FILTERS)[number]["id"];

const FILTER_LABELS = new Map<DiscoverFeedFilter, string>(
  DISCOVER_FEED_FILTERS.map((filter) => [filter.id, filter.label])
);

export function discoverFeedFilterLabel(filter: DiscoverFeedFilter) {
  return FILTER_LABELS.get(filter) ?? "All";
}

export function normalizeDiscoverDocumentType(value: string | null | undefined): DiscoverFeedFilter | null {
  const normalized = (value ?? "").toLowerCase().replace(/[_-]+/g, " ");
  if (normalized.includes("essay")) return "essay";
  if (normalized.includes("codex") || normalized.includes("constitution")) return "codex";
  if (normalized.includes("manifesto")) return "manifesto";
  if (normalized.includes("research")) return "research";
  if (normalized.includes("field") || normalized.includes("log") || normalized.includes("update")) return "field_log";
  if (normalized.includes("theory")) return "theory";
  return null;
}

export function discoverFeedItemMatchesFilter(item: Pick<DiscoverFeedItem, "type" | "meta">, filter: DiscoverFeedFilter) {
  if (filter === "all") return true;
  if (filter === "forum") return item.type === "thread";
  if (filter === "developer_space") return item.type === "developer_space";
  if (filter === "space") return item.type === "space";
  if (item.type !== "document") return false;
  return normalizeDiscoverDocumentType(item.meta) === filter;
}

export function filterDiscoverFeedItems<T extends Pick<DiscoverFeedItem, "type" | "meta">>(
  items: T[],
  filter: DiscoverFeedFilter
) {
  return items.filter((item) => discoverFeedItemMatchesFilter(item, filter));
}

export function discoverFeedFilterCounts(items: Array<Pick<DiscoverFeedItem, "type" | "meta">>) {
  return Object.fromEntries(
    DISCOVER_FEED_FILTERS.map((filter) => [filter.id, filterDiscoverFeedItems(items, filter.id).length])
  ) as Record<DiscoverFeedFilter, number>;
}

export function discoverFeedFilterStatusCopy(filter: DiscoverFeedFilter, visibleCount: number, totalCount: number) {
  if (totalCount === 0) return "No public-safe feed items loaded yet.";
  if (filter === "all") return `${totalCount} public-safe item${totalCount === 1 ? "" : "s"} in this view.`;
  return `${visibleCount} of ${totalCount} public-safe item${totalCount === 1 ? "" : "s"} match ${discoverFeedFilterLabel(filter)}.`;
}

export function discoverFeedFilterEmptyCopy(filter: DiscoverFeedFilter) {
  if (filter === "all") return "No public or community-safe items are in this view yet.";
  return `No ${discoverFeedFilterLabel(filter)} items are in this public-safe view yet.`;
}

export function discoverPublicSpaceHighlights<T extends Pick<DiscoverFeedItem, "type" | "href">>(
  items: T[],
  limit = 3
) {
  return items
    .filter((item) => item.type === "space" && isSafeSpaceRouteHref(item.href))
    .slice(0, limit);
}

export function normalizeDiscoverFeedItems(items: unknown[]): DiscoverFeedItem[] {
  return items.flatMap((item) => {
    if (!isRecord(item)) return [];
    if (typeof item.type === "string" && isDiscoverFeedType(item.type)) {
      return [item as unknown as DiscoverFeedItem];
    }

    const raw = item as RawCuratedFeedItem;
    if (!isDiscoverFeedType(raw.item_type)) return [];
    const id = raw.item_id ?? raw.id;
    const href = safeRouteHref(raw.href, raw.item_type);
    if (!id || !href) return [];

    return [{
      id,
      type: raw.item_type,
      title: raw.title?.trim() || "Untitled public item",
      excerpt: raw.description ?? null,
      href,
      meta: raw.event_type === "featured" ? "Staff pick" : raw.event_type ?? null,
      space: null,
      author: null,
      persona: null,
      score: 0,
      replyCount: 0,
      createdAt: raw.created_at ?? "",
      promoted: raw.event_type === "featured",
    }];
  });
}

function isDiscoverFeedType(value: unknown): value is DiscoverFeedType {
  return value === "document" ||
    value === "thread" ||
    value === "developer_space" ||
    value === "space" ||
    value === "persona";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function safeRouteHref(value: unknown, type: DiscoverFeedType) {
  if (typeof value !== "string") return null;
  if (!value.startsWith("/") || value.startsWith("//")) return null;
  if (/[\s\\]/.test(value)) return null;

  const allowedPrefixes: Record<DiscoverFeedType, string[]> = {
    document: ["/space/", "/documents/"],
    thread: ["/forums/"],
    developer_space: ["/developer-spaces/"],
    space: ["/space/"],
    persona: ["/personas/"],
  };

  return allowedPrefixes[type].some((prefix) => value.startsWith(prefix)) ? value : null;
}

function isSafeSpaceRouteHref(value: string) {
  const match = value.match(/^\/space\/([^/]+)$/);
  if (!match) return false;
  const slug = match[1];
  return SAFE_ROUTE_SLUG_PATTERN.test(slug) && !UUID_SHAPED_ROUTE_SLUG_PATTERN.test(slug);
}
