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

export interface PersonaEncounterPreviewReadinessResponse {
  ready: boolean;
  message: string;
  code?: "persona_encounter_persona_not_owned" | "persona_encounter_provider_unavailable";
  classification?: string;
}

export const PERSONA_ENCOUNTER_PREVIEW_PATH = "/persona-encounters/preview";
export const PERSONA_ENCOUNTER_PREVIEW_READINESS_PATH = "/persona-encounters/preview/readiness";

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
    default:
      return input.message || "Encounter preview could not run.";
  }
}
