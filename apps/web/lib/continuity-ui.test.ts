import assert from "node:assert/strict";
import test from "node:test";
import {
  buildContinuitySourceOptions,
  continuityRecordText,
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
