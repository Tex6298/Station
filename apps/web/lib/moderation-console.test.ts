import assert from "node:assert/strict";
import test from "node:test";
import {
  canUseModeratorConsole,
  nextReportStatuses,
  reportQueuePath,
  reportTargetLabel,
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
