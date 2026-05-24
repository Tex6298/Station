import assert from "node:assert/strict";
import test from "node:test";
import {
  formatValue,
  publicEntries,
  shouldShowRawDeveloperSpaceData,
  visualisationLabel,
} from "./developer-space-observatory";

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
