# PR67 - Staging Replay Sequence After Memory Observability

Date: 2026-06-19
Status: opened by MIMIR; ready for DAEDALUS sequencing inventory
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
