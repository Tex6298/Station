# PR244 - Discover Public Project Hosted Rehearsal

Owner: ARIADNE
Reviewer: MIMIR
Status: Open
Opened: 2026-06-24

## Frame

PR243 added public Project surfacing to Discover search and ARGUS accepted the
local/API/web boundary. Because this is public visitor routeability, it needs a
hosted human-route proof before MIMIR closes the surfacing loop.

This rehearsal is intentionally narrow. It proves the already-accepted public
Project profile route can now be found from Discover search without reopening
Project evidence, documents, activity, membership, billing, provider, Redis, or
Cloudflare scope.

## Hosted Target

- Web: `https://stationweb-production.up.railway.app`
- Required deployed code commit: `b69ca8d` or later.

If web or API `/health/deployment` reports an older commit, return `BLOCKED`
with the observed commit and do not judge the fix.

## Preferred Seed

Reuse the existing public Project seed if it still exists:

```text
ariadne-pr240-public-profile-202606241001
```

If it is missing, create one bounded public rehearsal Project through existing
owner APIs only. Do not broaden product scope.

## Required Checks

1. Confirm web and API `/health/deployment` are healthy, ready, on branch
   `main`, and report commit `b69ca8d` or later.
2. Exercise anonymous API `GET /discover/search?q=<public-project-query>` and
   confirm a `projects` or equivalent Project result bucket appears.
3. Confirm the public Project result uses only safe public summary fields:
   `name`, `slug`, `description`, `visibility`, `href`, `type`, and `label`.
4. Confirm the Project href is `/projects/public/:slug`.
5. Open `/discover` anonymously on desktop and around `375px` mobile.
6. Use the Discover search UI to search for the public Project seed by slug,
   name, or unique description text.
7. Confirm the visible result bucket/card reads as a public Project result and
   does not overlap or overflow on desktop/mobile.
8. Click the Project result and confirm it opens the public Project profile,
   not an owner Project route and not a login redirect.
9. Confirm private, invalid, or UUID-shaped Project queries do not produce
   routeable Project results.
10. Spot-check that existing Discover result buckets/controls still work
    enough to show the Project addition did not break the page.

## Must Not Appear

Visible UI or API payloads must not expose:

- Project ids;
- Developer Space ids;
- owner ids or owner id field names;
- raw Project member rows, member counts, roles, invites, or connection tier;
- Project evidence, documents, document counts, document bodies, source ids,
  source bodies, raw link ids, or private/draft document routes;
- activity counters, usage data, reports, exports, billing, hosted runtime,
  provider/model execution, ingestion keys, webhook secrets, env values,
  service keys, SQL, stack traces, raw JSON blobs, Redis, Cloudflare, queues, or
  workers.

Visible copy must not claim:

- institution/lab/company ownership;
- collaboration or membership;
- public Project evidence;
- exports;
- billing;
- hosted runtime;
- provider/model execution;
- queues, Redis, or Cloudflare.

## Result Rules

Return `PASS` only if hosted deployment is fresh, anonymous Discover search
finds the public Project, the result routes to `/projects/public/:slug`, the
page fits desktop/mobile, and the public/private payload boundary is clean.

Return `FAIL` if hosted deployment is fresh but Discover search misses the
public Project, routes to an owner/private URL, leaks forbidden fields, exposes
private/non-public Projects, breaks existing Discover behavior, or misleads
users about deferred capabilities.

Return `BLOCKED` if Railway is stale, auth/setup cannot locate or create a
usable public Project seed, or the route cannot be exercised without broadening
scope.

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE completed PR244 Discover Public Project Hosted Rehearsal.
Verdict:
- PASS / FAIL / BLOCKED.
Task:
- If PASS, close the PR243/PR244 Discover Project surfacing loop and choose the
  next lane.
- If FAIL/BLOCKED, route exact hosted defects to DAEDALUS or ARGUS.
```
