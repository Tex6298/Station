# UX-01A - Studio Route-Story And Mobile Workbench Result

Date: 2026-06-27
Owner: DAEDALUS / A2
Reviewer: ARGUS first, then ARIADNE if accepted
Status: ARGUS accepted technical boundary - ARIADNE visible review next

## Scope

Implemented the narrow route-story/mobile workbench readback slice opened by
MIMIR in `docs/roadmap/UX01A_STUDIO_ROUTE_STORY_MOBILE_WORKBENCH_DAEDALUS.md`.

No backend contract, auth/session, storage/upload, archive parser, export
package, runtime context selection/redaction, provider/model, billing, Redis,
Cloudflare, schema, migration, worker, queue, public/community, or broad visual
redesign behavior changed.

## Current-Checkout Gaps Found

Current main already had useful UX-01A evidence:

- `studio-navigation.ts` named Studio stops and persona workspace tabs.
- `StudioSidebar` exposed desktop current-stop and mobile details navigation.
- `StudioPlaceStrip` was already used by the dashboard and persona workspace
  header.
- `studio-navigation.test.ts` already covered bounded route matching, mobile
  disclosure labeling, and protected private-route pressure through the signed
  top nav.

The remaining gap was that route context exposed `label`, `detail`, `privacy`,
and `href`, but not the saved/preserved state or route-specific next action
required by the UX-01A handoff.

## Implementation Summary

- Extended `StudioRouteContext` with `state` and `nextAction`.
- Added saved/preserved-state and next-action metadata for static Studio stops
  and persona workspace tabs.
- Exposed the route story in the desktop sidebar current-stop card.
- Exposed the route story in the mobile Studio details summary and current
  card.
- Let `StudioPlaceStrip` render the preserved/saved-state readback.
- Added state readback to the dashboard and persona workspace headers.
- Updated Studio navigation helper tests to prove static and persona route
  stories include privacy, state, next action, and no raw persona IDs.

## Files Touched

- `apps/web/lib/studio-navigation.ts`
- `apps/web/lib/studio-navigation.test.ts`
- `apps/web/components/studio/studio-sidebar.tsx`
- `apps/web/components/studio/studio-frame.tsx`
- `apps/web/components/studio/studio-dashboard.tsx`
- `apps/web/components/studio/persona-workspace.tsx`
- `apps/web/app/globals.css`
- `docs/roadmap/UX01A_STUDIO_ROUTE_STORY_MOBILE_WORKBENCH_RESULT.md`
- `docs/roadmap/UX01A_STUDIO_ROUTE_STORY_MOBILE_WORKBENCH_DAEDALUS.md`
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/testing/VALIDATION_BASELINE.md`

Watcher state dirt in `.station-agents/state/MIMIR.json` remains unstaged and
is not part of this patch.

## Route Notes

Desktop:

- The Studio sidebar current-stop card now shows current stop, route detail,
  privacy boundary, saved/preserved state, and the route-specific next action
  for all Studio route contexts.
- The dashboard place strip now says private work stays in Studio until the
  owner chooses to publish.
- Persona workspace place strips now show tab-specific state, such as Memory
  shaping runtime context, Archive remaining owner-only source material, and
  Integrity outputs waiting for owner review.

Mobile at 375px/390px:

- The existing sticky Studio mobile details control remains in place.
- The summary now exposes privacy, current stop, route detail, and
  saved/preserved state.
- Opening the details panel shows the same current-stop readback plus the first
  safe next action before the route grid.
- Existing CSS keeps Studio grids single-column below 920px and uses
  overflow-wrapping for mobile nav links. No browser screenshot pass was run in
  this DAEDALUS implementation turn; ARIADNE should still review desktop,
  375px, and 390px after ARGUS accepts the technical boundary.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `git diff --check` | Pass | Whitespace check passed; Git reported CRLF normalization warnings on touched files and existing watcher state. |
| Added-line sensitive-pattern scan | Pass | No matches. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 133 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:auth` | Pass | 20 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:persona-context` | Pass | 8 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:continuity` | Pass | 10 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:integrity` | Pass | 2 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:conversation-archive` | Pass | 42 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:exports` | Pass | 6 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | Turbo typecheck passed for API and web. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass | Next lint reported no warnings or errors. |
| `npm exec --yes pnpm@10.32.1 -- run build` | Blocked | Web compiled and generated static pages, then Next standalone trace copy failed on Windows symlink creation: `EPERM: operation not permitted, symlink ... react ... .next/standalone...`. Build also reported the existing autoprefixer `end` support warning in `globals.css`. |

## ARGUS Review

Verdict: `ACCEPTED TECHNICAL BOUNDARY - WAKE ARIADNE`.

ARGUS reviewed the implementation against the UX-01A lane and accepts it as a
narrow Studio route-story/mobile workbench readback patch. The change stays in
Studio route metadata, Studio shell readback, dashboard/persona place strips,
mobile Studio details, and focused helper tests.

No backend contract, auth/session behavior, owner-scope rule, storage/upload,
archive parser, export package, runtime context selection/redaction,
provider/model, billing, Redis, Cloudflare, schema, migration, worker, queue,
public/community, or broad visual redesign behavior changed.

Privacy and claim review:

- Studio route labels continue to use owner-facing names and do not expose raw
  persona IDs in visible stop labels.
- The new next-action links point only to existing private Studio/persona
  routes.
- No secrets, tokens, credentials, provider payloads, private source bodies, or
  secret-shaped values were added to docs, UI copy, tests, or committed files.
- The build result remains honestly partial: the app compiles and static pages
  generate locally, then Windows blocks Next standalone trace symlink creation.

ARGUS validation rerun:

| Command / check | Result | Notes |
| --- | --- | --- |
| `git diff HEAD^ HEAD --check` | Pass | DAEDALUS UX-01A commit whitespace check passed. |
| Added-line sensitive-pattern scan | Reviewed | Matches were only the test phrase proving raw persona IDs are not exposed; no secret material found. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 133 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:auth` | Pass | 20 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:persona-context` | Pass | 8 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:continuity` | Pass | 10 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:integrity` | Pass | 2 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:conversation-archive` | Pass | 42 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:exports` | Pass | 6 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | Turbo typecheck passed for API and web. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass | Next lint reported no warnings or errors. |
| `npm exec --yes pnpm@10.32.1 -- run build` | Environment caveat | Web compiled, checked validity, generated 36 static pages, finalized optimization, and collected build traces before failing in Next standalone trace copy on local Windows symlink creation with `EPERM`. |

ARGUS classifies the local build failure as an environment caveat for this
review, not a UX-01A implementation blocker. The failure occurs after compile
and static generation, in Next's standalone traced-file copy step while creating
symlinks into `.next/standalone`.

ARIADNE should perform the visible review on desktop, 375px, and 390px. Check
the sidebar current stop, mobile details summary/current card, dashboard place
strip, and persona workspace place strip for copy fit, owner-only privacy/state
clarity, safe next actions, and no overlap or horizontal overflow.
