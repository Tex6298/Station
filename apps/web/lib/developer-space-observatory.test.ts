import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  developerSpaceAgentActionGroups,
  developerSpaceAgentActionStatusCopy,
  developerSpaceAgentConfirmationCanAct,
  developerSpaceAgentConfirmationEmptyCopy,
  developerSpaceAgentConfirmationExecutionCopy,
  developerSpaceAgentConfirmationStatusCopy,
  developerSpaceAgentPreviewEmptyCopy,
  developerSpaceAgentPreviewStatusCopy,
  developerSpaceAgentReceiptCanRecord,
  developerSpaceAgentReceiptEmptyCopy,
  developerSpaceAgentReceiptExecutionCopy,
  developerSpaceAgentReceiptStatusCopy,
  developerSpaceConnectionBadge,
  developerSpaceOwnerCurrentState,
  developerSpaceUsageReadback,
  developerSpaceSignalStatus,
  developerSpaceStorySummary,
  developerSpaceMethodologyCopy,
  developerSpaceTierOneFramingCopy,
  developerSpaceVisitorReadingPath,
  developerSpaceEvidenceRoleCopy,
  developerSpaceEvidenceRoleDescription,
  developerSpaceEvidenceEmptyCopy,
  developerSpaceEvidenceCanRequestPublish,
  developerSpaceEvidenceReviewHref,
  developerSpaceEvidenceTitle,
  developerSpaceProjectUpdates,
  developerSpaceProjectUpdatesEmptyCopy,
  formatValue,
  moveDeveloperSpaceWidget,
  normaliseDeveloperSpaceWidgets,
  orderedDeveloperSpaceEvidence,
  publicEntries,
  shouldShowRawDeveloperSpaceData,
  updateWidgetVisibility,
  widgetsForZone,
  visualisationLabel,
} from "./developer-space-observatory";
import { normaliseDeveloperSpaceVisualConfig } from "./developer-space-visual-config";
import {
  bridgeObservedRuntimeFixtureToDeveloperSpaceImport,
  normalizeObservedRuntimeFixture,
  parseObservedRuntimeFixture,
} from "./observed-runtime-fixture";

function fixture(name: string) {
  return JSON.parse(readFileSync(new URL(`./__fixtures__/${name}`, import.meta.url), "utf8"));
}

test("observatory story helpers explain current public evidence", () => {
  const detail = {
    nodes: [{ id: "node-1" }],
    events: [{ id: "event-1" }],
    latestSnapshot: { id: "snapshot-1" },
    linkedDocuments: [{ id: "doc-link-1", linkVisibility: "public" }],
  } as unknown as Parameters<typeof developerSpaceStorySummary>[0];

  assert.equal(
    developerSpaceStorySummary(detail),
    "This Tier 1 observatory is showing 1 tracked node, 1 public signal, a current snapshot, 1 public note from a self-hosted project runtime."
  );
  assert.equal(developerSpaceSignalStatus(detail), "Public-safe signals from the external runtime are arriving.");

  const ownerDetail = {
    ...detail,
    linkedDocuments: [
      { id: "doc-link-1", linkVisibility: "public" },
      { id: "doc-link-2", linkVisibility: "owner" },
    ],
  } as unknown as Parameters<typeof developerSpaceStorySummary>[0];
  assert.equal(
    developerSpaceStorySummary(ownerDetail),
    "This Tier 1 observatory is showing 1 tracked node, 1 public signal, a current snapshot, 1 public note, 1 owner-only link from a self-hosted project runtime."
  );
});

test("observatory story helpers keep empty public spaces understandable", () => {
  const detail = {
    nodes: [],
    events: [],
    latestSnapshot: null,
    linkedDocuments: [],
  } as unknown as Parameters<typeof developerSpaceStorySummary>[0];

  assert.equal(
    developerSpaceStorySummary(detail),
    "This Tier 1 observatory is showing 0 tracked nodes, 0 public signals from a self-hosted project runtime."
  );
  assert.equal(developerSpaceSignalStatus(detail), "The public observatory is ready, but the external runtime has not sent project signals yet.");
});

test("developer space connection badge separates readback from live connection", () => {
  const readbackDetail = {
    nodes: [{ id: "node-1" }],
    events: [],
    latestSnapshot: null,
  } as unknown as Parameters<typeof developerSpaceConnectionBadge>[0];
  const emptyDetail = {
    nodes: [],
    events: [],
    latestSnapshot: null,
  } as unknown as Parameters<typeof developerSpaceConnectionBadge>[0];

  assert.deepEqual(
    developerSpaceConnectionBadge(readbackDetail, "connecting"),
    { label: "Latest readback", tone: "readback" }
  );
  assert.deepEqual(
    developerSpaceConnectionBadge(readbackDetail, "reconnecting"),
    { label: "Live updates unavailable", tone: "readback" }
  );
  assert.deepEqual(
    developerSpaceConnectionBadge(emptyDetail, "connecting"),
    { label: "Waiting for first signal", tone: "waiting" }
  );
  assert.deepEqual(
    developerSpaceConnectionBadge(readbackDetail, "live"),
    { label: "Live updates connected", tone: "live" }
  );
});

test("owner observability helpers separate live state from metered usage", () => {
  const detail = {
    nodes: [{ id: "node-1", updatedAt: "2026-06-19T07:20:00Z", lastEventAt: null }],
    events: [{ id: "event-1", occurredAt: "2026-06-19T07:25:00Z", createdAt: "2026-06-19T07:24:00Z" }],
    latestSnapshot: { id: "snapshot-1", occurredAt: "2026-06-19T07:15:00Z", createdAt: "2026-06-19T07:14:00Z" },
    linkedDocuments: [
      {
        id: "link-public",
        linkVisibility: "public",
        document: { status: "published", visibility: "public" },
      },
      {
        id: "link-owner",
        linkVisibility: "owner",
        document: { status: "draft", visibility: "private" },
      },
    ],
  } as unknown as Parameters<typeof developerSpaceOwnerCurrentState>[0];

  const current = developerSpaceOwnerCurrentState(detail);
  assert.equal(current.heading, "Current observatory state");
  assert.equal(current.status, "Public-safe signals from the external runtime are arriving.");
  assert.deepEqual(
    current.rows.map((row) => `${row.label}:${row.value}`),
    [
      "Tracked nodes:1",
      "Recent events:1",
      "Current snapshot:Available",
      "Linked evidence:2",
      "Visitor evidence:1",
      "Owner-only evidence:1",
    ]
  );

  const unavailableUsage = developerSpaceUsageReadback(null, detail, 0);
  assert.equal(unavailableUsage.warningLabel, "Usage unavailable");
  assert.match(unavailableUsage.mismatchCopy, /current observatory state above can still be live/);

  const laggingUsage = developerSpaceUsageReadback({
    developerSpaceId: "space-1",
    ownerUserId: "owner-1",
    tier: "canon",
    counters: {
      nodes: 0,
      events: 0,
      snapshots: 0,
      storageBytes: 2048,
      publicReads: 3,
      exports: 0,
    },
    limits: {
      nodes: 100,
      events: 1000,
      snapshots: 50,
      storageBytes: -1,
      publicReads: 10000,
      exports: 5,
    },
    percentUsed: {
      nodes: 0,
      events: 0,
      snapshots: 0,
      storageBytes: 0,
      publicReads: 0,
      exports: 0,
    },
    warningLevel: "notice",
  }, detail, 2);

  assert.equal(laggingUsage.warningLabel, "Notice");
  assert.match(laggingUsage.mismatchCopy, /node count, event count, snapshot availability, export count/);
  assert.match(laggingUsage.rows.find((row) => row.label === "Storage")?.value ?? "", /2 KB of unlimited/);
});

test("developer agent helpers separate safe previews from future lane actions", () => {
  const groups = developerSpaceAgentActionGroups([
    {
      action: "read_developer_space_brief",
      label: "Read Developer Space brief",
      description: "Safe readback",
      mode: "read",
      requiresConfirmation: false,
      futureLane: false,
    },
    {
      action: "draft_project_update",
      label: "Draft project update",
      description: "Owner review draft",
      mode: "draft_preview",
      requiresConfirmation: true,
      futureLane: false,
    },
    {
      action: "run_job",
      label: "Run job",
      description: "Future lane only",
      mode: "future",
      requiresConfirmation: true,
      futureLane: true,
    },
  ]);

  assert.deepEqual(groups.available.map((action) => action.action), [
    "read_developer_space_brief",
    "draft_project_update",
  ]);
  assert.deepEqual(groups.future.map((action) => action.action), ["run_job"]);
  assert.equal(developerSpaceAgentActionStatusCopy(groups.available[0]), "Safe readback");
  assert.equal(developerSpaceAgentActionStatusCopy(groups.available[1]), "Draft preview");
  assert.equal(developerSpaceAgentActionStatusCopy(groups.future[0]), "Future lane");
});

test("developer agent preview helper copy labels blocked and review states", () => {
  assert.equal(
    developerSpaceAgentPreviewStatusCopy({
      status: "previewed",
      requiresConfirmation: false,
    }),
    "Safe readback"
  );
  assert.equal(
    developerSpaceAgentPreviewStatusCopy({
      status: "previewed",
      requiresConfirmation: true,
    }),
    "Owner review draft"
  );
  assert.equal(
    developerSpaceAgentPreviewStatusCopy({
      status: "requires_future_lane",
      requiresConfirmation: true,
    }),
    "Blocked for future lane"
  );
  assert.equal(developerSpaceAgentPreviewEmptyCopy([]), "Developer Agent actions are loading or unavailable.");
});

test("developer agent confirmation helpers keep intent separate from execution", () => {
  assert.equal(developerSpaceAgentConfirmationStatusCopy("pending"), "Pending intent");
  assert.equal(developerSpaceAgentConfirmationStatusCopy("approved"), "Intent approved");
  assert.equal(developerSpaceAgentConfirmationCanAct({ status: "pending" }), true);
  assert.equal(developerSpaceAgentConfirmationCanAct({ status: "approved" }), false);
  assert.match(
    developerSpaceAgentConfirmationExecutionCopy({ action: "request_capability", status: "approved" }),
    /Execution remains unavailable/
  );
  assert.match(
    developerSpaceAgentConfirmationExecutionCopy({ action: "request_capability", status: "pending" }),
    /does not execute/
  );
  assert.match(
    developerSpaceAgentConfirmationExecutionCopy({ action: "publish_to_page", status: "approved" }),
    /selected reviewed private draft/
  );
  assert.match(
    developerSpaceAgentConfirmationExecutionCopy({ action: "update_observatory", status: "approved" }),
    /one public status note/
  );
  assert.equal(
    developerSpaceAgentConfirmationEmptyCopy(false),
    "No confirmation records yet. Preview a future action to record owner intent."
  );
});

test("developer agent receipt helpers gate bounded receipt actions", () => {
  assert.equal(developerSpaceAgentReceiptCanRecord({
    action: "request_capability",
    status: "approved",
  }), true);
  assert.equal(developerSpaceAgentReceiptCanRecord({
    action: "save_project_update_draft",
    status: "approved",
  }), true);
  assert.equal(developerSpaceAgentReceiptCanRecord({
    action: "request_capability",
    status: "pending",
  }), false);
  assert.equal(developerSpaceAgentReceiptCanRecord({
    action: "publish_to_page",
    status: "approved",
  }), true);
  assert.equal(developerSpaceAgentReceiptCanRecord({
    action: "update_observatory",
    status: "approved",
  }), true);
  assert.equal(developerSpaceAgentReceiptStatusCopy("recorded"), "Request recorded");
  assert.match(developerSpaceAgentReceiptExecutionCopy({
    receiptPayload: {
      action: "request_capability",
      outcome: "capability_request_recorded",
      executionAvailable: false,
      mutationAvailable: false,
      externalDispatch: false,
      nextStep: "Review before implementation.",
      boundaries: [],
      capabilityRequest: {
        category: "provider_config",
        categoryLabel: "Provider Config",
        summary: "Need provider configuration reviewed before implementation.",
      },
    },
  }), /No provider, deploy, repo, key/);
  assert.match(developerSpaceAgentReceiptExecutionCopy({
    receiptPayload: {
      action: "save_project_update_draft",
      outcome: "private_draft_document_saved",
      executionAvailable: false,
      mutationAvailable: true,
      externalDispatch: false,
      nextStep: "Review the private draft.",
      boundaries: [],
      draftDocument: {
        title: "Project update draft",
        status: "draft",
        visibility: "private",
        linkVisibility: "owner",
        role: "field_log",
      },
    },
  }), /Private draft document saved/);
  assert.match(developerSpaceAgentReceiptExecutionCopy({
    receiptPayload: {
      action: "publish_to_page",
      outcome: "draft_document_published",
      executionAvailable: true,
      mutationAvailable: true,
      externalDispatch: false,
      nextStep: "Review the public evidence path.",
      boundaries: [],
      publishedDocument: {
        title: "Project update draft",
        status: "published",
        visibility: "public",
        linkVisibility: "public",
        role: "field_log",
      },
    },
  }), /Reviewed private draft published/);
  assert.match(developerSpaceAgentReceiptExecutionCopy({
    receiptPayload: {
      action: "update_observatory",
      outcome: "observatory_status_note_published",
      executionAvailable: true,
      mutationAvailable: true,
      externalDispatch: false,
      nextStep: "Review the public observatory.",
      boundaries: [],
      statusNote: {
        note: "Public status is green.",
        eventType: "developer_agent.status_note",
        eventLabel: "Status note: Public status is green.",
        visibility: "public",
        provenance: "user",
      },
    },
  }), /Public observatory status note published/);
  assert.equal(
    developerSpaceAgentReceiptEmptyCopy(false),
    "No Developer Agent receipts yet. Approved receipt actions can record bounded owner evidence here."
  );
});

test("observatory helpers keep visitor data readable and non-raw", () => {
  const entries = publicEntries({
    summary: "Stable signal",
    confidence: 0.8721,
    enabled: true,
    raw: { prompt: "owner-only detail" },
    empty: null,
  });

  assert.deepEqual(entries.map(([key]) => key), ["summary", "confidence", "enabled"]);
  assert.equal(formatValue(0.8721), "0.872");
  assert.equal(formatValue("x".repeat(140)), `${"x".repeat(117)}...`);
  assert.equal(formatValue({ prompt: "owner-only detail" }), "Structured record");
  assert.equal(shouldShowRawDeveloperSpaceData("public"), false);
  assert.equal(shouldShowRawDeveloperSpaceData("member"), false);
  assert.equal(shouldShowRawDeveloperSpaceData("owner"), true);
  assert.equal(visualisationLabel("world_map"), "World map");
});

test("tier one framing copy separates self-hosted runtime from Station readback", () => {
  const copy = developerSpaceTierOneFramingCopy();
  const rendered = JSON.stringify(copy);

  assert.equal(copy.badge, "Tier 1 showcase");
  assert.match(copy.publicFrame, /Station hosts this public showcase/);
  assert.match(copy.publicFrame, /runtime remains external and self-hosted/);
  assert.match(copy.liveFrame, /not raw runtime payloads/);
  assert.match(copy.ownerFrame, /private console manages ingestion keys/);
  assert.match(copy.agentBoundary, /run_job dry-run\/readiness only/);
  assert.doesNotMatch(rendered, /Station hosts the developer app/);
  assert.doesNotMatch(rendered, /repo push|deploy pipeline|background jobs/);
});

test("observatory methodology copy stays honest about public evidence", () => {
  const withNotes = developerSpaceMethodologyCopy({
    access: "public",
    linkedDocuments: [
      { role: "methodology", linkVisibility: "public" },
      { role: "finding", linkVisibility: "public" },
      { role: "field_log", linkVisibility: "public" },
    ],
  } as unknown as Parameters<typeof developerSpaceMethodologyCopy>[0]);

  assert.match(withNotes.methodology, /1 methodology note/);
  assert.match(withNotes.methodology, /1 finding/);
  assert.match(withNotes.methodology, /1 field log/);
  assert.match(withNotes.liveSignal, /public-safe node, event, or snapshot summaries/);
  assert.match(withNotes.privateBoundary, /Visitors do not see ingestion keys/);

  const empty = developerSpaceMethodologyCopy({
    access: "owner",
    linkedDocuments: [],
  } as unknown as Parameters<typeof developerSpaceMethodologyCopy>[0]);

  assert.match(empty.methodology, /No public methodology/);
  assert.match(empty.privateBoundary, /Owner view may show raw event/);
  assert.doesNotMatch(`${withNotes.methodology} ${empty.methodology}`, /private archive text/);

  const ownerMixed = developerSpaceMethodologyCopy({
    access: "owner",
    linkedDocuments: [
      { role: "methodology", linkVisibility: "owner" },
      { role: "field_log", linkVisibility: "public" },
    ],
  } as unknown as Parameters<typeof developerSpaceMethodologyCopy>[0]);

  assert.match(ownerMixed.methodology, /0 methodology notes/);
  assert.match(ownerMixed.methodology, /1 field log/);
  assert.match(ownerMixed.methodology, /1 owner-only link/);
});

test("observatory visitor reading path separates evidence, readback, and snapshots", () => {
  const path = developerSpaceVisitorReadingPath({
    nodes: [{ id: "node-1" }, { id: "node-2" }],
    events: [{ id: "event-1" }],
    latestSnapshot: { id: "snapshot-1" },
    linkedDocuments: [
      { role: "methodology", linkVisibility: "public", document: { status: "published", visibility: "public" } },
      { role: "finding", linkVisibility: "public", document: { status: "published", visibility: "public" } },
      { role: "field_log", linkVisibility: "owner", document: { status: "draft", visibility: "private" } },
      { role: "field_log", linkVisibility: "public", document: { status: "draft", visibility: "private" } },
    ],
  } as unknown as Parameters<typeof developerSpaceVisitorReadingPath>[0]);

  assert.deepEqual(path.map((step) => step.step), ["1", "2", "3"]);
  assert.match(path[0].body, /1 methodology note/);
  assert.match(path[0].body, /1 finding/);
  assert.match(path[0].body, /0 field logs/);
  assert.doesNotMatch(path[0].body, /owner-only/);
  assert.match(path[1].body, /2 tracked nodes/);
  assert.match(path[1].body, /1 public signal/);
  assert.match(path[1].body, /not raw runtime payloads/);
  assert.match(path[2].body, /bounded state summary/);

  const thinPath = developerSpaceVisitorReadingPath({
    nodes: [],
    events: [],
    latestSnapshot: null,
    linkedDocuments: [],
  } as unknown as Parameters<typeof developerSpaceVisitorReadingPath>[0]);

  assert.match(thinPath[0].body, /No public methodology/);
  assert.match(thinPath[2].body, /No public snapshot/);
});

test("observatory evidence labels use role-aware Developer Page language", () => {
  assert.equal(
    developerSpaceEvidenceTitle([{ role: "methodology" }, { role: "field_log" }] as any),
    "Project evidence",
  );
  assert.equal(developerSpaceEvidenceTitle([{ role: "note" }] as any), "Project notes");
  assert.equal(developerSpaceEvidenceRoleCopy("methodology"), "Methodology / architecture");
  assert.equal(developerSpaceEvidenceRoleCopy("finding"), "Finding / milestone");
  assert.equal(developerSpaceEvidenceRoleCopy("field_log"), "Field log / update");
  assert.equal(developerSpaceEvidenceRoleCopy("note"), "Note / paper");
  assert.match(developerSpaceEvidenceRoleDescription("methodology"), /Start here/);
  assert.match(developerSpaceEvidenceRoleDescription("finding"), /Read next/);
  assert.match(developerSpaceEvidenceRoleDescription("field_log"), /live-operation trail/);
  assert.match(developerSpaceEvidenceRoleDescription("note"), /Supplementary/);
});

test("observatory evidence review links stay owner-only for private drafts", () => {
  const draftLink = {
    linkVisibility: "owner",
    document: {
      id: "doc private id",
      status: "draft",
      visibility: "private",
    },
  };

  assert.equal(
    developerSpaceEvidenceReviewHref(draftLink as any, true),
    "/studio/publish?documentId=doc%20private%20id"
  );
  assert.equal(developerSpaceEvidenceCanRequestPublish(draftLink as any, true), true);
  assert.equal(developerSpaceEvidenceReviewHref(draftLink as any, false), null);
  assert.equal(developerSpaceEvidenceCanRequestPublish(draftLink as any, false), false);
  assert.equal(developerSpaceEvidenceReviewHref({
    ...draftLink,
    linkVisibility: "public",
  } as any, true), null);
  assert.equal(developerSpaceEvidenceCanRequestPublish({
    ...draftLink,
    linkVisibility: "public",
  } as any, true), false);
  assert.equal(developerSpaceEvidenceReviewHref({
    ...draftLink,
    document: { ...draftLink.document, status: "published", visibility: "public" },
  } as any, true), null);
  assert.equal(developerSpaceEvidenceCanRequestPublish({
    ...draftLink,
    document: { ...draftLink.document, status: "published", visibility: "public" },
  } as any, true), false);
});

test("observatory evidence reading path orders roles and stays honest when empty", () => {
  const ordered = orderedDeveloperSpaceEvidence([
    { role: "note", sortOrder: 0, document: { title: "Paper" } },
    { role: "field_log", sortOrder: 2, document: { title: "Field log B" } },
    { role: "methodology", sortOrder: 9, document: { title: "Method" } },
    { role: "finding", sortOrder: 1, document: { title: "Finding" } },
    { role: "field_log", sortOrder: 1, document: { title: "Field log A" } },
  ] as any);

  assert.deepEqual(
    ordered.map((document) => `${document.role}:${document.document.title}`),
    [
      "methodology:Method",
      "finding:Finding",
      "field_log:Field log A",
      "field_log:Field log B",
      "note:Paper",
    ],
  );
  assert.match(developerSpaceEvidenceEmptyCopy(false), /No public evidence documents/);
  assert.match(developerSpaceEvidenceEmptyCopy(true), /Public visitors will only see/);
});

test("observatory project updates combine public field logs and status notes safely", () => {
  const updates = developerSpaceProjectUpdates({
    linkedDocuments: [
      {
        id: "link-public-field-log",
        role: "field_log",
        linkVisibility: "public",
        document: {
          title: "Replay field log",
          excerpt: "Replay harness passed in hosted review.",
          status: "published",
          visibility: "public",
          publishedAt: "2026-06-26T15:00:00.000Z",
          updatedAt: "2026-06-26T15:00:00.000Z",
          createdAt: "2026-06-26T14:00:00.000Z",
        },
      },
      {
        id: "link-owner-field-log",
        role: "field_log",
        linkVisibility: "owner",
        document: {
          title: "Private field log",
          excerpt: "Private owner-only body should not render.",
          status: "draft",
          visibility: "private",
          updatedAt: "2026-06-26T16:00:00.000Z",
          createdAt: "2026-06-26T16:00:00.000Z",
        },
      },
      {
        id: "link-public-method",
        role: "methodology",
        linkVisibility: "public",
        document: {
          title: "Methodology",
          excerpt: "Not a changelog item.",
          status: "published",
          visibility: "public",
          updatedAt: "2026-06-26T17:00:00.000Z",
          createdAt: "2026-06-26T17:00:00.000Z",
        },
      },
    ],
    events: [
      {
        id: "event-status-note",
        eventType: "developer_agent.status_note",
        eventLabel: "Status note: public update",
        eventData: {
          statusNote: "Owner-approved public observatory status note.",
          dedupeKey: "owner-only-dedupe-key",
        },
        visibility: "public",
        occurredAt: "2026-06-26T16:00:00.000Z",
        createdAt: "2026-06-26T16:00:00.000Z",
      },
      {
        id: "event-runtime",
        eventType: "deploy.preview",
        eventLabel: "Runtime event",
        eventData: { statusNote: "Runtime event should stay in the event stream." },
        visibility: "public",
        occurredAt: "2026-06-26T17:00:00.000Z",
        createdAt: "2026-06-26T17:00:00.000Z",
      },
      {
        id: "event-private-note",
        eventType: "developer_agent.status_note",
        eventLabel: "Private status note",
        eventData: { statusNote: "Private status note should not render." },
        visibility: "private",
        occurredAt: "2026-06-26T18:00:00.000Z",
        createdAt: "2026-06-26T18:00:00.000Z",
      },
    ],
  } as any);

  assert.deepEqual(
    updates.map((update) => update.source),
    ["status_note", "field_log"],
  );
  assert.match(updates[0].body, /Owner-approved public observatory status note/);
  assert.match(updates[1].body, /Replay harness passed/);
  assert.doesNotMatch(JSON.stringify(updates), /owner-only-dedupe-key|Private owner-only body|Runtime event should stay/);
});

test("observatory project updates empty copy separates owner and visitor states", () => {
  assert.equal(developerSpaceProjectUpdates({ linkedDocuments: [], events: [] }).length, 0);
  assert.match(developerSpaceProjectUpdatesEmptyCopy(true), /Publish a field-log document/);
  assert.match(developerSpaceProjectUpdatesEmptyCopy(false), /No public project updates/);
});

test("observatory widget helpers bound custom dashboard layouts", () => {
  const widgets = normaliseDeveloperSpaceWidgets([
    { type: "event_stream", title: "Latest signals", zone: "main", position: 0, visible: true },
    { type: "visualisation", zone: "main", position: 1, visible: true },
    { type: "latest_snapshot", zone: "side", position: 0, visible: false },
    { type: "unknown", zone: "main", position: 99, visible: true },
  ]);

  assert.equal(widgetsForZone(widgets, "main")[0].type, "event_stream");
  assert.equal(widgets.find((widget) => widget.type === "latest_snapshot")?.visible, false);

  const hidden = updateWidgetVisibility(widgets, "event_stream", false);
  assert.equal(widgetsForZone(hidden, "main").some((widget) => widget.type === "event_stream"), false);

  const moved = moveDeveloperSpaceWidget(widgets, "visualisation", -1);
  assert.equal(widgetsForZone(moved, "main")[0].type, "visualisation");
});

test("visual config helpers provide bounded defaults per mode", () => {
  assert.deepEqual(normaliseDeveloperSpaceVisualConfig("node_field", { maxNodes: 200, showMetrics: false }), {
    maxNodes: 32,
    showMetrics: false,
  });
  assert.deepEqual(normaliseDeveloperSpaceVisualConfig("timeline", { eventLimit: "12", nodeLimit: 1 }), {
    eventLimit: 12,
    nodeLimit: 3,
    showSnapshots: true,
  });
  assert.deepEqual(normaliseDeveloperSpaceVisualConfig("world_map", { zoneField: "room", maxZones: 2, staggerZones: false }), {
    zoneField: "room",
    maxZones: 3,
    staggerZones: false,
  });
  assert.deepEqual(normaliseDeveloperSpaceVisualConfig("world_map", { zoneField: "room name", maxZones: 99 }), {
    zoneField: "zone",
    maxZones: 24,
    staggerZones: true,
  });
  assert.deepEqual(
    normaliseDeveloperSpaceVisualConfig("world_map", {
      zoneField: "room",
      publicFieldControls: {
        nodeMetricKeys: ["uptime", " uptime ", "bad key"],
        eventDataKeys: ["status", "token"],
        snapshotDataKeys: Array.from({ length: 40 }, (_, index) => `field_${index}`),
      },
    }).publicFieldControls,
    {
      nodeMetricKeys: ["uptime"],
      eventDataKeys: ["status", "token"],
      snapshotDataKeys: Array.from({ length: 32 }, (_, index) => `field_${index}`),
    },
  );
});

test("observed runtime fixtures parse neutral external observer samples", () => {
  const canonical = parseObservedRuntimeFixture(fixture("observed-runtime-canonical.json"));
  assert.equal(canonical.schema, "station.observed_runtime.fixture.v1");
  assert.equal(canonical.source.runtimeHostedBy, "external");
  assert.equal(canonical.source.stationRole, "observer");
  assert.equal(canonical.nodes.length, 2);
  assert.equal(canonical.events.length, 1);
  assert.equal(canonical.snapshots.length, 1);
  assert.equal(canonical.zones.length, 1);
  assert.equal(canonical.resources.length, 1);
  assert.equal(canonical.edges.length, 1);

  assert.equal(parseObservedRuntimeFixture(fixture("observed-runtime-identity-shadow.json")).source.id, "synthetic-identity-shadow");
  assert.equal(parseObservedRuntimeFixture(fixture("observed-runtime-world-shadow.json")).source.id, "synthetic-world-shadow");
});

test("observed runtime fixture filtering honors public member owner private and secret classes", () => {
  const canonical = fixture("observed-runtime-canonical.json");
  const publicReadback = normalizeObservedRuntimeFixture(canonical, { access: "public" });
  const memberReadback = normalizeObservedRuntimeFixture(canonical, { access: "member" });
  const ownerReadback = normalizeObservedRuntimeFixture(canonical, { access: "owner" });

  assert.deepEqual(Object.keys(publicReadback.nodes[0].metrics), ["publicState"]);
  assert.deepEqual(Object.keys(memberReadback.nodes[0].metrics), ["publicState", "memberCohort"]);
  assert.deepEqual(Object.keys(ownerReadback.nodes[0].metrics), ["publicState", "memberCohort", "ownerShard", "privateTrace"]);
  assert.equal(ownerReadback.nodes[0].metrics.secretApiKey, undefined);

  assert.equal(publicReadback.events[0].eventData.memberSignal, undefined);
  assert.equal(memberReadback.events[0].eventData.memberSignal, "member-visible zone pulse");
  assert.equal(ownerReadback.events[0].eventData.privateRuntimeTrace, "fixture-private-event-trace");
  assert.equal(ownerReadback.events[0].eventData.secretToken, undefined);

  assert.equal(publicReadback.latestSnapshot?.snapshotData.memberEconomy, undefined);
  assert.equal(memberReadback.latestSnapshot?.snapshotData.memberEconomy, "credits stable in synthetic fixture");
  assert.equal(ownerReadback.latestSnapshot?.snapshotData.privateMemoryTrace, "fixture-private-snapshot-trace");
  assert.equal(ownerReadback.latestSnapshot?.snapshotData.secretCookie, undefined);

  assert.equal(publicReadback.zones[0].privateModerationNote, undefined);
  assert.equal(ownerReadback.zones[0].privateModerationNote, "fixture-private-zone-note");
  assert.equal(ownerReadback.zones[0].secretAccessToken, undefined);
  assert.equal(ownerReadback.resources[0].ownerLedgerHint, "fixture-owner-ledger-hint");
  assert.equal(ownerReadback.resources[0].secretLedgerKey, undefined);
  assert.equal(ownerReadback.edges[0].privateCorrelationTrace, "fixture-private-edge-trace");
  assert.equal(ownerReadback.edges[0].secretRawEdgePayload, undefined);
  assert.equal(ownerReadback.provenance.ownerReviewNote, "Synthetic only; no partner runtime or hosted executor.");
  assert.equal(ownerReadback.provenance.privateImportTrace, "fixture-private-provenance-trace");
  assert.equal(ownerReadback.provenance.secretWebhookSignature, undefined);
});

test("observed runtime fixtures reject malformed and overexposed fields", () => {
  const canonical = fixture("observed-runtime-canonical.json");
  assert.throws(
    () => parseObservedRuntimeFixture({ ...canonical, source: { ...canonical.source, runtimeHostedBy: "station" } }),
    /external runtime/
  );

  const missingClassification = structuredClone(canonical);
  delete missingClassification.nodes[0].fieldClassifications["observations.publicState"];
  assert.throws(
    () => normalizeObservedRuntimeFixture(missingClassification, { access: "public" }),
    /missing a field classification/
  );

  const overexposedSecret = structuredClone(canonical);
  overexposedSecret.events[0].fieldClassifications["data.secretToken"] = "public";
  assert.throws(
    () => normalizeObservedRuntimeFixture(overexposedSecret, { access: "public" }),
    /must be classified as secret/
  );
});

test("observed runtime readback feeds Developer Space observatory helpers without raw secrets", () => {
  const readback = normalizeObservedRuntimeFixture(fixture("observed-runtime-canonical.json"), { access: "public" });

  assert.equal(developerSpaceSignalStatus(readback.detail), "Public-safe signals from the external runtime are arriving.");
  assert.equal(
    developerSpaceStorySummary(readback.detail),
    "This Tier 1 observatory is showing 2 tracked nodes, 1 public signal, a current snapshot from a self-hosted project runtime."
  );
  assert.deepEqual(publicEntries(readback.nodes[0].metrics).map(([key]) => key), ["publicState"]);

  const rendered = JSON.stringify(readback);
  assert.doesNotMatch(rendered, /fixture-secret/);
  assert.doesNotMatch(rendered, /fixture-private/);
  assert.doesNotMatch(rendered, /owner-visible synthetic threshold/);
  assert.match(rendered, /world gate reached balanced state/);
});

test("observed runtime bridge emits current Developer Space import payloads and unmapped deltas", () => {
  const bridge = bridgeObservedRuntimeFixtureToDeveloperSpaceImport(fixture("observed-runtime-canonical.json"));

  assert.equal(bridge.route, "/developer-spaces/ingest/import");
  assert.equal(bridge.auth.requiredHeader, "X-Station-Developer-Key");
  assert.deepEqual(
    bridge.importPayload.nodes.map((node) => node.nodeId),
    ["world:gate", "identity:lens"]
  );
  assert.deepEqual(bridge.importPayload.nodes[0].metrics, {
    publicState: "stable",
    memberCohort: "alpha-watchers",
    ownerShard: "world-gate-owner-shard",
    privateTrace: "fixture-private-node-trace",
  });
  assert.deepEqual(bridge.importPayload.nodes[0].fieldClassifications, {
    publicState: "public",
    memberCohort: "member",
    ownerShard: "owner",
    privateTrace: "private",
  });
  assert.equal(bridge.importPayload.events[0].eventType, "zone_balance");
  assert.deepEqual(bridge.importPayload.events[0].eventData, {
    publicSignal: "world gate reached balanced state",
    memberSignal: "member-visible zone pulse",
    ownerNote: "owner-visible synthetic threshold",
    privateRuntimeTrace: "fixture-private-event-trace",
  });
  assert.deepEqual(bridge.importPayload.snapshots[0].snapshotData, {
    publicSummary: "Synthetic runtime is observable but externally hosted.",
    memberEconomy: "credits stable in synthetic fixture",
    ownerDebug: "owner-safe fixture readback note",
    privateMemoryTrace: "fixture-private-snapshot-trace",
  });

  assert.equal(bridge.readbacks.member.nodes[0].metrics.memberCohort, "alpha-watchers");
  assert.equal(bridge.readbacks.owner.nodes[0].metrics.privateTrace, "fixture-private-node-trace");
  assert.equal(bridge.readbacks.owner.nodes[0].metrics.secretApiKey, undefined);
  assert.deepEqual(
    bridge.importPayload.supportingContext.map((context) => context.contextType),
    ["zone", "resource", "edge", "provenance"]
  );
  assert.deepEqual(bridge.importPayload.supportingContext[0].payload, {
    id: "zone-crossroads",
    name: "Crossroads",
    publicOccupancy: 18,
    memberDensityBand: "medium",
    privateModerationNote: "fixture-private-zone-note",
  });
  assert.equal(bridge.importPayload.supportingContext[0].fieldClassifications?.secretAccessToken, undefined);
  assert.equal(bridge.unmapped.zones.length, 0);
  assert.match(bridge.unmapped.reason, /supportingContext/);

  const payloadText = JSON.stringify(bridge.importPayload);
  assert.doesNotMatch(payloadText, /fixture-secret/);
  assert.doesNotMatch(payloadText, /secretToken|secretApiKey|secretCookie/);
});
