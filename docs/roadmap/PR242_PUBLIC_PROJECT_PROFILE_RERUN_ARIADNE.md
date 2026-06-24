# PR242 - Public Project Profile Focused Hosted Rerun

Owner: ARIADNE
Reviewer: MIMIR
Status: Open
Opened: 2026-06-24

## Frame

PR240 failed because hosted `/projects/public/:slug` redirected to login.
PR241 repaired the web auth helper so `/projects/public` route-family paths are
anonymous while owner Project routes stay protected.

This is a focused hosted rerun for that exact web redirect failure.

## Hosted Target

- Web: `https://stationweb-production.up.railway.app`
- Required deployed code commit: `812de73` or later.

If web or API `/health/deployment` reports an older commit, return `BLOCKED`
with the observed commit and do not judge the fix.

## Seed

Prefer the PR240 hosted seed if it still exists:

```text
ariadne-pr240-public-profile-202606241001
```

If it is missing, reuse an existing public Project or create one bounded public
rehearsal Project through existing owner APIs only to exercise the public
profile route. Do not broaden product scope.

## Required Checks

1. Confirm web and API `/health/deployment` are healthy and report commit
   `812de73` or later.
2. Exercise anonymous `GET /projects/public/:slug` for the public Project seed.
3. Confirm the API payload remains inside the PR239 allowlist.
4. Open `/projects/public/[slug]` anonymously on desktop and around `375px`
   mobile.
5. Confirm the web page renders the public Project profile instead of
   redirecting to login.
6. Confirm visible page content includes only public Project metadata,
   `publicDeveloperSpaceCount`, attached public Developer Space summaries, and
   empty state if applicable.
7. Confirm invalid, UUID-shaped, and known private Project slugs stay closed
   through the public API/page.
8. Confirm signed-out owner-only `/projects/:slug` still redirects to login and
   does not expose Project evidence.

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

Return `PASS` only if hosted deployment is fresh, the anonymous public Project
page renders, private/unsafe routes stay closed, and the page/API boundary is
clean.

Return `FAIL` if hosted deployment is fresh but the page still redirects,
leaks forbidden fields, exposes private/non-public Projects, or misleads users
about deferred capabilities.

Return `BLOCKED` if Railway is stale, auth/setup cannot locate or create a
usable public Project seed, or the route cannot be exercised without broadening
scope.

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE completed PR242 Public Project Profile focused hosted rerun.
Verdict:
- PASS / FAIL / BLOCKED.
Task:
- If PASS, close PR239/PR240/PR241/PR242 and choose the next lane.
- If FAIL/BLOCKED, route exact hosted defects to DAEDALUS or ARGUS.
```

## ARIADNE Result - 2026-06-24

Verdict: `PASS`.

Hosted evidence:

- Web and API `/health/deployment` were healthy, ready, on branch `main`, and
  at required commit `812de73` or later.
- Replay owner sign-in succeeded from local `.env` without printing secrets.
- Reused the PR240 public Project seed:
  `ariadne-pr240-public-profile-202606241001`.
- Anonymous API `GET /projects/public/:slug` returned `200` for the seed and
  stayed inside the PR239 allowlist: Project `name`, `slug`, `description`,
  `visibility`, `createdAt`, `updatedAt`, `publicDeveloperSpaceCount`, plus an
  empty/safe public Developer Space summary list.
- Hosted desktop and `375px` mobile visits to
  `/projects/public/ariadne-pr240-public-profile-202606241001` rendered the
  public Project profile instead of redirecting to login.
- Visible page content stayed to public Project metadata, public Developer
  Spaces count, and the empty public Developer Space state. It did not expose
  private ids, owner fields, evidence/docs/activity, provider/runtime,
  billing/export, Redis/Cloudflare, raw JSON, or login-form copy.
- UUID-shaped, invalid, and known private Project slugs stayed closed through
  the public API/page.
- Signed-out owner-only `/projects/:slug` still redirected to login and did
  not expose Project evidence.

Validation:

- `npx --yes --package @playwright/test@1.41.2 playwright test tmp-pr242-public-project-profile-rerun.spec.js --reporter=line --workers=1`
  passed with 1 hosted test.

Next:

- MIMIR can close the PR239/PR240/PR241/PR242 public Project profile loop and
  choose the next lane.
