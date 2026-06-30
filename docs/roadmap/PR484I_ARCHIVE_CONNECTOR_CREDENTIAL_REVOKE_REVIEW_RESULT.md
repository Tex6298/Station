# PR484I - Archive Connector Credential Revoke / Disconnect Review Result

Owner: ARGUS / A3

Date: 2026-06-30

Status: Accepted for MIMIR

## Verdict

```text
ACCEPT_PR484I_LOCAL_CREDENTIAL_REVOKE
```

ARGUS reviewed DAEDALUS's PR484I implementation and accepts it without an
ARGUS code patch.

## Review Result

Accepted implementation:

- authenticated
  `POST /archive-connectors/credentials/:provider/revoke`;
- existing archive connector Bearer auth boundary;
- supported providers only: `reddit` and `discord`;
- absent body or empty JSON object only;
- body keys, arrays, and scalar JSON bodies are rejected before storage
  mutation without echoing body text;
- local revoke only updates active owner/provider/purpose
  `archive_connector` credential rows;
- already-revoked and missing providers return bounded `200` no-op states;
- response returns provider-only safe credential metadata or
  `credential: null`;
- local revoke does not require archive connector credential encryption config;
- storage failures return bounded Station errors without table, SQL, row,
  owner, stack, encrypted blob, or token details.

Accepted hardening:

- shared JSON parse failures now return the generic global `400` envelope
  instead of body-parser excerpts;
- this is accepted as a redaction guard for scalar request bodies that fail
  before route validation.

No provider-side token revocation, token decrypt, token exchange, credential
write, OAuth callback/authorization URL change, provider profile/account
lookup, provider/source API call, source inventory, import, recurring pull,
queue, worker, Redis, Cloudflare, billing, package, broad UI, marketplace, or
social behavior was added.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/archive-connectors.test.ts apps/api/src/middleware/error-handler.test.ts` | Pass | 40 tests passed across archive connector route behavior and error-handler redaction. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/archive-connectors.test.ts apps/api/src/services/archive-connectors/credential-storage.test.ts apps/api/src/services/archive-connectors/credential-contract.test.ts apps/api/src/routes/import-preview.test.ts apps/api/src/services/imports/parsers/import-parsers.test.ts apps/api/src/routes/social.test.ts apps/web/lib/archive-connector-oauth-callback.test.ts apps/web/lib/social-publishing-readiness.test.ts apps/api/src/middleware/error-handler.test.ts` | Pass | 84 tests passed across connector route/storage/contract, callback bridge, import preview/parsers, social fail-closed routes, web readiness guards, and error handling. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck completed successfully. |
| `git diff --check 1bd7848ba47464b1223288f494eda4d4d4f5a74d..a658b03dcdf15fe649b4b523be01ba445e38985c` | Pass | No whitespace errors. |
| Scope/path scan | Pass | Implementation touched `apps/api` and docs only; no package, lockfile, Supabase schema, or web path changed. |

## Remaining Truth

PR484I is accepted as local/backend disconnect behavior. It is not
provider-side revocation and must not be described as revoking the external
Reddit or Discord app authorization.

Hosted owner-ready proof remains deferred until MIMIR opens a visible owner
connector surface or hosted disconnect rehearsal with deployed config.

Source inventory, provider account lookup, imports, provider-side revoke, and
UI remain separate future lanes.

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS accepted PR484I Archive Connector Credential Revoke / Disconnect.
Validation:
- route plus error-handler tests pass with 40 tests.
- combined connector/callback/storage/import/social/web readiness plus error-handler set passes with 84 tests.
- typecheck passes.
- diff check and scope/path scan pass.
Task:
- Close PR484I or decide the next archive connector move.
- Keep provider-side revocation, source inventory, imports, UI, hosted proof, and provider calls in separate lanes unless explicitly opened.
```
