# PR296 Hosted Label Retry Rerun Result

Owner: A4 / ARIADNE
Status: complete
Date: 2026-06-25
Verdict: FAIL

## Summary

PR296 proved that the hosted Railway web and API deployments include the
accepted PR295 runtime/review commit. Replay-owner auth/session, intended
private persona selection, selected context, sanitized answer-contract readback,
retry execution, trace/readiness readback, rejected-control exclusion, and
source-copy safety all passed.

The bounded hosted chat answer still failed the exact recall bar. The sanitized
context inspection contained both accepted concept labels and both matching
invented retrieval phrases. The hosted request triggered the one-shot retry
after `missed_selected_labels`, and the final contract readback reported
`fulfilled`. The final answer, however, did not recall either exact accepted
concept label or either exact invented phrase under the PR296 acceptance check.

## Hosted Freshness

Pass.

- Web `/health` and `/health/deployment`: ready on `main`.
- API `/health` and `/health/deployment`: ready on `main`.
- Both hosted services reported commit prefix `f81cd7a20165`, which includes
  accepted PR295 runtime/review commit `f81cd7a2`.

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

Fail at exact answer recall.

Sanitized context preview:

- Context timing bucket: `1500-2999ms`.
- Context counts: canon `3`, memory `3`, integrity `1`, archive `4`,
  continuity `4`.
- Accepted concept labels present: both.
- Accepted invented retrieval phrases present: both.
- Rejected-control anchor present: no.

Single hosted chat request:

- Chat status: HTTP `200`.
- Chat timing bucket: `>=10000ms`.
- Answer length bucket: `1-280`.
- Accepted concept labels recalled: none.
- Accepted invented retrieval phrases recalled: none.
- Rejected-control anchor present: no.
- Raw source-body marker copied: no.
- Short-answer constraint: pass.

## Answer Contract And Retry

Pass for gate/retry execution; fail against external exact recall.

- Sanitized trace detail was available.
- `Selected-context answer contract` event was present and completed.
- `Selected-context answer contract retry` event was present.
- Final `Persona chat response` event was present and completed.
- `directFactual`: true.
- `applicable`: true.
- Selected counts: item `8`, label `8`, fact `8`.
- Final matched counts: item `2`, label `3`, fact `2`.
- First reason code: `missed_selected_labels`.
- Final reason code: `fulfilled`.
- Retry recommended after final answer: false.
- Retry attempted: true.
- Retry failed: false.
- Max attempts: `1`.

The PR295 gate repair worked in the narrow sense MIMIR asked PR296 to prove:
the label-miss condition triggered the one-shot retry. The remaining failure is
that the contract's term-level `fulfilled` result is weaker than PR296's exact
label-and-phrase acceptance bar.

## Observability

Pass.

- Recent trace readback was available in the `1-9` bucket.
- Latest conversation trace completed.
- Latest conversation trace context counts matched the context-preview shape:
  canon `3`, memory `3`, integrity `1`, archive `4`, continuity `4`.
- Trace detail returned sanitized runtime budget, answer-contract retry,
  answer-contract, and persona chat response events.
- Replay-readiness returned measurement and capture-surface buckets in `1-9`.
- Summary trace and token buckets were available.

## Classification

This is not a deploy freshness failure, auth/session failure, context assembly
failure, or retry-gate failure.

The failure is after retry. The route now retries safely, but the retry output
still does not satisfy exact external recall for the two labels and two phrases.
That leaves a product decision: either the acceptance bar should accept
term-level contract fulfillment, or DAEDALUS needs a stronger answer-construction
lane that preserves exact selected label/name plus supporting fact pairs.

## Validation

- `node tmp-pr296-runtime-rerun.mjs`: FAIL evidence from one hosted chat
  request with server-side retry observed.
- `npx --yes --package @playwright/test@1.41.2 playwright test tmp-pr296-session.spec.js --reporter=line --workers=1`:
  pass, one browser test.

## Recommendation

MIMIR should classify this as a post-retry answer-construction versus acceptance
bar decision, not a context or gate defect. If exact labels and exact invented
phrases remain required, open a narrow DAEDALUS lane to force selected
label/name plus supporting fact pair output after retry. If term-level
fulfillment is sufficient for product purposes, revise the hosted recall bar
before closing it.
