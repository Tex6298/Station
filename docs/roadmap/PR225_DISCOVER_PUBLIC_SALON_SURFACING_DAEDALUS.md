# PR225 Discover Public Salon Surfacing - DAEDALUS

Date opened: 2026-06-24
Agent: A2 / DAEDALUS
Opened by: A1 / MIMIR
Status: active

## Frame

Public Salons now have:

- durable `salon` subcommunity type;
- hosted migration/schema proof;
- public seed `station-replay-salon-alpha`;
- accepted directory/category readback;
- hosted ARIADNE rehearsal for the existing forum routes.

The next narrow step is Discover surfacing. Keep this as routeable public
readback, not public persona Salon readback.

## Goal

Make public Salons findable from Discover without widening private/community
visibility or introducing new product semantics:

- Discover/search should surface routeable public Salon entries when a query
  matches an eligible public Salon.
- Any Discover front-door affordance should point to existing forum/subcommunity
  or category routes, not a new Salon domain route.
- Results should label Salons honestly as asynchronous forum/community spaces.
- The seeded public Salon `station-replay-salon-alpha` should be findable by
  title/search terms after deployment.

## Required Scope

1. API/search
   - Inspect existing `apps/api/src/routes/discover.ts` behavior before
     changing it.
   - Add public Salon search/list results only from already-readable,
     active/public Salon subcommunities or their category route.
   - Follow existing viewer visibility semantics if signed-in Discover search
     already includes community-visible content. Do not invent a new visibility
     policy in this lane.
   - Result payloads must use safe route fields such as title, description,
     type/label, slug/href, and public visibility/status if already part of the
     public contract.
   - Do not expose owner ids, linked private ids, raw target ids, report
     internals, private/unlisted rows, raw persona ids, or provider traces.

2. Web Discover
   - Update existing Discover/search UI to show Salon results clearly.
   - Use existing forum/category hrefs, for example `/forums/<categorySlug>`.
   - If a small front-door card or link is needed, point it at existing public
     forum routes such as `/forums/subcommunities`; avoid a broad Discover page
     redesign.
   - Keep buttons/controls honest. Do not add visible controls that do not
     navigate or change state.

3. Tests
   - Add API coverage for public Salon search routeability and private/unlisted
     exclusion.
   - Add web helper/component coverage for Salon search result href/label if
     the Discover test harness supports it.

## Out Of Scope

Do not implement:

- public persona page Salon readback;
- persona-linked Salon thread readback on public persona pages;
- raw persona-id public surfaces;
- direct subcommunity-to-persona links;
- real-time rooms;
- provider/model calls;
- persona-to-persona behavior;
- public event feeds;
- billing, notifications, Redis/Cloudflare, workers, queues, storage buckets,
  auth/session policy, webhooks, moderation-role expansion, or broad UI reskin.

## Expected Touchpoints

Likely files:

- `apps/api/src/routes/discover.ts`
- `apps/api/src/routes/community.test.ts`
- `apps/web/components/discover/search-dropdown.tsx`
- `apps/web/components/discover/search-dropdown.test.ts`
- `apps/web/components/discover/discover-front-door.tsx`

Use repo evidence to adjust. If you find Discover already has a safer existing
path for public forum/subcommunity search, use it instead of adding a parallel
shape.

## Validation

Expected minimum:

```text
npm exec --yes pnpm@10.32.1 -- run test:community
npm exec --yes pnpm@10.32.1 -- tsx --test apps/web/components/discover/search-dropdown.test.ts
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- run lint
git diff --check
git diff --cached --check
```

If you do not touch the search dropdown test harness, document the closest
focused web validation you ran.

## Wakeup

When done, wake ARGUS:

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS implemented PR225 Discover Public Salon Surfacing.
Risk:
- Public Discover/search routeability changed and needs hostile visibility and
  payload review.
Task:
- Review public/private visibility, safe hrefs, payload fields, UI honesty, and
  validation. Patch if needed, then wake MIMIR with the verdict.
```
