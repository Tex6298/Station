import type {
  DeveloperSpaceBatchImportPayload,
  DeveloperSpaceObservedRuntimeFieldVisibility,
} from "./index";

export interface AgentsObserveHookEventFixture {
  schema: "station.fixture.agents_observe.hook_event.v1";
  sessionId: string;
  eventId: string;
  observedAt: string;
  agent: {
    id: string;
    role: string;
  };
  hook: {
    name: string;
    toolName?: string;
    status: "started" | "completed" | "errored";
  };
  tokenUsage?: {
    inputTokens?: number;
    outputTokens?: number;
  };
  filesTouched?: string[];
  raw: {
    prompt?: string;
    commandBody?: string;
    toolPayload?: Record<string, unknown>;
    terminalOutput?: string;
    tokenValue?: string;
  };
}

export const agentsObserveHookEventFixture: AgentsObserveHookEventFixture = {
  schema: "station.fixture.agents_observe.hook_event.v1",
  sessionId: "session-alpha",
  eventId: "event-tool-001",
  observedAt: "2026-06-21T02:58:00.000Z",
  agent: {
    id: "agent-reviewer",
    role: "reviewer",
  },
  hook: {
    name: "tool_call",
    toolName: "shell",
    status: "completed",
  },
  tokenUsage: {
    inputTokens: 1200,
    outputTokens: 340,
  },
  filesTouched: [
    "C:/fixture/private/project/.env",
    "C:/fixture/private/project/src/secret-task.ts",
  ],
  raw: {
    prompt: "FIXTURE_RAW_PROMPT_SHOULD_NOT_APPEAR",
    commandBody: "FIXTURE_COMMAND_BODY_SHOULD_NOT_APPEAR",
    toolPayload: {
      token: "FIXTURE_TOOL_TOKEN_SHOULD_NOT_APPEAR",
      path: "C:/fixture/private/project/.env",
    },
    terminalOutput: "FIXTURE_TERMINAL_OUTPUT_SHOULD_NOT_APPEAR",
    tokenValue: "FIXTURE_TOKEN_VALUE_SHOULD_NOT_APPEAR",
  },
};

const REDACTED = "[redacted by Station Agents Observe transform]";

export function transformAgentsObserveHookEvent(
  event: AgentsObserveHookEventFixture,
): DeveloperSpaceBatchImportPayload {
  const sessionNodeId = `agents-observe:session:${stableId(event.sessionId)}`;
  const agentNodeId = `agents-observe:agent:${stableId(event.agent.id)}`;
  const fileTouchCount = event.filesTouched?.length ?? 0;
  const inputTokens = event.tokenUsage?.inputTokens ?? 0;
  const outputTokens = event.tokenUsage?.outputTokens ?? 0;
  const sensitiveInventory = buildSensitiveInventory(event);

  return {
    nodes: [
      {
        nodeId: sessionNodeId,
        nodeName: "Agents Observe session",
        topologyType: "branching",
        fragmentCount: 1,
        provenance: "imported",
        sourceRefs: ["simple10/agents-observe public docs"],
        metrics: {
          source: "agents-observe",
          sessionEventCount: 1,
          toolEventCount: event.hook.toolName ? 1 : 0,
          fileTouchCount,
          inputTokenCount: inputTokens,
          outputTokenCount: outputTokens,
          status: event.hook.status,
        },
        fieldClassifications: publicFields([
          "source",
          "sessionEventCount",
          "toolEventCount",
          "fileTouchCount",
          "inputTokenCount",
          "outputTokenCount",
          "status",
        ]),
      },
      {
        nodeId: agentNodeId,
        nodeName: "Agents Observe agent",
        topologyType: "radial",
        fragmentCount: 1,
        provenance: "imported",
        sourceRefs: ["simple10/agents-observe public docs"],
        metrics: {
          source: "agents-observe",
          role: event.agent.role,
          status: event.hook.status,
          linkedSessionCount: 1,
        },
        fieldClassifications: publicFields(["source", "role", "status", "linkedSessionCount"]),
      },
    ],
    events: [
      {
        eventType: `agents_observe.${event.hook.name}`,
        eventLabel: "Agents Observe hook event",
        nodeId: sessionNodeId,
        occurredAt: event.observedAt,
        visibility: "public",
        provenance: "imported",
        sourceRefs: ["simple10/agents-observe public docs"],
        eventData: {
          source: "agents-observe",
          hookName: event.hook.name,
          toolName: event.hook.toolName ?? "unknown",
          status: event.hook.status,
          agentRole: event.agent.role,
          fileTouchCount,
          inputTokenCount: inputTokens,
          outputTokenCount: outputTokens,
          redactedSensitiveFieldCount: sensitiveInventory.length,
        },
        fieldClassifications: publicFields([
          "source",
          "hookName",
          "toolName",
          "status",
          "agentRole",
          "fileTouchCount",
          "inputTokenCount",
          "outputTokenCount",
          "redactedSensitiveFieldCount",
        ]),
      },
    ],
    snapshots: [
      {
        occurredAt: event.observedAt,
        visibility: "public",
        provenance: "imported",
        sourceRefs: ["simple10/agents-observe public docs"],
        snapshotData: {
          source: "agents-observe",
          sessionCount: 1,
          agentCount: 1,
          eventCount: 1,
          fileTouchCount,
          sensitiveFieldPolicy: "raw/private fields redacted before Station payload",
        },
        fieldClassifications: publicFields([
          "source",
          "sessionCount",
          "agentCount",
          "eventCount",
          "fileTouchCount",
          "sensitiveFieldPolicy",
        ]),
      },
    ],
    supportingContext: [
      {
        contextType: "provenance",
        externalId: event.eventId,
        sourceRef: "simple10/agents-observe public docs",
        occurredAt: event.observedAt,
        provenance: "imported",
        payload: {
          source: "agents-observe",
          evidence: "Public docs describe hook stdin JSON, CLI POST, API server, SQLite storage, and WebSocket live updates.",
          sessionId: event.sessionId,
          agentId: event.agent.id,
          sensitiveFieldInventory: sensitiveInventory,
          rawPrompt: event.raw.prompt ? REDACTED : undefined,
          commandBody: event.raw.commandBody ? REDACTED : undefined,
          filePaths: fileTouchCount > 0 ? event.filesTouched?.map(() => REDACTED) : undefined,
          toolPayload: event.raw.toolPayload ? REDACTED : undefined,
          terminalOutput: event.raw.terminalOutput ? REDACTED : undefined,
          tokenValue: event.raw.tokenValue ? REDACTED : undefined,
        },
        fieldClassifications: {
          source: "public",
          evidence: "public",
          sessionId: "private",
          agentId: "private",
          sensitiveFieldInventory: "owner",
          rawPrompt: "private",
          commandBody: "private",
          filePaths: "private",
          toolPayload: "private",
          terminalOutput: "private",
          tokenValue: "secret",
        },
      },
    ],
  };
}

function buildSensitiveInventory(event: AgentsObserveHookEventFixture) {
  const inventory: string[] = [];
  if (event.raw.prompt) inventory.push("rawPrompt");
  if (event.raw.commandBody) inventory.push("commandBody");
  if (event.filesTouched?.length) inventory.push("filePaths");
  if (event.raw.toolPayload) inventory.push("toolPayload");
  if (event.raw.terminalOutput) inventory.push("terminalOutput");
  if (event.raw.tokenValue) inventory.push("tokenValue");
  return inventory;
}

function publicFields(fields: string[]) {
  return Object.fromEntries(fields.map((field) => [field, "public"])) as Record<
    string,
    DeveloperSpaceObservedRuntimeFieldVisibility
  >;
}

function stableId(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "unknown";
}
