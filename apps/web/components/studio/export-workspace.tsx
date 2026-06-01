"use client";

import { useState } from "react";

const scopes = [
  "Personas",
  "Chats",
  "Documents",
  "Archive items",
  "Published posts",
  "Notes",
  "Settings",
];

const packages = [
  { id: "export-1", name: "Full workspace export", created: "Today", status: "Ready", expires: "48 hours" },
  { id: "export-2", name: "Persona archive bundle", created: "Last week", status: "Expired", expires: "Expired" },
];

export function ExportWorkspace() {
  const [selectedScopes, setSelectedScopes] = useState(scopes);
  const [formatJson, setFormatJson] = useState(true);
  const [formatMarkdown, setFormatMarkdown] = useState(true);
  const [includePrivate, setIncludePrivate] = useState(true);

  function toggleScope(scope: string) {
    setSelectedScopes((current) => current.includes(scope) ? current.filter((item) => item !== scope) : [...current, scope]);
  }

  return (
    <main style={{ minHeight: "calc(100vh - 52px)", background: "#0b0e14" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "24px clamp(16px, 4vw, 32px) 48px" }}>
        <header style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 20 }}>
          <div>
            <div style={{ color: "#93c5fd", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 800 }}>
              Data Portability
            </div>
            <h1 style={{ margin: "8px 0 6px", color: "#f8fafc", fontSize: "clamp(30px, 5vw, 46px)", lineHeight: 1.05 }}>
              Export Workspace
            </h1>
            <p style={{ margin: 0, color: "#a9b0bd", fontSize: 15, lineHeight: 1.6, maxWidth: 720 }}>
              Generate a downloadable package of personas, chats, documents, archive materials, notes, and published content.
            </p>
          </div>
          <button type="button" style={primaryButton}>Generate export</button>
        </header>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 330px", gap: 18, alignItems: "start" }}>
          <section style={panel}>
            <SectionTitle title="Export contents" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
              {scopes.map((scope) => (
                <label key={scope} style={scopeCard}>
                  <input type="checkbox" checked={selectedScopes.includes(scope)} onChange={() => toggleScope(scope)} />
                  <span>
                    <span style={{ display: "block", color: "#f8fafc", fontSize: 14, fontWeight: 800 }}>{scope}</span>
                    <span style={{ display: "block", color: "#8ea0b8", fontSize: 12, marginTop: 4 }}>Include in package</span>
                  </span>
                </label>
              ))}
            </div>

            <div style={{ borderTop: "1px solid #202938", marginTop: 18, paddingTop: 18 }}>
              <SectionTitle title="Formats" />
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <label style={checkRow}>
                  <input type="checkbox" checked={formatJson} onChange={(event) => setFormatJson(event.target.checked)} />
                  JSON
                </label>
                <label style={checkRow}>
                  <input type="checkbox" checked={formatMarkdown} onChange={(event) => setFormatMarkdown(event.target.checked)} />
                  Markdown
                </label>
                <label style={checkRow}>
                  <input type="checkbox" checked={includePrivate} onChange={(event) => setIncludePrivate(event.target.checked)} />
                  Include private materials
                </label>
              </div>
            </div>

            <div style={{ borderTop: "1px solid #202938", marginTop: 18, paddingTop: 18 }}>
              <SectionTitle title="Background job" />
              <div style={jobBox}>
                <div>
                  <div style={{ color: "#f8fafc", fontSize: 14, fontWeight: 800 }}>Ready to generate</div>
                  <div style={{ color: "#8ea0b8", fontSize: 12, marginTop: 5 }}>
                    Export generation will run in the background and notify the user when the download is ready.
                  </div>
                </div>
                <span style={statusPill}>Queued</span>
              </div>
            </div>
          </section>

          <aside style={{ display: "grid", gap: 14 }}>
            <section style={panel}>
              <SectionTitle title="Package summary" />
              <div style={{ display: "grid", gap: 9, color: "#cbd5e1", fontSize: 13 }}>
                <SummaryRow label="Scopes" value={selectedScopes.length.toString()} />
                <SummaryRow label="JSON" value={formatJson ? "Included" : "Off"} />
                <SummaryRow label="Markdown" value={formatMarkdown ? "Included" : "Off"} />
                <SummaryRow label="Private data" value={includePrivate ? "Included" : "Excluded"} />
                <SummaryRow label="Download expiry" value="48 hours" />
              </div>
            </section>

            <section style={panel}>
              <SectionTitle title="Recent exports" />
              <div style={{ display: "grid", gap: 10 }}>
                {packages.map((item) => (
                  <article key={item.id} style={packageRow}>
                    <div>
                      <div style={{ color: "#f8fafc", fontSize: 13, fontWeight: 800 }}>{item.name}</div>
                      <div style={{ color: "#8ea0b8", fontSize: 12, marginTop: 4 }}>{item.created} - expires {item.expires}</div>
                    </div>
                    <button type="button" style={item.status === "Ready" ? miniButton : disabledButton}>
                      {item.status === "Ready" ? "Download" : "Expired"}
                    </button>
                  </article>
                ))}
              </div>
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

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, borderBottom: "1px solid #202938", paddingBottom: 8 }}>
      <span style={{ color: "#8ea0b8" }}>{label}</span>
      <span style={{ color: "#f8fafc", fontWeight: 700 }}>{value}</span>
    </div>
  );
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

const scopeCard = {
  display: "flex",
  alignItems: "flex-start",
  gap: 10,
  border: "1px solid #202938",
  borderRadius: 8,
  background: "#0d1420",
  padding: 12,
  cursor: "pointer",
};

const checkRow = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  color: "#d1d5db",
  fontSize: 13,
};

const jobBox = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  border: "1px solid #202938",
  borderRadius: 8,
  background: "#0d1420",
  padding: 12,
};

const statusPill = {
  border: "1px solid #6b4e0c",
  borderRadius: 999,
  background: "#2d2108",
  color: "#facc15",
  padding: "5px 8px",
  fontSize: 11,
  fontWeight: 800,
};

const packageRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 10,
  border: "1px solid #202938",
  borderRadius: 8,
  background: "#0d1420",
  padding: 11,
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

const disabledButton = {
  ...miniButton,
  color: "#687386",
  cursor: "not-allowed",
};
