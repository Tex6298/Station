# PR278 - Hosted Runtime Answer Rerun Result

Owner: A4 / ARIADNE
Status: fail
Date: 2026-06-24

## Verdict

FAIL.

Hosted freshness, replay-owner auth/session, intended persona selection, chat
route health, source-copy safety, rejected-control exclusion, and observability
passed. The full two-anchor recall bar is still not live after PR277 deployed.

This is still a narrow runtime answer-quality/retrieval-selection failure, not
a deploy, auth, provider-configuration, protected-route, rejected-control, or
observability failure. The hosted generic prompt context remained partial before
the provider answer.

## Hosted Freshness

- Web `/health/deployment`: `ready:true`, branch `main`, service
  `@station/web`, commit prefix `578e3c7e6802`.
- API `/health/deployment`: `ready:true`, branch `main`, service
  `@station/api`, commit prefix `578e3c7e6802`.
- The hosted deployment includes PR277 implementation commit `578e3c7e`.

## Auth And Session

- Replay-owner API sign-in returned HTTP 200.
- API `/auth/me` returned HTTP 200 with tier `canon` and admin `false`.
- Hosted web session reached protected Studio and did not fall back to the sign
  in form.

No credentials, bearer tokens, cookies, owner ids, persona ids, or session
values were printed or committed.

## Intended Persona

- Selected the same intended private platform replay persona used by PR276.
- Owned persona count: 3.
- Matching intended private platform replay persona count: 1.

## Context And Chat

- Context preview for the bounded staging prompt returned HTTP 200 in the
  `1500-2999ms` bucket.
- Sanitized context counts: Canon 3, Memory 3, Integrity 1, Archive 4,
  Continuity 4.
- Retrieval modes reported as Memory `vector` and Archive `vector`.
- Sanitized context inspection found one of two accepted anchor concepts and one
  of two matching invented retrieval phrases.
- Rejected-control signal was absent from sanitized context inspection.
- The single hosted chat turn returned HTTP 200 in the `3000-9999ms` bucket.
- The answer was short (`1-280` chars), did not copy raw source-body markers,
  and did not include the rejected-control anchor.
- The answer recalled one of two accepted anchor concepts and one of two
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

MIMIR should decide whether to open PR279 as another narrow DAEDALUS repair or
revise the seeded recall acceptance bar. If the bar remains full two-anchor
recall, the repair should start from the hosted evidence that generic prompt
context is still partial after PR277: one accepted concept and phrase are
selected, while the second accepted concept and phrase remain absent before the
provider answer. Keep the next lane away from provider swaps, schema changes,
imports, seeds, UI, billing, Redis, Cloudflare, queues, and workers unless
DAEDALUS produces new evidence requiring broader scope.

## Validation

- `node tmp-pr278-runtime-rerun.mjs`
  - Completed the hosted API/runtime probe with sanitized evidence.
  - Exit status reflected the product FAIL above.
- `npx --yes --package @playwright/test@1.41.2 playwright test tmp-pr278-session.spec.js --reporter=line --workers=1`
  - Pass, 1 protected-Studio session check after correcting a local temp-spec
    env-loader typo.
- No product code changed.
