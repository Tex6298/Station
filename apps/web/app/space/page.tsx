"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { SpacePresentationConfig } from "@station/config/space-presentation";
import { getSession } from "@/lib/auth";
import { apiGet } from "@/lib/api-client";

interface SpaceSummary {
  id: string;
  slug: string;
  title: string;
  short_description: string | null;
  is_public: boolean;
  created_at: string;
  presentation: SpacePresentationConfig;
}

export default function MySpacesPage() {
  const [spaces, setSpaces]   = useState<SpaceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    getSession().then(async (session) => {
      if (!session) { setLoading(false); return; }
      try {
        const data = await apiGet<{ spaces: SpaceSummary[] }>("/spaces", session.access_token);
        setSpaces(data.spaces ?? []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not load spaces.");
      } finally {
        setLoading(false);
      }
    });
  }, []);

  return (
    <main className="station-page">
      <div className="station-page-inner">
      <header className="station-page-header">
        <div>
          <div className="station-eyebrow">Public presence</div>
          <h1 className="station-page-title">My Spaces</h1>
          <p className="station-page-lede">
            Your public pages - the face you show the world.
          </p>
        </div>
        <Link href="/space/new" className="station-link-button">
          New Space
        </Link>
      </header>

      {loading && <div className="station-panel" style={{ color: "#687078", textAlign: "center", padding: "3rem" }}>Loading...</div>}
      {error   && <div className="station-notice" data-tone="error">{error}</div>}

      {!loading && !error && spaces.length === 0 && (
        <div className="station-panel" style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <div className="kicker" style={{ justifyContent: "center", marginBottom: "0.75rem" }}>Public home</div>
          <h2 style={{ margin: "0 0 0.5rem" }}>No Spaces yet</h2>
          <p style={{ color: "#687078", margin: "0 0 1.5rem", fontSize: "0.9rem" }}>
            A Space is your public home - part website, part Substack, part MySpace.
            Requires the Creator tier or above.
          </p>
          <Link href="/space/new" className="station-link-button">
            Create your first Space
          </Link>
        </div>
      )}

      {!loading && spaces.length > 0 && (
        <div style={{ display: "grid", gap: "0.75rem", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
          {spaces.map((s) => (
            <article key={s.id} className="station-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                <h2 style={{ margin: 0, fontSize: "1rem" }}>{s.title}</h2>
                <span style={{
                  fontSize: "0.68rem", padding: "0.1rem 0.45rem", borderRadius: 999,
                  background: s.is_public ? "#e9f5ee" : "#eeedfe",
                  border: "1px solid " + (s.is_public ? "rgba(59, 143, 99, 0.35)" : "#d8d3c8"),
                  color: s.is_public ? "#25633f" : "#534ab7",
                }}>
                  {s.is_public ? "public" : "private"}
                </span>
              </div>
              {s.short_description && (
                <p style={{ margin: "0 0 0.75rem", color: "#687078", fontSize: "0.85rem" }}>{s.short_description}</p>
              )}
              <div style={{ fontSize: "0.72rem", color: "#8b8f92", marginBottom: "0.75rem", textTransform: "capitalize" }}>
                {s.presentation.theme} / {s.presentation.layout}
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <Link href={"/space/" + s.slug} className="station-muted-button">View</Link>
                <Link href={"/space/" + s.slug + "/manage"} className="station-muted-button">Edit</Link>
                <Link href={"/space/" + s.slug + "/documents/new"} className="station-muted-button">New post</Link>
              </div>
            </article>
          ))}
        </div>
      )}
      </div>
    </main>
  );
}
