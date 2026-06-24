# PR292 Hosted Runtime Answer Rerun Result

Owner: A4 / ARIADNE
Status: complete
Date: 2026-06-25
Verdict: FAIL

## Summary

PR292 proved that the hosted Railway web and API deployments include the
accepted PR291 runtime/review commit. Replay-owner auth/session, intended
private persona selection, selected context, trace/readiness readback,
rejected-control exclusion, and source-copy safety all passed.

The bounded hosted chat answer still failed the recall bar. The sanitized
context inspection contained both accepted concept labels and both matching
invented retrieval phrases. The single hosted chat request returned a short
answer and did not copy raw source-body markers, but recalled neither accepted
concept label and neither invented phrase.

## Hosted Freshness

Pass.

- Web `/health` and `/health/deployment`: ready on `main`.
- API `/health` and `/health/deployment`: ready on `main`.
- Both hosted services reported commit prefix `9531d22b766f`, which includes
  accepted PR291 runtime/review commit `9531d22b`.

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

Single hosted chat request:

- Chat status: HTTP `200`.
- Chat timing bucket: `3000-9999ms`.
- Answer length bucket: `1-280`.
- Accepted concept labels recalled: none.
- Accepted invented retrieval phrases recalled: none.
- Rejected-control anchor present: no.
- Raw source-body marker copied: no.
- Short-answer constraint: pass.

## Answer Contract And Retry

Fail for observable retry behavior.

- Sanitized trace detail was available.
- `Selected-context answer contract` event was present and completed.
- `Selected-context answer contract retry` event was absent.
- Retry attempted: no, based on sanitized event labels.
- Retry failed: no, based on the completed contract event status.
- Final `Persona chat response` event was present and completed.
- Contract reason codes were not exposed by the sanitized observability detail.

Because the answer missed both accepted labels and both accepted phrases while
no retry event was observed, PR292 does not prove the answer-contract retry
clears the hosted recall failure.

## Observability

Pass with caveat.

- Recent trace readback was available in the `1-9` bucket.
- Latest conversation trace completed.
- Latest conversation trace context counts matched the context-preview shape:
  canon `3`, memory `3`, integrity `1`, archive `4`, continuity `4`.
- Trace detail returned three sanitized events: runtime budget, answer contract,
  and persona chat response.
- Replay-readiness returned measurement and capture-surface buckets in `1-9`.
- Summary trace and token buckets were available; reason codes were not exposed
  in sanitized trace detail.

## Classification

This is not a deploy freshness failure, not an auth/session failure, and not a
context assembly failure from the evidence visible to ARIADNE.

This is also not yet cleanly classifiable as a provider/model behavior issue,
because the observable retry did not fire. The safe trace detail proves the
contract event ran, but not why it did not recommend retry when the external
PR292 acceptance check saw zero accepted labels and zero accepted phrases.

## Validation

- `node tmp-pr292-runtime-rerun.mjs`: FAIL evidence from one hosted chat
  request.
- `node tmp-pr292-trace-labels.mjs`: sanitized trace labels/status check.
- `npx --yes --package @playwright/test@1.41.2 playwright test tmp-pr292-session.spec.js --reporter=line --workers=1`:
  pass, one browser test.

## Recommendation

MIMIR should open a narrow DAEDALUS diagnostic/repair lane for the selected
context answer-contract gate. The next lane should expose safe reason-code and
retry-decision summaries, then align the retry trigger with the hosted
acceptance condition that misses both accepted labels and both accepted phrases.
Do not classify this as a provider/model issue until the retry decision is
observable and consistent with the acceptance fixture.
