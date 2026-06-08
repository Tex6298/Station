"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api-client";
import { getSession } from "@/lib/auth";

type ObservabilitySummary = {
  windowDays: number;
  traceCount: number;
  failedTraceCount: number;
  totalTokens: number;
  totalEstimatedCostPence: number;
  averageLatencyMs: number;
};

type AiTrace = {
  id: string;
  source: string;
  status: "running" | "completed" | "failed";
  started_at: string;
  duration_ms: number | null;
  total_input_tokens: number;
  total_output_tokens: number;
  total_estimated_cost_pence: number;
  error_message: string | null;
  metadata?: Record<string, unknown>;
};

export function AiObservabilityPanel() {
  const [summary, setSummary] = useState<ObservabilitySummary | null>(null);
  const [traces, setTraces] = useState<AiTrace[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSession().then(async (session) => {
      if (!session) return;
      const token = session.accessToken ?? session.access_token;

      try {
        const [summaryData, traceData] = await Promise.all([
          apiGet<{ summary: ObservabilitySummary }>("/observability/summary", token),
          apiGet<{ traces: AiTrace[] }>("/observability/traces?limit=6", token),
        ]);
        setSummary(summaryData.summary);
        setTraces(traceData.traces);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not load AI observability.");
      }
    });
  }, []);

  if (error) return <p style={{ margin: 0, color: "#fca5a5", fontSize: 12 }}>{error}</p>;
  if (!summary) return <p style={{ margin: 0, color: "#7d8796", fontSize: 12 }}>Loading AI activity...</p>;

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <Metric label="7-day traces" value={summary.traceCount.toLocaleString()} />
        <Metric label="Errors" value={summary.failedTraceCount.toLocaleString()} tone={summary.failedTraceCount > 0 ? "#fca5a5" : undefined} />
        <Metric label="Tokens" value={formatTokens(summary.totalTokens)} />
        <Metric label="Est. cost" value={formatPence(summary.totalEstimatedCostPence)} />
      </div>

      <div style={{ borderTop: "1px solid #253044", paddingTop: 10 }}>
        <div style={{ color: "#f8fafc", fontSize: 13, fontWeight: 800, marginBottom: 8 }}>Recent traces</div>
        {traces.length ? (
          <div style={{ display: "grid", gap: 8 }}>
            {traces.map((trace) => (
              <div key={trace.id} style={traceRow}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                    <span style={{ color: "#e5e7eb", fontSize: 12, fontWeight: 800 }}>{sourceLabel(trace.source)}</span>
                    <span style={{ ...statusPill, color: statusTone(trace.status) }}>{trace.status}</span>
                  </div>
                  <div style={{ color: "#7d8796", fontSize: 11, marginTop: 4 }}>
                    {formatDate(trace.started_at)}
                    {trace.duration_ms ? ` / ${formatDuration(trace.duration_ms)}` : ""}
                    {trace.error_message ? ` / ${trace.error_message}` : ""}
                  </div>
                </div>
                <div style={{ color: "#a9b0bd", fontSize: 12, fontWeight: 800, whiteSpace: "nowrap" }}>
                  {formatTokens((trace.total_input_tokens ?? 0) + (trace.total_output_tokens ?? 0))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ margin: 0, color: "#8ea0b8", fontSize: 12, lineHeight: 1.5 }}>
            New chat and integrity AI calls will appear here after the next run.
          </p>
        )}
      </div>
    </div>
  );
}

function Metric({ label, value, tone = "#e5e7eb" }: { label: string; value: string; tone?: string }) {
  return (
    <div style={{ border: "1px solid #253044", borderRadius: 8, padding: 9, background: "#0c1320" }}>
      <div style={{ color: "#687386", fontSize: 11 }}>{label}</div>
      <div style={{ color: tone, fontSize: 13, fontWeight: 800, marginTop: 3 }}>{value}</div>
    </div>
  );
}

const traceRow = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
  border: "1px solid #253044",
  borderRadius: 8,
  padding: 9,
  background: "#0c1320",
};

const statusPill = {
  border: "1px solid #334155",
  borderRadius: 999,
  padding: "2px 7px",
  fontSize: 10,
  fontWeight: 800,
  textTransform: "uppercase" as const,
};

function sourceLabel(source: string) {
  return source.replace(/_/g, " ");
}

function statusTone(status: AiTrace["status"]) {
  if (status === "failed") return "#fca5a5";
  if (status === "running") return "#facc15";
  return "#86efac";
}

function formatTokens(tokens: number) {
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(tokens >= 10_000_000 ? 0 : 1)}M`;
  if (tokens >= 1_000) return `${Math.round(tokens / 1_000)}K`;
  return tokens.toLocaleString();
}

function formatPence(pence: number) {
  if (pence < 1) return `${pence.toFixed(2)}p`;
  return `GBP ${(pence / 100).toFixed(2)}`;
}

function formatDuration(ms: number) {
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
  return `${ms}ms`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}
