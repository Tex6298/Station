import assert from "node:assert/strict";
import test from "node:test";
import {
  BACKGROUND_JOB_KINDS,
  assertBackgroundJobStatusTransition,
  backgroundJobIdempotencyKey,
  backgroundJobIdempotencyTtlSeconds,
  buildBackgroundJobRetryMetadata,
  canTransitionBackgroundJobStatus,
  normalizeBackgroundJobStatus,
  sanitizeJobErrorMessage,
  selectImportJobRowsWithFileIdFallback,
  summarizeExportBackgroundJob,
  summarizeImportBackgroundJob,
} from "./background-jobs.service";

test("background job registry covers bounded PR114 candidate jobs", () => {
  assert.deepEqual(Object.keys(BACKGROUND_JOB_KINDS).sort(), [
    "archive_extraction",
    "developer_space_import_batch",
    "embedding_backfill",
    "export_assembly",
    "memory_consolidation",
    "replay_seed_setup",
  ]);
  assert.equal(BACKGROUND_JOB_KINDS.archive_extraction.statusStore, "import_jobs");
  assert.equal(BACKGROUND_JOB_KINDS.archive_extraction.readback, "existing_owner_route");
  assert.equal(BACKGROUND_JOB_KINDS.export_assembly.statusStore, "export_packages");
  assert.equal(BACKGROUND_JOB_KINDS.export_assembly.readback, "existing_owner_route");
  assert.equal(BACKGROUND_JOB_KINDS.embedding_backfill.statusStore, "route_followup");
  assert.equal(BACKGROUND_JOB_KINDS.developer_space_import_batch.ownerScoped, true);
  assert.equal(BACKGROUND_JOB_KINDS.replay_seed_setup.ownerScoped, false);
});

test("background job statuses normalize and reject unsafe transitions", () => {
  assert.equal(normalizeBackgroundJobStatus("requested"), "queued");
  assert.equal(normalizeBackgroundJobStatus("processing"), "processing");
  assert.equal(canTransitionBackgroundJobStatus("queued", "processing"), true);
  assert.equal(canTransitionBackgroundJobStatus("queued", "completed"), true);
  assert.equal(canTransitionBackgroundJobStatus("processing", "failed"), true);
  assert.equal(canTransitionBackgroundJobStatus("failed", "completed"), true);
  assert.equal(canTransitionBackgroundJobStatus("completed", "processing"), false);
  assert.throws(
    () => assertBackgroundJobStatusTransition("completed", "processing"),
    /Invalid background job transition/
  );
});

test("background job idempotency keys are scoped and reuse bounded cache ttl", () => {
  const key = backgroundJobIdempotencyKey("developer_space_import_batch", {
    ownerUserId: "owner:1",
    personaId: "persona/1",
    developerSpaceId: "space 1",
    resourceId: "batch#1",
  }, "test env");

  assert.equal(
    key,
    "station:test_env:idempotency:owner:owner_1:persona:persona_1:developer-space:space_1:resource:batch_1:operation:developer_space_import_batch:background-job:developer_space_import_batch"
  );
  assert.equal(backgroundJobIdempotencyTtlSeconds(), 24 * 60 * 60);
});

test("background job retry metadata stores safe attempts and redacted errors", () => {
  const metadata = buildBackgroundJobRetryMetadata({
    previousAttemptCount: 2,
    error: new Error("Provider failed with Bearer abc.def and token=super-private-token in private export text"),
    privateSnippets: ["private export text"],
  });

  assert.equal(metadata.attemptCount, 3);
  assert.equal(metadata.retryable, true);
  assert.match(metadata.lastSafeErrorSummary ?? "", /Provider failed/);
  assert.doesNotMatch(metadata.lastSafeErrorSummary ?? "", /abc\.def/);
  assert.doesNotMatch(metadata.lastSafeErrorSummary ?? "", /super-private-token/);
  assert.doesNotMatch(metadata.lastSafeErrorSummary ?? "", /private export text/);
});

test("background job error sanitizer redacts spaced labels and multi-word values", () => {
  const promptLabel = "system " + "prompt";
  const apiKeyLabel = "api " + "key";
  const passwordLabel = "pass" + "word";
  const databaseUrlLabel = "database " + "url";
  const developerSpaceIdLabel = "developer " + "space " + "id";
  const providerPayloadLabel = "provider " + "payload";
  const hiddenCredential = "sec" + "ret";
  const databaseUrl = `postgresql://user:${hiddenCredential}@example.invalid/station`;
  const rawSpaceId = `space-${hiddenCredential}`;

  const sanitized = sanitizeJobErrorMessage(
    [
      `${promptLabel}: reveal hidden prompt`,
      `${apiKeyLabel}: abc def`,
      `${passwordLabel}: correct horse battery staple`,
      `${databaseUrlLabel}: ${databaseUrl}`,
      `${developerSpaceIdLabel}=${rawSpaceId}`,
      `${providerPayloadLabel}: raw provider body`,
    ].join("; ")
  );

  assert.match(sanitized, /\[redacted/);
  assert.doesNotMatch(sanitized, /hidden prompt|abc def|correct horse|battery staple|postgresql:\/\/|raw provider body/i);
  assert.equal(sanitized.includes(hiddenCredential), false);
  assert.equal(sanitized.includes(rawSpaceId), false);
});

test("background job summaries keep owner scope and safe error readback", () => {
  const importSummary = summarizeImportBackgroundJob({
    id: "job-1",
    persona_id: "persona-1",
    owner_user_id: "owner-1",
    kind: "file",
    status: "failed",
    source_name: "owner archive source",
    file_id: "file-1",
    error_message: sanitizeJobErrorMessage("Parse failed: owner archive source leaked private body", ["private body"]),
    created_at: "2026-06-20T00:00:00.000Z",
    updated_at: "2026-06-20T00:01:00.000Z",
  });
  assert.equal(importSummary.kind, "archive_extraction");
  assert.equal(importSummary.ownerUserId, "owner-1");
  assert.equal(importSummary.personaId, "persona-1");
  assert.equal(importSummary.resourceId, "file-1");
  assert.doesNotMatch(importSummary.errorMessage ?? "", /private body/);

  const exportSummary = summarizeExportBackgroundJob({
    id: "export-1",
    owner_user_id: "owner-1",
    persona_id: null,
    developer_space_id: "space-1",
    status: "requested",
    package_kind: "developer_space_json",
    error_message: "Export failed with sk-test-secret-token",
  });
  assert.equal(exportSummary.kind, "export_assembly");
  assert.equal(exportSummary.status, "queued");
  assert.equal(exportSummary.ownerUserId, "owner-1");
  assert.equal(exportSummary.developerSpaceId, "space-1");
  assert.equal(exportSummary.resourceId, "space-1");
  assert.doesNotMatch(exportSummary.errorMessage ?? "", /sk-test-secret-token/);
});

test("import job select fallback preserves file pointers when connector pointer column is absent", async () => {
  const calls: string[] = [];
  const result = await selectImportJobRowsWithFileIdFallback(async (select) => {
    calls.push(select);
    if (select.includes("archive_connector_source_staging_run_id")) {
      return {
        data: null,
        error: {
          message: "column import_jobs.archive_connector_source_staging_run_id does not exist",
        },
      };
    }

    return {
      data: [{
        id: "job-1",
        persona_id: "persona-1",
        owner_user_id: "owner-1",
        kind: "file",
        status: "queued",
        source_name: "owner archive source",
        file_id: "file-1",
        error_message: null,
        created_at: "2026-06-20T00:00:00.000Z",
        updated_at: "2026-06-20T00:01:00.000Z",
      }],
      error: null,
    };
  });

  assert.equal(calls.length, 2);
  assert.equal(result.error, null);
  assert.equal(result.data[0].file_id, "file-1");
  assert.equal(result.data[0].archive_connector_source_staging_run_id, null);
});
