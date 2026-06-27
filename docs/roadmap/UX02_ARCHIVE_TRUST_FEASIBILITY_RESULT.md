# UX-02 Archive Trust Feasibility Result

Owner: DAEDALUS
Reviewer: MIMIR, then ARGUS/ARIADNE for any implementation slice
Status: COMPLETE - WAKE MIMIR
Date: 2026-06-27

## Verdict

UX-02 feasibility is complete. There is no implementation blocker, but the
current main branch has moved beyond the older UX-02 notes.

Current code already covers more Archive trust ground than the old plan
assumed: per-persona Archive trust states, import source wording, live
owner-scoped Global Archive search, storage/quota readback, and scoped export
package readback all exist.

Recommended next lane:

```text
UX-02C - Global Archive trust readback and rehearsal
```

This should be a narrow visible slice, not a backend/storage/export rewrite.
The point is to make `/studio/archive` clearly relate to per-persona Archive,
storage/quota, and Export Workspace on desktop and 375px/390px mobile.

## Current Inventory

Per-persona Archive:

- Route: `/studio/personas/[personaId]/files`
- Main file: `apps/web/app/studio/personas/[personaId]/files/page.tsx`
- Supporting components/helpers:
  - `apps/web/components/studio/import-review-inbox.tsx`
  - `apps/web/components/studio/archive-export-status.tsx`
  - `apps/web/components/settings/storage-usage-panel.tsx`
  - `apps/web/lib/archive-trust.ts`
  - `apps/web/lib/export-trust.ts`
- Current behavior: owner-only pasted/file source material, import jobs,
  processing/failed/ready state rows, server storage/quota readback, upload and
  paste import forms, candidate review, and per-persona export package status.

Global Archive:

- Route: `/studio/archive`
- Main files:
  - `apps/web/app/studio/archive/page.tsx`
  - `apps/web/components/studio/archive-library.tsx`
  - `apps/web/lib/archive-search.ts`
- Current behavior: live authenticated owner-scoped Archive overview/search via
  `/imports/archive` and `/imports/archive/search`, grouped readback for source
  type/status/persona, warning copy for partially unsearchable sources, and
  owner-only empty states.

Export Workspace:

- Route: `/studio/export`
- Main files:
  - `apps/web/app/studio/export/page.tsx`
  - `apps/web/components/studio/export-workspace.tsx`
  - `apps/web/lib/export-trust.ts`
- Current behavior: honest trust map for live scoped packages, preview global
  export work, and future backup/original-file packaging. It does not pretend a
  global managed backup exists.

Persona home export readback:

- Route: `/studio/personas/[personaId]`
- Main file: `apps/web/app/studio/personas/[personaId]/page.tsx`
- Current behavior: renders `ArchiveExportStatus` so persona export status is
  visible outside the Archive tab as well.

Storage/quota readback:

- Components:
  - `apps/web/components/settings/storage-usage-panel.tsx`
  - `apps/web/components/studio/studio-sidebar.tsx`
  - `apps/web/app/settings/page.tsx`
- Current behavior: uses `/storage/me` with the current authenticated session
  and keeps quota categories server-authoritative. It appears in Settings, Studio
  sidebar, and the per-persona Archive tab.

Backend/API surfaces named as gates only:

- `/persona-files/persona/:personaId`
- `/persona-files/persona/:personaId/upload-url`
- `/persona-files/persona/:personaId/register`
- `/imports/persona/:personaId`
- `/imports/archive`
- `/imports/archive/search`
- `/imports/chat`
- `/exports/persona/:personaId`
- `/exports/:id`
- `/exports/:id/bundle`
- `/storage/me`

## Solved Or Current

- UX-02A per-persona Archive trust states are current. The Archive tab explains
  pasted/file import sources, failed imports, processing imports, existing
  material safety, server storage/quota, and owner review before material moves
  into Memory/Canon.
- UX-02B persona export status is current. `ArchiveExportStatus` creates scoped
  persona packages, reads manifests/bundles, and distinguishes completed,
  failed, and in-progress exports without implying public download URLs.
- Archive import source wording is accepted. The UI distinguishes pasted/file
  import sources from archived chats and other archive-backed runtime material.
- Global Archive is not a static placeholder anymore. It is a live owner-only
  overview/search surface backed by `/imports/archive` and
  `/imports/archive/search`.
- Export Workspace is honest but limited. It accurately names live scoped
  packages, preview global export work, and future backup/original-file work.
- Tests already cover important trust helpers:
  - `apps/web/lib/archive-trust.test.ts`
  - `apps/web/lib/export-trust.test.ts`
  - `apps/api/src/routes/storage.test.ts`
  - `apps/api/src/routes/conversation-archive.test.ts`
  - `apps/api/src/routes/archive-retrieval.test.ts`
  - `apps/api/src/routes/exports.test.ts`

## Stale Evidence

- Older feasibility notes that describe Global Archive and Export Workspace as
  mostly static shells are stale for Global Archive. The current Global Archive
  is live owner-scoped search/readback.
- Older UX-02A/UX-02B lane notes are useful evidence, not active work. Their
  main outcomes are already present in current code.
- The UX-02 handoff listed a few old evidence filenames without their current
  suffixes. The current repository files use names such as
  `PR264_PER_PERSONA_ARCHIVE_TRUST_STATES_DAEDALUS.md` and
  `PR266_POST_ARCHIVE_UX_LANE_SELECTION_DAEDALUS.md`.
- Older generic lint/build warnings in planning docs should not be treated as
  current failures unless ARGUS reproduces them on the first implementation
  slice.

## Fragile Boundaries

- Global Archive is newer than the old UX-02A/UX-02B acceptance trail. It needs
  a current visible review as a live owner-wide trust surface.
- The relationship between per-persona Archive, Global Archive, Export
  Workspace, and storage/quota is mostly explained by copy today. A user may
  still need a clearer route-story readback to understand what each surface is
  for.
- Storage/quota is server-authoritative, but the compact/sidebar readback is
  thin. Archive-specific full/quota/error states should not invent capacity or
  imply data loss.
- Export Workspace is a trust map, not a global export job. It must not be
  polished into language that implies complete backup coverage before that
  behavior exists.
- Import parser, upload/register, candidate mutation, storage accounting, and
  export package assembly are real behavior boundaries with tests. They should
  stay out of the first visible UX slice unless MIMIR explicitly opens backend
  work.
- Build validation still has a known local Windows standalone symlink caveat
  from recent UX-01A review. That is not caused by this docs-only pass.

## Cheap First Slice

Recommended slice:

```text
UX-02C - Global Archive trust readback and rehearsal
```

Suggested scope:

- Keep backend/API behavior unchanged.
- Keep upload/register, storage accounting, import parsing, candidate mutation,
  export assembly, auth/session, runtime retrieval, providers, queues, Redis,
  Railway, Cloudflare, Supabase config, schema, and migrations unchanged.
- Tighten `/studio/archive` only where current copy or helper readbacks are
  unclear.
- Make Global Archive explicitly distinct from:
  - per-persona Archive: source intake and persona-local import review;
  - Export Workspace: portability/package readback;
  - Storage/quota: server-reported capacity and safety limits.
- Preserve current owner-only, failed-safe, no-fake-activity language.
- Add or extend helper tests only if copy/helpers change.
- Get ARIADNE desktop and 375px/390px review after ARGUS accepts the technical
  boundary.

## Deferred Work

These should stay out of UX-02C:

- storage accounting changes;
- Supabase upload/register behavior;
- import parser behavior;
- import candidate mutation;
- export package assembly;
- full global export job;
- original-file/PDF/binary backup packaging;
- background workers, queues, Redis, and retry semantics;
- public/community visibility changes;
- auth/session changes;
- runtime retrieval/context changes;
- provider/model/embedding changes;
- Railway, Cloudflare, Supabase config, schema, or migration work.

## ARGUS Gates For UX-02C

Minimum gates if UX-02C only touches Global Archive/UI helper copy:

- `git diff --check`
- added-line sensitive-pattern scan
- `pnpm test:studio-ui`
- `pnpm test:conversation-archive`
- `pnpm test:exports`
- `pnpm typecheck`
- `pnpm lint`

Add these if the slice touches the corresponding boundaries:

- `pnpm test:storage` for storage/quota/readback changes
- `pnpm test:community` for public/discover/forum visibility touchpoints
- `pnpm test:auth` for session or auth copy/control changes
- `pnpm build`, with the existing local Windows standalone symlink caveat
  documented if it reproduces after compile/static generation

ARGUS should specifically check that anonymous users and other owners do not
gain any path to private Archive rows, source names, import errors, storage
paths, manifests, or bundle contents.

## ARIADNE Review Points

Review after ARGUS accepts the technical boundary:

- desktop `/studio/archive`
- 375px `/studio/archive`
- 390px `/studio/archive`
- `/studio/personas/[personaId]/files`
- `/studio/export`
- persona home export status
- Studio sidebar storage readback
- Settings storage usage if copy is touched

Visible questions:

- Can a user tell whether they are looking at per-persona Archive, Global
  Archive, Export Workspace, or storage/quota?
- Does every empty/error/failed state say whether existing material remains
  private and safe?
- Does search readback explain owner-only scope and partial search failure
  without leaking private source text or storage paths?
- Does Export Workspace avoid implying public downloads, original-file backup,
  or global managed backup before those exist?
- At 375px and 390px, do place, privacy, preserved/safe state, and next action
  remain visible or immediately reachable?

## Next Owner

MIMIR should decide whether to open:

```text
UX-02C - Global Archive trust readback and rehearsal
```

Recommended owner flow:

1. MIMIR opens UX-02C to DAEDALUS with the narrow boundary above.
2. DAEDALUS implements only the minimal Global Archive readback/helper/test
   slice, if MIMIR agrees it is needed.
3. ARGUS reviews owner-only/archive/export/storage boundaries and validation.
4. ARIADNE performs the desktop and 375px/390px visible rehearsal.

No hard blocker or config dependency was found for this next slice.

## Validation

Docs-only validation:

```bash
git diff --check
```

No code, schema, route, storage, auth, parser, export, worker, queue, Railway,
Cloudflare, or Supabase config changes were made in this feasibility pass.
