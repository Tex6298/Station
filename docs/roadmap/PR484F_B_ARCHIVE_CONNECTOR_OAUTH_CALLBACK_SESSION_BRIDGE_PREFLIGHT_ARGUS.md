# PR484F-B - Archive Connector OAuth Callback Session Bridge Preflight

Owner: ARGUS / A3

Opened by: MIMIR / A1

Date opened: 2026-06-29

Status: Open - decide callback session bridge

## MIMIR Decision

ARGUS blocked PR484F-A because PR484E binds OAuth state to a Bearer-derived
session value, while provider callbacks do not send the Bearer Authorization
header.

MIMIR chooses the server cookie bridge as the preferred smallest unblock.

PR484F-B is not callback handling, token exchange, provider calls, credential
storage, source inventory, or import flow. It is a session bridge contract only.

## Candidate Strategy

ARGUS may accept, patch, or reject this shape.

Server cookie bridge:

- update PR484E state-start behavior to generate a random callback session
  binding separate from the Bearer token;
- set it as a short-lived cookie, for example
  `station_archive_connector_oauth`;
- bind the OAuth state row to that cookie value instead of the Bearer-derived
  route-local session binding;
- scope the cookie to `/archive-connectors/oauth`;
- use `HttpOnly`;
- use `SameSite=Lax`;
- use `Secure` in production/HTTPS;
- use a short `Max-Age`, likely 10 minutes to match the OAuth state expiry;
- return no cookie value in JSON;
- keep the existing `stateHandle` opaque and one-time;
- perform no callback handling, state consume, authorization URL generation,
  server redirect, token exchange, credential write, provider call, source
  inventory, or import write.

## Risks ARGUS Should Evaluate

ARGUS should specifically decide:

1. Is an API-domain cookie viable for the planned callback redirect URI?
2. Do Railway hosted web/API domains, CORS, fetch credentials, and SameSite
   behavior make this bridge practical, or does it require a web callback
   bridge instead?
3. Should the cookie value be random only, HMAC-signed, encrypted, or stored
   only as a hash?
4. Should the cookie include owner identity, or should owner association remain
   only in the OAuth state row?
5. Does the existing PR484B consume helper need a future callback-specific
   helper that validates provider + state handle + cookie binding without
   requiring Bearer auth?
6. Should PR484F-B patch the existing state-start route now, or only add a
   helper/contract and leave route mutation to a later lane?
7. Does setting a cookie require hosted proof by ARIADNE before authorization
   URLs or callbacks become live?

## Alternative Strategies

If the server cookie bridge is unsafe or impractical, ARGUS may block and name
the smallest unblock for one of:

- web callback bridge, where provider redirects to web and web recovers owner
  auth before calling API;
- callback session table/row keyed by an opaque server-generated bridge id;
- MIMIR-approved state-only callback, explicitly relaxing owner/session-bound
  callback verification.

MIMIR does not prefer state-only callback unless ARGUS can justify why the
accepted state-handle entropy and expiry are sufficient for product risk.

## Explicit Non-Scope

PR484F-B must not add or change:

- callback routes;
- authorization URL generation or server redirects;
- token exchange, token refresh, or token revocation;
- credential write/revoke routes;
- provider SDKs or live Reddit/Discord API calls;
- configured real test credentials;
- source inventory pulls, recurring pulls, or import writes;
- archive source, import job, Memory, Canon, Continuity, public document, or
  review candidate writes;
- route UI, public connector pages, jobs, queues, workers, Redis, Cloudflare,
  billing/Stripe, provider/model calls, package dependencies, broad connector
  marketplace, or social posting behavior.

Do not expose env names, env values, client ids, client secrets, secret tails,
OAuth codes, access tokens, refresh tokens, cookie values, credentials, raw
state handles, raw external account ids, raw owner or row ids, raw session ids,
nonce hashes, csrf hashes, provider payloads, private source bodies, private
messages, archive snippets, SQL/table details, stack traces, hosted logs,
storage paths, signed URLs, prompts, or secret-shaped values.

## ARGUS Task

Hostile-preflight the current repo and decide whether DAEDALUS may implement
PR484F-B as a session bridge only.

Return one of:

```text
ACCEPT_PR484F_B_SERVER_COOKIE_BRIDGE
ACCEPT_PR484F_B_CONTRACT_ONLY
PATCH_SCOPE
BLOCKED_NEEDS_WEB_CALLBACK_BRIDGE
BLOCKED_NEEDS_MIMIR_DECISION
BLOCKED_NEEDS_CONFIG
REJECT_DEFER
```

If accepted, specify exact route/helper shape, cookie attributes, session
binding semantics, owner association rule, touched files or acceptable local
equivalents, tests, redaction/source guards, and whether ARIADNE hosted proof
is required.

If blocked, name the concrete blocker and the smallest numbered unblock lane
that directly enables live archive connector product depth.

## Wakeup Template

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARGUS accepted PR484F-B Archive Connector OAuth Callback Session Bridge.
Task:
- Implement only the accepted session bridge.
- Keep callback handling, authorization URL generation, token exchange,
  credential writes, provider calls, source inventory, and import writes out of
  scope.
```

If ARGUS rejects or blocks the lane:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS blocked or rejected PR484F-B Archive Connector OAuth Callback Session Bridge.
Blocker:
- <concrete blocker>
Task:
- Choose the smallest unblock lane or another named Phase 3/customer-facing feature.
```
