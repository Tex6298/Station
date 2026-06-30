# PR484J-K - Archive Connector Import Execution Preflight Result

Owner: ARGUS / A3

Date: 2026-06-30

Status: Accepted for DAEDALUS

## Verdict

```text
ACCEPT_PR484J_K_ARCHIVE_CONNECTOR_IMPORT_EXECUTION
```

ARGUS accepts the smallest safe connector import execution lane.

The accepted lane may synchronously import exactly one owner-confirmed current
Reddit saved-items staged run into the existing private archive ingest path. It
may use existing `import_jobs` only after making that surface connector-aware
with a dedicated kind and staging-run pointer. It must not use the pasted-chat
route, the generic import parser, queues, workers, UI, hosted/runtime work,
provider calls, token work, or any broader Reddit/Discord source expansion.

## Accepted Boundary

DAEDALUS may add only:

- authenticated owner-only route:
  `POST /archive-connectors/source-staging-runs/:runId/import`;
- UUID path and strict empty-body validation before storage, decrypt, import,
  or archive write work;
- a migration and DB type update that extends `import_jobs` with:
  - `kind = 'archive_connector'`;
  - nullable `archive_connector_source_staging_run_id` referencing
    `archive_connector_source_staging_runs`;
  - a unique index for non-null staging-run pointers;
- a migration and DB type update that records successful staged-run consumption,
  for example `status = 'imported'` plus `imported_at`;
- one route/helper that loads exactly one owner Reddit saved-items staged run;
- first execution only when the run is current:
  `status = staged`, not expired, not revoked, and not superseded;
- linked import-intent recheck before decrypt:
  owner-scoped, activated, persona-valid, and matching Reddit saved-items
  source fields;
- dedicated PR484J-I staging envelope decrypt with
  `ARCHIVE_CONNECTOR_SOURCE_STAGING_ENCRYPTION_KEY`;
- decrypted payload validation for
  `station.archive_connector.source_staging_batch.v1`;
- connector-specific normalized text assembly from staged `normalizedText`
  values only;
- one `import_jobs` row with safe generic readback:
  `kind = 'archive_connector'`, `status = processing`, source name such as
  `Reddit saved items`, and the staging-run pointer;
- synchronous `ingestTextIntoArchive` only after the gates above pass;
- private archive chunk writes created by `ingestTextIntoArchive` with
  `archiveSource.type = 'import_job'`, the connector import job id, and the
  same safe generic source name;
- completion update of the connector import job and successful staged-run
  consumption metadata after archive rows exist;
- focused tests and static guards for the boundary below.

## Explicitly Forbidden

This lane must not add:

- `POST /imports/chat` reuse or any UI-driven pasted import path;
- `parseImportFile`, generic local import parsers, `createImportReviewCandidates`,
  or `persona_files`;
- connector job tables in addition to the accepted `import_jobs` extension;
- public documents, `canon_items`, `continuity_candidates`, publication,
  export, or social writes;
- source titles, URLs, authors, subreddit names, usernames, raw provider ids,
  cursors, item fingerprints, snapshot fingerprints, encrypted batch values,
  provider payloads/headers, tokens, SQL details, stack traces, or
  secret-shaped values in route responses, job labels, job errors, docs, logs,
  or UI-facing readbacks;
- provider calls, token decrypt/exchange/revoke, credential writes, source
  inventory calls, broad Reddit reads, additional Reddit history categories, or
  Discord channel/message/member reads;
- queues, workers, scheduled pulls, pagination crawls, recurring imports,
  hosted/runtime proof, packages, billing, Redis, Cloudflare, marketplace,
  partner adapters, or Stripe.

## Required Response Shape

Successful first execution should return `201` with a bounded JSON envelope:

- `status: "archive_connector_source_staging_import_completed"`;
- `provider: "reddit"`, `purpose: "archive_connector"`, and `ownerOnly: true`;
- `imported: true`;
- `duplicate: false`;
- `idempotent: false`;
- `runId`;
- a safe `job` object with id, kind, status, sourceName, createdAt, and
  updatedAt;
- `chunksCreated`;
- safe aggregate import metadata only, such as item counts, post/comment counts,
  skipped count, truncated, and page limit;
- safety booleans that truthfully mark the accepted private archive write and
  `import_jobs` write as enabled while provider calls, token work, queues,
  workers, UI, hosted/runtime, public writes, and candidate writes remain false.

Duplicate completed execution should return `200` with:

- `status: "archive_connector_source_staging_import_already_completed"`;
- `imported: true`;
- `duplicate: true`;
- `idempotent: true`;
- the same safe job and aggregate readback.

Existing processing execution should return `202` with:

- `status: "archive_connector_source_staging_import_processing"`;
- `imported: false`;
- `duplicate: true`;
- `pending: true`;
- the same safe job readback.

Failed-job retry may use the same route and same connector import job only when
the staged run is still current and no archive rows already exist for that job.

## Required Lifecycle And Idempotency

- Do not create a connector import job until auth, path/body validation,
  current-run gates, linked-intent/persona/source recheck, quota check,
  encryption config, decrypt, and batch validation have passed.
- The connector import job must be linked to the staging run by the accepted
  staging-run pointer, not by a private `source_name` convention.
- The staging-run pointer must be unique so racing duplicate clicks cannot
  create duplicate connector import jobs for one run.
- A completed linked job with archive rows is the idempotency source of truth.
- A queued or processing linked job returns the existing safe pending readback.
- A failed linked job may be retried only through the connector import route,
  not through `/imports/:id/retry`.
- If an ingest attempt fails before archive rows exist, mark the connector
  import job failed with a sanitized error and leave the staged run retryable
  until it expires or is superseded/revoked.
- If archive rows exist but completion metadata failed, duplicate execution must
  recover by counting rows for the linked job, marking the job completed when
  possible, and returning bounded idempotent readback.
- After successful import, mark the staged run consumed/imported so preview and
  first-execution paths no longer treat it as current.
- Do not delete or expose the encrypted batch in this lane.

## Required Failure Modes

| Case | Required behavior |
| --- | --- |
| Missing auth | `401`; no storage, decrypt, import, or archive write work. |
| Invalid run id or body | `400`; no storage, decrypt, import, or archive write work. |
| Missing or wrong-owner run | `404`; no decrypt, import job, or archive writes. |
| Revoked, superseded, expired, non-staged, or already consumed run without completed linked job | `409`; no decrypt or archive writes. |
| Completed linked job | `200`; safe idempotent readback, no decrypt or new archive writes required. |
| Queued/processing linked job | `202`; safe pending readback, no decrypt or new archive writes. |
| Failed linked job with expired/superseded/revoked run | `409`; no retry or archive writes. |
| Linked intent missing, non-owner, non-activated, stale persona, or source mismatch | bounded `404`/`409`; no import job or archive writes. |
| Quota unavailable | bounded `429`; no import job or archive writes. |
| Encryption missing/malformed or staged batch malformed/empty/mismatched | bounded `409`; no import job or archive writes. |
| Connector import job insert race | reload the existing linked job and return the correct safe duplicate state. |
| Archive ingest/storage/embedding failure before rows exist | mark job failed with sanitized error; leave staged run retryable; no private source readback. |
| Completion or staged-run imported update failure after rows exist | bounded `500`; duplicate execution must reconcile from existing rows. |
| Storage load/update failure | bounded `500`; no raw DB details, SQL, stack traces, or private source excerpts. |

## Required Tests

DAEDALUS should add focused tests proving:

- auth, UUID path, malformed JSON, array/primitive body, unknown keys, and
  secret-shaped body failures happen before storage, decrypt, import, or archive
  writes;
- missing and wrong-owner runs fail without decrypt, import job, or archive
  writes;
- revoked, superseded, expired, imported, and wrong-source runs fail safely;
- linked intent/persona/source recheck happens before decrypt and import job
  writes;
- quota failure happens before connector import job and archive writes;
- encryption and batch validity failures happen before connector import job and
  archive writes;
- first import creates exactly one connector `import_jobs` row, writes private
  archive chunks through `ingestTextIntoArchive`, marks the job completed, and
  marks the staged run imported;
- duplicate completed import returns the existing job and chunk count without
  decrypting or writing again;
- queued/processing linked jobs return `202` without decrypting or writing;
- failed linked jobs can retry through the connector route when the staged run
  is still current and no archive rows exist;
- failed ingest marks only the connector job failed, sanitizes error readback,
  and leaves the staged run retryable;
- partial-success reconciliation handles archive rows that exist before job/run
  completion metadata finishes;
- `/imports/:id/retry` rejects connector import jobs;
- responses, job labels, background-job readback, archive summary/search
  readback, and error messages do not leak private source text, source titles,
  URLs, authors, subreddit names, usernames, raw provider ids, cursors, item or
  snapshot fingerprints, encrypted batch values, tokens, SQL, stack traces, or
  secret-shaped values;
- static source guards prove no generic import parser, provider call, token
  work, credential write, queue, worker, UI, hosted/runtime, billing, Redis,
  Cloudflare, marketplace, partner adapter, social, public document, Canon, or
  Continuity drift.

Suggested validation command:

```bash
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/archive-connectors.test.ts
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/services/archive-connectors/credential-storage.test.ts apps/api/src/routes/archive-connectors.test.ts apps/api/src/routes/import-preview.test.ts apps/api/src/services/imports/parsers/import-parsers.test.ts apps/api/src/routes/background-jobs.test.ts apps/api/src/services/background-jobs.service.test.ts apps/api/src/routes/social.test.ts apps/web/lib/archive-connector-oauth-callback.test.ts apps/web/lib/social-publishing-readiness.test.ts apps/api/src/middleware/error-handler.test.ts
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

## ARGUS Preflight Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| Current import route review | Pass | `/imports/chat` is owner-scoped but semantically pasted-chat shaped; PR484J-K must not route staged connector imports through it. |
| Current `import_jobs` review | Pass | Existing `import_jobs` owns archive-extraction readback and can be used only with a connector-specific kind plus staging-run pointer; plain `kind = chat` is rejected. |
| Current archive ingest review | Pass | `ingestTextIntoArchive` can write private archive chunks without generic parser or review-candidate writes when called directly with connector-normalized text. |
| Current source-staging review | Pass | PR484J-I/J already provide owner/current run gates, dedicated decrypt, and batch validation to reuse before import execution. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/archive-connectors.test.ts` | Pass | 76 archive connector route tests passed. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/services/archive-connectors/credential-storage.test.ts apps/api/src/routes/archive-connectors.test.ts apps/api/src/routes/import-preview.test.ts apps/api/src/services/imports/parsers/import-parsers.test.ts apps/api/src/routes/background-jobs.test.ts apps/api/src/services/background-jobs.service.test.ts apps/api/src/routes/social.test.ts apps/web/lib/archive-connector-oauth-callback.test.ts apps/web/lib/social-publishing-readiness.test.ts apps/api/src/middleware/error-handler.test.ts` | Pass | 144 tests passed across connector storage/routes, import preview/parsers, background job readback/helpers, social fail-closed routes, web callback/readiness guards, and error handling. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck replayed from cache. |
| `git diff --check` | Pass | No whitespace errors. |

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARGUS accepted PR484J-K Archive Connector Import Execution as a narrow owner-only synchronous import lane.
- Do not reuse /imports/chat or kind=chat. Extend import_jobs with kind=archive_connector and a unique staging-run pointer, then call ingestTextIntoArchive directly with connector-normalized text from one current Reddit saved-items staged run.
- Responses and readbacks must use safe generic labels only; no private source text, titles, URLs, authors, usernames, raw provider ids, fingerprints, encrypted batch values, tokens, SQL details, stack traces, provider calls, queues/workers, UI, hosted/runtime, billing, Redis, Cloudflare, marketplace, partner adapters, social behavior, broad Reddit reads, or Discord content reads enter scope.
Task:
- Implement POST /archive-connectors/source-staging-runs/:runId/import with the lifecycle, idempotency, retry, redaction, failure-mode, migration/type, and static-guard tests in this preflight.
```
