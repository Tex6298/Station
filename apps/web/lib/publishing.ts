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

export const PUBLISHING_TABS: Array<{ id: PublishingTab; label: string }> = [
  { id: "drafts", label: "Drafts" },
  { id: "published", label: "Published" },
  { id: "archived", label: "Archived" },
];

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

export function publicDocumentHref(
  document: Pick<PublishingDocument, "id" | "space_id">,
  spaces: PublishingSpace[],
): string | null {
  const space = spaceForDocument(document, spaces);
  return space ? `/space/${space.slug}/documents/${document.id}` : null;
}

export function documentDestinationLabel(
  document: Pick<PublishingDocument, "space_id">,
  spaces: PublishingSpace[],
): string {
  const space = spaceForDocument(document, spaces);
  return space ? `Station / ${space.title}` : "Station draft";
}
