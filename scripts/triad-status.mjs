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
  const scriptPrefix = agent.scriptPrefix ?? "triad";
  console.log(`  Watch command: npm run ${scriptPrefix}:watch:${agent.codename.toLowerCase()}`);
  console.log(`  Wake header: WAKEUP ${agent.id}:`);
  console.log("");
}
