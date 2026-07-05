import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  archiveSearchGroupCounts,
  archiveSearchModeLabel,
  archiveSearchPath,
  archiveSearchReadbackCopy,
  archiveResultEvidenceHref,
  archiveResultProvenanceReadback,
  archiveSearchTypeParam,
  archiveSearchUsesBackend,
  globalArchiveIntakeCanSubmit,
  globalArchiveIntakeErrorMessage,
  globalArchiveIntakePayload,
  globalArchiveIntakeSuccessMessage,
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
  archiveTrustScopeRows,
  archiveTrustStateRows,
  archiveTrustSummary,
  documentMigratorHandoffReadback,
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

test("archive trust scope rows separate import sources, chats, storage, and continuity", () => {
  const rows = archiveTrustScopeRows(
    [{ processed: true }, { processed: false }],
    [
      { kind: "chat", status: "completed" },
      { kind: "file", status: "processing" },
    ],
    {
      archivedChatCount: 3,
      continuityRecordCount: 5,
    },
  );
  const rendered = JSON.stringify(rows);

  assert.deepEqual(rows.map((row) => [row.id, row.value, row.tone]), [
    ["import-sources", "3", "good"],
    ["archived-chats", "3", "good"],
    ["storage-content", "Usage panel", "info"],
    ["continuity-links", "Not broken out", "info"],
  ]);
  assert.match(rendered, /does not include archived conversations/);
  assert.match(rendered, /counted separately from pasted\/file import sources/);
  assert.match(rendered, /server-reported storage usage/);
  assert.match(rendered, /5 total Continuity records exist/);
  assert.match(rendered, /archive_file, archive_import, and archived_chat/);
  assert.doesNotMatch(rendered, /raw id|storage path|quota is 0|public/i);
});

test("archive trust scope rows do not fake unavailable counts", () => {
  const rows = archiveTrustScopeRows([], [], null);
  const archivedChatRow = rows.find((row) => row.id === "archived-chats");

  assert.deepEqual(rows.map((row) => [row.id, row.value, row.tone]), [
    ["import-sources", "0", "info"],
    ["archived-chats", "Not tracked here", "info"],
    ["storage-content", "Usage panel", "info"],
    ["continuity-links", "Not broken out", "info"],
  ]);
  assert.match(archivedChatRow?.body ?? "", /does not guess/);
  assert.match(archivedChatRow?.nextAction ?? "", /cannot show the archived-chat count/);
  assert.doesNotMatch(archivedChatRow?.nextAction ?? "", /zero/i);
  assert.match(rows.find((row) => row.id === "continuity-links")?.body ?? "", /does not guess/);
  assert.match(rows.find((row) => row.id === "import-sources")?.body ?? "", /Archived conversations are counted separately/);
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
    /Global Archive intake/,
  );
});

test("archive result provenance maps source classes and owner evidence labels", () => {
  const cases = [
    [{ type: "memory", source: "Memory", href: "/studio/personas/persona-1/memory" }, "Memory", "Open persona Memory"],
    [{ type: "canon", source: "Canon", href: "/studio/personas/persona-1/canon" }, "Canon", "Open persona Canon"],
    [{ type: "file", source: "persona_file", href: "/studio/personas/persona-1/files" }, "Persona file", "Open persona Archive files"],
    [{ type: "import", source: "archive_import", href: "/studio/personas/persona-1/files" }, "Import job", "Open persona Archive files"],
    [{ kind: "archived_chat", type: "conversation", source: "Archived chat", href: "/studio/personas/persona-1" }, "Archived chat", "Open persona workspace"],
    [{ type: "continuity", source: "Continuity", href: "/studio/personas/persona-1/timeline" }, "Continuity", "Open continuity timeline"],
    [{ type: "integrity", source: "Integrity Session", href: "/studio/personas/persona-1/calibration" }, "Integrity", "Open Integrity"],
    [{ type: "document", source: "Document", href: "/studio/publishing" }, "Document", "Open publishing"],
    [{ type: "archive", source: "Archive", href: "/studio/archive" }, "Archive", "Open Global Archive"],
    [{ type: "mystery", source: "", href: "/studio" }, "Unknown archive source", "Open owner Studio"],
  ] as const;

  for (const [item, sourceClassLabel, evidenceLabel] of cases) {
    const readback = archiveResultProvenanceReadback({
      ...item,
      status: "indexed",
      privacy: "owner_only",
      persona: item.source === "" ? "" : "Harbor",
      match: { field: "summary", reason: "Matched sanitized summary." },
    });

    assert.equal(readback.sourceClassLabel, sourceClassLabel);
    assert.equal(readback.evidenceLabel, evidenceLabel);
    assert.equal(readback.visibilityLabel, "Owner-only private");
    assert.match(readback.statusLabel, /indexed/);
    assert.match(readback.matchLabel, /Matched sanitized summary/);
  }

  assert.equal(
    archiveResultProvenanceReadback({
      type: "memory",
      source: "Memory",
      status: "indexed",
      privacy: "owner_only",
      persona: "",
      href: "/studio/archive",
    }).personaLabel,
    "Shared/global",
  );
});

test("archive result provenance redacts raw private and secret-shaped fields", () => {
  const readback = archiveResultProvenanceReadback({
    kind: "memory",
    type: "memory",
    source: "https://example.invalid/private token=abc123",
    sourceLabel: "memory 11111111-1111-4111-8111-111111111111",
    persona: "22222222-2222-4222-8222-222222222222",
    personaId: "33333333-3333-4333-8333-333333333333",
    status: "storage_path=/private/source signed_url=https://example.invalid/upload",
    visibility: "private",
    privacy: "owner_only",
    href: "/discover/private-result",
    match: {
      field: "summary",
      reason: "Bearer abc.def token=abc123 https://example.invalid/private source body should not render",
    },
  });
  const rendered = JSON.stringify(readback);

  assert.equal(readback.evidenceLabel, "Owner evidence route unavailable");
  assert.equal(archiveResultEvidenceHref({ href: "/discover/private-result" }), null);
  assert.equal(archiveResultEvidenceHref({ href: "/studio/../discover/private-result" }), null);
  assert.equal(archiveResultEvidenceHref({ href: "//example.invalid/studio" }), null);
  assert.equal(archiveResultEvidenceHref({ href: "/space/private-result" }), null);
  assert.equal(archiveResultEvidenceHref({ href: "/studio/personas/persona-1/timeline" }), "/studio/personas/persona-1/continuity");
  assert.equal(archiveResultEvidenceHref({ href: "/studio/personas/persona-1/files" }), "/studio/personas/persona-1/files");
  assert.doesNotMatch(rendered, /example\.invalid|abc123|11111111|22222222|33333333|storage_path|signed_url|Bearer abc\.def|source body/i);
  assert.doesNotMatch(rendered, /Discover|public search|published/i);
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
  assert.equal(rows.find((row) => row.id === "global-archive")?.href, "#global-archive-source-intake");
  assert.match(rendered, /owner-only material/);
  assert.match(rendered, /source intake/);
  assert.match(rendered, /without publishing the source/);
  assert.match(rendered, /portable bundle readback/);
  assert.match(rendered, /server-reported storage usage/);
  assert.match(rendered, /does not create public download URLs/);
  assert.doesNotMatch(rendered, /full original-file backup|global managed backup|creates public download/i);
});

test("global archive intake helpers keep payloads narrow and failure copy private", () => {
  const payload = globalArchiveIntakePayload({
    personaId: "11111111-1111-4111-8111-111111111111",
    sourceName: "  Field notes  ",
    content: "private pasted source body with token=abc123",
    relevanceWeight: 1.75,
  });

  assert.deepEqual(payload, {
    personaId: "11111111-1111-4111-8111-111111111111",
    sourceName: "Field notes",
    content: "private pasted source body with token=abc123",
    relevanceWeight: 1.75,
  });
  assert.equal(globalArchiveIntakePayload({ ...payload, sourceName: " " }).sourceName, "pasted-archive");
  assert.equal(globalArchiveIntakeCanSubmit(payload), true);
  assert.equal(globalArchiveIntakeCanSubmit({ ...payload, content: "   " }), false);
  assert.equal(globalArchiveIntakeCanSubmit(payload, true), false);

  const privateTextError = new Error("private pasted source body with token=abc123");
  const quotaError = new Error("Storage quota exceeded for token=abc123 private pasted source body");
  const personaError = new Error("Persona not found.");
  assert.doesNotMatch(globalArchiveIntakeErrorMessage(privateTextError), /private pasted source|token=abc123/i);
  assert.match(globalArchiveIntakeErrorMessage(quotaError), /storage or import quota/i);
  assert.doesNotMatch(globalArchiveIntakeErrorMessage(quotaError), /token=abc123|private pasted source/i);
  assert.match(globalArchiveIntakeErrorMessage(personaError), /owned personas/);
  assert.match(
    globalArchiveIntakeSuccessMessage("Field notes", "Harbor"),
    /private archive material for Harbor/,
  );
  const successNotice = globalArchiveIntakeSuccessMessage(
    "https://example.invalid/export token=abc123 sk-test-secret-token 11111111-1111-4111-8111-111111111111",
    "Harbor Bearer abc.def",
  );
  assert.match(successNotice, /\[redacted-url\]/);
  assert.match(successNotice, /token=\[redacted\]/);
  assert.match(successNotice, /\[redacted-secret\]/);
  assert.match(successNotice, /bearer \[redacted\]/i);
  assert.doesNotMatch(successNotice, /example\.invalid|abc123|sk-test-secret-token|11111111|abc\.def/);
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
  assert.match(rendered, /Previews?/);
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

test("document migrator handoff summarizes archive state without private readback", () => {
  const readback = documentMigratorHandoffReadback(
    [{ processed: true }, { processed: false }],
    [
      {
        kind: "chat",
        status: "completed",
        source_name: "private-source-body token=abc123 11111111-1111-4111-8111-111111111111",
      },
      {
        kind: "file",
        status: "failed",
        source_name: "signed-upload-url=https://example.invalid/private.json",
        error_message: "storage_path=/private/source token=abc123",
      },
      {
        kind: "chat",
        status: "processing",
        source_name: "discord-secret-export.json",
      },
    ],
    [
      { status: "pending", candidateType: "memory" },
      { status: "accepted", candidateType: "canon" },
    ],
  );
  const rendered = JSON.stringify(readback);

  assert.equal(readback.title, "Document Migrator handoff");
  assert.deepEqual(readback.rows.map((row) => [row.id, row.value, row.tone]), [
    ["source-paths", "4 present", "good"],
    ["import-state", "1 failed", "danger"],
    ["review-candidates", "1 pending", "warning"],
    ["deferred-connectors", "Not active", "info"],
  ]);
  assert.match(rendered, /explicit owner decisions/);
  assert.match(rendered, /Memory\/Canon/);
  assert.match(rendered, /Live Reddit, Discord, OAuth/);
  assert.match(rendered, /remain deferred/);
  assert.doesNotMatch(rendered, /private-source-body|abc123|11111111|signed-upload-url|example\.invalid|storage_path|discord-secret-export/i);
});

test("document migrator handoff keeps empty source and deferred connector copy honest", () => {
  const readback = documentMigratorHandoffReadback([], [], []);
  const rendered = JSON.stringify(readback);
  const sourceRow = readback.rows.find((row) => row.id === "source-paths");
  const importRow = readback.rows.find((row) => row.id === "import-state");
  const connectorRow = readback.rows.find((row) => row.id === "deferred-connectors");

  assert.equal(sourceRow?.value, "Preview first");
  assert.equal(sourceRow?.target, "document-migrator-paste-source");
  assert.match(sourceRow?.body ?? "", /Preview happens before/);
  assert.match(sourceRow?.body ?? "", /storage upload, import job, archive chunk, Memory, or Canon write/);
  assert.equal(importRow?.target, "document-migrator-file-import");
  assert.match(connectorRow?.body ?? "", /not activated/);
  assert.doesNotMatch(rendered, /connect your|bot token|recurring sync is active|automatic import is active|automatic Memory promotion|automatic Canon promotion/i);
});

test("document migrator handoff page uses real anchors and preserves route boundaries", () => {
  const page = readFileSync("apps/web/app/studio/personas/[personaId]/files/page.tsx", "utf8");

  assert.match(page, /documentMigratorHandoffReadback\(files, jobs, importCandidates\)/);
  assert.match(page, /<DocumentMigratorHandoffPanel readback=\{migratorHandoff\} personaId=\{persona\.id\} \/>/);
  assert.match(page, /id="document-migrator-paste-source"/);
  assert.match(page, /id="document-migrator-file-import"/);
  assert.match(page, /id="document-migrator-import-review"/);
  assert.match(page, /id="document-migrator-archive-library"/);
  assert.match(page, /href: "#document-migrator-paste-source"/);
  assert.match(page, /href: "#document-migrator-file-import"/);
  assert.match(page, /href: "#document-migrator-import-review"/);
  assert.match(page, /href: `\/studio\/personas\/\$\{personaId\}\/memory-inbox`/);
  assert.match(page, /href: "\/studio\/archive"/);
  assert.match(page, /href: "\/settings"/);
  assert.doesNotMatch(page, /source=all|\/conversations\/candidates\/inbox|connect your|bot token|recurring sync is active|automatic import is active|new Queue|Worker\(|cloudflare|redis|stripe|billing|provider payload|prompt context/i);
});

test("Global Archive component renders provenance without public search drift", () => {
  const component = readFileSync("apps/web/components/studio/archive-library.tsx", "utf8");

  assert.match(component, /ArchiveResultProvenance/);
  assert.match(component, /archiveResultProvenanceReadback\(item\)/);
  assert.match(component, /archiveResultEvidenceHref\(item\)/);
  assert.match(component, /ownerVisibleText\(item\.sourceLabel \?\? item\.source/);
  assert.match(component, /aria-label="Archive result provenance"/);
  assert.doesNotMatch(component, /Open source/);
  assert.doesNotMatch(component, /\/discover|public search|source_inventory|archive-connectors|OAuth token|bot token|recurring sync|automatic import|new Queue|Worker\(|cloudflare|redis|stripe|billing|provider payload|prompt context/i);
});
