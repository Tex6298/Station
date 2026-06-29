# PR484E - Archive Connector OAuth State Start ARGUS Review Result

Date: 2026-06-29

Owner: ARGUS / A3

Status: ARGUS_ACCEPTED_PR484E_OAUTH_STATE_START_ROUTE

## Verdict

ARGUS accepts PR484E after a narrow review hardening patch.

The implementation matches the accepted lane: authenticated
`POST /archive-connectors/oauth/:provider/start`, `reddit` / `discord` only,
provider-config-gated state creation, one hash-only OAuth state row per
successful start, and one opaque state handle returned only on success.

ARIADNE hosted rehearsal is not required because PR484E is API-only,
local-test covered, and adds no UI, provider call, redirect, callback, token
exchange, credential write, source inventory, import write, package dependency,
or hosted runtime behavior.

## ARGUS Review Patch

ARGUS made a narrow response-hardening patch:

- setup-required state-start errors no longer return `oauthAppStatus`, so the
  route does not distinguish missing provider app config from partial provider
  app config;
- OAuth state storage failures now return a bounded
  `archive_connector_oauth_state_start_failed` response with no raw
  `stateHandle`;
- route tests cover the bounded storage failure path and the no-config-detail
  setup response.

This patch stays inside the accepted PR484E route/test scope.

## Review Notes

Accepted:

- the route is authenticated through `requireAuth`;
- unsupported providers are rejected before state writes;
- missing or partial archive-specific provider app config fails closed without
  writing a state row or revealing which side is present;
- paused social publishing Reddit config does not satisfy the archive connector
  config gate;
- missing `ARCHIVE_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY` does not block state
  creation;
- nonce and csrf are generated with 32 random bytes each and returned only as
  the one-time `stateHandle`;
- stored OAuth state rows contain hashes for session, nonce, and csrf, and do
  not store the raw Bearer token, raw session binding, raw state handle, raw
  nonce, or raw csrf;
- local redirect paths are validated before writes and only local paths are
  echoed in the response;
- safe response tests exclude env names, env values, token/code/cookie/
  credential fixtures, raw owner ids, raw row ids, raw session ids, table
  names, SQL/stack details, provider payloads, storage paths, signed URLs,
  prompts, and static secret-shaped fixtures.

Non-scope confirmed:

- no OAuth redirect route;
- no OAuth callback or consume route;
- no credential write/revoke route;
- no token exchange, refresh, or revocation execution;
- no provider SDK, live Reddit/Discord API call, configured real test
  credential, source inventory pull, recurring pull, import write, route UI,
  job, queue, worker, Redis, Cloudflare, billing/Stripe, provider/model call,
  package dependency, hosted runtime behavior, public connector page, broad
  connector marketplace, or social posting behavior.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/archive-connectors.test.ts` | Pass | 12 tests passed after the ARGUS setup-detail/storage-failure patch. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/archive-connectors.test.ts apps/api/src/services/archive-connectors/credential-storage.test.ts apps/api/src/services/archive-connectors/credential-contract.test.ts apps/api/src/routes/import-preview.test.ts apps/api/src/services/imports/parsers/import-parsers.test.ts apps/api/src/routes/social.test.ts apps/web/lib/social-publishing-readiness.test.ts` | Pass | 52 tests passed across readiness/state-start, storage, contract, no-write import preview, Reddit/Discord parsers, social fail-closed routes, and web readiness guards. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API typecheck ran successfully; web typecheck replayed from cache. |
| `git diff --check` | Pass | No whitespace errors; CRLF normalization warnings only. |
| Path/scope scan | Pass | Changed paths stay within accepted PR484E route/helper-test/docs/status files plus the A3 receipt. |
| Source/scope scan | Pass | Targeted scans found no redirect/callback, token exchange execution, credential write/revoke, OAuth consume, provider call/fetch, import/archive write, queue, Redis, Cloudflare, billing, provider/model, package, hosted runtime, or social config coupling. |

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
```
