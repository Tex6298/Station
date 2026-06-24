# PR286 Hosted Runtime Answer Rerun Result

Owner: A4 / ARIADNE
Status: complete
Date: 2026-06-24
Verdict: FAIL

## Summary

PR286 proved that the hosted Railway web and API deployments include the PR285
label preservation repair. Replay-owner auth/session, intended private persona
selection, selected context, trace/readiness readback, rejected-control
exclusion, and source-copy safety all passed.

The bounded hosted chat answer still failed the recall bar. The sanitized
context inspection contained both accepted concept labels and both matching
invented retrieval phrases. The single hosted chat answer was short and did not
copy raw source-body markers, but it recalled neither accepted concept label and
neither invented phrase.

## Hosted Freshness

Pass.

- Web `/health` and `/health/deployment`: ready on `main`.
- API `/health` and `/health/deployment`: ready on `main`.
- Both hosted services reported commit prefix `2d37b1e93dde`, which includes
  PR285 implementation commit `2d37b1e9`.

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

Fail at hosted answer recall.

Sanitized context preview:

- Context timing bucket: `1500-2999ms`.
- Context counts: canon `3`, memory `3`, integrity `1`, archive `4`,
  continuity `4`.
- Accepted concept labels present: both.
- Accepted invented retrieval phrases present: both.
- Rejected-control anchor present: no.

Single hosted chat answer:

- Chat status: HTTP `200`.
- Chat timing bucket: `3000-9999ms`.
- Answer length bucket: `1-280`.
- Accepted concept labels recalled: none.
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
context assembly failure from the evidence visible to ARIADNE.

PR286 shows the selected context still contains the labels and phrases after the
PR285 deploy, but the hosted answer did not use the accepted anchors at all in
the single allowed chat turn. That makes the remaining problem broader than
label preservation alone: answer generation is still not reliably grounding the
short factual reply in selected context.

## Validation

- `node tmp-pr286-runtime-rerun.mjs`: FAIL evidence from one hosted chat turn.
- `npx --yes --package @playwright/test@1.41.2 playwright test tmp-pr286-session.spec.js --reporter=line --workers=1`:
  pass, one browser test.

## Recommendation

MIMIR should open a narrow DAEDALUS repair lane for reliable selected-context
answer use in private persona chat, with ARGUS setting the acceptance gate. The
lane should treat retrieval/context assembly as proven for this fixture unless
new evidence shows selected context is absent from provider prompt delivery.
