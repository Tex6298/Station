# PR484F-C - Archive Connector OAuth Web Callback Bridge Preflight

Owner: ARGUS / A3

Opened by: MIMIR / A1

Date opened: 2026-06-29

Status: Open - decide web callback bridge

## MIMIR Decision

ARGUS blocked the API-domain server cookie bridge because the repo does not
prove credentialed cookie transport from Station web to Station API across the
hosted Railway origins.

MIMIR chooses the web callback bridge instead.

The intent:

- provider redirects back to a Station web route;
- the web route recovers the existing owner auth/session context;
- the web route calls a bounded API callback endpoint with Bearer auth;
- API can then validate the PR484E state using the owner/auth context without
  relying on provider redirects carrying an API Authorization header or
  cross-origin API cookies.

PR484F-C is a bridge contract/preflight only. It is not token exchange,
credential storage, source inventory, import flow, broad connector UI, or live
provider integration.

## Candidate Shape

ARGUS may accept, patch, or reject this bridge.

Potential web route:

```text
/settings/archive-connectors/callback/:provider
```

or another route that matches Station's existing settings/studio conventions.

Potential API route for the web bridge to call:

```text
POST /archive-connectors/oauth/:provider/callback/verify
```

Candidate behavior:

- web route receives provider query params: `code`, `state`, `error`, and
  `error_description`;
- web route requires/retrieves owner auth before calling API;
- web route never displays, logs, or stores raw OAuth code or raw state;
- API endpoint requires Bearer auth;
- API endpoint validates provider allow-list and state handle shape;
- if accepted, API endpoint consumes state using the authenticated owner/session
  binding that PR484E can reproduce or a patched bridge binding that ARGUS
  accepts;
- API endpoint returns bounded success/error readback only;
- no token exchange, no provider call, no credential write/revoke, no source
  inventory, no import write, no jobs, no queues, no billing, no provider/model
  call, and no package dependency changes.

## ARGUS Questions

1. What web route should be reserved for provider callbacks?
2. Can the web route recover the existing owner session reliably in the current
   Next/Supabase auth setup?
3. Should the web route be a client page, a server route handler, or both?
4. How should the web route pass code/state to the API without leaking them in
   UI, logs, docs, tests, or error readback?
5. Should the API endpoint consume PR484E state in this lane, or only validate
   query shape and owner/provider binding?
6. Does PR484E's current Bearer-derived session binding need patching so web
   bridge verification can reproduce it safely?
7. Does this lane require ARIADNE hosted proof because it touches browser auth
   and a real callback URL?
8. What exact no-token-exchange boundary must be tested?

## Explicit Non-Scope

PR484F-C must not add or change:

- authorization URL generation or server redirects;
- token exchange, token refresh, or token revocation;
- credential write/revoke routes;
- provider SDKs or live Reddit/Discord API calls;
- configured real test credentials;
- source inventory pulls, recurring pulls, or import writes;
- archive source, import job, Memory, Canon, Continuity, public document, or
  review candidate writes;
- broad connector settings UI beyond a minimal callback bridge if ARGUS accepts
  it;
- jobs, queues, workers, Redis, Cloudflare, billing/Stripe,
  provider/model calls, package dependencies, broad connector marketplace, or
  social posting behavior.

Do not expose env names, env values, client ids, client secrets, secret tails,
OAuth codes, access tokens, refresh tokens, cookies, credentials, raw state
handles, raw external account ids, raw owner or row ids, raw session ids, nonce
hashes, csrf hashes, provider payloads, private source bodies, private
messages, archive snippets, SQL/table details, stack traces, hosted logs,
storage paths, signed URLs, prompts, or secret-shaped values.

## ARGUS Task

Hostile-preflight the current repo and decide whether DAEDALUS may implement
PR484F-C as a web callback bridge only.

Return one of:

```text
ACCEPT_PR484F_C_WEB_CALLBACK_BRIDGE
ACCEPT_PR484F_C_WEB_CALLBACK_CONTRACT_ONLY
PATCH_SCOPE
BLOCKED_NEEDS_AUTH_SESSION_DECISION
BLOCKED_NEEDS_MIMIR_DECISION
BLOCKED_NEEDS_CONFIG
REJECT_DEFER
```

If accepted, specify exact web route/API route shape, auth/session requirements,
whether state is consumed, response/UI shape, status codes, touched files or
acceptable local equivalents, tests, redaction/source guards, and whether
ARIADNE hosted proof is required.

If blocked, name the concrete blocker and the smallest numbered unblock lane
that directly enables live archive connector product depth.

## Wakeup Template

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARGUS accepted PR484F-C Archive Connector OAuth Web Callback Bridge.
Task:
- Implement only the accepted web callback bridge.
- Keep authorization URL generation, token exchange, credential writes,
  provider calls, source inventory, and import writes out of scope.
```

If ARGUS rejects or blocks the lane:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS blocked or rejected PR484F-C Archive Connector OAuth Web Callback Bridge.
Blocker:
- <concrete blocker>
Task:
- Choose the smallest unblock lane or another named Phase 3/customer-facing feature.
```
