"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ApiRequestError, apiGet } from "@/lib/api-client";
import {
  personaEncounterPublicExhibitListPath,
  type PersonaEncounterPublicExhibitListItem,
  type PersonaEncounterPublicExhibitListResponse,
} from "@/lib/persona-encounter-runtime";

const PUBLIC_ENCOUNTER_INDEX_LIMIT = 12;

export default function PublicEncounterExhibitIndexPage() {
  const [exhibits, setExhibits] = useState<PersonaEncounterPublicExhibitListItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);
    apiGet<PersonaEncounterPublicExhibitListResponse>(
      personaEncounterPublicExhibitListPath({ limit: PUBLIC_ENCOUNTER_INDEX_LIMIT }),
    )
      .then((response) => {
        if (cancelled) return;
        setExhibits(response.exhibits);
        setNextCursor(response.pagination.nextCursor);
      })
      .catch((caught) => {
        if (cancelled) return;
        setError(publicEncounterIndexError(caught));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function loadMore() {
    if (!nextCursor) return;
    setLoadingMore(true);
    setError(null);

    try {
      const response = await apiGet<PersonaEncounterPublicExhibitListResponse>(
        personaEncounterPublicExhibitListPath({
          limit: PUBLIC_ENCOUNTER_INDEX_LIMIT,
          cursor: nextCursor,
        }),
      );
      setExhibits((current) => [...current, ...response.exhibits]);
      setNextCursor(response.pagination.nextCursor);
    } catch (caught) {
      setError(publicEncounterIndexError(caught));
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <main className="station-page public-encounter-page public-encounter-index-page">
      <section className="station-page-inner">
        <header className="station-page-header public-encounter-index-header">
          <div>
            <div className="station-eyebrow">Public encounter exhibits</div>
            <h1 className="station-page-title">Encounters</h1>
            <p className="station-page-lede">
              Owner-curated public metadata from same-owner persona encounters.
            </p>
          </div>
        </header>

        {loading ? (
          <section className="station-panel public-encounter-index-empty" aria-live="polite">
            <p>Loading public encounter exhibits.</p>
          </section>
        ) : error && exhibits.length === 0 ? (
          <section className="station-panel public-encounter-index-empty" aria-live="polite">
            <p>{error}</p>
          </section>
        ) : exhibits.length === 0 ? (
          <section className="station-panel public-encounter-index-empty">
            <p>No public encounter exhibits are available yet.</p>
          </section>
        ) : (
          <>
            <section className="public-encounter-index-grid" aria-label="Public encounter exhibits">
              {exhibits.map((exhibit) => (
                <article className="station-panel public-encounter-card" key={exhibit.slug}>
                  <div className="public-encounter-card-main">
                    <span>{exhibit.provenance.label}</span>
                    <h2>{exhibit.title}</h2>
                    <p>{exhibit.summary}</p>
                  </div>

                  <div className="public-encounter-card-personas">
                    <span>{exhibit.personas.label}</span>
                    <strong>{exhibit.personas.initiatorName} / {exhibit.personas.responderName}</strong>
                  </div>

                  <div className="public-encounter-tags">
                    {exhibit.tags.length > 0 ? exhibit.tags.map((tag) => (
                      <span key={`${exhibit.slug}-${tag}`}>{tag}</span>
                    )) : <span>metadata-only</span>}
                  </div>

                  <footer className="public-encounter-card-footer">
                    <time dateTime={exhibit.publishedAt}>{formatPublicEncounterDate(exhibit.publishedAt)}</time>
                    <Link className="station-muted-button" href={exhibit.routeHref}>
                      Open exhibit
                    </Link>
                  </footer>
                </article>
              ))}
            </section>

            {nextCursor && (
              <div className="public-encounter-index-actions">
                <button
                  className="station-muted-button"
                  type="button"
                  disabled={loadingMore}
                  onClick={() => void loadMore()}
                >
                  {loadingMore ? "Loading..." : "Load more"}
                </button>
              </div>
            )}

            {error && <p className="station-notice" data-tone="error">{error}</p>}
          </>
        )}
      </section>
    </main>
  );
}

function publicEncounterIndexError(caught: unknown) {
  if (caught instanceof ApiRequestError && caught.status === 400) {
    return "Public encounter exhibit page could not be continued.";
  }
  return caught instanceof Error ? caught.message : "Public encounter exhibits could not be loaded.";
}

function formatPublicEncounterDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
