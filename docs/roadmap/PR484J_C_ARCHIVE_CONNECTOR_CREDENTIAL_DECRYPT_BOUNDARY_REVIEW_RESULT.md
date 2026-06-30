# PR484J-C - Archive Connector Credential Decrypt Boundary Review Result

Owner: ARGUS / A3

Date: 2026-06-30

Status: Accepted for MIMIR

## Verdict

```text
ACCEPT_PR484J_C_CREDENTIAL_DECRYPT_BOUNDARY
```

ARGUS accepts the PR484J-C implementation after a narrow review patch.

Implemented boundary accepted:

- `loadArchiveConnectorSourceCredentialSecret({ ownerUserId, provider })`
  is internal-only and accepts only owner id plus supported provider;
- unsupported providers fail before storage access;
- the helper loads only active owner/provider `archive_connector` credential
  rows and hides missing, revoked, wrong-owner, wrong-purpose,
  unsupported-row, and duplicate active rows behind bounded unavailable errors;
- stored credential metadata must prove `source_inventory` with exact
  canonical provider source scopes before decrypt;
- decrypted token material must independently prove schema, provider,
  `source_inventory`, exact canonical granted scopes, optional canonical raw
  `scope`, bounded access token, and bounded optional refresh token, token
  type, and expiry;
- returned secret material remains internal-only and is not exposed through
  routes, readiness, credential readback, logs, docs examples, or UI.

No provider source reads, source inventory routes, provider clients, account
lookup, imports, jobs, UI, hosted proof, packages, billing, Redis, Cloudflare,
marketplace, or social behavior was added.

## ARGUS Patch

ARGUS made one narrow fail-closed repair:

- source-ready stored metadata and decrypted token material now require the
  exact canonical provider source-scope array, in canonical order, without
  extras or duplicates. The previous implementation normalized before the
  exact-source-ready check, so stored metadata with unknown extra scopes could
  pass the source-ready metadata gate.

Regression coverage was added for extra, duplicate, and reordered stored
scopes, plus reordered, duplicate, and raw-scope-mismatch decrypted token
material.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/services/archive-connectors/credential-storage.test.ts apps/api/src/routes/archive-connectors.test.ts apps/api/src/services/archive-connectors/credential-contract.test.ts` | Pass | 59 focused connector storage/route/contract tests passed after the ARGUS patch. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/services/archive-connectors/credential-storage.test.ts apps/api/src/routes/archive-connectors.test.ts apps/api/src/services/archive-connectors/credential-contract.test.ts apps/api/src/routes/import-preview.test.ts apps/api/src/services/imports/parsers/import-parsers.test.ts apps/api/src/routes/social.test.ts apps/web/lib/archive-connector-oauth-callback.test.ts apps/web/lib/social-publishing-readiness.test.ts apps/api/src/middleware/error-handler.test.ts` | Pass | 98 tests passed across connector storage/route/contract, import preview/parsers, social fail-closed routes, web callback/readiness guards, and error handling. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API typecheck executed and web typecheck replayed from cache. |
| `git diff --check` | Pass | No whitespace errors; CRLF normalization warnings only. |
| Scope/path scan | Pass | Review patch touched archive connector storage/tests and docs only; implementation stayed within accepted internal helper/test/docs surface. |
| Forbidden behavior scan | Pass | Route/source guards and review scans found no provider source API calls, source inventory route, provider client, account lookup, imports, jobs, UI, Redis, Cloudflare, billing, packages, marketplace, or social behavior. |

## Residual Risk

This remains an internal local backend helper. It decrypts existing encrypted
credential rows only after source-ready metadata proof and independent token
material proof. Provider source inventory reads, account lookup, imports,
hosted owner proof, and UI remain separate lanes for MIMIR to sequence.

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS accepted PR484J-C Archive Connector Credential Decrypt Boundary after a narrow exact-scope proof patch.
Task:
- Close PR484J-C or choose the next archive connector move.
- Provider source inventory reads, provider clients, account lookup, imports, UI, hosted proof, packages, billing, Redis, Cloudflare, marketplace, and social behavior remain separate lanes unless explicitly opened.
```
