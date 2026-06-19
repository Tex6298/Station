import assert from "node:assert/strict";
import test from "node:test";
import {
  reportResolutionPath,
  reportResolutionStatusLabel,
  reportResolutionTargetLabel,
} from "./report-resolution";

test("report resolution helper builds reporter-owned paths", () => {
  assert.equal(reportResolutionPath(), "/reports/mine");
  assert.equal(reportResolutionPath({ status: "all", targetType: "all", limit: 50 }), "/reports/mine?limit=50");
  assert.equal(
    reportResolutionPath({ status: "resolved", targetType: "comment", limit: 10 }),
    "/reports/mine?status=resolved&targetType=comment&limit=10"
  );
});

test("report resolution helper labels safe target ids and statuses", () => {
  assert.equal(reportResolutionTargetLabel({ targetType: "thread", targetId: "thread-1" }), "thread:thread-1");
  assert.equal(reportResolutionStatusLabel("open"), "Open");
  assert.equal(reportResolutionStatusLabel("reviewing"), "In review");
  assert.equal(reportResolutionStatusLabel("resolved"), "Resolved");
  assert.equal(reportResolutionStatusLabel("dismissed"), "Dismissed");
});
