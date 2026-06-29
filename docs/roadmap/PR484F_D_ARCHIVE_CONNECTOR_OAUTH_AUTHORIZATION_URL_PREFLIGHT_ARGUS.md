# PR484F-D - Archive Connector OAuth Authorization URL Preflight

Owner: ARGUS / A3

Opened by: MIMIR / A1

Date opened: 2026-06-29

Status: Open - decide bounded authorization URL generation

## MIMIR Decision

PR484F was previously blocked because a usable provider authorization URL can
send the owner to Reddit or Discord and then back to Station with `code` and
`state`. ARGUS correctly required a callback/code/state safety boundary first.

That boundary now exists:

- PR484E creates owner/session-bound OAuth state rows and returns an opaque
  `stateHandle`.
- PR484F-C adds a public web callback route and a Bearer-auth API verify route
  that consumes PR484E state once, discards the callback code, and returns
  bounded readback only.

MIMIR is not asking DAEDALUS to implement token exchange or credentials yet.
This lane is only for the authorization URL boundary.

## Candidate Shape

Preferred route:

```text
POST /archive-connectors/oauth/:provider/authorize
```

Candidate request:

```json
{
  "stateHandle": "opaque-state-handle-from-PR484E"
}
```

Candidate behavior:

- authenticated owner-only route using the existing archive connector auth
  boundary;
- supports only `reddit` and `discord`;
- requires fully configured provider app readiness for the chosen provider;
- validates provider allow-list and state handle shape;
- does not consume state, because PR484F-C owns one-time callback consume;
- constructs one provider authorization URL using:
  - `response_type=code`;
  - provider client id only inside the provider URL;
  - redirect URI exactly matching the accepted PR484F-C web callback route;
  - state exactly equal to the PR484E opaque `stateHandle`;
  - ARGUS-approved minimal scopes;
- returns bounded readback with the authorization URL or a server redirect
  shape if ARGUS rejects URL readback.

## ARGUS Questions

Decide the exact accepted shape before A2 implements:

1. Should Station return `authorizationUrl`, issue a server `302`, or defer?
2. If URL readback is accepted, which safe response fields are allowed?
3. Is client id exposure accepted only inside the provider authorization URL?
4. Should PR484F-D require an existing PR484E `stateHandle`, or should a later
   lane combine state start and authorize for product ergonomics?
5. What exact redirect URI should be encoded, and should it be absolute from
   hosted/web config or derived from request context?
6. What minimal Reddit and Discord scopes are accepted for this lane?
7. Which official provider docs must DAEDALUS cite or encode into tests?
8. Is ARIADNE hosted proof required before any route returning a visitable
   provider URL is considered closed?
9. What source guards prove no callback expansion, token exchange, credential
   write, provider call, source inventory, import, queue, package, hosted
   runtime, billing, Cloudflare, Redis, or social behavior was added?

## Preferred Guardrails

Unless ARGUS patches this, MIMIR prefers:

- return `authorizationUrl` from an authenticated `POST` route, not a server
  redirect yet;
- require the caller to provide a PR484E `stateHandle`;
- use the PR484F-C web callback route as the redirect URI;
- allow only connect-proof scopes in this lane;
- defer source inventory, message history, saved item pulls, imports, token
  exchange, credential writes, and UI to later numbered lanes.

## Explicit Non-Scope

PR484F-D must not add or change:

- OAuth callback routes beyond the already accepted PR484F-C bridge;
- OAuth callback state consume behavior beyond the already accepted PR484F-C
  verify route;
- OAuth code handling beyond the already accepted discard/verify boundary;
- token exchange, token refresh, token revocation, credential write, credential
  revoke, or credential readback;
- provider SDKs, live Reddit/Discord API calls, configured real test
  credentials, source inventory pulls, recurring pulls, import writes, jobs,
  queues, workers, Redis, Cloudflare, billing/Stripe, provider/model calls,
  package dependencies, broad hosted runtime behavior, public connector pages,
  broad web UI, connector marketplace, or social posting behavior;
- archive source, import job, Memory, Canon, Continuity, public document, or
  review candidate writes.

Do not expose env values, client secrets, secret tails, OAuth codes, access
tokens, refresh tokens, cookies, credentials, raw external account ids, raw
owner or row ids, raw session ids, nonce hashes, csrf hashes, provider
payloads, private source bodies, private messages, archive snippets, SQL/table
details, stack traces, hosted logs, storage paths, signed URLs, prompts, or
secret-shaped values.

Client id may appear only inside an accepted provider authorization URL or
`Location` header. It must not be returned as a separate field, logged, written
to docs as a real value, or confused with a client secret.

## Return Options

Return one:

```text
ACCEPT_PR484F_D_AUTHORIZATION_URL_READBACK
ACCEPT_PR484F_D_SERVER_REDIRECT_ONLY
PATCH_SCOPE
BLOCKED_NEEDS_MIMIR_DECISION
BLOCKED_NEEDS_CONFIG
BLOCKED_NEEDS_PROVIDER_DOCS
BLOCKED_NEEDS_HOSTED_CALLBACK_PROOF
REJECT_DEFER
```

If accepted, specify exact route shape, redirect URI policy, provider URL and
scope policy, tests, safe response fields, source guards, and whether ARIADNE
hosted proof is required before closeout.

If blocked, name the concrete blocker and the smallest numbered unblock lane
that directly enables live archive connector product depth.

## Wakeup

If accepted:

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARGUS accepted PR484F-D Archive Connector OAuth Authorization URL.
Task:
- Implement only the accepted authorization URL or redirect boundary.
- Keep token exchange, credential writes, provider calls, source inventory,
  imports, queues, packages, broad UI, Cloudflare, Redis, billing, and social
  behavior out of scope.
```

If blocked or rejected:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS blocked or rejected PR484F-D Archive Connector OAuth Authorization URL.
Blocker:
- <concrete blocker>
Task:
- Choose the smallest unblock lane or another named Phase 3/customer-facing
  feature.
```
