# PR484F - Archive Connector OAuth Authorize Preflight

Owner: ARGUS / A3

Opened by: MIMIR / A1

Date opened: 2026-06-29

Status: Open - decide provider authorization URL boundary

## MIMIR Decision

PR484E accepted a state-start route that creates an owner/session-bound OAuth
state row and returns an opaque `stateHandle`. No redirect or provider URL
behavior exists yet.

The next connector unblock is the provider authorization boundary. This lane
must decide whether Station can safely construct or issue the provider OAuth
authorization URL before any callback, token exchange, credential write, source
inventory, or import flow.

## Candidate Shapes

ARGUS may accept, patch, or reject these shapes.

Preferred:

```text
POST /archive-connectors/oauth/:provider/authorize
```

Candidate behavior:

- authenticated owner-only route using `requireAuth`;
- supports only `reddit` and `discord`;
- accepts a `stateHandle` created by PR484E plus optional local redirect path;
- validates provider app config is fully configured;
- validates the state handle shape without consuming it;
- returns an `authorizationUrl` for the provider, or a bounded
  `authorization_ready` readback if ARGUS rejects URL readback;
- performs no provider calls, no fetches, no HTTP redirect, no callback
  handling, no OAuth code handling, no token exchange, no credential write, no
  credential revoke, no source inventory, and no import write.

Alternative if returning a provider URL is too risky:

```text
GET /archive-connectors/oauth/:provider/authorize
```

This route could issue a `302` redirect directly to the provider authorization
URL after validating the same owner/provider/state conditions. If ARGUS prefers
this shape, it must specify how DAEDALUS can test it without live provider
traffic and how response/readback redaction should work.

## Provider-Specific Caution

OAuth authorization necessarily places a provider client id and redirect URI in
the provider authorization URL. Previous readiness lanes correctly forbade
returning client ids because they were not needed for setup status readback.

PR484F must explicitly decide the new boundary:

- whether exposing client id only inside a provider authorization URL is
  acceptable;
- whether URL readback should be test-only/local-only or generally available;
- whether a server-side `302` is safer than returning an `authorizationUrl`;
- what scopes are allowed for Reddit and Discord archive intake;
- what redirect URI route shape is acceptable for a future callback lane.

DAEDALUS should not guess provider scopes or URLs without ARGUS naming the
allowed sources and tests.

## Config Assumptions

PR484F should not require Marty to provide real Reddit/Discord app config to
implement and test. DAEDALUS may use injected test-only env values.

Accepted provider app config names:

```text
ARCHIVE_CONNECTOR_REDDIT_CLIENT_ID
ARCHIVE_CONNECTOR_REDDIT_CLIENT_SECRET
ARCHIVE_CONNECTOR_DISCORD_CLIENT_ID
ARCHIVE_CONNECTOR_DISCORD_CLIENT_SECRET
```

`ARCHIVE_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY` remains required before any
future successful credential write. It should not block provider authorization
URL construction unless ARGUS finds that coupling necessary.

## ARGUS Task

Hostile-preflight the current repo and decide whether DAEDALUS may implement
PR484F as an authorization URL/redirect boundary only.

Return one of:

```text
ACCEPT_PR484F_AUTHORIZATION_URL_READBACK
ACCEPT_PR484F_SERVER_REDIRECT_ONLY
PATCH_SCOPE
BLOCKED_NEEDS_MIMIR_DECISION
BLOCKED_NEEDS_CONFIG
BLOCKED_NEEDS_PROVIDER_DOCS
REJECT_DEFER
```

If accepted, specify exact route shape, touched files or acceptable local
equivalents, provider URLs/scopes policy, redirect URI policy, tests, safe
response fields, redaction/source guards, and whether ARIADNE hosted proof is
required.

If blocked, name the concrete blocker and the smallest numbered unblock lane
that directly enables live archive connector product depth.

## Explicit Non-Scope

PR484F must not add or change:

- OAuth callback routes;
- OAuth state consume/callback handling;
- OAuth code handling;
- credential write, credential revoke, token exchange, token refresh, or token
  revocation routes;
- provider SDKs, live Reddit/Discord API calls, configured real test
  credentials, source inventory pulls, recurring pulls, import writes, jobs,
  queues, workers, Redis, Cloudflare, billing/Stripe, provider/model calls,
  package dependencies, hosted runtime behavior beyond the accepted route,
  public connector pages, web UI, broad connector marketplace, or social
  posting behavior;
- archive source, import job, Memory, Canon, Continuity, public document, or
  review candidate writes.

Do not expose env names, env values, client secrets, secret tails, OAuth codes,
access tokens, refresh tokens, cookies, credentials, raw external account ids,
raw owner or row ids, raw session ids, nonce hashes, csrf hashes, provider
payloads, private source bodies, private messages, archive snippets, SQL/table
details, stack traces, hosted logs, storage paths, signed URLs, prompts, or
secret-shaped values.

If ARGUS accepts exposing client id as part of an OAuth authorization URL, it
must be limited to that URL boundary and tests must prove client secret is never
included.

## Questions ARGUS Should Answer

1. Return `authorizationUrl`, issue a server `302`, or defer?
2. What exact route shape should DAEDALUS implement?
3. Is client id exposure inside an OAuth authorization URL accepted for this
   lane?
4. What Reddit and Discord authorization base URLs and scopes are accepted, and
   should DAEDALUS verify them against provider docs before implementation?
5. What redirect URI path should be reserved for the future callback lane?
6. Should this lane validate an existing PR484E state row, or only validate
   handle shape and leave consume/check to callback?
7. Does PR484F need hosted proof because it creates a URL a browser could
   visit, even if no provider call is made by the server?
8. What source guards prove no callback/token/provider/import behavior was
   added?

## Wakeup Template

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARGUS accepted PR484F Archive Connector OAuth Authorize.
Task:
- Implement only the accepted authorization URL/redirect boundary.
- Keep callback, token exchange, credential writes, provider calls, source
  inventory, and import writes out of scope.
```

If ARGUS rejects or blocks the lane:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS blocked or rejected PR484F Archive Connector OAuth Authorize.
Blocker:
- <concrete blocker>
Task:
- Choose the smallest unblock lane or another named Phase 3/customer-facing feature.
```
