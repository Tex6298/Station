# Production Import Job Error Response ARGUS Review Result

Owner: ARGUS / A3

Date: 2026-06-28

Verdict:

```text
ACCEPTED AFTER NARROW ARGUS PATCH
```

## Decision

- Import job quota-check, creation, archive-ingest execution, retry, and
  owner-scoped list failure paths now return stable public-safe responses with
  fixed error codes.
- ARGUS added a narrow retry-transition guard so a failure while marking a job
  `processing` returns `import_job_retry_failed` instead of falling through to
  generic error handling.
- Stored import-job failure metadata still uses the existing
  `sanitizeJobErrorMessage` path, so owner readback keeps sanitized failure
  context without returning that service text from failing route responses.
- Successful import creation, duplicate/idempotent import behavior, retry
  success and partial-row recovery, status/readback, quota/storage handling,
  archive ingestion, and integrity trigger behavior did not change.
- Scope stayed inside import job route response hardening, focused storage and
  conversation-archive tests, and roadmap/testing documentation. No parser,
  archive chunking, retrieval, embedding/vector, schema, migration, package,
  Redis, Cloudflare, provider/model, billing, auth/session, UI, worker, queue,
  hosted config, or hosted data changes were introduced.

## Evidence Boundary

- Reviewed `apps/api/src/routes/imports.ts`,
  `apps/api/src/routes/conversation-archive.test.ts`,
  `apps/api/src/routes/storage.test.ts`,
  `docs/roadmap/PRODUCTION_IMPORT_JOB_ERROR_RESPONSE_DAEDALUS.md`,
  `docs/roadmap/PRODUCTION_IMPORT_JOB_ERROR_RESPONSE_RESULT.md`,
  `docs/roadmap/ACTIVE_STATUS.md`, and
  `docs/testing/VALIDATION_BASELINE.md`.
- Confirmed quota and bounded storage responses still use the existing public
  response helpers.
- Confirmed stored job failure metadata continues through
  `sanitizeJobErrorMessage`, including owner status/readback paths.
- Confirmed retry success, completed-job idempotency, partial-row recovery, and
  import archive row behavior remain covered.

## Validation

- `npm exec --yes pnpm@10.32.1 -- run test:conversation-archive` passed, 42
  tests.
- `npm exec --yes pnpm@10.32.1 -- run test:storage` passed, 19 tests.
- `npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck` passed.
- `git diff 39739d14^ 39739d14 --check` passed.
- `git diff ceb498a7^ ceb498a7 --check` passed.
- `git diff 6c40b061^ 6c40b061 --check` passed.
- `git diff --cached --check` passed for ARGUS docs.
- Added-line sensitive scans were reviewed; hits were synthetic import-job
  fixtures, fake tokens/URLs, fixed public copy/codes, or evidence-category
  docs text only.
- `test:jobs` was not run because job helper/status behavior was not changed.

## Residual Risk

Conversation archive routes, export routes, and other non-import route-level
raw errors remain future audit surface.

## Handoff

MIMIR should close or route the next lane.
