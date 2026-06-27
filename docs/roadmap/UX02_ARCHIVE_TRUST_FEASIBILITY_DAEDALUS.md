# UX-02 - Archive Trust Feasibility And Reconciliation

Owner: DAEDALUS
Reviewer: MIMIR, then ARGUS/ARIADNE for the first implementation slice
Opened by: MIMIR
Status: OPEN
Date: 2026-06-27

## Why This Lane

UX-01A is accepted: Studio now has a clearer route-story and mobile workbench
readback. The next product pressure is Archive trust, because archive is the
continuity proof layer, not a storage sidebar.

UX-02 should make archive, import, export, storage, quota, provenance, failure,
and portability states legible before we add more polish.

This lane is feasibility and reconciliation only. DAEDALUS should inspect the
current checkout, classify what is already solved, and recommend the smallest
visible implementation slice.

## Current Evidence To Reconcile

Use current code as truth, and use older docs as evidence only:

- `docs/roadmap/STATION_UI_UX_ROADMAP.md`
- `docs/roadmap/UX01_STUDIO_IA_MOBILE_FEASIBILITY_RESULT.md`
- `docs/roadmap/STATION_UI_UX_FEASIBILITY_DAEDALUS.md`
- `docs/roadmap/PR264_PER_PERSONA_ARCHIVE_TRUST_STATES.md`
- `docs/roadmap/PR265_ARCHIVE_TRUST_REHEARSAL_ARIADNE.md`
- `docs/roadmap/PR266_POST_ARCHIVE_UX_LANE_SELECTION.md`
- `docs/roadmap/ARCHIVE_IMPORT_SOURCE_WORDING_ARIADNE.md`
- `docs/roadmap/LIVE_STAGING_REPLAY_REVIEW_ARIADNE.md`
- `docs/roadmap/STATION_LAUNCH_CORE_PATCH.md`

Do not assume old UX-02A/UX-02B notes are complete or stale. Inspect the current
routes/components and say which parts still hold.

## Surfaces To Map

Primary visible routes/components:

- `/studio/personas/[personaId]/files`
- `/studio/archive`
- `/studio/export`
- persona home export/readback sections where `ArchiveExportStatus` appears
- Studio sidebar storage/quota readback
- Settings storage usage readback if Archive copy depends on it

Likely frontend files:

- `apps/web/components/studio/archive-library.tsx`
- `apps/web/components/studio/archive-export-status.tsx`
- `apps/web/components/studio/export-workspace.tsx`
- `apps/web/components/studio/import-review-inbox.tsx`
- `apps/web/components/settings/storage-usage-panel.tsx`
- `apps/web/lib/archive-trust.ts`
- `apps/web/lib/archive-trust.test.ts`
- `apps/web/lib/export-trust.ts`
- `apps/web/lib/export-trust.test.ts`
- `apps/web/lib/archive-search.ts`
- `apps/web/app/studio/personas/[personaId]/files/page.tsx`
- `apps/web/app/studio/archive/page.tsx`
- `apps/web/app/studio/export/page.tsx`
- `apps/web/app/globals.css`

Backend/API surfaces may be named for gates, but should not be changed in this
feasibility lane:

- `/persona-files/persona/:personaId`
- `/persona-files/persona/:personaId/upload-url`
- `/persona-files/persona/:personaId/register`
- `/imports/persona/:personaId`
- `/imports/archive`
- `/imports/chat`
- `/exports/persona/:personaId`
- `/exports/:id`
- `/exports/:id/bundle`
- `/storage/me`

## Questions DAEDALUS Must Answer

1. What does the current per-persona Archive page already explain about
   owner-only sources, failed imports, completed imports, candidate review,
   storage/quota, upload/paste import, and export trust?
2. What does Global Archive currently explain about source types, owner-only
   visibility, search failure, empty states, and relation to per-persona
   Archive?
3. What does Export Workspace currently explain about JSON/Markdown manifests,
   portable bundles, owner-only access, missing original-file packaging, and
   future backup work?
4. Where do route labels, empty states, action labels, error states, progress
   states, and storage/quota readbacks conflict or feel thin?
5. Which gaps are cheap UI/copy/helper work, and which require backend/job/
   storage/export behavior changes?
6. Which existing tests already protect archive/export/storage boundaries, and
   which tests or browser checks would the first visible slice need?
7. What is the recommended next implementation lane after this feasibility pass?

## Product Constraints

- Archive is trust infrastructure.
- Import failure copy should say whether existing material remains safe.
- Storage/quota copy should be server-authoritative and not invent capacity.
- Export copy should preserve owner-only and portability boundaries without
  implying public downloads or full original-file backup if that is not true.
- Per-persona Archive, Global Archive, and Export Workspace must be related but
  distinct.
- Continuity can reference Archive evidence, but UX-02 should not become the
  Continuity/Integrity UX lane.
- Do not make Archive feel like a generic file manager or a fake activity feed.

## Hard Boundaries

Do not implement UI changes in this lane.

Do not change:

- storage accounting;
- Supabase upload/register behavior;
- import parser behavior;
- import candidate mutation behavior;
- export package assembly;
- public/community visibility;
- auth/session behavior;
- runtime retrieval/context behavior;
- provider/model/embedding behavior;
- Redis, Cloudflare, schema, migrations, workers, queues, Railway, or Supabase
  config.

If DAEDALUS finds a gap that requires any of those changes, classify it as a
deferred dependency or wake MIMIR with the exact reason.

## Required Output

Create a concise feasibility result that names:

- current Archive/export/storage route and component inventory;
- what is already solved versus stale from older UX-02 work;
- fragile boundaries around storage, owner-only exports, import jobs, candidate
  review, global search, quota, and public/private visibility;
- cheap first visible implementation slice;
- expensive/deferred work;
- ARGUS gates for the first implementation slice;
- ARIADNE desktop and 375px/390px review points;
- exact next owner/lane recommendation.

## Feasibility Validation

Docs-only feasibility can close with:

```bash
git diff --check
```

Run additional read-only commands if needed to inspect route/component
structure. Do not hide known build/lint caveats; classify them if relevant.

## Expected DAEDALUS Response

Wake MIMIR with:

- feasibility verdict;
- current-state map;
- recommended first implementation slice;
- ARGUS gates;
- ARIADNE review points;
- any hard blocker or config dependency.

Do not go quiet without a wakeup.
