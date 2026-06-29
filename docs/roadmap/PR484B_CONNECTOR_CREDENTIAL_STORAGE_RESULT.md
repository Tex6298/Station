# PR484B Connector Credential Storage Result

Date: 2026-06-29

Owner: DAEDALUS / A2

Status: READY_FOR_ARGUS_REVIEW

## Summary

DAEDALUS implemented the accepted encrypted archive connector credential store
and separate OAuth state store in migration/service/test/docs scope only.

Implemented:

- migration `062_archive_connector_credentials.sql`;
- DB type surfaces for `archive_connector_credentials` and
  `archive_connector_oauth_states`;
- connector-specific AES-256-GCM credential encryption using
  `ARCHIVE_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY`;
- credential fingerprinting and optional external account fingerprinting;
- sanitized account labels and safe metadata-only readback;
- replacement ordering that encrypts and fingerprints new material before
  revoking any active row;
- revocation helpers returning safe metadata only;
- one-time OAuth state creation and consume helpers using nonce/csrf hashes;
- architecture notes for storage, encryption, readback, OAuth state, and
  non-goals.

## Files Changed

- `infra/supabase/migrations/062_archive_connector_credentials.sql`
- `packages/db/src/types.ts`
- `apps/api/src/services/archive-connectors/credential-storage.ts`
- `apps/api/src/services/archive-connectors/credential-storage.test.ts`
- `docs/architecture/live-archive-connector-credential-storage.md`
- `docs/roadmap/PR484B_CONNECTOR_CREDENTIAL_STORAGE_RESULT.md`
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/roadmap/LANE_INDEX.md`
- `docs/testing/VALIDATION_BASELINE.md`

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/services/archive-connectors/credential-storage.test.ts apps/api/src/services/archive-connectors/credential-contract.test.ts apps/api/src/routes/import-preview.test.ts apps/api/src/services/imports/parsers/import-parsers.test.ts apps/api/src/routes/social.test.ts apps/web/lib/social-publishing-readiness.test.ts` | Pass | 40 tests passed across storage, contract, no-write import preview, Reddit/Discord parsers, social route fail-closed behavior, and web readiness source guards. |
| `npm exec --yes pnpm@10.32.1 -- run test:ai-settings` | Pass | 12 tests passed; AI BYOK storage remains green and separate. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck both ran successfully. |

## Boundaries

PR484B does not add live Reddit API calls, Discord API calls, OAuth redirects,
OAuth callback routes, token exchange, token refresh/revocation execution,
provider SDKs, configured test credentials, source inventory pulls, recurring
pulls, import writes, route/UI behavior, public connector pages, cross-owner
connector access, jobs, queues, workers, Redis, Cloudflare, billing/Stripe,
provider/model calls, package dependencies, or hosted runtime behavior.

Safe readback excludes raw tokens, refresh tokens, OAuth codes, cookies,
credentials, encrypted payloads, ciphertext, auth tags, token tails, raw
external account ids, provider payloads, private source bodies, private
messages, archive snippets, SQL/table output, stack traces, prompts, storage
paths, signed URLs, hosted logs, and secret-shaped values.

## ARGUS Task

Review the migration, DB types, storage service, OAuth state helpers, tests,
architecture note, and validation evidence. If accepted, wake MIMIR with
`WAKEUP A1:` for closeout. If fixes are needed, wake DAEDALUS with
`WAKEUP A2:` and the exact migration, type, service, storage ordering, OAuth
state, redaction, source guard, or doc expectation that failed.
