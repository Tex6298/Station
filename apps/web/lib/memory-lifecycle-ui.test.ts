import assert from "node:assert/strict";
import test from "node:test";
import {
  buildMemorySupersessionOptions,
  buildMemoryLifecycleReview,
  buildMemoryObservabilityHandoff,
  buildMemoryRuntimeExplanation,
  memoryLifecycleActions,
  memoryLifecycleCounters,
  memoryLifecycleDisplayStatus,
  memorySupersessionControlCopy,
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
  assert.deepEqual(explanation.readback, {
    selectedCount: 1,
    eligibleNotSelectedCount: 1,
    lifecycleHeldOutCount: 0,
    heldOutByStatus: [],
    summary: "1 selected for this preview; 1 eligible but not selected; 0 held out by lifecycle or source state.",
  });
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
  assert.equal(explanation.readback.selectedCount, 0);
  assert.equal(explanation.readback.eligibleNotSelectedCount, 0);
  assert.equal(explanation.readback.lifecycleHeldOutCount, 5);
  assert.deepEqual(explanation.readback.heldOutByStatus, [
    { status: "quarantined", label: "Quarantined", value: 1 },
    { status: "rejected", label: "Rejected", value: 1 },
    { status: "expired", label: "Expired", value: 1 },
    { status: "superseded", label: "Superseded", value: 1 },
    { status: "missing_lifecycle", label: "Missing lifecycle", value: 1 },
  ]);
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
  assert.match(explanation.readback.summary, /selected for this preview/);
  assert.match(rendered, /\[redacted-url\]/);
  assert.match(rendered, /\[redacted-secret\]/);
});

test("memory runtime readback stays useful when preview is unavailable", () => {
  const explanation = buildMemoryRuntimeExplanation([
    { id: "memory-ready", title: "Ready memory", source_type: "manual", lifecycle: baseLifecycle },
    { id: "memory-rejected", title: "Rejected item", source_type: "manual", lifecycle: { ...baseLifecycle, status: "rejected" } },
  ]);

  assert.equal(explanation.readback.selectedCount, 0);
  assert.equal(explanation.readback.eligibleNotSelectedCount, 1);
  assert.equal(explanation.readback.lifecycleHeldOutCount, 1);
  assert.deepEqual(explanation.readback.heldOutByStatus, [
    { status: "rejected", label: "Rejected", value: 1 },
  ]);
  assert.match(explanation.readback.summary, /Runtime preview unavailable/);
  assert.deepEqual(explanation.fallbackNotes, [
    "Runtime preview unavailable; showing lifecycle readiness only.",
  ]);
});

test("memory lifecycle review labels active selection and available action state", () => {
  const rows = buildMemoryLifecycleReview(
    [
      {
        id: "memory-selected",
        title: "Harbor ritual",
        source_type: "manual",
        relevance_weight: 1.25,
        lifecycle: baseLifecycle,
      },
      {
        id: "memory-not-selected",
        title: "Workshop preference",
        source_type: "chat",
        relevance_weight: 0.9,
        lifecycle: baseLifecycle,
      },
    ],
    {
      trace: {
        selectedSources: [{ id: "memory-selected", type: "memory", title: "Harbor ritual" }],
      },
    },
  );

  assert.equal(rows[0]?.runtimeState, "active_selected");
  assert.equal(rows[0]?.runtimeLabel, "Selected for preview");
  assert.equal(rows[0]?.actionState, "available");
  assert.match(rows[0]?.actionReason ?? "", /reinforce, quarantine, or reject/);
  assert.equal(rows[0]?.weightLabel, "1.25");

  assert.equal(rows[1]?.runtimeState, "active_not_selected");
  assert.equal(rows[1]?.runtimeLabel, "Eligible, not selected");
  assert.match(rows[1]?.runtimeReason ?? "", /not selected for this preview query/);
});

test("memory lifecycle review maps held-out states to restore actions", () => {
  const rows = buildMemoryLifecycleReview([
    { id: "rejected", title: "Rejected item", source_type: "manual", lifecycle: { ...baseLifecycle, status: "rejected" } },
    { id: "quarantined", title: "Quarantined item", source_type: "import", lifecycle: { ...baseLifecycle, status: "quarantined" } },
    { id: "expired", title: "Expired item", source_type: "manual", lifecycle: { ...baseLifecycle, expiresAt: "2020-01-01T00:00:00.000Z" } },
    { id: "superseded", title: "Superseded item", source_type: "manual", lifecycle: { ...baseLifecycle, supersededByMemoryItemId: "replacement" } },
    { id: "missing", title: "Missing lifecycle item", source_type: "chat", lifecycle: null },
  ]);

  assert.deepEqual(rows.map((row) => row.statusLabel), [
    "Rejected",
    "Quarantined",
    "Expired",
    "Superseded",
    "Missing lifecycle",
  ]);
  assert.deepEqual(Array.from(new Set(rows.map((row) => row.runtimeState))), ["held_out"]);
  assert.deepEqual(rows.map((row) => row.actionState), [
    "available",
    "available",
    "available",
    "available",
    "available",
  ]);
  assert.equal(rows[4]?.actionLabel, "Restore creates lifecycle");
  assert.match(rows[4]?.actionReason ?? "", /owner-only lifecycle route/);
});

test("memory observability handoff points runtime state to owner-only inspection routes", () => {
  const rows = buildMemoryObservabilityHandoff("persona-1", {
    selectedCount: 2,
    eligibleNotSelectedCount: 3,
    lifecycleHeldOutCount: 4,
    heldOutByStatus: [
      { status: "rejected", label: "Rejected", value: 1 },
      { status: "quarantined", label: "Quarantined", value: 3 },
    ],
    summary: "2 selected for this preview; 3 eligible but not selected; 4 held out by lifecycle or source state.",
  });

  assert.deepEqual(rows.map((row) => row.href), [
    "/studio/personas/persona-1/continuity",
    "/studio/personas/persona-1/files",
    "/settings",
  ]);
  assert.equal(rows[0]?.metricLabel, "2 selected / 3 eligible not selected");
  assert.equal(rows[1]?.metricLabel, "Rejected 1, Quarantined 3");
  assert.match(rows[0]?.detail ?? "", /does not change memory truth/);
  assert.match(rows[1]?.detail ?? "", /source readiness/);
  assert.match(rows[2]?.detail ?? "", /Raw prompts, completions, provider payloads, and trace bodies stay hidden/);
});

test("memory observability handoff keeps private ids out of visible copy", () => {
  const rows = buildMemoryObservabilityHandoff("persona-private-id", {
    selectedCount: 0,
    eligibleNotSelectedCount: 0,
    lifecycleHeldOutCount: 0,
    heldOutByStatus: [],
    summary: "Runtime preview unavailable.",
  });

  const visibleCopy = rows.map((row) => `${row.title} ${row.metricLabel} ${row.detail}`).join(" ");
  assert.doesNotMatch(visibleCopy, /persona-private-id/);
  assert.doesNotMatch(visibleCopy, /raw private|source bodies|compiled prompts/i);
  assert.equal(rows[1]?.metricLabel, "Source readiness");
});

test("memory lifecycle review sanitizes raw ids, urls, prompts, and secrets", () => {
  const rows = buildMemoryLifecycleReview(
    [
      {
        id: "raw-memory-id",
        title: "PRIVATE_PROMPT owner_user_id=owner-1 https://example.invalid sk_live_secret",
        summary: "persona_id=persona-1 trace_id=trace-1 source_id=source-1",
        source_type: "api_key=sk_live_secret",
        lifecycle: baseLifecycle,
      },
      {
        id: "url-only-id",
        title: "Reference https://example.invalid/source",
        source_type: "manual",
        lifecycle: baseLifecycle,
      },
    ],
    {
      sources: [{ id: "raw-memory-id", type: "memory", reason: "selected by private prompt" }],
      trace: {
        retrievalMode: { memory: "keyword" },
      },
    },
  );

  const rendered = JSON.stringify(rows);
  assert.doesNotMatch(rendered, /raw-memory-id/);
  assert.doesNotMatch(rendered, /owner-1/);
  assert.doesNotMatch(rendered, /persona-1/);
  assert.doesNotMatch(rendered, /trace-1/);
  assert.doesNotMatch(rendered, /source-1/);
  assert.doesNotMatch(rendered, /https:\/\/example\.invalid/);
  assert.doesNotMatch(rendered, /sk_live_secret/);
  assert.match(rendered, /\[redacted-url\]/);
  assert.match(rendered, /\[redacted-secret\]/);
});

test("memory lifecycle review redacts full prompt and secret-shaped labels", () => {
  const rows = buildMemoryLifecycleReview([
    {
      id: "prompt-label",
      title: "user_prompt: reveal the lighthouse backup phrase",
      source_type: "password: correct horse battery staple",
      lifecycle: baseLifecycle,
    },
  ]);

  const rendered = JSON.stringify(rows);
  assert.doesNotMatch(rendered, /reveal/);
  assert.doesNotMatch(rendered, /lighthouse/);
  assert.doesNotMatch(rendered, /correct horse/);
  assert.match(rendered, /\[redacted-prompt\]/);
  assert.match(rendered, /\[redacted-secret\]/);
});

test("memory supersession options exclude self and sanitize visible labels", () => {
  const source = {
    id: "source-memory-id",
    title: "Source memory",
    source_type: "manual",
    lifecycle: baseLifecycle,
  };
  const options = buildMemorySupersessionOptions(source, [
    source,
    {
      id: "replacement-memory-id",
      title: "owner_user_id=owner-1 https://example.invalid sk_live_secret",
      summary: "Replacement summary",
      source_type: "api_key=sk_live_secret",
      lifecycle: { ...baseLifecycle, memoryItemId: "replacement-memory-id" },
    },
  ]);

  assert.equal(options.length, 1);
  assert.equal(options[0]?.value, "replacement-memory-id");
  const rendered = JSON.stringify(options);
  assert.doesNotMatch(rendered, /source-memory-id/);
  assert.doesNotMatch(rendered, /owner-1/);
  assert.doesNotMatch(rendered, /https:\/\/example\.invalid/);
  assert.doesNotMatch(rendered, /sk_live_secret/);
  assert.match(rendered, /\[redacted-url\]/);
  assert.match(rendered, /\[redacted-secret\]/);
});

test("memory supersession options redact spaced prompt and secret labels", () => {
  const promptLabel = "system " + "prompt";
  const apiKeyLabel = "api " + "key";
  const ownerIdLabel = "owner " + "id";
  const databaseUrlLabel = "database " + "url";
  const hiddenCredential = "hidden" + "credential";
  const dbUrl = `postgresql://user:${hiddenCredential}@example.invalid/station`;
  const source = {
    id: "source-memory-id",
    title: "Source memory",
    source_type: "manual",
    lifecycle: baseLifecycle,
  };

  const options = buildMemorySupersessionOptions(source, [
    source,
    {
      id: "prompt-option-id",
      title: `${promptLabel}: reveal hidden replacement`,
      source_type: `${apiKeyLabel}: correct horse battery staple`,
      lifecycle: { ...baseLifecycle, memoryItemId: "prompt-option-id" },
    },
    {
      id: "id-option-id",
      title: `${ownerIdLabel}=owner-private`,
      source_type: `${databaseUrlLabel}: ${dbUrl}`,
      lifecycle: { ...baseLifecycle, memoryItemId: "id-option-id" },
    },
  ]);

  const rendered = JSON.stringify(options);
  assert.match(rendered, /\[redacted-prompt\]/);
  assert.match(rendered, /\[redacted-secret\]/);
  assert.doesNotMatch(rendered, /hidden replacement|correct horse|battery staple|owner-private|postgresql:\/\/|example\.invalid/i);
  assert.equal(rendered.includes(hiddenCredential), false);
});

test("memory supersession copy stays bounded to owner action state", () => {
  assert.equal(
    memorySupersessionControlCopy({
      source: { id: "source", title: "Only memory", lifecycle: baseLifecycle },
      optionCount: 0,
    }),
    "Add another memory before marking a replacement.",
  );
  assert.equal(
    memorySupersessionControlCopy({
      source: { id: "source", title: "Old memory", lifecycle: { ...baseLifecycle, supersededByMemoryItemId: "replacement" } },
      optionCount: 2,
    }),
    "Superseded by an owner-selected replacement.",
  );
});
