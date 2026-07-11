"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ApiRequestError, apiGet, apiPost } from "@/lib/api-client";
import { getSession } from "@/lib/auth";
import {
  personaEncounterPublicExhibitPath,
  personaEncounterPublicExhibitReportPath,
  personaEncounterPublicExhibitWebHref,
  type PersonaEncounterPublicExhibitPublicResponse,
  type PersonaEncounterPublicExhibitReportResponse,
} from "@/lib/persona-encounter-runtime";

export default function PublicEncounterExhibitPage() {
  const { slug } = useParams<{ slug: string }>();
  const [exhibit, setExhibit] = useState<PersonaEncounterPublicExhibitPublicResponse["exhibit"] | null>(null);
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
    apiGet<PersonaEncounterPublicExhibitPublicResponse>(personaEncounterPublicExhibitPath(slug))
      .then((response) => {
        if (!cancelled) setExhibit(response.exhibit);
      })
      .catch((caught) => {
        if (cancelled) return;
        setExhibit(null);
        if (caught instanceof ApiRequestError && caught.status === 404) {
          setError("Public encounter exhibit not found.");
        } else {
          setError(caught instanceof Error ? caught.message : "Public encounter exhibit could not be loaded.");
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

  async function reportExhibit() {
    if (!token || !slug) return;
    setReportState("sending");
    setReportError(null);

    try {
      const response = await apiPost<PersonaEncounterPublicExhibitReportResponse>(
        personaEncounterPublicExhibitReportPath(slug),
        {
          reason: "unsafe_public_encounter_exhibit",
          notes: "Visitor reported the metadata-only public encounter exhibit.",
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
            <p>Loading public encounter exhibit.</p>
          </div>
        </section>
      </main>
    );
  }

  if (error || !exhibit) {
    return (
      <main className="station-page public-encounter-page">
        <section className="station-page-inner station-page-inner-narrow">
          <div className="station-panel">
            <p>{error ?? "Public encounter exhibit not found."}</p>
            <Link className="station-muted-button" href="/encounters">Browse encounters</Link>
          </div>
        </section>
      </main>
    );
  }

  const href = personaEncounterPublicExhibitWebHref(exhibit.slug);

  return (
    <main className="station-page public-encounter-page">
      <section className="station-page-inner station-page-inner-narrow">
        <header className="station-page-header public-encounter-header">
          <div>
            <div className="station-eyebrow">Public encounter exhibit</div>
            <h1 className="station-page-title">{exhibit.title}</h1>
            <p className="station-page-lede">{exhibit.summary}</p>
          </div>
          <span className="station-status-pill">{exhibit.status}</span>
        </header>

        <section className="station-panel public-encounter-readback" aria-label="Public exhibit boundary">
          <div>
            <span>{exhibit.personas.label}</span>
            <strong>{exhibit.personas.initiatorName} / {exhibit.personas.responderName}</strong>
          </div>
          <p>{exhibit.provenance.note}</p>
          <div className="public-encounter-tags">
            {exhibit.tags.length > 0 ? exhibit.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            )) : <span>metadata-only</span>}
          </div>
        </section>

        <section className="station-panel public-encounter-provenance" aria-label="Public provenance">
          <div>
            <span>{exhibit.provenance.label}</span>
            <strong>{exhibit.provenance.source}</strong>
          </div>
          <p>Owner-curated public metadata, same-owner persona display snapshots, and report/takedown availability.</p>
          <time dateTime={exhibit.publishedAt}>Published {formatPublicEncounterDate(exhibit.publishedAt)}</time>
        </section>

        <section className="station-panel public-encounter-actions" aria-label="Report public exhibit">
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
              onClick={() => void reportExhibit()}
            >
              {reportState === "sending" ? "Reporting..." : "Report exhibit"}
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

function formatPublicEncounterDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "recently";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
