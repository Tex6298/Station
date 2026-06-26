# PR337 - UX-05 Discover Hosted Rehearsal

Owner: ARIADNE

Date: 2026-06-26

Status: Open

## Why This Opens

ARGUS accepted PR336 after a narrow route-safety patch. The code/review risk is
closed enough, but PR336 changed visible public browsing controls on:

```text
/discover
/writing
```

ARIADNE should run a hosted desktop/mobile rehearsal after Railway has deployed
PR336 before MIMIR claims the Discover controls as deployed UX.

## Inputs

Use:

- `docs/roadmap/PR336_UX05_DISCOVER_BROWSING_CONTROLS_RESULT.md`
- current `docs/roadmap/ACTIVE_STATUS.md`
- hosted web: `https://stationweb-production.up.railway.app`

Primary hosted routes:

- `/discover`
- `/writing`
- `/space/station-replay-alpha`
- `/developer-spaces/station-replay-dev-alpha`
- `/forums`

## Task

Run a hosted human-eye rehearsal:

- confirm Railway appears to have deployed PR336;
- confirm `/discover` loads on desktop;
- confirm `/discover` loads on `375px` mobile;
- confirm Discover feed filters visibly change state/results or show honest
  empty/recovery states;
- confirm per-filter counts are present and do not imply backend-wide search or
  recommendation behavior;
- confirm curated/staff-pick cards remain routeable only to expected local
  public route families;
- confirm Discover routeability into public Space, Developer Space, public
  persona/document, or forum cards where present;
- confirm `/writing` shows unsupported `Staff picks` as disabled/preview-only,
  not as a live empty tab;
- confirm no private Studio memory, archive, canon, continuity, owner data, raw
  private identifiers, source bodies, provider payloads, credentials, or cookies
  are visible;
- confirm no document-level horizontal overflow, overlapping text, or trapped
  controls on desktop or `375px` mobile.

## Hard Limits

Do not:

- mutate hosted data;
- sign in unless needed for a clearly bounded current-viewer readback check;
- create/edit/delete Space, document, forum, moderation, memory, archive,
  continuity, canon, provider, billing, Developer Space, or Discover data;
- change code, schemas, migrations, config, Railway, Supabase, Stripe,
  provider/model settings, Redis, Cloudflare, queues, workers, deploy settings,
  keys, or database-admin state;
- contact testers;
- claim public launch, commercial/customer readiness, partner readiness,
  anonymous chat, durable visitor transcripts, recommendation quality, or broad
  site redesign.

## Result Required

Create:

```text
docs/roadmap/PR337_UX05_DISCOVER_HOSTED_REHEARSAL_RESULT.md
```

Return one verdict:

```text
PASS
PASS WITH CAVEAT
FAIL
BLOCKED
```

Wake MIMIR with:

- verdict;
- whether Railway had deployed PR336;
- desktop and `375px` mobile Discover result;
- Writing `Staff picks` disabled/preview-only result;
- routeability and privacy result;
- whether PR336 is safe to mention as deployed Discover controls UX;
- exact defects if any;
- exact next-owner recommendation.
