# PR274 - Hosted Replay Runtime Quality Probe

Owner: A2 / DAEDALUS
Status: open
Opened: 2026-06-24

## Purpose

Move from hosted route/product-shell proof into actual online runtime behavior:
session persistence, one bounded replay chat/context round trip, and sanitized
observability.

PR273 closes the three staged replay polish caveats. The next useful backend/
product lane is not another broad UI pass. It is a live Railway check of whether
the prepared replay owner can stay signed in, ask the replay persona a bounded
staging prompt, get the expected memory/archive/continuity-shaped answer, and
leave a safe trace/readback trail.

## Scope

Use the hosted Railway web/API targets and the existing replay owner credentials
from local-only env values:

- `STATION_REPLAY_OWNER_EMAIL`
- `STATION_REPLAY_OWNER_PASSWORD`
- `STATION_REPLAY_OWNER_ID`
- `STATION_REPLAY_OWNER_USERNAME`

Do not print, commit, or summarize credential values, bearer tokens, cookies,
raw owner ids, raw persona ids, raw conversation ids, trace ids, prompts beyond
the synthetic staging prompt, provider payloads, stack traces, SQL, or hosted
logs.

Check:

1. Hosted freshness.
   - Web/API `/health` return `ok:true`.
   - Web/API `/health/deployment` are ready on `main`.
   - Hosted deployment is at least fresh enough to include PR272 implementation
     commit `454f3ec`.
2. Replay owner auth/session persistence.
   - Sign in through the hosted app or API using local-only env credentials.
   - Verify `/auth/me` returns the replay owner as non-admin and tiered for the
     current replay.
   - Verify session survives normal reload/navigation from login into Studio
     and at least one owner route.
   - If persistence fails, classify whether it looks like deploy refresh,
     browser storage/session restore, refresh-token/API, or route-guard behavior.
3. Bounded chat/runtime round trip.
   - Use the prepared replay persona.
   - Send one synthetic staging prompt that asks for a short answer naming only
     the seeded staging anchors.
   - Expected product behavior: the reply recalls the accepted seeded anchors
     without exposing private raw source bodies.
   - Record only sanitized outcome, timing bucket, and whether the answer used
     expected memory/archive/continuity context.
4. Context/readback evidence.
   - Check the owner context-preview/runtime context readback for the replay
     persona.
   - Confirm selected source categories remain understandable: Memory,
     Continuity, Archive, and Integrity/Canon if present.
   - Do not commit source bodies or compiled prompts.
5. Observability/readiness evidence.
   - Check that the runtime produces or preserves safe observability/readiness
     readback after the round trip.
   - Record counts/statuses/timing buckets only.

## Patch Rule

If DAEDALUS finds a narrow code defect that blocks the above scope, patch only
that defect and wake ARGUS.

If the run passes or reveals a product question rather than a patchable defect,
do not invent a patch. Create the result doc and wake MIMIR with the exact next
lane recommendation.

## Non-Scope

Do not:

- run Stripe Checkout or mutate billing/subscriptions;
- import files or paste new archive material;
- create, rotate, or expose ingestion keys;
- change providers, embeddings, Redis, Cloudflare, queues, workers, or schema;
- publish content or change public visibility;
- clean or reset the dirty replay owner's duplicate Stripe test state;
- run a broad UI redesign, Discern parity pass, or full demo rehearsal.

The one synthetic chat prompt is allowed because this lane is about actual
online runtime quality. Keep it clearly labeled as staging replay material.

## Result Shape

Create:

```text
docs/roadmap/PR274_HOSTED_REPLAY_RUNTIME_QUALITY_RESULT.md
```

Record:

- verdict: `PASS`, `PASS WITH CAVEATS`, `FAIL`, or `BLOCKED`;
- hosted freshness status;
- auth/session persistence status;
- chat/runtime result and sanitized timing bucket;
- context/readback result;
- observability/readiness result;
- whether any patch was made;
- exact next-owner recommendation.

## Suggested Validation

If no product code changes:

```bash
git diff --check
git diff --cached --check
```

If product code changes, add the narrow checks for touched surfaces. Likely
starting points:

```bash
npm exec --yes pnpm@10.32.1 -- run test:auth
npm exec --yes pnpm@10.32.1 -- run test:persona-context
npm exec --yes pnpm@10.32.1 -- run test:conversation-archive
npm exec --yes pnpm@10.32.1 -- run test:replay-readiness
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- run lint
git diff --check
git diff --cached --check
```

Use a tighter substitute if the touched scope is narrower; name the reason in
the handoff.

## Handoff

If patched, wake ARGUS:

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS completed PR274 Hosted Replay Runtime Quality Probe with a narrow patch.
- [state exact defect and fix]
Validation:
- [commands/results]
Task:
- Review auth/session/runtime/context/observability safety and wake MIMIR with verdict.
```

If no patch is needed, wake MIMIR:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- DAEDALUS completed PR274 Hosted Replay Runtime Quality Probe.
- [PASS / PASS WITH CAVEATS / FAIL / BLOCKED and one-line reason]
Validation:
- [hosted freshness, session, runtime, context, observability results]
Recommendation:
- [exact next lane and owner]
```
