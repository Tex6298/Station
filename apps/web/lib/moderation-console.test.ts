import assert from "node:assert/strict";
import test from "node:test";
import {
  canUseModeratorConsole,
  canActOnReportTarget,
  moderationConsoleHref,
  moderationConsoleReportFiltersFromSearch,
  nextReportStatuses,
  nextReviewRequestStatuses,
  nextTargetModerationActions,
  reportQueuePath,
  reportMatchesQueueFilter,
  reportTargetContextLabel,
  reportTargetLabel,
  reportTargetStateLabel,
  reportVisibleNotes,
  reviewRequestQueuePath,
  reviewRequestTargetLabel,
  targetActionPath,
} from "./moderation-console";

test("moderation console access is admin-only", () => {
  assert.equal(canUseModeratorConsole(null), false);
  assert.equal(canUseModeratorConsole({ id: "user-1", tier: "canon", isAdmin: false }), false);
  assert.equal(canUseModeratorConsole({ id: "admin-1", tier: "canon", isAdmin: true }), true);
});

test("moderation report queue paths preserve active default and bounded filters", () => {
  assert.equal(reportQueuePath(), "/reports");
  assert.equal(reportQueuePath({ status: "active", targetType: "all", limit: 50 }), "/reports?limit=50");
  assert.equal(reportQueuePath({ status: "reviewing", targetType: "comment", limit: 25 }), "/reports?status=reviewing&targetType=comment&limit=25");
  assert.equal(reportQueuePath({ status: "active", targetType: "persona", limit: 50 }), "/reports?targetType=persona&limit=50");
  assert.equal(
    reportQueuePath({ status: "active", targetType: "persona_encounter_public_exhibit", limit: 50 }),
    "/reports?targetType=persona_encounter_public_exhibit&limit=50"
  );
  assert.equal(moderationConsoleHref({ targetType: "persona" }), "/forums/moderation?targetType=persona");
  assert.deepEqual(
    moderationConsoleReportFiltersFromSearch(new URLSearchParams("targetType=persona")),
    { status: "active", targetType: "persona" }
  );
  assert.deepEqual(
    moderationConsoleReportFiltersFromSearch(new URLSearchParams("targetType=persona_encounter_public_exhibit")),
    { status: "active", targetType: "persona_encounter_public_exhibit" }
  );
  assert.deepEqual(
    moderationConsoleReportFiltersFromSearch({ status: "deleted", targetType: "550e8400-e29b-41d4-a716-446655440000" }),
    { status: "active", targetType: "all" }
  );
});

test("moderation report target labels do not invent route context", () => {
  assert.equal(reportTargetLabel({ targetType: "thread", targetId: "thread-1" }), "thread:thread-1");
  assert.equal(reportTargetLabel({ targetType: "document", targetId: "doc-1" }), "document:doc-1");
  assert.equal(reportTargetLabel({ targetType: "persona", targetId: "persona-private-id" }), "Persona report");
  assert.equal(
    reportTargetLabel({ targetType: "persona_encounter_public_exhibit", targetId: "public-exhibit-12345678" }),
    "Public encounter exhibit report"
  );
});

test("moderation report transitions use existing API statuses", () => {
  assert.deepEqual(nextReportStatuses("open"), ["reviewing", "resolved", "dismissed"]);
  assert.deepEqual(nextReportStatuses("reviewing"), ["resolved", "dismissed"]);
  assert.deepEqual(nextReportStatuses("resolved"), ["reviewing", "dismissed"]);
  assert.deepEqual(nextReportStatuses("dismissed"), ["reviewing", "resolved"]);
});

test("moderation target helpers keep actions and labels bounded to safe context", () => {
  assert.equal(targetActionPath({ targetType: "thread", targetId: "thread-1" }), "/threads/thread-1/moderation");
  assert.equal(targetActionPath({ targetType: "comment", targetId: "comment-1" }), "/comments/comment-1/moderation");
  assert.equal(targetActionPath({ targetType: "document", targetId: "doc-1" }), null);
  assert.equal(
    reportTargetContextLabel({
      targetType: "thread",
      targetId: "thread-1",
      targetContext: { targetType: "thread", targetId: "thread-1", routeLabel: "General / Thread", canOpenRoute: true, supportedActions: [] },
    }),
    "General / Thread"
  );
  const personaReport = {
    targetType: "persona" as const,
    targetId: "persona-private-id",
    notes: "Raw report body should not render in the human persona queue.",
    targetContext: {
      targetType: "persona" as const,
      targetId: "persona-private-id",
      title: "Public Persona",
      visibility: "public",
      routeHref: "/personas/public-persona",
      routeLabel: "Public Persona",
      canOpenRoute: true,
      supportedActions: [],
    },
  };
  assert.equal(reportTargetLabel(personaReport), "Public Persona");
  assert.equal(reportTargetContextLabel(personaReport), "Public Persona");
  assert.equal(reportTargetStateLabel(personaReport), "public");
  assert.equal(reportVisibleNotes(personaReport), null);
  assert.equal(JSON.stringify({
    label: reportTargetLabel(personaReport),
    contextLabel: reportTargetContextLabel(personaReport),
    state: reportTargetStateLabel(personaReport),
    notes: reportVisibleNotes(personaReport),
  }).includes("persona-private-id"), false);
  assert.equal(canActOnReportTarget({ targetType: "document", targetContext: undefined }), false);
  assert.equal(canActOnReportTarget(personaReport), false);
  assert.equal(targetActionPath({ targetType: "persona_encounter_public_exhibit", targetId: "public-exhibit-12345678" }), null);
  assert.equal(canActOnReportTarget({
    targetType: "persona_encounter_public_exhibit",
    targetContext: {
      targetType: "persona_encounter_public_exhibit",
      targetId: "public-exhibit-12345678",
      title: "Public encounter card",
      status: "published",
      routeHref: "/encounters/public-exhibit-12345678",
      routeLabel: "Public encounter card",
      canOpenRoute: true,
      supportedActions: ["remove"],
    },
  }), true);
  assert.deepEqual(
    nextTargetModerationActions({
      targetContext: { targetType: "comment", targetId: "comment-1", canOpenRoute: false, supportedActions: ["unhide", "remove"] },
    }),
    ["unhide", "remove"]
  );
});

test("moderation review request helpers keep admin paths and transitions separate", () => {
  assert.equal(reviewRequestQueuePath(), "/reports/review-requests");
  assert.equal(reviewRequestQueuePath({ status: "active", targetType: "all", limit: 50 }), "/reports/review-requests?limit=50");
  assert.equal(
    reviewRequestQueuePath({ status: "denied", targetType: "comment", limit: 10 }),
    "/reports/review-requests?status=denied&targetType=comment&limit=10"
  );
  assert.deepEqual(nextReviewRequestStatuses("open"), ["reviewing", "upheld", "denied", "dismissed"]);
  assert.deepEqual(nextReviewRequestStatuses("upheld"), ["reviewing", "denied", "dismissed"]);
  assert.equal(
    reviewRequestTargetLabel({ targetType: "thread", targetId: "thread-1", reportId: "report-1" }),
    "thread:thread-1 / report:report-1"
  );
});

test("moderation report filter matching keeps updated rows in the current queue only", () => {
  assert.equal(reportMatchesQueueFilter({ status: "open", targetType: "thread" }, { status: "active", targetType: "all" }), true);
  assert.equal(reportMatchesQueueFilter({ status: "resolved", targetType: "thread" }, { status: "active", targetType: "all" }), false);
  assert.equal(reportMatchesQueueFilter({ status: "resolved", targetType: "thread" }, { status: "resolved", targetType: "thread" }), true);
  assert.equal(reportMatchesQueueFilter({ status: "resolved", targetType: "document" }, { status: "resolved", targetType: "thread" }), false);
});
