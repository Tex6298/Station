import assert from "node:assert/strict";
import test from "node:test";
import {
  canUseDelegatedModerationQueue,
  canRenderDelegatedStatusControls,
  delegatedModerationPagePath,
  delegatedModerationQueuePath,
  delegatedReportContextLabel,
  delegatedReportRouteHref,
  delegatedReportStatusActionLabel,
  delegatedReportStatusLabel,
  delegatedReportStatusPath,
  delegatedReportTargetLabel,
  delegatedReportVisibleKeys,
  nextDelegatedReportStatuses,
  reportMatchesDelegatedQueueFilter,
  sanitizeDelegatedQueueReports,
  updateDelegatedReportInQueue,
} from "./delegated-moderation-queue";

test("delegated moderation queue paths stay scoped to one encoded subcommunity", () => {
  assert.equal(delegatedModerationPagePath("canon-lab"), "/forums/subcommunities/canon-lab/moderation");
  assert.equal(
    delegatedModerationQueuePath("canon lab", { status: "reviewing", limit: 25 }),
    "/forums/subcommunities/canon%20lab/moderation/reports?status=reviewing&limit=25"
  );
  assert.equal(
    delegatedModerationQueuePath("canon-lab", { status: "active", limit: 50 }),
    "/forums/subcommunities/canon-lab/moderation/reports?limit=50"
  );
  assert.equal(
    delegatedReportStatusPath("canon lab", "report/1"),
    "/forums/subcommunities/canon%20lab/moderation/reports/report%2F1"
  );
});

test("delegated moderation queue access accepts only admin, owner, or API-confirmed moderators", () => {
  const member = { id: "member-1", tier: "private" as const };
  assert.equal(canUseDelegatedModerationQueue(null, { ownerUserId: "owner-1" }), false);
  assert.equal(canUseDelegatedModerationQueue(member, null), false);
  assert.equal(canUseDelegatedModerationQueue(member, { ownerUserId: "owner-1" }), false);
  assert.equal(canUseDelegatedModerationQueue({ ...member, id: "owner-1" }, { ownerUserId: "owner-1" }), true);
  assert.equal(canUseDelegatedModerationQueue({ ...member, isAdmin: true }, {}), true);
  assert.equal(canUseDelegatedModerationQueue(member, { viewerCanModerate: true }), true);
  assert.equal(canRenderDelegatedStatusControls(member, { viewerCanModerate: true }), true);
  assert.equal(canRenderDelegatedStatusControls(member, { ownerUserId: "owner-1" }), false);
});

test("delegated status labels and transitions stay bounded to PR103 statuses", () => {
  assert.equal(delegatedReportStatusLabel("open"), "Open");
  assert.equal(delegatedReportStatusLabel("reviewing"), "Reviewing");
  assert.equal(delegatedReportStatusActionLabel("reviewing"), "Mark reviewing");
  assert.equal(delegatedReportStatusActionLabel("resolved"), "Resolve");
  assert.equal(delegatedReportStatusActionLabel("dismissed"), "Dismiss");
  assert.deepEqual(nextDelegatedReportStatuses("open"), ["reviewing", "resolved", "dismissed"]);
  assert.deepEqual(nextDelegatedReportStatuses("reviewing"), ["resolved", "dismissed"]);
  assert.deepEqual(nextDelegatedReportStatuses("resolved"), ["reviewing", "dismissed"]);
});

test("delegated moderation queue sanitizes unsupported rows and private fields", () => {
  const rows = sanitizeDelegatedQueueReports([
    {
      id: "report-thread",
      reporterUserId: "reporter-private",
      targetType: "thread",
      targetId: "thread-1",
      reason: "unsafe_thread",
      notes: "admin-private",
      status: "open",
      reviewedBy: "admin-private",
      targetContext: {
        targetType: "thread",
        targetId: "thread-1",
        title: "Visible title",
        canOpenRoute: false,
        routeHref: "/forums/raw/thread-1",
        unavailableReason: "No safe route.",
        supportedActions: ["hide", "pin", "remove"],
        body: "hidden body",
      },
      createdAt: "2026-06-20T10:00:00.000Z",
      updatedAt: "2026-06-20T10:00:00.000Z",
    },
    {
      id: "report-document",
      targetType: "document",
      targetId: "doc-1",
      reason: "unsupported",
      status: "open",
      createdAt: "2026-06-20T10:00:00.000Z",
      updatedAt: "2026-06-20T10:00:00.000Z",
    },
  ]);

  assert.equal(rows.length, 1);
  assert.deepEqual(delegatedReportVisibleKeys(rows[0]), [
    "id",
    "targetType",
    "targetId",
    "reason",
    "status",
    "targetContext",
    "createdAt",
    "updatedAt",
  ]);
  assert.equal(JSON.stringify(rows).includes("reporter-private"), false);
  assert.equal(JSON.stringify(rows).includes("admin-private"), false);
  assert.equal(JSON.stringify(rows).includes("hidden body"), false);
  assert.equal(rows[0].targetContext?.routeHref, null);
  assert.deepEqual(rows[0].targetContext?.supportedActions, ["hide", "remove"]);
});

test("delegated moderation queue labels do not invent target links", () => {
  const report = {
    id: "report-comment",
    targetType: "comment" as const,
    targetId: "comment-1",
    reason: "unsafe_comment",
    status: "reviewing" as const,
    targetContext: {
      targetType: "comment" as const,
      targetId: "comment-1",
      routeLabel: "Thread reply",
      parentType: "thread" as const,
      parentId: "thread-1",
      canOpenRoute: false,
      routeHref: "/forums/canon-lab/thread-1",
      supportedActions: [],
    },
    createdAt: "2026-06-20T10:00:00.000Z",
    updatedAt: "2026-06-20T10:00:00.000Z",
  };

  assert.equal(delegatedReportTargetLabel(report), "comment:comment-1");
  assert.equal(delegatedReportContextLabel(report), "Thread reply");
  assert.equal(delegatedReportRouteHref(report), null);
});

test("delegated queue row updates preserve active and explicit filters honestly", () => {
  const openReport = {
    id: "report-open",
    targetType: "thread" as const,
    targetId: "thread-1",
    reason: "unsafe_thread",
    status: "open" as const,
    createdAt: "2026-06-20T10:00:00.000Z",
    updatedAt: "2026-06-20T10:00:00.000Z",
  };
  const reviewingReport = { ...openReport, status: "reviewing" as const, updatedAt: "2026-06-20T10:01:00.000Z" };
  const resolvedReport = { ...openReport, status: "resolved" as const, updatedAt: "2026-06-20T10:02:00.000Z" };

  assert.equal(reportMatchesDelegatedQueueFilter(openReport, { status: "active" }), true);
  assert.equal(reportMatchesDelegatedQueueFilter(resolvedReport, { status: "active" }), false);
  assert.deepEqual(updateDelegatedReportInQueue([openReport], reviewingReport, { status: "active" }), [reviewingReport]);
  assert.deepEqual(updateDelegatedReportInQueue([reviewingReport], resolvedReport, { status: "active" }), []);
  assert.deepEqual(updateDelegatedReportInQueue([], resolvedReport, { status: "resolved" }), [resolvedReport]);
  assert.deepEqual(updateDelegatedReportInQueue([resolvedReport], resolvedReport, { status: "resolved" }), [resolvedReport]);
});
