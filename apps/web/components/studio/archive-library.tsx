"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiGet, apiPost } from "@/lib/api-client";
import {
  ARCHIVE_SEARCH_FILTERS,
  archiveSearchGroupCounts,
  archiveSearchModeLabel,
  archiveSearchPath,
  archiveSearchReadbackCopy,
  archiveResultEvidenceHref,
  archiveResultProvenanceReadback,
  archiveSearchUsesBackend,
  globalArchiveIntakeCanSubmit,
  globalArchiveIntakeErrorMessage,
  globalArchiveIntakePayload,
  globalArchiveIntakeSuccessMessage,
  globalArchiveTrustBoundaryRows,
  type ArchiveSearchGroupRow,
  type GlobalArchiveTrustBoundaryRow,
} from "@/lib/archive-search";
import { archiveSourceNarrative } from "@/lib/archive-trust";
import { getSession } from "@/lib/auth";
import { ownerVisibleText } from "@/lib/owner-visible-redaction";

type ArchiveItem = {
  id: string;
  kind?: string;
  title: string;
  source: string;
  sourceLabel?: string;
  type: string;
  persona: string;
  personaId?: string | null;
  date: string | null;
  occurredAt?: string | null;
  status: string;
  visibility?: string | null;
  summary: string;
  href: string;
  privacy?: "owner_only";
  match?: {
    field: string;
    reason: string;
  };
};

type ArchiveResponse = {
  items: ArchiveItem[];
  warnings?: string[];
};

type PersonaOption = {
  id: string;
  name: string;
  shortDescription?: string | null;
  visibility?: string | null;
};

type ImportJob = {
  id: string;
  kind: string;
  status: string;
  source_name: string;
  error_message: string | null;
  created_at: string;
  updated_at: string;
};

type GlobalArchiveIntakeForm = {
  personaId: string;
  sourceName: string;
  content: string;
  relevanceWeight: number;
};

const defaultIntakeForm: GlobalArchiveIntakeForm = {
  personaId: "",
  sourceName: "",
  content: "",
  relevanceWeight: 1.5,
};

export function ArchiveLibrary() {
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("date");
  const [items, setItems] = useState<ArchiveItem[]>([]);
  const [summaryItems, setSummaryItems] = useState<ArchiveItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [signedIn, setSignedIn] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [personas, setPersonas] = useState<PersonaOption[]>([]);
  const [intakeForm, setIntakeForm] = useState<GlobalArchiveIntakeForm>(defaultIntakeForm);
  const [intakeSubmitting, setIntakeSubmitting] = useState(false);
  const [intakeError, setIntakeError] = useState<string | null>(null);
  const [intakeNotice, setIntakeNotice] = useState<string | null>(null);
  const searchInput = useMemo(() => ({ filter, query, sort }), [filter, query, sort]);

  const applyArchiveResponse = useCallback((data: ArchiveResponse, input: { filter: string; query: string; sort: string }) => {
    if (!archiveSearchUsesBackend(input)) {
      setSummaryItems(data.items ?? []);
    }
    setItems(data.items ?? []);
    setWarnings(data.warnings ?? []);
  }, []);

  const refreshArchive = useCallback(async (
    sessionToken: string,
    input: { filter: string; query: string; sort: string },
  ) => {
    const path = archiveSearchPath(input);
    const data = await apiGet<ArchiveResponse>(path, sessionToken);
    applyArchiveResponse(data, input);
  }, [applyArchiveResponse]);

  useEffect(() => {
    getSession().then((session) => {
      if (!session) {
        setSignedIn(false);
        setLoading(false);
        return;
      }

      setSignedIn(true);
      setAccessToken(session.access_token);
    });
  }, []);

  useEffect(() => {
    if (!accessToken) return;
    const sessionToken = accessToken;

    let cancelled = false;
    async function loadPersonas() {
      try {
        const data = await apiGet<{ personas: PersonaOption[] }>("/personas", sessionToken);
        if (cancelled) return;
        const nextPersonas = data.personas ?? [];
        setPersonas(nextPersonas);
        setIntakeForm((current) => {
          if (current.personaId && nextPersonas.some((persona) => persona.id === current.personaId)) {
            return current;
          }
          return { ...current, personaId: nextPersonas[0]?.id ?? "" };
        });
      } catch {
        if (!cancelled) {
          setIntakeError("Could not load persona choices. Existing archive material remains owner-only and safe.");
        }
      }
    }

    loadPersonas();
    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) return;
    const sessionToken = accessToken;

    const handle = window.setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);
        await refreshArchive(sessionToken, searchInput);
      } catch {
        setError("Could not load Global Archive. Existing archive material remains owner-only and safe; try again or check your session.");
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => window.clearTimeout(handle);
  }, [accessToken, refreshArchive, searchInput]);

  async function importGlobalSource(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken || !globalArchiveIntakeCanSubmit(intakeForm, intakeSubmitting)) return;

    const selectedPersona = personas.find((persona) => persona.id === intakeForm.personaId);
    setIntakeSubmitting(true);
    setIntakeError(null);
    setIntakeNotice(null);
    try {
      const payload = globalArchiveIntakePayload(intakeForm);
      const response = await apiPost<{ job: ImportJob; chunksCreated: number }>(
        "/imports/chat",
        payload,
        accessToken,
      );
      const overviewInput = { filter: "All", query: "", sort: "date" };
      setFilter(overviewInput.filter);
      setQuery(overviewInput.query);
      setSort(overviewInput.sort);
      await refreshArchive(accessToken, overviewInput);
      setIntakeForm((current) => ({
        ...defaultIntakeForm,
        personaId: current.personaId,
      }));
      setIntakeNotice(globalArchiveIntakeSuccessMessage(response.job.source_name ?? payload.sourceName, selectedPersona?.name));
    } catch (importError) {
      setIntakeError(globalArchiveIntakeErrorMessage(importError));
      try {
        await refreshArchive(accessToken, { filter: "All", query: "", sort: "date" });
      } catch {
        // Keep the import failure visible if the follow-up overview refresh also fails.
      }
    } finally {
      setIntakeSubmitting(false);
    }
  }

  const visibleItems = useMemo(() => {
    return [...items].sort((a, b) => {
      if (sort === "type") return a.type.localeCompare(b.type) || a.title.localeCompare(b.title);
      if (sort === "title") return a.title.localeCompare(b.title);
      return Date.parse(b.date ?? "") - Date.parse(a.date ?? "");
    });
  }, [items, sort]);
  const searchMode = archiveSearchModeLabel(searchInput);
  const searchReadback = archiveSearchReadbackCopy(searchInput, visibleItems.length, warnings.length);
  const sourceGroups = useMemo(() => archiveSearchGroupCounts(visibleItems, "type"), [visibleItems]);
  const statusGroups = useMemo(() => archiveSearchGroupCounts(visibleItems, "status"), [visibleItems]);
  const personaGroups = useMemo(() => archiveSearchGroupCounts(visibleItems, "persona"), [visibleItems]);
  const selectedPersona = personas.find((persona) => persona.id === intakeForm.personaId);
  const canSubmitIntake = globalArchiveIntakeCanSubmit(intakeForm, intakeSubmitting);

  const summarySource = summaryItems.length > 0 ? summaryItems : items;
  const failedCount = summarySource.filter((item) => item.status === "failed").length;
  const queuedCount = summarySource.filter((item) => ["queued", "processing", "in_progress"].includes(item.status)).length;
  const sourceNarrative = archiveSourceNarrative();
  const boundaryRows = useMemo(() => globalArchiveTrustBoundaryRows(), []);

  return (
    <main style={{ minHeight: "calc(100vh - 52px)", background: "var(--station-page-bg)", color: "var(--station-page-text)" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "24px 16px 48px" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
          <div>
            <div style={{ color: "var(--station-page-accent)", fontSize: 11, textTransform: "uppercase", letterSpacing: 0, fontWeight: 800 }}>
              Workspace Archive
            </div>
            <h1 style={{ margin: "8px 0 6px", color: "var(--station-page-text)", fontSize: 34, lineHeight: 1.05 }}>
              Global Archive
            </h1>
            <p style={{ margin: 0, color: "var(--station-page-muted)", fontSize: 15, lineHeight: 1.6, maxWidth: 720 }}>
              Live owner-only view across imports, uploaded files, archived chats, Integrity Sessions, documents, memory, and canon-adjacent material.
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "flex-end", flexWrap: "wrap" }}>
            <span style={ownerOnlyPill}>Live owner-only</span>
            <Link href="/studio/assistant" style={primaryButton}>Ask Assistant</Link>
          </div>
        </header>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 10, marginBottom: 18 }}>
          <SummaryCard label="Archive items" value={summarySource.length.toString()} />
          <SummaryCard label="Queued/in progress" value={queuedCount.toString()} />
          <SummaryCard label="Failed" value={failedCount.toString()} tone={failedCount > 0 ? "bad" : "neutral"} />
        </div>

        <section style={{ ...panel, marginBottom: 18 }} aria-label="Archive source safety">
          <h2 style={sectionTitle}>Source material and visibility</h2>
          <div style={{ display: "grid", gap: 8, color: "var(--station-page-muted)", fontSize: 13, lineHeight: 1.6 }}>
            <p style={{ margin: 0 }}>{sourceNarrative.sourceMaterial}</p>
            <p style={{ margin: 0 }}>{sourceNarrative.processing}</p>
            <p style={{ margin: 0 }}>{sourceNarrative.visibility}</p>
          </div>
        </section>

        {signedIn ? (
          <GlobalArchiveSourceIntake
            form={intakeForm}
            personas={personas}
            selectedPersona={selectedPersona}
            submitting={intakeSubmitting}
            canSubmit={canSubmitIntake}
            notice={intakeNotice}
            error={intakeError}
            onSubmit={importGlobalSource}
            onChange={setIntakeForm}
          />
        ) : null}

        <GlobalArchiveBoundaryPanel rows={boundaryRows} />

        {!signedIn && !loading ? <section style={panel}>Sign in to view your private archive.</section> : null}
        {loading ? <section style={panel}>Loading archive...</section> : null}
        {error ? <section style={{ ...panel, borderColor: "rgba(157, 60, 53, 0.35)", background: "#f8e6e3", color: "var(--station-page-red)" }}>{error}</section> : null}
        {warnings.length > 0 && !error ? (
          <section style={{ ...panel, borderColor: "rgba(133, 79, 11, 0.35)", background: "#f8efd9", color: "#854f0b", marginBottom: 18 }}>
            Some archive sources could not be searched. Your existing private material remains owner-only.
          </section>
        ) : null}

        {signedIn && !loading && !error ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap: 18, alignItems: "start" }}>
            <aside style={panel}>
              <h2 style={sectionTitle}>Filters</h2>
              <div style={{ display: "grid", gap: 6 }}>
                {ARCHIVE_SEARCH_FILTERS.map((item) => {
                  const active = item === filter;
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setFilter(item)}
                      style={{
                        ...filterButton,
                        background: active ? "#e7f0f6" : "transparent",
                        borderColor: active ? "rgba(40, 120, 185, 0.35)" : "transparent",
                        color: active ? "#174b70" : "var(--station-page-muted)",
                      }}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </aside>

            <section id="archive-results" style={{ display: "grid", gap: 14, minWidth: 0 }}>
              <div style={panel}>
                <label htmlFor="archive-search-input" style={{ display: "block", color: "var(--station-page-text)", fontSize: 13, fontWeight: 800, marginBottom: 8 }}>
                  Search private archive
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 160px), 1fr))", gap: 10 }}>
                  <input
                    id="archive-search-input"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search private archive materials..."
                    aria-label="Search private archive materials"
                    style={input}
                  />
                  <select value={sort} onChange={(event) => setSort(event.target.value)} style={input}>
                    <option value="date">Sort by date</option>
                    <option value="type">Sort by type</option>
                    <option value="title">Sort by title</option>
                  </select>
                </div>
              </div>

              <ArchiveSearchReadbackPanel
                mode={searchMode}
                title={searchReadback.title}
                body={searchReadback.body}
                sourceGroups={sourceGroups}
                statusGroups={statusGroups}
                personaGroups={personaGroups}
              />

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
                {visibleItems.map((item) => (
                  <article key={`${item.type}-${item.id}`} style={card}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                      <span style={iconBox}>{item.type.slice(0, 1).toUpperCase()}</span>
                      <div style={{ minWidth: 0 }}>
                        <h3 style={{ margin: 0, color: "var(--station-page-text)", fontSize: 14, lineHeight: 1.25 }}>
                          {ownerVisibleText(item.title, "Untitled archive item")}
                        </h3>
                        <div style={{ color: "var(--station-page-muted)", fontSize: 11 }}>
                          {ownerVisibleText(item.sourceLabel ?? item.source, "Archive source")} / {formatDate(item.date)}
                        </div>
                      </div>
                    </div>
                    <p style={{ margin: "0 0 12px", color: "var(--station-page-muted)", fontSize: 12, lineHeight: 1.55 }}>
                      {ownerVisibleText(item.summary, "No archive summary saved.")}
                    </p>
                    <ArchiveResultProvenance item={item} />
                  </article>
                ))}
              </div>

              {visibleItems.length === 0 ? (
                <div style={{ ...panel, color: "var(--station-page-muted)", fontSize: 13, lineHeight: 1.6 }}>
                  No Global Archive items match this view. Existing material remains private and safe; broaden the search, add pasted source material from the Global Archive intake panel, or use Export Workspace for package readback.
                </div>
              ) : null}
            </section>
          </div>
        ) : null}
      </div>
    </main>
  );
}

function ArchiveResultProvenance({ item }: { item: ArchiveItem }) {
  const readback = archiveResultProvenanceReadback(item);
  const evidenceHref = archiveResultEvidenceHref(item);

  return (
    <section style={provenancePanel} aria-label="Archive result provenance">
      <div style={provenanceGrid}>
        <ProvenanceFact label="Source" value={readback.sourceClassLabel} />
        <ProvenanceFact label="Visibility" value={readback.visibilityLabel} />
        <ProvenanceFact label="Status" value={readback.statusLabel} tone={statusTone(item.status)} />
        <ProvenanceFact label="Persona" value={readback.personaLabel} />
      </div>
      <p style={provenanceCopy}>{readback.matchLabel}</p>
      {evidenceHref ? (
        <Link href={evidenceHref} style={miniLink}>{readback.evidenceLabel}</Link>
      ) : (
        <span style={provenanceUnavailable}>Owner evidence route unavailable</span>
      )}
    </section>
  );
}

function ProvenanceFact({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "good" | "bad";
}) {
  return (
    <div style={provenanceFact}>
      <span style={provenanceFactLabel}>{label}</span>
      <strong style={{
        ...provenanceFactValue,
        color: tone === "bad" ? "var(--station-page-red)" : tone === "good" ? "#25633f" : "var(--station-page-text)",
      }}>
        {value}
      </strong>
    </div>
  );
}

function GlobalArchiveSourceIntake({
  form,
  personas,
  selectedPersona,
  submitting,
  canSubmit,
  notice,
  error,
  onSubmit,
  onChange,
}: {
  form: GlobalArchiveIntakeForm;
  personas: PersonaOption[];
  selectedPersona?: PersonaOption;
  submitting: boolean;
  canSubmit: boolean;
  notice: string | null;
  error: string | null;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onChange: React.Dispatch<React.SetStateAction<GlobalArchiveIntakeForm>>;
}) {
  return (
    <section id="global-archive-source-intake" style={{ ...panel, marginBottom: 18 }} aria-label="Global Archive source intake">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", flexWrap: "wrap", marginBottom: 10 }}>
        <div>
          <div style={{ color: "var(--station-page-accent)", fontSize: 11, textTransform: "uppercase", letterSpacing: 0, fontWeight: 800 }}>
            Private source intake
          </div>
          <h2 style={{ ...sectionTitle, margin: "4px 0 0" }}>Add pasted source to Global Archive</h2>
        </div>
        <span style={ownerOnlyPill}>Owner-only</span>
      </div>
      <p style={{ margin: "0 0 12px", color: "var(--station-page-muted)", fontSize: 13, lineHeight: 1.6 }}>
        Choose one of your personas and paste notes, chat logs, letters, or research material. Station creates a private import job through the existing archive pipeline; nothing is published from this form.
      </p>
      {notice ? <div style={successNotice}>{notice}</div> : null}
      {error ? <div style={errorNotice}>{error}</div> : null}
      {personas.length === 0 ? (
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center", color: "var(--station-page-muted)", fontSize: 13 }}>
          <span>Create a persona before adding owner-wide source material.</span>
          <Link href="/studio/new" style={miniLink}>New persona</Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 210px), 1fr))", gap: 10 }}>
            <label style={fieldShell}>
              <span style={fieldLabel}>Persona</span>
              <select
                value={form.personaId}
                onChange={(event) => onChange((current) => ({ ...current, personaId: event.target.value }))}
                style={input}
              >
                {personas.map((persona) => (
                  <option key={persona.id} value={persona.id}>{persona.name}</option>
                ))}
              </select>
            </label>
            <label style={fieldShell}>
              <span style={fieldLabel}>Source name</span>
              <input
                value={form.sourceName}
                onChange={(event) => onChange((current) => ({ ...current, sourceName: event.target.value }))}
                placeholder="Field notes, letters, chat export..."
                maxLength={200}
                style={input}
              />
            </label>
          </div>
          <label style={fieldShell}>
            <span style={fieldLabel}>Pasted source material</span>
            <textarea
              value={form.content}
              onChange={(event) => onChange((current) => ({ ...current, content: event.target.value }))}
              placeholder="Paste private source material for this persona."
              required
              style={{ ...input, minHeight: 170, resize: "vertical" as const, lineHeight: 1.5 }}
            />
          </label>
          <label style={fieldShell}>
            <span style={fieldLabel}>Default memory weight {form.relevanceWeight.toFixed(2)}</span>
            <input
              type="range"
              min={0.1}
              max={5}
              step={0.05}
              value={form.relevanceWeight}
              onChange={(event) => onChange((current) => ({ ...current, relevanceWeight: Number(event.target.value) }))}
            />
          </label>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <button
              type="submit"
              disabled={!canSubmit}
              style={{
                ...primaryButton,
                opacity: canSubmit ? 1 : 0.58,
                cursor: canSubmit ? "pointer" : "not-allowed",
              }}
            >
              {submitting ? "Importing..." : "Import pasted source"}
            </button>
            {selectedPersona ? (
              <Link href={`/studio/personas/${selectedPersona.id}/files`} style={miniLink}>
                Open persona Archive
              </Link>
            ) : null}
          </div>
        </form>
      )}
    </section>
  );
}

function GlobalArchiveBoundaryPanel({ rows }: { rows: GlobalArchiveTrustBoundaryRow[] }) {
  return (
    <section style={{ marginBottom: 18 }} aria-label="Global Archive boundaries">
      <div style={{ maxWidth: 760, marginBottom: 10 }}>
        <h2 style={{ ...sectionTitle, marginBottom: 6 }}>Archive route map</h2>
        <p style={{ margin: 0, color: "var(--station-page-muted)", fontSize: 13, lineHeight: 1.6 }}>
          Global Archive handles owner-wide pasted source intake and search. Persona Archive tabs still handle file upload and deeper source review, Export Workspace handles portable package readback, and Settings reports storage usage.
        </p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))", gap: 10 }}>
        {rows.map((row) => (
          <article key={row.id} style={boundaryCard}>
            <h3 style={{ margin: 0, color: "var(--station-page-text)", fontSize: 14, lineHeight: 1.3 }}>
              {row.label}
            </h3>
            <p style={{ margin: "8px 0 14px", color: "var(--station-page-muted)", fontSize: 12, lineHeight: 1.55 }}>
              {row.body}
            </p>
            <Link href={row.href} style={boundaryLink}>{row.actionLabel}</Link>
          </article>
        ))}
      </div>
    </section>
  );
}

function ArchiveSearchReadbackPanel({
  mode,
  title,
  body,
  sourceGroups,
  statusGroups,
  personaGroups,
}: {
  mode: string;
  title: string;
  body: string;
  sourceGroups: ArchiveSearchGroupRow[];
  statusGroups: ArchiveSearchGroupRow[];
  personaGroups: ArchiveSearchGroupRow[];
}) {
  return (
    <section style={panel} aria-label="Private search readback">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", flexWrap: "wrap", marginBottom: 10 }}>
        <div>
          <div style={{ color: "var(--station-page-accent)", fontSize: 11, textTransform: "uppercase", letterSpacing: 0, fontWeight: 800 }}>
            {mode}
          </div>
          <h2 style={{ ...sectionTitle, margin: "4px 0 0" }}>{title}</h2>
        </div>
        <span style={ownerOnlyPill}>Owner-only</span>
      </div>
      <p style={{ margin: "0 0 12px", color: "var(--station-page-muted)", fontSize: 13, lineHeight: 1.6 }}>
        {body}
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
        <ArchiveGroup label="Sources" rows={sourceGroups} />
        <ArchiveGroup label="Statuses" rows={statusGroups} />
        <ArchiveGroup label="Personas" rows={personaGroups} />
      </div>
    </section>
  );
}

function ArchiveGroup({ label, rows }: { label: string; rows: ArchiveSearchGroupRow[] }) {
  return (
    <div style={{ border: "1px solid var(--station-page-border)", borderRadius: 8, padding: 10, background: "var(--station-page-soft-2)" }}>
      <div style={{ color: "var(--station-page-muted)", fontSize: 11, fontWeight: 800, marginBottom: 8 }}>{label}</div>
      {rows.length > 0 ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {rows.map((row) => (
            <span key={row.label} style={pill}>{row.label} / {row.count}</span>
          ))}
        </div>
      ) : (
        <div style={{ color: "var(--station-page-muted)", fontSize: 12 }}>No grouped results yet.</div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, tone = "neutral" }: { label: string; value: string; tone?: "neutral" | "bad" }) {
  const bad = tone === "bad";
  return (
    <div style={{
      ...panel,
      padding: 14,
      borderColor: bad ? "rgba(157, 60, 53, 0.35)" : "var(--station-page-border)",
      background: bad ? "#f8e6e3" : "var(--station-page-surface)",
    }}>
      <div style={{ color: bad ? "var(--station-page-red)" : "var(--station-page-text)", fontSize: 24, fontWeight: 900, lineHeight: 1 }}>{value}</div>
      <div style={{ color: bad ? "#7f1d1d" : "var(--station-page-muted)", fontSize: 12, marginTop: 7 }}>{label}</div>
    </div>
  );
}

function formatDate(value: string | null) {
  if (!value) return "undated";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "undated";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function statusTone(status: string): "neutral" | "good" | "bad" {
  if (status === "failed") return "bad";
  if (["completed", "processed", "indexed", "archived", "published"].includes(status)) return "good";
  return "neutral";
}

const panel = {
  border: "1px solid var(--station-page-border)",
  background: "var(--station-page-surface)",
  color: "var(--station-page-text)",
  borderRadius: 8,
  padding: 16,
};

const card = {
  ...panel,
  minHeight: 220,
  display: "flex",
  flexDirection: "column" as const,
};

const boundaryCard = {
  ...panel,
  minHeight: 178,
  display: "flex",
  flexDirection: "column" as const,
};

const provenancePanel = {
  display: "grid",
  gap: 10,
  marginTop: "auto",
};

const provenanceGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 6,
};

const provenanceFact = {
  minWidth: 0,
  border: "1px solid var(--station-page-border)",
  borderRadius: 8,
  background: "var(--station-page-soft-2)",
  padding: "7px 8px",
};

const provenanceFactLabel = {
  display: "block",
  color: "var(--station-page-muted)",
  fontSize: 10,
  fontWeight: 800,
  marginBottom: 4,
};

const provenanceFactValue = {
  display: "block",
  overflowWrap: "anywhere" as const,
  fontSize: 11,
  lineHeight: 1.25,
};

const provenanceCopy = {
  margin: 0,
  color: "var(--station-page-muted)",
  fontSize: 12,
  lineHeight: 1.5,
};

const sectionTitle = {
  margin: "0 0 12px",
  color: "var(--station-page-text)",
  fontSize: 15,
};

const filterButton = {
  border: "1px solid transparent",
  borderRadius: 8,
  padding: "9px 10px",
  textAlign: "left" as const,
  cursor: "pointer",
  fontSize: 13,
};

const input = {
  width: "100%",
  border: "1px solid var(--station-page-border)",
  borderRadius: 8,
  background: "var(--station-page-surface)",
  color: "var(--station-page-text)",
  padding: "10px 11px",
  fontSize: 13,
};

const fieldShell = {
  display: "grid",
  gap: 6,
};

const fieldLabel = {
  color: "var(--station-page-text)",
  fontSize: 12,
  fontWeight: 800,
};

const successNotice = {
  border: "1px solid rgba(59, 143, 99, 0.35)",
  borderRadius: 8,
  background: "#e9f5ee",
  color: "#25633f",
  padding: "10px 12px",
  fontSize: 13,
  lineHeight: 1.5,
  marginBottom: 12,
};

const errorNotice = {
  border: "1px solid rgba(157, 60, 53, 0.35)",
  borderRadius: 8,
  background: "#f8e6e3",
  color: "var(--station-page-red)",
  padding: "10px 12px",
  fontSize: 13,
  lineHeight: 1.5,
  marginBottom: 12,
};

const iconBox = {
  width: 32,
  height: 32,
  borderRadius: 8,
  border: "1px solid var(--station-page-border)",
  background: "var(--station-page-soft-2)",
  color: "var(--station-page-accent)",
  display: "grid",
  placeItems: "center",
  fontSize: 12,
  fontWeight: 800,
  flex: "0 0 auto",
};

const pill = {
  border: "1px solid var(--station-page-border)",
  borderRadius: 999,
  background: "var(--station-page-soft-2)",
  color: "var(--station-page-muted)",
  padding: "5px 8px",
  fontSize: 11,
  fontWeight: 800,
};

const ownerOnlyPill = {
  ...pill,
  borderColor: "rgba(40, 120, 185, 0.35)",
  color: "var(--station-page-accent)",
  background: "#e7f0f6",
};

const primaryButton = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 40,
  border: "1px solid var(--station-page-text)",
  borderRadius: 8,
  background: "var(--station-page-text)",
  color: "#fff",
  padding: "0 14px",
  fontSize: 14,
  fontWeight: 800,
  textDecoration: "none",
};

const miniLink = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 32,
  border: "1px solid var(--station-page-border)",
  borderRadius: 8,
  color: "var(--station-page-text)",
  background: "var(--station-page-surface)",
  padding: "0 10px",
  fontSize: 12,
  fontWeight: 800,
  textDecoration: "none",
  marginTop: "auto",
};

const provenanceUnavailable = {
  ...miniLink,
  width: "fit-content",
  color: "var(--station-page-muted)",
  background: "var(--station-page-soft-2)",
};

const boundaryLink = {
  ...miniLink,
  alignSelf: "flex-start",
  textAlign: "center" as const,
  lineHeight: 1.2,
};
