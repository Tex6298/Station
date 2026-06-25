# PR299 Hosted Selected Pair Rerun Result

Owner: A4 / ARIADNE
Status: complete
Date: 2026-06-25
Verdict: FAIL

## Summary

PR299 reran the hosted selected-pair probe with MIMIR's corrected freshness
gate. Hosted web and API are running PR297 product runtime commit `b2cb3540`,
which is sufficient for this runtime proof.

Replay-owner auth/session, intended private persona selection, selected context,
trace/readiness readback, rejected-control exclusion, and source-copy safety all
passed. The hosted answer still failed the exact selected-pair acceptance bar:
it recalled both invented phrases but neither accepted concept label.

## Hosted Freshness

Pass.

- Web `/health` and `/health/deployment`: ready on `main`.
- API `/health` and `/health/deployment`: ready on `main`.
- Both hosted services reported commit prefix `b2cb354072b6`, which includes
  PR297 runtime implementation commit `b2cb3540`.

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

Fail at exact concept-label recall.

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

Fail against exact target-label acceptance.

- Sanitized trace detail was available.
- `Selected-context answer contract` event was present and completed.
- `Selected-context answer contract retry` event was absent.
- Final `Persona chat response` event was present and completed.
- `directFactual`: true.
- `applicable`: true.
- Selected counts: item `8`, label `8`, fact `8`.
- Matched counts: item `1`, label `1`, fact `2`.
- First reason code: `fulfilled`.
- Final reason code: `fulfilled`.
- Retry recommended: false.
- Retry attempted: false.
- Retry failed: false.
- Max attempts: `1`.

The contract readback says `fulfilled`, but the external PR299 acceptance check
still sees neither accepted concept label. This indicates the contract can
fulfill on a selected item that is not the requested two-anchor pair, while the
product evidence bar requires the specific accepted labels and phrases.

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

This is not a deploy freshness failure, auth/session failure, context assembly
failure, or source-copy safety failure.

The failure is a contract-targeting/acceptance mismatch after corrected
freshness. The answer recalls both phrases, but not the accepted labels. The
contract reports `fulfilled` without retry because it matched some selected
terms, not because the requested accepted labels were visibly returned.

## Validation

- `node tmp-pr299-runtime-rerun.mjs`: FAIL evidence from one hosted chat
  request.
- `npx --yes --package @playwright/test@1.41.2 playwright test tmp-pr299-session.spec.js --reporter=line --workers=1`:
  pass, one browser test.

## Recommendation

MIMIR should decide whether the hosted recall bar requires exact requested
selected pairs or accepts broader term-level fulfillment. If exact pairs remain
required, open a narrow DAEDALUS lane so the answer contract targets the
requested pair set instead of fulfilling on any selected context item. If
broader term-level fulfillment is acceptable, revise the acceptance bar before
closing the hosted recall lane.
