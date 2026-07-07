"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { canPublishDocuments, hasTier } from "@station/auth";
import type {
  OwnerPublicSeminarRecord,
  OwnerPublicSeminarRecordResponse,
  OwnerPublicSeminarRecordsResponse,
  OwnerPublicSeminarRecordTransitionTarget,
  TransitionOwnerPublicSeminarRecordRequest,
} from "@station/types";
import { apiGet, apiPatch, apiPost } from "@/lib/api-client";
import { getSession } from "@/lib/auth";
import {
  PUBLISHING_TABS,
  approvalForDocument,
  canRetractPublishedDocument,
  documentDestinationLabel,
  documentTypeLabel,
  filterDocumentsForPublishingTab,
  publicationManifestContractForDocument,
  publicationManifestDisplayRows,
  publicationRetractNotice,
  publicDocumentHref,
  publishingDashboardTrustLine,
  publishingDashboardRouteStoryRows,
  publishingApprovalStateLabel,
  publishingQueueActionGuard,
  publishingStatusLabel,
  type PublishingApproval,
  type PublishingApprovalState,
  type PublishingDocument,
  type PublishingSpace,
  type PublishingTab,
  type PublicationManifestContract,
} from "@/lib/publishing";
import {
  seminarRecordForCandidate,
  seminarScheduleFormDefaults,
  seminarScheduleMetadataCopy,
  seminarSchedulePatchBody,
  seminarScheduleReadback,
  seminarHostReadiness,
  seminarSourceDocumentForCandidate,
  upsertSeminarRecord,
  type SeminarHostReadinessCandidate,
  type SeminarHostReadinessReadback,
  type SeminarScheduleFormState,
} from "@/lib/seminar-host-readiness";

const routeStoryRows = publishingDashboardRouteStoryRows();

export function PublishingDashboard() {
  const [tab, setTab] = useState<PublishingTab>("drafts");
  const [documents, setDocuments] = useState<PublishingDocument[]>([]);
  const [spaces, setSpaces] = useState<PublishingSpace[]>([]);
  const [approvals, setApprovals] = useState<PublishingApproval[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [publishingAllowed, setPublishingAllowed] = useState(false);
  const [seminarDraftAllowed, setSeminarDraftAllowed] = useState(false);
  const [userTier, setUserTier] = useState("visitor");
  const [busyApprovalId, setBusyApprovalId] = useState<string | null>(null);
  const [seminarRecords, setSeminarRecords] = useState<OwnerPublicSeminarRecord[]>([]);
  const [seminarRecordsLoading, setSeminarRecordsLoading] = useState(true);
  const [seminarRecordsError, setSeminarRecordsError] = useState<string | null>(null);
  const [busySeminarHref, setBusySeminarHref] = useState<string | null>(null);
  const [busySeminarScheduleId, setBusySeminarScheduleId] = useState<string | null>(null);
  const [seminarScheduleInputs, setSeminarScheduleInputs] = useState<Record<string, SeminarScheduleFormState>>({});
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
            setSeminarRecordsLoading(false);
          }
          return;
        }

        const [documentData, spaceData, approvalData, seminarRecordData] = await Promise.all([
          apiGet<{ documents: PublishingDocument[] }>("/documents", session.access_token),
          apiGet<{ spaces: PublishingSpace[] }>("/spaces", session.access_token).catch(() => ({ spaces: [] })),
          apiGet<{ approvals: PublishingApproval[] }>("/publishing/approvals", session.access_token),
          apiGet<OwnerPublicSeminarRecordsResponse>("/events/seminars/records", session.access_token)
            .then((response) => ({ records: response.records ?? [], error: null as string | null }))
            .catch(() => ({ records: [] as OwnerPublicSeminarRecord[], error: "Seminar draft readback is unavailable." })),
        ]);

        if (!cancelled) {
          setToken(session.access_token);
          setPublishingAllowed(canPublishDocuments(session.user));
          setSeminarDraftAllowed(hasTier(session.user, "creator"));
          setUserTier(session.user.tier);
          setDocuments(documentData.documents ?? []);
          setSpaces(spaceData.spaces ?? []);
          setApprovals(approvalData.approvals ?? []);
          setSeminarRecords(seminarRecordData.records);
          setSeminarRecordsError(seminarRecordData.error);
          setSeminarRecordsLoading(false);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not load publishing documents.");
      } finally {
        if (!cancelled) {
          setLoading(false);
          setSeminarRecordsLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const visible = useMemo(() => filterDocumentsForPublishingTab(documents, tab), [documents, tab]);
  const seminarReadiness = useMemo(() => seminarHostReadiness(documents, spaces), [documents, spaces]);

  async function createSeminarDraft(candidate: SeminarHostReadinessCandidate) {
    if (!token || !seminarDraftAllowed) return;

    const document = seminarSourceDocumentForCandidate(candidate, documents, spaces);
    if (!document) {
      setSeminarRecordsError("Seminar draft readback is unavailable.");
      return;
    }

    setBusySeminarHref(candidate.documentHref);
    setSeminarRecordsError(null);
    try {
      const response = await apiPost<OwnerPublicSeminarRecordResponse>(
        "/events/seminars/records",
        { sourceType: "document", sourceId: document.id },
        token,
      );
      setSeminarRecords((current) => upsertSeminarRecord(current, response.record));
    } catch {
      setSeminarRecordsError("Seminar draft readback is unavailable.");
    } finally {
      setBusySeminarHref(null);
    }
  }

  async function transitionSeminarDraft(
    record: OwnerPublicSeminarRecord,
    status: OwnerPublicSeminarRecordTransitionTarget,
  ) {
    if (!token || !seminarDraftAllowed) return;
    if (!record.publicDocumentHref) {
      setSeminarRecordsError("Seminar draft status is unavailable.");
      return;
    }

    setBusySeminarHref(record.publicDocumentHref);
    setSeminarRecordsError(null);
    try {
      const body: TransitionOwnerPublicSeminarRecordRequest = { status };
      const response = await apiPost<OwnerPublicSeminarRecordResponse>(
        `/events/seminars/records/${encodeURIComponent(record.id)}/transition`,
        body,
        token,
      );
      setSeminarRecords((current) => upsertSeminarRecord(current, response.record));
    } catch {
      setSeminarRecordsError("Seminar draft status is unavailable.");
    } finally {
      setBusySeminarHref(null);
    }
  }

  function updateSeminarScheduleInput(record: OwnerPublicSeminarRecord, input: SeminarScheduleFormState) {
    setSeminarScheduleInputs((current) => ({
      ...current,
      [record.id]: input,
    }));
  }

  async function saveSeminarSchedule(record: OwnerPublicSeminarRecord, input: SeminarScheduleFormState) {
    if (!token || !seminarDraftAllowed) return;
    const body = seminarSchedulePatchBody(input);
    if (!body) {
      setSeminarRecordsError("Seminar schedule metadata is unavailable.");
      return;
    }

    setBusySeminarScheduleId(record.id);
    setSeminarRecordsError(null);
    try {
      const response = await apiPatch<OwnerPublicSeminarRecordResponse>(
        `/events/seminars/records/${encodeURIComponent(record.id)}/schedule`,
        body,
        token,
      );
      setSeminarRecords((current) => upsertSeminarRecord(current, response.record));
      setSeminarScheduleInputs((current) => ({
        ...current,
        [response.record.id]: seminarScheduleFormDefaults(response.record),
      }));
    } catch {
      setSeminarRecordsError("Seminar schedule metadata is unavailable.");
    } finally {
      setBusySeminarScheduleId(null);
    }
  }

  async function clearSeminarSchedule(record: OwnerPublicSeminarRecord) {
    if (!token || !seminarDraftAllowed) return;
    setBusySeminarScheduleId(record.id);
    setSeminarRecordsError(null);
    try {
      const response = await apiPatch<OwnerPublicSeminarRecordResponse>(
        `/events/seminars/records/${encodeURIComponent(record.id)}/schedule`,
        { startsAt: null, timeZone: null, durationMinutes: null },
        token,
      );
      setSeminarRecords((current) => upsertSeminarRecord(current, response.record));
      setSeminarScheduleInputs((current) => ({
        ...current,
        [response.record.id]: seminarScheduleFormDefaults(response.record),
      }));
    } catch {
      setSeminarRecordsError("Seminar schedule metadata is unavailable.");
    } finally {
      setBusySeminarScheduleId(null);
    }
  }

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

  async function retractDocument(document: PublishingDocument) {
    if (!token) return;
    setBusyApprovalId(document.id);
    setError(null);
    setNotice(null);
    try {
      const response = await apiPatch<{ document: PublishingDocument }>(
        `/documents/${document.id}`,
        { visibility: "private" },
        token,
      );
      setDocuments((current) => current.map((item) =>
        item.id === response.document.id ? { ...item, ...response.document } : item
      ));
      setNotice(publicationRetractNotice(response.document));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not retract document.");
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

        <section className="station-panel" aria-label="Publishing route story" style={routeStoryPanel}>
          <div style={storyHeader}>
            <div className="station-eyebrow">Route story</div>
            <h2 style={storyTitle}>Publish, retract, and cleanup are separate steps.</h2>
          </div>
          <div style={storyGrid}>
            {routeStoryRows.map((row) => (
              <div key={row.id} style={storyItem}>
                <div style={storyRowHeader}>
                  <span style={storyLabel}>{row.label}</span>
                  <span style={storyPill(row.tone)}>{row.value}</span>
                </div>
                <p style={storyBody}>{row.body}</p>
              </div>
            ))}
          </div>
        </section>

        <SeminarReadinessPanel
          readback={seminarReadiness}
          loading={loading}
          records={seminarRecords}
          recordsLoading={seminarRecordsLoading}
          recordsError={seminarRecordsError}
          canCreateDraft={seminarDraftAllowed}
          busyDocumentHref={busySeminarHref}
          busyScheduleId={busySeminarScheduleId}
          scheduleInputs={seminarScheduleInputs}
          onCreateDraft={createSeminarDraft}
          onTransitionDraft={transitionSeminarDraft}
          onScheduleInputChange={updateSeminarScheduleInput}
          onSaveSchedule={saveSeminarSchedule}
          onClearSchedule={clearSeminarSchedule}
        />

        {error ? <div className="station-notice" data-tone="error">{error}</div> : null}
        {notice ? <div className="station-notice" data-tone="success">{notice}</div> : null}
        {!loading && !publishingAllowed ? (
          <div className="station-notice">
            Creator tier or above is required to move documents through the publishing approval queue. Current tier: {userTier}.
          </div>
        ) : null}

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
                const manifest = publicationManifestContractForDocument({
                  document,
                  spaces,
                  seminarRecord: href
                    ? seminarRecords.find((record) =>
                        record.sourceType === "document" &&
                        record.publicDocumentHref === href
                      ) ?? null
                    : null,
                });
                const busy = busyApprovalId === document.id || busyApprovalId === approval?.id;
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
                      <div style={sourceLine}>
                        {publishingDashboardTrustLine(document, approval, spaces)}
                      </div>
                      <PublicationManifestReadback manifest={manifest} />
                    </div>
                    <div style={buttonRow}>
                      <Link href={`/studio/publish?documentId=${document.id}`} style={miniLink}>Edit</Link>
                      <ApprovalControls
                        approval={approval}
                        document={document}
                        canPublish={publishingAllowed}
                        busy={busy}
                        onEnqueue={enqueueApproval}
                        onTransition={transitionApproval}
                      />
                      {canRetractPublishedDocument(document) ? (
                        <button
                          type="button"
                          disabled={busy}
                          title="Hide this published document from public readers and linked discussion reads. The owner-visible record remains in Studio."
                          onClick={() => void retractDocument(document)}
                          style={miniButton}
                        >
                          {busy ? "Retracting..." : "Retract to private"}
                        </button>
                      ) : null}
                      {href ? (
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

function PublicationManifestReadback({ manifest }: { manifest: PublicationManifestContract }) {
  const rows = publicationManifestDisplayRows(manifest);
  return (
    <details style={manifestDetails}>
      <summary style={manifestSummary}>Station Press manifest contract</summary>
      <div style={manifestReadbackGrid}>
        {rows.map((row) => (
          <div key={row.id} style={manifestReadbackRow}>
            <span style={manifestReadbackLabel}>{row.label}</span>
            <span style={manifestReadbackValue}>{row.value}</span>
          </div>
        ))}
      </div>
      <p style={manifestReadbackCopy}>{manifest.packageReadback.detail}</p>
      <p style={manifestReadbackCopy}>{manifest.boundary}</p>
    </details>
  );
}

function SeminarReadinessPanel({
  readback,
  loading,
  records,
  recordsLoading,
  recordsError,
  canCreateDraft,
  busyDocumentHref,
  busyScheduleId,
  scheduleInputs,
  onCreateDraft,
  onTransitionDraft,
  onScheduleInputChange,
  onSaveSchedule,
  onClearSchedule,
}: {
  readback: SeminarHostReadinessReadback;
  loading: boolean;
  records: OwnerPublicSeminarRecord[];
  recordsLoading: boolean;
  recordsError: string | null;
  canCreateDraft: boolean;
  busyDocumentHref: string | null;
  busyScheduleId: string | null;
  scheduleInputs: Record<string, SeminarScheduleFormState>;
  onCreateDraft: (candidate: SeminarHostReadinessCandidate) => void;
  onTransitionDraft: (record: OwnerPublicSeminarRecord, status: OwnerPublicSeminarRecordTransitionTarget) => void;
  onScheduleInputChange: (record: OwnerPublicSeminarRecord, input: SeminarScheduleFormState) => void;
  onSaveSchedule: (record: OwnerPublicSeminarRecord, input: SeminarScheduleFormState) => void;
  onClearSchedule: (record: OwnerPublicSeminarRecord) => void;
}) {
  return (
    <section className="station-panel" aria-label="Seminar readiness" style={seminarPanel}>
      <div style={storyHeader}>
        <div className="station-eyebrow">{readback.label}</div>
        <h2 style={storyTitle}>Public source readiness</h2>
        <p style={storyBody}>{readback.boundaryCopy}</p>
        <p style={storyBody}>{readback.interactionCopy}</p>
      </div>

      {loading ? (
        <div style={emptyState}>Checking owner documents and Spaces...</div>
      ) : (
        <>
          {recordsError ? (
            <div className="station-notice" data-tone="error" style={seminarNotice}>
              {recordsError}
            </div>
          ) : null}

          <div style={seminarGapGrid}>
            {readback.gaps.map((gap) => (
              <div key={gap.id} style={seminarGapItem(gap.tone)}>
                <div style={storyRowHeader}>
                  <span style={storyLabel}>{gap.label}</span>
                  <span style={storyPill(gap.tone === "ready" ? "info" : "warning")}>{gap.value}</span>
                </div>
                <p style={storyBody}>{gap.detail}</p>
              </div>
            ))}
          </div>

          <div style={seminarCandidateWrap}>
            <div style={storyRowHeader}>
              <h3 style={seminarSubhead}>{readback.summary}</h3>
              <Link href="/studio/publish" style={miniLink}>Create document</Link>
              <Link href="/space" style={miniLink}>Review Spaces</Link>
            </div>

            {readback.candidates.length === 0 ? (
              <div style={emptyState}>No public source candidate is ready yet.</div>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {readback.candidates.map((candidate) => {
                  const record = seminarRecordForCandidate(candidate, records);
                  const busy = busyDocumentHref === candidate.documentHref || recordsLoading;
                  return (
                    <article key={candidate.documentHref} style={seminarCandidateRow}>
                      <div style={{ minWidth: 0 }}>
                        <div style={rowHeader}>
                          <h4 style={rowTitle}>{candidate.title}</h4>
                          <span style={pill}>{candidate.discussionLabel}</span>
                        </div>
                        <div style={rowMeta}>{candidate.spaceTitle}</div>
                        <div style={sourceLine}>{candidate.detail}</div>
                      </div>
                      <div style={buttonRow}>
                        <SeminarDraftAction
                          candidate={candidate}
                          record={record}
                          canCreateDraft={canCreateDraft}
                          busy={busy}
                          busySchedule={busyScheduleId === record?.id}
                          scheduleInput={record ? scheduleInputs[record.id] ?? seminarScheduleFormDefaults(record) : null}
                          onCreateDraft={onCreateDraft}
                          onTransitionDraft={onTransitionDraft}
                          onScheduleInputChange={onScheduleInputChange}
                          onSaveSchedule={onSaveSchedule}
                          onClearSchedule={onClearSchedule}
                        />
                        <Link href={candidate.documentHref} style={miniLink}>View document</Link>
                        <Link href={candidate.spaceHref} style={miniLink}>View Space</Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}

function SeminarDraftAction({
  candidate,
  record,
  canCreateDraft,
  busy,
  busySchedule,
  scheduleInput,
  onCreateDraft,
  onTransitionDraft,
  onScheduleInputChange,
  onSaveSchedule,
  onClearSchedule,
}: {
  candidate: SeminarHostReadinessCandidate;
  record: OwnerPublicSeminarRecord | null;
  canCreateDraft: boolean;
  busy: boolean;
  busySchedule: boolean;
  scheduleInput: SeminarScheduleFormState | null;
  onCreateDraft: (candidate: SeminarHostReadinessCandidate) => void;
  onTransitionDraft: (record: OwnerPublicSeminarRecord, status: OwnerPublicSeminarRecordTransitionTarget) => void;
  onScheduleInputChange: (record: OwnerPublicSeminarRecord, input: SeminarScheduleFormState) => void;
  onSaveSchedule: (record: OwnerPublicSeminarRecord, input: SeminarScheduleFormState) => void;
  onClearSchedule: (record: OwnerPublicSeminarRecord) => void;
}) {
  if (record) {
    if (!canCreateDraft) {
      return (
        <button type="button" disabled title="Creator tier is required to update a seminar draft." style={disabledMiniButton}>
          Creator required
        </button>
      );
    }

    const scheduleControls = scheduleInput ? (
      <SeminarScheduleControls
        busy={busySchedule}
        input={scheduleInput}
        record={record}
        onClearSchedule={onClearSchedule}
        onInputChange={onScheduleInputChange}
        onSaveSchedule={onSaveSchedule}
      />
    ) : null;

    if (record.status === "ready") {
      return (
        <>
          {scheduleControls}
          <button type="button" disabled title="This private seminar draft is ready for owner review." style={disabledMiniButton}>
            Ready for review
          </button>
          <span style={seminarStatusCopy}>Public listing is not live.</span>
          <button type="button" disabled={busy} onClick={() => onTransitionDraft(record, "published")} style={miniButton}>
            {busy ? "Publishing record..." : "Publish record"}
          </button>
          <button type="button" disabled={busy} onClick={() => onTransitionDraft(record, "draft")} style={miniButton}>
            {busy ? "Saving draft..." : "Return to draft"}
          </button>
        </>
      );
    }

    if (record.status === "published" && record.visibility === "public") {
      return (
        <>
          {scheduleControls}
          <button type="button" disabled title="This seminar record is public-eligible for public list and detail readback." style={disabledMiniButton}>
            Public record
          </button>
          <span style={seminarStatusCopy}>Public listing uses stored schedule metadata only.</span>
          <button type="button" disabled={busy} onClick={() => onTransitionDraft(record, "ready")} style={miniButton}>
            {busy ? "Saving record..." : "Return to ready"}
          </button>
        </>
      );
    }

    if (record.status === "draft") {
      return (
        <>
          {scheduleControls}
          <button type="button" disabled={busy} onClick={() => onTransitionDraft(record, "ready")} style={miniButton}>
            {busy ? "Saving draft..." : "Mark ready for review"}
          </button>
        </>
      );
    }

    return (
      <>
        {scheduleControls}
        <button type="button" disabled title="This private seminar draft is saved for this source." style={disabledMiniButton}>
          Private draft saved
        </button>
      </>
    );
  }

  if (!canCreateDraft) {
    return (
      <button type="button" disabled title="Creator tier is required to save a seminar draft." style={disabledMiniButton}>
        Creator required
      </button>
    );
  }

  return (
    <button type="button" disabled={busy} onClick={() => onCreateDraft(candidate)} style={miniButton}>
      {busy ? "Saving draft..." : "Create seminar draft"}
    </button>
  );
}

function SeminarScheduleControls({
  busy,
  input,
  record,
  onClearSchedule,
  onInputChange,
  onSaveSchedule,
}: {
  busy: boolean;
  input: SeminarScheduleFormState;
  record: OwnerPublicSeminarRecord;
  onClearSchedule: (record: OwnerPublicSeminarRecord) => void;
  onInputChange: (record: OwnerPublicSeminarRecord, input: SeminarScheduleFormState) => void;
  onSaveSchedule: (record: OwnerPublicSeminarRecord, input: SeminarScheduleFormState) => void;
}) {
  return (
    <div style={seminarScheduleControls}>
      <span style={seminarStatusCopy}>{seminarScheduleMetadataCopy()}</span>
      <span style={seminarStatusCopy}>{seminarScheduleReadback(record)}</span>
      <input
        aria-label="Seminar schedule ISO instant"
        disabled={busy}
        onChange={(event) => onInputChange(record, { ...input, startsAt: event.target.value })}
        placeholder="2026-07-06T18:00:00.000Z"
        style={seminarScheduleInput}
        value={input.startsAt}
      />
      <input
        aria-label="Seminar schedule time zone"
        disabled={busy}
        onChange={(event) => onInputChange(record, { ...input, timeZone: event.target.value })}
        placeholder="UTC"
        style={seminarScheduleInput}
        value={input.timeZone}
      />
      <input
        aria-label="Seminar schedule duration minutes"
        disabled={busy}
        min={15}
        max={480}
        onChange={(event) => onInputChange(record, { ...input, durationMinutes: event.target.value })}
        placeholder="60"
        style={seminarScheduleNumberInput}
        type="number"
        value={input.durationMinutes}
      />
      <button type="button" disabled={busy} onClick={() => onSaveSchedule(record, input)} style={miniButton}>
        {busy ? "Saving metadata..." : "Save schedule metadata"}
      </button>
      <button type="button" disabled={busy} onClick={() => onClearSchedule(record)} style={miniButton}>
        Clear schedule metadata
      </button>
    </div>
  );
}

function upsertApproval(approvals: PublishingApproval[], approval: PublishingApproval) {
  const without = approvals.filter((item) => item.id !== approval.id && item.documentId !== approval.documentId);
  return [approval, ...without];
}

function ApprovalControls({
  approval,
  document,
  canPublish,
  busy,
  onEnqueue,
  onTransition,
}: {
  approval: PublishingApproval | null;
  document: PublishingDocument;
  canPublish: boolean;
  busy: boolean;
  onEnqueue: (document: PublishingDocument) => void;
  onTransition: (approval: PublishingApproval, state: PublishingApprovalState) => void;
}) {
  if (document.status === "published" && !approval) {
    return null;
  }

  const guard = publishingQueueActionGuard(document, canPublish);
  if (!guard.canAct && (!approval || approval.state !== "published")) {
    return (
      <button type="button" disabled title={guard.title} style={disabledMiniButton}>
        {guard.label}
      </button>
    );
  }

  if (!guard.canAct) {
    return (
      <button type="button" disabled title={guard.title} style={disabledMiniButton}>
        {guard.label}
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

const manifestDetails = {
  marginTop: 8,
  color: "#687078",
  fontSize: 12,
};

const manifestSummary = {
  color: "#1f2529",
  cursor: "pointer",
  fontWeight: 800,
};

const manifestReadbackGrid = {
  display: "grid",
  gap: 6,
  marginTop: 8,
};

const manifestReadbackRow = {
  display: "grid",
  gridTemplateColumns: "minmax(96px, 0.28fr) minmax(0, 1fr)",
  gap: 8,
  alignItems: "start",
};

const manifestReadbackLabel = {
  color: "#1f2529",
  fontWeight: 800,
};

const manifestReadbackValue = {
  minWidth: 0,
  overflowWrap: "anywhere" as const,
};

const manifestReadbackCopy = {
  margin: "8px 0 0",
  lineHeight: 1.45,
};

const buttonRow = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap" as const,
  justifyContent: "flex-start",
};

const routeStoryPanel = {
  display: "grid",
  gap: 14,
  marginBottom: 14,
};

const seminarPanel = {
  display: "grid",
  gap: 14,
  marginBottom: 14,
};

const seminarNotice = {
  margin: 0,
};

const seminarStatusCopy = {
  display: "inline-flex",
  alignItems: "center",
  color: "#687078",
  fontSize: 12,
};

const seminarScheduleControls = {
  display: "flex",
  flexWrap: "wrap" as const,
  alignItems: "center",
  gap: 8,
  width: "100%",
};

const seminarScheduleInput = {
  border: "1px solid #d8d3c8",
  borderRadius: 7,
  background: "#ffffff",
  color: "#1f2529",
  padding: "7px 9px",
  fontSize: 12,
  minWidth: 180,
  cursor: "text",
};

const seminarScheduleNumberInput = {
  ...seminarScheduleInput,
  minWidth: 88,
};

const storyHeader = {
  display: "grid",
  gap: 4,
};

const storyTitle = {
  margin: 0,
  color: "#1f2529",
  fontSize: 17,
};

const storyGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
  gap: 12,
};

const storyItem = {
  display: "grid",
  gap: 7,
  minWidth: 0,
};

const storyRowHeader = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  flexWrap: "wrap" as const,
};

const storyLabel = {
  color: "#1f2529",
  fontSize: 13,
  fontWeight: 800,
};

function storyPill(tone: "info" | "warning") {
  return {
    border: "1px solid " + (tone === "warning" ? "#fde68a" : "#c7d2fe"),
    borderRadius: 999,
    background: tone === "warning" ? "#fef3c7" : "#eef2ff",
    color: tone === "warning" ? "#92400e" : "#3730a3",
    padding: "4px 8px",
    fontSize: 11,
    fontWeight: 700,
  };
}

const storyBody = {
  margin: 0,
  color: "#687078",
  fontSize: 12,
  lineHeight: 1.45,
};

const seminarGapGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))",
  gap: 10,
};

function seminarGapItem(tone: "ready" | "gap") {
  return {
    display: "grid",
    gap: 7,
    minWidth: 0,
    border: "1px solid " + (tone === "ready" ? "rgba(59, 143, 99, 0.35)" : "#fde68a"),
    borderRadius: 8,
    background: tone === "ready" ? "#e9f5ee" : "#fef3c7",
    padding: 11,
  };
}

const seminarCandidateWrap = {
  display: "grid",
  gap: 10,
};

const seminarSubhead = {
  margin: 0,
  color: "#1f2529",
  fontSize: 15,
};

const seminarCandidateRow = {
  ...row,
  background: "#fdfdfb",
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
