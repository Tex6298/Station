# PR317 - Post-PR316 Phase 3 Next Boundary Preflight

Owner: ARGUS

Opened by: MIMIR

Date: 2026-06-25

Status: Complete - see `PR317_POST_PR316_PHASE3_NEXT_BOUNDARY_RESULT.md`

## Trigger

ARIADNE completed PR316 with `PASS`.

Current accepted Phase 3 public persona evidence:

- PR315 proved the signed-in non-owner public persona chat path, with
  `transcriptStored:false` and owner aggregate-only readback.
- PR316 proved the human-visible public persona report path, with status-only
  confirmation and owner aggregate/status-only readback.

MIMIR needs the next mainline boundary classified. This is a mainline ARGUS
preflight, not an advance-team packet.

## Task

Run a hostile boundary preflight and return exactly one next-step classification:

1. `NEXT BOUNDED LANE`
   - Name one concrete next mainline lane that stays inside the current product
     boundary.
   - Name the owner: DAEDALUS, ARGUS, ARIADNE, or MIMIR.
   - Give the scope, non-goals, acceptance bar, and validation.

2. `MARTY DECISION REQUIRED`
   - Ask one exact product/commercial/partner question if every meaningful next
     step crosses a decision boundary.
   - The question must be specific enough that Marty can answer it directly.

3. `BLOCKED ON UNSAFE CONDITION`
   - Name the concrete unsafe condition that blocks every useful mainline next
     step.
   - Do not use this if a bounded lane or exact Marty question exists.

## Candidate Areas To Classify

Consider, but do not implement:

- public persona admin/moderation readback after report creation;
- owner aggregate/status readback polish or evidence;
- public persona answer-quality evidence, limited to public-source-only
  behavior;
- anonymous public chat preflight;
- external public persona pilot;
- partner/commercial/public launch claim boundary;
- refreshed demo/caveat runbook if it is actually mainline-useful.

ARGUS may reject all of these and name a better bounded lane, but must justify
the boundary.

## Hard Boundaries

Do not:

- edit product code;
- run broad implementation;
- wake DAEDALUS or ARIADNE;
- use advance-team framing as mainline authority;
- open anonymous public chat, external launch, commercial packaging, partner
  claims, provider/model work, Redis, Cloudflare, workers, durable visitor
  transcripts, visitor identity analytics, or broad UI work;
- request credentials or print env values;
- expose raw ids, private source bodies, prompts, completions, provider
  payloads, SQL, credentials, billing identifiers, reporter identity, visitor
  identity, report bodies, or transcripts.

## Evidence To Read

- `docs/roadmap/PR315_PUBLIC_PERSONA_PILOT_TESTER_ACCESS_RERUN_RESULT.md`
- `docs/roadmap/PR316_PUBLIC_PERSONA_REPORT_PATH_REHEARSAL_RESULT.md`
- `docs/roadmap/PR313_PHASE3_PROPER_PILOT_SCOPE_LOCK_RESULT.md`
- `docs/roadmap/ACTIVE_STATUS.md`
- Current code/tests only as needed to ground the classification.

## Wakeup

Wake MIMIR with:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS classified the post-PR316 Phase 3 boundary.
Verdict:
- NEXT BOUNDED LANE / MARTY DECISION REQUIRED / BLOCKED ON UNSAFE CONDITION.
Task:
- Open the chosen lane, ask the exact question, or record the blocker.
```
