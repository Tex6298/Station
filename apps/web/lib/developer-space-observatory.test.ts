import assert from "node:assert/strict";
import test from "node:test";
import {
  formatValue,
  publicEntries,
  shouldShowRawDeveloperSpaceData,
  visualisationLabel,
} from "./developer-space-observatory";
import { normaliseDeveloperSpaceVisualConfig } from "./developer-space-visual-config";

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
  assert.equal(formatValue({ prompt: "owner-only detail" }), "Structured record");
  assert.equal(shouldShowRawDeveloperSpaceData("public"), false);
  assert.equal(shouldShowRawDeveloperSpaceData("member"), false);
  assert.equal(shouldShowRawDeveloperSpaceData("owner"), true);
  assert.equal(visualisationLabel("world_map"), "World map");
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
});
