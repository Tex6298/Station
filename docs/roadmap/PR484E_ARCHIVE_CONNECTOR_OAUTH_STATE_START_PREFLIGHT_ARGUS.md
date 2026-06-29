# PR484E - Archive Connector OAuth State Start Preflight

Owner: ARGUS / A3

Opened by: MIMIR / A1

Date opened: 2026-06-29

Status: Open - decide owner OAuth state start route

## MIMIR Decision

PR484A accepted the connector contract. PR484B accepted encrypted credential
and OAuth state storage. PR484C accepted owner-only connector readiness.
PR484D accepted archive-specific provider app config readiness.

The next direct unblock is an owner/session-bound OAuth state start route. This
is the smallest mutation before any redirect/callback, token exchange,
credential write, source inventory, or import flow.

MIMIR opens PR484E to hostile-preflight whether DAEDALUS may add this route
without live provider behavior.

## Candidate Route

ARGUS may accept, patch, or reject this shape:

```text
POST /archive-connectors/oauth/:provider/start
```

Candidate behavior:

- authenticated owner-only route using `requireAuth`;
- supports only `reddit` and `discord`;
- requires accepted archive-specific provider app config to be fully
  configured for the selected provider;
- creates one `archive_connector_oauth_states` row using the accepted PR484B
  helper;
- binds OAuth state to owner, active auth/session context, provider, archive
  connector purpose, nonce, csrf, local redirect path, and short expiry;
- returns only safe metadata needed by a future redirect lane, such as provider,
  purpose, expiresAt, localRedirectPath, and a non-secret state handle if ARGUS
  accepts one;
- when provider app config is missing or partial, returns bounded
  `setup_required` without writing a row;
- performs no provider calls, no fetches, no redirect, no callback handling, no
  OAuth code handling, no token exchange, no credential write, no credential
  revoke, no source inventory, and no import write.

If ARGUS thinks returning a state handle is unsafe before redirect/callback
contracts, it should require a server-only proof route or reject PR484E and name
the blocker.

## Config Assumptions

PR484E should not require Marty to provide real Reddit/Discord app config to
implement and test. DAEDALUS may use injected test-only env values to prove the
configured path.

Accepted provider app config names:

```text
ARCHIVE_CONNECTOR_REDDIT_CLIENT_ID
ARCHIVE_CONNECTOR_REDDIT_CLIENT_SECRET
ARCHIVE_CONNECTOR_DISCORD_CLIENT_ID
ARCHIVE_CONNECTOR_DISCORD_CLIENT_SECRET
```

`ARCHIVE_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY` remains required before any
future successful credential write. It should not block OAuth state creation
unless ARGUS finds that coupling necessary.

## ARGUS Task

Hostile-preflight the current repo and decide whether DAEDALUS may implement
PR484E as an OAuth-state-start route only.

Return one of:

```text
ACCEPT_PR484E_OAUTH_STATE_START_ROUTE
PATCH_SCOPE
BLOCKED_NEEDS_MIMIR_DECISION
BLOCKED_NEEDS_CONFIG
REJECT_DEFER
```

If accepted, specify exact touched files or acceptable local equivalents,
tests, safe response fields, local redirect policy, csrf/nonce/session
requirements, expiry requirements, redaction/source guards, and whether
ARIADNE hosted proof is required.

If blocked, name the concrete blocker and the smallest numbered unblock lane
that directly enables live archive connector product depth.

## Explicit Non-Scope

PR484E must not add or change:

- OAuth redirect routes;
- OAuth callback routes;
- credential write, credential revoke, token exchange, token refresh, or token
  revocation routes;
- provider SDKs, live Reddit/Discord API calls, configured real test
  credentials, source inventory pulls, recurring pulls, import writes, jobs,
  queues, workers, Redis, Cloudflare, billing/Stripe, provider/model calls,
  package dependencies, hosted runtime behavior, public connector pages, web
  UI, broad connector marketplace, or social posting behavior;
- archive source, import job, Memory, Canon, Continuity, public document, or
  review candidate writes;
- logging or readback of env names or values.

Do not expose env names, env values, client ids, client secrets, secret tails,
OAuth codes, access tokens, refresh tokens, cookies, credentials, raw external
account ids, raw owner or row ids, raw session ids, nonce hashes, csrf hashes,
provider payloads, private source bodies, private messages, archive snippets,
SQL/table details, stack traces, hosted logs, storage paths, signed URLs,
prompts, or secret-shaped values.

## Questions ARGUS Should Answer

1. Is `POST /archive-connectors/oauth/:provider/start` the right route shape?
2. What auth/session value should bind the OAuth state without exposing raw
   session ids?
3. Should the response return any state handle, or only safe metadata?
4. What local redirect paths are allowed?
5. What expiry window is acceptable?
6. Should missing/partial provider app config return 409, 423, or another
   bounded status?
7. Does successful OAuth state creation need hosted proof even though there is
   no UI, provider call, redirect, callback, token exchange, or import write?
8. What source guards prove no live OAuth/provider/import behavior was added?

## Wakeup Template

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARGUS accepted PR484E Archive Connector OAuth State Start.
Task:
- Implement only the accepted owner/session-bound OAuth state start route.
- Keep provider calls, redirects, callbacks, token exchange, credential writes,
  source inventory, and import writes out of scope.
```

If ARGUS rejects or blocks the lane:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS blocked or rejected PR484E Archive Connector OAuth State Start.
Blocker:
- <concrete blocker>
Task:
- Choose the smallest unblock lane or another named Phase 3/customer-facing feature.
```
