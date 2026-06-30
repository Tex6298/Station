# PR484J-I - Archive Connector Private Source Staging Result

Owner: DAEDALUS / A2

Date: 2026-06-30

Status: Ready for ARGUS review

## Result

```text
READY_FOR_ARGUS_REVIEW
```

DAEDALUS implemented the accepted PR484J-I boundary: encrypted, ephemeral,
owner-only source staging for activated Reddit `reddit_user_history` /
`saved_items` import intents.

This is not import execution. It does not create archive source rows, write
existing `import_jobs`, create connector job tables, write `persona_files`,
write Memory, Canon, Continuity, public documents, or review candidates, enqueue
jobs, run workers, add recurring pulls, expose UI, or touch hosted/runtime,
packages, billing, Redis, Cloudflare, marketplace, partner adapter, or social
surfaces.

## Implemented

- Added migration `066_archive_connector_source_staging_runs.sql` for
  `public.archive_connector_source_staging_runs`.
- Added DB types for `archive_connector_source_staging_runs`.
- Added authenticated route:
  `POST /archive-connectors/import-intents/:intentId/source-staging-runs`.
- Validates UUID path and strict empty body before storage, credential,
  provider, or write work.
- Loads only owner-scoped archive connector import intents by id, owner, and
  purpose.
- Requires `status = activated`.
- Accepts only Reddit saved-items intent metadata:
  `provider = reddit`, `sourceFamily = reddit_user_history`,
  `sourceKind = saved_items`.
- Rechecks owner persona before credential decrypt or provider fetch.
- Requires a source-ready Reddit credential with completed account proof.
- Requires dedicated source staging encryption config:
  `ARCHIVE_CONNECTOR_SOURCE_STAGING_ENCRYPTION_KEY`.
- Calls Reddit identity first:
  `/api/v1/me?raw_json=1`.
- Fingerprint-matches the live raw Reddit account id against stored account
  proof before any saved-items read.
- Calls one bounded saved-items page:
  `/user/{username}/saved?limit=10&raw_json=1`.
- Normalizes only Reddit post title/selftext and comment body into bounded text.
- Stores private source text only inside an AES-GCM encrypted source staging
  envelope:
  `station.archive_connector.source_staging_batch.v1`.
- Stores only safe plaintext metadata, counts, status, timestamps, and a keyed
  source snapshot fingerprint.
- Marks prior active staged runs for the same owner/intent as superseded when a
  fresh snapshot changes.
- Returns duplicate safe readback for a non-expired same snapshot.
- Treats expired same-snapshot rows as stale and creates a fresh encrypted run
  instead of reusing them.
- Revokes non-expired owner Reddit staged runs when the owner revokes an active
  Reddit archive connector credential.

## Readback

Successful first staging returns `201` with:

- `status: archive_connector_source_staging_run_created`;
- `provider: reddit`;
- `purpose: archive_connector`;
- `ownerOnly: true`;
- `staged: true`;
- `idempotent: true`;
- `duplicate: false`;
- safe intent metadata already accepted for activation receipts;
- safe run metadata:
  id, provider, purpose, personaId, importIntentId, sourceFamily, sourceKind,
  sourceKey, sourceLabel, status, pageLimit, itemCount, postCount,
  commentCount, skippedCount, truncated, sourceReadAt, expiresAt, createdAt,
  updatedAt;
- safety booleans proving private staging writes are enabled while downstream
  imports, archive source writes, jobs, queues, public writes, UI, provider
  payload readback, encrypted batch readback, snapshot fingerprint readback, and
  source body readback are disabled.

Duplicate same-snapshot staging returns `200` with the existing safe run
readback and `duplicate: true`.

## Still Forbidden

- source text, post titles, comment bodies, snippets, descriptions, URLs,
  permalinks, thumbnails, media URLs, subreddit names, author names, domains,
  timestamps, scores, raw ids, Reddit fullnames, usernames, cursors, provider
  payloads, request ids, response headers, token material, refresh tokens,
  encrypted credentials, storage paths, SQL details, stack traces,
  secret-shaped values, provider errors, `encrypted_source_batch`, or
  `source_snapshot_fingerprint` in readback;
- archive source rows, existing `import_jobs`, connector job tables,
  `persona_files`, Memory, Canon, Continuity, public documents, review
  candidates, queues, workers, recurring pulls, UI, hosted/runtime work,
  packages, billing, Redis, Cloudflare, marketplace, partner adapters, social
  behavior, Reddit `read` expansion, broad Reddit discovery, Reddit history
  endpoints other than saved items, or Discord channel/message/member/DM reads.

## Tests

Focused coverage was added in `apps/api/src/routes/archive-connectors.test.ts`
for:

- unauthenticated, invalid UUID, invalid body, and secret-shaped body fail-fast
  behavior;
- missing, wrong-owner, wrong-purpose, pending, unsupported, and persona-stale
  intents before credential/provider/write work;
- dedicated source staging encryption config before credential decrypt/provider
  fetch;
- source-ready credential and account-proof gates before provider fetch;
- identity-first provider order;
- stored account labels not being used as provider path components;
- live account fingerprint mismatch;
- provider identity and saved-items failure mapping;
- empty/skipped source pages not creating staging rows;
- successful encrypted batch write and safe metadata readback;
- encrypted batch decrypting in tests to only the accepted normalized text
  shape;
- duplicate non-expired snapshot idempotency;
- changed snapshot superseding current active staging;
- expired same-snapshot rows not being reused;
- owner credential revoke marking only owner Reddit staged runs as revoked;
- static source guards for no UI, package, hosted/runtime, job, queue, Redis,
  Cloudflare, billing, marketplace, partner adapter, social, broad Reddit, or
  Discord message/channel drift.

## Validation

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/archive-connectors.test.ts` | Pass | 71 archive connector route tests passed. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/services/archive-connectors/credential-storage.test.ts apps/api/src/routes/archive-connectors.test.ts apps/api/src/routes/import-preview.test.ts apps/api/src/services/imports/parsers/import-parsers.test.ts apps/api/src/routes/background-jobs.test.ts apps/api/src/services/background-jobs.service.test.ts apps/api/src/routes/social.test.ts apps/web/lib/archive-connector-oauth-callback.test.ts apps/web/lib/social-publishing-readiness.test.ts apps/api/src/middleware/error-handler.test.ts` | Pass | 139 tests passed across connector storage/routes, import preview/parsers, background job readback/helpers, social fail-closed routes, web callback/readiness guards, and error handling. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API typecheck ran; web typecheck replayed from cache. |
| `git diff --check` | Pass | No whitespace errors; CRLF normalization warnings only. |

## Wakeup

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS implemented PR484J-I as encrypted ephemeral Reddit saved-items source staging only.
- The lane adds a dedicated staging table, dedicated staging encryption envelope, owner-only staging route, duplicate/supersede/revoke lifecycle, safe run readback, tests, and docs.
- No import execution, archive source rows, existing import_jobs, jobs, queues, workers, UI, hosted/runtime, packages, billing, Redis, Cloudflare, marketplace, partner adapters, social behavior, broad Reddit reads, or Discord reads were added.
Risk:
- Review owner scoping, intent/persona/credential/account gates, encryption boundary, stale/duplicate lifecycle, revoke lifecycle, redaction, and static no-drift guards.
Task:
- Review PR484J-I and wake MIMIR with `WAKEUP A1:` if accepted, or wake DAEDALUS with `WAKEUP A2:` if fixes are needed.
```
