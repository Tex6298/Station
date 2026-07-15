import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  notificationPreferenceStatus,
  NOTIFICATION_PREFERENCES_COPY,
  parseNotificationPreferencesResponse,
} from "./notification-preferences";

function source(path: string) {
  return readFileSync(path, "utf8");
}

test("notification preference response validation accepts only the authoritative boolean", () => {
  assert.deepEqual(parseNotificationPreferencesResponse({
    settings: { forumReplyNotificationsEnabled: true },
  }), { forumReplyNotificationsEnabled: true });
  assert.deepEqual(parseNotificationPreferencesResponse({
    settings: { forumReplyNotificationsEnabled: false },
  }), { forumReplyNotificationsEnabled: false });

  for (const value of [
    null,
    {},
    { settings: null },
    { settings: {} },
    { settings: { forumReplyNotificationsEnabled: "true" } },
    { settings: { forumReplyNotificationsEnabled: 1 } },
  ]) {
    assert.equal(parseNotificationPreferencesResponse(value), null);
  }
});

test("notification preference status copy matches the accepted state machine", () => {
  assert.equal(notificationPreferenceStatus({ loading: true, loadedValue: null }), "Loading saved preference...");
  assert.equal(notificationPreferenceStatus({ loadedValue: true }), "On");
  assert.equal(notificationPreferenceStatus({ loadedValue: false }), "Paused");
  assert.equal(notificationPreferenceStatus({ saving: true, loadedValue: true }), "Saving...");
  assert.equal(notificationPreferenceStatus({ loadedValue: true, savedValue: true }), "Forum reply notifications enabled.");
  assert.equal(notificationPreferenceStatus({ loadedValue: false, savedValue: false }), "Forum reply notifications paused.");
  assert.equal(notificationPreferenceStatus({ reconciling: true, loadedValue: false }), "Confirming current account setting...");
  assert.equal(notificationPreferenceStatus({ loadFailed: true, loadedValue: null }), "Could not load forum reply notifications. Reload Settings to try again.");
  assert.equal(notificationPreferenceStatus({ reconcileFailed: true, loadedValue: null }), "Could not confirm forum reply notifications. Reload Settings to try again.");
  assert.equal(notificationPreferenceStatus({ signedOut: true, loadedValue: null }), "Sign in again to manage forum reply notifications.");
});

test("notification preference copy exposes one live Forum replies control and four unavailable facts", () => {
  assert.equal(NOTIFICATION_PREFERENCES_COPY.title, "Notification Preferences");
  assert.equal(
    NOTIFICATION_PREFERENCES_COPY.summary,
    "Forum reply notifications are saved to your Station account. Moderation status updates remain enabled and are not controlled here."
  );
  assert.equal(NOTIFICATION_PREFERENCES_COPY.label, "Forum replies");
  assert.equal(
    NOTIFICATION_PREFERENCES_COPY.description,
    "Notify me in Station when someone else replies to a thread I authored or watch."
  );
  assert.equal(
    NOTIFICATION_PREFERENCES_COPY.unavailableIntro,
    "These categories are unavailable; Station does not create these notifications."
  );
  assert.deepEqual([...NOTIFICATION_PREFERENCES_COPY.unavailable], [
    "Archive completions",
    "Integrity session reminders",
    "Follower notifications",
    "Event reminders",
  ]);
});

test("Settings page replaces checked disabled placeholders with the live notification panel", () => {
  const page = source("apps/web/app/settings/page.tsx");
  assert.match(page, /NotificationPreferencesPanel/);
  assert.doesNotMatch(page, /Notification settings are not persisted yet/);
  assert.doesNotMatch(page, /defaultChecked disabled/);
});

test("notification preference panel is non-optimistic, stale guarded, and exposes no controls for unavailable categories", () => {
  const component = source("apps/web/components/settings/notification-preferences-panel.tsx");

  assert.match(component, /aria-label="Forum reply notifications"/);
  assert.match(component, /checked=\{checked\}/);
  assert.match(component, /disabled=\{disabled\}/);
  assert.doesNotMatch(component, /onMouseDown=/);
  const keydownHandler = component.match(/onKeyDown=\{\(event\) => \{[\s\S]*?(?=\s*onClick=)/)?.[0] ?? "";
  assert.match(keydownHandler, /event\.preventDefault\(\);/);
  assert.match(keydownHandler, /toggleForumReplies\(!checked\)/);
  assert.match(component, /event\.preventDefault\(\);\s*if \(!disabled\) void toggleForumReplies\(!checked\);/);
  assert.match(component, /generation = useRef\(0\)/);
  assert.match(component, /mounted = useRef\(true\)/);
  assert.match(component, /parseNotificationPreferencesResponse\(response\)/);
  assert.match(component, /getNotificationPreferences\(token\)/);
  assert.doesNotMatch(component, /localStorage|sessionStorage|document\.cookie|window\.location\.search/);
  assert.doesNotMatch(component, /defaultChecked/);

  const unavailableSection = component.slice(component.indexOf("NOTIFICATION_PREFERENCES_COPY.unavailable.map"));
  assert.doesNotMatch(unavailableSection, /input|button|role="switch"|type="checkbox"/);
});
