import assert from "node:assert/strict";
import test from "node:test";
import {
  developerSpaceOwnerCurrentState,
  developerSpaceUsageReadback,
  developerSpaceSignalStatus,
  developerSpaceStorySummary,
  developerSpaceMethodologyCopy,
  developerSpaceEvidenceRoleCopy,
  developerSpaceEvidenceRoleDescription,
  developerSpaceEvidenceEmptyCopy,
  developerSpaceEvidenceTitle,
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

test("observatory story helpers explain current public evidence", () => {
  const detail = {
    nodes: [{ id: "node-1" }],
    events: [{ id: "event-1" }],
    latestSnapshot: { id: "snapshot-1" },
    linkedDocuments: [{ id: "doc-link-1", linkVisibility: "public" }],
  } as unknown as Parameters<typeof developerSpaceStorySummary>[0];

  assert.equal(
    developerSpaceStorySummary(detail),
    "This observatory is currently showing 1 tracked node, 1 public signal, a current snapshot, 1 public note."
  );
  assert.equal(developerSpaceSignalStatus(detail), "Live signals are arriving.");

  const ownerDetail = {
    ...detail,
    linkedDocuments: [
      { id: "doc-link-1", linkVisibility: "public" },
      { id: "doc-link-2", linkVisibility: "owner" },
    ],
  } as unknown as Parameters<typeof developerSpaceStorySummary>[0];
  assert.equal(
    developerSpaceStorySummary(ownerDetail),
    "This observatory is currently showing 1 tracked node, 1 public signal, a current snapshot, 1 public note, 1 owner-only link."
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
    "This observatory is currently showing 0 tracked nodes, 0 public signals."
  );
  assert.equal(developerSpaceSignalStatus(detail), "The public observatory is ready, but no project signals have arrived yet.");
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
  assert.equal(current.status, "Live signals are arriving.");
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
  assert.match(withNotes.liveSignal, /public node, event, or snapshot records/);
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
