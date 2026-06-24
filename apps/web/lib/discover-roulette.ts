export type DiscoverRouletteStatus = "loading" | "ready" | "empty" | "unavailable";

export function discoverRouletteStatusCopy(status: DiscoverRouletteStatus) {
  if (status === "loading") return "Drawing...";
  if (status === "empty") return "No public personas yet.";
  if (status === "unavailable") return "Persona roulette unavailable.";
  return null;
}
