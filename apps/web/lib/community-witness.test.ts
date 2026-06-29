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
import {
  communityTrustBoundaryCopy,
  communityViewerWitnessSummary,
  communityWitnessKindDescription,
  communityWitnessKindLabel,
  communityWitnessReadbackRows,
  communityWitnessTrustSummary,
} from "./community-trust-readback";

test("community witness helpers stay bounded to PR95 routes", () => {
  assert.equal(threadWitnessPath("thread-1", "helpful"), "/threads/thread-1/witness/helpful");
  assert.equal(commentWitnessPath("comment-1", "grounded"), "/comments/comment-1/witness/grounded");
});

test("community witness eligibility blocks signed-out, below-tier, and self states", () => {
  const visitor = { id: "visitor", tier: "visitor" as const, isAdmin: false };
  const member = { id: "member", tier: "private" as const, isAdmin: false };
  const author = { id: "author", tier: "creator" as const, isAdmin: false };
  const admin = { id: "admin", tier: "visitor" as const, isAdmin: true };

  assert.equal(canUseCommunityWitness(null), false);
  assert.equal(canUseCommunityWitness(visitor), false);
  assert.equal(canUseCommunityWitness(member), true);
  assert.equal(canUseCommunityWitness(admin), true);

  assert.equal(communityWitnessAvailability(null, { author_user_id: "author" }), "signed-out");
  assert.equal(communityWitnessAvailability(visitor, { author_user_id: "author" }), "below-tier");
  assert.equal(communityWitnessAvailability(author, { author_user_id: "author" }), "self");
  assert.equal(communityWitnessAvailability(member, { author_user_id: "author" }), "eligible");
  assert.equal(communityWitnessAvailability(admin, { author_user_id: "author" }), "eligible");
  assert.equal(communityWitnessAvailability(admin, { author_user_id: "admin" }), "self");
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

test("community witness trust copy explains marks without public scoring", () => {
  assert.equal(communityWitnessKindLabel("helpful"), "Helpful");
  assert.equal(communityWitnessKindDescription("grounded"), "Supported by context or source material.");
  assert.equal(communityWitnessTrustSummary({ helpful: 1, grounded: 1, careful: 0 }), "2 aggregate witness marks.");
  assert.equal(communityViewerWitnessSummary(["careful"]), "Your current marks: Careful.");
  assert.equal(
    communityTrustBoundaryCopy(),
    "Witness marks are contribution-level acknowledgments, not public author scores, rankings, badges, or clout."
  );

  const rows = communityWitnessReadbackRows({ helpful: 1, grounded: 0, careful: 2 });
  assert.deepEqual(rows.map((row) => [row.kind, row.label, row.value]), [
    ["helpful", "Helpful", 1],
    ["grounded", "Grounded", 0],
    ["careful", "Careful", 2],
  ]);
  assert.doesNotMatch(
    rows.map((row) => `${row.label} ${row.description}`).join(" "),
    /leaderboard|badge|clout|reputation profile|user score|public score|rank/i
  );
});
