import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/require-auth";
import {
  getAiTraceDetail,
  getAiTraceSummary,
  listAiTraces,
} from "../services/ai-observability.service";

export const observabilityRouter = Router();

observabilityRouter.use(requireAuth);

observabilityRouter.get("/summary", async (req, res) => {
  const summary = await getAiTraceSummary(req.user!.id);
  res.json({ summary });
});

observabilityRouter.get("/traces", async (req, res) => {
  const parsed = z.coerce.number().int().min(1).max(50).optional().safeParse(req.query.limit);
  if (!parsed.success) return res.status(400).json({ error: "Invalid limit." });

  const traces = await listAiTraces(req.user!.id, parsed.data ?? 12);
  res.json({ traces });
});

observabilityRouter.get("/traces/:traceId", async (req, res) => {
  const parsed = z.string().uuid().safeParse(req.params.traceId);
  if (!parsed.success) return res.status(400).json({ error: "Invalid trace id." });

  const detail = await getAiTraceDetail(req.user!.id, parsed.data);
  if (!detail) return res.status(404).json({ error: "Trace not found." });
  res.json(detail);
});
