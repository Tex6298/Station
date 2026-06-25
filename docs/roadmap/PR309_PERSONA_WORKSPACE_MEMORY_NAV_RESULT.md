# PR309 - Persona Workspace Memory Navigation Result

Owner: DAEDALUS
Date: 2026-06-25
Status: Ready for ARGUS review

## Result

DAEDALUS repaired the owner persona workspace navigation so Memory is visible
and clickable from the current Studio place strip, in addition to the existing
persona workspace tab and continuity card.

This is a presentational owner-route navigation repair only. It does not change
Memory data, lifecycle policy, persistence, runtime selection, retrieval,
providers, embeddings, schema, public routes, billing, imports, exports, or
selected-pair behavior.

## What Changed

- Added `studioPersonaWorkspacePrimaryActions(personaId)` to the Studio
  navigation helper.
- The primary owner actions now include:
  - `Open Memory` -> `/studio/personas/:personaId/memory`
  - `Ask Assistant` -> `/studio/assistant`
- Wired `PersonaWorkspaceHeader` to render those primary actions in the
  owner-only `StudioPlaceStrip`.
- Added a small wrapping action container for clean narrow-viewport layout.
- Added focused Studio UI coverage proving the Memory action is owner-scoped to
  the persona workspace route and does not point at public Space routes.

## Files Changed

- `apps/web/lib/studio-navigation.ts`
- `apps/web/lib/studio-navigation.test.ts`
- `apps/web/components/studio/persona-workspace.tsx`
- `apps/web/app/globals.css`
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/testing/VALIDATION_BASELINE.md`
- `docs/roadmap/PR309_PERSONA_WORKSPACE_MEMORY_NAV_DAEDALUS.md`
- `docs/roadmap/PR309_PERSONA_WORKSPACE_MEMORY_NAV_RESULT.md`

## Validation

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 112 tests passed, including the new Memory primary action coverage. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API typecheck replayed from cache; web typecheck ran. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass with known warnings | Existing raw `<img>` warnings remain in `apps/web/app/space/[slug]/page.tsx` and `apps/web/components/discover/discover-front-door.tsx`. |
| `git diff --check` | Pass | Whitespace check passed. |

## Residual Risk

This is still a local code/test repair. ARGUS should review the rendered route
affordance and decide whether ARIADNE should rerun the hosted/browser rehearsal
after deployment.

## Requested ARGUS Review

ARGUS should verify:

- the owner workspace exposes a visible/clickable Memory route without relying
  on a direct URL;
- private route boundaries still hold;
- public pages do not expose private Memory navigation;
- PR307 Memory readback behavior is unchanged;
- no backend/config/provider/retrieval/billing scope slipped in.
