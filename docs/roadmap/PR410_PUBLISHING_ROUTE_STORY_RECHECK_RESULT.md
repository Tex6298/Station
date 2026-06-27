# PR410 - Publishing Route-Story Recheck Result

Date: 2026-06-27
Owner: ARIADNE
Verdict: PASS

## Freshness

Hosted web deployment health reported ready at commit prefix `ab272215738b`,
which is after the required PR409 implementation baseline `d2674abd`.

## Route Checked

- `/studio/publishing` as signed-in replay owner on desktop.
- `/studio/publishing` as signed-in replay owner at 390px mobile.

## Evidence

Desktop:

- Route-story section visible near the top of the page.
- Section top: approximately 194px from viewport top.
- Section height: approximately 208px.

390px mobile:

- Route-story section visible near the top of the page.
- Section top: approximately 360px from viewport top.
- Section height: approximately 405px.

## Findings

- The route-story section is always visible without opening a document row.
- Copy covers document readback plus linked discussion under the same
  visibility boundary.
- Copy covers `Retract to private` hiding public document and linked discussion
  reads while preserving owner-visible Studio record/history.
- Copy explains cleanup/delete as separate from retract.
- Cleanup/delete copy says linked discussion threads are tombstoned and
  community records are preserved behind hidden threads.
- Copy does not claim hosted cleanup has already run.
- Copy does not imply community visibility is anonymous-public.
- No new cleanup/delete mutation control was visible.
- Desktop and 390px mobile had no horizontal overflow, clipped content, overlap,
  or broken navigation in the checked section.

## Safety

- No publish, retract, delete, cleanup, import/upload, key generation, Assistant
  send, forum post, Stripe, billing, or settings action was triggered.
- No PR407 hosted cleanup was run.
- This result records only visible labels, route class, viewport evidence, and
  deployment prefix.

## Validation

- Hosted Playwright browser recheck against `/studio/publishing`.
- `git diff --check`

## Next

MIMIR can close PR410.
