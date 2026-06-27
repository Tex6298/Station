# UX-02C - Global Archive Trust Readback And Rehearsal

Owner: DAEDALUS
Reviewer: ARGUS first for archive/export/storage boundaries, then ARIADNE for
visible desktop and mobile rehearsal
Opened by: MIMIR
Status: COMPLETE - RESULT READY FOR ARGUS
Date: 2026-06-27

Result: `docs/roadmap/UX02C_GLOBAL_ARCHIVE_TRUST_READBACK_RESULT.md`

## Why This Lane

MIMIR accepts DAEDALUS's UX-02 feasibility result:
`docs/roadmap/UX02_ARCHIVE_TRUST_FEASIBILITY_RESULT.md`.

Current main already has per-persona Archive trust states, import source
wording, storage/quota readback, persona export status, Export Workspace trust
mapping, and live owner-scoped Global Archive search.

The gap is current visible acceptance for Global Archive as a live owner-wide
trust surface. UX-02C should clarify `/studio/archive` and rehearse it on
desktop plus 375px/390px mobile.

## Scope

Implement only the smallest visible Global Archive trust readback slice needed
after inspecting current checkout.

Primary surface:

- `/studio/archive`

Related surfaces to inspect but avoid broad edits:

- `/studio/personas/[personaId]/files`
- `/studio/export`
- persona home export status via `ArchiveExportStatus`
- Studio sidebar storage/quota readback
- Settings storage usage if Global Archive copy points there

Likely files:

- `apps/web/components/studio/archive-library.tsx`
- `apps/web/lib/archive-search.ts`
- `apps/web/app/studio/archive/page.tsx`
- `apps/web/lib/archive-trust.ts`
- `apps/web/lib/archive-trust.test.ts`
- `apps/web/app/globals.css`

Touch additional files only if the current implementation genuinely needs it.

## Implementation Goals

- Make Global Archive visibly owner-only and live, not a static placeholder.
- Explain how Global Archive differs from:
  - per-persona Archive: source intake and persona-local review;
  - Export Workspace: portable package/readback planning;
  - storage/quota: server-reported capacity and safety limits.
- Keep empty, error, and partial-search states honest about existing material
  remaining private and safe.
- Preserve failed-safe/no-fake-activity language.
- Keep search/result copy from leaking private source bodies, storage paths,
  raw IDs, manifests, bundle contents, or provider payloads.
- Maintain 375px and 390px readability with no horizontal overflow or collapsed
  action text.
- Add or update focused tests if helpers/copy behavior changes.

## Hard Boundaries

Do not change:

- storage accounting;
- Supabase upload/register behavior;
- import parser behavior;
- import candidate mutation;
- export package assembly;
- public/community visibility;
- auth/session behavior;
- runtime retrieval/context behavior;
- provider/model/embedding behavior;
- Redis, Cloudflare, schema, migrations, workers, queues, Railway, or Supabase
  config.

Do not turn Export Workspace into a promise of public downloads, full original
file backup, PDF/binary backup, or global managed backup unless that behavior
already exists and ARGUS verifies it.

If the needed fix requires any boundary above, stop and wake MIMIR with the
exact reason.

## ARGUS Gates

Minimum expected gates:

```bash
git diff --check
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run test:conversation-archive
npm exec --yes pnpm@10.32.1 -- run test:exports
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- run lint
```

Add if touched:

```bash
npm exec --yes pnpm@10.32.1 -- run test:storage
npm exec --yes pnpm@10.32.1 -- run test:auth
npm exec --yes pnpm@10.32.1 -- run build
```

ARGUS should also run an added-line sensitive-pattern scan and check that
anonymous users and other owners gain no path to private Archive rows, source
names, import errors, storage paths, manifests, or bundle contents.

If `build` reproduces the local Windows Next standalone symlink `EPERM` after
compile/static generation, classify it honestly rather than hiding it.

## ARIADNE Review Points

After ARGUS accepts the technical boundary, wake ARIADNE for visible review:

- desktop `/studio/archive`
- 375px `/studio/archive`
- 390px `/studio/archive`
- related route links or labels to per-persona Archive and Export Workspace
- Studio sidebar storage/quota context if visually touched

ARIADNE should answer:

- Can a user tell this is a live owner-only Global Archive surface?
- Can a user tell how it differs from per-persona Archive and Export Workspace?
- Do empty/error/partial-search states say existing material remains private
  and safe?
- Does result/search readback avoid leaking private source text or storage
  paths?
- Do desktop, 375px, and 390px avoid overlap, clipping, and horizontal
  overflow?

## Expected DAEDALUS Response

Wake ARGUS with:

- implementation summary;
- exact files touched;
- current gaps found before patching;
- validation results;
- desktop and 375px/390px notes if DAEDALUS runs a browser check;
- whether ARIADNE can review next or MIMIR must decide a scope issue.

Do not go quiet without a wakeup.
