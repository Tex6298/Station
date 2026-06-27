# UX-03 - Continuity And Integrity Review Feasibility

Owner: DAEDALUS
Reviewer: MIMIR, then ARGUS/ARIADNE for any implementation slice
Opened by: MIMIR
Status: COMPLETE - RESULT READY FOR MIMIR
Date: 2026-06-27

Result: `docs/roadmap/UX03_CONTINUITY_INTEGRITY_FEASIBILITY_RESULT.md`

## Why This Lane

UX-01A made Studio wayfinding clearer. UX-02C made Global Archive trust
readback clearer. The next roadmap lane is Continuity and Integrity review UX:
helping owners see durable continuity accumulating without making the system
sound magical.

This lane is feasibility and reconciliation only. DAEDALUS should map current
Continuity, Integrity, Memory, Canon, Archive, runtime context, and publication
touchpoints before MIMIR opens any visible implementation slice.

## Current Evidence To Reconcile

Use current code as truth. Treat older docs as evidence only:

- `docs/roadmap/STATION_UI_UX_ROADMAP.md`
- `docs/roadmap/PR62_CONTINUITY_TRUST_RUNTIME_READBACK.md`
- `docs/roadmap/PR63_INTEGRITY_REVIEW_TRUST_READBACK.md`
- `docs/roadmap/PR110_MEMORY_RUNTIME_EXPLANATION_READBACK.md`
- `docs/roadmap/PR192_MEMORY_CONTINUITY_OBSERVABILITY_UX_FIRST_SLICE.md`
- `docs/roadmap/PR193_ARIADNE_CONTINUITY_MEMORY_OBSERVABILITY_REHEARSAL.md`
- `docs/roadmap/PR194_CONTINUITY_READABILITY_PATCH.md`
- `docs/roadmap/PR195_POST_PR194_HOSTED_REPLAY_EVIDENCE_REFRESH.md`
- `docs/roadmap/PR262_OWNER_RUNTIME_PROVENANCE_STITCHING_READBACK_DAEDALUS.md`
- `docs/roadmap/PR332_UX03_CONTINUITY_INTEGRITY_REVIEW_RESULT.md`
- `docs/roadmap/PR333_UX03_CONTINUITY_HOSTED_RECHECK_RESULT.md`

Do not blindly reopen old PR332/PR333 work. Decide what remains true, what is
stale, and what current checkout still lacks.

## Surfaces To Map

Primary frontend surfaces:

- `/studio/personas/[personaId]/continuity`
- `/studio/personas/[personaId]/calibration`
- `/studio/personas/[personaId]/memory`
- `/studio/personas/[personaId]/canon`
- `/studio/personas/[personaId]/files`
- persona home continuity/export/readback sections
- runtime context preview where it appears in Studio

Likely frontend files:

- `apps/web/app/studio/personas/[personaId]/continuity/page.tsx`
- `apps/web/app/studio/personas/[personaId]/calibration/page.tsx`
- `apps/web/app/studio/personas/[personaId]/memory/page.tsx`
- `apps/web/app/studio/personas/[personaId]/canon/page.tsx`
- `apps/web/components/studio/continuity-timeline.tsx`
- `apps/web/components/studio/calibration-panel.tsx`
- `apps/web/components/studio/runtime-context-preview.tsx`
- `apps/web/components/studio/import-review-inbox.tsx`
- `apps/web/components/studio/publish-continuity-button.tsx`
- `apps/web/lib/continuity-ui.ts`
- `apps/web/lib/continuity-ui.test.ts`
- `apps/web/lib/integrity-ui.ts`
- `apps/web/lib/integrity-ui.test.ts`
- `apps/web/lib/memory-lifecycle-ui.ts`

Backend/API surfaces may be named for gates, but should not be changed in this
feasibility lane:

- `/continuity/persona/:personaId/records`
- `/integrity/*`
- `/calibration/*`
- `/memory/persona/:personaId`
- `/canon/persona/:personaId`
- `/conversations/persona/:personaId/context-preview`
- `/documents`
- `/persona-files/*`

## Questions DAEDALUS Must Answer

1. Where do Continuity, Integrity, Memory, Canon, Archive, and runtime context
   already meet in the current UI?
2. What can an owner currently learn about source links, timeline records,
   runtime provenance, candidate review, Integrity Session output, and
   publication boundaries?
3. Which older Continuity/Integrity/Memory evidence is still current, and which
   notes are stale?
4. Where is the user still forced to mentally stitch together Memory, Canon,
   Archive, Integrity, Continuity, and runtime context?
5. What is the smallest visible UX-03 implementation slice with real product
   value and low privacy risk?
6. Which tests already cover the relevant boundaries, and which gates should
   ARGUS require?
7. What should ARIADNE review on desktop plus 375px/390px mobile?

## Product Constraints

- Continuity is the core paid value.
- Integrity should read as review/support evidence, not mystical proof.
- Memory, Canon, Archive, Integrity output, runtime context, and Continuity
  records must remain distinct.
- Source links and provenance should build confidence without exposing private
  source bodies, raw prompts, provider payloads, raw IDs, storage paths, or
  compiled prompts.
- Publication and public document boundaries must stay explicit.
- Do not create fake certainty or imply autonomous memory/canon changes without
  owner review.

## Hard Boundaries

Do not implement UI changes in this lane.

Do not change:

- continuity record write semantics;
- Integrity engine, prompts, question bank, output extraction, or idempotency;
- Memory/Canon write or lifecycle behavior;
- archive import candidate mutation;
- runtime context selection/redaction;
- publication/public document visibility;
- auth/session behavior;
- provider/model behavior;
- Redis, Cloudflare, schema, migrations, workers, queues, Railway, or Supabase
  config.

If DAEDALUS finds a gap that needs one of those changes, classify it as a
deferred dependency or wake MIMIR with the exact reason.

## Required Output

Create a concise feasibility result that names:

- current route/component/API inventory;
- current versus stale evidence;
- fragile boundaries around private sources, publication, Integrity idempotency,
  runtime context redaction, and owner review;
- cheap first visible implementation slice;
- expensive/deferred work;
- ARGUS gates;
- ARIADNE review points;
- exact next owner/lane recommendation.

## Feasibility Validation

Docs-only feasibility can close with:

```bash
git diff --check
```

Run read-only commands as needed to inspect current code/tests. Do not hide
known build/lint caveats; classify them if relevant.

## Expected DAEDALUS Response

Wake MIMIR with:

- feasibility verdict;
- current-state map;
- recommended first implementation slice;
- ARGUS gates;
- ARIADNE review points;
- any hard blocker or config dependency.

Do not go quiet without a wakeup.
