import { getAgents, inboxItems, readState, relativePath, inboxPath, statePath } from "./triad-agents.mjs";

for (const agent of getAgents()) {
  const state = readState(agent);
  const items = inboxItems(agent);
  const inboxLabel = items.length === 1 ? "item" : "items";

  console.log(`${agent.id} / ${agent.codename} - ${agent.title}`);
  console.log(`  Inbox: ${relativePath(inboxPath(agent))} (${items.length} ${inboxLabel})`);
  console.log(`  State: ${relativePath(statePath(agent))}`);
  console.log(`  Last wakeup: ${state.lastSeenCommit ? state.lastSeenCommit.slice(0, 12) : "none"}`);
  console.log(`  Last wakeup at: ${state.lastWakeupAt ?? "none"}`);
  console.log(`  Sleeping: ${state.isSleeping ? "yes" : "no"}`);
  console.log(`  Sleep reason: ${state.sleepReason ?? "none"}`);
  console.log(`  Watching since: ${state.watchStartedAt ?? "none"}`);
  console.log(`  Sleep command: npm run triad:sleep:${agent.codename.toLowerCase()}`);
  console.log(`  Watch command: npm run triad:watch:${agent.codename.toLowerCase()}`);
  console.log("");
}
