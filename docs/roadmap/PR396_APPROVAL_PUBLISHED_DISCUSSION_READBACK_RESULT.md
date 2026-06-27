# PR396 - Approval-Published Discussion Readback Result

Owner: A2 / DAEDALUS
Status: Accepted by ARGUS
Completed: 2026-06-27

## Summary

PR396 found a narrow product defect behind the PR395 hosted blocker:

- Direct document publish (`POST /documents/:id/publish`) created or recovered a
  linked document discussion.
- Approval publish (`POST /publishing/approvals/:id/transition` with
  `state: "published"`) updated the document to `published` but did not create
  a linked discussion thread or write `discussion_thread_id` back to the
  document.
- The public document detail page already renders `Open linked discussion` when
  a linked discussion exists or `/documents/:id/discussion` returns one, so the
  page was not the broken layer.

The fix keeps scope tight:

- Approval-published documents now attach or recover a document discussion when the
  published document is eligible (`published`, comments enabled, and
  `public`/`community`/`unlisted` visibility).
- New threads are linked to the document, Space, optional persona, owner, and
  `documents-and-codexes` category.
- The document is updated with `discussion_thread_id` before the approval
  response is hydrated, so `/studio/publishing` and the public document detail
  route receive the pointer.
- The publish event metadata records the linked discussion thread id for owner
  audit/readback.

## Coverage

`publishing-approvals.test.ts` now proves approval-published `unlisted`
documents:

- return `approval.document.discussion_thread_id`;
- persist the same pointer on the document row;
- create an active unlisted thread linked to the document, owner, Space, and
  `documents-and-codexes` category;
- record `discussionThreadId` in the publish event metadata.

Existing document discussion coverage still proves public/community/unlisted
thread readback and private retraction hiding behavior.

## Scope Kept Closed

No hosted publish/retract/delete mutation was run. No hard delete cleanup,
thread/comment deletion, Station Press, social dispatch, rich text, scheduling,
billing, Stripe, provider/model, Redis, Cloudflare, worker/queue, schema, or
migration scope was opened.

## Validation

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:publishing-approvals` | Pass | 14 tests passed, including approval-published linked discussion creation. |
| `npm exec --yes pnpm@10.32.1 -- run test:document-discussions` | Pass | 2 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:writing` | Pass | 22 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 127 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck` | Pass | Web TypeScript check passed. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck` | Pass | API TypeScript check passed. |
| `git diff --check` | Pass | Whitespace check passed with CRLF normalization warnings only. |

## ARGUS Review

Verdict: `PASS`.

ARGUS accepts PR396 as a narrow approval-publish discussion readback repair:

- Approval publish now matches the direct publish expectation for fresh eligible
  approval-published documents: it attaches or recovers a linked discussion and
  writes `discussion_thread_id` before hydrating the approval response.
- The fix stays owner-scoped through the existing approval item/document owner
  path and creator-tier transition guard.
- Unlisted discussion readback remains bounded to existing document discussion
  behavior for route holders; category feed behavior is unchanged.
- The publish event metadata records the linked discussion pointer for owner
  audit/readback, not public display.
- The helper duplicates only the already-accepted discussion creation behavior
  needed by approval publish; it does not open schema, migration, cleanup,
  public visibility, or broader route scope.
- ARGUS reran the requested validation successfully.

MIMIR can close PR396 as `PASS` and open a PR395 hosted retry on fresh web/API.
The retry should confirm public trust/readback and `Open linked discussion`
before retraction, then confirm retract-to-private hides the document and linked
discussion route without making hard-delete cleanup claims.
