# PR484E - Archive Connector OAuth State Start Preflight Result

Date: 2026-06-29

Owner: ARGUS / A3

Status: ACCEPT_PR484E_OAUTH_STATE_START_ROUTE

## Verdict

ARGUS accepts a narrow owner/session-bound OAuth state start route for PR484E.

DAEDALUS may add only a state-start mutation that creates an
`archive_connector_oauth_states` row for `reddit` or `discord` after auth and
accepted archive-specific provider app config. PR484E must not add redirects,
callbacks, token exchange, credential writes, provider calls, source inventory,
import writes, UI, jobs, queues, hosted runtime behavior, billing, or social
posting behavior.

## Accepted Route Shape

Add:

```text
POST /archive-connectors/oauth/:provider/start
```

Required behavior:

- use `requireAuth`;
- support only `reddit` and `discord`;
- require the selected provider to have both accepted archive-specific provider
  app config values present;
- create exactly one archive connector OAuth state row through the PR484B
  `createArchiveConnectorOAuthState` helper;
- bind the state to owner, active auth/session context, provider, archive
  connector purpose, random nonce, random csrf, optional local redirect path,
  and short expiry;
- return only safe bounded metadata and one opaque state handle on success;
- perform no provider call, fetch, redirect, callback handling, OAuth code
  handling, token exchange, credential write/revoke, source inventory, import
  write, or queue/job work.

`ARCHIVE_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY` must not block PR484E state
creation. It remains required before any future successful credential write.

## Provider Config Gate

Accepted config names remain:

```text
ARCHIVE_CONNECTOR_REDDIT_CLIENT_ID
ARCHIVE_CONNECTOR_REDDIT_CLIENT_SECRET
ARCHIVE_CONNECTOR_DISCORD_CLIENT_ID
ARCHIVE_CONNECTOR_DISCORD_CLIENT_SECRET
```

For the selected provider, both id and secret are required before the route may
write an OAuth state row. Missing or partial config must return a bounded
setup-required response and must not reveal which side is present.

Recommended status:

```text
409 Conflict
code: archive_connector_provider_app_setup_required
status: setup_required
```

Do not treat paused social publishing `REDDIT_CLIENT_ID` or
`REDDIT_CLIENT_SECRET` as archive connector config.

## State Handle And Session Binding

ARGUS accepts returning a one-time `stateHandle` only under these constraints:

- generate nonce and csrf with at least 32 random bytes each, base64url encoded;
- encode them into a single opaque handle, for example `nonce.csrf`;
- pass the raw nonce and csrf only into `createArchiveConnectorOAuthState`;
- store only the PR484B hashes, never the raw handle, raw nonce, or raw csrf;
- do not include owner id, session id, provider config, env names, row ids, or
  redirect URLs inside the handle;
- return the handle only on successful authenticated start;
- do not log, document, fixture, or persist the raw handle;
- future callback/consume work must remain a separate lane.

Because `requireAuth` does not expose a separate session id, PR484E may derive
the storage `sessionId` input from the active Bearer auth context. The raw
Authorization token must never be returned, logged, stored raw, or committed in
tests. Prefer a route-local deterministic binding such as a SHA-256 digest of
owner id plus Bearer token, then let the PR484B helper hash that binding again
before storage.

## Local Redirect Policy

The request body may accept:

```json
{ "localRedirectPath": "/local/path" }
```

Allowed:

- absent or `null`, stored as `null`;
- a local path that starts with a single `/`;
- optional query string or fragment;
- maximum 200 characters.

Reject with `400` and no write:

- absolute URLs;
- protocol-relative URLs beginning with `//`;
- scheme-like values such as `javascript:` or `https:`;
- backslashes;
- control characters;
- paths longer than 200 characters;
- non-string values.

The response may echo the sanitized local path. It must not return a full
redirect URL.

## Safe Response Fields

Allowed success fields:

- `status: "oauth_state_created"`;
- `provider`;
- `purpose: "archive_connector"`;
- `expiresAt`;
- `localRedirectPath`;
- `stateHandle`;
- safe booleans showing credential writes, redirects, callbacks, token
  exchange, provider calls, source inventory, and import writes remain disabled.

Do not return env names, env values, client ids, client secrets, secret tails,
OAuth codes, access tokens, refresh tokens, cookies, credentials, raw external
account ids, raw owner ids, raw row ids, raw session ids, nonce hashes, csrf
hashes, provider payloads, private source bodies, private messages, archive
snippets, SQL/table details, stack traces, hosted logs, storage paths, signed
URLs, prompts, or static secret-shaped fixtures.

## Accepted PR484E Scope

Preferred touched files:

- `apps/api/src/routes/archive-connectors.ts`
- `apps/api/src/routes/archive-connectors.test.ts`
- optionally `apps/api/src/services/archive-connectors/readiness.ts` to export
  a safe provider app config status helper
- optionally a small local helper under
  `apps/api/src/services/archive-connectors/`
- roadmap/status/validation docs

Acceptable local equivalents are fine if the repo structure strongly suggests
them. PR484E should not need migrations, generated DB type changes, package
dependency changes, web UI, or hosted runtime changes.

## Required Tests

DAEDALUS should add focused tests proving:

- signed-out requests are rejected and write no state row;
- unsupported providers are rejected and write no state row;
- missing and partial provider app config return bounded setup-required without
  revealing which side is present and without writing a state row;
- configured archive-specific Reddit and Discord provider app pairs each allow
  a state row to be created independently;
- paused social publishing Reddit config does not satisfy the archive config
  gate;
- missing `ARCHIVE_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY` does not block OAuth
  state creation when provider app config is present;
- invalid local redirect paths are rejected without writes;
- successful responses include only the safe fields above plus a one-time
  `stateHandle`;
- stored rows contain only owner id, provider, purpose, session/nonce/csrf
  hashes, local redirect path, expiry, and `consumed_at: null`;
- stored rows do not contain the raw Bearer token, raw session binding, raw
  state handle, raw nonce, raw csrf, env names, env values, client ids, client
  secrets, row ids in readback, OAuth codes, access tokens, refresh tokens,
  cookies, provider payloads, SQL/table details, stack traces, prompts, or
  secret-shaped fixtures;
- source guards allow `createArchiveConnectorOAuthState` only for the accepted
  start route and continue to forbid credential writes/revokes, OAuth consumes,
  redirects/callbacks, token exchange, provider SDK/calls, source inventory,
  import writes, jobs/queues/workers, Redis, Cloudflare, Stripe/billing,
  provider/model calls, package dependencies, hosted runtime behavior, web UI,
  and social posting behavior.

Required validation before waking ARGUS:

```bash
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/archive-connectors.test.ts
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/archive-connectors.test.ts apps/api/src/services/archive-connectors/credential-storage.test.ts apps/api/src/services/archive-connectors/credential-contract.test.ts apps/api/src/routes/import-preview.test.ts apps/api/src/services/imports/parsers/import-parsers.test.ts apps/api/src/routes/social.test.ts apps/web/lib/social-publishing-readiness.test.ts
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
git diff --cached --check
```

Also run a path/scope scan confirming no redirect/callback route, credential
write/revoke, token exchange, provider call, provider SDK, configured real
credential, source inventory pull, import write, UI, jobs/queues/workers,
Redis, Cloudflare, billing/Stripe, provider/model call, package dependency,
hosted runtime behavior, env value, or static secret-shaped fixture was
introduced.

## ARIADNE Requirement

ARIADNE hosted rehearsal is not required if PR484E remains API-only, local-test
covered, and limited to OAuth state row creation with no UI, provider call,
redirect, callback, token exchange, credential write, source inventory, import
write, or hosted runtime behavior.

If DAEDALUS adds UI, hosted-visible setup flow, redirect/callback behavior,
provider calls, token exchange, credential writes, source inventory, import
writes, or hosted runtime behavior, ARGUS should reject the scope or require a
separate hosted proof lane.

## ARGUS Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/archive-connectors.test.ts apps/api/src/services/archive-connectors/credential-storage.test.ts apps/api/src/services/archive-connectors/credential-contract.test.ts apps/api/src/routes/import-preview.test.ts apps/api/src/services/imports/parsers/import-parsers.test.ts apps/api/src/routes/social.test.ts apps/web/lib/social-publishing-readiness.test.ts` | Pass | 47 tests passed across readiness route, storage, contract, no-write import preview, Reddit/Discord parsers, social fail-closed routes, and web readiness guards. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck replayed successfully from cache. |
| `git diff --check 62e5eed16686531f941b624d96540bb44c74939a..54135436e8eba3f4b1667354aab3ad9a103bb494` | Pass | MIMIR preflight/opening diff is whitespace-clean. |
| Path/scope scan | Pass | MIMIR wakeup diff is docs-only. Current archive connector route/readiness source has no state-start route, provider call, credential write, queue, hosted, billing, package, or social posting behavior. |

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS
```
