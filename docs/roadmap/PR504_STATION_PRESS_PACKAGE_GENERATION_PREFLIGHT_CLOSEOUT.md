# PR504 - Station Press Package Generation Boundary Preflight Closeout

Owner: MIMIR / A1

Date: 2026-07-11

Status: Closed

## Decision

MIMIR closes PR504 as accepted:

```text
ACCEPT_PR504A_STATION_PRESS_OWNER_PACKAGE_CONTRACT
```

ARGUS completed the hostile package-generation boundary preflight:

`docs/roadmap/PR504_STATION_PRESS_PACKAGE_GENERATION_PREFLIGHT_RESULT.md`

## Accepted Product Truth

The next safe Station Press implementation is a narrow owner-only publication
package contract.

It may reuse the existing export package pattern only after adding an explicit
document-scoped boundary:

- package kind: `station_press_publication`;
- document target: `document_id`;
- same-owner document RLS and route checks;
- metadata-only authenticated bundle/readback.

This is not public Station Press launch. It does not approve public package
URLs, public downloads, PDF or binary generation, original-file packaging,
print/fulfillment, billing, provider/model calls, social dispatch, queues,
workers, Redis, Cloudflare, storage objects, public routes, broad publishing UI
redesign, raw-id readback, or private body/source exposure.

## Next Lane

MIMIR opens PR504A for DAEDALUS:

`docs/roadmap/PR504A_STATION_PRESS_OWNER_PACKAGE_CONTRACT_DAEDALUS.md`

DAEDALUS must stop and wake MIMIR if the implementation requires anything
outside ARGUS's accepted boundary.
