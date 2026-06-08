
import { Router } from "express";
import { z } from "zod";
import type { Database } from "@station/db";
import { requireAuth } from "../middleware/require-auth";
import { getSupabaseAdmin } from "../lib/supabase";
import type { ModerationReportRecord } from "@station/types";
import { ensureCommunityProfile } from "../services/community.service";

const createReportSchema = z.object({
  targetType: z.enum(["user", "space", "document", "thread", "comment", "persona"]),
  targetId: z.string().min(1),
  reason: z.string().min(1),
  notes: z.string().optional(),
});

export const reportsRouter = Router();
reportsRouter.use(requireAuth);

type ModerationReportRow = Database["public"]["Tables"]["moderation_reports"]["Row"];

function serializeReport(row: ModerationReportRow): ModerationReportRecord {
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

  return report;
}

reportsRouter.post("/", async (req, res) => {
  const parsed = createReportSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const sb = getSupabaseAdmin();
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
    return res.status(500).json({ error: error?.message ?? "Failed to create report." });
  }

  await updateReportedTarget(parsed.data.targetType, parsed.data.targetId).catch(() => undefined);

  return res.status(201).json({ report: serializeReport(data) });
});

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
