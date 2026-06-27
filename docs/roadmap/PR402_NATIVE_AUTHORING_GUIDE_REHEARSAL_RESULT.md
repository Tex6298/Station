# PR402 - Native Authoring Guide Human Rehearsal Result

Date: 2026-06-27
Owner: ARIADNE
Verdict: PASS

## Scope

Rehearsed the existing owner-visible Studio authoring and publishing surfaces
after PR401.

No hosted data mutation was attempted. The rehearsal did not save, send for
review, publish, retract, delete, schedule, dispatch to social, use Station
Press, change billing/auth/provider/model/deployment behavior, or touch schema,
migrations, Redis, Cloudflare, workers, or queues.

Only local form state was changed in the browser to verify readiness copy.

## Freshness

Required hosted web build:

```text
1c0f7015
```

Observed:

- Web: ready at `1c0f7015`

The freshness gate passed.

## Routes Checked

PASS:

- `/studio/publish`
- `/studio/publish?documentId=<existing owner document>`
- `/studio/publishing`

The existing document route was checked without recording or exposing the raw
document identifier.

## Authoring Guide

PASS:

- `Authoring Guide` is visible on `/studio/publish`.
- The copy reads as Station-specific owner guidance, not generic SaaS copy.
- Private default state is honest:
  - `Private draft`
  - `Draft-only`
  - no `Queue-ready` claim.
- Non-private visibility without a Space stays blocked as `Needs Space`.
- Station destination off stays blocked as `Needs Station`.
- Queue-ready copy appears only after the local form has a Station destination,
  Space, non-private visibility, title, and slug.
- Queue-ready copy accurately names grounding check and human review.
- Version copy explains owner-only version history.
- Linked discussion copy is scoped to published public/community/unlisted
  documents with comments enabled.
- Retraction copy says hide, not delete.
- Plain textarea boundaries remain honest: formatting, connector, and scheduling
  surfaces are visibly deferred and do not imply a live rich editor, social
  dispatch, or scheduled publishing.

## Publishing Dashboard

PASS:

- `/studio/publishing` loads as the owner dashboard.
- Draft, Published, and Archived tabs are understandable.
- Owner action states remain legible: edit, review/approval, public view, view
  unavailable, and retract-to-private states are clear where applicable.
- No narrow UI patch is needed from DAEDALUS for this lane.

## Mobile

PASS:

- `/studio/publish` at 390px viewport had no horizontal overflow.
- `/studio/publishing` at 390px viewport had no horizontal overflow.
- Critical controls remained in-flow and reachable on mobile.

## Safety

PASS:

- No raw IDs, secrets, private source body, private versions, owner-only archive
  material, SQL, stack traces, or provider payloads were visible in the checked
  owner-facing copy.
- No public-facing copy exposed owner-only material.

## Residual Risk

No PR402 UX-blocking residual risk remains from ARIADNE's hosted rehearsal.

Future polish can improve authoring depth, but this PR401 guide slice is
accurate, readable, and safe to accept as protected-alpha owner guidance.
