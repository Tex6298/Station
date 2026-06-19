import assert from "node:assert/strict";
import test from "node:test";
import {
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
