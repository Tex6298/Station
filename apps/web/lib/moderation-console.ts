import type { ModerationReportRecord } from "@station/types";
import type { AuthUser } from "@station/types";

export const REPORT_QUEUE_STATUSES = ["open", "reviewing", "resolved", "dismissed"] as const;
export const REPORT_TARGET_TYPES = ["user", "space", "document", "thread", "comment", "persona"] as const;
export const REPORT_TRANSITION_STATUSES = ["reviewing", "resolved", "dismissed"] as const;
export const REPORT_TARGET_ACTIONS = ["hide", "unhide", "remove", "restore"] as const;

export type ReportQueueStatus = typeof REPORT_QUEUE_STATUSES[number];
export type ReportTargetType = typeof REPORT_TARGET_TYPES[number];
export type ReportTransitionStatus = typeof REPORT_TRANSITION_STATUSES[number];
export type ReportTargetAction = typeof REPORT_TARGET_ACTIONS[number];

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

export function reportTargetContextLabel(report: Pick<ModerationReportRecord, "targetContext" | "targetType" | "targetId">) {
  if (report.targetContext?.routeLabel) return report.targetContext.routeLabel;
  if (report.targetContext?.title) return report.targetContext.title;
  return reportTargetLabel(report);
}

export function nextReportStatuses(current: ModerationReportRecord["status"]) {
  return REPORT_TRANSITION_STATUSES.filter((status) => status !== current);
}

export function reportMatchesQueueFilter(
  report: Pick<ModerationReportRecord, "status" | "targetType">,
  input: { status?: ReportQueueStatus | "active"; targetType?: ReportTargetType | "all" } = {}
) {
  if (input.targetType && input.targetType !== "all" && report.targetType !== input.targetType) {
    return false;
  }
  if (!input.status || input.status === "active") {
    return report.status === "open" || report.status === "reviewing";
  }
  return report.status === input.status;
}

export function targetActionPath(report: Pick<ModerationReportRecord, "targetType" | "targetId">) {
  if (report.targetType === "thread") return `/threads/${report.targetId}/moderation`;
  if (report.targetType === "comment") return `/comments/${report.targetId}/moderation`;
  return null;
}

export function canActOnReportTarget(report: Pick<ModerationReportRecord, "targetContext" | "targetType">) {
  return Boolean(
    (report.targetType === "thread" || report.targetType === "comment") &&
    report.targetContext?.supportedActions?.length
  );
}

export function nextTargetModerationActions(report: Pick<ModerationReportRecord, "targetContext">): ReportTargetAction[] {
  return (report.targetContext?.supportedActions ?? []).filter((action): action is ReportTargetAction =>
    REPORT_TARGET_ACTIONS.includes(action as ReportTargetAction)
  );
}
