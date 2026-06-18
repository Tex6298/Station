import assert from "node:assert/strict";
import test from "node:test";
import {
  archiveSearchPath,
  archiveSearchTypeParam,
  archiveSearchUsesBackend,
} from "./archive-search";
import {
  archiveFileTrustCopy,
  archiveJobStatusLabel,
  archiveJobTone,
  archiveJobTrustCopy,
  archiveSourceNarrative,
  archiveTrustSummary,
} from "./archive-trust";

test("archive job status helpers keep failed imports explicit and safe", () => {
  const failed = archiveJobTrustCopy({
    status: "failed",
    error_message: "Injected memory insert failure.",
  });

  assert.equal(archiveJobTone("failed"), "danger");
  assert.equal(archiveJobStatusLabel("processing"), "Processing");
  assert.match(failed.body, /Injected memory insert failure/);
  assert.match(failed.nextAction, /Existing archive material remains safe/);
});

test("archive trust summary groups import and file state without inventing quota", () => {
  assert.deepEqual(
    archiveTrustSummary(
      [{ processed: true }, { processed: false }],
      [
        { status: "completed" },
        { status: "failed", error_message: "Nope." },
        { status: "processing" },
      ],
    ),
    {
      totalSources: 5,
      completedImports: 1,
      failedImports: 1,
      processingImports: 1,
      processedFiles: 1,
    },
  );

  assert.match(archiveFileTrustCopy({ processed: false }), /queued for processing/);
});

test("archive search controls build backend search routes", () => {
  assert.equal(
    archiveSearchUsesBackend({ filter: "All", query: "", sort: "date" }),
    false,
  );
  assert.equal(
    archiveSearchPath({ filter: "All", query: "", sort: "date" }),
    "/imports/archive",
  );

  assert.equal(archiveSearchTypeParam("Shared/global"), "global");
  assert.equal(archiveSearchTypeParam("Continuity"), "continuity");

  const path = archiveSearchPath({
    filter: "Continuity",
    query: " blue lantern ",
    sort: "title",
    limit: 25,
  });

  assert.equal(
    path,
    "/imports/archive/search?q=blue+lantern&type=continuity&sort=title&limit=25",
  );
});

test("archive source narrative explains import safety and visibility", () => {
  const copy = archiveSourceNarrative();

  assert.match(copy.sourceMaterial, /pasted text/);
  assert.match(copy.sourceMaterial, /archived chats/);
  assert.match(copy.processing, /Failed imports/);
  assert.match(copy.processing, /untouched/);
  assert.match(copy.visibility, /owner-only/);
  assert.doesNotMatch(`${copy.sourceMaterial} ${copy.processing} ${copy.visibility}`, /quota|public by default/i);
});
