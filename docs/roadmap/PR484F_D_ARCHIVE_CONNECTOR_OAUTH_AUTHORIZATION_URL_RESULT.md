# PR484F-D - Archive Connector OAuth Authorization URL Result

Owner: DAEDALUS / A2

Date: 2026-06-29

Status: Ready for ARGUS review

## Implementation

DAEDALUS implemented the bounded PR484F-D authorization URL readback accepted by
ARGUS:

- added authenticated owner-only route
  `POST /archive-connectors/oauth/:provider/authorize`;
- request body accepts only `{ stateHandle }` and rejects query state or extra
  body fields;
- added `validateArchiveConnectorOAuthState` so authorization URL readback
  proves an existing PR484E state for the authenticated owner/current Bearer
  session without consuming it;
- authorize validates provider allow-list, nonce/csrf state shape, owner,
  session binding, provider, purpose, expiry, and unconsumed state;
- provider app config must be complete before URL readback, but client id is
  returned only inside `authorizationUrl`;
- redirect URI is built from `NEXT_PUBLIC_APP_URL` origin plus the PR484F-C web
  callback route, never from request headers, API URL, Origin, Referer, Host, or
  forwarded headers;
- Reddit URL uses `https://www.reddit.com/api/v1/authorize`,
  `response_type=code`, `duration=temporary`, and `scope=identity`;
- Discord URL uses `https://discord.com/oauth2/authorize`,
  `response_type=code`, and `scope=identify`;
- repeated authorization URL readback for the same unconsumed state returns the
  same URL and leaves `consumed_at` null.

## Non-Scope Confirmation

This implementation does not add server redirects, token exchange, token
refresh/revocation, credential writes or revocation, provider SDK calls,
provider fetches, source inventory, import writes, queues, hosted runtime
config, Cloudflare, Redis, billing, package changes, broad connector UI,
marketplace behavior, or social posting.

The response does not return separate client id, state handle, redirect URI,
scope list, client secret, env names, env values, provider account details,
row id, owner id, session id, nonce/csrf values, nonce/csrf hashes, OAuth code,
token material, credential material, source data, import data, SQL/table
detail, stack traces, hosted logs, prompts, signed URLs, storage paths, or
secret-shaped values.

## Validation

| Command / check | Result |
| --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/archive-connectors.test.ts` | Passed with 20 tests |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/services/archive-connectors/credential-storage.test.ts` | Passed with 7 tests |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/archive-connectors.test.ts apps/api/src/services/archive-connectors/credential-storage.test.ts apps/api/src/services/archive-connectors/credential-contract.test.ts apps/api/src/routes/import-preview.test.ts apps/api/src/services/imports/parsers/import-parsers.test.ts apps/api/src/routes/social.test.ts apps/web/lib/archive-connector-oauth-callback.test.ts apps/web/lib/social-publishing-readiness.test.ts` | Passed with 64 tests |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Passed |
| `git diff --check` | Passed with CRLF normalization warnings only |

## Current Lane

```text
PR484F-D - Archive Connector OAuth Authorization URL
Owner: ARGUS / A3
State: READY FOR REVIEW
```

## Wakeup

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS implemented the accepted PR484F-D bounded authorization URL readback.
- The route validates an existing unexpired/unconsumed PR484E state for the authenticated owner/session without consuming it.
- Authorization URLs use NEXT_PUBLIC_APP_URL web callback origin plus Reddit identity or Discord identify scopes only.
Validation:
- archive connector route tests pass with 20 tests.
- archive connector credential storage tests pass with 7 tests.
- combined connector/callback/storage/import/social/web readiness set passes with 64 tests.
- typecheck passes.
Risk:
- ARGUS should hostile-review non-consuming state validation, redirect URI policy, client id/state containment inside authorizationUrl, minimal scopes, and source-scope guards.
Task:
- Review PR484F-D. If accepted, wake MIMIR. If fixes are needed, wake DAEDALUS with the smallest repair.
```
