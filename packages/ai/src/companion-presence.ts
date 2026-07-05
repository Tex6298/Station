export type CompanionPresenceState = "first_contact" | "active_thread" | "returning" | "long_gap";

export interface CompanionPresenceMessage {
  role?: string | null;
  createdAt?: string | Date | null;
  created_at?: string | Date | null;
}

export interface CompanionPresenceProfileInput {
  messages?: CompanionPresenceMessage[];
  now?: string | Date;
}

export interface CompanionPresenceProfile {
  schema: "station.companion_presence.v1";
  state: CompanionPresenceState;
  priorNonSystemMessageCount: number;
  latestPriorMessageAgeHours: number | null;
}

const RETURNING_AFTER_HOURS = 12;
const LONG_GAP_AFTER_HOURS = 24 * 7;

export function buildCompanionPresenceProfile(
  input: CompanionPresenceProfileInput = {},
): CompanionPresenceProfile {
  const now = input.now ? new Date(input.now) : new Date();
  const priorMessages = (input.messages ?? [])
    .filter((message) => message.role !== "system")
    .map((message) => messageDate(message))
    .filter((date): date is Date => Boolean(date))
    .filter((date) => !Number.isNaN(date.getTime()))
    .sort((left, right) => right.getTime() - left.getTime());

  const latest = priorMessages[0] ?? null;
  if (!latest) {
    return {
      schema: "station.companion_presence.v1",
      state: "first_contact",
      priorNonSystemMessageCount: 0,
      latestPriorMessageAgeHours: null,
    };
  }

  const latestPriorMessageAgeHours = Math.max(
    0,
    Math.floor((now.getTime() - latest.getTime()) / 3_600_000),
  );

  return {
    schema: "station.companion_presence.v1",
    state: presenceStateForAge(latestPriorMessageAgeHours),
    priorNonSystemMessageCount: priorMessages.length,
    latestPriorMessageAgeHours,
  };
}

export function formatCompanionPresencePrompt(profile: CompanionPresenceProfile) {
  return [
    "Companion thread presence:",
    `- Thread state: ${profile.state}.`,
    `- Prior same-thread non-system messages: ${profile.priorNonSystemMessageCount}.`,
    `- ${presenceGuidance(profile.state)}`,
    "- Use this only as soft same-thread context. Do not infer mood, intimacy, hidden relationship state, surveillance, guilt, neediness, or durable emotional memory.",
  ].join("\n");
}

function presenceStateForAge(ageHours: number): CompanionPresenceState {
  if (ageHours >= LONG_GAP_AFTER_HOURS) return "long_gap";
  if (ageHours >= RETURNING_AFTER_HOURS) return "returning";
  return "active_thread";
}

function presenceGuidance(state: CompanionPresenceState) {
  if (state === "long_gap") {
    return "The latest prior same-thread message is at least 7 days old; re-enter gently and recap only when useful.";
  }

  if (state === "returning") {
    return "The latest prior same-thread message is at least 12 hours old; offer light reorientation when helpful.";
  }

  if (state === "active_thread") {
    return "The latest prior same-thread message is recent; continue naturally without recapping by default.";
  }

  return "No prior non-system messages are present in this thread; treat this as a fresh private exchange.";
}

function messageDate(message: CompanionPresenceMessage) {
  const value = message.createdAt ?? message.created_at;
  return value ? new Date(value) : null;
}
