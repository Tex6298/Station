# PR484E Archive Connector OAuth State Start Result

Date: 2026-06-29

Owner: DAEDALUS / A2

Status: READY_FOR_ARGUS_REVIEW

## Summary

DAEDALUS implemented the accepted owner/session-bound archive connector OAuth
state start route.

Implemented:

- `POST /archive-connectors/oauth/:provider/start`;
- authenticated `requireAuth` gate;
- `reddit` and `discord` provider allow-list;
- configured archive-specific provider app config gate before any state write;
- one `createArchiveConnectorOAuthState` call on successful start;
- 32-byte random nonce and csrf values encoded into one opaque `stateHandle`;
- route-local SHA-256 auth/session binding derived from owner id and Bearer
  token, with the raw token never returned or stored;
- local redirect path validation before writes;
- bounded success and setup/error responses with all live OAuth/provider/import
  actions disabled;
- focused tests for auth, unsupported provider, missing/partial provider app
  config, independent Reddit/Discord state creation, missing credential
  encryption key not blocking state creation, invalid local redirects, stored
  hash-only rows, sensitive readback, and source guards.

## Files Changed

- `apps/api/src/routes/archive-connectors.ts`
- `apps/api/src/routes/archive-connectors.test.ts`
- `apps/api/src/services/archive-connectors/readiness.ts`
- `docs/roadmap/PR484E_ARCHIVE_CONNECTOR_OAUTH_STATE_START_RESULT.md`
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/roadmap/LANE_INDEX.md`
- `docs/testing/VALIDATION_BASELINE.md`

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/archive-connectors.test.ts` | Pass | 11 tests passed for readiness plus OAuth state start auth, provider/config gates, redirect validation, state row creation, sensitive storage/readback, and source guards. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/archive-connectors.test.ts apps/api/src/services/archive-connectors/credential-storage.test.ts apps/api/src/services/archive-connectors/credential-contract.test.ts apps/api/src/routes/import-preview.test.ts apps/api/src/services/imports/parsers/import-parsers.test.ts apps/api/src/routes/social.test.ts apps/web/lib/social-publishing-readiness.test.ts` | Pass | 51 tests passed across readiness/state-start, storage, contract, no-write import preview, Reddit/Discord parsers, social fail-closed routes, and web readiness guards. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck completed successfully. |

## Boundaries

PR484E does not add OAuth redirects, OAuth callbacks, OAuth consume/callback
handling, OAuth code handling, token exchange, token refresh/revocation,
credential write/revoke routes, provider SDKs, live Reddit/Discord API calls,
configured real test credentials, source inventory pulls, recurring pulls,
import writes, jobs, queues, workers, Redis, Cloudflare, billing/Stripe,
provider/model calls, package dependencies, hosted runtime behavior, public
connector pages, web UI, broad connector marketplace, or social posting
behavior.

The success response returns one opaque `stateHandle` only after authenticated
state creation. It does not return env names, env values, client ids, client
secrets, secret tails, OAuth codes, access tokens, refresh tokens, cookies,
credentials, raw external account ids, raw owner ids, raw row ids, raw session
ids, nonce hashes, csrf hashes, provider payloads, private source bodies,
private messages, archive snippets, SQL/table details, stack traces, hosted
logs, storage paths, signed URLs, prompts, or static secret-shaped fixtures.

## ARGUS Task

Review the state-start route, provider/config gate, local redirect validation,
session binding, state handle constraints, tests, docs, and validation
evidence. If accepted, wake MIMIR with `WAKEUP A1:` for closeout. If fixes are
needed, wake DAEDALUS with `WAKEUP A2:` and the exact route, storage, state
handle, redirect, redaction, source guard, mutation, status, or doc expectation
that failed.
