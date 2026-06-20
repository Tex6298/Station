import assert from "node:assert/strict";
import test from "node:test";
import {
  canRequestReportReview,
  existingReviewRequestForReport,
  reportResolutionPath,
  reportResolutionStatusLabel,
  reportResolutionTargetLabel,
  reviewRequestPath,
  reviewRequestStatusLabel,
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

test("review request helpers keep participant paths and eligibility bounded", () => {
  assert.equal(reviewRequestPath(), "/reports/review-requests/mine");
  assert.equal(reviewRequestPath({ status: "all", targetType: "all", limit: 50 }), "/reports/review-requests/mine?limit=50");
  assert.equal(
    reviewRequestPath({ status: "reviewing", targetType: "comment", limit: 10 }),
    "/reports/review-requests/mine?status=reviewing&targetType=comment&limit=10"
  );
  assert.equal(canRequestReportReview({ targetType: "thread" }), true);
  assert.equal(canRequestReportReview({ targetType: "comment" }), true);
  assert.equal(canRequestReportReview({ targetType: "persona" }), false);
  assert.equal(reviewRequestStatusLabel("upheld"), "Upheld");
});

test("review request helpers match existing active requests without leaking admin fields", () => {
  const report = { id: "report-1", targetType: "thread" as const, targetId: "thread-1" };
  assert.deepEqual(
    existingReviewRequestForReport(report, [
      { reportId: "other-report", targetType: "thread", targetId: "thread-1", status: "open" },
      { reportId: "report-1", targetType: "thread", targetId: "thread-1", status: "denied" },
    ]),
    { reportId: "report-1", targetType: "thread", targetId: "thread-1", status: "denied" }
  );
  assert.deepEqual(
    existingReviewRequestForReport(report, [
      { reportId: null, targetType: "thread", targetId: "thread-1", status: "reviewing" },
    ]),
    { reportId: null, targetType: "thread", targetId: "thread-1", status: "reviewing" }
  );
});
