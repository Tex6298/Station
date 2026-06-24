# PR282 Hosted Runtime Answer Rerun Result

Owner: A4 / ARIADNE
Status: complete
Date: 2026-06-24
Verdict: FAIL

## Summary

PR282 proved that the hosted Railway web and API deployments include the PR281
implementation commit, and that replay-owner auth/session, intended private
persona selection, context assembly, observability, and source-copy safety are
still intact.

The bounded hosted chat answer still failed the two-anchor recall bar. The
sanitized context inspection contained both accepted anchor concepts and both
matching invented retrieval phrases, with the rejected control absent. The
single hosted chat answer was short and did not copy raw source-body markers,
but it recalled none of the accepted concepts or phrases.

## Hosted Freshness

Pass.

- Web `/health` and `/health/deployment`: ready on `main`.
- API `/health` and `/health/deployment`: ready on `main`.
- Both hosted services reported commit prefix `4c96bbd4765d`, which includes
  PR281 implementation commit `4c96bbd4`.

## Replay Owner Auth And Session

Pass.

- Hosted API sign-in returned HTTP `200`.
- Hosted API `/auth/me` returned HTTP `200`.
- Browser login through `/login?redirect=/studio` reached protected `/studio`.
- Same-browser `/studio` reload preserved the protected Studio session.

## Intended Persona

Pass.

- The rerun selected exactly one private platform persona matching the intended
  Station Replay Persona.
- The owned persona count was stable and the intended match was unambiguous.

## Context And Recall

Fail at answer recall.

Sanitized context preview:

- Context timing bucket: `1500-2999ms`.
- Context counts: canon `3`, memory `3`, integrity `1`, archive `4`,
  continuity `4`.
- Accepted anchor concepts present: both.
- Accepted invented retrieval phrases present: both.
- Rejected-control anchor present: no.

Single hosted chat answer:

- Chat status: HTTP `200`.
- Chat timing bucket: `3000-9999ms`.
- Answer length bucket: `1-280`.
- Accepted anchor concepts recalled: none.
- Accepted invented retrieval phrases recalled: none.
- Rejected-control anchor present: no.
- Raw source-body marker copied: no.
- Short-answer constraint: pass.

## Observability

Pass with narrow caveat.

- Recent trace readback was available in the `1-9` bucket.
- Latest conversation trace completed.
- Latest conversation trace context counts matched the context-preview shape:
  canon `3`, memory `3`, integrity `1`, archive `4`, continuity `4`.
- Replay-readiness returned measurement and capture-surface buckets in `1-9`.
- The summary endpoint was safe to read, but trace totals were reported as
  `unknown` by the local sanitizer shape; this did not block the recall verdict.

## Classification

This is not a deploy freshness failure, not an auth/session failure, and not a
context assembly failure from the evidence visible to ARIADNE. The most likely
remaining failure is the private persona answer-grounding path after selected
context is assembled: the selected context appears available, but the answer did
not use the required short factual anchors.

## Validation

- `node tmp-pr282-runtime-rerun.mjs`: FAIL evidence from one hosted chat turn.
- `npx --yes --package @playwright/test@1.41.2 playwright test tmp-pr282-session.spec.js --reporter=line --workers=1`:
  pass, one browser test.

## Recommendation

MIMIR should open a narrow DAEDALUS repair lane for hosted private persona answer
grounding after context selection. Retrieval should not be reopened first unless
new evidence shows selected context is absent from the provider prompt or is
being stripped before answer generation.
