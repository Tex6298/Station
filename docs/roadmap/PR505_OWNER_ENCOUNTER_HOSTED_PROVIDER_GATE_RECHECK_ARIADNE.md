# PR505 - Owner Encounter Hosted Provider Gate Recheck

Owner: ARIADNE / A4

Opened by: MIMIR / A1

Date opened: 2026-07-11

Status: Open hosted proof/recheck

## Why This Lane

Station Press owner package proof is closed. The next product move should be a
named Phase 3/customer-facing expansion, not another hardening sweep.

Persona-to-persona encounters are already scaffolded as an owner-only,
same-owner, disposable preview path, but hosted generation was previously
blocked on a route-specific provider policy flag. PR505 rechecks that hosted
truth before any new implementation.

## Existing Evidence

Closed/accepted:

- PR471A owner encounter readiness gate.
- PR472A owner encounter consent/provenance contract.
- PR473 owner-initiated encounter runtime preview, closed at hosted
  provider/config boundary.
- PR502A route-specific explicit provider gate.

Previous hosted blocker:

`docs/roadmap/PR502B_OWNER_ENCOUNTER_PROVIDER_GATE_HOSTED_PROOF_RESULT.md`

MIMIR blocker record:

`docs/roadmap/PR502B_OWNER_ENCOUNTER_PROVIDER_GATE_HOSTED_CONFIG_BLOCKER_MIMIR.md`

Exact non-secret hosted blocker recorded there:

```text
PERSONA_ENCOUNTER_ALLOW_PLATFORM_NVIDIA_PRIVATE_CONTEXT=true
```

The previous hosted proof found the NVIDIA provider present, but the
route-specific encounter flag absent. Do not assume that is still true; recheck
hosted readiness.

## Task

Run a hosted owner encounter provider-gate recheck.

Target:

```text
https://stationweb-production.up.railway.app
```

Use the authenticated owner encounter readiness route as source of truth:

```text
GET /persona-encounters/preview/readiness
```

Do not record credentials, cookies, auth tokens, raw owner ids, raw persona ids,
prompt bodies, private context bodies, provider keys, base URLs, model config,
SQL details, stack traces, provider payloads, or env values.

## If Readiness Is Blocked

If readiness returns not ready with provider policy/config classification:

- do not send generation;
- record the exact bounded code/classification/message;
- confirm owner auth and same-owner persona availability if safe;
- wake MIMIR with a blocker verdict.

Expected blocker if unchanged:

```text
persona_encounter_provider_unavailable
provider_data_policy
```

## If Readiness Is Ready

If readiness is ready:

- send exactly one owner-initiated disposable encounter preview request;
- use two same-owner personas only;
- prove the response is bounded and disposable;
- prove no durable transcript, generated public page, shareable page, social
  post, source retrieval, vector/Memory/Archive/Canon/Continuity/Integrity
  retrieval, queue/worker, Redis, Cloudflare, billing, or cross-owner behavior
  was created;
- prove sampled public persona/public Space routes still expose no encounter
  controls or availability claims;
- inspect desktop and 390px mobile owner Studio encounter surface if the
  hosted flow naturally exposes it.

## Non-Scope

Do not request or implement:

- cross-owner encounters;
- autonomous/background encounters;
- scheduled encounters;
- durable encounter transcripts;
- public/shareable encounter pages;
- anonymous encounter controls;
- source retrieval or vector retrieval;
- social publishing;
- billing/Stripe;
- Redis;
- Cloudflare;
- queues/workers;
- schema/migration changes;
- broad UI redesign;
- provider router broadening.

## Result Required

Create:

```text
docs/roadmap/PR505_OWNER_ENCOUNTER_HOSTED_PROVIDER_GATE_RECHECK_RESULT.md
```

Include:

- pass/block verdict;
- hosted reachability;
- owner auth result;
- same-owner persona availability result;
- readiness result;
- whether generation was attempted;
- if generated, disposable response and no-drift results;
- if blocked, exact config/policy blocker;
- privacy/secret scan;
- validation checks;
- final wakeup.

## Wakeup

```text
WAKEUP A4:
Codename: ARIADNE
Summary:
- PR504 Station Press owner package proof is closed.
- Next lane moves to the named Phase 3 owner persona encounter path rather than more Station Press deepening.
- Prior PR502B hosted proof was blocked by missing non-secret Railway @station/api flag PERSONA_ENCOUNTER_ALLOW_PLATFORM_NVIDIA_PRIVATE_CONTEXT=true, while NVIDIA provider itself was present.
Task:
- Recheck hosted owner encounter readiness.
- If readiness is still provider-policy/config blocked, do not generate; record the exact blocker and wake MIMIR.
- If readiness is ready, run exactly one disposable same-owner encounter preview and prove no public/cross-owner/durable/provider-scope drift.
```
