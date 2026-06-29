# PR484B - Connector Credential Storage ARGUS Review Result

Date: 2026-06-29

Owner: ARGUS / A3

Status: ARGUS_ACCEPTED_PR484B_CONNECTOR_CREDENTIAL_STORAGE

## Verdict

ARGUS accepts PR484B after a narrow review hardening patch.

The implementation matches the accepted lane: migration, DB types, API service,
tests, and docs only. It adds encrypted owner-scoped archive connector
credential storage and separate OAuth state storage for `reddit` and `discord`
without making connectors live.

ARIADNE hosted rehearsal is not required because no visible route, UI, hosted
API behavior, OAuth redirect/callback, provider call, or import flow changed.

## ARGUS Review Patch

ARGUS made a narrow privacy/state-hardening patch:

- OAuth state rows now store `session_id_hash` instead of raw `session_id`;
- OAuth state tests prove the raw session fixture is not stored;
- safe credential and OAuth readback shapes no longer include internal row ids;
- OAuth consume updates only rows that still have `consumed_at = null`;
- architecture/status/preflight docs now say session, nonce, and csrf values
  are stored as hashes.

This patch stays inside the accepted PR484B storage/test/docs scope.

## Review Notes

Accepted:

- migration `062_archive_connector_credentials.sql` creates separate
  owner-scoped credential and OAuth state tables with provider/purpose checks,
  owner-only RLS, active credential uniqueness, and updated-at triggers;
- DB types expose only `reddit` / `discord`, `archive_connector`, and
  `active` / `revoked` credential states for this lane;
- the storage service uses
  `ARCHIVE_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY`, AES-256-GCM, and schema
  `station.archive_connector.credential.v1`;
- missing or malformed encryption config fails before any active credential is
  revoked;
- credential readbacks return safe metadata only and omit encrypted payloads,
  ciphertext, auth tags, token tails, raw external account ids, raw session
  ids, callback codes, cookies, provider payloads, private source bodies,
  prompts, storage paths, signed URLs, SQL/table output, hosted logs, and
  secret-shaped values;
- OAuth state storage is separate from credentials, hashes session/nonce/csrf
  values, validates local redirect paths, enforces owner/session/provider/
  purpose/csrf/expiry checks, and consumes state once;
- source guards and diff scans found no live Reddit/Discord calls, OAuth
  redirects/callback routes, token exchange, provider SDKs, source inventory
  pulls, import writes, route/UI behavior, jobs, queues, Redis, Cloudflare,
  billing/Stripe, provider/model calls, package dependency changes, or hosted
  runtime changes.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/services/archive-connectors/credential-storage.test.ts` | Pass | 7 tests passed after the ARGUS hash/readback patch. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/services/archive-connectors/credential-storage.test.ts apps/api/src/services/archive-connectors/credential-contract.test.ts apps/api/src/routes/import-preview.test.ts apps/api/src/services/imports/parsers/import-parsers.test.ts apps/api/src/routes/social.test.ts apps/web/lib/social-publishing-readiness.test.ts` | Pass | 40 tests passed across storage, contract, no-write import preview, Reddit/Discord parsers, social fail-closed routes, and web readiness guards. |
| `npm exec --yes pnpm@10.32.1 -- run test:ai-settings` | Pass | 12 tests passed; AI BYOK storage remains green and separate. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck completed successfully. |
| `git diff --check` | Pass | No whitespace errors; CRLF normalization warnings only. |
| Path/scope scan | Pass | Changed paths stayed within A3 receipt plus accepted PR484B migration/service/test/docs/status files. |
| Sensitive/scope scan | Pass | Hits were expected encrypted payload fields, negative fixtures, tests, or guardrail docs; no real secret, live connector behavior, raw session storage, or readback leak was found. |

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
```
