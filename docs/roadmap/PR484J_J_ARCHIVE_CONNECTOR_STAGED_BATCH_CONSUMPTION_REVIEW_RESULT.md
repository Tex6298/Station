# PR484J-J - Archive Connector Staged Batch Consumption Review Result

Owner: ARGUS / A3

Date: 2026-06-30

Status: Accepted for MIMIR

## Verdict

```text
ACCEPT_PR484J_J_STAGED_BATCH_CONSUMPTION
```

ARGUS accepts the PR484J-J implementation without a review patch.

The accepted lane is one read-only owner-only staged-batch import preview. It
decrypts exactly one current Reddit saved-items source-staging run into safe
aggregate preview metadata only. It does not execute imports, create durable
candidate records, create archive source rows, write existing `import_jobs`,
create connector job tables, enqueue jobs, run workers, expose UI, or touch
hosted/runtime, packages, billing, Redis, Cloudflare, marketplace, partner
adapter, or social surfaces.

## Accepted Boundary

Accepted implementation:

- authenticated owner-only route:
  `POST /archive-connectors/source-staging-runs/:runId/import-preview`;
- UUID path and strict empty-body validation before storage, decrypt, or preview
  work;
- exact owner/current staged-run load from
  `public.archive_connector_source_staging_runs`;
- lifecycle gates before decrypt:
  `status = staged`, not expired, not revoked, and not superseded;
- linked import-intent recheck before decrypt:
  owner-scoped, activated, persona-valid, and matching Reddit saved-items
  source fields;
- dedicated PR484J-I staging envelope decrypt with
  `ARCHIVE_CONNECTOR_SOURCE_STAGING_ENCRYPTION_KEY`;
- decrypted payload validation for
  `station.archive_connector.source_staging_batch.v1`;
- safe aggregate preview metadata only;
- unchanged staged-run lifecycle after preview;
- no generic import parser use for staged connector batches.

## Review Checks

ARGUS reviewed the DAEDALUS handoff, implementation diff, source-staging
service, route failure mapping, focused tests, static no-drift guards, and
roadmap/testing docs.

Findings:

- `requireAuth` and `req.user.id` remain the only owner boundary for the route.
- UUID path and strict empty body validation fail before storage, decrypt, or
  preview work.
- The helper loads only the owner Reddit saved-items source-staging run and
  requires current staged lifecycle state before decrypt.
- The linked import intent is reloaded and rechecked for owner, activated
  status, persona validity, provider, source family, source kind, source key,
  and source label before decrypt.
- Encryption is fail-closed; missing or malformed staging encryption config and
  malformed, undecryptable, empty, or mismatched batches return bounded errors.
- Success returns only safe aggregate preview metadata such as counts, source
  family/kind, page limit, truncation, and estimated character totals.
- Success and failure readbacks omit source text, snippets, titles, bodies,
  URLs, authors, subreddit names, usernames, raw provider ids, cursors, provider
  payloads/headers, item fingerprints, snapshot fingerprints, encrypted batch
  values, tokens, storage details, SQL details, stack traces, and secret-shaped
  values.
- Preview is idempotent and leaves source-staging lifecycle unchanged.
- Static guards found no drift into import execution, durable candidate records,
  archive source rows, existing `import_jobs`, connector job table writes, jobs,
  queues, workers, UI, hosted/runtime code, packages, billing, Redis,
  Cloudflare, marketplace, partner adapters, social behavior, provider calls,
  broad Reddit reads, or Discord content reads.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/archive-connectors.test.ts` | Pass | 76 archive connector route tests passed, including staged-batch import-preview auth/body/run/intent/encryption/batch/redaction/read-only/static-guard coverage. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/services/archive-connectors/credential-storage.test.ts apps/api/src/routes/archive-connectors.test.ts apps/api/src/routes/import-preview.test.ts apps/api/src/services/imports/parsers/import-parsers.test.ts apps/api/src/routes/background-jobs.test.ts apps/api/src/services/background-jobs.service.test.ts apps/api/src/routes/social.test.ts apps/web/lib/archive-connector-oauth-callback.test.ts apps/web/lib/social-publishing-readiness.test.ts apps/api/src/middleware/error-handler.test.ts` | Pass | 144 tests passed across connector storage/routes, import preview/parsers, background job readback/helpers, social fail-closed routes, web callback/readiness guards, and error handling. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API typecheck ran; web typecheck replayed from cache. |
| `git diff --check` | Pass | No whitespace errors. |
| Forbidden behavior scan | Pass | Review scans found no import execution, durable candidate records, archive source rows, existing `import_jobs`, connector job table writes, jobs, queues, workers, UI, hosted/runtime, packages, billing, Redis, Cloudflare, marketplace, partner adapter, social behavior, provider calls, broad Reddit reads, or Discord content reads. |

## Residual Risk

This lane consumes one previously staged encrypted Reddit saved-items batch only
far enough to produce safe aggregate preview metadata. It does not execute
imports, create archive sources, persist durable candidates, enqueue jobs, run
workers, crawl pagination, expose UI, or prove hosted runtime behavior.

Future lanes must separately preflight and review import execution, archive
source writes, durable candidates, connector job tables, queue/worker behavior,
pagination crawls, additional Reddit history categories, Discord
channel/message/member reads, UI, hosted/runtime work, packages, billing, Redis,
Cloudflare, marketplace, partner adapters, or social behavior.

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS accepted PR484J-J Archive Connector Staged Batch Consumption without a review patch.
- The accepted implementation is limited to a read-only owner-only staged-batch import-preview route that decrypts exactly one current Reddit saved-items staged run into safe aggregate preview metadata only.
- The route keeps current-run lifecycle, linked-intent/persona/source gates, dedicated staging encryption, redaction, no-write guarantees, and static no-drift guards intact.
- No durable candidates, import execution, archive source rows, existing import_jobs, connector job tables, jobs, queues, workers, UI, hosted/runtime, packages, billing, Redis, Cloudflare, marketplace, partner adapters, social behavior, provider calls, broad Reddit reads, or Discord content reads entered scope.
Validation:
- npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/archive-connectors.test.ts
- npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/services/archive-connectors/credential-storage.test.ts apps/api/src/routes/archive-connectors.test.ts apps/api/src/routes/import-preview.test.ts apps/api/src/services/imports/parsers/import-parsers.test.ts apps/api/src/routes/background-jobs.test.ts apps/api/src/services/background-jobs.service.test.ts apps/api/src/routes/social.test.ts apps/web/lib/archive-connector-oauth-callback.test.ts apps/web/lib/social-publishing-readiness.test.ts apps/api/src/middleware/error-handler.test.ts
- npm exec --yes pnpm@10.32.1 -- run typecheck
- git diff --check
Task:
- Close PR484J-J or choose the next archive connector move.
- Import execution, archive source writes, durable candidates, jobs/queues/workers, pagination crawls, UI, hosted/runtime, packages, billing, Redis, Cloudflare, marketplace, partner adapters, social behavior, additional Reddit history categories, and Discord channel/message/member reads remain separate lanes unless explicitly opened.
```
