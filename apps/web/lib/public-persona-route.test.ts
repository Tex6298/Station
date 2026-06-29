import assert from "node:assert/strict";
import test from "node:test";
import {
  publicPersonaChatAccess,
  publicPersonaContextPreviewCopy,
  publicPersonaChatCopy,
  publicPersonaChatDisabledCopy,
  publicPersonaHref,
  publicPersonaOptionalRead,
  publicPersonaOptionalReadErrorCopy,
  publicPersonaReadbackCopy,
  publicPersonaUpdatesCopy,
  publicPersonaUpdatesEmptyCopy,
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
  assert.match(copy, /public Salon threads/);
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

  const anonymous = publicPersonaChatCopy("anonymous_alpha");
  assert.match(anonymous, /Anonymous alpha/);
  assert.match(anonymous, /public profile/);
  assert.match(anonymous, /Reports still require sign-in/);
  assert.doesNotMatch(anonymous, /private memory|private continuity|owner setup|provider settings|token|cookie/i);

  const disabled = publicPersonaChatDisabledCopy();
  assert.match(disabled, /not enabled/);
  assert.doesNotMatch(disabled, /provider|quota|ownerUserId|personaId|token|cookie/i);
});

test("public persona chat access exposes anonymous form only for anonymous alpha", () => {
  assert.equal(publicPersonaChatAccess({ enabled: false, mode: "anonymous_alpha", hasSession: false }), "disabled");
  assert.equal(publicPersonaChatAccess({ enabled: true, mode: "anonymous_alpha", hasSession: false }), "anonymous_alpha");
  assert.equal(publicPersonaChatAccess({ enabled: true, mode: "anonymous_alpha", hasSession: true }), "anonymous_alpha");
  assert.equal(publicPersonaChatAccess({ enabled: true, mode: "signed_in_alpha", hasSession: false }), "sign_in_required");
  assert.equal(publicPersonaChatAccess({ enabled: true, mode: "signed_in_alpha", hasSession: true }), "signed_in_alpha");
});

test("public persona optional reads fail with bounded public copy", async () => {
  assert.equal(
    publicPersonaOptionalReadErrorCopy("context-preview"),
    "Public context preview is temporarily unavailable."
  );
  assert.equal(
    publicPersonaOptionalReadErrorCopy("updates"),
    "Public updates are temporarily unavailable."
  );

  await assert.rejects(
    () => publicPersonaOptionalRead(new Promise(() => undefined), "context-preview", 1),
    /Public context preview is temporarily unavailable/
  );
  await assert.rejects(
    () => publicPersonaOptionalRead(Promise.reject(new Error("Public updates are temporarily unavailable.")), "updates", 100),
    /Public updates are temporarily unavailable/
  );
  assert.equal(await publicPersonaOptionalRead(Promise.resolve("ok"), "updates", 100), "ok");
});

test("public persona updates copy stays derived and public-source-only", () => {
  const copy = publicPersonaUpdatesCopy();
  assert.match(copy, /Public updates/);
  assert.match(copy, /published documents/);
  assert.match(copy, /public document discussions/);
  assert.match(copy, /public Salon threads/);
  assert.match(copy, /not live activity/);
  assert.match(copy, /private memory/);
  assert.doesNotMatch(copy, /provider calls|model calls|persona-to-persona|private continuity|owner setup|token|cookie/i);

  const empty = publicPersonaUpdatesEmptyCopy();
  assert.match(empty, /No published documents/);
  assert.match(empty, /public discussions/);
  assert.doesNotMatch(empty, /live|provider|private|persona-to-persona|ownerUserId|personaId|token|cookie/i);
});
