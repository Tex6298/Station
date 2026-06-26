# PR338 - UX-05 Forum Browsing Clarity

Owner: DAEDALUS

Date: 2026-06-26

Status: Accepted by ARGUS

## Why This Opens

PR337 passed hosted Discover/Writing rehearsal, so the Discover controls slice
is safe to describe as deployed UX within its accepted boundary.

MIMIR is keeping the next lane inside UX-05 because the public/community
browsing experience is not only Discover. Hosted/forum screenshots showed
forum category rows and reply/count presentation reading like generic, awkward
cards. The next smallest useful public-surface slice is forum browsing clarity:
make forum rows, counts, route labels, and category/thread entry points feel
intentional and usable without changing community permissions.

## Inputs

Use:

- `docs/roadmap/STATION_UI_UX_ROADMAP.md` UX-05
- `docs/roadmap/PR337_UX05_DISCOVER_HOSTED_REHEARSAL_RESULT.md`
- current `docs/roadmap/ACTIVE_STATUS.md`
- hosted public routes `/forums` and the visible replay forum thread routes

## Task

Implement the smallest safe no-new-config UX-05 slice that improves Forums /
community browsing clarity.

Start by inspecting:

- `apps/web/app/forums`
- forum/community helper components and tests
- route helpers used by Discover forum cards

Preferred implementation shape:

- make forum category/thread rows read as intentional community navigation,
  not generic cards;
- fix reply/count/status presentation so labels do not overlap or imply
  unsupported actions;
- preserve routeability into existing category, subcommunity, and thread
  routes;
- keep moderation/reporting controls unchanged unless the touched surface
  already exposes them and they need disabled/preview clarity;
- keep public/community/private visibility boundaries unchanged;
- improve desktop and `375px` mobile readability where touched.

If the safe slice is smaller than the above, implement the smaller slice and
record the exact next UX-05 follow-up. If no safe implementation slice exists,
return a route/component map and recommendation instead of forcing a change.

## Hard Limits

Do not:

- add schemas, migrations, config, Railway, Supabase, Stripe, provider/model,
  Redis, Cloudflare, queue, worker, deploy, key, or database-admin changes;
- change forum/community/private visibility, membership, moderation, reporting,
  or publication semantics;
- expose private Studio, Memory, Canon, Archive, Integrity, Continuity, owner
  ids, source bodies, provider payloads, credentials, cookies, or raw private
  identifiers;
- implement anonymous chat, durable visitor transcripts, public launch,
  commercial readiness, partner claims, recommendation algorithms, or broad
  site redesign;
- rewrite Discover, public Space, Developer Spaces, Billing, onboarding, or the
  whole design system.

## Validation

Run the narrowest meaningful validation for touched code. Expected candidates:

```text
npm exec --yes pnpm@10.32.1 -- run test:community
npm exec --yes pnpm@10.32.1 -- run test:writing
npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck
git diff --check
```

If one command is not relevant to the final touched files, record why it was
not run.

## Result Required

Create:

```text
docs/roadmap/PR338_UX05_FORUM_BROWSING_CLARITY_RESULT.md
```

If code changes land, wake ARGUS with:

- summary of forum browsing clarity changes;
- exact routes/components touched;
- validation results;
- visibility/privacy/moderation risks to review;
- whether ARIADNE should run hosted desktop/mobile forum rehearsal after
  review.

If no code changes land, wake MIMIR with:

- verdict;
- route/component map;
- exact recommended next implementation slice.
