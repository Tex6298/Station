import type { ContinuityCandidate } from "@station/types/persona";

export interface ImportReviewCandidateLike {
  candidateType: ContinuityCandidate["candidateType"];
  sourceLabel?: string | null;
  status: ContinuityCandidate["status"];
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

export function importReviewSourceLabel(candidate: Pick<ImportReviewCandidateLike, "sourceLabel">) {
  return candidate.sourceLabel?.trim() || "Imported source";
}

export function importReviewStatusLabel(status: ContinuityCandidate["status"]) {
  if (status === "accepted") return "Accepted";
  if (status === "rejected") return "Rejected";
  return "Pending";
}

export function importReviewEmptyCopy(sourceCount: number) {
  if (sourceCount > 0) {
    return "No import review candidates are waiting. Parsed imports create review items only when Station can safely extract Memory or Canon candidates.";
  }

  return "No import review candidates yet. Upload or paste source material; Station will create review items only when it can safely parse the source.";
}
