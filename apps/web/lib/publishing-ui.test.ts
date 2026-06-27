import assert from "node:assert/strict";
import test from "node:test";
import {
  approvalForDocument,
  canRetractPublishedDocument,
  documentEditHref,
  documentPublicVersionLabel,
  documentTrustReadback,
  documentTypeAuthoringIntent,
  documentVersionSummaryLabel,
  documentDestinationLabel,
  documentProvenanceLabel,
  documentTypeLabel,
  filterDocumentsForPublishingTab,
  normalizeDocumentSlug,
  normalizeDocumentTypeForForm,
  publicationRetractNotice,
  publicDocumentHref,
  publishingDashboardTrustLine,
  publishingDashboardRouteStoryRows,
  publishingQueueActionGuard,
  publishingApprovalStateLabel,
  publishingSourceLabelForReadback,
  publishingStatusLabel,
  slugifyDocumentTitle,
  stationAuthoringGuidance,
  type PublishingApproval,
  type PublishingDocument,
} from "./publishing";

const documents: PublishingDocument[] = [
  { id: "draft-1", title: "Draft", document_type: "essay", status: "draft", visibility: "private" },
  { id: "pub-1", title: "Public", document_type: "field_log", status: "published", visibility: "public", space_id: "space-1" },
  { id: "old-1", title: "Old", document_type: "archive_note", status: "archived", visibility: "private" },
];

const spaces = [{ id: "space-1", slug: "station", title: "Station" }];
const approvals: PublishingApproval[] = [
  { id: "approval-1", documentId: "draft-1", state: "grounding_check", visibility: "public" },
];

test("publishing helpers normalize document slugs and legacy types", () => {
  assert.equal(normalizeDocumentSlug(" Field Log: Launch Core! "), "field-log-launch-core");
  assert.equal(slugifyDocumentTitle("!!!"), "station-document");
  assert.equal(documentTypeLabel("constitution"), "Codex");
  assert.equal(normalizeDocumentTypeForForm("post"), "essay");
  assert.equal(normalizeDocumentTypeForForm("nonsense"), "essay");
});

test("publishing helpers group live documents for the Studio dashboard", () => {
  assert.deepEqual(filterDocumentsForPublishingTab(documents, "drafts").map((document) => document.id), ["draft-1"]);
  assert.deepEqual(filterDocumentsForPublishingTab(documents, "published").map((document) => document.id), ["pub-1"]);
  assert.deepEqual(filterDocumentsForPublishingTab(documents, "archived").map((document) => document.id), ["old-1"]);
  assert.equal(publishingStatusLabel("scheduled"), "Draft");
  assert.equal(publishingApprovalStateLabel("grounding_check"), "Grounding check");
  assert.equal(publishingApprovalStateLabel(null), "Not queued");
  assert.equal(approvalForDocument(approvals, "draft-1")?.id, "approval-1");
  assert.equal(approvalForDocument(approvals, "pub-1"), null);
});

test("publishing helpers only expose public links for public-readable Space documents", () => {
  const retracted: PublishingDocument = {
    id: "private-published-1",
    title: "Retracted",
    document_type: "essay",
    status: "published",
    visibility: "private",
    space_id: "space-1",
  };
  const unlisted: PublishingDocument = {
    id: "unlisted-1",
    title: "Unlisted",
    document_type: "essay",
    status: "published",
    visibility: "unlisted",
    space_id: "space-1",
  };
  const community: PublishingDocument = {
    id: "community-1",
    title: "Community",
    document_type: "essay",
    status: "published",
    visibility: "community",
    space_id: "space-1",
  };
  assert.equal(publicDocumentHref(documents[1], spaces), "/space/station/documents/pub-1");
  assert.equal(publicDocumentHref(documents[0], spaces), null);
  assert.equal(publicDocumentHref(retracted, spaces), null);
  assert.equal(publicDocumentHref(unlisted, spaces), "/space/station/documents/unlisted-1");
  assert.equal(publicDocumentHref(community, spaces), "/space/station/documents/community-1");
  assert.equal(documentEditHref("draft-1"), "/studio/publish?documentId=draft-1");
  assert.equal(documentEditHref("doc id/with spaces"), "/studio/publish?documentId=doc%20id%2Fwith%20spaces");
  assert.equal(documentPublicVersionLabel(3), "Current public version v3.");
  assert.equal(documentPublicVersionLabel(null), "Current public version v1.");
  assert.equal(documentDestinationLabel(documents[1], spaces), "Station / Station");
  assert.equal(documentDestinationLabel(documents[0], spaces), "Station draft");
});

test("publishing helpers describe owner-safe publication retraction", () => {
  assert.equal(canRetractPublishedDocument(documents[1]), true);
  assert.equal(canRetractPublishedDocument({ status: "published", visibility: "unlisted" }), true);
  assert.equal(canRetractPublishedDocument({ status: "published", visibility: "community" }), true);
  assert.equal(canRetractPublishedDocument({ status: "published", visibility: "members" }), false);
  assert.equal(canRetractPublishedDocument({ status: "published", visibility: "private" }), false);
  assert.equal(canRetractPublishedDocument(documents[0]), false);
  assert.equal(canRetractPublishedDocument(documents[2]), false);
  assert.match(
    publicationRetractNotice({ title: "Public Field Log token=abc123" }),
    /Public Field Log token=\[redacted\] is now private/,
  );
  assert.match(publicationRetractNotice({ title: "Public Field Log" }), /Public readers and linked discussion routes/);
  assert.match(publicationRetractNotice({ title: "Public Field Log" }), /owner-visible record remains in Studio/);
  assert.doesNotMatch(publicationRetractNotice({ title: "Public Field Log" }), /delete|cleanup/i);
});

test("publishing queue action guard preserves no-Space and entitlement reasons", () => {
  assert.deepEqual(publishingQueueActionGuard(documents[0], true), {
    canAct: false,
    label: "Space required",
    title: "Choose and save a Space before using the publishing approval queue.",
  });
  assert.deepEqual(publishingQueueActionGuard(documents[1], false), {
    canAct: false,
    label: "Creator required",
    title: "Creator tier or above is required to move documents through the publishing approval queue.",
  });
  assert.deepEqual(publishingQueueActionGuard(documents[1], true), { canAct: true });
});

test("publishing helpers summarize document version history", () => {
  assert.equal(
    documentVersionSummaryLabel(1, []),
    "Current version v1; no prior versions yet.",
  );
  assert.equal(
    documentVersionSummaryLabel(4, [{ versionNumber: 3 }, { versionNumber: 1 }, { versionNumber: 2 }]),
    "Current version v4; 3 prior versions saved from v1 to v3.",
  );
  assert.equal(
    documentVersionSummaryLabel(null, [{ versionNumber: 1 }]),
    "Current version v1; 1 prior version saved from v1 to v1.",
  );
});

test("publishing helpers describe Station-native authoring intent and readiness", () => {
  assert.deepEqual(documentTypeAuthoringIntent("constitution"), {
    label: "Codex",
    intent: "Canonical rules, principles, or operating notes.",
    useWhen: "Use it when the document should become part of a durable persona or Space reference.",
  });

  const rows = stationAuthoringGuidance({
    documentType: "archive_note",
    visibility: "unlisted",
    hasSpace: true,
    stationDestination: true,
    canSubmitReview: true,
    commentsEnabled: true,
    hasDocumentId: true,
    currentVersion: 4,
    priorVersionCount: 3,
  });

  assert.deepEqual(rows.map((row) => [row.id, row.value, row.tone]), [
    ["kind", "Archive Note", "info"],
    ["visibility", "Unlisted ready", "good"],
    ["version", "Current v4", "good"],
    ["review", "Queue-ready", "good"],
    ["discussion", "Linked when public", "good"],
    ["retract", "Hide, not delete", "warning"],
  ]);
  assert.match(rows.find((row) => row.id === "kind")?.body ?? "", /private archive material/i);
  assert.match(rows.find((row) => row.id === "version")?.body ?? "", /prior owner-only versions \(3 saved\)/);
  assert.match(rows.find((row) => row.id === "review")?.body ?? "", /grounding check and human review/i);
  assert.match(rows.find((row) => row.id === "discussion")?.body ?? "", /same visibility boundary/i);
  assert.doesNotMatch(rows.find((row) => row.id === "retract")?.body ?? "", /cleanup/i);
});

test("publishing helpers keep private or incomplete authoring guidance bounded", () => {
  const privateRows = stationAuthoringGuidance({
    documentType: "essay",
    visibility: "private",
    hasSpace: false,
    stationDestination: true,
    canSubmitReview: false,
    commentsEnabled: false,
    hasDocumentId: false,
  });

  assert.equal(privateRows.find((row) => row.id === "visibility")?.value, "Private draft");
  assert.equal(privateRows.find((row) => row.id === "version")?.value, "Unsaved");
  assert.equal(privateRows.find((row) => row.id === "review")?.value, "Draft-only");
  assert.equal(privateRows.find((row) => row.id === "discussion")?.value, "Off");
  assert.match(privateRows.find((row) => row.id === "visibility")?.body ?? "", /stay owner-only/);
  assert.match(privateRows.find((row) => row.id === "version")?.body ?? "", /first save creates the owner draft/i);

  const noSpaceRows = stationAuthoringGuidance({
    documentType: "research",
    visibility: "public",
    hasSpace: false,
    stationDestination: true,
    canSubmitReview: false,
    commentsEnabled: true,
    hasDocumentId: true,
    currentVersion: 2,
    priorVersionCount: 0,
  });

  assert.equal(noSpaceRows.find((row) => row.id === "visibility")?.value, "Needs Space");
  assert.equal(noSpaceRows.find((row) => row.id === "visibility")?.tone, "warning");
  assert.match(noSpaceRows.find((row) => row.id === "visibility")?.body ?? "", /Choose a Station Space/);
  assert.match(noSpaceRows.find((row) => row.id === "version")?.body ?? "", /owner-only versions/);

  const stationOffRows = stationAuthoringGuidance({
    documentType: "field_log",
    visibility: "public",
    hasSpace: true,
    stationDestination: false,
    canSubmitReview: false,
    commentsEnabled: true,
    hasDocumentId: true,
    currentVersion: 2,
  });

  assert.equal(stationOffRows.find((row) => row.id === "visibility")?.value, "Needs Station");
  assert.equal(stationOffRows.find((row) => row.id === "review")?.value, "Draft-only");
  assert.match(stationOffRows.find((row) => row.id === "visibility")?.body ?? "", /Enable the Station document destination/);

  const blockedReviewRows = stationAuthoringGuidance({
    documentType: "manifesto",
    visibility: "community",
    hasSpace: true,
    stationDestination: true,
    canSubmitReview: false,
    commentsEnabled: true,
    hasDocumentId: true,
    currentVersion: 3,
  });

  assert.equal(blockedReviewRows.find((row) => row.id === "visibility")?.value, "Community ready");
  assert.equal(blockedReviewRows.find((row) => row.id === "review")?.value, "Draft-only");
  assert.match(blockedReviewRows.find((row) => row.id === "review")?.body ?? "", /Review controls are still disabled/);
});

test("publishing dashboard route story explains linked discussion, retract, and cleanup boundaries", () => {
  const rows = publishingDashboardRouteStoryRows();

  assert.deepEqual(rows.map((row) => [row.id, row.value, row.tone]), [
    ["publish", "Document plus discussion", "info"],
    ["retract", "Hide reads", "warning"],
    ["cleanup", "Separate contract", "warning"],
  ]);
  assert.match(rows.find((row) => row.id === "publish")?.body ?? "", /linked discussion/i);
  assert.match(rows.find((row) => row.id === "publish")?.body ?? "", /document readback/i);
  assert.match(rows.find((row) => row.id === "publish")?.body ?? "", /same visibility boundary/i);
  assert.doesNotMatch(rows.find((row) => row.id === "publish")?.body ?? "", /public readback/i);
  assert.match(rows.find((row) => row.id === "retract")?.body ?? "", /hides public document and linked discussion reads/i);
  assert.match(rows.find((row) => row.id === "retract")?.body ?? "", /owner-visible Studio record/i);
  assert.match(rows.find((row) => row.id === "cleanup")?.body ?? "", /separate from retract/i);
  assert.match(rows.find((row) => row.id === "cleanup")?.body ?? "", /tombstones linked discussion threads/i);
  assert.match(rows.find((row) => row.id === "cleanup")?.body ?? "", /hosted cleanup has not been run/i);
});

test("publishing trust readback explains public document boundaries", () => {
  const rows = documentTrustReadback({
    document: {
      document_type: "archive_note",
      status: "published",
      visibility: "public",
      provenance_type: "archive_import",
      source_label: "https://example.test/source token=abc123 123e4567-e89b-12d3-a456-426614174000",
      version: 3,
      discussion_thread_id: "thread-1",
    },
    isOwner: false,
    hasDiscussion: true,
    discussionEligible: true,
    discussionLoading: false,
  });

  assert.deepEqual(rows.map((row) => [row.id, row.value, row.tone]), [
    ["document", "Archive Note / Published", "good"],
    ["source", "Archive import", "warning"],
    ["version", "v3", "good"],
    ["discussion", "Linked", "good"],
  ]);
  assert.match(rows.find((row) => row.id === "source")?.body ?? "", /\[redacted-url\]/);
  assert.match(rows.find((row) => row.id === "source")?.body ?? "", /token=\[redacted\]/);
  assert.match(rows.find((row) => row.id === "source")?.body ?? "", /\[redacted-id\]/);
  assert.match(rows.find((row) => row.id === "source")?.body ?? "", /separate curated copy/);
  assert.match(rows.find((row) => row.id === "version")?.body ?? "", /prior drafts/);
});

test("publishing trust readback keeps owner draft and discussion state honest", () => {
  const rows = documentTrustReadback({
    document: {
      document_type: "essay",
      status: "draft",
      visibility: "private",
      provenance_type: "user_authored",
      source_label: "User-authored document",
      version: 1,
      discussion_thread_id: null,
    },
    isOwner: true,
    hasDiscussion: false,
    discussionEligible: true,
    discussionLoading: false,
  });

  assert.equal(rows.find((row) => row.id === "document")?.body, "This owner-visible draft is not part of the public Space until it is published.");
  assert.match(rows.find((row) => row.id === "source")?.body ?? "", /Private Studio records/);
  assert.equal(rows.find((row) => row.id === "discussion")?.value, "Eligible");
  assert.match(rows.find((row) => row.id === "discussion")?.body ?? "", /owner can open/i);
});

test("publishing dashboard trust line summarizes approval without leaking source internals", () => {
  const line = publishingDashboardTrustLine(
    {
      space_id: "space-1",
      source_label: "source_id=123e4567-e89b-12d3-a456-426614174000 ghp_secret123456",
      version: 4,
    },
    approvals[0],
    spaces,
  );

  assert.match(line, /Grounding check/);
  assert.match(line, /Station \/ Station/);
  assert.match(line, /v4/);
  assert.match(line, /source_id=\[redacted\]/);
  assert.match(line, /\[redacted-secret\]/);
  assert.match(line, /Private source rows stay private/);
  assert.doesNotMatch(line, /123e4567|ghp_secret/i);

  assert.equal(documentProvenanceLabel("ai_assisted"), "AI-assisted");
  const sanitized = publishingSourceLabelForReadback("OpenAI sk-test-secret-token AWS AKIAIOSFODNN7EXAMPLE");
  assert.match(sanitized ?? "", /\[redacted-secret\].*\[redacted-secret\]/);
  assert.doesNotMatch(sanitized ?? "", /sk-test|AKIA/);
  assert.equal(publishingSourceLabelForReadback(""), null);
});
