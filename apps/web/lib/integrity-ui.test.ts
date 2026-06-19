import assert from "node:assert/strict";
import test from "node:test";
import {
  integrityClusterListLabel,
  integrityDestinationForOutput,
  integrityHistorySummary,
  integrityReviewCopy,
  integritySessionTypeLabel,
  integrityStatusLabel,
  integrityWrittenDestinationLabel,
} from "./integrity-ui";

test("integrity UI helpers label sessions, clusters, statuses, and destinations", () => {
  assert.equal(integritySessionTypeLabel("pre_publication"), "Pre-publication review");
  assert.equal(integrityClusterListLabel(["identity", "boundaries"]), "Identity, Boundaries");
  assert.equal(integrityStatusLabel("edited"), "Edited and accepted");
  assert.equal(integrityDestinationForOutput("canon_candidate"), "Canon");
  assert.equal(integrityDestinationForOutput("theme"), "Preference profile");
  assert.equal(integrityWrittenDestinationLabel("preference_profile"), "Preference profile");
});

test("integrity review copy says what each action writes or preserves", () => {
  const copy = integrityReviewCopy({ output_type: "boundary", status: "pending" });

  assert.equal(copy.accept, "Accept writes this to Memory.");
  assert.equal(copy.edit, "Edit then accept writes your edited text to Memory.");
  assert.match(copy.reject, /does not write/);
});

test("integrity history summary counts review states", () => {
  assert.deepEqual(
    integrityHistorySummary([
      {
        session_type: "periodic",
        status: "completed",
        started_at: "2026-06-18T00:00:00.000Z",
        completed_at: "2026-06-19T00:00:00.000Z",
        clusters_covered: ["tone"],
        integrity_session_outputs: [
          { output_type: "memory_candidate", status: "pending" },
          { output_type: "canon_candidate", status: "accepted" },
          { output_type: "theme", status: "edited" },
          { output_type: "boundary", status: "rejected" },
        ],
      },
    ]),
    {
      totalSessions: 1,
      latestStatus: "Completed",
      latestDate: "2026-06-19T00:00:00.000Z",
      pending: 1,
      accepted: 1,
      edited: 1,
      rejected: 1,
    },
  );
});
