"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { PublicSeminarCard, PublicSeminarDetailResponse, PublicSeminarInterestResponse } from "@station/types";
import { ApiRequestError, apiDelete, apiGet, apiPost } from "@/lib/api-client";
import { getSession } from "@/lib/auth";
import {
  publicSeminarCardHref,
  publicSeminarDateLabel,
  publicSeminarDetailIntroCopy,
  publicSeminarDetailNotFoundCopy,
  publicSeminarDetailUnavailableCopy,
  publicSeminarDiscussionHref,
  publicSeminarInterestActionLabel,
  publicSeminarInterestCountLabel,
  publicSeminarInterestSafetyCopy,
  publicSeminarMissingScheduleCopy,
  publicSeminarScheduleLabel,
  publicSeminarSignInPromptCopy,
  publicSeminarSourceLabel,
  publicSeminarSpaceHref,
  publicSeminarViewerInterestCopy,
} from "@/lib/live-events-route";

type DetailStatus = "loading" | "ready" | "not-found" | "unavailable";

export default function PublicSeminarDetailPage() {
  const params = useParams<{ seminarId?: string | string[] }>();
  const seminarId = Array.isArray(params.seminarId) ? params.seminarId[0] : params.seminarId;
  const [card, setCard] = useState<PublicSeminarCard | null>(null);
  const [status, setStatus] = useState<DetailStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [pendingInterest, setPendingInterest] = useState(false);
  const [interestError, setInterestError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSeminar() {
      if (!seminarId) {
        setStatus("not-found");
        return;
      }

      setStatus("loading");
      setError(null);
      setInterestError(null);
      try {
        const session = await getSession();
        const accessToken = session?.access_token ?? null;
        const data = await apiGet<PublicSeminarDetailResponse>(
          `/events/seminars/${encodeURIComponent(seminarId)}`,
          accessToken ?? undefined
        );
        if (cancelled) return;
        setToken(accessToken);
        setCard(data.card);
        setStatus("ready");
      } catch (err) {
        if (cancelled) return;
        setToken(null);
        setCard(null);
        if (err instanceof ApiRequestError && err.code === "seminar_not_found") {
          setStatus("not-found");
          setError(publicSeminarDetailNotFoundCopy());
        } else {
          setStatus("unavailable");
          setError(err instanceof Error ? err.message : publicSeminarDetailUnavailableCopy());
        }
      }
    }

    void loadSeminar();
    return () => {
      cancelled = true;
    };
  }, [seminarId]);

  async function handleInterestToggle() {
    if (!token || !card || pendingInterest) return;
    setPendingInterest(true);
    setInterestError(null);

    try {
      const data = card.viewerInterested
        ? await apiDelete<PublicSeminarInterestResponse>(`/events/seminars/${card.id}/interest`, token)
        : await apiPost<PublicSeminarInterestResponse>(`/events/seminars/${card.id}/interest`, {}, token);
      setCard(data.card);
    } catch (err) {
      setInterestError(err instanceof Error ? err.message : "Could not update seminar interest.");
    } finally {
      setPendingInterest(false);
    }
  }

  return (
    <main className="public-persona-page public-seminars-page">
      <section className="public-persona-header">
        <div>
          <div className="public-persona-kicker">Seminars</div>
          <h1>{card?.title ?? "Public seminar readback"}</h1>
          <p>{publicSeminarDetailIntroCopy()}</p>
        </div>
        <Link href="/events/seminars">All seminars</Link>
      </section>

      <section className="public-persona-panel" aria-label="Seminar detail readback">
        {status === "loading" && <p className="public-persona-chat-state">Loading public readback...</p>}
        {status === "not-found" && (
          <p className="public-persona-preview-error">{error ?? publicSeminarDetailNotFoundCopy()}</p>
        )}
        {status === "unavailable" && (
          <p className="public-persona-preview-error">{error ?? publicSeminarDetailUnavailableCopy()}</p>
        )}
        {status === "ready" && card && (
          <SeminarDetail
            card={card}
            interestError={interestError}
            onToggleInterest={handleInterestToggle}
            pendingInterest={pendingInterest}
            signedIn={Boolean(token)}
          />
        )}
      </section>
    </main>
  );
}

function SeminarDetail({
  card,
  interestError,
  onToggleInterest,
  pendingInterest,
  signedIn,
}: {
  card: PublicSeminarCard;
  interestError: string | null;
  onToggleInterest: () => void;
  pendingInterest: boolean;
  signedIn: boolean;
}) {
  const sourceHref = publicSeminarCardHref(card);
  const discussionHref = publicSeminarDiscussionHref(card);
  const spaceHref = publicSeminarSpaceHref(card);
  const scheduleLabel = publicSeminarScheduleLabel(card);

  return (
    <article className="public-seminar-card public-seminar-detail">
      <div className="public-seminar-card-body">
        <span>{card.label || publicSeminarSourceLabel(card.sourceType)}</span>
        <strong>{card.title}</strong>
        <small>{scheduleLabel ?? publicSeminarMissingScheduleCopy()}</small>
        <time dateTime={card.publishedAt ?? card.featuredAt}>
          {publicSeminarDateLabel(card.publishedAt ?? card.featuredAt)}
        </time>
        {card.description && <em>{card.description}</em>}
        {card.space && <small>{card.space.title}</small>}
      </div>

      <div className="public-seminar-links" aria-label="Public seminar links">
        {sourceHref && <Link href={sourceHref}>Source</Link>}
        {spaceHref && <Link href={spaceHref}>Space</Link>}
        {discussionHref && <Link href={discussionHref}>Discussion</Link>}
      </div>

      <p className="public-persona-chat-state">{publicSeminarInterestSafetyCopy()}</p>
      {interestError && <p className="public-persona-preview-error">{interestError}</p>}

      <div className="public-seminar-interest">
        <span>{publicSeminarInterestCountLabel(card.interestCount)}</span>
        {signedIn ? (
          <>
            <button
              className="button"
              disabled={pendingInterest}
              onClick={onToggleInterest}
              type="button"
            >
              {pendingInterest ? "Updating..." : publicSeminarInterestActionLabel(card)}
            </button>
            <small>{publicSeminarViewerInterestCopy(card.viewerInterested)}</small>
          </>
        ) : (
          <>
            <Link href="/login">{publicSeminarSignInPromptCopy()}</Link>
            <small>Names are not shown; saved interest contributes only to the aggregate count.</small>
          </>
        )}
      </div>
    </article>
  );
}
