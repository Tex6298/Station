# PR216 Public Persona Roulette - DAEDALUS

Date opened: 2026-06-24
Agent: A2 / DAEDALUS
Opened by: A1 / MIMIR
Status: implemented - awaiting ARGUS review

## Frame

PR215 recommends Public Persona Roulette as the next public interaction slice.
MIMIR accepts that recommendation without a separate ARGUS preflight because
the first slice is discovery/readback only:

- no provider call from Roulette;
- no anonymous chat expansion;
- no public event feed;
- no new external config;
- eligible public personas only;
- existing public serializers and public persona pages.

This lane should make public personas easier to find and route to. It should
not create a new encounter/chat product yet.

## Goal

Add the smallest public persona Roulette affordance as routeable public
discovery/readback.

The expected shape is a bounded public draw/list endpoint plus the smallest web
affordance or helper needed to make the draw discoverable.

## Required Work

1. API route
   - Add a bounded public roulette/draw route, registered before
     `/personas/public/:publicSlug`.
   - Accept deterministic seed/order support if useful for tests and stable UX.
   - Return only eligible public personas.
   - Reuse existing public persona eligibility and serialization boundaries.

2. Payload
   - Return only public profile fields needed for a card:
     `name`, `shortDescription`, `avatarUrl`, safe `publicSlug`, public route
     `href`, and `publicChat` capability.
   - Do not expose raw persona ids, owner ids, private visibility internals,
     provider/setup fields, owner aggregate counters, report counts/statuses,
     private context buckets, or unsafe UUID-shaped public slugs.

3. Discover routeability
   - Fix the current Discover public persona search gap if it is in the same
     narrow path: public persona search currently queries personas but web
     grouping/routeability omits them.
   - If touching Discover search, select/use `public_slug` and route public
     persona results through the public persona route.
   - Do not rewrite Discover ranking/feed behavior broadly.

4. Web affordance
   - Add the smallest affordance that makes Roulette discoverable from existing
     public discovery surfaces.
   - Keep it consistent with the current public UI direction.
   - It may be a button/card/helper, not a new app section unless the repo
     already has a clear pattern.

5. Tests
   - Add focused API tests for eligible-only public persona draws.
   - Prove private/ineligible/unsafe-slug personas are excluded.
   - Prove payloads contain no raw ids/private fields/owner activity/report
     data.
   - Add focused web/helper tests if web routeability is touched.

## Hard Boundaries

Do not add:

- provider/model calls from Roulette;
- anonymous public chat expansion;
- public event feeds;
- voice/avatar media;
- persona-to-persona calls;
- billing, queues, workers, Redis, or Cloudflare;
- raw event logs or analytics expansion;
- private memory/archive/canon/continuity/integrity exposure;
- broad UI reskin or Discover feed rewrite.

If the implementation cannot stay discovery/readback-only, wake MIMIR before
expanding scope.

## Validation

Run focused validation:

```text
npm exec --yes pnpm@10.32.1 -- run test:personas
npm exec --yes pnpm@10.32.1 -- run test:discover
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- run lint
git diff --check
git diff --cached --check
```

If `test:discover` does not exist, run the closest focused web/helper test and
record the exact command. If lint has known unrelated warnings, record them
exactly.

## Output

Return one of:

```text
IMPLEMENTED
BLOCKED: scope wants provider/encounter/event behavior
BLOCKED: routeability requires broader Discover rewrite
```

Include:

- API route/payload summary;
- Discover/web affordance summary;
- safety/privacy notes;
- validation results;
- exact next wakeup target.

## Wakeup

If implemented, wake ARGUS:

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS implemented PR216 Public Persona Roulette discovery/readback.
- The slice should be eligible public personas only, existing public
  serializers, no provider calls, and no anonymous chat expansion.
Risk:
- Public discovery can leak ineligible personas, unsafe slugs, owner/private
  fields, report/aggregate activity, or route ordering bugs if serializers or
  route registration are wrong.
Task:
- Review eligibility, serializer leakage, route ordering before
  /public/:publicSlug, Discover search routeability, tests, and public/private
  boundaries.
```

If blocked by scope expansion, wake MIMIR with the smallest options.

## DAEDALUS Result

Date completed: 2026-06-24

Verdict: `IMPLEMENTED`

### API Route And Payload

- Added `GET /personas/public/roulette` before the slug-shaped public persona
  routes.
- The route accepts a bounded `limit` and deterministic `seed`; when no seed is
  supplied it uses a daily UTC seed.
- The route returns only eligible public personas with safe public slugs:
  `name`, `shortDescription`, `avatarUrl`, `publicSlug`, `href`, and
  `publicChat`.
- The route excludes private personas, ineligible owners, unsafe UUID-shaped
  slugs, owner ids, raw persona ids, provider/setup fields, owner aggregate
  counters, report details, and private source buckets.

### Discover And Web Affordance

- `/discover/search` now maps public persona results through safe public slug
  routeability and strips owner/raw DB fields before returning results.
- The public search UI includes a `Public personas` group and routes persona
  results through `/personas/:publicSlug`.
- The Discover sidebar has a small `Persona roulette` panel that fetches the
  bounded draw and links to existing public persona pages. The main Discover
  feed/ranking was not rewritten.

### Safety Notes

- Roulette does not call a provider/model.
- Roulette does not expand anonymous chat.
- Roulette does not add event feeds, raw logs, analytics, billing, queues,
  Redis/Cloudflare/workers, voice/avatar media, or persona-to-persona behavior.
- Public persona chat remains on the existing signed-in alpha route.

### Validation

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:personas` | Pass | 12 tests passed, including new roulette eligibility/leakage coverage. |
| `npm exec --yes pnpm@10.32.1 -- run test:community` | Pass | 22 tests passed, including new Discover persona search routeability coverage. |
| `npm exec --yes pnpm@10.32.1 -- tsx --test apps/web/components/discover/search-dropdown.test.ts` | Pass | 4 tests passed. This is the closest focused web/helper test because no root `test:discover` script exists. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck passed. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass with existing warnings | Existing raw `<img>` warnings remain in `apps/web/app/space/[slug]/page.tsx` and `apps/web/components/discover/discover-front-door.tsx`. |

`git diff --check` and `git diff --cached --check` are run at commit time.

### Next Wakeup

Wake ARGUS for hostile review of eligibility, serializer leakage, route ordering
before `/public/:publicSlug`, Discover search routeability, tests, and
public/private boundaries.
