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
    <main className="station-page">
      <div className="station-page-inner">
        <header className="station-page-header">
          <div>
            <div className="station-eyebrow">Publishing Dashboard</div>
            <h1 className="station-page-title">
              Drafts, schedules, and external posts.
            </h1>
            <p className="station-page-lede">
              Track publishing work across Station blog destinations and external connectors.
            </p>
          </div>
          <Link href="/studio/publish" className="station-link-button">New post</Link>
        </header>

        <section className="station-panel">
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", borderBottom: "1px solid #d8d3c8", paddingBottom: 12, marginBottom: 14 }}>
            {tabs.map((item) => {
              const active = item === tab;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setTab(item)}
                  style={{
                    ...tabButton,
                    borderColor: active ? "#1f2529" : "#d8d3c8",
                    background: active ? "#1f2529" : "#fff",
                    color: active ? "#fff" : "#1f2529",
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
                    <h2 style={{ margin: 0, color: "#1f2529", fontSize: 15 }}>{item.title}</h2>
                    <span style={pill}>{item.type}</span>
                    <span style={statusPill(item.status)}>{item.status}</span>
                  </div>
                  <div style={{ color: "#687078", fontSize: 12, marginTop: 7 }}>
                    {item.destinations.join(", ")} - {item.date}
                  </div>
                  {item.failure ? <div style={{ color: "#9d3c35", fontSize: 12, marginTop: 7 }}>{item.failure}</div> : null}
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                  <Link href="/studio/publish" style={miniLink}>Edit</Link>
                  {item.status === "Draft" || item.status === "Scheduled" ? <button type="button" disabled title="Preview only in this publishing dashboard slice." style={disabledMiniButton}>Publish unavailable</button> : null}
                  {item.status === "Failed" ? <button type="button" disabled title="Retry is unavailable in this publishing dashboard slice." style={disabledMiniButton}>Retry unavailable</button> : null}
                  {item.status === "Published" ? <button type="button" disabled title="Published-item detail is unavailable in this dashboard slice." style={disabledMiniButton}>View unavailable</button> : null}
                  <button type="button" disabled title="Deletion is unavailable in this publishing dashboard slice." style={disabledDangerButton}>Delete unavailable</button>
                </div>
              </article>
            ))}
          </div>

          {visible.length === 0 ? (
            <div style={{ color: "#687078", fontSize: 13, padding: 16 }}>No items in this tab yet.</div>
          ) : null}
        </section>
      </div>
    </main>
  );
}

const row = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  gap: 14,
  alignItems: "center",
  border: "1px solid #d8d3c8",
  borderRadius: 8,
  background: "#ffffff",
  padding: 13,
};

const tabButton = {
  border: "1px solid #d8d3c8",
  borderRadius: 999,
  padding: "7px 11px",
  fontSize: 12,
  fontWeight: 700,
  cursor: "pointer",
};

const pill = {
  border: "1px solid #d8d3c8",
  borderRadius: 999,
  background: "#f8f7f4",
  color: "#687078",
  padding: "4px 8px",
  fontSize: 11,
};

function statusPill(status: PublishItem["status"]) {
  const map = {
    Draft: { background: "#f8f7f4", color: "#687078", borderColor: "#d8d3c8" },
    Scheduled: { background: "#f8efd9", color: "#854f0b", borderColor: "rgba(133, 79, 11, 0.35)" },
    Published: { background: "#e9f5ee", color: "#25633f", borderColor: "rgba(59, 143, 99, 0.35)" },
    Failed: { background: "#f8e6e3", color: "#9d3c35", borderColor: "rgba(157, 60, 53, 0.35)" },
  }[status];

  return {
    ...pill,
    ...map,
  };
}

const miniButton = {
  border: "1px solid #d8d3c8",
  borderRadius: 7,
  background: "#ffffff",
  color: "#1f2529",
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
  borderColor: "rgba(157, 60, 53, 0.35)",
  color: "#9d3c35",
};

const disabledMiniButton = {
  ...miniButton,
  background: "#f8f7f4",
  color: "#687078",
  cursor: "not-allowed",
  opacity: 0.78,
};

const disabledDangerButton = {
  ...dangerButton,
  background: "#f8f7f4",
  color: "#9d3c35",
  cursor: "not-allowed",
  opacity: 0.78,
};
