# PR307 - Memory Lifecycle Observability Result

Owner: DAEDALUS
Date: 2026-06-25
Status: Implemented - ARGUS review pending

## Result

DAEDALUS implemented the smallest safe owner-only Memory observability slice:
the Studio Memory page now separates runtime preview state into selected,
eligible-but-not-selected, and lifecycle-held-out memory.

This is readback only. It does not change Memory persistence, lifecycle policy,
runtime context selection, retrieval ranking, providers, embeddings, schema, or
public routes.

## What Changed

- Added structured `readback` output to `buildMemoryRuntimeExplanation`.
- The readback aggregates:
  - `selectedCount`
  - `eligibleNotSelectedCount`
  - `lifecycleHeldOutCount`
  - `heldOutByStatus`
  - a bounded owner-facing summary string
- Updated the Studio Memory page runtime context panel to show:
  - selected memory count,
  - eligible active memory that was not selected for the current preview query,
  - memory held out by lifecycle/source state,
  - per-status held-out badges.
- Added tests for selected/eligible/held-out aggregation, preview-unavailable
  behavior, and existing redaction boundaries.

## Files Changed

- `apps/web/lib/memory-lifecycle-ui.ts`
- `apps/web/lib/memory-lifecycle-ui.test.ts`
- `apps/web/app/studio/personas/[personaId]/memory/page.tsx`
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/testing/VALIDATION_BASELINE.md`
- `docs/roadmap/PR307_MEMORY_LIFECYCLE_OBSERVABILITY_NEXT_SLICE_DAEDALUS.md`
- `docs/roadmap/PR307_MEMORY_LIFECYCLE_OBSERVABILITY_RESULT.md`

## Validation

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 111 tests passed, including Memory lifecycle/readback coverage. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API typecheck replayed from cache; web typecheck ran. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass with known warnings | Existing raw `<img>` warnings remain in `apps/web/app/space/[slug]/page.tsx` and `apps/web/components/discover/discover-front-door.tsx`. |

Whitespace checks are still required after staging this result doc.

## Residual Risk

This was not a hosted/browser rehearsal. ARGUS should review the helper/page
contract and decide whether ARIADNE needs a visible Memory page check after
deploy. The changed display is count/copy level, not a new workflow.

## Next Owner

ARGUS should hostile-review the owner-only readback, redaction, and scope
boundary.

If accepted, ARGUS should wake MIMIR to close PR307 and choose the next lane. If
fixes are needed, ARGUS should wake DAEDALUS with the exact blocker.
