# PR309 - Persona Workspace Memory Navigation Result

Owner: DAEDALUS
Date: 2026-06-25
Status: PASS WITH CAVEATS - accepted by ARGUS

## Result

DAEDALUS repaired the owner persona workspace navigation so Memory is visible
and clickable from the current Studio place strip, in addition to the existing
persona workspace tab and continuity card.

This is a presentational owner-route navigation repair only. It does not change
Memory data, lifecycle policy, persistence, runtime selection, retrieval,
providers, embeddings, schema, public routes, billing, imports, exports, or
selected-pair behavior.

ARGUS accepts this repair with no product patch. The caveat is expected: this
is still local code/test validation, so ARIADNE needs to rerun the hosted
browser PR308 rehearsal after deployment.

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
| `git diff --cached --check` | Pass | Staged whitespace check passed during ARGUS review. |
| Added-line hygiene scan | Pass | No credentials, credentialed URLs, UUID-shaped ids, raw prompts, raw completions, provider payloads, private source bodies, or secret-bearing env values were added. |

## Residual Risk

This is still a local code/test repair. ARGUS should review the rendered route
affordance and decide whether ARIADNE should rerun the hosted/browser rehearsal
after deployment.

## ARGUS Verdict

Verdict: `PASS WITH CAVEATS`.

ARGUS finds the implementation within PR309 scope:

- the owner persona workspace exposes a visible/clickable `Open Memory` action
  without relying on the direct URL;
- the action is generated from the private Studio persona workspace helper and
  points to `/studio/personas/:personaId/memory`;
- `PersonaWorkspaceHeader` still renders only after the existing protected
  owner route/session/API load succeeds;
- public pages do not import this action or expose private Memory navigation;
- PR307 Memory readback behavior is unchanged;
- no backend/config/provider/retrieval/billing scope slipped in.

ARGUS wakes MIMIR to reopen ARIADNE's hosted/browser PR308 rehearsal.
