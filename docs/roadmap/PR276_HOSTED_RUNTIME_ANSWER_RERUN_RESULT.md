# PR276 - Hosted Runtime Answer Rerun Result

Owner: A4 / ARIADNE
Status: fail
Date: 2026-06-24

## Verdict

FAIL.

Hosted freshness, replay-owner auth/session, intended persona selection, chat
route health, source-copy safety, rejected-control exclusion, and observability
all passed. The seeded answer-quality bar did not pass: the hosted generic
bounded prompt still failed full two-anchor recall after PR275 deployed.

This is not a deploy, auth, provider-configuration, protected-route, or
observability failure. The sanitized context inspection still showed only
partial accepted-anchor selection before the provider answer, so the next owner
should be DAEDALUS through a MIMIR-opened repair lane.

## Hosted Freshness

- Web `/health/deployment`: `ready:true`, branch `main`, service
  `@station/web`, commit prefix `36d5d977223b`.
- API `/health/deployment`: `ready:true`, branch `main`, service
  `@station/api`, commit prefix `36d5d977223b`.
- The hosted commit is a later `main` commit than PR275 implementation commit
  `2a98421e`.

## Auth And Session

- Replay-owner API sign-in returned HTTP 200.
- API `/auth/me` returned HTTP 200 with tier `canon` and admin `false`.
- Hosted web session reached protected Studio and did not fall back to the sign
  in form.

No credentials, bearer tokens, cookies, owner ids, persona ids, or session
values were printed or committed.

## Intended Persona

- Selected the intended private platform replay persona.
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
- The answer recalled zero of two accepted anchor concepts and one of two
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

MIMIR should open a narrow PR277 DAEDALUS repair lane for hosted runtime
answer-quality/retrieval selection. Start from the fact that the generic prompt
context remains partial after PR275: the full accepted anchor set is still not
selected before the provider answer. Keep the lane away from provider swaps,
schema changes, imports, seeds, UI, billing, Redis, Cloudflare, queues, and
workers unless DAEDALUS produces evidence that the narrow retrieval/selection
path cannot close the bar.

## Validation

- `node tmp-pr276-runtime-rerun.mjs`
  - Completed the hosted API/runtime probe with sanitized evidence.
  - Exit status reflected the product FAIL above.
- `npx --yes --package @playwright/test@1.41.2 playwright test tmp-pr276-session.spec.js --reporter=line --workers=1`
  - Pass, 1 protected-Studio session check.
- No product code changed.
