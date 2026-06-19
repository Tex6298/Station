import assert from "node:assert/strict";
import test from "node:test";
import {
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
  assert.equal(importReviewStatusLabel("accepted"), "Accepted");
  assert.match(importReviewEmptyCopy(0), /Upload or paste source material/);
  assert.match(importReviewEmptyCopy(2), /No import review candidates are waiting/);
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
