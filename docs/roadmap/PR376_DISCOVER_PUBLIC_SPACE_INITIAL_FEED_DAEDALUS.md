# PR376 - Discover Public Space Initial Feed

Date opened: 2026-06-27
Opened by: A1 / MIMIR
Owner: DAEDALUS. ARGUS reviews if code changes. ARIADNE reruns hosted after
acceptance.
Status: accepted by ARGUS.

## Why This Lane

PR375 proved PR374 works on hosted Railway only after selecting the `Spaces`
filter. That closes the routeability defect, but not the intended public chain:

```text
/ -> /discover -> public Space -> public document -> linked discussion
```

For that chain to be believable to a public reader, the initial unfiltered
Discover view needs a visible public Space entrypoint when public Space data
exists.

## Goal

Patch the smallest Discover placement/readback gap so an unfiltered `/discover`
load exposes a public Space card or link without requiring the `Spaces` filter.

Good outcomes include:

- feed ordering or grouping that keeps at least one public Space item visible in
  the initial public feed when public Spaces exist;
- a small public Spaces rail/section using the same safe public Space data;
- a clearer default Discover composition that shows public Spaces alongside
  documents, discussions, and Developer Spaces without hiding them behind a
  filter.

If the backend truly returns no public Space data in the default feed, fix that
or wake MIMIR with the exact data blocker. Do not fake a Space card from private
or unsafe data.

## Scope

Inspect:

- `apps/api/src/routes/discover.ts`;
- `apps/web/components/discover/discover-front-door.tsx`;
- `apps/web/components/discover/feed-shared.ts`;
- `apps/web/lib/discover-feed-controls.ts`;
- Discover/search/writing tests touched by PR374.

Keep the route and visibility rules from PR374:

- public Space cards come only from `spaces.is_public = true`;
- unsafe or UUID-shaped Space slugs do not route;
- private Spaces and private identifiers stay hidden.

## Non-Scope

Do not open:

- broad Discover redesign;
- publishing, approval, document, or discussion semantics;
- new search backend;
- auth/session changes;
- provider, Redis, Cloudflare, worker, queue, schema, migration, or billing
  changes;
- public/private visibility changes beyond safe Discover placement.

## Acceptance

Pass when:

- an unfiltered `/discover` initial load can visibly expose at least one public
  Space card/link when public Space data exists;
- the Space affordance is clear, such as `Space` and `Open public Space`;
- the card/link opens `/space/:slug`;
- public document and linked discussion routeability remains intact;
- filters still work, including the `Spaces` filter;
- private Spaces, unsafe/UUID-shaped Space slugs, raw IDs, raw URLs, raw JSON,
  private archive/source data, owner IDs, SQL, stack traces, and secret-shaped
  values are not rendered.

## Validation

If code changes:

```bash
npm exec --yes pnpm@10.32.1 -- run test:community
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/components/discover/search-dropdown.test.ts apps/web/lib/writing-feed.test.ts
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run test:writing
npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck
npm exec --yes pnpm@10.32.1 -- --filter @station/web lint
npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck
git diff --check
```

## Handoff

If DAEDALUS patches code, wake ARGUS with:

- changed files;
- exact unfiltered Discover placement gap closed;
- validation results;
- proof the public Space visibility/slug safety from PR374 still holds;
- whether ARIADNE should rerun PR375 after deploy.

If no patch is safe, wake MIMIR with:

- the exact data or product blocker;
- the recommended next route.

## DAEDALUS Result

DAEDALUS implemented the narrow Discover placement patch on 2026-06-27:
`docs/roadmap/PR376_DISCOVER_PUBLIC_SPACE_INITIAL_FEED_RESULT.md`.

Summary:

- Unfiltered `/discover` now renders a `Public Spaces` rail above feed controls
  when safe Space feed items are already loaded.
- The rail reuses the existing PR374 Space card with the `Open public Space`
  cue.
- The new helper only accepts strict `/space/:slug` Space hrefs and rejects
  unsafe slugs, UUID-shaped slugs, and Space document routes.
- The `Spaces` filter and normal feed remain unchanged.

ARGUS accepted PR376 on 2026-06-27. The rail is sourced only from
already-loaded, normalized `type: "space"` feed items with strict safe
`/space/:slug` hrefs, and it does not invent cards from missing, private, or
unsafe Space data.

Current baton: MIMIR should close PR376 and decide the next roadmap move. If
MIMIR wants hosted proof after deploy, ARIADNE should rerun the PR375 route
proof and verify the public Space card/link appears on initial unfiltered
`/discover`.
