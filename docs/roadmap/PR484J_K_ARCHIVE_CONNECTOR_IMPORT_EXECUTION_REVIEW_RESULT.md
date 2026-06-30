# PR484J-K - Archive Connector Import Execution Review Result

Owner: ARGUS / A3

Date: 2026-06-30

Status: Accepted for MIMIR after ARGUS patch

## Verdict

```text
ACCEPT_PR484J_K_ARCHIVE_CONNECTOR_IMPORT_EXECUTION
```

ARGUS accepts the PR484J-K implementation after one narrow compatibility patch.

The accepted lane is one authenticated owner-only synchronous import execution
route for exactly one current Reddit saved-items staged run. Connector imports
use `import_jobs.kind = 'archive_connector'`, a unique staged-run pointer,
direct `ingestTextIntoArchive`, safe generic owner readback, idempotent
completed handling, pending handling, failed-job retry through the connector
route only, and staged-run imported lifecycle.

## ARGUS Patch

ARGUS patched the shared import-job select fallback:

- when `archive_connector_source_staging_run_id` is absent on a partially
  migrated database, the fallback now retries a select that still includes
  existing `file_id`;
- only databases missing `file_id` fall back to the legacy select without file
  pointers;
- added regression coverage proving existing file import pointers are preserved
  when only the new connector pointer column is absent.

## Accepted Boundary

Accepted implementation:

- authenticated route:
  `POST /archive-connectors/source-staging-runs/:runId/import`;
- strict UUID path and empty-body validation before storage/decrypt/import work;
- current owner Reddit saved-items staged-run gate for first execution and
  failed retry;
- linked activated import-intent, persona, and source-field recheck before
  decrypt and archive writes;
- dedicated PR484J-I staging envelope decrypt and staged batch validation;
- connector-specific text assembly from staged `normalizedText` values only;
- `public.import_jobs` migration/type support for `kind = 'archive_connector'`
  and a unique `archive_connector_source_staging_run_id` pointer;
- staged-run `status = imported` plus `imported_at` after successful private
  archive chunk creation;
- direct synchronous `ingestTextIntoArchive` with safe source label
  `Reddit saved items`;
- private archive chunks written with `archiveSource.type = 'import_job'`;
- generic failed-job error storage and route readback;
- `/imports/:id/retry` rejects connector jobs;
- owner archive list/search redacts connector chunk summaries.

## Review Checks

ARGUS reviewed the DAEDALUS handoff, implementation diff, new
source-staging-import helper, route failure mapping, migration, DB types,
shared import-job readback fallback, owner archive list/search redaction,
focused tests, static guards, and roadmap/testing docs.

Findings:

- `requireAuth` and `req.user.id` remain the owner boundary for the route and
  import-job lookup.
- Invalid UUIDs and non-empty/secret-shaped bodies fail before storage,
  decrypt, import job, or archive writes.
- First execution and failed retry require a current staged run and linked
  activated owner intent/persona/source match before decrypt.
- Existing completed linked jobs return idempotent safe readback without
  decrypting or writing again.
- Existing queued/processing linked jobs return pending safe readback without
  decrypting or writing again.
- Failed connector jobs retry only through the connector route; `/imports/:id/retry`
  remains chat-only.
- Job labels and owner readback use the safe generic label
  `Reddit saved items`.
- Connector chunk summaries are redacted in owner archive list/search readback;
  private chunk content remains owner-private archive material.
- No `/imports/chat`, `kind = 'chat'`, generic import parser,
  `persona_files`, review-candidate write, provider call, token work, queue,
  worker, UI, hosted/runtime, billing, Redis, Cloudflare, marketplace, partner
  adapter, social behavior, broad Reddit read, or Discord content read entered
  the lane.
- The ARGUS patch closes the only review gap found: partially migrated
  databases missing the new connector pointer column no longer lose existing
  file import `file_id` readback through the compatibility fallback.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/archive-connectors.test.ts` | Pass | 82 archive connector route tests passed. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/services/background-jobs.service.test.ts` | Pass | 7 background job service tests passed, including ARGUS-added connector-column fallback coverage. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/services/archive-connectors/credential-storage.test.ts apps/api/src/routes/archive-connectors.test.ts apps/api/src/routes/import-preview.test.ts apps/api/src/services/imports/parsers/import-parsers.test.ts apps/api/src/routes/background-jobs.test.ts apps/api/src/services/background-jobs.service.test.ts apps/api/src/routes/social.test.ts apps/web/lib/archive-connector-oauth-callback.test.ts apps/web/lib/social-publishing-readiness.test.ts apps/api/src/middleware/error-handler.test.ts` | Pass | 151 tests passed across connector storage/routes, import preview/parsers, background job readback/helpers, social fail-closed routes, web callback/readiness guards, and error handling. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck passed. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass | Next lint completed with no lint warnings or errors. |
| `git diff --check` | Pass | No whitespace errors; CRLF normalization warnings only. |
| `npm exec --yes pnpm@10.32.1 -- run build` | Environment failure | Eight of nine tasks completed. `@station/web#build` compiled, type/lint checked, collected page data, and generated static pages, then failed during Next standalone traced-file copy on local Windows symlink creation with `EPERM: operation not permitted, symlink` for traced `react`, `next`, and `@next/env` package paths under `.next/standalone`. No PR484J-K compile/type errors surfaced before the standalone symlink failure. |

## Residual Risk

This lane imports one bounded staged Reddit saved-items batch into owner-private
archive chunks. It does not add UI, hosted proof, queues, workers, recurring
imports, pagination crawls, additional Reddit history categories, Discord
content reads, public documents, Canon, Continuity, review candidates, billing,
Redis, Cloudflare, marketplace, partner adapters, or social behavior.

Hosted/runtime proof and the local Windows Next standalone symlink build issue
remain separate from this accepted backend lane.

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS accepted PR484J-K Archive Connector Import Execution after a narrow compatibility patch.
- The patch preserves existing import_jobs.file_id fallback behavior when only the new archive_connector_source_staging_run_id column is absent on a partially migrated database.
- The accepted implementation remains one owner-only synchronous connector import route for one current Reddit saved-items staged run, using import_jobs kind archive_connector, a unique staged-run pointer, direct ingestTextIntoArchive, safe generic readback, idempotency/pending/failed retry handling, and staged-run imported lifecycle.
- No /imports/chat reuse, generic parser, provider calls, token work, queues/workers, UI, hosted/runtime, billing, Redis, Cloudflare, marketplace, partner adapters, social behavior, broad Reddit reads, or Discord content reads entered scope.
Validation:
- npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/archive-connectors.test.ts: 82 pass.
- npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/services/background-jobs.service.test.ts: 7 pass.
- accepted archive/social/background/import/error suite: 151 pass.
- npm exec --yes pnpm@10.32.1 -- run typecheck: pass.
- npm exec --yes pnpm@10.32.1 -- run lint: pass.
- git diff --check: pass.
- npm exec --yes pnpm@10.32.1 -- run build: local Windows Next standalone symlink EPERM after compile/static generation; documented as environment caveat.
Task:
- Close PR484J-K or choose the next archive connector move.
```
