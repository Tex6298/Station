import assert from "node:assert/strict";
import test from "node:test";
import {
  archiveSearchGroupCounts,
  archiveSearchModeLabel,
  archiveSearchPath,
  archiveSearchReadbackCopy,
  archiveSearchTypeParam,
  archiveSearchUsesBackend,
  globalArchiveTrustBoundaryRows,
} from "./archive-search";
import {
  ARCHIVE_FILE_IMPORT_ACCEPT,
  archiveFileImportErrorMessage,
  archiveFileImportSelection,
  archiveFileTypeReadback,
  archiveFileTrustCopy,
  archiveImportJobReadback,
  archiveImportSourceLabel,
  archiveJobStatusLabel,
  archiveJobTone,
  archiveJobTrustCopy,
  archiveSourceNarrative,
  archiveTrustStateRows,
  archiveTrustSummary,
  supportedImportFormatRows,
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
  assert.match(
    archiveSearchReadbackCopy({ filter: "All", query: "", sort: "date" }, 3).body,
    /persona Archive tabs/,
  );
});

test("global archive boundary rows separate archive, export, and storage surfaces", () => {
  const rows = globalArchiveTrustBoundaryRows();
  const rendered = JSON.stringify(rows);

  assert.deepEqual(rows.map((row) => row.id), [
    "global-archive",
    "persona-archive",
    "export-workspace",
    "storage-quota",
  ]);
  assert.equal(rows.find((row) => row.id === "global-archive")?.href, "#archive-search-input");
  assert.match(rendered, /owner-only material/);
  assert.match(rendered, /source intake/);
  assert.match(rendered, /portable bundle readback/);
  assert.match(rendered, /server-reported storage usage/);
  assert.match(rendered, /does not create public download URLs/);
  assert.doesNotMatch(rendered, /full original-file backup|global managed backup|creates public download/i);
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

test("supported import format rows name file parsers without implying live pulls", () => {
  const rows = supportedImportFormatRows();
  const labels = rows.map((row) => row.label);
  const rendered = JSON.stringify(rows);

  assert.deepEqual(labels, [
    "Pasted source material",
    "Text and Markdown files",
    "ChatGPT JSON export",
    "Claude JSON export",
    "Reddit JSON archive",
    "Discord JSON archive",
    "Legacy role/content JSON",
  ]);
  assert.match(rendered, /pending for owner review/);
  assert.match(rendered, /Unknown JSON fails safely/);
  assert.match(rendered, /not Reddit OAuth or live subreddit pulling/);
  assert.match(rendered, /not a Discord bot/);
  assert.doesNotMatch(rendered, /connect your|bot token|pulls automatically/i);
});

test("archive file import helpers bound file selection and sanitize errors", () => {
  assert.equal(ARCHIVE_FILE_IMPORT_ACCEPT, ".txt,.text,.md,.markdown,.json");

  assert.deepEqual(archiveFileImportSelection({ name: "notes.md", size: 42 }), {
    ok: true,
    extension: "md",
  });
  assert.equal(archiveFileImportSelection({ name: "archive.pdf", size: 42 }).ok, false);
  const emptyFile = archiveFileImportSelection({ name: "empty.txt", size: 0 });
  assert.equal(emptyFile.ok, false);
  assert.match(emptyFile.message, /Existing archive material remains safe/);

  assert.equal(archiveFileTypeReadback("text/markdown"), "text/markdown");
  assert.equal(archiveFileTypeReadback(null), "Private archive file");
  assert.equal(
    archiveFileTypeReadback("11111111-1111-4111-8111-111111111111/33333333-3333-4333-8333-333333333333/source.txt"),
    "Private archive file",
  );

  assert.equal(
    archiveFileImportErrorMessage(new Error("storage_path=https://example.invalid/private token=abc123")),
    "File import failed. Existing archive material remains safe.",
  );
  assert.equal(
    archiveFileImportErrorMessage(new Error("storagePath=11111111-1111-4111-8111-111111111111/private/source.txt")),
    "File import failed. Existing archive material remains safe.",
  );
  assert.equal(
    archiveFileImportErrorMessage(new Error("uploadUrl=signed-upload-value")),
    "File import failed. Existing archive material remains safe.",
  );
  assert.equal(
    archiveFileImportErrorMessage(new Error("Storage quota exceeded")),
    "Storage quota exceeded. Existing archive material remains safe.",
  );
  assert.doesNotMatch(
    archiveFileImportErrorMessage(new Error("Upload failed for https://example.invalid/signed-url token=fixture")),
    /https?:|fixture|token=/i,
  );
});

test("archive import source labels and readback keep generic names owner-safe", () => {
  assert.equal(archiveImportSourceLabel("", "file"), "Uploaded file");
  assert.equal(archiveImportSourceLabel("   ", "chat"), "Pasted source");
  assert.equal(archiveImportSourceLabel("pasted-archive", "chat"), "Pasted source");
  assert.equal(archiveImportSourceLabel("project-notes.md", "file"), "project-notes.md");

  const failedChat = archiveImportJobReadback({
    kind: "chat",
    status: "failed",
    source_name: "pasted-chat",
    error_message: "Parser refused the source.",
  });
  assert.equal(failedChat.sourceLabel, "Pasted chat");
  assert.equal(failedChat.kindLabel, "Pasted import");
  assert.equal(failedChat.formatLabel, "Pasted text/chat");
  assert.match(failedChat.body, /Parser refused/);
  assert.match(failedChat.boundary, /owner supplies source content again/);

  const completedDiscord = archiveImportJobReadback({
    kind: "file",
    status: "completed",
    source_name: "discord.json",
  });
  assert.equal(completedDiscord.sourceLabel, "discord.json");
  assert.equal(completedDiscord.formatLabel, "Discord JSON");
  assert.match(completedDiscord.boundary, /owner-only archive material/);
  assert.match(completedDiscord.boundary, /explicit review/);
});
