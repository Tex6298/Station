import type { ReporterModerationReportRecord } from "@station/types";

export const REPORT_RESOLUTION_STATUSES = ["open", "reviewing", "resolved", "dismissed"] as const;
export const REPORT_RESOLUTION_TARGET_TYPES = ["user", "space", "document", "thread", "comment", "persona"] as const;

export type ReportResolutionStatus = typeof REPORT_RESOLUTION_STATUSES[number];
export type ReportResolutionTargetType = typeof REPORT_RESOLUTION_TARGET_TYPES[number];

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
