import assert from "node:assert/strict";
import test from "node:test";
import {
  canUseThreadWatch,
  markAllNotificationsReadPath,
  markNotificationReadPath,
  notificationListPath,
  notificationReadLabel,
  notificationTypeLabel,
  notificationVisibleSummary,
  safeNotificationHref,
  threadWatchPath,
} from "./community-notifications";

test("notification helpers build only current-user API paths", () => {
  assert.equal(notificationListPath(), "/notifications?unreadOnly=true");
  assert.equal(notificationListPath({ filter: "all", limit: 25 }), "/notifications?limit=25");
  assert.equal(notificationListPath({ filter: "unread", limit: 10 }), "/notifications?unreadOnly=true&limit=10");
  assert.equal(markNotificationReadPath("notification-1"), "/notifications/notification-1/read");
  assert.equal(markAllNotificationsReadPath(), "/notifications/read-all");
  assert.equal(threadWatchPath("thread-1"), "/threads/thread-1/watch");
});

test("notification labels and links stay bounded to safe API-provided fields", () => {
  assert.equal(notificationTypeLabel("thread_comment"), "Thread reply");
  assert.equal(notificationTypeLabel("report_status"), "Report update");
  assert.equal(notificationTypeLabel("review_request_status"), "Review request update");
  assert.equal(notificationReadLabel({ readAt: null }), "Unread");
  assert.equal(notificationReadLabel({ readAt: "2026-06-20T03:00:00.000Z" }), "Read");
  assert.equal(safeNotificationHref({ routeHref: "/forums/community/thread-1" }), "/forums/community/thread-1");
  assert.equal(safeNotificationHref({ routeHref: "https://example.test/thread-1" }), null);
  assert.equal(safeNotificationHref({ routeHref: "//example.test/thread-1" }), null);
  assert.equal(notificationVisibleSummary({ title: "Report update", summary: "  " }), "Report update");
  assert.equal(notificationVisibleSummary({ title: "Report update", summary: "Your report is now resolved." }), "Your report is now resolved.");
});

test("thread watch eligibility follows existing private-tier participation gate", () => {
  assert.equal(canUseThreadWatch(null), false);
  assert.equal(canUseThreadWatch({ id: "visitor", tier: "visitor", isAdmin: false }), false);
  assert.equal(canUseThreadWatch({ id: "member", tier: "private", isAdmin: false }), true);
  assert.equal(canUseThreadWatch({ id: "admin", tier: "visitor", isAdmin: true }), true);
});
