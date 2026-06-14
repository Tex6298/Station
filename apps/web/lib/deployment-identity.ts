const DEPLOYMENT_IDENTITY_ENV = [
  ["railwayGitCommitSha", "RAILWAY_GIT_COMMIT_SHA"],
  ["railwayGitBranch", "RAILWAY_GIT_BRANCH"],
  ["railwayGitRepoOwner", "RAILWAY_GIT_REPO_OWNER"],
  ["railwayGitRepoName", "RAILWAY_GIT_REPO_NAME"],
  ["railwayDeploymentId", "RAILWAY_DEPLOYMENT_ID"],
  ["railwayServiceName", "RAILWAY_SERVICE_NAME"],
  ["railwayEnvironmentName", "RAILWAY_ENVIRONMENT_NAME"],
] as const;

export type WebDeploymentIdentity = Record<typeof DEPLOYMENT_IDENTITY_ENV[number][0], string | null>;

export function buildWebDeploymentIdentity(
  env: Record<string, string | undefined> = process.env
): WebDeploymentIdentity {
  return Object.fromEntries(
    DEPLOYMENT_IDENTITY_ENV.map(([key, envName]) => [key, nullableEnv(env, envName)])
  ) as WebDeploymentIdentity;
}

function nullableEnv(env: Record<string, string | undefined>, name: string) {
  const value = env[name]?.trim();
  return value ? value : null;
}
