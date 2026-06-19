"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { ReporterModerationReportRecord } from "@station/types";
import { apiGet } from "@/lib/api-client";
import { getSession } from "@/lib/auth";
import {
  REPORT_RESOLUTION_STATUSES,
  REPORT_RESOLUTION_TARGET_TYPES,
  type ReportResolutionStatus,
  type ReportResolutionTargetType,
  reportResolutionPath,
  reportResolutionStatusLabel,
  reportResolutionTargetLabel,
} from "@/lib/report-resolution";

type StatusFilter = ReportResolutionStatus | "all";
type TargetTypeFilter = ReportResolutionTargetType | "all";

function formatDate(value?: string | null) {
  if (!value) return "Not reviewed";
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function ForumReportsPage() {
  const [token, setToken] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reports, setReports] = useState<ReporterModerationReportRecord[]>([]);
  const [status, setStatus] = useState<StatusFilter>("all");
  const [targetType, setTargetType] = useState<TargetTypeFilter>("all");

  const loadReports = useCallback(async (
    accessToken: string,
    nextStatus: StatusFilter,
    nextTargetType: TargetTypeFilter
  ) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<{ reports: ReporterModerationReportRecord[] }>(
        reportResolutionPath({ status: nextStatus, targetType: nextTargetType, limit: 50 }),
        accessToken
      );
      setReports(data.reports ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load your report statuses.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getSession().then((session) => {
      if (!session) {
        setSignedIn(false);
        setLoading(false);
        return;
      }

      setSignedIn(true);
      setToken(session.access_token);
      void loadReports(session.access_token, "all", "all");
    });
  }, [loadReports]);

  async function changeStatus(nextStatus: StatusFilter) {
    setStatus(nextStatus);
    if (token) await loadReports(token, nextStatus, targetType);
  }

  async function changeTargetType(nextTargetType: TargetTypeFilter) {
    setTargetType(nextTargetType);
    if (token) await loadReports(token, status, nextTargetType);
  }

  if (loading && !signedIn) {
    return <main className="container"><div className="card" style={{ textAlign: "center", padding: "3rem", color: "#687078" }}>Loading...</div></main>;
  }

  if (!signedIn) {
    return (
      <main className="container" style={{ maxWidth: 760 }}>
        <div style={{ fontSize: "0.78rem", color: "#8b8f92", marginBottom: "1.5rem" }}>
          <Link href="/forums" style={{ color: "#687078" }}>Forums</Link>
          {" / "}
          <span style={{ color: "#534ab7" }}>My reports</span>
        </div>
        <div className="card" style={{ color: "#687078" }}>
          Sign in to view your report statuses.
        </div>
      </main>
    );
  }

  return (
    <main className="container" style={{ maxWidth: 920 }}>
      <div style={{ fontSize: "0.78rem", color: "#8b8f92", marginBottom: "1.5rem" }}>
        <Link href="/forums" style={{ color: "#687078" }}>Forums</Link>
        {" / "}
        <span style={{ color: "#534ab7" }}>My reports</span>
      </div>

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", marginBottom: "1rem" }}>
        <div>
          <h1 style={{ margin: "0 0 0.25rem", fontSize: "1.55rem" }}>My reports</h1>
          <p style={{ margin: 0, color: "#687078", fontSize: "0.86rem" }}>
            Status readback for reports you submitted.
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
        <select className="input" value={status} onChange={(event) => changeStatus(event.target.value as StatusFilter)} style={{ width: 170 }}>
          <option value="all">All statuses</option>
          {REPORT_RESOLUTION_STATUSES.map((value) => <option key={value} value={value}>{reportResolutionStatusLabel(value)}</option>)}
        </select>
        <select className="input" value={targetType} onChange={(event) => changeTargetType(event.target.value as TargetTypeFilter)} style={{ width: 170 }}>
          <option value="all">All targets</option>
          {REPORT_RESOLUTION_TARGET_TYPES.map((value) => <option key={value} value={value}>{value}</option>)}
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
                    <span style={{ fontSize: "0.72rem", color: "#534ab7", background: "#eeedfe", border: "1px solid #d8d3c8", borderRadius: 999, padding: "0.1rem 0.45rem" }}>
                      {reportResolutionStatusLabel(report.status)}
                    </span>
                    <span style={{ fontSize: "0.72rem", color: "#25633f", background: "#e9f5ee", border: "1px solid rgba(59, 143, 99, 0.35)", borderRadius: 999, padding: "0.1rem 0.45rem" }}>
                      {report.targetType}
                    </span>
                  </div>
                  <h2 style={{ margin: 0, fontSize: "1rem", color: "#1f2529" }}>{report.reason}</h2>
                  <div style={{ marginTop: "0.25rem", color: "#687078", fontSize: "0.78rem" }}>
                    {reportResolutionTargetLabel(report)}
                  </div>
                </div>
                <div style={{ textAlign: "right", color: "#687078", fontSize: "0.76rem" }}>
                  <div>Submitted {formatDate(report.createdAt)}</div>
                  <div>Reviewed {formatDate(report.reviewedAt)}</div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
