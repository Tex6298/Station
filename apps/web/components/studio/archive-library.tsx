"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiGet } from "@/lib/api-client";
import { getSession } from "@/lib/auth";

type ArchiveItem = {
  id: string;
  title: string;
  source: string;
  type: string;
  persona: string;
  date: string | null;
  status: string;
  summary: string;
  href: string;
};

const filters = [
  "All",
  "Shared/global",
  "Archive",
  "Memory",
  "Import",
  "Conversation",
  "Document",
  "Image",
  "Data",
  "Integrity",
];

export function ArchiveLibrary() {
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("date");
  const [items, setItems] = useState<ArchiveItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    getSession().then(async (session) => {
      if (!session) {
        setSignedIn(false);
        setLoading(false);
        return;
      }

      setSignedIn(true);
      try {
        const data = await apiGet<{ items: ArchiveItem[] }>("/imports/archive", session.access_token);
        setItems(data.items ?? []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not load archive.");
      } finally {
        setLoading(false);
      }
    });
  }, []);

  const visibleItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return [...items]
      .filter((item) => {
        if (filter === "All") return true;
        if (filter === "Shared/global") return item.persona === "Shared/global";
        return item.type.toLowerCase() === filter.toLowerCase() || item.source.toLowerCase().includes(filter.toLowerCase());
      })
      .filter((item) => !normalizedQuery || `${item.title} ${item.summary} ${item.source} ${item.persona} ${item.status}`.toLowerCase().includes(normalizedQuery))
      .sort((a, b) => {
        if (sort === "type") return a.type.localeCompare(b.type) || a.title.localeCompare(b.title);
        if (sort === "title") return a.title.localeCompare(b.title);
        return Date.parse(b.date ?? "") - Date.parse(a.date ?? "");
      });
  }, [filter, items, query, sort]);

  const failedCount = items.filter((item) => item.status === "failed").length;
  const queuedCount = items.filter((item) => ["queued", "processing", "in_progress"].includes(item.status)).length;

  return (
    <main style={{ minHeight: "calc(100vh - 52px)", background: "#0b0e14" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "24px clamp(16px, 4vw, 32px) 48px" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 20 }}>
          <div>
            <div style={{ color: "#93c5fd", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 800 }}>
              Workspace Archive
            </div>
            <h1 style={{ margin: "8px 0 6px", color: "#f8fafc", fontSize: "clamp(30px, 5vw, 46px)", lineHeight: 1.05 }}>
              Global Archive
            </h1>
            <p style={{ margin: 0, color: "#a9b0bd", fontSize: 15, lineHeight: 1.6, maxWidth: 720 }}>
              Live owner-only view across imports, uploaded files, archived chats, Integrity Sessions, documents, memory, and canon-adjacent material.
            </p>
          </div>
          <Link href="/studio/assistant" style={primaryButton}>Ask Assistant</Link>
        </header>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 10, marginBottom: 18 }}>
          <SummaryCard label="Archive items" value={items.length.toString()} />
          <SummaryCard label="Queued/in progress" value={queuedCount.toString()} />
          <SummaryCard label="Failed" value={failedCount.toString()} tone={failedCount > 0 ? "bad" : "neutral"} />
        </div>

        {!signedIn && !loading ? <section style={panel}>Sign in to view your private archive.</section> : null}
        {loading ? <section style={panel}>Loading archive...</section> : null}
        {error ? <section style={{ ...panel, borderColor: "#7f1d1d", color: "#fecaca" }}>{error}</section> : null}

        {signedIn && !loading && !error ? (
          <div style={{ display: "grid", gridTemplateColumns: "260px minmax(0, 1fr)", gap: 18, alignItems: "start" }}>
            <aside style={panel}>
              <h2 style={sectionTitle}>Filters</h2>
              <div style={{ display: "grid", gap: 6 }}>
                {filters.map((item) => {
                  const active = item === filter;
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setFilter(item)}
                      style={{
                        ...filterButton,
                        background: active ? "#13233d" : "transparent",
                        borderColor: active ? "#2563eb" : "transparent",
                        color: active ? "#f8fafc" : "#b6c0ce",
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
                <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 160px", gap: 10 }}>
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
                        <h3 style={{ margin: 0, color: "#f8fafc", fontSize: 14, lineHeight: 1.25 }}>{item.title}</h3>
                        <div style={{ color: "#8ea0b8", fontSize: 11 }}>{item.source} · {formatDate(item.date)}</div>
                      </div>
                    </div>
                    <p style={{ margin: "0 0 12px", color: "#a9b0bd", fontSize: 12, lineHeight: 1.55 }}>{item.summary}</p>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                      <span style={pill}>{item.type}</span>
                      <span style={pill}>{item.persona}</span>
                      <span style={statusPill(item.status)}>{item.status}</span>
                    </div>
                    <Link href={item.href} style={miniLink}>Open source</Link>
                  </article>
                ))}
              </div>

              {visibleItems.length === 0 ? (
                <div style={{ ...panel, color: "#8ea0b8", fontSize: 13 }}>No archive items match this view.</div>
              ) : null}
            </section>
          </div>
        ) : null}
      </div>
    </main>
  );
}

function SummaryCard({ label, value, tone = "neutral" }: { label: string; value: string; tone?: "neutral" | "bad" }) {
  return (
    <div style={{ ...panel, padding: 14, borderColor: tone === "bad" ? "#7f1d1d" : "#263244" }}>
      <div style={{ color: "#f8fafc", fontSize: 24, fontWeight: 900, lineHeight: 1 }}>{value}</div>
      <div style={{ color: "#8ea0b8", fontSize: 12, marginTop: 7 }}>{label}</div>
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
  return {
    ...pill,
    borderColor: failed ? "#7f1d1d" : good ? "#14532d" : "#334155",
    color: failed ? "#fecaca" : good ? "#bbf7d0" : "#cbd5e1",
    background: failed ? "#2a1010" : good ? "#0f2417" : "#0d1420",
  };
}

const panel = {
  border: "1px solid #263244",
  background: "#101622",
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
  color: "#f8fafc",
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
  border: "1px solid #334155",
  borderRadius: 8,
  background: "#0d1420",
  color: "#f8fafc",
  padding: "10px 11px",
  fontSize: 13,
};

const iconBox = {
  width: 32,
  height: 32,
  borderRadius: 8,
  border: "1px solid #334155",
  background: "#0f172a",
  color: "#bfdbfe",
  display: "grid",
  placeItems: "center",
  fontSize: 12,
  fontWeight: 800,
  flex: "0 0 auto",
};

const pill = {
  border: "1px solid #334155",
  borderRadius: 999,
  background: "#0d1420",
  color: "#cbd5e1",
  padding: "5px 8px",
  fontSize: 11,
  fontWeight: 800,
};

const primaryButton = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 40,
  border: "1px solid #2563eb",
  borderRadius: 8,
  background: "#2563eb",
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
  border: "1px solid #334155",
  borderRadius: 8,
  color: "#dbeafe",
  background: "#111827",
  padding: "0 10px",
  fontSize: 12,
  fontWeight: 800,
  textDecoration: "none",
  marginTop: "auto",
};
