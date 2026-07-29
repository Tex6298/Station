import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { companionQuickCardTransition } from "./companion-quick-card";

test("companion quick card distinguishes transient hover from pinned click state", () => {
  assert.equal(companionQuickCardTransition("closed", "pointer-enter"), "hover");
  assert.equal(companionQuickCardTransition("hover", "pointer-leave"), "closed");
  assert.equal(companionQuickCardTransition("hover", "toggle-pin"), "pinned");
  assert.equal(companionQuickCardTransition("pinned", "pointer-leave"), "pinned");
  assert.equal(companionQuickCardTransition("pinned", "toggle-pin"), "closed");
});

test("companion quick card dismisses every open mode deterministically", () => {
  assert.equal(companionQuickCardTransition("hover", "dismiss"), "closed");
  assert.equal(companionQuickCardTransition("pinned", "dismiss"), "closed");
  assert.equal(companionQuickCardTransition("closed", "dismiss"), "closed");
});

test("companion quick card wires hover, keyboard, focus, and accessible trigger controls", () => {
  const source = readFileSync("apps/web/components/studio/companion-quick-card.tsx", "utf8");

  assert.match(source, /transition\("pointer-enter"\)/);
  assert.match(source, /scheduleClose\("pointer-leave"\)/);
  assert.match(source, /transition\("toggle-pin"\)/);
  assert.match(source, /event\.key !== "Escape"/);
  assert.match(source, /triggerRef\.current\?\.focus\(\)/);
  assert.match(source, /onBlurCapture=\{handleBlur\}/);
  assert.match(source, /aria-controls=\{cardId\}/);
  assert.match(source, /aria-haspopup="dialog"/);
});
