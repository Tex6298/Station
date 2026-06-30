# PR484I - Archive Connector Credential Revoke / Disconnect Result

Owner: DAEDALUS / A2

Date: 2026-06-30

Status: Ready for ARGUS review

## Result

DAEDALUS implemented the accepted owner-only local archive connector credential
revoke/disconnect lane.

Implemented route:

```text
POST /archive-connectors/credentials/:provider/revoke
```

The route uses the existing archive connector `requireAuth` Bearer boundary and
accepts only supported providers.

## Behavior

- Accepts no request body or an empty JSON object only.
- Rejects extra body keys, arrays, and parser-level scalar JSON before storage
  mutation.
- Revokes only active owner/provider/purpose `archive_connector` credential
  rows.
- Returns `200` for real revoke, already-revoked, and missing states.
- Returns the newest revoked safe credential metadata after a revoke.
- Returns already-revoked safe metadata for idempotent no-op disconnect.
- Returns `connectionStatus: "missing"` and `credential: null` when no
  owner-scoped credential row exists.
- Does not require archive connector credential encryption config.

Allowed credential metadata remains the PR484H safe serializer fields only:

- `provider`;
- `purpose`;
- `status`;
- `configured`;
- `accountLabel`;
- `fingerprintPresent`;
- `externalAccountFingerprintPresent`;
- `createdAt`;
- `updatedAt`;
- `rotatedAt`;
- `revokedAt`.

## Parser Redaction Guard

Scalar JSON request bodies are rejected by Express before the route handler.
DAEDALUS tightened the shared error handler so JSON parse failures use the
generic `400` envelope instead of returning body-parser excerpts. This keeps
secret-shaped scalar bodies out of archive connector revoke responses without
changing the accepted route behavior.

## Non-Scope Confirmation

PR484I did not add or change:

- provider-side token revocation;
- token decrypt;
- token exchange;
- credential write;
- OAuth callback or authorization URL behavior;
- provider profile/account lookup;
- provider/source API calls;
- source inventory;
- import writes;
- recurring pulls, queues, workers, Redis, Cloudflare, billing, packages,
  marketplace, broad UI, or social behavior.

## Validation

| Command | Result |
| --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/archive-connectors.test.ts` | Pass; 33 tests. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/middleware/error-handler.test.ts` | Pass; 7 tests. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/archive-connectors.test.ts apps/api/src/services/archive-connectors/credential-storage.test.ts apps/api/src/services/archive-connectors/credential-contract.test.ts apps/api/src/routes/import-preview.test.ts apps/api/src/services/imports/parsers/import-parsers.test.ts apps/api/src/routes/social.test.ts apps/web/lib/archive-connector-oauth-callback.test.ts apps/web/lib/social-publishing-readiness.test.ts apps/api/src/middleware/error-handler.test.ts` | Pass; 84 tests. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass. |
| `git diff --check` | Pass; CRLF normalization warnings only. |

## Baton

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS implemented PR484I owner-only local archive connector credential revoke/disconnect.
- POST /archive-connectors/credentials/:provider/revoke is idempotent for active, already-revoked, and missing provider states.
- Provider token revocation, token decrypt/exchange, source inventory, imports, jobs, UI, billing, packages, marketplace, and social behavior remain out of scope.
Task:
- Review PR484I. If accepted, wake MIMIR with WAKEUP A1:. If fixes are needed, wake DAEDALUS with WAKEUP A2:.
```
