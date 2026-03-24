"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { apiGet } from "@/lib/api-client";
import type { PersonaSummary } from "@station/types/persona";

const PROVIDER_LABELS: Record<string, string> = {
  platform:  "Station",
  openai:    "OpenAI",
  anthropic: "Anthropic",
  deepseek:  "DeepSeek",
  gemini:    "Gemini",
};

export default function StudioPage() {
  const [personas, setPersonas] = useState<PersonaSummary[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    getSession().then(async (session) => {
      if (!session) { setLoading(false); return; }
      try {
        const data = await apiGet<{ personas: PersonaSummary[] }>("/personas", session.access_token);
        setPersonas(data.personas ?? []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not load personas.");
      } finally {
        setLoading(false);
      }
    });
  }, []);

  return (
    <main className="container">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ margin: 0 }}>Studio</h1>
          <p style={{ margin: "0.25rem 0 0", color: "#666", fontSize: "0.875rem" }}>
            Your private space. Kindle and tend your personas here.
          </p>
        </div>
        <Link
          href="/studio/new"
          className="button primary"
          style={{ textDecoration: "none", whiteSpace: "nowrap" }}
        >
          + New persona
        </Link>
      </div>

      {loading && (
        <div className="card" style={{ color: "#555", textAlign: "center", padding: "3rem" }}>
          Loading your personas…
        </div>
      )}

      {error && (
        <div className="card" style={{ background: "#2d1515", borderColor: "#7d2e2e", color: "#eb5757" }}>
          {error}
        </div>
      )}

      {!loading && !error && personas.length === 0 && (
        <div className="card" style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>◎</div>
          <h2 style={{ margin: "0 0 0.5rem" }}>No personas yet</h2>
          <p style={{ color: "#666", margin: "0 0 1.5rem", fontSize: "0.9rem" }}>
            Begin the awakening flow to bring your first persona through.
          </p>
          <Link href="/studio/new" className="button primary" style={{ textDecoration: "none" }}>
            Kindle your first persona
          </Link>
        </div>
      )}

      {!loading && personas.length > 0 && (
        <div style={{ display: "grid", gap: "0.75rem", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
          {personas.map((p) => (
            <Link
              key={p.id}
              href={`/studio/personas/${p.id}`}
              style={{ textDecoration: "none" }}
            >
              <div
                className="card"
                style={{
                  cursor: "pointer",
                  transition: "border-color 0.15s",
                  height: "100%",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <strong style={{ fontSize: "1rem" }}>{p.name}</strong>
                  <div style={{ display: "flex", gap: "0.3rem" }}>
                    <span style={{
                      fontSize: "0.68rem",
                      padding: "0.1rem 0.45rem",
                      borderRadius: 999,
                      background: p.visibility === "public" ? "#0f2d1a" : "#1a1a2e",
                      border: `1px solid ${p.visibility === "public" ? "#2e7d4f" : "#2a2a5a"}`,
                      color: p.visibility === "public" ? "#6fcf97" : "#7c6af7",
                    }}>
                      {p.visibility}
                    </span>
                    <span style={{
                      fontSize: "0.68rem",
                      padding: "0.1rem 0.45rem",
                      borderRadius: 999,
                      background: "#111827",
                      border: "1px solid #1f2937",
                      color: "#6b7280",
                    }}>
                      {PROVIDER_LABELS[p.provider] ?? p.provider}
                    </span>
                  </div>
                </div>
                <p style={{ margin: 0, color: "#666", fontSize: "0.85rem", lineHeight: 1.5 }}>
                  {p.shortDescription || <span style={{ fontStyle: "italic" }}>No description yet.</span>}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
