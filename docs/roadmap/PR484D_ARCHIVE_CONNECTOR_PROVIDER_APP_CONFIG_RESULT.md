# PR484D Archive Connector Provider App Config Result

Date: 2026-06-29

Owner: DAEDALUS / A2

Status: READY_FOR_ARGUS_REVIEW

## Summary

DAEDALUS implemented the accepted archive connector provider app config
contract as env/readiness-only work.

Implemented:

- optional archive-specific provider app env entries in `apps/api/src/lib/env.ts`;
- Reddit and Discord readiness checks using only accepted archive-specific
  provider app names;
- `missing`, `partial`, and `configured` per-provider OAuth app statuses;
- aggregate provider app config acceptance/configured readback;
- partial config redaction that never says which side of the pair is present;
- continued separation from paused social publishing Reddit config;
- continued disabled credential write, OAuth state creation, redirect,
  callback, token exchange, provider call, source inventory, and import write
  states;
- focused route tests for missing, partial, configured, independent provider
  config, social config isolation, mutation absence, sensitive readback, and
  source guards.

## Files Changed

- `apps/api/src/lib/env.ts`
- `apps/api/src/services/archive-connectors/readiness.ts`
- `apps/api/src/routes/archive-connectors.test.ts`
- `docs/roadmap/PR484D_ARCHIVE_CONNECTOR_PROVIDER_APP_CONFIG_RESULT.md`
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/roadmap/LANE_INDEX.md`
- `docs/testing/VALIDATION_BASELINE.md`

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/archive-connectors.test.ts` | Pass | 7 tests passed for auth, missing/partial/configured provider app status, provider independence, social config isolation, no mutation, and source guard coverage. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/archive-connectors.test.ts apps/api/src/services/archive-connectors/credential-storage.test.ts apps/api/src/services/archive-connectors/credential-contract.test.ts apps/api/src/routes/import-preview.test.ts apps/api/src/services/imports/parsers/import-parsers.test.ts apps/api/src/routes/social.test.ts apps/web/lib/social-publishing-readiness.test.ts` | Pass | 47 tests passed across readiness, storage, contract, no-write import preview, Reddit/Discord parsers, social fail-closed routes, and web readiness guards. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck completed successfully. |

## Boundaries

PR484D does not add or change OAuth state creation, OAuth redirects, OAuth
callbacks, credential write/revoke routes, token exchange, token refresh,
token revocation, provider SDKs, live Reddit/Discord API calls, configured real
test credentials, source inventory pulls, recurring pulls, import writes,
jobs, queues, workers, Redis, Cloudflare, billing/Stripe, provider/model calls,
package dependencies, hosted runtime behavior, public connector pages, web UI,
broad connector marketplace, or social posting behavior.

The readiness response does not include env names, env values, client ids,
client secrets, secret tails, OAuth codes, access tokens, refresh tokens,
cookies, credentials, raw external account ids, raw owner/row ids, provider
payloads, private source bodies, private messages, archive snippets, SQL/table
details, stack traces, hosted logs, storage paths, signed URLs, prompts, or
secret-shaped values.

## ARGUS Task

Review the env schema additions, readiness semantics, route tests, docs, and
validation evidence. If accepted, wake MIMIR with `WAKEUP A1:` for closeout.
If fixes are needed, wake DAEDALUS with `WAKEUP A2:` and the exact env,
readiness, redaction, source guard, mutation, status, or doc expectation that
failed.
