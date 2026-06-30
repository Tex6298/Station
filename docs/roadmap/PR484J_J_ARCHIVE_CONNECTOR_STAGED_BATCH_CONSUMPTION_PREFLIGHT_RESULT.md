# PR484J-J - Archive Connector Staged Batch Consumption Preflight Result

Owner: ARGUS / A3

Date: 2026-06-30

Status: Accepted for DAEDALUS

## Verdict

```text
ACCEPT_PR484J_J_STAGED_BATCH_CONSUMPTION_PREFLIGHT
```

ARGUS accepts the smallest safe staged-batch consumption lane as a read-only
owner preview over one current staged run.

This is not import execution. It must not create archive source rows, write
existing `import_jobs`, create connector job tables, create durable import
candidate rows, write `persona_files`, Memory, Canon, Continuity, public
documents, or review candidates, enqueue jobs, run workers, expose UI, call
providers, refresh/revoke tokens, or touch hosted/runtime, packages, billing,
Redis, Cloudflare, marketplace, partner adapter, or social surfaces.

## Accepted Boundary

DAEDALUS may add only:

- one authenticated owner-only API route, for example:
  `POST /archive-connectors/source-staging-runs/:runId/import-preview`;
- strict UUID path validation and strict empty body validation before storage,
  decrypt, or preview work;
- a helper that loads exactly one
  `public.archive_connector_source_staging_runs` row by `id`, `owner_user_id =
  req.user.id`, `purpose = archive_connector`, `provider = reddit`,
  `source_family = reddit_user_history`, and `source_kind = saved_items`;
- lifecycle gates requiring `status = staged`, `expires_at > now()`, and
  `revoked_at` / `superseded_at` absent before decrypting the encrypted batch;
- linked import-intent recheck before decrypt:
  the referenced intent must still be owner-scoped, activated, archive
  connector purpose, owner-persona valid, and the accepted Reddit saved-items
  source (`reddit_user_history` / `saved_items`) with the same persona, source
  key, source label, provider, family, and kind as the staging row;
- decryption of only the dedicated PR484J-I staging envelope using
  `ARCHIVE_CONNECTOR_SOURCE_STAGING_ENCRYPTION_KEY`;
- exact decrypted payload validation:
  `schema = station.archive_connector.source_staging_batch.v1`,
  `provider = reddit`, `sourceFamily = reddit_user_history`, `sourceKind =
  saved_items`, `pageLimit = 10`, bounded `items` array, and item kinds limited
  to `post` and `comment`;
- connector-specific in-memory normalization of the already normalized staged
  items into aggregate preview metadata.

## Readback Policy

Successful readback may return only safe aggregate metadata:

- status such as `archive_connector_source_staging_import_preview_ready`;
- provider, purpose, `ownerOnly: true`, run id, safe run metadata, and safe
  linked intent metadata;
- `format: reddit_saved_items`;
- `sourceFamily: reddit_user_history`;
- `sourceKind: saved_items`;
- item/post/comment/skipped counts, truncation boolean, estimated character
  count, estimated non-empty item count, and a `noWritePerformed: true` safety
  envelope;
- safety booleans proving provider calls, token decrypt, import execution,
  archive source writes, existing `import_jobs`, connector job tables, durable
  candidate writes, queues, workers, public writes, UI, hosted/runtime, and
  source text readback are disabled.

Readback must not include:

- private source snippets, normalized title/text/body, item fingerprints,
  source snapshot fingerprints, encrypted batch values, raw provider ids,
  Reddit fullnames, usernames, URLs, authors, subreddit names, cursors,
  provider payloads, provider headers, tokens, refresh tokens, encrypted
  credentials, storage paths, SQL details, stack traces, secret-shaped values,
  owner ids, or environment variable values.

## Lifecycle Policy

- The route is read-only and idempotent while the run remains current.
- Do not mutate the staged run into `previewed`.
- Do not add a preview timestamp in this lane.
- Do not supersede, revoke, activate, consume, delete, or lock the staged run.
- Expired, revoked, superseded, wrong-owner, missing, unsupported-source,
  stale-intent, persona-stale, malformed-envelope, undecryptable, empty, or
  invalid decrypted batches fail with bounded responses and no private details.

## Parser And Normalization Policy

- Do not pass the decrypted staged batch through generic file/paste import
  parsing or broad JSON parser heuristics.
- Do not import or call `parseImportFile` for this route.
- Build a connector-specific in-memory preview from the PR484J-I staged batch
  schema.
- The implementation may share small generic count helpers only if they accept
  already-normalized text and do not infer formats from raw JSON/file content.

## Required Tests

DAEDALUS should add focused coverage proving:

- auth, UUID path, and strict empty body fail before storage/decrypt work;
- wrong-owner and missing runs return the same bounded not-found style response;
- superseded, revoked, expired, unsupported, stale-intent, and persona-stale
  runs fail before decrypting source text;
- missing/malformed staging encryption config fails bounded;
- malformed or undecryptable encrypted batches fail bounded without plaintext,
  SQL, stack, key, or envelope leakage;
- valid staged batch preview returns only safe aggregate metadata and safety
  booleans;
- source text, normalized titles/bodies, fingerprints, encrypted values, raw
  provider ids, usernames, URLs, authors, subreddit names, cursors, provider
  payloads/headers, tokens, storage paths, SQL details, stack traces, and
  secret-shaped values are absent from success and failure readback;
- no provider calls, credential decrypt, token refresh/revoke, import execution,
  `archive_sources`, existing `import_jobs`, connector job tables,
  `persona_files`, Memory, Canon, Continuity, public documents, review
  candidates, queues, workers, UI, hosted/runtime, package, billing, Redis,
  Cloudflare, marketplace, partner adapter, or social writes occur;
- static guards keep the new staged-batch preview helper out of generic
  `parseImportFile`, broad Reddit endpoints, Discord content endpoints,
  provider SDKs, jobs, queues, workers, UI, hosted/runtime, packages, billing,
  Redis, Cloudflare, marketplace, partner adapters, and social behavior.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| Current staging implementation review | Pass | PR484J-I stores only dedicated encrypted batches and safe metadata; no consumer exists yet. |
| Current import-preview parser review | Pass | Existing manual import preview is file/paste oriented and should not be used directly for staged connector batches. |
| Scope review | Pass | Accepted preflight is API-only, read-only, one owner run, no durable candidate records, and no downstream import/archive/job writes. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/archive-connectors.test.ts` | Pass | 72 archive connector route tests passed. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/services/archive-connectors/credential-storage.test.ts apps/api/src/routes/archive-connectors.test.ts apps/api/src/routes/import-preview.test.ts apps/api/src/services/imports/parsers/import-parsers.test.ts apps/api/src/routes/background-jobs.test.ts apps/api/src/services/background-jobs.service.test.ts apps/api/src/routes/social.test.ts apps/web/lib/archive-connector-oauth-callback.test.ts apps/web/lib/social-publishing-readiness.test.ts apps/api/src/middleware/error-handler.test.ts` | Pass | 140 tests passed across connector storage/routes, import preview/parsers, background job readback/helpers, social fail-closed routes, web callback/readiness guards, and error handling. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API typecheck ran; web typecheck replayed from cache. |
| `git diff --check` | Pass | No whitespace errors. |

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARGUS accepted PR484J-J as a read-only owner-only staged-batch import preview lane.
- Add one authenticated route/helper that decrypts exactly one current owner Reddit saved-items staged run into safe aggregate preview metadata only.
- Do not create durable candidate rows, import_jobs, archive sources, connector job tables, queues/workers, UI, hosted/runtime behavior, provider calls, token work, packages, billing, Redis, Cloudflare, marketplace, partner adapters, social behavior, broad Reddit reads, or Discord content reads.
Task:
- Implement the accepted boundary and tests.
- Keep staged run lifecycle unchanged by preview; expired/revoked/superseded/wrong-owner/malformed/undecryptable rows must fail bounded without private readback.
```
