"use client";

import { useEffect, useMemo, useState } from "react";
import type { ContinuityCandidate } from "@station/types/persona";
import { apiPatch } from "@/lib/api-client";
import {
  importReviewCandidateLabel,
  importReviewEmptyCopy,
  importReviewDestinationLabel,
  importReviewOutcomeLabel,
  importReviewPreservationCopy,
  importReviewSourceLabel,
  importReviewSourceTypeLabel,
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
  copy,
  scope = "import",
}: {
  candidates: ContinuityCandidate[];
  token: string | null;
  sourceCount: number;
  onCandidateUpdated: (candidate: ContinuityCandidate) => void | Promise<void>;
  copy?: Partial<ImportReviewInboxCopy>;
  scope?: "import" | "continuity";
}) {
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const resolvedCopy = { ...DEFAULT_IMPORT_REVIEW_INBOX_COPY, ...copy };
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
      await onCandidateUpdated(response.candidate);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not review continuity suggestion.");
    } finally {
      setReviewing(null);
    }
  }

  return (
    <StudioPanel className="import-review-inbox">
      <div className="studio-section-heading">
        <div className="section-label">{resolvedCopy.eyebrow}</div>
        <h2>{resolvedCopy.title}</h2>
      </div>
      <p className="archive-trust-copy">
        {resolvedCopy.description}
      </p>

      <div className="archive-trust-stats">
        <ReviewMetric label="Pending" value={summary.pending} tone={summary.pending > 0 ? "warning" : "info"} />
        {scope === "import" ? <ReviewMetric label="Reviewed" value={summary.reviewed} /> : null}
        <ReviewMetric label="Memory" value={summary.memory} />
        <ReviewMetric label="Canon" value={summary.canon} />
      </div>

      {error ? <StudioErrorState>{error}</StudioErrorState> : null}

      {sorted.length === 0 ? (
        <StudioEmptyState>{resolvedCopy.emptyState ?? importReviewEmptyCopy(sourceCount, scope)}</StudioEmptyState>
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

interface ImportReviewInboxCopy {
  eyebrow: string;
  title: string;
  description: string;
  emptyState?: string;
}

const DEFAULT_IMPORT_REVIEW_INBOX_COPY: ImportReviewInboxCopy = {
  eyebrow: "Import Review",
  title: "Memory and Canon candidates",
  description: "Imported source material stays private in the archive. Accepting promotes edited candidate text; rejecting keeps the source preserved.",
};

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

  useEffect(() => {
    setTitle(candidate.title ?? "");
    setContent(candidate.content);
  }, [candidate.content, candidate.id, candidate.status, candidate.title]);

  return (
    <article className="studio-item-card archive-trust-source-card">
      <div>
        <span>{importReviewCandidateLabel(candidate.candidateType)}</span>
        <div className="archive-trust-card-meta">
          <StudioStatusBadge tone={candidate.status === "pending" ? "warning" : candidate.status === "accepted" ? "good" : "info"}>
            {importReviewStatusLabel(candidate.status)}
          </StudioStatusBadge>
          <span>{importReviewSourceTypeLabel(candidate)}</span>
        </div>
      </div>
      <h3>{title.trim() || importReviewCandidateLabel(candidate.candidateType)}</h3>
      <dl className="import-review-readback">
        <div>
          <dt>Source</dt>
          <dd>{importReviewSourceLabel(candidate)}</dd>
        </div>
        <div>
          <dt>Destination</dt>
          <dd>{importReviewDestinationLabel(candidate.candidateType)}</dd>
        </div>
        <div>
          <dt>State</dt>
          <dd>{importReviewOutcomeLabel(candidate)}</dd>
        </div>
      </dl>
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
        {importReviewPreservationCopy(candidate)}
        {!pending && candidate.acceptedAt ? ` Reviewed ${formatDate(candidate.acceptedAt)}.` : ""}
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
