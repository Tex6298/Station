# PR305 Hosted Finalizer Rerun After Readiness Repair Result

Owner: A4 / ARIADNE
Status: complete
Date: 2026-06-25
Verdict: PASS WITH CAVEATS

## Summary

PR305 resumed the hosted selected-pair finalizer proof after PR304 repaired API
deployment readiness. Hosted web and API are fresh at commit prefix
`73cf8e9c7f80`, API deployment readiness is `ready:true`, and API migration
readiness is green with the expected sanitized proof ids.

Replay-owner auth/session, protected Studio browser session, intended private
platform persona selection, selected context, rejected-control exclusion,
source-copy safety, and the exact owner-visible selected-pair recall bar all
passed. The final answer visibly recalled both accepted concept labels, both
matching invented phrases, and each phrase was paired with its own accepted
label/name/title.

Caveat: sanitized trace readback confirms the finalizer applied, but the final
answer-contract metadata still reports `missed_selected_labels` and
`retryRecommended:true`. The visible product bar is closed; MIMIR may want a
separate narrow follow-up only if the internal post-finalizer contract reason
must also resolve to `fulfilled`.

## Hosted Freshness And Readiness

Pass.

- Web `/health`: HTTP `200`, healthy.
- Web `/health/deployment`: HTTP `200`, `ready:true`, branch `main`.
- Web commit prefix: `73cf8e9c7f80`.
- Web includes required PR304 runtime commit `73cf8e9c`: yes.
- API `/health`: HTTP `200`, healthy.
- API `/health/deployment`: HTTP `200`, `ready:true`, branch `main`.
- API commit prefix: `73cf8e9c7f80`.
- API includes required PR304 runtime commit `73cf8e9c`: yes.
- API `readiness.migrations.ok`: true.
- Sanitized migration proof ids present: `memory_columns`,
  `developer_space_policy`, `documents_version`, `document_versions`,
  `memory_rpc`, `archive_rpc`.

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

Pass.

Sanitized context preview:

- Context timing bucket: `3000-9999ms`.
- Context counts: canon `3`, memory `3`, integrity `1`, archive `4`,
  continuity `4`.
- Accepted concept labels present: both.
- Accepted invented retrieval phrases present: both.
- Rejected-control anchor present: no.

Single hosted private chat request:

- Chat status: HTTP `200`.
- Chat timing bucket: `10000ms+`.
- Answer length bucket: `281-600`.
- Accepted concept labels recalled: both.
- Accepted invented retrieval phrases recalled: both.
- Selected pairing result: both accepted label/phrase pairs appeared on their
  own paired lines.
- Rejected-control anchor present: no.
- Raw source-body marker copied: no.
- Short-answer constraint: pass.

## Answer Contract, Retry, And Finalizer

Pass with caveat.

- Sanitized trace detail was available.
- `Selected-context answer contract retry` event was present and completed.
- `Selected-context answer contract` event was present and completed.
- Final `Persona chat response` event was present and completed.
- `directFactual`: true.
- `applicable`: true.
- Selected counts: item `8`, label `8`, fact `8`.
- First matched counts: item `1`, label `1`, fact `2`.
- First reason code: `missed_selected_labels`.
- First retry recommended: true.
- Final matched counts: item `2`, label `2`, fact `5`.
- Final reason code: `missed_selected_labels`.
- Final retry recommended: true.
- Retry attempted: true.
- Retry failed: false.
- Max attempts: `1`.
- Finalizer applied: true.
- Finalizer selected-pair count: `2`.
- Finalizer pre-finalizer reason code: `missed_selected_labels`.

The finalizer metadata is sanitized and does not expose raw selected strings,
prompts, completions, provider payloads, private source bodies, raw ids,
cookies, tokens, credentials, SQL, or logs. The residual caveat is semantic:
the owner-visible final answer passes the exact PR305 acceptance bar, while the
sanitized contract reason still reads `missed_selected_labels`.

## Observability

Pass.

- Recent trace readback was available in the `1-9` bucket.
- Latest conversation trace completed.
- Latest conversation trace context counts matched the context-preview shape:
  canon `3`, memory `3`, integrity `1`, archive `4`, continuity `4`.
- Trace detail returned sanitized runtime budget, answer-contract retry,
  answer-contract, finalizer, and persona chat response metadata.
- Replay-readiness returned status `prep_only` with capture-surface bucket
  `1-9`.

## Classification

The hosted selected-pair recall bar passed after the PR302 finalizer and PR304
readiness repair.

This is not a deploy freshness failure, auth/session failure, intended-persona
failure, context assembly failure, rejected-control failure, source-copy safety
failure, retry-gate failure, finalizer-routing failure, or finalizer
construction failure for the visible product answer.

## Validation

- `node tmp-pr305-runtime-rerun.mjs`: PASS evidence from one hosted chat
  request; server-side retry and finalizer both fired.
- `npx --yes --package @playwright/test@1.41.2 playwright test tmp-pr305-session.spec.js --reporter=line --workers=1`:
  pass, one browser test.

## Recommendation

MIMIR should close the hosted selected-pair recall bar for the owner-visible
product proof. If internal trace semantics matter for future gates, open a
narrow DAEDALUS follow-up to make post-finalizer contract readback distinguish
the pre-finalizer reason from the owner-visible final answer status.
