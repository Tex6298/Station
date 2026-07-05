import type { PublicPersonaInteractionReadback } from "@station/types/persona";

function countLabel(count: number, noun: string) {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}

export function publicInteractionChatLabel(readback?: PublicPersonaInteractionReadback | null) {
  if (!readback) return "Not available";
  if (!readback.publicChat.enabled) return "Disabled";
  return readback.publicChat.mode === "anonymous_alpha"
    ? "Anonymous alpha enabled"
    : "Signed-in alpha enabled";
}

export function publicInteractionAnonymousEligibilityLabel(readback?: PublicPersonaInteractionReadback | null) {
  const eligibility = readback?.publicChat.anonymousEligibility;
  if (!eligibility) return "Anonymous eligibility unavailable";
  if (eligibility.available) return "Anonymous alpha available";
  if (eligibility.blockerCode === "owner_gate_disabled" || eligibility.blockerCode === "signed_in_only_policy") return "Signed-in alpha only";
  return "Anonymous alpha blocked";
}

export function publicInteractionAnonymousEligibilityCopy(readback?: PublicPersonaInteractionReadback | null) {
  const eligibility = readback?.publicChat.anonymousEligibility;
  if (!eligibility) return "Anonymous eligibility readback is unavailable.";

  const scope = "Public-source-only: public profile, published public documents, and linked public discussions.";
  const storage = "No visitor transcript, identity, or raw events are stored; only aggregate counters remain.";
  const rollback = "Owner rollback is the public chat enable/disable control.";
  const readiness = publicInteractionAnonymousReadinessCopy(readback);

  if (eligibility.available) {
    const availability = eligibility.policy === "replay_alpha_compatibility"
      ? "Anonymous alpha is available for the replay alpha persona."
      : "Anonymous alpha is available for this owner-enabled public persona.";
    return `${availability} ${readiness} ${scope} ${storage} ${rollback}`;
  }

  return `${eligibility.blocker ?? "Anonymous alpha is unavailable."} ${readiness} ${scope} ${storage} ${rollback}`;
}

export function publicInteractionAnonymousReadinessCopy(readback?: PublicPersonaInteractionReadback | null) {
  const eligibility = readback?.publicChat.anonymousEligibility;
  if (!eligibility) return "Rate-limit and provider readiness unavailable.";

  const rateLimit = eligibility.rateLimitFailClosed
    ? `Rate limits fail closed; rate-limit backing is ${eligibility.rateLimitAvailable ? "ready" : "not ready"}.`
    : "Rate-limit posture needs review.";
  const provider = eligibility.providerAvailable
    ? "Provider route is ready."
    : "Provider route is blocked.";

  return `${rateLimit} ${provider}`;
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

export function publicInteractionActivityValue(readback?: PublicPersonaInteractionReadback | null) {
  if (!readback) return "0";
  return String(readback.activity.windows.last7Days.chatAttempts);
}

export function publicInteractionActivitySummary(readback?: PublicPersonaInteractionReadback | null) {
  if (!readback) return "No aggregate activity available.";
  const last7 = readback.activity.windows.last7Days;
  const last30 = readback.activity.windows.last30Days;
  return `${countLabel(last7.chatAttempts, "chat attempt")} / ${countLabel(last7.reportsCreated, "report")} in 7 days; ${countLabel(last30.chatAttempts, "chat attempt")} in 30 days`;
}

export function publicInteractionActivityBoundaryCopy(readback?: PublicPersonaInteractionReadback | null) {
  if (!readback) return "Aggregate counters unavailable.";
  if (
    readback.activity.aggregation === "daily_owner_persona" &&
    !readback.activity.transcriptStored &&
    !readback.activity.visitorIdentityStored &&
    !readback.activity.rawEventsStored
  ) {
    return "Daily aggregate only; no visitor identity or transcript.";
  }
  return "Review public interaction analytics storage.";
}

export function publicInteractionTokenBoundaryCopy(readback?: PublicPersonaInteractionReadback | null) {
  if (!readback) return "Public chat usage is not summarized.";
  if (readback.publicChat.ownerPaid && !readback.publicChat.transcriptStored) {
    return "Owner-paid; visitor transcript not stored.";
  }
  return "Review public interaction accounting.";
}
