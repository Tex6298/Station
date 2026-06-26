# PR351 - UX-09 Railway Staging Sweep Prep

Owner: DAEDALUS

Date: 2026-06-26

Status: Open

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- PR350 passed hosted UX-08 onboarding Public step proof.
- UX-08 first Space/public publishing onboarding proof is closed for this deployed slice.
- MIMIR is moving to UX-09 Railway staging UX review.
Task:
- Prepare the staging sweep packet for ARIADNE.
- Include staging URLs, replay account key names, route order, known limitations, mutation boundaries, and expected result doc.
- Do not implement product changes unless a tiny docs/test hygiene fix is required to make the sweep runnable.
- Wake MIMIR with the exact ARIADNE rehearsal packet recommendation, or wake ARGUS if code changes land.
```

## Goal

Prepare the broad UX-09 browser sweep so ARIADNE can run it like a human
rehearsal instead of guessing route order, credentials, scope, or known caveats.

This is a staging-sweep preparation lane, not a product implementation lane.

## Staging Targets

Use these current Railway targets unless the repo proves a newer value:

```text
https://stationweb-production.up.railway.app
https://stationapi-production.up.railway.app
```

Use local ignored `.env` key names only for replay auth:

```text
STATION_REPLAY_OWNER_EMAIL
STATION_REPLAY_OWNER_PASSWORD
```

Do not print, log, screenshot, commit, or summarize credential values, cookies,
tokens, raw owner IDs, Stripe IDs, or secret-shaped values.

## Sweep Scope

Prepare ARIADNE to cover:

- public landing/home;
- Discover;
- public Space;
- public document;
- linked forum discussion;
- Forums directory/category/thread;
- public Developer Space observatory;
- signed-in Studio dashboard;
- onboarding and Public step;
- private persona workspace;
- Memory;
- Continuity;
- Archive/files;
- Integrity entry;
- Spaces and first Space/public publishing entrypoint;
- Station Assistant;
- Billing/Pricing display;
- Settings if useful for token/storage readback;
- mobile breakpoints around `375px` or `390px`.

## Known Boundaries

The sweep must not:

- create Checkout sessions;
- open Billing Portal;
- mutate Stripe or entitlement state;
- create/publish content unless explicitly scoped;
- create Spaces unless explicitly scoped;
- send Assistant messages unless explicitly scoped;
- upload/import files;
- change visibility;
- print secrets, IDs, cookies, tokens, or raw private payloads;
- broaden into provider/model, Redis, Cloudflare, queue, worker, schema, or
  migration work.

Use routeability/readability checks where mutation would be needed.

## Prep Deliverable

Create:

```text
docs/roadmap/PR351_UX09_RAILWAY_STAGING_SWEEP_PREP_RESULT.md
```

Include:

- confirmed web/API URLs;
- account handling notes using key names only;
- route order for ARIADNE;
- expected pass/caveat/fail/block criteria;
- known current caveats to carry into the sweep;
- mutation boundaries;
- exact recommended PR352 ARIADNE packet;
- validation, likely `git diff --check` only unless code changes land.

If a tiny docs-only update is needed to make the sweep packet clear, include it.
If product code changes land, wake ARGUS for review instead of MIMIR.
