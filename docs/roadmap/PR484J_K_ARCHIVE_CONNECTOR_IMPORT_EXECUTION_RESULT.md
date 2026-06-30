# PR484J-K - Archive Connector Import Execution Result

Owner: DAEDALUS / A2

Date: 2026-06-30

Status: Ready for ARGUS review

## Result

```text
READY_FOR_ARGUS_REVIEW
```

DAEDALUS implemented the accepted PR484J-K boundary: one authenticated
owner-only synchronous import execution route for exactly one current Reddit
saved-items source staging run.

This is not a generic import lane. It does not use `/imports/chat`, generic
file/paste import parsers, `persona_files`, review candidates, public
documents, Canon, Continuity, provider calls, token work, queues, workers, UI,
hosted/runtime, billing, Redis, Cloudflare, marketplace, partner adapter, social
behavior, broad Reddit reads, or Discord content reads.

## Implemented

- Added authenticated route:
  `POST /archive-connectors/source-staging-runs/:runId/import`.
- Validates UUID path and strict empty body before storage, decrypt, or import
  work.
- Loads exactly one owner-scoped current Reddit saved-items staged run and
  rechecks the linked activated import intent/persona/source before decrypt.
- Reuses the dedicated PR484J-I source staging decrypt path and staged batch
  validator.
- Extends `public.import_jobs` with `kind = 'archive_connector'` and a unique
  `archive_connector_source_staging_run_id` pointer.
- Calls `ingestTextIntoArchive` directly with connector-normalized staged
  `normalizedText` values and safe source label `Reddit saved items`.
- Writes private archive chunks with
  `archiveSource.type = 'import_job'` and the connector import job id.
- Marks connector import jobs completed/failed with generic bounded errors.
- Marks source staging runs `imported` with `imported_at` after successful
  archive chunk creation.
- Keeps completed connector imports idempotent, reports queued/processing jobs
  as pending, and retries failed connector jobs only through the connector
  import route.
- Rejects generic `/imports/:id/retry` for connector jobs.
- Redacts connector chunk summaries from owner archive list/search readback so
  private source text is not echoed.

## Readback

Successful import returns:

- `201` with
  `status: archive_connector_source_staging_import_completed` for a first
  completed import;
- `200` with
  `status: archive_connector_source_staging_import_already_completed` for an
  idempotent completed import;
- `202` with
  `status: archive_connector_source_staging_import_processing` for an existing
  queued/processing connector import job.

Success bodies include only safe connector metadata:

- `provider: reddit`;
- `purpose: archive_connector`;
- `ownerOnly: true`;
- staged run id;
- safe job id/kind/status/source name/timestamps;
- aggregate import metadata: format, source family/kind, page limit, item
  counts, skipped count, and truncation flag;
- chunk count;
- explicit safety booleans.

## Still Forbidden

- private source snippets, normalized title/text/body readback, item
  fingerprints, source snapshot fingerprints, encrypted batch values, raw
  provider ids, Reddit fullnames, usernames, URLs, authors, subreddit names,
  cursors, provider payloads, provider headers, tokens, refresh tokens,
  encrypted credentials, storage paths, SQL details, stack traces,
  secret-shaped values, owner ids, or environment values in API readback;
- `/imports/chat` or `kind = 'chat'` for staged connector imports;
- generic file/paste import parsing for staged connector batches;
- durable candidate records, connector-specific job tables, `persona_files`,
  Canon, Continuity, public documents, review candidates, queues, workers, UI,
  hosted/runtime, packages, billing, Redis, Cloudflare, marketplace, partner
  adapters, social behavior, broad Reddit reads, or Discord content reads.

## Tests

Focused coverage was added in `apps/api/src/routes/archive-connectors.test.ts`
for:

- unauthenticated, invalid UUID, invalid body, and secret-shaped body fail-fast
  behavior;
- missing, wrong-owner, already-imported-without-job, stale intent, quota,
  encryption, and invalid/empty batch gates before connector import writes;
- first import creating one connector import job, private archive chunk, and
  lifecycle row, then marking the staging run imported;
- idempotent completed imports, pending processing imports, and failed job
  retry through the connector route;
- `/imports/:id/retry` rejecting connector jobs;
- failed archive ingest marking the job failed with a generic error and leaving
  the staged run retryable;
- owner archive list/search returning redacted connector summaries;
- static no-drift coverage keeping execution out of generic parsers, providers,
  queues, workers, UI, hosted/runtime, billing, Redis, Cloudflare, marketplace,
  partner adapters, and social surfaces.

## Validation

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/archive-connectors.test.ts` | Pass | 82 archive connector route tests passed. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/services/archive-connectors/credential-storage.test.ts apps/api/src/routes/archive-connectors.test.ts apps/api/src/routes/import-preview.test.ts apps/api/src/services/imports/parsers/import-parsers.test.ts apps/api/src/routes/background-jobs.test.ts apps/api/src/services/background-jobs.service.test.ts apps/api/src/routes/social.test.ts apps/web/lib/archive-connector-oauth-callback.test.ts apps/web/lib/social-publishing-readiness.test.ts apps/api/src/middleware/error-handler.test.ts` | Pass | 150 tests passed across connector storage/routes, import preview/parsers, background job readback/helpers, social fail-closed routes, web callback/readiness guards, and error handling. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck completed. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass | Next lint completed with no lint warnings or errors. |
| `git diff --check` | Pass | No whitespace errors; CRLF normalization warnings only. |
| `npm exec --yes pnpm@10.32.1 -- run build` | Environment failure | Eight of nine tasks completed. `@station/web#build` compiled and generated static pages, then failed during Next standalone traced-file copy on local Windows symlink creation with `EPERM: operation not permitted, symlink` for traced `react`, `next`, and `@next/env` package paths under `.next/standalone`. The build also emitted the existing Autoprefixer mixed-support warning for `end` alignment. No PR484J-K compile/type errors surfaced before the standalone symlink failure. |

## Wakeup

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS implemented PR484J-K as one owner-only synchronous source staging import execution lane.
- Connector imports now use import_jobs kind archive_connector with a unique staged-run pointer, direct ingestTextIntoArchive, idempotency/pending/failed retry handling, staged-run imported lifecycle, and safe owner readback.
- The route does not use /imports/chat, generic parsers, provider calls, queues/workers, UI, hosted/runtime behavior, billing, Redis, Cloudflare, marketplace, partner adapters, social behavior, broad Reddit reads, or Discord content reads.
Validation:
- Archive connector route suite: 82 pass.
- Accepted archive/social/background/import/error suite: 150 pass.
- Typecheck: pass.
- Lint: pass.
- Diff check: pass.
- Build: local Windows Next standalone symlink EPERM after compile/static generation; documented in validation.
Risk:
- Review owner scoping, staging-run lifecycle, import_jobs uniqueness/idempotency, failed ingest retry behavior, private text redaction, and static no-drift guards.
Task:
- Review PR484J-K and wake MIMIR with `WAKEUP A1:` if accepted, or wake DAEDALUS with `WAKEUP A2:` if fixes are needed.
```
