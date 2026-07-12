import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  importPreviewCanConfirm,
  importPreviewFailureCopy,
  importPreviewInputKey,
  importPreviewNoWriteCopy,
  importPreviewStatusCopy,
  type ImportPreviewReadback,
} from "./import-preview";
import {
  importBackedCandidateInboxPath,
  continuityCandidateInboxPath,
  importReviewCandidateLabel,
  importReviewDestinationLabel,
  importReviewEmptyCopy,
  importReviewOutcomeLabel,
  importReviewPreservationCopy,
  importReviewSourceLabel,
  importReviewSourceTypeLabel,
  importReviewStatusLabel,
  importReviewSummary,
} from "./import-review";

test("import-backed candidate inbox path stays scoped to import candidates", () => {
  assert.equal(
    importBackedCandidateInboxPath("persona-1"),
    "/conversations/persona/persona-1/candidates?source=import&status=all",
  );
  assert.doesNotMatch(importBackedCandidateInboxPath("persona-1"), /source=all|candidates\/inbox/);
});

test("continuity inbox path requests pending suggestions from every private source", () => {
  assert.equal(
    continuityCandidateInboxPath("persona/one"),
    "/conversations/persona/persona%2Fone/candidates?source=all&status=pending",
  );
});

test("import review helpers summarize pending, reviewed, memory, and canon candidates", () => {
  const summary = importReviewSummary([
    { candidateType: "memory", status: "pending", sourceLabel: "chatgpt.json" },
    { candidateType: "canon", status: "pending", sourceLabel: "reddit.json" },
    { candidateType: "memory", status: "accepted", sourceLabel: "discord.json" },
    { candidateType: "canon", status: "rejected", sourceLabel: "claude.json" },
  ]);

  assert.deepEqual(summary, {
    total: 4,
    pending: 2,
    reviewed: 2,
    memory: 2,
    canon: 2,
  });
});

test("import review helpers keep source labels and empty states owner-friendly", () => {
  assert.equal(importReviewSourceLabel({ sourceLabel: " discord.json (discord import) " }), "discord.json (discord import)");
  assert.equal(importReviewSourceLabel({ sourceLabel: "" }), "Imported source");
  assert.equal(importReviewSourceTypeLabel({ sourceTable: "persona_files" }), "Private import source");
  assert.equal(
    importReviewSourceLabel({ archivedChatTranscriptId: "transcript-1", sourceLabel: null, sourceTable: null }),
    "Archived conversation",
  );
  assert.equal(
    importReviewSourceTypeLabel({ archivedChatTranscriptId: "transcript-1", sourceTable: null }),
    "Archived conversation",
  );
  assert.equal(importReviewStatusLabel("accepted"), "Accepted");
  assert.match(importReviewEmptyCopy(0), /Upload or paste source material/);
  assert.match(importReviewEmptyCopy(2), /No import review candidates are waiting/);
  assert.match(importReviewEmptyCopy(0, "continuity"), /archived conversations/);
});

test("import review helpers label destinations, outcomes, and preservation behavior", () => {
  assert.equal(importReviewCandidateLabel("memory"), "Memory candidate");
  assert.equal(importReviewCandidateLabel("canon"), "Canon candidate");
  assert.equal(importReviewDestinationLabel("memory"), "Memory");
  assert.equal(importReviewDestinationLabel("canon"), "Canon");
  assert.equal(
    importReviewOutcomeLabel({ candidateType: "memory", status: "pending" }),
    "Pending review for Memory"
  );
  assert.equal(
    importReviewOutcomeLabel({ candidateType: "canon", status: "accepted", acceptedTargetType: "canon" }),
    "Accepted to Canon"
  );
  assert.equal(
    importReviewOutcomeLabel({ candidateType: "memory", status: "rejected" }),
    "Rejected; source preserved"
  );
  assert.match(
    importReviewPreservationCopy({ candidateType: "canon", status: "pending" }),
    /Accept writes the edited text to Canon/
  );
  assert.match(
    importReviewPreservationCopy({ candidateType: "memory", status: "rejected" }),
    /not promoted into runtime material/
  );
  assert.match(
    importReviewPreservationCopy({
      archivedChatTranscriptId: "transcript-1",
      candidateType: "memory",
      status: "accepted",
    }),
    /archived conversation stays preserved privately/
  );
});

test("import review source labels redact private identifiers and secret-shaped values", () => {
  const label = importReviewSourceLabel({
    sourceLabel: "https://example.com/a token=abc123 bearer abc123 ghp_secret 123e4567-e89b-12d3-a456-426614174000",
  });

  assert.match(label, /\[redacted-url\]/);
  assert.match(label, /token=\[redacted\]/);
  assert.match(label, /\[redacted-secret\]/);
  assert.match(label, /\[id\]/);
  assert.doesNotMatch(label, /https:\/\//);
  assert.doesNotMatch(label, /ghp_secret/);
  assert.doesNotMatch(label, /bearer abc123/);
});

test("memory inbox route uses the owner-scoped pending continuity candidate API", () => {
  const page = readFileSync("apps/web/app/studio/personas/[personaId]/memory-inbox/page.tsx", "utf8");
  const component = readFileSync("apps/web/components/studio/import-review-inbox.tsx", "utf8");

  assert.match(page, /continuityCandidateInboxPath\(personaId\)/);
  assert.match(page, /Memory Inbox/);
  assert.match(page, /\/memory`\}/);
  assert.match(page, /\/continuity`\}/);
  assert.match(page, /\/calibration`\}/);
  assert.match(component, /\/conversations\/candidates\/\$\{candidate\.id\}/);
  assert.doesNotMatch(page, /\/conversations\/candidates\/inbox|sendPersonaChatWithStream|returnToThread|return-to-thread/i);
  assert.doesNotMatch(page, /archive-connectors|source_inventory|cloudflare|redis|stripe|billing|new Queue|Worker\(|social connector|provider payload|prompt context/i);
  assert.doesNotMatch(page, /sourceId|sourceMessageIds|storagePath|ownerUserId|persona_files|archived_chat_transcripts/i);
});

test("import preview helpers require exact preview confirmation and no-write readback", () => {
  const preview: ImportPreviewReadback = {
    status: "preview_ready",
    sourceKind: "file",
    sourceLabel: "discord.json",
    format: "discord",
    formatLabel: "Discord JSON archive",
    sourceFamily: "community_export",
    estimatedCharacters: 1234,
    estimatedLineCount: 2,
    messageCount: 2,
    noWritePerformed: true,
    nextOwnerAction: "Review this summary, then confirm import to write private archive material for this persona.",
    safety: {
      rawSourceReturned: false,
      storageReserved: false,
      importJobCreated: false,
      archiveWritten: false,
      importReviewCreated: false,
      providerCalls: false,
    },
  };
  const key = importPreviewInputKey({
    sourceKind: "file",
    sourceName: "discord.json",
    fileType: "application/json",
    size: 400,
    lastModified: 1000,
    content: "{\"messages\":[]}",
  });

  assert.equal(importPreviewCanConfirm(preview, key, key), true);
  assert.equal(importPreviewCanConfirm(preview, key, `${key}-changed`), false);
  assert.equal(importPreviewCanConfirm(null, key, key), false);
  assert.match(importPreviewStatusCopy(preview), /Discord JSON archive previewed/);
  assert.match(importPreviewStatusCopy(preview), /2 messages/);
  assert.match(importPreviewNoWriteCopy(null), /Preview first/);
  assert.match(importPreviewNoWriteCopy(preview), /confirm import/);
});

test("import preview UI source keeps preview before write endpoints", () => {
  const page = readFileSync("apps/web/app/studio/personas/[personaId]/files/page.tsx", "utf8");

  assert.match(page, /previewText/);
  assert.match(page, /previewFile/);
  assert.match(page, /\/imports\/preview/);
  assert.match(page, /Confirm import pasted source/);
  assert.match(page, /Confirm upload file import/);
  assert.match(page, /importPreviewCanConfirm/);
  assert.match(page, /file\.text\(\)/);
  assert.match(page, /upload-url/);

  const previewIndex = page.indexOf("/imports/preview");
  const uploadIndex = page.indexOf("upload-url");
  const registerIndex = page.indexOf("/register");
  assert.equal(previewIndex >= 0 && uploadIndex >= 0 && registerIndex >= 0, true);
  assert.equal(previewIndex < uploadIndex, true);
  assert.equal(previewIndex < registerIndex, true);
  assert.doesNotMatch(page, /connect your|OAuth token|bot token|recurring sync|automatic import/i);
});

test("import preview failure copy does not echo private source or infrastructure details", () => {
  assert.equal(
    importPreviewFailureCopy(new Error("private-source-marker token=abc123 https://example.invalid SQL stack trace")),
    "Could not preview this source. Existing archive material remains safe.",
  );
  assert.match(
    importPreviewFailureCopy(new Error("Unsupported JSON import format")),
    /Unsupported JSON import format/,
  );
});
