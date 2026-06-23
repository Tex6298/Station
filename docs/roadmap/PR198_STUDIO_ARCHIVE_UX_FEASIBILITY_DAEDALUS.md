# PR198 - Studio and Archive UX Feasibility Map

Date opened: 2026-06-23
Opened by: A1 / MIMIR
Owner: DAEDALUS
Review path: MIMIR sequences; ARIADNE reviews human experience after a concrete
slice is proposed; ARGUS reviews only if implementation would touch auth,
visibility, owner/private data, billing, export, storage/quota, or public
surfaces
Status: complete

## Why This Lane

PR196 and PR197 closed the protected-alpha demo script path: Station is
demoable with the current route stack and spoken caveats. They did not justify
a new implementation blocker.

They did expose the next useful product problem: owner-side Studio, Memory,
Archive, Export, and Developer Space manage surfaces are long and dense. The
landing/Discover work is closer to the intended Discern-informed Station tone,
but the core owner workspace still risks reading like generic generated
dashboard UI unless the next UX pass is mapped carefully.

This lane starts UX-01 and UX-02 feasibility from
`docs/roadmap/STATION_UI_UX_ROADMAP.md`. It is not a broad reskin and not
permission to restyle the whole app at once.

## DAEDALUS Task

Map the frontend structure and propose the smallest evidence-backed
implementation sequence for:

- UX-01 Studio IA and mobile workbench:
  - Studio dashboard and left rail;
  - persona workspace shell;
  - Memory;
  - Continuity;
  - Integrity entry points;
  - Station Assistant placement;
  - 375px mobile usability.
- UX-02 Archive trust UX:
  - persona Archive/files;
  - Global Archive;
  - import/review states;
  - export status/readback;
  - storage/quota messaging;
  - provenance/privacy language.
- Adjacent density surfaces discovered by PR196:
  - Developer Space owner manage console;
  - Billing only as entitlement/status clarity, not broad billing redesign.

For each surface, identify:

- route and component files;
- shared layout/style components already available;
- fragile routing/auth/private-data boundaries;
- cheap copy/class/layout changes versus expensive component rewrites;
- mobile risks at 375px;
- likely tests and browser checks;
- whether ARIADNE or ARGUS must review before implementation;
- the smallest recommended first implementation slice.

## Design Direction

Use the Discern-informed Station direction without copying blindly:

- private Studio should feel like a calm, capable continuity workbench, not a
  generic SaaS dashboard;
- Archive should feel like trust infrastructure: preserved, private, portable,
  and explicit about failures;
- Continuity should be grounded and readable, not mystical and not a hidden
  Timeline alias;
- Developer Spaces should stay observatories, not generic dashboards;
- Billing should remain transparent and calm, with no pressure tricks;
- mobile layouts must preserve place, privacy state, and next action.

## Boundaries

Do not implement product UI in this lane unless MIMIR explicitly reopens scope.

Do not:

- change app code beyond a docs-only feasibility note;
- change routes, schema, migrations, Railway, Supabase, Stripe, Redis,
  Cloudflare, provider, worker, queue, auth/session, billing, or deployment
  config;
- mutate data, exports, imports, billing, Developer Space keys, cache, or
  provider state;
- commit screenshots, credentials, cookies, tokens, raw IDs, Checkout URLs,
  Stripe IDs, customer/subscription IDs, prompts, completions, private excerpts,
  raw corpus text, provider payloads, or private route bodies;
- reopen broad Discern parity or site-wide reskin.

Allowed:

- codebase inspection;
- docs-only feasibility map;
- sanitized route/component references;
- recommended first slice with exact scope and test gates.

## Expected Response

Wake MIMIR with:

- feasibility verdict;
- route/component map summary;
- top three cheap implementation slices, ranked;
- top risks and who must review them;
- recommended first slice and owner;
- validation run, at minimum `git diff --check`.

Do not go quiet without a wakeup.

## DAEDALUS Feasibility Result - 2026-06-23

Verdict: feasible as narrow UI/UX implementation slices. No backend route,
schema, migration, provider, billing, queue, cache, auth/session, deployment, or
data-model work is needed before MIMIR opens the first slice.

Important correction to the older June 6 feasibility note: main has moved on.
Studio now has a mobile Studio disclosure nav, a shared `StudioFrame`/panel
primitive set, Continuity as a first-class persona tab, memory lifecycle
readback, global owner Archive search, archive/import trust helpers, and
per-persona export readback. PR198 should therefore steer implementation toward
scan density, mobile place/next-action clarity, and trust-state grouping rather
than rebuilding the shell from scratch.

## Route and Component Map

### Studio shell and workbench chrome

- Routes/components:
  - `apps/web/app/studio/layout.tsx`
  - `apps/web/components/studio/studio-sidebar.tsx`
  - `apps/web/components/studio/studio-frame.tsx`
  - `apps/web/components/studio/studio-dashboard.tsx`
  - `apps/web/lib/studio-navigation.ts`
  - `apps/web/app/globals.css`
- Existing shared pieces:
  - `StudioFrame`, `StudioPanel`, `StudioEmptyState`, `StudioErrorState`,
    `StudioStatusBadge`, and `StudioActionRow`.
  - `studioWorkspaceLinks`, `studioPersonaWorkspaceTabs`, and
    `activeStudioHref`.
  - Desktop sticky sidebar plus mobile `<details>` navigation below 920px.
  - Sidebar footer already carries token and storage readbacks.
- Fragile boundaries:
  - `apps/web/lib/auth-routes.ts` protects `/studio`, `/billing`,
    `/settings`, `/projects`, owner Space manage routes, Developer Space manage
    routes, and forum creation. UX work should not change this unless MIMIR
    explicitly opens an auth lane.
  - `apps/web/components/nav/top-nav.tsx` restores session and redirects
    protected paths to `/login?redirect=...`; mobile route changes must preserve
    that behavior.
- Cheap changes:
  - Make current place, private state, and next action clearer in the Studio
    frame and mobile disclosure.
  - Tighten dashboard scan hierarchy and remove or clearly label derived
    dashboard stats.
  - Standardize page loading/error/empty states on `StudioFrame` primitives.
- Expensive changes:
  - True cross-persona command center, persistent assistant rail, or unified
    owner search across all Studio surfaces.

### Persona workspace, Memory, Continuity, and Integrity

- Routes/components:
  - `apps/web/app/studio/personas/[personaId]/page.tsx`
  - `apps/web/components/studio/persona-workspace.tsx`
  - `apps/web/components/studio/persona-management.tsx`
  - `apps/web/app/studio/personas/[personaId]/memory/page.tsx`
  - `apps/web/app/studio/personas/[personaId]/continuity/page.tsx`
  - `apps/web/components/studio/continuity-timeline.tsx`
  - `apps/web/components/studio/runtime-context-preview.tsx`
  - `apps/web/app/studio/personas/[personaId]/calibration/page.tsx`
  - `apps/web/components/studio/calibration-panel.tsx`
  - `apps/web/lib/memory-lifecycle-ui.ts`
  - `apps/web/lib/continuity-ui.ts`
  - `apps/web/lib/integrity-ui.ts`
- Existing shared pieces:
  - Persona tabs: Home, Continuity, Memory, Canon, Archive, Integrity.
  - Continuity cards count memory, canon, archive, Integrity, and continuity.
  - Memory route already shows briefing counts, runtime selected/held-out
    readback, lifecycle review, supersession, and owner-wide memory.
  - Continuity route already shows trust metrics, runtime context preview, and
    timeline creation.
- Fragile boundaries:
  - Dynamic persona routes fetch through the restored access token and should
    remain owner/private.
  - `ownerVisibleText` is already used on memory/archive cards; UI polish must
    not replace it with raw private excerpts in shared/public components.
- Cheap changes:
  - Add compact section anchors or a route-level "what changed / what to do
    next" strip for the longest Memory and Continuity pages.
  - Normalize the persona header/action area so users can move between Memory,
    Continuity, Archive, and Integrity without losing place on mobile.
  - Improve copy grouping around runtime preview versus saved state; do not
    alter retrieval ranking or memory truth.
- Expensive changes:
  - New retrieval controls, embedding/ranking changes, or combined
    memory/archive/continuity editor.

### Archive, import review, and export trust

- Routes/components:
  - `apps/web/app/studio/archive/page.tsx`
  - `apps/web/components/studio/archive-library.tsx`
  - `apps/web/app/studio/personas/[personaId]/files/page.tsx`
  - `apps/web/components/studio/import-review-inbox.tsx`
  - `apps/web/components/studio/archive-export-status.tsx`
  - `apps/web/app/studio/export/page.tsx`
  - `apps/web/components/studio/export-workspace.tsx`
  - `apps/web/components/settings/storage-usage-panel.tsx`
  - `apps/web/lib/archive-search.ts`
  - `apps/web/lib/archive-trust.ts`
  - `apps/web/lib/export-trust.ts`
  - `apps/web/lib/import-review.ts`
- Existing shared pieces:
  - Global Archive uses `/imports/archive` and `/imports/archive/search`
    through `archiveSearchPath`.
  - Persona Archive shows import status, import review candidates, storage
    usage, file/import cards, and per-persona export status.
  - Export helpers already distinguish completed, failed, requested, and
    processing package states without implying data loss.
  - `/studio/export` is still a planning/readback surface; it correctly says
    live export creation happens from persona workspaces.
- Fragile boundaries:
  - Owner-only archive results and export bundles must stay behind the Studio
    route and API token.
  - Export copy must keep saying per-persona JSON/Markdown manifest/bundle
    readback, not full workspace/PDF/binary export.
  - Storage/quota display must remain server-reported and must not invent local
    quota math.
- Cheap changes:
  - Reorder persona Archive into a clearer trust stack: privacy state, storage,
    import review, import source library, export readback.
  - Make global Archive filters/search explain when backend search is active
    and which source types are included.
  - Make `/studio/export` a simpler directory into live per-persona exports and
    future workspace export planning.
- Expensive changes:
  - Full workspace export, retryable background job UI, file downloads beyond
    current bundle readback, external connector imports, or new archive facets.

### Station Assistant placement

- Routes/components:
  - `apps/web/app/studio/assistant/page.tsx`
  - `apps/web/components/studio/station-assistant-panel.tsx`
  - `apps/web/lib/station-assistant-ui.ts`
- Existing shared pieces:
  - Summary/next-action route is already framed as operational, not a persona.
  - Starter prompts cover archive, imports, publishing, and continuity.
- Fragile boundaries:
  - Assistant must remain a platform helper. It should not create persona canon,
    continuity, provider claims, or public publishing claims.
- Cheap changes:
  - Better entry placement from Studio dashboard/sidebar and clearer "owner
    action router" language.
- Expensive changes:
  - Persistent assistant rail, streaming assistant UX, or new provider calls.

### Developer Space manage and Billing adjacency

- Routes/components:
  - `apps/web/app/developer-spaces/[slug]/manage/page.tsx`
  - `apps/web/lib/developer-space-observatory.ts`
  - `apps/web/lib/developer-space-visual-config.ts`
  - `apps/web/app/billing/page.tsx`
  - `apps/web/lib/billing-plan-actions.ts`
- Existing shared pieces:
  - Developer Space manage already separates public observatory link, owner
    ingestion keys, current state, usage/quota, live ingestion, Developer Agent
    preview/confirmations/receipts, visual mode, widgets, exports, and evidence
    path.
  - Billing already frames Stripe as test-mode handoff plus
    server-authoritative entitlement readback, and helper tests cover plan
    actions.
- Fragile boundaries:
  - Developer Space manage includes key rotation, evidence publishing,
    confirmation/receipt actions, export creation, and visual config mutation.
    A density pass must not fire those actions in tests or change public
    observatory output.
  - Billing UX work must not open Checkout/Portal during validation or imply
    live-money production readiness.
- Cheap changes:
  - Split the Developer Space manage page visually into stable owner sections
    with a local table of contents and clearer "public observatory vs owner
    controls" copy.
  - Add Billing status clarity only as entitlement/status copy and disabled or
    existing actions; no plan redesign.
- Expensive changes:
  - Breaking Developer Space manage into multiple routes, changing Agent action
    semantics, adding provider/repo/key automation, or billing flow changes.

## Mobile Risks at 375px

- Studio now has a mobile disclosure nav, but it is generic to Studio. The next
  pass should make the current persona/workspace stop obvious without opening a
  long panel.
- Persona tabs may wrap/compress when names or route labels are long. Keep tabs
  fixed-format or horizontally contained before adding more labels.
- Memory and Archive pages stack correctly in broad terms, but long cards,
  buttons, `details`, and inline controls can still become tiring to scan.
- Developer Space manage uses many auto-fit grids and inline flex rows, but the
  page is too long for mobile comprehension. A local section index is cheaper
  than a route split.
- Billing plan cards are readable enough for the demo path; the risk is
  overclaim, not layout.

## Ranked Implementation Slices

1. **UX-01A - Studio place and mobile workbench clarity.**
   Owner: DAEDALUS. Review: ARIADNE for human experience; ARGUS only if auth,
   route protection, owner/private fields, or public surfaces change.
   Scope: `studio-navigation.ts`, `studio-sidebar.tsx`, `studio-frame.tsx`,
   `studio-dashboard.tsx`, `persona-workspace.tsx`, and scoped CSS. Keep API
   calls and route semantics unchanged. Goal: every Studio route says where the
   user is, what privacy state applies, and what the next safe action is at
   desktop and 375px.

2. **UX-02A - Archive trust scan pass.**
   Owner: DAEDALUS. Review: ARIADNE; ARGUS if copy/fields touch export,
   storage, provenance, or owner/private boundaries.
   Scope: persona Archive/files, global Archive search/readback, export status,
   and storage usage placement. Reuse `archive-trust`, `export-trust`, and
   `import-review` helpers. Do not add jobs, retries, downloads, or new API
   shapes.

3. **UX-01B - Dense owner console grouping.**
   Owner: DAEDALUS. Review: ARIADNE for Developer Space manage readability;
   ARGUS only if Agent action, key, export, evidence publish, or public
   observatory behavior changes.
   Scope: Developer Space manage local navigation/section grouping and a tiny
   Billing entitlement-status clarity pass. Do not split routes or change
   action semantics in this slice.

Recommended first slice: UX-01A. It improves the shared owner workbench before
Archive and Developer Space manage get more polish, and it has the smallest
blast radius if it stays to layout/copy/classes with existing route helpers.

## Suggested Validation for First Slices

For UX-01A:

```bash
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run test:auth
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- run lint
npm exec --yes pnpm@10.32.1 -- run build
git diff --check
```

Add a 375px browser check for `/studio`, a persona workspace route, Memory,
Continuity, and persona Archive before ARIADNE accepts the slice.

For UX-02A:

```bash
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run test:storage
npm exec --yes pnpm@10.32.1 -- run test:conversation-archive
npm exec --yes pnpm@10.32.1 -- run test:exports
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- run lint
git diff --check
```

For UX-01B:

```bash
npm exec --yes pnpm@10.32.1 -- run test:developer-spaces
npm exec --yes pnpm@10.32.1 -- run test:billing
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- run lint
git diff --check
```

## PR198 Validation

- Code inspection only; no product UI, API, schema, migration, provider,
  billing, queue, cache, auth/session, deployment, import, export, key, or data
  mutation was performed.
- `git diff --check` passed.
- `git diff --cached --check` passed.
- Staged credential/raw-id pattern scan passed.
