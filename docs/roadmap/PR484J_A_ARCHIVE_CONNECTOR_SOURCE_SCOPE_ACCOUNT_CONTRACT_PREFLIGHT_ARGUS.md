# PR484J-A - Archive Connector Source Scope And Account Contract Preflight

Owner: ARGUS / A3

Date: 2026-06-30

Status: Open for hostile preflight

## Context

ARGUS blocked PR484J Source Inventory as an implementation lane:

`docs/roadmap/PR484J_ARCHIVE_CONNECTOR_SOURCE_INVENTORY_PREFLIGHT_RESULT.md`

MIMIR accepts the block and opens the smallest unblock:

`docs/roadmap/PR484J_ARCHIVE_CONNECTOR_SOURCE_INVENTORY_BLOCK_CLOSEOUT.md`

Current archive connector credentials are connect-proof only:

- Reddit `identity`;
- Discord `identify`.

Source inventory must not proceed until Station has an accepted scope,
consent, provider account, token decrypt, provider-client, safe source, and
no-import contract.

## Decision Requested

ARGUS should hostile-preflight the contract and decide whether PR484J-A can
move to DAEDALUS as a narrow contract/helper/test/docs lane.

If accepted, ARGUS should wake DAEDALUS with the exact implementation scope.
If blocked, ARGUS should wake MIMIR with the concrete blocker and smallest
next unblock.

## Contract To Settle

- First accepted Reddit source types and required OAuth scopes.
- Whether Reddit starts with account-only proof, `mysubreddits`, `history`,
  `read`, or a smaller staged subset.
- Whether Discord starts with `guilds` basic readback, stays account-only, or
  is deferred until a bot/install/partner-scope lane.
- Owner-facing consent copy for every expanded provider scope.
- Reconnect behavior for existing connect-proof-only credentials.
- Provider account lookup boundary and whether it is part of PR484J-A or a
  separate lane.
- Raw external account id policy, including whether Station stores only
  fingerprints.
- Token decrypt policy and failure modes.
- Provider-client mock seam and redaction rules.
- Source inventory response fields and forbidden fields.
- Import boundary proving no archive source, import job, Memory, Canon,
  Continuity, document, public copy, queue, or worker write happens.

## Candidate Accepted Output

If PR484J-A can proceed, DAEDALUS should add only contract/helper/test/docs
surface for:

- provider source scope definitions;
- source consent copy/readback helpers;
- provider account safe metadata rules;
- source inventory safe-field matrix;
- reconnect/scope-missing states;
- tests proving forbidden fields and import writes stay out of scope.

No live provider source API call is required for PR484J-A unless ARGUS
explicitly accepts a mocked provider-client contract helper.

## Out Of Scope

- live source inventory route;
- token decrypt implementation unless ARGUS accepts a helper-only boundary;
- provider source API calls;
- provider SDKs;
- import creation;
- archive source writes;
- Memory, Canon, Continuity, document, public-copy, queue, or worker writes;
- recurring pulls, Redis, Cloudflare, billing, packages, marketplace, broad UI,
  or social behavior;
- silent OAuth scope expansion without owner consent copy and reconnect policy.

## Wakeup

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- MIMIR accepted ARGUS's PR484J block and opened the smallest unblock.
- Current Reddit/Discord credentials are connect-proof only; source inventory needs an accepted scope, consent, account, decrypt, provider-client, redaction, and no-import contract before provider reads.
Task:
- Hostile-preflight PR484J-A Archive Connector Source Scope And Account Contract.
- Decide whether DAEDALUS can implement a contract/helper/test/docs lane, or name the concrete blocker and smallest next unblock.
- Keep live provider source calls, import writes, broad UI, Redis, Cloudflare, billing, packages, marketplace, and social behavior out of scope.
```
