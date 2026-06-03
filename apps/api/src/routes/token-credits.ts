import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/require-auth";
import { createTopupCheckoutSession, getTokenUsage, runMonthlyTokenReset } from "../services/token-credits.service";

export const tokenCreditsRouter = Router();

tokenCreditsRouter.use(requireAuth);

const topupCheckoutSchema = z.object({
  packId: z.string().min(1),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

tokenCreditsRouter.get("/me", async (req, res) => {
  try {
    const usage = await getTokenUsage(req.user!.id);
    return res.json({ usage });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Could not load token usage.",
    });
  }
});

tokenCreditsRouter.post("/topups/checkout", async (req, res) => {
  const parsed = topupCheckoutSchema.safeParse(req.body || {});
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  try {
    const url = await createTopupCheckoutSession({
      userId: req.user!.id,
      email: req.user!.email,
      packId: parsed.data.packId,
      successUrl: parsed.data.successUrl ?? `${APP_URL}/settings?topup=success`,
      cancelUrl: parsed.data.cancelUrl ?? `${APP_URL}/settings?topup=cancelled`,
    });
    return res.json({ url });
  } catch (error) {
    return res.status(400).json({
      error: error instanceof Error ? error.message : "Could not create top-up checkout.",
    });
  }
});

tokenCreditsRouter.post("/monthly-reset", async (req, res) => {
  if (!req.user!.isAdmin) return res.status(403).json({ error: "Admin access required." });

  try {
    const result = await runMonthlyTokenReset();
    return res.json({ reset: result });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Could not run monthly token reset.",
    });
  }
});
