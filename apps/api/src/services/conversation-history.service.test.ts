import assert from "node:assert/strict";
import test from "node:test";
import { includeRuntimeDebug, toChronologicalRuntimeHistory } from "./conversation-history.service";

test("runtime history keeps the latest window but returns it chronological", () => {
  const rows = Array.from({ length: 25 }, (_, index) => ({
    role: index % 2 === 0 ? "user" as const : "assistant" as const,
    content: `message-${String(index + 1).padStart(2, "0")}`,
    created_at: new Date(Date.UTC(2026, 5, 1, 12, index)).toISOString(),
  }));

  const history = toChronologicalRuntimeHistory(rows, 20);

  assert.equal(history.length, 20);
  assert.equal(history[0].content, "message-06");
  assert.equal(history[history.length - 1]?.content, "message-25");
});

test("runtime history drops system and malformed rows before model provider call", () => {
  const history = toChronologicalRuntimeHistory([
    { role: "system", content: "do not pass", created_at: "2026-06-01T12:00:00.000Z" },
    { role: "user", content: "pass user", created_at: "2026-06-01T12:01:00.000Z" },
    { role: "assistant", content: "pass assistant", created_at: "2026-06-01T12:02:00.000Z" },
    { role: "assistant", content: "   ", created_at: "2026-06-01T12:03:00.000Z" },
  ]);

  assert.deepEqual(history, [
    { role: "user", content: "pass user" },
    { role: "assistant", content: "pass assistant" },
  ]);
});

test("runtime debug is explicit outside production and blocked in production", () => {
  assert.equal(includeRuntimeDebug(undefined, "development", undefined), false);
  assert.equal(includeRuntimeDebug("true", "development", undefined), true);
  assert.equal(includeRuntimeDebug("1", "development", undefined), true);
  assert.equal(includeRuntimeDebug(["false", "true"], "test", undefined), true);
  assert.equal(includeRuntimeDebug(undefined, "staging", "true"), true);
  assert.equal(includeRuntimeDebug("true", "production", "true"), false);
});
