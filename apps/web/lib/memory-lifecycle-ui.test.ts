import assert from "node:assert/strict";
import test from "node:test";
import {
  buildMemoryRuntimeExplanation,
  memoryLifecycleActions,
  memoryLifecycleCounters,
  memoryLifecycleDisplayStatus,
  memoryRuntimeCopy,
} from "./memory-lifecycle-ui";
import type { MemoryItemLifecycle } from "@station/types/persona";

const baseLifecycle: MemoryItemLifecycle = {
  memoryItemId: "memory-1",
  ownerUserId: "owner-1",
  personaId: "persona-1",
  trustLevel: "user_stated",
  status: "active",
  confidence: 0.8,
  decayRate: 0,
  reinforcementCount: 0,
  evidence: [],
  createdAt: "2026-06-19T00:00:00.000Z",
  updatedAt: "2026-06-19T00:00:00.000Z",
};

test("memory lifecycle helpers label runtime-ready and held-out memory", () => {
  assert.equal(memoryLifecycleDisplayStatus(baseLifecycle), "active");
  assert.match(memoryRuntimeCopy("active"), /Eligible for runtime context/);

  assert.equal(
    memoryLifecycleDisplayStatus({ ...baseLifecycle, status: "quarantined" }),
    "quarantined",
  );
  assert.match(memoryRuntimeCopy("quarantined"), /Held out of runtime context/);

  assert.equal(memoryLifecycleDisplayStatus(null), "missing_lifecycle");
  assert.match(memoryRuntimeCopy("missing_lifecycle"), /Held out/);
});

test("memory lifecycle counters include every owner-visible lifecycle state", () => {
  const rows = memoryLifecycleCounters([
    { lifecycle: baseLifecycle },
    { lifecycle: { ...baseLifecycle, status: "quarantined" } },
    { lifecycle: { ...baseLifecycle, status: "rejected" } },
    { lifecycle: { ...baseLifecycle, status: "superseded" } },
    { lifecycle: { ...baseLifecycle, status: "active", expiresAt: "2020-01-01T00:00:00.000Z" } },
    { lifecycle: null },
  ]);

  assert.deepEqual(Object.fromEntries(rows.map((row) => [row.status, row.value])), {
    active: 1,
    quarantined: 1,
    rejected: 1,
    expired: 1,
    superseded: 1,
    missing_lifecycle: 1,
  });
});

test("memory lifecycle actions keep restore focused on held-out states", () => {
  assert.equal(memoryLifecycleActions(baseLifecycle).showRestore, false);
  assert.equal(memoryLifecycleActions({ ...baseLifecycle, status: "rejected" }).showRestore, true);
  assert.equal(memoryLifecycleActions(null).showRestore, true);
});

test("memory runtime explanation separates selected and query-held active memory", () => {
  const explanation = buildMemoryRuntimeExplanation(
    [
      { id: "memory-selected", title: "Harbor ritual", source_type: "manual", lifecycle: baseLifecycle },
      { id: "memory-missed", title: "Workshop preference", source_type: "chat", lifecycle: baseLifecycle },
    ],
    {
      sources: [{ id: "memory-selected", type: "memory", title: "Harbor ritual", reason: "keyword match" }],
      trace: {
        retrievalMode: { memory: "keyword" },
        searched: { memory: 2 },
      },
    },
  );

  assert.deepEqual(explanation.selected.map((row) => row.targetLabel), ["Harbor ritual"]);
  assert.equal(explanation.selected[0]?.reason, "Selected for this runtime preview.");
  assert.equal(explanation.heldOut[0]?.targetLabel, "Workshop preference");
  assert.match(explanation.heldOut[0]?.reason ?? "", /not selected for this preview query/);
  assert.deepEqual(explanation.fallbackNotes, [
    "Memory retrieval mode: Keyword.",
    "Memory searched: 2.",
  ]);
});

test("memory runtime explanation labels lifecycle and source readiness holdouts", () => {
  const explanation = buildMemoryRuntimeExplanation(
    [
      { id: "memory-rejected", title: "Rejected item", source_type: "archive_source", lifecycle: { ...baseLifecycle, status: "rejected" } },
      { id: "memory-quarantined", title: "Quarantined item", source_type: "import", lifecycle: { ...baseLifecycle, status: "quarantined" } },
      { id: "memory-expired", title: "Expired item", source_type: "manual", lifecycle: { ...baseLifecycle, expiresAt: "2020-01-01T00:00:00.000Z" } },
      { id: "memory-superseded", title: "Superseded item", source_type: "manual", lifecycle: { ...baseLifecycle, supersededByMemoryItemId: "replacement" } },
      { id: "memory-missing", title: "Missing lifecycle item", source_type: "chat", lifecycle: null },
    ],
    {
      trace: {
        retrievalMode: { memory: "keyword", memoryFallback: "no_embedding_key" },
        skipped: {
          memory: { rejected: 1, quarantined: 1, expired: 1, superseded: 1, other_owner_or_missing: 0 },
          archive: { source_not_ready: 2, missing_lifecycle: 1 },
        },
      },
    },
  );

  assert.deepEqual(explanation.selected, []);
  assert.deepEqual(explanation.heldOut.map((row) => row.statusLabel), [
    "Rejected",
    "Quarantined",
    "Expired",
    "Superseded",
    "Missing lifecycle",
  ]);
  assert.match(explanation.heldOut[0]?.reason ?? "", /Held out of runtime context/);
  assert.deepEqual(explanation.fallbackNotes, [
    "Memory retrieval mode: Keyword.",
    "Memory fallback: No embedding key.",
    "Memory held out by lifecycle/source gates: Rejected 1, Quarantined 1, Expired 1, Superseded 1.",
    "Archive/import held out by source readiness or lifecycle gates: Source not ready 2, Missing lifecycle 1.",
  ]);
});

test("memory runtime explanation does not expose raw ids, prompts, urls, or secrets", () => {
  const explanation = buildMemoryRuntimeExplanation(
    [
      {
        id: "memory-secret-id",
        title: "owner_user_id=owner-1 https://example.invalid sk_live_secret",
        summary: "persona_id=persona-1 trace_id=trace-1",
        source_type: "source_id=raw-source-1",
        lifecycle: baseLifecycle,
      },
    ],
    {
      trace: {
        selectedSources: [{ id: "memory-secret-id", type: "memory", reason: "PRIVATE_PROMPT https://example.invalid sk_live_secret" }],
        retrievalMode: { memory: "keyword", memoryFallback: "provider_error_api_key=sk_live_secret" },
      },
    },
  );

  const rendered = JSON.stringify(explanation);
  assert.equal(explanation.selected.length, 1);
  assert.doesNotMatch(rendered, /memory-secret-id/);
  assert.doesNotMatch(rendered, /PRIVATE_PROMPT/);
  assert.doesNotMatch(rendered, /https:\/\/example\.invalid/);
  assert.doesNotMatch(rendered, /sk_live_secret/);
  assert.doesNotMatch(rendered, /owner-1/);
  assert.doesNotMatch(rendered, /persona-1/);
  assert.doesNotMatch(rendered, /trace-1/);
  assert.doesNotMatch(rendered, /raw-source-1/);
  assert.match(rendered, /\[redacted-url\]/);
  assert.match(rendered, /\[redacted-secret\]/);
});
