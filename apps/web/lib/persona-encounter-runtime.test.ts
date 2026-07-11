import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  PERSONA_ENCOUNTER_CROSS_OWNER_CONSENTS_PATH,
  PERSONA_ENCOUNTER_CROSS_OWNER_CONSENT_PUBLIC_CREATE_PATH,
  PERSONA_ENCOUNTER_CROSS_OWNER_CONSENT_TARGETS_PATH,
  PERSONA_ENCOUNTER_CROSS_OWNER_DISPOSABLE_PREVIEW_SCHEMA,
  PERSONA_ENCOUNTER_CROSS_OWNER_PUBLIC_EXHIBIT_CONTRACT_VERSION,
  PERSONA_ENCOUNTER_CROSS_OWNER_PUBLIC_EXHIBIT_PROVENANCE_SCHEMA,
  PERSONA_ENCOUNTER_CROSS_OWNER_PUBLIC_EXHIBIT_REQUIRED_SCOPE,
  PERSONA_ENCOUNTER_CROSS_OWNER_PUBLIC_EXHIBITS_PATH,
  PERSONA_ENCOUNTER_PRIVATE_SESSIONS_PATH,
  PERSONA_ENCOUNTER_PRIVATE_SESSION_CURATION_SCHEMA,
  PERSONA_ENCOUNTER_PUBLIC_EXHIBIT_PROVENANCE_SCHEMA,
  PERSONA_ENCOUNTER_PUBLIC_EXHIBITS_PATH,
  PERSONA_ENCOUNTER_PREVIEW_PATH,
  PERSONA_ENCOUNTER_PREVIEW_READINESS_PATH,
  personaEncounterCrossOwnerConsentCanRun,
  personaEncounterCrossOwnerConsentActionErrorCopy,
  personaEncounterCrossOwnerConsentActionPath,
  personaEncounterCrossOwnerConsentActionPayload,
  personaEncounterCrossOwnerConsentAvailableActions,
  personaEncounterCrossOwnerConsentCreateByPublicSlugPayload,
  personaEncounterCrossOwnerConsentDisplay,
  personaEncounterCrossOwnerConsentInvitationErrorCopy,
  personaEncounterCrossOwnerConsentLedgerBoundaryReadback,
  personaEncounterCrossOwnerConsentPath,
  personaEncounterCrossOwnerConsentPublicExhibitPath,
  personaEncounterCrossOwnerConsentStateCopy,
  personaEncounterCrossOwnerConsentTargetPath,
  personaEncounterCrossOwnerCounterpartyPublicSlug,
  personaEncounterCrossOwnerDisposablePreviewErrorCopy,
  personaEncounterCrossOwnerDisposablePreviewPath,
  personaEncounterCrossOwnerDisposablePreviewPayload,
  personaEncounterCrossOwnerDisposablePreviewReadback,
  personaEncounterCrossOwnerDisposablePreviewReady,
  personaEncounterCrossOwnerPublicExhibitApprovePath,
  personaEncounterCrossOwnerPublicExhibitErrorCopy,
  personaEncounterCrossOwnerPublicExhibitListPath,
  personaEncounterCrossOwnerPublicExhibitMetadataPayload,
  personaEncounterCrossOwnerPublicExhibitPath,
  personaEncounterCrossOwnerPublicExhibitReadback,
  personaEncounterCrossOwnerPublicExhibitReportPath,
  personaEncounterCrossOwnerPublicExhibitRetractPath,
  personaEncounterCrossOwnerPublicExhibitWebHref,
  personaEncounterPrivateSessionCurationPath,
  personaEncounterPrivateSessionCurationPayload,
  personaEncounterPrivateSessionPublicExhibitPath,
  personaEncounterPrivateSessionPath,
  personaEncounterPrivateSessionReadback,
  personaEncounterPublicExhibitListPath,
  personaEncounterPublicExhibitPath,
  personaEncounterPublicExhibitPublishPayload,
  personaEncounterPublicExhibitReportPath,
  personaEncounterPublicExhibitRetractPath,
  personaEncounterPublicExhibitWebHref,
  personaEncounterPreviewAvailabilityCopy,
  personaEncounterPreviewErrorCopy,
  personaEncounterPreviewPayload,
  personaEncounterPreviewReadback,
  personaEncounterPreviewReadinessPath,
  personaEncounterPreviewReady,
  type PersonaEncounterCrossOwnerConsent,
  type PersonaEncounterCrossOwnerPublicExhibitOwnerReadback,
  type PersonaEncounterCrossOwnerDisposablePreviewResponse,
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

const crossOwnerResponse: PersonaEncounterCrossOwnerDisposablePreviewResponse = {
  preview: {
    reply: {
      role: "responder",
      content: "One private cross-owner reply.",
      generated: true,
      private: true,
      disposable: true,
      canonical: false,
      public: false,
      saved: false,
      transcript: false,
      summary: false,
      excerpt: false,
      shareable: false,
      sourceRetrieval: false,
    },
    rateLimit: {
      remaining: 1,
      retryAfter: null,
    },
  },
  provenance: {
    schema: "station.persona_encounter.cross_owner_disposable_preview.v1",
    setup: {
      label: "Actor-authored setup",
      stored: false,
    },
    consent: {
      id: "consent-1",
      participantRole: "requester",
      requestedScope: "run_cross_owner_encounter",
      requestedScopeVersion: 1,
      executable: false,
    },
    readiness: {
      code: "ready",
      message: "Ready.",
    },
    personas: {
      label: "Consent display snapshots",
      initiatorName: "Harbor",
      responderName: "Lantern",
    },
    reply: {
      label: "Model-generated responder reply",
      generated: true,
      private: true,
      disposable: true,
      nonCanonical: true,
      public: false,
    },
    persistence: {
      saved: false,
      privateSessionCreated: false,
      publicExhibitCreated: false,
      transcriptStored: false,
      summaryStored: false,
      excerptStored: false,
      shareable: false,
      sourceRetrieval: false,
      sourceBuckets: [],
      note: "Cross-owner disposable preview only; no private retrieval, Memory, Archive, Canon, Continuity, transcript, summary, excerpt, private session, or public exhibit was created.",
    },
    counterparty: {
      label: "Counterparty does not see this generated reply here",
      generatedReplyVisibleHere: false,
    },
    audit: {
      label: "Runtime attempt audit recorded",
      recorded: true,
    },
  },
};

function crossOwnerConsent(
  overrides: Partial<PersonaEncounterCrossOwnerConsent> = {},
): PersonaEncounterCrossOwnerConsent {
  return {
    id: "consent-1",
    status: "approved",
    participantRole: "requester",
    participants: {
      requester: {
        role: "requester",
        personaName: "Harbor",
        currentUser: true,
      },
      counterparty: {
        role: "counterparty",
        personaName: "Lantern",
        currentUser: false,
      },
    },
    requestedScopes: [{
      scope: "run_cross_owner_encounter",
      label: "Run cross-owner encounter",
      executable: false,
    }],
    requestedScopeVersion: 1,
    ledger: {
      consentRecordActive: true,
      executable: false,
      permitsRuntime: false,
      permitsPrivateArtifact: false,
      permitsPublicExhibit: false,
      permitsGeneratedWords: false,
      permitsTranscript: false,
      permitsSummary: false,
      permitsPublicSurfacing: false,
      note: "Consent ledger only.",
    },
    timestamps: {
      createdAt: "2026-07-11T00:00:00.000Z",
      updatedAt: "2026-07-11T00:00:00.000Z",
      requesterApprovedAt: "2026-07-11T00:00:00.000Z",
      counterpartyApprovedAt: "2026-07-11T00:00:00.000Z",
      rejectedAt: null,
      cancelledAt: null,
      revokedAt: null,
      expiredAt: null,
      supersededAt: null,
      blockedByDeletionAt: null,
      moderationLockedAt: null,
    },
    reasonCode: null,
    provenance: {
      label: "Cross-owner consent ledger record",
      schema: "station.persona_encounter.cross_owner_consent.v1",
      participantOwnerOnly: true,
      auditAppendOnly: true,
      public: false,
      note: "Readback is limited to participant owners.",
    },
    audit: [],
    ...overrides,
  };
}

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

test("persona encounter runtime helper builds the consent-scoped cross-owner disposable preview request", () => {
  assert.equal(PERSONA_ENCOUNTER_CROSS_OWNER_CONSENTS_PATH, "/persona-encounters/cross-owner-consents");
  assert.equal(
    PERSONA_ENCOUNTER_CROSS_OWNER_DISPOSABLE_PREVIEW_SCHEMA,
    "station.persona_encounter.cross_owner_disposable_preview.v1",
  );
  assert.equal(
    personaEncounterCrossOwnerDisposablePreviewPath("consent/one"),
    "/persona-encounters/cross-owner-consents/consent%2Fone/disposable-preview",
  );
  const payload = personaEncounterCrossOwnerDisposablePreviewPayload({
    setup: "  One consent-scoped setup.  ",
    maxOutputTokens: 120,
  });
  assert.deepEqual(payload, {
    setup: "One consent-scoped setup.",
    maxOutputTokens: 120,
  });

  const payloadJson = JSON.stringify(payload);
  assert.equal(payloadJson.includes("initiatorPersonaId"), false);
  assert.equal(payloadJson.includes("responderPersonaId"), false);
  assert.equal(payloadJson.includes("ownerUserId"), false);
  assert.equal(payloadJson.includes("persona_id"), false);
});

test("persona encounter runtime helper builds public-slug counterparty selection requests", () => {
  assert.equal(
    PERSONA_ENCOUNTER_CROSS_OWNER_CONSENT_TARGETS_PATH,
    "/persona-encounters/cross-owner-consent-targets",
  );
  assert.equal(
    PERSONA_ENCOUNTER_CROSS_OWNER_CONSENT_PUBLIC_CREATE_PATH,
    "/persona-encounters/cross-owner-consents/from-public-persona",
  );
  assert.equal(
    personaEncounterCrossOwnerCounterpartyPublicSlug("/personas/other-owner-persona"),
    "other-owner-persona",
  );
  assert.equal(
    personaEncounterCrossOwnerCounterpartyPublicSlug("other-owner-persona"),
    "other-owner-persona",
  );
  assert.equal(
    personaEncounterCrossOwnerCounterpartyPublicSlug("/personas/other-owner-persona?from=discover"),
    "other-owner-persona",
  );
  assert.equal(personaEncounterCrossOwnerCounterpartyPublicSlug("/personas/other-owner-persona/extra"), null);
  assert.equal(personaEncounterCrossOwnerCounterpartyPublicSlug("550e8400-e29b-41d4-a716-446655440000"), null);
  assert.equal(personaEncounterCrossOwnerCounterpartyPublicSlug("Unsafe Slug"), null);
  assert.equal(
    personaEncounterCrossOwnerConsentTargetPath("/personas/other-owner-persona"),
    "/persona-encounters/cross-owner-consent-targets/other-owner-persona",
  );

  const payload = personaEncounterCrossOwnerConsentCreateByPublicSlugPayload({
    requesterPersonaId: "requester-persona-id",
    counterpartyPublicSlug: "/personas/other-owner-persona",
    requestedScopes: ["run_cross_owner_encounter", "publish_metadata_only_public_exhibit"],
  });
  assert.deepEqual(payload, {
    requesterPersonaId: "requester-persona-id",
    counterpartyPublicSlug: "other-owner-persona",
    requestedScopes: ["run_cross_owner_encounter", "publish_metadata_only_public_exhibit"],
  });

  const payloadJson = JSON.stringify(payload);
  assert.equal(payloadJson.includes("counterpartyPersonaId"), false);
  assert.equal(payloadJson.includes("ownerUserId"), false);
  assert.equal(payloadJson.includes("owner_user_id"), false);
  assert.equal(payloadJson.includes("providerPayload"), false);
});

test("persona encounter runtime helper builds cross-owner consent ledger action requests", () => {
  assert.equal(
    personaEncounterCrossOwnerConsentPath("consent/one"),
    "/persona-encounters/cross-owner-consents/consent%2Fone",
  );
  assert.equal(
    personaEncounterCrossOwnerConsentActionPath("consent/one", "approve"),
    "/persona-encounters/cross-owner-consents/consent%2Fone/approve",
  );
  assert.equal(
    personaEncounterCrossOwnerConsentActionPath("consent/one", "reject"),
    "/persona-encounters/cross-owner-consents/consent%2Fone/reject",
  );
  assert.deepEqual(personaEncounterCrossOwnerConsentActionPayload(), {});
  assert.deepEqual(personaEncounterCrossOwnerConsentActionPayload({
    reasonCode: " owner_request ",
  }), { reasonCode: "owner_request" });
  assert.deepEqual(personaEncounterCrossOwnerConsentActionPayload({
    reasonCode: "owner_user_id=secret",
  }), {});
  assert.deepEqual(personaEncounterCrossOwnerConsentLedgerBoundaryReadback(), [
    "Consent ledger only",
    "Not a saved session",
    "Not public by itself",
    "Does not share generated words",
    "Cross-owner public metadata requires separate exact bilateral metadata approval",
    "No transcript, summary, excerpt, generated words, or share-link publication by consent alone",
    "No Memory, Archive, Canon, Continuity, Integrity, or private retrieval",
    "Approval can be revoked",
    "Counterparty sees consent state and audit metadata, not generated preview text here.",
  ]);
});

test("persona encounter runtime helper builds cross-owner public metadata exhibit requests", () => {
  assert.equal(
    PERSONA_ENCOUNTER_CROSS_OWNER_PUBLIC_EXHIBITS_PATH,
    "/persona-encounters/cross-owner-public-exhibits",
  );
  assert.equal(
    PERSONA_ENCOUNTER_CROSS_OWNER_PUBLIC_EXHIBIT_PROVENANCE_SCHEMA,
    "station.persona_encounter.cross_owner_public_exhibit.v1",
  );
  assert.equal(PERSONA_ENCOUNTER_CROSS_OWNER_PUBLIC_EXHIBIT_REQUIRED_SCOPE, "publish_metadata_only_public_exhibit");
  assert.equal(PERSONA_ENCOUNTER_CROSS_OWNER_PUBLIC_EXHIBIT_CONTRACT_VERSION, 1);
  assert.equal(
    personaEncounterCrossOwnerConsentPublicExhibitPath("consent/one"),
    "/persona-encounters/cross-owner-consents/consent%2Fone/public-exhibit",
  );
  assert.equal(
    personaEncounterCrossOwnerPublicExhibitPath("cross/slug"),
    "/persona-encounters/cross-owner-public-exhibits/cross%2Fslug",
  );
  assert.equal(
    personaEncounterCrossOwnerPublicExhibitListPath({ limit: 12 }),
    "/persona-encounters/cross-owner-public-exhibits?limit=12",
  );
  assert.equal(
    personaEncounterCrossOwnerPublicExhibitListPath({ limit: 12, cursor: "cursor/token" }),
    "/persona-encounters/cross-owner-public-exhibits?limit=12&cursor=cursor%2Ftoken",
  );
  assert.equal(
    personaEncounterCrossOwnerPublicExhibitWebHref("cross-owner-exhibit-12345678"),
    "/encounters/cross-owner#cross-owner-exhibit-12345678",
  );
  assert.equal(
    personaEncounterCrossOwnerPublicExhibitApprovePath("cross-owner-exhibit-12345678"),
    "/persona-encounters/cross-owner-public-exhibits/cross-owner-exhibit-12345678/approve",
  );
  assert.equal(
    personaEncounterCrossOwnerPublicExhibitRetractPath("cross-owner-exhibit-12345678"),
    "/persona-encounters/cross-owner-public-exhibits/cross-owner-exhibit-12345678/retract",
  );
  assert.equal(
    personaEncounterCrossOwnerPublicExhibitReportPath("cross-owner-exhibit-12345678"),
    "/persona-encounters/cross-owner-public-exhibits/cross-owner-exhibit-12345678/report",
  );
  const payload = personaEncounterCrossOwnerPublicExhibitMetadataPayload({
    title: "  Public title  ",
    summary: "  Metadata only.  ",
    tags: [" safe ", "", "cross-owner"],
  });
  assert.deepEqual(payload, {
    confirmCrossOwnerPublicMetadata: true,
    title: "Public title",
    summary: "Metadata only.",
    tags: ["safe", "cross-owner"],
    contractVersion: 1,
  });

  const payloadJson = JSON.stringify(payload);
  assert.equal(payloadJson.includes("consentId"), false);
  assert.equal(payloadJson.includes("ownerUserId"), false);
  assert.equal(payloadJson.includes("owner_user_id"), false);
  assert.equal(payloadJson.includes("generatedWords"), false);
  assert.equal(payloadJson.includes("transcript"), false);
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

test("persona encounter runtime helper checks cross-owner disposable preview readiness locally", () => {
  assert.equal(personaEncounterCrossOwnerDisposablePreviewReady({
    consentId: "consent-1",
    setup: "One prompt.",
  }), true);
  assert.equal(personaEncounterCrossOwnerDisposablePreviewReady({
    consentId: "",
    setup: "One prompt.",
  }), false);
  assert.equal(personaEncounterCrossOwnerDisposablePreviewReady({
    consentId: "consent-1",
    setup: "   ",
  }), false);
});

test("persona encounter runtime helper classifies cross-owner consent preview eligibility", () => {
  const approved = crossOwnerConsent();

  assert.equal(personaEncounterCrossOwnerConsentDisplay(approved), "Harbor / Lantern");
  assert.equal(personaEncounterCrossOwnerConsentCanRun(approved), true);
  assert.equal(
    personaEncounterCrossOwnerConsentStateCopy(approved),
    "Approved consent can run one private disposable preview.",
  );

  for (const [status, copy] of [
    ["pending", "Consent is pending and cannot run a preview yet."],
    ["rejected", "Consent was rejected and cannot run a preview."],
    ["cancelled", "Consent was cancelled and cannot run a preview."],
    ["revoked", "Consent was revoked and cannot run a preview."],
    ["expired", "Consent expired and cannot run a preview."],
    ["superseded", "Consent was superseded and cannot run a preview."],
    ["blocked_by_deletion", "Consent is blocked by deletion and cannot run a preview."],
    ["moderation_locked", "Consent is moderation locked and cannot run a preview."],
  ] as const) {
    const consent = crossOwnerConsent({ status });
    assert.equal(personaEncounterCrossOwnerConsentCanRun(consent), false);
    assert.equal(personaEncounterCrossOwnerConsentStateCopy(consent), copy);
  }

  const wrongScope = crossOwnerConsent({
    requestedScopes: [{
      scope: "publish_transcript",
      label: "Publish transcript",
      executable: false,
    }],
  });
  assert.equal(personaEncounterCrossOwnerConsentCanRun(wrongScope), false);
  assert.equal(
    personaEncounterCrossOwnerConsentStateCopy(wrongScope),
    "This consent does not include cross-owner preview runtime scope.",
  );

  const wrongVersion = crossOwnerConsent({ requestedScopeVersion: 2 });
  assert.equal(personaEncounterCrossOwnerConsentCanRun(wrongVersion), false);
  assert.equal(
    personaEncounterCrossOwnerConsentStateCopy(wrongVersion),
    "This consent uses a scope version that cannot run the disposable preview.",
  );
  assert.equal(
    personaEncounterCrossOwnerConsentStateCopy(null),
    "No cross-owner consents are available.",
  );
});

test("persona encounter runtime helper exposes consent actions from participant role and status only", () => {
  assert.deepEqual(personaEncounterCrossOwnerConsentAvailableActions(crossOwnerConsent({
    status: "pending",
    participantRole: "counterparty",
  })), ["approve", "reject"]);
  assert.deepEqual(personaEncounterCrossOwnerConsentAvailableActions(crossOwnerConsent({
    status: "pending",
    participantRole: "requester",
  })), ["cancel"]);
  assert.deepEqual(personaEncounterCrossOwnerConsentAvailableActions(crossOwnerConsent({
    status: "approved",
    participantRole: "requester",
  })), ["revoke"]);
  assert.deepEqual(personaEncounterCrossOwnerConsentAvailableActions(crossOwnerConsent({
    status: "approved",
    participantRole: "counterparty",
  })), ["revoke"]);
  assert.deepEqual(personaEncounterCrossOwnerConsentAvailableActions(crossOwnerConsent({
    status: "rejected",
    participantRole: "counterparty",
  })), []);
  assert.deepEqual(personaEncounterCrossOwnerConsentAvailableActions(crossOwnerConsent({
    status: "pending",
    participantRole: null,
  })), []);
});

test("persona encounter runtime helper builds private session paths", () => {
  assert.equal(PERSONA_ENCOUNTER_PRIVATE_SESSIONS_PATH, "/persona-encounters/private-sessions");
  assert.equal(
    personaEncounterPrivateSessionPath("session/one"),
    "/persona-encounters/private-sessions/session%2Fone",
  );
  assert.equal(
    personaEncounterPrivateSessionCurationPath("session/one"),
    "/persona-encounters/private-sessions/session%2Fone/curation",
  );
  assert.equal(
    personaEncounterPrivateSessionPublicExhibitPath("session/one"),
    "/persona-encounters/private-sessions/session%2Fone/public-exhibit",
  );
  assert.equal(
    PERSONA_ENCOUNTER_PRIVATE_SESSION_CURATION_SCHEMA,
    "station.persona_encounter.private_session_curation.v1",
  );
  assert.equal(
    PERSONA_ENCOUNTER_PUBLIC_EXHIBIT_PROVENANCE_SCHEMA,
    "station.persona_encounter.public_exhibit.v1",
  );
});

test("persona encounter runtime helper builds public exhibit paths and payloads", () => {
  assert.equal(PERSONA_ENCOUNTER_PUBLIC_EXHIBITS_PATH, "/persona-encounters/public-exhibits");
  assert.equal(personaEncounterPublicExhibitListPath(), "/persona-encounters/public-exhibits");
  assert.equal(
    personaEncounterPublicExhibitListPath({ limit: 12 }),
    "/persona-encounters/public-exhibits?limit=12",
  );
  assert.equal(
    personaEncounterPublicExhibitListPath({ limit: 12, cursor: "cursor/token" }),
    "/persona-encounters/public-exhibits?limit=12&cursor=cursor%2Ftoken",
  );
  assert.equal(
    personaEncounterPublicExhibitPath("public/exhibit"),
    "/persona-encounters/public-exhibits/public%2Fexhibit",
  );
  assert.equal(
    personaEncounterPublicExhibitWebHref("public-exhibit-12345678"),
    "/encounters/public-exhibit-12345678",
  );
  assert.equal(
    personaEncounterPublicExhibitRetractPath("public-exhibit-12345678"),
    "/persona-encounters/public-exhibits/public-exhibit-12345678/retract",
  );
  assert.equal(
    personaEncounterPublicExhibitReportPath("public-exhibit-12345678"),
    "/persona-encounters/public-exhibits/public-exhibit-12345678/report",
  );
  assert.deepEqual(personaEncounterPublicExhibitPublishPayload({
    title: "  Public title  ",
    summary: "  Public metadata only. ",
    tags: [" safe ", "", "metadata"],
  }), {
    confirmPublicExhibit: true,
    title: "Public title",
    summary: "Public metadata only.",
    tags: ["safe", "metadata"],
  });
});

test("persona encounter runtime helper builds bounded private curation payloads", () => {
  assert.deepEqual(personaEncounterPrivateSessionCurationPayload({
    title: "  Field note  ",
    summary: "  Owner note only. ",
    tags: ["  quiet ", "", "candidate"],
    publicationCandidate: true,
  }), {
    title: "Field note",
    summary: "Owner note only.",
    tags: ["quiet", "candidate"],
    publicationCandidate: true,
  });
  assert.deepEqual(personaEncounterPrivateSessionCurationPayload({
    title: "",
    summary: null,
    tags: [],
    publicationCandidate: false,
  }), {
    title: null,
    summary: null,
    tags: [],
    publicationCandidate: false,
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

test("persona encounter runtime readback labels cross-owner disposable preview boundaries", () => {
  const labels = personaEncounterCrossOwnerDisposablePreviewReadback(crossOwnerResponse);
  const fallbackLabels = personaEncounterCrossOwnerDisposablePreviewReadback();

  assert.deepEqual(labels, [
    "Cross-owner disposable preview",
    "Actor-authored setup",
    "Consent display snapshots",
    "Model-generated responder reply",
    "Private disposable preview",
    "Not saved",
    "Not public",
    "Not canonical",
    "Not a transcript",
    "Not a summary",
    "Not an excerpt",
    "Not shareable",
    "No Memory, Archive, Canon, Continuity, Integrity, private retrieval, or transcript sources used",
    "Counterparty does not see this generated reply here",
    "Runtime attempt audit recorded",
  ]);

  assert.deepEqual(fallbackLabels, [
    "Cross-owner disposable preview",
    "Actor-authored setup",
    "Consent display snapshots",
    "Model-generated responder reply",
    "Private disposable preview",
    "Not saved",
    "Not public",
    "Not canonical",
    "Not a transcript",
    "Not a summary",
    "Not an excerpt",
    "Not shareable",
    "No Memory, Archive, Canon, Continuity, Integrity, private retrieval, or transcript sources used",
    "Counterparty will not see a generated reply here",
    "Runtime attempt audit required",
  ]);
});

test("persona encounter runtime readback labels cross-owner public metadata boundaries", () => {
  const exhibit: PersonaEncounterCrossOwnerPublicExhibitOwnerReadback = {
    slug: "cross-owner-exhibit-12345678",
    apiPath: "/persona-encounters/cross-owner-public-exhibits/cross-owner-exhibit-12345678",
    status: "published",
    title: "Public title",
    summary: "Metadata only.",
    tags: ["safe"],
    contractVersion: 1,
    participantRole: "requester",
    participants: {
      requester: {
        role: "requester",
        personaName: "Harbor",
        currentUser: true,
        metadataApproved: true,
      },
      counterparty: {
        role: "counterparty",
        personaName: "Lantern",
        currentUser: false,
        metadataApproved: true,
      },
    },
    publication: {
      public: true,
      routeListed: true,
      indexed: false,
      discoverable: true,
      generatedWordsPublished: false,
      transcriptPublished: false,
      summaryPublished: false,
      excerptPublished: false,
      note: "Public API detail readback is metadata-only and listed only in the dedicated cross-owner encounter index plus Discover search.",
    },
    provenance: {
      label: "Cross-owner metadata-only public encounter exhibit",
      schema: "station.persona_encounter.cross_owner_public_exhibit.v1",
      public: true,
      ownerCurated: true,
      crossOwner: true,
      source: "Derived from a bilateral cross-owner consent metadata contract",
      note: "No generated words are public.",
    },
  };

  assert.deepEqual(personaEncounterCrossOwnerPublicExhibitReadback(exhibit), [
    "Cross-owner metadata-only public exhibit",
    "Cross-owner metadata-only public encounter exhibit",
    "Public API detail readback",
    "Dedicated cross-owner index",
    "Not indexed",
    "Discover search-listed",
    "No generated words",
    "No transcript",
    "No generated summary",
    "No excerpt",
    "No private setup, PR516 disposable preview output, provider payload, token fact, retrieval body, raw owner id, or raw persona id",
  ]);
  assert.deepEqual(personaEncounterCrossOwnerPublicExhibitReadback(null), [
    "Cross-owner metadata-only public exhibit",
    "Cross-owner metadata-only public encounter exhibit",
    "Not public yet",
    "Not listed",
    "Not indexed",
    "Not Discover search-listed",
    "No generated words",
    "No transcript",
    "No generated summary",
    "No excerpt",
    "No private setup, PR516 disposable preview output, provider payload, token fact, retrieval body, raw owner id, or raw persona id",
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
    curation: {
      label: "Owner-authored private curation",
      title: "Library draft",
      summary: "Owner note only.",
      tags: ["quiet", "candidate"],
      publicationCandidate: true,
      schema: "station.persona_encounter.private_session_curation.v1",
      note: "Private planning metadata only; not a public exhibit, share link, moderation state, or cross-owner consent.",
    },
    publicExhibit: null,
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
    "Private title: Library draft",
    "Private note saved",
    "Private tags: quiet, candidate",
    "Private candidate planning flag only",
    "No public exhibit",
    "Private candidate is not publication approval",
    "Public exhibits are metadata-only and never publish private setup, raw reply, transcript, excerpt, or private curation",
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
  assert.equal(personaEncounterPreviewErrorCopy({
    code: "persona_encounter_private_session_curation_failed",
    message: "sql table detail",
  }), "Private encounter curation could not be saved.");
  assert.equal(personaEncounterPreviewErrorCopy({
    code: "persona_encounter_public_exhibit_candidate_required",
    message: "raw private_session_id=secret",
  }), "Mark this private artifact as a private candidate before publishing public metadata.");
  assert.equal(personaEncounterPreviewErrorCopy({
    code: "persona_encounter_public_exhibit_save_failed",
    message: "sql table detail",
  }), "Public encounter exhibit metadata could not be saved.");
});

test("persona encounter runtime cross-owner disposable preview error copy stays bounded", () => {
  assert.equal(personaEncounterCrossOwnerDisposablePreviewErrorCopy({
    code: "persona_encounter_provider_unavailable",
    message: "raw provider route",
  }), "Cross-owner preview provider setup is unavailable.");
  assert.equal(personaEncounterCrossOwnerDisposablePreviewErrorCopy({
    code: "persona_encounter_quota_exceeded",
    message: "raw token ledger",
  }), "Cross-owner preview token budget is exhausted.");
  assert.equal(personaEncounterCrossOwnerDisposablePreviewErrorCopy({
    code: "persona_encounter_rate_limited",
    message: "redis key detail",
  }), "Cross-owner preview rate limit reached.");
  assert.equal(personaEncounterCrossOwnerDisposablePreviewErrorCopy({
    code: "persona_encounter_cross_owner_preview_ineligible",
    message: "wrong_scope requester_owner_user_id=secret",
  }), "Approved consent is required before this cross-owner preview can run.");
  assert.equal(personaEncounterCrossOwnerDisposablePreviewErrorCopy({
    code: "persona_encounter_cross_owner_runtime_attempt_audit_failed",
    message: "sql table detail",
  }), "Cross-owner preview audit could not be recorded, so the preview is paused.");
  assert.equal(personaEncounterCrossOwnerDisposablePreviewErrorCopy({
    code: "unknown",
    message: "Bearer secret raw SQL owner_user_id",
  }), "Cross-owner disposable preview could not run.");
});

test("persona encounter runtime cross-owner consent invitation error copy stays bounded", () => {
  assert.equal(personaEncounterCrossOwnerConsentInvitationErrorCopy({
    code: "persona_encounter_cross_owner_target_invalid_slug",
    message: "raw slug 550e8400-e29b-41d4-a716-446655440000",
  }), "Choose a safe public persona route before inviting.");
  assert.equal(personaEncounterCrossOwnerConsentInvitationErrorCopy({
    code: "persona_encounter_cross_owner_target_unavailable",
    message: "owner_user_id=secret",
  }), "That public persona cannot be invited.");
  assert.equal(personaEncounterCrossOwnerConsentInvitationErrorCopy({
    code: "persona_encounter_cross_owner_target_same_owner",
    message: "same owner id secret",
  }), "Cross-owner invitations require a public persona owned by another account.");
  assert.equal(personaEncounterCrossOwnerConsentInvitationErrorCopy({
    code: "persona_encounter_cross_owner_requester_persona_not_owned",
    message: "requester_persona_id=secret",
  }), "Choose one of your own personas before inviting.");
  assert.equal(personaEncounterCrossOwnerConsentInvitationErrorCopy({
    code: "unknown",
    message: "Bearer secret raw SQL owner_user_id",
  }), "Cross-owner consent invitation could not be prepared.");
});

test("persona encounter runtime cross-owner consent action error copy stays bounded", () => {
  assert.equal(personaEncounterCrossOwnerConsentActionErrorCopy({
    code: "persona_encounter_cross_owner_consent_counterparty_required",
    message: "counterparty_owner_user_id=secret",
  }), "Only the counterparty owner can take that consent action.");
  assert.equal(personaEncounterCrossOwnerConsentActionErrorCopy({
    code: "persona_encounter_cross_owner_consent_requester_required",
    message: "requester_owner_user_id=secret",
  }), "Only the requester owner can take that consent action.");
  assert.equal(personaEncounterCrossOwnerConsentActionErrorCopy({
    code: "persona_encounter_cross_owner_consent_inactive",
    message: "status raw sql",
  }), "This consent is not pending or active for that action.");
  assert.equal(personaEncounterCrossOwnerConsentActionErrorCopy({
    code: "unknown",
    message: "Bearer secret raw SQL owner_user_id",
  }), "Cross-owner consent action could not be saved.");
});

test("persona encounter runtime cross-owner public exhibit error copy stays bounded", () => {
  assert.equal(personaEncounterCrossOwnerPublicExhibitErrorCopy({
    code: "persona_encounter_cross_owner_public_exhibit_wrong_scope",
    message: "raw requested_scopes owner_user_id",
  }), "This consent does not include public metadata exhibit scope.");
  assert.equal(personaEncounterCrossOwnerPublicExhibitErrorCopy({
    code: "persona_encounter_cross_owner_public_exhibit_metadata_mismatch",
    message: "raw consent_id/private ids",
  }), "Both owners must approve the exact same public metadata.");
  assert.equal(personaEncounterCrossOwnerPublicExhibitErrorCopy({
    code: "persona_encounter_cross_owner_public_exhibit_counterparty_metadata_required",
    message: "requester_owner_user_id=secret",
  }), "The other participant must approve the exact public metadata.");
  assert.equal(personaEncounterCrossOwnerPublicExhibitErrorCopy({
    code: "persona_encounter_cross_owner_public_exhibit_removed",
    message: "sql table detail",
  }), "This cross-owner public exhibit was removed by moderation.");
  assert.equal(personaEncounterCrossOwnerPublicExhibitErrorCopy({
    code: "unknown",
    message: "Bearer secret raw SQL owner_user_id",
  }), "Cross-owner public exhibit metadata could not be prepared.");
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

test("public encounter exhibit page and Studio controls stay metadata-only", () => {
  const indexSource = readFileSync("apps/web/app/encounters/page.tsx", "utf8");
  const crossOwnerIndexSource = readFileSync("apps/web/app/encounters/cross-owner/page.tsx", "utf8");
  const pageSource = readFileSync("apps/web/app/encounters/[slug]/page.tsx", "utf8");
  const workspaceSource = readFileSync("apps/web/components/studio/persona-workspace.tsx", "utf8");
  const runtimeSource = readFileSync("apps/web/lib/persona-encounter-runtime.ts", "utf8");

  assert.match(indexSource, /personaEncounterPublicExhibitListPath/);
  assert.match(indexSource, /href="\/encounters\/cross-owner"/);
  assert.match(indexSource, /href=\{exhibit\.routeHref\}/);
  assert.doesNotMatch(indexSource, /personaEncounterPublicExhibitReportPath|Report exhibit|Sign in to report/);
  assert.doesNotMatch(indexSource, /Discover|public persona|public Space|forum|Station Press|transcript|discussion/i);
  assert.match(crossOwnerIndexSource, /personaEncounterCrossOwnerPublicExhibitListPath/);
  assert.match(crossOwnerIndexSource, /PersonaEncounterCrossOwnerPublicExhibitListResponse/);
  assert.match(crossOwnerIndexSource, /href=\{exhibit\.routeHref\}/);
  assert.match(crossOwnerIndexSource, /exhibit\.provenance\.label/);
  assert.doesNotMatch(crossOwnerIndexSource, /personaEncounterPublicExhibitListPath/);
  assert.doesNotMatch(crossOwnerIndexSource, /Report exhibit|Sign in to report|personaEncounterCrossOwnerPublicExhibitReportPath/);
  assert.doesNotMatch(
    crossOwnerIndexSource,
    /Discover|public persona|public Space|forum|Station Press|transcript|discussion|generated word|excerpt|source body/i,
  );
  assert.match(pageSource, /personaEncounterPublicExhibitPath/);
  assert.match(pageSource, /personaEncounterPublicExhibitReportPath/);
  assert.match(pageSource, /Sign in to report/);
  assert.match(workspaceSource, /PrivateEncounterPublicExhibitControls/);
  assert.match(workspaceSource, /personaEncounterPublicExhibitPublishPayload/);
  assert.match(runtimeSource, /confirmPublicExhibit: true/);
  assert.doesNotMatch(workspaceSource, /title:\s*session\.curation|summary:\s*session\.curation|tags:\s*session\.curation/);

  for (const source of [indexSource, crossOwnerIndexSource, pageSource, workspaceSource]) {
    assert.doesNotMatch(
      source,
      /owner_user_id|private_session_id|initiator_persona_id|responder_persona_id|requester_owner_user_id|counterparty_owner_user_id|requester_persona_id|counterparty_persona_id|owner_setup|responder_reply|owner_title|owner_summary|owner_tags|provider_payload|source_body|raw_source/i,
    );
  }
});

test("cross-owner consent Studio panel uses public-slug invitation and participant helpers", () => {
  const pageSource = readFileSync("apps/web/app/studio/personas/[personaId]/page.tsx", "utf8");
  const workspaceSource = readFileSync("apps/web/components/studio/persona-workspace.tsx", "utf8");
  const panelStart = workspaceSource.indexOf("export function CrossOwnerDisposablePreviewPanel");
  const panelEnd = workspaceSource.indexOf("function PrivateEncounterCurationControls");
  const panelSource = workspaceSource.slice(panelStart, panelEnd);

  assert.notEqual(panelStart, -1);
  assert.notEqual(panelEnd, -1);
  assert.match(pageSource, /<CrossOwnerDisposablePreviewPanel persona=\{persona\} token=\{token\} \/>/);
  assert.match(panelSource, /personaEncounterCrossOwnerConsentTargetPath\(targetInput\)/);
  assert.match(panelSource, /apiGet<PersonaEncounterCrossOwnerConsentPublicTargetResponse>\(targetPath, token\)/);
  assert.match(panelSource, /PERSONA_ENCOUNTER_CROSS_OWNER_CONSENT_PUBLIC_CREATE_PATH/);
  assert.match(panelSource, /apiPost<PersonaEncounterCrossOwnerConsentCreateByPublicSlugResponse>/);
  assert.match(panelSource, /personaEncounterCrossOwnerConsentCreateByPublicSlugPayload/);
  assert.match(panelSource, /counterpartyPublicSlug: target\.publicSlug/);
  assert.match(panelSource, /PERSONA_ENCOUNTER_CROSS_OWNER_CONSENTS_PATH/);
  assert.match(panelSource, /apiGet<PersonaEncounterCrossOwnerConsentListResponse>/);
  assert.match(panelSource, /personaEncounterCrossOwnerConsentAvailableActions\(consent\)/);
  assert.match(panelSource, /personaEncounterCrossOwnerConsentActionPath\(consent\.id, action\)/);
  assert.match(panelSource, /personaEncounterCrossOwnerConsentActionPayload/);
  assert.match(panelSource, /apiPatch<PersonaEncounterCrossOwnerConsentResponse>/);
  assert.match(panelSource, /personaEncounterCrossOwnerDisposablePreviewPath\(selectedConsent\.id\)/);
  assert.match(panelSource, /personaEncounterCrossOwnerDisposablePreviewPayload\(\{ setup \}\)/);
  assert.match(panelSource, /personaEncounterCrossOwnerDisposablePreviewReadback\(preview\)/);
  assert.match(panelSource, /personaEncounterCrossOwnerDisposablePreviewErrorCopy/);
  assert.match(panelSource, /personaEncounterCrossOwnerConsentLedgerBoundaryReadback/);
  assert.match(panelSource, /setupReadback\.map/);
  assert.match(panelSource, /readback\.slice\(4\)/);
  assert.match(panelSource, /Runtime preview stays separate and only appears for approved eligible rows/);

  assert.doesNotMatch(
    panelSource,
    /initiatorPersonaId|responderPersonaId|counterpartyPersonaId|ownerUserId|owner_user_id|requester_persona_id|counterparty_persona_id|requester_owner_user_id|counterparty_owner_user_id/,
  );
  assert.doesNotMatch(panelSource, /apiPost<[^>]+>\(\s*PERSONA_ENCOUNTER_CROSS_OWNER_CONSENTS_PATH/);
  assert.doesNotMatch(
    panelSource,
    /PERSONA_ENCOUNTER_PRIVATE_SESSIONS_PATH|personaEncounterPrivateSession|personaEncounterPublicExhibit|PrivateEncounterPublicExhibitControls|Save private artifact|Publish public metadata/,
  );
  assert.doesNotMatch(panelSource, /\/encounters\/|\/persona-encounters\/preview["']/);
});
