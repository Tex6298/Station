import assert from "node:assert/strict";
import test from "node:test";
import { buildWebDeploymentIdentity } from "./deployment-identity";

test("web deployment identity exposes only non-secret Railway metadata", () => {
  const identity = buildWebDeploymentIdentity({
    RAILWAY_GIT_COMMIT_SHA: "abc123",
    RAILWAY_GIT_BRANCH: "main",
    RAILWAY_GIT_REPO_OWNER: "Tex6298",
    RAILWAY_GIT_REPO_NAME: "Station",
    RAILWAY_DEPLOYMENT_ID: "deployment-123",
    RAILWAY_SERVICE_NAME: "@station/web",
    RAILWAY_ENVIRONMENT_NAME: "production",
    RAILWAY_TOKEN: "must-not-leak",
    DATABASE_URL: "must-not-leak",
  });

  assert.deepEqual(identity, {
    railwayGitCommitSha: "abc123",
    railwayGitBranch: "main",
    railwayGitRepoOwner: "Tex6298",
    railwayGitRepoName: "Station",
    railwayDeploymentId: "deployment-123",
    railwayServiceName: "@station/web",
    railwayEnvironmentName: "production",
  });
  assert.equal(JSON.stringify(identity).includes("must-not-leak"), false);
});

test("web deployment identity returns null for unavailable metadata", () => {
  assert.deepEqual(buildWebDeploymentIdentity({}), {
    railwayGitCommitSha: null,
    railwayGitBranch: null,
    railwayGitRepoOwner: null,
    railwayGitRepoName: null,
    railwayDeploymentId: null,
    railwayServiceName: null,
    railwayEnvironmentName: null,
  });
});

test("web deployment identity trims blank metadata", () => {
  const identity = buildWebDeploymentIdentity({
    RAILWAY_GIT_COMMIT_SHA: "  abc123  ",
    RAILWAY_GIT_BRANCH: "   ",
  });

  assert.equal(identity.railwayGitCommitSha, "abc123");
  assert.equal(identity.railwayGitBranch, null);
});
