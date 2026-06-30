# PR484J-H - Archive Connector Source Body Read Dry-Run Preflight Result

Owner: ARGUS / A3

Date: 2026-06-30

Status: Accepted for DAEDALUS

## Verdict

```text
ACCEPT_PR484J_H_REDDIT_SAVED_ITEMS_SOURCE_BODY_DRY_RUN_PREFLIGHT
```

ARGUS accepts one narrow owner-only source-body dry-run lane: Reddit saved
items only, behind an already activated archive connector import intent.

This is not import execution. It must not write archive sources, existing
`import_jobs`, connector job tables, Memory, Canon, Continuity, public
documents, review candidates, queues, workers, UI, hosted/runtime surfaces,
packages, billing, Redis, Cloudflare, marketplace, partner adapters, or social
surfaces.

## Rejected First Candidates

ARGUS rejects the other first-family candidates for this lane:

- Reddit subreddit membership metadata only is already covered by PR484J-E
  inventory metadata. Repeating it would overclaim source-body progress.
- Discord guild metadata only is covered by the accepted `identify guilds`
  scope and does not read messages or source bodies.
- Discord channel, message, member, DM, bot, webhook, invite, install, or
  connection reads remain out of scope because the accepted connector scope set
  does not cover them.
- Reddit history categories other than saved items remain future lanes until
  the first body-read helper proves the boundary.

## Accepted Route Shape

Add one authenticated empty-body route:

```text
POST /archive-connectors/import-intents/:intentId/source-preview
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
- reject pending, cancelled, missing, wrong-owner, wrong-purpose,
  non-activated, stale, or unsupported-source intents before credential decrypt
  or provider fetch;
- re-check that the intent persona is still owner-owned before credential
  decrypt or provider fetch;
- require a source-ready Reddit credential with exact accepted source scopes:
  `identity mysubreddits history`;
- require completed account proof on the active credential before provider
  reads;
- perform no storage writes and no private staging row;
- return only bounded dry-run metadata and explicit safety booleans.

## Accepted Provider Evidence

Primary provider documentation reviewed:

| Provider | Official doc | ARGUS conclusion |
| --- | --- | --- |
| Reddit | `https://www.reddit.com/dev/api/oauth#GET_api_v1_me` | OAuth `identity` covers the current-user identity endpoint used to derive and verify the connected account internally. |
| Reddit | `https://www.reddit.com/dev/api/oauth#GET_user_{username}_saved` | OAuth `history` covers the saved-items listing endpoint. This is the one accepted body/listing read. |
| Discord | `https://discord.com/developers/docs/resources/user#get-current-user-guilds` | Accepted Discord `guilds` scope reaches guild metadata only, not message/source body content, so Discord is rejected for PR484J-H. |

## Accepted Provider Reads

Use a provider-client helper with an injected fetch seam, abortable timeout, and
no logging of request headers, response headers, payloads, tokens, raw provider
ids, usernames, URLs, titles, body text, snippets, or cursors.

Accepted live reads, in this exact order:

| Step | Endpoint | Purpose |
| --- | --- | --- |
| 1 | `GET https://oauth.reddit.com/api/v1/me?raw_json=1` | Derive an internal Reddit username from the live identity payload and verify the raw account id fingerprint still matches the stored account proof. |
| 2 | `GET https://oauth.reddit.com/user/{username}/saved?limit=10&raw_json=1` | Read one bounded first page of the activated saved-items source for dry-run counts only. |

Step 2 must not run unless step 1 succeeds and the live raw account id
fingerprint exactly matches the stored `external_account_fingerprint`.

The implementation must not use the stored `accountLabel` as a provider path
component. It must derive `{username}` from the fresh Reddit identity response,
validate it with a Reddit-username-specific internal validator, and keep it out
of responses, docs fixtures, logs, errors, and committed data.

Headers:

- `Accept: application/json`;
- `Authorization: Bearer <internal access token>`;
- Station archive connector Reddit `User-Agent`;
- no token, request header, response header, or provider payload readback.

Request budget:

- at most two provider requests per successful preview;
- no source inventory fetch is required for this saved-items dry-run;
- no retries;
- 5 second timeout per provider request;
- no pagination loop;
- if Reddit returns an `after` cursor, return only `truncated: true`; never
  return the raw cursor.

## Readback Policy

This lane may read private source body/listing payloads internally only to
prove the first live body-read boundary. It must not return, store, log, or
document private source content.

Successful response may include only:

- `status: "archive_connector_source_preview_read"`;
- `provider: "reddit"`;
- `purpose: "archive_connector"`;
- `ownerOnly: true`;
- `sourcePreviewEnabled: true`;
- `sourceBodyReadEnabled: true`;
- `sourceBodyReadbackEnabled: false`;
- `privateStagingEnabled: false`;
- `importWritesEnabled: false`;
- `jobWritesEnabled: false`;
- `queueEnabled: false`;
- `publicWritesEnabled: false`;
- safe intent metadata already accepted for activation readback:
  id, provider, purpose, personaId, sourceFamily, sourceKind, sourceKey,
  sourceLabel, status, createdAt, updatedAt, and activatedAt;
- dry-run metadata:
  `pageLimit: 10`, `itemCount`, `postCount`, `commentCount`, `otherCount`,
  `truncated`, and `contentReturned: false`.

The route must not return:

- saved item titles, self text, comment bodies, descriptions, URLs, permalinks,
  thumbnails, media URLs, preview URLs, flair text, subreddit names, author
  names, external domains, created timestamps, score, vote state, NSFW/spoiler
  flags, item ids, Reddit fullnames, source usernames, provider account names,
  provider payloads, request ids, response headers, raw pagination cursors, raw
  OAuth scopes, or provider errors;
- token material, refresh tokens, encrypted credential blobs, OAuth codes,
  client secrets, cookies, signed URLs, storage paths, SQL/storage details,
  stack traces, environment values, prompts, or secret-shaped values.

## Failure Modes

| Condition | Expected behavior |
| --- | --- |
| Missing auth | `401`; no storage, credential, provider, or write work. |
| Invalid intent id or body | `400`; no storage, credential, provider, or write work. |
| Missing or wrong-owner intent | `404`; no credential decrypt, provider fetch, or writes. |
| Pending, cancelled, wrong-purpose, non-activated, or stale intent | `409`; no credential decrypt, provider fetch, or writes. |
| Unsupported source family or kind | `409`; no credential decrypt, provider fetch, or writes. |
| Persona missing or no longer owner-owned | `404`; no credential decrypt, provider fetch, or writes. |
| Missing, revoked, connect-proof, malformed, source-scope-missing, or non-Reddit credential | `409`; no provider fetch or writes. |
| Missing stored account proof | `409`; no provider fetch or writes. |
| Credential encryption key missing/malformed or decrypted token invalid | `409`; no provider fetch or writes. |
| Reddit identity `401` or `403` | `409`, reconnect-required style response; no saved-items request. |
| Reddit identity `429` | `429`; no saved-items request and no provider headers returned. |
| Reddit identity timeout, abort, network error, or `5xx` | `502`; no saved-items request. |
| Reddit identity payload invalid, missing raw account id, or invalid username | `502`; no saved-items request. |
| Live identity fingerprint does not match stored account proof | `409`; no saved-items request. |
| Reddit saved-items `401` or `403` | `409`, reconnect-required style response. |
| Reddit saved-items `429` | `429`; no provider headers returned. |
| Reddit saved-items timeout, abort, network error, or `5xx` | `502`; no raw provider details returned. |
| Reddit saved-items payload shape invalid | `502`; no raw provider payload returned. |
| Storage load failure | bounded `500`; no SQL, storage row, token, or secret-shaped details. |

All failures must preserve `provider`, `purpose`, `ownerOnly`, and safety
booleans where a bounded response envelope is available. They must not include
raw provider payloads, provider headers, usernames, item content, stack traces,
tokens, storage row details, or secret-shaped values.

## Required Tests

DAEDALUS must add focused tests proving:

- unauthenticated requests, invalid UUIDs, and non-empty/unknown-key bodies fail
  before storage, credential, provider, or write work;
- missing and wrong-owner intents fail before credential/provider/write work;
- pending, cancelled, wrong-purpose, non-activated, unsupported family, and
  unsupported kind intents fail before credential/provider/write work;
- persona ownership is rechecked before credential decrypt and provider fetch;
- only a source-ready Reddit credential with exact source scopes and completed
  account proof can proceed;
- missing account proof blocks before provider fetch;
- the route calls Reddit identity first, validates a fresh internal username,
  fingerprint-matches the live raw account id, and only then calls the saved
  listing endpoint;
- stored `accountLabel` is never used as a provider path component;
- fingerprint mismatch, invalid identity payload, invalid username, and
  identity rate-limit/failure block before the saved listing request;
- successful saved-items dry-run returns counts and booleans only, never title,
  body, comment text, URLs, authors, subreddit names, ids, usernames, cursors,
  provider payloads, headers, tokens, storage details, SQL, stack traces, or
  secret-shaped values;
- first-page truncation is represented only by a boolean;
- provider `401`/`403`, `429`, timeout/network/`5xx`, and invalid payload
  responses are bounded and redacted;
- no storage writes occur on success or failure;
- static guards prove no existing `import_jobs`, archive source rows,
  `persona_files`, Memory, Canon, Continuity, public documents, review
  candidates, queues, workers, UI, hosted/runtime code, packages, billing,
  Redis, Cloudflare, marketplace, partner adapters, social behavior, Reddit
  `read` expansion, Reddit broad discovery, Reddit history endpoints other than
  `/user/{username}/saved`, or Discord channel/message/member/DM reads entered
  the lane.

Suggested validation command:

```bash
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/services/archive-connectors/credential-storage.test.ts apps/api/src/routes/archive-connectors.test.ts apps/api/src/routes/import-preview.test.ts apps/api/src/services/imports/parsers/import-parsers.test.ts apps/api/src/routes/background-jobs.test.ts apps/api/src/services/background-jobs.service.test.ts apps/api/src/routes/social.test.ts apps/web/lib/archive-connector-oauth-callback.test.ts apps/web/lib/social-publishing-readiness.test.ts apps/api/src/middleware/error-handler.test.ts
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

## ARGUS Preflight Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| Current code review | Pass | Existing source inventory exposes Reddit history categories as Station metadata only; the first accepted body/listing read must be a new helper, not an inventory expansion. |
| Provider docs check | Pass | Reddit documents current-user identity under `identity` and saved-items listing under `history`; Discord current-user guilds remain metadata only. |
| Scope review | Pass | Existing accepted Reddit source credential scope set already includes `identity mysubreddits history`; no Reddit `read` scope or Discord message/channel scope is accepted. |
| Safety boundary review | Pass | The accepted preview returns counts and booleans only, with no body text, snippets, URLs, raw ids, usernames, provider payloads, staging rows, imports, jobs, queues, UI, hosted/runtime, package, billing, Redis, Cloudflare, marketplace, partner, or social work. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/services/archive-connectors/credential-storage.test.ts apps/api/src/routes/archive-connectors.test.ts apps/api/src/routes/import-preview.test.ts apps/api/src/services/imports/parsers/import-parsers.test.ts apps/api/src/routes/background-jobs.test.ts apps/api/src/services/background-jobs.service.test.ts apps/api/src/routes/social.test.ts apps/web/lib/archive-connector-oauth-callback.test.ts apps/web/lib/social-publishing-readiness.test.ts apps/api/src/middleware/error-handler.test.ts` | Pass | 128 tests passed across connector storage/routes, import preview/parsers, background job readback/helpers, social fail-closed routes, web callback/readiness guards, and error handling. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck passed. |
| `git diff --check` | Pass | No whitespace errors. |

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARGUS accepted PR484J-H as one Reddit saved-items source-body dry-run only.
- The route must require an activated owner-only import intent and may return counts/booleans only, not source text, snippets, URLs, authors, ids, usernames, cursors, provider payloads, or staging rows.
Task:
- Implement `POST /archive-connectors/import-intents/:intentId/source-preview` for activated Reddit `reddit_user_history` / `saved_items` intents only.
- Internally call Reddit `/api/v1/me?raw_json=1`, fingerprint-match the live raw account id against stored account proof, derive a fresh internal username, then call one bounded `/user/{username}/saved?limit=10&raw_json=1` page.
- Add tests proving owner/auth/intent/credential/account gates, redaction, no storage writes, no import execution, no queues/workers, and no drift into UI, hosted/runtime, packages, billing, Redis, Cloudflare, marketplace, partner adapters, social, or unaccepted provider reads.
```
