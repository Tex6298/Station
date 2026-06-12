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
    deploymentIdentity: buildDeploymentIdentity(),
    appUrl: env.NEXT_PUBLIC_APP_URL,
    apiUrl: env.API_URL,
    generatedAt: readiness.generatedAt,
    checks: readiness.checks,
    readiness: readiness.readiness,
  });
});

function buildDeploymentIdentity() {
  return {
    railwayGitCommitSha: nullableEnv("RAILWAY_GIT_COMMIT_SHA"),
    railwayGitBranch: nullableEnv("RAILWAY_GIT_BRANCH"),
    railwayGitRepoOwner: nullableEnv("RAILWAY_GIT_REPO_OWNER"),
    railwayGitRepoName: nullableEnv("RAILWAY_GIT_REPO_NAME"),
    railwayDeploymentId: nullableEnv("RAILWAY_DEPLOYMENT_ID"),
    railwayServiceName: nullableEnv("RAILWAY_SERVICE_NAME"),
    railwayEnvironmentName: nullableEnv("RAILWAY_ENVIRONMENT_NAME"),
  };
}

function nullableEnv(name: string) {
  const value = process.env[name]?.trim();
  return value ? value : null;
}
