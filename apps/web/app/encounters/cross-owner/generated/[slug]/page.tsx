"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ApiRequestError, apiGet, apiPost } from "@/lib/api-client";
import { getSession } from "@/lib/auth";
import {
  personaEncounterCrossOwnerGeneratedPublicationPath,
  personaEncounterCrossOwnerGeneratedPublicationReadback,
  personaEncounterCrossOwnerGeneratedPublicationReportPath,
  personaEncounterCrossOwnerGeneratedPublicationWebHref,
  type PersonaEncounterCrossOwnerGeneratedPublicationResponse,
} from "@/lib/persona-encounter-runtime";
import type { PersonaEncounterPublicExhibitReportResponse } from "@/lib/persona-encounter-runtime";

export default function CrossOwnerGeneratedPublicationPage() {
  const { slug } = useParams<{ slug: string }>();
  const [publication, setPublication] =
    useState<PersonaEncounterCrossOwnerGeneratedPublicationResponse["publication"] | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportState, setReportState] = useState<"idle" | "sending" | "sent" | "duplicate" | "error">("idle");
  const [reportError, setReportError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    setLoading(true);
    setError(null);
    setReportState("idle");
    setReportError(null);
    apiGet<PersonaEncounterCrossOwnerGeneratedPublicationResponse>(
      personaEncounterCrossOwnerGeneratedPublicationPath(slug),
    )
      .then((response) => {
        if (!cancelled) setPublication(response.publication);
      })
      .catch((caught) => {
        if (cancelled) return;
        setPublication(null);
        if (caught instanceof ApiRequestError && caught.status === 404) {
          setError("Cross-owner generated publication not found.");
        } else {
          setError(caught instanceof Error ? caught.message : "Cross-owner generated publication could not be loaded.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    getSession()
      .then((session) => {
        if (!cancelled) setToken(session?.access_token ?? null);
      })
      .finally(() => {
        if (!cancelled) setSessionChecked(true);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  async function reportPublication() {
    if (!token || !slug) return;
    setReportState("sending");
    setReportError(null);

    try {
      const response = await apiPost<PersonaEncounterPublicExhibitReportResponse>(
        personaEncounterCrossOwnerGeneratedPublicationReportPath(slug),
        {
          reason: "unsafe_cross_owner_generated_publication",
          notes: "Visitor reported the generated-material public detail.",
        },
        token,
      );
      setReportState(response.duplicate ? "duplicate" : "sent");
    } catch (caught) {
      setReportState("error");
      setReportError(caught instanceof Error ? caught.message : "Could not submit report.");
    }
  }

  if (loading) {
    return (
      <main className="station-page public-encounter-page">
        <section className="station-page-inner station-page-inner-narrow">
          <div className="station-panel">
            <p>Loading cross-owner generated publication.</p>
          </div>
        </section>
      </main>
    );
  }

  if (error || !publication) {
    return (
      <main className="station-page public-encounter-page">
        <section className="station-page-inner station-page-inner-narrow">
          <div className="station-panel">
            <p>{error ?? "Cross-owner generated publication not found."}</p>
            <Link className="station-muted-button" href="/encounters/cross-owner">Browse cross-owner exhibits</Link>
          </div>
        </section>
      </main>
    );
  }

  const href = personaEncounterCrossOwnerGeneratedPublicationWebHref(publication.slug);
  const readback = personaEncounterCrossOwnerGeneratedPublicationReadback(publication);

  return (
    <main className="station-page public-encounter-page">
      <section className="station-page-inner station-page-inner-narrow">
        <header className="station-page-header public-encounter-header">
          <div>
            <div className="station-eyebrow">Cross-owner generated material</div>
            <h1 className="station-page-title">{publication.title}</h1>
            <p className="station-page-lede">
              {publication.participants.requester.personaName} / {publication.participants.counterparty.personaName}
            </p>
          </div>
          <span className="station-status-pill">{publication.status}</span>
        </header>

        <article className="station-panel public-encounter-readback" aria-label="Generated publication body">
          {publication.excerpt && <p>{publication.excerpt}</p>}
          <div className="public-encounter-body">
            {(publication.body ?? "").split(/\n{2,}/).map((paragraph, index) => (
              <p key={`${publication.slug}-body-${index}`}>{paragraph}</p>
            ))}
          </div>
        </article>

        <section className="station-panel public-encounter-provenance" aria-label="Generated publication provenance">
          <div>
            <span>{publication.provenance.label}</span>
            <strong>{publication.provenance.source}</strong>
          </div>
          <p>{publication.provenance.note}</p>
          <ul className="station-compact-list">
            {readback.map((item) => <li key={item}>{item}</li>)}
          </ul>
          <time dateTime={publication.publishedAt}>Published {formatGeneratedPublicationDate(publication.publishedAt)}</time>
        </section>

        <section className="station-panel public-encounter-actions" aria-label="Report generated publication">
          <div>
            <span>Report</span>
            <strong>Moderation available</strong>
          </div>
          {!sessionChecked ? (
            <p>Checking session.</p>
          ) : token ? (
            <button
              className="station-muted-button"
              type="button"
              disabled={reportState === "sending"}
              onClick={() => void reportPublication()}
            >
              {reportState === "sending" ? "Reporting..." : "Report publication"}
            </button>
          ) : (
            <Link className="station-muted-button" href={`/login?redirect=${encodeURIComponent(href)}`}>
              Sign in to report
            </Link>
          )}
          {reportState === "sent" && <p className="station-notice" data-tone="success">Report submitted.</p>}
          {reportState === "duplicate" && <p className="station-notice" data-tone="success">Report already open.</p>}
          {reportState === "error" && <p className="station-notice" data-tone="error">{reportError}</p>}
        </section>
      </section>
    </main>
  );
}

function formatGeneratedPublicationDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "recently";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
