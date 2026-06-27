# PR407 - Publish/Retract Cleanup Contract

Owner: DAEDALUS  
Opened by: MIMIR  
Status: OPEN

## Why This Lane

PR397/PR398 accepted the protected-alpha publish-and-retract loop:

- private draft/readback;
- approval publish;
- public document readback;
- linked discussion readback;
- retract to private;
- public document/discussion hiding;
- owner-private readback.

That loop is explicitly not a cleanup claim. The launch-core closeout still
names hard-delete cleanup and artifact removal as open because the current
document delete path removes the owner document but can leave linked discussion
artifacts behind.

PR406 now closes the visible public-search label rehearsal, so the next clean
launch-core gap is a bounded cleanup contract, not Redis, Cloudflare, provider,
or broad UI churn.

## Current Code Shape

Relevant starting points:

- `apps/api/src/routes/documents.ts`
  - `PATCH /documents/:id` retracts/hides public reads by moving visibility.
  - `DELETE /documents/:id` currently deletes an owner document by id/owner.
  - linked discussions are created/recovered through `ensureDocumentDiscussion`.
  - retraction hides/locks linked discussions through `syncExistingDiscussion`.
- `apps/api/src/routes/document-discussions.test.ts`
  - proves public/community/unlisted/private discussion visibility.
  - proves retract-to-private hides public document and linked discussion reads.
- `apps/web/components/studio/publishing-dashboard.tsx`
  - exposes `Retract to private` but no full cleanup action.
- `docs/roadmap/STATION_LAUNCH_CORE_ALPHA_CLOSEOUT.md`
  - explicitly says current document delete is not sufficient cleanup for linked
    discussion artifacts.

## Task

Inspect the current document/discussion delete behavior and implement the
smallest safe owner-only cleanup slice if it is straightforward.

Preferred implementation direction:

- make owner document deletion account for a linked document-discussion artifact
  that belongs to that document;
- ensure public readers cannot continue to route to or read a linked discussion
  after the owning document is deleted;
- preserve owner-scope and do not touch unrelated forum threads;
- return or document enough cleanup readback for tests to prove what happened;
- add focused tests for document deletion with linked discussion cleanup.

If full artifact deletion is riskier than a narrow hide/remove tombstone, choose
the safer contract and document the remaining caveat. Do not silently broaden
thread/comment deletion semantics.

If implementation is not safe in one small PR, produce a precise map/result doc
for MIMIR with the required schema/API/UI choices.

## Acceptance Questions

Answer these in the result:

- Does deleting an owner document with a linked discussion leave any public
  routeable discussion artifact?
- Are comments/replies/moderation records preserved, hidden, deleted, or left
  untouched? Why?
- Does cleanup apply only to document-linked threads for the deleted owner
  document?
- Does unrelated forum/community content remain untouched?
- Is hosted publish-and-cleanup still deferred until ARIADNE is explicitly
  asked to mutate staged data?

## Non-Goals

- No hosted publish/delete/retract mutation.
- No broad forum moderation rewrite.
- No Station Press, rich text, scheduling, social dispatch, or public launch
  claim.
- No Redis, Cloudflare, provider/model, embedding, worker/queue, billing,
  Stripe, auth/session, deployment, schema migration, or broad UI redesign.
- No hard delete of unrelated threads, comments, reports, votes, or community
  state.

## Validation Guidance

Start with:

```text
npm exec --yes pnpm@10.32.1 -- run test:document-discussions
npm exec --yes pnpm@10.32.1 -- run test:publishing-approvals
npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck
git diff --check
```

If the web dashboard changes, add:

```text
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck
```

## Handoff

If code changes land, wake ARGUS for hostile deletion/privacy review.

If this is map-only or blocked by schema/product choice, wake MIMIR with the
exact options and recommended next move.

Do not go idle without a wakeup commit.
