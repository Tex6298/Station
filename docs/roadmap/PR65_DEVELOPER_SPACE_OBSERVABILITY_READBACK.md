# PR65 - Developer Space Observability Readback

Date: 2026-06-19
Status: accepted by ARGUS; ready for ARIADNE rehearsal
Owner: DAEDALUS implements, ARGUS reviews, ARIADNE rehearses signed owner UI,
MIMIR decides the next lane.

## Purpose

Continue the Memory UX / observability lane by making the Developer Space owner
console explain live observatory state clearly.

Earlier staging rehearsal found a narrative gap: the public Developer Space
observatory showed live node/event/snapshot state, while the owner manage path
could make usage counters read as empty or inconsistent. PR65 should make the
owner/researcher view distinguish current live observatory evidence from
metered usage/quota data, without reopening hosted runtime or realtime
infrastructure.

## Existing Foundations

Start from existing Developer Space surfaces and helpers:

- `apps/web/app/developer-spaces/[slug]/manage/page.tsx`
- `apps/web/app/developer-spaces/[slug]/page.tsx`
- `apps/web/lib/developer-space-observatory.ts`
- `apps/web/lib/developer-space-observatory.test.ts`
- `apps/web/lib/developer-space-visual-config.ts`
- `apps/api/src/routes/developer-spaces.ts`
- `apps/api/src/services/developer-space.service.ts`
- `apps/api/src/services/developer-space-usage.service.ts`
- `apps/api/src/routes/developer-spaces.test.ts`
- `packages/types/src/developer-space.ts`

Relevant existing APIs:

- `GET /developer-spaces`
- `GET /developer-spaces/:slug`
- `GET /developer-spaces/:id/usage`
- existing owner manage PATCH/key/template/visual config/export routes
- existing SSE/WebSocket live update paths

## Scope

Implement a bounded owner-only Developer Space observability readback slice:

- Improve the owner manage page so current live state and usage/quota are both
  legible:
  - live nodes;
  - public/community/private events visible to owner;
  - latest snapshot presence/freshness;
  - linked methodology/finding/field-log documents;
  - metered usage counters and warning status.
- Do not let usage counters visually imply "no live state" when detail data has
  nodes/events/snapshots. If both are shown, label them as different concepts:
  "Current observatory state" vs "Metered usage".
- Add concise owner copy that explains:
  - public observatory visitors see public/community-safe fields;
  - owner console may show raw operational data;
  - ingestion keys and credentials are never public;
  - usage counters are for quotas/accounting, not the same as the live story.
- Reuse existing helper functions where possible and add focused helper tests
  for current-state summaries, usage/readback copy, and mismatch-safe labels.
- If touching the manage page effects, remove the existing React hook dependency
  warning instead of carrying it forward.
- Keep desktop and `390px` mobile fit in mind.

## Non-Scope

- No hosted runtime.
- No new realtime infrastructure.
- No SSE/WebSocket protocol changes unless a tiny UI subscription bug is
  directly caused by this page.
- No ingestion API behavior changes.
- No usage/quota schema changes.
- No Developer Space public redesign.
- No visual editor expansion beyond owner readback labels.
- No export behavior change.
- No Project work or project-level ownership.
- No provider-policy behavior changes.
- No raw public payload expansion.
- No Redis, Cloudflare, worker, billing/quota plan changes, DexOS, or broad
  redesign.

## Acceptance

ARGUS can accept PR65 if:

- Owner manage remains owner-only and uses existing owner-scoped APIs.
- Current live state is distinct from metered usage/quota in the UI and helper
  copy.
- A live public observatory state cannot be misread as empty merely because a
  usage counter is zero or unavailable.
- Public/private boundary copy is accurate: visitors do not see ingestion keys,
  credentials, private archive text, prompts, unpublished notes, or raw owner
  console data.
- No API route behavior, schema, provider policy, hosted runtime, public raw
  expansion, Project, Redis, Cloudflare, worker, billing-plan, broad redesign,
  or DexOS scope is added.
- Desktop and narrow mobile layout risk is addressed.

## Validation

Run at minimum:

```bash
npm exec --yes pnpm@10.32.1 -- run test:developer-spaces
npm exec --yes pnpm@10.32.1 -- run test:exports
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

If the public observatory page or shared helper behavior changes materially,
also run:

```bash
npm exec --yes pnpm@10.32.1 -- run test:community
```

If a web build is run, record the known Windows standalone symlink `EPERM`
separately from compile/type/page-generation success.

## Handoff

Wake ARGUS with:

- exact files changed;
- current-state vs metered-usage labels/copy;
- any live-state/usage mismatch behavior;
- owner/public privacy boundary copy;
- whether the manage hook warning was removed;
- desktop/mobile fit notes if checked;
- validation results;
- scope confirmation that no hosted runtime, realtime protocol, ingestion API,
  schema, provider policy, public raw expansion, Project, Redis, Cloudflare,
  worker, billing, or DexOS work was added.

If ARGUS accepts, wake ARIADNE for signed owner UI rehearsal and wake MIMIR with
the review verdict. ARIADNE should check:

- signed owner Developer Space manage page;
- public observatory comparison if useful;
- current-state vs usage/quota readability;
- public/private boundary copy;
- live state with nodes/events/snapshot does not look empty;
- 390px layout with no horizontal overflow or offscreen controls;
- no ingestion key, credential, private archive text, prompt, unpublished note,
  raw private payload, or secret-shaped value visible in public-facing readback.

If blocked, wake MIMIR with the exact blocker. Do not leave the lane silent.

## DAEDALUS Implementation Result

Implemented as an owner-only readback improvement on the existing Developer
Space manage page.

- `Current observatory state` now comes from the existing owner-scoped detail
  route and shows live nodes, recent events, current snapshot availability,
  linked evidence, visitor-visible evidence, owner-only evidence, visibility,
  and latest activity.
- `Metered usage and quota` now comes from the existing owner-scoped usage route
  and shows warning status, metered nodes/events/snapshots/storage/public
  reads/exports, and mismatch copy when counters are unavailable or lagging.
- The existing Developer Space manage hook-dependency warning was removed.
- No API route behavior, schema, ingestion behavior, usage model, provider
  policy, public raw payload expansion, Project work, Redis, Cloudflare, hosted
  runtime, worker, billing-plan, DexOS, or broad redesign changed.

## ARGUS Review Result

Accepted on 2026-06-19.

- Confirmed live state and quota counters are labelled as separate concepts and
  sourced from existing owner-scoped APIs.
- Confirmed mismatch copy prevents live nodes/events/snapshots from reading as
  empty when usage counters are unavailable or lagging.
- Confirmed owner-only/private evidence readback is count-based and does not add
  private document bodies, raw event payloads, credentials, prompts, ingestion
  keys, or public raw payload expansion.
- Confirmed web lint no longer reports the Developer Space manage hook warning;
  remaining lint warnings are the pre-existing raw `<img>` warnings in Space and
  Discover.

ARGUS validation:

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:developer-spaces` | Pass | 13 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:exports` | Pass | 4 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:community` | Pass | 8 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck passed. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/web lint` | Pass with known warnings | Only pre-existing raw `<img>` warnings remain. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/web build` | Partial / known Windows failure | Next compiled successfully, linted/typechecked, collected page data, and generated 31 static pages, then failed during standalone traced-file symlink copy with Windows `EPERM`. |
