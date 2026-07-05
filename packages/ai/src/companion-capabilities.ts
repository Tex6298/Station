export type CompanionCapabilityMode = "conversation_first" | "workflow_assisted" | "extension_assisted";

export interface CompanionCapabilityProfileInput {
  mode?: CompanionCapabilityMode;
  explicitCurrentTurnCapabilities?: string[];
}

export interface CompanionCapabilityProfile {
  schema: "station.companion_capability.v1";
  mode: CompanionCapabilityMode;
  explicitCurrentTurnCapabilities: string[];
}

const DEFAULT_MODE: CompanionCapabilityMode = "conversation_first";
const MAX_EXPLICIT_CAPABILITIES = 4;
const MAX_EXPLICIT_CAPABILITY_CHARS = 140;

export function buildCompanionCapabilityProfile(
  input: CompanionCapabilityProfileInput = {},
): CompanionCapabilityProfile {
  const mode = input.mode ?? DEFAULT_MODE;

  return {
    schema: "station.companion_capability.v1",
    mode,
    explicitCurrentTurnCapabilities:
      mode === "conversation_first"
        ? []
        : sanitizeExplicitCapabilities(input.explicitCurrentTurnCapabilities),
  };
}

export function formatCompanionCapabilityPrompt(
  profile: CompanionCapabilityProfile = buildCompanionCapabilityProfile(),
) {
  const lines = [
    "Companion capability boundary:",
    `- Capability mode: ${capabilityModeLabel(profile.mode)}.`,
    "- You can help clarify, plan, draft, reflect, decide, and preserve continuity inside this conversation.",
    "- You can suggest owner-confirmed plans or checklists for work outside chat.",
    "- You cannot read files, edit systems, browse, call tools, use MCP, access external services, or execute workflows unless Station explicitly provides that capability in this current turn.",
    "- You have no hidden autonomy. Treat selected runtime context as the only available private source context.",
  ];

  if (profile.explicitCurrentTurnCapabilities.length > 0) {
    lines.push(
      "- Explicit current-turn capabilities: " +
        profile.explicitCurrentTurnCapabilities.join("; ") +
        "."
    );
  }

  return lines.join("\n");
}

function capabilityModeLabel(mode: CompanionCapabilityMode) {
  if (mode === "workflow_assisted") return "workflow-assisted by explicit current-turn tools";
  if (mode === "extension_assisted") return "extension-assisted by explicit current-turn tools";
  return "conversation-first";
}

function sanitizeExplicitCapabilities(values: string[] | undefined) {
  return (values ?? [])
    .map((value) => scrubCapabilityText(value).replace(/[\r\n\t]+/g, " ").replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .slice(0, MAX_EXPLICIT_CAPABILITIES)
    .map((value) => value.slice(0, MAX_EXPLICIT_CAPABILITY_CHARS).trim());
}

function scrubCapabilityText(value: string) {
  return value
    .replace(/\bbearer\s+\S+/gi, "bearer [redacted]")
    .replace(/\b(token|secret|password|cookie|authorization|api[_-]?key)\s*=\s*\S+/gi, "$1=[redacted]")
    .replace(/\b(?:sk|pk|rk|whsec|ghp|pat)[_-][A-Za-z0-9._-]+/gi, "[redacted-secret]");
}
