import { Router } from "express";
import { env } from "../lib/env";
import { buildDeploymentReadiness } from "../services/readiness.service";

export const healthRouter = Router();
healthRouter.get("/health", (_req, res) => res.json({ ok: true }));

healthRouter.get("/health/deployment", async (_req, res) => {
  const readiness = await buildDeploymentReadiness();
  res.json({
    ok: true,
    ready: readiness.ready,
    appUrl: env.NEXT_PUBLIC_APP_URL,
    apiUrl: env.API_URL,
    generatedAt: readiness.generatedAt,
    checks: readiness.checks,
    readiness: readiness.readiness,
  });
});
