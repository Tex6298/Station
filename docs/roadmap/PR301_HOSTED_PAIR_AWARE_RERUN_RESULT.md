# PR301 Hosted Pair-Aware Contract Rerun Result

Owner: A4 / ARIADNE
Status: complete
Date: 2026-06-25
Verdict: FAIL

## Summary

PR301 reran the hosted pair-aware selected-context probe after PR300 deployed.
Hosted web and API are fresh at commit prefix `ea9b0e901071`, which includes the
accepted PR300 runtime/review commit `ea9b0e90`.

Replay-owner auth/session, protected Studio browser session, intended private
platform persona selection, selected context, rejected-control exclusion, and
source-copy safety all passed. The runtime answer still failed the exact
selected-pair recall bar: it recalled both invented phrases but neither
accepted concept label.

PR300 did improve the contract behavior. The first answer was classified as
`missed_selected_labels`, the retry gate fired, and the final contract still
reported `missed_selected_labels`. This is no longer the PR299-style silent
`fulfilled` mismatch. The remaining failure is post-retry answer construction,
provider/model behavior, or a product decision about whether exact labels remain
the acceptance bar.

## Hosted Freshness

Pass.

- Web `/health` and `/health/deployment`: ready on `main`.
- API `/health` and `/health/deployment`: ready on `main`.
- Both hosted services reported commit prefix `ea9b0e901071`, which includes
  required commit `ea9b0e90`.

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
- Owned persona count: `3`.
- Intended match count: `1`.

## Context And Recall

Fail at exact concept-label recall.

Sanitized context preview:

- Context timing bucket: `3000-9999ms`.
- Context counts: canon `3`, memory `3`, integrity `1`, archive `4`,
  continuity `4`.
- Accepted concept labels present: both.
- Accepted invented retrieval phrases present: both.
- Rejected-control anchor present: no.

Single hosted chat request:

- Chat status: HTTP `200`.
- Chat timing bucket: `10000ms+`.
- Answer length bucket: `1-280`.
- Accepted concept labels recalled: none.
- Accepted invented retrieval phrases recalled: both.
- Rejected-control anchor present: no.
- Raw source-body marker copied: no.
- Short-answer constraint: pass.

## Answer Contract And Retry

Fail after the pair-aware retry fired.

- Sanitized trace detail was available.
- `Selected-context answer contract retry` event was present and completed.
- `Selected-context answer contract` event was present and completed.
- Final `Persona chat response` event was present and completed.
- `directFactual`: true.
- `applicable`: true.
- Selected counts: item `8`, label `8`, fact `8`.
- First matched counts: item `0`, label `0`, fact `2`.
- First reason code: `missed_selected_labels`.
- First retry recommended: true.
- Final matched counts: item `1`, label `1`, fact `2`.
- Final reason code: `missed_selected_labels`.
- Final retry recommended: true.
- Retry attempted: true.
- Retry failed: false.
- Max attempts: `1`.

The hosted contract now detects the label miss and retries. The retried answer
still does not visibly return the two accepted concept labels required by the
external PR301 acceptance bar.

## Observability

Pass.

- Recent trace readback was available in the `1-9` bucket.
- Latest conversation trace completed.
- Latest conversation trace context counts matched the context-preview shape:
  canon `3`, memory `3`, integrity `1`, archive `4`, continuity `4`.
- Trace detail returned sanitized runtime budget, answer-contract retry,
  answer-contract, and persona chat response events.
- Replay-readiness returned status `prep_only` with capture-surface bucket
  `1-9`.

## Classification

This is not a deploy freshness failure, auth/session failure, intended-persona
failure, context assembly failure, rejected-control failure, or source-copy
safety failure.

The pair-aware contract gate now fires, so the remaining failure is post-retry:
the model/provider still answers with the two phrases but not the two exact
labels. If exact selected-pair recall remains required, the next implementation
lane should strengthen answer construction or retry prompting rather than
context selection.

## Validation

- `node tmp-pr301-runtime-rerun.mjs`: FAIL evidence from one hosted chat
  request; the server-side contract retry fired once.
- `npx --yes --package @playwright/test@1.41.2 playwright test tmp-pr301-session.spec.js --reporter=line --workers=1`:
  pass, one browser test.

## Recommendation

MIMIR should decide whether to keep exact accepted concept-label recall as the
hosted acceptance bar. If yes, open a narrow DAEDALUS lane for stronger
post-retry answer construction or retry prompting. If exact labels are no
longer required, revise the acceptance bar explicitly before closing the hosted
recall lane.
