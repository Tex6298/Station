# PR484I - Archive Connector Credential Revoke / Disconnect Preflight Result

Owner: ARGUS / A3

Date: 2026-06-30

Status: Accepted for DAEDALUS

## Verdict

```text
ACCEPT_PR484I_LOCAL_CREDENTIAL_REVOKE
```

DAEDALUS may implement the smallest owner-safe local disconnect route for
archive connector credentials.

This lane is local storage revocation only. It must not claim or perform
provider-side OAuth token revocation.

## Accepted Route

```text
POST /archive-connectors/credentials/:provider/revoke
```

Accepted route contract:

- existing archive connector `requireAuth` Bearer boundary;
- supported providers only: `reddit`, `discord`;
- request body must be absent or an empty JSON object;
- any body key, scalar body, array body, secret-shaped body, or callback-style
  body is rejected before storage mutation;
- revoke only active owner-scoped `archive_connector` credential rows for the
  requested supported provider;
- use the accepted credential storage helper, or an equivalently narrow helper
  with the same owner/provider/purpose/status scope;
- return safe credential readback metadata only;
- no token decrypt, credential encryption config requirement, token exchange,
  provider token revocation, provider call, provider account lookup, source
  inventory, import, queue, worker, Redis, Cloudflare, billing, package, broad
  UI, marketplace, or social behavior.

ARGUS accepts `POST` over `DELETE` because this is an explicit local disconnect
action, does not need a request body, and avoids ambiguous DELETE-body or cache
semantics.

## Idempotency And Missing Rows

The route is idempotent at the API boundary:

- active credential exists: revoke active owner/provider/purpose rows and
  return `200`;
- no active row, but revoked owner/provider/purpose history exists: return
  `200` with bounded already-revoked state;
- no owner/provider/purpose row exists: return `200` with bounded missing
  state;
- unsupported providers return `400` before storage access;
- storage failures return a bounded Station `500` without storage/provider
  details.

Do not return `404` for a missing credential. The caller is the authenticated
owner, but a no-op local disconnect is safer and easier for future UI retry
loops than treating missing state as an exceptional disclosure.

## Response Shape

Return a bounded provider-only envelope:

```text
{
  status: "archive_connector_credential_revoked" |
    "archive_connector_credential_revoke_noop",
  provider: "reddit" | "discord",
  purpose: "archive_connector",
  ownerOnly: true,
  connectionStatus: "revoked" | "missing",
  credential: { ...safe credential readback } | null,
  localCredentialRevokeEnabled: true,
  providerTokenRevocationEnabled: false,
  tokenDecryptEnabled: false,
  tokenExchangeEnabled: false,
  providerTokenEndpointCallsEnabled: false,
  credentialWritesEnabled: false,
  providerCallsEnabled: false,
  sourceInventoryEnabled: false,
  importWritesEnabled: false
}
```

For an active-row revoke, `connectionStatus` should be `revoked` and
`credential` should be the newest revoked credential readback selected under
the same active-wins/newest-revoked policy accepted in PR484H after the update
has completed.

For an already-revoked provider, `connectionStatus` should be `revoked` and
`credential` should be the newest revoked safe credential readback.

For a provider with no owner-scoped archive connector credential rows,
`connectionStatus` should be `missing` and `credential` should be `null`.

Allowed credential metadata fields remain the PR484H safe serializer fields:

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

Do not return provider history arrays, raw fingerprint values, row ids, owner
ids, encrypted credential objects, ciphertext, IVs, auth tags, token material,
OAuth codes, state handles, nonce/csrf/session values or hashes, client ids,
client secrets, provider payloads, source/import data, SQL/table details,
storage paths, hosted logs, stack traces, prompts, signed URLs, cookies, or
secret-shaped values.

## Encryption And Provider Revocation

Local revoke must not require archive connector credential encryption config.
Revocation only updates row status/timestamps and reads safe metadata; it does
not need to decrypt or inspect stored token material.

Provider-side token revocation is explicitly deferred. A future provider-side
revocation lane would need its own token decrypt policy, provider revoke
endpoint policy, hosted config proof, failure semantics, retry semantics, and
redaction tests. PR484I must not add that behavior or imply that the external
Reddit/Discord authorization has been revoked.

## Required Tests

DAEDALUS must add focused tests for:

- auth-required behavior with no storage access when unauthenticated;
- unsupported provider returns `400` before storage mutation;
- request body is absent or `{}` only, and extra keys/arrays/scalars are
  rejected without echoing secret-shaped values;
- active owner/provider/purpose credential rows are revoked and the response is
  safe;
- other-owner, other-purpose, and unsupported-provider rows are not revoked;
- active row revocation selects the newest revoked safe metadata afterward;
- already-revoked provider returns `200` no-op revoked state without creating
  new rows or changing older revoked rows unnecessarily;
- missing provider returns `200` no-op missing state with `credential: null`;
- storage update/load failures return bounded Station errors without table
  names, SQL details, row ids, owner ids, stack traces, encrypted blobs, or
  token material;
- local revoke works without credential encryption config;
- route/source guards prove no token decrypt, token exchange, credential write,
  provider token revoke, provider fetch/profile/source call, source inventory,
  import, queue, worker, Redis, Cloudflare, billing, package, broad UI,
  marketplace, or social behavior.

Validation command set for DAEDALUS:

```powershell
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/archive-connectors.test.ts apps/api/src/services/archive-connectors/credential-storage.test.ts apps/api/src/services/archive-connectors/credential-contract.test.ts apps/api/src/routes/import-preview.test.ts apps/api/src/services/imports/parsers/import-parsers.test.ts apps/api/src/routes/social.test.ts apps/web/lib/archive-connector-oauth-callback.test.ts apps/web/lib/social-publishing-readiness.test.ts
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

## ARGUS Preflight Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/archive-connectors.test.ts apps/api/src/services/archive-connectors/credential-storage.test.ts apps/api/src/services/archive-connectors/credential-contract.test.ts apps/api/src/routes/import-preview.test.ts apps/api/src/services/imports/parsers/import-parsers.test.ts apps/api/src/routes/social.test.ts apps/web/lib/archive-connector-oauth-callback.test.ts apps/web/lib/social-publishing-readiness.test.ts` | Pass | 73 tests passed across connector route/storage/contract, callback bridge, import preview/parsers, social fail-closed routes, and web readiness guards. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck completed successfully from cache. |
| `git diff --check` | Pass | No whitespace errors; CRLF normalization warnings only for existing markdown files. |
| Path/scope scan | Pass | PR484I preflight acceptance is docs-only; no app, package, lockfile, or Supabase schema paths changed. |

## Hosted Proof

No ARIADNE hosted proof is required to close PR484I locally because this is an
owner-only backend route contract and hosted owner connector UI/config proof is
still not available.

Hosted proof should wait until Railway has archive connector credential
encryption plus at least one archive-specific provider app pair configured and
MIMIR opens either a visible owner connector surface or a hosted disconnect
rehearsal.

## Non-Scope

PR484I must not add or change:

- provider-side token revocation;
- token decrypt, token refresh, token exchange, credential write, OAuth
  callback behavior, authorization URL behavior, or source scopes;
- provider profile/account lookup;
- Reddit saved/upvoted/history/listing/comment/message/source reads;
- Discord guild/member/channel/message/bot/webhook/source reads;
- source inventory, recurring pulls, import jobs/writes, archive source writes,
  Memory, Canon, Continuity, public documents, review candidates, queues,
  workers, Redis, Cloudflare, billing/Stripe, provider/model calls, package
  dependencies, broad connector UI, marketplace, or social posting;
- committed real credentials, OAuth codes, access tokens, refresh tokens,
  client secrets, env values, encrypted credential blobs, provider payloads,
  hosted logs, private source bodies, SQL/table details, cookies, prompts,
  signed URLs, storage paths, or secret-shaped values.

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARGUS accepted PR484I Archive Connector Credential Revoke / Disconnect.
Task:
- Implement only POST /archive-connectors/credentials/:provider/revoke as an owner-safe local credential revoke boundary.
- Keep provider revocation, provider calls, source inventory, imports, token decrypt, token exchange, credential writes, jobs, UI, Redis, Cloudflare, billing, packages, marketplace, and social behavior out of scope.
```
