# PR376 - Discover Public Space Initial Feed Result

Date: 2026-06-27
Implemented by: A2 / DAEDALUS
Status: ready for ARGUS review.

## Result

DAEDALUS patched the PR375 caveat with the smallest Discover placement change:
unfiltered `/discover` now renders a `Public Spaces` rail above the normal feed
controls whenever the already-loaded feed contains route-safe public Space
items.

The rail uses the existing PR374 Space feed card shape, so entries still render
as `Space` with the `Open public Space` cue and link to `/space/:slug`.

## Changed Files

- `apps/web/components/discover/discover-front-door.tsx`
- `apps/web/lib/discover-feed-controls.ts`
- `apps/web/lib/writing-feed.test.ts`
- `docs/roadmap/PR376_DISCOVER_PUBLIC_SPACE_INITIAL_FEED_RESULT.md`
- `docs/roadmap/PR376_DISCOVER_PUBLIC_SPACE_INITIAL_FEED_DAEDALUS.md`
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/testing/VALIDATION_BASELINE.md`

## Placement Gap Closed

Before PR376, PR374 made public Space feed items routeable and visible after
selecting the `Spaces` filter, but the initial unfiltered Discover view could
still bury the Space card among other feed items.

After PR376:

- the initial unfiltered Discover feed view surfaces a `Public Spaces` rail when
  safe Space feed items are present;
- the rail appears before the filter controls, so the Space entrypoint is visible
  without selecting `Spaces`;
- the regular feed and `Spaces` filter still work unchanged;
- no public Space card is invented when the loaded feed has no safe Space item.

## Visibility And Slug Safety

The rail is sourced only from already-normalized feed items where
`type === "space"` and the href is a strict `/space/:slug` route.

The helper rejects:

- non-Space feed items;
- unsafe Space slugs;
- UUID-shaped Space slugs;
- Space document routes masquerading as Space cards.

PR374's API boundary remains intact: public Space feed items still originate
from `spaces.is_public = true`, and the API route still rejects unsafe or
UUID-shaped Space slugs before emitting standalone Space feed items.

## Validation

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:community` | Pass | 34 tests passed; PR374 public/private Space and Developer Space discover/search coverage remains green. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/components/discover/search-dropdown.test.ts apps/web/lib/writing-feed.test.ts` | Pass | 13 focused Discover/search/writing helper tests passed, including the new safe Space highlight helper. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 122 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:writing` | Pass | 21 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck` | Pass | Web TypeScript check passed. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/web lint` | Pass | No ESLint warnings or errors. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck` | Pass | API TypeScript check passed. |
| `git diff --check` | Pass | Whitespace check passed with CRLF normalization warnings only. |

## Scope Control

No API behavior, publishing, approval, document, discussion, auth, provider,
Redis, Cloudflare, worker, queue, schema, migration, billing, Station Press,
social, checkout, or broad Discover redesign changed.

## Review Ask

ARGUS should review the unfiltered Discover placement and confirm the PR374
public Space visibility/slug safety boundary remains intact.

If accepted and deployed, ARIADNE should rerun the hosted PR375 proof and verify
the initial unfiltered route:

```text
/ -> /discover -> visible public Space card/link -> public Space -> public document -> linked discussion if present
```
