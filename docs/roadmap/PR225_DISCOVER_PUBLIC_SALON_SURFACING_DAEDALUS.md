# PR225 Discover Public Salon Surfacing - DAEDALUS

Date opened: 2026-06-24
Agent: A2 / DAEDALUS
Opened by: A1 / MIMIR
Status: accepted by ARGUS after narrow patch

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

## DAEDALUS Implementation Result

Date completed: 2026-06-24

Result:

- Added a `salons` bucket to `GET /discover/search`.
- Salon search results are sourced only from active `salon` subcommunities with
  readable visibility:
  - anonymous visitors see public Salons only;
  - signed-in community-eligible users follow the existing Discover community
    visibility semantics and can also see community Salons.
- Salon search payloads contain only safe route/readback fields:
  `slug`, `title`, `description`, `type`, `label`, `visibility`, `status`, and
  `href`.
- Salon search hrefs route to existing forum category routes, for example
  `/forums/station-replay-salon-alpha`; no new Salon domain route was added.
- API and web route helpers reject UUID-shaped route slugs instead of treating
  raw-id-shaped slugs as safe forum routes.
- The Discover search dropdown now includes a `Salons` group and routes Salon
  entries from safe slugs only.
- Discover front-door search copy now names Salons alongside personas,
  projects, Spaces, publications, and forum threads.

Files changed:

- `apps/api/src/routes/discover.ts`
- `apps/api/src/routes/community.test.ts`
- `apps/web/components/discover/search-dropdown.tsx`
- `apps/web/components/discover/search-dropdown.test.ts`
- `apps/web/components/discover/discover-front-door.tsx`
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/roadmap/PR225_DISCOVER_PUBLIC_SALON_SURFACING_DAEDALUS.md`
- `docs/roadmap/STATION_FUTURE_LANES.md`
- `docs/testing/VALIDATION_BASELINE.md`

Validation:

- `npm exec --yes pnpm@10.32.1 -- run test:community` passed with 23 tests.
- `npm exec --yes pnpm@10.32.1 -- tsx --test apps/web/components/discover/search-dropdown.test.ts`
  passed with 5 tests.
- `npm exec --yes pnpm@10.32.1 -- run typecheck` passed.
- `npm exec --yes pnpm@10.32.1 -- run lint` passed with the existing raw
  `<img>` warnings in `apps/web/app/space/[slug]/page.tsx` and
  `apps/web/components/discover/discover-front-door.tsx`.

Scope confirmation:

- No public persona page Salon readback, persona-linked Salon thread readback
  on public persona pages, raw persona-id public surface, direct
  subcommunity-to-persona link, realtime room, provider/model call,
  persona-to-persona behavior, public event feed, billing, notification,
  Redis/Cloudflare, worker, queue, storage bucket, auth/session policy,
  webhook, moderation-role expansion, or broad UI reskin was added.

## ARGUS Review Result

Completed: 2026-06-24

Verdict: accepted after a narrow route-slug hardening patch.

ARGUS patch:

- Normalized Salon search payload `slug` and new `categorySlug` to the same
  validated forum category slug used for `href`.
- Added API coverage proving an unsafe UUID-shaped subcommunity slug does not
  leak into the Discover Salon payload or drive a route when the linked forum
  category has a safe slug.

Review notes:

- Anonymous Discover search sees public active Salons only.
- Signed-in community-eligible Discover search follows the existing community
  visibility semantics and may also see community-visible active Salons.
- Private, unlisted, paused, and non-Salon subcommunities remain excluded from
  the Salon bucket.
- Salon search results route only to existing `/forums/<categorySlug>` forum
  category pages. No new Salon domain route was added.
- Payload fields remain bounded to route/readback data: `slug`,
  `categorySlug`, `title`, `description`, `type`, `label`, `visibility`,
  `status`, and `href`.
- The Discover dropdown derives Salon hrefs from safe slugs and rejects
  UUID-shaped values; it does not trust arbitrary result `href` values.
- PR225 stayed out of public persona page Salon readback, persona-linked Salon
  thread readback, direct subcommunity-to-persona links, realtime rooms,
  provider/model calls, persona-to-persona behavior, public event feeds,
  billing, notifications, Redis/Cloudflare, workers, queues, storage buckets,
  auth/session policy, webhooks, moderation-role expansion, and broad UI
  reskin.

ARGUS recommendation:

- ARIADNE should run one focused hosted rehearsal for Discover search finding
  the public Salon seed and routing to the existing forum category page, because
  PR225 changes public search routeability and visible Discover copy.

ARGUS validation:

- `npm exec --yes pnpm@10.32.1 -- run test:community` passed with 23 tests.
- `npm exec --yes pnpm@10.32.1 -- tsx --test apps/web/components/discover/search-dropdown.test.ts`
  passed with 5 tests.
- `npm exec --yes pnpm@10.32.1 -- run typecheck` passed.
- `npm exec --yes pnpm@10.32.1 -- run lint` passed with existing raw `<img>`
  warnings in `apps/web/app/space/[slug]/page.tsx` and
  `apps/web/components/discover/discover-front-door.tsx`.
- `git diff --check` passed with CRLF normalization warnings only.
- `git diff --cached --check` passed.

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
