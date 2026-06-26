import assert from "node:assert/strict";
import test from "node:test";
import {
  archiveSearchGroupCounts,
  archiveSearchModeLabel,
  archiveSearchPath,
  archiveSearchReadbackCopy,
  archiveSearchTypeParam,
  archiveSearchUsesBackend,
} from "./archive-search";
import {
  archiveFileTrustCopy,
  archiveJobStatusLabel,
  archiveJobTone,
  archiveJobTrustCopy,
  archiveSourceNarrative,
  archiveTrustStateRows,
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
        { kind: "chat", status: "completed" },
        { kind: "chat", status: "failed", error_message: "Nope." },
        { kind: "file", status: "processing" },
      ],
    ),
    {
      totalSources: 4,
      completedImports: 1,
      failedImports: 1,
      processingImports: 1,
      processedFiles: 1,
    },
  );

  assert.match(archiveFileTrustCopy({ processed: false }), /queued for processing/);
});

test("archive trust state rows make empty, ready, failed, and processing states explicit", () => {
  const rows = archiveTrustStateRows(
    [{ processed: true }, { processed: false }],
    [
      { kind: "chat", status: "completed" },
      { kind: "chat", status: "failed", error_message: "Parser refused empty source." },
      { kind: "file", status: "queued" },
      { kind: "file", status: "processing" },
    ],
  );

  assert.deepEqual(rows.map((row) => [row.id, row.value, row.tone]), [
    ["private-sources", "4", "good"],
    ["ready", "2", "good"],
    ["needs-review", "1", "danger"],
    ["processing", "2", "warning"],
  ]);
  assert.match(rows.find((row) => row.id === "needs-review")?.body ?? "", /failed/i);
  assert.match(rows.find((row) => row.id === "needs-review")?.nextAction ?? "", /exact error/i);
  assert.match(rows.find((row) => row.id === "processing")?.nextAction ?? "", /Wait/);
});

test("archive trust state rows keep empty state honest without quota invention", () => {
  const rows = archiveTrustStateRows([], []);
  const rendered = JSON.stringify(rows);

  assert.deepEqual(rows.map((row) => [row.id, row.value, row.tone]), [
    ["private-sources", "0", "info"],
    ["ready", "0", "info"],
    ["needs-review", "0", "info"],
    ["processing", "0", "info"],
  ]);
  assert.match(rows[0]?.body ?? "", /No pasted or file archive sources/);
  assert.match(rows[0]?.body ?? "", /Archived chats can still appear/);
  assert.doesNotMatch(rendered, /limit|quota|gb|mb|percent|destroyed/i);
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

test("archive search readback groups owner-only results honestly", () => {
  const items = [
    { type: "memory", source: "Memory", persona: "Harbor", status: "indexed" },
    { type: "memory", source: "Memory", persona: "Harbor", status: "indexed" },
    { type: "import", source: "Chat import", persona: "Shared/global", status: "failed" },
    { type: "document", source: "", persona: "", status: "" },
  ];

  assert.equal(
    archiveSearchModeLabel({ filter: "All", query: "", sort: "date" }),
    "Archive overview",
  );
  assert.equal(
    archiveSearchModeLabel({ filter: "Memory", query: "", sort: "date" }),
    "Live private search",
  );
  assert.deepEqual(archiveSearchGroupCounts(items, "type"), [
    { label: "memory", count: 2 },
    { label: "document", count: 1 },
    { label: "import", count: 1 },
  ]);
  assert.deepEqual(archiveSearchGroupCounts(items, "persona"), [
    { label: "Harbor", count: 2 },
    { label: "Shared/global", count: 2 },
  ]);
  assert.match(
    archiveSearchReadbackCopy({ filter: "All", query: "lantern", sort: "date" }, 3).body,
    /owner-scoped archive sources/,
  );
  assert.match(
    archiveSearchReadbackCopy({ filter: "All", query: "lantern", sort: "date" }, 0).body,
    /Existing material remains private/,
  );
  assert.match(
    archiveSearchReadbackCopy({ filter: "All", query: "lantern", sort: "date" }, 3, 2).body,
    /2 archive sources could not be searched/,
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
