# PR484G - Archive Connector OAuth Token Exchange / Credential Write Review Result

Owner: ARGUS / A3

Date: 2026-06-30

Status: Accepted for MIMIR

## Verdict

```text
ACCEPT_PR484G_TOKEN_EXCHANGE_CREDENTIAL_WRITE
```

ARGUS reviewed DAEDALUS's PR484G implementation and accepts it with a narrow
claim-honesty patch.

## Review Result

Accepted implementation:

- authenticated route
  `POST /archive-connectors/oauth/:provider/callback/exchange`;
- existing callback verify route semantics stay unchanged;
- request body accepts exactly bounded `stateHandle` and `code`;
- provider app config, credential encryption config, safe callback origin, and
  owner/session/provider-bound PR484E state are checked before token endpoint
  work;
- missing provider app config, missing or malformed encryption config, unsafe
  origin, and invalid state fail before provider fetch or credential write;
- state is consumed exactly once immediately before the provider token endpoint
  request;
- Reddit token exchange is limited to
  `https://www.reddit.com/api/v1/access_token` with POST form encoding and
  HTTP Basic archive app auth;
- Discord token exchange is limited to
  `https://discord.com/api/oauth2/token` with POST form encoding and accepted
  client id/client secret field placement;
- token responses are bounded and scope-checked to the connect-proof scopes;
- token/provider failures and credential write failures return bounded Station
  errors without provider payload or token readback;
- encrypted credential storage receives only bounded token material through the
  accepted helper and returns safe credential metadata only;
- no provider profile/account lookup, source inventory, imports, refresh,
  revocation, recurring pull, queue, worker, Redis, Cloudflare, billing,
  package, broad UI, marketplace, or social behavior was added.

## ARGUS Patch

ARGUS patched a stale readiness claim:

- configured-provider `nextAction` no longer says a future lane must add
  owner-bound OAuth state creation before redirects;
- the replacement copy says accepted OAuth start, authorization URL, callback,
  and token exchange routes remain owner-gated while source inventory and
  imports require future lanes;
- a route test now guards against the stale claim returning.

No route behavior, token endpoint behavior, credential storage behavior, schema,
package, UI, hosted runtime, import, source inventory, queue, billing,
Cloudflare, Redis, marketplace, or social behavior changed in the ARGUS patch.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/archive-connectors.test.ts` | Pass | 26 tests passed after the ARGUS readiness claim patch. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/services/archive-connectors/credential-storage.test.ts` | Pass | 7 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/archive-connectors.test.ts apps/api/src/services/archive-connectors/credential-storage.test.ts apps/api/src/services/archive-connectors/credential-contract.test.ts apps/api/src/routes/import-preview.test.ts apps/api/src/services/imports/parsers/import-parsers.test.ts apps/api/src/routes/social.test.ts apps/web/lib/archive-connector-oauth-callback.test.ts apps/web/lib/social-publishing-readiness.test.ts` | Pass | 70 tests passed across connector route/storage/contract, callback bridge, import preview/parsers, social fail-closed routes, and web readiness guards. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck completed successfully. |
| `git diff --check` | Pass | No whitespace errors; CRLF normalization warnings only for touched source files. |
| Scope/path scan | Pass | No package, lockfile, Supabase schema, or web path changed in PR484G implementation or ARGUS patch. |

## Remaining Truth

PR484G is accepted as a local/backend implementation. It is not owner-ready or
product-live until hosted config exists and ARIADNE proves the deployed flow.

PR484F-E remains parked until Railway `@station/api` has archive connector
credential encryption plus at least one archive-specific provider app pair and
matching hosted callback redirect URI.

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS accepted PR484G Archive Connector OAuth Token Exchange / Credential Write with a narrow readiness-claim patch.
Validation:
- archive connector route tests pass with 26 tests.
- archive connector credential storage tests pass with 7 tests.
- combined connector/callback/storage/import/social/web readiness set passes with 70 tests.
- typecheck passes.
- diff check and scope/path scan pass.
Task:
- Close PR484G or decide the next archive connector move.
- Do not claim owner-ready/product-live token exchange until hosted config exists and ARIADNE proves the deployed flow.
```
