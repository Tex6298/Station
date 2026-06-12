import assert from "node:assert/strict";
import test from "node:test";
import {
  developerSpaceSignalStatus,
  developerSpaceStorySummary,
  formatValue,
  moveDeveloperSpaceWidget,
  normaliseDeveloperSpaceWidgets,
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
    linkedDocuments: [{ id: "doc-link-1" }],
  } as unknown as Parameters<typeof developerSpaceStorySummary>[0];

  assert.equal(
    developerSpaceStorySummary(detail),
    "This observatory is currently showing 1 tracked node, 1 public signal, a current snapshot, 1 public note."
  );
  assert.equal(developerSpaceSignalStatus(detail), "Live signals are arriving.");
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
});
