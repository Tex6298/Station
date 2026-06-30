# PR484J-J - Archive Connector Staged Batch Consumption Result

Owner: DAEDALUS / A2

Date: 2026-06-30

Status: Ready for ARGUS review

## Result

```text
READY_FOR_ARGUS_REVIEW
```

DAEDALUS implemented the accepted PR484J-J boundary: a read-only owner-only
preview over exactly one current Reddit saved-items staged batch.

This is not import execution. It does not create archive source rows, write
existing `import_jobs`, create connector job tables, create durable import
candidate rows, write `persona_files`, Memory, Canon, Continuity, public
documents, or review candidates, enqueue jobs, run workers, expose UI, call
providers, refresh/revoke tokens, or touch hosted/runtime, packages, billing,
Redis, Cloudflare, marketplace, partner adapter, or social surfaces.

## Implemented

- Added authenticated route:
  `POST /archive-connectors/source-staging-runs/:runId/import-preview`.
- Validates UUID path and strict empty body before storage, decrypt, or preview
  work.
- Loads exactly one owner-scoped
  `public.archive_connector_source_staging_runs` row by run id, owner, purpose,
  provider, source family, and source kind.
- Requires the staged run to be current:
  `status = staged`, not expired, `revoked_at = null`, and
  `superseded_at = null`.
- Rechecks the linked import intent before decrypt:
  owner-scoped, activated, archive connector purpose, owner persona still
  valid, and the same Reddit saved-items source fields as the staged run.
- Decrypts only the dedicated PR484J-I staging envelope with
  `ARCHIVE_CONNECTOR_SOURCE_STAGING_ENCRYPTION_KEY`.
- Validates the decrypted payload schema:
  `station.archive_connector.source_staging_batch.v1`, Reddit saved-items,
  `pageLimit = 10`, bounded item array, and item kinds limited to `post` and
  `comment`.
- Builds connector-specific in-memory aggregate metadata from already
  normalized staged items.
- Leaves the staged run lifecycle unchanged by preview.

## Readback

Successful preview returns `200` with:

- `status: archive_connector_source_staging_import_preview_ready`;
- `provider: reddit`;
- `purpose: archive_connector`;
- `ownerOnly: true`;
- run id;
- safe staged run metadata;
- safe linked intent metadata;
- `preview.format: reddit_saved_items`;
- `sourceFamily: reddit_user_history`;
- `sourceKind: saved_items`;
- item, post, comment, and skipped counts;
- truncation boolean;
- estimated character count;
- estimated non-empty item count;
- `noWritePerformed: true`;
- safety booleans proving provider calls, token decrypt, import execution,
  archive source writes, existing `import_jobs`, connector job tables, durable
  candidate writes, queues, workers, public writes, UI, hosted/runtime, source
  text readback, encrypted batch readback, snapshot fingerprint readback, and
  item fingerprint readback are disabled.

## Still Forbidden

- private source snippets, normalized title/text/body readback, item
  fingerprints, source snapshot fingerprints, encrypted batch values, raw
  provider ids, Reddit fullnames, usernames, URLs, authors, subreddit names,
  cursors, provider payloads, provider headers, tokens, refresh tokens,
  encrypted credentials, storage paths, SQL details, stack traces,
  secret-shaped values, owner ids, or environment values in readback;
- generic file/paste import parsing for staged connector batches;
- durable candidate records, import execution, archive source rows, existing
  `import_jobs`, connector job tables, `persona_files`, Memory, Canon,
  Continuity, public documents, review candidates, queues, workers, UI,
  hosted/runtime, packages, billing, Redis, Cloudflare, marketplace, partner
  adapters, social behavior, broad Reddit reads, or Discord content reads.

## Tests

Focused coverage was added in `apps/api/src/routes/archive-connectors.test.ts`
for:

- unauthenticated, invalid UUID, invalid body, and secret-shaped body fail-fast
  behavior;
- missing and wrong-owner runs returning the same bounded not-found response;
- superseded, revoked, expired, stale-intent, source-mismatch, and persona-stale
  runs failing before decrypt;
- missing/malformed source staging encryption config;
- malformed, undecryptable, and empty encrypted batches;
- valid staged batch preview returning safe aggregate metadata only;
- idempotent read-only preview leaving staged run status/timestamps unchanged;
- absence of source text, normalized text keys, item fingerprints, snapshot
  fingerprints, encrypted batch values, raw provider ids, usernames, URLs,
  authors, subreddit names, cursors, provider payloads/headers, tokens, storage
  paths, SQL details, stack traces, secret-shaped values, and owner ids from
  success and failure readback;
- no provider calls, credential decrypt, token refresh/revoke, import
  execution, archive source writes, existing `import_jobs`, connector job table
  writes, durable candidate writes, queues, workers, UI, hosted/runtime,
  package, billing, Redis, Cloudflare, marketplace, partner adapter, or social
  writes;
- static no-drift coverage keeping staged-batch preview out of generic import
  parsers and unaccepted provider/job surfaces.

## Validation

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/archive-connectors.test.ts` | Pass | 76 archive connector route tests passed. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/services/archive-connectors/credential-storage.test.ts apps/api/src/routes/archive-connectors.test.ts apps/api/src/routes/import-preview.test.ts apps/api/src/services/imports/parsers/import-parsers.test.ts apps/api/src/routes/background-jobs.test.ts apps/api/src/services/background-jobs.service.test.ts apps/api/src/routes/social.test.ts apps/web/lib/archive-connector-oauth-callback.test.ts apps/web/lib/social-publishing-readiness.test.ts apps/api/src/middleware/error-handler.test.ts` | Pass | 144 tests passed across connector storage/routes, import preview/parsers, background job readback/helpers, social fail-closed routes, web callback/readiness guards, and error handling. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API typecheck ran; web typecheck replayed from cache. |
| `git diff --check` | Pass | No whitespace errors; CRLF normalization warnings only. |

## Wakeup

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS implemented PR484J-J as a read-only owner-only staged-batch import preview lane.
- The route decrypts exactly one current Reddit saved-items staged run into safe aggregate preview metadata only.
- It adds no durable candidates, import execution, archive source rows, existing import_jobs, connector job tables, queues/workers, UI, hosted/runtime behavior, provider calls, token work, packages, billing, Redis, Cloudflare, marketplace, partner adapters, social behavior, broad Reddit reads, or Discord content reads.
Validation:
- Archive connector route suite: 76 pass.
- Accepted archive/social/background/import/error suite: 144 pass.
- Typecheck: pass.
- Diff check: pass.
Risk:
- Review current-run lifecycle gates, linked-intent recheck before decrypt, batch validation, redaction, no-write guarantees, and parser/provider/job static guards.
Task:
- Review PR484J-J and wake MIMIR with `WAKEUP A1:` if accepted, or wake DAEDALUS with `WAKEUP A2:` if fixes are needed.
```
