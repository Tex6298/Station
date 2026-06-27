"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiGet } from "@/lib/api-client";
import {
  ARCHIVE_SEARCH_FILTERS,
  archiveSearchGroupCounts,
  archiveSearchModeLabel,
  archiveSearchPath,
  archiveSearchReadbackCopy,
  archiveSearchUsesBackend,
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

    const handle = window.setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);
        const path = archiveSearchPath({ filter, query, sort });
        const data = await apiGet<ArchiveResponse>(path, accessToken);
        if (!archiveSearchUsesBackend({ filter, query, sort })) {
          setSummaryItems(data.items ?? []);
        }
        setItems(data.items ?? []);
        setWarnings(data.warnings ?? []);
      } catch {
        setError("Could not load Global Archive. Existing archive material remains owner-only and safe; try again or check your session.");
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => window.clearTimeout(handle);
  }, [accessToken, filter, query, sort]);

  const visibleItems = useMemo(() => {
    return [...items].sort((a, b) => {
      if (sort === "type") return a.type.localeCompare(b.type) || a.title.localeCompare(b.title);
      if (sort === "title") return a.title.localeCompare(b.title);
      return Date.parse(b.date ?? "") - Date.parse(a.date ?? "");
    });
  }, [items, sort]);
  const searchInput = useMemo(() => ({ filter, query, sort }), [filter, query, sort]);
  const searchMode = archiveSearchModeLabel(searchInput);
  const searchReadback = archiveSearchReadbackCopy(searchInput, visibleItems.length, warnings.length);
  const sourceGroups = useMemo(() => archiveSearchGroupCounts(visibleItems, "type"), [visibleItems]);
  const statusGroups = useMemo(() => archiveSearchGroupCounts(visibleItems, "status"), [visibleItems]);
  const personaGroups = useMemo(() => archiveSearchGroupCounts(visibleItems, "persona"), [visibleItems]);

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
                        <div style={{ color: "var(--station-page-muted)", fontSize: 11 }}>{item.source} / {formatDate(item.date)}</div>
                      </div>
                    </div>
                    <p style={{ margin: "0 0 12px", color: "var(--station-page-muted)", fontSize: 12, lineHeight: 1.55 }}>
                      {ownerVisibleText(item.summary, "No archive summary saved.")}
                    </p>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                      <span style={pill}>{item.type}</span>
                      <span style={pill}>{item.persona}</span>
                      <span style={statusPill(item.status)}>{item.status}</span>
                    </div>
                    {item.match ? (
                      <div style={{ color: "var(--station-page-accent)", fontSize: 11, marginBottom: 12 }}>
                        {ownerVisibleText(item.match.reason, "Archive match")}
                      </div>
                    ) : null}
                    <Link href={item.href} style={miniLink}>Open source</Link>
                  </article>
                ))}
              </div>

              {visibleItems.length === 0 ? (
                <div style={{ ...panel, color: "var(--station-page-muted)", fontSize: 13, lineHeight: 1.6 }}>
                  No Global Archive items match this view. Existing material remains private and safe; broaden the search, add source material from a persona Archive tab, or use Export Workspace for package readback.
                </div>
              ) : null}
            </section>
          </div>
        ) : null}
      </div>
    </main>
  );
}

function GlobalArchiveBoundaryPanel({ rows }: { rows: GlobalArchiveTrustBoundaryRow[] }) {
  return (
    <section style={{ marginBottom: 18 }} aria-label="Global Archive boundaries">
      <div style={{ maxWidth: 760, marginBottom: 10 }}>
        <h2 style={{ ...sectionTitle, marginBottom: 6 }}>Archive route map</h2>
        <p style={{ margin: 0, color: "var(--station-page-muted)", fontSize: 13, lineHeight: 1.6 }}>
          Global Archive is the live owner-wide search surface. Persona Archive tabs handle source intake, Export Workspace handles portable package readback, and Settings reports storage usage.
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

function statusPill(status: string) {
  const failed = status === "failed";
  const good = ["completed", "processed", "indexed", "archived", "published"].includes(status);
  if (failed) {
    return {
      ...pill,
      borderColor: "rgba(157, 60, 53, 0.35)",
      color: "var(--station-page-red)",
      background: "#f8e6e3",
    };
  }

  if (good) {
    return {
      ...pill,
      borderColor: "rgba(59, 143, 99, 0.35)",
      color: "#25633f",
      background: "#e9f5ee",
    };
  }

  return {
    ...pill,
    borderColor: "var(--station-page-border)",
    color: "var(--station-page-muted)",
    background: "var(--station-page-soft-2)",
  };
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

const boundaryLink = {
  ...miniLink,
  alignSelf: "flex-start",
  textAlign: "center" as const,
  lineHeight: 1.2,
};
