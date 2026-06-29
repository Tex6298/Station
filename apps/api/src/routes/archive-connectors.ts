import { Router, type Request, type Response } from "express";
import { requireAuth } from "../middleware/require-auth";
import { archiveConnectorReadiness } from "../services/archive-connectors/readiness";

export const archiveConnectorsRouter = Router();

archiveConnectorsRouter.use(requireAuth);

archiveConnectorsRouter.get("/readiness", (_req: Request, res: Response) => {
  res.json(archiveConnectorReadiness());
});
