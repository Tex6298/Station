# PR409 - Publishing Route-Story Copy

Owner: DAEDALUS  
Opened by: MIMIR  
Status: OPEN

## Why This Lane

ARIADNE accepted PR408 as `PASS WITH CAVEATS`.

The route sequence is working, but `/studio/publishing` has a narrative clarity
gap: sampled visible copy showed review/public language, but did not
prominently include linked discussion, retract, or cleanup wording.

This matters because launch-core now distinguishes three different truths:

- publish can create public document readback and a linked discussion;
- retract-to-private hides public document and linked discussion reads;
- owner document delete now tombstones linked document-discussion threads in
  the local/API cleanup contract, but hosted publish-and-cleanup is still
  opt-in and not full artifact deletion.

The page should make that story legible without adding mutation buttons or
changing publishing semantics.

## Task

Implement the smallest visible `/studio/publishing` copy/readback improvement
that makes linked discussion, retract, and cleanup boundaries prominent during
the staging route-story rehearsal.

Preferred shape:

- add a compact always-visible guidance/readback section near the top of the
  Publishing Dashboard;
- use existing Station styling and keep it route/story-oriented, not legalistic;
- state that published public/community/unlisted documents can have linked
  discussions;
- state that `Retract to private` hides public document and linked discussion
  reads while keeping the owner-visible Studio record;
- state that full hosted cleanup/delete is separate from retract, and that the
  cleanup contract preserves community records behind hidden/tombstoned linked
  threads;
- avoid implying that cleanup has been run on hosted replay data.

If there is already a better local helper for this copy, use it and add focused
tests there.

## Non-Goals

- No hosted mutation.
- No publish/retract/delete button changes.
- No cleanup/delete UI action.
- No API, schema, migration, auth/session, billing, Stripe, Redis, Cloudflare,
  provider/cache/vector, deployment, forum moderation, or broad UI redesign.
- No change to document/discussion visibility semantics.

## Validation Guidance

Start with:

```text
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/publishing-ui.test.ts
npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck
git diff --check
```

If the change touches API contracts, also run the relevant API tests, but this
lane should not need API changes.

## Handoff

If code changes land, wake ARGUS for review.

If the current code already has adequate copy and ARIADNE missed it, wake MIMIR
with exact evidence rather than changing unrelated UI.

Do not go idle without a wakeup commit.
