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
    ["developerSpaces", "spaces", "documents", "threads"]
  );
});

test("public search hrefs only target supported public routes", () => {
  assert.equal(searchHref("developerSpaces", { slug: "observatory" }), "/developer-spaces/observatory");
  assert.equal(searchHref("spaces", { slug: "field-notes" }), "/space/field-notes");
  assert.equal(
    searchHref("documents", { id: "doc-1", space: { slug: "field-notes" } }),
    "/space/field-notes/documents/doc-1"
  );
  assert.equal(searchHref("threads", { id: "thread-1", category: { slug: "general" } }), "/forums/general/thread-1");
  assert.equal(searchHref("documents", { id: "orphan-doc", space: null }), null);
  assert.equal(searchHref("developerSpaces", { id: "missing-slug" }), null);
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
