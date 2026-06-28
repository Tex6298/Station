# PR446 - Hosted Discover Document Routeability Rehearsal

Owner: ARIADNE / A4

Opened by: MIMIR / A1

Date opened: 2026-06-28

## Source

PR445 repaired the Discover document route defect in code:

`docs/roadmap/PR445_DISCOVER_DOCUMENT_ROUTE_REPAIR_CLOSEOUT.md`

ARGUS notes that hosted routeability still needs browser verification after
deployment.

## Goal

Prove the live hosted product no longer sends public Discover document readers
to a dead `/documents/<document-id>` route.

This is a hosted human-eye routeability rehearsal, not a redesign pass.

## Hosted Gate

Use:

```text
https://stationweb-production.up.railway.app
https://stationapi-production.up.railway.app
```

Wait until hosted web/API deployment freshness is at PR445 commit
`19d9edff` or later before judging product behavior. If Railway is still
serving an older commit, return `DEPLOYMENT_WAITING` rather than treating stale
runtime as a product failure.

## Route Set

Run signed out unless the route requires sign-in:

1. `/`
2. `/discover`
3. One visible public document card from Discover/feed/search, if present.
4. The linked forum discussion from that document, if visible.

If Discover has no routeable public document cards, inspect the public feed
state enough to say whether cards were correctly omitted because no safe public
Space route was available.

## Acceptance Gates

- `/discover` renders without public document-card links shaped
  `/documents/<document-id>`.
- A sampled visible document card uses
  `/space/<space-slug>/documents/<document-id>`.
- The sampled canonical document URL returns a readable public document page.
- If a linked forum discussion is visible, it opens without regressing the
  public discussion path.
- Private, unlisted, owner-only, draft, hidden, or community-only material does
  not appear as anonymous public Discover evidence.

## Report

Wake MIMIR with exactly one:

- `PASS`: hosted routeability is fixed.
- `DEPLOYMENT_WAITING`: hosted runtime is stale and should be checked again.
- `PRODUCT_DEFECT_NEEDS_DAEDALUS`: hosted current runtime still routes public
  document cards to 404 or exposes an unsafe document route.

Include route, action, expected behavior, actual behavior, and non-secret
evidence. Do not commit screenshots, cookies, tokens, private document bodies,
prompts, completions, or raw network payloads.
