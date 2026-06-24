import assert from "node:assert/strict";
import test from "node:test";
import {
  PUBLIC_SEARCH_GROUPS,
  routeablePublicSearchItems,
  searchHref,
} from "./search-dropdown";

test("public search groups exclude private owner buckets", () => {
  assert.deepEqual(
    PUBLIC_SEARCH_GROUPS.map(([key]) => key),
    ["developerSpaces", "personas", "spaces", "documents", "threads"]
  );
});

test("public search hrefs only target supported public routes", () => {
  assert.equal(searchHref("developerSpaces", { slug: "observatory" }), "/developer-spaces/observatory");
  assert.equal(searchHref("personas", { publicSlug: "blue-lantern" }), "/personas/blue-lantern");
  assert.equal(searchHref("personas", { public_slug: "green-door" }), "/personas/green-door");
  assert.equal(searchHref("personas", { href: "https://example.test/unsafe", publicSlug: "blue-lantern" }), "/personas/blue-lantern");
  assert.equal(searchHref("personas", { href: "/admin" }), null);
  assert.equal(searchHref("personas", { publicSlug: "550e8400-e29b-41d4-a716-446655440000" }), null);
  assert.equal(searchHref("spaces", { slug: "field-notes" }), "/space/field-notes");
  assert.equal(
    searchHref("documents", { id: "doc-1", space: { slug: "field-notes" } }),
    "/space/field-notes/documents/doc-1"
  );
  assert.equal(searchHref("threads", { id: "thread-1", category: { slug: "general" } }), "/forums/general/thread-1");
  assert.equal(searchHref("documents", { id: "orphan-doc", space: null }), null);
  assert.equal(searchHref("documents", { space: { slug: "field-notes" } }), null);
  assert.equal(searchHref("developerSpaces", { id: "missing-slug" }), null);
  assert.equal(searchHref("threads", { category: { slug: "general" } }), "/forums");
});

test("routeable public search items drop unrouteable public results", () => {
  const items = routeablePublicSearchItems("documents", {
    documents: [
      { id: "doc-1", title: "Routeable", space: { slug: "station" } },
      { id: "doc-2", title: "No Space", space: null },
    ],
  });

  assert.deepEqual(
    items.map((item) => [item.result.id, item.href]),
    [["doc-1", "/space/station/documents/doc-1"]]
  );
});

test("routeable public search items ignore private owner buckets", () => {
  const keys = PUBLIC_SEARCH_GROUPS.map(([key]) => key);

  assert.equal((keys as readonly string[]).includes("privateResults"), false);
  assert.deepEqual(
    routeablePublicSearchItems("personas", {
      personas: [
        { name: "Public Persona", publicSlug: "public-persona" },
        { name: "Unsafe Persona", publicSlug: "550e8400-e29b-41d4-a716-446655440000" },
        { name: "Missing Slug" },
      ],
      privateResults: {
        memoryItems: [{ id: "private-memory" }],
      },
    }).map((item) => [item.result.name, item.href]),
    [["Public Persona", "/personas/public-persona"]]
  );
});
