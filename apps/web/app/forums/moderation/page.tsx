"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { ModerationReportRecord } from "@station/types";
import { apiGet, apiPatch } from "@/lib/api-client";
import { getSession } from "@/lib/auth";
import {
  REPORT_QUEUE_STATUSES,
  REPORT_TARGET_TYPES,
  type ReportQueueStatus,
  type ReportTargetType,
  type ReportTransitionStatus,
  canUseModeratorConsole,
  nextReportStatuses,
  reportQueuePath,
  reportTargetLabel,
} from "@/lib/moderation-console";

type QueueStatusFilter = ReportQueueStatus | "active";
type TargetTypeFilter = ReportTargetType | "all";

function formatDate(value?: string | null) {
  if (!value) return "Not reviewed";
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function ForumModerationPage() {
  const [token, setToken] = useState<string | null>(null);
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reports, setReports] = useState<ModerationReportRecord[]>([]);
  const [status, setStatus] = useState<QueueStatusFilter>("active");
  const [targetType, setTargetType] = useState<TargetTypeFilter>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadReports = useCallback(async (accessToken: string, nextStatus: QueueStatusFilter, nextTargetType: TargetTypeFilter) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<{ reports: ModerationReportRecord[] }>(
        reportQueuePath({ status: nextStatus, targetType: nextTargetType, limit: 50 }),
        accessToken
      );
      setReports(data.reports ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load moderation reports.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getSession().then((session) => {
      if (!session) {
        setAuthorized(false);
        setLoading(false);
        return;
      }
      setToken(session.access_token);
      if (!canUseModeratorConsole(session.user)) {
        setAuthorized(false);
        setLoading(false);
        return;
      }
      setAuthorized(true);
      void loadReports(session.access_token, "active", "all");
    });
  }, [loadReports]);

  async function changeStatus(nextStatus: QueueStatusFilter) {
    setStatus(nextStatus);
    if (token) await loadReports(token, nextStatus, targetType);
  }

  async function changeTargetType(nextTargetType: TargetTypeFilter) {
    setTargetType(nextTargetType);
    if (token) await loadReports(token, status, nextTargetType);
  }

  async function updateReport(report: ModerationReportRecord, nextStatus: ReportTransitionStatus) {
    if (!token) return;
    setUpdatingId(report.id);
    setError(null);
    try {
      const data = await apiPatch<{ report: ModerationReportRecord }>(`/reports/${report.id}`, { status: nextStatus }, token);
      setReports((current) => current.map((candidate) => candidate.id === report.id ? data.report : candidate));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update report.");
    } finally {
      setUpdatingId(null);
    }
  }

  if (loading && !authorized) {
    return <main className="container"><div className="card" style={{ textAlign: "center", padding: "3rem", color: "#687078" }}>Loading...</div></main>;
  }

  if (!authorized) {
    return (
      <main className="container" style={{ maxWidth: 760 }}>
        <div style={{ fontSize: "0.78rem", color: "#8b8f92", marginBottom: "1.5rem" }}>
          <Link href="/forums" style={{ color: "#687078" }}>Forums</Link>
          {" / "}
          <span style={{ color: "#534ab7" }}>Moderation</span>
        </div>
        <div className="card" style={{ color: "#687078" }}>
          Admin access is required for the moderation queue.
        </div>
      </main>
    );
  }

  return (
    <main className="container" style={{ maxWidth: 980 }}>
      <div style={{ fontSize: "0.78rem", color: "#8b8f92", marginBottom: "1.5rem" }}>
        <Link href="/forums" style={{ color: "#687078" }}>Forums</Link>
        {" / "}
        <span style={{ color: "#534ab7" }}>Moderation</span>
      </div>

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", marginBottom: "1rem" }}>
        <div>
          <h1 style={{ margin: "0 0 0.25rem", fontSize: "1.55rem" }}>Moderation queue</h1>
          <p style={{ margin: 0, color: "#687078", fontSize: "0.86rem" }}>
            Review persisted community reports and update their status.
          </p>
        </div>
        <button
          type="button"
          onClick={() => token ? loadReports(token, status, targetType) : undefined}
          style={{ padding: "0.45rem 0.8rem", border: "1px solid #d8d3c8", borderRadius: 7, background: "#fff", color: "#1f2529", cursor: "pointer", fontSize: "0.8rem" }}
        >
          Refresh
        </button>
      </div>

      <div className="card" style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap", marginBottom: "1rem", padding: "0.75rem 1rem" }}>
        <select className="input" value={status} onChange={(event) => changeStatus(event.target.value as QueueStatusFilter)} style={{ width: 170 }}>
          <option value="active">Open + reviewing</option>
          {REPORT_QUEUE_STATUSES.map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
        <select className="input" value={targetType} onChange={(event) => changeTargetType(event.target.value as TargetTypeFilter)} style={{ width: 170 }}>
          <option value="all">All targets</option>
          {REPORT_TARGET_TYPES.map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
      </div>

      {error && (
        <div className="card" style={{ background: "#2d1515", borderColor: "#7d2e2e", color: "#eb5757", marginBottom: "1rem" }}>
          {error}
        </div>
      )}

      {loading ? (
        <div className="card" style={{ color: "#687078", textAlign: "center", padding: "2rem" }}>Loading reports...</div>
      ) : reports.length === 0 ? (
        <div className="card" style={{ color: "#687078", fontStyle: "italic", textAlign: "center", padding: "2rem" }}>No reports in this view.</div>
      ) : (
        <div style={{ display: "grid", gap: "0.75rem" }}>
          {reports.map((report) => (
            <article key={report.id} className="card" style={{ display: "grid", gap: "0.75rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap" }}>
                <div>
                  <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "0.35rem" }}>
                    <span style={{ fontSize: "0.72rem", color: "#534ab7", background: "#eeedfe", border: "1px solid #d8d3c8", borderRadius: 999, padding: "0.1rem 0.45rem" }}>{report.status}</span>
                    <span style={{ fontSize: "0.72rem", color: "#25633f", background: "#e9f5ee", border: "1px solid rgba(59, 143, 99, 0.35)", borderRadius: 999, padding: "0.1rem 0.45rem" }}>{report.targetType}</span>
                  </div>
                  <h2 style={{ margin: 0, fontSize: "1rem", color: "#1f2529" }}>{report.reason}</h2>
                  <div style={{ marginTop: "0.25rem", color: "#687078", fontSize: "0.78rem" }}>
                    {reportTargetLabel(report)}
                  </div>
                </div>
                <div style={{ textAlign: "right", color: "#687078", fontSize: "0.76rem" }}>
                  <div>Created {formatDate(report.createdAt)}</div>
                  <div>Reviewed {formatDate(report.reviewedAt)}</div>
                </div>
              </div>

              {report.notes && (
                <div style={{ color: "#687078", fontSize: "0.82rem", lineHeight: 1.5 }}>
                  Admin notes: {report.notes}
                </div>
              )}

              <div style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap" }}>
                {nextReportStatuses(report.status).map((nextStatus) => (
                  <button
                    key={nextStatus}
                    type="button"
                    disabled={updatingId === report.id}
                    onClick={() => updateReport(report, nextStatus)}
                    style={{ padding: "0.35rem 0.65rem", border: "1px solid #d8d3c8", borderRadius: 7, background: nextStatus === "resolved" ? "#1f2529" : "#fff", color: nextStatus === "resolved" ? "#fff" : "#1f2529", cursor: "pointer", fontSize: "0.75rem" }}
                  >
                    Mark {nextStatus}
                  </button>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
