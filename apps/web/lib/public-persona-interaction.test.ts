import assert from "node:assert/strict";
import test from "node:test";
import type { PublicPersonaInteractionReadback } from "@station/types/persona";
import {
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
});
