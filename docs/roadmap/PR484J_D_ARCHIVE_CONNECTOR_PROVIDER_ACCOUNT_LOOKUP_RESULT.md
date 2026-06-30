# PR484J-D - Archive Connector Provider Account Lookup Result

Owner: DAEDALUS / A2

Date: 2026-06-30

Status: Ready for ARGUS review

## Summary

DAEDALUS implemented the narrow backend-only archive connector account-proof
lane accepted by ARGUS.

Implemented surface:

- internal account-proof credential decrypt helper for active owner/provider
  `archive_connector` credentials;
- exact canonical credential eligibility for `connect` and `source_inventory`
  scope profiles;
- provider account lookup service with a test-injected fetch seam;
- one authenticated owner-only empty-body route:
  `POST /archive-connectors/credentials/:provider/account/lookup`;
- safe metadata update for `account_label` and
  `external_account_fingerprint` only;
- focused storage, route, provider-call, metadata, failure, and source-guard
  tests.

## Account Credential Boundary

`loadArchiveConnectorAccountCredentialSecret({ ownerUserId, provider })` now
loads exactly one active owner/provider/purpose `archive_connector` credential
for account proof only.

Eligible stored credentials:

- Reddit `connect`: `identity`
- Reddit `source_inventory`: `identity mysubreddits history`
- Discord `connect`: `identify`
- Discord `source_inventory`: `identify guilds`

The helper rejects unsupported providers before storage access, missing rows,
revoked rows, duplicate active rows, wrong owner/purpose/status rows, malformed
stored scope metadata, and missing/extra/duplicate/reordered/mismatched scopes.

The decrypted token material must independently prove:

- Station OAuth token schema;
- matching provider;
- exact `scopeProfile`;
- exact canonical `grantedScopes`;
- optional canonical raw `scope`;
- bounded access token;
- bounded optional refresh token, token type, and expiry.

The returned secret is internal-only and contains only:

- provider;
- purpose;
- scope profile;
- canonical granted scopes;
- access token.

It does not return refresh tokens, row ids, owner ids, raw external account ids,
fingerprints, account labels, encrypted blobs, OAuth state, provider payloads,
headers, SQL details, source data, or import data.

## Provider Lookup Boundary

`lookupArchiveConnectorProviderAccount` may call only:

- Reddit: `GET https://oauth.reddit.com/api/v1/me?raw_json=1`
- Discord: `GET https://discord.com/api/v10/users/@me`

The service:

- sends `Authorization: Bearer <access token>` only inside the provider lookup;
- sends JSON `Accept`;
- sends a bounded static Reddit `User-Agent`;
- uses a bounded abort signal;
- performs one request with no retry, queue, refresh, revoke, or recurring pull;
- parses only the raw account id and an optional display label.

Forbidden provider payload families remain unread and unreturned: email, avatar,
discriminator, locale, premium flags, guilds, channels, messages, DMs,
connections, webhooks, subreddit memberships, listings, history, karma,
preferences, trophies, provider payload echoes, request ids, and rate-limit
headers.

## Metadata Update Boundary

After successful provider proof, Station updates only the active
owner/provider/purpose credential row:

- `account_label`: sanitized and bounded;
- `external_account_fingerprint`: Station hash of provider plus raw external
  account id.

The update never stores the raw external account id or provider payload JSON,
and it does not mutate encrypted credential material, credential fingerprint,
scope profile, granted scopes, status, owner, provider, or purpose.

An existing non-null external account fingerprint mismatch fails closed and
requires reconnect.

## Route Response

Successful route responses return:

- `status: "archive_connector_account_lookup_complete"`;
- provider and `purpose: "archive_connector"`;
- `ownerOnly: true`;
- `accountProofComplete: true`;
- `accountMetadataUpdated: true`;
- safe credential readback with account label and fingerprint presence;
- safety booleans proving no source inventory, imports, jobs, queue, UI,
  provider token endpoint, token refresh, token revoke, raw id readback, or
  provider payload readback are enabled.

Failure responses are bounded for:

- unauthenticated requests;
- unsupported providers;
- non-empty or malformed bodies;
- missing/ineligible/invalid credentials;
- missing or malformed encryption config;
- provider 401/403, 429, 5xx, network/timeout, invalid JSON, and missing raw id;
- metadata update failure;
- existing external account fingerprint mismatch.

No route response returns tokens, encrypted blobs, raw external ids, provider
payloads, headers, request ids, rate-limit headers, OAuth codes, state handles,
client ids, client secrets, storage/table details, stack traces, env values,
source metadata, source bodies, or secret-shaped values.

## Non-Scope

PR484J-D did not add:

- source inventory/listing reads;
- Reddit subreddit/history/listing reads;
- Discord guild/channel/message/DM reads;
- provider token refresh or provider token revoke;
- import writes or archive source writes;
- jobs, queues, workers, Redis, Cloudflare, billing, marketplace, packages, UI,
  hosted proof, or social behavior.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/services/archive-connectors/credential-storage.test.ts apps/api/src/routes/archive-connectors.test.ts` | Pass | 58 focused connector storage/route tests passed. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/services/archive-connectors/credential-storage.test.ts apps/api/src/services/archive-connectors/credential-contract.test.ts apps/api/src/routes/archive-connectors.test.ts apps/api/src/routes/import-preview.test.ts apps/api/src/services/imports/parsers/import-parsers.test.ts apps/api/src/routes/social.test.ts apps/web/lib/archive-connector-oauth-callback.test.ts apps/web/lib/social-publishing-readiness.test.ts apps/api/src/middleware/error-handler.test.ts` | Pass | 106 tests passed across connector storage/contract/routes, import preview/parsers, social fail-closed routes, web callback/readiness guards, and error handling. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API typecheck executed and web typecheck replayed from cache. |
| `git diff --check` | Pass | No whitespace errors; CRLF normalization warnings only. |

## ARGUS Review Request

Please review for:

- hostile owner/provider/credential scoping;
- exact canonical scope handling for account proof;
- route response redaction;
- safe metadata-only update behavior;
- provider `/me` endpoint containment;
- absence of source inventory, import, job, UI, package, billing, Redis,
  Cloudflare, marketplace, and social behavior.

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS implemented PR484J-D Archive Connector Provider Account Lookup.
- The lane adds only backend account proof: account credential decrypt, provider `/me` lookup seam, safe metadata update, authenticated empty-body owner route, focused tests, and docs.
Validation:
- Focused connector storage/route tests pass: 58 tests.
- Accepted broader validation set passes: 106 tests.
- Typecheck passes.
Task:
- Review PR484J-D for owner scoping, exact scope eligibility, provider endpoint containment, metadata safety, redaction, and non-scope drift.
```
