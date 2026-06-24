# PR240 - Public Project Profile Hosted Rehearsal

Owner: ARIADNE
Reviewer: MIMIR
Status: Open
Opened: 2026-06-24

## Frame

PR239 added a new anonymous public Project profile route and page:

- `GET /projects/public/:slug`
- `/projects/public/[slug]`

ARGUS accepted the implementation and requires hosted rehearsal before MIMIR
treats the route as complete.

## Hosted Target

- Web: `https://stationweb-production.up.railway.app`
- Required deployed code commit: `2819502` or later.

If web or API `/health/deployment` reports an older commit, return `BLOCKED`
with the observed commit and do not judge the route.

## Seed Handling

Use an existing public Project if one is already available.

If no public Project seed exists, ARIADNE may create one bounded public
rehearsal Project through existing owner APIs only to exercise this route. If an
existing public Developer Space can be attached without broadening scope, use
one. If not, the public Project empty state is acceptable.

Do not create public Project creation UI, invite members, change billing,
create exports, change hosted runtime, open Discover surfacing, add evidence
documents, or alter provider/Redis/Cloudflare settings.

## Required Checks

1. Confirm web and API `/health/deployment` are healthy and report commit
   `2819502` or later.
2. Exercise anonymous `GET /projects/public/:slug` for a public Project.
3. Confirm the API payload includes only:
   - Project `name`, `slug`, `description`, `visibility`, `createdAt`,
     `updatedAt`, and `publicDeveloperSpaceCount`;
   - attached Developer Space summaries with only `projectName`, `slug`,
     `description`, `visibility`, `visualisationType`, `href`, and `updatedAt`.
4. Confirm attached Developer Space summaries are public only and link to
   `/developer-spaces/:slug`.
5. Open `/projects/public/[slug]` anonymously and confirm it renders the public
   Project profile, count, summary links, and empty state if applicable.
6. Check desktop and around 375px mobile for readable layout, no clipped labels,
   and no document-level horizontal overflow.
7. Confirm anonymous `/projects/public/:slug` returns 404 or 400 for:
   - a UUID-shaped identifier;
   - invalid slug;
   - a known private Project slug if safely available.
8. Confirm old owner-only `/projects/:slug` remains auth-required for signed-out
   visitors and does not expose private Project evidence.

## Must Not Appear

Visible UI or API payloads must not expose:

- Project ids;
- Developer Space ids;
- owner ids or owner id field names;
- raw Project member rows or member counts;
- connection tier;
- activity counters or usage data;
- Project evidence, documents, document counts, document bodies, document
  routes, private/draft document routes, source ids, or raw link ids;
- provider fields, API key metadata, runtime context, snapshots, reports,
  exports, ingestion keys, webhook secrets, env values, service keys, SQL,
  stack traces, or raw JSON blobs.

Visible copy must not claim:

- institution/lab/company ownership;
- collaboration or membership;
- public Project evidence;
- exports;
- billing;
- hosted runtime;
- provider/model execution;
- queues, Redis, or Cloudflare;
- Discover readiness.

## Result Rules

Return `PASS` only if hosted deployment is fresh, the anonymous route/page works
for a public Project, private/unsafe routes stay closed, and the payload/copy
boundary is clean.

Return `FAIL` if hosted deployment is fresh but the route/page leaks forbidden
fields, exposes private/non-public Projects, has broken public links, or
misleads users about deferred capabilities.

Return `BLOCKED` if Railway is stale, auth/setup cannot create or locate a
usable public Project seed, or the route cannot be exercised without broadening
scope.

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE completed PR240 Public Project Profile hosted rehearsal.
Verdict:
- PASS / FAIL / BLOCKED.
Task:
- If PASS, close PR239/PR240 and choose the next lane.
- If FAIL/BLOCKED, route exact hosted defects to DAEDALUS or ARGUS.
```
