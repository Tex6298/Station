import { discoverDiscussionCue } from "./public-story-polish";

export type WritingItem = {
  id: string;
  type: string;
  title: string;
  excerpt: string | null;
  href: string;
  meta: string | null;
  discussionThreadId?: string | null;
  author: { display_name?: string | null; username?: string | null } | null;
  createdAt: string;
};

export type RawFeaturedFeedItem = {
  id?: string;
  item_type?: string;
  item_id?: string;
  title?: string | null;
  description?: string | null;
  href?: string | null;
  discussionThreadId?: string | null;
  discussion_thread_id?: string | null;
  created_at?: string | null;
};

export type WritingFeedItem = WritingItem | RawFeaturedFeedItem;

export function normalizeWritingFeedItem(item: WritingFeedItem): WritingItem | null {
  if ("type" in item) {
    return item.type === "document" ? item : null;
  }

  if (item.item_type !== "document") return null;

  const id = item.item_id ?? item.id;
  if (!id) return null;
  if (!item.href || !isSpaceDocumentHref(item.href)) return null;

  return {
    id,
    type: "document",
    title: item.title?.trim() || "Untitled writing",
    excerpt: item.description ?? null,
    href: item.href,
    meta: null,
    discussionThreadId: item.discussionThreadId ?? item.discussion_thread_id ?? null,
    author: null,
    createdAt: item.created_at ?? "",
  };
}

export function isWritingItem(item: WritingItem | null): item is WritingItem {
  return item !== null;
}

export function writingCardDiscussionCue(item: Pick<WritingItem, "type" | "discussionThreadId">) {
  return discoverDiscussionCue({ type: item.type, discussionThreadId: item.discussionThreadId });
}

const SAFE_ROUTE_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const UUID_SHAPED_ROUTE_SLUG_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isSpaceDocumentHref(value: string) {
  const match = value.match(/^\/space\/([^/]+)\/documents\/([^/]+)$/);
  if (!match || /[\s\\]/.test(value)) return false;
  const [, slug, documentId] = match;
  return SAFE_ROUTE_SLUG_PATTERN.test(slug) &&
    !UUID_SHAPED_ROUTE_SLUG_PATTERN.test(slug) &&
    documentId.length > 0;
}
