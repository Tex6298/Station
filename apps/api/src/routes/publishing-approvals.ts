import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/require-auth";
import { requireTier } from "../middleware/require-tier";
import {
  PUBLISHING_APPROVAL_STATES,
  enqueuePublishingApproval,
  listPublishingApprovalEvents,
  listPublishingApprovals,
  transitionPublishingApproval,
} from "../services/publishing-approval.service";

const visibilitySchema = z.enum(["public", "community", "unlisted"]);

const enqueueSchema = z.object({
  documentId: z.string().uuid(),
  visibility: visibilitySchema.optional(),
  note: z.string().max(2000).optional(),
  groundingSummary: z.string().max(4000).optional(),
});

const transitionSchema = z.object({
  state: z.enum(PUBLISHING_APPROVAL_STATES),
  visibility: visibilitySchema.optional(),
  scheduledFor: z.string().datetime().optional(),
  note: z.string().max(2000).optional(),
  groundingSummary: z.string().max(4000).optional(),
});

export const publishingApprovalsRouter = Router();

publishingApprovalsRouter.use(requireAuth);

publishingApprovalsRouter.get("/", async (req, res) => {
  try {
    const approvals = await listPublishingApprovals(req.user!.id);
    return res.json({ approvals });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : "Could not load publishing approvals." });
  }
});

publishingApprovalsRouter.post("/", requireTier("creator"), async (req, res) => {
  const parsed = enqueueSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  try {
    const result = await enqueuePublishingApproval(parsed.data.documentId, req.user!.id, req.user!.id, parsed.data);
    if (result.status === "not_found") return res.status(404).json({ error: "Document not found." });
    if (result.status === "invalid") return res.status(400).json({ error: result.error });
    return res.status(result.existing ? 200 : 201).json({ approval: result.item, existing: result.existing });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : "Could not enqueue publishing approval." });
  }
});

publishingApprovalsRouter.get("/:id/events", async (req, res) => {
  try {
    const events = await listPublishingApprovalEvents(req.params.id, req.user!.id);
    if (!events) return res.status(404).json({ error: "Approval item not found." });
    return res.json({ events });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : "Could not load publishing approval events." });
  }
});

publishingApprovalsRouter.post("/:id/transition", requireTier("creator"), async (req, res) => {
  const parsed = transitionSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  try {
    const result = await transitionPublishingApproval(req.params.id, req.user!.id, req.user!.id, parsed.data.state, parsed.data);
    if (result.status === "not_found") return res.status(404).json({ error: "Approval item not found." });
    if (result.status === "invalid") return res.status(400).json({ error: result.error });
    return res.json({ approval: result.item });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : "Could not update publishing approval." });
  }
});
