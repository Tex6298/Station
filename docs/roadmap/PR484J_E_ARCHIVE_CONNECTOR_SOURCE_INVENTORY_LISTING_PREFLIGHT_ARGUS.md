# PR484J-E - Archive Connector Source Inventory Listing Preflight

Owner: ARGUS / A3

Date: 2026-06-30

Status: Open for hostile preflight

## Context

MIMIR closes PR484J-D as accepted:

`docs/roadmap/PR484J_D_ARCHIVE_CONNECTOR_PROVIDER_ACCOUNT_LOOKUP_CLOSEOUT.md`

Archive connectors now have accepted local/backend boundaries for source scope
contract, source-scope reconnect, source-ready credential decrypt, and provider
account lookup. The next product-depth step is source inventory/listing, still
before imports or UI.

## Decision Requested

ARGUS should hostile-preflight whether DAEDALUS can implement a narrow,
owner-only source inventory listing boundary.

If accepted, wake DAEDALUS with exact route/helper/test boundaries. If blocked,
wake MIMIR with the concrete blocker and smallest next unblock.

## Questions To Settle

- Route shape, for example:
  `GET /archive-connectors/:provider/source-inventory`.
- Whether the route requires an active `source_inventory` credential only.
- Whether provider account lookup must already be completed, or whether source
  inventory can run and then fail closed on account mismatch.
- Accepted provider source reads:
  - Reddit subreddit memberships from the accepted `mysubreddits` scope;
  - Reddit history category availability from the accepted `history` scope;
  - Discord guild/server availability from the accepted `guilds` scope.
- Whether Reddit `read`, Discord channels, messages, DMs, bots, webhooks, and
  installs remain deferred or unsupported.
- Safe response fields: provider, source family, bounded label, opaque source
  key, coarse availability, source-state flags, and no raw ids.
- Forbidden response fields: source bodies, post/comment/message text, private
  snippets, raw provider ids, raw URLs/permalinks, provider payloads, live
  counts, tokens, OAuth scopes from token payloads, SQL/storage details, stack
  traces, and secret-shaped values.
- Provider-client seam, timeout/rate-limit behavior, payload-shape validation,
  and redaction tests.
- No-import proof: no archive source rows, import jobs, Memory, Canon,
  Continuity, public documents, review candidates, queue, or worker writes.

## Candidate Implementation Boundary

If accepted, DAEDALUS may add only:

- source inventory provider-client helpers with injected fetch/client seam;
- an authenticated owner-only read route if ARGUS accepts route shape;
- safe source inventory serializers;
- focused tests for owner scope, source-ready credential requirement,
  provider failures, redaction, deferred source families, and no-import scans.

## Out Of Scope

- import creation or archive source writes;
- source body reads;
- Reddit `read`;
- Discord channels, messages, DMs, bots, webhooks, or install permissions;
- Memory, Canon, Continuity, public document, review candidate, queue, or
  worker writes;
- token refresh/revoke;
- hosted proof;
- broad UI;
- Redis, Cloudflare, billing, packages, marketplace, or social behavior.

## Wakeup

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- MIMIR closed PR484J-D after ARGUS accepted provider account lookup.
- The next archive connector move is source inventory/listing preflight, still read-only and no-import.
Task:
- Hostile-preflight PR484J-E Archive Connector Source Inventory Listing.
- Decide exact route/helper shape, accepted provider source reads, safe/forbidden fields, provider-client behavior, failure modes, and no-import tests.
- If accepted, wake DAEDALUS; if blocked, wake MIMIR with the concrete blocker and smallest unblock.
```
