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
}

export interface PersonaEncounterPrivateSessionCurationRequest {
  title?: string | null;
  summary?: string | null;
  tags?: string[];
  publicationCandidate?: boolean;
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
export const PERSONA_ENCOUNTER_PRIVATE_SESSION_CURATION_SCHEMA =
  "station.persona_encounter.private_session_curation.v1";

export function personaEncounterPreviewPayload(input: PersonaEncounterPreviewRequest) {
  return {
    initiatorPersonaId: input.initiatorPersonaId,
    responderPersonaId: input.responderPersonaId,
    setup: input.setup.trim(),
    ...(input.maxOutputTokens ? { maxOutputTokens: input.maxOutputTokens } : {}),
  };
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
    "Not published, shared, moderated, public, or cross-owner consented",
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
    default:
      return input.message || "Encounter preview could not run.";
  }
}

function normalizeOptionalText(value: string | null | undefined) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const trimmed = value.trim();
  return trimmed || null;
}
