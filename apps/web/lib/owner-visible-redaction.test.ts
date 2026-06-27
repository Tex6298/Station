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

test("owner-visible text redacts JSON-shaped source bodies", () => {
  const rendered = ownerVisibleText(
    JSON.stringify({
      messages: [
        { role: "user", content: "Private source body should not render in Memory cards." },
      ],
      secret: "memory-json-source-secret",
    }),
    "No memory summary saved.",
  );

  assert.equal(
    rendered,
    "Structured source preview redacted. Safe title, source, status, and memory context remain visible.",
  );
  assert.doesNotMatch(rendered, /Private source body|memory-json-source-secret|messages/);
});

test("owner-visible text redacts fenced JSON-shaped source bodies", () => {
  const rendered = ownerVisibleText(
    '```json\n{"memory":"Private fenced JSON should not render","source":"chat export"}\n```',
    "No memory summary saved.",
  );

  assert.equal(
    rendered,
    "Structured source preview redacted. Safe title, source, status, and memory context remain visible.",
  );
});

test("owner-visible text keeps normal prose memory visible", () => {
  assert.equal(
    ownerVisibleText(
      "User prefers concise project updates and wants risky changes called out plainly.",
      "No shared memory content saved.",
    ),
    "User prefers concise project updates and wants risky changes called out plainly.",
  );
});
