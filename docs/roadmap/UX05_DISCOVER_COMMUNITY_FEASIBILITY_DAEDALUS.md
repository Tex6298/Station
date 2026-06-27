# UX-05 Discover And Community Browsing Feasibility

Owner: DAEDALUS
Reviewer: MIMIR, then ARGUS/ARIADNE for any implementation slice
Status: COMPLETE - WAKE MIMIR
Opened: 2026-06-27
Completed: 2026-06-27
Result: `docs/roadmap/UX05_DISCOVER_COMMUNITY_FEASIBILITY_RESULT.md`

## Why This Opens

UX-03A is accepted after ARGUS and ARIADNE review. UX-04 public Space
microsite work already has prior accepted evidence, including PR334 and hosted
public Space route checks, so MIMIR is not reopening public Space structure by
inertia.

The next public product risk is UX-05: Discover and community browsing. This is
the surface where Station can still look like a generic feed or a set of
unwired filters if the current route/action state is not reconciled.

This is a feasibility and current-state reconciliation pass. Do not implement
UI changes yet.

## Product Question

Can a visitor or signed-in user move through Station's public front door,
Discover, public Space/document links, and forum/community surfaces with clear
labels, working controls, honest visibility language, and no private-context
leakage?

DAEDALUS should answer this against current main, not older assumptions.

## Inputs

Read and reconcile:

- `docs/roadmap/STATION_UI_UX_ROADMAP.md`
- `docs/roadmap/DISCERN_DISCOVER_PUBLIC_REVIEW_MIMIR.md`
- `docs/roadmap/DISCERN_DISCOVER_PUBLIC_REVIEW_ARIADNE.md`
- `docs/roadmap/DISCERN_DISCOVER_SEARCH_BROWSER_ARIADNE.md`
- current `docs/roadmap/ACTIVE_STATUS.md` entries for PR374 through PR406
- current `docs/testing/VALIDATION_BASELINE.md`
- current Discover, search, and forum routes/components

Treat Discern as product direction only. Do not port code from Discern.

## Likely Surfaces

- `/`
- `/discover`
- `/forums`
- `/forums/[categorySlug]`
- `/forums/[categorySlug]/[threadId]`
- `/space/[slug]`
- `/space/[slug]/documents/[documentId]`

Likely files:

- `apps/web/components/discover/discover-front-door.tsx`
- `apps/web/components/discover/public-home.tsx`
- `apps/web/components/discover/search-dropdown.tsx`
- `apps/web/components/discover/search-dropdown.test.ts`
- `apps/web/components/discover/feed-shared.ts`
- `apps/web/app/discover/page.tsx`
- `apps/web/app/forums/page.tsx`
- `apps/web/app/forums/[categorySlug]/page.tsx`
- `apps/web/app/forums/[categorySlug]/[threadId]/page.tsx`
- `apps/api/src/routes/forums.ts`
- `apps/api/src/routes/community.test.ts`
- `apps/api/src/routes/spaces.ts`
- `apps/api/src/routes/spaces.test.ts`

Only inspect more files if current route/component references require it.

## What To Classify

Classify each area as solved, stale, fragile, or recommended next slice:

- public home to Discover route clarity;
- Discover search labels and public/community-visible result grouping;
- Discover tabs, category/filter chips, and search controls: are they wired,
  stateful, disabled, or misleading placeholders?
- Discover public Space and public document routeability;
- public document to linked forum discussion routeability;
- forum category and thread read paths;
- report/up/down/reply/watch-style controls: live, disabled, preview-only, or
  broken;
- signed-in versus anonymous copy for public and community-visible material;
- moderation/report visibility and safety language;
- mobile 375px/390px fit for Discover filters/search and forum lists;
- whether current styling has drifted away from Station's accepted public shell
  direction.

## Hard Boundaries

Do not change:

- backend visibility rules;
- moderation/report semantics;
- forum write semantics;
- document publication or linked-discussion semantics;
- public Space visibility;
- auth/session behavior;
- provider/model behavior;
- Redis, Cloudflare, Railway, Supabase, Stripe, schema, migration, worker,
  queue, config, deploy, key, or package behavior;
- broad global CSS;
- the landing page or public Space microsite unless a current bug proves they
  block UX-05 route coherence.

## Output Required

Create:

```text
docs/roadmap/UX05_DISCOVER_COMMUNITY_FEASIBILITY_RESULT.md
```

Include:

- current route/component map;
- current evidence that should be kept;
- stale assumptions from older Discern/public-search notes;
- exact controls that are live versus placeholder/broken;
- privacy/visibility risks;
- cheap next slice recommendation;
- ARGUS gates for that next slice;
- ARIADNE human rehearsal points.

If the best next slice is implementation, recommend one narrow named slice with
an allow-list. If no implementation is needed, say so plainly and recommend the
next roadmap lane.

## Validation For This Feasibility Pass

Run:

```bash
git diff --check
```

Also run an added-line sensitive-pattern scan for the docs-only patch before
committing.

Do not run broad browser or test suites unless you make code changes. If you
discover that a small local route probe is essential for the feasibility
answer, record exactly what was probed and keep it read-only.

## Wakeup Contract

When complete, DAEDALUS should commit with:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- DAEDALUS completed UX-05 Discover/community browsing feasibility.
- Current public/search/forum controls are classified as solved, stale,
  fragile, or next-slice candidates.
Task:
- Decide whether to open the recommended UX-05 implementation slice, choose
  another lane, or defer.
```
