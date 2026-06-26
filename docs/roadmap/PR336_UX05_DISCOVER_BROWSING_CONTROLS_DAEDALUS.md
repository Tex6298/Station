# PR336 - UX-05 Discover Browsing Controls

Owner: DAEDALUS

Date: 2026-06-26

Status: Open

## Why This Opens

PR335 passed the hosted public Space rehearsal, so UX-04 is safe to describe as
deployed public Space presentation UX within its accepted scope.

MIMIR is opening UX-05 next because the clearest remaining public-surface defect
is not styling alone: Discover/community controls that look interactive must
either change visible state/results or be disabled/clearly non-interactive. The
known user-facing complaint is the Discover filter/tab/search cluster:

```text
Latest / Featured / Staff picks
All / Essay / Codex / Manifesto / Research / Field Log / Theory
Search essays, codexes, research...
```

This lane is about actual browsing affordances and route clarity, not a broad
site redesign.

## Inputs

Use:

- `docs/roadmap/STATION_UI_UX_ROADMAP.md` UX-05
- `docs/roadmap/PR335_UX04_PUBLIC_SPACE_HOSTED_REHEARSAL_RESULT.md`
- current `docs/roadmap/ACTIVE_STATUS.md`
- hosted public route evidence from `/discover`, `/space/station-replay-alpha`,
  and `/forums`

## Task

Implement the smallest safe no-new-config UX-05 slice that makes Discover
browsing controls honest and useful.

Start by inspecting:

- `apps/web/app/discover`
- `apps/web/components/discover`
- Discover/public feed/search helper tests
- forum/community route helpers if the Discover path links there

Preferred implementation shape:

- make the visible Discover tab/filter/search controls update state and visible
  result sets using existing public/community-safe data; or
- if a control is not supported yet, make it disabled or visibly preview-only so
  staging does not feel broken;
- preserve routeability from Discover into public Space, public document,
  public forum discussion, public persona, and Developer Space cards where
  present;
- keep public/community/private visibility boundaries unchanged;
- improve desktop and `375px` mobile control readability where touched.

If the safe slice is smaller than the above, implement the smaller slice and
record the exact next UX-05 follow-up. If no safe implementation slice exists,
return a route/component map and recommendation instead of forcing a change.

## Hard Limits

Do not:

- add schemas, migrations, config, Railway, Supabase, Stripe, provider/model,
  Redis, Cloudflare, queue, worker, deploy, key, or database-admin changes;
- change public/community/private visibility rules;
- expose private Studio, Memory, Canon, Archive, Integrity, Continuity, owner
  ids, source bodies, provider payloads, credentials, cookies, or raw private
  identifiers;
- implement anonymous chat, durable visitor transcripts, public launch,
  commercial readiness, partner claims, or broad recommendation algorithms;
- rewrite Forums, public Space, Developer Spaces, Billing, onboarding, or the
  whole design system.

## Validation

Run the narrowest meaningful validation for touched code. Expected candidates:

```text
npm exec --yes pnpm@10.32.1 -- run test:community
npm exec --yes pnpm@10.32.1 -- run test:writing
npm exec --yes pnpm@10.32.1 -- run test:developer-spaces
npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck
git diff --check
```

If one command is not relevant to the final touched files, record why it was
not run.

## Result Required

Create:

```text
docs/roadmap/PR336_UX05_DISCOVER_BROWSING_CONTROLS_RESULT.md
```

If code changes land, wake ARGUS with:

- summary of controls made functional or explicitly non-interactive;
- exact routes/components touched;
- validation results;
- visibility/privacy risks to review;
- whether ARIADNE should run hosted desktop/mobile Discover rehearsal after
  review.

If no code changes land, wake MIMIR with:

- verdict;
- route/component map;
- exact recommended next implementation slice.
