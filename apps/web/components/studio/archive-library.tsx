"use client";

import { useMemo, useState } from "react";

type ArchiveItem = {
  id: string;
  title: string;
  source: string;
  type: "conversation" | "document" | "image" | "data" | "integrity";
  persona: string;
  date: string;
  summary: string;
};

const archiveItems: ArchiveItem[] = [
  {
    id: "archive-1",
    title: "old-chat-export.json",
    source: "ChatGPT export",
    type: "conversation",
    persona: "Station",
    date: "Today",
    summary: "Imported conversation history waiting for memory and canon review.",
  },
  {
    id: "archive-2",
    title: "station-notes.txt",
    source: "Upload",
    type: "document",
    persona: "Station",
    date: "Yesterday",
    summary: "Continuity notes uploaded into the global archive.",
  },
  {
    id: "archive-3",
    title: "Station tone pass",
    source: "Integrity session",
    type: "integrity",
    persona: "Station",
    date: "3d ago",
    summary: "Calibration transcript with extracted tone and public/private rules.",
  },
  {
    id: "archive-4",
    title: "Awakenings thread pull",
    source: "Reddit",
    type: "data",
    persona: "Shared/global",
    date: "1w ago",
    summary: "Forum research pull queued for classification and excerpts.",
  },
];

const filters = [
  "All",
  "Shared/global",
  "Station",
  "Reddit",
  "ChatGPT export",
  "Claude export",
  "Upload",
  "API ingestion",
  "Conversation",
  "Document",
  "Image",
  "Data",
];

export function ArchiveLibrary() {
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("date");

  const items = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return archiveItems
      .filter((item) => {
        if (filter === "All") return true;
        if (filter === "Shared/global") return item.persona === "Shared/global";
        if (["Conversation", "Document", "Image", "Data"].includes(filter)) return item.type === filter.toLowerCase();
        return item.persona === filter || item.source === filter;
      })
      .filter((item) => !normalizedQuery || `${item.title} ${item.summary} ${item.source} ${item.persona}`.toLowerCase().includes(normalizedQuery))
      .sort((a, b) => sort === "type" ? a.type.localeCompare(b.type) : a.title.localeCompare(b.title));
  }, [filter, query, sort]);

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
              Browse materials across personas, shared uploads, imports, integrity sessions, and external sources.
            </p>
          </div>
          <button type="button" style={primaryButton}>Upload</button>
        </header>

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
                  placeholder="Search archive materials..."
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
              {items.map((item) => (
                <article key={item.id} style={card}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <span style={iconBox}>{item.type.slice(0, 1).toUpperCase()}</span>
                    <div style={{ minWidth: 0 }}>
                      <h3 style={{ margin: 0, color: "#f8fafc", fontSize: 14, lineHeight: 1.25 }}>{item.title}</h3>
                      <div style={{ color: "#8ea0b8", fontSize: 11 }}>{item.source} - {item.date}</div>
                    </div>
                  </div>
                  <p style={{ margin: "0 0 12px", color: "#a9b0bd", fontSize: 12, lineHeight: 1.55 }}>{item.summary}</p>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                    <span style={pill}>{item.type}</span>
                    <span style={pill}>{item.persona}</span>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: "auto" }}>
                    {["Attach", "Pin", "Draft", "Export"].map((action) => (
                      <button key={action} type="button" style={miniButton}>{action}</button>
                    ))}
                  </div>
                </article>
              ))}
            </div>

            {items.length === 0 ? (
              <div style={{ ...panel, color: "#8ea0b8", fontSize: 13 }}>No archive items match this view.</div>
            ) : null}
          </section>
        </div>
      </div>
    </main>
  );
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
  cursor: "pointer",
};

const miniButton = {
  border: "1px solid #334155",
  borderRadius: 7,
  background: "#111827",
  color: "#dbeafe",
  padding: "6px 8px",
  fontSize: 12,
  cursor: "pointer",
};
