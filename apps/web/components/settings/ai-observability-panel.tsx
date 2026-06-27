"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { apiGet } from "@/lib/api-client";
import {
  AiTraceDetail,
  formatDate,
  formatDuration,
  formatPence,
  formatTokens,
  sanitizedFailureMessage,
  sanitizedTraceDetailErrorMessage,
  statusTone,
  traceDetailOperationalFacts,
  traceEventOperationalFacts,
  traceEventTitle,
  traceListEmptyStateCopy,
  traceOperationalFacts,
  traceSourceLabel,
  traceStatusLabel,
  traceTokenTotal,
} from "@/lib/ai-observability-ui";
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
  status: "running" | "completed" | "failed" | "skipped";
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
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedTraceId, setSelectedTraceId] = useState<string | null>(null);
  const [traceDetail, setTraceDetail] = useState<AiTraceDetail | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const detailRequestRef = useRef(0);

  useEffect(() => {
    getSession().then(async (session) => {
      if (!session) return;
      const token = session.accessToken ?? session.access_token;
      setToken(token);

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

  async function loadTraceDetail(traceId: string) {
    if (selectedTraceId === traceId) {
      detailRequestRef.current += 1;
      setSelectedTraceId(null);
      setTraceDetail(null);
      setDetailError(null);
      setDetailLoading(false);
      return;
    }

    const requestId = detailRequestRef.current + 1;
    detailRequestRef.current = requestId;
    setSelectedTraceId(traceId);
    setTraceDetail(null);
    setDetailError(null);
    setDetailLoading(true);

    try {
      const fallbackSession = token ? null : await getSession();
      const activeToken = token ?? fallbackSession?.accessToken ?? fallbackSession?.access_token;
      if (!activeToken) throw new Error("Sign in again to view trace details.");
      const detail = await apiGet<AiTraceDetail>(`/observability/traces/${encodeURIComponent(traceId)}`, activeToken);
      if (detailRequestRef.current === requestId) setTraceDetail(detail);
    } catch (e) {
      if (detailRequestRef.current === requestId) {
        setDetailError(sanitizedTraceDetailErrorMessage(e instanceof Error ? e.message : null));
      }
    } finally {
      if (detailRequestRef.current === requestId) setDetailLoading(false);
    }
  }

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
              <Fragment key={trace.id}>
                <div style={traceRow}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                      <span style={{ color: "#e5e7eb", fontSize: 12, fontWeight: 800 }}>{traceSourceLabel(trace.source)}</span>
                      <span style={{ ...statusPill, color: statusTone(trace.status) }}>{traceStatusLabel(trace.status)}</span>
                    </div>
                    <div style={{ color: "#7d8796", fontSize: 11, marginTop: 4 }}>
                      {formatDate(trace.started_at)}
                      {trace.duration_ms ? ` / ${formatDuration(trace.duration_ms)}` : ""}
                      {sanitizedFailureMessage(trace.error_message) ? ` / ${sanitizedFailureMessage(trace.error_message)}` : ""}
                    </div>
                    <div style={factList}>
                      {traceOperationalFacts(trace).map((fact) => (
                        <span key={fact} style={factPill}>{fact}</span>
                      ))}
                    </div>
                  </div>
                  <div style={traceActions}>
                    <div style={{ color: "#a9b0bd", fontSize: 12, fontWeight: 800 }}>
                      {formatTokens(traceTokenTotal(trace))}
                    </div>
                    <button
                      type="button"
                      onClick={() => void loadTraceDetail(trace.id)}
                      style={detailButton}
                    >
                      {selectedTraceId === trace.id ? "Close" : "View details"}
                    </button>
                  </div>
                </div>
                {selectedTraceId === trace.id ? (
                  <TraceDetailPanel
                    detail={traceDetail}
                    error={detailError}
                    loading={detailLoading}
                  />
                ) : null}
              </Fragment>
            ))}
          </div>
        ) : (
          <p style={{ margin: 0, color: "#8ea0b8", fontSize: 12, lineHeight: 1.5 }}>
            {traceListEmptyStateCopy(summary)}
          </p>
        )}
      </div>
    </div>
  );
}

function TraceDetailPanel({
  detail,
  error,
  loading,
}: {
  detail: AiTraceDetail | null;
  error: string | null;
  loading: boolean;
}) {
  if (loading) {
    return <div style={detailPanel}>Loading trace details...</div>;
  }

  if (error) {
    return <div style={{ ...detailPanel, color: "#fca5a5" }}>{error}</div>;
  }

  if (!detail) {
    return <div style={detailPanel}>Select a trace to view sanitized operational detail.</div>;
  }

  return (
    <div style={detailPanel}>
      <div style={{ display: "grid", gap: 8 }}>
        <div>
          <div style={detailHeading}>Trace detail</div>
          <div style={{ color: "#7d8796", fontSize: 11, marginTop: 4 }}>
            {detail.trace.startedAt ? formatDate(detail.trace.startedAt) : "Start time unavailable"}
            {detail.trace.completedAt ? ` / completed ${formatDate(detail.trace.completedAt)}` : ""}
          </div>
          <div style={factList}>
            {traceDetailOperationalFacts(detail.trace).map((fact) => (
              <span key={fact} style={factPill}>{fact}</span>
            ))}
          </div>
        </div>

        <div style={{ borderTop: "1px solid #253044", paddingTop: 8 }}>
          <div style={detailHeading}>Event timeline</div>
          {detail.events.length ? (
            <div style={{ display: "grid", gap: 7, marginTop: 7 }}>
              {detail.events.map((event, index) => (
                <div key={`${event.createdAt ?? "event"}-${index}`} style={eventRow}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                    <span style={{ color: "#e5e7eb", fontSize: 12, fontWeight: 800 }}>{traceEventTitle(event)}</span>
                    <span style={{ ...statusPill, color: statusTone(event.status) }}>{traceStatusLabel(event.status)}</span>
                  </div>
                  <div style={{ color: "#7d8796", fontSize: 11, marginTop: 4 }}>
                    {event.createdAt ? formatDate(event.createdAt) : "Event time unavailable"}
                  </div>
                  <div style={factList}>
                    {traceEventOperationalFacts(event).map((fact) => (
                      <span key={fact} style={factPill}>{fact}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ margin: "7px 0 0", color: "#8ea0b8", fontSize: 12, lineHeight: 1.5 }}>
              This trace has no recorded events.
            </p>
          )}
        </div>
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
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  alignItems: "start",
  justifyContent: "space-between",
  gap: 10,
  border: "1px solid #253044",
  borderRadius: 8,
  padding: 9,
  background: "#0c1320",
};

const traceActions = {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  flexWrap: "wrap" as const,
  gap: 8,
};

const detailButton = {
  border: "1px solid #334155",
  borderRadius: 6,
  background: "#111827",
  color: "#e5e7eb",
  cursor: "pointer",
  fontSize: 11,
  fontWeight: 800,
  padding: "6px 8px",
};

const detailPanel = {
  border: "1px solid #253044",
  borderRadius: 8,
  background: "#080d16",
  color: "#a9b0bd",
  fontSize: 12,
  lineHeight: 1.5,
  minWidth: 0,
  overflowWrap: "anywhere" as const,
  padding: 10,
};

const detailHeading = {
  color: "#f8fafc",
  fontSize: 12,
  fontWeight: 800,
};

const eventRow = {
  border: "1px solid #1d283a",
  borderRadius: 8,
  background: "#0c1320",
  padding: 8,
};

const factList = {
  display: "flex",
  flexWrap: "wrap" as const,
  gap: 6,
  marginTop: 8,
};

const factPill = {
  border: "1px solid #253044",
  borderRadius: 6,
  color: "#a9b0bd",
  fontSize: 10,
  fontWeight: 700,
  maxWidth: "100%",
  overflowWrap: "anywhere" as const,
  padding: "3px 6px",
};

const statusPill = {
  border: "1px solid #334155",
  borderRadius: 999,
  padding: "2px 7px",
  fontSize: 10,
  fontWeight: 800,
  textTransform: "uppercase" as const,
};
