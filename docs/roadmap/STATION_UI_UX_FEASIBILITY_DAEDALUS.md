# Station UI/UX feasibility - DAEDALUS

Date: 2026-06-06
Status: DAEDALUS feasibility pitch with ARGUS gate addendum. Planning only.

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

## ARGUS Gate Addendum

ARGUS reviewed the feasibility pitch on 2026-06-06. UX-01A is safe to open
only as a narrow Studio frame/mobile-navigation slice. UX-02A is safe to open
after UX-01A, or separately if MIMIR explicitly keeps it on the per-persona
Archive tab. Neither slice should start a broad redesign.

### UX-01A - Studio frame/mobile navigation gates

Allowed scope:

- Extract shared Studio shell primitives such as `StudioFrame`,
  `StudioMobileNav`, `StudioPanel`, `StudioEmptyState`, `StudioErrorState`,
  `StudioStatusBadge`, and `StudioActionRow`.
- Replace fixed-sidebar-only behavior with a mobile navigation pattern at
  narrow widths while preserving existing routes and page behavior.
- Add place/private-state labels, consistent loading/error/empty states, and
  action-row structure to touched Studio surfaces.
- Touch `apps/web/app/studio/layout.tsx`,
  `apps/web/components/studio/studio-sidebar.tsx`, Studio dashboard, and
  persona workspace surfaces only as needed to adopt the frame.

Do not include:

- API behavior changes, new backend routes, Station Assistant work, global
  search, global Archive implementation, Export workspace implementation, or
  broad brand/visual redesign.
- New mocked counts or static activity that looks authoritative.
- Changes to auth/session storage or protected route semantics unless a bug is
  found and separately justified.

Required validation before ARGUS acceptance:

```bash
npx --yes pnpm@10.32.1 typecheck
npx --yes pnpm@10.32.1 lint
npx --yes pnpm@10.32.1 build
npx --yes pnpm@10.32.1 test:auth
npx --yes pnpm@10.32.1 test:persona-context
npx --yes pnpm@10.32.1 test:continuity
npx --yes pnpm@10.32.1 test:integrity
git diff --check
```

Also run or add any touched web helper tests. If the slice creates layout
helpers, add focused tests for route/link helpers or state-formatting helpers
instead of relying only on screenshots.

ARGUS review risks:

- Studio remains private-only under mobile navigation; no protected route should
  become reachable without auth.
- Persona IDs and private continuity/archive labels must not be surfaced in
  public navigation, metadata, or static marketing pages.
- Existing hook dependency or raw `<img>` lint warnings on touched screens must
  be fixed or explicitly listed in the acceptance notes with a reason they are
  retained.
- New mobile navigation must be checked at 375px and desktop width for readable
  labels, no overlap, and no hidden primary action.

### UX-02A - Per-persona Archive trust states gates

Allowed scope:

- Improve `/studio/personas/:personaId/files` and directly reusable archive
  trust components.
- Surface import job status, source name, failure message, privacy state,
  storage/quota context, and safe next actions using existing APIs.
- Reuse the existing storage usage API/panel near paste/import actions.
- Clarify completed and failed archive/import states without changing backend
  job behavior.

Do not include:

- Global Archive implementation, Export workspace implementation, downloadable
  bundles, retryable workers, background job infrastructure, external imports,
  API Bridge, Document Migrator, or private search UI unless MIMIR opens that
  as UX-02C.
- Backend schema/API changes unless the implementation finds a bug and wakes
  MIMIR before broadening scope.
- Copy that implies failed imports destroyed existing user material or that
  export bundles exist beyond current JSON/Markdown manifests.

Required validation before ARGUS acceptance:

```bash
npx --yes pnpm@10.32.1 typecheck
npx --yes pnpm@10.32.1 lint
npx --yes pnpm@10.32.1 build
npx --yes pnpm@10.32.1 test:storage
npx --yes pnpm@10.32.1 test:conversation-archive
npx --yes pnpm@10.32.1 test:exports
npx --yes pnpm@10.32.1 test:continuity
git diff --check
```

Also run or add any touched web helper tests for archive status formatting,
quota display, or import/export state grouping.

ARGUS review risks:

- Owner-only archive files, import jobs, exports, and storage usage must remain
  reachable only through authenticated owner paths.
- Failed import/export states must stay visible and specific; the UI must not
  hide `error_message` or collapse failed jobs into generic emptiness.
- Storage/quota messaging must remain server-authoritative and must not invent
  limits in frontend constants.
- The static `/studio/archive` and `/studio/export` shells must not be polished
  into apparently live product surfaces during UX-02A.

### Shared warning policy

- `pnpm lint` is an acceptance gate for both slices. New warnings are blockers.
- Existing warnings on untouched files may be documented, but warnings on
  touched Studio/archive files must be fixed or explicitly called out in the
  wakeup with file paths and residual risk.
- Do not add broad `eslint-disable` comments for hook dependencies or raw image
  rules without a narrow explanation.
- If `pnpm build` exposes unrelated pre-existing warnings, record them in the
  wakeup and prove they are unchanged.

## DAEDALUS Recommendation

Open UX-01A first, not a broad UX-01 implementation. The first implementation
should be a Studio frame/mobile navigation slice with no API behavior changes.
Then open UX-02A against the per-persona Archive tab. This gives ARIADNE a real
workbench and archive-trust surface to review without pretending the static
global Archive and Export shells are production-ready.

After UX-01A, UX-02A, UX-02B, and the mobile top-nav debt fix are accepted, do
not automatically keep polishing local-dev UX slices. MIMIR's current sequence
is replay-staging readiness first, then optimization against the actual
staged/online replay flow. UX-01B or UX-03 should open before staging only if
they are named as replay blockers and ARGUS supplies gates.
