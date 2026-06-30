# PR484J-D - Archive Connector Provider Account Lookup Review Result

Owner: ARGUS / A3

Date: 2026-06-30

Status: Accepted for MIMIR

## Verdict

```text
ACCEPT_PR484J_D_PROVIDER_ACCOUNT_LOOKUP
```

ARGUS accepts the PR484J-D implementation after a narrow review patch.

Implemented boundary accepted:

- backend-only account proof before source inventory;
- internal account credential decrypt accepts exact canonical `connect` and
  `source_inventory` credentials only;
- stored credential metadata and decrypted token material must agree on the
  exact scope profile and canonical scopes before account lookup;
- provider calls are limited to Reddit `/api/v1/me?raw_json=1` and Discord
  `/users/@me`;
- one authenticated owner-only empty-body route:
  `POST /archive-connectors/credentials/:provider/account/lookup`;
- successful lookup updates only safe `account_label` and
  `external_account_fingerprint` metadata on the active owner/provider
  credential row;
- existing external account fingerprint mismatch fails closed and requires
  reconnect;
- route/readback exposes only safe credential metadata and safety booleans.

No source inventory/listing reads, imports, jobs, UI, hosted proof, packages,
billing, Redis, Cloudflare, marketplace, social behavior, token refresh/revoke,
provider payload readback, or raw provider id readback was added.

## ARGUS Patch

ARGUS made one narrow fail-closed repair:

- `loadArchiveConnectorAccountCredentialSecret` now requires the decrypted token
  material `scopeProfile` to match the stored row `scope_profile`. Previously,
  stored metadata and decrypted token material were each validated as exact
  account-proof profiles, but a stored `connect` row with encrypted
  `source_inventory` material, or the reverse, could still pass account-proof
  decrypt.

Regression coverage now proves both stored-connect/token-source and
stored-source/token-connect profile mismatches fail with
`archive_connector_account_credential_token_invalid`.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/services/archive-connectors/credential-storage.test.ts apps/api/src/routes/archive-connectors.test.ts` | Pass | 58 focused connector storage/route tests passed after the ARGUS patch. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/services/archive-connectors/credential-storage.test.ts apps/api/src/services/archive-connectors/credential-contract.test.ts apps/api/src/routes/archive-connectors.test.ts apps/api/src/routes/import-preview.test.ts apps/api/src/services/imports/parsers/import-parsers.test.ts apps/api/src/routes/social.test.ts apps/web/lib/archive-connector-oauth-callback.test.ts apps/web/lib/social-publishing-readiness.test.ts apps/api/src/middleware/error-handler.test.ts` | Pass | 106 tests passed across connector storage/contract/routes, import preview/parsers, social fail-closed routes, web callback/readiness guards, and error handling. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API typecheck executed and web typecheck replayed from cache. |
| `git diff --check` | Pass | No whitespace errors; CRLF normalization warnings only. |
| Scope/path scan | Pass | ARGUS patch touched only archive connector credential storage/tests and docs. The DAEDALUS implementation stayed within archive connector route/service/storage/tests and docs. |
| Forbidden behavior scan | Pass | Source guards and review scans found only the accepted Reddit `/api/v1/me` and Discord `/users/@me` provider account endpoints; no source inventory/listing endpoint, import write, job, UI, package, billing, Redis, Cloudflare, marketplace, or social behavior entered the lane. |

## Residual Risk

This is a backend account-proof lane only. It proves and records safe account
metadata for the owner, but it does not perform source inventory, source body
reads, import confirmation, hosted owner proof, or UI work. Those remain
separate lanes for MIMIR to sequence.

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS accepted PR484J-D Archive Connector Provider Account Lookup after a narrow stored/decrypted scope-profile agreement patch.
Task:
- Close PR484J-D or choose the next archive connector move.
- Source inventory/listing reads, imports, jobs, UI, hosted proof, packages, billing, Redis, Cloudflare, marketplace, social behavior, token refresh/revoke, provider payload readback, and raw provider id readback remain separate lanes unless explicitly opened.
```
