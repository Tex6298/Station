import {
  getAgent,
  readState,
  relativePath,
  statePath,
  writeState,
} from "./triad-agents.mjs";
import { formatWakeup, newWakeupsFor } from "./triad-wakeups.mjs";

const POLL_MS = 5_000;

function usage() {
  console.log("Usage: node scripts/triad-watch.mjs <A1|A2|A3> [--watch]");
}

function poll(agent, { quiet = false } = {}) {
  const state = readState(agent);
  const newWakeups = newWakeupsFor(agent, state);

  if (newWakeups.length === 0) {
    if (!quiet) {
      console.log(`${agent.id} / ${agent.codename} - ${agent.title}: no new wakeups.`);
      console.log(`State: ${relativePath(statePath(agent))}`);
    }

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
    updatedAt: new Date().toISOString(),
  });

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

  poll(agent);

  if (shouldWatch) {
    console.log(`${agent.codename} is watching for WAKEUP ${agent.id}: every ${POLL_MS / 1_000}s.`);
    setInterval(() => poll(agent, { quiet: true }), POLL_MS);
  }
}

main();
