import assert from "node:assert/strict";
import test from "node:test";
import {
  PERSONA_ENCOUNTER_PREVIEW_PATH,
  personaEncounterPreviewErrorCopy,
  personaEncounterPreviewPayload,
  personaEncounterPreviewReadback,
  personaEncounterPreviewReady,
  type PersonaEncounterPreviewResponse,
} from "./persona-encounter-runtime";

const response: PersonaEncounterPreviewResponse = {
  preview: {
    reply: {
      role: "responder",
      content: "One disposable responder reply.",
    },
    rateLimit: {
      remaining: 1,
      retryAfter: null,
    },
  },
  provenance: {
    setup: {
      label: "Owner-authored setup",
      stored: false,
    },
    personas: {
      label: "Selected same-owner personas",
      initiatorName: "Harbor",
      responderName: "Lantern",
    },
    reply: {
      label: "Model-generated responder reply",
      generated: true,
    },
    persistence: {
      saved: false,
      transcriptStored: false,
      shareable: false,
      sourceRetrieval: false,
      sourceBuckets: [],
      note: "Disposable preview only; no Memory, Archive, Canon, Continuity, Integrity, or transcript sources were retrieved.",
    },
  },
};

test("persona encounter runtime helper builds the bounded preview request", () => {
  assert.equal(PERSONA_ENCOUNTER_PREVIEW_PATH, "/persona-encounters/preview");
  assert.deepEqual(personaEncounterPreviewPayload({
    initiatorPersonaId: "persona-a",
    responderPersonaId: "persona-b",
    setup: "  Say hello once.  ",
    maxOutputTokens: 240,
  }), {
    initiatorPersonaId: "persona-a",
    responderPersonaId: "persona-b",
    setup: "Say hello once.",
    maxOutputTokens: 240,
  });
});

test("persona encounter runtime readiness requires two personas and owner setup", () => {
  assert.equal(personaEncounterPreviewReady({
    initiatorPersonaId: "persona-a",
    responderPersonaId: "persona-b",
    setup: "One prompt.",
  }), true);
  assert.equal(personaEncounterPreviewReady({
    initiatorPersonaId: "persona-a",
    responderPersonaId: "persona-a",
    setup: "One prompt.",
  }), false);
  assert.equal(personaEncounterPreviewReady({
    initiatorPersonaId: "persona-a",
    responderPersonaId: "persona-b",
    setup: "   ",
  }), false);
});

test("persona encounter runtime readback labels disposable provenance", () => {
  const labels = personaEncounterPreviewReadback(response);

  assert.deepEqual(labels, [
    "Owner-authored setup",
    "Selected same-owner personas",
    "Model-generated responder reply",
    "Disposable preview only; no Memory, Archive, Canon, Continuity, Integrity, or transcript sources were retrieved.",
    "Not saved",
    "Not a transcript",
    "Not shareable",
    "No Memory, Archive, Canon, Continuity, Integrity, or transcript sources retrieved",
  ]);
});

test("persona encounter runtime error copy stays bounded", () => {
  assert.equal(personaEncounterPreviewErrorCopy({
    code: "persona_encounter_persona_not_owned",
    message: "raw owner_user_id=secret",
  }), "Both personas must belong to this owner before a preview can run.");
  assert.equal(personaEncounterPreviewErrorCopy({
    code: "persona_encounter_rate_limit_unavailable",
    message: "redis token failed",
  }), "Encounter preview rate limits are unavailable, so the preview is paused.");
  assert.equal(personaEncounterPreviewErrorCopy({
    message: "Generic failure",
  }), "Generic failure");
});
