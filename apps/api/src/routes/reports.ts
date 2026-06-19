
import { Router } from "express";
import { z } from "zod";
import type { Database } from "@station/db";
import { requireAuth } from "../middleware/require-auth";
import { requireTier } from "../middleware/require-tier";
import { getSupabaseAdmin } from "../lib/supabase";
import type {
  ModerationReportRecord,
  ModerationReportTargetContext,
  ReporterModerationReportRecord,
} from "@station/types";
import { ensureCommunityProfile } from "../services/community.service";

const createReportSchema = z.object({
  targetType: z.enum(["user", "space", "document", "thread", "comment", "persona"]),
  targetId: z.string().min(1),
  reason: z.string().min(1),
  notes: z.string().optional(),
});
const reportStatusSchema = z.enum(["open", "reviewing", "resolved", "dismissed"]);
const reportQueueQuerySchema = z.object({
  status: reportStatusSchema.optional(),
  targetType: createReportSchema.shape.targetType.optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});
const updateReportStatusSchema = z.object({
  status: z.enum(["reviewing", "resolved", "dismissed"]),
});

export const reportsRouter = Router();
reportsRouter.use(requireAuth);

type ModerationReportRow = Database["public"]["Tables"]["moderation_reports"]["Row"];
type ModerationReportTargetType = ModerationReportRow["target_type"];
const ACTIVE_REPORT_STATUSES = new Set(["open", "reviewing"]);

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

reportsRouter.patch("/:id", async (req, res) => {
  if (!requireAdmin(req, res)) return;

  const parsed = updateReportStatusSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const sb = getSupabaseAdmin();
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

async function loadForumCategory(sb: ReturnType<typeof getSupabaseAdmin>, categoryId: string | null | undefined) {
  if (!categoryId) return null;
  const { data } = await (sb as any)
    .from("forum_categories")
    .select("id, slug, title")
    .eq("id", categoryId)
    .maybeSingle();
  return data ?? null;
}

function unavailableTargetContext(
  targetType: "thread" | "comment",
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
}

async function bumpReportCount(userId: string) {
  const sb = getSupabaseAdmin();
  const profile = await ensureCommunityProfile(userId);
  await (sb as any)
    .from("community_user_profiles")
    .update({ report_count: (profile.report_count ?? 0) + 1 })
    .eq("user_id", userId);
}
