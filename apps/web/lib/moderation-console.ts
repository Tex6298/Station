import type {
  AdminModerationReviewRequestRecord,
  ModerationReportRecord,
} from "@station/types";
import type { AuthUser } from "@station/types";

export const REPORT_QUEUE_STATUSES = ["open", "reviewing", "resolved", "dismissed"] as const;
export const REPORT_TARGET_TYPES = [
  "user",
  "space",
  "document",
  "thread",
  "comment",
  "persona",
  "persona_encounter_public_exhibit",
  "persona_encounter_cross_owner_public_exhibit",
  "persona_encounter_cross_owner_generated_publication",
] as const;
export const REPORT_TRANSITION_STATUSES = ["reviewing", "resolved", "dismissed"] as const;
export const REPORT_TARGET_ACTIONS = ["hide", "unhide", "remove", "restore"] as const;
export const REVIEW_QUEUE_STATUSES = ["open", "reviewing", "upheld", "denied", "dismissed"] as const;
export const REVIEW_TRANSITION_STATUSES = ["reviewing", "upheld", "denied", "dismissed"] as const;

export type ReportQueueStatus = typeof REPORT_QUEUE_STATUSES[number];
export type ReportTargetType = typeof REPORT_TARGET_TYPES[number];
export type ReportTransitionStatus = typeof REPORT_TRANSITION_STATUSES[number];
export type ReportTargetAction = typeof REPORT_TARGET_ACTIONS[number];
export type ReviewQueueStatus = typeof REVIEW_QUEUE_STATUSES[number];
export type ReviewTransitionStatus = typeof REVIEW_TRANSITION_STATUSES[number];
export type ReportQueueStatusFilter = ReportQueueStatus | "active";
export type ReportTargetTypeFilter = ReportTargetType | "all";
export type ReviewQueueStatusFilter = ReviewQueueStatus | "active";
type SearchParamSource = Pick<URLSearchParams, "get"> | Record<string, string | null | undefined>;

export function canUseModeratorConsole(user?: (AuthUser & { isAdmin?: boolean }) | null) {
  return Boolean(user?.isAdmin);
}

function searchValue(input: SearchParamSource, key: string) {
  const maybeGet = (input as { get?: unknown }).get;
  if (typeof maybeGet === "function") return maybeGet.call(input, key) as string | null;
  return (input as Record<string, string | null | undefined>)[key] ?? null;
}

export function normalizeReportQueueStatusFilter(value: string | null | undefined): ReportQueueStatusFilter {
  return REPORT_QUEUE_STATUSES.includes(value as ReportQueueStatus) ? value as ReportQueueStatus : "active";
}

export function normalizeReportTargetTypeFilter(value: string | null | undefined): ReportTargetTypeFilter {
  return REPORT_TARGET_TYPES.includes(value as ReportTargetType) ? value as ReportTargetType : "all";
}

export function moderationConsoleReportFiltersFromSearch(
  input: SearchParamSource
) {
  return {
    status: normalizeReportQueueStatusFilter(searchValue(input, "status")),
    targetType: normalizeReportTargetTypeFilter(searchValue(input, "targetType")),
  };
}

export function moderationConsoleHref(input: {
  status?: ReportQueueStatusFilter;
  targetType?: ReportTargetTypeFilter;
} = {}) {
  const params = new URLSearchParams();
  if (input.status && input.status !== "active") params.set("status", input.status);
  if (input.targetType && input.targetType !== "all") params.set("targetType", input.targetType);
  const query = params.toString();
  return query ? `/forums/moderation?${query}` : "/forums/moderation";
}

export function reportQueuePath(input: {
  status?: ReportQueueStatusFilter;
  targetType?: ReportTargetTypeFilter;
  limit?: number;
} = {}) {
  const params = new URLSearchParams();
  if (input.status && input.status !== "active") params.set("status", input.status);
  if (input.targetType && input.targetType !== "all") params.set("targetType", input.targetType);
  if (input.limit) params.set("limit", String(input.limit));
  const query = params.toString();
  return query ? `/reports?${query}` : "/reports";
}

function reportTargetFallbackLabel(report: Pick<ModerationReportRecord, "targetType" | "targetId">) {
  if (report.targetType === "persona") return "Persona report";
  if (report.targetType === "persona_encounter_public_exhibit") return "Public encounter exhibit report";
  if (report.targetType === "persona_encounter_cross_owner_public_exhibit") return "Cross-owner public exhibit report";
  if (report.targetType === "persona_encounter_cross_owner_generated_publication") {
    return "Cross-owner generated publication report";
  }
  return `${report.targetType}:${report.targetId}`;
}

export function reportTargetLabel(report: Pick<ModerationReportRecord, "targetContext" | "targetType" | "targetId">) {
  if (report.targetContext?.routeLabel) return report.targetContext.routeLabel;
  if (report.targetContext?.title) return report.targetContext.title;
  return reportTargetFallbackLabel(report);
}

export function reportTargetContextLabel(report: Pick<ModerationReportRecord, "targetContext" | "targetType" | "targetId">) {
  if (report.targetContext?.routeLabel) return report.targetContext.routeLabel;
  if (report.targetContext?.title) return report.targetContext.title;
  return reportTargetFallbackLabel(report);
}

export function reportTargetStateLabel(report: Pick<ModerationReportRecord, "targetContext">) {
  const context = report.targetContext;
  if (!context) return "unknown";
  return context.status ?? context.visibility ?? "unknown";
}

export function reportVisibleNotes(report: Pick<ModerationReportRecord, "targetType" | "notes">) {
  if (report.targetType === "persona") return null;
  return report.notes ?? null;
}

export function nextReportStatuses(current: ModerationReportRecord["status"]) {
  return REPORT_TRANSITION_STATUSES.filter((status) => status !== current);
}

export function reportMatchesQueueFilter(
  report: Pick<ModerationReportRecord, "status" | "targetType">,
  input: { status?: ReportQueueStatusFilter; targetType?: ReportTargetTypeFilter } = {}
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
    (
      report.targetType === "thread" ||
      report.targetType === "comment" ||
      report.targetType === "persona_encounter_public_exhibit" ||
      report.targetType === "persona_encounter_cross_owner_public_exhibit" ||
      report.targetType === "persona_encounter_cross_owner_generated_publication"
    ) &&
    report.targetContext?.supportedActions?.length
  );
}

export function nextTargetModerationActions(report: Pick<ModerationReportRecord, "targetContext">): ReportTargetAction[] {
  return (report.targetContext?.supportedActions ?? []).filter((action): action is ReportTargetAction =>
    REPORT_TARGET_ACTIONS.includes(action as ReportTargetAction)
  );
}

export function reviewRequestQueuePath(input: {
  status?: ReviewQueueStatus | "active";
  targetType?: "thread" | "comment" | "all";
  limit?: number;
} = {}) {
  const params = new URLSearchParams();
  if (input.status && input.status !== "active") params.set("status", input.status);
  if (input.targetType && input.targetType !== "all") params.set("targetType", input.targetType);
  if (input.limit) params.set("limit", String(input.limit));
  const query = params.toString();
  return query ? `/reports/review-requests?${query}` : "/reports/review-requests";
}

export function nextReviewRequestStatuses(current: AdminModerationReviewRequestRecord["status"]) {
  return REVIEW_TRANSITION_STATUSES.filter((status) => status !== current);
}

export function reviewRequestTargetLabel(
  request: Pick<AdminModerationReviewRequestRecord, "targetType" | "targetId" | "reportId">
) {
  const reportPart = request.reportId ? ` / report:${request.reportId}` : "";
  return `${request.targetType}:${request.targetId}${reportPart}`;
}
