# PR 8 - Site-Wide UI Coherence And Control Truth

Date opened: 2026-06-15

Opened by: A1 / MIMIR

DAEDALUS result: `docs/roadmap/PR8_SITE_WIDE_UI_COHERENCE_RESULT.md`

Prerequisite: PR 7 live replay optimization baseline accepted by A3 / ARGUS in
`8b2c9c2` as evidence-only/no-code.

Owner: A2 / DAEDALUS first, then A3 / ARGUS, then A4 / ARIADNE for human-eye
browser rehearsal.

## Why This Lane Opens

PR 7 says the live backend/product foundation does not currently justify
another speculative backend architecture lane.

The unresolved evidence is user-facing:

- The landing page and parts of `/discover` moved toward the intended
  Discern/Station editorial language.
- The rest of the app still has surfaces that read as generic card-stacked
  dashboards or mismatched dark workbenches.
- Prior visual closeout docs treated this as future polish, but Marty's newer
  human-eye feedback makes it current product quality work.
- This is not just `/discover`.
- This is not a decorative redesign.

## Goal

Carry the accepted Station/Discern visual direction through the actual hosted
product.

The claim to earn is:

> Station feels like one coherent product across public browsing, community,
> Studio, Developer Spaces, billing, and settings, while every visible control is
> either genuinely usable or clearly unavailable for this slice.

## Visual Target

Use `/` and the accepted public-front-door direction as the baseline:

- off-white/light editorial canvas for public and account-level surfaces;
- restrained 8px cards and panels, not nested-dashboard piles;
- clear place labels and privacy/visibility labels;
- calm dark top nav may remain as global chrome;
- Studio can stay a quieter workbench, but it must feel deliberately related to
  Station, not like a separate generic SaaS dashboard;
- Developer Spaces should read as observatories, not generic metrics pages;
- public Spaces/documents/discussions should read as authored public work, not
  generic feed cards;
- Billing and Settings should be calm operational account pages, not placeholder
  card grids;
- mobile at 390px must not overflow, hide primary actions, or collide labels.

Avoid:

- broad purple-gradient/dashboard treatment;
- gratuitous dark card stacks on light public routes;
- nested cards inside cards;
- route-local inline styles fighting the global visual system;
- active-looking controls that do not route, mutate state, save, or explain
  their unavailable state.

## Route Scope

DAEDALUS should work across the route set below. If the first patch cannot
finish all routes safely, it must still establish the shared system and document
exactly which route remains for the next slice.

Primary route set:

- `/`
- `/discover`
- `/writing`
- `/forums`
- `/forums/:category`
- `/forums/:category/:thread`
- `/space/:slug`
- `/space/:slug/documents/:documentId`
- `/developer-spaces`
- `/developer-spaces/:slug`
- `/developer-spaces/:slug/manage`
- `/studio`
- `/studio/personas/:personaId`
- `/studio/personas/:personaId/continuity`
- `/studio/personas/:personaId/memory`
- `/studio/personas/:personaId/files`
- `/billing`
- `/settings`

## File Allow-List

Allowed frontend files:

- `apps/web/app/globals.css`
- `apps/web/components/nav/top-nav.tsx`
- `apps/web/components/discover/**`
- `apps/web/components/writing/**`
- `apps/web/app/forums/**`
- `apps/web/components/social/**`
- `apps/web/app/space/**`
- `apps/web/components/space/**`
- `apps/web/app/developer-spaces/**`
- `apps/web/components/studio/**`
- `apps/web/app/studio/**`
- `apps/web/app/billing/**`
- `apps/web/app/settings/**`
- `apps/web/components/settings/**`
- focused frontend helper tests under `apps/web/**`
- this lane's docs/status files

Forbidden unless MIMIR reopens scope:

- `apps/api/**`
- `packages/ai/**`
- `packages/config/**`
- `packages/db/**`
- `infra/**`
- `package.json`
- `pnpm-lock.yaml`
- `.env.example`
- Railway, Supabase, Stripe, provider, embedding, auth/session, billing
  backend, migration, storage, or API behavior.

## Implementation Requirements

DAEDALUS should:

1. Inspect current route/component styling against the visual target.
2. Replace obvious route-local dark/dashboard styling with shared Station
   primitives where practical.
3. Keep controls honest:
   - live controls must route, save, submit, toggle state visibly, or open the
     expected external host;
   - unavailable controls must be disabled, removed, or labelled as preview /
     unavailable with a visible reason.
4. Preserve current data/loading/error semantics.
5. Preserve public/private/community visibility boundaries.
6. Preserve all existing route links and search/filter/tab state that currently
   works.
7. Avoid more global attribute-selector hacks as the main fix. Prefer component
   classes and shared primitives.

## Acceptance Gates

ARGUS review:

- Diff stays inside allowed frontend/docs files.
- No backend, auth/session, billing backend, provider, embedding, Railway,
  Supabase, migration, or API behavior changed.
- Public/private/community visibility language remains accurate.
- Existing route controls still work, and non-live controls no longer look live.
- No fake backend capability is implied.

ARIADNE human rehearsal:

- Desktop and 390px mobile review for the route set.
- The product reads as one Station system, not a landing page plus unrelated
  dashboards.
- No document-level horizontal overflow.
- No text collision like the previous forum badge issue.
- No obvious live-looking no-op controls.
- Public chain, Studio continuity/archive, Developer Space, Billing, and
  Settings all remain understandable.

## Validation

Expected DAEDALUS gate:

```bash
npx --yes pnpm@10.32.1 --filter @station/web typecheck
npx --yes pnpm@10.32.1 --filter @station/web lint
npx --yes pnpm@10.32.1 test:studio-ui
npx --yes pnpm@10.32.1 test:community
npx --yes pnpm@10.32.1 test:document-discussions
npx --yes pnpm@10.32.1 test:developer-spaces
npx --yes pnpm@10.32.1 test:developer-space-client
npx --yes pnpm@10.32.1 test:billing
git diff --check
```

If DAEDALUS touches additional route logic, add the focused tests for that
exact helper/component.

## Handoff

DAEDALUS should wake ARGUS with:

- route set touched;
- files changed;
- controls made live, disabled, labelled, or left unchanged with reason;
- validation run;
- remaining visual gaps, if any;
- confirmation that no protected backend/config/auth/billing/provider files or
  behavior changed.

If ARGUS accepts, ARGUS should wake ARIADNE for a route-set human rehearsal.

ARIADNE should wake MIMIR with pass/fail and the exact remaining route defects,
not broad vibes.

## DAEDALUS Implementation Status

Ready for ARGUS review, 2026-06-15. DAEDALUS added explicit Station page,
panel, card, notice, and action primitives; applied them to Billing, Settings,
Spaces index, Developer Spaces index, Writing, and Studio publishing; and made
Studio publishing no-op controls disabled/labelled unavailable. Backend,
auth/session, Stripe backend, Supabase/database, provider, migration, package,
and lockfile behavior were not changed.

Most PR 8 validation passed. `test:document-discussions` timed out twice with
no completed test output, including when isolated from its package-build prefix.
The timeout is recorded in the result doc for ARGUS review because PR 8 did not
touch API route or document-discussion test code.
