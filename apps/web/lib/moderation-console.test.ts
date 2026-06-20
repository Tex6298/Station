import assert from "node:assert/strict";
import test from "node:test";
import {
  canUseModeratorConsole,
  canActOnReportTarget,
  nextReportStatuses,
  nextReviewRequestStatuses,
  nextTargetModerationActions,
  reportQueuePath,
  reportMatchesQueueFilter,
  reportTargetContextLabel,
  reportTargetLabel,
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
});

test("moderation report target labels do not invent route context", () => {
  assert.equal(reportTargetLabel({ targetType: "thread", targetId: "thread-1" }), "thread:thread-1");
  assert.equal(reportTargetLabel({ targetType: "document", targetId: "doc-1" }), "document:doc-1");
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
  assert.equal(canActOnReportTarget({ targetType: "document", targetContext: undefined }), false);
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
