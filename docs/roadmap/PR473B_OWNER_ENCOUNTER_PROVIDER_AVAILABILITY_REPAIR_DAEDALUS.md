# PR473B - Owner Encounter Provider Availability Repair

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Date opened: 2026-06-29

Status: Open - smallest PR473A hosted repair

## Why This Lane

ARIADNE ran the hosted PR473A owner encounter runtime preview rehearsal:

`docs/roadmap/PR473A_OWNER_INITIATED_ENCOUNTER_RUNTIME_PREVIEW_REHEARSAL_RESULT.md`

Verdict:

```text
PRODUCT_DEFECT_NEEDS_DAEDALUS
```

Hosted web/API were ready at `2ba1ea88`. The owner account had three personas,
the private Studio panel rendered on desktop and 390px mobile, and public routes
stayed clean. The blocking defect is that the owner preview click returned:

```text
Encounter preview provider setup is unavailable.
```

No model-generated responder reply appeared, so PR473A cannot close.

## Task

Repair the smallest thing that makes PR473A honest on hosted staging.

Preferred path:

- if an accepted private-context chat provider is already configured and allowed
  by the PR473 guardrails, make the hosted same-owner preview generation
  callable through that provider;
- keep the preview private Studio-only, same-owner-only, owner-initiated,
  non-durable, and limited to one model-generated responder reply.

Fallback path:

- if no accepted private-context provider is available under current guardrails,
  fail-close the owner preview panel before enabling generation;
- show bounded copy that the preview is paused because provider setup is
  unavailable;
- wake MIMIR with the exact provider/config blocker needed to make runtime
  callable later.

Do not silently enable a provider route that ARGUS has not accepted for private
encounter context. In particular, do not flip broad NVIDIA/private-context
behavior on by assumption; if that is the only way to make the hosted preview
callable, wake MIMIR/ARGUS with the decision instead.

## Expected Scope

Inspect:

- `apps/api/src/routes/persona-encounters.ts`
- `apps/api/src/routes/persona-encounters.test.ts`
- provider runtime selection in `apps/api/src/routes/chat.ts` and related
  helpers;
- owner preview UI/helper files touched by PR473A;
- `docs/roadmap/PR473_OWNER_INITIATED_ENCOUNTER_RUNTIME_PREFLIGHT_RESULT.md`
- `docs/roadmap/PR473A_OWNER_INITIATED_ENCOUNTER_RUNTIME_PREVIEW_REVIEW_RESULT.md`
- `docs/roadmap/PR473A_OWNER_INITIATED_ENCOUNTER_RUNTIME_PREVIEW_REHEARSAL_RESULT.md`

Prefer a narrow API/UI patch and focused tests. Do not add schema, migrations,
storage, queues, workers, Redis, Cloudflare, billing, public routes, cross-owner
behavior, source retrieval, or broad UI.

## Required Validation

Run the focused validation needed for the chosen repair, including:

```bash
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/persona-encounters.test.ts
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/persona-encounter-runtime.test.ts
npm exec --yes pnpm@10.32.1 -- run test:persona-encounters
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
git diff --cached --check
```

If the repair is provider-configuration-only and cannot be proven locally
without secrets, document that clearly and wake MIMIR with the exact missing
provider decision/config.

## Wakeup

When done, wake ARGUS:

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS completed PR473B Owner Encounter Provider Availability Repair.
Task:
- Review the repair against PR473A boundaries and route MIMIR for hosted
  rehearsal rerun or blocker decision.
```
