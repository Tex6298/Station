import { ApiRequestError, type NotificationPreferences } from "./api-client";

export const NOTIFICATION_PREFERENCES_COPY = {
  title: "Notification Preferences",
  summary: "Forum reply notifications are saved to your Station account. Moderation status updates remain enabled and are not controlled here.",
  label: "Forum replies",
  description: "Notify me in Station when someone else replies to a thread I authored or watch.",
  unavailableIntro: "These categories are unavailable; Station does not create these notifications.",
  unavailable: [
    "Archive completions",
    "Integrity session reminders",
    "Follower notifications",
    "Event reminders",
  ],
} as const;

export type NotificationPreferenceNotice =
  | "Loading saved preference..."
  | "On"
  | "Paused"
  | "Saving..."
  | "Forum reply notifications enabled."
  | "Forum reply notifications paused."
  | "Confirming current account setting..."
  | "Current account setting reloaded."
  | "Could not load forum reply notifications. Reload Settings to try again."
  | "Could not confirm forum reply notifications. Reload Settings to try again."
  | "Sign in again to manage forum reply notifications.";

export function parseNotificationPreferencesResponse(input: unknown): NotificationPreferences | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const settings = (input as { settings?: unknown }).settings;
  if (!settings || typeof settings !== "object" || Array.isArray(settings)) return null;
  const value = (settings as { forumReplyNotificationsEnabled?: unknown }).forumReplyNotificationsEnabled;
  return typeof value === "boolean" ? { forumReplyNotificationsEnabled: value } : null;
}

export function notificationPreferenceStatus(input: {
  loading?: boolean;
  saving?: boolean;
  reconciling?: boolean;
  loadedValue: boolean | null;
  savedValue?: boolean | null;
  loadFailed?: boolean;
  reconcileFailed?: boolean;
  signedOut?: boolean;
}): NotificationPreferenceNotice {
  if (input.signedOut) return "Sign in again to manage forum reply notifications.";
  if (input.loadFailed) return "Could not load forum reply notifications. Reload Settings to try again.";
  if (input.reconcileFailed) return "Could not confirm forum reply notifications. Reload Settings to try again.";
  if (input.reconciling) return "Confirming current account setting...";
  if (input.saving) return "Saving...";
  if (input.savedValue === true) return "Forum reply notifications enabled.";
  if (input.savedValue === false) return "Forum reply notifications paused.";
  if (input.loading || input.loadedValue === null) return "Loading saved preference...";
  return input.loadedValue ? "On" : "Paused";
}

export function isAuthExpired(error: unknown) {
  return error instanceof ApiRequestError && error.status === 401;
}
