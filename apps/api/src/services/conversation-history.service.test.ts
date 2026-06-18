import assert from "node:assert/strict";
import test from "node:test";
import {
  buildChatRuntimeBudgetReport,
  includeRuntimeDebug,
  toChronologicalRuntimeHistory,
} from "./conversation-history.service";

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

test("chat runtime budget reports counts and drops content", () => {
  const report = buildChatRuntimeBudgetReport({
    systemPrompt: "Private system prompt with canon text.",
    userMessage: "Private user text.",
    history: [
      { role: "user", content: "Earlier private user turn." },
      { role: "assistant", content: "Earlier private assistant turn." },
    ],
    rawHistoryCount: 7,
    historyLimit: 2,
    runtimeContext: {
      systemPrompt: "Private system prompt with canon text.",
      counts: { canon: 1, memory: 1, integrity: 1, archive: 1, continuity: 1 },
      sources: [],
      topology: {
        schema: "station.runtime_context_topology.v1",
        priority: ["canon", "integrity", "continuity", "memory", "archive"],
        buckets: {
          canon: { requested: 1, retained: 1, dropped: 0, truncated: 0, maxItems: 6, maxCharactersPerItem: 1800 },
          integrity: { requested: 1, retained: 1, dropped: 0, truncated: 0, maxItems: 5, maxCharactersPerItem: 1200 },
          continuity: { requested: 1, retained: 1, dropped: 0, truncated: 1, maxItems: 4, maxCharactersPerItem: 900 },
          memory: { requested: 3, retained: 1, dropped: 2, truncated: 0, maxItems: 10, maxCharactersPerItem: 900 },
          archive: { requested: 1, retained: 1, dropped: 0, truncated: 0, maxItems: 8, maxCharactersPerItem: 900 },
        },
      },
      canon: [{ id: "canon-1", type: "canon", title: "Canon", content: "Secret canon", priority: 1, reason: "test" }],
      memory: [{ id: "memory-1", type: "memory", title: "Memory", content: "Secret memory", priority: 1, reason: "test" }],
      integrity: [{ id: "integrity-1", type: "integrity", title: "Integrity", content: "Secret integrity", priority: 1, reason: "test" }],
      archive: [{ id: "archive-1", type: "archive", title: "Archive", content: "Secret archive", priority: 1, reason: "test" }],
      continuity: [{ id: "continuity-1", type: "continuity", title: "Continuity", content: "Secret continuity", priority: 1, reason: "test" }],
      trace: {
        retrievalMode: { memory: "keyword", archive: "keyword", memoryFallback: "no_embedding_key" },
        embedding: {
          provider: "gemini",
          profileCode: "station_free_1536",
          model: "text-embedding-004",
          dimension: 1536,
          indexName: "memory_items_embedding_1536_idx",
        },
        selectedSources: [],
        skipped: {
          memory: {
            archive_source: 0,
            rejected: 1,
            quarantined: 2,
            expired: 0,
            superseded: 0,
            other_owner_or_missing: 0,
          },
          archive: {
            unauthoritative: 0,
            source_not_ready: 3,
            missing_lifecycle: 0,
            rejected: 0,
            quarantined: 0,
            expired: 0,
            superseded: 0,
          },
        },
        searched: { memory: 12, archive: 4, continuity: 1 },
      },
    },
    providerRoute: "deepseek_fallback",
    modelTier: "haiku",
    model: "deepseek-chat",
  });

  assert.equal(report.schema, "station.chat_runtime_budget.v1");
  assert.equal(report.productionSafe, true);
  assert.equal(report.buckets.recentTurns.itemCount, 3);
  assert.equal(report.buckets.memory.searched, 12);
  assert.deepEqual(report.buckets.memory.skipped, {
    archive_source: 0,
    quarantined: 2,
    rejected: 1,
    expired: 0,
    superseded: 0,
    other_owner_or_missing: 0,
  });
  assert.equal(report.buckets.archive.retrievalMode, "keyword");
  assert.equal(report.buckets.continuity.itemCount, 1);
  assert.equal(report.buckets.continuity.searched, 1);
  assert.equal(report.buckets.continuity.retrievalMode, "latest_private");
  assert.equal(report.truncation.history.requested, 7);
  assert.equal(report.truncation.history.retained, 2);
  assert.equal(report.truncation.history.dropped, 5);
  assert.deepEqual(report.truncation.topology.priority, ["canon", "integrity", "continuity", "memory", "archive"]);
  assert.equal(report.truncation.topology.buckets.continuity.truncated, 1);
  assert.equal(report.truncation.topology.buckets.memory.dropped, 2);
  assert.doesNotMatch(JSON.stringify(report), /Secret|Private/);
});
