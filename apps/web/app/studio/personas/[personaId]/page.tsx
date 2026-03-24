"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getSession } from "@/lib/auth";
import { apiGet } from "@/lib/api-client";
import { PersonaChat } from "@/components/studio/persona-chat";
import type { Persona } from "@station/types/persona";

const NAV_TABS = [
  { label: "Chat",        href: (id: string) => `/studio/personas/${id}` },
  { label: "Memory",      href: (id: string) => `/studio/personas/${id}/memory` },
  { label: "Canon",       href: (id: string) => `/studio/personas/${id}/canon` },
  { label: "Files",       href: (id: string) => `/studio/personas/${id}/files` },
  { label: "Calibration", href: (id: string) => `/studio/personas/${id}/calibration` },
] as const;

const PROVIDER_LABELS: Record<string, string> = {
  platform:  "Station AI",
  openai:    "OpenAI",
  anthropic: "Anthropic",
  deepseek:  "DeepSeek",
  gemini:    "Gemini",
};

export default function PersonaPage() {
  const { personaId } = useParams<{ personaId: string }>();
  const [persona, setPersona] = useState<Persona | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    if (!personaId) return;
    getSession().then(async (session) => {
      if (!session) { setLoading(false); return; }
      try {
        const data = await apiGet<{ persona: Persona }>(`/personas/${personaId}`, session.access_token);
        setPersona(data.persona);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not load persona.");
      } finally {
        setLoading(false);
      }
    });
  }, [personaId]);

  if (loading) {
    return (
      <main className="container">
        <div className="card" style={{ textAlign: "center", padding: "3rem", color: "#555" }}>
          Loading…
        </div>
      </main>
    );
  }

  if (error || !persona) {
    return (
      <main className="container">
        <div className="card" style={{ background: "#2d1515", borderColor: "#7d2e2e", color: "#eb5757" }}>
          {error ?? "Persona not found."}
        </div>
      </main>
    );
  }

  return (
    <main className="container" style={{ maxWidth: 900 }}>

      {/* Breadcrumb */}
      <div style={{ fontSize: "0.8rem", color: "#555", marginBottom: "1rem" }}>
        <Link href="/studio" style={{ color: "#666" }}>Studio</Link>
        <span style={{ margin: "0 0.4rem" }}>›</span>
        <span style={{ color: "#aaa" }}>{persona.name}</span>
      </div>

      {/* Persona header */}
      <div style={{ marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
          <div>
            <h1 style={{ margin: "0 0 0.25rem", fontSize: "1.6rem" }}>{persona.name}</h1>
            {persona.shortDescription && (
              <p style={{ margin: 0, color: "#888", fontSize: "0.9rem" }}>{persona.shortDescription}</p>
            )}
          </div>
          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", alignItems: "center" }}>
            <span style={{
              fontSize: "0.72rem",
              padding: "0.15rem 0.5rem",
              borderRadius: 999,
              background: persona.visibility === "public" ? "#0f2d1a" : "#1a1a2e",
              border: `1px solid ${persona.visibility === "public" ? "#2e7d4f" : "#2a2a5a"}`,
              color: persona.visibility === "public" ? "#6fcf97" : "#7c6af7",
            }}>
              {persona.visibility}
            </span>
            <span style={{
              fontSize: "0.72rem",
              padding: "0.15rem 0.5rem",
              borderRadius: 999,
              background: "#111827",
              border: "1px solid #1f2937",
              color: "#6b7280",
            }}>
              {PROVIDER_LABELS[persona.provider] ?? persona.provider}
            </span>
            <Link
              href={`/studio/personas/${personaId}/edit`}
              style={{
                fontSize: "0.75rem",
                padding: "0.2rem 0.65rem",
                border: "1px solid #334155",
                borderRadius: 6,
                color: "#888",
                textDecoration: "none",
              }}
            >
              Edit
            </Link>
          </div>
        </div>
      </div>

      {/* Tab nav */}
      <div style={{
        display: "flex",
        gap: "0.25rem",
        borderBottom: "1px solid #1e2535",
        marginBottom: "1.25rem",
      }}>
        {NAV_TABS.map((tab) => {
          const href = tab.href(personaId);
          const isActive = typeof window !== "undefined" && window.location.pathname === href;
          return (
            <Link
              key={tab.label}
              href={href}
              style={{
                padding: "0.5rem 0.85rem",
                fontSize: "0.85rem",
                borderBottom: isActive ? "2px solid #7c6af7" : "2px solid transparent",
                color: isActive ? "#c4b5fd" : "#666",
                textDecoration: "none",
                transition: "color 0.15s",
              }}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* Chat */}
      <PersonaChat personaId={personaId} personaName={persona.name} />

      {/* Awakening prompt (collapsed) */}
      {persona.awakeningPrompt && (
        <details className="card" style={{ marginTop: "1rem", cursor: "pointer" }}>
          <summary style={{ fontSize: "0.8rem", color: "#555", userSelect: "none" }}>
            View awakening prompt
          </summary>
          <pre style={{
            marginTop: "0.75rem",
            fontSize: "0.8rem",
            color: "#888",
            whiteSpace: "pre-wrap",
            lineHeight: 1.6,
            fontFamily: "inherit",
          }}>
            {persona.awakeningPrompt}
          </pre>
        </details>
      )}
    </main>
  );
}
