import assert from "node:assert/strict";
import test from "node:test";
import {
  discoverFeedFilterCounts,
  discoverFeedFilterEmptyCopy,
  discoverFeedFilterStatusCopy,
  discoverPublicSpaceHighlights,
  filterDiscoverFeedItems,
  normalizeDiscoverFeedItems,
} from "./discover-feed-controls";
import { normalizeWritingFeedItem, writingCardDiscussionCue } from "./writing-feed";

test("writing feed keeps normalized document items only", () => {
  const document = normalizeWritingFeedItem({
    id: "doc-1",
    type: "document",
    title: "Public essay",
    excerpt: "A public essay.",
    href: "/space/public/documents/doc-1",
    meta: "essay",
    discussionThreadId: "thread-1",
    author: null,
    createdAt: "2026-06-14T08:00:00.000Z",
  });

  const thread = normalizeWritingFeedItem({
    id: "thread-1",
    type: "thread",
    title: "Forum thread",
    excerpt: null,
    href: "/forums/community/thread-1",
    meta: "Forum",
    author: null,
    createdAt: "2026-06-14T08:00:00.000Z",
  });

  assert.equal(document?.id, "doc-1");
  assert.equal(document?.discussionThreadId, "thread-1");
  assert.equal(thread, null);
});

test("writing feed maps raw curated featured document rows", () => {
  const item = normalizeWritingFeedItem({
    id: "feed-1",
    item_type: "document",
    item_id: "doc-featured",
    title: "Featured public document",
    description: "Curated summary.",
    href: "/space/public/documents/doc-featured",
    discussion_thread_id: "thread-featured",
    created_at: "2026-06-14T08:30:00.000Z",
  });

  assert.deepEqual(item, {
    id: "doc-featured",
    type: "document",
    title: "Featured public document",
    excerpt: "Curated summary.",
    href: "/space/public/documents/doc-featured",
    meta: null,
    discussionThreadId: "thread-featured",
    author: null,
    createdAt: "2026-06-14T08:30:00.000Z",
  });
});

test("writing feed drops raw curated document rows without canonical Space hrefs", () => {
  assert.equal(
    normalizeWritingFeedItem({
      id: "feed-1",
      item_type: "document",
      item_id: "doc-featured",
      title: "Featured public document",
      description: "Curated summary.",
      created_at: "2026-06-14T08:30:00.000Z",
    }),
    null
  );
  assert.equal(
    normalizeWritingFeedItem({
      id: "feed-2",
      item_type: "document",
      item_id: "doc-dead-route",
      title: "Dead public document route",
      href: "/documents/doc-dead-route",
      created_at: "2026-06-14T08:30:00.000Z",
    }),
    null
  );
  assert.equal(
    normalizeWritingFeedItem({
      id: "feed-3",
      item_type: "document",
      item_id: "doc-space-index",
      title: "Wrong Space route",
      href: "/space/public",
      created_at: "2026-06-14T08:30:00.000Z",
    }),
    null
  );
  assert.equal(
    normalizeWritingFeedItem({
      id: "feed-4",
      item_type: "document",
      item_id: "doc-uuid-space",
      title: "UUID-shaped Space route",
      href: "/space/550e8400-e29b-41d4-a716-446655440000/documents/doc-uuid-space",
      created_at: "2026-06-14T08:30:00.000Z",
    }),
    null
  );
});

test("writing card discussion cue is visible only for linked document items", () => {
  assert.equal(
    writingCardDiscussionCue({
      type: "document",
      discussionThreadId: "thread-1",
    }),
    "Open document and linked discussion"
  );
  assert.equal(
    writingCardDiscussionCue({
      type: "document",
      discussionThreadId: null,
    }),
    null
  );
  assert.equal(
    writingCardDiscussionCue({
      type: "thread",
      discussionThreadId: "thread-1",
    }),
    null
  );
});

test("writing feed drops raw curated rows that are not documents", () => {
  assert.equal(
    normalizeWritingFeedItem({
      item_type: "space",
      item_id: "space-1",
      title: "Featured Space",
      href: "/space/featured",
      created_at: "2026-06-14T08:30:00.000Z",
    }),
    null
  );
});

test("discover feed controls filter loaded public-safe items by type", () => {
  const items = [
    { id: "essay-1", type: "document" as const, meta: "essay" },
    { id: "field-1", type: "document" as const, meta: "field_log" },
    { id: "space-1", type: "space" as const, meta: "Public Space" },
    { id: "thread-1", type: "thread" as const, meta: "Forum" },
    { id: "dev-1", type: "developer_space" as const, meta: "radial" },
  ];

  assert.deepEqual(filterDiscoverFeedItems(items, "all").map((item) => item.id), [
    "essay-1",
    "field-1",
    "space-1",
    "thread-1",
    "dev-1",
  ]);
  assert.deepEqual(filterDiscoverFeedItems(items, "essay").map((item) => item.id), ["essay-1"]);
  assert.deepEqual(filterDiscoverFeedItems(items, "field_log").map((item) => item.id), ["field-1"]);
  assert.deepEqual(filterDiscoverFeedItems(items, "space").map((item) => item.id), ["space-1"]);
  assert.deepEqual(filterDiscoverFeedItems(items, "forum").map((item) => item.id), ["thread-1"]);
  assert.deepEqual(filterDiscoverFeedItems(items, "developer_space").map((item) => item.id), ["dev-1"]);
});

test("discover feed controls expose counts and empty copy without changing visibility", () => {
  const items = [
    { id: "codex-1", type: "document" as const, meta: "constitution" },
    { id: "thread-1", type: "thread" as const, meta: "Forum" },
  ];

  const counts = discoverFeedFilterCounts(items);

  assert.equal(counts.all, 2);
  assert.equal(counts.codex, 1);
  assert.equal(counts.theory, 0);
  assert.equal(discoverFeedFilterStatusCopy("codex", 1, 2), "1 of 2 public-safe items match Codex.");
  assert.equal(discoverFeedFilterEmptyCopy("theory"), "No Theory items are in this public-safe view yet.");
});

test("discover public Space highlights keep only safe Space routes", () => {
  const items = [
    { id: "doc-1", type: "document" as const, href: "/space/public/documents/doc-1" },
    { id: "space-1", type: "space" as const, href: "/space/station-replay-alpha" },
    { id: "space-bad-slug", type: "space" as const, href: "/space/Bad Slug" },
    { id: "space-uuid", type: "space" as const, href: "/space/550e8400-e29b-41d4-a716-446655440000" },
    { id: "space-document", type: "space" as const, href: "/space/station-replay-alpha/documents/doc-1" },
  ];

  assert.deepEqual(discoverPublicSpaceHighlights(items).map((item) => item.id), ["space-1"]);
});

test("discover feed normalizes curated staff-pick rows into routeable cards", () => {
  const items = normalizeDiscoverFeedItems([
    {
      id: "feed-0",
      item_type: "document",
      item_id: "doc-featured",
      event_type: "featured",
      title: "Featured public document",
      description: "Curated public document.",
      href: "/space/public/documents/doc-featured",
      created_at: "2026-06-26T08:29:00.000Z",
    },
    {
      id: "feed-1",
      item_type: "space",
      item_id: "space-1",
      event_type: "featured",
      title: "Station Replay Alpha",
      description: "Curated public Space.",
      href: "/space/station-replay-alpha",
      created_at: "2026-06-26T08:30:00.000Z",
    },
    {
      id: "feed-2",
      item_type: "document",
      item_id: "doc-unsafe",
      title: "Unsafe href",
      href: "https://example.com/doc-unsafe",
      created_at: "2026-06-26T08:31:00.000Z",
    },
    {
      id: "feed-3",
      item_type: "document",
      item_id: "doc-dead-route",
      title: "Dead route",
      href: "/documents/doc-dead-route",
      created_at: "2026-06-26T08:32:00.000Z",
    },
    {
      id: "feed-4",
      item_type: "space",
      item_id: "space-wrong-route",
      title: "Wrong local route",
      href: "/settings",
      created_at: "2026-06-26T08:32:00.000Z",
    },
  ]);
  const [document, space] = items;

  assert.equal(items.length, 2);
  assert.equal(document.id, "doc-featured");
  assert.equal(document.type, "document");
  assert.equal(document.href, "/space/public/documents/doc-featured");
  assert.equal(document.promoted, true);
  assert.equal(space.id, "space-1");
  assert.equal(space.type, "space");
  assert.equal(space.href, "/space/station-replay-alpha");
  assert.equal(space.promoted, true);
});
