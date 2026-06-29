# PR484C Connector OAuth Readiness Route Result

Date: 2026-06-29

Owner: DAEDALUS / A2

Status: READY_FOR_ARGUS_REVIEW

## Summary

DAEDALUS implemented the accepted owner-only read-only archive connector
readiness route.

Implemented:

- `GET /archive-connectors/readiness`;
- authenticated `requireAuth` gate;
- route wiring in `apps/api/src/app.ts`;
- readiness service for `reddit` and `discord` archive connectors only;
- safe readiness metadata for connector credential encryption status;
- provider OAuth app status as not accepted/configured for both providers;
- disabled credential write, OAuth state creation, redirect, callback, token
  exchange, provider call, source inventory, and import write states;
- focused route tests for auth, missing encryption config, injected encryption
  config, social config isolation, mutation absence, sensitive readback, and
  source guards.

## Files Changed

- `apps/api/src/routes/archive-connectors.ts`
- `apps/api/src/routes/archive-connectors.test.ts`
- `apps/api/src/services/archive-connectors/readiness.ts`
- `apps/api/src/app.ts`
- `docs/roadmap/PR484C_CONNECTOR_OAUTH_READINESS_ROUTE_RESULT.md`
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/roadmap/LANE_INDEX.md`
- `docs/testing/VALIDATION_BASELINE.md`

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/archive-connectors.test.ts` | Pass | 4 tests passed for auth, bounded readiness, encryption boolean flip, social config isolation, no mutation, and source guard coverage. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/archive-connectors.test.ts apps/api/src/services/archive-connectors/credential-storage.test.ts apps/api/src/services/archive-connectors/credential-contract.test.ts apps/api/src/routes/import-preview.test.ts apps/api/src/services/imports/parsers/import-parsers.test.ts apps/api/src/routes/social.test.ts apps/web/lib/social-publishing-readiness.test.ts` | Pass | 44 tests passed across the new route, storage, contract, no-write import preview, Reddit/Discord parsers, social fail-closed routes, and web readiness guards. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck completed successfully. |

## Boundaries

PR484C does not add OAuth state creation, credential writes, credential revoke,
OAuth redirects, OAuth callback routes, token exchange, token refresh,
provider SDKs, live Reddit/Discord API calls, configured test credentials,
source inventory pulls, recurring pulls, import writes, jobs, queues, workers,
Redis, Cloudflare, billing/Stripe, provider/model calls, package dependencies,
hosted runtime behavior, public connector pages, web UI, broad connector
marketplace, or social posting behavior.

The readiness response does not include env var names, env values, access
tokens, refresh tokens, OAuth codes, cookies, credentials, raw external account
ids, raw owner or row ids, provider payloads, private source bodies, private
messages, archive snippets, SQL/table details, table names, stack traces,
hosted logs, storage paths, signed URLs, prompts, or secret-shaped values.

## ARGUS Task

Review the route, readiness service, app wiring, focused tests, docs, and
validation evidence. If accepted, wake MIMIR with `WAKEUP A1:` for closeout.
If fixes are needed, wake DAEDALUS with `WAKEUP A2:` and the exact route,
readiness shape, auth gate, redaction, source guard, mutation, app wiring, or
doc expectation that failed.
