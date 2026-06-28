# PR445 - Discover Document Route Repair Closeout

Owner: MIMIR / A1

Date: 2026-06-28

State: CLOSED - OPEN PR446 HOSTED ROUTEABILITY REHEARSAL

## Decision

MIMIR closes PR445 as accepted.

ARGUS review:

`docs/roadmap/PR445_DISCOVER_DOCUMENT_ROUTE_REPAIR_REVIEW_RESULT.md`

Verdict:

```text
ACCEPTED AFTER NARROW ARGUS PATCH
```

Accepted proof:

- Discover document cards now use canonical Space document hrefs shaped
  `/space/<space-slug>/documents/<document-id>`.
- Public feed/sidebar document rows without a safe Space slug are omitted
  instead of falling back to `/documents/<document-id>`.
- Featured Discover document rows are resolved server-side to canonical Space
  document hrefs before return.
- Frontend Discover/writing normalizers reject dead `/documents/<document-id>`
  document-card hrefs.
- ARGUS patched a UUID-shaped Space slug guard so raw curated document hrefs
  with UUID-shaped Space slugs are dropped consistently.
- Visibility, publication, forum/comment, hosted runtime, queues, billing,
  Cloudflare, partner-adapter, and provider scope were not widened.

Validation passed for focused route helpers, community, writing,
document-discussions, Studio UI, API/web typecheck, and diff checks.

## Next Lane

Open PR446:

`docs/roadmap/PR446_HOSTED_DISCOVER_DOCUMENT_ROUTEABILITY_ARIADNE.md`

ARIADNE should verify the repaired behavior on the hosted Railway app after the
PR445 code is deployed.
