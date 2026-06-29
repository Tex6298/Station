import assert from "node:assert/strict";
import test from "node:test";
import {
  personaEncounterContractCanRenderForOwner,
  personaEncounterContractGate,
  personaEncounterContractIsReadbackOnly,
} from "./persona-encounter-contract";

test("persona encounter contract copy stays owner-only and readback-only", () => {
  const gate = personaEncounterContractGate();

  assert.equal(gate.eyebrow, "Encounter Contract");
  assert.equal(gate.title, "Consent and provenance");
  assert.equal(gate.privacy, "Owner-only private Studio contract");
  assert.match(gate.summary, /no runtime here/);
  assert.match(gate.summary, /owner-only contract readback/);
  assert.equal(personaEncounterContractIsReadbackOnly(gate), true);
});

test("persona encounter contract names consent, provenance, stop, and public blockers", () => {
  const gate = personaEncounterContractGate();
  const statuses = gate.items.map((item) => [item.key, item.status]);
  const bodies = gate.items.map((item) => item.body).join(" ");

  assert.deepEqual(statuses, [
    ["consent-scope", "Same-owner only"],
    ["provenance-labels", "Required"],
    ["stop-revoke", "Required"],
    ["cost-public-safety", "Blocked"],
  ]);

  assert.match(bodies, /owner-initiated/);
  assert.match(bodies, /same account/);
  assert.match(bodies, /cross-owner encounters remain blocked/);
  assert.match(bodies, /bilateral consent/);
  assert.match(bodies, /owner-authored setup/);
  assert.match(bodies, /selected persona identities/);
  assert.match(bodies, /model-generated turns/);
  assert.match(bodies, /private inputs/);
  assert.match(bodies, /archived sources/);
  assert.match(bodies, /transcript state/);
  assert.match(bodies, /manually stoppable/);
  assert.match(bodies, /turn limits/);
  assert.match(bodies, /Provider calls need cost estimates/);
  assert.match(bodies, /fail-closed quota behavior/);
  assert.match(bodies, /public or shareable output remains blocked/);
  assert.match(bodies, /reporting/);
  assert.match(bodies, /takedown/);
  assert.match(bodies, /retract/);
});

test("persona encounter contract helper returns defensive item copies", () => {
  const first = personaEncounterContractGate();
  const second = personaEncounterContractGate();

  first.items[0]!.status = "Blocked";

  assert.equal(second.items[0]!.status, "Same-owner only");
  assert.equal(personaEncounterContractIsReadbackOnly(first), true);
});

test("persona encounter contract owner render guard rejects non-owner and public readbacks", () => {
  assert.equal(personaEncounterContractCanRenderForOwner({ ownerUserId: "owner-1" }, "owner-1"), true);
  assert.equal(personaEncounterContractCanRenderForOwner({ ownerUserId: "owner-1" }, "owner-2"), false);
  assert.equal(personaEncounterContractCanRenderForOwner({ ownerUserId: null }, "owner-1"), false);
  assert.equal(personaEncounterContractCanRenderForOwner({}, "owner-1"), false);
  assert.equal(personaEncounterContractCanRenderForOwner({ ownerUserId: "owner-1" }, null), false);
});
