# PR334 - UX-04 Public Space Microsite Structure

Owner: DAEDALUS

Date: 2026-06-26

Status: Open

## Why This Opens

PR333 passed the hosted owner Continuity recheck, so UX-03 is safe to describe
as deployed owner UX within its readback-only boundary.

MIMIR is opening UX-04 next because the remaining visible product risk is that
public Station surfaces still feel too much like generic cards and route lists.
The public Space should feel like an authored microsite: a place with a creator,
work, provenance, and a clear reading path, not a profile page with content
attached.

This lane should apply the Station/Discern product direction where it already
fits the current codebase, but it is not a broad reskin.

## Inputs

Use:

- `docs/roadmap/STATION_UI_UX_ROADMAP.md`
- `docs/roadmap/PR333_UX03_CONTINUITY_HOSTED_RECHECK_RESULT.md`
- current `docs/roadmap/ACTIVE_STATUS.md`
- current public route: `/space/station-replay-alpha`
- current public document route:
  `/space/station-replay-alpha/documents/dce9dcdc-067e-488b-baae-b09c0541077f`

## Task

Implement the smallest safe no-new-config UX-04 slice that makes public Space
presentation more microsite-like.

Start by inspecting:

- `apps/web/app/space/[slug]/page.tsx`
- public document rendering under `apps/web/app/space/[slug]/documents`
- public Space/persona/document helpers used by those routes
- relevant public Space tests

Preferred implementation shape:

- strengthen the public Space page structure so it has a stronger authored
  first viewport;
- make creator/public identity, visibility, provenance, and public-safe copy
  clearer;
- make public documents feel like selected work within the Space rather than
  undifferentiated cards;
- preserve the public document -> linked forum discussion path;
- keep the visual language aligned with the current dark Station public
  surfaces, not the older pale/generic landing-card look;
- improve desktop and `375px` mobile readability where touched.

If the safe slice is smaller than the above, implement the smaller slice and
record the next exact UX-04 follow-up. If no safe implementation slice exists,
return a concrete route/component map and recommendation instead of forcing a
change.

## Hard Limits

Do not:

- add schemas, migrations, config, Railway, Supabase, Stripe, provider/model,
  Redis, Cloudflare, queue, worker, deploy, key, or database-admin changes;
- change publication visibility rules or public/unlisted/community semantics;
- expose private Studio, Memory, Canon, Archive, Integrity, Continuity, owner
  ids, raw source bodies, credentials, cookies, or provider payloads;
- rewrite Discover, Forums, Billing, Developer Spaces, onboarding, or the whole
  design system;
- add public launch, commercial readiness, partner readiness, anonymous chat,
  visitor transcript, or product-marketing claims.

## Validation

Run the narrowest meaningful validation for touched code. Expected candidates:

```text
npm exec --yes pnpm@10.32.1 -- run test:spaces
npm exec --yes pnpm@10.32.1 -- run test:writing
npm exec --yes pnpm@10.32.1 -- run test:document-discussions
npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck
git diff --check
```

If one command is not relevant to the final touched files, record why it was
not run.

## Result Required

Create or update a concise PR334 result record:

```text
docs/roadmap/PR334_UX04_PUBLIC_SPACE_MICROSITE_RESULT.md
```

If code changes land, wake ARGUS with:

- summary of the visible public Space/document change;
- exact routes touched;
- validation results;
- visibility/privacy risks to review;
- whether ARIADNE should run hosted desktop/mobile public Space rehearsal after
  review.

If no code changes land, wake MIMIR with:

- verdict;
- route/component map;
- exact recommended next implementation slice.
