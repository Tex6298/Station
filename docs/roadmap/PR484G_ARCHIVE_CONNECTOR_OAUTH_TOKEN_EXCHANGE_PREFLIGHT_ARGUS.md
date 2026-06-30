# PR484G - Archive Connector OAuth Token Exchange / Credential Write Preflight

Owner: ARGUS / A3

Opened by: MIMIR / A1

Date opened: 2026-06-30

Status: Open - decide token exchange and credential write boundary

## MIMIR Decision

PR484F-E is hosted-config blocked because Railway lacks archive connector
credential encryption and archive-specific provider app config. That blocks
owner-ready hosted proof, but it does not have to stop backend contract work.

MIMIR opens PR484G as the next smallest live archive connector backend lane:
decide whether DAEDALUS may add the token exchange and encrypted credential
write boundary under strict fail-closed config rules.

This is still not source inventory or import. It is the connector account
credential handoff after a provider callback.

## Current Accepted Building Blocks

- PR484B: encrypted connector credential and OAuth state storage exists.
- PR484C/PR484D: owner readiness and provider app config readiness exist.
- PR484E: authenticated state start creates owner/session-bound OAuth state.
- PR484F-C: web callback bridge verifies callback code/state and consumes state
  once with bounded readback.
- PR484F-D: authorization URL readback validates state without consuming and
  uses minimal connect-proof scopes.
- PR484F-E: hosted proof is parked on missing hosted config.

## Candidate Shape

ARGUS should decide whether to patch the existing callback verify route or add
a sibling route.

Candidate preferred shape:

```text
POST /archive-connectors/oauth/:provider/callback/exchange
```

Candidate behavior:

- authenticated owner-only route using the existing archive connector Bearer
  auth boundary;
- accepts only callback `code` and `state` from the web callback bridge;
- validates provider allow-list, configured provider app, credential encryption
  config, owner/session-bound PR484E state, redirect URI policy, bounded code
  shape, and callback purpose before any provider call;
- exchanges the code with the provider token endpoint using structured request
  builders and test-injected fetch/client seams;
- stores token material only through the accepted encrypted connector
  credential storage helper;
- consumes state exactly once only at the ARGUS-approved point;
- returns bounded connection readback only.

ARGUS may instead require patching
`POST /archive-connectors/oauth/:provider/callback/verify` to support a
strictly named exchange mode, or may reject combining verify and exchange.

## Provider Policy Questions

ARGUS should decide:

1. Should token exchange be a new route or an explicit mode on the existing
   callback verify route?
2. Must credential encryption config be present before provider token exchange
   is attempted?
3. If encryption config is missing, should the route return `409` before state
   consume and before provider call?
4. At what exact point is the one-time OAuth state consumed: before provider
   exchange, after provider exchange, after encrypted credential write, or with
   a transactional helper?
5. How should provider token failures be handled without leaking provider
   payloads or making state replay unsafe?
6. Should PR484G store only access-token material from temporary/connect-proof
   scopes, or also refresh-token material if a provider returns it?
7. What safe credential readback is allowed: provider/status/scope class/expiry
   class only, or less?
8. Should provider account identity readback remain out of scope until a later
   provider-profile lane?
9. Can DAEDALUS use mocked provider responses and injected test config for
   local validation while hosted proof remains config-blocked?
10. What ARIADNE hosted proof is required after config exists?

## Preferred Guardrails

Unless ARGUS patches this, MIMIR prefers:

- no provider call if provider app config or credential encryption config is
  missing;
- no state consume before the system can safely store the encrypted credential;
- structured token endpoint clients with mocked tests, no package dependency
  unless ARGUS accepts one;
- bounded provider response parsing with allow-listed token fields only;
- encrypted storage through existing connector credential storage, no raw token
  readback anywhere;
- no provider account/profile fetch in PR484G;
- no source inventory, import, recurring pull, job/queue, UI, billing, Redis,
  Cloudflare, package, marketplace, or social behavior.

## Explicit Non-Scope

PR484G must not add or change:

- source inventory pulls;
- Reddit saved/upvoted/history/comment/message reads;
- Discord guild, member, channel, message, bot, webhook, or posting behavior;
- recurring pulls, import jobs, archive source writes, Memory, Canon,
  Continuity, public documents, review candidates, queues, workers, Redis,
  Cloudflare, billing/Stripe, provider/model calls, package dependencies
  unless explicitly accepted, broad connector UI, marketplace, or social
  posting;
- real provider credentials in committed tests or docs;
- hosted config values, env values, client secret tails, OAuth codes, access
  tokens, refresh tokens, provider payloads, private source bodies, private
  messages, raw state handles, owner ids, row ids, session ids, nonce/csrf
  values or hashes, SQL/table details, stack traces, hosted logs, storage
  paths, signed URLs, prompts, cookies, or secret-shaped readback.

## Return Options

Return one:

```text
ACCEPT_PR484G_TOKEN_EXCHANGE_CREDENTIAL_WRITE
ACCEPT_PR484G_EXCHANGE_CONTRACT_ONLY
PATCH_SCOPE
BLOCKED_NEEDS_MIMIR_DECISION
BLOCKED_NEEDS_CONFIG
BLOCKED_NEEDS_PROVIDER_DOCS
BLOCKED_NEEDS_STORAGE_TRANSACTION
REJECT_DEFER
```

If accepted, specify exact route shape, state consume timing, config failure
behavior, provider token endpoint policy, tests, redaction/source guards, and
whether ARIADNE hosted proof must wait for config.

If blocked, name the concrete blocker and the smallest numbered unblock lane
that directly enables live archive connector product depth.

## Wakeup

If accepted:

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARGUS accepted PR484G Archive Connector OAuth Token Exchange / Credential Write.
Task:
- Implement only the accepted token exchange and encrypted credential write
  boundary.
- Keep source inventory, imports, recurring pulls, jobs, UI, Redis, Cloudflare,
  billing, package changes, marketplace, and social behavior out of scope.
```

If blocked or rejected:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS blocked or rejected PR484G Archive Connector OAuth Token Exchange / Credential Write.
Blocker:
- <concrete blocker>
Task:
- Choose the smallest unblock lane or park live archive connectors until config
  is available.
```
