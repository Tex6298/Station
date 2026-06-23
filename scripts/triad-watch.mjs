import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  REPO_ROOT,
  getAgent,
  readState,
  relativePath,
  statePath,
  writeState,
} from "./triad-agents.mjs";
import {
  formatWakeup,
  hasWakeupHeader,
  newWakeupsFor,
  readRecentCommits,
} from "./triad-wakeups.mjs";

const POLL_MS = 5_000;
const TIMER_RESTART_SUBJECT = "wake: restart backend flow";
const TIMER_RESTART_SUMMARY = "Timer monitor found no active triad progress.";
const ACCEPTED_PAUSE_MARKER = "Accepted pause is active.";
const FOREGROUND_WATCH_MARKER = "MIMIR returns to foreground watch.";

function usage() {
  console.log([
    "Usage: node scripts/triad-watch.mjs <A1|A2|A3|A4> [--watch] [--no-consume]",
    "       [--ref <git-ref>] [--since <commit-ish>]",
    "       [--fetch --remote <remote> --branch <branch>]",
    "",
    "Examples:",
    "  node scripts/triad-watch.mjs A2 --watch",
    "  node scripts/triad-watch.mjs A2 --watch --fetch --ref fork/main --since HEAD --no-consume",
  ].join("\n"));
}

function flagValue(flags, name) {
  const index = flags.indexOf(name);
  if (index < 0) return null;
  const value = flags[index + 1];
  return value && !value.startsWith("--") ? value : null;
}

function formatFetchError(error) {
  const stderr = error.stderr?.toString().trim();
  return stderr || error.message;
}

function fetchLatest({ remote, branch }, { quiet = false } = {}) {
  try {
    execFileSync(
      "git",
      ["fetch", "--quiet", remote, `${branch}:refs/remotes/${remote}/${branch}`],
      { stdio: "pipe" },
    );
    return true;
  } catch (error) {
    if (!quiet) {
      console.log(`Fetch failed for ${remote}/${branch}; retrying on the next poll.`);
      console.log(formatFetchError(error));
    }

    return false;
  }
}

function resolveCommitish(commitish) {
  return execFileSync(
    "git",
    ["rev-parse", "--verify", `${commitish}^{commit}`],
    { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
  ).trim();
}

function currentCommitWakeup(agent, { ref, since }) {
  if (!since) return null;

  const resolvedRef = resolveCommitish(ref);
  if (resolvedRef !== since) return null;

  const [currentCommit] = readRecentCommits({ maxCount: 1, ref });
  return currentCommit &&
    hasWakeupHeader(agent, currentCommit) &&
    !isAcceptedPauseTimerWake(agent, currentCommit)
    ? currentCommit
    : null;
}

function acceptedPauseIsActive() {
  try {
    const status = readFileSync(
      path.join(REPO_ROOT, "docs", "roadmap", "ACTIVE_STATUS.md"),
      "utf8",
    );

    return status.includes(ACCEPTED_PAUSE_MARKER) &&
      status.includes(FOREGROUND_WATCH_MARKER);
  } catch {
    return false;
  }
}

function isAcceptedPauseTimerWake(agent, commit) {
  if (agent.id !== "A1") return false;
  if (commit.subject !== TIMER_RESTART_SUBJECT) return false;
  if (!commit.body.includes(TIMER_RESTART_SUMMARY)) return false;

  return acceptedPauseIsActive();
}

function poll(agent, { quiet = false, consume = true, fetchConfig = null, ref = "HEAD", since = null } = {}) {
  if (fetchConfig) {
    fetchLatest(fetchConfig, { quiet });
  }

  const state = readState(agent);
  const sameCommitWakeup = currentCommitWakeup(agent, { ref, since });
  if (sameCommitWakeup) {
    console.log(formatWakeup(agent, sameCommitWakeup));
    if (!quiet) {
      console.log(`State not updated (--since includes current ${ref}): ${relativePath(statePath(agent))}`);
    }
    return true;
  }

  const newWakeups = newWakeupsFor(agent, state, { ref, since })
    .filter((commit) => !isAcceptedPauseTimerWake(agent, commit));

  if (newWakeups.length === 0) {
    if (!quiet) {
      console.log(`${agent.id} / ${agent.codename} - ${agent.title}: no new wakeups.`);
      console.log(`Ref: ${ref}`);
      if (since) console.log(`Since: ${since}`);
      console.log(`State: ${relativePath(statePath(agent))}`);
    }

    return false;
  }

  for (const commit of newWakeups.slice().reverse()) {
    console.log(formatWakeup(agent, commit));
  }

  const latest = newWakeups[0];
  if (consume && !since) {
    writeState(agent, {
      ...state,
      lastSeenCommit: latest.hash,
      lastWakeupAt: latest.authoredAt,
      updatedAt: new Date().toISOString(),
    });
  } else if (!quiet) {
    const reason = since ? "--since" : "--no-consume";
    console.log(`State not updated (${reason}): ${relativePath(statePath(agent))}`);
  }

  return true;
}

function main() {
  const [agentId, ...flags] = process.argv.slice(2);

  if (!agentId || flags.includes("--help") || flags.includes("-h")) {
    usage();
    process.exit(agentId ? 0 : 1);
  }

  const agent = getAgent(agentId);
  const shouldWatch = flags.includes("--watch");
  const consume = !flags.includes("--no-consume");
  const shouldFetch = flags.includes("--fetch");
  const remote = flagValue(flags, "--remote") ?? "fork";
  const branch = flagValue(flags, "--branch") ?? "main";
  const ref = flagValue(flags, "--ref") ?? (shouldFetch ? `${remote}/${branch}` : "HEAD");
  const fetchConfig = shouldFetch ? { remote, branch } : null;
  if (fetchConfig) {
    fetchLatest(fetchConfig);
  }
  const sinceFlag = flagValue(flags, "--since");
  const since = sinceFlag ? resolveCommitish(sinceFlag) : null;

  const foundWakeup = poll(agent, { consume, fetchConfig, ref, since });

  if (shouldWatch) {
    if (foundWakeup) return;

    console.log(`${agent.codename} is watching ${ref} for WAKEUP ${agent.id}: every ${POLL_MS / 1_000}s.`);
    setInterval(() => {
      if (poll(agent, { quiet: true, consume, fetchConfig, ref, since })) process.exit(0);
    }, POLL_MS);
  }
}

main();
