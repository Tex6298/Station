import { Router } from "express";
import { requireAuth } from "../middleware/require-auth";
import { getTokenUsage } from "../services/token-credits.service";

export const tokenCreditsRouter = Router();

tokenCreditsRouter.use(requireAuth);

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
