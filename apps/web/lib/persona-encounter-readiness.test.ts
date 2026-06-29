import assert from "node:assert/strict";
import test from "node:test";
import {
  personaEncounterReadinessGate,
  personaEncounterReadinessIsReadbackOnly,
} from "./persona-encounter-readiness";

test("persona encounter readiness copy stays owner-only and readback-only", () => {
  const gate = personaEncounterReadinessGate();

  assert.equal(gate.eyebrow, "Persona Encounters");
  assert.equal(gate.title, "Readiness gate");
  assert.equal(gate.privacy, "Owner-only private Studio readback");
  assert.match(gate.summary, /not enabled yet/);
  assert.match(gate.summary, /owner-only readback/);
  assert.equal(personaEncounterReadinessIsReadbackOnly(gate), true);
});

test("persona encounter readiness gate names disabled runtime and required policy", () => {
  const gate = personaEncounterReadinessGate();
  const statuses = gate.items.map((item) => [item.key, item.status]);
  const bodies = gate.items.map((item) => item.body).join(" ");

  assert.deepEqual(statuses, [
    ["encounters", "Not enabled"],
    ["provider-loops", "Not callable"],
    ["outputs", "Not generated"],
    ["policy-gates", "Required"],
  ]);

  assert.match(bodies, /Autonomous persona chat/);
  assert.match(bodies, /background conversations/);
  assert.match(bodies, /Provider calls/);
  assert.match(bodies, /multi-turn model loops/);
  assert.match(bodies, /token-credit deductions/);
  assert.match(bodies, /Durable encounter transcripts/);
  assert.match(bodies, /generated encounter output/);
  assert.match(bodies, /public pages/);
  assert.match(bodies, /shareable pages/);
  assert.match(bodies, /Consent/);
  assert.match(bodies, /provenance/);
  assert.match(bodies, /moderation/);
  assert.match(bodies, /revocation/);
  assert.match(bodies, /plan enforcement/);
});

test("persona encounter readiness helper returns defensive item copies", () => {
  const first = personaEncounterReadinessGate();
  const second = personaEncounterReadinessGate();

  first.items[0]!.status = "Required";

  assert.equal(second.items[0]!.status, "Not enabled");
  assert.equal(personaEncounterReadinessIsReadbackOnly(first), true);
});
