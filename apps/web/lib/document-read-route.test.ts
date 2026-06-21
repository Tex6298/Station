import assert from "node:assert/strict";
import test from "node:test";
import { documentReadRoute, shouldFallbackToPublicDocumentRead } from "./document-read-route";

test("anonymous public document reads go straight to the public endpoint", () => {
  assert.equal(documentReadRoute("doc-1", false), "/documents/public/doc-1");
  assert.equal(shouldFallbackToPublicDocumentRead(false), false);
});

test("signed-in document reads try the owner-aware endpoint first", () => {
  assert.equal(documentReadRoute("doc-1", true), "/documents/doc-1");
  assert.equal(shouldFallbackToPublicDocumentRead(true), true);
});
