
import { Router } from "express";
import { z } from "zod";
import { moderationReports } from "../lib/mock-db";
import { requireAuth } from "../middleware/require-auth";
import type { ModerationReportRecord } from "@station/types";

const createReportSchema = z.object({
  targetType: z.enum(['user', 'space', 'document', 'thread', 'comment']),
  targetId: z.string().min(1),
  reason: z.string().min(1),
  notes: z.string().optional(),
});

export const reportsRouter = Router();
reportsRouter.use(requireAuth);

reportsRouter.post('/', (req, res) => {
  const parsed = createReportSchema.parse(req.body) as Pick<ModerationReportRecord, "targetType" | "targetId" | "reason" | "notes">;
  const report: ModerationReportRecord = {
    id: `report-${moderationReports.length + 1}`,
    reporterUserId: 'demo-user',
    status: 'open' as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...parsed,
  };
  moderationReports.push(report);
  res.status(201).json({ report });
});
