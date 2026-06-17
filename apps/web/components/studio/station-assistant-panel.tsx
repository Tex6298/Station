"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { apiGet, apiPost } from "@/lib/api-client";
import { getSession } from "@/lib/auth";
import { assistantActionStatusLabel } from "@/lib/station-assistant-ui";

type AssistantAction = {
  id: string;
  kind: "studio_setup" | "import_review" | "import_issue" | "import_progress" | "archive_search" | "publishing" | "integrity" | "export" | "quota_config";
  label: string;
  detail: string;
  href: string;
  priority: "critical" | "high" | "normal";
  count?: number;
  status?: string;
  deferred?: boolean;
};

type AssistantSummary = {
  counts: {
    personas: number;
    activeConversations: number;
    archivedConversations: number;
    memoryItems: number;
    canonItems: number;
    pendingContinuityCandidates: number;
    draftDocuments: number;
    publishedDocuments: number;
    pendingImports: number;
    failedImports: number;
    spaces: number;
    developerSpaces: number;
    exportPackages: number;
  };
  recent: {
    personas: Array<{ id: string; name: string; visibility?: string | null }>;
    imports: Array<{ id: string; sourceName: string; status: string; updatedAt?: string | null }>;
    documents: Array<{ id: string; title: string; status: string; documentType?: string | null }>;
  };
  nextActions: AssistantAction[];
};

type AssistantReply = {
  role: "assistant";
  intent: string;
  content: string;
  actions: AssistantAction[];
  summary: AssistantSummary;
  guardrail: string;
};

const starterPrompts = [
  "What should I finish next?",
  "Help me clean up archive imports.",
  "How should I publish this safely?",
  "What continuity work is pending?",
];

export function StationAssistantPanel() {
  const [token, setToken] = useState<string | null>(null);
  const [summary, setSummary] = useState<AssistantSummary | null>(null);
  const [message, setMessage] = useState("What should I finish next?");
  const [reply, setReply] = useState<AssistantReply | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSession().then(async (session) => {
      if (!session) {
        setLoading(false);
        return;
      }

      setToken(session.access_token);
      try {
        const data = await apiGet<{ summary: AssistantSummary }>("/assistant/summary", session.access_token);
        setSummary(data.summary);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load Station Assistant.");
      } finally {
        setLoading(false);
      }
    });
  }, []);

  const actions = useMemo(() => reply?.actions ?? summary?.nextActions ?? [], [reply, summary]);

  async function askAssistant(nextMessage?: string) {
    const content = (nextMessage ?? message).trim();
    if (!content || !token || sending) return;
    setSending(true);
    setError(null);
    setMessage(content);

    try {
      const data = await apiPost<{ reply: AssistantReply }>("/assistant/message", { message: content }, token);
      setReply(data.reply);
      setSummary(data.reply.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Station Assistant failed.");
    } finally {
      setSending(false);
    }
  }

  if (loading) return <main style={page}><section style={panel}>Loading Station Assistant...</section></main>;

  if (!token) {
    return (
      <main style={page}>
        <section style={panel}>
          <h1 style={title}>Station Assistant</h1>
          <p style={muted}>Sign in to use the operational helper for Studio, archive, publishing, and exports.</p>
          <Link href="/login" style={primaryLink}>Sign in</Link>
        </section>
      </main>
    );
  }

  return (
    <main style={page}>
      <div style={{ maxWidth: 1180, margin: "0 auto", display: "grid", gap: 18 }}>
        <header style={{ display: "grid", gap: 8 }}>
          <div style={eyebrow}>Operational helper</div>
          <h1 style={title}>Station Assistant</h1>
          <p style={{ ...muted, maxWidth: 760 }}>
            This helper is not a persona. It routes archive, Memory/Canon, publishing, Space, export, and quota work without creating its own canon or continuity.
          </p>
        </header>

        {error ? <div style={errorBox}>{error}</div> : null}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))", gap: 18, alignItems: "start" }}>
          <section style={panel}>
            <h2 style={sectionTitle}>Ask what to do</h2>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
              {starterPrompts.map((prompt) => (
                <button key={prompt} type="button" onClick={() => askAssistant(prompt)} style={promptButton} disabled={sending}>
                  {prompt}
                </button>
              ))}
            </div>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Ask about archive, publishing, continuity, export, quota, forums, or Spaces..."
              style={textarea}
            />
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap", marginTop: 12 }}>
              <span style={mutedSmall}>Human review remains required before public publishing.</span>
              <button type="button" onClick={() => askAssistant()} disabled={sending || !message.trim()} style={primaryButton}>
                {sending ? "Checking..." : "Ask Assistant"}
              </button>
            </div>

            {reply ? (
              <article style={{ ...panelInset, marginTop: 16 }}>
                <div style={eyebrow}>Intent: {reply.intent.replace(/_/g, " ")}</div>
                <p style={{ color: "#dbeafe", whiteSpace: "pre-wrap", lineHeight: 1.65, margin: "8px 0 0" }}>{reply.content}</p>
                <p style={guardrail}>{reply.guardrail}</p>
              </article>
            ) : null}
          </section>

          <aside style={{ display: "grid", gap: 14 }}>
            <section style={panel}>
              <h2 style={sectionTitle}>Workspace signals</h2>
              {summary ? <CountsGrid summary={summary} /> : <p style={muted}>No summary loaded.</p>}
            </section>

            <section style={panel}>
              <h2 style={sectionTitle}>Next actions</h2>
              <div style={{ display: "grid", gap: 8 }}>
                {actions.map((action) => (
                  <Link key={action.id} href={action.href} style={actionLink(action.priority)}>
                    <span style={{ display: "grid", gap: 4, minWidth: 0 }}>
                      <span style={{ overflowWrap: "anywhere" }}>{action.label}</span>
                      <span style={actionDetail}>{action.detail}</span>
                    </span>
                    <span style={actionMeta}>{assistantActionStatusLabel(action)}</span>
                  </Link>
                ))}
              </div>
            </section>

            {summary?.recent.imports.length ? (
              <section style={panel}>
                <h2 style={sectionTitle}>Recent imports</h2>
                <div style={{ display: "grid", gap: 8 }}>
                  {summary.recent.imports.map((item) => (
                    <div key={item.id} style={miniRow}>
                      <span>{item.sourceName}</span>
                      <strong>{item.status}</strong>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
          </aside>
        </div>
      </div>
    </main>
  );
}

function CountsGrid({ summary }: { summary: AssistantSummary }) {
  const c = summary.counts;
  const items = [
    ["Personas", c.personas],
    ["Memory", c.memoryItems],
    ["Canon", c.canonItems],
    ["Candidates", c.pendingContinuityCandidates],
    ["Drafts", c.draftDocuments],
    ["Imports", c.pendingImports + c.failedImports],
    ["Spaces", c.spaces],
    ["Exports", c.exportPackages],
  ] as const;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
      {items.map(([label, value]) => (
        <div key={label} style={statBox}>
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
      ))}
    </div>
  );
}

const page: CSSProperties = {
  minHeight: "calc(100vh - 52px)",
  background: "#0b0e14",
  padding: "24px 16px 48px",
};

const panel: CSSProperties = {
  border: "1px solid #263244",
  background: "#101622",
  borderRadius: 10,
  padding: 16,
};

const panelInset: CSSProperties = {
  border: "1px solid #2c3b53",
  background: "#0d1420",
  borderRadius: 10,
  padding: 14,
};

const eyebrow: CSSProperties = {
  color: "#93c5fd",
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: 0,
  fontWeight: 800,
};

const title: CSSProperties = {
  margin: 0,
  color: "#f8fafc",
  fontSize: 34,
  lineHeight: 1.05,
};

const sectionTitle: CSSProperties = {
  margin: "0 0 12px",
  color: "#f8fafc",
  fontSize: 16,
};

const muted: CSSProperties = {
  margin: 0,
  color: "#a9b0bd",
  fontSize: 14,
  lineHeight: 1.6,
};

const mutedSmall: CSSProperties = {
  color: "#8ea0b8",
  fontSize: 12,
};

const textarea: CSSProperties = {
  width: "100%",
  minHeight: 180,
  resize: "vertical",
  border: "1px solid #334155",
  borderRadius: 10,
  background: "#0d1420",
  color: "#f8fafc",
  padding: 12,
  fontSize: 14,
  lineHeight: 1.55,
  fontFamily: "inherit",
};

const primaryButton: CSSProperties = {
  border: "1px solid #2563eb",
  borderRadius: 8,
  background: "#2563eb",
  color: "#fff",
  padding: "10px 14px",
  fontSize: 13,
  fontWeight: 800,
  cursor: "pointer",
};

const primaryLink: CSSProperties = {
  ...primaryButton,
  display: "inline-flex",
  marginTop: 14,
  textDecoration: "none",
};

const promptButton: CSSProperties = {
  border: "1px solid #334155",
  borderRadius: 999,
  background: "#0d1420",
  color: "#cbd5e1",
  padding: "8px 11px",
  fontSize: 12,
  fontWeight: 700,
  cursor: "pointer",
};

const guardrail: CSSProperties = {
  margin: "12px 0 0",
  borderTop: "1px solid #263244",
  paddingTop: 10,
  color: "#8ea0b8",
  fontSize: 12,
  lineHeight: 1.5,
};

const statBox: CSSProperties = {
  border: "1px solid #263244",
  borderRadius: 8,
  padding: 10,
  background: "#0d1420",
  display: "grid",
  gap: 4,
  color: "#94a3b8",
  fontSize: 12,
};

const miniRow: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 10,
  border: "1px solid #263244",
  borderRadius: 8,
  padding: 10,
  color: "#cbd5e1",
  fontSize: 12,
};

const errorBox: CSSProperties = {
  border: "1px solid #7f1d1d",
  background: "#2a1115",
  color: "#fecaca",
  borderRadius: 8,
  padding: 12,
};

const actionDetail: CSSProperties = {
  color: "#94a3b8",
  fontSize: 12,
  lineHeight: 1.35,
  fontWeight: 500,
  overflowWrap: "anywhere",
};

const actionMeta: CSSProperties = {
  flex: "0 0 auto",
  border: "1px solid #334155",
  borderRadius: 999,
  padding: "3px 7px",
  fontSize: 10,
  color: "#cbd5e1",
  textTransform: "uppercase",
  letterSpacing: 0,
};

function actionLink(priority: AssistantAction["priority"]): CSSProperties {
  return {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    minHeight: 58,
    border: `1px solid ${priority === "critical" ? "#92400e" : priority === "high" ? "#2563eb" : "#334155"}`,
    borderRadius: 8,
    background: priority === "high" ? "#13233d" : priority === "critical" ? "#21160b" : "#0d1420",
    color: priority === "critical" ? "#fed7aa" : priority === "high" ? "#dbeafe" : "#cbd5e1",
    padding: "10px 11px",
    textDecoration: "none",
    fontSize: 13,
    fontWeight: 800,
  };
}
