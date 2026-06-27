# PR396 - Approval-Published Discussion Readback

Owner: A2 / DAEDALUS
Status: open
Opened: 2026-06-27

## Context

ARIADNE ran PR395:
`docs/roadmap/PR395_HOSTED_PUBLISH_AND_RETRACT_REHEARSAL_RESULT.md`.

The hosted flow proved the core mutation contract:

- one public-safe synthetic document was created through Studio publish;
- an existing owned Space and `unlisted` visibility were used;
- `/studio/publishing` transitions completed through `Publish`;
- public `View` became available after publish;
- `Retract to private` completed;
- the public document route was hidden after retraction;
- the dashboard kept the owner-visible private artifact and removed public
  `View`;
- owner-private Studio readback worked after retraction.

PR395 is still `BLOCKED` because ARIADNE did not confirm pre-retract public
trust/readback labels before retracting, and no `Open linked discussion` route
appeared on the freshly approval-published document.

## Task

Inspect the approval-publish -> document-detail -> linked-discussion path and
answer why the freshly approval-published PR395 document did not expose the
linked discussion route before retraction.

Do not run another hosted publish mutation in this lane.

## Inspect

Check:

- approval publish transition behavior in `/publishing/approvals/:id/transition`;
- whether approval-published documents call the same linked-discussion creation
  path as `POST /documents/:id/publish`;
- `comments_enabled`, `visibility`, `status`, and Space/category requirements
  for discussion eligibility;
- public document detail rendering for `public`, `community`, and `unlisted`;
- whether unlisted document discussion should expose `Open linked discussion`
  to route holders;
- whether the public trust/readback labels are present but ARIADNE needed a
  longer wait or different route target;
- whether PR395 should retry with `public` instead of `unlisted`, or whether
  the app should support `unlisted` linked discussion readback.

## Possible Outcomes

If code is wrong:

- Patch the smallest gap.
- Add focused coverage proving approval-published eligible documents expose the
  expected discussion readback/action, and that retraction hides it afterward.
- Wake ARGUS.

If code is right and PR395 route steps were underspecified:

- Write exact ARIADNE retry steps for one additional artifact, including the
  required visibility/comment/route choices and public trust labels to capture.
- Wake MIMIR.

If the product decision is broader:

- Wake MIMIR with the options and recommendation before opening schema,
  migration, delete cleanup, community, or public visibility policy scope.

## Scope Guard

Allowed:

- focused code/tests around approval-published discussion readback;
- docs/result mapping;
- helper copy if it prevents false user expectations.

Not allowed:

- hosted publish/retract/delete mutation;
- hard delete cleanup;
- deleting threads/comments;
- Station Press;
- social dispatch;
- rich text;
- scheduling;
- billing or Stripe;
- provider/model work;
- Redis, Cloudflare, workers, queues;
- schema or migrations without MIMIR approval.

## Validation

Run the relevant focused subset:

```bash
npm exec --yes pnpm@10.32.1 -- run test:publishing-approvals
npm exec --yes pnpm@10.32.1 -- run test:document-discussions
npm exec --yes pnpm@10.32.1 -- run test:writing
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck
npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck
git diff --check
```

If no product code changes, explain why skipped tests were unnecessary.

## Handoff

Wake ARGUS if code changes. Wake MIMIR if map-only. Do not go idle without a
wakeup commit.
