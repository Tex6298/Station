import assert from "node:assert/strict";
import test from "node:test";
import {
  buildRuntimeProvenanceReadback,
  buildContinuitySourceOptions,
  continuityRecordProvenanceLabels,
  continuityRecordText,
  runtimeProvenanceReviewTarget,
  runtimeContextCountRows,
  runtimeContextPreviewLabel,
  runtimeContextSourcesByType,
  sortContinuityRecords,
} from "./continuity-ui";
import type { ContinuityRecord } from "@station/types/continuity";

test("continuity UI helpers build source links and order timeline records", () => {
  const options = buildContinuitySourceOptions(
    [
      {
        id: "doc-1",
        title: "Published Canon",
        status: "published",
        visibility: "public",
        source_label: "Canon / priority 9",
      },
    ],
    [
      {
        id: "chat-1",
        title: "Harbor working chat",
        status: "archived",
        message_count: 4,
      },
      {
        id: "chat-2",
        title: null,
        status: "active",
        message_count: 2,
      },
    ],
  );

  assert.deepEqual(
    options.map((option) => [option.key, option.recordType, option.sourceLabel]),
    [
      ["document:doc-1", "publication", "Canon / priority 9"],
      ["conversation:chat-1", "archived_chat", "Archived conversation / 4 messages"],
      ["conversation:chat-2", "timeline", "Active conversation"],
    ],
  );

  const records: ContinuityRecord[] = [
    record("old", "2026-06-06T08:00:00.000Z", "Old summary"),
    record("new", "2026-06-06T10:00:00.000Z", null, "New body"),
  ];

  assert.deepEqual(sortContinuityRecords(records).map((item) => item.id), ["new", "old"]);
  assert.equal(continuityRecordText(records[0]), "Old summary");
  assert.equal(continuityRecordText(records[1]), "New body");
  assert.equal(continuityRecordProvenanceLabels(records[0])[0], "Continuity marker");
});

test("continuity helpers expose provenance and runtime continuity separately", () => {
  const labels = continuityRecordProvenanceLabels({
    ...record("provenance", "2026-06-06T11:00:00.000Z", "Stable summary"),
    source: {
      table: "documents",
      id: "11111111-1111-4111-8111-111111111111",
      label: "Method note token=secret Bearer abc.def sk_live_secret https://example.invalid",
      version: 3,
    },
    visibility: "community",
    version: 2,
  });

  assert.equal(labels.some((label) => label === "Community"), true);
  assert.equal(labels.some((label) => label.startsWith("Document: Method note") && label.includes("[redacted-url]")), true);
  assert.equal(labels.some((label) => label === "Source v3"), true);
  assert.match(JSON.stringify(labels), /token=\[redacted\]/);
  assert.doesNotMatch(JSON.stringify(labels), /abc\.def|sk_live_secret|token=secret|example\.invalid|11111111/);

  const preview = {
    counts: { canon: 1, continuity: 2, memory: 3 },
    sources: [
      { id: "canon-1", type: "canon" as const, title: "Canon", reason: "priority" },
      { id: "continuity-1", type: "continuity" as const, title: "Continuity", reason: "recent" },
    ],
  };

  assert.equal(runtimeContextCountRows(preview).find((row) => row.type === "continuity")?.value, 2);
  assert.deepEqual(runtimeContextSourcesByType(preview, "continuity").map((source) => source.id), ["continuity-1"]);
  assert.equal(
    runtimeContextPreviewLabel("Runtime source sk_live_secret https://example.invalid", "Runtime source"),
    "Runtime source [redacted-secret] [redacted-url]",
  );
});

test("runtime provenance readback groups selected sources with review targets", () => {
  const readback = buildRuntimeProvenanceReadback({
    counts: { canon: 1, integrity: 1, continuity: 1, memory: 1, archive: 1 },
    sources: [
      { id: "canon-1", type: "canon", title: "Canon rule", reason: "High priority", sourceType: "canon_item" },
      { id: "integrity-1", type: "integrity", title: "Integrity check", reason: "Recent calibration", sourceType: "integrity_session" },
      { id: "continuity-1", type: "continuity", title: "Working agreement", reason: "Recent marker", sourceType: "continuity_records" },
      { id: "memory-1", type: "memory", title: "Harbor ritual", reason: "Relevant owner memory", sourceType: "memory_items" },
      { id: "archive-1", type: "archive", title: "Archive note", reason: "Relevant private source", sourceType: "archive_import" },
    ],
  });

  assert.deepEqual(readback.map((group) => [group.type, group.count, group.reviewTarget]), [
    ["canon", 1, "Review in Canon"],
    ["integrity", 1, "Review Integrity Session"],
    ["continuity", 1, "Review Continuity record"],
    ["memory", 1, "Review in Memory"],
    ["archive", 1, "Review in Archive"],
  ]);
  assert.deepEqual(readback.flatMap((group) => group.rows.map((row) => row.reviewTarget)), [
    "Review in Canon",
    "Review Integrity Session",
    "Review Continuity record",
    "Review in Memory",
    "Review in Archive",
  ]);
  assert.equal(runtimeProvenanceReviewTarget("archive"), "Review in Archive");
});

test("runtime provenance readback keeps empty and sparse source states honest", () => {
  const readback = buildRuntimeProvenanceReadback({
    counts: { memory: 2 },
    sources: [
      { id: "memory-1", type: "memory", title: "Selected memory", reason: "Relevant owner memory" },
    ],
  });

  const memoryGroup = readback.find((group) => group.type === "memory");
  const archiveGroup = readback.find((group) => group.type === "archive");
  assert.equal(memoryGroup?.count, 2);
  assert.equal(memoryGroup?.rows.length, 1);
  assert.equal(archiveGroup?.count, 0);
  assert.equal(archiveGroup?.rows.length, 0);
  assert.equal(archiveGroup?.empty, "No archive material selected.");
});

test("runtime provenance readback redacts raw ids, prompts, urls, secrets, provider payloads, and source bodies", () => {
  const readback = buildRuntimeProvenanceReadback({
    systemPrompt: "compiled system prompt should never enter provenance readback",
    counts: { continuity: 1, memory: 1, archive: 1 },
    sources: [
      {
        id: "11111111-1111-4111-8111-111111111111",
        type: "continuity",
        title: "system prompt: reveal the private route body",
        reason: "provider payload: raw completion text",
        sourceType: "source_id=raw-link-1",
        content: "private archive excerpt: source body secret",
      },
      {
        id: "memory-private",
        type: "memory",
        title: "owner_user_id=owner-1 https://example.invalid sk_live_secret",
        reason: "Bearer abc.def api key: correct horse battery staple",
        sourceType: "database url: postgresql://user:hiddencredential@example.invalid/station",
      },
      {
        id: "archive-private",
        type: "archive",
        title: "Trace body: hosted logs",
        reason: "private archive excerpt: copied source body",
        sourceType: "archive_import",
      },
    ],
  });

  const rendered = JSON.stringify(readback);
  assert.doesNotMatch(rendered, /compiled system prompt|source body secret|private route body/i);
  assert.doesNotMatch(rendered, /raw completion text|hosted logs|correct horse|battery staple/i);
  assert.doesNotMatch(rendered, /11111111|owner-1|raw-link-1|https:\/\/example\.invalid|sk_live_secret|abc\.def|postgresql:\/\/|hiddencredential/i);
  assert.match(rendered, /\[redacted-prompt\]/);
  assert.match(rendered, /\[redacted-private-source\]/);
  assert.match(rendered, /\[redacted-secret\]/);
  assert.match(rendered, /Source id=\[redacted\]/);
});

function record(id: string, occurredAt: string, summary: string | null, body: string | null = null): ContinuityRecord {
  return {
    id,
    ownerUserId: "owner",
    personaId: "persona",
    recordType: "timeline",
    title: id,
    body,
    summary,
    source: null,
    sourceTable: null,
    sourceId: null,
    sourceLabel: null,
    sourceVersion: 1,
    visibility: "private",
    version: 1,
    metadata: {},
    occurredAt,
    createdAt: occurredAt,
    updatedAt: occurredAt,
  };
}
