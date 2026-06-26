import assert from "node:assert/strict";
import test from "node:test";
import {
  approvalForDocument,
  documentEditHref,
  documentPublicVersionLabel,
  documentTrustReadback,
  documentVersionSummaryLabel,
  documentDestinationLabel,
  documentProvenanceLabel,
  documentTypeLabel,
  filterDocumentsForPublishingTab,
  normalizeDocumentSlug,
  normalizeDocumentTypeForForm,
  publicDocumentHref,
  publishingDashboardTrustLine,
  publishingQueueActionGuard,
  publishingApprovalStateLabel,
  publishingSourceLabelForReadback,
  publishingStatusLabel,
  slugifyDocumentTitle,
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

test("publishing helpers only expose public links when a Space slug is known", () => {
  assert.equal(publicDocumentHref(documents[1], spaces), "/space/station/documents/pub-1");
  assert.equal(publicDocumentHref(documents[0], spaces), null);
  assert.equal(documentEditHref("draft-1"), "/studio/publish?documentId=draft-1");
  assert.equal(documentEditHref("doc id/with spaces"), "/studio/publish?documentId=doc%20id%2Fwith%20spaces");
  assert.equal(documentPublicVersionLabel(3), "Current public version v3.");
  assert.equal(documentPublicVersionLabel(null), "Current public version v1.");
  assert.equal(documentDestinationLabel(documents[1], spaces), "Station / Station");
  assert.equal(documentDestinationLabel(documents[0], spaces), "Station draft");
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
  assert.equal(publishingSourceLabelForReadback(""), null);
});
