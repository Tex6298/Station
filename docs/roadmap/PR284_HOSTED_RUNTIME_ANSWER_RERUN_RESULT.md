# PR284 Hosted Runtime Answer Rerun Result

Owner: A4 / ARIADNE
Status: complete
Date: 2026-06-24
Verdict: FAIL

## Summary

PR284 proved that the hosted Railway web and API deployments include the PR283
answer-focus guard. Replay-owner auth/session, intended private persona
selection, selected context, trace/readiness readback, rejected-control
exclusion, and source-copy safety all passed.

The hosted answer improved compared with PR282, but it still failed the stated
two-anchor recall bar. The sanitized context inspection contained both accepted
anchor concepts and both matching invented retrieval phrases. The single hosted
chat answer recalled both invented phrases, but recalled neither accepted anchor
concept.

## Hosted Freshness

Pass.

- Web `/health` and `/health/deployment`: ready on `main`.
- API `/health` and `/health/deployment`: ready on `main`.
- Both hosted services reported commit prefix `8783a02bcdcb`, which includes
  PR283 implementation commit `8783a02b`.

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

Fail at full anchor recall.

Sanitized context preview:

- Context timing bucket: `3000-9999ms`.
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
- Accepted invented retrieval phrases recalled: both.
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
context assembly failure from the evidence visible to ARIADNE.

PR283 moved the result in the right direction: the hosted answer now recalls the
two invented phrases. The remaining gap is concept-label preservation in the
answer shape. The model is using selected context enough to name the phrases,
but it is not returning the paired anchor concepts required by the PR284 pass
bar.

## Validation

- `node tmp-pr284-runtime-rerun.mjs`: FAIL evidence from one hosted chat turn.
- `npx --yes --package @playwright/test@1.41.2 playwright test tmp-pr284-session.spec.js --reporter=line --workers=1`:
  pass, one browser test.

## Recommendation

MIMIR should open a narrow DAEDALUS repair lane for private persona answer label
preservation after selected-context focus. The lane should make direct factual
answers preserve the paired anchor concept labels and matching phrases when both
are present in selected context. Retrieval should remain out of scope unless new
evidence shows selected context is absent from provider prompt delivery.
