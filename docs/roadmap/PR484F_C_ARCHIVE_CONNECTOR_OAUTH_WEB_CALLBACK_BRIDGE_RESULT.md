# PR484F-C - Archive Connector OAuth Web Callback Bridge Result

Owner: DAEDALUS / A2

Date: 2026-06-29

Status: Ready for ARGUS review

## Implementation

DAEDALUS implemented the bounded PR484F-C web callback bridge accepted by
ARGUS:

- added public web callback route
  `/archive-connectors/oauth/callback/[provider]`;
- the web route copies callback query values, immediately removes the query
  from browser history, then validates provider/state/code before any auth or
  API verify work;
- the web route reads the already stored Station browser session access token
  directly and does not call `getSession`, `restoreSession`, token refresh, or
  login redirect helpers;
- missing/stale/auth-mismatched and provider-error paths render bounded
  restart copy and do not forward callback query values to `/login`;
- added authenticated API verify route
  `POST /archive-connectors/oauth/:provider/callback/verify` under the
  existing archive connector `requireAuth` boundary;
- the API route validates provider, accepts only `{ stateHandle, code }`,
  validates the PR484E nonce/csrf state-handle shape, validates a bounded code
  string, consumes the existing OAuth state once with owner/provider/nonce/csrf/
  Bearer-derived session binding, discards the code, and returns only bounded
  readback;
- callback verify responses expose only status, provider, purpose, consumed
  boolean, local redirect path, and disabled capability booleans.

## Non-Scope Confirmation

This implementation does not add authorization URL generation, server
redirects, token exchange, credential writes or revocation, provider SDK calls,
provider fetches, source inventory, import writes, queues, hosted runtime,
Cloudflare, Redis, billing, package changes, broad connector settings UI, or
social posting behavior.

The API response and web restart states do not return callback code, state
handle, nonce, csrf, session hash, owner id, row id, auth token, provider
payload, credential material, raw external account id, table/schema detail,
stack traces, hosted logs, secret-shaped values, or provider
`error_description` text.

## Validation

| Command / check | Result |
| --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/archive-connectors.test.ts` | Passed with 15 tests |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/archive-connector-oauth-callback.test.ts` | Passed with 4 tests |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/archive-connectors.test.ts apps/api/src/services/archive-connectors/credential-storage.test.ts apps/api/src/services/archive-connectors/credential-contract.test.ts apps/api/src/routes/import-preview.test.ts apps/api/src/services/imports/parsers/import-parsers.test.ts apps/api/src/routes/social.test.ts apps/web/lib/archive-connector-oauth-callback.test.ts apps/web/lib/social-publishing-readiness.test.ts` | Passed with 59 tests |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Passed |
| `git diff --check` | Passed with CRLF normalization warnings only |

## Current Lane

```text
PR484F-C - Archive Connector OAuth Web Callback Bridge
Owner: ARGUS / A3
State: READY FOR REVIEW
```

## Wakeup

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS implemented the accepted PR484F-C bounded web callback bridge.
- Web callback query values are scrubbed before auth recovery or API verify.
- API verify consumes PR484E state once with owner/provider/nonce/csrf/session binding and discards the code.
Validation:
- archive connector route tests pass with 15 tests.
- web callback helper/source tests pass with 4 tests.
- combined connector/import/social/web readiness set passes with 59 tests.
- typecheck passes.
Risk:
- ARGUS should hostile-review URL scrub ordering, no token refresh before verify, one-time state consumption, sensitive readback, and source-scope guards.
Task:
- Review PR484F-C. If accepted, wake MIMIR. If fixes are needed, wake DAEDALUS with the smallest repair.
```
