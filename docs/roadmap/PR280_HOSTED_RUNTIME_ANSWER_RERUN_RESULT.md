# PR280 - Hosted Runtime Answer Rerun Result

Owner: A4 / ARIADNE
Status: fail
Date: 2026-06-24

## Verdict

FAIL.

PR279 appears to have closed the hosted context-selection gap: sanitized context
inspection found both accepted anchor concepts and both matching invented
retrieval phrases, with the rejected-control signal absent. The full product bar
still failed because the single hosted chat answer did not recall the accepted
anchor set.

This is no longer the same failure shape as PR276/PR278. Hosted freshness,
replay-owner auth/session, intended persona selection, context selection,
source-copy safety, rejected-control exclusion, and observability passed. The
remaining issue is bounded answer behavior after the full selected context is
available to runtime.

## Hosted Freshness

- Web `/health/deployment`: `ready:true`, branch `main`, service
  `@station/web`, commit prefix `7ab41536f533`.
- API `/health/deployment`: `ready:true`, branch `main`, service
  `@station/api`, commit prefix `7ab41536f533`.
- The hosted deployment includes PR279 implementation commit `7ab41536`.

## Auth And Session

- Replay-owner API sign-in returned HTTP 200.
- API `/auth/me` returned HTTP 200 with tier `canon` and admin `false`.
- Hosted web session reached protected Studio and did not fall back to the sign
  in form.

No credentials, bearer tokens, cookies, owner ids, persona ids, or session
values were printed or committed.

## Intended Persona

- Selected the same intended private platform replay persona used by PR278.
- Owned persona count: 3.
- Matching intended private platform replay persona count: 1.

## Context And Chat

- Context preview for the bounded staging prompt returned HTTP 200 in the
  `1500-2999ms` bucket.
- Sanitized context counts: Canon 3, Memory 3, Integrity 1, Archive 4,
  Continuity 4.
- Retrieval modes reported as Memory `vector` and Archive `vector`.
- Sanitized context inspection found both accepted anchor concepts and both
  matching invented retrieval phrases.
- Rejected-control signal was absent from sanitized context inspection.
- The single hosted chat turn returned HTTP 200 in the `>=10000ms` bucket.
- The answer was short (`1-280` chars), did not copy raw source-body markers,
  and did not include the rejected-control anchor.
- The answer recalled zero of two accepted anchor concepts and zero of two
  matching invented retrieval phrases.

No raw source bodies, compiled prompts, provider payloads, raw completion text,
hosted logs, SQL, raw ids, or database rows were committed.

## Observability

- Recent trace readback returned a completed conversation trace.
- Latest conversation trace context counts matched the hosted runtime context
  shape: Canon 3, Memory 3, Integrity 1, Archive 4, Continuity 4.
- Replay readiness returned prep/readiness data with measurement and capture
  surfaces present.

Only sanitized buckets/counts/statuses were recorded.

## Recommendation

MIMIR can treat PR279's context assembly repair as hosted-evidence positive, but
should not close the full recall bar yet. If the bar remains full two-anchor
recall, open the next repair lane around bounded answer behavior after selected
context is available: prompt assembly wording, instruction priority, answer
format constraints, or model-response handling. Do not reopen retrieval
selection unless DAEDALUS finds evidence that the full selected context did not
actually reach the provider prompt.

Keep provider swaps, schema changes, imports, seeds, UI, billing, Redis,
Cloudflare, queues, and workers out of scope unless new evidence requires them.

## Validation

- `node tmp-pr280-runtime-rerun.mjs`
  - Completed the hosted API/runtime probe with sanitized evidence.
  - Exit status reflected the product FAIL above.
- `npx --yes --package @playwright/test@1.41.2 playwright test tmp-pr280-session.spec.js --reporter=line --workers=1`
  - Pass, 1 protected-Studio session check.
- No product code changed.
