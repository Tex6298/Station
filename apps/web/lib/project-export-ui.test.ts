import assert from "node:assert/strict";
import test from "node:test";
import {
  projectExportActions,
  projectExportCopy,
  projectExportFormatLabel,
  projectExportSectionLine,
  projectExportStatusLabel,
  projectExportSummary,
  projectExportSummaryLine,
  projectExportTone,
} from "./project-export-ui";

test("project export UI helpers expose readback actions only for completed packages", () => {
  assert.equal(projectExportTone("completed"), "good");
  assert.equal(projectExportStatusLabel("completed"), "Completed");
  assert.equal(projectExportFormatLabel("json_markdown"), "JSON / Markdown");
  assert.deepEqual(projectExportActions({ status: "completed" }), {
    canCreate: true,
    canReadManifest: true,
    canReadBundle: true,
  });

  for (const status of ["requested", "processing", "failed", "abandoned"]) {
    assert.deepEqual(projectExportActions({ status }), {
      canCreate: true,
      canReadManifest: false,
      canReadBundle: false,
    });
  }
});

test("project export UI helpers keep failed copy bounded", () => {
  const rawStoredError = "SQL stack trace with DATABASE_URL and source_id must not leak";
  const failedPackage = {
    status: "failed",
    errorMessage: rawStoredError,
  };
  const copy = projectExportCopy(failedPackage);

  assert.equal(projectExportTone("failed"), "danger");
  assert.match(copy.body, /did not complete/);
  assert.match(copy.nextAction, /fresh manifest/);
  assert.equal(`${copy.body} ${copy.nextAction}`.includes(rawStoredError), false);
});

test("project export UI helpers summarize package state and Project manifest contents", () => {
  assert.deepEqual(
    projectExportSummary([
      { status: "completed" },
      { status: "failed" },
      { status: "requested" },
      { status: "processing" },
      { status: "abandoned" },
    ]),
    {
      total: 5,
      completed: 1,
      failed: 1,
      inProgress: 2,
    },
  );

  assert.equal(
    projectExportSummaryLine({
      attachedDeveloperSpaces: 2,
      ownerProjectEvidenceRefs: 3,
      publicProjectEvidenceRefs: 1,
      documentBodies: "not-counted",
    }),
    "2 spaces / 3 owner refs / 1 public refs",
  );
  assert.equal(
    projectExportSectionLine(["project", "owner_project_evidence_refs", "public_project_evidence_refs"]),
    "project / owner project evidence refs / public project evidence refs",
  );
});
