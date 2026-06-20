import type {
  AuthUser,
  CommunitySubcommunityRecord,
  DelegatedModerationReportRecord,
  ModerationReportTargetContext,
} from "@station/types";

export const DELEGATED_QUEUE_STATUSES = ["open", "reviewing", "resolved", "dismissed"] as const;
export type DelegatedQueueStatus = typeof DELEGATED_QUEUE_STATUSES[number];

const SAFE_REPORT_KEYS = new Set([
  "id",
  "targetType",
  "targetId",
  "reason",
  "status",
  "targetContext",
  "createdAt",
  "updatedAt",
]);

const SAFE_CONTEXT_ACTIONS = new Set(["hide", "unhide", "remove", "restore"]);

export function delegatedModerationPagePath(slug: string) {
  return `/forums/subcommunities/${encodeURIComponent(slug)}/moderation`;
}

export function delegatedModerationQueuePath(slug: string, input: { status?: DelegatedQueueStatus | "active"; limit?: number } = {}) {
  const params = new URLSearchParams();
  if (input.status && input.status !== "active") params.set("status", input.status);
  if (input.limit) params.set("limit", String(input.limit));
  const query = params.toString();
  return query
    ? `/forums/subcommunities/${encodeURIComponent(slug)}/moderation/reports?${query}`
    : `/forums/subcommunities/${encodeURIComponent(slug)}/moderation/reports`;
}

export function canUseDelegatedModerationQueue(
  user?: (AuthUser & { isAdmin?: boolean }) | null,
  subcommunity?: Pick<CommunitySubcommunityRecord, "ownerUserId" | "viewerCanModerate"> | null
) {
  return Boolean(user && (user.isAdmin || subcommunity?.ownerUserId === user.id || subcommunity?.viewerCanModerate));
}

export function delegatedReportTargetLabel(report: Pick<DelegatedModerationReportRecord, "targetType" | "targetId">) {
  return `${report.targetType}:${report.targetId}`;
}

export function delegatedReportContextLabel(
  report: Pick<DelegatedModerationReportRecord, "targetContext" | "targetType" | "targetId">
) {
  if (report.targetContext?.routeLabel) return report.targetContext.routeLabel;
  if (report.targetContext?.title) return report.targetContext.title;
  return delegatedReportTargetLabel(report);
}

export function delegatedReportRouteHref(report: Pick<DelegatedModerationReportRecord, "targetContext">) {
  return report.targetContext?.canOpenRoute && report.targetContext.routeHref
    ? report.targetContext.routeHref
    : null;
}

export function sanitizeDelegatedQueueReports(reports: unknown[]): DelegatedModerationReportRecord[] {
  return reports
    .map(sanitizeDelegatedQueueReport)
    .filter((report): report is DelegatedModerationReportRecord => Boolean(report));
}

export function delegatedReportVisibleKeys(report: object) {
  return Object.keys(report).filter((key) => SAFE_REPORT_KEYS.has(key));
}

function sanitizeDelegatedQueueReport(report: unknown): DelegatedModerationReportRecord | null {
  if (!report || typeof report !== "object") return null;
  const row = report as Partial<DelegatedModerationReportRecord> & Record<string, unknown>;
  if (row.targetType !== "thread" && row.targetType !== "comment") return null;
  if (!row.id || !row.targetId || !row.reason || !row.status || !row.createdAt || !row.updatedAt) {
    return null;
  }
  if (!DELEGATED_QUEUE_STATUSES.includes(row.status)) return null;

  return {
    id: String(row.id),
    targetType: row.targetType,
    targetId: String(row.targetId),
    reason: String(row.reason),
    status: row.status,
    targetContext: sanitizeTargetContext(row.targetContext),
    createdAt: String(row.createdAt),
    updatedAt: String(row.updatedAt),
  };
}

function sanitizeTargetContext(context: unknown): ModerationReportTargetContext | null {
  if (!context || typeof context !== "object") return null;
  const raw = context as Partial<ModerationReportTargetContext>;
  if (raw.targetType !== "thread" && raw.targetType !== "comment") return null;
  if (!raw.targetId) return null;

  const canOpenRoute = Boolean(raw.canOpenRoute && raw.routeHref);
  return {
    targetType: raw.targetType,
    targetId: String(raw.targetId),
    title: raw.title ?? null,
    parentType: raw.parentType ?? null,
    parentId: raw.parentId ?? null,
    status: raw.status ?? null,
    visibility: raw.visibility ?? null,
    moderationState: raw.moderationState ?? null,
    isHidden: raw.isHidden ?? null,
    routeHref: canOpenRoute ? String(raw.routeHref) : null,
    routeLabel: raw.routeLabel ?? null,
    canOpenRoute,
    unavailableReason: raw.unavailableReason ?? null,
    supportedActions: (raw.supportedActions ?? []).filter((action) =>
      SAFE_CONTEXT_ACTIONS.has(action)
    ) as ModerationReportTargetContext["supportedActions"],
  };
}
