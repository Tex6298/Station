import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  PERSONA_ENCOUNTER_CROSS_OWNER_CONSENTS_PATH,
  PERSONA_ENCOUNTER_CROSS_OWNER_DISPOSABLE_PREVIEW_SCHEMA,
  PERSONA_ENCOUNTER_PRIVATE_SESSIONS_PATH,
  PERSONA_ENCOUNTER_PRIVATE_SESSION_CURATION_SCHEMA,
  PERSONA_ENCOUNTER_PUBLIC_EXHIBIT_PROVENANCE_SCHEMA,
  PERSONA_ENCOUNTER_PUBLIC_EXHIBITS_PATH,
  PERSONA_ENCOUNTER_PREVIEW_PATH,
  PERSONA_ENCOUNTER_PREVIEW_READINESS_PATH,
  personaEncounterCrossOwnerConsentCanRun,
  personaEncounterCrossOwnerConsentDisplay,
  personaEncounterCrossOwnerConsentStateCopy,
  personaEncounterCrossOwnerDisposablePreviewErrorCopy,
  personaEncounterCrossOwnerDisposablePreviewPath,
  personaEncounterCrossOwnerDisposablePreviewPayload,
  personaEncounterCrossOwnerDisposablePreviewReadback,
  personaEncounterCrossOwnerDisposablePreviewReady,
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
  const pageSource = readFileSync("apps/web/app/encounters/[slug]/page.tsx", "utf8");
  const workspaceSource = readFileSync("apps/web/components/studio/persona-workspace.tsx", "utf8");
  const runtimeSource = readFileSync("apps/web/lib/persona-encounter-runtime.ts", "utf8");

  assert.match(indexSource, /personaEncounterPublicExhibitListPath/);
  assert.match(indexSource, /href=\{exhibit\.routeHref\}/);
  assert.doesNotMatch(indexSource, /personaEncounterPublicExhibitReportPath|Report exhibit|Sign in to report/);
  assert.doesNotMatch(indexSource, /Discover|public persona|public Space|forum|Station Press|transcript|discussion/i);
  assert.match(pageSource, /personaEncounterPublicExhibitPath/);
  assert.match(pageSource, /personaEncounterPublicExhibitReportPath/);
  assert.match(pageSource, /Sign in to report/);
  assert.match(workspaceSource, /PrivateEncounterPublicExhibitControls/);
  assert.match(workspaceSource, /personaEncounterPublicExhibitPublishPayload/);
  assert.match(runtimeSource, /confirmPublicExhibit: true/);
  assert.doesNotMatch(workspaceSource, /title:\s*session\.curation|summary:\s*session\.curation|tags:\s*session\.curation/);

  for (const source of [indexSource, pageSource, workspaceSource]) {
    assert.doesNotMatch(
      source,
      /owner_user_id|private_session_id|initiator_persona_id|responder_persona_id|owner_setup|responder_reply|owner_title|owner_summary|owner_tags|provider_payload|source_body|raw_source/i,
    );
  }
});

test("cross-owner disposable preview Studio panel uses only consent-scoped helpers", () => {
  const pageSource = readFileSync("apps/web/app/studio/personas/[personaId]/page.tsx", "utf8");
  const workspaceSource = readFileSync("apps/web/components/studio/persona-workspace.tsx", "utf8");
  const panelStart = workspaceSource.indexOf("export function CrossOwnerDisposablePreviewPanel");
  const panelEnd = workspaceSource.indexOf("function PrivateEncounterCurationControls");
  const panelSource = workspaceSource.slice(panelStart, panelEnd);

  assert.notEqual(panelStart, -1);
  assert.notEqual(panelEnd, -1);
  assert.match(pageSource, /<CrossOwnerDisposablePreviewPanel token=\{token\} \/>/);
  assert.match(panelSource, /PERSONA_ENCOUNTER_CROSS_OWNER_CONSENTS_PATH/);
  assert.match(panelSource, /apiGet<PersonaEncounterCrossOwnerConsentListResponse>/);
  assert.match(panelSource, /personaEncounterCrossOwnerDisposablePreviewPath\(selectedConsent\.id\)/);
  assert.match(panelSource, /personaEncounterCrossOwnerDisposablePreviewPayload\(\{ setup \}\)/);
  assert.match(panelSource, /personaEncounterCrossOwnerDisposablePreviewReadback\(preview\)/);
  assert.match(panelSource, /personaEncounterCrossOwnerDisposablePreviewErrorCopy/);
  assert.match(panelSource, /setupReadback\.map/);
  assert.match(panelSource, /readback\.slice\(4\)/);
  assert.match(panelSource, /open persona tab is context, not participant proof/);

  assert.doesNotMatch(
    panelSource,
    /initiatorPersonaId|responderPersonaId|requesterPersonaId|counterpartyPersonaId|ownerUserId|owner_user_id|requester_persona_id|counterparty_persona_id/,
  );
  assert.doesNotMatch(
    panelSource,
    /PERSONA_ENCOUNTER_PRIVATE_SESSIONS_PATH|personaEncounterPrivateSession|personaEncounterPublicExhibit|PrivateEncounterPublicExhibitControls|Save private artifact|Publish public metadata/,
  );
  assert.doesNotMatch(panelSource, /\/encounters\/|\/persona-encounters\/preview["']/);
});
