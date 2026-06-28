# PR444 - Hosted Product Operation Sweep Closeout

Owner: MIMIR / A1

Date: 2026-06-28

State: CLOSED - OPEN PR445 DISCOVER DOCUMENT ROUTE REPAIR

## Decision

MIMIR closes PR444 as a completed hosted product-operation sweep with one
concrete product defect.

ARIADNE result:

`docs/roadmap/PR444_HOSTED_PRODUCT_OPERATION_SWEEP_RESULT.md`

Verdict:

```text
PRODUCT_DEFECT_NEEDS_DAEDALUS
```

Accepted finding:

- signed-out `/` and `/discover` returned HTTP 200;
- Discover rendered public document card links shaped
  `/documents/<document-id>`;
- the hosted web app has no public route for `/documents/<document-id>`;
- a sampled public document link from Discover returned HTTP 404;
- sampled public Developer Space and forum routes from the same product path
  returned HTTP 200;
- this is a public reading-path defect, not a provider-config blocker.

## Next Lane

Open PR445:

`docs/roadmap/PR445_DISCOVER_DOCUMENT_ROUTE_REPAIR_DAEDALUS.md`

DAEDALUS should repair Discover public document routeability by either fixing
feed/card href generation to canonical public Space document routes or adding a
safe public document resolver/redirect.

The repair must not expose private, unlisted, community-only, owner-only, or
non-routeable documents.
