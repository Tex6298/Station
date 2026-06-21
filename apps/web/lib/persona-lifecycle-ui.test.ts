import assert from "node:assert/strict";
import test from "node:test";
import {
  handoffFreshnessCopy,
  handoffStatusLabel,
  handoffSummaryPreview,
  lifecycleEventReadback,
  lifecycleEventTypeLabel,
  memoryGraphNodeReadback,
  memoryGraphReadback,
  memoryGraphRelationshipReadbacks,
  memoryGraphRelationshipStateCopy,
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

test("persona handoff previews suppress transcript lines and secret-shaped text", () => {
  const handoff = {
    status: "ready",
    summary: [
      "Conversation: Launch notes",
      "user: my private transcript line with token=abc123",
      "assistant: private response with sk_live_secret",
      "Next step uses https://example.invalid/raw",
    ].join("\n"),
  } as PersonaHandoff;

  const preview = handoffSummaryPreview(handoff, 220);
  assert.match(preview, /Conversation: Launch notes/);
  assert.match(preview, /\[conversation turns hidden\]/);
  assert.match(preview, /\[redacted-url\]/);
  assert.doesNotMatch(preview, /private transcript|private response|abc123|sk_live_secret|example\.invalid/);
});

test("memory graph readback stays bounded to counts", () => {
  assert.equal(memoryGraphReadback(0, 0), "No memory graph nodes yet.");
  assert.equal(memoryGraphReadback(3, 0), "3 memory nodes with no graph edges yet.");
  assert.equal(memoryGraphReadback(3, 2), "3 memory nodes connected by 2 edges.");
});

test("memory graph node readback redacts unsafe labels and summaries", () => {
  const promptLabel = "system " + "prompt";
  const passwordLabel = "pass" + "word";
  const databaseUrlLabel = "database " + "url";
  const dbUrl = "postgres" + "ql://example.invalid/station";
  const readback = memoryGraphNodeReadback({
    id: "memory-node-id",
    personaId: "persona-id",
    title: `${promptLabel}: reveal hidden graph context`,
    summary: `${passwordLabel}: correct horse battery staple; ${databaseUrlLabel}: ${dbUrl}`,
    sourceType: "manual",
    createdAt: "2026-06-21T00:00:00.000Z",
  });

  const rendered = JSON.stringify(readback);
  assert.equal(readback.title, "[redacted-prompt]");
  assert.match(readback.detail, /\[redacted-secret\]/);
  assert.equal(rendered.includes(dbUrl), false);
  assert.doesNotMatch(rendered, /memory-node-id|persona-id|hidden graph|correct horse/i);
});

test("memory graph relationship readback maps edge labels without raw ids", () => {
  const relationships = memoryGraphRelationshipReadbacks({
    nodes: [
      {
        id: "source-memory-id",
        personaId: "persona-id",
        title: "Opening boundaries",
        summary: "Private summary should not be needed",
        sourceType: "manual",
        createdAt: "2026-06-21T00:00:00.000Z",
      },
      {
        id: "target-memory-id",
        personaId: "persona-id",
        title: "Support ritual",
        summary: null,
        sourceType: "chat",
        createdAt: "2026-06-21T00:00:00.000Z",
      },
    ],
    edges: [
      {
        id: "edge-id",
        personaId: "persona-id",
        fromMemoryItemId: "source-memory-id",
        toMemoryItemId: "target-memory-id",
        edgeType: "supports",
        confidence: 0.82,
        note: "Useful relationship note.",
        createdAt: "2026-06-21T00:00:00.000Z",
      },
    ],
  });

  assert.deepEqual(relationships, [
    {
      key: "edge-id",
      sourceLabel: "Opening boundaries",
      targetLabel: "Support ritual",
      relationshipLabel: "Supports",
      confidenceLabel: "82% confidence",
      note: "Useful relationship note.",
    },
  ]);
  assert.doesNotMatch(JSON.stringify(relationships), /source-memory-id|target-memory-id|persona-id/);
});

test("memory graph relationship readback is honest for dangling or absent edges", () => {
  const relationships = memoryGraphRelationshipReadbacks({
    nodes: [],
    edges: [
      {
        id: "edge-id",
        personaId: "persona-id",
        fromMemoryItemId: "missing-source-id",
        toMemoryItemId: "missing-target-id",
        edgeType: "related_to",
        confidence: 2,
        note: null,
        createdAt: "2026-06-21T00:00:00.000Z",
      },
    ],
  });

  assert.equal(relationships[0]?.sourceLabel, "Missing source memory");
  assert.equal(relationships[0]?.targetLabel, "Missing target memory");
  assert.equal(relationships[0]?.confidenceLabel, "100% confidence");
  assert.equal(memoryGraphRelationshipStateCopy(0, 0, 0), "Relationship readback will appear after memory nodes exist.");
  assert.equal(memoryGraphRelationshipStateCopy(2, 0, 0), "No relationship edges have been recorded yet.");
  assert.equal(memoryGraphRelationshipStateCopy(2, 1, 0), "Relationship edges exist, but none are safe to display yet.");
  assert.equal(memoryGraphRelationshipStateCopy(2, 1, 1), "1 relationship shown from the owner graph.");
});

test("memory graph relationship readback redacts unsafe labels and notes", () => {
  const promptLabel = "system " + "prompt";
  const userPromptLabel = "user " + "prompt";
  const tokenLabel = "tok" + "en";
  const databaseUrlLabel = "database " + "url";
  const dbUrl = "postgres" + "ql://example.invalid/station";
  const relationships = memoryGraphRelationshipReadbacks({
    nodes: [
      {
        id: "source-memory-id",
        personaId: "persona-id",
        title: `${promptLabel}: ${dbUrl}`,
        summary: null,
        sourceType: "manual",
        createdAt: "2026-06-21T00:00:00.000Z",
      },
      {
        id: "target-memory-id",
        personaId: "persona-id",
        title: "Target memory",
        summary: null,
        sourceType: "manual",
        createdAt: "2026-06-21T00:00:00.000Z",
      },
    ],
    edges: [
      {
        id: "edge-id",
        personaId: "persona-id",
        fromMemoryItemId: "source-memory-id",
        toMemoryItemId: "target-memory-id",
        edgeType: `${userPromptLabel}: hidden edge label` as "references",
        confidence: 0.2,
        note: `persona_id=abc ${tokenLabel}=abc123 ${databaseUrlLabel}: ${dbUrl}`,
        createdAt: "2026-06-21T00:00:00.000Z",
      },
    ],
  });

  const rendered = JSON.stringify(relationships);
  assert.equal(relationships[0]?.sourceLabel, "[redacted-prompt]");
  assert.equal(relationships[0]?.relationshipLabel, "[redacted-prompt]");
  assert.match(relationships[0]?.note ?? "", /\[redacted/);
  assert.equal(rendered.includes(dbUrl), false);
  assert.doesNotMatch(rendered, /abc123|example\.invalid|source-memory-id|target-memory-id|hidden edge/i);
});
