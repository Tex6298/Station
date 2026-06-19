# PR67 - Staging Replay Sequence After Memory Observability

Date: 2026-06-19
Status: DAEDALUS sequencing inventory ready for ARGUS review
Owner: DAEDALUS inventories, ARGUS reviews, MIMIR chooses the next active lane.

## Purpose

Turn the accepted PR60 through PR66 Memory UX and observability work into a
clear staging/replay sequence.

The memory-first pass is now closed. The next useful move is not to invent a new
infrastructure lane. It is to decide what the current Railway staging app should
prove next, which existing human route ARIADNE should rehearse if proof is
needed, and which exact implementation lane should open only if a concrete
blocker is found.

## Inputs

Review:

- `docs/roadmap/PR66_MEMORY_OBSERVABILITY_LANE_CLOSEOUT.md`
- `docs/roadmap/STAGING_ALPHA_CLOSURE_STATUS.md`
- `docs/roadmap/PR36_LAUNCH_CORE_HUMAN_REHEARSAL.md`
- `docs/roadmap/PR38_FINAL_HUMAN_DEMO_REHEARSAL.md`
- `docs/roadmap/PR39_PROTECTED_ALPHA_DEMO_RUNBOOK.md`
- `docs/roadmap/STATION_BACKEND_PRODUCT_PR_PLAN.md`
- `docs/roadmap/ACTIVE_STATUS.md`
- the current git log after PR60 through PR66

Staging URLs:

```text
https://stationweb-production.up.railway.app
https://stationapi-production.up.railway.app
```

## Scope

Produce a concise sequencing result that says:

- whether the current next step should be:
  - ARIADNE human rehearsal of the memory/observability replay path;
  - DAEDALUS narrow fix for a known live blocker;
  - ARGUS-only audit of overclaim/config/deployment truth;
  - or a deliberate pause.
- what route order should be used if ARIADNE rehearses:
  - sign in/session persistence;
  - Studio dashboard;
  - persona Memory lifecycle;
  - Persona lifecycle/handoff;
  - Continuity;
  - Integrity review;
  - Archive import review;
  - Settings AI Activity;
  - Developer Space manage and public observatory;
  - publish/public document/forum chain only if needed for continuity of story.
- what live deployment facts should be checked before any human rehearsal:
  - web/API health;
  - web/API deployment identity;
  - expected current commit or whether Railway is still catching up;
  - auth/session persistence;
  - no secret/config values printed.
- which known caveats remain demo notes rather than blockers.
- which exact conditions would justify opening Redis, Cloudflare, provider,
  parser/OAuth, worker, hosted runtime, Project, billing, or broad UI work.

Update this file with the sequencing result and update `ACTIVE_STATUS.md` with a
short PR67 status bullet.

## Non-Scope

- No product code.
- No schema or migration changes.
- No API route behavior changes.
- No new staging seed data unless the sequencing result proves it is the next
  narrow step.
- No Redis/Valkey/Upstash memory implementation.
- No Cloudflare retrieval or edge-worker implementation.
- No provider migration, model routing change, prompt change, or embedding
  migration.
- No Stripe/billing expansion.
- No hosted runtime, queue, worker, realtime protocol, Project, DexOS, or
  developer-agent work.
- No broad UI/UX redesign.
- No asking Marty to manually test flows that ARIADNE can rehearse.

## Acceptance

ARGUS can accept PR67 if:

- The sequencing result follows PR66 and does not reopen deferred feature scope
  without evidence.
- It names one next action clearly.
- If ARIADNE should rehearse, the route order and pass/fail criteria are exact
  enough for a human-eye run.
- If DAEDALUS should implement, the defect is concrete enough to fix narrowly.
- If the answer is pause, the pause condition is explicit and does not leave the
  workflow asleep.
- It does not print or request secrets.

## Validation

Run:

```bash
git diff --check
```

If DAEDALUS checks live health/deployment routes, record only sanitized booleans,
commit ids, service names, and pass/fail. Do not record secrets, cookies,
headers, credentials, or private data.

## Handoff

Wake ARGUS with:

- sequencing result file(s);
- recommended next action;
- live checks performed, if any;
- exact rehearsal or implementation handoff if recommended;
- validation result;
- confirmation that no product code/schema/API behavior changed.

ARGUS should wake MIMIR with accept/block and the next baton. If ARGUS accepts
and the next action is ARIADNE rehearsal, MIMIR should wake ARIADNE with the
route order. If the next action is a narrow fix, MIMIR should wake DAEDALUS with
the exact defect. Do not leave the team asleep.

## DAEDALUS Sequencing Result

Recommended next action: ARIADNE should run a focused human-eye staging
rehearsal of the memory/observability replay path.

This is not a new feature lane. It is a current-staging proof pass over the
accepted owner-readback stack after PR60 through PR65. DAEDALUS does not see a
concrete live blocker that justifies implementation before rehearsal, and PR67
does not require ARGUS-only config audit first because public health/deployment
checks are currently green.

## Current Railway Truth

Checked on 2026-06-19 with public non-secret health endpoints only:

| Target | Result | Sanitized identity |
| --- | --- | --- |
| Web `/health` | Pass, `ok:true` | Railway web reachable. |
| API `/health` | Pass, `ok:true` | Railway API reachable. |
| Web `/health/deployment` | Pass, `ready:true` | Commit `b1e9ce3ae5d2f8a6c4f0e5c270dd2cbc216c567f`, branch `main`, service `@station/web`. |
| API `/health/deployment` | Pass, `ready:true` | Commit `b1e9ce3ae5d2f8a6c4f0e5c270dd2cbc216c567f`, branch `main`, service `@station/api`. |

Notes:

- `b1e9ce3` is the accepted PR65 product-code runtime. PR66 and PR67 are
  docs-only commits, so Railway does not need to serve them before ARIADNE can
  rehearse the product path.
- The API deployment readiness reports database, migrations, private
  `persona-files` storage, public Railway URLs, Supabase Auth redirects, Stripe
  billing config, platform chat, Gemini embeddings, and operational cache as
  ready/configured.
- The same readiness report says no BullMQ-compatible worker queue is ready and
  the queue path is still inline/fallback. That remains a demo caveat, not a
  blocker for the memory/observability route unless rehearsal finds a concrete
  queue-dependent failure.
- No secrets, cookies, headers, credentials, private IDs, raw bodies, prompts,
  completions, or replay corpus text were recorded in this check.

## Rehearsal Route Order

ARIADNE should rehearse against:

```text
https://stationweb-production.up.railway.app
https://stationapi-production.up.railway.app
```

Suggested route order:

1. Preflight:
   - Web `/health`
   - API `/health`
   - Web `/health/deployment`
   - API `/health/deployment`
   - Pass if both services are `ok:true`, deployment readiness is `ready:true`,
     and both product services still report commit `b1e9ce3` or a later accepted
     product commit.
2. Sign in/session:
   - Web `/login`
   - API `/auth/me`
   - Web `/studio`
   - Pass if the replay owner session restores without exposing tokens,
     cookies, owner IDs, or auth headers.
3. Studio orientation:
   - Web `/studio`
   - Confirm private Studio readback is understandable and distinct from public
     Spaces/Developer Spaces.
4. Persona Memory:
   - Web `/studio/personas/:personaId/memory`
   - Pass if lifecycle counters, runtime eligibility/holdout copy, and actions
     are readable without raw private IDs or source bodies.
5. Persona lifecycle/handoff:
   - Web persona management/edit route for the replay persona.
   - Pass if lifecycle event labels, handoff labels/previews, memory graph
     readback, and continuity/archive/integrity counts remain coherent.
6. Continuity:
   - Web `/studio/personas/:personaId/continuity`
   - Pass if Continuity is visibly separate from Memory/Archive/Integrity in
     runtime readback and timeline provenance labels are understandable.
7. Integrity:
   - Web `/studio/personas/:personaId/calibration`
   - Pass if review cards still explain accept/edit/dismiss destination and
     preservation behavior before action.
8. Archive import review:
   - Web `/studio/personas/:personaId/files`
   - Pass if imported-source-to-Memory/Canon review state, destination,
     accepted-target, and preservation copy are readable. It is acceptable to
     use existing pending/reviewed candidates or create one replay-safe pasted
     import if ARIADNE needs live action proof.
9. Settings AI Activity:
   - Web Settings AI Activity surface.
   - API `/observability/summary`
   - API `/observability/traces`
   - Pass if only source/status/duration/token/cost/metadata labels and counts
     are captured. Do not capture prompts, completions, raw trace bodies, trace
     IDs, owner IDs, persona IDs, cookies, tokens, or credentials.
10. Developer Space observability:
    - Public `/developer-spaces/station-replay-dev-alpha`
    - Owner `/developer-spaces/station-replay-dev-alpha/manage`
    - Pass if public observatory remains public-safe and owner manage clearly
      separates current observatory state from metered usage/quota without
      exposing ingestion keys or raw payloads.
11. Optional continuity-of-story chain:
    - Public Space/document/forum routes only if ARIADNE needs to prove the
      memory/observability story still connects to public presentation.

Mobile spot check:

- Repeat the core private route cluster at `390px`: Studio, Memory,
  Continuity, Archive import review, and Developer Space manage.
- Pass if there is no document-level horizontal overflow, offscreen controls,
  or visible application/auth error state.

## Pass / Fail Criteria

Pass:

- The memory/observability replay route completes on current Railway.
- The owner can understand what Station remembers, what is held out, how
  runtime context is assembled, how Integrity outputs write, how Archive imports
  become candidates, how AI activity is summarized, and how Developer Space live
  state differs from usage counters.
- Public/private boundaries remain obvious.
- No private source text, prompts, completions, raw payloads, credentials,
  tokens, cookies, API keys, owner IDs, persona IDs, trace IDs, or replay corpus
  text are captured or exposed.

Fail:

- Any route needed for the rehearsal returns a persistent application/auth
  error.
- Memory/Continuity/Integrity/Archive/Developer Space readback contradicts the
  accepted PR60-PR65 server behavior.
- Public surfaces expose owner-only manage, trace, archive, prompt, payload, or
  credential material.
- Mobile core routes have document-level overflow or unreachable controls that
  block the rehearsal.

## Known Caveats That Are Not Blockers

- PR66 and PR67 are docs-only and are not required to be served by Railway.
- The local Windows standalone web build still hits the known symlink `EPERM`
  after successful compile/type/page-generation; Railway/Linux remains the
  decisive standalone environment.
- Worker queue readiness is not proven; current staging uses inline/fallback
  behavior for queue-dependent paths. This is not a blocker unless rehearsal
  finds a specific queue-dependent failure.
- Redis/Upstash operational cache is configured, but this is not Redis working
  memory or a durable queue acceptance.
- Paid activation is only required if MIMIR includes paid-tier activation in
  the rehearsal. Otherwise billing stays a status/readback demo note.
- Export remains owner-only JSON/Markdown readback, not PDF/binary/full
  workspace export.
- Archive import is pasted/file/manual intake and candidate review, not OAuth,
  recurring pulls, or parser expansion.

## Conditions For Future Lanes

Open a DAEDALUS narrow fix only if rehearsal produces a concrete failing route,
bad state refresh, wrong destination/readback copy, auth/session defect,
privacy leak, or blocking mobile layout issue.

Open an ARGUS deployment/config audit only if health/deployment readiness
turns false, Railway serves mismatched product commits, staging config claims
conflict with live sanitized readiness, or a remote-only behavior contradicts
local validation.

Open Redis/worker work only if a rehearsed flow fails because inline/fallback
job behavior cannot support the demo or protected-alpha use case.

Open Cloudflare/retrieval/provider/parser/OAuth/billing/Project/hosted-runtime/
DexOS/broad UI work only if ARIADNE or ARGUS captures exact route-level evidence
that the staging replay cannot proceed without that specific lane.

Otherwise, do not open those lanes from architectural anxiety.
