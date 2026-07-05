export type DiscoverRouletteStatus = "loading" | "ready" | "empty" | "unavailable";
export const DISCOVER_ROULETTE_MAX_VISITOR_MESSAGES = 5;

export interface DiscoverRouletteEncounterState {
  publicSlug: string | null;
  submittedMessages: number;
  exhausted: boolean;
}

export function discoverRouletteStatusCopy(status: DiscoverRouletteStatus) {
  if (status === "loading") return "Drawing...";
  if (status === "empty") return "No public personas yet.";
  if (status === "unavailable") return "Persona roulette unavailable.";
  return null;
}

export function discoverRouletteInitialEncounterState(publicSlug?: string | null): DiscoverRouletteEncounterState {
  return {
    publicSlug: publicSlug ?? null,
    submittedMessages: 0,
    exhausted: false,
  };
}

export function discoverRouletteCanSend(state: DiscoverRouletteEncounterState) {
  return Boolean(state.publicSlug) &&
    !state.exhausted &&
    state.submittedMessages < DISCOVER_ROULETTE_MAX_VISITOR_MESSAGES;
}

export function discoverRouletteAfterSubmittedMessage(state: DiscoverRouletteEncounterState): DiscoverRouletteEncounterState {
  const submittedMessages = Math.min(
    DISCOVER_ROULETTE_MAX_VISITOR_MESSAGES,
    Math.max(0, state.submittedMessages) + 1
  );
  return {
    publicSlug: state.publicSlug,
    submittedMessages,
    exhausted: submittedMessages >= DISCOVER_ROULETTE_MAX_VISITOR_MESSAGES,
  };
}

export function discoverRouletteSessionSnapshot(state: DiscoverRouletteEncounterState) {
  return {
    publicSlug: state.publicSlug,
    submittedCount: Math.min(DISCOVER_ROULETTE_MAX_VISITOR_MESSAGES, Math.max(0, state.submittedMessages)),
    exhausted: Boolean(state.exhausted),
  };
}

export function discoverRouletteSerializeSession(state: DiscoverRouletteEncounterState) {
  return JSON.stringify(discoverRouletteSessionSnapshot(state));
}

export function discoverRouletteParseSession(value: string | null, publicSlug: string | null): DiscoverRouletteEncounterState {
  if (!value || !publicSlug) return discoverRouletteInitialEncounterState(publicSlug);

  try {
    const parsed = JSON.parse(value) as {
      publicSlug?: unknown;
      submittedCount?: unknown;
      submittedMessages?: unknown;
      exhausted?: unknown;
    };
    if (parsed.publicSlug !== publicSlug) return discoverRouletteInitialEncounterState(publicSlug);
    const submittedMessages = Math.min(
      DISCOVER_ROULETTE_MAX_VISITOR_MESSAGES,
      Math.max(0, Number(parsed.submittedCount ?? parsed.submittedMessages ?? 0))
    );
    return {
      publicSlug,
      submittedMessages,
      exhausted: Boolean(parsed.exhausted) || submittedMessages >= DISCOVER_ROULETTE_MAX_VISITOR_MESSAGES,
    };
  } catch {
    return discoverRouletteInitialEncounterState(publicSlug);
  }
}

export function discoverRouletteExhaustedCopy() {
  return "This browser-session encounter has reached five visitor messages. Server rate limits and provider checks remain the real abuse boundary.";
}
