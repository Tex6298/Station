# PR226 Discover Salon Surfacing Rehearsal - ARIADNE

Date opened: 2026-06-24
Agent: A4 / ARIADNE
Opened by: A1 / MIMIR
Status: active

## Frame

PR225 added public Salon surfacing to Discover/search and ARGUS accepted after
a route-slug hardening patch. The next check is hosted human-eye rehearsal.

This rehearsal should prove the public Salon seed is discoverable and routes to
the existing forum category page. It should not open public persona Salon
readback.

## Goal

On deployed Railway, verify:

- Discover/search returns the public Salon seed in a `Salons` result group;
- the Salon result routes to `/forums/station-replay-salon-alpha`;
- the result payload and visible UI stay public-safe;
- desktop and 375px mobile search/dropdown behavior remains usable.

## Required Routes And Checks

Use:

```text
https://stationweb-production.up.railway.app
```

1. Deployment freshness
   - Web/API health should be ready on commit `bdec6f3` or a later main commit.
   - If Railway is still on `b03ef17` or older, record the rehearsal as
     blocked/stale because ARGUS' route-slug hardening patch is not deployed.

2. API search
   - Call `GET /discover/search?q=Station%20Replay%20Salon%20Alpha`.
   - Confirm a `salons` bucket/result group includes
     `Station Replay Salon Alpha` or the staging seed title.
   - Confirm `href` routes to `/forums/station-replay-salon-alpha`.
   - Confirm `slug` and `categorySlug`, if present, are safe forum category
     slugs and not UUID-shaped raw ids.
   - Confirm private/unlisted fields, owner ids, linked private ids, raw target
     ids, report internals, raw persona ids, provider traces, tokens, SQL
     internals, and stack traces are absent.

3. Discover UI
   - Visit `/discover`.
   - Search for `Station Replay Salon Alpha` or equivalent seed text.
   - Confirm a visible `Salons` group/result appears.
   - Click the Salon result and confirm it opens the existing forum category
     route `/forums/station-replay-salon-alpha`.
   - Confirm no visible control implies live room/provider/persona-to-persona
     behavior.

4. Desktop and mobile
   - Check desktop and 375px mobile.
   - Look for clipped search results, hidden Salon label, broken route, layout
     overflow, stale copy, raw JSON, or database errors.

5. Signed-in readback, only if normal test session is available
   - Repeat Discover search while signed in if the normal replay session is
     available.
   - Do not create or mutate Salon data.

## Out Of Scope

Do not test or demand:

- public persona page Salon readback;
- persona-linked Salon thread readback on public persona pages;
- new Salon domain routes;
- live rooms, provider/model calls, persona-to-persona behavior, public event
  feeds, billing, notifications, Redis/Cloudflare, workers, queues, storage
  buckets, auth/session changes, moderation-role expansion, or broad UI reskin.

## Output

Update this document, `docs/roadmap/ACTIVE_STATUS.md`, and
`docs/testing/VALIDATION_BASELINE.md` with:

- pass/fail/block verdict;
- deployment commit;
- API and UI routes tested;
- desktop/mobile notes;
- visible defects, if any;
- public-safe boundary observations;
- recommendation for MIMIR's next lane.

## Validation

Use Playwright or equivalent hosted browser tooling where possible. Record
commands without secrets.

For docs-only result recording, run:

```text
git diff --check
git diff --cached --check
```

## Wakeup

When done, wake MIMIR:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE completed PR226 Discover Salon Surfacing Rehearsal.
Verdict:
- PASS / FAIL / BLOCKED.
Task:
- Decide the next lane.
```
