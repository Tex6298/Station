import assert from "node:assert/strict";
import test from "node:test";
import {
  canUseCommunityWitness,
  commentWitnessPath,
  communityWitnessAvailability,
  getViewerWitnesses,
  getWitnessCounts,
  normalizeWitnessCounts,
  threadWitnessPath,
  witnessAvailabilityLabel,
} from "./community-witness";

test("community witness helpers stay bounded to PR95 routes", () => {
  assert.equal(threadWitnessPath("thread-1", "helpful"), "/threads/thread-1/witness/helpful");
  assert.equal(commentWitnessPath("comment-1", "grounded"), "/comments/comment-1/witness/grounded");
});

test("community witness eligibility blocks signed-out, below-tier, and self states", () => {
  const visitor = { id: "visitor", tier: "visitor" as const, isAdmin: false };
  const member = { id: "member", tier: "private" as const, isAdmin: false };
  const author = { id: "author", tier: "creator" as const, isAdmin: false };

  assert.equal(canUseCommunityWitness(null), false);
  assert.equal(canUseCommunityWitness(visitor), false);
  assert.equal(canUseCommunityWitness(member), true);

  assert.equal(communityWitnessAvailability(null, { author_user_id: "author" }), "signed-out");
  assert.equal(communityWitnessAvailability(visitor, { author_user_id: "author" }), "below-tier");
  assert.equal(communityWitnessAvailability(author, { author_user_id: "author" }), "self");
  assert.equal(communityWitnessAvailability(member, { author_user_id: "author" }), "eligible");
});

test("community witness labels do not expose witnesser identities", () => {
  assert.equal(witnessAvailabilityLabel("signed-out"), "Sign in to witness this contribution.");
  assert.equal(witnessAvailabilityLabel("below-tier"), "Witnessing is available to private tier and above.");
  assert.equal(witnessAvailabilityLabel("self"), "Own contribution");
  assert.equal(witnessAvailabilityLabel("eligible"), "Witness this contribution");
});

test("community witness readback keeps aggregate counts and current viewer state only", () => {
  assert.deepEqual(normalizeWitnessCounts({ helpful: 2 }), { helpful: 2, grounded: 0, careful: 0 });
  assert.deepEqual(
    getWitnessCounts({ witness_counts: { helpful: 1, grounded: 3, careful: 0 } }),
    { helpful: 1, grounded: 3, careful: 0 }
  );
  assert.deepEqual(getViewerWitnesses({ viewer_witnesses: ["careful"] }), ["careful"]);
  assert.deepEqual(getViewerWitnesses({}), []);
});
