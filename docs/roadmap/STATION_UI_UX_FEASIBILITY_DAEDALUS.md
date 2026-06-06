# Station UI/UX feasibility - DAEDALUS

Date: 2026-06-06
Status: DAEDALUS feasibility pitch for MIMIR. Planning only.

## Scope

This review covers only:

- UX-01 Studio IA and mobile workbench.
- UX-02 Archive trust UX.

No UI implementation, backend implementation, staging work, or broad redesign
was done.

## Current frontend truth

- Studio has real protected routes for the dashboard, persona workspace, chat,
  memory, canon, archive imports, continuity timeline, Integrity Sessions,
  publishing, and persona export history.
- The per-persona workspace is the most honest place to begin because it already
  calls the live API surfaces for personas, conversations, memory, canon,
  imports, exports, continuity, integrity, storage, and token usage.
- `/studio/archive` and `/studio/export` are still mostly static shells. They
  are useful IA prototypes, but they should not be polished as if they were live
  archive/export products.
- The Studio layout uses a fixed sticky sidebar and many inline style objects.
  Content grids collapse below 920px, but the Studio sidebar itself does not yet
  have a mobile drawer, top switcher, or compact navigation pattern.
- Multiple Studio pages hand-roll session restore, API loading, error states,
  and `StudioMessage` fallbacks. That makes polish risky because the same UX fix
  would need to be repeated across routes.

## UX-01 Cheap Work

- Extract a shared Studio page frame from the existing layout/sidebar/dashboard
  conventions: place label, private-state label, loading/error/empty surface,
  and action row.
- Add a mobile navigation treatment for Studio before touching page polish:
  collapse the fixed sidebar into a compact top selector or drawer under 920px.
- Keep the existing persona tabs and continuity cards, but make them the mobile
  anchor for the workbench: Home, Timeline, Memory, Canon, Archive, Integrity.
- Replace misleading static dashboard counts/activity with either live data that
  already exists or clearly labelled empty states.
- Standardise private copy and next actions across Studio dashboard, persona
  home, memory, canon, archive, continuity, and Integrity screens.
- Extract repeated cards/status rows into small components before visual polish:
  `StudioPanel`, `StudioEmptyState`, `StudioStatusBadge`, `StudioActionRow`,
  and `StudioEntityList`.

## UX-01 Expensive Work

- A true cross-persona command center with recent chats, archive items,
  continuity changes, and search across all personas needs more consolidated API
  shape than the frontend currently has.
- A persistent Station Assistant panel would need product and route boundaries:
  it should guide platform work without becoming a persona chat surface.
- Full Studio search over personas, chat history, archive, memory, canon, and
  documents is now API-plausible after V3-05, but the frontend still needs a
  careful destination and result-type model.
- Rich mobile workbench behavior, such as split panes, persistent composer,
  bottom tabs, and route-preserving drawers, should wait until the frame is
  extracted.

## UX-02 Cheap Work

- Start with the per-persona Archive tab at
  `/studio/personas/:personaId/files`, not the global Archive page.
- Add trust copy around import jobs: status, failure message, source name,
  privacy, storage impact, and what remains safe when an import fails.
- Reuse the existing storage usage panel near archive/import actions so users
  see quota before pasting large material.
- Extract the persona export package list from the persona home into a reusable
  `ExportPackageList` or `ArchiveExportStatus` component.
- Show failed/completed export status plainly using the V3-04 `errorMessage`,
  `status`, `completedAt`, and manifest readback fields.
- Add an archive search entry only after MIMIR decides whether the first UI slice
  should surface the V3-05 `privateResults` bucket in Studio.

## UX-02 Expensive Work

- A real global archive at `/studio/archive` needs a live owner-scoped archive
  index across personas, files, import jobs, archived chats, memory, canon,
  continuity records, documents, and exports. That is more than a styling task.
- Downloadable export bundles, binary/PDF packaging, retryable job progress,
  and background worker status should remain deferred unless MIMIR opens a
  backend lane.
- API Bridge, Document Migrator, external connector imports, and upload
  processing are onboarding/import product lanes, not a quick Archive polish
  pass.
- Archive faceting across all content types will need a typed result model and
  likely additional UI helper tests before it is safe.

## Fragile Areas

- `apps/web/app/studio/layout.tsx` and
  `apps/web/components/studio/studio-sidebar.tsx`: fixed sidebar and inline
  styling need a mobile nav decision before Studio can be called mobile-ready.
- `apps/web/components/studio/studio-dashboard.tsx`: some counts/activity are
  derived or static, so a polish pass could accidentally make mock data look
  authoritative.
- `apps/web/app/studio/personas/[personaId]/page.tsx`: persona home mixes chat,
  runtime context preview, exports, published documents, and data fetching in
  one large route component.
- `apps/web/app/studio/archive/page.tsx` and
  `apps/web/components/studio/archive-library.tsx`: global archive is static
  sample data.
- `apps/web/app/studio/export/page.tsx` and
  `apps/web/components/studio/export-workspace.tsx`: workspace export is static
  sample data and describes background job behavior that is not implemented for
  that surface.
- Per-persona memory, canon, files, continuity, and calibration pages duplicate
  session/load/error patterns.
- Known React hook dependency and raw-image warnings should become explicit
  ARGUS gates when touched; do not bury them under visual polish.

## Refactors Before Polish

- Create shared Studio shell primitives before changing layouts broadly:
  `StudioFrame`, `StudioMobileNav`, `StudioPanel`, `StudioEmptyState`,
  `StudioErrorState`, `StudioStatusBadge`, and `StudioActionRow`.
- Move repeated inline layout styles into stable CSS classes or small
  components so mobile fixes can be applied once.
- Keep data fetching inside route-level client components for now, but extract
  tiny hooks only where the same API state is repeated across three or more
  Studio screens.
- Keep archive/export trust components separate from visual decoration: status,
  privacy, provenance, quota, failure, and next action should be first-class
  props.

## Recommended Slice Order

1. UX-01A - Studio frame and mobile nav feasibility implementation.
   Extract shared frame components, add mobile navigation, keep page behavior
   unchanged, and validate with `pnpm typecheck`, `pnpm lint`, and touched web
   helper tests.
2. UX-01B - Persona workspace IA cleanup.
   Reorder existing persona workspace sections for private workbench clarity,
   standardise empty/error copy, and keep API calls unchanged.
3. UX-02A - Per-persona Archive trust states.
   Improve `/studio/personas/:personaId/files` with storage/quota context,
   import status/error explanations, and archive privacy copy.
4. UX-02B - Persona export status extraction.
   Move export package history into a reusable component with failed/completed
   states and manifest readback clarity.
5. UX-02C - Studio private search entry.
   If MIMIR wants search surfaced now, consume V3-05 `privateResults` in a
   Studio/archive search panel with explicit private-only labelling.
6. Defer global Archive and Export workspace implementation until MIMIR opens a
   backend/API shape decision for owner-wide archive and workspace exports.

## Suggested ARGUS Gates

- For UX-01A/UX-01B: `pnpm typecheck`, `pnpm lint`,
  `pnpm test:persona-context`, `pnpm test:continuity`, `pnpm test:integrity`,
  and any touched web helper tests.
- For UX-02A/UX-02B: `pnpm typecheck`, `pnpm lint`, `pnpm test:storage`,
  `pnpm test:conversation-archive`, `pnpm test:exports`, and any touched web
  helper tests.
- For UX-02C: add web helper tests around private search result grouping and run
  `pnpm test:community` to keep V3-05 leak checks green.

## DAEDALUS Recommendation

Open UX-01A first, not a broad UX-01 implementation. The first implementation
should be a Studio frame/mobile navigation slice with no API behavior changes.
Then open UX-02A against the per-persona Archive tab. This gives ARIADNE a real
workbench and archive-trust surface to review without pretending the static
global Archive and Export shells are production-ready.
