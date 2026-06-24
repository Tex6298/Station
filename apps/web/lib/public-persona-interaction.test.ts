import assert from "node:assert/strict";
import test from "node:test";
import type { PublicPersonaInteractionReadback } from "@station/types/persona";
import {
  publicInteractionActivityBoundaryCopy,
  publicInteractionActivitySummary,
  publicInteractionActivityValue,
  publicInteractionChatLabel,
  publicInteractionReportSummary,
  publicInteractionRouteLabel,
  publicInteractionTokenBoundaryCopy,
} from "./public-persona-interaction";

const readback: PublicPersonaInteractionReadback = {
  publicChat: {
    enabled: true,
    mode: "signed_in_alpha",
    ownerPaid: true,
    transcriptStored: false,
    tokenAttribution: "not_available_without_event_retention",
  },
  publicRoute: {
    publicSlug: "public-guide",
    href: "/personas/public-guide",
    canOpen: true,
    unavailableReason: null,
  },
  reports: {
    total: 3,
    active: 2,
    byStatus: {
      open: 1,
      reviewing: 1,
      resolved: 1,
      dismissed: 0,
    },
  },
  activity: {
    aggregation: "daily_owner_persona",
    transcriptStored: false,
    visitorIdentityStored: false,
    rawEventsStored: false,
    windows: {
      last7Days: {
        days: 7,
        chatAttempts: 5,
        chatSuccesses: 4,
        chatFailures: 1,
        reportsCreated: 1,
      },
      last30Days: {
        days: 30,
        chatAttempts: 12,
        chatSuccesses: 10,
        chatFailures: 2,
        reportsCreated: 3,
      },
    },
  },
  moderation: {
    ownerCanSeeReporterIdentity: false,
    ownerCanSeeReportBodies: false,
    adminQueueHref: null,
  },
};

test("public interaction helper labels stay bounded to owner-safe state", () => {
  assert.equal(publicInteractionChatLabel(readback), "Signed-in alpha enabled");
  assert.equal(publicInteractionRouteLabel(readback), "Public route live");
  assert.equal(publicInteractionReportSummary(readback), "2 active / 3 total persona reports");
  assert.equal(publicInteractionTokenBoundaryCopy(readback), "Owner-paid; visitor transcript not stored.");
  assert.equal(publicInteractionActivityValue(readback), "5");
  assert.equal(publicInteractionActivitySummary(readback), "5 chat attempts / 1 report in 7 days; 12 chat attempts in 30 days");
  assert.equal(publicInteractionActivityBoundaryCopy(readback), "Daily aggregate only; no visitor identity or transcript.");
});

test("public interaction helper handles unavailable state without inventing details", () => {
  assert.equal(publicInteractionChatLabel(null), "Not available");
  assert.equal(publicInteractionRouteLabel({
    ...readback,
    publicChat: { ...readback.publicChat, enabled: false },
    publicRoute: {
      publicSlug: null,
      href: null,
      canOpen: false,
      unavailableReason: "Persona is private.",
    },
    reports: {
      total: 0,
      active: 0,
      byStatus: {
        open: 0,
        reviewing: 0,
        resolved: 0,
        dismissed: 0,
      },
    },
  }), "Persona is private.");
  assert.equal(publicInteractionReportSummary({ ...readback, reports: {
    total: 0,
    active: 0,
    byStatus: { open: 0, reviewing: 0, resolved: 0, dismissed: 0 },
  } }), "No persona reports recorded.");
  assert.equal(publicInteractionActivitySummary(null), "No aggregate activity available.");
});
