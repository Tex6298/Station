"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { AuthUser, CommunitySubcommunityRecord, DelegatedModerationReportRecord } from "@station/types";
import { apiGet } from "@/lib/api-client";
import { getSession } from "@/lib/auth";
import {
  canUseDelegatedModerationQueue,
  DELEGATED_QUEUE_STATUSES,
  delegatedModerationQueuePath,
  delegatedReportContextLabel,
  delegatedReportRouteHref,
  delegatedReportTargetLabel,
  sanitizeDelegatedQueueReports,
  type DelegatedQueueStatus,
} from "@/lib/delegated-moderation-queue";

type QueueStatus = DelegatedQueueStatus | "active";
type AccessState = "checking" | "signed_out" | "denied" | "ready" | "error";

export default function SubcommunityModerationPage() {
  const { slug } = useParams<{ slug: string }>();
  const [user, setUser] = useState<(AuthUser & { isAdmin?: boolean }) | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [subcommunity, setSubcommunity] = useState<CommunitySubcommunityRecord | null>(null);
  const [reports, setReports] = useState<DelegatedModerationReportRecord[]>([]);
  const [status, setStatus] = useState<QueueStatus>("active");
  const [accessState, setAccessState] = useState<AccessState>("checking");
  const [loadingReports, setLoadingReports] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setAccessState("checking");
      setLoadingReports(false);
      setError(null);
      setReports([]);

      const session = await getSession();
      if (cancelled) return;
      if (!session) {
        setUser(null);
        setToken(null);
        setAccessState("signed_out");
        return;
      }

      setUser(session.user);
      setToken(session.access_token);

      const subcommunityData = await apiGet<{ subcommunity: CommunitySubcommunityRecord }>(
        `/forums/subcommunities/${encodeURIComponent(slug)}`,
        session.access_token
      );
      if (cancelled) return;

      setSubcommunity(subcommunityData.subcommunity);
      if (!canUseDelegatedModerationQueue(session.user, subcommunityData.subcommunity)) {
        setAccessState("denied");
        return;
      }

      setAccessState("ready");
      setLoadingReports(true);
      const reportData = await apiGet<{ reports: DelegatedModerationReportRecord[] }>(
        delegatedModerationQueuePath(slug, { status, limit: 50 }),
        session.access_token
      );
      if (!cancelled) {
        setReports(sanitizeDelegatedQueueReports(reportData.reports ?? []));
      }
    }

    load()
      .catch((e) => {
        if (cancelled) return;
        const message = e instanceof Error ? e.message : "Could not load delegated moderation queue.";
        setError(message);
        setAccessState(message.toLowerCase().includes("moderator access") ? "denied" : "error");
      })
      .finally(() => {
        if (!cancelled) setLoadingReports(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug, status]);

  const canReadQueue = canUseDelegatedModerationQueue(user, subcommunity);

  return (
    <main className="container">
      <div style={{ fontSize: "0.78rem", color: "#8b8f92", marginBottom: "1.5rem" }}>
        <Link href="/forums" style={{ color: "#687078" }}>Forums</Link>
        {" / "}
        <Link href="/forums/subcommunities" style={{ color: "#687078" }}>Subcommunities</Link>
        {" / "}
        <span style={{ color: "#534ab7" }}>Moderation</span>
      </div>

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
        <div>
          <div style={{ color: "#534ab7", fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.07em" }}>
            Delegated queue
          </div>
          <h1 style={{ margin: "0.2rem 0 0.25rem", fontSize: "1.55rem" }}>
            {subcommunity?.title ?? slug}
          </h1>
          <p style={{ margin: 0, color: "#687078", fontSize: "0.875rem" }}>
            Scoped report readback for this subcommunity.
          </p>
        </div>
        <Link href={`/forums/${slug}`} style={linkButton}>Open forum</Link>
      </div>

      {accessState === "checking" && (
        <div className="card" style={stateCard}>Checking access...</div>
      )}

      {accessState === "signed_out" && (
        <div className="card" style={stateCard}>
          <Link href="/login" style={{ color: "#534ab7", fontWeight: 800 }}>Sign in</Link> to view a delegated moderation queue.
        </div>
      )}

      {accessState === "denied" && (
        <div className="card" style={stateCard}>
          This account does not have delegated moderation access for this subcommunity.
        </div>
      )}

      {accessState === "error" && (
        <div className="card" style={errorCard}>{error ?? "Could not load delegated moderation queue."}</div>
      )}

      {accessState === "ready" && canReadQueue && (
        <>
          <div className="card" style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap", marginBottom: "1rem", padding: "0.75rem 1rem" }}>
            <label style={filterLabel}>
              Status
              <select
                className="input"
                value={status}
                onChange={(event) => setStatus(event.target.value as QueueStatus)}
                style={{ width: 170 }}
              >
                <option value="active">Open + reviewing</option>
                {DELEGATED_QUEUE_STATUSES.map((value) => (
                  <option key={value} value={value}>{statusLabel(value)}</option>
                ))}
              </select>
            </label>
            {loadingReports && <span style={{ color: "#687078", fontSize: "0.78rem" }}>Loading reports...</span>}
          </div>

          {!loadingReports && reports.length === 0 ? (
            <div className="card" style={stateCard}>No reports in this view.</div>
          ) : (
            <div style={{ display: "grid", gap: "0.75rem" }}>
              {reports.map((report) => (
                <DelegatedReportRow key={report.id} report={report} />
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}

function DelegatedReportRow({ report }: { report: DelegatedModerationReportRecord }) {
  const href = delegatedReportRouteHref(report);

  return (
    <article className="card" style={{ display: "grid", gap: "0.75rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap" }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", gap: "0.4rem", alignItems: "center", flexWrap: "wrap", marginBottom: "0.35rem" }}>
            <span style={pill}>{report.status}</span>
            <span style={pill}>{report.targetType}</span>
          </div>
          <h2 style={{ margin: 0, fontSize: "1rem", color: "#1f2529" }}>{report.reason}</h2>
          <div style={{ color: "#687078", fontSize: "0.78rem", marginTop: "0.2rem" }}>
            {delegatedReportTargetLabel(report)}
          </div>
        </div>
        <div style={{ color: "#8b8f92", fontSize: "0.72rem", textAlign: "right" }}>
          <div>Created {formatDate(report.createdAt)}</div>
          <div>Updated {formatDate(report.updatedAt)}</div>
        </div>
      </div>

      <div style={contextPanel}>
        <div style={{ color: "#1f2529", fontWeight: 700 }}>{delegatedReportContextLabel(report)}</div>
        {report.targetContext ? (
          <>
            <div>
              State: {report.targetContext.status ?? "unknown"}
              {report.targetContext.moderationState ? ` / ${report.targetContext.moderationState}` : ""}
              {report.targetContext.isHidden ? " / hidden" : ""}
            </div>
            {report.targetContext.parentType && (
              <div>Parent: {report.targetContext.parentType}:{report.targetContext.parentId ?? "unknown"}</div>
            )}
            {href ? (
              <Link href={href} style={{ color: "#534ab7", width: "fit-content" }}>
                Open target
              </Link>
            ) : (
              <div>{report.targetContext.unavailableReason ?? "No safe route is available for this target yet."}</div>
            )}
          </>
        ) : (
          <div>Target context is not available for this report.</div>
        )}
      </div>
    </article>
  );
}

function statusLabel(status: DelegatedQueueStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatDate(value?: string | null) {
  if (!value) return "not yet";
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

const linkButton = {
  padding: "0.45rem 0.75rem",
  border: "1px solid #d8d3c8",
  borderRadius: 7,
  color: "#1f2529",
  textDecoration: "none",
  fontSize: "0.8rem",
  background: "#fff",
};

const stateCard = {
  color: "#687078",
  textAlign: "center" as const,
  padding: "2rem",
};

const errorCard = {
  background: "#2d1515",
  borderColor: "#7d2e2e",
  color: "#eb5757",
};

const filterLabel = {
  display: "flex",
  gap: "0.5rem",
  alignItems: "center",
  color: "#1f2529",
  fontSize: "0.82rem",
  fontWeight: 800,
};

const pill = {
  fontSize: "0.72rem",
  color: "#534ab7",
  background: "#eeedfe",
  border: "1px solid #d8d3c8",
  borderRadius: 999,
  padding: "0.1rem 0.45rem",
};

const contextPanel = {
  border: "1px solid #ece8dd",
  borderRadius: 8,
  background: "#f8f7f4",
  padding: "0.75rem",
  display: "grid",
  gap: "0.35rem",
  color: "#687078",
  fontSize: "0.8rem",
};
