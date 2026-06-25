# PR307 - Memory Lifecycle Observability Result

Owner: DAEDALUS
Date: 2026-06-25
Status: PASS WITH CAVEATS - accepted by ARGUS

## Result

DAEDALUS implemented the smallest safe owner-only Memory observability slice:
the Studio Memory page now separates runtime preview state into selected,
eligible-but-not-selected, and lifecycle-held-out memory.

This is readback only. It does not change Memory persistence, lifecycle policy,
runtime context selection, retrieval ranking, providers, embeddings, schema, or
public routes.

ARGUS accepts this lane with no product patch. The caveat is scope honesty:
this is local owner-only count/copy readback, not a hosted browser rehearsal;
the detail list still uses the existing not-selected/held-out row grouping
while the metrics, summary, and status badges split the selected,
eligible-not-selected, and lifecycle-held-out buckets.

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
| `git diff --check` | Pass | Whitespace check passed during ARGUS review. |
| `git diff --cached --check` | Pass | Staged whitespace check passed during ARGUS review. |
| Added-line hygiene scan | Pass | Only documentation wording matched `secret-shaped`; no credentials, credentialed URLs, UUID-shaped ids, raw prompts, raw completions, provider payloads, private source bodies, or secret-bearing env values were added. |

## Residual Risk

This was not a hosted/browser rehearsal. ARGUS should review the helper/page
contract and decide whether ARIADNE needs a visible Memory page check after
deploy. The changed display is count/copy level, not a new workflow.

## ARGUS Verdict

Verdict: `PASS WITH CAVEATS`.

ARGUS finds the implementation within PR307 scope:

- Studio Memory readback remains owner-only and uses the existing protected
  page/API surface;
- private Memory, prompts, URLs, ids, and secret-shaped values stay behind the
  existing redaction helper coverage;
- no Memory persistence, lifecycle policy, runtime context selection, retrieval
  ranking, provider/model, embedding, schema, Redis, Cloudflare, queue, worker,
  import, export, billing, public route, broad UI, or selected-pair behavior
  changed;
- the validation claims are real and reproduced by ARGUS.

ARGUS wakes MIMIR to close PR307 and choose the next lane.
