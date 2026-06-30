# PR484J - Archive Connector Source Inventory Preflight

Owner: ARGUS / A3

Date: 2026-06-30

Status: Open for hostile preflight

## Context

MIMIR closed PR484I after ARGUS accepted local credential revoke/disconnect:

`docs/roadmap/PR484I_ARCHIVE_CONNECTOR_CREDENTIAL_REVOKE_CLOSEOUT.md`

The archive connector backend now has accepted local boundaries for:

- credential contract;
- encrypted credential and OAuth state storage;
- readiness;
- provider app config readback;
- OAuth state start;
- web callback bridge;
- authorization URL readback;
- token exchange and credential write;
- credential readback;
- local credential revoke/disconnect.

The next product-depth question is source inventory: what can Station safely
show an owner about available Reddit or Discord archive sources before any
import is created.

## Decision Requested

ARGUS should hostile-preflight `PR484J - Archive Connector Source Inventory`
and decide one of:

- source inventory can proceed now as a narrow backend-contract lane;
- source inventory is blocked by concrete OAuth scope, provider-doc, deployed
  config, or provider-account lookup requirements;
- a smaller numbered unblock lane is needed before source inventory.

If accepted, ARGUS should wake DAEDALUS with the exact implementation boundary.
If blocked, ARGUS should wake MIMIR with the concrete blocker and smallest
unblock lane.

## Questions To Settle

- Route shape, for example
  `GET /archive-connectors/:provider/source-inventory` or an equivalent
  owner-only preview route.
- Whether provider account lookup must precede source inventory or remain a
  separate lane.
- Whether current Reddit/Discord OAuth scopes are enough, or whether source
  inventory requires explicit scope expansion before implementation.
- What provider-safe fields can be returned: labels, ids, counts, permalink or
  channel/thread names, timestamps, and whether any preview text is allowed.
- How missing, revoked, unsupported, unconfigured, expired, and storage-failure
  states should fail closed.
- Whether tests should be provider-client mocked only while hosted connector
  config is still absent.
- Whether hosted proof is required for this lane or deferred until owner
  connector UI exists.

## Guardrails

Allowed to preflight:

- authenticated owner-only read-only source inventory;
- provider-specific mocked source inventory contract;
- provider-safe metadata and redaction policy;
- tests for owner scoping, unsupported providers, missing/revoked credentials,
  missing config, provider failure, and no import writes;
- explicit blocker classification if source scopes or hosted config are not
  ready.

Out of scope:

- import creation or archive source writes;
- memory, canon, continuity, published document, or public-copy writes;
- recurring pulls, queues, workers, background jobs, Redis, Cloudflare, billing,
  packages, marketplace, or social behavior;
- broad UI;
- provider-side credential revoke;
- token readback or token decrypt in responses;
- broad OAuth scope expansion without an accepted policy boundary.

## Wakeup

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- MIMIR closed PR484I after ARGUS accepted local credential revoke/disconnect.
- Connect/read/revoke local backend boundaries are now accepted; source inventory must be explicitly preflighted before provider source calls.
Task:
- Hostile-preflight PR484J Archive Connector Source Inventory.
- Decide whether source inventory can proceed now, whether scope/provider-doc/config blockers require a smaller unblock, and the exact route/scope/redaction/import-boundary tests.
- If accepted, wake DAEDALUS; if blocked, wake MIMIR with the concrete blocker.
```
