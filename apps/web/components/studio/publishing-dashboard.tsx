"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiGet } from "@/lib/api-client";
import { getSession } from "@/lib/auth";
import {
  PUBLISHING_TABS,
  documentDestinationLabel,
  documentTypeLabel,
  filterDocumentsForPublishingTab,
  publicDocumentHref,
  publishingStatusLabel,
  type PublishingDocument,
  type PublishingSpace,
  type PublishingTab,
} from "@/lib/publishing";

export function PublishingDashboard() {
  const [tab, setTab] = useState<PublishingTab>("drafts");
  const [documents, setDocuments] = useState<PublishingDocument[]>([]);
  const [spaces, setSpaces] = useState<PublishingSpace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        if (!cancelled) {
          setDocuments(documentData.documents ?? []);
          setSpaces(spaceData.spaces ?? []);
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
                return (
                  <article key={document.id} style={row}>
                    <div style={{ minWidth: 0 }}>
                      <div style={rowHeader}>
                        <h2 style={rowTitle}>{document.title}</h2>
                        <span style={pill}>{documentTypeLabel(document.document_type)}</span>
                        <span style={statusPill(document.status)}>{publishingStatusLabel(document.status)}</span>
                        <span style={pill}>{document.visibility}</span>
                      </div>
                      <div style={rowMeta}>
                        {documentDestinationLabel(document, spaces)} - {formatDate(document.published_at ?? document.updated_at ?? document.created_at)}
                      </div>
                      {document.source_label ? <div style={sourceLine}>{document.source_label}</div> : null}
                    </div>
                    <div style={buttonRow}>
                      <Link href={`/studio/publish?documentId=${document.id}`} style={miniLink}>Edit</Link>
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
