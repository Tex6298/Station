# PR484F-D - Archive Connector OAuth Authorization URL Review Result

Owner: ARGUS / A3

Date: 2026-06-29

Status: Accepted with narrow ARGUS patch

## Verdict

```text
ACCEPT_PR484F_D_AUTHORIZATION_URL_READBACK
```

ARGUS accepts DAEDALUS's PR484F-D implementation after a narrow review patch.

The implementation matches the accepted lane:

- route is `POST /archive-connectors/oauth/:provider/authorize`;
- route stays behind the existing archive connector Bearer auth boundary;
- request body accepts only `stateHandle`;
- provider app config must be complete before URL readback;
- PR484E state is validated for authenticated owner, current Bearer-derived
  session, provider, nonce, csrf, purpose, expiry, and unconsumed status without
  consuming it;
- provider authorization URLs use the `NEXT_PUBLIC_APP_URL` web origin plus the
  accepted PR484F-C callback route;
- Reddit URL uses `response_type=code`, `duration=temporary`, and
  `scope=identity`;
- Discord URL uses `response_type=code` and `scope=identify`;
- client id and state are returned only inside `authorizationUrl`.

## ARGUS Patch

ARGUS applied a narrow review patch before acceptance:

- replaced realistic-looking client-secret test fixtures with neutral marker
  values;
- expanded hosted-origin detection to include Railway's
  `RAILWAY_ENVIRONMENT_NAME` and `RAILWAY_SERVICE_NAME` metadata;
- added a regression proving Railway-hosted metadata rejects localhost callback
  origins.

No new product scope was added by the patch.

## Safety Review

Accepted boundaries remain intact:

- no server redirect;
- no token exchange, refresh, or revocation;
- no credential write or revoke;
- no provider SDK, provider fetch, or live provider call;
- no source inventory, recurring pull, archive source write, import write,
  Memory, Canon, Continuity, public document, or review candidate write;
- no jobs, queues, workers, Redis, Cloudflare, hosted runtime config changes,
  billing, provider/model call, package dependency, broad connector UI,
  marketplace, or social posting behavior.

Sensitive readback stays bounded:

- no separate client id, state handle, redirect URI, scope list, client secret,
  env value, provider account detail, row id, owner id, session id, nonce/csrf
  value, nonce/csrf hash, OAuth code, token material, credential material,
  source data, import data, SQL/table detail, stack trace, hosted log, prompt,
  signed URL, storage path, or secret-shaped value is returned;
- client id and state appear only inside `authorizationUrl`;
- client secret never appears in `authorizationUrl`.

## Remaining Boundary

This lane creates a visitable provider authorization URL, but it still does not
make archive connector OAuth credential connection complete. There is no token
exchange, no refresh-token storage, no provider account readback, and no source
inventory/import path.

ARIADNE hosted proof remains required before MIMIR treats this path as
owner-ready or product-live. The proof must verify the deployed web callback
origin and provider-app redirect registration without printing secrets,
callback query values, provider payloads, tokens, cookies, hosted logs, or real
owner/provider data.

## ARGUS Validation

| Command / check | Result |
| --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/archive-connectors.test.ts` | Passed with 20 tests |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/services/archive-connectors/credential-storage.test.ts` | Passed with 7 tests |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/archive-connectors.test.ts apps/api/src/services/archive-connectors/credential-storage.test.ts apps/api/src/services/archive-connectors/credential-contract.test.ts apps/api/src/routes/import-preview.test.ts apps/api/src/services/imports/parsers/import-parsers.test.ts apps/api/src/routes/social.test.ts apps/web/lib/archive-connector-oauth-callback.test.ts apps/web/lib/social-publishing-readiness.test.ts` | Passed with 64 tests |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Passed |
| `git diff --check` | Passed with CRLF normalization warnings only |
| Source/scope scan | Passed; forbidden token/credential/provider/import/queue/hosted/billing/package/social behavior was not added |

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS accepted PR484F-D Archive Connector OAuth Authorization URL after a narrow review patch.
- The route returns bounded authorization URL readback only: state is validated without consuming, client id/state stay inside authorizationUrl, and minimal Reddit/Discord scopes are used.
Validation:
- Archive connector route tests passed with 20 tests.
- Archive connector credential storage tests passed with 7 tests.
- Combined connector/callback/storage/import/social/web readiness set passed with 64 tests.
- Typecheck passed.
Task:
- Close PR484F-D and choose the next smallest lane.
```
