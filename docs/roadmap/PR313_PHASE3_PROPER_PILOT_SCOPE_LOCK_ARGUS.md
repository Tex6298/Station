# PR313 - Phase 3 Proper Pilot Scope Lock

Owner: ARGUS

Opened by: MIMIR

Date: 2026-06-25

Status: Complete - see `PR313_PHASE3_PROPER_PILOT_SCOPE_LOCK_RESULT.md`

## Trigger

ARGUS completed PR312 with `READY WITH GATES`:

```text
docs/roadmap/PR312_PHASE3_PROPER_REENTRY_PREFLIGHT_RESULT.md
```

Current repo truth supports mainline re-entry only as a bounded Phase 3 proper
pilot gate. It does not support direct implementation, commercial packaging,
partner launch, or infrastructure expansion yet.

## Purpose

Lock exactly one Phase 3 proper pilot axis, or block explicitly on Marty before
any DAEDALUS implementation, external pilot, commercial offer, partner claim, or
infrastructure expansion.

This is docs/preflight only.

## Required Inputs

Inspect:

- `docs/roadmap/PR312_PHASE3_PROPER_REENTRY_PREFLIGHT_RESULT.md`;
- `docs/roadmap/STATION_FUTURE_LANES.md`;
- `docs/roadmap/STATION_REPLAY_STAGING_READINESS.md`;
- `docs/roadmap/STATION_BACKEND_PRODUCT_PR_PLAN.md`;
- `docs/roadmap/PR311_PROTECTED_ALPHA_DEMO_REFRESH_AFTER_MEMORY_PROOF_RESULT.md`;
- `docs/roadmap/PR310_MEMORY_READBACK_RERUN_AFTER_NAV_REPAIR_RESULT.md`;
- `docs/roadmap/PR201_PHASE3_BRIDGE_PREFLIGHT_ARGUS.md`;
- accepted public persona, public Project, Developer Space, Billing, and export
  closeout docs as needed.

## Candidate Axes

Classify these axes and choose exactly one, or block on Marty:

- public persona / public interaction expansion;
- public Project or institutional/research surface expansion;
- partner / Developer Space pilot readiness;
- billing, entitlement, or commercial packaging;
- hosted data/account/config requirements;
- Cloudflare, Redis, provider/model, embedding, worker, queue, or export
  infrastructure gates.

## Acceptance Bar

The PR313 result must:

- choose exactly one candidate axis or explicitly block on Marty;
- name the pilot audience;
- state the single success metric or pass condition;
- list allowed routes, components, APIs, and docs surfaces;
- list prohibited routes, components, APIs, and docs surfaces;
- list private data that must remain excluded;
- state whether the next owner is DAEDALUS, ARIADNE, ARGUS, MIMIR, or Marty;
- define local validation before code;
- define hosted proof before any readiness, partner, commercial, or public
  launch claim;
- preserve protected-alpha caveats and avoid production/commercial overclaim.

## Boundaries

Do not:

- edit product code;
- open a DAEDALUS implementation lane from inside PR313;
- wake DAEDALUS or ARIADNE;
- ask KVASIR or the advance team to choose the pilot;
- create pricing, partner, launch, or production claims;
- promote Redis, Cloudflare, provider/model, embedding, worker, queue, export,
  or broad UI work without a concrete pilot dependency;
- add credentials, env values, raw ids, prompts, completions, provider
  payloads, SQL, private source bodies, or secret-shaped values.

## Marty Question If Blocked

If ARGUS cannot safely choose one pilot axis from repo truth, return this exact
question as the blocker:

```text
Which Phase 3 proper promise should Station test first, for whom, and what
single outcome would make that pilot count as a pass?
```

## Required Result

Create:

```text
docs/roadmap/PR313_PHASE3_PROPER_PILOT_SCOPE_LOCK_RESULT.md
```

Wake MIMIR with:

- verdict: `SCOPE LOCKED`, `SCOPE LOCKED WITH GATES`, or `BLOCKED ON MARTY`;
- chosen pilot axis or exact blocking question;
- pilot audience;
- single success metric;
- next owner recommendation;
- what remains paused.
