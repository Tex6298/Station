export type StationAssistantActionLike = {
  kind: string;
  href?: string;
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

export function assistantJobPostureCopy() {
  return "Protected-alpha imports use inline fallback with owner status/readback on existing Studio surfaces. Queue-capable workers remain blocked, so Assistant does not claim background execution or durable queues.";
}

export function assistantActionHrefIsOwnerSafe(href: string) {
  if (/\/(?:background-jobs|discover|public|search|connectors?|oauth|billing|queue|worker|redis|cloudflare|provider|social)(?:\/|$|\?)/i.test(href)) {
    return false;
  }

  const normalized = href.split(/[?#]/)[0] ?? href;
  if ([
    "/studio",
    "/studio/new",
    "/studio/archive",
    "/studio/export",
    "/studio/publish",
    "/studio/publishing",
    "/settings",
  ].includes(normalized)) {
    return true;
  }

  return /^\/studio\/personas\/[^/?#]+(?:\/(?:files|memory-inbox|calibration|canon|continuity|memory|edit))?$/.test(normalized);
}

export function assistantVisibleActions<T extends { href: string }>(actions: T[]) {
  return actions.filter((action) => assistantActionHrefIsOwnerSafe(action.href));
}

export function assistantPromptFromSearch(search: string) {
  const prompt = new URLSearchParams(search).get("prompt")?.trim() ?? "";
  if (!prompt) return null;
  return prompt.length > 220 ? `${prompt.slice(0, 217).trim()}...` : prompt;
}
