"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type PublishItem = {
  id: string;
  title: string;
  type: string;
  destinations: string[];
  date: string;
  status: "Draft" | "Scheduled" | "Published" | "Failed";
  failure?: string;
};

const items: PublishItem[] = [
  { id: "draft-1", title: "Untitled Station draft", type: "Essay", destinations: ["Station blog"], date: "Today", status: "Draft" },
  { id: "scheduled-1", title: "Archive migration field notes", type: "Field Log", destinations: ["Station blog", "Reddit"], date: "Tomorrow 10:00", status: "Scheduled" },
  { id: "published-1", title: "What Station Is For", type: "Manifesto", destinations: ["Station blog"], date: "Yesterday", status: "Published" },
  { id: "failed-1", title: "Companion builder codex", type: "Codex", destinations: ["Reddit"], date: "2d ago", status: "Failed", failure: "Subreddit requires account age threshold." },
];

const tabs = ["Drafts", "Scheduled", "Published", "Failed external posts"];

function statusForTab(tab: string): PublishItem["status"] {
  if (tab === "Failed external posts") return "Failed";
  return tab.replace(/s$/, "") as PublishItem["status"];
}

export function PublishingDashboard() {
  const [tab, setTab] = useState("Drafts");
  const visible = useMemo(() => items.filter((item) => item.status === statusForTab(tab)), [tab]);

  return (
    <main style={{ minHeight: "calc(100vh - 52px)", background: "#0b0e14" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "24px clamp(16px, 4vw, 32px) 48px" }}>
        <header style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 20 }}>
          <div>
            <div style={{ color: "#93c5fd", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 800 }}>
              Publishing Dashboard
            </div>
            <h1 style={{ margin: "8px 0 6px", color: "#f8fafc", fontSize: "clamp(30px, 5vw, 46px)", lineHeight: 1.05 }}>
              Drafts, schedules, and external posts.
            </h1>
            <p style={{ margin: 0, color: "#a9b0bd", fontSize: 15, lineHeight: 1.6, maxWidth: 720 }}>
              Track publishing work across Station blog destinations and external connectors.
            </p>
          </div>
          <Link href="/studio/publish" style={primaryButton}>New post</Link>
        </header>

        <section style={panel}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", borderBottom: "1px solid #202938", paddingBottom: 12, marginBottom: 14 }}>
            {tabs.map((item) => {
              const active = item === tab;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setTab(item)}
                  style={{
                    ...tabButton,
                    borderColor: active ? "#2563eb" : "#334155",
                    background: active ? "#13233d" : "#0d1420",
                    color: active ? "#dbeafe" : "#cbd5e1",
                  }}
                >
                  {item}
                </button>
              );
            })}
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            {visible.map((item) => (
              <article key={item.id} style={row}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                    <h2 style={{ margin: 0, color: "#f8fafc", fontSize: 15 }}>{item.title}</h2>
                    <span style={pill}>{item.type}</span>
                    <span style={statusPill(item.status)}>{item.status}</span>
                  </div>
                  <div style={{ color: "#8ea0b8", fontSize: 12, marginTop: 7 }}>
                    {item.destinations.join(", ")} - {item.date}
                  </div>
                  {item.failure ? <div style={{ color: "#fca5a5", fontSize: 12, marginTop: 7 }}>{item.failure}</div> : null}
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                  <Link href="/studio/publish" style={miniLink}>Edit</Link>
                  {item.status === "Draft" || item.status === "Scheduled" ? <button type="button" style={miniButton}>Publish now</button> : null}
                  {item.status === "Failed" ? <button type="button" style={miniButton}>Retry</button> : null}
                  {item.status === "Published" ? <button type="button" style={miniButton}>View</button> : null}
                  <button type="button" style={dangerButton}>Delete</button>
                </div>
              </article>
            ))}
          </div>

          {visible.length === 0 ? (
            <div style={{ color: "#8ea0b8", fontSize: 13, padding: 16 }}>No items in this tab yet.</div>
          ) : null}
        </section>
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

const row = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  gap: 14,
  alignItems: "center",
  border: "1px solid #202938",
  borderRadius: 8,
  background: "#0d1420",
  padding: 13,
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

const tabButton = {
  border: "1px solid #334155",
  borderRadius: 999,
  padding: "7px 11px",
  fontSize: 12,
  fontWeight: 700,
  cursor: "pointer",
};

const pill = {
  border: "1px solid #334155",
  borderRadius: 999,
  background: "#111827",
  color: "#cbd5e1",
  padding: "4px 8px",
  fontSize: 11,
};

function statusPill(status: PublishItem["status"]) {
  const map = {
    Draft: { background: "#111827", color: "#cbd5e1", borderColor: "#334155" },
    Scheduled: { background: "#2d2108", color: "#facc15", borderColor: "#6b4e0c" },
    Published: { background: "#09261f", color: "#6ee7b7", borderColor: "#145943" },
    Failed: { background: "#2d1515", color: "#fca5a5", borderColor: "#7d2e2e" },
  }[status];

  return {
    ...pill,
    ...map,
  };
}

const miniButton = {
  border: "1px solid #334155",
  borderRadius: 7,
  background: "#111827",
  color: "#dbeafe",
  padding: "7px 9px",
  fontSize: 12,
  cursor: "pointer",
};

const miniLink = {
  ...miniButton,
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
};

const dangerButton = {
  ...miniButton,
  borderColor: "#5f2424",
  color: "#fca5a5",
};
