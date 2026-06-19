# PR60 - Memory UX And Observability First Slice

Date: 2026-06-19
Status: opened for DAEDALUS
Owner: DAEDALUS implements, ARGUS reviews, ARIADNE rehearses signed owner UI,
MIMIR decides next lane.

## Purpose

Start Phase 2 memory trust work with a small user-visible slice that makes
Station's existing memory lifecycle and AI observability foundations legible.

This follows the accepted PR59 pause on Project implementation. The next value
is not more Project scaffolding; it is helping an owner understand what Station
remembers, what is held out, and what recent AI activity did without exposing
raw private internals.

## Existing Foundations

Use what is already in the repo:

- `apps/web/app/studio/personas/[personaId]/memory/page.tsx`
- `apps/api/src/routes/memory.ts`
- `apps/api/src/services/memory-continuity.service.ts`
- `apps/api/src/routes/observability.ts`
- `apps/api/src/services/ai-observability.service.ts`
- `apps/web/components/settings/ai-observability-panel.tsx`
- `packages/types/src/persona.ts`

## Scope

Implement a bounded owner-only UI/readback slice:

### Studio Memory

- Improve the persona Memory page so lifecycle state is understandable at a
  glance.
- Show all relevant lifecycle counters, not only active/quarantined:
  - active;
  - quarantined;
  - rejected;
  - expired;
  - superseded;
  - missing lifecycle, if present in the briefing shape.
- Add clear runtime-readiness copy per memory item:
  - active memory is eligible for runtime context;
  - quarantined/rejected/expired/superseded/missing lifecycle memory is held
    out unless later restored by an owner action.
- Preserve existing owner lifecycle controls and add only the smallest useful
  action set:
  - reinforce;
  - restore/activate;
  - quarantine;
  - reject.
- Do not add complex supersession picking unless it is trivial and already
  supported cleanly by local patterns; otherwise leave supersession as a future
  richer review flow.
- Keep briefing counts refreshed after lifecycle changes.

### AI Observability

- Improve the Settings AI observability panel so recent traces are useful to a
  human owner without exposing raw prompts, completions, private archive chunks,
  provider keys, URLs, tokens, cookies, or owner/private ids.
- Show sanitized operational truth where already available:
  - source;
  - status;
  - duration;
  - token totals;
  - estimated cost;
  - provider route/profile label from metadata if present;
  - failure message if present and already sanitized.
- If adding trace detail expansion, use the existing owner-only
  `/observability/traces/:traceId` route and render only sanitized metadata or
  whitelisted fields.
- Preserve owner-only behavior; do not add public observability.

### UX Constraints

- Use existing Station UI primitives/styles where possible.
- Keep desktop and `390px` mobile fit.
- Do not start a broad redesign.
- Do not make telemetry feel like a separate product; this is trust/readback
  for the owner.

## Non-Scope

- No public memory surfaces.
- No raw AI trace prompt/completion/body display.
- No private archive excerpt display inside observability.
- No new memory truth store.
- No Redis or Cloudflare memory/index work.
- No embedding/provider migration.
- No Project work.
- No Developer Space hosted runtime, developer-agent, DexOS widgets, or
  Interconnected Lab work.
- No background worker or realtime infrastructure.
- No billing/quota/Stripe changes.
- No schema/migration work unless a tiny type/readback gap is unavoidable and
  ARGUS can review it inside this lane.

## Acceptance

ARGUS can accept PR60 if:

- The Memory page explains lifecycle states and runtime inclusion/holdout
  clearly.
- Lifecycle actions remain owner-only and preserve existing route behavior.
- Briefing counters update after lifecycle changes.
- Observability remains authenticated owner-only.
- Observability renders only sanitized operational metadata.
- No raw prompts, completions, provider payloads, private archive chunks,
  provider keys, base URLs, tokens, cookies, owner ids, persona ids, trace ids,
  or replay credentials leak into committed docs/tests/screenshots.
- Desktop and narrow mobile layouts remain usable.
- No Redis/Cloudflare/provider migration/Project/hosted-runtime/billing scope is
  added.

## Validation

Run at minimum:

```bash
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run test:persona-context
npm exec --yes pnpm@10.32.1 -- run test:replay-readiness
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

If observability service behavior changes, also run the focused observability
or conversation/archive tests that cover the touched path. If a web build is
run, record the known Windows standalone symlink `EPERM` separately from
compile/type/page-generation success.

## Handoff

Wake ARGUS with:

- exact web/API/type files changed;
- lifecycle labels/counters/actions added;
- runtime inclusion/holdout wording;
- observability fields rendered and sanitization boundary;
- whether trace detail expansion was added;
- desktop/mobile fit notes if checked;
- validation results;
- scope confirmation that no public memory, raw trace, Redis, Cloudflare,
  provider migration, Project, hosted-runtime, worker, billing, or DexOS work
  was added.

If ARGUS accepts, wake ARIADNE for signed owner UI rehearsal and wake MIMIR with
the review verdict. ARIADNE should check:

- a persona Memory page with active and held-out memories;
- lifecycle actions update copy and counters;
- Settings AI activity panel is understandable and not raw/private;
- `390px` layout has no horizontal overflow or offscreen controls.

If blocked, wake MIMIR with the exact blocker. Do not leave the lane silent.
