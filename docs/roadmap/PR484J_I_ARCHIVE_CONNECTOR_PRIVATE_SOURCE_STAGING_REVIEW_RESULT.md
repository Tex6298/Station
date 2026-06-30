# PR484J-I - Archive Connector Private Source Staging Review Result

Owner: ARGUS / A3

Date: 2026-06-30

Status: Accepted for MIMIR after ARGUS patch

## Verdict

```text
ACCEPT_PR484J_I_PRIVATE_SOURCE_STAGING
```

ARGUS accepts the PR484J-I implementation after one narrow lifecycle patch.

ARGUS patch:

- moved current-run supersede after the replacement staging row insert
  succeeds;
- excludes the newly inserted row from that supersede update;
- added regression coverage proving a failed replacement insert preserves the
  previous non-expired staged run.

## Accepted Boundary

Accepted implementation:

- authenticated owner-only route:
  `POST /archive-connectors/import-intents/:intentId/source-staging-runs`;
- dedicated `public.archive_connector_source_staging_runs` table and DB types;
- dedicated source staging encryption key/envelope:
  `ARCHIVE_CONNECTOR_SOURCE_STAGING_ENCRYPTION_KEY` and
  `station.archive_connector.source_staging_batch.v1`;
- UUID path and strict empty-body validation before storage, credential,
  provider, or write work;
- owner-scoped activated archive connector import intent plus owner persona
  recheck before credential decrypt or provider fetch;
- Reddit saved-items only:
  `reddit_user_history` / `saved_items`;
- source-ready Reddit credential plus completed account proof before provider
  fetch;
- fresh Reddit identity read and live raw-account fingerprint match before one
  bounded saved-items page;
- private normalized source text stored only inside the encrypted staging batch;
- safe run metadata readback only;
- duplicate non-expired same snapshots return existing safe readback;
- changed snapshots supersede older current staged runs only after the new row
  is written;
- expired same-snapshot rows are not reused;
- owner Reddit credential revoke marks only owner non-expired staged Reddit
  source runs revoked.

## Review Checks

ARGUS reviewed the DAEDALUS handoff, implementation diff, source-staging
service, route failure mapping, migration, DB types, focused tests, static
guards, and roadmap/testing docs.

Findings:

- `requireAuth` and `req.user.id` remain the only owner boundary for the route.
- Intent loading is owner/purpose scoped and requires activated status before
  staging work.
- Persona, source-ready credential, completed account proof, dedicated staging
  encryption, and fresh Reddit identity proof gate the private source read.
- Provider calls remain limited to Reddit identity and one saved-items page;
  no pagination loop, recurring pull, broad Reddit discovery, Discord content
  read, provider SDK, queue, worker, hosted/runtime, UI, package, billing,
  Cloudflare, Redis, marketplace, partner adapter, or social behavior entered
  the lane.
- Success and failure readbacks omit source text, snippets, URLs, authors,
  subreddit names, usernames, raw ids, cursors, provider payloads/headers,
  tokens, encrypted credentials, storage paths, SQL details, stack traces,
  `encrypted_source_batch`, `source_snapshot_fingerprint`, and secret-shaped
  values.
- The ARGUS patch closes the only review gap found: an insert failure while
  replacing a changed snapshot can no longer mark the prior valid staged run
  superseded before the replacement exists.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/archive-connectors.test.ts` | Pass | 72 archive connector route tests passed, including ARGUS-added replacement-insert-failure lifecycle coverage. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/services/archive-connectors/credential-storage.test.ts apps/api/src/routes/archive-connectors.test.ts apps/api/src/routes/import-preview.test.ts apps/api/src/services/imports/parsers/import-parsers.test.ts apps/api/src/routes/background-jobs.test.ts apps/api/src/services/background-jobs.service.test.ts apps/api/src/routes/social.test.ts apps/web/lib/archive-connector-oauth-callback.test.ts apps/web/lib/social-publishing-readiness.test.ts apps/api/src/middleware/error-handler.test.ts` | Pass | 140 tests passed across connector storage/routes, import preview/parsers, background job readback/helpers, social fail-closed routes, web callback/readiness guards, and error handling. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck passed. |
| `git diff --check` | Pass | No whitespace errors; CRLF normalization warnings only on touched TypeScript files. |
| Forbidden behavior scan | Pass | Review scans found no import execution, archive source rows, existing `import_jobs`, connector job table writes, jobs, queues, workers, UI, hosted/runtime, packages, billing, Redis, Cloudflare, marketplace, partner adapter, social behavior, broad Reddit reads, or Discord content reads. |

## Residual Risk

This lane stages one bounded private Reddit saved-items page for later review.
It does not execute imports, create archive sources, consume staged batches,
enqueue jobs, run workers, crawl pagination, expose UI, or prove hosted runtime
behavior.

Future lanes must separately preflight and review staged-batch consumption,
import execution, archive source writes, connector job tables, queue/worker
behavior, pagination crawls, additional Reddit history categories, Discord
channel/message/member reads, UI, hosted/runtime work, packages, billing,
Redis, Cloudflare, marketplace, partner adapters, or social behavior.

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS accepted PR484J-I Archive Connector Private Source Staging after a narrow lifecycle patch.
- The patch preserves a previous valid staged run if a changed-snapshot replacement insert fails, and keeps supersede after successful replacement insert only.
- The accepted lane remains encrypted ephemeral owner-only Reddit saved-items staging only; no import execution, archive source rows, existing import_jobs, jobs, queues, workers, UI, hosted/runtime, packages, billing, Redis, Cloudflare, marketplace, partner adapters, social behavior, broad Reddit reads, or Discord content reads entered scope.
Validation:
- npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/archive-connectors.test.ts
- npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/services/archive-connectors/credential-storage.test.ts apps/api/src/routes/archive-connectors.test.ts apps/api/src/routes/import-preview.test.ts apps/api/src/services/imports/parsers/import-parsers.test.ts apps/api/src/routes/background-jobs.test.ts apps/api/src/services/background-jobs.service.test.ts apps/api/src/routes/social.test.ts apps/web/lib/archive-connector-oauth-callback.test.ts apps/web/lib/social-publishing-readiness.test.ts apps/api/src/middleware/error-handler.test.ts
- npm exec --yes pnpm@10.32.1 -- run typecheck
- git diff --check
Task:
- Close PR484J-I or choose the next archive connector move.
- Staged-batch consumption, import execution, archive source writes, jobs/queues/workers, pagination crawls, UI, hosted/runtime, packages, billing, Redis, Cloudflare, marketplace, partner adapters, social behavior, additional Reddit history categories, and Discord channel/message/member reads remain separate lanes unless explicitly opened.
```
