"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getSession } from "@/lib/auth";
import { apiGet, apiPost } from "@/lib/api-client";
import { PublishContinuityButton } from "@/components/studio/publish-continuity-button";
import {
  PersonaWorkspaceHeader,
  type PersonaWithContinuity,
} from "@/components/studio/persona-workspace";

interface CanonItem {
  id: string;
  title: string | null;
  content: string;
  source_type: string;
  priority: number;
  created_at: string;
}

export default function PersonaCanonPage() {
  const { personaId } = useParams<{ personaId: string }>();
  const [token, setToken] = useState<string | null>(null);
  const [persona, setPersona] = useState<PersonaWithContinuity | null>(null);
  const [items, setItems] = useState<CanonItem[]>([]);
  const [form, setForm] = useState({ title: "", content: "", priority: 3 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!personaId) return;
    let cancelled = false;

    async function load() {
      try {
        const session = await getSession();
        if (!session) {
          setLoading(false);
          return;
        }
        setToken(session.access_token);
        const [personaData, canonData] = await Promise.all([
          apiGet<{ persona: PersonaWithContinuity }>(`/personas/${personaId}`, session.access_token),
          apiGet<{ canon: CanonItem[] }>(`/canon/persona/${personaId}`, session.access_token),
        ]);
        if (cancelled) return;
        setPersona(personaData.persona);
        setItems(canonData.canon ?? []);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not load canon.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [personaId]);

  async function createCanon(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !persona || !form.content.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const response = await apiPost<{ canonItem: CanonItem }>(
        `/canon/persona/${persona.id}`,
        {
          title: form.title || undefined,
          content: form.content,
          sourceType: "manual",
          priority: form.priority,
        },
        token
      );
      setItems((current) => [response.canonItem, ...current].sort((a, b) => b.priority - a.priority));
      setForm({ title: "", content: "", priority: 3 });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save canon.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <StudioMessage>Loading canon...</StudioMessage>;
  if (error && !persona) return <StudioMessage tone="error">{error}</StudioMessage>;
  if (!persona) return <StudioMessage tone="error">Persona not found.</StudioMessage>;

  return (
    <main className="container studio-workspace">
      <PersonaWorkspaceHeader persona={persona} />
      {error && <div className="space-form-error">{error}</div>}

      <section className="studio-two-column">
        <form className="studio-editor-panel" onSubmit={createCanon}>
          <div className="studio-section-heading">
            <div className="section-label">Canon</div>
            <h2>Promote stable truth</h2>
          </div>
          <input className="input" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Title" maxLength={200} />
          <textarea className="textarea" value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} placeholder="What should remain stable for this persona?" style={{ minHeight: 200 }} required />
          <label className="studio-range-field">
            <span>Priority {form.priority}</span>
            <input type="range" min={1} max={10} step={1} value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: Number(e.target.value) }))} />
          </label>
          <button className="button primary" type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Canon"}
          </button>
        </form>

        <section className="studio-list-panel">
          <div className="studio-section-heading">
            <div className="section-label">Canonical Rules</div>
            <h2>{items.length} items</h2>
          </div>
          <div className="studio-item-list">
            {items.length === 0 && <div className="studio-empty">No canon items yet.</div>}
            {items.map((item) => (
              <article key={item.id} className="studio-item-card">
                <div>
                  <span>Priority {item.priority}</span>
                  <time>{formatDate(item.created_at)}</time>
                </div>
                <h3>{item.title || "Untitled canon"}</h3>
                <p>{item.content}</p>
                <PublishContinuityButton
                  sourceType="canon"
                  sourceId={item.id}
                  defaultTitle={item.title || "Canon note"}
                />
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

function StudioMessage({ children, tone = "normal" }: { children: React.ReactNode; tone?: "normal" | "error" }) {
  return (
    <main className="container">
      <div className={tone === "error" ? "space-form-error" : "card"} style={{ textAlign: "center", padding: "3rem" }}>
        {children}
      </div>
    </main>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
