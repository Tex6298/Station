# PR61 - Persona Lifecycle And Handoff Readback

Date: 2026-06-19
Status: opened for DAEDALUS
Owner: DAEDALUS implements, ARGUS reviews, ARIADNE rehearses signed owner UI,
MIMIR decides next lane.

## Purpose

Continue the Memory UX / observability lane after PR60 by making persona
lifecycle and handoff state understandable to an owner.

PR60 made individual memory lifecycle state and AI activity legible. PR61 should
make the existing persona architecture/handoff/lifecycle surface feel like a
continuity trust readback, not a raw internal management dump.

## Existing Foundations

Use the current owner-only surfaces:

- `apps/web/components/studio/persona-management.tsx`
- `apps/web/app/studio/personas/[personaId]/edit/page.tsx`
- `apps/api/src/routes/personas.ts`
- `apps/api/src/services/persona-lifecycle.service.ts`
- `packages/types/src/persona.ts`

The API already exposes:

- `GET /personas/:id/architecture`
- `PATCH /personas/:id/architecture`
- `POST /personas/:id/handoffs`

## Scope

Implement a bounded owner-only UI/readback slice:

- Improve the signed owner persona management/edit surface so lifecycle and
  handoff state is clear and human-readable.
- Keep the existing route; do not add a new public page.
- Make the page's visible structure align with Station's Studio surfaces rather
  than an isolated raw dashboard.
- Present:
  - persona layer profile summary;
  - recent lifecycle events;
  - recent handoffs;
  - memory graph counts/readback;
  - continuity/archive/integrity counts already available from the persona
    continuity summary.
- Add owner-friendly labels for lifecycle event types, such as:
  - memory update;
  - handoff in;
  - handoff out;
  - layer update.
- Keep handoff creation lightweight and owner-only.
- After saving a handoff, refresh or locally update both:
  - the handoff list;
  - lifecycle event readback if the API returns enough information or a cheap
    refresh is available.
- Avoid showing raw UUIDs or raw event payload JSON in the UI.
- Keep desktop and `390px` mobile fit.

## Non-Scope

- No public persona lifecycle surface.
- No cross-owner handoff or collaborator feature.
- No new handoff routing between accounts.
- No raw private conversation transcript display.
- No raw lifecycle event payload display.
- No memory graph visualization beyond bounded counts/readback.
- No AI-generated handoff summarizer beyond existing API behavior.
- No schema/migration work unless a tiny type/readback gap is unavoidable.
- No Redis, Cloudflare, provider migration, Project work, hosted runtime,
  worker, billing/quota, DexOS, or broad redesign.

## Acceptance

ARGUS can accept PR61 if:

- The persona management/edit page remains owner-only.
- Lifecycle and handoff readback is more legible without leaking raw private
  payloads or ids.
- Handoff creation still uses the existing owner-only route.
- Handoff save updates the visible handoff/lifecycle state or clearly explains
  if lifecycle refresh is deferred.
- No public route, schema, provider, Redis, Cloudflare, Project, hosted-runtime,
  worker, billing, or DexOS scope is added.
- Desktop and narrow mobile layout risk is addressed.

## Validation

Run at minimum:

```bash
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run test:persona-context
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

If API behavior changes, also run the focused persona/persona-context tests that
cover the touched route. If a web build is run, record the known Windows
standalone symlink `EPERM` separately from compile/type/page-generation
success.

## Handoff

Wake ARGUS with:

- exact files changed;
- lifecycle/handoff labels added;
- handoff refresh behavior;
- privacy boundary for event payloads, ids, and conversation text;
- desktop/mobile fit notes if checked;
- validation results;
- scope confirmation that no public lifecycle, cross-owner handoff, raw
  transcript/event payload, Redis, Cloudflare, provider migration, Project,
  hosted runtime, worker, billing, or DexOS work was added.

If ARGUS accepts, wake ARIADNE for signed owner UI rehearsal and wake MIMIR with
the review verdict. ARIADNE should check:

- signed owner persona management/edit page;
- lifecycle labels and recent event readability;
- handoff creation and visible update behavior;
- memory/continuity readback clarity;
- `390px` layout with no horizontal overflow or offscreen controls.

If blocked, wake MIMIR with the exact blocker. Do not leave the lane silent.
