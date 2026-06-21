import assert from "node:assert/strict";
import test from "node:test";
import { ownerVisibleText, redactOwnerVisibleIds } from "./owner-visible-redaction";

test("owner-visible redaction hides UUID-shaped values without dropping useful text", () => {
  const rendered = redactOwnerVisibleIds(
    "Saved source 123e4567-e89b-12d3-a456-426614174000 informed memory 00000000-0000-0000-0000-000000000000.",
  );

  assert.match(rendered, /Saved source \[redacted-id\] informed memory \[redacted-id\]\./);
  assert.doesNotMatch(rendered, /123e4567|426614174000|00000000-0000-0000-0000-000000000000/);
});

test("owner-visible text falls back for empty values", () => {
  assert.equal(ownerVisibleText("  ", "Untitled memory"), "Untitled memory");
});
