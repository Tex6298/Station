import { Router } from "express";
import { requireAuth } from "../middleware/require-auth";
import { getStorageUsage } from "../services/storage.service";

export const storageRouter = Router();

storageRouter.use(requireAuth);

storageRouter.get("/me", async (req, res) => {
  try {
    const usage = await getStorageUsage(req.user!.id);
    return res.json({ storage: usage });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Could not load storage usage.",
    });
  }
});
