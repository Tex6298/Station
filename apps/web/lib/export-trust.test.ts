import assert from "node:assert/strict";
import test from "node:test";
import {
  exportPackageFormatLabel,
  exportPackageSectionLine,
  exportPackageStatusLabel,
  exportPackageSummaryLine,
  exportPackageTone,
  exportPackageTrustCopy,
  exportPackageTrustSummary,
} from "./export-trust";

test("export trust helpers keep completed manifest readback explicit", () => {
  const copy = exportPackageTrustCopy({
    status: "completed",
    completedAt: "2026-06-07T01:00:00.000Z",
  });

  assert.equal(exportPackageTone("completed"), "good");
  assert.equal(exportPackageStatusLabel("completed"), "Completed");
  assert.equal(exportPackageFormatLabel("json_markdown"), "JSON / Markdown");
  assert.match(copy.body, /manifest is complete/);
  assert.match(copy.nextAction, /portable bundle readback/);
});

test("export trust helpers show failed exports without implying data loss", () => {
  const copy = exportPackageTrustCopy({
    status: "failed",
    errorMessage: "Nested comment source failed.",
  });

  assert.equal(exportPackageTone("failed"), "danger");
  assert.match(copy.body, /Nested comment source failed/);
  assert.match(copy.nextAction, /Private archive material remains safe/);
});

test("export trust helpers group package state and manifest content summary", () => {
  assert.deepEqual(
    exportPackageTrustSummary([
      { status: "completed" },
      { status: "failed" },
      { status: "requested" },
      { status: "processing" },
    ]),
    {
      total: 4,
      completed: 1,
      failed: 1,
      inProgress: 2,
    },
  );

  assert.equal(
    exportPackageSummaryLine({
      memory: 2,
      archiveFiles: 1,
      continuityRecords: 3,
      moderationReports: "not-counted",
    }),
    "2 memory / 1 files / 3 continuity",
  );
  assert.equal(exportPackageSectionLine(["persona", "published_documents"]), "persona / published documents");
});
