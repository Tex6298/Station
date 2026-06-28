# PR445 - Discover Document Route Repair

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Date opened: 2026-06-28

## Source

PR444 hosted product-operation sweep found a concrete public reading-path
defect:

`docs/roadmap/PR444_HOSTED_PRODUCT_OPERATION_SWEEP_RESULT.md`

Discover currently renders public document links shaped:

```text
/documents/<document-id>
```

The hosted web app has no matching public route for that shape, and a sampled
hosted Discover document link returned HTTP 404.

## Goal

Make Discover public document cards route to a readable public document page.

Prefer the smallest repair that matches the existing route model:

1. If Discover/feed payloads already carry the public Space slug, generate the
   canonical public Space document href.
2. If payloads do not reliably carry the slug, add a safe public
   `/documents/:documentId` resolver or redirect that only resolves documents
   that are public and routeable.

## Acceptance Gates

- Discover public document cards no longer lead to hosted 404.
- The canonical route remains owner/privacy safe.
- Private, unlisted, community-only, owner-only, draft, hidden, or otherwise
  non-routeable documents do not resolve through the repair.
- Search, feed, or card href helper tests cover public document href shape.
- Route-level tests cover the safe resolver/redirect if you add one.
- No broad Discover redesign, public-feed rewrite, publishing-state rewrite, or
  forum/comment behavior change.

## Validation

Run focused tests for the changed surface first. Likely candidates:

```text
npm exec --yes pnpm@10.32.1 -- run test:writing
npm exec --yes pnpm@10.32.1 -- run test:document-discussions
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck
npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck
git diff --check
```

Choose the smallest set that actually covers the implementation path.

## Handoff

When complete, wake ARGUS:

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS repaired Discover public document routeability for PR445.
- Public document cards no longer use a dead route or now resolve safely.
Risk:
- Public document routing sits on visibility and publication boundaries.
Task:
- Hostile-review routeability, privacy boundaries, and focused tests.
```
