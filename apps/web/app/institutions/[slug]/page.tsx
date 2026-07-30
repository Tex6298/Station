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
    <main className="station-page public-institution-page">
      <header className="public-institution-identity">
        <div className="public-institution-identity-inner">
          <span className="public-institution-verified">Verified by Station</span>
          <h1>{data.institution.name}</h1>
          <p>{data.institution.summary ?? "A verified institution on Station."}</p>
        </div>
      </header>
      <section className="public-institution-footer-band">
        <div className="public-institution-footer-inner">
          <span>Station institution identity</span>
          <Link href="/institutions">Institution access</Link>
        </div>
      </section>
    </main>
  );
}
