
import { Router } from "express";
import { z } from "zod";
import type { Database } from "@station/db";
import { requireAuth } from "../middleware/require-auth";
import { getSupabaseAdmin } from "../lib/supabase";
import type { ModerationReportRecord } from "@station/types";

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

  return res.status(201).json({ report: serializeReport(data) });
});
