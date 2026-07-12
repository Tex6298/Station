import type { ContinuityCandidate } from "@station/types/persona";

export interface ImportReviewCandidateLike {
  candidateType: ContinuityCandidate["candidateType"];
  archivedChatTranscriptId?: string | null;
  sourceLabel?: string | null;
  sourceTable?: string | null;
  status: ContinuityCandidate["status"];
  acceptedTargetType?: ContinuityCandidate["acceptedTargetType"];
  acceptedAt?: string | null;
}

export function importReviewSummary(candidates: ImportReviewCandidateLike[]) {
  return {
    total: candidates.length,
    pending: candidates.filter((candidate) => candidate.status === "pending").length,
    reviewed: candidates.filter((candidate) => candidate.status !== "pending").length,
    memory: candidates.filter((candidate) => candidate.candidateType === "memory").length,
    canon: candidates.filter((candidate) => candidate.candidateType === "canon").length,
  };
}

export function importBackedCandidateInboxPath(personaId: string) {
  return `/conversations/persona/${encodeURIComponent(personaId)}/candidates?source=import&status=all`;
}

export function continuityCandidateInboxPath(personaId: string) {
  return `/conversations/persona/${encodeURIComponent(personaId)}/candidates?source=all&status=pending`;
}

export function importReviewSourceLabel(
  candidate: Pick<ImportReviewCandidateLike, "archivedChatTranscriptId" | "sourceLabel" | "sourceTable">
) {
  const fallback = isArchivedConversationCandidate(candidate) ? "Archived conversation" : "Imported source";
  return sanitizeImportReviewLabel(candidate.sourceLabel?.trim() || fallback);
}

export function importReviewSourceTypeLabel(
  candidate: Pick<ImportReviewCandidateLike, "archivedChatTranscriptId" | "sourceTable">
) {
  if (isArchivedConversationCandidate(candidate)) return "Archived conversation";
  if (candidate.sourceTable === "persona_files") return "Private import source";
  if (candidate.sourceTable === "memory_items") return "Memory";
  if (candidate.sourceTable === "canon_items") return "Canon";
  return "Imported source";
}

export function importReviewCandidateLabel(candidateType: ContinuityCandidate["candidateType"]) {
  return candidateType === "canon" ? "Canon candidate" : "Memory candidate";
}

export function importReviewDestinationLabel(candidateType: ContinuityCandidate["candidateType"]) {
  return candidateType === "canon" ? "Canon" : "Memory";
}

export function importReviewStatusLabel(status: ContinuityCandidate["status"]) {
  if (status === "accepted") return "Accepted";
  if (status === "rejected") return "Rejected";
  return "Pending";
}

export function importReviewOutcomeLabel(candidate: ImportReviewCandidateLike) {
  if (candidate.status === "accepted") {
    return `Accepted to ${importReviewDestinationLabel(candidate.acceptedTargetType ?? candidate.candidateType)}`;
  }
  if (candidate.status === "rejected") return "Rejected; source preserved";
  return `Pending review for ${importReviewDestinationLabel(candidate.candidateType)}`;
}

export function importReviewPreservationCopy(candidate: ImportReviewCandidateLike) {
  const destination = importReviewDestinationLabel(candidate.candidateType);
  const source = isArchivedConversationCandidate(candidate) ? "archived conversation" : "import source";
  if (candidate.status === "accepted") {
    return `Accepted text was written to ${destination}. The original ${source} stays preserved privately in Archive.`;
  }
  if (candidate.status === "rejected") {
    return `Rejected candidates are not promoted into runtime material. The original ${source} stays preserved privately in Archive.`;
  }
  return `Accept writes the edited text to ${destination}. Reject keeps this candidate out of runtime material while preserving the private source.`;
}

export function importReviewEmptyCopy(sourceCount: number, scope: "import" | "continuity" = "import") {
  if (scope === "continuity") {
    return "No Memory or Canon suggestions are waiting for review. New suggestions can arrive from imports or archived conversations.";
  }
  if (sourceCount > 0) {
    return "No import review candidates are waiting. Parsed imports create review items only when Station can safely extract Memory or Canon candidates.";
  }

  return "No import review candidates yet. Upload or paste source material; Station will create review items only when it can safely parse the source.";
}

function isArchivedConversationCandidate(
  candidate: Pick<ImportReviewCandidateLike, "archivedChatTranscriptId" | "sourceTable">
) {
  return Boolean(candidate.archivedChatTranscriptId) || candidate.sourceTable === "archived_chat_transcripts";
}

function sanitizeImportReviewLabel(value: string) {
  const sanitized = value
    .replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/gi, "[id]")
    .replace(/https?:\/\/\S+/gi, "[redacted-url]")
    .replace(SECRET_SHAPED_VALUE_PATTERN, "[redacted-secret]")
    .replace(/\b(?:bearer)\s+\S+/gi, "bearer [redacted]")
    .replace(/\b(token|cookie|authorization|api[_-]?key|x-api-key|secret|password)\b\s*[:=]\s*\S+/gi, "$1=[redacted]");

  return sanitized.length > 120 ? `${sanitized.slice(0, 117).trim()}...` : sanitized;
}

const SECRET_SHAPED_VALUE_PATTERN = /\b(?:sk|pk|rk|whsec|ghp|pat)[_-][A-Za-z0-9._-]+/gi;
