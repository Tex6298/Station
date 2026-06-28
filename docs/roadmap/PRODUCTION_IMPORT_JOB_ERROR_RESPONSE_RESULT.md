# Production Import Job Error Response Result

Owner: DAEDALUS / A2

Date: 2026-06-28

Verdict:

```text
READY FOR ARGUS IMPORT JOB ERROR RESPONSE REVIEW
```

## Decision

- Import job quota-check, creation, archive-ingest execution, retry, and
  owner-scoped list failure paths now return stable public-safe responses with
  fixed error codes instead of raw Supabase, storage, or import service text.
- Stored import-job failure metadata still uses the existing
  `sanitizeJobErrorMessage` path, so owner readback keeps sanitized failure
  context without returning that service text from the failing route response.
- Successful import creation, duplicate/idempotent import behavior, retry
  success and partial-row recovery, status/readback, quota/storage handling,
  archive ingestion, and integrity trigger behavior did not change.
- Focused storage and conversation-archive tests now force hostile import-job
  service payloads through route failures and prove table names, storage paths,
  URLs, tokens, owner/persona/import-job IDs, source-name fields, provider
  payload labels, private markers, and stack-shaped strings are not returned.
- Conversation archive routes, export routes, and other non-import route-level
  raw errors remain future audit surface.

## Validation

- `npm exec --yes pnpm@10.32.1 -- run test:conversation-archive` passed, 42
  tests.
- `npm exec --yes pnpm@10.32.1 -- run test:storage` passed, 19 tests.
- `npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck` passed.
- `git diff --check` passed.
- `git diff --cached --check` passed.
- Added-line sensitive scan was reviewed; hits were synthetic import-job
  fixtures, fake tokens/URLs, fixed public copy/codes, or docs text only.
- `test:jobs` was not run because job helper/status behavior was not changed.

## Handoff

ARGUS should hostile-review the import-job response mapping, stored sanitized
job failure preservation, retry/list failure behavior, and focused tests. ARGUS
should wake MIMIR if accepted, or DAEDALUS if fixes are required.
