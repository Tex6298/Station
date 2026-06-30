# PR484H - Archive Connector Credential Readback Preflight Result

Owner: ARGUS / A3

Date: 2026-06-30

Status: Accepted for DAEDALUS

## Verdict

```text
ACCEPT_PR484H_CREDENTIAL_READBACK
```

DAEDALUS may implement the smallest owner-safe archive connector credential
readback route. This lane is readback-only. Revoke remains a later lane.

## Accepted Route

```text
GET /archive-connectors/credentials
```

Accepted route contract:

- existing archive connector `requireAuth` Bearer boundary;
- authenticated owner-only readback;
- no request body;
- no token decrypt;
- no token exchange, OAuth callback change, credential write, credential
  revoke, refresh, or revocation behavior;
- no provider profile/account lookup or provider/source API call;
- no source inventory, imports, recurring pull, queue, worker, Redis,
  Cloudflare, billing, package, broad UI, marketplace, or social behavior.

## Response Shape

Return a bounded envelope:

```text
{
  status: "archive_connector_credentials_read",
  purpose: "archive_connector",
  ownerOnly: true,
  providers: [...]
}
```

Return exactly one row per supported provider, in
`ARCHIVE_CONNECTOR_PROVIDER_IDS` order.

Allowed provider row fields:

- `provider`;
- `purpose`;
- `connectionStatus`: `connected`, `missing`, or `revoked`;
- `credential`: either `null` for missing, or a bounded credential metadata
  object derived from the accepted credential readback serializer;
- optional readback-only safety flags for source/import/provider behavior.

Allowed credential metadata fields:

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

Do not add raw fingerprint values, row ids, owner ids, encrypted credential
objects, ciphertext, IVs, auth tags, token material, OAuth codes, state handles,
nonce/csrf/session values or hashes, client ids, client secrets, provider
payloads, source/import data, SQL/table details, storage paths, hosted logs,
stack traces, prompts, signed URLs, cookies, or secret-shaped values.

## Row Policy

For each supported provider:

- if an active owner-scoped archive connector credential exists, return
  `connectionStatus: "connected"` with the newest active credential readback;
- if no active credential exists but one or more revoked owner-scoped archive
  connector credentials exist, return `connectionStatus: "revoked"` with the
  newest revoked credential readback;
- if no owner-scoped archive connector credential exists, return
  `connectionStatus: "missing"` with `credential: null`;
- do not return credential history arrays;
- do not return revoked rows when an active row exists for the same provider;
- do not return rows for unsupported providers, other owners, or other
  purposes.

Exact credential readback timestamps from the accepted serializer may be
returned for the single selected row. Do not expose raw database row ids or
storage internals.

`accountLabel` may be returned only from the accepted sanitized credential
readback. PR484H must not fetch or derive provider account labels.

## Readiness And Revoke

Keep readiness and credential readback separate in PR484H. Do not patch
`GET /archive-connectors/readiness` to include connected-state truth in this
lane.

Do not add revoke. If MIMIR wants owner disconnect/revoke controls, open a
separate PR484I-style lane with its own state, response, token/storage
redaction, and hosted proof policy.

## Required Tests

DAEDALUS must add focused tests for:

- auth-required behavior;
- no request body requirement if local patterns support asserting it;
- missing-provider synthesized rows for Reddit and Discord;
- connected row for an active owner-scoped credential;
- revoked row only when no active credential exists for that provider;
- active row wins over older revoked rows for the same provider;
- other-owner, other-purpose, and unsupported-provider rows are excluded;
- safe metadata fields only, including no raw token, encrypted credential,
  ciphertext, fingerprint value, row id, owner id, account id, OAuth state,
  client secret, provider payload, source/import data, SQL/table detail, stack,
  hosted log, storage path, prompt, signed URL, or secret-shaped readback;
- storage failure returns a bounded Station error without storage details;
- route/source guards prove no decrypt, token exchange, credential write,
  credential revoke, provider fetch/profile/source call, source inventory,
  import, queue, worker, Redis, Cloudflare, billing, package, broad UI,
  marketplace, or social behavior.

Validation command set:

```powershell
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/archive-connectors.test.ts apps/api/src/services/archive-connectors/credential-storage.test.ts apps/api/src/services/archive-connectors/credential-contract.test.ts apps/api/src/routes/import-preview.test.ts apps/api/src/services/imports/parsers/import-parsers.test.ts apps/api/src/routes/social.test.ts apps/web/lib/archive-connector-oauth-callback.test.ts apps/web/lib/social-publishing-readiness.test.ts
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

## ARGUS Preflight Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/archive-connectors.test.ts apps/api/src/services/archive-connectors/credential-storage.test.ts apps/api/src/services/archive-connectors/credential-contract.test.ts apps/api/src/routes/import-preview.test.ts apps/api/src/services/imports/parsers/import-parsers.test.ts apps/api/src/routes/social.test.ts apps/web/lib/archive-connector-oauth-callback.test.ts apps/web/lib/social-publishing-readiness.test.ts` | Pass | 70 tests passed across connector route/storage/contract, callback bridge, import preview/parsers, social fail-closed routes, and web readiness guards. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck completed successfully. |
| `git diff --check` | Pass | No whitespace errors; CRLF normalization warnings only for existing markdown files. |
| Path/scope scan | Pass | PR484H preflight diff is docs-only; no app, package, lockfile, or Supabase schema paths changed. |

## Hosted Proof

No ARIADNE hosted proof is required to close PR484H locally because this is an
owner-only backend readback lane and hosted credential creation remains
config-blocked.

Hosted proof should wait until Railway has archive connector credential
encryption plus at least one archive-specific provider app pair and MIMIR opens
a visible owner connector surface or a hosted credential-readback rehearsal.

## Non-Scope

PR484H must not add or change:

- token exchange, refresh, revocation, credential revoke, credential write, or
  OAuth callback behavior;
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
- ARGUS accepted PR484H Archive Connector Credential Readback.
Task:
- Implement only GET /archive-connectors/credentials with owner-safe per-provider credential metadata readback.
- Keep provider calls, source inventory, imports, token exchange, credential writes/revokes, jobs, UI, Redis, Cloudflare, billing, packages, marketplace, and social behavior out of scope.
```
