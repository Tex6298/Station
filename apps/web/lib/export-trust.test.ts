import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  exportBackupSurfaceStateLabel,
  exportBackupTrustSummary,
  exportBackupTrustSurfaces,
  exportPackageFormatLabel,
  exportPackageSectionLine,
  exportPackageStatusLabel,
  exportPackageSummaryLine,
  exportPackageTone,
  exportPackageTrustCopy,
  exportPackageTrustSummary,
  workspaceExportScopeReadback,
} from "./export-trust";

test("export backup trust map names live scoped packages and deferred backups", () => {
  const surfaces = exportBackupTrustSurfaces();
  const livePackageKinds = surfaces
    .filter((surface) => surface.state === "live")
    .map((surface) => surface.packageKind)
    .sort();

  assert.deepEqual(livePackageKinds, [
    "developer_space_archive",
    "persona_archive",
    "project_manifest",
  ]);
  assert.deepEqual(exportBackupTrustSummary(surfaces), {
    total: 6,
    live: 3,
    preview: 1,
    future: 2,
  });
  assert.equal(exportBackupSurfaceStateLabel("live"), "Live scoped package");
  assert.equal(exportBackupSurfaceStateLabel("preview"), "Preview only");
  assert.equal(exportBackupSurfaceStateLabel("future"), "Future lane");
  assert.equal(
    surfaces.some((surface) => /global export job/i.test(surface.readback) && surface.state === "preview"),
    true,
  );
  assert.equal(
    surfaces.some((surface) => /not a managed backup/i.test(surface.readback) && surface.state === "future"),
    true,
  );
});

test("workspace export scope readback names only accepted live package classes", () => {
  const readback = workspaceExportScopeReadback();

  assert.deepEqual(
    readback.livePackageClasses.map((row) => row.packageKind).sort(),
    ["developer_space_archive", "persona_archive", "project_manifest"],
  );
  assert.equal(readback.currentBundleFormat, "Owner-only JSON/Markdown manifests and portable bundle readback.");
  assert.equal(
    readback.livePackageClasses.every((row) => row.state === "live" && row.format === "JSON / Markdown"),
    true,
  );
  assert.equal(
    readback.livePackageClasses.every((row) => row.includedSections.length > 0),
    true,
  );
});

test("workspace export scope readback keeps future workspace export classes unavailable", () => {
  const readback = workspaceExportScopeReadback();
  const futureLabels = readback.futureUnavailable.map((row) => row.label).join(" / ");
  const renderedFuture = JSON.stringify(readback.futureUnavailable);

  assert.match(futureLabels, /Full workspace bundle/);
  assert.match(futureLabels, /Original file packaging/);
  assert.match(futureLabels, /PDF, binary archive, and Station Press/);
  assert.match(futureLabels, /Managed backup, redundancy, and restore drills/);
  assert.match(futureLabels, /Shareable\/private package URLs/);
  assert.equal(readback.futureUnavailable.every((row) => row.state === "future"), true);
  assert.match(renderedFuture, /No current route creates a single cross-Studio package/);
  assert.match(renderedFuture, /not a production backup system/);
  assert.doesNotMatch(renderedFuture, /ready now|available now|generated PDF output|print-ready package|redundant backup is active/i);
});

test("workspace export scope readback excludes private and infrastructure material", () => {
  const readback = workspaceExportScopeReadback();
  const rendered = JSON.stringify(readback);

  assert.deepEqual(
    readback.excludedMaterial.map((row) => row.id),
    ["raw-private-source-bodies", "storage-and-download-internals", "credential-provider-material"],
  );
  assert.match(rendered, /Private source bodies/);
  assert.match(rendered, /Storage paths/);
  assert.match(rendered, /Credentials/);
  assert.match(readback.boundary, /Readback only/);
  assert.doesNotMatch(rendered, /raw private source body:|archive snippet:|signed URL: https:\/\/|provider payload:|secret_[A-Za-z0-9]/i);
});

test("workspace export scope readback is wired into Studio export without API or mutation controls", () => {
  const source = readFileSync("apps/web/components/studio/export-workspace.tsx", "utf8");

  assert.match(source, /workspaceExportScopeReadback/);
  assert.match(source, /Workspace scope readback/);
  assert.doesNotMatch(source, /apiPost|apiPatch|apiGet|apiDelete|fetch\(|createExportPackage|loadBundle|loadManifest|<button|type="button"|onClick=/i);
});

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

test("export trust helpers keep Developer Space readback bounded", () => {
  const completed = exportPackageTrustCopy({ status: "completed" }, "developer_space");
  const failed = exportPackageTrustCopy({
    status: "failed",
    errorMessage: "database URL leaked into upstream error",
  }, "developer_space");

  assert.match(completed.body, /Developer Space manifest is complete/);
  assert.match(completed.nextAction, /JSON\/Markdown package/);
  assert.match(failed.body, /Developer Space export did not complete/);
  assert.doesNotMatch(failed.body, /database URL/);
  assert.equal(
    exportPackageSummaryLine({
      nodes: 2,
      events: 8,
      snapshots: 1,
      linkedPublicDocuments: 3,
      memory: 99,
    }, "developer_space"),
    "2 nodes / 8 events / 1 snapshots / 3 public docs",
  );
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
