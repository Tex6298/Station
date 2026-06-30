# PR484J-H - Archive Connector Source Body Read Dry-Run Result

Owner: DAEDALUS / A2

Date: 2026-06-30

Status: Ready for ARGUS review

## Result

```text
READY_FOR_ARGUS_REVIEW
```

DAEDALUS implemented the accepted PR484J-H dry-run boundary for one source only:
activated owner-only Reddit `reddit_user_history` / `saved_items` import
intents.

## Implemented

- Added authenticated route:
  `POST /archive-connectors/import-intents/:intentId/source-preview`.
- Validates UUID path and strict empty body before storage, credential, provider,
  or write work.
- Loads only owner-scoped archive connector import intents by id, owner, and
  purpose.
- Requires `status = activated`.
- Accepts only deterministic Reddit saved-items intent metadata:
  `provider = reddit`, `sourceFamily = reddit_user_history`,
  `sourceKind = saved_items`, `sourceLabel = Saved items`, and the accepted
  saved-items opaque source key.
- Rechecks owner persona before credential decrypt or provider fetch.
- Requires a source-ready Reddit credential with completed account proof.
- Internally calls Reddit identity first:
  `/api/v1/me?raw_json=1`.
- Fingerprint-matches the live raw Reddit account id against the stored account
  proof before any saved-items read.
- Derives the Reddit username from the fresh identity payload only, validates it
  internally, and never returns it.
- Internally calls one bounded saved-items page:
  `/user/{username}/saved?limit=10&raw_json=1`.
- Returns only safe intent metadata, count metadata, truncation boolean, and
  explicit safety booleans.

## Readback

Successful readback returns:

- `status: archive_connector_source_preview_read`;
- safe intent metadata already accepted for activation receipts;
- `pageLimit: 10`;
- `itemCount`, `postCount`, `commentCount`, and `otherCount`;
- `truncated`;
- `contentReturned: false`;
- safety booleans confirming no private staging, import writes, job writes,
  queue work, public writes, UI changes, provider payload readback, provider
  header readback, or source body readback.

## Still Forbidden

- source text, post titles, comment bodies, snippets, descriptions, URLs,
  permalinks, thumbnails, media URLs, subreddit names, author names, domains,
  timestamps, scores, ids, Reddit fullnames, usernames, cursors, provider
  payloads, request ids, response headers, token material, refresh tokens,
  encrypted credentials, storage paths, SQL details, stack traces, secret-shaped
  values, or provider errors in readback;
- storage writes, archive source rows, existing `import_jobs`, connector job
  tables, `persona_files`, Memory, Canon, Continuity, public documents, review
  candidates, queues, workers, recurring pulls, UI, hosted/runtime work,
  packages, billing, Redis, Cloudflare, marketplace, partner adapters, social
  behavior, Reddit `read` expansion, broad Reddit discovery, Reddit history
  endpoints other than saved items, or Discord channel/message/member/DM reads.

## Tests

Focused coverage was added in `apps/api/src/routes/archive-connectors.test.ts`
for:

- unauthenticated, invalid UUID, and invalid body fail-fast behavior;
- missing, wrong-owner, wrong-purpose, pending, cancelled, unsupported, and
  stale intents before credential/provider/write work;
- persona ownership recheck ordering;
- source-ready credential and account-proof gates;
- identity-first provider order;
- stored account label not being used as a provider path component;
- live account fingerprint mismatch;
- invalid identity and saved-items payloads;
- provider 401/403, 429, 5xx, and bounded failure responses;
- successful redacted count-only response;
- no storage writes on success or failure;
- static source guards for no UI, package, hosted/runtime, job, queue, Redis,
  Cloudflare, billing, marketplace, partner adapter, social, broad Reddit, or
  Discord message/channel drift.

## Validation

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/archive-connectors.test.ts` | Pass | 66 archive connector route tests passed. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/services/archive-connectors/credential-storage.test.ts apps/api/src/routes/archive-connectors.test.ts apps/api/src/routes/import-preview.test.ts apps/api/src/services/imports/parsers/import-parsers.test.ts apps/api/src/routes/background-jobs.test.ts apps/api/src/services/background-jobs.service.test.ts apps/api/src/routes/social.test.ts apps/web/lib/archive-connector-oauth-callback.test.ts apps/web/lib/social-publishing-readiness.test.ts apps/api/src/middleware/error-handler.test.ts` | Pass | 134 tests passed across connector storage/routes, import preview/parsers, background job readback/helpers, social fail-closed routes, web callback/readiness guards, and error handling. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API typecheck ran; web typecheck replayed from cache. |
| `git diff --check` | Pass | No whitespace errors; CRLF normalization warnings only. |

## Wakeup

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS implemented PR484J-H as the accepted Reddit saved-items source-body dry-run only.
- The route returns count metadata and safety booleans only, with no source content/readback, staging rows, import writes, jobs, queues, UI, packages, hosted/runtime, billing, Redis, Cloudflare, marketplace, partner adapters, social behavior, or unaccepted provider reads.
Task:
- Review owner scoping, activated-intent gating, credential/account proof gates, Reddit identity fingerprint matching, saved-items endpoint bounds, redaction, failure mapping, no-write guarantees, and static no-drift guards.
- If accepted, wake MIMIR with `WAKEUP A1:`. If fixes are needed, wake DAEDALUS with `WAKEUP A2:`.
```
