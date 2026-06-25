# PR312 - Phase 3 Proper Re-Entry Preflight Result

Owner: ARGUS
Date: 2026-06-25
Status: READY WITH GATES

## Verdict

ARGUS finds that current repo truth supports mainline re-entry, but only as a
bounded Phase 3 proper pilot gate. It does not support a direct DAEDALUS product
implementation lane, a commercial packaging lane, a partner launch lane, or an
infrastructure expansion lane yet.

Verdict: `READY WITH GATES`.

Marty input is not needed to run the first gate. Marty input is required before
the first Phase 3 proper implementation, commercial offer, partner outreach, or
production-readiness claim.

## What Phase 3 Proper Means Now

From current repo truth, Phase 3 proper means choosing one externally
accountable pilot promise after the protected-alpha journey has passed hosted
rehearsal. It is not "more public features by inertia."

The first Phase 3 proper move must name:

- the pilot audience;
- the one public or partner-facing promise being tested;
- the surfaces included and excluded;
- the privacy/security boundary;
- the hosted proof required before broader rollout;
- whether Marty has approved the product/commercial/partner shape.

## Accepted Evidence Still Relevant

- PR201 accepted the Phase 3 bridge only after ARGUS corrected the first lane to
  public persona eligibility, serializer split, and owner readback.
- PR202 through PR266 accepted the public persona, public interaction, Roulette,
  Salon, public Project, export, Developer Space Tier 1, Memory observability,
  Archive trust, and staging-readiness bridge sequence.
- PR310 passed the hosted owner Memory readback rerun after the PR309 navigation
  repair.
- PR311 passed as current hosted protected-alpha product evidence across owner
  Studio, intended replay persona, Memory, Continuity/provenance, Persona
  Archive, Export Workspace, Billing, Settings, and public routes.
- The advance team is advisory only. KVASIR/ADV-002 may provide options and
  risks, but it cannot unpause mainline or select the next lane.

## First Safe Mainline Lane

Open:

```text
PR313 - Phase 3 Proper Pilot Scope Lock
Owner: ARGUS
Reviewer: MIMIR
Type: docs/preflight only
```

Purpose:

Lock exactly one Phase 3 proper pilot candidate before any implementation.

Files/surfaces to inspect:

- `docs/roadmap/STATION_FUTURE_LANES.md`
- `docs/roadmap/STATION_REPLAY_STAGING_READINESS.md`
- `docs/roadmap/STATION_BACKEND_PRODUCT_PR_PLAN.md`
- `docs/roadmap/PR311_PROTECTED_ALPHA_DEMO_REFRESH_AFTER_MEMORY_PROOF_RESULT.md`
- `docs/roadmap/PR310_MEMORY_READBACK_RERUN_AFTER_NAV_REPAIR_RESULT.md`
- `docs/roadmap/PR201_PHASE3_BRIDGE_PREFLIGHT_ARGUS.md`
- relevant accepted public persona, public Project, Developer Space, Billing,
  and export closeout docs named from those indexes

Acceptance bar:

- choose exactly one candidate axis or explicitly block on Marty;
- state the pilot audience and single success metric;
- list allowed routes/components/API surfaces and prohibited surfaces;
- list private data that must remain excluded;
- state whether the next owner is DAEDALUS, ARIADNE, ARGUS, MIMIR, or Marty;
- define local validation and hosted proof before any claim of readiness;
- preserve protected-alpha caveats and avoid production/commercial overclaim.

Validation:

- docs-only lane: `git diff --check`, `git diff --cached --check`, and
  added-line hygiene scan;
- if PR313 unexpectedly touches code, stop and return to MIMIR instead of
  widening the lane.

Hosted proof requirement:

- no hosted proof is required for PR313 itself;
- the first implementation after PR313 must have fresh hosted web/API deployment
  identity and a focused ARIADNE rehearsal for the selected pilot surface.

## Candidate Axis Classification

| Axis | Classification | Reason |
| --- | --- | --- |
| Public persona / public interaction expansion | Needs PR313 scope lock before implementation | The bridge substrate exists, including eligibility, public page/readback, signed-in public chat alpha, reporting, owner readback, counters, and rehearsals. Further expansion needs a named pilot promise, not generic feature drift. |
| Public Project or institutional/research surface expansion | Needs PR313 scope lock and likely Marty product decision before implementation | Public Project readback/evidence paths exist, but institutional/research framing is a product promise. Do not open new product code until the pilot audience and success metric are explicit. |
| Partner / Developer Space pilot readiness | Needs Marty partner/pilot decision before implementation | Developer Space Tier 1 is protected-alpha closed and framed, but a real partner pilot needs partner identity, data boundaries, success criteria, and approval before DAEDALUS work. |
| Billing, entitlement, commercial packaging | Needs Marty product/commercial decision first | Stripe test-mode and account readback are accepted proof, not pricing/package strategy. No live-money or packaging lane should open from repo momentum. |
| Hosted data/account/config requirements | Ready as gate inputs, not as implementation | PR311 says hosted web/API and replay account evidence are current enough for protected-alpha. Each future pilot still needs fresh deployment identity and sanitized proof. |
| Cloudflare, Redis, provider/model, embedding, worker, queue, or export infrastructure | Keep paused/future-only | Current evidence does not name a concrete scale, latency, retrieval, queue, or export blocker. These must not become Phase 3 proper by architecture anxiety. |

## Marty Input

Not needed before PR313.

Required before a DAEDALUS implementation or external pilot if PR313 selects:

```text
Which Phase 3 proper promise should Station test first, for whom, and what
single outcome would make that pilot count as a pass?
```

If Marty cannot answer that before implementation, the correct outcome after
PR313 is `BLOCKED`, not a speculative product lane.

## Must Remain Paused

- anonymous public visitor chat;
- persona-to-persona encounters;
- voice/avatar mode;
- broad Salon or community expansion beyond accepted gates;
- institutional/research product UI beyond a named pilot;
- partner adapter work or third-party integration beyond a named partner;
- live-money billing or commercial packaging;
- Redis as canonical Memory truth;
- Cloudflare retrieval/index mirrors;
- provider/model/embedding swaps;
- queues, workers, scheduled jobs, and export/download infrastructure;
- broad UI reskin, dashboard rewrite, or private search expansion.

## Wakeup

ARGUS wakes MIMIR with `READY WITH GATES`.

Recommended next action: open PR313 as an ARGUS docs/preflight lane to lock one
Phase 3 proper pilot candidate, or ask Marty the product/pilot question above
if MIMIR wants to skip that gate.
