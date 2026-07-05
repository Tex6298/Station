import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  assistantActionEmptyCopy,
  assistantActionHrefIsOwnerSafe,
  assistantJobPostureCopy,
  assistantPromptFromSearch,
  assistantActionStatusLabel,
  assistantActionTone,
  assistantVisibleActions,
} from "./station-assistant-ui";

test("Station Assistant action helpers keep priority and status labels stable", () => {
  assert.equal(assistantActionTone({ kind: "import_issue", priority: "critical" }), "caution");
  assert.equal(assistantActionTone({ kind: "publishing", priority: "high" }), "primary");
  assert.equal(assistantActionTone({ kind: "archive_search", priority: "normal" }), "secondary");
  assert.equal(assistantActionStatusLabel({ kind: "import_review", priority: "critical", status: "pending" }), "pending");
  assert.equal(assistantActionStatusLabel({ kind: "import_progress", priority: "high", status: "owner readback" }), "owner readback");
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

test("Station Assistant launcher filters visible actions to existing owner-safe routes", () => {
  const actions = assistantVisibleActions([
    { id: "setup", href: "/studio/new", label: "Setup" },
    { id: "inbox", href: "/studio/personas/persona-1/memory-inbox", label: "Inbox" },
    { id: "archive", href: "/studio/archive", label: "Archive" },
    { id: "export", href: "/studio/export", label: "Export" },
    { id: "publish", href: "/studio/publishing", label: "Publish" },
    { id: "settings", href: "/settings", label: "Settings" },
    { id: "jobs", href: "/background-jobs", label: "Jobs" },
    { id: "discover", href: "/discover", label: "Discover" },
    { id: "oauth", href: "/archive-connectors/oauth/callback/provider", label: "OAuth" },
    { id: "billing", href: "/settings/billing", label: "Billing" },
    { id: "public", href: "/public/search", label: "Public search" },
  ]);

  assert.deepEqual(actions.map((action) => action.id), ["setup", "inbox", "archive", "export", "publish", "settings"]);
  assert.equal(assistantActionHrefIsOwnerSafe("/studio/personas/persona-1/files"), true);
  assert.equal(assistantActionHrefIsOwnerSafe("/studio/personas/persona-1/memory-inbox"), true);
  assert.equal(assistantActionHrefIsOwnerSafe("/background-jobs"), false);
  assert.equal(assistantActionHrefIsOwnerSafe("/discover"), false);
});

test("Station Assistant job posture copy stays honest without adding a job page route", () => {
  const copy = assistantJobPostureCopy();
  const component = readFileSync("apps/web/components/studio/station-assistant-panel.tsx", "utf8");

  assert.match(copy, /inline fallback/);
  assert.match(copy, /owner status\/readback/);
  assert.match(copy, /Queue-capable workers remain blocked/);
  assert.doesNotMatch(copy, /\/background-jobs|ready workers|durable queues are live/i);
  assert.match(component, /assistantJobPostureCopy/);
  assert.match(component, /assistantVisibleActions/);
  assert.doesNotMatch(component, /href="\/background-jobs"|href=\{["'`]\/background-jobs/i);
});
