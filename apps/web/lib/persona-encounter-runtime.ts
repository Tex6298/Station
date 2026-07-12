export interface PersonaEncounterPreviewRequest {
  initiatorPersonaId: string;
  responderPersonaId: string;
  setup: string;
  maxOutputTokens?: number;
}

export interface PersonaEncounterPreviewResponse {
  preview: {
    reply: {
      role: "responder";
      content: string;
    };
    rateLimit?: {
      remaining: number | null;
      retryAfter: number | null;
    };
  };
  provenance: {
    setup: {
      label: "Owner-authored setup";
      stored: false;
    };
    personas: {
      label: "Selected same-owner personas";
      initiatorName: string;
      responderName: string;
    };
    reply: {
      label: "Model-generated responder reply";
      generated: true;
    };
    persistence: {
      saved: false;
      transcriptStored: false;
      shareable: false;
      sourceRetrieval: false;
      sourceBuckets: [];
      note: string;
    };
  };
}

export interface PersonaEncounterCrossOwnerDisposablePreviewRequest {
  setup: string;
  maxOutputTokens?: number;
}

export interface PersonaEncounterCrossOwnerDisposablePreviewResponse {
  preview: {
    reply: {
      role: "responder";
      content: string;
      generated: true;
      private: true;
      disposable: true;
      canonical: false;
      public: false;
      saved: false;
      transcript: false;
      summary: false;
      excerpt: false;
      shareable: false;
      sourceRetrieval: false;
    };
    rateLimit?: {
      remaining: number | null;
      retryAfter: number | null;
    };
  };
  provenance: {
    schema: "station.persona_encounter.cross_owner_disposable_preview.v1";
    setup: {
      label: "Actor-authored setup";
      stored: false;
    };
    consent: {
      id: string;
      participantRole: "requester" | "counterparty" | null;
      requestedScope: "run_cross_owner_encounter";
      requestedScopeVersion: number;
      executable: false;
    };
    readiness: {
      code: string;
      message: string;
    };
    personas: {
      label: "Consent display snapshots";
      initiatorName: string;
      responderName: string;
    };
    reply: {
      label: "Model-generated responder reply";
      generated: true;
      private: true;
      disposable: true;
      nonCanonical: true;
      public: false;
    };
    persistence: {
      saved: false;
      privateSessionCreated: false;
      publicExhibitCreated: false;
      transcriptStored: false;
      summaryStored: false;
      excerptStored: false;
      shareable: false;
      sourceRetrieval: false;
      sourceBuckets: [];
      note: string;
    };
    counterparty: {
      label: "Counterparty does not see this generated reply here";
      generatedReplyVisibleHere: false;
    };
    audit: {
      label: "Runtime attempt audit recorded";
      recorded: true;
    };
  };
}

export type PersonaEncounterCrossOwnerConsentStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled"
  | "revoked"
  | "expired"
  | "superseded"
  | "blocked_by_deletion"
  | "moderation_locked";

export type PersonaEncounterCrossOwnerConsentParticipantRole = "requester" | "counterparty";
export type PersonaEncounterCrossOwnerConsentAction = "approve" | "reject" | "cancel" | "revoke";
export type PersonaEncounterCrossOwnerPublicExhibitStatus = "proposed" | "published" | "retracted" | "removed";
export type PersonaEncounterCrossOwnerGeneratedArtifactLifecycleStatus =
  | "active"
  | "retracted"
  | "revoked"
  | "deleted"
  | "moderation_blocked";
export type PersonaEncounterCrossOwnerGeneratedRevisionStatus =
  | "proposed"
  | "approved"
  | "retracted"
  | "revoked"
  | "deleted"
  | "moderation_blocked"
  | "invalidated";
export type PersonaEncounterCrossOwnerGeneratedPublicationStatus =
  | "published"
  | "retracted"
  | "revoked"
  | "source_invalidated"
  | "removed"
  | "deleted";

export interface PersonaEncounterCrossOwnerConsent {
  id: string;
  status: PersonaEncounterCrossOwnerConsentStatus;
  participantRole: PersonaEncounterCrossOwnerConsentParticipantRole | null;
  participants: {
    requester: {
      role: "requester";
      personaName: string;
      currentUser: boolean;
    };
    counterparty: {
      role: "counterparty";
      personaName: string;
      currentUser: boolean;
    };
  };
  requestedScopes: Array<{
    scope: string;
    label: string;
    executable: false;
    note?: string;
  }>;
  requestedScopeVersion: number;
  ledger: {
    consentRecordActive: boolean;
    executable: false;
    permitsRuntime: false;
    permitsPrivateArtifact: false;
    permitsPublicExhibit: false;
    permitsGeneratedWords: false;
    permitsTranscript: false;
    permitsSummary: false;
    permitsPublicSurfacing: false;
    note: string;
  };
  timestamps: {
    createdAt: string;
    updatedAt: string;
    requesterApprovedAt: string | null;
    counterpartyApprovedAt: string | null;
    rejectedAt: string | null;
    cancelledAt: string | null;
    revokedAt: string | null;
    expiredAt: string | null;
    supersededAt: string | null;
    blockedByDeletionAt: string | null;
    moderationLockedAt: string | null;
  };
  reasonCode: string | null;
  provenance: {
    label: "Cross-owner consent ledger record";
    schema: string;
    participantOwnerOnly: true;
    auditAppendOnly: true;
    public: false;
    note: string;
  };
  audit: Array<{
    id: string;
    actorRole: string;
    eventType: string;
    previousStatus: string | null;
    nextStatus: string;
    requestedScopes: Array<{
      scope: string;
      label: string;
      executable: false;
    }>;
    reasonCode: string | null;
    createdAt: string;
  }>;
}

export interface PersonaEncounterCrossOwnerConsentListResponse {
  consents: PersonaEncounterCrossOwnerConsent[];
}

export interface PersonaEncounterCrossOwnerConsentResponse {
  consent: PersonaEncounterCrossOwnerConsent;
}

export interface PersonaEncounterCrossOwnerConsentPublicTarget {
  personaName: string;
  shortDescription: string | null;
  avatarUrl: string | null;
  publicSlug: string;
  routeHref: string;
  eligibility: {
    eligible: boolean;
    code: "eligible";
    message: string;
  };
  provenance: {
    label: "Public counterparty persona selection target";
    publicOnly: true;
    participantSafe: true;
    rawPersonaIdExposed: false;
    rawOwnerIdExposed: false;
    note: string;
  };
}

export interface PersonaEncounterCrossOwnerConsentPublicTargetResponse {
  target: PersonaEncounterCrossOwnerConsentPublicTarget;
}

export interface PersonaEncounterCrossOwnerConsentCreateByPublicSlugRequest {
  requesterPersonaId: string;
  counterpartyPublicSlug: string;
  requestedScopes?: string[];
}

export interface PersonaEncounterCrossOwnerConsentCreateByPublicSlugResponse {
  consent: PersonaEncounterCrossOwnerConsent;
  target: PersonaEncounterCrossOwnerConsentPublicTarget;
}

export interface PersonaEncounterCrossOwnerConsentActionRequest {
  reasonCode?: string | null;
}

export interface PersonaEncounterCrossOwnerPublicExhibitMetadataRequest {
  title: string;
  summary: string;
  tags?: string[];
  contractVersion?: 1;
}

export interface PersonaEncounterCrossOwnerPublicExhibitOwnerReadback {
  slug: string;
  apiPath: string;
  status: PersonaEncounterCrossOwnerPublicExhibitStatus;
  title: string;
  summary: string;
  tags: string[];
  contractVersion: 1;
  participantRole: PersonaEncounterCrossOwnerConsentParticipantRole | null;
  participants: {
    requester: {
      role: "requester";
      personaName: string;
      currentUser: boolean;
      metadataApproved: boolean;
    };
    counterparty: {
      role: "counterparty";
      personaName: string;
      currentUser: boolean;
      metadataApproved: boolean;
    };
  };
  publication: {
    public: boolean;
    routeListed: boolean;
    indexed: false;
    discoverable: boolean;
    generatedWordsPublished: false;
    transcriptPublished: false;
    summaryPublished: false;
    excerptPublished: false;
    note: string;
  };
  provenance: {
    label: "Cross-owner metadata-only public encounter exhibit";
    schema: "station.persona_encounter.cross_owner_public_exhibit.v1";
    public: boolean;
    ownerCurated: true;
    crossOwner: true;
    source: string;
    note: string;
  };
}

export interface PersonaEncounterCrossOwnerPublicExhibitResponse {
  exhibit: PersonaEncounterCrossOwnerPublicExhibitOwnerReadback;
}

export interface PersonaEncounterCrossOwnerGeneratedArtifactRequest {
  title: string;
  body: string;
  excerpt?: string | null;
}

export interface PersonaEncounterCrossOwnerGeneratedRevisionRequest {
  title: string;
  body: string;
  excerpt?: string | null;
}

export interface PersonaEncounterCrossOwnerGeneratedRevisionApprovalRequest {
  revisionDigest: string;
}

export interface PersonaEncounterCrossOwnerGeneratedPublicationRequest {
  revisionDigest: string;
}

export interface PersonaEncounterCrossOwnerGeneratedRevisionReadback {
  revisionSlug: string;
  artifactSlug: string;
  apiPath: string;
  status: PersonaEncounterCrossOwnerGeneratedRevisionStatus;
  title: string | null;
  body: string | null;
  excerpt: string | null;
  textDigest: string;
  sourceArtifactDigest: string;
  contractVersion: 1;
  approvalContractVersion: 1;
  participantRole: PersonaEncounterCrossOwnerConsentParticipantRole | null;
  approvals: {
    requesterApproved: boolean;
    counterpartyApproved: boolean;
    bothParticipantsApproved: boolean;
    currentUserApproved: boolean;
    rows: Array<{
      participantRole: PersonaEncounterCrossOwnerConsentParticipantRole;
      revisionDigest: string;
      approvalContractVersion: 1;
      approvedAt: string;
    }>;
    note: string;
  };
  exactText: {
    immutableDigest: true;
    sourceArtifactDigestMatches: boolean;
    participantSnapshotsMatch: boolean;
    consentScopeVersionMatches: boolean;
    consentScopesMatch: boolean;
    current: boolean;
  };
  publication: {
    public: false;
    routeListed: false;
    indexed: false;
    discoverable: false;
    generatedWordsPublished: false;
    note: string;
  };
  provenance: {
    label: "Cross-owner exact-text generated revision";
    schema: "station.persona_encounter.cross_owner_generated_revision.v1";
    participantOwnerOnly: true;
    public: false;
    appendOnlyApprovals: true;
    note: string;
  };
}

export interface PersonaEncounterCrossOwnerGeneratedArtifactReadback {
  artifactSlug: string;
  apiPath: string;
  lifecycleStatus: PersonaEncounterCrossOwnerGeneratedArtifactLifecycleStatus;
  title: string | null;
  body: string | null;
  excerpt: string | null;
  contentDigest: string;
  contractVersion: 1;
  participantRole: PersonaEncounterCrossOwnerConsentParticipantRole | null;
  participants: {
    requester: {
      role: "requester";
      personaName: string;
      currentUser: boolean;
    };
    counterparty: {
      role: "counterparty";
      personaName: string;
      currentUser: boolean;
    };
  };
  approvals: {
    exactTextApprovalRequired: true;
    bothParticipantsRequired: true;
    approvalContractVersion: 1;
    appendOnlyLedger: true;
    note: string;
  };
  revisions: PersonaEncounterCrossOwnerGeneratedRevisionReadback[];
  publication: {
    public: false;
    routeListed: false;
    indexed: false;
    discoverable: false;
    generatedWordsPublished: false;
    transcriptPublished: false;
    summaryPublished: false;
    excerptPublished: false;
    note: string;
  };
  provenance: {
    label: "Cross-owner private generated artifact";
    schema: "station.persona_encounter.cross_owner_private_generated_artifact.v1";
    participantOwnerOnly: true;
    public: false;
    generatedContentPrivate: true;
    pr516AutoReuse: false;
    source: string;
    note: string;
  };
}

export interface PersonaEncounterCrossOwnerGeneratedArtifactResponse {
  artifact: PersonaEncounterCrossOwnerGeneratedArtifactReadback;
}

export interface PersonaEncounterCrossOwnerGeneratedArtifactListResponse {
  artifacts: PersonaEncounterCrossOwnerGeneratedArtifactReadback[];
}

export interface PersonaEncounterCrossOwnerGeneratedRevisionResponse {
  revision: PersonaEncounterCrossOwnerGeneratedRevisionReadback;
}

export interface PersonaEncounterCrossOwnerGeneratedArtifactDeleteResponse {
  deleted: true;
  artifact: PersonaEncounterCrossOwnerGeneratedArtifactReadback;
}

export interface PersonaEncounterCrossOwnerGeneratedPublicationDetail {
  slug: string;
  routeHref: string;
  title: string | null;
  body: string | null;
  excerpt: string | null;
  status: PersonaEncounterCrossOwnerGeneratedPublicationStatus;
  contractVersion: 1;
  revisionDigest: string;
  sourceArtifactDigest: string;
  reportedCount: number;
  publishedAt: string;
  participants: {
    requester: {
      role: "requester";
      personaName: string;
    };
    counterparty: {
      role: "counterparty";
      personaName: string;
    };
  };
  source: {
    consentStatus: PersonaEncounterCrossOwnerConsentStatus;
    artifactLifecycleStatus: PersonaEncounterCrossOwnerGeneratedArtifactLifecycleStatus;
    revisionStatus: PersonaEncounterCrossOwnerGeneratedRevisionStatus;
    exactApprovedRevision: boolean;
    copiedServerSide: boolean;
  };
  timestamps: {
    publishedAt: string;
    retractedAt: string | null;
    revokedAt: string | null;
    sourceInvalidatedAt: string | null;
    removedAt: string | null;
    restoredAt: string | null;
    deletedAt: string | null;
    updatedAt: string;
  };
  provenance: {
    label: "Cross-owner generated material public detail";
    schema: "station.persona_encounter.cross_owner_generated_publication.v1";
    public: boolean;
    detailOnly: true;
    routeListed: false;
    indexed: false;
    discoverable: false;
    generatedBodyPublished: boolean;
    source: string;
    noPublicList: true;
    noPr516DirectPublication: true;
    note: string;
  };
  report: {
    requiresSignIn: true;
    path: string;
  };
}

export interface PersonaEncounterCrossOwnerGeneratedPublicationResponse {
  publication: PersonaEncounterCrossOwnerGeneratedPublicationDetail;
}

export interface PersonaEncounterCrossOwnerGeneratedPublicationDeleteResponse {
  deleted: true;
  publication: PersonaEncounterCrossOwnerGeneratedPublicationDetail;
}

export interface PersonaEncounterCrossOwnerPublicExhibitListItem {
  slug: string;
  routeHref: string;
  title: string;
  summary: string;
  tags: string[];
  status: "published";
  contractVersion: 1;
  publishedAt: string;
  participants: {
    label: "Cross-owner consent display snapshots";
    requesterName: string;
    counterpartyName: string;
  };
  provenance: {
    label: "Cross-owner metadata-only public encounter exhibit";
    ownerCurated: true;
    public: true;
    crossOwner: true;
    metadataOnly: true;
    bilateralApproval: true;
    routeListed: true;
    indexed: false;
    discoverable: true;
  };
  report: {
    requiresSignIn: true;
    path: string;
  };
}

export interface PersonaEncounterCrossOwnerPublicExhibitListResponse {
  exhibits: PersonaEncounterCrossOwnerPublicExhibitListItem[];
  pagination: {
    limit: number;
    nextCursor: string | null;
  };
}

export interface PersonaEncounterPrivateSession {
  id: string;
  createdAt: string;
  updatedAt: string;
  setup: {
    label: "Owner-authored setup";
    content: string;
    stored: true;
  };
  personas: {
    label: "Selected same-owner personas";
    initiatorName: string;
    responderName: string;
  };
  reply: {
    label: "Model-generated responder reply";
    role: "responder";
    content: string;
    generated: true;
  };
  provenance: {
    artifact: {
      label: "Private owner-only artifact";
      private: true;
      ownerOnly: true;
      serverCreated: true;
    };
    persistence: {
      saved: true;
      transcriptStored: false;
      shareable: false;
      public: false;
      sourceRetrieval: false;
      sourceBuckets: [];
      note: string;
    };
  };
  curation: {
    label: "Owner-authored private curation";
    title: string | null;
    summary: string | null;
    tags: string[];
    publicationCandidate: boolean;
    schema: "station.persona_encounter.private_session_curation.v1";
    note: string;
  };
  publicExhibit: PersonaEncounterPublicExhibitOwnerReadback | null;
}

export interface PersonaEncounterPrivateSessionCurationRequest {
  title?: string | null;
  summary?: string | null;
  tags?: string[];
  publicationCandidate?: boolean;
}

export interface PersonaEncounterPublicExhibitOwnerReadback {
  slug: string;
  routeHref: string;
  status: "published" | "retracted" | "removed";
  title: string;
  summary: string;
  tags: string[];
  publishedAt: string;
  retractedAt: string | null;
  removedAt: string | null;
  reportedCount: number;
  provenance: {
    label: "Metadata-only public encounter exhibit";
    public: boolean;
    ownerCurated: true;
    sameOwner: true;
    source: string;
    note: string;
  };
}

export interface PersonaEncounterPublicExhibitPublishRequest {
  title: string;
  summary: string;
  tags?: string[];
}

export interface PersonaEncounterPublicExhibitResponse {
  session?: PersonaEncounterPrivateSession;
  exhibit: PersonaEncounterPublicExhibitOwnerReadback;
}

export interface PersonaEncounterPublicExhibitPublicResponse {
  exhibit: {
    slug: string;
    title: string;
    summary: string;
    tags: string[];
    personas: {
      label: "Same-owner persona display snapshots";
      initiatorName: string;
      responderName: string;
    };
    status: "published";
    publishedAt: string;
    provenance: {
      label: "Metadata-only public encounter exhibit";
      ownerCurated: true;
      public: true;
      sameOwner: true;
      source: string;
      note: string;
    };
    report: {
      requiresSignIn: true;
      path: string;
    };
  };
}

export interface PersonaEncounterPublicExhibitListItem {
  slug: string;
  routeHref: string;
  title: string;
  summary: string;
  tags: string[];
  personas: {
    label: "Same-owner persona display snapshots";
    initiatorName: string;
    responderName: string;
  };
  status: "published";
  publishedAt: string;
  provenance: {
    label: "Metadata-only public encounter exhibit";
    ownerCurated: true;
    public: true;
    sameOwner: true;
    source: string;
    note: string;
  };
}

export interface PersonaEncounterPublicExhibitListResponse {
  exhibits: PersonaEncounterPublicExhibitListItem[];
  pagination: {
    limit: number;
    nextCursor: string | null;
  };
}

export interface PersonaEncounterPublicExhibitReportResponse {
  report: {
    status: "open" | "reviewing" | "resolved" | "dismissed";
  };
  duplicate: boolean;
}

export interface PersonaEncounterPrivateSessionResponse {
  session: PersonaEncounterPrivateSession;
}

export interface PersonaEncounterPrivateSessionListResponse {
  sessions: PersonaEncounterPrivateSession[];
}

export interface PersonaEncounterPrivateSessionDeleteResponse {
  deleted: true;
  session: {
    id: string;
  };
}

export interface PersonaEncounterPreviewReadinessResponse {
  ready: boolean;
  message: string;
  code?: "persona_encounter_persona_not_owned" | "persona_encounter_provider_unavailable";
  classification?: string;
}

export const PERSONA_ENCOUNTER_PREVIEW_PATH = "/persona-encounters/preview";
export const PERSONA_ENCOUNTER_PREVIEW_READINESS_PATH = "/persona-encounters/preview/readiness";
export const PERSONA_ENCOUNTER_PRIVATE_SESSIONS_PATH = "/persona-encounters/private-sessions";
export const PERSONA_ENCOUNTER_PUBLIC_EXHIBITS_PATH = "/persona-encounters/public-exhibits";
export const PERSONA_ENCOUNTER_CROSS_OWNER_CONSENTS_PATH = "/persona-encounters/cross-owner-consents";
export const PERSONA_ENCOUNTER_CROSS_OWNER_CONSENT_PUBLIC_CREATE_PATH =
  "/persona-encounters/cross-owner-consents/from-public-persona";
export const PERSONA_ENCOUNTER_CROSS_OWNER_CONSENT_TARGETS_PATH =
  "/persona-encounters/cross-owner-consent-targets";
export const PERSONA_ENCOUNTER_CROSS_OWNER_PUBLIC_EXHIBITS_PATH =
  "/persona-encounters/cross-owner-public-exhibits";
export const PERSONA_ENCOUNTER_CROSS_OWNER_GENERATED_ARTIFACTS_PATH =
  "/persona-encounters/cross-owner-generated-artifacts";
export const PERSONA_ENCOUNTER_CROSS_OWNER_GENERATED_PUBLICATIONS_PATH =
  "/persona-encounters/cross-owner-generated-publications";
export const PERSONA_ENCOUNTER_CROSS_OWNER_DISPOSABLE_PREVIEW_REQUIRED_SCOPE =
  "run_cross_owner_encounter";
export const PERSONA_ENCOUNTER_CROSS_OWNER_GENERATED_ARTIFACT_REQUIRED_SCOPE =
  "save_private_cross_owner_artifact";
export const PERSONA_ENCOUNTER_CROSS_OWNER_GENERATED_PUBLICATION_REQUIRED_SCOPE =
  "publish_exact_generated_revision";
export const PERSONA_ENCOUNTER_CROSS_OWNER_DISPOSABLE_PREVIEW_SCOPE_VERSION = 1;
export const PERSONA_ENCOUNTER_CROSS_OWNER_PUBLIC_EXHIBIT_REQUIRED_SCOPE =
  "publish_metadata_only_public_exhibit";
export const PERSONA_ENCOUNTER_CROSS_OWNER_PUBLIC_EXHIBIT_CONTRACT_VERSION = 1;
export const PERSONA_ENCOUNTER_PRIVATE_SESSION_CURATION_SCHEMA =
  "station.persona_encounter.private_session_curation.v1";
export const PERSONA_ENCOUNTER_PUBLIC_EXHIBIT_PROVENANCE_SCHEMA =
  "station.persona_encounter.public_exhibit.v1";
export const PERSONA_ENCOUNTER_CROSS_OWNER_DISPOSABLE_PREVIEW_SCHEMA =
  "station.persona_encounter.cross_owner_disposable_preview.v1";
export const PERSONA_ENCOUNTER_CROSS_OWNER_PUBLIC_EXHIBIT_PROVENANCE_SCHEMA =
  "station.persona_encounter.cross_owner_public_exhibit.v1";
export const PERSONA_ENCOUNTER_CROSS_OWNER_PRIVATE_GENERATED_ARTIFACT_SCHEMA =
  "station.persona_encounter.cross_owner_private_generated_artifact.v1";
export const PERSONA_ENCOUNTER_CROSS_OWNER_GENERATED_REVISION_SCHEMA =
  "station.persona_encounter.cross_owner_generated_revision.v1";
export const PERSONA_ENCOUNTER_CROSS_OWNER_GENERATED_PUBLICATION_SCHEMA =
  "station.persona_encounter.cross_owner_generated_publication.v1";
const PERSONA_ENCOUNTER_CROSS_OWNER_CONSENT_REASON_CODES = new Set([
  "not_aligned",
  "owner_request",
  "persona_deleted",
  "account_deleted",
  "moderation_safety",
  "scope_changed",
  "expired",
  "other",
]);

export function personaEncounterPreviewPayload(input: PersonaEncounterPreviewRequest) {
  return {
    initiatorPersonaId: input.initiatorPersonaId,
    responderPersonaId: input.responderPersonaId,
    setup: input.setup.trim(),
    ...(input.maxOutputTokens ? { maxOutputTokens: input.maxOutputTokens } : {}),
  };
}

export function personaEncounterCrossOwnerDisposablePreviewPath(consentId: string) {
  return `${PERSONA_ENCOUNTER_CROSS_OWNER_CONSENTS_PATH}/${encodeURIComponent(consentId)}/disposable-preview`;
}

export function personaEncounterCrossOwnerDisposablePreviewPayload(
  input: PersonaEncounterCrossOwnerDisposablePreviewRequest,
) {
  return {
    setup: input.setup.trim(),
    ...(input.maxOutputTokens !== undefined ? { maxOutputTokens: input.maxOutputTokens } : {}),
  };
}

export function personaEncounterCrossOwnerCounterpartyPublicSlug(
  publicSlugOrHref: string | null | undefined,
) {
  const value = (publicSlugOrHref ?? "").trim();
  if (!value) return null;

  const slug = value.startsWith("/personas/")
    ? value.slice("/personas/".length).split(/[?#]/)[0]
    : value;
  if (slug.includes("/")) return null;

  return isSafeCrossOwnerPublicPersonaSlug(slug) ? slug : null;
}

export function personaEncounterCrossOwnerConsentTargetPath(publicSlugOrHref: string) {
  const publicSlug = personaEncounterCrossOwnerCounterpartyPublicSlug(publicSlugOrHref);
  return publicSlug
    ? `${PERSONA_ENCOUNTER_CROSS_OWNER_CONSENT_TARGETS_PATH}/${encodeURIComponent(publicSlug)}`
    : null;
}

export function personaEncounterCrossOwnerConsentCreateByPublicSlugPayload(
  input: PersonaEncounterCrossOwnerConsentCreateByPublicSlugRequest,
) {
  const publicSlug = personaEncounterCrossOwnerCounterpartyPublicSlug(input.counterpartyPublicSlug);
  return {
    requesterPersonaId: input.requesterPersonaId,
    counterpartyPublicSlug: publicSlug ?? "",
    requestedScopes: input.requestedScopes ?? [PERSONA_ENCOUNTER_CROSS_OWNER_DISPOSABLE_PREVIEW_REQUIRED_SCOPE],
  };
}

export function personaEncounterCrossOwnerConsentPath(consentId: string) {
  return `${PERSONA_ENCOUNTER_CROSS_OWNER_CONSENTS_PATH}/${encodeURIComponent(consentId)}`;
}

export function personaEncounterCrossOwnerConsentActionPath(
  consentId: string,
  action: PersonaEncounterCrossOwnerConsentAction,
) {
  return `${personaEncounterCrossOwnerConsentPath(consentId)}/${action}`;
}

export function personaEncounterCrossOwnerConsentActionPayload(
  input: PersonaEncounterCrossOwnerConsentActionRequest = {},
) {
  const reasonCode = normalizeOptionalText(input.reasonCode);
  return reasonCode && PERSONA_ENCOUNTER_CROSS_OWNER_CONSENT_REASON_CODES.has(reasonCode)
    ? { reasonCode }
    : {};
}

export function personaEncounterCrossOwnerConsentPublicExhibitPath(consentId: string) {
  return `${personaEncounterCrossOwnerConsentPath(consentId)}/public-exhibit`;
}

export function personaEncounterCrossOwnerPublicExhibitPath(slug: string) {
  return `${PERSONA_ENCOUNTER_CROSS_OWNER_PUBLIC_EXHIBITS_PATH}/${encodeURIComponent(slug)}`;
}

export function personaEncounterCrossOwnerPublicExhibitListPath(input: {
  limit?: number;
  cursor?: string | null;
} = {}) {
  const params = new URLSearchParams();
  if (input.limit !== undefined) params.set("limit", String(input.limit));
  if (input.cursor) params.set("cursor", input.cursor);
  const query = params.toString();
  return query
    ? `${PERSONA_ENCOUNTER_CROSS_OWNER_PUBLIC_EXHIBITS_PATH}?${query}`
    : PERSONA_ENCOUNTER_CROSS_OWNER_PUBLIC_EXHIBITS_PATH;
}

export function personaEncounterCrossOwnerPublicExhibitWebHref(slug: string) {
  return `/encounters/cross-owner#${encodeURIComponent(slug)}`;
}

export function personaEncounterCrossOwnerPublicExhibitApprovePath(slug: string) {
  return `${personaEncounterCrossOwnerPublicExhibitPath(slug)}/approve`;
}

export function personaEncounterCrossOwnerPublicExhibitRetractPath(slug: string) {
  return `${personaEncounterCrossOwnerPublicExhibitPath(slug)}/retract`;
}

export function personaEncounterCrossOwnerPublicExhibitReportPath(slug: string) {
  return `${personaEncounterCrossOwnerPublicExhibitPath(slug)}/report`;
}

export function personaEncounterCrossOwnerPublicExhibitMetadataPayload(
  input: PersonaEncounterCrossOwnerPublicExhibitMetadataRequest,
) {
  return {
    confirmCrossOwnerPublicMetadata: true,
    title: input.title.trim(),
    summary: input.summary.trim(),
    tags: (input.tags ?? []).map((tag) => tag.trim()).filter(Boolean),
    contractVersion: input.contractVersion ?? PERSONA_ENCOUNTER_CROSS_OWNER_PUBLIC_EXHIBIT_CONTRACT_VERSION,
  };
}

export function personaEncounterCrossOwnerConsentGeneratedArtifactsPath(consentId: string) {
  return `${personaEncounterCrossOwnerConsentPath(consentId)}/generated-artifacts`;
}

export function personaEncounterCrossOwnerGeneratedArtifactPath(artifactSlug: string) {
  return `${PERSONA_ENCOUNTER_CROSS_OWNER_GENERATED_ARTIFACTS_PATH}/${encodeURIComponent(artifactSlug)}`;
}

export function personaEncounterCrossOwnerGeneratedArtifactRevisionsPath(artifactSlug: string) {
  return `${personaEncounterCrossOwnerGeneratedArtifactPath(artifactSlug)}/revisions`;
}

export function personaEncounterCrossOwnerGeneratedArtifactRetractPath(artifactSlug: string) {
  return `${personaEncounterCrossOwnerGeneratedArtifactPath(artifactSlug)}/retract`;
}

export function personaEncounterCrossOwnerGeneratedRevisionApprovePath(revisionSlug: string) {
  return `/persona-encounters/cross-owner-generated-revisions/${encodeURIComponent(revisionSlug)}/approve`;
}

export function personaEncounterCrossOwnerGeneratedRevisionPublicationPath(revisionSlug: string) {
  return `/persona-encounters/cross-owner-generated-revisions/${encodeURIComponent(revisionSlug)}/publication`;
}

export function personaEncounterCrossOwnerGeneratedPublicationPath(slug: string) {
  return `${PERSONA_ENCOUNTER_CROSS_OWNER_GENERATED_PUBLICATIONS_PATH}/${encodeURIComponent(slug)}`;
}

export function personaEncounterCrossOwnerGeneratedPublicationRetractPath(slug: string) {
  return `${personaEncounterCrossOwnerGeneratedPublicationPath(slug)}/retract`;
}

export function personaEncounterCrossOwnerGeneratedPublicationReportPath(slug: string) {
  return `${personaEncounterCrossOwnerGeneratedPublicationPath(slug)}/report`;
}

export function personaEncounterCrossOwnerGeneratedPublicationWebHref(slug: string) {
  return `/encounters/cross-owner/generated/${encodeURIComponent(slug)}`;
}

export function personaEncounterCrossOwnerGeneratedArtifactPayload(
  input: PersonaEncounterCrossOwnerGeneratedArtifactRequest,
) {
  return {
    confirmPrivateGeneratedArtifact: true,
    title: input.title.trim(),
    body: input.body.trim(),
    ...(input.excerpt !== undefined ? { excerpt: normalizeOptionalText(input.excerpt) } : {}),
  };
}

export function personaEncounterCrossOwnerGeneratedRevisionPayload(
  input: PersonaEncounterCrossOwnerGeneratedRevisionRequest,
) {
  return {
    confirmExactPublicTextProposal: true,
    title: input.title.trim(),
    body: input.body.trim(),
    ...(input.excerpt !== undefined ? { excerpt: normalizeOptionalText(input.excerpt) } : {}),
  };
}

export function personaEncounterCrossOwnerGeneratedRevisionApprovalPayload(
  input: PersonaEncounterCrossOwnerGeneratedRevisionApprovalRequest,
) {
  return {
    confirmExactTextApproval: true,
    revisionDigest: input.revisionDigest.trim(),
  };
}

export function personaEncounterCrossOwnerGeneratedPublicationPayload(
  input: PersonaEncounterCrossOwnerGeneratedPublicationRequest,
) {
  return {
    confirmPublicGeneratedMaterialPublication: true,
    revisionDigest: input.revisionDigest.trim(),
  };
}

export function personaEncounterCrossOwnerConsentDisplay(consent: PersonaEncounterCrossOwnerConsent) {
  return `${consent.participants.requester.personaName} / ${consent.participants.counterparty.personaName}`;
}

export function personaEncounterCrossOwnerConsentCanRun(
  consent: PersonaEncounterCrossOwnerConsent,
) {
  return Boolean(
    consent.status === "approved" &&
    consent.requestedScopeVersion === PERSONA_ENCOUNTER_CROSS_OWNER_DISPOSABLE_PREVIEW_SCOPE_VERSION &&
    consent.requestedScopes.some((scope) =>
      scope.scope === PERSONA_ENCOUNTER_CROSS_OWNER_DISPOSABLE_PREVIEW_REQUIRED_SCOPE
    ),
  );
}

export function personaEncounterCrossOwnerConsentCanSaveGeneratedArtifact(
  consent: PersonaEncounterCrossOwnerConsent,
) {
  return Boolean(
    consent.status === "approved" &&
    consent.requestedScopeVersion === PERSONA_ENCOUNTER_CROSS_OWNER_DISPOSABLE_PREVIEW_SCOPE_VERSION &&
    consent.requestedScopes.some((scope) =>
      scope.scope === PERSONA_ENCOUNTER_CROSS_OWNER_GENERATED_ARTIFACT_REQUIRED_SCOPE
    ),
  );
}

export function personaEncounterCrossOwnerConsentCanPublishGeneratedRevision(
  consent: PersonaEncounterCrossOwnerConsent,
) {
  return Boolean(
    consent.status === "approved" &&
    consent.requestedScopeVersion === PERSONA_ENCOUNTER_CROSS_OWNER_DISPOSABLE_PREVIEW_SCOPE_VERSION &&
    consent.requestedScopes.some((scope) =>
      scope.scope === PERSONA_ENCOUNTER_CROSS_OWNER_GENERATED_ARTIFACT_REQUIRED_SCOPE
    ) &&
    consent.requestedScopes.some((scope) =>
      scope.scope === PERSONA_ENCOUNTER_CROSS_OWNER_GENERATED_PUBLICATION_REQUIRED_SCOPE
    ),
  );
}

export function personaEncounterCrossOwnerConsentStateCopy(
  consent?: PersonaEncounterCrossOwnerConsent | null,
) {
  if (!consent) return "No cross-owner consents are available.";
  if (consent.requestedScopeVersion !== PERSONA_ENCOUNTER_CROSS_OWNER_DISPOSABLE_PREVIEW_SCOPE_VERSION) {
    return "This consent uses a scope version that cannot run the disposable preview.";
  }
  if (!consent.requestedScopes.some((scope) =>
    scope.scope === PERSONA_ENCOUNTER_CROSS_OWNER_DISPOSABLE_PREVIEW_REQUIRED_SCOPE
  )) {
    return "This consent does not include cross-owner preview runtime scope.";
  }

  switch (consent.status) {
    case "approved":
      return "Approved consent can run one private disposable preview.";
    case "pending":
      return "Consent is pending and cannot run a preview yet.";
    case "rejected":
      return "Consent was rejected and cannot run a preview.";
    case "cancelled":
      return "Consent was cancelled and cannot run a preview.";
    case "revoked":
      return "Consent was revoked and cannot run a preview.";
    case "expired":
      return "Consent expired and cannot run a preview.";
    case "superseded":
      return "Consent was superseded and cannot run a preview.";
    case "blocked_by_deletion":
      return "Consent is blocked by deletion and cannot run a preview.";
    case "moderation_locked":
      return "Consent is moderation locked and cannot run a preview.";
  }
}

export function personaEncounterCrossOwnerConsentLedgerBoundaryReadback() {
  return [
    "Consent ledger only",
    "Not a saved session",
    "Not public by itself",
    "Does not share generated words",
    "Cross-owner public metadata requires separate exact bilateral metadata approval",
    "No transcript, summary, excerpt, generated words, or share-link publication by consent alone",
    "No Memory, Archive, Canon, Continuity, Integrity, or private retrieval",
    "Approval can be revoked",
    "Counterparty sees consent state and audit metadata, not generated preview text here.",
  ];
}

export function personaEncounterCrossOwnerConsentAvailableActions(
  consent: PersonaEncounterCrossOwnerConsent,
): PersonaEncounterCrossOwnerConsentAction[] {
  if (consent.status === "pending" && consent.participantRole === "counterparty") {
    return ["approve", "reject"];
  }
  if (consent.status === "pending" && consent.participantRole === "requester") {
    return ["cancel"];
  }
  if (consent.status === "approved" && consent.participantRole) {
    return ["revoke"];
  }
  return [];
}

export function personaEncounterPreviewReadinessPath(input: {
  initiatorPersonaId: string;
  responderPersonaId: string;
}) {
  const params = new URLSearchParams({
    initiatorPersonaId: input.initiatorPersonaId,
    responderPersonaId: input.responderPersonaId,
  });
  return `${PERSONA_ENCOUNTER_PREVIEW_READINESS_PATH}?${params.toString()}`;
}

export function personaEncounterPrivateSessionPath(sessionId: string) {
  return `${PERSONA_ENCOUNTER_PRIVATE_SESSIONS_PATH}/${encodeURIComponent(sessionId)}`;
}

export function personaEncounterPrivateSessionCurationPath(sessionId: string) {
  return `${personaEncounterPrivateSessionPath(sessionId)}/curation`;
}

export function personaEncounterPrivateSessionPublicExhibitPath(sessionId: string) {
  return `${personaEncounterPrivateSessionPath(sessionId)}/public-exhibit`;
}

export function personaEncounterPublicExhibitListPath(input: {
  limit?: number;
  cursor?: string | null;
} = {}) {
  const params = new URLSearchParams();
  if (input.limit !== undefined) params.set("limit", String(input.limit));
  if (input.cursor) params.set("cursor", input.cursor);
  const query = params.toString();
  return query ? `${PERSONA_ENCOUNTER_PUBLIC_EXHIBITS_PATH}?${query}` : PERSONA_ENCOUNTER_PUBLIC_EXHIBITS_PATH;
}

export function personaEncounterPublicExhibitPath(slug: string) {
  return `${PERSONA_ENCOUNTER_PUBLIC_EXHIBITS_PATH}/${encodeURIComponent(slug)}`;
}

export function personaEncounterPublicExhibitWebHref(slug: string) {
  return `/encounters/${encodeURIComponent(slug)}`;
}

export function personaEncounterPublicExhibitRetractPath(slug: string) {
  return `${personaEncounterPublicExhibitPath(slug)}/retract`;
}

export function personaEncounterPublicExhibitReportPath(slug: string) {
  return `${personaEncounterPublicExhibitPath(slug)}/report`;
}

export function personaEncounterPrivateSessionCurationPayload(
  input: PersonaEncounterPrivateSessionCurationRequest,
) {
  return {
    ...(input.title !== undefined ? { title: normalizeOptionalText(input.title) } : {}),
    ...(input.summary !== undefined ? { summary: normalizeOptionalText(input.summary) } : {}),
    ...(input.tags !== undefined
      ? { tags: input.tags.map((tag) => tag.trim()).filter(Boolean) }
      : {}),
    ...(input.publicationCandidate !== undefined
      ? { publicationCandidate: input.publicationCandidate }
      : {}),
  };
}

export function personaEncounterPublicExhibitPublishPayload(
  input: PersonaEncounterPublicExhibitPublishRequest,
) {
  return {
    confirmPublicExhibit: true,
    title: input.title.trim(),
    summary: input.summary.trim(),
    tags: (input.tags ?? []).map((tag) => tag.trim()).filter(Boolean),
  };
}

export function personaEncounterPreviewReady(input: {
  initiatorPersonaId?: string | null;
  responderPersonaId?: string | null;
  setup?: string | null;
}) {
  return Boolean(
    input.initiatorPersonaId &&
    input.responderPersonaId &&
    input.initiatorPersonaId !== input.responderPersonaId &&
    input.setup?.trim(),
  );
}

export function personaEncounterCrossOwnerDisposablePreviewReady(input: {
  consentId?: string | null;
  setup?: string | null;
}) {
  return Boolean(input.consentId && input.setup?.trim());
}

export function personaEncounterCrossOwnerPublicExhibitReadback(
  exhibit?: PersonaEncounterCrossOwnerPublicExhibitOwnerReadback | null,
) {
  return [
    "Cross-owner metadata-only public exhibit",
    exhibit?.provenance.label ?? "Cross-owner metadata-only public encounter exhibit",
    exhibit?.publication.public ? "Public API detail readback" : "Not public yet",
    exhibit?.publication.routeListed ? "Dedicated cross-owner index" : "Not listed",
    "Not indexed",
    exhibit?.publication.discoverable ? "Discover search-listed" : "Not Discover search-listed",
    exhibit?.publication.generatedWordsPublished ? "Generated words published" : "No generated words",
    exhibit?.publication.transcriptPublished ? "Transcript published" : "No transcript",
    exhibit?.publication.summaryPublished ? "Summary published" : "No generated summary",
    exhibit?.publication.excerptPublished ? "Excerpt published" : "No excerpt",
    "No private setup, PR516 disposable preview output, provider payload, token fact, retrieval body, raw owner id, or raw persona id",
  ];
}

export function personaEncounterCrossOwnerPrivateGeneratedArtifactReadback(
  artifact?: PersonaEncounterCrossOwnerGeneratedArtifactReadback | null,
) {
  if (!artifact) {
    return [
      "Cross-owner private generated artifact",
      "Participant-only readback",
      "No public generated route",
      "Exact-text approval ledger required",
      "Both participants must approve the same digest",
      "PR516 disposable preview is not automatically reused",
      "No public generated words, transcript, summary, excerpt, provider payload, token fact, retrieval body, raw owner id, or raw persona id",
    ];
  }

  const latestRevision = artifact.revisions[0] ?? null;
  return [
    artifact.provenance.label,
    artifact.provenance.generatedContentPrivate ? "Participant-only readback" : "Private boundary unclear",
    artifact.publication.public ? "Public" : "No public generated route",
    artifact.approvals.exactTextApprovalRequired ? "Exact-text approval ledger required" : "Approval boundary unclear",
    latestRevision?.approvals.bothParticipantsApproved
      ? "Both participants approved latest exact digest"
      : "Both participants must approve the same digest",
    artifact.provenance.pr516AutoReuse ? "Preview auto-reuse unclear" : "PR516 disposable preview is not automatically reused",
    artifact.lifecycleStatus === "active" ? "Artifact active" : `Artifact ${artifact.lifecycleStatus}`,
    artifact.publication.generatedWordsPublished ? "Generated words published" : "No public generated words",
    "No transcript, public summary, public excerpt, provider payload, token fact, retrieval body, raw owner id, or raw persona id",
  ];
}

export function personaEncounterCrossOwnerGeneratedPublicationReadback(
  publication?: PersonaEncounterCrossOwnerGeneratedPublicationDetail | null,
) {
  if (!publication) {
    return [
      "Cross-owner generated material public detail",
      "Detail route only",
      "Exact approved revision required",
      "Copied server-side from PR522 revision",
      "No public list, Discover, Space, forum, writing, homepage, or persona linkback placement",
      "No PR516 disposable preview direct publication",
      "No provider payload, retrieval body, token fact, raw owner id, or raw persona id",
    ];
  }

  return [
    publication.provenance.label,
    publication.provenance.detailOnly ? "Detail route only" : "Placement boundary unclear",
    publication.source.exactApprovedRevision ? "Exact approved revision" : "Revision approval unclear",
    publication.source.copiedServerSide ? "Copied server-side from approved revision" : "Source copy mismatch",
    publication.provenance.public ? "Public generated body on this detail route" : "Generated body hidden",
    publication.provenance.noPublicList ? "No public list placement" : "List placement unclear",
    publication.provenance.noPr516DirectPublication ? "No PR516 direct publication" : "Preview source unclear",
    "No provider payload, retrieval body, token fact, raw owner id, or raw persona id",
  ];
}

export function personaEncounterPreviewReadback(response?: PersonaEncounterPreviewResponse | null) {
  if (!response) {
    return [
      "Owner-authored setup",
      "Selected same-owner personas",
      "Model-generated responder reply",
      "Disposable preview only",
      "Not saved",
      "Not a transcript",
      "Not shareable",
      "No Memory, Archive, Canon, Continuity, Integrity, or transcript sources retrieved",
    ];
  }

  return [
    response.provenance.setup.label,
    response.provenance.personas.label,
    response.provenance.reply.label,
    response.provenance.persistence.note,
    response.provenance.persistence.saved ? "Saved" : "Not saved",
    response.provenance.persistence.transcriptStored ? "Transcript stored" : "Not a transcript",
    response.provenance.persistence.shareable ? "Shareable" : "Not shareable",
    response.provenance.persistence.sourceRetrieval
      ? "Private source retrieval used"
      : "No Memory, Archive, Canon, Continuity, Integrity, or transcript sources retrieved",
  ];
}

export function personaEncounterCrossOwnerDisposablePreviewReadback(
  response?: PersonaEncounterCrossOwnerDisposablePreviewResponse | null,
) {
  if (!response) {
    return [
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
    ];
  }

  return [
    "Cross-owner disposable preview",
    response.provenance.setup.label,
    response.provenance.personas.label,
    response.provenance.reply.label,
    response.preview.reply.private && response.preview.reply.disposable
      ? "Private disposable preview"
      : "Preview boundary unclear",
    response.provenance.persistence.saved ? "Saved" : "Not saved",
    response.preview.reply.public ? "Public" : "Not public",
    response.preview.reply.canonical ? "Canonical" : "Not canonical",
    response.preview.reply.transcript ? "Transcript" : "Not a transcript",
    response.preview.reply.summary ? "Summary" : "Not a summary",
    response.preview.reply.excerpt ? "Excerpt" : "Not an excerpt",
    response.preview.reply.shareable ? "Shareable" : "Not shareable",
    response.provenance.persistence.sourceRetrieval
      ? "Private retrieval used"
      : "No Memory, Archive, Canon, Continuity, Integrity, private retrieval, or transcript sources used",
    response.provenance.counterparty.label,
    response.provenance.audit.label,
  ];
}

export function personaEncounterPrivateSessionReadback(session?: PersonaEncounterPrivateSession | null) {
  if (!session) {
    return [
      "Private saved encounter artifact",
      "Owner-authored setup stored",
      "Model-generated responder reply stored",
      "No source retrieval",
      "Not public",
      "Not shareable",
    ];
  }

  return [
    session.provenance.artifact.label,
    session.setup.label,
    session.personas.label,
    session.reply.label,
    session.provenance.persistence.note,
    session.provenance.persistence.saved ? "Saved private artifact" : "Not saved",
    session.provenance.persistence.public ? "Public" : "Not public",
    session.provenance.persistence.shareable ? "Shareable" : "Not shareable",
    session.provenance.persistence.sourceRetrieval
      ? "Private source retrieval used"
      : "No Memory, Archive, Canon, Continuity, Integrity, or transcript sources retrieved",
    session.curation.title ? `Private title: ${session.curation.title}` : "No private title",
    session.curation.summary ? "Private note saved" : "No private note",
    session.curation.tags.length > 0 ? `Private tags: ${session.curation.tags.join(", ")}` : "No private tags",
    session.curation.publicationCandidate
      ? "Private candidate planning flag only"
      : "Not marked as a private candidate",
    session.publicExhibit
      ? `Public exhibit ${session.publicExhibit.status}: ${session.publicExhibit.title}`
      : "No public exhibit",
    "Private candidate is not publication approval",
    "Public exhibits are metadata-only and never publish private setup, raw reply, transcript, excerpt, or private curation",
  ];
}

export function personaEncounterPreviewAvailabilityCopy(
  readiness?: PersonaEncounterPreviewReadinessResponse | null,
) {
  if (!readiness) return "Checking encounter preview provider setup.";
  if (readiness.ready) return "Encounter preview provider is ready.";
  if (readiness.code === "persona_encounter_persona_not_owned") {
    return "Both personas must belong to this owner before a preview can run.";
  }
  if (readiness.code === "persona_encounter_provider_unavailable") {
    return "Encounter preview is paused because provider setup is unavailable.";
  }
  return readiness.message || "Encounter preview is paused.";
}

export function personaEncounterPreviewErrorCopy(input: { status?: number; code?: string; message: string }) {
  switch (input.code) {
    case "persona_encounter_persona_not_owned":
      return "Both personas must belong to this owner before a preview can run.";
    case "persona_encounter_provider_unavailable":
      return "Encounter preview provider setup is unavailable.";
    case "persona_encounter_rate_limit_unavailable":
      return "Encounter preview rate limits are unavailable, so the preview is paused.";
    case "persona_encounter_rate_limited":
      return "Encounter preview rate limit reached.";
    case "persona_encounter_quota_exceeded":
      return "Encounter preview token budget is exhausted.";
    case "persona_encounter_provider_failed":
      return "Encounter preview provider failed.";
    case "persona_encounter_provider_empty_reply":
      return "Encounter preview provider returned no visible reply.";
    case "persona_encounter_private_session_save_failed":
      return "Private encounter artifact could not be saved.";
    case "persona_encounter_private_session_load_failed":
      return "Private encounter artifacts could not be loaded.";
    case "persona_encounter_private_session_delete_failed":
      return "Private encounter artifact could not be deleted.";
    case "persona_encounter_private_session_curation_failed":
      return "Private encounter curation could not be saved.";
    case "persona_encounter_public_exhibit_candidate_required":
      return "Mark this private artifact as a private candidate before publishing public metadata.";
    case "persona_encounter_public_exhibit_same_owner_required":
      return "Public encounter exhibits require same-owner source personas.";
    case "persona_encounter_public_exhibit_removed":
      return "This public encounter exhibit was removed by moderation.";
    case "persona_encounter_public_exhibit_save_failed":
      return "Public encounter exhibit metadata could not be saved.";
    case "persona_encounter_public_exhibit_retract_failed":
      return "Public encounter exhibit metadata could not be retracted.";
    default:
      return input.message || "Encounter preview could not run.";
  }
}

export function personaEncounterCrossOwnerDisposablePreviewErrorCopy(input: {
  status?: number;
  code?: string;
  message?: string;
}) {
  switch (input.code) {
    case "persona_encounter_provider_unavailable":
      return "Cross-owner preview provider setup is unavailable.";
    case "persona_encounter_quota_exceeded":
      return "Cross-owner preview token budget is exhausted.";
    case "persona_encounter_rate_limited":
      return "Cross-owner preview rate limit reached.";
    case "persona_encounter_cross_owner_preview_ineligible":
      return "Approved consent is required before this cross-owner preview can run.";
    case "persona_encounter_cross_owner_consent_load_failed":
      return "Cross-owner consent could not be loaded.";
    case "persona_encounter_cross_owner_runtime_attempt_audit_failed":
      return "Cross-owner preview audit could not be recorded, so the preview is paused.";
    case "persona_encounter_provider_failed":
      return "Cross-owner preview provider failed.";
    case "persona_encounter_provider_empty_reply":
      return "Cross-owner preview provider returned no visible reply.";
    default:
      return "Cross-owner disposable preview could not run.";
  }
}

export function personaEncounterCrossOwnerConsentInvitationErrorCopy(input: {
  status?: number;
  code?: string;
  message?: string;
}) {
  switch (input.code) {
    case "persona_encounter_cross_owner_target_invalid_slug":
      return "Choose a safe public persona route before inviting.";
    case "persona_encounter_cross_owner_target_unavailable":
      return "That public persona cannot be invited.";
    case "persona_encounter_cross_owner_target_same_owner":
    case "persona_encounter_cross_owner_required":
      return "Cross-owner invitations require a public persona owned by another account.";
    case "persona_encounter_cross_owner_requester_persona_not_owned":
      return "Choose one of your own personas before inviting.";
    case "persona_encounter_cross_owner_consent_save_failed":
      return "Cross-owner consent invitation could not be saved.";
    case "persona_encounter_cross_owner_target_load_failed":
      return "Counterparty public persona target could not be loaded.";
    default:
      return "Cross-owner consent invitation could not be prepared.";
  }
}

export function personaEncounterCrossOwnerConsentActionErrorCopy(input: {
  status?: number;
  code?: string;
  message?: string;
}) {
  switch (input.code) {
    case "persona_encounter_cross_owner_consent_counterparty_required":
      return "Only the counterparty owner can take that consent action.";
    case "persona_encounter_cross_owner_consent_requester_required":
      return "Only the requester owner can take that consent action.";
    case "persona_encounter_cross_owner_consent_inactive":
      return "This consent is not pending or active for that action.";
    case "persona_encounter_cross_owner_consent_load_failed":
      return "Cross-owner consent could not be loaded.";
    case "persona_encounter_cross_owner_consent_update_failed":
      return "Cross-owner consent could not be updated.";
    default:
      return "Cross-owner consent action could not be saved.";
  }
}

export function personaEncounterCrossOwnerPublicExhibitErrorCopy(input: {
  status?: number;
  code?: string;
  message?: string;
}) {
  switch (input.code) {
    case "persona_encounter_cross_owner_public_exhibit_consent_inactive":
      return "Cross-owner public metadata requires active approved consent.";
    case "persona_encounter_cross_owner_public_exhibit_wrong_scope":
      return "This consent does not include public metadata exhibit scope.";
    case "persona_encounter_cross_owner_public_exhibit_wrong_version":
      return "This consent uses an unsupported public metadata contract version.";
    case "persona_encounter_cross_owner_public_exhibit_exists":
      return "A cross-owner public metadata proposal already exists for this consent.";
    case "persona_encounter_cross_owner_public_exhibit_metadata_mismatch":
      return "Both owners must approve the exact same public metadata.";
    case "persona_encounter_cross_owner_public_exhibit_counterparty_metadata_required":
      return "The other participant must approve the exact public metadata.";
    case "persona_encounter_cross_owner_public_exhibit_removed":
      return "This cross-owner public exhibit was removed by moderation.";
    case "persona_encounter_cross_owner_public_exhibit_retracted":
      return "This cross-owner public exhibit was retracted.";
    case "persona_encounter_cross_owner_public_exhibit_save_failed":
    case "persona_encounter_cross_owner_public_exhibit_approve_failed":
    case "persona_encounter_cross_owner_public_exhibit_retract_failed":
    case "persona_encounter_cross_owner_public_exhibit_load_failed":
      return "Cross-owner public exhibit metadata could not be saved.";
    default:
      return "Cross-owner public exhibit metadata could not be prepared.";
  }
}

export function personaEncounterCrossOwnerGeneratedArtifactErrorCopy(input: {
  status?: number;
  code?: string;
  message?: string;
}) {
  switch (input.code) {
    case "persona_encounter_cross_owner_generated_artifact_consent_inactive":
      return "Active approved consent is required before saving a private generated artifact.";
    case "persona_encounter_cross_owner_generated_artifact_wrong_scope":
      return "This consent does not include private generated artifact scope.";
    case "persona_encounter_cross_owner_generated_artifact_wrong_version":
      return "This consent uses an unsupported private generated artifact contract version.";
    case "persona_encounter_cross_owner_generated_artifact_stale_participants":
      return "This artifact no longer matches the consent participants.";
    case "persona_encounter_cross_owner_generated_artifact_inactive":
      return "This private generated artifact is not active.";
    case "persona_encounter_cross_owner_generated_revision_digest_mismatch":
      return "Both participants must approve the exact same generated revision digest.";
    case "persona_encounter_cross_owner_generated_revision_counterparty_required":
      return "The other participant must approve this exact generated revision.";
    case "persona_encounter_cross_owner_generated_revision_inactive":
      return "Only proposed generated revisions can be approved.";
    case "persona_encounter_cross_owner_generated_revision_stale":
      return "This generated revision changed and needs a new exact-text proposal.";
    case "persona_encounter_cross_owner_generated_publication_wrong_scope":
      return "This consent does not include exact generated revision publication scope.";
    case "persona_encounter_cross_owner_generated_publication_revision_unapproved":
      return "Only approved generated revisions can be published.";
    case "persona_encounter_cross_owner_generated_publication_revision_stale":
      return "This generated revision changed after approval and needs a new exact-text approval.";
    case "persona_encounter_cross_owner_generated_publication_digest_mismatch":
      return "Publication requires the exact approved revision digest.";
    case "persona_encounter_cross_owner_generated_publication_bilateral_approval_required":
      return "Both participants must approve this exact revision before publication.";
    case "persona_encounter_cross_owner_generated_publication_source_mismatch":
      return "This publication no longer matches its approved source revision.";
    case "persona_encounter_cross_owner_generated_publication_participant_deleted":
      return "This publication source is no longer available.";
    case "persona_encounter_cross_owner_generated_publication_exists":
      return "A public generated-material detail already exists for this exact revision.";
    case "persona_encounter_cross_owner_generated_publication_inactive":
      return "This generated-material publication is not currently public.";
    case "persona_encounter_cross_owner_generated_artifact_save_failed":
    case "persona_encounter_cross_owner_generated_artifact_load_failed":
    case "persona_encounter_cross_owner_generated_artifact_retract_failed":
    case "persona_encounter_cross_owner_generated_artifact_delete_failed":
    case "persona_encounter_cross_owner_generated_artifact_revoke_failed":
    case "persona_encounter_cross_owner_generated_revision_save_failed":
    case "persona_encounter_cross_owner_generated_revision_load_failed":
    case "persona_encounter_cross_owner_generated_revision_reset_failed":
    case "persona_encounter_cross_owner_generated_revision_approval_failed":
    case "persona_encounter_cross_owner_generated_revision_approve_failed":
    case "persona_encounter_cross_owner_generated_publication_load_failed":
    case "persona_encounter_cross_owner_generated_publication_save_failed":
    case "persona_encounter_cross_owner_generated_publication_retract_failed":
    case "persona_encounter_cross_owner_generated_publication_delete_failed":
    case "persona_encounter_cross_owner_generated_publication_revoke_failed":
      return "Cross-owner private generated artifact workflow could not be saved.";
    default:
      return "Cross-owner private generated artifact workflow could not be prepared.";
  }
}

function isSafeCrossOwnerPublicPersonaSlug(value: string | null | undefined) {
  return Boolean(
    value &&
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) &&
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
  );
}

function normalizeOptionalText(value: string | null | undefined) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const trimmed = value.trim();
  return trimmed || null;
}
