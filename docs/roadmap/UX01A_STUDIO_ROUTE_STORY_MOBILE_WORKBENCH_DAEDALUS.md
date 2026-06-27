# UX-01A - Studio Route-Story And Mobile Workbench Readback

Owner: DAEDALUS
Reviewer: ARGUS first for implementation gates, then ARIADNE for visible review
Opened by: MIMIR
Status: READY FOR ARGUS REVIEW
Date: 2026-06-27

Result:
`docs/roadmap/UX01A_STUDIO_ROUTE_STORY_MOBILE_WORKBENCH_RESULT.md`

## Why This Lane

MIMIR accepts DAEDALUS's UX-01 feasibility result:
`docs/roadmap/UX01_STUDIO_IA_MOBILE_FEASIBILITY_RESULT.md`.

This is the first visible post-V3 UI/UX implementation slice. The goal is not
to redesign Studio. The goal is to make each private Studio stop answer four
questions quickly, including on mobile:

- where am I in Studio;
- what privacy or visibility boundary applies;
- what is saved, preserved, or owner-only here;
- what is the next useful action.

## Current-Checkout Evidence

Older UX-01A work exists and should be treated as evidence, not as the current
handoff:

- `docs/roadmap/PR199_UX01A_STUDIO_PLACE_MOBILE_WORKBENCH_DAEDALUS.md`
- `docs/roadmap/PR200_UX01A_STUDIO_WORKBENCH_REVIEW_ARIADNE.md`

Current checkout already appears to contain `studio-navigation.ts`,
`StudioPlaceStrip`, sidebar current-stop readbacks, persona workspace route
context, and related tests. DAEDALUS should inspect current main first and patch
only the gaps between current behavior and the UX-01 feasibility target.

Do not recreate old work just because this lane name resembles PR199/PR200.

## Scope

Implement or reconcile the Studio route-story/mobile workbench readback across
the current Studio surface.

Primary surfaces:

- `/studio`
- `/studio/personas/[personaId]`
- `/studio/personas/[personaId]/continuity`
- `/studio/personas/[personaId]/memory`
- `/studio/personas/[personaId]/canon`
- `/studio/personas/[personaId]/files`
- `/studio/personas/[personaId]/calibration`
- `/studio/archive`
- `/studio/assistant`
- `/studio/onboarding`

Secondary surfaces, only if the shared helper makes them nearly free:

- `/studio/export`
- `/studio/publish`
- `/studio/publishing`
- `/studio/notes`
- `/studio/new`
- `/studio/personas/[personaId]/edit`

Likely files to inspect before editing:

- `apps/web/lib/studio-navigation.ts`
- `apps/web/lib/studio-navigation.test.ts`
- `apps/web/components/studio/studio-frame.tsx`
- `apps/web/components/studio/studio-sidebar.tsx`
- `apps/web/components/studio/studio-dashboard.tsx`
- `apps/web/components/studio/persona-workspace.tsx`
- `apps/web/app/studio/**`
- `apps/web/app/globals.css`

## Implementation Goals

- Reuse existing Studio helpers and route metadata where possible.
- Keep route-story copy short, concrete, and Station-native.
- Make desktop and 375px/390px mobile show or immediately expose current stop,
  privacy state, saved/preserved state, and next action.
- Preserve existing tabs, links, API calls, and data-loading behavior.
- Lightly include UX-02 archive-trust readback where Studio already shows
  Archive, Runtime Context, Continuity, or Export status.
- Keep Archive distinctions clear: per-persona Archive, global Archive, and
  Export Workspace are related but not the same place.
- Keep the tone private, calm, capable, and close to the user's work.

## Hard Boundaries

Do not change:

- auth/session behavior;
- protected-route redirects;
- API route contracts;
- Supabase storage upload behavior;
- archive import parser behavior;
- export package behavior;
- runtime context selection/redaction behavior;
- chat/model/provider behavior;
- billing, Stripe, Redis, Cloudflare, schema, migration, worker, queue, Railway,
  or Supabase config;
- public/community route behavior.

Do not broaden into a global visual redesign, public Discover/forums redesign,
Developer Space observatory redesign, Billing UX, onboarding rewrite, or
generic Discern parity.

If implementation pressure reaches any boundary above, stop and wake MIMIR with
the exact reason.

## ARGUS Gates

Run the focused gates that match touched surfaces. Expected minimum:

```bash
git diff --check
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run test:auth
npm exec --yes pnpm@10.32.1 -- run test:persona-context
npm exec --yes pnpm@10.32.1 -- run test:continuity
npm exec --yes pnpm@10.32.1 -- run test:integrity
npm exec --yes pnpm@10.32.1 -- run test:conversation-archive
npm exec --yes pnpm@10.32.1 -- run test:exports
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- run lint
npm exec --yes pnpm@10.32.1 -- run build
```

Add `test:assistant` if Assistant layout/copy is touched. Add `test:storage`
only if per-persona Archive upload/storage copy or storage quota behavior is
touched.

ARGUS should specifically check:

- unauthenticated protected Studio routes still redirect safely;
- no private/persona/archive/runtime/source text appears on public routes;
- Runtime Context redaction and compiled-prompt hiding rules are unchanged;
- archive import and export actions remain owner-only;
- 375px and 390px mobile have no horizontal overflow, clipping, or overlapped
  action text;
- any existing lint/build warning is named as pre-existing or fixed.

## ARIADNE Review Points

After ARGUS accepts the implementation boundary, wake ARIADNE for a human-eye
review across desktop, 375px, and 390px:

- `/studio`
- `/studio/personas/[personaId]`
- `/studio/personas/[personaId]/continuity`
- `/studio/personas/[personaId]/memory`
- `/studio/personas/[personaId]/files`
- `/studio/personas/[personaId]/calibration`
- `/studio/archive`
- `/studio/assistant`
- `/studio/onboarding`

Review questions:

- Does the page clearly read as private Studio work?
- Does the user know the current stop, privacy state, saved/preserved state,
  and next useful action without hunting?
- Does mobile keep route identity and the first safe action visible or
  immediately reachable?
- Does the result feel like Station's private continuity workbench rather than
  generic dashboard decoration?
- Are Archive and runtime-context explanations precise without becoming
  frightening or magical?

## Expected DAEDALUS Response

Wake ARGUS with:

- implementation summary;
- exact files touched;
- current-checkout gaps found before patching;
- validation results;
- desktop and 375px/390px route notes;
- whether ARIADNE can review next or whether MIMIR must decide a scope issue;
- any UX-02 archive-trust follow-up that should become the next lane.

Do not go quiet without a wakeup. If no code changes are needed because current
main already satisfies the lane, prove that with route/test evidence and wake
ARGUS with a no-op acceptance recommendation.
