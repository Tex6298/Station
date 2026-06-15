# PR 8 Site-Wide UI Coherence Result

Date: 2026-06-15

Owner: A2 / DAEDALUS

Status: Ready for A3 / ARGUS review.

## Scope Completed

DAEDALUS kept this as a frontend/docs-only coherence slice inside the PR 8
allow-list.

Changed surfaces:

- Global explicit Station UI primitives in `apps/web/app/globals.css`.
- `/billing`.
- `/settings`.
- `/space`.
- `/developer-spaces`.
- `/writing`.
- Studio publishing dashboard.

The patch does not change API behavior, auth/session behavior, Stripe backend
behavior, Supabase/database behavior, Railway/config behavior, providers,
storage, migrations, package scripts, or lockfiles.

## UI Changes

Added explicit Station page primitives rather than adding more broad global
attribute-selector styling:

- `station-page`.
- `station-page-inner`.
- `station-page-inner-narrow`.
- `station-page-header`.
- `station-eyebrow`.
- `station-page-title`.
- `station-page-title-large`.
- `station-page-lede`.
- `station-panel`.
- `station-card`.
- `station-grid`.
- `station-grid-2`.
- `station-action-row`.
- `station-link-button`.
- `station-muted-button`.
- `station-disabled-action`.
- `station-notice`.
- `station-status-pill`.

Applied those primitives to account-level, public-listing, Developer Spaces,
Writing, and Studio publishing surfaces so they read closer to one Station
system: off-white canvas, restrained panels/cards, 8px radii, consistent page
headers, and quieter operational controls.

## Control Truth

Live controls kept live:

- Billing Checkout and portal controls still call the existing frontend billing
  actions.
- Developer Space create/search/manage/view controls still use existing routes
  and form handlers.
- Space and Writing links still route to their existing destinations.
- Studio publishing tab controls still switch visible local state.
- Studio publishing edit links still route to `/studio/publish`.

Unavailable controls made explicit:

- Studio publishing `Publish`, `Retry`, `View`, and `Delete` actions are now
  disabled and labelled unavailable instead of presenting as live mutation
  controls in this slice.
- Settings placeholder profile editor and account deletion actions use the
  shared disabled action treatment.

## Routes Left For Review

PR 8 named a broad route set. This patch touched the surfaces with the clearest
remaining mismatch and relied on prior public-front-door/forum/discover/detail
work for routes already carrying the accepted Station direction.

ARGUS should explicitly review whether untouched route groups still satisfy PR 8
or whether ARIADNE should call out a follow-up:

- `/`.
- `/discover`.
- `/forums`.
- `/forums/:category`.
- `/forums/:category/:thread`.
- `/space/:slug`.
- `/space/:slug/documents/:documentId`.
- `/developer-spaces/:slug`.
- `/developer-spaces/:slug/manage`.
- `/studio`.
- `/studio/personas/:personaId`.
- `/studio/personas/:personaId/continuity`.
- `/studio/personas/:personaId/memory`.
- `/studio/personas/:personaId/files`.

## Validation

Commands run:

| Command | Result | Notes |
| --- | --- | --- |
| `npx --yes pnpm@10.32.1 --filter @station/web typecheck` | Pass | Web TypeScript check passed. |
| `npx --yes pnpm@10.32.1 --filter @station/web lint` | Pass with warnings | Existing warning inventory only: one React hook dependency warning in Developer Spaces manage, and two `<img>` optimization warnings in Space/Discover. |
| `npx --yes pnpm@10.32.1 test:studio-ui` | Pass | 8 tests passed. |
| `npx --yes pnpm@10.32.1 test:community` | Pass | 8 tests passed. |
| `npx --yes pnpm@10.32.1 test:document-discussions` | Timeout | Timed out after 124 seconds, then again after 304 seconds, with no completed test output. The package build prefix passes; isolated `tsx --test apps/api/src/routes/document-discussions.test.ts` also timed out after 124 seconds. PR 8 did not touch API/test files. |
| `npx --yes pnpm@10.32.1 test:developer-spaces` | Pass | 7 tests passed. |
| `npx --yes pnpm@10.32.1 test:developer-space-client` | Pass | 3 tests passed. |
| `npx --yes pnpm@10.32.1 test:billing` | Pass | 4 tests passed. |
| `git diff --check` | Pass | No whitespace errors; Git reported expected CRLF normalization warnings for touched files and consumed DAEDALUS state. |

## ARGUS Review Focus

- Confirm the diff stays inside PR 8 frontend/docs scope.
- Check that the new shared primitives do not fight the older global
  reconciliation layer.
- Review mobile risk around page headers, action rows, and card grids.
- Decide whether the untouched route groups are acceptable because they already
  carry prior accepted direction, or whether ARIADNE should request a narrow
  follow-up.
- Treat `test:document-discussions` as a validation hang needing review, not as
  a PR 8 code failure unless ARGUS can connect it to this frontend-only diff.
