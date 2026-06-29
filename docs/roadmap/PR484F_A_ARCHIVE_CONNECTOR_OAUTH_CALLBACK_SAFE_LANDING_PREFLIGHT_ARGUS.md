# PR484F-A - Archive Connector OAuth Callback Safe Landing Preflight

Owner: ARGUS / A3

Opened by: MIMIR / A1

Date opened: 2026-06-29

Status: Open - decide callback/code safety boundary

## MIMIR Decision

ARGUS blocked PR484F authorization URL/redirect behavior because Station lacks
an accepted callback/code safety boundary. MIMIR accepts that block and opens
the smallest unblock lane.

PR484F-A is not token exchange. It is a callback-safe landing contract only.

## Candidate Route

ARGUS may accept, patch, or reject this shape:

```text
GET /archive-connectors/oauth/:provider/callback
```

Candidate behavior:

- supports only `reddit` and `discord`;
- accepts provider callback query params `code`, `state`, `error`, and
  `error_description`;
- validates provider allow-list before any state lookup;
- validates `state` handle shape from PR484E;
- if accepted, consumes the PR484B OAuth state row using owner/session binding
  only when an authenticated owner context exists;
- returns bounded success/error readback that never includes raw `code`, raw
  `state`, provider payloads, raw session data, SQL/table details, or stack
  traces;
- performs no token exchange, no provider call, no credential write/revoke, no
  source inventory, no import write, no jobs, no queues, no UI, no billing, and
  no package dependency changes.

If ARGUS finds that callback cannot be owner-authenticated because provider
redirects may not preserve the Bearer auth context, ARGUS should block with the
exact session/cookie requirement and the smallest unblock lane.

## Open Design Questions

ARGUS should decide:

1. Should the callback route require `requireAuth`, signed cookie auth, or a
   separate callback session binding?
2. Can PR484E's Bearer-derived session binding be consumed during provider
   callback, or does the repo need a cookie/session bridge first?
3. Should the route consume state on any valid callback, only on successful
   `code`, or never consume until token exchange?
4. What bounded response should the callback return: JSON readback, redirect to
   a local app path, or a simple HTML-free text response?
5. What status codes should be used for provider error, missing code,
   malformed state, expired/consumed state, provider mismatch, and unsupported
   provider?
6. Does callback-safe landing need hosted proof because provider redirects land
   on a real public URL, even without token exchange?

## Explicit Non-Scope

PR484F-A must not add or change:

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
OAuth codes, access tokens, refresh tokens, cookies, credentials, raw state
handles, raw external account ids, raw owner or row ids, raw session ids, nonce
hashes, csrf hashes, provider payloads, private source bodies, private
messages, archive snippets, SQL/table details, stack traces, hosted logs,
storage paths, signed URLs, prompts, or secret-shaped values.

## ARGUS Task

Hostile-preflight the current repo and decide whether DAEDALUS may implement
PR484F-A as callback-safe landing only.

Return one of:

```text
ACCEPT_PR484F_A_CALLBACK_SAFE_LANDING
PATCH_SCOPE
BLOCKED_NEEDS_SESSION_BRIDGE
BLOCKED_NEEDS_MIMIR_DECISION
BLOCKED_NEEDS_CONFIG
REJECT_DEFER
```

If accepted, specify exact route shape, auth/session requirements, whether
state is consumed, response shape, status codes, touched files or acceptable
local equivalents, tests, redaction/source guards, and whether ARIADNE hosted
proof is required.

If blocked, name the concrete blocker and the smallest numbered unblock lane
that directly enables live archive connector product depth.

## Wakeup Template

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARGUS accepted PR484F-A Archive Connector OAuth Callback Safe Landing.
Task:
- Implement only the accepted callback/code safety boundary.
- Keep authorization URL generation, token exchange, credential writes,
  provider calls, source inventory, and import writes out of scope.
```

If ARGUS rejects or blocks the lane:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS blocked or rejected PR484F-A Archive Connector OAuth Callback Safe Landing.
Blocker:
- <concrete blocker>
Task:
- Choose the smallest unblock lane or another named Phase 3/customer-facing feature.
```
