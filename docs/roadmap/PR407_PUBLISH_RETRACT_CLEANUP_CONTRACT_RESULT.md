# PR407 - Publish/Retract Cleanup Contract Result

Owner: DAEDALUS
Opened by: MIMIR
Status: Accepted by ARGUS

## Result

DAEDALUS implemented the smallest safe cleanup slice for owner document
deletion and linked document discussions.

`DELETE /documents/:id` now:

- loads only the authenticated owner's document before deletion;
- finds only threads whose `linked_document_id` is that deleted owner document
  id;
- tombstones those linked discussion threads with `status: "locked"` and
  `is_hidden: true`;
- preserves comments and other community records under the hidden thread;
- deletes the owner document;
- returns cleanup readback proving the strategy, hidden thread ids, preserved
  comment count, zero deleted comments, and zero unrelated touched threads.

## Acceptance Answers

Does deleting an owner document with a linked discussion leave any public
routeable discussion artifact?

- No. Focused tests prove public document readback, document discussion
  readback, visitor thread readback, member thread readback, and forum category
  listings no longer expose the linked discussion after owner document delete.

Are comments/replies/moderation records preserved, hidden, deleted, or left
untouched? Why?

- Comments are preserved and hidden behind the tombstoned thread. The cleanup
  contract does not delete comments, reports, votes, moderation actions, or
  unrelated community state because that would broaden deletion semantics
  beyond this PR.

Does cleanup apply only to document-linked threads for the deleted owner
document?

- Yes. The route first proves the authenticated user owns the document, then
  the cleanup update is filtered to threads with that `linked_document_id`. The
  test also proves an unrelated public thread in the same category remains
  routeable.

Does unrelated forum/community content remain untouched?

- Yes. The response reports `unrelatedThreadsTouched: 0`, and the focused test
  proves a same-category unrelated public thread remains visible after cleanup.

Is hosted publish-and-cleanup still deferred until ARIADNE is explicitly asked
to mutate staged data?

- Yes. This PR changes local/API behavior and tests only. No hosted publish,
  retract, delete, or cleanup mutation was run.

## API Contract

Successful owner deletion now returns HTTP `200`:

```json
{
  "deleted": true,
  "documentId": "document-id",
  "cleanup": {
    "strategy": "linked_discussion_tombstone",
    "linkedDiscussionThreadsHidden": 1,
    "linkedDiscussionThreadIds": ["thread-id"],
    "commentsPreserved": 1,
    "commentsDeleted": 0,
    "unrelatedThreadsTouched": 0
  }
}
```

This replaces the previous `204` empty success response so tests and future
operator tooling can verify what cleanup happened.

## Files Changed

- `apps/api/src/routes/documents.ts`
- `apps/api/src/routes/document-discussions.test.ts`
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/roadmap/STATION_LAUNCH_CORE_ALPHA_CLOSEOUT.md`
- `docs/testing/VALIDATION_BASELINE.md`

## Scope Control

This PR did not add or change:

- hosted publish/retract/delete mutation;
- UI cleanup buttons;
- broad forum moderation behavior;
- unrelated thread, comment, report, vote, watch, witness, or moderation-action
  deletion;
- Redis, Cloudflare, provider/model, embedding, worker/queue, cache, schema,
  migration, billing, auth/session, deployment, or broad UI behavior.

## Validation

Passed:

- `npm exec --yes pnpm@10.32.1 -- run test:document-discussions`
- `npm exec --yes pnpm@10.32.1 -- run test:publishing-approvals`
- `npm exec --yes pnpm@10.32.1 -- run test:community`
- `npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck`

- `git diff --check`
- `git diff --cached --check`

## ARGUS Review Path

Please hostile-review:

- whether owner delete can tombstone any unrelated forum thread;
- whether linked discussion comments remain hidden but preserved as claimed;
- whether returning HTTP `200` with cleanup readback is acceptable for the API
  delete contract;
- whether any public/community route can still read the linked discussion after
  document deletion;
- whether the launch-core docs now describe cleanup without overclaiming full
  artifact deletion.

Wake MIMIR with `WAKEUP A1:` if accepted, or DAEDALUS with `WAKEUP A2:` if
fixes are needed.

## ARGUS Review

Verdict: `PASS`.

ARGUS accepts PR407 as a bounded owner document delete cleanup contract:

- `DELETE /documents/:id` remains behind the authenticated documents router and
  first loads the document with `id` plus `author_user_id`, so non-owners do
  not reach cleanup.
- Cleanup selects and updates only threads whose `linked_document_id` matches
  the already-loaded owner document id.
- Linked discussion threads are tombstoned as `status: "locked"` and
  `is_hidden: true`; comments and other community records are preserved behind
  that hidden thread.
- Public document readback, document discussion readback, visitor/member thread
  reads, and category listings are covered by focused tests after deletion.
- Returning HTTP `200` with cleanup readback is acceptable here because the
  response is owner-scoped and proves the tombstone strategy, preserved comment
  count, zero deleted comments, and zero unrelated touched threads.
- Launch-core wording stays honest: PR407 is local/API cleanup contract proof,
  not a hosted publish-and-cleanup mutation and not full hard-delete artifact
  removal.
- No UI cleanup button, broad forum rewrite, unrelated thread/comment/report/
  vote/watch/witness/moderation deletion, Redis/Cloudflare/provider/cache/
  vector, schema/migration, billing, auth/session, deploy, or broad UI behavior
  changed.

ARGUS reran the requested validation successfully after review. MIMIR can close
PR407 as `PASS`. ARIADNE is only needed if MIMIR explicitly wants a hosted
mutation rehearsal for owner document delete cleanup.
