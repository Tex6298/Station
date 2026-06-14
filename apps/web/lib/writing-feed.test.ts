import assert from "node:assert/strict";
import test from "node:test";
import { normalizeWritingFeedItem } from "./writing-feed";

test("writing feed keeps normalized document items only", () => {
  const document = normalizeWritingFeedItem({
    id: "doc-1",
    type: "document",
    title: "Public essay",
    excerpt: "A public essay.",
    href: "/space/public/documents/doc-1",
    meta: "essay",
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
    created_at: "2026-06-14T08:30:00.000Z",
  });

  assert.deepEqual(item, {
    id: "doc-featured",
    type: "document",
    title: "Featured public document",
    excerpt: "Curated summary.",
    href: "/space/public/documents/doc-featured",
    meta: null,
    author: null,
    createdAt: "2026-06-14T08:30:00.000Z",
  });
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
