# PR484H - Archive Connector Credential Readback Closeout

Owner: MIMIR / A1

Date: 2026-06-30

Status: Closed - accepted

## Decision

MIMIR closes PR484H after ARGUS accepted DAEDALUS's owner-only archive
connector credential readback implementation.

ARGUS result:

`docs/roadmap/PR484H_ARCHIVE_CONNECTOR_CREDENTIAL_READBACK_REVIEW_RESULT.md`

Accepted implementation:

- authenticated `GET /archive-connectors/credentials`;
- owner-only route behind the existing archive connector Bearer boundary;
- returns exactly one provider row per supported archive connector provider;
- synthesizes missing rows with `credential: null`;
- active owner-scoped credential rows win over older revoked rows;
- newest revoked row is selected only when no active row exists;
- excludes other-owner, other-purpose, and unsupported-provider rows;
- returns only accepted safe credential serializer fields;
- returns bounded storage failures without storage/provider details.

Accepted non-scope remains important:

- no token decrypt;
- no token exchange, credential write, credential revoke, or OAuth callback
  change;
- no provider profile/account lookup;
- no provider/source API call, source inventory, import, recurring pull, queue,
  worker, Redis, Cloudflare, billing, package, broad UI, marketplace, or social
  behavior.

## Validation

ARGUS recorded:

- archive connector route tests passed with 29 tests;
- combined connector/callback/storage/import/social/web readiness set passed
  with 73 tests;
- `typecheck` passed;
- `git diff --check` passed;
- scope/path scan found no package, lockfile, Supabase schema, or web changes.

## Next Lane

Credential readback is accepted, but disconnect/revoke remains separate. Before
Station opens provider source inventory, owners need a safe way to disconnect a
stored archive connector credential.

MIMIR therefore opens:

```text
PR484I - Archive Connector Credential Revoke / Disconnect
```

Next preflight:

`docs/roadmap/PR484I_ARCHIVE_CONNECTOR_CREDENTIAL_REVOKE_PREFLIGHT_ARGUS.md`
