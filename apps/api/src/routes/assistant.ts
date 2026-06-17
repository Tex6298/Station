import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/require-auth";
import {
  composeStationAssistantReply,
  getStationAssistantContext,
  getStationAssistantSummary,
} from "../services/station-assistant.service";

const messageSchema = z.object({
  message: z.string().min(1).max(4000),
});

export const assistantRouter = Router();
assistantRouter.use(requireAuth);

assistantRouter.get("/context", async (req, res) => {
  const context = await getStationAssistantContext(req.user!.id);
  return res.json({ assistant: context });
});

assistantRouter.get("/summary", async (req, res) => {
  const summary = await getStationAssistantSummary(req.user!.id);
  return res.json({ summary });
});

assistantRouter.post("/message", async (req, res) => {
  const parsed = messageSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const summary = await getStationAssistantSummary(req.user!.id);
  const reply = composeStationAssistantReply(parsed.data.message, summary);
  return res.json({ reply: { ...reply, summary } });
});
