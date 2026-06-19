import type { ModerationReportRecord } from "@station/types";
import type { AuthUser } from "@station/types";

export const REPORT_QUEUE_STATUSES = ["open", "reviewing", "resolved", "dismissed"] as const;
export const REPORT_TARGET_TYPES = ["user", "space", "document", "thread", "comment", "persona"] as const;
export const REPORT_TRANSITION_STATUSES = ["reviewing", "resolved", "dismissed"] as const;

export type ReportQueueStatus = typeof REPORT_QUEUE_STATUSES[number];
export type ReportTargetType = typeof REPORT_TARGET_TYPES[number];
export type ReportTransitionStatus = typeof REPORT_TRANSITION_STATUSES[number];

export function canUseModeratorConsole(user?: (AuthUser & { isAdmin?: boolean }) | null) {
  return Boolean(user?.isAdmin);
}

export function reportQueuePath(input: {
  status?: ReportQueueStatus | "active";
  targetType?: ReportTargetType | "all";
  limit?: number;
} = {}) {
  const params = new URLSearchParams();
  if (input.status && input.status !== "active") params.set("status", input.status);
  if (input.targetType && input.targetType !== "all") params.set("targetType", input.targetType);
  if (input.limit) params.set("limit", String(input.limit));
  const query = params.toString();
  return query ? `/reports?${query}` : "/reports";
}

export function reportTargetLabel(report: Pick<ModerationReportRecord, "targetType" | "targetId">) {
  return `${report.targetType}:${report.targetId}`;
}

export function nextReportStatuses(current: ModerationReportRecord["status"]) {
  return REPORT_TRANSITION_STATUSES.filter((status) => status !== current);
}
