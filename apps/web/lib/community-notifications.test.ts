import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
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
  assert.equal(canUseThreadWatch({ id: "admin", tier: "visitor", isAdmin: true }), false);
  assert.equal(canUseThreadWatch({ id: "admin", tier: "canon", isAdmin: true }), true);
});

test("forum thread watch panel fails closed on unreadable or ambiguous watch state", () => {
  const source = readFileSync("apps/web/app/forums/[categorySlug]/[threadId]/page.tsx", "utf8");
  assert.match(source, /type WatchViewState =/);
  assert.match(source, /status: "ready"; isWatching: boolean/);
  assert.match(source, /status: "error"; kind: "load" \| "update"/);
  assert.match(source, /parseThreadWatchResponse/);
  assert.match(source, /typeof candidate\.isWatching !== "boolean"/);
  assert.match(source, /data\.isWatching !== expectedIsWatching/);
  assert.match(source, /Watch state unavailable/);
  assert.match(source, /Station could not confirm whether you are watching this thread\. Retry before changing watch state\./);
  assert.match(source, /Watch change unconfirmed/);
  assert.match(source, /Station could not confirm the result of that change\. Reload watch state before trying again\./);
  assert.match(source, /Retry watch state/);

  const errorPanelStart = source.indexOf("if (state.status === \"error\")");
  const errorPanelEnd = source.indexOf("if (state.status === \"ready\")", errorPanelStart);
  assert.notEqual(errorPanelStart, -1);
  assert.notEqual(errorPanelEnd, -1);
  const errorPanel = source.slice(errorPanelStart, errorPanelEnd);
  assert.doesNotMatch(errorPanel, /apiPut|apiDelete|toggleThreadWatch|Watch thread|Unwatch thread|Watching replies|Not watching/);
  assert.doesNotMatch(source, /setWatchFeedback\(e instanceof Error|Could not load watch state|Could not update watch state/);
  assert.doesNotMatch(source, /watchState\\?\\.isWatching\\s*\\?/);
});
