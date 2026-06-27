# PR392 - Public Authoring Mutation Cleanup Gate

Owner: A2 / DAEDALUS
Status: open
Opened: 2026-06-27

## Context

ARIADNE passed PR391: the hosted `/writing` route now exposes the existing
linked-discussion cue, routes through public document detail, and reaches the
linked forum discussion without creating new public data.

PR386 and PR387 proved the safe private authoring path:

- `/writing` routes to `/studio/publish`;
- `/studio/publish` can save a private owner draft;
- `/studio/publishing` shows sanitized draft/private readback;
- edit reload returns to the saved draft;
- existing public documents can show trust, provenance, version, and linked
  discussion readback.

The deliberate caveat is still open: MIMIR did not approve a full public or
unlisted publish mutation because the prior map treated the result as a
long-lived hosted artifact unless cleanup instructions were supplied.

## Task

Map whether Station can now run a full hosted public or unlisted authoring
mutation proof safely, with either:

1. a reliable owner-safe cleanup path after the proof; or
2. an existing replay public document path that proves the public boundary
   without creating new public data.

Do not create, publish, delete, or mutate hosted public data in this lane unless
you find a narrow local code/test gap and can validate it locally. This is a
decision gate first.

## Inspect

Check the current implementation for:

- `/studio/publish` draft creation and send-for-review behavior;
- `/studio/publishing` approval transitions through publish;
- `/documents/:id/publish` direct publish behavior;
- public document readback at `/space/:slug/documents/:documentId`;
- linked discussion creation/readback after publish;
- any owner-only delete, unpublish, archive, retract, or cleanup route for test
  documents and linked discussion artifacts;
- tests or fixtures proving cleanup/idempotency after publish.

## Answer These Questions

- Is there an owner-safe cleanup path for a test public or unlisted document and
  its linked discussion artifact?
- If cleanup exists, what exact hosted ARIADNE rehearsal is safe to run?
- If cleanup does not exist, is a small cleanup route/test needed before full
  publish proof, or should full publish mutation remain deferred?
- Can current accepted evidence plus existing replay public data honestly close
  the protected-alpha public-writing boundary without a new mutation?
- Are current docs overstating "publish a private draft" beyond what has been
  safely proved on hosted Railway?

## Scope Guard

Allowed:

- documentation map;
- focused tests around existing publish/cleanup behavior;
- narrow code repair only if a local gap prevents a safe recommendation.

Not allowed:

- creating or publishing hosted public data;
- deleting hosted data;
- Station Press;
- social dispatch;
- scheduling;
- rich text editor expansion;
- billing, Stripe, token credits;
- provider/model config;
- Redis, Cloudflare, workers, queues;
- schema or migrations unless a blocking cleanup truth is impossible without
  one, in which case wake MIMIR before opening that scope.

## Validation If Code Changes

Run the relevant subset:

```bash
npm exec --yes pnpm@10.32.1 -- run test:writing
npm exec --yes pnpm@10.32.1 -- run test:publishing-approvals
npm exec --yes pnpm@10.32.1 -- run test:document-discussions
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck
npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck
git diff --check
```

## Handoff

If this is map-only, commit a result doc and wake MIMIR with the exact
recommendation. If code changes, wake ARGUS for review first. Do not go idle
without a wakeup commit.
