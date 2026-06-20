import { canCreateThread } from "@station/auth";
import type { AuthUser, CommunityNotificationRecord, CommunityNotificationType } from "@station/types";

export const NOTIFICATION_FILTERS = ["unread", "all"] as const;
export type NotificationFilter = typeof NOTIFICATION_FILTERS[number];

export function notificationListPath(input: { filter?: NotificationFilter; limit?: number } = {}) {
  const params = new URLSearchParams();
  if ((input.filter ?? "unread") === "unread") params.set("unreadOnly", "true");
  if (input.limit) params.set("limit", String(input.limit));
  const query = params.toString();
  return query ? `/notifications?${query}` : "/notifications";
}

export function markNotificationReadPath(notificationId: string) {
  return `/notifications/${notificationId}/read`;
}

export function markAllNotificationsReadPath() {
  return "/notifications/read-all";
}

export function threadWatchPath(threadId: string) {
  return `/threads/${threadId}/watch`;
}

export function canUseThreadWatch(user: AuthUser | null | undefined) {
  return canCreateThread(user ?? null);
}

export function notificationTypeLabel(type: CommunityNotificationType) {
  if (type === "thread_comment") return "Thread reply";
  if (type === "report_status") return "Report update";
  return "Review request update";
}

export function notificationReadLabel(notification: Pick<CommunityNotificationRecord, "readAt">) {
  return notification.readAt ? "Read" : "Unread";
}

export function safeNotificationHref(notification: Pick<CommunityNotificationRecord, "routeHref">) {
  const href = notification.routeHref ?? null;
  if (!href) return null;
  if (!href.startsWith("/") || href.startsWith("//")) return null;
  return href;
}

export function notificationVisibleSummary(notification: Pick<CommunityNotificationRecord, "title" | "summary">) {
  return notification.summary?.trim() || notification.title;
}
