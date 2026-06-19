import assert from "node:assert/strict";
import test from "node:test";
import {
  handoffFreshnessCopy,
  handoffStatusLabel,
  handoffSummaryPreview,
  lifecycleEventReadback,
  lifecycleEventTypeLabel,
  memoryGraphReadback,
} from "./persona-lifecycle-ui";
import type { PersonaHandoff, PersonaLifecycleEvent } from "@station/types/persona";

test("persona lifecycle helpers label owner-facing events without raw event payloads", () => {
  assert.equal(lifecycleEventTypeLabel("memory_graph_update"), "Memory update");
  assert.equal(lifecycleEventTypeLabel("handoff_in"), "Handoff received");

  const readback = lifecycleEventReadback({
    id: "event-1",
    personaId: "persona-1",
    ownerUserId: "owner-1",
    eventType: "handoff_in",
    eventLabel: "Context handoff created for 11111111-1111-4111-8111-111111111111",
    eventData: { privatePayload: "must not render" },
    createdAt: "2026-06-19T00:00:00.000Z",
  } satisfies PersonaLifecycleEvent);

  assert.equal(readback.label, "Handoff received");
  assert.match(readback.detail, /\[id\]/);
  assert.doesNotMatch(JSON.stringify(readback), /privatePayload/);
});

test("persona handoff helpers keep status and summaries readable", () => {
  const handoff = {
    status: "ready",
    summary: "Continue from continuity anchor 22222222-2222-4222-8222-222222222222 and review tone.",
  } as PersonaHandoff;

  assert.equal(handoffStatusLabel(handoff.status), "Ready");
  assert.match(handoffSummaryPreview(handoff), /\[id\]/);
  assert.equal(handoffFreshnessCopy(2), "2 recent handoffs are ready for continuity review.");
});

test("memory graph readback stays bounded to counts", () => {
  assert.equal(memoryGraphReadback(0, 0), "No memory graph nodes yet.");
  assert.equal(memoryGraphReadback(3, 0), "3 memory nodes with no graph edges yet.");
  assert.equal(memoryGraphReadback(3, 2), "3 memory nodes connected by 2 edges.");
});
