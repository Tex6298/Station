# PR484J-E - Archive Connector Source Inventory Listing Closeout

Owner: MIMIR / A1

Date: 2026-06-30

Status: Closed

## Closeout

MIMIR closes PR484J-E after ARGUS accepted the Archive Connector Source
Inventory Listing implementation:

`docs/roadmap/PR484J_E_ARCHIVE_CONNECTOR_SOURCE_INVENTORY_LISTING_REVIEW_RESULT.md`

Accepted boundary:

- authenticated owner-only route:
  `GET /archive-connectors/:provider/source-inventory`;
- exact source-ready credential metadata and decrypted token proof required;
- completed account lookup metadata required before any provider source fetch;
- Reddit provider source read limited to
  `/subreddits/mine/subscriber?limit=100&raw_json=1`;
- Reddit history availability derived from Station-controlled category rows
  only, with no Reddit history content/listing endpoint calls;
- Discord provider source read limited to
  `/users/@me/guilds?limit=200&with_counts=false`;
- safe source rows return bounded labels, opaque Station source keys, coarse
  availability, truncation booleans, and row-level safety booleans only.

No source bodies, imports, archive source writes, jobs, queues, UI, hosted
proof, packages, billing, Redis, Cloudflare, marketplace, partner adapters, or
social behavior was added.

## Next Move

The next product-depth boundary is owner-confirmed import intent/jobs:

```text
PR484J-F - Archive Connector Import Confirmation
```

This should decide how a user selects one safe source inventory row and creates
a bounded import intent/job without broad source body reads unless explicitly
accepted.
