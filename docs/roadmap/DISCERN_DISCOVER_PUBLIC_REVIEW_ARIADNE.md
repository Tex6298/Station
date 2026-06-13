# Discern Discover/Public Review - ARIADNE

Date: 2026-06-13
Reviewer: ARIADNE

Status: product review and implementation handoff. No Discern code is imported
by this review.

## Inputs checked

- `docs/roadmap/DISCERN_DISCOVER_PUBLIC_REVIEW_MIMIR.md`
- `docs/roadmap/DISCERN_PUBLIC_SHELL_BROWSER_ARIADNE.md`
- `docs/roadmap/DISCERN_TO_TEX_UI_IMPORT_AUDIT.md`
- `docs/roadmap/DISCERN_TO_TEX_UI_IMPORT_REVIEW_ARIADNE.md`
- `apps/web/app/page.tsx`
- `apps/web/app/discover/page.tsx`
- `apps/web/components/discover/public-home.tsx`
- `apps/web/components/discover/discover-front-door.tsx`
- `apps/web/components/discover/search-dropdown.tsx`
- `apps/web/components/discover/search-dropdown.test.ts`
- `apps/web/lib/use-station-search.ts`
- `apps/web/components/nav/top-nav.tsx`

The named Discern reference paths `apps/web/components/discover/discover-page.tsx`
and `apps/web/components/nav/left-rail.tsx` are not present in current Tex.
`apps/web/components/discover/discover-home.tsx` is present but appears unused
by current routes and still contains static/fallback-style direction. It should
not be treated as implementation source for this lane.

## Decision

Open exactly one narrow slice:

`DISCERN-DISCOVER-SEARCH-CLARITY-01`

Outcome selected from MIMIR's list:

`Open a narrow public search/dropdown clarity slice.`

Do not open a broad `/discover` directory redesign yet. Do not reopen the public
home ordering/density slice; `/` is already accepted as the polished public
front door. Do not open left-rail/navigation implementation from this review.

## Why this slice

The accepted public home already established the right public Station shape:
public front door, explicit privacy boundary, surface grouping, and public-only
dropdown buckets.

The remaining useful Discern direction is search legibility and route safety on
the raw `/discover` page. Current `/discover` search is functional, but it is
less precise than the accepted public-home search:

- unauthenticated copy still says "posts" instead of clearer Station surfaces
  like publications, Spaces, forum threads, and Developer Spaces;
- result labels are generated from raw bucket names instead of the public-home
  labels;
- public document results can fall back to `/documents/:id` when no Space slug
  exists, which creates a route promise the public-home dropdown deliberately
  avoids;
- authenticated persona search is mixed into the same result renderer without
  enough copy distinction from public results.

This is the right next slice because it improves public/private clarity without
adding fake content, changing feed density, adding a left rail, or touching
backend visibility rules.

## DAEDALUS slice

File allow-list:

- `apps/web/components/discover/discover-front-door.tsx`
- `apps/web/components/discover/search-dropdown.tsx`
- `apps/web/components/discover/search-dropdown.test.ts`

Only touch `apps/web/lib/use-station-search.ts` if a tiny typed helper is needed
for the existing public search hook. Do not touch it for behavior expansion.

Do not touch:

- `apps/web/app/globals.css`
- `apps/web/app/page.tsx`
- `apps/web/app/discover/page.tsx`
- `apps/web/components/discover/public-home.tsx`
- `apps/web/components/discover/discover-home.tsx`
- `apps/web/components/nav/top-nav.tsx`
- any left rail, route, backend, package, lockfile, Railway, provider,
  embedding, migration, billing, auth, or staging file.

## Intended UX target

Make `/discover` search read like the public/raw counterpart to the accepted
public-home search:

- Unauthenticated search should clearly be public Station search.
- Public result groups should use Station-facing labels: Developer Spaces,
  Spaces, Publications, and Forum.
- Unauthenticated/public result rendering should only link routeable public
  buckets, matching the public-home dropdown helper behavior.
- Public documents without a public Space document route should be dropped from
  public result links rather than sent to a generic `/documents/:id` promise.
- Authenticated persona results, if kept, should be visually and textually
  distinct as owner/Studio results, not implied to be public discovery.
- No result copy should imply private archive, memory, canon, import,
  continuity, owner search, or community-only material is included in public
  search.

## Forbidden changes

- No direct Discern port.
- No fake fallback/demo people, projects, scores, or activity.
- No broad Discover redesign.
- No public-home reordering.
- No left rail.
- No broad global CSS.
- No new icon package or external dependency.
- No backend/API/search semantics change.
- No route promise for paths Tex does not serve.
- No private archive, memory, canon, import, continuity, billing, provider,
  model, embedding, package, lockfile, Railway, migration, health, readiness,
  reset-password, or replay changes.

## Validation requested

DAEDALUS should run:

- `git diff --check`
- `npx --yes pnpm@10.32.1 exec tsx --test apps/web/components/discover/search-dropdown.test.ts`
- `npx --yes pnpm@10.32.1 --filter @station/web typecheck`
- `npx --yes pnpm@10.32.1 --filter @station/web lint`
- `npx --yes pnpm@10.32.1 test:community`

If DAEDALUS changes visible search copy or layout around `/discover`, also run a
local browser check at `390px` for `/discover` and record whether any horizontal
overflow appears.

## Next wake target

After implementation, DAEDALUS should wake ARGUS:

`WAKEUP A3`

ARGUS should review route safety, public/private bucket separation, tests, and
the no-backend/no-route-promise boundary before ARIADNE does any browser pass.
