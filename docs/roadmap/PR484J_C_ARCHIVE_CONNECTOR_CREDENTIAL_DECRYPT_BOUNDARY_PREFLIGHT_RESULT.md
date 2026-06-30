# PR484J-C - Archive Connector Credential Decrypt Boundary Preflight Result

Owner: ARGUS / A3

Date: 2026-06-30

Status: Accepted for DAEDALUS

## Verdict

```text
ACCEPT_PR484J_C_CREDENTIAL_DECRYPT_BOUNDARY
```

DAEDALUS may implement a narrow internal-only decrypt/load helper for
source-ready archive connector credentials.

This lane is a secret-handling boundary only. It must not add provider API
calls, provider clients, source inventory routes, imports, UI, hosted proof,
jobs, packages, billing, Redis, Cloudflare, marketplace, or social behavior.

## Accepted Helper

Preferred helper name:

```ts
loadArchiveConnectorSourceCredentialSecret(input: {
  ownerUserId: string;
  provider: ArchiveConnectorProviderId;
}): Promise<ArchiveConnectorSourceCredentialSecret>
```

Allowed placement:

- `apps/api/src/services/archive-connectors/credential-storage.ts`; or
- a small sibling service under `apps/api/src/services/archive-connectors` if
  keeping decrypt code separate makes the storage module clearer.

The helper must load exactly one active owner/provider/purpose
`archive_connector` credential. It must not accept row ids, raw external
account ids, provider usernames, scope overrides, credential blobs, OAuth state
handles, callback codes, tokens, or request-body fields as input.

## Source-Ready Guards

Decrypt is allowed only when both the stored safe metadata and the decrypted
token material prove source readiness.

Before decrypting or returning a secret, the selected row must be:

- current owner only;
- supported provider only: `reddit` or `discord`;
- purpose exactly `archive_connector`;
- status exactly `active`;
- `scope_profile` exactly `source_inventory`;
- canonical `granted_scopes` exactly equal to the accepted source inventory set:
  - Reddit: `identity mysubreddits history`;
  - Discord: `identify guilds`;
- `connectionScopeState` equivalent to `source_scope_ready`.

After decrypting, the token material must still validate:

- token material schema is `station.archive_connector.oauth_token.v1`;
- provider matches the requested provider;
- `scopeProfile` is `source_inventory`;
- `grantedScopes` exactly match the provider's accepted source inventory set;
- `accessToken` is present and bounded;
- optional `refreshToken`, `tokenType`, and `expiresInSeconds` are bounded.

Metadata alone is not enough. Decrypted material alone is not enough. Mismatch
between stored metadata and encrypted token material must fail closed.

## Internal Secret Shape

Return an internal value only; do not reuse this shape in route responses,
readiness, logs, or docs examples with real-looking values.

Accepted shape:

```ts
type ArchiveConnectorSourceCredentialSecret = {
  provider: ArchiveConnectorProviderId;
  purpose: "archive_connector";
  scopeProfile: "source_inventory";
  grantedScopes: string[];
  tokenType: string | null;
  accessToken: string;
  refreshToken: string | null;
  expiresInSeconds: number | null;
};
```

Do not return row ids, owner ids, raw fingerprints, account labels, external
account fingerprints, raw token payload strings, encrypted credential blobs,
OAuth state, callback codes, client ids, client secrets, provider payloads,
headers, SQL/storage details, or source/import data.

Refresh tokens may be included in the internal return value because later
provider-client lanes may need them. PR484J-C must not implement token refresh,
token revocation, provider token endpoint calls, retry jobs, or recurring
pulls.

## Fail-Closed States

DAEDALUS must define bounded error codes/messages for:

- unsupported provider before storage access;
- missing active credential;
- revoked credential;
- wrong owner;
- wrong purpose;
- missing encryption config;
- malformed encryption config;
- missing, malformed, wrong-schema, or wrong-algorithm encrypted credential;
- invalid IV, ciphertext, or auth tag;
- decrypt/authentication failure;
- invalid JSON plaintext;
- wrong token material schema;
- token material provider mismatch;
- missing or malformed access token;
- malformed optional refresh token, token type, or expiry;
- `scopeProfile` not `source_inventory`;
- missing source scopes, extra scopes, or connect-proof-only credentials.

Missing, revoked, wrong-owner, and wrong-purpose rows should use a common
unavailable-style code if that avoids disclosing row existence. Error messages
must not reveal owner ids, row ids, table names, SQL details, encrypted blobs,
tokens, provider payloads, stack traces, env values, or secret-shaped values.

## Required Tests

DAEDALUS must add focused tests for:

- successful decrypt of a source-ready Reddit credential returns the accepted
  internal shape;
- successful decrypt of a source-ready Discord credential returns the accepted
  internal shape;
- helper input is owner/provider only and unsupported providers fail before
  storage access;
- missing, revoked, wrong-owner, wrong-purpose, and unsupported-provider rows
  fail closed without returning existence details;
- connect-proof-only credentials fail before returning token material;
- stored metadata source-ready but decrypted material connect-only fails;
- stored metadata connect-only but decrypted material source-ready fails;
- wrong token-material provider fails;
- missing/malformed encryption config fails with bounded errors;
- malformed encrypted payload, wrong schema/algorithm, bad IV/ciphertext/auth
  tag, decrypt auth failure, invalid JSON, invalid token schema, missing token,
  malformed optional token fields, missing source scope, and extra source scope
  all fail closed;
- returned secret is never serialized by a route and never appears in safe
  credential/readiness readback;
- source guards prove no provider API calls, provider SDK/client, source
  inventory route, import write, queue, worker, Redis, Cloudflare, billing,
  package, marketplace, UI, or social behavior entered the lane.

Recommended validation command set:

```powershell
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/services/archive-connectors/credential-storage.test.ts apps/api/src/routes/archive-connectors.test.ts apps/api/src/services/archive-connectors/credential-contract.test.ts apps/api/src/routes/import-preview.test.ts apps/api/src/services/imports/parsers/import-parsers.test.ts apps/api/src/routes/social.test.ts apps/web/lib/archive-connector-oauth-callback.test.ts apps/web/lib/social-publishing-readiness.test.ts apps/api/src/middleware/error-handler.test.ts
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

## ARGUS Preflight Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| Current code review | Pass | Current credential storage encrypts credentials but has no accepted decrypt helper or provider source read boundary. |
| PR484J-B prerequisite review | Pass | Source-ready metadata is now represented locally; ARGUS accepted it in `docs/roadmap/PR484J_B_ARCHIVE_CONNECTOR_SOURCE_SCOPE_OAUTH_CONSENT_RECONNECT_REVIEW_RESULT.md`. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/services/archive-connectors/credential-contract.test.ts apps/api/src/routes/archive-connectors.test.ts apps/api/src/services/archive-connectors/credential-storage.test.ts apps/api/src/routes/import-preview.test.ts apps/api/src/services/imports/parsers/import-parsers.test.ts apps/api/src/routes/social.test.ts apps/web/lib/archive-connector-oauth-callback.test.ts apps/web/lib/social-publishing-readiness.test.ts apps/api/src/middleware/error-handler.test.ts` | Pass | 92 tests passed across connector route/storage/contract, import preview/parsers, social fail-closed routes, web callback/readiness guards, and error handling. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API typecheck executed and web typecheck replayed from cache. |

## Non-Scope

PR484J-C must not add or change:

- provider source API calls;
- provider clients or SDKs;
- token refresh, token revoke, token endpoint calls beyond existing OAuth
  exchange code;
- provider account lookup;
- source inventory route, source metadata/body readback, source IDs, source
  counts, previews, snippets, URLs, titles, posts, comments, messages, DMs,
  guild channels, or subreddit listings;
- imports, archive source writes, Memory, Canon, Continuity, public documents,
  review candidates, queues, recurring pulls, workers, Redis, Cloudflare,
  billing/Stripe, packages, broad UI, marketplace, or social posting;
- committed credentials, OAuth codes, access tokens, refresh tokens, client
  secrets, env values, encrypted blobs, provider payloads, hosted logs, private
  source bodies, SQL/table details, cookies, prompts, signed URLs, storage
  paths, or secret-shaped values.

## Hosted Proof

No hosted proof is required for PR484J-C because it is an internal helper/test
boundary with no route, provider call, UI, or deployed provider source read.
Hosted proof should wait until MIMIR opens a visible owner connector or source
inventory route rehearsal.

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARGUS accepted PR484J-C Archive Connector Credential Decrypt Boundary.
Task:
- Implement only an internal helper/test boundary for decrypting active owner/provider source-ready archive connector credentials.
- Require stored metadata and decrypted token material to agree on source readiness before returning an internal secret shape.
- Keep provider calls, provider clients, source inventory routes, account lookup, imports, jobs, UI, hosted proof, packages, billing, Redis, Cloudflare, marketplace, and social behavior out of scope.
```
