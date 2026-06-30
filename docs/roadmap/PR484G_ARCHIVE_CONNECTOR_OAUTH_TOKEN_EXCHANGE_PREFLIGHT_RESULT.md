# PR484G - Archive Connector OAuth Token Exchange / Credential Write Preflight Result

Owner: ARGUS / A3

Date: 2026-06-30

Status: Accepted for DAEDALUS

## Verdict

```text
ACCEPT_PR484G_TOKEN_EXCHANGE_CREDENTIAL_WRITE
```

DAEDALUS may implement the smallest backend-only token exchange and encrypted
credential write boundary for archive connector OAuth callbacks.

This acceptance is not owner-ready hosted proof. PR484F-E remains parked until
hosted Railway has archive connector credential encryption and at least one
archive-specific provider app pair configured.

## Accepted Route

Add a sibling route and leave the existing verify route semantics unchanged:

```text
POST /archive-connectors/oauth/:provider/callback/exchange
```

Accepted route contract:

- existing archive connector `requireAuth` Bearer boundary;
- supported providers only: `reddit`, `discord`;
- request body accepts exactly `stateHandle` and `code`;
- use the same bounded state/code shape accepted by PR484F-C;
- no broad connector UI or callback-page rewiring in this lane;
- no package dependency, provider SDK, queue, worker, Redis, Cloudflare,
  billing, marketplace, social, source inventory, recurring pull, import, or
  provider profile/source API behavior.

## Fail-Closed Order

The route must fail before state consume, provider fetch, or credential write
when any local prerequisite is missing or unsafe:

1. authenticated owner route and provider allow-list;
2. exact request body and bounded callback code/state shape;
3. complete provider app config for the selected provider;
4. valid archive connector credential encryption config;
5. safe callback redirect URI built from the accepted web origin policy;
6. owner/session/provider-bound PR484E state.

Missing or malformed provider app config, credential encryption config, or web
origin config must return bounded `4xx`/`409` setup or config errors without
returning env names, env values, client secret hints, OAuth codes, state
handles, row ids, owner ids, session ids, nonce/csrf values or hashes, provider
payloads, token material, stack traces, storage paths, SQL/table details, or
secret-shaped values.

## State Consume Timing

Consume the PR484E state exactly once after all local fail-closed config,
origin, auth, body, and owner/session/provider checks pass, and immediately
before the provider token endpoint request.

ARGUS accepts this tradeoff:

- if provider token exchange fails after state consume, the owner must restart
  connector setup;
- if encrypted credential write fails after a token response is received, the
  state remains consumed, token material is discarded, and the owner must
  restart connector setup;
- no failed exchange may leave a replayable state handle behind;
- no route may attempt refresh, retry with the same code/state, revocation, or
  provider account lookup in PR484G.

## Provider Token Endpoint Policy

Provider docs consulted:

- Reddit OAuth2: `https://github.com/reddit-archive/reddit/wiki/oauth2`
- Discord OAuth2: `https://discord.com/developers/docs/topics/oauth2`

Use structured token endpoint clients with test-injected fetch/client seams.
Tests must never contact live Reddit or Discord endpoints.

Reddit:

- token URL: `https://www.reddit.com/api/v1/access_token`;
- method: `POST`;
- content type: `application/x-www-form-urlencoded`;
- authenticate the archive-specific client id/secret with HTTP Basic auth;
- form fields: `grant_type=authorization_code`, `code`, and the exact
  accepted callback `redirect_uri`;
- accepted authorization scope remains the PR484F-D connect-proof scope
  `identity`;
- no Reddit source, listing, saved, upvoted, history, comment, message, user
  profile, refresh, or revoke call in PR484G.

Discord:

- token URL: `https://discord.com/api/oauth2/token`;
- method: `POST`;
- content type: `application/x-www-form-urlencoded`;
- form fields: `client_id`, `client_secret`,
  `grant_type=authorization_code`, `code`, and the exact accepted callback
  `redirect_uri`;
- accepted authorization scope remains the PR484F-D connect-proof scope
  `identify`;
- no Discord guild, member, channel, message, bot, webhook, user profile,
  refresh, or revoke call in PR484G.

Provider token errors must be collapsed to bounded Station errors. Do not
return provider error bodies, descriptions, request ids, headers, stack traces,
or token endpoint payload details.

## Credential Write Policy

Store token material only through the accepted encrypted archive connector
credential storage helper.

Allowed encrypted secret material:

- schema/version marker for Station archive connector OAuth token material;
- provider id;
- token type when bounded;
- access token;
- refresh token only if the provider returns one;
- provider-reported expiry metadata when bounded;
- provider-reported scope only for validating/storing the connect-proof token
  material.

Forbidden stored material:

- OAuth code;
- raw state handle;
- nonce/csrf/session values or hashes;
- owner id beyond the credential row owner column already accepted;
- client secret;
- raw provider response body;
- provider account id or label from a profile lookup;
- source inventory or private provider content.

PR484G must not fetch provider account identity. Store `accountLabel: null` and
no external account fingerprint unless a later provider-profile lane is
accepted.

## Readback

Successful exchange may return only bounded connection metadata:

- provider;
- purpose;
- existing encrypted credential readback metadata from the accepted serializer;
- optional coarse success/status booleans for token exchange and encrypted
  credential write.

Do not return raw scopes, exact expiry timestamps from provider payloads,
access tokens, refresh tokens, OAuth codes, state handles, account ids, row ids,
owner ids, session ids, nonce/csrf material, client id, client secret, provider
payloads, SQL/table details, storage paths, hosted logs, stack traces, or
secret-shaped values.

If DAEDALUS updates readiness flags, they must be honest:

- token exchange and credential writes are enabled only when encryption and the
  selected provider app config are complete;
- token endpoint calls are described as token-endpoint-only behavior;
- source inventory, import writes, provider profile/source API calls, queues,
  workers, Redis, Cloudflare, billing, marketplace, and social behavior remain
  disabled.

## Required Tests

DAEDALUS must add focused tests for:

- auth-required, unsupported provider, exact body shape, bounded code/state;
- missing provider app config fails before state consume, provider fetch, or
  credential write;
- missing or malformed credential encryption config fails before state consume,
  provider fetch, or credential write;
- unsafe/malformed callback origin fails before state consume, provider fetch,
  or credential write;
- owner/session/provider/csrf/expiry/consumed-state mismatches fail closed;
- one-time state consume occurs before the mocked provider token endpoint call;
- Reddit token request URL, method, form fields, redirect URI, Basic auth
  placement, and minimal scope handling;
- Discord token request URL, method, form fields, redirect URI, client secret
  placement, and minimal scope handling;
- provider non-2xx, malformed JSON, missing token, oversized token, unexpected
  scope, and network failure return bounded Station errors with no provider
  payload readback;
- encrypted credential write stores through the accepted helper, returns safe
  metadata only, and does not store OAuth code/state/client secret/raw provider
  payload/source material;
- credential write failure after token exchange discards token material in
  response/logs and leaves state consumed;
- source guards allow only the token endpoint client seam and block provider
  profile/source calls, imports, queues, workers, Redis, Cloudflare, billing,
  package changes, broad UI, marketplace, and social behavior.

Validation command set for DAEDALUS:

```powershell
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/archive-connectors.test.ts apps/api/src/services/archive-connectors/credential-storage.test.ts apps/api/src/services/archive-connectors/credential-contract.test.ts apps/api/src/routes/import-preview.test.ts apps/api/src/services/imports/parsers/import-parsers.test.ts apps/api/src/routes/social.test.ts apps/web/lib/archive-connector-oauth-callback.test.ts apps/web/lib/social-publishing-readiness.test.ts
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

## ARGUS Preflight Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/archive-connectors.test.ts apps/api/src/services/archive-connectors/credential-storage.test.ts apps/api/src/services/archive-connectors/credential-contract.test.ts apps/api/src/routes/import-preview.test.ts apps/api/src/services/imports/parsers/import-parsers.test.ts apps/api/src/routes/social.test.ts apps/web/lib/archive-connector-oauth-callback.test.ts apps/web/lib/social-publishing-readiness.test.ts` | Pass | 64 tests passed across connector route/storage/contract, callback bridge, import preview/parsers, social fail-closed routes, and web readiness guards. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck replayed successfully from cache. |
| `git diff --check` | Pass | No whitespace errors; CRLF normalization warnings only for existing markdown files. |
| Path/scope scan | Pass | PR484G preflight diff is docs-only; no app, package, lockfile, or Supabase schema paths changed. |

## Hosted Proof

ARIADNE hosted proof must wait for config. Do not claim PR484G owner-ready or
product-live until Railway `@station/api` has:

- `ARCHIVE_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY`;
- at least one archive-specific provider app client id/secret pair;
- matching hosted callback redirect URI registered with that provider app.

When config exists, hosted proof may exercise one configured provider only. It
must prove the deployed start, authorization URL, callback, exchange, encrypted
credential write, safe readback, replay rejection, and setup/error redaction
without printing or recording secrets, OAuth query values, tokens, provider
payloads, raw state handles, owner/session ids, nonce/csrf material, SQL/table
details, hosted logs, source content, imports, queues, Cloudflare, Redis,
billing, marketplace, or social behavior.

## Non-Scope

PR484G must not add or change:

- Reddit saved/upvoted/history/listing/comment/message/source reads;
- Discord guild/member/channel/message/bot/webhook/source reads;
- provider profile/account lookup;
- refresh, revocation, recurring pull, source inventory, import job/write,
  archive source write, Memory, Canon, Continuity, public documents, review
  candidates, queues, workers, Redis, Cloudflare, billing/Stripe,
  provider/model calls, package dependencies, broad connector UI, marketplace,
  or social posting;
- committed real credentials, OAuth codes, access tokens, refresh tokens,
  client secrets, env values, provider payloads, hosted logs, private source
  bodies, SQL/table details, cookies, prompts, signed URLs, storage paths, or
  secret-shaped values.

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARGUS accepted PR484G Archive Connector OAuth Token Exchange / Credential Write.
Task:
- Implement only the accepted backend token exchange and encrypted credential
  write boundary at POST /archive-connectors/oauth/:provider/callback/exchange.
- Keep config fail-closed before state consume/provider fetch/credential write.
- Keep source inventory, imports, recurring pulls, jobs, UI, Redis, Cloudflare,
  billing, package changes, marketplace, and social behavior out of scope.
```
