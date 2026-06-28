#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const RESTORE_SHAPE = "migration replay plus data-only logical restore";
export const DEFAULT_REQUIRED_COMMANDS = ["psql", "pg_dump"];

export class RestoreProofRefusal extends Error {
  constructor(code, message) {
    super(message);
    this.name = "RestoreProofRefusal";
    this.code = code;
  }
}

export function createRestoreProofPlan(input = {}) {
  const repoRoot = path.resolve(input.repoRoot ?? process.cwd());
  const mode = input.mode ?? "plan";
  const artifactPath = input.artifactPath
    ? path.resolve(input.artifactPath)
    : path.join(os.tmpdir(), "station-backup-restore-local-proof", "station-local-restore.dump");

  assertMode(mode);
  assertSafeOutputRequest(input);
  assertNoStorageRequest(input);
  assertSafeArtifactPath(artifactPath, repoRoot);

  const pendingInputs = [];
  if (!input.sourceUrl) pendingInputs.push("local source database URL");
  if (!input.targetUrl) pendingInputs.push("local target database URL");
  if (!input.confirmLocalDisposable) pendingInputs.push("--confirm-local-disposable");
  if (!input.fixtureOnly) pendingInputs.push("--fixture-only");

  if (input.sourceUrl) assertLocalDatabaseUrl(input.sourceUrl, "source");
  if (input.targetUrl) assertLocalDatabaseUrl(input.targetUrl, "target");
  assertFixtureOnly(input);

  if (mode === "execute") {
    if (pendingInputs.length > 0) {
      throw new RestoreProofRefusal(
        "missing_execute_confirmation",
        "Execute mode requires explicit local disposable source, target, and fixture confirmations."
      );
    }

    const missing = missingRequiredCommands(
      input.requiredCommands ?? DEFAULT_REQUIRED_COMMANDS,
      input.availableCommands
    );
    if (missing.length > 0) {
      return safePlan({
        mode,
        artifactPath,
        pendingInputs: [],
        status: "blocked",
        missingLocalDependencies: missing,
      });
    }
  }

  return safePlan({
    mode,
    artifactPath,
    pendingInputs,
    status: pendingInputs.length > 0 ? "plan" : "ready",
    missingLocalDependencies: [],
  });
}

export function assertLocalDatabaseUrl(value, label) {
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    throw new RestoreProofRefusal(`${label}_database_not_local`, `${label} database URL must be a local Postgres URL.`);
  }

  if (!["postgres:", "postgresql:"].includes(parsed.protocol)) {
    throw new RestoreProofRefusal(`${label}_database_not_local`, `${label} database URL must use postgres/postgresql.`);
  }

  const hostname = parsed.hostname.toLowerCase();
  const localHosts = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);
  if (!localHosts.has(hostname)) {
    throw new RestoreProofRefusal(`${label}_database_not_local`, `${label} database URL must point to localhost.`);
  }
}

export function assertSafeArtifactPath(artifactPath, repoRoot) {
  if (isPathInside(repoRoot, artifactPath)) {
    throw new RestoreProofRefusal(
      "unsafe_artifact_path",
      "Backup artifacts must stay outside the tracked repository tree."
    );
  }
}

export function assertFixtureOnly(input) {
  const nonFixtureRows = Math.max(0, Number(input.nonFixtureRowCount ?? 0));
  if (nonFixtureRows > 0 || input.fixtureOnly === false) {
    throw new RestoreProofRefusal(
      "non_fixture_rows_detected",
      "Local restore proof refuses to run when non-fixture rows are present."
    );
  }
}

export function assertNoStorageRequest(input) {
  if (input.includeStorage) {
    throw new RestoreProofRefusal(
      "storage_operation_forbidden",
      "First local restore proof is database-only and refuses storage operations."
    );
  }
}

export function assertSafeOutputRequest(input) {
  if (input.verboseRawOutput || input.rawOutput) {
    throw new RestoreProofRefusal(
      "raw_output_forbidden",
      "Restore proof output must stay redacted and cannot print raw rows or connection details."
    );
  }
}

export function missingRequiredCommands(requiredCommands, availableCommands) {
  return requiredCommands.filter((command) => {
    if (availableCommands) return !availableCommands.has(command);
    return !commandExists(command);
  });
}

function safePlan({ mode, artifactPath, pendingInputs, status, missingLocalDependencies }) {
  return {
    status,
    mode,
    restoreShape: RESTORE_SHAPE,
    localOnly: true,
    disposableOnly: true,
    syntheticFixtureOnly: true,
    databaseOnly: true,
    artifactLocation: artifactPath.startsWith(os.tmpdir()) ? "os-temp" : "outside-repo",
    pendingInputs,
    missingLocalDependencies,
    allowedEvidence: [
      "command names",
      "safe counts",
      "fixture aliases",
      "owner-scope booleans",
      "pass/fail results",
    ],
    forbiddenEvidence: [
      "connection strings",
      "raw ids",
      "raw rows",
      "private text",
      "manifest bodies",
      "bundle bodies",
      "storage paths",
      "logs",
      "stack traces",
      "env values",
      "secrets",
    ],
  };
}

function assertMode(mode) {
  if (mode !== "plan" && mode !== "execute") {
    throw new RestoreProofRefusal("invalid_mode", "Mode must be plan or execute.");
  }
}

function isPathInside(parent, child) {
  const relative = path.relative(path.resolve(parent), path.resolve(child));
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function commandExists(command) {
  const checker = process.platform === "win32" ? "where.exe" : "command";
  const args = process.platform === "win32" ? [command] : ["-v", command];
  const result = process.platform === "win32"
    ? spawnSync(checker, args, { stdio: "ignore" })
    : spawnSync("sh", ["-lc", `${checker} ${shellQuote(command)}`], { stdio: "ignore" });
  return result.status === 0;
}

function shellQuote(value) {
  return `'${String(value).replace(/'/g, "'\\''")}'`;
}

function parseCliArgs(argv) {
  const options = { mode: "plan" };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    switch (arg) {
      case "--help":
      case "-h":
        options.help = true;
        break;
      case "--plan":
      case "--dry-run":
        options.mode = "plan";
        break;
      case "--execute":
        options.mode = "execute";
        break;
      case "--source":
        options.sourceUrl = nextValue(argv, ++i, arg);
        break;
      case "--target":
        options.targetUrl = nextValue(argv, ++i, arg);
        break;
      case "--artifact":
        options.artifactPath = nextValue(argv, ++i, arg);
        break;
      case "--confirm-local-disposable":
        options.confirmLocalDisposable = true;
        break;
      case "--fixture-only":
        options.fixtureOnly = true;
        break;
      case "--non-fixture-rows":
        options.nonFixtureRowCount = Number(nextValue(argv, ++i, arg));
        break;
      case "--include-storage":
        options.includeStorage = true;
        break;
      case "--verbose":
      case "--raw-output":
        options.verboseRawOutput = true;
        break;
      case "--json":
        options.json = true;
        break;
      default:
        throw new RestoreProofRefusal("unknown_argument", `Unknown argument: ${arg}`);
    }
  }
  return options;
}

function nextValue(argv, index, flag) {
  const value = argv[index];
  if (!value || value.startsWith("--")) {
    throw new RestoreProofRefusal("missing_argument", `${flag} requires a value.`);
  }
  return value;
}

function printHelp() {
  console.log([
    "Usage:",
    "  node scripts/backup-restore-local-proof.mjs --plan",
    "  node scripts/backup-restore-local-proof.mjs --execute --source <local-url> --target <local-url> --confirm-local-disposable --fixture-only",
    "",
    "Truth label:",
    `  ${RESTORE_SHAPE}`,
    "",
    "Default mode is plan/dry-run. Execute mode refuses non-local targets, repo",
    "artifact paths, storage operations, raw output, and non-fixture rows.",
    "This command never prints supplied connection strings.",
  ].join("\n"));
}

function printPlan(plan, json = false) {
  if (json) {
    console.log(JSON.stringify(plan, null, 2));
    return;
  }

  console.log([
    `Status: ${plan.status}`,
    `Mode: ${plan.mode}`,
    `Restore shape: ${plan.restoreShape}`,
    `Artifact location: ${plan.artifactLocation}`,
    `Pending inputs: ${plan.pendingInputs.length > 0 ? plan.pendingInputs.join(", ") : "none"}`,
    `Missing local dependencies: ${plan.missingLocalDependencies.length > 0 ? plan.missingLocalDependencies.join(", ") : "none"}`,
    "Evidence: safe counts, fixture aliases, owner-scope booleans, pass/fail only",
  ].join("\n"));
}

function main() {
  try {
    const options = parseCliArgs(process.argv.slice(2));
    if (options.help) {
      printHelp();
      return;
    }
    const plan = createRestoreProofPlan(options);
    printPlan(plan, options.json);
    if (plan.status === "blocked") process.exitCode = 2;
  } catch (error) {
    if (error instanceof RestoreProofRefusal) {
      console.error(`${error.code}: ${error.message}`);
      process.exitCode = 1;
      return;
    }
    console.error("restore_proof_failed: Local restore proof planner failed.");
    process.exitCode = 1;
  }
}

const thisFile = fileURLToPath(import.meta.url);
if (existsSync(thisFile) && process.argv[1] && path.resolve(process.argv[1]) === thisFile) {
  main();
}
