
import { Router } from "express";
import { z } from "zod";
import type { Database } from "@station/db";
import { requireAuth } from "../middleware/require-auth";
import { requireTier } from "../middleware/require-tier";
import { getSupabaseAdmin } from "../lib/supabase";
import { ownerCanExposeExistingPublicPersonas } from "../lib/public-persona-eligibility";
import { publicPersonaRouteHref } from "../lib/persona-serialization";
import type {
  AdminModerationReviewRequestRecord,
  ModerationReportRecord,
  ModerationReportTargetContext,
  ParticipantModerationReviewRequestRecord,
  ReporterModerationReportRecord,
} from "@station/types";
import { ensureCommunityProfile } from "../services/community.service";
import { notifyReportStatus, notifyReviewRequestStatus } from "../services/community-notifications.service";

const createReportSchema = z.object({
  targetType: z.enum([
    "user",
    "space",
    "document",
    "thread",
    "comment",
    "persona",
    "persona_encounter_public_exhibit",
    "persona_encounter_cross_owner_public_exhibit",
  ]),
  targetId: z.string().min(1),
  reason: z.string().min(1),
  notes: z.string().optional(),
});
const reportStatusSchema = z.enum(["open", "reviewing", "resolved", "dismissed"]);
const publicExhibitTargetActionSchema = z.enum(["remove", "restore"]);
const reportQueueQuerySchema = z.object({
  status: reportStatusSchema.optional(),
  targetType: createReportSchema.shape.targetType.optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});
const updateReportStatusSchema = z.object({
  status: z.enum(["reviewing", "resolved", "dismissed"]),
  targetAction: publicExhibitTargetActionSchema.optional(),
});
const reviewRequestTargetTypeSchema = z.enum(["thread", "comment"]);
const reviewRequestStatusSchema = z.enum(["open", "reviewing", "upheld", "denied", "dismissed", "withdrawn"]);
const createReviewRequestSchema = z.object({
  reportId: z.string().min(1).optional(),
  targetType: reviewRequestTargetTypeSchema.optional(),
  targetId: z.string().min(1).optional(),
  reason: z.string().min(1).max(1000),
}).refine((value) => Boolean(value.reportId || (value.targetType && value.targetId)), {
  message: "Provide reportId or targetType and targetId.",
});
const reviewRequestQuerySchema = z.object({
  status: reviewRequestStatusSchema.optional(),
  targetType: reviewRequestTargetTypeSchema.optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});
const updateReviewRequestSchema = z.object({
  status: z.enum(["reviewing", "upheld", "denied", "dismissed"]),
  resolutionSummary: z.string().max(1000).nullable().optional(),
  adminNotes: z.string().max(2000).nullable().optional(),
});

export const reportsRouter = Router();
reportsRouter.use(requireAuth);

type ModerationReportRow = Database["public"]["Tables"]["moderation_reports"]["Row"];
type ModerationReviewRequestRow = Database["public"]["Tables"]["moderation_review_requests"]["Row"];
type ModerationReportTargetType = ModerationReportRow["target_type"];
const ACTIVE_REPORT_STATUSES = new Set(["open", "reviewing"]);
const ACTIVE_REVIEW_REQUEST_STATUSES = new Set(["open", "reviewing"]);
const PUBLIC_EXHIBIT_REPORT_TARGET_TYPES = new Set<ModerationReportTargetType>([
  "persona_encounter_public_exhibit",
  "persona_encounter_cross_owner_public_exhibit",
]);

function serializeReport(
  row: ModerationReportRow,
  targetContext?: ModerationReportTargetContext | null
): ModerationReportRecord {
  const report: ModerationReportRecord = {
    id: row.id,
    reporterUserId: row.reporter_id,
    targetType: row.target_type,
    targetId: row.target_id,
    reason: row.reason,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };

  if (row.notes !== null) report.notes = row.notes;
  if (row.reviewed_by !== null) report.reviewedBy = row.reviewed_by;
  if (row.reviewed_at !== null) report.reviewedAt = row.reviewed_at;
  if (targetContext) report.targetContext = targetContext;

  return report;
}

function serializeReporterReport(row: ModerationReportRow): ReporterModerationReportRecord {
  const report: ReporterModerationReportRecord = {
    id: row.id,
    targetType: row.target_type,
    targetId: row.target_id,
    reason: row.reason,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };

  if (row.reviewed_at !== null) report.reviewedAt = row.reviewed_at;

  return report;
}

function serializeParticipantReviewRequest(
  row: ModerationReviewRequestRow,
  options: { includeLinkedReportId?: boolean } = {}
): ParticipantModerationReviewRequestRecord {
  const request: ParticipantModerationReviewRequestRecord = {
    id: row.id,
    requesterRole: row.requester_role,
    targetType: row.target_type,
    targetId: row.target_id,
    reason: row.reason,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };

  const includeLinkedReportId = options.includeLinkedReportId ?? row.requester_role === "reporter";
  if (includeLinkedReportId && row.report_id !== null) request.reportId = row.report_id;
  if (row.resolution_summary !== null) request.resolutionSummary = row.resolution_summary;
  if (row.reviewed_at !== null) request.reviewedAt = row.reviewed_at;

  return request;
}

function serializeAdminReviewRequest(row: ModerationReviewRequestRow): AdminModerationReviewRequestRecord {
  const request: AdminModerationReviewRequestRecord = {
    ...serializeParticipantReviewRequest(row, { includeLinkedReportId: true }),
    requesterUserId: row.requester_id,
  };

  if (row.moderation_action_id !== null) request.moderationActionId = row.moderation_action_id;
  if (row.admin_notes !== null) request.adminNotes = row.admin_notes;
  if (row.reviewed_by !== null) request.reviewedBy = row.reviewed_by;

  return request;
}

function requireAdmin(req: { user?: { isAdmin: boolean } }, res: { status: (status: number) => { json: (body: unknown) => unknown } }) {
  if (req.user?.isAdmin) return true;
  res.status(403).json({ error: "Admin access required." });
  return false;
}

reportsRouter.get("/", async (req, res) => {
  if (!requireAdmin(req, res)) return;

  const parsed = reportQueueQuerySchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const sb = getSupabaseAdmin();
  let query = sb
    .from("moderation_reports")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(parsed.data.limit);

  if (parsed.data.status) {
    query = query.eq("status", parsed.data.status);
  } else {
    query = query.in("status", ["open", "reviewing"]);
  }

  if (parsed.data.targetType) {
    query = query.eq("target_type", parsed.data.targetType);
  }

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });

  const rows = data ?? [];
  const contexts = await loadReportTargetContexts(sb, rows).catch(() => new Map<string, ModerationReportTargetContext>());
  return res.json({ reports: rows.map((row) => serializeReport(row, contexts.get(row.id) ?? null)) });
});

reportsRouter.get("/mine", async (req, res) => {
  const parsed = reportQueueQuerySchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const sb = getSupabaseAdmin();
  let query = sb
    .from("moderation_reports")
    .select("*")
    .eq("reporter_id", req.user!.id)
    .order("created_at", { ascending: false })
    .limit(parsed.data.limit);

  if (parsed.data.status) {
    query = query.eq("status", parsed.data.status);
  }

  if (parsed.data.targetType) {
    query = query.eq("target_type", parsed.data.targetType);
  }

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });

  return res.json({ reports: (data ?? []).map(serializeReporterReport) });
});

reportsRouter.post("/review-requests", requireTier("private"), async (req, res) => {
  const parsed = createReviewRequestSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const sb = getSupabaseAdmin();
  const standing = await resolveReviewRequestStanding(sb, req.user!.id, parsed.data);
  if ("error" in standing) return res.status(standing.status).json({ error: standing.error });

  const existing = await loadActiveExistingReviewRequest(
    sb,
    req.user!.id,
    standing.targetType,
    standing.targetId,
    parsed.data.reason
  );
  if (existing.error) return res.status(500).json({ error: existing.error });
  if (existing.request) {
    return res.status(200).json({
      reviewRequest: serializeParticipantReviewRequest(existing.request),
      duplicate: true,
    });
  }

  const { data, error } = await sb
    .from("moderation_review_requests")
    .insert({
      requester_id: req.user!.id,
      requester_role: standing.requesterRole,
      target_type: standing.targetType,
      target_id: standing.targetId,
      report_id: standing.reportId ?? null,
      reason: parsed.data.reason,
      status: "open",
    })
    .select("*")
    .single();

  if (error || !data) {
    if (isUniqueViolation(error)) {
      const duplicate = await loadActiveExistingReviewRequest(
        sb,
        req.user!.id,
        standing.targetType,
        standing.targetId,
        parsed.data.reason
      );
      if (duplicate.request) {
        return res.status(200).json({
          reviewRequest: serializeParticipantReviewRequest(duplicate.request),
          duplicate: true,
        });
      }
    }

    return res.status(500).json({ error: error?.message ?? "Failed to create review request." });
  }

  return res.status(201).json({ reviewRequest: serializeParticipantReviewRequest(data) });
});

reportsRouter.get("/review-requests/mine", async (req, res) => {
  const parsed = reviewRequestQuerySchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const sb = getSupabaseAdmin();
  let query = sb
    .from("moderation_review_requests")
    .select("*")
    .eq("requester_id", req.user!.id)
    .order("created_at", { ascending: false })
    .limit(parsed.data.limit);

  if (parsed.data.status) query = query.eq("status", parsed.data.status);
  if (parsed.data.targetType) query = query.eq("target_type", parsed.data.targetType);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });

  return res.json({ reviewRequests: (data ?? []).map((row) => serializeParticipantReviewRequest(row)) });
});

reportsRouter.get("/review-requests", async (req, res) => {
  if (!requireAdmin(req, res)) return;

  const parsed = reviewRequestQuerySchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const sb = getSupabaseAdmin();
  let query = sb
    .from("moderation_review_requests")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(parsed.data.limit);

  if (parsed.data.status) {
    query = query.eq("status", parsed.data.status);
  } else {
    query = query.in("status", ["open", "reviewing"]);
  }
  if (parsed.data.targetType) query = query.eq("target_type", parsed.data.targetType);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });

  return res.json({ reviewRequests: (data ?? []).map(serializeAdminReviewRequest) });
});

reportsRouter.patch("/review-requests/:id", async (req, res) => {
  if (!requireAdmin(req, res)) return;

  const parsed = updateReviewRequestSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const update: Record<string, unknown> = {
    status: parsed.data.status,
    reviewed_by: req.user!.id,
    reviewed_at: new Date().toISOString(),
  };
  if ("resolutionSummary" in parsed.data) update.resolution_summary = parsed.data.resolutionSummary ?? null;
  if ("adminNotes" in parsed.data) update.admin_notes = parsed.data.adminNotes ?? null;

  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("moderation_review_requests")
    .update(update)
    .eq("id", req.params.id)
    .select("*")
    .single();

  if (error || !data) return res.status(404).json({ error: "Review request not found." });
  await notifyReviewRequestStatus(data, req.user!.id).catch(() => undefined);
  return res.json({ reviewRequest: serializeAdminReviewRequest(data) });
});

reportsRouter.patch("/:id", async (req, res) => {
  if (!requireAdmin(req, res)) return;

  const parsed = updateReportStatusSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const sb = getSupabaseAdmin();
  const current = parsed.data.targetAction
    ? await loadReportById(sb, req.params.id)
    : null;

  if (parsed.data.targetAction && !current) return res.status(404).json({ error: "Report not found." });
  if (parsed.data.targetAction && current && !PUBLIC_EXHIBIT_REPORT_TARGET_TYPES.has(current.target_type)) {
    return res.status(400).json({
      error: "Target actions are only supported for public encounter exhibit reports.",
    });
  }
  if (parsed.data.targetAction && current) {
    const target = await loadPublicExhibitModerationTarget(sb, current.target_type, current.target_id);
    if (!target) return res.status(404).json({ error: "Public encounter exhibit target not found." });
    const supportedActions = publicExhibitModerationActionsForTarget(target);
    if (!supportedActions.includes(parsed.data.targetAction)) {
      return res.status(400).json({
        error: "Public encounter exhibit moderation action is not available for this target state.",
      });
    }
  }

  const { data, error } = await sb
    .from("moderation_reports")
    .update({
      status: parsed.data.status,
      reviewed_by: req.user!.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", req.params.id)
    .select("*")
    .single();

  if (error || !data) return res.status(404).json({ error: "Report not found." });
  if (parsed.data.targetAction) {
    const action = await applyPublicExhibitModerationAction(
      sb,
      data.target_type,
      data.target_id,
      parsed.data.targetAction,
      req.user!.id
    );
    if (action.ok === false) return res.status(action.status).json({ error: action.error });
  }
  await notifyReportStatus(data, req.user!.id).catch(() => undefined);
  const contexts = await loadReportTargetContexts(sb, [data]).catch(() => new Map<string, ModerationReportTargetContext>());
  return res.json({ report: serializeReport(data, contexts.get(data.id) ?? null) });
});

reportsRouter.post("/", requireTier("private"), async (req, res) => {
  const parsed = createReportSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const sb = getSupabaseAdmin();
  const existingReport = await loadActiveExistingReport(
    sb,
    req.user!.id,
    parsed.data.targetType,
    parsed.data.targetId,
    parsed.data.reason
  );

  if (existingReport.error) {
    return res.status(500).json({ error: existingReport.error });
  }

  if (existingReport.report) {
    return res.status(200).json({
      report: serializeReport(existingReport.report),
      duplicate: true,
    });
  }

  const { data, error } = await sb
    .from("moderation_reports")
    .insert({
      reporter_id: req.user!.id,
      target_type: parsed.data.targetType,
      target_id: parsed.data.targetId,
      reason: parsed.data.reason,
      notes: parsed.data.notes ?? null,
      status: "open",
    })
    .select("*")
    .single();

  if (error || !data) {
    if (isUniqueViolation(error)) {
      const duplicateReport = await loadActiveExistingReport(
        sb,
        req.user!.id,
        parsed.data.targetType,
        parsed.data.targetId,
        parsed.data.reason
      );

      if (duplicateReport.report) {
        return res.status(200).json({
          report: serializeReport(duplicateReport.report),
          duplicate: true,
        });
      }
    }

    return res.status(500).json({ error: error?.message ?? "Failed to create report." });
  }

  await updateReportedTarget(parsed.data.targetType, parsed.data.targetId).catch(() => undefined);

  return res.status(201).json({ report: serializeReport(data) });
});

async function loadActiveExistingReport(
  sb: ReturnType<typeof getSupabaseAdmin>,
  reporterId: string,
  targetType: ModerationReportTargetType,
  targetId: string,
  reason: string
): Promise<{ report: ModerationReportRow | null; error?: string }> {
  const { data, error } = await sb
    .from("moderation_reports")
    .select("*")
    .eq("reporter_id", reporterId)
    .eq("target_type", targetType)
    .eq("target_id", targetId)
    .eq("reason", reason);

  if (error) {
    return { report: null, error: error.message ?? "Failed to check existing report." };
  }

  const report = (data ?? []).find((row: ModerationReportRow) => ACTIVE_REPORT_STATUSES.has(row.status));
  return { report: report ?? null };
}

async function loadReportById(
  sb: ReturnType<typeof getSupabaseAdmin>,
  reportId: string,
): Promise<ModerationReportRow | null> {
  const { data } = await sb
    .from("moderation_reports")
    .select("*")
    .eq("id", reportId)
    .maybeSingle();

  return (data ?? null) as ModerationReportRow | null;
}

async function resolveReviewRequestStanding(
  sb: ReturnType<typeof getSupabaseAdmin>,
  requesterId: string,
  input: z.infer<typeof createReviewRequestSchema>
): Promise<
  | {
      requesterRole: ModerationReviewRequestRow["requester_role"];
      targetType: ModerationReviewRequestRow["target_type"];
      targetId: string;
      reportId?: string | null;
    }
  | { status: number; error: string }
> {
  if (input.reportId) {
    const { data: report } = await sb
      .from("moderation_reports")
      .select("*")
      .eq("id", input.reportId)
      .maybeSingle();

    if (!report) return { status: 404, error: "Report not found." };
    if (report.target_type !== "thread" && report.target_type !== "comment") {
      return { status: 400, error: "Review requests currently support thread and comment targets only." };
    }

    if (report.reporter_id === requesterId) {
      return {
        requesterRole: "reporter",
        targetType: report.target_type,
        targetId: report.target_id,
        reportId: report.id,
      };
    }

    const ownsTarget = await requesterOwnsTarget(sb, requesterId, report.target_type, report.target_id);
    if (ownsTarget === "missing") return { status: 404, error: "Review target not found." };
    if (ownsTarget) {
      return {
        requesterRole: "target_author",
        targetType: report.target_type,
        targetId: report.target_id,
        reportId: report.id,
      };
    }

    return { status: 403, error: "You cannot request review for this report." };
  }

  if (!input.targetType || !input.targetId) {
    return { status: 400, error: "Provide reportId or targetType and targetId." };
  }

  const ownsTarget = await requesterOwnsTarget(sb, requesterId, input.targetType, input.targetId);
  if (ownsTarget === "missing") return { status: 404, error: "Review target not found." };
  if (!ownsTarget) return { status: 403, error: "You cannot request review for this target." };

  return {
    requesterRole: "target_author",
    targetType: input.targetType,
    targetId: input.targetId,
    reportId: null,
  };
}

async function requesterOwnsTarget(
  sb: ReturnType<typeof getSupabaseAdmin>,
  requesterId: string,
  targetType: "thread" | "comment",
  targetId: string
): Promise<boolean | "missing"> {
  const table = targetType === "thread" ? "threads" : "comments";
  const { data } = await (sb as any)
    .from(table)
    .select("id, author_user_id")
    .eq("id", targetId)
    .maybeSingle();

  if (!data) return "missing";
  return data.author_user_id === requesterId;
}

async function loadActiveExistingReviewRequest(
  sb: ReturnType<typeof getSupabaseAdmin>,
  requesterId: string,
  targetType: ModerationReviewRequestRow["target_type"],
  targetId: string,
  reason: string
): Promise<{ request: ModerationReviewRequestRow | null; error?: string }> {
  const { data, error } = await sb
    .from("moderation_review_requests")
    .select("*")
    .eq("requester_id", requesterId)
    .eq("target_type", targetType)
    .eq("target_id", targetId)
    .eq("reason", reason);

  if (error) {
    return { request: null, error: error.message ?? "Failed to check existing review request." };
  }

  const request = (data ?? []).find((row: ModerationReviewRequestRow) => ACTIVE_REVIEW_REQUEST_STATUSES.has(row.status));
  return { request: request ?? null };
}

async function loadReportTargetContexts(
  sb: ReturnType<typeof getSupabaseAdmin>,
  reports: ModerationReportRow[]
): Promise<Map<string, ModerationReportTargetContext>> {
  const contexts = new Map<string, ModerationReportTargetContext>();

  for (const report of reports) {
    if (report.target_type === "thread") {
      contexts.set(report.id, await loadThreadTargetContext(sb, report.target_id));
    } else if (report.target_type === "comment") {
      contexts.set(report.id, await loadCommentTargetContext(sb, report.target_id));
    } else if (report.target_type === "document") {
      contexts.set(report.id, await loadDocumentTargetContext(sb, report.target_id));
    } else if (report.target_type === "space") {
      contexts.set(report.id, await loadSpaceTargetContext(sb, report.target_id));
    } else if (report.target_type === "persona") {
      contexts.set(report.id, await loadPersonaTargetContext(sb, report.target_id));
    } else if (report.target_type === "user") {
      contexts.set(report.id, await loadUserTargetContext(sb, report.target_id));
    } else if (report.target_type === "persona_encounter_public_exhibit") {
      contexts.set(report.id, await loadPublicEncounterExhibitTargetContext(sb, report.target_id));
    } else if (report.target_type === "persona_encounter_cross_owner_public_exhibit") {
      contexts.set(report.id, await loadCrossOwnerPublicEncounterExhibitTargetContext(sb, report.target_id));
    }
  }

  return contexts;
}

async function loadThreadTargetContext(
  sb: ReturnType<typeof getSupabaseAdmin>,
  threadId: string
): Promise<ModerationReportTargetContext> {
  const { data: thread } = await (sb as any)
    .from("threads")
    .select("id, title, status, visibility, is_hidden, moderation_state, category_id")
    .eq("id", threadId)
    .maybeSingle();

  if (!thread) {
    return unavailableTargetContext("thread", threadId, "Thread target not found.");
  }

  const category = await loadForumCategory(sb, (thread as any).category_id);
  const routeHref = category?.slug && thread.status !== "removed"
    ? `/forums/${category.slug}/${thread.id}`
    : null;

  return {
    targetType: "thread",
    targetId: thread.id,
    title: thread.title ?? null,
    status: thread.status ?? null,
    visibility: thread.visibility ?? null,
    moderationState: thread.moderation_state ?? null,
    isHidden: thread.is_hidden ?? false,
    routeHref,
    routeLabel: routeHref ? `${category?.title ?? "Forum"} / ${thread.title ?? thread.id}` : null,
    canOpenRoute: Boolean(routeHref),
    unavailableReason: routeHref ? null : "Thread route unavailable for this target state.",
    supportedActions: moderationActionsForTarget(thread),
  };
}

async function loadCommentTargetContext(
  sb: ReturnType<typeof getSupabaseAdmin>,
  commentId: string
): Promise<ModerationReportTargetContext> {
  const { data: comment } = await (sb as any)
    .from("comments")
    .select("id, parent_type, parent_id, status, is_hidden, moderation_state")
    .eq("id", commentId)
    .maybeSingle();

  if (!comment) {
    return unavailableTargetContext("comment", commentId, "Comment target not found.");
  }

  let routeHref: string | null = null;
  let routeLabel: string | null = null;
  let unavailableReason: string | null = "Comment parent route unavailable for this target.";
  let title: string | null = null;

  if (comment.parent_type === "thread") {
    const { data: thread } = await (sb as any)
      .from("threads")
      .select("id, title, status, category_id")
      .eq("id", comment.parent_id)
      .maybeSingle();
    const category = await loadForumCategory(sb, (thread as any)?.category_id);

    if (thread?.id && thread.status !== "removed" && category?.slug) {
      routeHref = `/forums/${category.slug}/${thread.id}#comment-${comment.id}`;
      routeLabel = `${category.title ?? "Forum"} / ${thread.title ?? thread.id}`;
      unavailableReason = null;
    }
    title = thread?.title ?? null;
  } else {
    unavailableReason = `Comment parent type ${comment.parent_type} has no safe forum route hint yet.`;
  }

  return {
    targetType: "comment",
    targetId: comment.id,
    title,
    parentType: comment.parent_type,
    parentId: comment.parent_id,
    status: comment.status ?? null,
    moderationState: comment.moderation_state ?? null,
    isHidden: comment.is_hidden ?? false,
    routeHref,
    routeLabel,
    canOpenRoute: Boolean(routeHref),
    unavailableReason,
    supportedActions: moderationActionsForTarget(comment),
  };
}

async function loadDocumentTargetContext(
  sb: ReturnType<typeof getSupabaseAdmin>,
  documentId: string
): Promise<ModerationReportTargetContext> {
  const { data: document } = await (sb as any)
    .from("documents")
    .select("id, title, status, visibility, space_id")
    .eq("id", documentId)
    .maybeSingle();

  if (!document) {
    return unavailableTargetContext("document", documentId, "Document target not found.");
  }

  const space = document.space_id ? await loadSpaceById(sb, document.space_id) : null;
  const routeHref = space?.slug ? `/space/${space.slug}/documents/${document.id}` : null;

  return {
    targetType: "document",
    targetId: document.id,
    title: document.title ?? null,
    status: document.status ?? null,
    visibility: document.visibility ?? null,
    routeHref,
    routeLabel: routeHref ? `${space?.title ?? "Space"} / ${document.title ?? document.id}` : null,
    canOpenRoute: Boolean(routeHref),
    unavailableReason: routeHref ? null : "Document has no safe Space route hint.",
    supportedActions: [],
  };
}

async function loadSpaceTargetContext(
  sb: ReturnType<typeof getSupabaseAdmin>,
  spaceId: string
): Promise<ModerationReportTargetContext> {
  const space = await loadSpaceById(sb, spaceId);

  if (!space) {
    return unavailableTargetContext("space", spaceId, "Space target not found.");
  }

  const routeHref = space.slug ? `/space/${space.slug}` : null;

  return {
    targetType: "space",
    targetId: space.id,
    title: space.title ?? null,
    visibility: space.is_public ? "public" : "private",
    routeHref,
    routeLabel: routeHref ? (space.title ?? space.slug) : null,
    canOpenRoute: Boolean(routeHref),
    unavailableReason: routeHref ? null : "Space has no safe route hint.",
    supportedActions: [],
  };
}

async function loadPersonaTargetContext(
  sb: ReturnType<typeof getSupabaseAdmin>,
  personaId: string
): Promise<ModerationReportTargetContext> {
  const { data: persona } = await (sb as any)
    .from("personas")
    .select("id, name, visibility, public_slug, owner_user_id")
    .eq("id", personaId)
    .maybeSingle();

  if (!persona) {
    return unavailableTargetContext("persona", personaId, "Persona target not found.");
  }

  let routeHref: string | null = null;
  if (
    persona.visibility === "public" &&
    await ownerCanExposeExistingPublicPersonas(sb, persona.owner_user_id)
  ) {
    routeHref = publicPersonaRouteHref(persona.public_slug);
  }

  return {
    targetType: "persona",
    targetId: persona.id,
    title: persona.name ?? null,
    visibility: persona.visibility ?? null,
    routeHref,
    routeLabel: routeHref ? persona.name ?? "Public persona" : null,
    canOpenRoute: Boolean(routeHref),
    unavailableReason: routeHref
      ? null
      : persona.visibility === "private"
      ? "Private persona target has no safe moderator route hint."
      : "Persona targets have no safe public route hint yet.",
    supportedActions: [],
  };
}

async function loadUserTargetContext(
  sb: ReturnType<typeof getSupabaseAdmin>,
  userId: string
): Promise<ModerationReportTargetContext> {
  const { data: profile } = await (sb as any)
    .from("profiles")
    .select("id, username, display_name")
    .eq("id", userId)
    .maybeSingle();

  if (!profile) {
    return unavailableTargetContext("user", userId, "User target not found.");
  }

  return {
    targetType: "user",
    targetId: profile.id,
    title: profile.display_name ?? profile.username ?? "Station user",
    canOpenRoute: false,
    unavailableReason: "User reports have no safe moderator route hint yet.",
    supportedActions: [],
  };
}

async function loadPublicEncounterExhibitTargetContext(
  sb: ReturnType<typeof getSupabaseAdmin>,
  exhibitId: string
): Promise<ModerationReportTargetContext> {
  const { data: exhibit } = await (sb as any)
    .from("persona_encounter_public_exhibits")
    .select("id, slug, public_title, status, reported_count, removed_at, retracted_at")
    .eq("id", exhibitId)
    .maybeSingle();

  if (!exhibit) {
    return unavailableTargetContext(
      "persona_encounter_public_exhibit",
      exhibitId,
      "Public encounter exhibit target not found."
    );
  }

  const routeHref = exhibit.status === "published" && !exhibit.removed_at
    ? `/encounters/${exhibit.slug}`
    : null;

  return {
    targetType: "persona_encounter_public_exhibit",
    targetId: exhibit.id,
    title: exhibit.public_title ?? "Public encounter exhibit",
    status: exhibit.status ?? null,
    visibility: routeHref ? "public" : "not_public",
    routeHref,
    routeLabel: routeHref ? exhibit.public_title ?? "Public encounter exhibit" : null,
    canOpenRoute: Boolean(routeHref),
    unavailableReason: routeHref ? null : "Public encounter exhibit is not currently public.",
    supportedActions: publicExhibitModerationActionsForTarget(exhibit),
  };
}

async function loadCrossOwnerPublicEncounterExhibitTargetContext(
  sb: ReturnType<typeof getSupabaseAdmin>,
  exhibitId: string
): Promise<ModerationReportTargetContext> {
  const { data: exhibit } = await (sb as any)
    .from("persona_encounter_cross_owner_public_exhibits")
    .select("id, consent_id, slug, public_title, status, reported_count, removed_at, retracted_at")
    .eq("id", exhibitId)
    .maybeSingle();

  if (!exhibit) {
    return unavailableTargetContext(
      "persona_encounter_cross_owner_public_exhibit",
      exhibitId,
      "Cross-owner public encounter exhibit target not found."
    );
  }

  const consentActive = await crossOwnerPublicExhibitConsentActive(sb, exhibit.consent_id);
  const isPublic = exhibit.status === "published" && !exhibit.removed_at && !exhibit.retracted_at && consentActive;

  return {
    targetType: "persona_encounter_cross_owner_public_exhibit",
    targetId: exhibit.id,
    title: exhibit.public_title ?? "Cross-owner public encounter exhibit",
    status: exhibit.status ?? null,
    visibility: isPublic ? "public_api_detail" : "not_public",
    routeHref: null,
    routeLabel: null,
    canOpenRoute: false,
    unavailableReason: isPublic
      ? "Cross-owner public exhibit currently has API-only public detail readback."
      : "Cross-owner public exhibit is not currently public.",
    supportedActions: publicExhibitModerationActionsForTarget({ ...exhibit, consentActive }),
  };
}

async function loadForumCategory(sb: ReturnType<typeof getSupabaseAdmin>, categoryId: string | null | undefined) {
  if (!categoryId) return null;
  const { data } = await (sb as any)
    .from("forum_categories")
    .select("id, slug, title")
    .eq("id", categoryId)
    .maybeSingle();
  return data ?? null;
}

async function loadSpaceById(sb: ReturnType<typeof getSupabaseAdmin>, spaceId: string | null | undefined) {
  if (!spaceId) return null;
  const { data } = await (sb as any)
    .from("spaces")
    .select("id, slug, title, is_public")
    .eq("id", spaceId)
    .maybeSingle();
  return data ?? null;
}

function unavailableTargetContext(
  targetType: ModerationReportTargetType,
  targetId: string,
  unavailableReason: string
): ModerationReportTargetContext {
  return {
    targetType,
    targetId,
    canOpenRoute: false,
    unavailableReason,
    supportedActions: [],
  };
}

function moderationActionsForTarget(
  target: { status?: string | null; is_hidden?: boolean | null }
): ModerationReportTargetContext["supportedActions"] {
  if (target.status === "removed") return ["restore"];
  if (target.is_hidden) return ["unhide", "remove"];
  return ["hide", "remove"];
}

function publicExhibitModerationActionsForTarget(
  target: { status?: string | null; consentActive?: boolean | null }
): Array<z.infer<typeof publicExhibitTargetActionSchema>> {
  if (target.status === "published") return ["remove"];
  if (target.status === "removed" && target.consentActive !== false) return ["restore"];
  return [];
}

function isUniqueViolation(error: { code?: string } | null | undefined) {
  return error?.code === "23505";
}

async function updateReportedTarget(targetType: string, targetId: string) {
  const sb = getSupabaseAdmin();

  if (targetType === "thread") {
    const { data: thread } = await sb
      .from("threads")
      .select("id, reported_count, author_user_id")
      .eq("id", targetId)
      .maybeSingle();
    if (!thread) return;
    await sb
      .from("threads")
      .update({
        reported_count: (thread.reported_count ?? 0) + 1,
        moderation_state: "needs_review",
      } as any)
      .eq("id", targetId);
    await bumpReportCount(thread.author_user_id);
  }

  if (targetType === "comment") {
    const { data: comment } = await sb
      .from("comments")
      .select("id, reported_count, author_user_id")
      .eq("id", targetId)
      .maybeSingle();
    if (!comment) return;
    await sb
      .from("comments")
      .update({
        reported_count: (comment.reported_count ?? 0) + 1,
        moderation_state: "needs_review",
      } as any)
      .eq("id", targetId);
    await bumpReportCount(comment.author_user_id);
  }

  if (targetType === "user") {
    await bumpReportCount(targetId);
  }

  if (targetType === "persona_encounter_public_exhibit") {
    const { data: exhibit } = await sb
      .from("persona_encounter_public_exhibits")
      .select("id, reported_count")
      .eq("id", targetId)
      .maybeSingle();
    if (!exhibit) return;
    await sb
      .from("persona_encounter_public_exhibits")
      .update({ reported_count: Number(exhibit.reported_count ?? 0) + 1 } as any)
      .eq("id", targetId);
  }

  if (targetType === "persona_encounter_cross_owner_public_exhibit") {
    const { data: exhibit } = await sb
      .from("persona_encounter_cross_owner_public_exhibits")
      .select("id, reported_count")
      .eq("id", targetId)
      .maybeSingle();
    if (!exhibit) return;
    await sb
      .from("persona_encounter_cross_owner_public_exhibits")
      .update({ reported_count: Number(exhibit.reported_count ?? 0) + 1 } as any)
      .eq("id", targetId);
  }
}

async function applyPublicExhibitModerationAction(
  sb: ReturnType<typeof getSupabaseAdmin>,
  targetType: ModerationReportTargetType,
  exhibitId: string,
  action: z.infer<typeof publicExhibitTargetActionSchema>,
  adminUserId: string,
): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  const exhibit = await loadPublicExhibitModerationTarget(sb, targetType, exhibitId);

  if (!exhibit) {
    return { ok: false, status: 404, error: "Public encounter exhibit target not found." };
  }
  const supportedActions = publicExhibitModerationActionsForTarget(exhibit);
  if (!supportedActions.includes(action)) {
    return {
      ok: false,
      status: 400,
      error: "Public encounter exhibit moderation action is not available for this target state.",
    };
  }

  const update = action === "remove"
    ? {
        status: "removed",
        removed_at: new Date().toISOString(),
        removed_by: adminUserId,
      }
    : {
        status: exhibit.retracted_at ? "retracted" : "published",
        removed_at: null,
        removed_by: null,
      };

  const table = publicExhibitModerationTable(targetType);
  if (!table) {
    return { ok: false, status: 400, error: "Public encounter exhibit moderation target is unsupported." };
  }

  const { error } = await (sb as any)
    .from(table)
    .update(update)
    .eq("id", exhibitId);

  if (error) {
    return { ok: false, status: 500, error: "Public encounter exhibit moderation action failed." };
  }

  return { ok: true };
}

async function loadPublicExhibitModerationTarget(
  sb: ReturnType<typeof getSupabaseAdmin>,
  targetType: ModerationReportTargetType,
  exhibitId: string,
) {
  const table = publicExhibitModerationTable(targetType);
  if (!table) return null;
  const selectColumns = targetType === "persona_encounter_cross_owner_public_exhibit"
    ? "id, slug, status, retracted_at, consent_id"
    : "id, slug, status, retracted_at";

  const { data } = await (sb as any)
    .from(table)
    .select(selectColumns)
    .eq("id", exhibitId)
    .maybeSingle();

  if (!data) return null;
  if (targetType === "persona_encounter_cross_owner_public_exhibit") {
    return {
      ...data,
      consentActive: await crossOwnerPublicExhibitConsentActive(sb, data.consent_id),
    };
  }

  return data;
}

function publicExhibitModerationTable(targetType: ModerationReportTargetType) {
  if (targetType === "persona_encounter_public_exhibit") return "persona_encounter_public_exhibits";
  if (targetType === "persona_encounter_cross_owner_public_exhibit") {
    return "persona_encounter_cross_owner_public_exhibits";
  }
  return null;
}

async function crossOwnerPublicExhibitConsentActive(
  sb: ReturnType<typeof getSupabaseAdmin>,
  consentId: string | null | undefined,
) {
  if (!consentId) return false;
  const { data: consent } = await (sb as any)
    .from("persona_encounter_cross_owner_consents")
    .select("id, status, requested_scopes, requested_scope_version")
    .eq("id", consentId)
    .maybeSingle();

  return Boolean(
    consent &&
    consent.status === "approved" &&
    consent.requested_scope_version === 1 &&
    Array.isArray(consent.requested_scopes) &&
    consent.requested_scopes.includes("publish_metadata_only_public_exhibit")
  );
}

async function bumpReportCount(userId: string) {
  const sb = getSupabaseAdmin();
  const profile = await ensureCommunityProfile(userId);
  await (sb as any)
    .from("community_user_profiles")
    .update({ report_count: (profile.report_count ?? 0) + 1 })
    .eq("user_id", userId);
}
