# PR484C - Connector OAuth Readiness Route Preflight Result

Date: 2026-06-29

Owner: ARGUS / A3

Status: ACCEPT_PR484C_CONNECTOR_READINESS_ROUTE

## Verdict

ARGUS accepts only an authenticated owner-only connector readiness route for
PR484C.

ARGUS rejects an OAuth state create route and a credential write route for this
slice. OAuth state creation would create durable handshake records before
archive-specific provider app config and redirect/callback naming are accepted.
Credential writes are config-blocked locally because
`ARCHIVE_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY` is missing.

The missing encryption key blocks successful credential writes. It does not
block a read-only readiness route that reports safe setup status and performs
no writes.

## Current Repo Findings

- PR484A accepted the provider-neutral contract for `reddit` and `discord`.
- PR484B accepted encrypted credential and OAuth state storage, but no route
  or UI behavior.
- The storage helper can detect whether connector credential encryption config
  is present without exposing values.
- Existing `GET /social/readiness` is an authenticated readback-only route
  pattern, but archive connectors must stay separate from paused social
  publishing.
- Existing `REDDIT_CLIENT_ID` and `REDDIT_CLIENT_SECRET` belong to paused
  social publishing readiness and are not accepted archive connector provider
  app config.
- No Discord archive connector app config contract exists.
- Presence-only local checks found `ARCHIVE_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY`
  missing from `.env` and process env; no values were printed.

## Accepted PR484C Scope

DAEDALUS may implement a read-only API route.

Preferred touched files:

- `apps/api/src/routes/archive-connectors.ts`
- `apps/api/src/routes/archive-connectors.test.ts`
- `apps/api/src/app.ts`
- optionally `apps/api/src/services/archive-connectors/readiness.ts`
- roadmap/status/validation docs

Acceptable local equivalents are fine if the repo structure strongly suggests
another file name, but the route must remain separate from `/social` and from
import write routes.

## Route Shape

Add:

```text
GET /archive-connectors/readiness
```

Required behavior:

- use `requireAuth`;
- return only owner-scoped readback metadata;
- return `reddit` and `discord` only;
- report archive connector purpose only;
- report connector encryption configured as a boolean/status only;
- report provider OAuth app config as missing/not accepted for both providers;
- report credential writes, OAuth state creation, OAuth redirects, OAuth
  callbacks, token exchange, provider calls, source inventory, and import
  writes as disabled in PR484C;
- perform no database reads or writes other than auth token validation;
- perform no provider calls and no fetches;
- ignore paused social publishing env/config when computing archive connector
  readiness.

Allowed response fields:

- purpose;
- mode, such as `readiness_only`;
- provider id, provider label, and auth style;
- owner-only boolean;
- credential storage accepted boolean;
- credential encryption configured boolean or safe status;
- provider OAuth app configured boolean or safe status;
- bounded provider status and next action;
- safety booleans showing provider calls, token exchange, source inventory,
  import writes, OAuth redirects/callbacks, and credential writes are disabled.

The response must not include env var names, env values, access tokens, refresh
tokens, OAuth codes, cookies, credentials, raw external account ids, raw owner
or row ids, provider payloads, private source bodies, private messages, archive
snippets, SQL/table details, table names, stack traces, hosted logs, storage
paths, signed URLs, prompts, or secret-shaped values.

## Explicit Non-Scope

PR484C must not add or change:

- OAuth state create routes;
- OAuth redirect routes;
- OAuth callback routes;
- credential write, credential revoke, token exchange, token refresh, or token
  revocation routes;
- provider SDKs, live Reddit/Discord API calls, configured test credentials,
  source inventory pulls, recurring pulls, import writes, jobs, queues,
  workers, Redis, Cloudflare, billing/Stripe, provider/model calls, package
  dependencies, hosted runtime behavior, public connector pages, web UI, broad
  connector marketplace, or social posting behavior;
- archive source, import job, Memory, Canon, Continuity, public document, or
  review candidate writes.

Do not add archive-specific Reddit/Discord env names in PR484C. MIMIR should
decide provider app config names in a later lane before any redirect/callback
or provider OAuth app readiness can become configured.

## Required Tests

DAEDALUS should add focused tests proving:

- signed-out requests are rejected;
- signed-in owner requests return only `reddit` and `discord`;
- missing `ARCHIVE_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY` returns a bounded
  setup-required/readiness status, not a 500;
- an injected test-only `ARCHIVE_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY` flips the
  encryption configured boolean but still does not enable credential writes,
  OAuth redirects/callbacks, token exchange, provider calls, source inventory,
  or import writes;
- existing social `REDDIT_CLIENT_ID` / `REDDIT_CLIENT_SECRET` values, if set in
  test, do not make archive connector OAuth app config appear configured;
- the response body contains no env names, env values, token/code/cookie/
  credential fixtures, raw row ids, SQL/table details, stack traces, provider
  payloads, storage paths, signed URLs, prompts, or secret-shaped values;
- the fake Supabase client sees no credential/OAuth/import/archive/Memory/
  Canon/Continuity/document table reads or writes beyond auth validation;
- source guards show the route does not call
  `createArchiveConnectorOAuthState`, `storeArchiveConnectorCredential`,
  provider SDKs, `fetch`, queues/workers, Redis, Cloudflare, Stripe/billing,
  provider/model code, or import/archive write paths.

Required validation before waking ARGUS:

```bash
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/archive-connectors.test.ts apps/api/src/services/archive-connectors/credential-storage.test.ts apps/api/src/services/archive-connectors/credential-contract.test.ts apps/api/src/routes/import-preview.test.ts apps/api/src/services/imports/parsers/import-parsers.test.ts apps/api/src/routes/social.test.ts apps/web/lib/social-publishing-readiness.test.ts
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
git diff --cached --check
```

Also run a path/scope scan confirming no OAuth state create route, credential
write route, OAuth redirect/callback route, token exchange, live provider call,
provider SDK, source inventory pull, import write, route/UI expansion beyond
the accepted API route, jobs/queues/workers, Redis, Cloudflare, billing/Stripe,
provider/model call, package dependency, hosted runtime behavior, env value, or
secret-shaped value was introduced.

## ARIADNE Requirement

ARIADNE hosted rehearsal is not required if PR484C stays API-only, read-only,
and locally tested with no UI and no mutation.

If DAEDALUS adds UI, hosted-visible connector setup, OAuth state creation,
credential writes, redirects, callbacks, token exchange, or any provider call,
ARGUS should reject the scope or require a separate hosted proof lane.

## Config Guidance

Marty will need to provide `ARCHIVE_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY` before
any future successful credential-write route can be accepted.

Provider app config names for Reddit and Discord archive connectors remain a
future MIMIR/product decision. Do not treat paused social publishing Reddit env
keys as archive connector config.

## ARGUS Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| Presence-only config check | Pass | `.env` and process env were checked for `ARCHIVE_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY`; both were missing and no values were printed. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/services/archive-connectors/credential-storage.test.ts apps/api/src/services/archive-connectors/credential-contract.test.ts apps/api/src/routes/import-preview.test.ts apps/api/src/services/imports/parsers/import-parsers.test.ts apps/api/src/routes/social.test.ts apps/web/lib/social-publishing-readiness.test.ts` | Pass | 40 tests passed across storage, contract, no-write import preview, Reddit/Discord parsers, social fail-closed routes, and web readiness guards. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck completed successfully. |
| `git diff --check` | Pass | No whitespace errors. |
| Scope scan | Pass | Current route/config matches are existing paused social readiness, accepted storage helpers, docs, or guardrails; no archive connector route exists yet. |

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS
```
