import {
  STATION_DOCUMENT_TYPE_LABELS,
  STATION_DOCUMENT_TYPES,
  normalizeDocumentType,
  type StationDocumentType,
} from "@station/types";

export type PublishingTab = "drafts" | "published" | "archived";
export type PublishingApprovalState =
  | "draft"
  | "grounding_check"
  | "human_review"
  | "approved"
  | "regenerate"
  | "cancelled"
  | "scheduled"
  | "published"
  | "archived";

export interface PublishingDocument {
  id: string;
  title: string;
  slug?: string | null;
  document_type: string;
  status: string;
  visibility: string;
  published_at?: string | null;
  updated_at?: string | null;
  created_at?: string | null;
  space_id?: string | null;
  persona_id?: string | null;
  provenance_type?: string | null;
  source_label?: string | null;
  discussion_thread_id?: string | null;
  version?: number | null;
}

export interface PublishingDocumentVersion {
  id: string;
  versionNumber: number;
  title: string;
  slug: string;
  documentType: string;
  status: string;
  visibility: string;
  sourceLabel?: string | null;
  capturedAt?: string | null;
}

export interface PublishingSpace {
  id: string;
  title: string;
  slug: string;
}

export interface PublishingApproval {
  id: string;
  documentId: string;
  state: PublishingApprovalState;
  visibility: "public" | "community" | "unlisted";
  scheduledFor?: string | null;
  groundingSummary?: string | null;
  reviewNote?: string | null;
  updatedAt?: string | null;
  document?: PublishingDocument | null;
}

export interface PublishingTrustRow {
  id: "document" | "source" | "version" | "discussion";
  label: string;
  value: string;
  body: string;
  tone: "info" | "good" | "warning";
}

export const PUBLISHING_TABS: Array<{ id: PublishingTab; label: string }> = [
  { id: "drafts", label: "Drafts" },
  { id: "published", label: "Published" },
  { id: "archived", label: "Archived" },
];

export const PUBLISHING_PROVENANCE_LABELS: Record<string, string> = {
  user_authored: "User-authored",
  ai_assisted: "AI-assisted",
  archive_import: "Archive import",
  integrity_session: "Integrity Session",
  persona_derived: "Persona-derived",
};

export const DOCUMENT_TYPE_OPTIONS = STATION_DOCUMENT_TYPES.map((value) => ({
  value,
  label: STATION_DOCUMENT_TYPE_LABELS[value],
}));

export function normalizeDocumentSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 120);
}

export function slugifyDocumentTitle(value: string): string {
  return normalizeDocumentSlug(value) || "station-document";
}

export function documentTypeLabel(value: string): string {
  const normalized = normalizeDocumentType(value) as StationDocumentType | string;
  return STATION_DOCUMENT_TYPE_LABELS[normalized as keyof typeof STATION_DOCUMENT_TYPE_LABELS] ?? normalized;
}

export function normalizeDocumentTypeForForm(value: string): StationDocumentType {
  const normalized = normalizeDocumentType(value);
  return (STATION_DOCUMENT_TYPES as readonly string[]).includes(normalized)
    ? normalized as StationDocumentType
    : "essay";
}

export function tabForDocumentStatus(status: string): PublishingTab {
  if (status === "published") return "published";
  if (status === "archived") return "archived";
  return "drafts";
}

export function filterDocumentsForPublishingTab(
  documents: PublishingDocument[],
  tab: PublishingTab,
): PublishingDocument[] {
  return documents.filter((document) => tabForDocumentStatus(document.status) === tab);
}

export function publishingStatusLabel(status: string): string {
  if (status === "published") return "Published";
  if (status === "archived") return "Archived";
  return "Draft";
}

export function publishingApprovalStateLabel(state?: string | null): string {
  const labels: Record<string, string> = {
    draft: "Draft",
    grounding_check: "Grounding check",
    human_review: "Human review",
    approved: "Approved",
    regenerate: "Regenerate",
    cancelled: "Cancelled",
    scheduled: "Scheduled",
    published: "Published",
    archived: "Archived",
  };
  return state ? labels[state] ?? "Review" : "Not queued";
}

export function documentProvenanceLabel(value?: string | null): string {
  return value ? PUBLISHING_PROVENANCE_LABELS[value] ?? labelize(value) : "Unlabelled provenance";
}

export function publishingSourceLabelForReadback(value?: string | null): string | null {
  const clean = sanitizePublishingReadbackText(value ?? "");
  return clean || null;
}

export function documentTrustReadback(input: {
  document: Pick<PublishingDocument, "document_type" | "status" | "visibility" | "provenance_type" | "source_label" | "version" | "discussion_thread_id"> & {
    comments_enabled?: boolean | null;
  };
  isOwner: boolean;
  hasDiscussion: boolean;
  discussionEligible: boolean;
  discussionLoading: boolean;
}): PublishingTrustRow[] {
  const document = input.document;
  const currentVersion = document.version && document.version > 0 ? document.version : 1;
  const typeLabel = documentTypeLabel(document.document_type);
  const statusLabel = publishingStatusLabel(document.status);
  const provenance = documentProvenanceLabel(document.provenance_type);
  const sourceLabel = publishingSourceLabelForReadback(document.source_label);

  return [
    {
      id: "document",
      label: "Document state",
      value: `${typeLabel} / ${statusLabel}`,
      tone: document.status === "published" ? "good" : "info",
      body: document.status === "published"
        ? `This is the current ${visibilityLabel(document.visibility)} published copy for readers allowed by its visibility.`
        : input.isOwner
          ? "This owner-visible draft is not part of the public Space until it is published."
          : "This document is not currently public for this viewer.",
    },
    {
      id: "source",
      label: "Provenance",
      value: provenance,
      tone: document.provenance_type && document.provenance_type !== "user_authored" ? "warning" : "info",
      body: sourceLabel
        ? `Source label: ${sourceLabel}. ${privateSourceBoundaryCopy(document.provenance_type)}`
        : privateSourceBoundaryCopy(document.provenance_type),
    },
    {
      id: "version",
      label: "Version",
      value: `v${currentVersion}`,
      tone: currentVersion > 1 ? "good" : "info",
      body: input.isOwner
        ? "Owners can review prior versions privately; public readers only receive the current published copy."
        : "Public readers only receive the current published copy; prior drafts and owner version history stay private.",
    },
    {
      id: "discussion",
      label: "Discussion",
      value: discussionTrustValue(input),
      tone: input.hasDiscussion ? "good" : input.discussionEligible ? "warning" : "info",
      body: discussionTrustBody(input),
    },
  ];
}

export function publishingDashboardTrustLine(
  document: Pick<PublishingDocument, "source_label" | "version" | "space_id">,
  approval: Pick<PublishingApproval, "state"> | null,
  spaces: PublishingSpace[],
): string {
  const approvalLabel = publishingApprovalStateLabel(approval?.state);
  const destination = documentDestinationLabel(document, spaces);
  const currentVersion = document.version && document.version > 0 ? document.version : 1;
  const source = publishingSourceLabelForReadback(document.source_label);
  const sourceCopy = source ? ` Source: ${source}.` : "";
  return `${approvalLabel} / ${destination} / v${currentVersion}.${sourceCopy} Private source rows stay private.`;
}

export function approvalForDocument(
  approvals: PublishingApproval[],
  documentId: string,
): PublishingApproval | null {
  return approvals.find((approval) => approval.documentId === documentId) ?? null;
}

export function spaceForDocument(
  document: Pick<PublishingDocument, "space_id">,
  spaces: PublishingSpace[],
): PublishingSpace | null {
  return spaces.find((space) => space.id === document.space_id) ?? null;
}

const PUBLIC_READABLE_DOCUMENT_VISIBILITIES = new Set(["public", "community", "unlisted"]);

export function isPublicReadableDocument(
  document: Pick<PublishingDocument, "status" | "visibility">,
): boolean {
  return document.status === "published" && PUBLIC_READABLE_DOCUMENT_VISIBILITIES.has(document.visibility);
}

export function canRetractPublishedDocument(
  document: Pick<PublishingDocument, "status" | "visibility">,
): boolean {
  return isPublicReadableDocument(document);
}

export function publicationRetractNotice(
  document: Pick<PublishingDocument, "title">,
): string {
  const title = sanitizePublishingReadbackText(document.title) || "Document";
  return `${title} is now private. Public readers and linked discussion routes can no longer open it; the owner-visible record remains in Studio.`;
}

export function publicDocumentHref(
  document: Pick<PublishingDocument, "id" | "space_id" | "status" | "visibility">,
  spaces: PublishingSpace[],
): string | null {
  if (!isPublicReadableDocument(document)) return null;
  const space = spaceForDocument(document, spaces);
  return space ? `/space/${space.slug}/documents/${document.id}` : null;
}

export function documentEditHref(documentId: string): string {
  return `/studio/publish?documentId=${encodeURIComponent(documentId)}`;
}

export function documentPublicVersionLabel(currentVersion: number | null | undefined): string {
  const current = currentVersion && currentVersion > 0 ? currentVersion : 1;
  return `Current public version v${current}.`;
}

export function documentDestinationLabel(
  document: Pick<PublishingDocument, "space_id">,
  spaces: PublishingSpace[],
): string {
  const space = spaceForDocument(document, spaces);
  return space ? `Station / ${space.title}` : "Station draft";
}

export function publishingQueueActionGuard(
  document: Pick<PublishingDocument, "space_id">,
  canPublish: boolean,
): { canAct: true } | { canAct: false; label: string; title: string } {
  if (!document.space_id) {
    return {
      canAct: false,
      label: "Space required",
      title: "Choose and save a Space before using the publishing approval queue.",
    };
  }

  if (!canPublish) {
    return {
      canAct: false,
      label: "Creator required",
      title: "Creator tier or above is required to move documents through the publishing approval queue.",
    };
  }

  return { canAct: true };
}

export function documentVersionSummaryLabel(
  currentVersion: number | null | undefined,
  versions: Pick<PublishingDocumentVersion, "versionNumber">[],
): string {
  const current = currentVersion && currentVersion > 0 ? currentVersion : 1;
  if (versions.length === 0) return `Current version v${current}; no prior versions yet.`;
  const oldest = Math.min(...versions.map((version) => version.versionNumber));
  const newestPrior = Math.max(...versions.map((version) => version.versionNumber));
  return `Current version v${current}; ${versions.length} prior version${versions.length === 1 ? "" : "s"} saved from v${oldest} to v${newestPrior}.`;
}

function privateSourceBoundaryCopy(provenanceType?: string | null) {
  if (provenanceType && provenanceType !== "user_authored") {
    return "This public document is a separate curated copy; raw private source rows, archive chunks, prompts, and owner IDs stay private.";
  }

  return "Private Studio records, drafts, prompts, archive rows, and owner data stay hidden.";
}

function discussionTrustValue(input: {
  hasDiscussion: boolean;
  discussionEligible: boolean;
  discussionLoading: boolean;
}) {
  if (input.hasDiscussion) return "Linked";
  if (input.discussionLoading) return "Checking";
  if (input.discussionEligible) return "Eligible";
  return "Not open";
}

function discussionTrustBody(input: {
  isOwner: boolean;
  hasDiscussion: boolean;
  discussionEligible: boolean;
  discussionLoading: boolean;
}) {
  if (input.hasDiscussion) {
    return "A forum thread is linked to this document under the document visibility rules.";
  }

  if (input.discussionLoading) {
    return "Station is checking whether a visible discussion thread is attached.";
  }

  if (input.discussionEligible && input.isOwner) {
    return "The owner can open a linked discussion without exposing private source material.";
  }

  if (input.discussionEligible) {
    return "This document can have a linked discussion, but no visible thread has been opened yet.";
  }

  return "No linked public discussion is available for this document.";
}

function visibilityLabel(value: string) {
  if (value === "community" || value === "members") return "community";
  if (value === "unlisted") return "unlisted";
  if (value === "private") return "private";
  return "public";
}

function sanitizePublishingReadbackText(value: string) {
  return value
    .replace(/https?:\/\/\S+/gi, "[redacted-url]")
    .replace(/\b(?:postgres(?:ql)?|redis|mysql):\/\/\S+/gi, "[redacted-url]")
    .replace(/\b(?:ghp|sk|pk|rk|whsec)_[a-z0-9_=-]{8,}\b/gi, "[redacted-secret]")
    .replace(/\b(?:sk|pk|rk)-[a-z0-9][a-z0-9_-]{6,}\b/gi, "[redacted-secret]")
    .replace(/\bA(?:KIA|SIA)[A-Z0-9]{16}\b/gi, "[redacted-secret]")
    .replace(/\b(?:bearer)\s+\S+/gi, "bearer [redacted]")
    .replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/gi, "[redacted-id]")
    .replace(/\b(token|cookie|authorization|api[_\s-]?key|x-api-key|secret|password|source[_\s-]?id|owner[_\s-]?id)\b\s*[:=]\s*\S+/gi, "$1=[redacted]")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);
}

function labelize(value: string) {
  const clean = value.replace(/[_-]+/g, " ").trim();
  return clean ? clean[0].toUpperCase() + clean.slice(1) : "Unknown";
}
