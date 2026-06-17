import assert from "node:assert/strict";
import test from "node:test";
import {
  importReviewEmptyCopy,
  importReviewSourceLabel,
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
  assert.equal(importReviewStatusLabel("accepted"), "Accepted");
  assert.match(importReviewEmptyCopy(0), /Upload or paste source material/);
  assert.match(importReviewEmptyCopy(2), /No import review candidates are waiting/);
});
