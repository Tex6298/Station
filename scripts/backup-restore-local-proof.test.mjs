import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  createRestoreProofPlan,
  RestoreProofRefusal,
  RESTORE_SHAPE,
} from "./backup-restore-local-proof.mjs";

const repoRoot = path.resolve(process.cwd());
const safeArtifact = path.join(os.tmpdir(), "station-backup-restore-local-proof-test", "proof.dump");
const localProtocol = "postgres" + "ql:";

function localDb(name, host = "localhost") {
  return `${localProtocol}//${host}/${name}`;
}

function remoteDb(name) {
  return `${localProtocol}//db.example.invalid/${name}`;
}

test("local restore proof defaults to safe plan mode without raw connection output", () => {
  const plan = createRestoreProofPlan({
    repoRoot,
    sourceUrl: localDb("source_restore_fixture"),
    targetUrl: localDb("target_restore_fixture", "127.0.0.1"),
    artifactPath: safeArtifact,
    confirmLocalDisposable: true,
    fixtureOnly: true,
    availableCommands: new Set(["psql", "pg_dump"]),
  });

  assert.equal(plan.status, "ready");
  assert.equal(plan.mode, "plan");
  assert.equal(plan.restoreShape, RESTORE_SHAPE);
  assert.equal(plan.localOnly, true);
  assert.equal(plan.syntheticFixtureOnly, true);

  const rendered = JSON.stringify(plan);
  assert.doesNotMatch(rendered, /source_restore_fixture|target_restore_fixture|localhost|127\.0\.0\.1/);
});

test("execute mode blocks when local Postgres dump dependencies are missing", () => {
  const plan = createRestoreProofPlan({
    repoRoot,
    mode: "execute",
    sourceUrl: localDb("source_restore_fixture"),
    targetUrl: localDb("target_restore_fixture"),
    artifactPath: safeArtifact,
    confirmLocalDisposable: true,
    fixtureOnly: true,
    availableCommands: new Set(["psql"]),
  });

  assert.equal(plan.status, "blocked");
  assert.deepEqual(plan.missingLocalDependencies, ["pg_dump"]);
});

test("refuses non-local source database", () => {
  assertRefusal("source_database_not_local", () => createRestoreProofPlan({
    repoRoot,
    sourceUrl: remoteDb("source"),
    targetUrl: localDb("target"),
    artifactPath: safeArtifact,
    confirmLocalDisposable: true,
    fixtureOnly: true,
  }));
});

test("refuses non-local target database", () => {
  assertRefusal("target_database_not_local", () => createRestoreProofPlan({
    repoRoot,
    sourceUrl: localDb("source"),
    targetUrl: remoteDb("target"),
    artifactPath: safeArtifact,
    confirmLocalDisposable: true,
    fixtureOnly: true,
  }));
});

test("refuses artifact paths inside the repository", () => {
  assertRefusal("unsafe_artifact_path", () => createRestoreProofPlan({
    repoRoot,
    sourceUrl: localDb("source"),
    targetUrl: localDb("target"),
    artifactPath: path.join(repoRoot, "restore-proof.dump"),
    confirmLocalDisposable: true,
    fixtureOnly: true,
  }));
});

test("refuses non-fixture rows before dump or restore", () => {
  assertRefusal("non_fixture_rows_detected", () => createRestoreProofPlan({
    repoRoot,
    sourceUrl: localDb("source"),
    targetUrl: localDb("target"),
    artifactPath: safeArtifact,
    confirmLocalDisposable: true,
    fixtureOnly: true,
    nonFixtureRowCount: 1,
  }));
});

test("refuses storage operations in first proof", () => {
  assertRefusal("storage_operation_forbidden", () => createRestoreProofPlan({
    repoRoot,
    sourceUrl: localDb("source"),
    targetUrl: localDb("target"),
    artifactPath: safeArtifact,
    confirmLocalDisposable: true,
    fixtureOnly: true,
    includeStorage: true,
  }));
});

test("refuses verbose or raw output mode", () => {
  assertRefusal("raw_output_forbidden", () => createRestoreProofPlan({
    repoRoot,
    sourceUrl: localDb("source"),
    targetUrl: localDb("target"),
    artifactPath: safeArtifact,
    confirmLocalDisposable: true,
    fixtureOnly: true,
    verboseRawOutput: true,
  }));
});

function assertRefusal(code, fn) {
  assert.throws(fn, (error) => {
    assert.equal(error instanceof RestoreProofRefusal, true);
    assert.equal(error.code, code);
    return true;
  });
}
