"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getSession } from "@/lib/auth";
import { apiGet, apiPost } from "@/lib/api-client";
import {
  PersonaWorkspaceHeader,
  type PersonaWithContinuity,
} from "@/components/studio/persona-workspace";

interface MemoryItem {
  id: string;
  title: string | null;
  content: string;
  summary: string | null;
  source_type: string;
  relevance_weight: number;
  created_at: string;
}

export default function PersonaMemoryPage() {
  const { personaId } = useParams<{ personaId: string }>();
  const [token, setToken] = useState<string | null>(null);
  const [persona, setPersona] = useState<PersonaWithContinuity | null>(null);
  const [items, setItems] = useState<MemoryItem[]>([]);
  const [form, setForm] = useState({ title: "", summary: "", content: "", relevanceWeight: 1.25 });
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
        const [personaData, memoryData] = await Promise.all([
          apiGet<{ persona: PersonaWithContinuity }>(`/personas/${personaId}`, session.access_token),
          apiGet<{ memory: MemoryItem[] }>(`/memory/persona/${personaId}`, session.access_token),
        ]);
        if (cancelled) return;
        setPersona(personaData.persona);
        setItems(memoryData.memory ?? []);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not load memory.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [personaId]);

  async function createMemory(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !persona || !form.content.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const response = await apiPost<{ memoryItem: MemoryItem }>(
        `/memory/persona/${persona.id}`,
        {
          title: form.title || undefined,
          summary: form.summary || undefined,
          content: form.content,
          sourceType: "manual",
          relevanceWeight: form.relevanceWeight,
        },
        token
      );
      setItems((current) => [response.memoryItem, ...current]);
      setForm({ title: "", summary: "", content: "", relevanceWeight: 1.25 });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save memory.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <StudioMessage>Loading memory...</StudioMessage>;
  if (error && !persona) return <StudioMessage tone="error">{error}</StudioMessage>;
  if (!persona) return <StudioMessage tone="error">Persona not found.</StudioMessage>;

  return (
    <main className="container studio-workspace">
      <PersonaWorkspaceHeader persona={persona} />
      {error && <div className="space-form-error">{error}</div>}

      <section className="studio-two-column">
        <form className="studio-editor-panel" onSubmit={createMemory}>
          <div className="studio-section-heading">
            <div className="section-label">Memory</div>
            <h2>Add recallable context</h2>
          </div>
          <input className="input" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Title" maxLength={200} />
          <input className="input" value={form.summary} onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))} placeholder="Short summary" maxLength={500} />
          <textarea className="textarea" value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} placeholder="What should this persona remember?" style={{ minHeight: 180 }} required />
          <label className="studio-range-field">
            <span>Weight {form.relevanceWeight.toFixed(2)}</span>
            <input type="range" min={0.1} max={5} step={0.05} value={form.relevanceWeight} onChange={(e) => setForm((f) => ({ ...f, relevanceWeight: Number(e.target.value) }))} />
          </label>
          <button className="button primary" type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Memory"}
          </button>
        </form>

        <section className="studio-list-panel">
          <div className="studio-section-heading">
            <div className="section-label">Saved Memory</div>
            <h2>{items.length} items</h2>
          </div>
          <div className="studio-item-list">
            {items.length === 0 && <div className="studio-empty">No memory items yet.</div>}
            {items.map((item) => (
              <article key={item.id} className="studio-item-card">
                <div>
                  <span>{item.source_type}</span>
                  <time>{formatDate(item.created_at)}</time>
                </div>
                <h3>{item.title || "Untitled memory"}</h3>
                <p>{item.summary || item.content}</p>
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
