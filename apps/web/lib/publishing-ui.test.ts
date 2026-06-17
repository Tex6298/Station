import assert from "node:assert/strict";
import test from "node:test";
import {
  approvalForDocument,
  documentDestinationLabel,
  documentTypeLabel,
  filterDocumentsForPublishingTab,
  normalizeDocumentSlug,
  normalizeDocumentTypeForForm,
  publicDocumentHref,
  publishingQueueActionGuard,
  publishingApprovalStateLabel,
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
