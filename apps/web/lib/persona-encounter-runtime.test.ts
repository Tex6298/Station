import assert from "node:assert/strict";
import test from "node:test";
import {
  PERSONA_ENCOUNTER_PRIVATE_SESSIONS_PATH,
  PERSONA_ENCOUNTER_PREVIEW_PATH,
  PERSONA_ENCOUNTER_PREVIEW_READINESS_PATH,
  personaEncounterPrivateSessionPath,
  personaEncounterPrivateSessionReadback,
  personaEncounterPreviewAvailabilityCopy,
  personaEncounterPreviewErrorCopy,
  personaEncounterPreviewPayload,
  personaEncounterPreviewReadback,
  personaEncounterPreviewReadinessPath,
  personaEncounterPreviewReady,
  type PersonaEncounterPreviewResponse,
  type PersonaEncounterPrivateSession,
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
  assert.equal(PERSONA_ENCOUNTER_PREVIEW_READINESS_PATH, "/persona-encounters/preview/readiness");
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

test("persona encounter runtime helper builds provider readiness path", () => {
  assert.equal(
    personaEncounterPreviewReadinessPath({
      initiatorPersonaId: "persona a",
      responderPersonaId: "persona/b",
    }),
    "/persona-encounters/preview/readiness?initiatorPersonaId=persona+a&responderPersonaId=persona%2Fb",
  );
});

test("persona encounter runtime helper builds private session paths", () => {
  assert.equal(PERSONA_ENCOUNTER_PRIVATE_SESSIONS_PATH, "/persona-encounters/private-sessions");
  assert.equal(
    personaEncounterPrivateSessionPath("session/one"),
    "/persona-encounters/private-sessions/session%2Fone",
  );
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

test("persona encounter runtime readback labels private saved artifacts honestly", () => {
  const session: PersonaEncounterPrivateSession = {
    id: "session-1",
    createdAt: "2026-07-11T00:00:00.000Z",
    updatedAt: "2026-07-11T00:00:00.000Z",
    setup: {
      label: "Owner-authored setup",
      content: "A private setup.",
      stored: true,
    },
    personas: {
      label: "Selected same-owner personas",
      initiatorName: "Harbor",
      responderName: "Lantern",
    },
    reply: {
      label: "Model-generated responder reply",
      role: "responder",
      content: "A saved reply.",
      generated: true,
    },
    provenance: {
      artifact: {
        label: "Private owner-only artifact",
        private: true,
        ownerOnly: true,
        serverCreated: true,
      },
      persistence: {
        saved: true,
        transcriptStored: false,
        shareable: false,
        public: false,
        sourceRetrieval: false,
        sourceBuckets: [],
        note: "Private saved encounter artifact; no Memory, Archive, Canon, Continuity, Integrity, or transcript sources were retrieved.",
      },
    },
  };

  assert.deepEqual(personaEncounterPrivateSessionReadback(session), [
    "Private owner-only artifact",
    "Owner-authored setup",
    "Selected same-owner personas",
    "Model-generated responder reply",
    "Private saved encounter artifact; no Memory, Archive, Canon, Continuity, Integrity, or transcript sources were retrieved.",
    "Saved private artifact",
    "Not public",
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
  assert.equal(personaEncounterPreviewErrorCopy({
    code: "persona_encounter_provider_empty_reply",
    message: "raw provider payload",
  }), "Encounter preview provider returned no visible reply.");
  assert.equal(personaEncounterPreviewErrorCopy({
    code: "persona_encounter_private_session_delete_failed",
    message: "sql table detail",
  }), "Private encounter artifact could not be deleted.");
});

test("persona encounter runtime availability copy fails closed before generation", () => {
  assert.equal(
    personaEncounterPreviewAvailabilityCopy(null),
    "Checking encounter preview provider setup.",
  );
  assert.equal(
    personaEncounterPreviewAvailabilityCopy({ ready: true, message: "ok" }),
    "Encounter preview provider is ready.",
  );
  assert.equal(
    personaEncounterPreviewAvailabilityCopy({
      ready: false,
      code: "persona_encounter_provider_unavailable",
      message: "raw provider details",
    }),
    "Encounter preview is paused because provider setup is unavailable.",
  );
  assert.equal(
    personaEncounterPreviewAvailabilityCopy({
      ready: false,
      code: "persona_encounter_persona_not_owned",
      message: "raw owner_user_id=secret",
    }),
    "Both personas must belong to this owner before a preview can run.",
  );
});
