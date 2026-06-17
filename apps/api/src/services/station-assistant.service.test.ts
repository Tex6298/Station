import assert from "node:assert/strict";
import test from "node:test";
import { composeStationAssistantReply, type StationAssistantSummary } from "./station-assistant.service";

const summary: StationAssistantSummary = {
  counts: {
    personas: 2,
    activeConversations: 1,
    archivedConversations: 3,
    memoryItems: 11,
    canonItems: 4,
    pendingContinuityCandidates: 2,
    draftDocuments: 1,
    publishedDocuments: 5,
    pendingImports: 1,
    failedImports: 1,
    spaces: 0,
    developerSpaces: 1,
    exportPackages: 0,
  },
  recent: {
    personas: [{ id: "33333333-3333-4333-8333-333333333333", name: "Harbor", visibility: "private" }],
    imports: [{ id: "import-1", sourceName: "claude-export.json", status: "failed" }],
    documents: [{ id: "doc-1", title: "Field log", status: "draft", documentType: "field_log" }],
  },
  nextActions: [
    { label: "Review Memory/Canon candidates", href: "/studio", kind: "primary" },
    { label: "Fix failed imports", href: "/studio/archive", kind: "caution" },
  ],
};

test("Station Assistant routes archive requests to archive/import actions", () => {
  const reply = composeStationAssistantReply("help me import a ChatGPT archive", summary);

  assert.equal(reply.role, "assistant");
  assert.equal(reply.intent, "archive");
  assert.match(reply.content, /Archive next step/);
  assert.equal(reply.actions[0].href, "/studio/archive");
  assert.match(reply.guardrail, /operational only/);
});

test("Station Assistant keeps publishing behind human review and provenance", () => {
  const reply = composeStationAssistantReply("publish this codex", summary);

  assert.equal(reply.intent, "publish");
  assert.match(reply.content, /provenance/);
  assert.match(reply.content, /human review/);
  assert.equal(reply.actions[0].href, "/studio/publish");
});

test("Station Assistant does not present itself as a persona", () => {
  const reply = composeStationAssistantReply("what should I do next?", summary);

  assert.doesNotMatch(reply.content, /my canon/i);
  assert.match(reply.guardrail, /no persona canon/);
});
