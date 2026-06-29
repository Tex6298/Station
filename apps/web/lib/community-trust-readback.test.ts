import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  authorRecognitionPrivateBoundaryCopy,
  authorRecognitionTrustRows,
  communityTrustBoundaryCopy,
  communityViewerWitnessSummary,
  communityWitnessKindDescription,
  communityWitnessKindLabel,
  communityWitnessReadbackRows,
  communityWitnessTrustSummary,
} from "./community-trust-readback";

test("community trust readback helper maps witness marks to bounded meanings", () => {
  assert.equal(communityWitnessKindLabel("helpful"), "Helpful");
  assert.equal(communityWitnessKindDescription("helpful"), "Useful to the discussion.");
  assert.equal(communityWitnessKindDescription("grounded"), "Supported by context or source material.");
  assert.equal(communityWitnessKindDescription("careful"), "Considered and low-drama.");
  assert.equal(communityWitnessTrustSummary({ helpful: 0, grounded: 0, careful: 0 }), "No aggregate witness marks yet.");
  assert.equal(communityWitnessTrustSummary({ helpful: 1, grounded: 0, careful: 0 }), "1 aggregate witness mark.");
  assert.equal(communityViewerWitnessSummary(null), "Only your own selected marks appear after sign-in.");

  const rows = communityWitnessReadbackRows({ helpful: 1, grounded: 2, careful: 3 });
  assert.deepEqual(rows.map((row) => row.value), [1, 2, 3]);
});

test("community trust readback copy is explicit about privacy boundaries", () => {
  const witnessBoundary = communityTrustBoundaryCopy();
  const recognitionBoundary = authorRecognitionPrivateBoundaryCopy();
  const recognitionRows = authorRecognitionTrustRows({ contributionCount: 3, witnessMarkCount: 7 });
  const copy = [
    witnessBoundary,
    recognitionBoundary,
    ...recognitionRows.map((row) => `${row.label} ${row.value} ${row.body}`),
  ].join(" ");

  assert.match(witnessBoundary, /not public author scores, rankings, badges, or clout/i);
  assert.match(recognitionBoundary, /visible only to the signed-in author/i);
  assert.match(copy, /aggregate/i);
  assert.match(copy, /Witnesser identities, reporter details, moderation notes, hidden bodies, and raw internal rows are not shown/i);
  assert.doesNotMatch(copy, /witness_user_id|reporter_user_id|moderation_report_id|admin_note_id|sql table|stack trace|provider payload/i);
});

test("community trust readback source is wired only into existing witness and private recognition surfaces", () => {
  const threadPage = readFileSync("apps/web/app/forums/[categorySlug]/[threadId]/page.tsx", "utf8");
  const recognitionPage = readFileSync("apps/web/app/forums/witnesses/page.tsx", "utf8");

  assert.match(threadPage, /communityWitnessTrustSummary/);
  assert.match(threadPage, /communityViewerWitnessSummary/);
  assert.match(threadPage, /communityTrustBoundaryCopy/);
  assert.match(recognitionPage, /authorRecognitionPrivateBoundaryCopy/);
  assert.match(recognitionPage, /authorRecognitionTrustRows/);
  assert.doesNotMatch(threadPage + recognitionPage, /moderationActionPath|reporter_user_id|witness_user_id|leaderboard|moderator directory/i);
});
