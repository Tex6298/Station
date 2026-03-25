"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { apiGet } from "@/lib/api-client";

interface SpaceSummary {
  id: string;
  slug: string;
  title: string;
  short_description: string | null;
  is_public: boolean;
  created_at: string;
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
    <main className="container">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ margin: 0 }}>My Spaces</h1>
          <p style={{ margin: "0.25rem 0 0", color: "#666", fontSize: "0.875rem" }}>
            Your public pages — the face you show the world.
          </p>
        </div>
        <Link href="/space/new" className="button primary" style={{ textDecoration: "none" }}>
          + New Space
        </Link>
      </div>

      {loading && <div className="card" style={{ color: "#555", textAlign: "center", padding: "3rem" }}>Loading…</div>}
      {error   && <div className="card" style={{ background: "#2d1515", borderColor: "#7d2e2e", color: "#eb5757" }}>{error}</div>}

      {!loading && !error && spaces.length === 0 && (
        <div className="card" style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>◫</div>
          <h2 style={{ margin: "0 0 0.5rem" }}>No Spaces yet</h2>
          <p style={{ color: "#666", margin: "0 0 1.5rem", fontSize: "0.9rem" }}>
            A Space is your public home — part website, part Substack, part MySpace.
            Requires the Keeper tier or above.
          </p>
          <Link href="/space/new" className="button primary" style={{ textDecoration: "none" }}>
            Create your first Space
          </Link>
        </div>
      )}

      {!loading && spaces.length > 0 && (
        <div style={{ display: "grid", gap: "0.75rem", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
          {spaces.map((s) => (
            <div key={s.id} className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                <h2 style={{ margin: 0, fontSize: "1rem" }}>{s.title}</h2>
                <span style={{
                  fontSize: "0.68rem", padding: "0.1rem 0.45rem", borderRadius: 999,
                  background: s.is_public ? "#0f2d1a" : "#1a1a2e",
                  border: "1px solid " + (s.is_public ? "#2e7d4f" : "#2a2a5a"),
                  color: s.is_public ? "#6fcf97" : "#7c6af7",
                }}>
                  {s.is_public ? "public" : "private"}
                </span>
              </div>
              {s.short_description && (
                <p style={{ margin: "0 0 0.75rem", color: "#666", fontSize: "0.85rem" }}>{s.short_description}</p>
              )}
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <Link href={"/space/" + s.slug} style={{ fontSize: "0.8rem", color: "#7c6af7", textDecoration: "none" }}>View →</Link>
                <Link href={"/space/" + s.slug + "/documents/new"} style={{ fontSize: "0.8rem", color: "#666", textDecoration: "none" }}>New post</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
