# PR484H - Archive Connector Credential Readback Review Result

Owner: ARGUS / A3

Date: 2026-06-30

Status: Accepted for MIMIR

## Verdict

```text
ACCEPT_PR484H_CREDENTIAL_READBACK
```

ARGUS reviewed DAEDALUS's PR484H implementation and accepts it without an
ARGUS code patch.

## Review Result

Accepted implementation:

- authenticated `GET /archive-connectors/credentials`;
- owner-only route behind the existing archive connector Bearer boundary;
- no request body required by the route;
- returns `status: "archive_connector_credentials_read"`,
  `purpose: "archive_connector"`, `ownerOnly: true`, and exactly one provider
  row per supported archive connector provider;
- synthesizes missing rows with `credential: null`;
- returns `connected` for active owner-scoped archive connector credentials;
- returns `revoked` only when no active owner-scoped credential exists for the
  provider;
- active row wins over older revoked rows for the same provider;
- newest revoked row is selected only when no active row exists;
- excludes other-owner, other-purpose, and unsupported-provider rows;
- returns only the accepted safe credential serializer fields;
- returns bounded storage failures without storage/provider details.

No token decrypt, token exchange, credential write, credential revoke, OAuth
callback change, provider profile/account lookup, provider/source API call,
source inventory, import, recurring pull, queue, worker, Redis, Cloudflare,
billing, package, broad UI, marketplace, or social behavior was added.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/archive-connectors.test.ts` | Pass | 29 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/archive-connectors.test.ts apps/api/src/services/archive-connectors/credential-storage.test.ts apps/api/src/services/archive-connectors/credential-contract.test.ts apps/api/src/routes/import-preview.test.ts apps/api/src/services/imports/parsers/import-parsers.test.ts apps/api/src/routes/social.test.ts apps/web/lib/archive-connector-oauth-callback.test.ts apps/web/lib/social-publishing-readiness.test.ts` | Pass | 73 tests passed across connector route/storage/contract, callback bridge, import preview/parsers, social fail-closed routes, and web readiness guards. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck completed successfully. |
| `git diff --check feb3887395483194153fb26724262bc25bc9ed6e..ba9f35590d9fc564be9b60726aa5dce107e261fe` | Pass | No whitespace errors. |
| Scope/path scan | Pass | No package, lockfile, Supabase schema, or web path changed. |

## Remaining Truth

PR484H is accepted as local/backend readback. Hosted owner-ready/product-live
connector status remains blocked until Railway config exists and MIMIR opens a
visible owner connector surface or hosted readback rehearsal.

Revoke/disconnect remains a later lane.

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS accepted PR484H Archive Connector Credential Readback.
Validation:
- archive connector route tests pass with 29 tests.
- combined connector/callback/storage/import/social/web readiness set passes with 73 tests.
- typecheck passes.
- diff check and scope/path scan pass.
Task:
- Close PR484H or choose the next archive connector move.
- Keep revoke/disconnect, source inventory, imports, UI, hosted proof, and provider calls in separate lanes unless explicitly opened.
```
