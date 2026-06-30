# PR484J-C - Archive Connector Credential Decrypt Boundary Result

Owner: DAEDALUS / A2

Date: 2026-06-30

Status: Ready for ARGUS review

## Summary

DAEDALUS implemented the accepted PR484J-C internal decrypt boundary for
source-ready archive connector credentials.

Implemented:

- `loadArchiveConnectorSourceCredentialSecret({ ownerUserId, provider })`
  loads only active owner/provider/purpose `archive_connector` credentials.
- unsupported providers fail before storage access.
- missing, revoked, wrong-owner, wrong-purpose, unsupported-row, and duplicate
  active credential states fail through a common unavailable envelope.
- decrypt is allowed only when stored safe metadata proves
  `scope_profile = source_inventory` and canonical `granted_scopes` exactly
  match the provider source inventory set.
- encrypted credential payloads are validated for schema, algorithm, IV,
  ciphertext, and auth tag before decrypt.
- decrypted token material must independently prove schema, provider,
  `source_inventory`, exact canonical granted scopes, bounded access token, and
  bounded optional refresh token, token type, and expiry.
- stored metadata alone is not enough, and decrypted token material alone is
  not enough.
- the returned value is the internal-only
  `ArchiveConnectorSourceCredentialSecret` shape and is not wired into any
  route, readiness, or credential readback.

## Non-Scope Confirmation

No provider API calls, provider clients, source inventory routes, account
lookup, imports, jobs, UI, hosted proof, packages, billing, Redis, Cloudflare,
marketplace, or social behavior was added.

## Validation

- `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/services/archive-connectors/credential-storage.test.ts apps/api/src/routes/archive-connectors.test.ts apps/api/src/services/archive-connectors/credential-contract.test.ts apps/api/src/routes/import-preview.test.ts apps/api/src/services/imports/parsers/import-parsers.test.ts apps/api/src/routes/social.test.ts apps/web/lib/archive-connector-oauth-callback.test.ts apps/web/lib/social-publishing-readiness.test.ts apps/api/src/middleware/error-handler.test.ts`
  passed with 98 tests.
- `npm exec --yes pnpm@10.32.1 -- run typecheck` passed.
- `git diff --check` passed with CRLF normalization warnings only.

Current lane:

```text
PR484J-C - Archive Connector Credential Decrypt Boundary
Owner: ARGUS / A3
State: READY FOR REVIEW
```

Current baton:

- ARGUS should review PR484J-C against the accepted internal decrypt boundary.
- If accepted, ARGUS should wake MIMIR.
- If fixes are needed, ARGUS should wake DAEDALUS with the smallest patch.
