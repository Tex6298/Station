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
  comments_enabled?: boolean | null;
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
  commentsEnabled?: boolean | null;
  spaceId?: string | null;
  personaId?: string | null;
  publishedAt?: string | null;
  provenanceType?: string | null;
  sourceType?: string | null;
  sourceLabel?: string | null;
  documentUpdatedAt?: string | null;
  capturedAt?: string | null;
}

export interface PublishingSpace {
  id: string;
  title: string;
  slug: string;
  is_public?: boolean | null;
  isPublic?: boolean | null;
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

export type AuthoringGuidanceTone = "info" | "good" | "warning";

export interface AuthoringGuidanceRow {
  id: "kind" | "visibility" | "version" | "review" | "discussion" | "retract";
  label: string;
  value: string;
  body: string;
  tone: AuthoringGuidanceTone;
}

export interface PublishingDashboardRouteStoryRow {
  id: "publish" | "retract" | "cleanup";
  label: string;
  value: string;
  body: string;
  tone: "info" | "warning";
}

export interface PublicationManifestSeminarRecord {
  status: string;
  visibility: string;
  publicDocumentHref?: string | null;
  schedule?: {
    startsAt: string;
    timeZone: string;
    durationMinutes: number | null;
  } | null;
}

export type PublicationManifestDiscussionStatus =
  | "attached"
  | "eligible"
  | "unavailable"
  | "disabled";

export interface PublicationManifestContract {
  schema: typeof STATION_PRESS_PUBLICATION_MANIFEST_SCHEMA;
  name: "Station Press publication manifest contract";
  version: 1;
  title: string;
  documentTypeLabel: string;
  statusLabel: string;
  visibilityLabel: string;
  publishedAtLabel: string;
  currentVersionLabel: string;
  publicDestinationLabel: string;
  sourceLabel: string;
  discussion: {
    status: PublicationManifestDiscussionStatus;
    label: string;
    detail: string;
  };
  seminar: {
    statusLabel: string;
    visibilityLabel: string;
    scheduleLabel: string;
    detail: string;
  } | null;
  packageReadback: {
    state: "metadata_ready" | "not_package_ready";
    label: string;
    detail: string;
  };
  excludedFutureMaterial: string[];
  boundary: string;
}

export interface PublicationManifestDisplayRow {
  id: "schema" | "state" | "destination" | "discussion" | "seminar" | "excluded";
  label: string;
  value: string;
}

export const STATION_PRESS_PUBLICATION_MANIFEST_SCHEMA =
  "station.press.publication_manifest_contract.v1";

export const STATION_PRESS_PUBLICATION_MANIFEST_EXCLUSIONS = [
  "PDF output",
  "binary archives",
  "original files",
  "print and fulfillment",
  "queues and workers",
  "public package URLs",
  "storage objects",
  "private bodies",
  "social dispatch",
  "billing",
  "commercial packaging",
] as const;

export type DocumentVersionCompareRowId =
  | "title"
  | "slug"
  | "documentType"
  | "status"
  | "visibility"
  | "comments"
  | "space"
  | "persona"
  | "publication"
  | "provenance"
  | "capturedAt";

export interface DocumentVersionCompareRow {
  id: DocumentVersionCompareRowId;
  label: string;
  currentValue: string;
  priorValue: string;
  state: "changed" | "unchanged";
}

export interface DocumentVersionCompareReadback {
  status: "ready" | "no-prior-version";
  currentVersionLabel: string;
  priorVersionLabel: string | null;
  summary: string;
  boundary: string;
  rows: DocumentVersionCompareRow[];
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

const DOCUMENT_TYPE_AUTHORING_INTENT: Record<StationDocumentType, { intent: string; useWhen: string }> = {
  essay: {
    intent: "Long-form argument or reflection.",
    useWhen: "Use it for authored prose that needs a clear public reading path.",
  },
  codex: {
    intent: "Canonical rules, principles, or operating notes.",
    useWhen: "Use it when the document should become part of a durable persona or Space reference.",
  },
  manifesto: {
    intent: "Public position or statement of intent.",
    useWhen: "Use it when the piece should read as a declaration rather than a working note.",
  },
  field_log: {
    intent: "Observed work, project evidence, or change notes.",
    useWhen: "Use it when provenance and dated observations matter more than polish.",
  },
  research: {
    intent: "Structured research, synthesis, or source-backed analysis.",
    useWhen: "Use it when readers need to understand evidence and conclusions together.",
  },
  archive_note: {
    intent: "Curated note derived from private archive material.",
    useWhen: "Use it when private source material needs a separate publishable copy.",
  },
  transcript: {
    intent: "Cleaned conversation or session record.",
    useWhen: "Use it when the shape of an exchange matters and private raw context must stay out.",
  },
};

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

export function documentTypeAuthoringIntent(value: string): { label: string; intent: string; useWhen: string } {
  const normalized = normalizeDocumentTypeForForm(value);
  return {
    label: documentTypeLabel(normalized),
    ...DOCUMENT_TYPE_AUTHORING_INTENT[normalized],
  };
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

export function stationAuthoringGuidance(input: {
  documentType: string;
  visibility: string;
  hasSpace: boolean;
  stationDestination?: boolean;
  canSubmitReview?: boolean;
  commentsEnabled: boolean;
  hasDocumentId: boolean;
  currentVersion?: number | null;
  priorVersionCount?: number;
}): AuthoringGuidanceRow[] {
  const type = documentTypeAuthoringIntent(input.documentType);
  const visibility = visibilityLabel(input.visibility);
  const currentVersion = input.currentVersion && input.currentVersion > 0 ? input.currentVersion : 1;
  const priorVersionCount = Math.max(0, input.priorVersionCount ?? 0);
  const publicReady = input.visibility !== "private";
  const stationDestination = input.stationDestination !== false;
  const destinationReady = publicReady && stationDestination && input.hasSpace;
  const queueReady = destinationReady && input.canSubmitReview !== false;

  return [
    {
      id: "kind",
      label: "Document kind",
      value: type.label,
      tone: "info",
      body: `${type.intent} ${type.useWhen}`,
    },
    {
      id: "visibility",
      label: "Visibility",
      value: destinationReady
        ? `${capitalize(visibility)} ready`
        : publicReady && !stationDestination
          ? "Needs Station"
          : publicReady
            ? "Needs Space"
            : "Private draft",
      tone: destinationReady ? "good" : publicReady ? "warning" : "info",
      body: destinationReady
        ? "A non-private Space destination is selected, so this draft can move into owner review when saved."
        : publicReady && !stationDestination
          ? "Enable the Station document destination before queueing this non-private draft for owner review."
          : publicReady
          ? "Choose a Station Space before queueing this non-private draft for owner review."
          : "Private drafts stay owner-only until you choose a Space and non-private visibility.",
    },
    {
      id: "version",
      label: "Version history",
      value: input.hasDocumentId ? `Current v${currentVersion}` : "Unsaved",
      tone: input.hasDocumentId ? "good" : "info",
      body: input.hasDocumentId
        ? `Saving changes keeps this editable copy current and preserves prior owner-only versions${priorVersionCount > 0 ? ` (${priorVersionCount} saved)` : ""}.`
        : "The first save creates the owner draft; later edits can preserve prior owner-only version rows.",
    },
    {
      id: "review",
      label: "Review path",
      value: queueReady ? "Queue-ready" : "Draft-only",
      tone: queueReady ? "good" : "info",
      body: queueReady
        ? "Publishing still goes through grounding check and human review before public movement."
        : destinationReady
          ? "Review controls are still disabled; finish the save/review requirements before sending this draft for owner review."
          : publicReady && !stationDestination
            ? "Enable Station document destination before sending this draft for review."
        : "You can save this now, then add destination and visibility before sending it for review.",
    },
    {
      id: "discussion",
      label: "Discussion",
      value: input.commentsEnabled ? "Linked when public" : "Off",
      tone: input.commentsEnabled ? "good" : "info",
      body: input.commentsEnabled
        ? "Published public, community, or unlisted documents can attach a linked discussion under the same visibility boundary."
        : "Comments are disabled, so publishing will not invite a linked discussion from this draft.",
    },
    {
      id: "retract",
      label: "Retraction",
      value: "Hide, not delete",
      tone: "warning",
      body: "Retract-to-private hides public document and linked discussion reads; the owner-visible Studio record and history remain.",
    },
  ];
}

export function publishingDashboardRouteStoryRows(): PublishingDashboardRouteStoryRow[] {
  return [
    {
      id: "publish",
      label: "Publish",
      value: "Document plus discussion",
      tone: "info",
      body: "Published public, community, or unlisted documents can expose document readback and a linked discussion under the same visibility boundary.",
    },
    {
      id: "retract",
      label: "Retract to private",
      value: "Hide reads",
      tone: "warning",
      body: "Retract to private hides public document and linked discussion reads while the owner-visible Studio record and history remain.",
    },
    {
      id: "cleanup",
      label: "Cleanup",
      value: "Separate contract",
      tone: "warning",
      body: "Cleanup/delete is separate from retract. The current cleanup contract tombstones linked document-discussion threads and preserves comments and community records behind hidden threads. One disposable hosted cleanup proof was accepted for that contract; full hard-delete artifact removal and repeat hosted cleanup remain out of scope unless MIMIR opens them.",
    },
  ];
}

export function publicationManifestContractForDocument(input: {
  document: Pick<
    PublishingDocument,
    | "id"
    | "title"
    | "document_type"
    | "status"
    | "visibility"
    | "published_at"
    | "space_id"
    | "provenance_type"
    | "source_label"
    | "version"
    | "discussion_thread_id"
  > & {
    comments_enabled?: boolean | null;
  };
  spaces: PublishingSpace[];
  seminarRecord?: PublicationManifestSeminarRecord | null;
}): PublicationManifestContract {
  const { document, spaces } = input;
  const title = sanitizePublishingReadbackText(document.title) || "Untitled publication";
  const publicDestinationLabel = publicationManifestDestinationLabel(document, spaces);
  const provenance = documentProvenanceLabel(document.provenance_type);
  const publicHref = publicDocumentHref(document as PublishingDocument, spaces);
  const metadataReady = Boolean(publicHref);
  const source = metadataReady ? publishingSourceLabelForReadback(document.source_label) : null;

  return {
    schema: STATION_PRESS_PUBLICATION_MANIFEST_SCHEMA,
    name: "Station Press publication manifest contract",
    version: 1,
    title,
    documentTypeLabel: documentTypeLabel(document.document_type),
    statusLabel: publishingStatusLabel(document.status),
    visibilityLabel: capitalize(visibilityLabel(document.visibility)),
    publishedAtLabel: publicationManifestPublishedAtLabel(document.published_at),
    currentVersionLabel: `Current version v${document.version && document.version > 0 ? document.version : 1}`,
    publicDestinationLabel,
    sourceLabel: source ? `${provenance} / ${source}` : provenance,
    discussion: publicationManifestDiscussion(document),
    seminar: input.seminarRecord ? publicationManifestSeminar(input.seminarRecord) : null,
    packageReadback: metadataReady
      ? {
          state: "metadata_ready",
          label: "Metadata readback ready",
          detail: "Current output is owner-only metadata readback, not a generated package, public URL, storage object, PDF, binary archive, print file, or commercial product.",
        }
      : {
          state: "not_package_ready",
          label: "Not package-ready",
          detail: "Private, draft, archived, or missing-Space documents stay owner-only and do not produce Station Press packages.",
        },
    excludedFutureMaterial: [...STATION_PRESS_PUBLICATION_MANIFEST_EXCLUSIONS],
    boundary: "Metadata-only owner readback. Document bodies, private sources, archive chunks, transcripts, prompts, model output, raw events, approval internals, prior-version bodies, private seminar notes, export manifests, files, storage paths, signed URLs, SQL details, stack traces, logs, cookies, tokens, API keys, webhook secrets, env values, and raw ids are excluded.",
  };
}

export function publicationManifestDisplayRows(
  contract: PublicationManifestContract,
): PublicationManifestDisplayRow[] {
  return [
    {
      id: "schema",
      label: "Schema",
      value: contract.schema,
    },
    {
      id: "state",
      label: "Publication",
      value: `${contract.documentTypeLabel} / ${contract.statusLabel} / ${contract.visibilityLabel} / ${contract.currentVersionLabel}`,
    },
    {
      id: "destination",
      label: "Destination",
      value: contract.publicDestinationLabel,
    },
    {
      id: "discussion",
      label: "Discussion",
      value: contract.discussion.label,
    },
    {
      id: "seminar",
      label: "Seminar",
      value: contract.seminar
        ? `${contract.seminar.statusLabel} / ${contract.seminar.scheduleLabel}`
        : "No stored seminar record",
    },
    {
      id: "excluded",
      label: "Excluded",
      value: contract.excludedFutureMaterial.join(", "),
    },
  ];
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

export function documentVersionCompareReadback(input: {
  current: Pick<
    PublishingDocument,
    | "title"
    | "slug"
    | "document_type"
    | "status"
    | "visibility"
    | "comments_enabled"
    | "space_id"
    | "persona_id"
    | "published_at"
    | "updated_at"
    | "provenance_type"
    | "source_label"
    | "version"
  >;
  versions: PublishingDocumentVersion[];
  selectedVersionNumber?: number | null;
}): DocumentVersionCompareReadback {
  const currentVersion = input.current.version && input.current.version > 0 ? input.current.version : 1;
  const prior = selectPriorVersion(input.versions, input.selectedVersionNumber);
  const boundary = "Metadata-only compare. Prior bodies, private source rows, raw IDs, approval internals, and public version history are not exposed.";

  if (!prior) {
    return {
      status: "no-prior-version",
      currentVersionLabel: `Current v${currentVersion}`,
      priorVersionLabel: null,
      summary: "No prior owner-only version is available to compare yet.",
      boundary,
      rows: [],
    };
  }

  const rows = [
    compareRow("title", "Title", safeVersionCompareText(input.current.title), safeVersionCompareText(prior.title)),
    compareRow("slug", "Slug", safeVersionCompareText(input.current.slug), safeVersionCompareText(prior.slug)),
    compareRow("documentType", "Type", documentTypeLabel(input.current.document_type), documentTypeLabel(prior.documentType)),
    compareRow("status", "Status", publishingStatusLabel(input.current.status), publishingStatusLabel(prior.status)),
    compareRow("visibility", "Visibility", capitalize(visibilityLabel(input.current.visibility)), capitalize(visibilityLabel(prior.visibility))),
    compareRow("comments", "Discussion setting", commentsCompareLabel(input.current.comments_enabled), commentsCompareLabel(prior.commentsEnabled)),
    compareRow("space", "Space link", linkedMetadataLabel(input.current.space_id, "Space selected"), linkedMetadataLabel(prior.spaceId, "Space selected")),
    compareRow("persona", "Persona link", linkedMetadataLabel(input.current.persona_id, "Persona linked"), linkedMetadataLabel(prior.personaId, "Persona linked")),
    compareRow("publication", "Publication state", publicationCompareLabel(input.current.status, input.current.published_at), publicationCompareLabel(prior.status, prior.publishedAt)),
    compareRow("provenance", "Provenance", provenanceCompareLabel(input.current.provenance_type, input.current.source_label), provenanceCompareLabel(prior.provenanceType, prior.sourceLabel)),
    compareRow("capturedAt", "Snapshot time", currentSnapshotLabel(input.current.updated_at), priorSnapshotLabel(prior.capturedAt)),
  ];
  const changedCount = rows.filter((row) => row.state === "changed").length;

  return {
    status: "ready",
    currentVersionLabel: `Current v${currentVersion}`,
    priorVersionLabel: `Prior v${prior.versionNumber}`,
    summary: changedCount === 0
      ? `Current v${currentVersion} matches prior v${prior.versionNumber} across compared metadata.`
      : `${changedCount} metadata field${changedCount === 1 ? "" : "s"} changed since prior v${prior.versionNumber}.`,
    boundary,
    rows,
  };
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

function publicationManifestDestinationLabel(
  document: Pick<PublishingDocument, "id" | "space_id" | "status" | "visibility">,
  spaces: PublishingSpace[],
) {
  const href = publicDocumentHref(document as PublishingDocument, spaces);
  const space = spaceForDocument(document, spaces);
  if (href && space) {
    const title = sanitizePublishingReadbackText(space.title) || "Public Space";
    return `Space-backed ${visibilityLabel(document.visibility)} document in ${title}`;
  }

  if (space) return "Space selected; public readback is not package-ready";
  return "No Space-backed public destination";
}

function publicationManifestDiscussion(
  document: Pick<PublishingDocument, "status" | "visibility" | "discussion_thread_id"> & {
    comments_enabled?: boolean | null;
  },
): PublicationManifestContract["discussion"] {
  if (document.comments_enabled === false) {
    return {
      status: "disabled",
      label: "Disabled",
      detail: "Discussion is disabled for this document.",
    };
  }

  if (document.discussion_thread_id) {
    return {
      status: "attached",
      label: "Attached",
      detail: "A linked discussion exists; this contract keeps only status metadata.",
    };
  }

  if (isPublicReadableDocument(document)) {
    return {
      status: "eligible",
      label: "Eligible",
      detail: "The document can support a linked discussion under the same visibility boundary.",
    };
  }

  return {
    status: "unavailable",
    label: "Unavailable",
    detail: "No public-safe discussion state is available for this document.",
  };
}

function publicationManifestSeminar(
  record: PublicationManifestSeminarRecord,
): NonNullable<PublicationManifestContract["seminar"]> {
  return {
    statusLabel: labelize(record.status),
    visibilityLabel: capitalize(visibilityLabel(record.visibility)),
    scheduleLabel: publicationManifestScheduleLabel(record.schedule),
    detail: "Stored seminar metadata only. This contract does not create a live room, audience workflow, model execution, package job, or commercial flow.",
  };
}

function publicationManifestPublishedAtLabel(value?: string | null) {
  return value ? `Published ${formatVersionCompareDate(value)}` : "Not published";
}

function publicationManifestScheduleLabel(schedule?: PublicationManifestSeminarRecord["schedule"]) {
  if (!schedule) return "No stored schedule metadata";
  const startsAt = formatVersionCompareDate(schedule.startsAt);
  const timeZone = sanitizePublishingReadbackText(schedule.timeZone) || "time zone unavailable";
  const duration = schedule.durationMinutes ? ` / ${schedule.durationMinutes} min` : "";
  return `Stored schedule metadata: ${startsAt} / ${timeZone}${duration}`;
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

function selectPriorVersion(versions: PublishingDocumentVersion[], selectedVersionNumber?: number | null) {
  if (versions.length === 0) return null;
  if (selectedVersionNumber) {
    const selected = versions.find((version) => version.versionNumber === selectedVersionNumber);
    if (selected) return selected;
  }

  return [...versions].sort((a, b) => b.versionNumber - a.versionNumber)[0] ?? null;
}

function compareRow(
  id: DocumentVersionCompareRowId,
  label: string,
  currentValue: string,
  priorValue: string,
): DocumentVersionCompareRow {
  return {
    id,
    label,
    currentValue,
    priorValue,
    state: currentValue === priorValue ? "unchanged" : "changed",
  };
}

function safeVersionCompareText(value?: string | null) {
  return sanitizePublishingReadbackText(value ?? "") || "Not set";
}

function commentsCompareLabel(value?: boolean | null) {
  return value === false ? "Off" : "On";
}

function linkedMetadataLabel(value: string | null | undefined, presentLabel: string) {
  return value ? presentLabel : "Not linked";
}

function publicationCompareLabel(status?: string | null, publishedAt?: string | null) {
  if (status === "published" || publishedAt) return "Published";
  return "Not published";
}

function provenanceCompareLabel(provenanceType?: string | null, sourceLabel?: string | null) {
  const provenance = documentProvenanceLabel(provenanceType);
  const source = publishingSourceLabelForReadback(sourceLabel);
  return source ? `${provenance} / ${source}` : provenance;
}

function currentSnapshotLabel(updatedAt?: string | null) {
  return updatedAt ? `Current editable metadata as of ${formatVersionCompareDate(updatedAt)}` : "Current editable metadata";
}

function priorSnapshotLabel(capturedAt?: string | null) {
  return capturedAt ? `Captured ${formatVersionCompareDate(capturedAt)}` : "Captured date unavailable";
}

function formatVersionCompareDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "date unavailable";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function labelize(value: string) {
  const clean = value.replace(/[_-]+/g, " ").trim();
  return clean ? clean[0].toUpperCase() + clean.slice(1) : "Unknown";
}

function capitalize(value: string) {
  return value ? value[0].toUpperCase() + value.slice(1) : value;
}
