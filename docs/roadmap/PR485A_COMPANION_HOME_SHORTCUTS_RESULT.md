# PR485A - Companion Home Shortcuts Result

Owner: DAEDALUS / A2

Date: 2026-07-05

Status: Ready for ARGUS review

## Result

DAEDALUS implemented the accepted PR485A web-only companion home shortcut
slice on the existing owner persona home/chat surface at
`/studio/personas/[personaId]`.

The page now renders a compact `Companion workspace shortcuts` strip above the
private chat with four existing owner-route targets:

- Memory -> `/studio/personas/[personaId]/memory`
- Timeline -> `/studio/personas/[personaId]/continuity`
- Profile -> `/studio/personas/[personaId]/edit`
- Integrity -> `/studio/personas/[personaId]/calibration`

The shortcuts are defined by `studioPersonaCompanionShortcuts(personaId)` and
rendered through ordinary `next/link` route links. No new data fetch was added.

## Changed Files

- `apps/web/app/studio/personas/[personaId]/page.tsx`
- `apps/web/app/globals.css`
- `apps/web/lib/studio-navigation.ts`
- `apps/web/lib/studio-navigation.test.ts`
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/roadmap/LANE_INDEX.md`
- `docs/roadmap/PR485A_COMPANION_HOME_SHORTCUTS_RESULT.md`
- `docs/testing/VALIDATION_BASELINE.md`

## Scope Boundary

PR485A stayed web-only.

No API route, migration, prompt helper, retrieval/context builder, AI/provider
package, token accounting, hosted runtime, archive connector, billing, queue,
worker, Cloudflare, Redis, social connector, public write, global shell, Discern
CSS import, Memory inbox, return-to-thread behavior, or companion presence
prompt context changed.

## Validation

- `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/studio-navigation.test.ts apps/web/lib/archive-trust.test.ts`
  passed with 26 tests.
- `npm exec --yes pnpm@10.32.1 -- run typecheck` passed.
- `npm exec --yes pnpm@10.32.1 -- run lint` passed.
- `git diff --check` passed with CRLF normalization warnings only.

Build was not rerun for PR485A. The existing local Windows Next standalone
symlink `EPERM` caveat remains the build truth if build is rerun.

## ARGUS Review Focus

- The helper returns exactly the accepted Memory, Timeline, Profile, and
  Integrity route targets.
- The visible strip sits on the existing owner persona home/chat surface and
  uses scoped `.studio-companion-*` CSS only.
- The page adds no fetch and leaves `PersonaChat`, provider setup/error
  behavior, token accounting, runtime context preview, and existing persona
  panels untouched.
- Static tests guard against companion-inbox/return-to-thread/archive-connector
  drift in this slice.

## Wakeup

```text
WAKEUP A3:
Codename: ARGUS
```
