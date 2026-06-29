# PR484C - Connector OAuth Readiness Route Preflight

Owner: ARGUS / A3

Opened by: MIMIR / A1

Date opened: 2026-06-29

Status: Open - decide smallest safe connector readiness/OAuth-state route

## MIMIR Decision

PR484A accepted the provider-neutral connector contract. PR484B accepted
encrypted credential storage and OAuth state storage.

Live Reddit/Discord archive intake is still blocked by two things:

- no accepted route/API behavior for owner connector readiness, OAuth state
  creation, callback validation, or credential write;
- `ARCHIVE_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY` is not present in local `.env`
  at the time MIMIR opened this lane.

MIMIR opens PR484C as the next direct route/API unblock. The goal is to move
the backend toward live connectors without pretending real provider credentials
or OAuth app config exist.

## ARGUS Task

Hostile-preflight the current repo and decide whether DAEDALUS may implement a
small PR484C route/API slice.

Return one of:

```text
ACCEPT_PR484C_CONNECTOR_READINESS_ROUTE
ACCEPT_PR484C_OAUTH_STATE_CREATE_ROUTE
ACCEPT_PR484C_CREDENTIAL_WRITE_FAIL_CLOSED_ROUTE
BLOCKED_NEEDS_CONFIG
BLOCKED_NEEDS_MIMIR_DECISION
REJECT_DEFER
```

If accepted, specify exact touched files or acceptable local equivalents,
tests, config assumptions, response redaction rules, and whether ARIADNE hosted
proof is required.

If blocked, name the concrete blocker and the smallest numbered unblock lane
that directly enables live archive connector product depth.

## Candidate PR484C Shapes

ARGUS may accept, patch, or reject these candidates.

Preferred if config remains missing:

1. Connector readiness route:
   - authenticated owner-only API route returns provider readiness for `reddit`
     and `discord`;
   - reports missing archive connector encryption key and missing provider app
     credentials as safe statuses only;
   - returns no secret values, no env values, no raw row ids, no token tails,
     no SQL/table details, and no provider payloads;
   - performs no writes and no provider calls.

Optional if safe without credential config:

2. OAuth state create route:
   - authenticated owner-only route creates a one-time OAuth state row using
     the accepted PR484B storage helper;
   - accepts provider and local redirect path only;
   - returns safe metadata and a server-owned nonce/state handle without
     provider redirect or callback behavior;
   - performs no token exchange and no provider call.

Only if ARGUS accepts fail-closed behavior:

3. Credential write fail-closed route:
   - authenticated owner-only route attempts no real provider token exchange;
   - proves missing `ARCHIVE_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY` returns a
     bounded setup-required status before any stored credential is revoked;
   - no real tokens, no OAuth codes, no provider payloads, and no successful
     credential write without config.

If none are safe, name the direct blocker. Examples: hosted DB migration not
applied, encryption key missing, provider app config policy missing, OAuth route
csrf contract incomplete, route naming decision, or credential write policy.

## Questions ARGUS Should Answer

1. Should PR484C be read-only readiness first, OAuth state creation first, or a
   fail-closed credential-write proof?
2. Does the missing local `ARCHIVE_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY` block
   all route work, or only successful credential writes?
3. Which API route naming and method shape matches the repo?
4. What safe response fields are allowed: provider, configured state,
   encryption configured boolean, OAuth app configured boolean, next action,
   expiry, local redirect path, or nothing else?
5. What must never be returned: env values, access tokens, refresh tokens,
   OAuth codes, cookies, provider payloads, raw external account ids, raw row
   ids, source bodies, private messages, SQL/table details, stack traces,
   hosted logs, storage paths, signed URLs, prompts, or secret-shaped values?
6. Which tests must DAEDALUS run if accepted?
7. Does PR484C need ARIADNE hosted proof if it adds API-only route behavior but
   no visible UI?
8. What exact config, if any, should MIMIR ask Marty for after PR484C?

## Guardrails

Do not add or claim:

- live Reddit API calls, Discord API calls, provider SDK execution, configured
  test-credential execution, source inventory pulls, recurring pulls, import
  writes, or provider token exchange;
- OAuth redirects/callback execution unless ARGUS explicitly accepts route-only
  state proof;
- public connector pages, cross-owner connector access, admin impersonation,
  social posting behavior, provider/model calls, billing/Stripe, Redis,
  Cloudflare, workers, queues, scheduled jobs, runtime provisioning, or broad
  connector marketplace;
- automatic import into Memory, Canon, Continuity, public documents, archive
  sources, import jobs, or import review.

Do not expose access tokens, refresh tokens, OAuth codes, cookies, credentials,
raw external account ids, private source bodies, private messages, archive
snippets, unsafe permalinks, provider payloads, storage paths, signed URLs,
hosted logs, SQL/table output, table names, stack traces, prompts, env values,
or secret-shaped values.

## Inputs

- `docs/roadmap/PR484B_CONNECTOR_CREDENTIAL_STORAGE_CLOSEOUT.md`
- `docs/roadmap/PR484B_CONNECTOR_CREDENTIAL_STORAGE_REVIEW_RESULT.md`
- `docs/architecture/live-archive-connector-credential-contract.md`
- `docs/architecture/live-archive-connector-credential-storage.md`
- `apps/api/src/services/archive-connectors/credential-contract.ts`
- `apps/api/src/services/archive-connectors/credential-storage.ts`
- Current API route conventions and auth middleware.

## Wakeup Template

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS completed PR484C Connector OAuth Readiness Route preflight.
Verdict:
- ACCEPT_PR484C_CONNECTOR_READINESS_ROUTE | ACCEPT_PR484C_OAUTH_STATE_CREATE_ROUTE | ACCEPT_PR484C_CREDENTIAL_WRITE_FAIL_CLOSED_ROUTE | BLOCKED_NEEDS_CONFIG | BLOCKED_NEEDS_MIMIR_DECISION | REJECT_DEFER
Task:
- Wake DAEDALUS with accepted scope, route the smallest unblock lane, ask for config, or choose another named Phase 3/customer-facing feature.
```
