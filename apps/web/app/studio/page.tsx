"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { apiGet } from "@/lib/api-client";
import type { PersonaSummary } from "@station/types/persona";

const PROVIDER_LABELS: Record<string, string> = {
  platform: "Station",
  openai: "OpenAI",
  anthropic: "Anthropic",
  deepseek: "DeepSeek",
  gemini: "Gemini",
};

export default function StudioPage() {
  const [personas, setPersonas] = useState<PersonaSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSession().then(async (session) => {
      if (!session) {
        setLoading(false);
        return;
      }
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
    <main className="container studio-workspace">
      <section className="studio-persona-header">
        <div>
          <div className="studio-kicker">Studio</div>
          <h1>Private continuity home</h1>
          <p>
            Tend personas, preserve memory, promote canon, import archive material, and run integrity sessions before anything becomes public.
          </p>
        </div>
        <div className="studio-persona-tabs">
          <Link href="/studio/new" data-active="true">New Persona</Link>
          <Link href="/space">Public Spaces</Link>
          <Link href="/discover">Discover</Link>
        </div>
      </section>

      {loading && <div className="card" style={{ textAlign: "center", padding: "3rem", color: "#7f8aa0", marginTop: "1rem" }}>Loading your personas...</div>}
      {error && <div className="space-form-error" style={{ marginTop: "1rem" }}>{error}</div>}

      {!loading && !error && personas.length === 0 && (
        <section className="studio-editor-panel" style={{ marginTop: "1rem", textAlign: "center", padding: "4rem 2rem" }}>
          <div className="section-label">No personas yet</div>
          <h2 style={{ margin: "0.4rem 0 0.6rem" }}>Start the private layer</h2>
          <p style={{ margin: "0 auto 1.5rem", maxWidth: 560, color: "#94a3b8", lineHeight: 1.7 }}>
            The first persona creates the workspace where memory, canon, archive, and integrity sessions can begin to accumulate.
          </p>
          <Link href="/studio/new" className="button primary">Kindle your first persona</Link>
        </section>
      )}

      {!loading && personas.length > 0 && (
        <section className="studio-continuity-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))" }}>
          {personas.map((persona) => (
            <Link key={persona.id} href={`/studio/personas/${persona.id}`} className="studio-continuity-card">
              <span>{persona.visibility} / {PROVIDER_LABELS[persona.provider] ?? persona.provider}</span>
              <strong style={{ fontSize: "1.45rem" }}>{persona.name}</strong>
              <p>{persona.shortDescription || "No continuity brief yet."}</p>
            </Link>
          ))}
        </section>
      )}
    </main>
  );
}
