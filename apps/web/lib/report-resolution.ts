import type {
  ParticipantModerationReviewRequestRecord,
  ReporterModerationReportRecord,
} from "@station/types";

export const REPORT_RESOLUTION_STATUSES = ["open", "reviewing", "resolved", "dismissed"] as const;
export const REPORT_RESOLUTION_TARGET_TYPES = ["user", "space", "document", "thread", "comment", "persona"] as const;
export const REVIEW_REQUEST_STATUSES = ["open", "reviewing", "upheld", "denied", "dismissed", "withdrawn"] as const;

export type ReportResolutionStatus = typeof REPORT_RESOLUTION_STATUSES[number];
export type ReportResolutionTargetType = typeof REPORT_RESOLUTION_TARGET_TYPES[number];
export type ReviewRequestStatus = typeof REVIEW_REQUEST_STATUSES[number];

export function reportResolutionPath(input: {
  status?: ReportResolutionStatus | "all";
  targetType?: ReportResolutionTargetType | "all";
  limit?: number;
} = {}) {
  const params = new URLSearchParams();
  if (input.status && input.status !== "all") params.set("status", input.status);
  if (input.targetType && input.targetType !== "all") params.set("targetType", input.targetType);
  if (input.limit) params.set("limit", String(input.limit));
  const query = params.toString();
  return query ? `/reports/mine?${query}` : "/reports/mine";
}

export function reportResolutionTargetLabel(
  report: Pick<ReporterModerationReportRecord, "targetType" | "targetId">
) {
  return `${report.targetType}:${report.targetId}`;
}

export function reportResolutionStatusLabel(status: ReporterModerationReportRecord["status"]) {
  if (status === "open") return "Open";
  if (status === "reviewing") return "In review";
  if (status === "resolved") return "Resolved";
  return "Dismissed";
}

export function reviewRequestPath(input: {
  status?: ReviewRequestStatus | "all";
  targetType?: "thread" | "comment" | "all";
  limit?: number;
} = {}) {
  const params = new URLSearchParams();
  if (input.status && input.status !== "all") params.set("status", input.status);
  if (input.targetType && input.targetType !== "all") params.set("targetType", input.targetType);
  if (input.limit) params.set("limit", String(input.limit));
  const query = params.toString();
  return query ? `/reports/review-requests/mine?${query}` : "/reports/review-requests/mine";
}

export function canRequestReportReview(report: Pick<ReporterModerationReportRecord, "targetType">) {
  return report.targetType === "thread" || report.targetType === "comment";
}

export function existingReviewRequestForReport(
  report: Pick<ReporterModerationReportRecord, "id" | "targetType" | "targetId">,
  requests: Array<Pick<ParticipantModerationReviewRequestRecord, "reportId" | "targetType" | "targetId" | "status" | "resolutionSummary">>
) {
  return requests.find((request) =>
    request.reportId === report.id ||
    (
      !request.reportId &&
      request.targetType === report.targetType &&
      request.targetId === report.targetId &&
      (request.status === "open" || request.status === "reviewing")
    )
  ) ?? null;
}

export function reviewRequestStatusLabel(status: ParticipantModerationReviewRequestRecord["status"]) {
  if (status === "open") return "Open";
  if (status === "reviewing") return "In review";
  if (status === "upheld") return "Upheld";
  if (status === "denied") return "Denied";
  if (status === "dismissed") return "Dismissed";
  return "Withdrawn";
}
