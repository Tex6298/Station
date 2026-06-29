"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { PublicSeminarCard, PublicSeminarInterestResponse, PublicSeminarsResponse } from "@station/types";
import { apiDelete, apiGet, apiPost } from "@/lib/api-client";
import { getSession } from "@/lib/auth";
import {
  publicSeminarCardHref,
  publicSeminarDateLabel,
  publicSeminarDiscussionHref,
  publicSeminarInterestActionLabel,
  publicSeminarInterestCountLabel,
  publicSeminarInterestSafetyCopy,
  publicSeminarSignInPromptCopy,
  publicSeminarSourceLabel,
  publicSeminarViewerInterestCopy,
  publicSeminarsEmptyCopy,
  publicSeminarsIntroCopy,
  publicSeminarsStatusCopy,
  publicSeminarsUnavailableCopy,
  type SeminarRouteStatus,
} from "@/lib/live-events-route";

export default function PublicSeminarsPage() {
  const [cards, setCards] = useState<PublicSeminarCard[]>([]);
  const [status, setStatus] = useState<SeminarRouteStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [pendingInterestId, setPendingInterestId] = useState<string | null>(null);
  const [interestError, setInterestError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSeminars() {
      setStatus("loading");
      setError(null);
      setInterestError(null);
      try {
        const session = await getSession();
        const accessToken = session?.access_token ?? null;
        const data = await apiGet<PublicSeminarsResponse>("/events/seminars", accessToken ?? undefined);
        if (cancelled) return;
        setToken(accessToken);
        setCards(data.cards);
        setStatus(data.cards.length > 0 ? "ready" : "empty");
      } catch (err) {
        if (cancelled) return;
        setToken(null);
        setCards([]);
        setStatus("unavailable");
        setError(err instanceof Error ? err.message : publicSeminarsUnavailableCopy());
      }
    }

    void loadSeminars();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleInterestToggle(card: PublicSeminarCard) {
    if (!token || pendingInterestId) return;
    setPendingInterestId(card.id);
    setInterestError(null);

    try {
      const data = card.viewerInterested
        ? await apiDelete<PublicSeminarInterestResponse>(`/events/seminars/${card.id}/interest`, token)
        : await apiPost<PublicSeminarInterestResponse>(`/events/seminars/${card.id}/interest`, {}, token);

      setCards((current) => current.map((item) => item.id === data.card.id ? data.card : item));
    } catch (err) {
      setInterestError(err instanceof Error ? err.message : "Could not update seminar interest.");
    } finally {
      setPendingInterestId(null);
    }
  }

  return (
    <main className="public-persona-page public-seminars-page">
      <section className="public-persona-header">
        <div>
          <div className="public-persona-kicker">Live Events</div>
          <h1>Seminars</h1>
          <p>{publicSeminarsIntroCopy()}</p>
        </div>
      </section>

      <section className="public-persona-panel" aria-label="Seminar readbacks">
        <div>
          <span>Public readbacks</span>
          <strong>{publicSeminarsStatusCopy(status)}</strong>
        </div>
        <p className="public-persona-chat-state">{publicSeminarInterestSafetyCopy()}</p>

        {status === "loading" && <p className="public-persona-chat-state">Loading public readbacks...</p>}
        {status === "empty" && <p className="public-persona-chat-state">{publicSeminarsEmptyCopy()}</p>}
        {status === "unavailable" && (
          <p className="public-persona-preview-error">{error ?? publicSeminarsUnavailableCopy()}</p>
        )}
        {interestError && <p className="public-persona-preview-error">{interestError}</p>}

        {status === "ready" && (
          <div className="public-persona-update-list">
            {cards.map((card) => (
              <SeminarCard
                card={card}
                key={card.id}
                onToggleInterest={handleInterestToggle}
                pending={pendingInterestId === card.id}
                signedIn={Boolean(token)}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function SeminarCard({
  card,
  onToggleInterest,
  pending,
  signedIn,
}: {
  card: PublicSeminarCard;
  onToggleInterest: (card: PublicSeminarCard) => void;
  pending: boolean;
  signedIn: boolean;
}) {
  const href = publicSeminarCardHref(card);
  const discussionHref = publicSeminarDiscussionHref(card);
  const content = (
    <>
      <span>{card.label || publicSeminarSourceLabel(card.sourceType)}</span>
      <strong>{card.title}</strong>
      <time dateTime={card.publishedAt ?? card.featuredAt}>
        {publicSeminarDateLabel(card.publishedAt ?? card.featuredAt)}
      </time>
      {card.description && <em>{card.description}</em>}
      {card.space && <small>{card.space.title}</small>}
    </>
  );

  return (
    <article className="public-seminar-card">
      {href ? <Link href={href}>{content}</Link> : <div className="public-seminar-card-body">{content}</div>}
      {discussionHref && <Link href={discussionHref}>Discussion</Link>}
      <div className="public-seminar-interest">
        <span>{publicSeminarInterestCountLabel(card.interestCount)}</span>
        {signedIn ? (
          <>
            <button
              className="button"
              disabled={pending}
              onClick={() => onToggleInterest(card)}
              type="button"
            >
              {pending ? "Updating..." : publicSeminarInterestActionLabel(card)}
            </button>
            <small>{publicSeminarViewerInterestCopy(card.viewerInterested)}</small>
          </>
        ) : (
          <>
            <Link href="/login">{publicSeminarSignInPromptCopy()}</Link>
            <small>Saved interest is visible only to your signed-in session.</small>
          </>
        )}
      </div>
    </article>
  );
}
