"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { PublicInstitutionPublicationResponse } from "@station/types";
import { apiGet } from "@/lib/api-client";
import { publicInstitutionPublicationPath } from "@/lib/institutions";

export default function PublicInstitutionPublicationPage() {
  const params = useParams<{ slug: string; publicationSlug: string }>();
  const institutionSlug = decodeURIComponent(String(params.slug ?? ""));
  const publicationSlug = decodeURIComponent(String(params.publicationSlug ?? ""));
  const [data, setData] = useState<PublicInstitutionPublicationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    apiGet<PublicInstitutionPublicationResponse>(publicInstitutionPublicationPath(institutionSlug, publicationSlug))
      .then((response) => { if (!cancelled) setData(response); })
      .catch(() => { if (!cancelled) setError("Institution publication not found."); });
    return () => { cancelled = true; };
  }, [institutionSlug, publicationSlug]);

  return (
    <main className="station-page institution-page">
      <article className="station-page-inner station-page-inner-narrow institution-stack">
        {error ? <div className="station-notice" data-tone="error">{error}</div> : null}
        {!data && !error ? <div className="station-notice">Loading publication...</div> : null}
        {data ? <>
          <header className="station-page-header">
            <div>
              <div className="station-eyebrow">{data.publication.documentType}</div>
              <h1 className="station-page-title institution-wrap">{data.publication.title}</h1>
              <p className="station-page-lede">{data.publication.summary}</p>
            </div>
          </header>
          <div className="station-panel institution-stack">
            <p>Created by {data.publication.creatorLabel}. Last edited by {data.publication.lastEditorLabel}.</p>
            <p><Link href={data.publication.institution.href}>{data.publication.institution.name}</Link> / <Link href={data.publication.project.href}>{data.publication.project.name}</Link></p>
            <div className="institution-publication-body">{data.publication.body}</div>
          </div>
        </> : null}
      </article>
    </main>
  );
}
