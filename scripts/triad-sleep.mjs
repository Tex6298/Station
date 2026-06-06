import { getAgent, readState, relativePath, statePath, writeState } from "./triad-agents.mjs";
import { formatWakeup, newWakeupsFor } from "./triad-wakeups.mjs";

const POLL_MS = 5_000;

function usage() {
  console.log(
    "Usage: node scripts/triad-sleep.mjs <A1|A2|A3> [--reason <text>] [--timeout <seconds>] [--no-wait] [--dry-run]",
  );
}

function parseArgs(args) {
  const [agentId, ...rest] = args;
  const reasonIndex = rest.indexOf("--reason");
  const timeoutIndex = rest.indexOf("--timeout");
  const dryRun = rest.includes("--dry-run");
  const shouldWait = !rest.includes("--no-wait");

  if (!agentId || rest.includes("--help") || rest.includes("-h")) {
    return { agentId, help: true };
  }

  let reason = null;
  let timeoutSeconds = null;

  if (reasonIndex >= 0) {
    const stopWords = new Set(["--timeout", "--dry-run", "--no-wait"]);
    const reasonParts = [];

    for (const item of rest.slice(reasonIndex + 1)) {
      if (stopWords.has(item)) {
        break;
      }

      reasonParts.push(item);
    }

    reason = reasonParts.join(" ").trim() || null;
  } else {
    const positionalReason = rest
      .filter((arg) => !["--dry-run", "--no-wait"].includes(arg))
      .filter((arg, index, all) => {
        if (arg === "--timeout") {
          return false;
        }

        return all[index - 1] !== "--timeout";
      })
      .join(" ")
      .trim();
    reason = positionalReason || null;
  }

  if (timeoutIndex >= 0) {
    timeoutSeconds = Number(rest[timeoutIndex + 1]);

    if (!Number.isFinite(timeoutSeconds) || timeoutSeconds <= 0) {
      throw new Error("--timeout must be a positive number of seconds.");
    }
  }

  return { agentId, dryRun, reason, shouldWait, timeoutMs: timeoutSeconds ? timeoutSeconds * 1_000 : null };
}

function consumeWakeups(agent) {
  const state = readState(agent);
  const newWakeups = newWakeupsFor(agent, state);

  if (newWakeups.length === 0) {
    return false;
  }

  for (const commit of newWakeups.slice().reverse()) {
    console.log(formatWakeup(agent, commit));
  }

  const latest = newWakeups[0];
  writeState(agent, {
    ...state,
    lastSeenCommit: latest.hash,
    lastWakeupAt: latest.authoredAt,
    isSleeping: false,
    sleepStartedAt: null,
    sleepReason: null,
    updatedAt: new Date().toISOString(),
  });

  return true;
}

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function waitForWakeup(agent, timeoutMs) {
  const startedAt = Date.now();

  console.log(`${agent.codename} is sleeping until WAKEUP ${agent.id}: appears.`);

  while (true) {
    if (consumeWakeups(agent)) {
      return;
    }

    if (timeoutMs && Date.now() - startedAt >= timeoutMs) {
      console.log(`${agent.codename} did not receive WAKEUP ${agent.id}: before timeout.`);
      process.exitCode = 2;
      return;
    }

    await wait(POLL_MS);
  }
}

async function main() {
  let options;

  try {
    options = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(error.message);
    usage();
    process.exit(1);
  }

  if (options.help) {
    usage();
    process.exit(options.agentId ? 0 : 1);
  }

  const agent = getAgent(options.agentId);
  const state = readState(agent);
  const now = new Date().toISOString();
  const nextState = {
    ...state,
    isSleeping: true,
    sleepStartedAt: now,
    sleepReason: options.reason,
    updatedAt: now,
  };

  if (!options.dryRun) {
    writeState(agent, nextState);
  }

  console.log(`${agent.id} / ${agent.codename} - ${agent.title} is sleeping.`);
  console.log(`State: ${relativePath(statePath(agent))}${options.dryRun ? " (dry run)" : ""}`);

  if (options.reason) {
    console.log(`Reason: ${options.reason}`);
  }

  if (options.shouldWait && !options.dryRun) {
    await waitForWakeup(agent, options.timeoutMs);
  }
}

await main();
