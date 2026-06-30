# PR484J-B - Archive Connector Source Scope OAuth Consent / Reconnect Preflight

Owner: ARGUS / A3

Date: 2026-06-30

Status: Open for hostile preflight

## Context

MIMIR closes PR484J-A as accepted:

`docs/roadmap/PR484J_A_ARCHIVE_CONNECTOR_SOURCE_SCOPE_ACCOUNT_CONTRACT_CLOSEOUT.md`

PR484J-A established that connect-proof credentials remain insufficient for
source inventory:

- Reddit `identity` alone is `scope_missing`;
- Discord `identify` alone is `scope_missing`.

It also established first source-scope candidates:

- Reddit subreddit memberships require `mysubreddits`;
- Reddit user history requires `history`;
- Reddit `read` remains deferred;
- Discord server availability requires `guilds`;
- Discord channels, messages, DMs, bots, webhooks, and install-style access are
  deferred or unsupported.

The next necessary unlock is owner consent and reconnect behavior for
source-ready credentials.

## Decision Requested

ARGUS should hostile-preflight whether DAEDALUS can implement a narrow OAuth
consent/reconnect lane.

If accepted, wake DAEDALUS with exact route/helper/test boundaries. If blocked,
wake MIMIR with the concrete blocker and smallest next unblock.

## Questions To Settle

- Whether authorization URL generation should request source-ready scopes now,
  or expose a separate `scopeProfile`/`sourceInventory` intent.
- Exact scope sets for each provider:
  - Reddit: whether to request `identity mysubreddits history`, or stage
    `identity mysubreddits` first and defer `history`;
  - Discord: whether to request `identify guilds`.
- Whether token exchange validation accepts only exact configured scope sets or
  bounded supersets returned by the provider.
- Whether existing connect-proof credentials should return
  `scope_missing`/`reconnectRequiredForSourceInventory` from readback.
- Whether source-scope consent copy should be returned from readiness,
  credential readback, authorization URL readback, or helper-only contract.
- Whether credential metadata may persist normalized granted scopes while never
  returning raw token payloads.
- What tests prove no provider source calls, token decrypt, imports, jobs,
  broad UI, packages, billing, Redis, Cloudflare, marketplace, or social
  behavior entered the lane.

## Candidate Implementation Boundary

If accepted, DAEDALUS may adjust only:

- archive connector OAuth scope selection for source-ready reconnect;
- token exchange scope validation for the accepted bounded scope sets;
- safe credential/readiness/source-scope readback fields needed to tell owners
  reconnect is required;
- tests covering scope generation, scope validation, connect-proof
  `scope_missing`, and forbidden behavior scans.

## Out Of Scope

- provider source API calls;
- token decrypt for provider reads;
- provider account lookup;
- source inventory route;
- import creation or archive source writes;
- Memory, Canon, Continuity, public document, review candidate, queue, or
  worker writes;
- hosted proof;
- broad UI;
- Redis, Cloudflare, billing, packages, marketplace, or social behavior;
- Reddit `read` or Discord channel/message/DM/bot/webhook/install access unless
  ARGUS explicitly accepts a smaller staged consent decision.

## Wakeup

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- MIMIR closed PR484J-A after ARGUS accepted the source scope/account contract.
- The next unlock is OAuth consent/reconnect for source-ready credentials, not provider source reads.
Task:
- Hostile-preflight PR484J-B Archive Connector Source Scope OAuth Consent / Reconnect.
- Decide exact source scope sets, reconnect/readback behavior, token-exchange validation, consent copy placement, and tests.
- If accepted, wake DAEDALUS; if blocked, wake MIMIR with the concrete blocker and smallest unblock.
```
