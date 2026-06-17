"use client";

import { useMemo, useState } from "react";
import type { ContinuityCandidate } from "@station/types/persona";
import { apiPatch } from "@/lib/api-client";
import {
  importReviewEmptyCopy,
  importReviewSourceLabel,
  importReviewStatusLabel,
  importReviewSummary,
} from "@/lib/import-review";
import {
  StudioEmptyState,
  StudioErrorState,
  StudioPanel,
  StudioStatusBadge,
} from "@/components/studio/studio-frame";

export function ImportReviewInbox({
  candidates,
  token,
  sourceCount,
  onCandidateUpdated,
}: {
  candidates: ContinuityCandidate[];
  token: string | null;
  sourceCount: number;
  onCandidateUpdated: (candidate: ContinuityCandidate) => void;
}) {
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const summary = importReviewSummary(candidates);
  const sorted = useMemo(
    () => [...candidates].sort((a, b) => {
      if (a.status === b.status) return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return a.status === "pending" ? -1 : 1;
    }),
    [candidates]
  );

  async function reviewCandidate(
    candidate: ContinuityCandidate,
    action: "accept" | "reject",
    edits?: { title: string; content: string }
  ) {
    if (!token || candidate.status !== "pending") return;
    setReviewing(candidate.id);
    setError(null);
    try {
      const response = await apiPatch<{ candidate: ContinuityCandidate }>(
        `/conversations/candidates/${candidate.id}`,
        { action, ...edits },
        token
      );
      onCandidateUpdated(response.candidate);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not review import candidate.");
    } finally {
      setReviewing(null);
    }
  }

  return (
    <StudioPanel className="import-review-inbox">
      <div className="studio-section-heading">
        <div className="section-label">Import Review</div>
        <h2>Memory and Canon candidates</h2>
      </div>
      <p className="archive-trust-copy">
        Imported source material stays private in the archive. Accepting promotes edited candidate text; rejecting keeps the source preserved.
      </p>

      <div className="archive-trust-stats">
        <ReviewMetric label="Pending" value={summary.pending} tone={summary.pending > 0 ? "warning" : "info"} />
        <ReviewMetric label="Reviewed" value={summary.reviewed} />
        <ReviewMetric label="Memory" value={summary.memory} />
        <ReviewMetric label="Canon" value={summary.canon} />
      </div>

      {error ? <StudioErrorState>{error}</StudioErrorState> : null}

      {sorted.length === 0 ? (
        <StudioEmptyState>{importReviewEmptyCopy(sourceCount)}</StudioEmptyState>
      ) : (
        <div className="studio-item-list">
          {sorted.map((candidate) => (
            <ImportCandidateCard
              key={candidate.id}
              candidate={candidate}
              busy={reviewing === candidate.id}
              onReview={reviewCandidate}
            />
          ))}
        </div>
      )}
    </StudioPanel>
  );
}

function ImportCandidateCard({
  candidate,
  busy,
  onReview,
}: {
  candidate: ContinuityCandidate;
  busy: boolean;
  onReview: (
    candidate: ContinuityCandidate,
    action: "accept" | "reject",
    edits?: { title: string; content: string }
  ) => void;
}) {
  const [title, setTitle] = useState(candidate.title ?? "");
  const [content, setContent] = useState(candidate.content);
  const pending = candidate.status === "pending";

  return (
    <article className="studio-item-card archive-trust-source-card">
      <div>
        <span>{candidate.candidateType}</span>
        <div className="archive-trust-card-meta">
          <StudioStatusBadge tone={candidate.status === "pending" ? "warning" : candidate.status === "accepted" ? "good" : "info"}>
            {importReviewStatusLabel(candidate.status)}
          </StudioStatusBadge>
          <span>{importReviewSourceLabel(candidate)}</span>
        </div>
      </div>
      <input
        className="input"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        disabled={!pending || busy}
        maxLength={160}
      />
      <textarea
        className="textarea"
        value={content}
        onChange={(event) => setContent(event.target.value)}
        disabled={!pending || busy}
        style={{ minHeight: 110, resize: "vertical" }}
      />
      {candidate.rationale ? <p>{candidate.rationale}</p> : null}
      <div className="archive-trust-next-action">
        {pending ? "Review before activating. Rejecting keeps the private archive source." : `Reviewed ${candidate.acceptedAt ? formatDate(candidate.acceptedAt) : ""}`.trim()}
      </div>
      {pending ? (
        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", flexWrap: "wrap" }}>
          <button className="button" type="button" disabled={busy} onClick={() => onReview(candidate, "reject")}>
            Reject
          </button>
          <button
            className="button primary"
            type="button"
            disabled={busy || !content.trim()}
            onClick={() => onReview(candidate, "accept", { title, content })}
          >
            {busy ? "Saving..." : "Accept with edits"}
          </button>
        </div>
      ) : null}
    </article>
  );
}

function ReviewMetric({
  label,
  value,
  tone = "info",
}: {
  label: string;
  value: number;
  tone?: "info" | "warning" | "danger";
}) {
  return (
    <div className="archive-trust-metric" data-tone={tone}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
