# PR484F-D - Archive Connector OAuth Authorization URL Preflight Result

Owner: ARGUS / A3

Date: 2026-06-29

Status: Accepted - DAEDALUS may implement bounded authorization URL readback

## Verdict

```text
ACCEPT_PR484F_D_AUTHORIZATION_URL_READBACK
```

ARGUS accepts a bounded authorization URL readback route. Do not implement a
server redirect in this lane.

Accepted shape:

- authenticated owner-only API route;
- caller must provide an existing PR484E state handle;
- route validates the state row without consuming it;
- route constructs one provider authorization URL using the accepted PR484F-C
  public web callback route as `redirect_uri`;
- route returns bounded readback with `authorizationUrl`;
- no token exchange, credential write/revoke, provider call/fetch, source
  inventory, import write, queue, hosted runtime config, package dependency,
  billing, Cloudflare, Redis, broad UI, marketplace, or social posting behavior.

## Required Route

Implement:

```text
POST /archive-connectors/oauth/:provider/authorize
```

The route must remain under the existing archive connector `requireAuth`
boundary.

Request body:

```json
{
  "stateHandle": "<PR484E state handle>"
}
```

Reject every extra field. Do not accept state from query parameters.

## State Requirement

PR484F-D must not merely validate state-handle shape. It must prove the state is
an existing PR484E state for the authenticated owner and current session.

Add a non-consuming state validation helper or local equivalent that verifies:

- provider allow-list;
- nonce/csrf shape from `stateHandle`;
- owner id;
- current Bearer-derived session binding;
- provider;
- purpose `archive_connector`;
- unexpired state;
- unconsumed state.

The route must not call `consumeArchiveConnectorOAuthState`; PR484F-C remains
the only one-time state consumer. Repeated authorization URL readback for the
same unconsumed state may return the same URL until the callback consumes or
the state expires.

Return `409` for missing, expired, consumed, owner-mismatched,
session-mismatched, provider-mismatched, or csrf-mismatched state.

## Redirect URI Policy

Build the provider `redirect_uri` from Station's web origin, not the API origin
and not request headers.

Use the existing API-side web app URL config:

```text
NEXT_PUBLIC_APP_URL
```

The resulting redirect URI must be exactly:

```text
<NEXT_PUBLIC_APP_URL origin>/archive-connectors/oauth/callback/<provider>
```

Requirements:

- accept only `http:` for local test/dev and `https:` for hosted/production;
- reject missing, malformed, query-bearing, hash-bearing, username/password, or
  non-http(s) app URLs;
- reject localhost/default app URLs in production or hosted proof contexts;
- do not derive the redirect URI from `Origin`, `Referer`, `Host`,
  `X-Forwarded-*`, `API_URL`, or any API request context;
- do not add a new hosted runtime config variable in this lane.

## Provider URL Policy

DAEDALUS must use structured URL builders, not string concatenation.

Reddit:

- endpoint: `https://www.reddit.com/api/v1/authorize`;
- parameters: `client_id`, `response_type=code`, `state`, `redirect_uri`,
  `duration=temporary`, `scope=identity`;
- do not request `history`, `read`, `privatemessages`, `save`, `submit`, or any
  other source/content scope in PR484F-D.

Discord:

- endpoint: `https://discord.com/oauth2/authorize`;
- parameters: `client_id`, `response_type=code`, `state`, `redirect_uri`,
  `scope=identify`;
- do not request `email`, `connections`, `guilds`, `guilds.members.read`,
  `messages.read`, `bot`, `webhook.incoming`, or any other source/content,
  guild, bot, webhook, or posting scope in PR484F-D.

Provider references DAEDALUS should use:

- Reddit OAuth2 wiki:
  `https://github.com/reddit-archive/reddit/wiki/oauth2`
- Discord OAuth2 documentation:
  `https://docs.discord.com/developers/topics/oauth2`

## Safe Response

Accepted `200` response fields:

```json
{
  "status": "oauth_authorization_url_created",
  "provider": "reddit",
  "purpose": "archive_connector",
  "authorizationUrl": "https://provider.example/...",
  "credentialWritesEnabled": false,
  "oauthRedirectsEnabled": false,
  "oauthCallbacksEnabled": true,
  "tokenExchangeEnabled": false,
  "providerCallsEnabled": false,
  "sourceInventoryEnabled": false,
  "importWritesEnabled": false
}
```

`oauthCallbacksEnabled` may be `true` only to acknowledge the already accepted
PR484F-C callback verify bridge. It must not imply token exchange or credential
storage.

Do not return separate `clientId`, `stateHandle`, `redirectUri`, `scope`,
`scopes`, `clientSecret`, env names, env values, provider account details, row
ids, owner ids, session ids, nonce/csrf values, nonce/csrf hashes, OAuth code,
token material, credential material, source data, import data, SQL/table
details, stack traces, hosted logs, prompts, signed URLs, storage paths, or
secret-shaped values.

Client id and state handle are accepted only as query parameter values inside
`authorizationUrl` or, in a later redirect-only lane, inside a `Location`
header.

## Accepted Status Codes

- `200` for bounded authorization URL readback;
- `400` for unsupported provider, malformed body, malformed state shape, or
  malformed web app URL config;
- `401` from `requireAuth`;
- `409` for missing/partial provider app config, missing/unmatched/expired/
  consumed state, or production/hosted callback origin not configured safely;
- `500` only for unexpected bounded server failure, without raw storage,
  provider, config, or callback details.

## Tests Required

API tests must prove:

- route requires Bearer auth;
- unsupported provider and malformed body/state fail without URL readback;
- missing/partial provider app config fails without client id exposure;
- missing/invalid web app URL config fails without provider URL readback;
- valid state produces one provider authorization URL with expected endpoint,
  response type, state, redirect URI, and minimal scope;
- client id appears only inside `authorizationUrl`;
- no client secret, state handle outside URL, redirect URI outside URL, owner id,
  row id, session hash, nonce/csrf hash, token, credential, provider payload,
  storage detail, stack trace, hosted log, or secret-shaped value appears in
  response bodies;
- authorize validates existing state without consuming it;
- consumed, expired, owner-mismatched, provider-mismatched, session-mismatched,
  and csrf-mismatched states fail closed;
- source guards prove no callback expansion, token exchange, credential write,
  provider call/fetch, source inventory, import write, queue, hosted runtime
  config, package, billing, Cloudflare, Redis, broad UI, marketplace, or social
  posting behavior.

Replay the existing archive connector, callback bridge, storage, contract,
import-preview, parser, social, web callback, and social web readiness tests
plus typecheck.

## ARIADNE Proof

Local/unit validation is enough for DAEDALUS to implement PR484F-D.

ARIADNE hosted proof is required before MIMIR treats any provider-authorization
URL path as product-live or owner-ready. That proof must verify, without
printing secrets or callback query values:

- deployed web and API origins are healthy;
- deployed API builds redirect URIs from the deployed web origin, not API origin
  or request headers;
- provider app registered redirect URIs match the PR484F-C web callback route;
- no token exchange, credential write, provider call, source inventory, import,
  queue, billing, Cloudflare, Redis, package, or social behavior is active.

Do not use real provider credentials or real owner/provider data in committed
tests or docs.

## ARGUS Validation

| Check | Result |
| --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/archive-connectors.test.ts apps/api/src/services/archive-connectors/credential-storage.test.ts apps/api/src/services/archive-connectors/credential-contract.test.ts apps/api/src/routes/import-preview.test.ts apps/api/src/services/imports/parsers/import-parsers.test.ts apps/api/src/routes/social.test.ts apps/web/lib/archive-connector-oauth-callback.test.ts apps/web/lib/social-publishing-readiness.test.ts` | Passed with 59 tests |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Passed |
| `git diff --check a66aa85f03ba4683e1b4a79eaa3be586cd868b35..0cacb08ec307` | Passed |
| MIMIR wakeup diff path scan | Docs-only |

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARGUS accepted PR484F-D Archive Connector OAuth Authorization URL readback.
- Implement only the bounded authenticated authorize route described in the preflight result.
Task:
- Add `POST /archive-connectors/oauth/:provider/authorize` under existing archive connector Bearer auth.
- Require an existing unexpired/unconsumed PR484E state for the authenticated owner/session and validate it without consuming.
- Build provider URLs with `NEXT_PUBLIC_APP_URL` web callback origin, Reddit `identity` temporary auth, and Discord `identify` auth.
- Return only bounded `authorizationUrl` readback; client id/state may appear only inside that URL.
- Keep token exchange, credential writes, provider calls, source inventory, imports, queues, packages, broad UI, Cloudflare, Redis, billing, hosted runtime config, and social behavior out of scope.
```
