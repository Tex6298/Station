import assert from "node:assert/strict";
import test from "node:test";
import {
  voiceAvatarReadinessGate,
  voiceAvatarReadinessIsReadbackOnly,
} from "./voice-avatar-readiness";

test("voice avatar readiness copy stays owner-only and readback-only", () => {
  const gate = voiceAvatarReadinessGate();

  assert.equal(gate.eyebrow, "Voice / Avatar");
  assert.equal(gate.title, "Readiness gate");
  assert.equal(gate.privacy, "Owner-only private Studio readback");
  assert.match(gate.summary, /not enabled yet/);
  assert.match(gate.summary, /owner-only readback/);
  assert.equal(voiceAvatarReadinessIsReadbackOnly(gate), true);
});

test("voice avatar readiness gate names disabled media behavior and prerequisites", () => {
  const gate = voiceAvatarReadinessGate();
  const statuses = gate.items.map((item) => [item.key, item.status]);
  const bodies = gate.items.map((item) => item.body).join(" ");

  assert.deepEqual(statuses, [
    ["voice-calls", "Not enabled"],
    ["avatar-likeness", "Not enabled"],
    ["media-adapter", "Required"],
    ["policy-cost", "Required"],
  ]);

  assert.match(bodies, /speech-to-text/);
  assert.match(bodies, /text-to-speech/);
  assert.match(bodies, /voice cloning/);
  assert.match(bodies, /Avatar likeness generation/);
  assert.match(bodies, /audio upload/);
  assert.match(bodies, /video upload/);
  assert.match(bodies, /provider media adapter/);
  assert.match(bodies, /Consent/);
  assert.match(bodies, /rate-limit/);
  assert.match(bodies, /plan enforcement/);
});

test("voice avatar readiness helper returns defensive item copies", () => {
  const first = voiceAvatarReadinessGate();
  const second = voiceAvatarReadinessGate();

  first.items[0]!.status = "Required";

  assert.equal(second.items[0]!.status, "Not enabled");
  assert.equal(voiceAvatarReadinessIsReadbackOnly(first), true);
});
