"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { PublicInstitutionResponse } from "@station/types";
import { apiGet } from "@/lib/api-client";

export default function PublicInstitutionPage() {
  const params = useParams<{ slug: string }>();
  const slug = decodeURIComponent(String(params.slug ?? ""));
  const [data, setData] = useState<PublicInstitutionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    apiGet<PublicInstitutionResponse>(`/institutions/public/${encodeURIComponent(slug)}`)
      .then((response) => {
        if (!cancelled) setData(response);
      })
      .catch((loadError) => {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Institution not found.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <main className="station-page public-institution-page">
        <div className="station-page-inner institution-loading">Loading institution...</div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="station-page public-institution-page">
        <div className="station-page-inner station-page-inner-narrow institution-stack">
          <div className="station-notice" data-tone="error">{error ?? "Institution not found."}</div>
          <Link className="station-muted-button" href="/">Station home</Link>
        </div>
      </main>
    );
  }

  return (
    <main className={`station-page public-institution-page ${data.space ? `institution-accent-${data.space.accentKey}` : ""}`}>
      <header className="public-institution-identity public-institution-hero">
        <div className="public-institution-identity-inner">
          {data.space ? <div className="institution-space-mark">{data.space.markText}</div> : null}
          <span className="public-institution-verified">Verified by Station</span>
          <h1>{data.institution.name}</h1>
          <p className="public-institution-headline">{data.space?.headline ?? data.institution.summary ?? "A verified institution on Station."}</p>
          {data.space ? <p className="public-institution-about">{data.space.about}</p> : null}
        </div>
      </header>
      {data.space ? <>
        <section className="public-institution-content-band" aria-labelledby="institution-work-heading"><div className="public-institution-band-inner"><div className="institution-section-heading"><div><div className="station-eyebrow">Published work</div><h2 id="institution-work-heading">From {data.institution.name}</h2></div><span className="station-status-pill">{data.publications?.length??0}</span></div><div className="public-institution-list">{data.publications?.length?data.publications.map(item=><article key={item.slug} className="public-institution-list-item"><div><span>{item.documentType}</span><h3><Link href={item.href}>{item.title}</Link></h3><p>{item.summary}</p><small>Created by {item.creatorLabel} / {item.project.name}</small></div><Link href={item.href}>Read</Link></article>):<p>No published Institution work is available.</p>}</div></div></section>
        <section className="public-institution-content-band" data-tone="muted" aria-labelledby="institution-project-heading"><div className="public-institution-band-inner"><div className="institution-section-heading"><div><div className="station-eyebrow">Connections</div><h2 id="institution-project-heading">Institution Projects</h2></div><span className="station-status-pill">{data.projects?.length??0}</span></div><div className="public-institution-list">{data.projects?.length?data.projects.map(project=><article key={project.slug} className="public-institution-list-item"><div><span>{project.connectionTier.replaceAll("_"," ")}</span><h3><Link href={project.href}>{project.name}</Link></h3>{project.description?<p>{project.description}</p>:null}</div><Link href={project.href}>Open</Link></article>):<p>No public Institution Projects are available.</p>}</div></div></section>
      </>:null}
      <section className="public-institution-footer-band">
        <div className="public-institution-footer-inner">
          <span>Station institution identity</span>
          <Link href="/institutions">Institution access</Link>
        </div>
      </section>
    </main>
  );
}
