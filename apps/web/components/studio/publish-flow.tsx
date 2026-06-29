"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { canPublishDocuments } from "@station/auth";
import { apiGet, apiPatch, apiPost } from "@/lib/api-client";
import { getSession } from "@/lib/auth";
import {
  DOCUMENT_TYPE_OPTIONS,
  documentVersionCompareReadback,
  documentVersionSummaryLabel,
  documentTypeLabel,
  normalizeDocumentSlug,
  normalizeDocumentTypeForForm,
  stationAuthoringGuidance,
  slugifyDocumentTitle,
  type PublishingDocument,
  type PublishingDocumentVersion,
  type PublishingSpace,
  type DocumentVersionCompareReadback,
} from "@/lib/publishing";

type PersonaOption = { id: string; name: string };

type DocumentForm = {
  title: string;
  slug: string;
  body: string;
  documentType: string;
  visibility: "private" | "unlisted" | "community" | "public";
  commentsEnabled: boolean;
  spaceId: string;
  personaId: string;
};

type SavedDocument = PublishingDocument & {
  body?: string | null;
  comments_enabled?: boolean | null;
};

const initialForm: DocumentForm = {
  title: "Untitled Station draft",
  slug: "untitled-station-draft",
  body: "",
  documentType: "essay",
  visibility: "private",
  commentsEnabled: true,
  spaceId: "",
  personaId: "",
};

const connectors = ["Reddit", "X / Twitter", "LinkedIn", "Substack"];

export function PublishFlow() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [form, setForm] = useState<DocumentForm>(initialForm);
  const [spaces, setSpaces] = useState<PublishingSpace[]>([]);
  const [personas, setPersonas] = useState<PersonaOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [publishingAllowed, setPublishingAllowed] = useState(false);
  const [userTier, setUserTier] = useState("visitor");
  const [slugEdited, setSlugEdited] = useState(false);
  const [stationDestination, setStationDestination] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [versions, setVersions] = useState<PublishingDocumentVersion[]>([]);
  const [currentVersion, setCurrentVersion] = useState(1);
  const [hasOwnerVersionAccess, setHasOwnerVersionAccess] = useState(false);
  const [currentDocumentStatus, setCurrentDocumentStatus] = useState("draft");
  const [currentDocumentPublishedAt, setCurrentDocumentPublishedAt] = useState<string | null>(null);
  const [currentDocumentUpdatedAt, setCurrentDocumentUpdatedAt] = useState<string | null>(null);
  const [currentDocumentProvenanceType, setCurrentDocumentProvenanceType] = useState<string | null>("user_authored");
  const [currentDocumentSourceLabel, setCurrentDocumentSourceLabel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const session = await getSession();
        if (!session) {
          if (!cancelled) {
            setLoading(false);
            setError("Sign in to draft and publish Station documents.");
          }
          return;
        }

        const params = typeof window === "undefined" ? new URLSearchParams() : new URLSearchParams(window.location.search);
        const requestedDocumentId = params.get("documentId");

        const [spaceData, personaData, documentData] = await Promise.all([
          apiGet<{ spaces: PublishingSpace[] }>("/spaces", session.access_token).catch(() => ({ spaces: [] })),
          apiGet<{ personas: PersonaOption[] }>("/personas", session.access_token).catch(() => ({ personas: [] })),
          requestedDocumentId
            ? apiGet<{ document: SavedDocument }>(`/documents/${requestedDocumentId}`, session.access_token).catch(() => null)
            : Promise.resolve(null),
        ]);

        if (cancelled) return;

        setToken(session.access_token);
        setPublishingAllowed(canPublishDocuments(session.user));
        setUserTier(session.user.tier);
        setSpaces(spaceData.spaces ?? []);
        setPersonas(personaData.personas ?? []);

        const loadedDocument = documentData?.document;
        if (loadedDocument) {
          setDocumentId(loadedDocument.id);
          setCurrentVersion(loadedDocument.version ?? 1);
          setCurrentDocumentStatus(loadedDocument.status ?? "draft");
          setCurrentDocumentPublishedAt(loadedDocument.published_at ?? null);
          setCurrentDocumentUpdatedAt(loadedDocument.updated_at ?? null);
          setCurrentDocumentProvenanceType(loadedDocument.provenance_type ?? "user_authored");
          setCurrentDocumentSourceLabel(loadedDocument.source_label ?? null);
          setForm({
            title: loadedDocument.title,
            slug: loadedDocument.slug || slugifyDocumentTitle(loadedDocument.title),
            body: loadedDocument.body ?? "",
            documentType: normalizeDocumentTypeForForm(loadedDocument.document_type),
            visibility: normalizeVisibilityForForm(loadedDocument.visibility),
            commentsEnabled: loadedDocument.comments_enabled !== false,
            spaceId: loadedDocument.space_id ?? "",
            personaId: loadedDocument.persona_id ?? "",
          });
          setStationDestination(Boolean(loadedDocument.space_id));
          setSlugEdited(true);

          const versionData = await apiGet<{ currentVersion: number; versions: PublishingDocumentVersion[] }>(
            `/documents/${loadedDocument.id}/versions`,
            session.access_token,
          )
            .then((data) => ({ ...data, hasOwnerVersionAccess: true }))
            .catch(() => ({
              currentVersion: loadedDocument.version ?? 1,
              versions: [],
              hasOwnerVersionAccess: false,
            }));
          if (!cancelled) {
            setCurrentVersion(versionData.currentVersion ?? loadedDocument.version ?? 1);
            setVersions(versionData.versions ?? []);
            setHasOwnerVersionAccess(versionData.hasOwnerVersionAccess);
          }
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not load publishing workspace.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedSpace = useMemo(
    () => spaces.find((space) => space.id === form.spaceId) ?? null,
    [form.spaceId, spaces],
  );

  const authoringReviewReady = Boolean(
    publishingAllowed &&
    stationDestination &&
    form.spaceId &&
    form.visibility !== "private" &&
    form.title.trim() &&
    form.slug.trim(),
  );

  const authoringGuidance = useMemo(
    () => stationAuthoringGuidance({
      documentType: form.documentType,
      visibility: form.visibility,
      hasSpace: Boolean(form.spaceId),
      stationDestination,
      canSubmitReview: authoringReviewReady,
      commentsEnabled: form.commentsEnabled,
      hasDocumentId: Boolean(documentId),
      currentVersion,
      priorVersionCount: versions.length,
    }),
    [
      authoringReviewReady,
      currentVersion,
      documentId,
      form.commentsEnabled,
      form.documentType,
      form.spaceId,
      form.visibility,
      stationDestination,
      versions.length,
    ],
  );

  const versionCompare = useMemo(
    () => documentId && hasOwnerVersionAccess
      ? documentVersionCompareReadback({
          current: {
            title: form.title,
            slug: form.slug,
            document_type: form.documentType,
            status: currentDocumentStatus,
            visibility: form.visibility,
            comments_enabled: form.commentsEnabled,
            space_id: form.spaceId || null,
            persona_id: form.personaId || null,
            published_at: currentDocumentPublishedAt,
            updated_at: currentDocumentUpdatedAt,
            provenance_type: currentDocumentProvenanceType,
            source_label: currentDocumentSourceLabel,
            version: currentVersion,
          },
          versions,
        })
      : null,
    [
      currentDocumentProvenanceType,
      currentDocumentPublishedAt,
      currentDocumentSourceLabel,
      currentDocumentStatus,
      currentDocumentUpdatedAt,
      currentVersion,
      documentId,
      form.commentsEnabled,
      form.documentType,
      form.personaId,
      form.slug,
      form.spaceId,
      form.title,
      form.visibility,
      hasOwnerVersionAccess,
      versions,
    ],
  );

  const wordCount = useMemo(() => form.body.trim().split(/\s+/).filter(Boolean).length, [form.body]);
  const readTime = Math.max(1, Math.ceil(wordCount / 220));
  const publishVisibilityReady = form.visibility !== "private";
  const canSave = Boolean(publishingAllowed && token && form.title.trim() && form.slug.trim());
  const canSubmitReview = Boolean(canSave && stationDestination && form.spaceId && publishVisibilityReady);

  function setField<K extends keyof DocumentForm>(field: K, value: DocumentForm[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleTitleChange(title: string) {
    setForm((current) => ({
      ...current,
      title,
      slug: slugEdited ? current.slug : slugifyDocumentTitle(title),
    }));
  }

  function handleSlugChange(value: string) {
    setSlugEdited(true);
    setField("slug", normalizeDocumentSlug(value));
  }

  function buildPayload() {
    return {
      ...(form.spaceId ? { spaceId: form.spaceId } : {}),
      personaId: form.personaId || null,
      title: form.title.trim(),
      slug: form.slug.trim(),
      body: form.body,
      documentType: form.documentType,
      visibility: form.visibility,
      commentsEnabled: form.commentsEnabled,
    };
  }

  async function saveDraft(): Promise<SavedDocument | null> {
    if (!token) {
      router.push("/login");
      return null;
    }
    if (!publishingAllowed) {
      setError(`Your current ${userTier} tier cannot create Station documents. Upgrade to Creator or above before saving drafts.`);
      return null;
    }
    if (!form.title.trim() || !form.slug.trim()) {
      setError("Title and slug are required before saving.");
      return null;
    }

    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const response = documentId
        ? await apiPatch<{ document: SavedDocument }>(`/documents/${documentId}`, buildPayload(), token)
        : await apiPost<{ document: SavedDocument }>("/documents", buildPayload(), token);

      setDocumentId(response.document.id);
      setCurrentVersion(response.document.version ?? currentVersion);
      setCurrentDocumentStatus(response.document.status ?? currentDocumentStatus);
      setCurrentDocumentPublishedAt(response.document.published_at ?? currentDocumentPublishedAt);
      setCurrentDocumentUpdatedAt(response.document.updated_at ?? currentDocumentUpdatedAt);
      setCurrentDocumentProvenanceType(response.document.provenance_type ?? currentDocumentProvenanceType);
      setCurrentDocumentSourceLabel(response.document.source_label ?? currentDocumentSourceLabel);
      setForm((current) => ({
        ...current,
        title: response.document.title,
        slug: response.document.slug || current.slug,
        documentType: normalizeDocumentTypeForForm(response.document.document_type),
        visibility: normalizeVisibilityForForm(response.document.visibility),
        spaceId: response.document.space_id ?? current.spaceId,
        personaId: response.document.persona_id ?? current.personaId,
        commentsEnabled: response.document.comments_enabled !== false,
      }));
      const versionData = await apiGet<{ currentVersion: number; versions: PublishingDocumentVersion[] }>(
        `/documents/${response.document.id}/versions`,
        token,
      )
        .then((data) => ({ ...data, hasOwnerVersionAccess: true }))
        .catch(() => ({
          currentVersion: response.document.version ?? currentVersion,
          versions,
          hasOwnerVersionAccess: false,
        }));
      setCurrentVersion(versionData.currentVersion ?? response.document.version ?? currentVersion);
      setVersions(versionData.versions ?? []);
      setHasOwnerVersionAccess(versionData.hasOwnerVersionAccess);
      setNotice("Draft saved.");
      return response.document;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save document.");
      return null;
    } finally {
      setSaving(false);
    }
  }

  async function submitForReview() {
    if (!canSubmitReview) {
      setError("Choose a Station Space and public, community, or unlisted visibility before review. Drafts can still be saved privately.");
      return;
    }

    setSubmittingReview(true);
    setError(null);
    setNotice(null);
    try {
      const saved = await saveDraft();
      if (!saved || !token) return;

      await apiPost(
        "/publishing/approvals",
        {
          documentId: saved.id,
          visibility: form.visibility === "private" ? "public" : form.visibility,
          note: "Submitted from Studio publish flow.",
        },
        token,
      );
      setDocumentId(saved.id);
      setNotice("Draft sent to the publishing approval queue.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not submit document for review.");
    } finally {
      setSubmittingReview(false);
    }
  }

  if (loading) {
    return (
      <main style={pageShell}>
        <div style={pageInner}>
          <section style={panel}>Loading publishing workspace...</section>
        </div>
      </main>
    );
  }

  return (
    <main style={pageShell}>
      <div style={pageInner}>
        <header style={header}>
          <div>
            <div style={eyebrow}>Publish Flow</div>
            <h1 style={title}>Prepare a Station document.</h1>
            <p style={lede}>
              Draft long-form writing, save it to your private Studio, and publish only when the destination and visibility are explicit.
            </p>
          </div>
          <div style={actions}>
            <Link href="/studio/publishing" style={secondaryLink}>Dashboard</Link>
            <button type="button" onClick={() => setPreviewOpen((value) => !value)} style={secondaryButton}>
              {previewOpen ? "Hide preview" : "Preview"}
            </button>
            <button type="button" onClick={() => void saveDraft()} disabled={!canSave || saving || submittingReview} style={secondaryButton}>
              {saving ? "Saving..." : "Save draft"}
            </button>
            <button type="button" onClick={() => void submitForReview()} disabled={!canSubmitReview || submittingReview || saving} style={primaryButton}>
              {submittingReview ? "Submitting..." : "Send for review"}
            </button>
          </div>
        </header>

        {error ? <div style={errorNotice}>{error}</div> : null}
        {!publishingAllowed ? (
          <div style={tierNotice}>
            Creator tier or above is required to save and publish Station documents. Current tier: {userTier}.
          </div>
        ) : null}
        {notice ? (
          <div style={successNotice}>
            {notice}
            {" "}
            <Link href="/studio/publishing" style={inlineLink}>Open queue</Link>
          </div>
        ) : null}

        <div style={layoutGrid}>
          <section style={panel}>
            <div style={formatRow}>
              {DOCUMENT_TYPE_OPTIONS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setField("documentType", item.value)}
                  style={pillButton(item.value === form.documentType)}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <input
              value={form.title}
              onChange={(event) => handleTitleChange(event.target.value)}
              style={titleInput}
              aria-label="Document title"
            />

            <div style={metaGrid}>
              <label style={fieldLabel}>
                Slug
                <input value={form.slug} onChange={(event) => handleSlugChange(event.target.value)} style={input} />
              </label>
              <label style={fieldLabel}>
                Visibility
                <select value={form.visibility} onChange={(event) => setField("visibility", normalizeVisibilityForForm(event.target.value))} style={input}>
                  <option value="private">Private</option>
                  <option value="unlisted">Unlisted</option>
                  <option value="community">Community</option>
                  <option value="public">Public</option>
                </select>
              </label>
              <label style={fieldLabel}>
                Persona
                <select value={form.personaId} onChange={(event) => setField("personaId", event.target.value)} style={input}>
                  <option value="">No linked persona</option>
                  {personas.map((persona) => (
                    <option key={persona.id} value={persona.id}>{persona.name}</option>
                  ))}
                </select>
              </label>
            </div>

            <div style={disabledToolbar} aria-label="Formatting tools deferred">
              {["Bold", "Italic", "Heading", "List", "Quote", "Link", "Image"].map((item) => (
                <button key={item} type="button" disabled title="Rich formatting tools are deferred; write Markdown directly in this slice." style={disabledToolButton}>
                  {item}
                </button>
              ))}
            </div>

            <textarea
              value={form.body}
              onChange={(event) => setField("body", event.target.value)}
              placeholder="Write the document body..."
              style={editor}
            />

            <div style={footerMeta}>
              <span>{documentTypeLabel(form.documentType)} metadata</span>
              <span>{wordCount} words - {readTime} min read</span>
            </div>
          </section>

          <aside style={{ display: "grid", gap: 14 }}>
            <section style={panel}>
              <SectionTitle title="Authoring Guide" />
              <div style={guidanceGrid}>
                {authoringGuidance.map((item) => (
                  <div key={item.id} style={guidanceRow(item.tone)}>
                    <div style={guidanceHeader}>
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                    </div>
                    <p style={guidanceBody}>{item.body}</p>
                  </div>
                ))}
              </div>
            </section>

            {documentId && hasOwnerVersionAccess ? (
              <section style={panel}>
                <SectionTitle title="Version History" />
                <div style={helperText}>{documentVersionSummaryLabel(currentVersion, versions)}</div>
                {versionCompare ? <VersionCompareReadback compare={versionCompare} /> : null}
                {versions.length > 0 ? (
                  <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
                    {versions.slice(0, 4).map((version) => (
                      <div key={version.id} style={versionRow}>
                        <span>v{version.versionNumber}</span>
                        <strong>{version.title}</strong>
                        <small>{documentTypeLabel(version.documentType)} / {version.visibility}</small>
                      </div>
                    ))}
                  </div>
                ) : null}
              </section>
            ) : null}

            <section style={panel}>
              <SectionTitle title="Station Destination" />
              <label style={checkRow}>
                <input
                  type="checkbox"
                  checked={stationDestination}
                  onChange={(event) => setStationDestination(event.target.checked)}
                />
                Publish as a Station document
              </label>
              <label style={fieldLabel}>
                Space
                <select value={form.spaceId} onChange={(event) => setField("spaceId", event.target.value)} style={input}>
                  <option value="">No Space selected</option>
                  {spaces.map((space) => (
                    <option key={space.id} value={space.id}>{space.title}</option>
                  ))}
                </select>
              </label>
              <div style={helperText}>
                {selectedSpace && publishVisibilityReady
                  ? `Publishing will create a ${form.visibility} document route under ${selectedSpace.title}.`
                  : "Save drafts privately; choose a Space and non-private visibility before publishing."}
              </div>
              {spaces.length === 0 ? <Link href="/space/new" style={inlineLink}>Create a Space</Link> : null}
              <label style={{ ...checkRow, marginTop: 10 }}>
                <input
                  type="checkbox"
                  checked={form.commentsEnabled}
                  onChange={(event) => setField("commentsEnabled", event.target.checked)}
                />
                Allow document discussion
              </label>
            </section>

            <section style={panel}>
              <SectionTitle title="External Connectors" />
              <div style={helperText}>Deferred until the approval queue and connector readiness checks are in place.</div>
              <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
                {connectors.map((connector) => (
                  <div key={connector} style={connectorRow}>
                    <span>{connector}</span>
                    <button type="button" disabled title="External dispatch is out of scope for PR10." style={disabledMiniButton}>
                      Deferred
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <section style={panel}>
              <SectionTitle title="Scheduling" />
              <label style={checkRow}>
                <input type="radio" checked readOnly />
                Publish immediately
              </label>
              <button type="button" disabled title="Scheduled publishing needs the later worker lane." style={{ ...disabledMiniButton, width: "100%" }}>
                Scheduling deferred
              </button>
            </section>

            {previewOpen ? (
              <section style={panel}>
                <SectionTitle title="Preview" />
                <h3 style={{ margin: "0 0 8px", color: "#1f2529", fontSize: 18 }}>{form.title || "Untitled document"}</h3>
                <div style={helperText}>{documentTypeLabel(form.documentType)} / {form.visibility}</div>
                <div style={previewBody}>{form.body || "Nothing written yet."}</div>
              </section>
            ) : null}
          </aside>
        </div>
      </div>
    </main>
  );
}

function normalizeVisibilityForForm(value: string): DocumentForm["visibility"] {
  return value === "public" || value === "community" || value === "unlisted" || value === "private"
    ? value
    : "private";
}

function SectionTitle({ title }: { title: string }) {
  return <h2 style={{ margin: "0 0 12px", color: "#1f2529", fontSize: 16 }}>{title}</h2>;
}

function VersionCompareReadback({ compare }: { compare: DocumentVersionCompareReadback }) {
  return (
    <div style={versionComparePanel}>
      <div style={versionCompareHeader}>
        <strong>{compare.priorVersionLabel ? `${compare.currentVersionLabel} vs ${compare.priorVersionLabel}` : compare.currentVersionLabel}</strong>
        <span>{compare.status === "ready" ? "Metadata compare" : "No prior version"}</span>
      </div>
      <p style={versionCompareSummary}>{compare.summary}</p>
      {compare.rows.length > 0 && (
        <div style={versionCompareRows}>
          {compare.rows.map((row) => (
            <div key={row.id} style={versionCompareRow(row.state)}>
              <div style={versionCompareRowHeader}>
                <span>{row.label}</span>
                <strong>{row.state === "changed" ? "Changed" : "Unchanged"}</strong>
              </div>
              <div style={versionCompareValues}>
                <span>Current: {row.currentValue}</span>
                <span>Prior: {row.priorValue}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      <div style={versionCompareBoundary}>{compare.boundary}</div>
    </div>
  );
}

const pageShell = {
  minHeight: "calc(100vh - 52px)",
  background: "#f4f2ec",
};

const pageInner = {
  maxWidth: 1240,
  margin: "0 auto",
  padding: "24px clamp(16px, 4vw, 32px) 48px",
};

const header = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 16,
  flexWrap: "wrap" as const,
  marginBottom: 20,
};

const eyebrow = {
  color: "#534ab7",
  fontSize: 11,
  textTransform: "uppercase" as const,
  fontWeight: 800,
};

const title = {
  margin: "8px 0 6px",
  color: "#1f2529",
  fontSize: 38,
  lineHeight: 1.05,
};

const lede = {
  margin: 0,
  color: "#565f67",
  fontSize: 15,
  lineHeight: 1.6,
  maxWidth: 720,
};

const actions = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap" as const,
  justifyContent: "flex-end",
};

const layoutGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
  gap: 18,
  alignItems: "start",
};

const panel = {
  border: "1px solid #d8d3c8",
  background: "#ffffff",
  borderRadius: 8,
  padding: 16,
};

const primaryButton = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 40,
  border: "1px solid #2563eb",
  borderRadius: 8,
  background: "#2563eb",
  color: "#fff",
  padding: "0 14px",
  fontSize: 14,
  fontWeight: 800,
  cursor: "pointer",
};

const secondaryButton = {
  ...primaryButton,
  background: "#111827",
  borderColor: "#334155",
  color: "#d1d5db",
};

const secondaryLink = {
  ...secondaryButton,
  textDecoration: "none",
};

function pillButton(active: boolean) {
  return {
    border: "1px solid " + (active ? "#534ab7" : "#d8d3c8"),
    borderRadius: 999,
    background: active ? "#eeedfe" : "#ffffff",
    color: active ? "#1f2529" : "#565f67",
    padding: "7px 11px",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
  };
}

const formatRow = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap" as const,
  marginBottom: 14,
};

const titleInput = {
  width: "100%",
  border: 0,
  outline: "none",
  background: "transparent",
  color: "#1f2529",
  fontSize: 26,
  fontWeight: 800,
  lineHeight: 1.15,
};

const metaGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 190px), 1fr))",
  gap: 10,
  margin: "14px 0",
};

const fieldLabel = {
  display: "grid",
  gap: 6,
  color: "#565f67",
  fontSize: 12,
  fontWeight: 700,
};

const input = {
  width: "100%",
  border: "1px solid #d8d3c8",
  borderRadius: 8,
  background: "#ffffff",
  color: "#1f2529",
  padding: "10px 11px",
  fontSize: 13,
};

const disabledToolbar = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap" as const,
  borderBottom: "1px solid #e4dfd4",
  borderTop: "1px solid #e4dfd4",
  padding: "11px 0",
  margin: "14px 0",
};

const disabledToolButton = {
  border: "1px solid #d8d3c8",
  borderRadius: 7,
  background: "#f8f7f4",
  color: "#687078",
  padding: "7px 10px",
  fontSize: 12,
  fontWeight: 700,
  cursor: "not-allowed",
  opacity: 0.75,
};

const editor = {
  width: "100%",
  minHeight: 520,
  resize: "vertical" as const,
  border: 0,
  outline: "none",
  background: "transparent",
  color: "#1f2529",
  fontSize: 16,
  lineHeight: 1.75,
  fontFamily: "inherit",
};

const footerMeta = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  flexWrap: "wrap" as const,
  borderTop: "1px solid #e4dfd4",
  paddingTop: 12,
  color: "#687078",
  fontSize: 12,
};

const checkRow = {
  display: "flex",
  alignItems: "center",
  gap: 9,
  color: "#1f2529",
  fontSize: 13,
  marginBottom: 9,
};

const helperText = {
  color: "#687078",
  fontSize: 12,
  lineHeight: 1.45,
};

const guidanceGrid = {
  display: "grid",
  gap: 8,
};

const guidanceHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 10,
  color: "#1f2529",
  fontSize: 12,
};

const guidanceBody = {
  margin: "6px 0 0",
  color: "#565f67",
  fontSize: 12,
  lineHeight: 1.45,
};

function guidanceRow(tone: "info" | "good" | "warning") {
  const toneStyles = {
    info: { borderColor: "#d8d3c8", background: "#f8f7f4" },
    good: { borderColor: "rgba(59, 143, 99, 0.35)", background: "#e9f5ee" },
    warning: { borderColor: "rgba(133, 79, 11, 0.35)", background: "#f8efd9" },
  }[tone];

  return {
    border: `1px solid ${toneStyles.borderColor}`,
    borderRadius: 8,
    background: toneStyles.background,
    padding: 10,
  };
}

const inlineLink = {
  display: "inline-flex",
  marginTop: 10,
  color: "#534ab7",
  fontSize: 12,
  textDecoration: "none",
};

const connectorRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 8,
  border: "1px solid #d8d3c8",
  borderRadius: 8,
  background: "#f8f7f4",
  padding: 9,
  color: "#1f2529",
  fontSize: 13,
};

const versionRow = {
  display: "grid",
  gridTemplateColumns: "auto 1fr",
  gap: "2px 8px",
  border: "1px solid #d8d3c8",
  borderRadius: 8,
  background: "#f8f7f4",
  padding: 9,
  color: "#1f2529",
  fontSize: 13,
};

const versionComparePanel = {
  border: "1px solid #d8d3c8",
  borderRadius: 8,
  background: "#f8f7f4",
  padding: 10,
  marginTop: 12,
};

const versionCompareHeader = {
  display: "flex",
  justifyContent: "space-between",
  gap: 8,
  flexWrap: "wrap" as const,
  color: "#1f2529",
  fontSize: 12,
};

const versionCompareSummary = {
  margin: "7px 0 0",
  color: "#565f67",
  fontSize: 12,
  lineHeight: 1.45,
};

const versionCompareRows = {
  display: "grid",
  gap: 7,
  marginTop: 10,
};

function versionCompareRow(state: "changed" | "unchanged") {
  return {
    border: `1px solid ${state === "changed" ? "rgba(83, 74, 183, 0.24)" : "#e4dfd4"}`,
    borderRadius: 7,
    background: state === "changed" ? "#eeedfe" : "#ffffff",
    padding: 8,
  };
}

const versionCompareRowHeader = {
  display: "flex",
  justifyContent: "space-between",
  gap: 8,
  color: "#1f2529",
  fontSize: 12,
};

const versionCompareValues = {
  display: "grid",
  gap: 3,
  marginTop: 5,
  color: "#565f67",
  fontSize: 12,
};

const versionCompareBoundary = {
  marginTop: 10,
  color: "#687078",
  fontSize: 11,
  lineHeight: 1.45,
};

const disabledMiniButton = {
  border: "1px solid #d8d3c8",
  borderRadius: 7,
  background: "#ffffff",
  color: "#687078",
  padding: "5px 8px",
  fontSize: 12,
  cursor: "not-allowed",
  opacity: 0.75,
};

const previewBody = {
  marginTop: 12,
  whiteSpace: "pre-wrap" as const,
  color: "#1f2529",
  fontSize: 14,
  lineHeight: 1.65,
};

const errorNotice = {
  border: "1px solid rgba(248, 113, 113, 0.45)",
  borderRadius: 8,
  background: "rgba(127, 29, 29, 0.24)",
  color: "#fecaca",
  padding: 12,
  marginBottom: 14,
};

const successNotice = {
  border: "1px solid rgba(74, 222, 128, 0.35)",
  borderRadius: 8,
  background: "rgba(20, 83, 45, 0.22)",
  color: "#bbf7d0",
  padding: 12,
  marginBottom: 14,
};

const tierNotice = {
  border: "1px solid rgba(133, 79, 11, 0.35)",
  borderRadius: 8,
  background: "#f8efd9",
  color: "#854f0b",
  padding: 12,
  marginBottom: 14,
};
