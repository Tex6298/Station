import type { PublicPersonaInteractionReadback } from "@station/types/persona";

export function publicInteractionChatLabel(readback?: PublicPersonaInteractionReadback | null) {
  if (!readback) return "Not available";
  return readback.publicChat.enabled ? "Signed-in alpha enabled" : "Disabled";
}

export function publicInteractionRouteLabel(readback?: PublicPersonaInteractionReadback | null) {
  if (!readback) return "No public route";
  if (readback.publicRoute.canOpen) return "Public route live";
  return readback.publicRoute.unavailableReason ?? "Public route unavailable";
}

export function publicInteractionReportSummary(readback?: PublicPersonaInteractionReadback | null) {
  if (!readback) return "No public report summary available.";
  if (readback.reports.total === 0) return "No persona reports recorded.";
  return `${readback.reports.active} active / ${readback.reports.total} total persona reports`;
}

export function publicInteractionTokenBoundaryCopy(readback?: PublicPersonaInteractionReadback | null) {
  if (!readback) return "Public chat usage is not summarized.";
  if (readback.publicChat.ownerPaid && !readback.publicChat.transcriptStored) {
    return "Owner-paid; visitor transcript not stored.";
  }
  return "Review public interaction accounting.";
}
