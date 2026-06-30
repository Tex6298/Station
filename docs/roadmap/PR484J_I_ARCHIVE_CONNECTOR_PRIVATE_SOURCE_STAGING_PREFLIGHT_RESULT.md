# PR484J-I - Archive Connector Private Source Staging Preflight Result

Owner: ARGUS / A3

Date: 2026-06-30

Status: Accepted for DAEDALUS

## Verdict

```text
ACCEPT_PR484J_I_ENCRYPTED_REDDIT_SAVED_ITEMS_STAGING_PREFLIGHT
```

ARGUS accepts one narrow owner-only private source staging lane: encrypted,
ephemeral staging runs for activated Reddit saved-items import intents.

This is not import execution. It must not create archive source rows, write
existing `import_jobs`, create connector job tables, write `persona_files`,
write Memory, Canon, Continuity, public documents, or review candidates, enqueue
jobs, run workers, add recurring pulls, expose UI, or touch hosted/runtime,
packages, billing, Redis, Cloudflare, marketplace, partner adapter, or social
surfaces.

## Rejected Write Surfaces

ARGUS rejects these first-write options:

- existing `import_jobs`, because that table is file/import-status shaped and
  visible to background-job readbacks;
- archive source rows, because those imply durable archive ingestion and
  runtime/retrieval provenance beyond this lane;
- `persona_files`, Memory, Canon, Continuity, public documents, and review
  candidates, because those are downstream import products;
- plaintext provider payload tables, because source bodies may contain private
  owner data and secret-shaped content.

## Accepted Route Shape

Add one authenticated empty-body route:

```text
POST /archive-connectors/import-intents/:intentId/source-staging-runs
```

The route must:

- require `requireAuth` and use only `req.user.id` as the owner boundary;
- validate the UUID path and strict empty JSON body before storage, credential,
  provider, or write work;
- load the intent only from `archive_connector_import_intents` by `id`,
  `owner_user_id`, and `purpose = 'archive_connector'`;
- require intent `status = 'activated'`;
- accept only `provider = 'reddit'`,
  `sourceFamily = 'reddit_user_history'`, and `sourceKind = 'saved_items'`;
- reject missing, wrong-owner, wrong-purpose, pending, cancelled, non-activated,
  stale, unsupported-family, or unsupported-kind intents before credential
  decrypt or provider fetch;
- re-check that the intent persona is still owner-owned before credential
  decrypt or provider fetch;
- require a source-ready Reddit credential with exact accepted source scopes
  `identity mysubreddits history` and completed account proof;
- perform a fresh PR484J-H-style provider read in the same request:
  Reddit identity first, live raw account id fingerprint match, then one
  bounded saved-items page;
- write only the accepted staging table described below;
- return safe run metadata and counts only.

The route must not reuse only prior preview counts. It may share the PR484J-H
provider-client seam, but staging must be based on a fresh provider read in the
same request.

## Accepted Schema

Add one dedicated table in the next migration, expected as migration `066`:

```text
public.archive_connector_source_staging_runs
```

Required columns:

- `id uuid primary key default gen_random_uuid()`;
- `owner_user_id uuid not null references public.profiles(id) on delete cascade`;
- `persona_id uuid not null references public.personas(id) on delete cascade`;
- `import_intent_id uuid not null references public.archive_connector_import_intents(id) on delete cascade`;
- `provider text not null check (provider = 'reddit')`;
- `purpose text not null default 'archive_connector' check (purpose = 'archive_connector')`;
- `source_family text not null check (source_family = 'reddit_user_history')`;
- `source_kind text not null check (source_kind = 'saved_items')`;
- `source_key text not null check (source_key ~ '^[a-f0-9]{24}$')`;
- `source_label text not null` with the same safe-label bounds used by import
  intents;
- `status text not null default 'staged' check (status in ('staged', 'superseded', 'revoked'))`;
- `page_limit integer not null check (page_limit = 10)`;
- `item_count integer not null check (item_count between 0 and 10)`;
- `post_count integer not null check (post_count between 0 and 10)`;
- `comment_count integer not null check (comment_count between 0 and 10)`;
- `skipped_count integer not null check (skipped_count between 0 and 10)`;
- `truncated boolean not null`;
- `source_snapshot_fingerprint text not null`;
- `encrypted_source_batch jsonb not null`;
- `source_read_at timestamptz not null`;
- `expires_at timestamptz not null`;
- `superseded_at timestamptz`;
- `revoked_at timestamptz`;
- `created_at timestamptz not null default now()`;
- `updated_at timestamptz not null default now()`.

Required indexes and policies:

- unique index on `(owner_user_id, import_intent_id, source_snapshot_fingerprint)`;
- index on `(owner_user_id, import_intent_id, status, expires_at desc)`;
- index on `(owner_user_id, provider, purpose, created_at desc)`;
- updated-at trigger using the existing `public.handle_updated_at()`;
- RLS enabled;
- owner-only policy for all actions using and checking
  `auth.uid() = owner_user_id`;
- table and column comments stating that private source data is encrypted,
  ephemeral, not import execution, and not archive source storage.

DAEDALUS must update `packages/db/src/types.ts` for the new table. No generated
types may expose plaintext source body fields.

Do not add a staging item table in PR484J-I. A per-item table can be considered
only in a later import-processing lane after transaction and lifecycle behavior
are accepted.

## Encryption And Stored Data

Use a new archive connector source staging encryption helper and envelope:

```text
schema: station.archive_connector.source_staging_batch.v1
algorithm: aes-256-gcm
```

The helper should use a dedicated environment variable:

```text
ARCHIVE_CONNECTOR_SOURCE_STAGING_ENCRYPTION_KEY
```

The key handling may mirror the credential encryption helper, but staging
source encryption must have separately named helpers, errors, tests, and
schema constants. Do not store source bodies with the credential helper name or
credential envelope schema.

The encrypted batch may contain only:

- provider/source identifiers already safe as route metadata:
  `provider`, `sourceFamily`, `sourceKind`;
- `pageLimit: 10`;
- `truncated`;
- an item array of at most 10 entries;
- item `ordinal`;
- item `kind: "post" | "comment"`;
- bounded `normalizedText`;
- encrypted-only per-item keyed fingerprint, if needed for future duplicate
  handling.

Allowed normalization:

- Reddit `t3` posts may stage title plus selftext as one normalized text string;
- Reddit `t1` comments may stage body as one normalized text string;
- whitespace may be normalized;
- per-item normalized text must be bounded, with a hard max no greater than
  8,000 characters;
- total plaintext before encryption must be bounded, with a hard max no greater
  than 40,000 characters.

Forbidden from encrypted batch and plaintext columns:

- raw provider payloads;
- raw Reddit ids or fullnames;
- usernames, authors, subreddit names, domains, URLs, permalinks, thumbnails,
  media URLs, preview URLs, flair, timestamps, scores, vote state, NSFW/spoiler
  flags, provider headers, request ids, rate-limit headers, raw cursors, OAuth
  scopes, tokens, refresh tokens, encrypted credentials, storage paths, SQL
  details, stack traces, environment values, prompts, and provider errors.

Unknown item kinds and items without bounded normalized text must be skipped,
not stored. The response may include only `skippedCount`.

Source content may contain secret-shaped strings. Those strings may be stored
only inside `encrypted_source_batch`; they must never appear in logs, errors,
docs, tests outside encrypted fixtures, response bodies, plaintext columns, or
fingerprints that are raw hashes of the content.

Plaintext fingerprints must be keyed digests, not raw SHA hashes over source
text or raw provider ids. Use a staging-keyed HMAC or equivalent keyed digest
for `source_snapshot_fingerprint`.

## Idempotency And Lifecycle

Staging must be idempotent for duplicate owner clicks:

- compute `source_snapshot_fingerprint` after the fresh provider read using a
  keyed digest over owner, intent id, provider, source key, item kinds, bounded
  normalized text fingerprints, and truncation state;
- if a non-expired run with the same `(owner_user_id, import_intent_id,
  source_snapshot_fingerprint)` already exists, return that existing safe run
  readback with `duplicate: true` and do not insert another encrypted batch;
- if the fresh provider snapshot differs, insert a new run and mark prior
  non-expired `staged` runs for the same owner and intent as `superseded` with
  `superseded_at`;
- `expires_at` must be `source_read_at + 24 hours` or shorter;
- expired rows must not be reused for idempotency and must not be eligible for
  future import consumption;
- no hard-delete, purge job, or retention cron enters PR484J-I.

Credential revocation behavior:

- no new staging may proceed without an active source-ready credential;
- the existing owner credential revoke route may update only
  `archive_connector_source_staging_runs` for the same owner/provider to set
  `status = 'revoked'` and `revoked_at = now()` for non-expired `staged` runs;
- this revoke-side update must not decrypt staged source data and must not
  touch import jobs, archive sources, queues, workers, UI, or provider APIs.

Intent cancellation behavior:

- no new staging may proceed unless the intent is currently activated;
- there is no new intent-cancel route in PR484J-I;
- any future import consumption lane must re-check current intent status and
  reject expired, revoked, superseded, or non-activated runs.

## Safe Response Contract

Successful first staging returns `201` with:

- `status: "archive_connector_source_staging_run_created"`;
- `provider: "reddit"`;
- `purpose: "archive_connector"`;
- `ownerOnly: true`;
- `staged: true`;
- `idempotent: true`;
- `duplicate: false`;
- safe intent metadata already accepted for activation readback;
- safe run metadata:
  id, provider, purpose, personaId, importIntentId, sourceFamily, sourceKind,
  sourceKey, sourceLabel, status, pageLimit, itemCount, postCount,
  commentCount, skippedCount, truncated, sourceReadAt, expiresAt, createdAt,
  updatedAt;
- safety booleans proving private staging is enabled and downstream imports,
  jobs, queues, public writes, UI, provider payload readback, and source body
  readback are disabled.

Duplicate staging returns `200` with:

- `status: "archive_connector_source_staging_run_exists"`;
- `duplicate: true`;
- `staged: false`;
- the existing safe run readback.

Responses must not include:

- `encrypted_source_batch`;
- source text, snippets, titles, comment bodies, URLs, permalinks, usernames,
  authors, subreddit names, item ids, fullnames, domains, timestamps, scores,
  cursors, fingerprints, provider payloads, provider headers, tokens, storage
  details, SQL, stack traces, or secret-shaped content.

## Failure Modes

| Condition | Expected behavior |
| --- | --- |
| Missing auth | `401`; no storage, credential, provider, or write work. |
| Invalid intent id or body | `400`; no storage, credential, provider, or write work. |
| Missing or wrong-owner intent | `404`; no credential decrypt, provider fetch, or writes. |
| Pending, cancelled, wrong-purpose, non-activated, stale, or unsupported intent | `409`; no credential decrypt, provider fetch, or writes. |
| Persona missing or no longer owner-owned | `404`; no credential decrypt, provider fetch, or writes. |
| Missing, revoked, malformed, or source-scope-missing credential | `409`; no provider fetch or staging write. |
| Missing stored account proof | `409`; no provider fetch or staging write. |
| Credential encryption key missing/malformed or token invalid | `409`; no provider fetch or staging write. |
| Source staging encryption key missing/malformed | `409`; no provider fetch or staging write. |
| Reddit identity `401`/`403` | `409`; no saved-items request or staging write. |
| Reddit identity `429` | `429`; no saved-items request or staging write. |
| Reddit identity timeout/network/`5xx` or invalid payload | bounded `502`; no saved-items request or staging write. |
| Live identity fingerprint mismatch | `409`; no saved-items request or staging write. |
| Reddit saved-items `401`/`403` | `409`; no staging write. |
| Reddit saved-items `429` | `429`; no provider headers returned and no staging write. |
| Reddit saved-items timeout/network/`5xx` or invalid payload | bounded `502`; no raw provider details and no staging write. |
| All provider items skipped or normalized text empty | `409`, no staging write. |
| Duplicate same snapshot | `200`, existing safe run, no new encrypted batch. |
| Storage insert/update conflict or failure | bounded `500`; no SQL/storage details, source text, encrypted blobs, or secret-shaped values. |

All failures must keep raw provider payloads, source text, encrypted blobs,
provider headers, stack traces, tokens, storage row details, fingerprints, and
secret-shaped values out of response bodies and logs.

## Required Tests

DAEDALUS must add focused tests proving:

- auth, UUID path, and strict empty-body failures happen before storage,
  credential, provider, or write work;
- missing, wrong-owner, wrong-purpose, non-activated, unsupported, and stale
  intents fail before credential/provider/write work;
- persona ownership is rechecked before credential decrypt/provider fetch/write;
- source-ready credential and account-proof gates run before provider fetch;
- missing or malformed source staging encryption config fails before provider
  fetch;
- provider identity runs first, fingerprint-matches account proof, and only
  then saved-items is read;
- identity failures block saved-items and staging writes;
- saved-items failures block staging writes;
- successful staging writes only
  `archive_connector_source_staging_runs`;
- the inserted row has safe plaintext metadata, 24-hour-or-shorter expiry,
  owner scope, status `staged`, count fields, a keyed snapshot fingerprint, and
  an encrypted batch envelope;
- dangerous source text, titles, bodies, URLs, authors, subreddit names, ids,
  usernames, cursors, payloads, headers, and secret-shaped source content do not
  appear in responses, plaintext columns, errors, logs, or docs;
- encrypted batch decrypts in tests to only the accepted normalized-text shape;
- duplicate same snapshot returns the existing safe run without inserting a new
  encrypted batch;
- changed snapshot creates a new run and supersedes the previous active run for
  that intent;
- credential revoke marks only non-expired staged runs for that owner/provider
  as revoked and does not decrypt content or call providers;
- expired, revoked, and superseded runs are not reused for idempotency;
- static guards prove no existing `import_jobs`, archive source rows,
  `persona_files`, Memory, Canon, Continuity, public documents, review
  candidates, queues, workers, recurring pulls, UI, hosted/runtime code,
  packages, billing, Redis, Cloudflare, marketplace, partner adapters, social
  behavior, additional Reddit history categories, Reddit `read` expansion,
  broad Reddit discovery, or Discord channel/message/member reads entered
  scope.

Suggested validation command:

```bash
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/services/archive-connectors/credential-storage.test.ts apps/api/src/routes/archive-connectors.test.ts apps/api/src/routes/import-preview.test.ts apps/api/src/services/imports/parsers/import-parsers.test.ts apps/api/src/routes/background-jobs.test.ts apps/api/src/services/background-jobs.service.test.ts apps/api/src/routes/social.test.ts apps/web/lib/archive-connector-oauth-callback.test.ts apps/web/lib/social-publishing-readiness.test.ts apps/api/src/middleware/error-handler.test.ts
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

## ARGUS Preflight Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| Existing write-surface review | Pass | Existing `import_jobs`, archive source/retrieval surfaces, `persona_files`, Memory, Canon, Continuity, public documents, and review candidates are downstream import surfaces and are rejected for the first staging write. |
| Existing schema review | Pass | Connector credentials and import intents already use dedicated owner-scoped tables, RLS, safe metadata, and explicit no-import comments; PR484J-I should follow that pattern with a new staging table. |
| Existing source-preview review | Pass | PR484J-H already proves the identity-first bounded Reddit saved-items read. PR484J-I may reuse that read boundary but must add encryption and staging writes only. |
| Encryption boundary review | Pass | Private source bodies require a dedicated source staging encryption envelope and env var; plaintext columns and readback must never contain source text or raw provider identifiers. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/services/archive-connectors/credential-storage.test.ts apps/api/src/routes/archive-connectors.test.ts apps/api/src/routes/import-preview.test.ts apps/api/src/services/imports/parsers/import-parsers.test.ts apps/api/src/routes/background-jobs.test.ts apps/api/src/services/background-jobs.service.test.ts apps/api/src/routes/social.test.ts apps/web/lib/archive-connector-oauth-callback.test.ts apps/web/lib/social-publishing-readiness.test.ts apps/api/src/middleware/error-handler.test.ts` | Pass | 134 tests passed across connector storage/routes, import preview/parsers, background job readback/helpers, social fail-closed routes, web callback/readiness guards, and error handling. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck passed from cache. |
| `git diff --check` | Pass | No whitespace errors. |

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARGUS accepted PR484J-I as one encrypted, ephemeral Reddit saved-items staging-run lane only.
- Use a dedicated `archive_connector_source_staging_runs` table, a dedicated source staging encryption envelope/key, fresh identity-first saved-items read, count-only safe readback, 24-hour expiry, duplicate/supersede behavior, and revoke-status handling limited to the new staging table.
Task:
- Implement `POST /archive-connectors/import-intents/:intentId/source-staging-runs` for activated owner-only Reddit `reddit_user_history` / `saved_items` intents only.
- Store private source normalized text only inside encrypted staging batches; never return or plaintext-store source text, snippets, URLs, authors, subreddit names, ids, usernames, cursors, provider payloads, provider headers, tokens, fingerprints, SQL, stack traces, or secret-shaped source content.
- Do not write existing import_jobs, archive source rows, persona_files, Memory, Canon, Continuity, public documents, review candidates, queues, workers, recurring pulls, UI, hosted/runtime, packages, billing, Redis, Cloudflare, marketplace, partner adapters, social behavior, additional Reddit history categories, broad Reddit reads, or Discord channel/message/member reads.
```
