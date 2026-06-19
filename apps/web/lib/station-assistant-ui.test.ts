import assert from "node:assert/strict";
import test from "node:test";
import {
  assistantActionEmptyCopy,
  assistantPromptFromSearch,
  assistantActionStatusLabel,
  assistantActionTone,
} from "./station-assistant-ui";

test("Station Assistant action helpers keep priority and status labels stable", () => {
  assert.equal(assistantActionTone({ kind: "import_issue", priority: "critical" }), "caution");
  assert.equal(assistantActionTone({ kind: "publishing", priority: "high" }), "primary");
  assert.equal(assistantActionTone({ kind: "archive_search", priority: "normal" }), "secondary");
  assert.equal(assistantActionStatusLabel({ kind: "import_review", priority: "critical", status: "pending" }), "pending");
  assert.equal(assistantActionStatusLabel({ kind: "archive_search", priority: "normal" }), "archive search");
});

test("Station Assistant empty copy stays honest about owner-controlled actions", () => {
  assert.match(assistantActionEmptyCopy(0), /owner-controlled/);
  assert.match(assistantActionEmptyCopy(2), /live next actions/);
});

test("Station Assistant prompt helper reads bounded onboarding prompts", () => {
  assert.equal(assistantPromptFromSearch("?prompt=Help%20me%20start"), "Help me start");
  assert.equal(assistantPromptFromSearch("?other=value"), null);
  assert.equal(assistantPromptFromSearch(`?prompt=${"a".repeat(240)}`)?.length, 220);
});
