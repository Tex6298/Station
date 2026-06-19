export type StationAssistantActionLike = {
  kind: string;
  priority: "critical" | "high" | "normal";
  status?: string;
};

export function assistantActionStatusLabel(action: StationAssistantActionLike) {
  return action.status?.trim() || action.kind.replace(/_/g, " ");
}

export function assistantActionTone(action: StationAssistantActionLike) {
  if (action.priority === "critical") return "caution";
  if (action.priority === "high") return "primary";
  return "secondary";
}

export function assistantActionEmptyCopy(actionCount: number) {
  return actionCount > 0
    ? "Station Assistant has live next actions ready."
    : "No urgent action is waiting. Archive, review, publish, and export remain owner-controlled.";
}

export function assistantPromptFromSearch(search: string) {
  const prompt = new URLSearchParams(search).get("prompt")?.trim() ?? "";
  if (!prompt) return null;
  return prompt.length > 220 ? `${prompt.slice(0, 217).trim()}...` : prompt;
}
