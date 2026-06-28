# Production Import Job Error Response Hardening

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Date opened: 2026-06-28

Status: open - DAEDALUS

## Why This Lane

ARGUS accepted persona file route-level error response hardening in:

`docs/roadmap/PRODUCTION_PERSONA_FILE_ERROR_RESPONSE_REVIEW_RESULT.md`

Non-persona-file archive/import route-level raw errors remain future audit
surface. The next narrow slice is import job routes because they cover private
archive intake, retry, repair/status readback, and owner-scoped import job
listing.

Current direct raw-response patterns are in:

`apps/api/src/routes/imports.ts`

Observed examples:

- import job creation can return raw Supabase/service error text;
- import retry can preserve sanitized job failure metadata but still needs
  route response review;
- import job list can return raw Supabase/service error text;
- import intake failures sit near private archive source names and content
  snippets and must keep public route responses bounded.

## Task

Harden import job route error responses without changing archive/import
lifecycle behavior.

Required behavior:

- import job route failures must not expose raw Supabase/storage/provider error
  text, table names, SQL output, owner IDs, persona IDs, import job IDs, source
  names beyond existing successful owner readback, private import content,
  archive excerpts, storage paths, stack traces, URLs, tokens, cookies,
  provider payloads, or secret-shaped values;
- existing `sanitizeJobErrorMessage` job-failure metadata behavior must be
  preserved for stored job failure state;
- route responses should use stable public-safe copy and fixed error codes;
- successful import creation, retry, status/readback, quota/storage behavior,
  archive ingestion behavior, and integrity trigger behavior must not change;
- tests should prove hostile import-job service errors are not returned from
  public route responses.

Keep this lane to route responses. Do not change parser/import execution,
archive chunking, retrieval, embeddings, Redis, Cloudflare, workers, or queue
behavior.

## Scope

Allowed:

- response mapping in `apps/api/src/routes/imports.ts`;
- focused import/archive route tests;
- docs/status/baseline updates for the result.

Do not change:

- parser/import execution, archive chunking, retrieval, embeddings/vector
  behavior, storage quota math, schema, migrations, package manifests, Redis,
  Cloudflare, provider/model behavior, billing, auth/session semantics, UI,
  workers, queues, hosted config, or hosted data.

Do not attempt conversation archive or export routes in this PR. Record
remaining non-import route-level raw surfaces as future work if you see them.

## Validation

Minimum:

```bash
npm exec --yes pnpm@10.32.1 -- run test:conversation-archive
npm exec --yes pnpm@10.32.1 -- run test:storage
npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck
git diff --check
```

If job helper/status behavior is touched, also run:

```bash
npm exec --yes pnpm@10.32.1 -- run test:jobs
```

## Handoff

Wake ARGUS with:

```text
READY FOR ARGUS IMPORT JOB ERROR RESPONSE REVIEW
```

or wake MIMIR with:

```text
BLOCKED - NEEDS MIMIR DECISION
```

if safe public error copy cannot be preserved without changing import/archive
lifecycle behavior.
