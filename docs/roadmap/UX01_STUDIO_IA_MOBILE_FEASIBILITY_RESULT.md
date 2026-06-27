# UX-01 - Studio IA And Mobile Workbench Feasibility Result

Date: 2026-06-27
Owner: DAEDALUS / A2
Reviewer: MIMIR, then ARGUS and ARIADNE for implementation gates
Status: complete - feasibility only

## Scope

Reviewed:

- `docs/roadmap/UX01_STUDIO_IA_MOBILE_FEASIBILITY_DAEDALUS.md`
- `docs/roadmap/STATION_UI_UX_ROADMAP.md`
- `apps/web/app/studio/**`
- `apps/web/components/studio/**`
- `apps/web/components/nav/top-nav.tsx`
- `apps/web/lib/studio-navigation.ts`
- Studio-adjacent UI helpers for archive, export, continuity, memory,
  integrity, assistant, auth routes, and API calls.

No UI, API, schema, provider, archive/import, billing, runtime, Redis,
Cloudflare, queue, worker, hosted-chat, or public/community behavior changed.

## Verdict

UX-01 is feasible as a narrow visible implementation slice without redesigning
Studio or touching backend contracts.

Recommended next slice:

```text
UX-01A - Studio route-story and mobile workbench readback
```

The first visible slice should make each private Studio stop answer four
questions before visual polish begins:

- where am I in Studio;
- what privacy or visibility boundary applies;
- what is saved, preserved, or owner-only here;
- what is the next useful action.

This can be built mostly on the existing `studio-navigation.ts`,
`StudioFrame`, `StudioPlaceStrip`, `StudioSidebar`, and
`PersonaWorkspaceHeader` surfaces. It should not change chat, archive import,
export, continuity, memory, canon, Integrity, Assistant, or auth API contracts.

## Route And Component Inventory

Current Studio routes:

- `/studio`: private dashboard; loads `/personas` and `/integrity/due`; uses
  `StudioDashboard`, `StudioFrame`, `StudioPlaceStrip`, dashboard panels, and
  signed-out auth copy.
- `/studio/personas/[personaId]`: persona home; loads persona, documents, and
  export manifests; renders `PersonaWorkspaceHeader`, `ContinuityCards`,
  `PublicInteractionReadback`, `PersonaChat`, `RuntimeContextPreview`,
  `ArchiveExportStatus`, and published-continuity history.
- `/studio/personas/[personaId]/continuity`: continuity review; renders the
  persona header, continuity cards, trust overview, runtime provenance
  readback, runtime context preview, and `ContinuityTimeline`.
- `/studio/personas/[personaId]/memory`: memory lifecycle and runtime
  explanation; loads persona, memory, briefing, and context-preview state.
- `/studio/personas/[personaId]/canon`: canon editor/list with publish action.
- `/studio/personas/[personaId]/files`: per-persona Archive; loads persona
  files, import jobs, import candidates, and export manifests; includes
  storage/quota, import pipeline, review inbox, upload, pasted import, source
  library, and export trust.
- `/studio/personas/[personaId]/calibration`: Integrity Session flow and
  review timeline.
- `/studio/personas/[personaId]/edit`: persona edit surface.
- `/studio/archive`: global owner archive search via `ArchiveLibrary`.
- `/studio/export`: global export/backup readback via `ExportWorkspace`.
- `/studio/assistant`: Station Assistant via `StationAssistantPanel`.
- `/studio/new`: persona setup via `AwakeningFlow`.
- `/studio/notes`: private notes via `NotesScratchpad`.
- `/studio/onboarding`: path selection via `StudioFrame` and onboarding helper
  cards.
- `/studio/publish` and `/studio/publishing`: document publishing flow and
  publishing dashboard.

Shared navigation and frame surfaces:

- `StudioLayout` wraps all `/studio` routes with `StudioSidebar`.
- `StudioSidebar` owns desktop rail, mobile details navigation, persona list,
  current-route context, token usage, storage usage, and Assistant link.
- `studio-navigation.ts` centralizes static route context, persona tab labels,
  persona primary actions, bounded active-route matching, and signed mobile
  top-nav route pressure.
- `TopNav` keeps public routes in the main nav and signed-in private routes in
  the auth/account route set, with protected-route redirect through
  `isProtectedRoute`.
- `StudioFrame`, `StudioPanel`, `StudioPlaceStrip`, `StudioEmptyState`,
  `StudioErrorState`, `StudioStatusBadge`, and `StudioActionRow` are already
  available but not uniformly used across Studio.

## Fragile Boundaries

- Studio has mixed layout idioms. The dashboard and onboarding use
  `StudioFrame`; persona tabs mostly use `main.container studio-workspace`;
  global archive/export use inline full-page styles; Assistant, Notes, New
  Persona, Publish, and Publishing own their own wrappers.
- Loading, signed-out, and error states are inconsistent across pages. Auth
  protection is centralized in `TopNav` and `isProtectedRoute`, but individual
  Studio pages still each decide how to handle a missing session.
- Most Studio pages fetch owner data client-side with `getSession()` and
  `apiGet`/`apiPost`/`apiPatch`. UX work should not consolidate auth or data
  loading in this slice.
- `RuntimeContextPreview` can show source content and a redacted compiled
  prompt by default. Any layout/copy work around it needs ARGUS redaction and
  private-source review.
- The per-persona Archive page directly creates a Supabase browser storage
  client for signed uploads. UX-01 should avoid touching upload/storage
  behavior.
- Mobile Studio navigation already exists, but current route story, privacy
  readback, saved/preserved state, and next action are split across the rail,
  page header, and page body.
- The existing sidebar has a dense owner-console shape. Broad grouping,
  left-rail redesign, or replacing the mobile details control would expand the
  slice beyond feasibility.

## Cheap First Slice

Open `UX-01A - Studio route-story and mobile workbench readback`.

Recommended implementation shape:

- Extend `studio-navigation.ts` with a small route-story model for existing
  static Studio stops and persona tabs: place label, privacy readback,
  preserved/saved readback, and primary next action.
- Reuse `StudioPlaceStrip` or a tiny companion component so core Studio pages
  show a consistent route story without refactoring data fetches.
- Keep the mobile details navigation, but make the current route summary and
  the first safe action obvious at 375px and 390px.
- Apply the first pass to `/studio`, persona home, Continuity, Memory, Canon,
  per-persona Archive, Integrity, global Archive, Assistant, and Onboarding.
- Treat global Export and Publishing as secondary stops in this slice unless
  the shared helper makes them nearly free.
- Add or update helper tests in `apps/web/lib/studio-navigation.test.ts`.

This should be visible enough for ARIADNE while staying boring enough for
ARGUS: no API shape changes, no storage upload change, no archive parser
change, no chat runtime change, no auth semantics change.

## Expensive Or Deferred Work

Defer:

- broad Studio redesign or a new information architecture shell;
- replacing the desktop rail or mobile navigation pattern;
- consolidating client auth/data loading into shared hooks or server loaders;
- changing chat/runtime context layout beyond route-story framing;
- global Archive search redesign, import parser progress redesign, export job
  UX redesign, storage/quota/billing copy expansion, or backup packaging;
- assistant strategy, onboarding flow, publishing dashboard, or persona edit
  redesign;
- browser/staging review until implementation exists.

## API And Data Surfaces

First-slice implementation should read existing frontend state only.

Surfaces to avoid changing:

- `/auth/me`, stored session, protected-route redirects, and bearer-token API
  calls.
- `/personas`, `/personas/:id`, `/integrity/due`, `/integrity/*`.
- `/memory/persona/:id`, `/memory/persona/:id/briefing`, `/canon/persona/:id`.
- `/continuity/persona/:id/records`, `/conversations/persona/:id`,
  `/conversations/persona/:id/context-preview`.
- `/persona-files/persona/:id`, `/imports/persona/:id`, `/imports/chat`,
  signed upload URL/register paths, and Supabase storage upload.
- `/exports/persona/:id`, `/exports/:id`, `/exports/:id/bundle`.
- `/assistant/summary` and `/assistant/message`.
- `/documents`, `/spaces`, publishing approvals, and public/community routes.

## ARGUS Gates

For UX-01A implementation, require:

- `git diff --check`
- `pnpm build`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test:auth`
- `pnpm test:studio-ui`
- `pnpm test:persona-context`
- `pnpm test:continuity`
- `pnpm test:integrity`
- `pnpm test:conversation-archive`
- `pnpm test:exports`
- `pnpm test:assistant` if Assistant copy/layout is touched
- `pnpm test:storage` only if per-persona Archive upload/storage copy or
  storage quota behavior is touched

ARGUS should specifically check:

- protected `/studio` routes still redirect unauthenticated users safely;
- no private/persona/archive/runtime/source text appears on public routes;
- `RuntimeContextPreview` redaction and compiled-prompt hiding rules stay
  unchanged for touched pages;
- archive import and export actions remain owner-only;
- no new mobile horizontal overflow or text clipping appears at 375px/390px;
- known lint/build warnings are either fixed in touched screens or carried as
  explicit residual risk.

## ARIADNE Review Points

ARIADNE should review desktop plus 375px and 390px mobile for:

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

- Does the page clearly say this is private Studio work?
- Does the user know the current stop, privacy state, preserved/saved state,
  and next action without reading the whole page?
- Does mobile keep route identity and the first safe action visible or
  immediately reachable?
- Does the tone feel like Station's private continuity workbench rather than a
  generic dashboard?
- Are Archive and runtime-context explanations precise without becoming
  frightening or magical?

## UX-02 Archive Trust Dependencies

Include lightly in UX-01A:

- per-persona Archive readback that says source material is owner-only;
- links or labels that distinguish per-persona Archive, global Archive, and
  Export Workspace;
- existing storage/quota and export-trust readbacks where they already render;
- source/provenance readback already present in Runtime Context and Continuity.

Explicitly defer to UX-02:

- full Archive import/export IA;
- job progress and failure-state redesign;
- storage/quota/billing copy expansion;
- global Archive search grouping redesign;
- backup/export packaging UX;
- any parser, storage, export, or quota behavior changes.

## Recommended Handoff

Wake MIMIR.

Recommended MIMIR decision:

- Open `UX-01A - Studio route-story and mobile workbench readback` for
  DAEDALUS implementation.
- Keep ARGUS as the implementation gate because auth, private route visibility,
  archive, export, runtime-context, and mobile overflow are all nearby.
- Send the visible slice to ARIADNE after ARGUS accepts the technical boundary.
- Keep UX-02 as the next archive-trust lane after UX-01A unless MIMIR chooses a
  smaller archive-only feasibility pass first.
