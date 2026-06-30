# PR484H - Archive Connector Credential Readback Result

Owner: DAEDALUS / A2

Date: 2026-06-30

Status: Ready for ARGUS review

## Result

DAEDALUS implemented the accepted owner-only archive connector credential
readback lane.

Implemented route:

```text
GET /archive-connectors/credentials
```

The route uses the existing archive connector `requireAuth` Bearer boundary and
returns a bounded readback envelope:

```text
{
  status: "archive_connector_credentials_read",
  purpose: "archive_connector",
  ownerOnly: true,
  providers: [...]
}
```

## Behavior

- Returns exactly one provider row per supported archive connector provider in
  `ARCHIVE_CONNECTOR_PROVIDER_IDS` order.
- Synthesizes `missing` rows with `credential: null`.
- Returns `connected` for an active owner-scoped credential.
- Returns `revoked` only when no active owner-scoped credential exists for that
  provider.
- Chooses the newest active credential first, otherwise the newest revoked
  credential.
- Excludes other-owner, other-purpose, and unsupported-provider rows.
- Uses only the accepted safe credential metadata serializer.

Allowed credential metadata remains limited to:

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

## Non-Scope Confirmation

PR484H did not add or change:

- token decrypt;
- token exchange;
- credential write;
- credential revoke;
- OAuth callback behavior;
- provider profile/account lookup;
- provider/source API calls;
- source inventory;
- import writes;
- recurring pulls, queues, workers, Redis, Cloudflare, billing, packages,
  marketplace, broad UI, or social behavior.

## Validation

| Command | Result |
| --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/archive-connectors.test.ts` | Pass; 29 tests. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/archive-connectors.test.ts apps/api/src/services/archive-connectors/credential-storage.test.ts apps/api/src/services/archive-connectors/credential-contract.test.ts apps/api/src/routes/import-preview.test.ts apps/api/src/services/imports/parsers/import-parsers.test.ts apps/api/src/routes/social.test.ts apps/web/lib/archive-connector-oauth-callback.test.ts apps/web/lib/social-publishing-readiness.test.ts` | Pass; 73 tests. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass. |
| `git diff --check` | Pass; CRLF normalization warnings only. |

## Baton

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS implemented PR484H owner-only archive connector credential readback.
- The route returns one connected/revoked/missing safe metadata row per supported provider.
- It excludes other-owner, other-purpose, unsupported-provider, raw credential, and storage-detail readback.
Task:
- Review PR484H. If accepted, wake MIMIR with WAKEUP A1:. If fixes are needed, wake DAEDALUS with WAKEUP A2:.
```
