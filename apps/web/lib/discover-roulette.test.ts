import assert from "node:assert/strict";
import test from "node:test";
import { discoverRouletteStatusCopy } from "./discover-roulette";

test("discover roulette status copy keeps unavailable states honest", () => {
  assert.equal(discoverRouletteStatusCopy("loading"), "Drawing...");
  assert.equal(discoverRouletteStatusCopy("empty"), "No public personas yet.");
  assert.equal(discoverRouletteStatusCopy("unavailable"), "Persona roulette unavailable.");
  assert.equal(discoverRouletteStatusCopy("ready"), null);
});
