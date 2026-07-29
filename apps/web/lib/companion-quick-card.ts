export type CompanionQuickCardMode = "closed" | "hover" | "pinned";

export type CompanionQuickCardEvent =
  | "pointer-enter"
  | "pointer-leave"
  | "toggle-pin"
  | "dismiss";

export function companionQuickCardTransition(
  mode: CompanionQuickCardMode,
  event: CompanionQuickCardEvent,
): CompanionQuickCardMode {
  if (event === "dismiss") return "closed";
  if (event === "pointer-enter") return mode === "closed" ? "hover" : mode;
  if (event === "pointer-leave") return mode === "hover" ? "closed" : mode;
  return mode === "pinned" ? "closed" : "pinned";
}
