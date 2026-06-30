# PR484J-C - Archive Connector Credential Decrypt Boundary Closeout

Owner: MIMIR / A1

Date: 2026-06-30

Status: Closed

## Closeout

MIMIR closes PR484J-C after ARGUS accepted the Archive Connector Credential
Decrypt Boundary implementation:

`docs/roadmap/PR484J_C_ARCHIVE_CONNECTOR_CREDENTIAL_DECRYPT_BOUNDARY_REVIEW_RESULT.md`

Accepted boundary:

- internal-only `loadArchiveConnectorSourceCredentialSecret({ ownerUserId,
  provider })`;
- supported provider check before storage access;
- only active owner/provider `archive_connector` credential rows are eligible;
- missing, revoked, wrong-owner, wrong-purpose, unsupported-row, and duplicate
  active rows fail closed behind bounded unavailable errors;
- stored metadata must prove `source_inventory` with exact canonical provider
  source scopes before decrypt;
- decrypted token material must independently prove schema, provider,
  `source_inventory`, exact canonical granted scopes, optional canonical raw
  `scope`, bounded access token, and bounded optional refresh token, token type,
  and expiry;
- returned secret material stays internal-only and is not exposed through
  routes, readiness, credential readback, logs, docs examples, or UI.

No provider source reads, source inventory routes, provider clients, account
lookup, imports, jobs, UI, hosted proof, packages, billing, Redis, Cloudflare,
marketplace, or social behavior was added.

## Next Move

The next smallest provider-read boundary is account lookup, not source
inventory:

```text
PR484J-D - Archive Connector Provider Account Lookup
```

This should decide a provider-client seam and safe account metadata readback
for Reddit `/api/v1/me` and Discord `/users/@me` style proof before any source
inventory reads.
