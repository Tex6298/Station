import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  approvalForDocument,
  canRetractPublishedDocument,
  documentEditHref,
  documentPublicVersionLabel,
  documentVersionCompareReadback,
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
  publicationManifestContractForDocument,
  publicationManifestDisplayRows,
  STATION_PRESS_PUBLICATION_MANIFEST_SCHEMA,
  STATION_PRESS_PUBLICATION_MANIFEST_EXCLUSIONS,
  stationPressPublicationPackageReady,
  stationPressPublicationPackageStatusCopy,
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

test("publishing helpers compare current and prior version metadata only", () => {
  const compare = documentVersionCompareReadback({
    current: {
      title: "Current Field Log",
      slug: "current-field-log",
      document_type: "field_log",
      status: "published",
      visibility: "public",
      comments_enabled: true,
      space_id: "space-private-id",
      persona_id: null,
      published_at: "2026-06-27T12:00:00.000Z",
      updated_at: "2026-06-28T12:00:00.000Z",
      provenance_type: "archive_import",
      source_label: "source_id=123e4567-e89b-12d3-a456-426614174000 ghp_secret123456",
      version: 4,
    },
    versions: [{
      id: "version-row-secret-id",
      versionNumber: 3,
      title: "Prior Field Log token=abc123",
      slug: "prior-field-log",
      documentType: "essay",
      status: "draft",
      visibility: "private",
      commentsEnabled: false,
      spaceId: null,
      personaId: "persona-private-id",
      publishedAt: null,
      provenanceType: "archive_import",
      sourceLabel: "source_id=123e4567-e89b-12d3-a456-426614174000 ghp_secret123456",
      capturedAt: "2026-06-27T12:00:00.000Z",
      body: "prior private body should not be in compare",
      ownerUserId: "owner-private-id",
      discussionThreadId: "thread-private-id",
    } as any],
  });

  assert.equal(compare.status, "ready");
  assert.equal(compare.currentVersionLabel, "Current v4");
  assert.equal(compare.priorVersionLabel, "Prior v3");
  assert.match(compare.summary, /metadata fields changed since prior v3/);
  assert.equal(compare.rows.find((row) => row.id === "title")?.state, "changed");
  assert.equal(compare.rows.find((row) => row.id === "comments")?.currentValue, "On");
  assert.equal(compare.rows.find((row) => row.id === "comments")?.priorValue, "Off");
  assert.equal(compare.rows.find((row) => row.id === "space")?.currentValue, "Space selected");
  assert.equal(compare.rows.find((row) => row.id === "persona")?.priorValue, "Persona linked");
  assert.match(compare.rows.find((row) => row.id === "provenance")?.currentValue ?? "", /source_id=\[redacted\]/);
  assert.match(compare.boundary, /Prior bodies, private source rows, raw IDs/);

  const serialized = JSON.stringify(compare);
  assert.doesNotMatch(serialized, /prior private body|version-row-secret-id|owner-private-id|thread-private-id|persona-private-id|space-private-id/);
  assert.doesNotMatch(serialized, /123e4567|ghp_secret|token=abc123/);
});

test("publishing helpers handle no-prior and unchanged version metadata honestly", () => {
  const noPrior = documentVersionCompareReadback({
    current: {
      title: "Only Draft",
      slug: "only-draft",
      document_type: "essay",
      status: "draft",
      visibility: "private",
      comments_enabled: false,
      space_id: null,
      persona_id: null,
      published_at: null,
      updated_at: null,
      provenance_type: "user_authored",
      source_label: null,
      version: 1,
    },
    versions: [],
  });
  assert.equal(noPrior.status, "no-prior-version");
  assert.equal(noPrior.rows.length, 0);
  assert.match(noPrior.summary, /No prior owner-only version/);

  const unchanged = documentVersionCompareReadback({
    current: {
      title: "Stable Draft",
      slug: "stable-draft",
      document_type: "essay",
      status: "draft",
      visibility: "private",
      comments_enabled: false,
      space_id: null,
      persona_id: null,
      published_at: null,
      updated_at: null,
      provenance_type: "user_authored",
      source_label: null,
      version: 2,
    },
    versions: [{
      id: "version-1",
      versionNumber: 1,
      title: "Stable Draft",
      slug: "stable-draft",
      documentType: "essay",
      status: "draft",
      visibility: "private",
      commentsEnabled: false,
      spaceId: null,
      personaId: null,
      publishedAt: null,
      provenanceType: "user_authored",
      sourceLabel: null,
      capturedAt: null,
    }],
  });
  assert.equal(unchanged.rows.find((row) => row.id === "title")?.state, "unchanged");
  assert.equal(unchanged.rows.find((row) => row.id === "slug")?.state, "unchanged");
  assert.equal(unchanged.rows.find((row) => row.id === "visibility")?.state, "unchanged");
  assert.equal(unchanged.rows.find((row) => row.id === "capturedAt")?.state, "changed");
});

test("publishing version compare is wired into Studio publish without mutation scope", () => {
  const source = readFileSync("apps/web/components/studio/publish-flow.tsx", "utf8");

  assert.match(source, /documentVersionCompareReadback/);
  assert.match(source, /VersionCompareReadback/);
  assert.match(source, /Metadata compare/);
  assert.match(source, /hasOwnerVersionAccess/);
  assert.match(source, /documentId && hasOwnerVersionAccess/);
  assert.doesNotMatch(source, /versions\/compare|restoreVersion|revertVersion|apiPost<.*versions|apiPatch<.*versions/i);
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
  const cleanupBody = rows.find((row) => row.id === "cleanup")?.body ?? "";
  assert.match(cleanupBody, /separate from retract/i);
  assert.match(cleanupBody, /tombstones linked document-discussion threads/i);
  assert.match(cleanupBody, /preserves comments and community records/i);
  assert.match(cleanupBody, /one disposable hosted cleanup proof was accepted/i);
  assert.match(cleanupBody, /full hard-delete artifact removal/i);
  assert.match(cleanupBody, /repeat hosted cleanup remain out of scope/i);
  assert.doesNotMatch(cleanupBody, /hosted cleanup has not been run/i);
  assert.doesNotMatch(cleanupBody, /full hard-delete artifact removal is available/i);
});

test("publication manifest contract returns metadata-only public readback", () => {
  const contract = publicationManifestContractForDocument({
    document: {
      id: "doc-private-route-id",
      title: "Public Field Log token=abc123 123e4567-e89b-12d3-a456-426614174000",
      document_type: "field_log",
      status: "published",
      visibility: "public",
      published_at: "2026-07-07T12:00:00.000Z",
      space_id: "space-private-id",
      provenance_type: "archive_import",
      source_label: "source_id=123e4567-e89b-12d3-a456-426614174000 sk-test-secret-token",
      version: 4,
      discussion_thread_id: "thread-private-id",
      comments_enabled: true,
    },
    spaces: [{
      id: "space-private-id",
      slug: "station-house",
      title: "Station House sk-test-secret-token",
      is_public: true,
    }],
    seminarRecord: {
      status: "published",
      visibility: "public",
      publicDocumentHref: "/space/station-house/documents/doc-private-route-id",
      schedule: {
        startsAt: "2026-07-07T18:00:00.000Z",
        timeZone: "UTC",
        durationMinutes: 60,
      },
    },
  });

  assert.equal(contract.schema, STATION_PRESS_PUBLICATION_MANIFEST_SCHEMA);
  assert.equal(contract.name, "Station Press publication manifest contract");
  assert.equal(contract.version, 1);
  assert.equal(contract.documentTypeLabel, "Field Log");
  assert.equal(contract.statusLabel, "Published");
  assert.equal(contract.visibilityLabel, "Public");
  assert.equal(contract.currentVersionLabel, "Current version v4");
  assert.equal(contract.packageReadback.state, "metadata_ready");
  assert.equal(contract.discussion.status, "attached");
  assert.equal(contract.discussion.label, "Attached");
  assert.equal(contract.seminar?.statusLabel, "Published");
  assert.match(contract.seminar?.scheduleLabel ?? "", /Stored schedule metadata/);
  assert.match(contract.seminar?.scheduleLabel ?? "", /UTC/);
  assert.match(contract.seminar?.scheduleLabel ?? "", /60 min/);
  assert.match(contract.publicDestinationLabel, /Space-backed public document/);
  assert.match(contract.sourceLabel, /Archive import/);
  assert.match(contract.sourceLabel, /source_id=\[redacted\]/);

  for (const expected of STATION_PRESS_PUBLICATION_MANIFEST_EXCLUSIONS) {
    assert.ok(contract.excludedFutureMaterial.includes(expected), `${expected} should be excluded`);
  }

  const rows = publicationManifestDisplayRows(contract);
  assert.deepEqual(rows.map((row) => row.id), ["schema", "state", "destination", "discussion", "seminar", "excluded"]);
  assert.match(rows.find((row) => row.id === "excluded")?.value ?? "", /PDF output/);

  const serialized = JSON.stringify(contract);
  assert.doesNotMatch(serialized, /doc-private-route-id|thread-private-id|space-private-id/);
  assert.doesNotMatch(serialized, /123e4567|sk-test-secret-token|token=abc123/);
  assert.doesNotMatch(serialized, /document body|private source body|raw package contents/i);
});

test("publication manifest contract keeps private drafts not package-ready", () => {
  const contract = publicationManifestContractForDocument({
    document: {
      id: "99999999-9999-4999-8999-999999999999",
      title: "Private Draft owner_id=owner-secret cookie=session-secret",
      document_type: "essay",
      status: "draft",
      visibility: "private",
      published_at: null,
      space_id: null,
      provenance_type: "user_authored",
      source_label: "private body source_id=123e4567-e89b-12d3-a456-426614174000",
      version: 1,
      discussion_thread_id: null,
      comments_enabled: false,
    },
    spaces: [],
  });

  assert.equal(contract.packageReadback.state, "not_package_ready");
  assert.equal(contract.packageReadback.label, "Not package-ready");
  assert.equal(contract.publicDestinationLabel, "No Space-backed public destination");
  assert.equal(contract.publishedAtLabel, "Not published");
  assert.equal(contract.discussion.status, "disabled");
  assert.equal(contract.seminar, null);
  assert.match(contract.boundary, /Metadata-only owner readback/);
  assert.match(contract.boundary, /raw ids are excluded/);

  const serialized = JSON.stringify(contract);
  assert.doesNotMatch(serialized, /99999999|owner-secret|session-secret|123e4567/);
  assert.doesNotMatch(serialized, /private body/i);
});

test("publication manifest discussion and seminar metadata stay status-only", () => {
  const contract = publicationManifestContractForDocument({
    document: {
      id: "doc-linked",
      title: "Linked public document",
      document_type: "research",
      status: "published",
      visibility: "community",
      published_at: "2026-07-07T12:00:00.000Z",
      space_id: "space-1",
      provenance_type: "ai_assisted",
      source_label: "Provider payload should not appear",
      version: 2,
      discussion_thread_id: null,
      comments_enabled: true,
    },
    spaces,
    seminarRecord: {
      status: "ready",
      visibility: "private",
      schedule: null,
    },
  });

  assert.equal(contract.discussion.status, "eligible");
  assert.equal(contract.discussion.label, "Eligible");
  assert.match(contract.discussion.detail, /same visibility boundary/);
  assert.equal(contract.seminar?.statusLabel, "Ready");
  assert.equal(contract.seminar?.visibilityLabel, "Private");
  assert.equal(contract.seminar?.scheduleLabel, "No stored schedule metadata");
  assert.doesNotMatch(JSON.stringify(contract.seminar), /ticket|RSVP|reminder|provider runtime|billing|fulfillment/i);
  assert.doesNotMatch(JSON.stringify(contract.discussion), /thread|approval|moderation|body|doc-linked/i);
});

test("publication manifest package helpers keep owner package status ID-free", () => {
  const readyContract = publicationManifestContractForDocument({
    document: {
      id: "doc-private-route-id",
      title: "Public Field Log",
      document_type: "field_log",
      status: "published",
      visibility: "public",
      published_at: "2026-07-07T12:00:00.000Z",
      space_id: "space-1",
      provenance_type: "user_authored",
      source_label: null,
      version: 2,
      discussion_thread_id: null,
      comments_enabled: true,
    },
    spaces,
  });
  const notReadyContract = publicationManifestContractForDocument({
    document: documents[0],
    spaces,
  });

  assert.equal(stationPressPublicationPackageReady(readyContract), true);
  assert.equal(stationPressPublicationPackageReady(notReadyContract), false);
  assert.equal(
    stationPressPublicationPackageStatusCopy(),
    "No owner metadata package has been created for this publication.",
  );
  assert.equal(
    stationPressPublicationPackageStatusCopy([{ id: "export-package-private-id", packageKind: "station_press_publication", status: "completed" }]),
    "Latest owner metadata package is complete.",
  );
  assert.doesNotMatch(
    stationPressPublicationPackageStatusCopy([{ id: "export-package-private-id", packageKind: "station_press_publication", status: "failed" }]),
    /export-package-private-id|download|share|public package URL/i,
  );
});

test("publishing dashboard renders publication manifest package controls within owner scope", () => {
  const source = readFileSync("apps/web/components/studio/publishing-dashboard.tsx", "utf8");

  assert.match(source, /publicationManifestContractForDocument/);
  assert.match(source, /publicationManifestDisplayRows/);
  assert.match(source, /PublicationManifestReadback/);
  assert.match(source, /StationPressPublicationPackageResponse/);
  assert.match(source, /\/exports\/station-press\/publications\/\$\{encodeURIComponent\(document\.id\)\}/);

  const block = source.slice(
    source.indexOf("function PublicationManifestReadback"),
    source.indexOf("function SeminarReadinessPanel"),
  );
  assert.match(block, /Station Press manifest contract/);
  assert.match(block, /manifest.packageReadback.detail/);
  assert.match(block, /stationPressPublicationPackageStatusCopy/);
  assert.match(block, /Create metadata package/);
  assert.match(block, /Station Press unavailable/);
  assert.doesNotMatch(block, /apiGet|apiPost|apiPatch|apiDelete|Download|Share|billing|provider|public package URL|signed URL|packageId|exportPackage\.id|manifest\.id/i);
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
