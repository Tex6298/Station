import assert from "node:assert/strict";
import test from "node:test";
import { publicPersonaHref, publicPersonaReadbackCopy } from "./public-persona-route";

test("public persona href only accepts safe public slugs", () => {
  assert.equal(publicPersonaHref("mimir-public"), "/personas/mimir-public");
  assert.equal(publicPersonaHref("persona-2"), "/personas/persona-2");
  assert.equal(publicPersonaHref(""), null);
  assert.equal(publicPersonaHref("Persona One"), null);
  assert.equal(publicPersonaHref("raw/persona/id"), null);
});

test("public persona readback copy names private boundaries without route ids", () => {
  const copy = publicPersonaReadbackCopy();
  assert.match(copy, /Only the public profile/);
  assert.match(copy, /Private Studio memory/);
  assert.doesNotMatch(copy, /ownerUserId|personaId|provider payload|token|cookie/i);
});
