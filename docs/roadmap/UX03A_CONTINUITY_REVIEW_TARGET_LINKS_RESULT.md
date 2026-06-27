# UX-03A Continuity Review Target Route Links Result

Owner: DAEDALUS
Reviewer: ARGUS, then ARIADNE
Status: READY FOR ARGUS
Date: 2026-06-27

## Verdict

UX-03A is implemented as the narrow owner-only route-link slice MIMIR opened.
Continuity review target text now routes to existing Studio review surfaces
where a safe route-level destination exists. Unknown targets stay plain text.

No backend route, write behavior, runtime selection, Integrity engine, Memory/
Canon lifecycle, Archive mutation, publication visibility, auth/session,
provider/model, config, schema, migration, worker, queue, Redis, Cloudflare,
Railway, or Supabase behavior changed.

## What Changed

- Added `continuityReviewTargetHref` in `apps/web/lib/continuity-ui.ts`.
- Linked Continuity `Review clarity` targets in
  `apps/web/components/studio/continuity-timeline.tsx`.
- Linked runtime provenance group targets on
  `/studio/personas/[personaId]/continuity`.
- Added helper tests for route-level mappings, encoded persona routes,
  unknown targets, and raw-id/credential-like non-matches.
- Updated `continuity-publication.test.ts` for current Discover behavior:
  public Spaces and published documents both appear in the feed, so the
  publication assertion now checks the document subset and confirms the public
  Space item separately.

## Route Map

Route-level links only:

- Memory -> `/studio/personas/:personaId/memory`
- Canon -> `/studio/personas/:personaId/canon`
- Integrity -> `/studio/personas/:personaId/calibration`
- Archive -> `/studio/personas/:personaId/files`
- Continuity -> `/studio/personas/:personaId/continuity`
- Publication/document review -> `/studio/publishing`

Still plain text:

- Linked conversation targets, because no current safe route-level
  conversation-review surface exists in the UX-03A handoff.
- Unknown targets or labels containing extra raw-id/credential-like material.

## Validation

Passed:

- `git diff --check`
- Added-line sensitive-pattern scan
- `npm exec --yes pnpm@10.32.1 -- run test:studio-ui`
- `npm exec --yes pnpm@10.32.1 -- run test:continuity`
- `npm exec --yes pnpm@10.32.1 -- run test:continuity-publication`
- `npm exec --yes pnpm@10.32.1 -- run test:persona-context`
- `npm exec --yes pnpm@10.32.1 -- run test:integrity`
- `npm exec --yes pnpm@10.32.1 -- run typecheck`
- `npm exec --yes pnpm@10.32.1 -- run lint`

Notes:

- npm emitted the known pnpm `.npmrc` warning when using the pinned runner.
- The sensitive-pattern scan matched only the deliberate credential negative
  fixture in `continuity-ui.test.ts`; it is not real credential material.
- `test:continuity-publication` initially exposed a stale fixture expectation:
  the current feed includes the public Space item as well as the published
  document. The test now asserts the document subset and the Space item
  explicitly.

## ARGUS Review Points

- Confirm links are route-level and owner-only.
- Confirm labels do not expose raw source IDs, source bodies, prompts, storage
  paths, provider payloads, or compiled prompts.
- Confirm unsupported targets stay unlinked.
- Confirm publication/document copy still points to owner review rather than
  implying a public publish action.
- Confirm the Continuity route still hides compiled prompt and source content.

If accepted, ARGUS should wake ARIADNE for desktop, 375px, and 390px human-eye
route rehearsal.
