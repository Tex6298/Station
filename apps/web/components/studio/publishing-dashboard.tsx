"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiGet, apiPost } from "@/lib/api-client";
import { getSession } from "@/lib/auth";
import {
  PUBLISHING_TABS,
  approvalForDocument,
  documentDestinationLabel,
  documentTypeLabel,
  filterDocumentsForPublishingTab,
  publicDocumentHref,
  publishingApprovalStateLabel,
  publishingStatusLabel,
  type PublishingApproval,
  type PublishingApprovalState,
  type PublishingDocument,
  type PublishingSpace,
  type PublishingTab,
} from "@/lib/publishing";

export function PublishingDashboard() {
  const [tab, setTab] = useState<PublishingTab>("drafts");
  const [documents, setDocuments] = useState<PublishingDocument[]>([]);
  const [spaces, setSpaces] = useState<PublishingSpace[]>([]);
  const [approvals, setApprovals] = useState<PublishingApproval[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [busyApprovalId, setBusyApprovalId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const session = await getSession();
        if (!session) {
          if (!cancelled) {
            setError("Sign in to manage publishing drafts.");
            setLoading(false);
          }
          return;
        }

        const [documentData, spaceData] = await Promise.all([
          apiGet<{ documents: PublishingDocument[] }>("/documents", session.access_token),
          apiGet<{ spaces: PublishingSpace[] }>("/spaces", session.access_token).catch(() => ({ spaces: [] })),
        ]);
        const approvalData = await apiGet<{ approvals: PublishingApproval[] }>("/publishing/approvals", session.access_token)
          .catch(() => ({ approvals: [] }));

        if (!cancelled) {
          setToken(session.access_token);
          setDocuments(documentData.documents ?? []);
          setSpaces(spaceData.spaces ?? []);
          setApprovals(approvalData.approvals ?? []);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not load publishing documents.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const visible = useMemo(() => filterDocumentsForPublishingTab(documents, tab), [documents, tab]);

  async function enqueueApproval(document: PublishingDocument) {
    if (!token) return;
    setBusyApprovalId(document.id);
    setError(null);
    setNotice(null);
    try {
      const response = await apiPost<{ approval: PublishingApproval }>(
        "/publishing/approvals",
        {
          documentId: document.id,
          visibility: document.visibility === "private" ? "public" : document.visibility,
        },
        token,
      );
      setApprovals((current) => upsertApproval(current, response.approval));
      setNotice("Draft sent to grounding check.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not enqueue publishing review.");
    } finally {
      setBusyApprovalId(null);
    }
  }

  async function transitionApproval(approval: PublishingApproval, state: PublishingApprovalState) {
    if (!token) return;
    setBusyApprovalId(approval.id);
    setError(null);
    setNotice(null);
    try {
      const response = await apiPost<{ approval: PublishingApproval }>(
        `/publishing/approvals/${approval.id}/transition`,
        {
          state,
          visibility: approval.visibility,
          note: state === "approved" ? "Approved from Studio publishing dashboard." : undefined,
        },
        token,
      );
      setApprovals((current) => upsertApproval(current, response.approval));
      if (response.approval.document) {
        setDocuments((current) => current.map((document) =>
          document.id === response.approval.document?.id ? { ...document, ...response.approval.document } : document
        ));
      }
      setNotice(`Approval moved to ${publishingApprovalStateLabel(response.approval.state).toLowerCase()}.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update publishing review.");
    } finally {
      setBusyApprovalId(null);
    }
  }

  return (
    <main className="station-page">
      <div className="station-page-inner">
        <header className="station-page-header">
          <div>
            <div className="station-eyebrow">Publishing Dashboard</div>
            <h1 className="station-page-title">Documents in motion.</h1>
            <p className="station-page-lede">
              Drafts and published Station documents from the live owner document API.
            </p>
          </div>
          <Link href="/studio/publish" className="station-link-button">New document</Link>
        </header>

        {error ? <div className="station-notice" data-tone="error">{error}</div> : null}
        {notice ? <div className="station-notice" data-tone="success">{notice}</div> : null}

        <section className="station-panel">
          <div style={tabRow}>
            {PUBLISHING_TABS.map((item) => {
              const active = item.id === tab;
              const count = filterDocumentsForPublishingTab(documents, item.id).length;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  style={tabButton(active)}
                >
                  {item.label} <span style={countPill(active)}>{count}</span>
                </button>
              );
            })}
          </div>

          {loading ? <div style={emptyState}>Loading documents...</div> : null}

          {!loading && visible.length === 0 ? (
            <div style={emptyState}>
              No {PUBLISHING_TABS.find((item) => item.id === tab)?.label.toLowerCase()} yet.
              {" "}
              <Link href="/studio/publish" style={inlineLink}>Create one</Link>
            </div>
          ) : null}

          {!loading && visible.length > 0 ? (
            <div style={{ display: "grid", gap: 10 }}>
              {visible.map((document) => {
                const href = publicDocumentHref(document, spaces);
                const approval = approvalForDocument(approvals, document.id);
                return (
                  <article key={document.id} style={row}>
                    <div style={{ minWidth: 0 }}>
                      <div style={rowHeader}>
                        <h2 style={rowTitle}>{document.title}</h2>
                        <span style={pill}>{documentTypeLabel(document.document_type)}</span>
                        <span style={statusPill(document.status)}>{publishingStatusLabel(document.status)}</span>
                        <span style={approvalPill(approval?.state)}>{publishingApprovalStateLabel(approval?.state)}</span>
                        <span style={pill}>{document.visibility}</span>
                      </div>
                      <div style={rowMeta}>
                        {documentDestinationLabel(document, spaces)} - {formatDate(document.published_at ?? document.updated_at ?? document.created_at)}
                      </div>
                      {document.source_label ? <div style={sourceLine}>{document.source_label}</div> : null}
                    </div>
                    <div style={buttonRow}>
                      <Link href={`/studio/publish?documentId=${document.id}`} style={miniLink}>Edit</Link>
                      <ApprovalControls
                        approval={approval}
                        document={document}
                        busy={busyApprovalId === document.id || busyApprovalId === approval?.id}
                        onEnqueue={enqueueApproval}
                        onTransition={transitionApproval}
                      />
                      {href && document.status === "published" ? (
                        <Link href={href} style={miniLink}>View</Link>
                      ) : (
                        <button type="button" disabled title="A Space-backed published route is required before this can be viewed publicly." style={disabledMiniButton}>
                          View unavailable
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}

function upsertApproval(approvals: PublishingApproval[], approval: PublishingApproval) {
  const without = approvals.filter((item) => item.id !== approval.id && item.documentId !== approval.documentId);
  return [approval, ...without];
}

function ApprovalControls({
  approval,
  document,
  busy,
  onEnqueue,
  onTransition,
}: {
  approval: PublishingApproval | null;
  document: PublishingDocument;
  busy: boolean;
  onEnqueue: (document: PublishingDocument) => void;
  onTransition: (approval: PublishingApproval, state: PublishingApprovalState) => void;
}) {
  if (document.status === "published" && !approval) {
    return null;
  }

  if (!document.space_id && (!approval || approval.state !== "published")) {
    return (
      <button type="button" disabled title="Choose and save a Space before using the publishing approval queue." style={disabledMiniButton}>
        Space required
      </button>
    );
  }

  if (!approval) {
    return (
      <button type="button" disabled={busy} onClick={() => onEnqueue(document)} style={miniButton}>
        {busy ? "Queueing..." : "Review"}
      </button>
    );
  }

  if (approval.state === "grounding_check") {
    return (
      <button type="button" disabled={busy} onClick={() => onTransition(approval, "human_review")} style={miniButton}>
        Human review
      </button>
    );
  }

  if (approval.state === "human_review") {
    return (
      <>
        <button type="button" disabled={busy} onClick={() => onTransition(approval, "approved")} style={miniButton}>
          Approve
        </button>
        <button type="button" disabled={busy} onClick={() => onTransition(approval, "regenerate")} style={miniButton}>
          Regenerate
        </button>
        <button type="button" disabled={busy} onClick={() => onTransition(approval, "cancelled")} style={miniButton}>
          Cancel
        </button>
      </>
    );
  }

  if (approval.state === "approved") {
    return (
      <>
        <button type="button" disabled={busy} onClick={() => onTransition(approval, "published")} style={miniButton}>
          Publish
        </button>
        <button type="button" disabled title="Scheduled execution is deferred to the worker lane." style={disabledMiniButton}>
          Schedule deferred
        </button>
      </>
    );
  }

  if (approval.state === "regenerate" || approval.state === "cancelled") {
    return (
      <button type="button" disabled={busy} onClick={() => onTransition(approval, "draft")} style={miniButton}>
        Return to draft
      </button>
    );
  }

  if (approval.state === "published") {
    return (
      <button type="button" disabled={busy} onClick={() => onTransition(approval, "archived")} style={miniButton}>
        Archive queue
      </button>
    );
  }

  return null;
}

function formatDate(value?: string | null) {
  if (!value) return "No timestamp";
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

const tabRow = {
  display: "flex",
  gap: 6,
  flexWrap: "wrap" as const,
  borderBottom: "1px solid #d8d3c8",
  paddingBottom: 12,
  marginBottom: 14,
};

function tabButton(active: boolean) {
  return {
    border: "1px solid " + (active ? "#1f2529" : "#d8d3c8"),
    borderRadius: 999,
    padding: "7px 11px",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
    background: active ? "#1f2529" : "#fff",
    color: active ? "#fff" : "#1f2529",
  };
}

function countPill(active: boolean) {
  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 20,
    height: 20,
    borderRadius: 999,
    marginLeft: 6,
    padding: "0 6px",
    background: active ? "#fff" : "#f8f7f4",
    color: active ? "#1f2529" : "#687078",
    fontSize: 11,
  };
}

const row = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
  gap: 14,
  alignItems: "center",
  border: "1px solid #d8d3c8",
  borderRadius: 8,
  background: "#ffffff",
  padding: 13,
};

const rowHeader = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap" as const,
  alignItems: "center",
};

const rowTitle = {
  margin: 0,
  color: "#1f2529",
  fontSize: 15,
};

const rowMeta = {
  color: "#687078",
  fontSize: 12,
  marginTop: 7,
};

const sourceLine = {
  color: "#687078",
  fontSize: 12,
  marginTop: 7,
};

const buttonRow = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap" as const,
  justifyContent: "flex-start",
};

const pill = {
  border: "1px solid #d8d3c8",
  borderRadius: 999,
  background: "#f8f7f4",
  color: "#687078",
  padding: "4px 8px",
  fontSize: 11,
};

function statusPill(status: string) {
  const map = {
    draft: { background: "#f8f7f4", color: "#687078", borderColor: "#d8d3c8" },
    published: { background: "#e9f5ee", color: "#25633f", borderColor: "rgba(59, 143, 99, 0.35)" },
    archived: { background: "#f8efd9", color: "#854f0b", borderColor: "rgba(133, 79, 11, 0.35)" },
  }[status] ?? { background: "#f8f7f4", color: "#687078", borderColor: "#d8d3c8" };

  return {
    ...pill,
    ...map,
  };
}

function approvalPill(state?: string | null) {
  const map: Record<string, { background: string; color: string; borderColor: string }> = {
    grounding_check: { background: "#eef2ff", color: "#3730a3", borderColor: "#c7d2fe" },
    human_review: { background: "#fef3c7", color: "#92400e", borderColor: "#fde68a" },
    approved: { background: "#dcfce7", color: "#166534", borderColor: "#bbf7d0" },
    regenerate: { background: "#fee2e2", color: "#991b1b", borderColor: "#fecaca" },
    cancelled: { background: "#f3f4f6", color: "#4b5563", borderColor: "#d1d5db" },
    scheduled: { background: "#e0f2fe", color: "#075985", borderColor: "#bae6fd" },
    published: { background: "#e9f5ee", color: "#25633f", borderColor: "rgba(59, 143, 99, 0.35)" },
    archived: { background: "#f8efd9", color: "#854f0b", borderColor: "rgba(133, 79, 11, 0.35)" },
  };
  return {
    ...pill,
    ...(state ? map[state] : null),
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

const disabledMiniButton = {
  ...miniButton,
  background: "#f8f7f4",
  color: "#687078",
  cursor: "not-allowed",
  opacity: 0.78,
};

const emptyState = {
  color: "#687078",
  fontSize: 13,
  padding: 16,
};

const inlineLink = {
  color: "#534ab7",
  textDecoration: "none",
  fontWeight: 700,
};
