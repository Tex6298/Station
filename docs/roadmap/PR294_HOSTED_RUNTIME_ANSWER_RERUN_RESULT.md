# PR294 Hosted Runtime Answer Rerun Result

Owner: A4 / ARIADNE
Status: complete
Date: 2026-06-25
Verdict: FAIL

## Summary

PR294 proved that the hosted Railway web and API deployments include the
accepted PR293 runtime/review commit. Replay-owner auth/session, intended
private persona selection, selected context, sanitized answer-contract readback,
trace/readiness readback, rejected-control exclusion, and source-copy safety all
passed.

The bounded hosted chat answer still failed the full recall bar. The sanitized
context inspection contained both accepted concept labels and both matching
invented retrieval phrases. The single hosted chat request returned a short
answer and did not copy raw source-body markers. It recalled both invented
phrases but recalled neither accepted concept label.

## Hosted Freshness

Pass.

- Web `/health` and `/health/deployment`: ready on `main`.
- API `/health` and `/health/deployment`: ready on `main`.
- Both hosted services reported commit prefix `37dd783920e5`, which includes
  accepted PR293 runtime/review commit `37dd7839`.

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

Fail at concept-label recall.

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
- Accepted invented retrieval phrases recalled: both.
- Rejected-control anchor present: no.
- Raw source-body marker copied: no.
- Short-answer constraint: pass.

## Answer Contract And Retry

Fail for gate behavior, with useful sanitized readback.

- Sanitized trace detail was available.
- `Selected-context answer contract` event was present and completed.
- Final `Persona chat response` event was present and completed.
- `Selected-context answer contract retry` event was absent.
- `directFactual`: true.
- `applicable`: true.
- Selected counts: item `8`, label `8`, fact `8`.
- Matched counts: item `0`, label `0`, fact `2`.
- Final reason code: `missed_selected_labels`.
- First reason code: `missed_selected_labels`.
- Retry recommended: false.
- Retry attempted: false.
- Retry failed: false.
- Max attempts: `1`.

The gate now proves the route sees this as a direct factual private-persona
answer with selected focus. It also proves the remaining miss is label-specific:
facts/phrases were matched, labels were not. Because retry is not recommended
for `missed_selected_labels`, PR294 does not clear the hosted recall bar.

## Observability

Pass.

- Recent trace readback was available in the `1-9` bucket.
- Latest conversation trace completed.
- Latest conversation trace context counts matched the context-preview shape:
  canon `3`, memory `3`, integrity `1`, archive `4`, continuity `4`.
- Trace detail returned sanitized runtime budget, answer-contract, and persona
  chat response events.
- Replay-readiness returned measurement and capture-surface buckets in `1-9`.
- Summary trace and token buckets were available.

## Classification

This is not a deploy freshness failure, not an auth/session failure, not a
context assembly failure, and no longer a readback visibility failure.

This is a gate behavior failure relative to PR294's acceptance bar. The answer
misses labels while matching facts/phrases; the contract correctly reports
`missed_selected_labels`, but does not recommend or attempt retry for that
reason. Under MIMIR's decision rule, this should go back to DAEDALUS as a narrow
gate/readback repair rather than being classified as provider/model behavior.

## Validation

- `node tmp-pr294-runtime-rerun.mjs`: FAIL evidence from one hosted chat
  request.
- `npx --yes --package @playwright/test@1.41.2 playwright test tmp-pr294-session.spec.js --reporter=line --workers=1`:
  pass, one browser test.

## Recommendation

MIMIR should open a narrow DAEDALUS gate repair so `missed_selected_labels`
either triggers the one-shot retry or is otherwise handled as a failed selected
context answer contract when label recall is part of the acceptance bar. ARGUS
should keep the existing sanitized readback gate and verify that no raw prompts,
private source bodies, provider payloads, ids, cookies, or tokens are exposed.
