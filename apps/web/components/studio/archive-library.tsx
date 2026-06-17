"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiGet } from "@/lib/api-client";
import {
  ARCHIVE_SEARCH_FILTERS,
  archiveSearchPath,
  archiveSearchUsesBackend,
} from "@/lib/archive-search";
import { getSession } from "@/lib/auth";

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
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not load archive.");
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

  const summarySource = summaryItems.length > 0 ? summaryItems : items;
  const failedCount = summarySource.filter((item) => item.status === "failed").length;
  const queuedCount = summarySource.filter((item) => ["queued", "processing", "in_progress"].includes(item.status)).length;

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
          <Link href="/studio/assistant" style={primaryButton}>Ask Assistant</Link>
        </header>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 10, marginBottom: 18 }}>
          <SummaryCard label="Archive items" value={summarySource.length.toString()} />
          <SummaryCard label="Queued/in progress" value={queuedCount.toString()} />
          <SummaryCard label="Failed" value={failedCount.toString()} tone={failedCount > 0 ? "bad" : "neutral"} />
        </div>

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

            <section style={{ display: "grid", gap: 14, minWidth: 0 }}>
              <div style={panel}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 160px), 1fr))", gap: 10 }}>
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search private archive materials..."
                    style={input}
                  />
                  <select value={sort} onChange={(event) => setSort(event.target.value)} style={input}>
                    <option value="date">Sort by date</option>
                    <option value="type">Sort by type</option>
                    <option value="title">Sort by title</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
                {visibleItems.map((item) => (
                  <article key={`${item.type}-${item.id}`} style={card}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                      <span style={iconBox}>{item.type.slice(0, 1).toUpperCase()}</span>
                      <div style={{ minWidth: 0 }}>
                        <h3 style={{ margin: 0, color: "var(--station-page-text)", fontSize: 14, lineHeight: 1.25 }}>{item.title}</h3>
                        <div style={{ color: "var(--station-page-muted)", fontSize: 11 }}>{item.source} / {formatDate(item.date)}</div>
                      </div>
                    </div>
                    <p style={{ margin: "0 0 12px", color: "var(--station-page-muted)", fontSize: 12, lineHeight: 1.55 }}>{item.summary}</p>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                      <span style={pill}>{item.type}</span>
                      <span style={pill}>{item.persona}</span>
                      <span style={statusPill(item.status)}>{item.status}</span>
                    </div>
                    {item.match ? (
                      <div style={{ color: "var(--station-page-accent)", fontSize: 11, marginBottom: 12 }}>
                        {item.match.reason}
                      </div>
                    ) : null}
                    <Link href={item.href} style={miniLink}>Open source</Link>
                  </article>
                ))}
              </div>

              {visibleItems.length === 0 ? (
                <div style={{ ...panel, color: "var(--station-page-muted)", fontSize: 13, lineHeight: 1.6 }}>
                  No archive items match this view. Your existing material remains private and owner-only; broaden the search or add source material from a persona Archive tab.
                </div>
              ) : null}
            </section>
          </div>
        ) : null}
      </div>
    </main>
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
