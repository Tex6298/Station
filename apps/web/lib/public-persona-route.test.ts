import assert from "node:assert/strict";
import test from "node:test";
import {
  publicPersonaContextPreviewCopy,
  publicPersonaChatCopy,
  publicPersonaChatDisabledCopy,
  publicPersonaHref,
  publicPersonaReadbackCopy,
} from "./public-persona-route";

test("public persona href only accepts safe public slugs", () => {
  assert.equal(publicPersonaHref("mimir-public"), "/personas/mimir-public");
  assert.equal(publicPersonaHref("persona-2"), "/personas/persona-2");
  assert.equal(publicPersonaHref("persona-550e8400-e29b-41d4-a716-446655440000"), "/personas/persona-550e8400-e29b-41d4-a716-446655440000");
  assert.equal(publicPersonaHref(""), null);
  assert.equal(publicPersonaHref("Persona One"), null);
  assert.equal(publicPersonaHref("raw/persona/id"), null);
  assert.equal(publicPersonaHref("550e8400-e29b-41d4-a716-446655440000"), null);
});

test("public persona readback copy names private boundaries without route ids", () => {
  const copy = publicPersonaReadbackCopy();
  assert.match(copy, /Only the public profile/);
  assert.match(copy, /Private Studio memory/);
  assert.doesNotMatch(copy, /ownerUserId|personaId|provider payload|token|cookie/i);
});

test("public persona context preview copy is a preview boundary, not a chat promise", () => {
  const copy = publicPersonaContextPreviewCopy();
  assert.match(copy, /public source categories/);
  assert.match(copy, /does not start chat/);
  assert.match(copy, /private runtime context/);
  assert.doesNotMatch(copy, /ask this persona|send message|live chat|model response/i);
});

test("public persona chat copy stays public-source-only", () => {
  const copy = publicPersonaChatCopy();
  assert.match(copy, /public profile/);
  assert.match(copy, /published public documents/);
  assert.match(copy, /linked public discussions/);
  assert.doesNotMatch(copy, /private memory|private continuity|owner setup|provider settings|token|cookie/i);

  const disabled = publicPersonaChatDisabledCopy();
  assert.match(disabled, /not enabled/);
  assert.doesNotMatch(disabled, /provider|quota|ownerUserId|personaId|token|cookie/i);
});
