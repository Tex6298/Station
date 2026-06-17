"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

const formats = ["Essay", "Codex", "Manifesto", "Field Log", "Research Document", "Archive Note"];
const subreddits = ["r/artificial", "r/ChatGPT", "r/LocalLLaMA"];
const connectors = ["X / Twitter", "LinkedIn", "Instagram", "YouTube", "TikTok", "Facebook", "Substack"];

export function PublishFlow() {
  const [format, setFormat] = useState("Essay");
  const [title, setTitle] = useState("Untitled Station draft");
  const [body, setBody] = useState("");
  const [stationBlog, setStationBlog] = useState(true);
  const [redditEnabled, setRedditEnabled] = useState(false);
  const [schedule, setSchedule] = useState("now");

  const wordCount = useMemo(() => body.trim().split(/\s+/).filter(Boolean).length, [body]);
  const readTime = Math.max(1, Math.ceil(wordCount / 220));

  return (
    <main style={{ minHeight: "calc(100vh - 52px)", background: "#0b0e14" }}>
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "24px clamp(16px, 4vw, 32px) 48px" }}>
        <header style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 20 }}>
          <div>
            <div style={{ color: "#93c5fd", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 800 }}>
              Publish Flow
            </div>
            <h1 style={{ margin: "8px 0 6px", color: "#f8fafc", fontSize: "clamp(30px, 5vw, 46px)", lineHeight: 1.05 }}>
              Prepare a Station document.
            </h1>
            <p style={{ margin: 0, color: "#a9b0bd", fontSize: 15, lineHeight: 1.6, maxWidth: 720 }}>
              Draft long-form writing, preview metadata, and stage publication from one workspace. External social dispatch stays behind connector readiness checks.
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
            <Link href="/studio/publishing" style={secondaryLink}>Dashboard</Link>
            <button type="button" style={secondaryButton}>Preview</button>
            <button type="button" style={secondaryButton}>Save draft</button>
            <button type="button" style={primaryButton}>Publish</button>
          </div>
        </header>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 340px", gap: 18, alignItems: "start" }}>
          <section style={panel}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
              {formats.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setFormat(item)}
                  style={{
                    ...pillButton,
                    borderColor: item === format ? "#2563eb" : "#334155",
                    background: item === format ? "#13233d" : "#0d1420",
                    color: item === format ? "#dbeafe" : "#cbd5e1",
                  }}
                >
                  {item}
                </button>
              ))}
            </div>

            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              style={titleInput}
              aria-label="Document title"
            />

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", borderBottom: "1px solid #202938", borderTop: "1px solid #202938", padding: "11px 0", margin: "14px 0" }}>
              {["B", "I", "U", "Heading", "List", "Quote", "Link", "Image", "Video", "Tag"].map((item) => (
                <button key={item} type="button" style={toolButton}>{item}</button>
              ))}
            </div>

            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="Write the document body..."
              style={editor}
            />

            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", borderTop: "1px solid #202938", paddingTop: 12, color: "#8ea0b8", fontSize: 12 }}>
              <span>{format} metadata</span>
              <span>{wordCount} words - {readTime} min read</span>
            </div>
          </section>

          <aside style={{ display: "grid", gap: 14 }}>
            <section style={panel}>
              <SectionTitle title="Station" />
              <label style={checkRow}>
                <input type="checkbox" checked={stationBlog} onChange={(event) => setStationBlog(event.target.checked)} />
                Station document
              </label>
              <div style={helperText}>Publishes to your public Space document library by default.</div>
              <Link href="/space" style={inlineLink}>Review public Space</Link>
            </section>

            <section style={panel}>
              <SectionTitle title="Reddit" />
              <label style={checkRow}>
                <input type="checkbox" checked={redditEnabled} onChange={(event) => setRedditEnabled(event.target.checked)} />
                Include Reddit
              </label>
              <div style={helperText}>OAuth posting will use the user account and subreddit rules.</div>
              <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
                {subreddits.map((subreddit) => (
                  <label key={subreddit} style={subredditRow}>
                    <input type="checkbox" disabled={!redditEnabled} />
                    {subreddit}
                  </label>
                ))}
              </div>
              <button type="button" style={{ ...secondaryButton, width: "100%", marginTop: 12 }}>Add subreddit</button>
            </section>

            <section style={panel}>
              <SectionTitle title="Social Connectors" />
              <div style={{ display: "grid", gap: 8 }}>
                {connectors.map((connector) => (
                  <div key={connector} style={connectorRow}>
                    <span>{connector}</span>
                    <button type="button" style={miniButton}>Connect</button>
                  </div>
                ))}
              </div>
            </section>

            <section style={panel}>
              <SectionTitle title="Scheduling" />
              <label style={checkRow}>
                <input type="radio" checked={schedule === "now"} onChange={() => setSchedule("now")} />
                Publish immediately
              </label>
              <label style={checkRow}>
                <input type="radio" checked={schedule === "later"} onChange={() => setSchedule("later")} />
                Schedule
              </label>
              {schedule === "later" ? (
                <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
                  <input type="datetime-local" style={input} />
                  <select style={input} defaultValue="Europe/London">
                    <option value="Europe/London">Europe/London</option>
                    <option value="America/New_York">America/New_York</option>
                    <option value="America/Los_Angeles">America/Los_Angeles</option>
                  </select>
                </div>
              ) : null}
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <h2 style={{ margin: "0 0 12px", color: "#f8fafc", fontSize: 16 }}>{title}</h2>;
}

const panel = {
  border: "1px solid #263244",
  background: "#101622",
  borderRadius: 8,
  padding: 16,
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

const secondaryButton = {
  ...primaryButton,
  background: "#111827",
  borderColor: "#334155",
  color: "#d1d5db",
};

const secondaryLink = {
  ...secondaryButton,
  textDecoration: "none",
};

const pillButton = {
  border: "1px solid #334155",
  borderRadius: 999,
  padding: "7px 11px",
  fontSize: 12,
  fontWeight: 700,
  cursor: "pointer",
};

const titleInput = {
  width: "100%",
  border: 0,
  outline: "none",
  background: "transparent",
  color: "#f8fafc",
  fontSize: 34,
  fontWeight: 800,
  lineHeight: 1.15,
};

const toolButton = {
  border: "1px solid #334155",
  borderRadius: 7,
  background: "#0d1420",
  color: "#dbeafe",
  padding: "7px 10px",
  fontSize: 12,
  fontWeight: 700,
  cursor: "pointer",
};

const editor = {
  width: "100%",
  minHeight: 520,
  resize: "vertical" as const,
  border: 0,
  outline: "none",
  background: "transparent",
  color: "#f8fafc",
  fontSize: 16,
  lineHeight: 1.75,
  fontFamily: "inherit",
};

const checkRow = {
  display: "flex",
  alignItems: "center",
  gap: 9,
  color: "#d1d5db",
  fontSize: 13,
  marginBottom: 9,
};

const helperText = {
  color: "#8ea0b8",
  fontSize: 12,
  lineHeight: 1.45,
};

const inlineLink = {
  display: "inline-flex",
  marginTop: 10,
  color: "#93c5fd",
  fontSize: 12,
  textDecoration: "none",
};

const subredditRow = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  border: "1px solid #202938",
  borderRadius: 8,
  background: "#0d1420",
  padding: 9,
  color: "#cbd5e1",
  fontSize: 13,
};

const connectorRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 8,
  border: "1px solid #202938",
  borderRadius: 8,
  background: "#0d1420",
  padding: 9,
  color: "#cbd5e1",
  fontSize: 13,
};

const miniButton = {
  border: "1px solid #334155",
  borderRadius: 7,
  background: "#111827",
  color: "#dbeafe",
  padding: "5px 8px",
  fontSize: 12,
  cursor: "pointer",
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
