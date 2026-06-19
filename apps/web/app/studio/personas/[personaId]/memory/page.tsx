"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getSession } from "@/lib/auth";
import { apiGet, apiPatch, apiPost } from "@/lib/api-client";
import {
  memoryLifecycleActions,
  memoryLifecycleCounters,
  memoryLifecycleDisplayStatus,
  memoryLifecycleStatusLabel,
  memoryRuntimeCopy,
} from "@/lib/memory-lifecycle-ui";
import type { MemoryItemLifecycle, OwnerMemoryBlock, PersonaMemoryBriefing } from "@station/types/persona";
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
  lifecycle?: MemoryItemLifecycle | null;
}

export default function PersonaMemoryPage() {
  const { personaId } = useParams<{ personaId: string }>();
  const [token, setToken] = useState<string | null>(null);
  const [persona, setPersona] = useState<PersonaWithContinuity | null>(null);
  const [items, setItems] = useState<MemoryItem[]>([]);
  const [briefing, setBriefing] = useState<PersonaMemoryBriefing | null>(null);
  const [form, setForm] = useState({ title: "", summary: "", content: "", relevanceWeight: 1.25 });
  const [sharedForm, setSharedForm] = useState({ title: "", content: "", scope: "shared_user_profile" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingShared, setSavingShared] = useState(false);
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
        const [personaData, memoryData, briefingData] = await Promise.all([
          apiGet<{ persona: PersonaWithContinuity }>(`/personas/${personaId}`, session.access_token),
          apiGet<{ memory: MemoryItem[] }>(`/memory/persona/${personaId}`, session.access_token),
          apiGet<{ briefing: PersonaMemoryBriefing }>(`/memory/persona/${personaId}/briefing`, session.access_token),
        ]);
        if (cancelled) return;
        setPersona(personaData.persona);
        setItems(memoryData.memory ?? []);
        setBriefing(briefingData.briefing);
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
      reloadBriefing(token, persona.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save memory.");
    } finally {
      setSaving(false);
    }
  }

  async function createSharedMemory(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !sharedForm.title.trim() || !sharedForm.content.trim()) return;
    setSavingShared(true);
    setError(null);
    try {
      const response = await apiPost<{ block: OwnerMemoryBlock }>(
        "/memory/shared",
        {
          title: sharedForm.title,
          content: sharedForm.content,
          scope: sharedForm.scope,
          trustLevel: "user_stated",
          confidence: 1,
        },
        token
      );
      setBriefing((current) => current ? {
        ...current,
        sharedBlocks: [response.block, ...current.sharedBlocks],
      } : current);
      setSharedForm({ title: "", content: "", scope: "shared_user_profile" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save shared memory.");
    } finally {
      setSavingShared(false);
    }
  }

  async function updateLifecycle(itemId: string, patch: Record<string, unknown>) {
    if (!token || !persona) return;
    setError(null);
    try {
      const response = await apiPatch<{ lifecycle: MemoryItemLifecycle }>(
        `/memory/${itemId}/lifecycle`,
        patch,
        token
      );
      setItems((current) => current.map((item) => (
        item.id === itemId ? { ...item, lifecycle: response.lifecycle } : item
      )));
      reloadBriefing(token, persona.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update memory lifecycle.");
    }
  }

  async function reloadBriefing(accessToken: string, id: string) {
    const data = await apiGet<{ briefing: PersonaMemoryBriefing }>(`/memory/persona/${id}/briefing`, accessToken).catch(() => null);
    if (data) setBriefing(data.briefing);
  }

  if (loading) return <StudioMessage>Loading memory...</StudioMessage>;
  if (error && !persona) return <StudioMessage tone="error">{error}</StudioMessage>;
  if (!persona) return <StudioMessage tone="error">Persona not found.</StudioMessage>;

  const lifecycleMetrics = memoryLifecycleCounters(items, briefing);

  return (
    <main className="container studio-workspace">
      <PersonaWorkspaceHeader persona={persona} />
      {error && <div className="space-form-error">{error}</div>}

      <section className="studio-list-panel" style={{ marginBottom: "1rem" }}>
        <div className="studio-section-heading">
          <div className="section-label">Memory Briefing</div>
          <h2>Shared profile and lifecycle state</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(132px, 1fr))", gap: "0.75rem" }}>
          <BriefingMetric label="Shared blocks" value={briefing?.sharedBlocks.length ?? 0} />
          {lifecycleMetrics.map((metric) => (
            <BriefingMetric key={metric.status} label={metric.label} value={metric.value} />
          ))}
          <BriefingMetric label="Next cycle" value={`${briefing?.cycleState.nextThresholdPct ?? 75}%`} />
        </div>
      </section>

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
            {items.map((item) => {
              const status = memoryLifecycleDisplayStatus(item.lifecycle);
              const actions = memoryLifecycleActions(item.lifecycle);

              return (
                <article key={item.id} className="studio-item-card">
                  <div>
                    <span>{item.lifecycle?.trustLevel ?? item.source_type}</span>
                    <time>{formatDate(item.created_at)}</time>
                  </div>
                  <h3>{item.title || "Untitled memory"}</h3>
                  <p>{item.summary || item.content}</p>
                  <div style={{ display: "grid", gap: "0.5rem", marginTop: "0.75rem" }}>
                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                      <span className="section-label">{memoryLifecycleStatusLabel(status)}</span>
                      <span className="section-label">confidence {((item.lifecycle?.confidence ?? 0.7) * 100).toFixed(0)}%</span>
                    </div>
                    <p style={{ margin: 0, color: "#8ea0b8", fontSize: "0.9rem", lineHeight: 1.45 }}>
                      {memoryRuntimeCopy(status)}
                    </p>
                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                      <button className="button secondary" type="button" onClick={() => updateLifecycle(item.id, { reinforce: true })}>
                        Reinforce
                      </button>
                      {actions.showRestore && (
                        <button className="button secondary" type="button" onClick={() => updateLifecycle(item.id, { status: "active", expiresAt: null, supersededByMemoryItemId: null })}>
                          Restore
                        </button>
                      )}
                      {actions.showQuarantine && (
                        <button className="button secondary" type="button" onClick={() => updateLifecycle(item.id, { status: "quarantined" })}>
                          Quarantine
                        </button>
                      )}
                      {actions.showReject && (
                        <button className="button secondary" type="button" onClick={() => updateLifecycle(item.id, { status: "rejected" })}>
                          Reject
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </section>

      <section className="studio-two-column" style={{ marginTop: "1rem" }}>
        <form className="studio-editor-panel" onSubmit={createSharedMemory}>
          <div className="studio-section-heading">
            <div className="section-label">Shared Memory</div>
            <h2>Add owner-wide context</h2>
          </div>
          <input className="input" value={sharedForm.title} onChange={(e) => setSharedForm((f) => ({ ...f, title: e.target.value }))} placeholder="Title" maxLength={160} />
          <select className="input" value={sharedForm.scope} onChange={(e) => setSharedForm((f) => ({ ...f, scope: e.target.value }))}>
            <option value="shared_user_profile">Shared user profile</option>
            <option value="working_style">Working style</option>
            <option value="preference">Preference</option>
            <option value="boundary">Boundary</option>
            <option value="project_context">Project context</option>
          </select>
          <textarea className="textarea" value={sharedForm.content} onChange={(e) => setSharedForm((f) => ({ ...f, content: e.target.value }))} placeholder="What should every persona know about the owner?" style={{ minHeight: 140 }} required />
          <button className="button primary" type="submit" disabled={savingShared}>
            {savingShared ? "Saving..." : "Save Shared Memory"}
          </button>
        </form>

        <section className="studio-list-panel">
          <div className="studio-section-heading">
            <div className="section-label">Owner-wide</div>
            <h2>{briefing?.sharedBlocks.length ?? 0} shared blocks</h2>
          </div>
          <div className="studio-item-list">
            {(briefing?.sharedBlocks.length ?? 0) === 0 && <div className="studio-empty">No shared memory blocks yet.</div>}
            {briefing?.sharedBlocks.map((block) => (
              <article key={block.id} className="studio-item-card">
                <div>
                  <span>{block.scope}</span>
                  <time>{formatDate(block.updatedAt)}</time>
                </div>
                <h3>{block.title}</h3>
                <p>{block.content}</p>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

function BriefingMetric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="studio-item-card" style={{ minHeight: 92 }}>
      <h3 style={{ marginBottom: "0.25rem" }}>{value}</h3>
      <p style={{ margin: 0 }}>{label}</p>
    </div>
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
