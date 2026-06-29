"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { PublicSeminarCard, PublicSeminarsResponse } from "@station/types";
import { apiGet } from "@/lib/api-client";
import {
  publicSeminarCardHref,
  publicSeminarDateLabel,
  publicSeminarDiscussionHref,
  publicSeminarSourceLabel,
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

  useEffect(() => {
    let cancelled = false;

    async function loadSeminars() {
      setStatus("loading");
      setError(null);
      try {
        const data = await apiGet<PublicSeminarsResponse>("/events/seminars");
        if (cancelled) return;
        setCards(data.cards);
        setStatus(data.cards.length > 0 ? "ready" : "empty");
      } catch (err) {
        if (cancelled) return;
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

        {status === "loading" && <p className="public-persona-chat-state">Loading public readbacks...</p>}
        {status === "empty" && <p className="public-persona-chat-state">{publicSeminarsEmptyCopy()}</p>}
        {status === "unavailable" && (
          <p className="public-persona-preview-error">{error ?? publicSeminarsUnavailableCopy()}</p>
        )}

        {status === "ready" && (
          <div className="public-persona-update-list">
            {cards.map((card) => (
              <SeminarCard card={card} key={card.id} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function SeminarCard({ card }: { card: PublicSeminarCard }) {
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
    <article>
      {href ? <Link href={href}>{content}</Link> : <div>{content}</div>}
      {discussionHref && <Link href={discussionHref}>Discussion</Link>}
    </article>
  );
}
