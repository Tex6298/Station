import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const AGENTS = {
  A1: { codename: "MIMIR", title: "The Conductor" },
  A2: { codename: "DAEDALUS", title: "The Machinist" },
  A3: { codename: "ARGUS", title: "The Sentinel" },
  A4: { codename: "ARIADNE", title: "The UX Navigator", inboxName: "A4" },
  A5: { codename: "KVASIR", title: "The Distiller", scriptPrefix: "advance" },
  A6: { codename: "SESHAT", title: "The Archivist", scriptPrefix: "advance" },
  A7: { codename: "JANUS", title: "The Gatekeeper", scriptPrefix: "advance" },
  A8: { codename: "CASSANDRA", title: "The Foresight", scriptPrefix: "advance" },
};

export const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const TRIAD_ROOT = path.join(REPO_ROOT, ".station-agents");

export function getAgent(agentId) {
  const normalizedId = agentId?.toUpperCase();
  const agent = AGENTS[normalizedId];

  if (!agent) {
    const validIds = Object.keys(AGENTS).join(", ");
    throw new Error(`Unknown agent "${agentId}". Expected one of: ${validIds}`);
  }

  return { id: normalizedId, ...agent };
}

export function getAgents() {
  return Object.keys(AGENTS).map(getAgent);
}

export function inboxPath(agent) {
  return path.join(TRIAD_ROOT, "inbox", agent.inboxName ?? agent.codename);
}

export function statePath(agent) {
  return path.join(TRIAD_ROOT, "state", `${agent.codename}.json`);
}

export function relativePath(filePath) {
  return path.relative(REPO_ROOT, filePath).replaceAll(path.sep, "/");
}

export function ensureAgentPaths(agent) {
  mkdirSync(inboxPath(agent), { recursive: true });
  mkdirSync(path.dirname(statePath(agent)), { recursive: true });

  if (!existsSync(statePath(agent))) {
    writeState(agent, defaultState(agent));
  }
}

export function defaultState(agent) {
  return {
    agentId: agent.id,
    codename: agent.codename,
    title: agent.title,
    lastSeenCommit: null,
    lastWakeupAt: null,
    updatedAt: null,
  };
}

export function readState(agent) {
  ensureAgentPaths(agent);

  try {
    return { ...defaultState(agent), ...JSON.parse(readFileSync(statePath(agent), "utf8")) };
  } catch (error) {
    throw new Error(`Could not read ${relativePath(statePath(agent))}: ${error.message}`);
  }
}

export function writeState(agent, nextState) {
  const merged = { ...defaultState(agent), ...nextState };
  const cleanState = {
    agentId: agent.id,
    codename: agent.codename,
    title: agent.title,
    lastSeenCommit: merged.lastSeenCommit,
    lastWakeupAt: merged.lastWakeupAt,
    updatedAt: merged.updatedAt,
  };

  writeFileSync(
    statePath(agent),
    `${JSON.stringify(cleanState, null, 2)}\n`,
    "utf8",
  );
}

export function inboxItems(agent) {
  ensureAgentPaths(agent);

  return readdirSync(inboxPath(agent), { withFileTypes: true })
    .filter((item) => item.name !== ".gitkeep")
    .map((item) => ({
      name: item.name,
      kind: item.isDirectory() ? "dir" : "file",
    }));
}
