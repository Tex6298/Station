"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { apiGet, apiPost } from "@/lib/api-client";
import { getSession } from "@/lib/auth";
import {
  buildContinuitySourceOptions,
  continuityRecordProvenanceLabels,
  continuityRecordText,
  continuityRecordTimestamp,
  continuityRecordTypeLabel,
  sortContinuityRecords,
  type ContinuityConversationLink,
  type ContinuityDocumentLink,
  type ContinuitySourceOption,
} from "@/lib/continuity-ui";
import type {
  ContinuityRecord,
  ContinuityRecordType,
  ContinuityRecordVisibility,
} from "@station/types/continuity";

interface ContinuityTimelineProps {
  personaId: string;
  personaName: string;
  onRecordCreated?: () => Promise<void> | void;
}

interface TimelineFormState {
  recordType: ContinuityRecordType;
  title: string;
  summary: string;
  body: string;
  sourceKey: string;
  visibility: ContinuityRecordVisibility;
}

const DEFAULT_FORM: TimelineFormState = {
  recordType: "timeline",
  title: "",
  summary: "",
  body: "",
  sourceKey: "",
  visibility: "private",
};

const RECORD_TYPES: ContinuityRecordType[] = [
  "timeline",
  "memory",
  "canon",
  "integrity",
  "archive_import",
  "archived_chat",
  "publication",
];

export function ContinuityTimeline({ personaId, personaName, onRecordCreated }: ContinuityTimelineProps) {
  const [token, setToken] = useState<string | null>(null);
  const [records, setRecords] = useState<ContinuityRecord[]>([]);
  const [documents, setDocuments] = useState<ContinuityDocumentLink[]>([]);
  const [conversations, setConversations] = useState<ContinuityConversationLink[]>([]);
  const [form, setForm] = useState<TimelineFormState>(DEFAULT_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sourceOptions = useMemo(
    () => buildContinuitySourceOptions(documents, conversations),
    [documents, conversations],
  );
  const sortedRecords = useMemo(() => sortContinuityRecords(records), [records]);
  const selectedSource = sourceOptions.find((option) => option.key === form.sourceKey) ?? null;

  const loadTimeline = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const session = await getSession();
      if (!session) {
        setRecords([]);
        setDocuments([]);
        setConversations([]);
        return;
      }

      setToken(session.access_token);
      const [recordData, documentData, conversationData] = await Promise.all([
        apiGet<{ records: ContinuityRecord[] }>(`/continuity/persona/${personaId}/records?limit=80`, session.access_token),
        apiGet<{ documents: ContinuityDocumentLink[] }>(`/documents?personaId=${personaId}`, session.access_token).catch(() => ({ documents: [] })),
        apiGet<{ conversations: ContinuityConversationLink[] }>(`/conversations/persona/${personaId}`, session.access_token).catch(() => ({ conversations: [] })),
      ]);
      setRecords(recordData.records ?? []);
      setDocuments(documentData.documents ?? []);
      setConversations(conversationData.conversations ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load continuity timeline.");
    } finally {
      setLoading(false);
    }
  }, [personaId]);

  useEffect(() => {
    loadTimeline();
  }, [loadTimeline]);

  function update<K extends keyof TimelineFormState>(key: K, value: TimelineFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function selectSource(key: string) {
    const source = sourceOptions.find((option) => option.key === key);
    setForm((current) => ({
      ...current,
      sourceKey: key,
      recordType: source?.recordType ?? current.recordType,
      title: current.title || source?.label.replace(/^(Document|Conversation):\s*/, "") || "",
    }));
  }

  async function createRecord(event: React.FormEvent) {
    event.preventDefault();
    if (!token || saving) return;

    const title = form.title.trim();
    const summary = form.summary.trim();
    const body = form.body.trim();
    if (!title && !summary && !body) {
      setError("Add a title, summary, or body before saving.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const response = await apiPost<{ record: ContinuityRecord }>(
        `/continuity/persona/${personaId}/records`,
        {
          recordType: form.recordType,
          title: title || undefined,
          summary: summary || undefined,
          body: body || undefined,
          visibility: form.visibility,
          source: selectedSource
            ? {
              table: selectedSource.table,
              id: selectedSource.id,
              label: selectedSource.sourceLabel,
              version: selectedSource.sourceVersion,
            }
            : undefined,
          metadata: selectedSource ? { linkedFrom: selectedSource.key } : {},
          occurredAt: new Date().toISOString(),
        },
        token,
      );
      setRecords((current) => [response.record, ...current]);
      setForm(DEFAULT_FORM);
      await onRecordCreated?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save continuity record.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="studio-empty">Loading Continuity...</div>;
  }

  return (
    <section className="studio-timeline-layout">
      <div className="studio-timeline-main">
        <div className="studio-section-heading">
          <div className="section-label">Continuity</div>
          <h2>{personaName} across sources</h2>
        </div>

        {error && <div className="space-form-error">{error}</div>}

        {sortedRecords.length === 0 ? (
          <div className="studio-empty">No continuity records yet. Add a private marker or link a document/conversation source when there is something worth preserving.</div>
        ) : (
          <div className="studio-timeline-list">
            {sortedRecords.map((record) => (
              <article key={record.id} className="studio-timeline-record">
                <div className="studio-timeline-marker" aria-hidden="true" />
                <div>
                  <div className="studio-timeline-row">
                    <span>{continuityRecordTypeLabel(record.recordType)}</span>
                    <time>{formatDate(continuityRecordTimestamp(record) ?? record.createdAt)}</time>
                  </div>
                  <h3>{record.title || continuityRecordTypeLabel(record.recordType)}</h3>
                  <p>{continuityRecordText(record)}</p>
                  <div className="studio-timeline-source" style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {continuityRecordProvenanceLabels(record).map((label) => (
                      <span className="studio-timeline-source-chip" key={label}>{label}</span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <form className="studio-timeline-form" onSubmit={createRecord}>
        <div className="studio-section-heading">
          <div className="section-label">Continuity Marker</div>
          <h2>Capture a source link</h2>
        </div>

        <label className="studio-form-field">
          <span>Type</span>
          <select className="select" value={form.recordType} onChange={(event) => update("recordType", event.target.value as ContinuityRecordType)}>
            {RECORD_TYPES.map((type) => (
              <option key={type} value={type}>{continuityRecordTypeLabel(type)}</option>
            ))}
          </select>
        </label>

        <label className="studio-form-field">
          <span>Linked source</span>
          <select className="select" value={form.sourceKey} onChange={(event) => selectSource(event.target.value)}>
            <option value="">No linked source</option>
            {sourceOptions.map((source) => (
              <option key={source.key} value={source.key}>{source.label}</option>
            ))}
          </select>
        </label>

        <label className="studio-form-field">
          <span>Title</span>
          <input className="input" value={form.title} onChange={(event) => update("title", event.target.value)} maxLength={200} />
        </label>

        <label className="studio-form-field">
          <span>Summary</span>
          <input className="input" value={form.summary} onChange={(event) => update("summary", event.target.value)} maxLength={1000} />
        </label>

        <label className="studio-form-field">
          <span>Body</span>
          <textarea className="textarea" value={form.body} onChange={(event) => update("body", event.target.value)} style={{ minHeight: 150 }} />
        </label>

        <label className="studio-form-field">
          <span>Visibility</span>
          <select className="select" value={form.visibility} onChange={(event) => update("visibility", event.target.value as ContinuityRecordVisibility)}>
            <option value="private">Private</option>
            <option value="community">Community</option>
            <option value="public">Public</option>
          </select>
        </label>

        <button className="button primary" type="submit" disabled={saving || !token}>
          {saving ? "Saving..." : "Save Marker"}
        </button>
      </form>
    </section>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
