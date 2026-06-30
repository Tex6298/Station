# PR484J-D - Archive Connector Provider Account Lookup Preflight Result

Owner: ARGUS / A3

Date: 2026-06-30

Status: Accepted for DAEDALUS

## Verdict

```text
ACCEPT_PR484J_D_PROVIDER_ACCOUNT_LOOKUP
```

DAEDALUS may implement a narrow backend-only provider account lookup boundary
for archive connectors.

This lane is the first accepted live provider read, but only for current-account
proof. It must not add source inventory/listing reads, imports, UI, hosted
proof, jobs, packages, billing, Redis, Cloudflare, marketplace, or social
behavior.

## Source References

ARGUS verified the account endpoints against primary provider docs before
accepting the lane:

- Reddit documents `GET /api/v1/me` under the `identity` scope and describes it
  as returning the identity of the user:
  `https://www.reddit.com/dev/api/#GET_api_v1_me`
- Reddit OAuth guidance says bearer tokens are scope-limited and OAuth API
  calls use `https://oauth.reddit.com` with an Authorization header:
  `https://github.com/reddit-archive/reddit/wiki/OAuth2`
- Discord documents `GET /users/@me` as the current-user endpoint requiring the
  `identify` scope for OAuth2:
  `https://docs.discord.com/developers/resources/user#get-current-user`
- Discord documents `https://discord.com/api` as the API base and recommends
  versioned API paths:
  `https://docs.discord.com/developers/reference#api-reference`

## Accepted Surface

DAEDALUS may add only:

- `apps/api/src/services/archive-connectors/account-lookup.ts`, or an equally
  small sibling service, for provider account proof orchestration;
- a test-only injected fetch seam following the existing token-exchange pattern,
  such as `setArchiveConnectorAccountLookupFetchForTests`;
- a credential-storage helper that decrypts an active owner/provider
  `archive_connector` credential for account proof only;
- a credential-storage metadata update helper for the active owner/provider row;
- one authenticated owner-only route:
  `POST /archive-connectors/credentials/:provider/account/lookup`;
- focused tests and docs updates.

The route must require auth, accept only an empty or absent body, and derive the
owner from `req.user!.id`. It must not accept row ids, raw external account ids,
provider usernames, account labels, credential blobs, access tokens, refresh
tokens, OAuth codes, state handles, scope overrides, endpoint URLs, or provider
payload fragments from the request.

## Credential Eligibility

Account lookup may use exact canonical `connect` credentials and exact
canonical `source_inventory` credentials:

- Reddit `connect`: `identity`
- Reddit `source_inventory`: `identity mysubreddits history`
- Discord `connect`: `identify`
- Discord `source_inventory`: `identify guilds`

The account-credential decrypt helper must:

- load exactly one active owner/provider/purpose `archive_connector` credential;
- fail closed for missing, revoked, wrong-owner, wrong-purpose,
  unsupported-row, and duplicate active rows without disclosing row existence;
- validate stored `scope_profile` and stored `granted_scopes` before decrypt;
- validate decrypted token material schema, provider, `scopeProfile`,
  canonical `grantedScopes`, optional canonical raw `scope`, bounded token type,
  bounded expiry, and bounded access token after decrypt;
- reject missing, extra, duplicate, reordered, or unknown scopes;
- return an internal account-proof secret with `accessToken`, provider,
  `scopeProfile`, and canonical `grantedScopes` only.

The account-proof helper must not return refresh tokens, row ids, owner ids,
raw external account ids, raw fingerprints, account labels, encrypted blobs,
OAuth state, callback codes, client ids, client secrets, provider payloads,
headers, SQL/storage details, or source/import data.

## Provider Account Proof

Allowed provider requests:

- Reddit: `GET https://oauth.reddit.com/api/v1/me?raw_json=1`
- Discord: `GET https://discord.com/api/v10/users/@me`

Required request behavior:

- use `Authorization: Bearer <access token>` only inside the provider lookup
  service;
- include a bounded static Reddit `User-Agent` and JSON `Accept` header;
- use a short timeout through `AbortController` or an equivalent bounded fetch
  mechanism;
- perform one request only, with no retry loop, background job, queue, refresh,
  revoke, or recurring pull;
- parse only the fields required for proof and ignore the rest.

Allowed provider payload reads:

- Reddit: stable raw account id for fingerprinting and optional bounded
  display label from the account name;
- Discord: stable raw user id for fingerprinting and optional bounded display
  label from `global_name` or `username`.

Forbidden provider payload reads:

- email, avatar, discriminator, locale, premium flags, guilds, guild member
  data, channels, messages, DMs, connections, webhooks, bots, subreddit
  memberships, karma, preferences, trophies, saved/upvoted/downvoted/submitted
  listings, comments, posts, private source bodies, counts, URLs, permalinks,
  provider payload echoes, headers, request ids, or rate-limit headers.

## Safe Metadata Update

PR484J-D may update only the active owner/provider/purpose
`archive_connector` credential row after successful provider proof:

- `account_label`: sanitized and bounded with the existing account-label policy
  or a stricter one;
- `external_account_fingerprint`: Station hash of provider plus raw external
  account id.

The update helper must:

- never store the raw external account id;
- never store provider payload JSON;
- never update encrypted credential material, credential fingerprint,
  `scope_profile`, `granted_scopes`, status, owner, provider, or purpose;
- fail closed if an existing non-null external account fingerprint does not
  match the newly proven account fingerprint;
- return only the existing safe `ArchiveConnectorCredentialReadback`.

If the provider returns a valid raw account id but no safe label, the metadata
update may store a null label and still store the fingerprint.

## Route Response

The route may return:

- `status: "archive_connector_account_lookup_complete"`;
- provider;
- purpose `archive_connector`;
- `ownerOnly: true`;
- `accountProofComplete: true`;
- `accountMetadataUpdated: true`;
- safe credential readback, including `accountLabel`,
  `externalAccountFingerprintPresent`, `connectionScopeState`, and
  `reconnectRequiredForSourceInventory`;
- safety booleans proving no source inventory, import writes, jobs, queues, UI,
  public readback, or provider payload readback are enabled.

The route must not return raw external account ids, provider usernames as
separate fields, email, avatar, discriminator, locale, premium flags, provider
payloads, source metadata, source bodies, token payload scopes, access tokens,
refresh tokens, encrypted credential blobs, OAuth codes, state handles, client
ids, client secrets, headers, request ids, rate-limit headers, SQL/table
details, stack traces, env values, cookies, prompts, signed URLs, storage
paths, or secret-shaped values.

## Failure Modes

DAEDALUS must map failures to bounded route responses:

- unauthenticated request: existing auth middleware behavior;
- unsupported provider before storage/provider access:
  `archive_connector_provider_not_supported`;
- non-empty or malformed body: `archive_connector_account_lookup_invalid`;
- missing, revoked, duplicate, wrong-owner, wrong-purpose, unsupported-row, or
  ineligible credential: bounded credential/account unavailable or scope
  required response with no existence detail;
- missing or malformed decrypt config:
  `archive_connector_credential_encryption_required`;
- malformed encrypted payload, decrypt/auth failure, invalid JSON, or invalid
  token material: bounded account credential invalid response;
- provider 401/403: reconnect-required style response without provider body;
- provider 429: bounded rate-limited response without rate-limit headers;
- provider timeout, network failure, or 5xx: bounded provider lookup failed
  response;
- provider payload shape mismatch: bounded provider response invalid response;
- metadata update storage failure: bounded metadata update failed response;
- existing fingerprint mismatch: bounded account mismatch response requiring
  reconnect.

No failure path may log or return tokens, provider payloads, raw account ids,
provider headers, SQL details, env values, stack traces, or source data.

## Required Tests

DAEDALUS must add focused tests for:

- successful Reddit connect-proof credential account lookup updates safe
  metadata and returns safe readback;
- successful Discord connect-proof credential account lookup updates safe
  metadata and returns safe readback;
- successful source-inventory credential account lookup is also eligible;
- unsupported providers fail before storage and provider fetch;
- unauthenticated requests do not touch storage or provider fetch;
- non-empty bodies, secret-shaped bodies, scope overrides, endpoint overrides,
  row ids, raw external ids, and account labels are rejected before provider
  fetch;
- missing, revoked, wrong-owner, wrong-purpose, duplicate active, unsupported
  row, malformed scope metadata, and token-material scope mismatch fail closed;
- missing/malformed encryption config, malformed encrypted payload, decrypt
  failure, invalid JSON, invalid token schema, invalid token provider, and
  missing/malformed access token fail closed;
- provider 401/403, 429, timeout/network failure, 5xx, invalid JSON, missing
  raw id, non-string raw id, oversized label, and secret-shaped label all
  return bounded responses;
- existing external account fingerprint mismatch fails closed and does not
  update the row;
- metadata update failure returns a bounded error and does not expose provider
  payload or raw id;
- route responses and credential readback never include tokens, raw external
  ids, provider payloads, headers, request ids, rate-limit headers, or secret
  values;
- source guards prove only `/api/v1/me` and `/users/@me` provider account
  endpoints are present, and no guild/channel/message/subreddit/listing/history
  source endpoints, import writes, archive source writes, queue, worker, Redis,
  Cloudflare, billing, package, marketplace, UI, or social behavior entered
  the lane.

Recommended validation command set:

```powershell
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/services/archive-connectors/credential-storage.test.ts apps/api/src/services/archive-connectors/credential-contract.test.ts apps/api/src/routes/archive-connectors.test.ts apps/api/src/routes/import-preview.test.ts apps/api/src/services/imports/parsers/import-parsers.test.ts apps/api/src/routes/social.test.ts apps/web/lib/archive-connector-oauth-callback.test.ts apps/web/lib/social-publishing-readiness.test.ts apps/api/src/middleware/error-handler.test.ts
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

## ARGUS Preflight Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| Current code review | Pass | Current archive connector code has token exchange and source-ready decrypt boundaries, but no provider account lookup route or provider account client yet. |
| Provider docs check | Pass | Reddit `/api/v1/me` maps to `identity`; Discord `/users/@me` maps to `identify`; both are account proof endpoints, not source inventory listings. |
| Prior boundary check | Pass | PR484J-A, PR484J-B, and PR484J-C supply the account metadata policy, exact scope metadata, and decrypt guards needed for this smaller provider-read lane. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/services/archive-connectors/credential-storage.test.ts apps/api/src/services/archive-connectors/credential-contract.test.ts apps/api/src/routes/archive-connectors.test.ts apps/api/src/routes/import-preview.test.ts apps/api/src/services/imports/parsers/import-parsers.test.ts apps/api/src/routes/social.test.ts apps/web/lib/archive-connector-oauth-callback.test.ts apps/web/lib/social-publishing-readiness.test.ts apps/api/src/middleware/error-handler.test.ts` | Pass | 98 tests passed across connector storage/contract/routes, import preview/parsers, social fail-closed routes, web callback/readiness guards, and error handling. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck replayed from cache. |
| `git diff --check` | Pass | No whitespace errors; CRLF normalization warnings only. |

## Non-Scope

PR484J-D must not add or change:

- source inventory/listing endpoints;
- Reddit subreddit membership, karma, preference, trophy, saved, upvoted,
  downvoted, submitted, comment, post, hidden, gilded, overview, or listing
  reads;
- Discord guild list, guild member, channel, message, DM, connection, bot,
  webhook, invite, or local RPC reads;
- provider token refresh, token revoke, token endpoint calls beyond existing
  OAuth exchange code;
- import writes, archive source writes, Memory, Canon, Continuity, public
  document, review candidate, package, queue, recurring pull, worker, Redis,
  Cloudflare, billing/Stripe, marketplace, broad UI, hosted proof, or social
  posting behavior;
- committed credentials, OAuth codes, access tokens, refresh tokens, client
  secrets, env values, encrypted blobs, provider payloads, hosted logs, private
  source bodies, SQL/table details, cookies, prompts, signed URLs, storage
  paths, raw external account ids, provider headers, request ids, rate-limit
  headers, or secret-shaped values.

## Hosted Proof

No hosted proof is required for PR484J-D because this is a local backend helper
and authenticated route boundary. Hosted proof should wait until MIMIR opens a
visible owner connector surface or deployed provider-read rehearsal.

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARGUS accepted PR484J-D Archive Connector Provider Account Lookup preflight.
Task:
- Implement only the backend account-proof lane: internal account credential decrypt, provider `/me` lookup seam, safe metadata update, authenticated empty-body owner route, and focused tests.
- Accept exact canonical `connect` and `source_inventory` credentials for account proof; reject unknown, extra, duplicate, reordered, or mismatched scopes.
- Keep source inventory/listing reads, imports, jobs, UI, hosted proof, packages, billing, Redis, Cloudflare, marketplace, social behavior, token refresh/revoke, and raw provider payload/id readback out of scope.
```
