"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { PublicProjectProfileResponse } from "@station/types";
import { apiGet } from "@/lib/api-client";
import {
  publicProjectDeveloperSpaceCountLabel,
  publicProjectEmptyDeveloperSpacesCopy,
  publicProjectProfileCopy,
} from "@/lib/public-project-profile";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function visualisationLabel(value: string) {
  return value.replace("_", " ");
}

export default function PublicProjectProfilePage() {
  const { slug } = useParams<{ slug: string }>();
  const [profile, setProfile] = useState<PublicProjectProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    async function loadProject() {
      setLoading(true);
      setError(null);
      try {
        const data = await apiGet<PublicProjectProfileResponse>(`/projects/public/${encodeURIComponent(slug)}`);
        if (!cancelled) setProfile(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Public Project not found.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProject();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <main className="station-page">
        <div className="station-page-inner">
          <div className="station-panel" style={{ textAlign: "center", padding: "3rem", color: "#687078" }}>
            Loading Project...
          </div>
        </div>
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main className="station-page">
        <div className="station-page-inner station-page-inner-narrow">
          <div className="station-notice" data-tone="error">
            {error ?? "Public Project not found."}
          </div>
          <Link href="/projects" className="station-muted-button" style={{ marginTop: "1rem" }}>
            Projects
          </Link>
        </div>
      </main>
    );
  }

  const { project, developerSpaces } = profile;

  return (
    <main className="station-page">
      <div className="station-page-inner station-grid">
        <header className="station-page-header">
          <div>
            <div className="station-eyebrow">Public Project</div>
            <h1 className="station-page-title" style={{ overflowWrap: "anywhere" }}>{project.name}</h1>
            <p className="station-page-lede">
              {project.description || publicProjectProfileCopy()}
            </p>
          </div>
          <span className="station-status-pill">Public</span>
        </header>

        <section className="station-grid station-grid-2">
          <div className="station-panel" style={{ display: "grid", gap: "0.9rem" }}>
            <p style={{ margin: 0, color: "#687078", fontSize: "0.92rem", lineHeight: 1.5 }}>
              {publicProjectProfileCopy()}
            </p>
            <dl className="fact-grid compact" style={{ margin: 0 }}>
              <div>
                <dt>Slug</dt>
                <dd>{project.slug}</dd>
              </div>
              <div>
                <dt>Created</dt>
                <dd>{formatDate(project.createdAt)}</dd>
              </div>
              <div>
                <dt>Updated</dt>
                <dd>{formatDate(project.updatedAt)}</dd>
              </div>
            </dl>
          </div>

          <div className="station-panel" style={{ display: "grid", gap: "0.65rem" }}>
            <h2 style={{ margin: 0, fontSize: "1.1rem" }}>Public Developer Spaces</h2>
            <span className="station-status-pill" style={{ width: "fit-content" }}>
              {publicProjectDeveloperSpaceCountLabel(project.publicDeveloperSpaceCount)}
            </span>
          </div>
        </section>

        <section style={{ display: "grid", gap: "0.75rem" }} aria-label="Public Developer Spaces">
          {developerSpaces.length === 0 ? (
            <div className="station-panel" style={{ textAlign: "center", padding: "2rem 1.5rem", color: "#687078" }}>
              {publicProjectEmptyDeveloperSpacesCopy()}
            </div>
          ) : developerSpaces.map((space) => (
            <article key={space.slug} className="station-card" style={{ display: "grid", gap: "0.75rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", alignItems: "flex-start" }}>
                <div style={{ minWidth: 0 }}>
                  <h2 style={{ margin: "0 0 0.25rem", fontSize: "1.05rem", overflowWrap: "anywhere" }}>{space.projectName}</h2>
                  <p style={{ margin: 0, color: "#687078", fontSize: "0.88rem", lineHeight: 1.5 }}>
                    {space.description || "Public observatory."}
                  </p>
                </div>
                <span className="pill">Public</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", color: "#687078", fontSize: "0.8rem" }}>
                <span>{visualisationLabel(space.visualisationType)}</span>
                <span>/</span>
                <span>updated {formatDate(space.updatedAt)}</span>
              </div>
              <div className="station-action-row">
                <Link className="station-muted-button" href={space.href}>Open observatory</Link>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
