# PR392 - Public Authoring Mutation Cleanup Gate Result

Owner: DAEDALUS

Date: 2026-06-27

Status: Map-only result ready for MIMIR

## Summary

DAEDALUS mapped the current public/unlisted authoring mutation and cleanup
reality without creating, publishing, deleting, or mutating hosted public data.

Recommendation:

- Do not run a new hosted full public or unlisted publish mutation yet.
- Treat the protected-alpha public-writing boundary as proved by safe private
  draft authoring plus existing replay public-document readback.
- If MIMIR wants a full hosted new-draft-to-published proof later, open a
  dedicated cleanup/retract lane first.

## What Is Already Proved

Hosted:

- PR387 proved `/writing` -> `/studio/publish` private draft save,
  `/studio/publishing` owner readback, and edit reload.
- PR391 proved `/writing` -> public document detail -> linked forum discussion
  using existing replay public data and no new public mutation.

Local/API:

- `POST /publishing/approvals` queues a Space-backed draft.
- `POST /publishing/approvals/:id/transition` enforces
  `grounding_check -> human_review -> approved -> published`.
- The publish transition updates the owned document to `status: published` and
  public/community/unlisted visibility.
- `POST /documents/:id/publish` directly publishes an owned document and calls
  linked-discussion creation when eligible.
- `PATCH /documents/:id` can change visibility, and existing coverage proves
  changing a published linked document to private hides the linked thread from
  public reads.

That is enough to say Station has protected-alpha public writing readback and a
locally tested publish transition. It is not enough to say a fresh hosted full
publish mutation has been safely rehearsed.

## Cleanup Reality

There is no current owner-safe cleanup path that fully removes a test public or
unlisted document and its linked discussion artifact.

Current options:

- `PATCH /documents/:id` to `visibility: private` is a viable retract/hide
  mechanism. It hides the document from public Space/discover reads and calls
  `syncExistingDiscussion`, which locks and hides the linked thread.
- `DELETE /documents/:id` exists as an authenticated owner API route, but it is
  not exposed in the publishing UI, is not covered as a publish-cleanup flow,
  and does not clean the linked discussion artifact.
- The schema sets `threads.linked_document_id` to `on delete set null`, so
  deleting a document can leave an active forum thread record detached from the
  document unless a separate thread cleanup step is performed.
- `DELETE /threads/:id` soft-removes a thread for the author/admin, but there
  is no documented/tested owner cleanup workflow that pairs document deletion,
  approval-row state, version rows, linked thread state, and comments after a
  publish proof.
- Publishing approval rows and events cascade if the document row is deleted,
  but that does not cover the forum thread because the forum link is set null,
  not cascaded.

So the current safe hosted rehearsal is not "publish then delete." The only
bounded cleanup-like option is "publish then retract to private," which leaves
owner-visible document/version/approval/thread records. That may be acceptable
as a product retract proof, but it is not artifact cleanup.

## Answers

Is there an owner-safe cleanup path for a test public or unlisted document and
its linked discussion artifact?

- No. There is an owner-safe visibility retraction path, but no fully reliable
  cleanup path for the document plus linked discussion artifact.

If cleanup exists, what exact hosted ARIADNE rehearsal is safe to run?

- Full cleanup does not exist. Do not run a hosted publish-and-cleanup proof.

If cleanup does not exist, is a small cleanup route/test needed before full
publish proof, or should full publish mutation remain deferred?

- Keep full publish mutation deferred unless MIMIR explicitly accepts a
  long-lived owner-only/retracted artifact.
- The better next lane, if a full mutation proof is important, is a small
  retract/cleanup contract with tests:
  owner-only control, document removed from public reads, linked thread hidden
  or removed, approval state coherent, version rows owner-only, and idempotent
  rerun behavior.

Can current accepted evidence plus existing replay public data honestly close
the protected-alpha public-writing boundary without a new mutation?

- Yes, if the claim is bounded to protected-alpha public writing readback:
  owners can create private drafts, existing public documents can be read safely
  through `/writing`, public document detail exposes trust/version/discussion
  readback, and linked forum discussions route correctly.
- No, if the claim is "hosted new private draft was published to public/unlisted
  and cleaned up." That remains unproved.

Are current docs overstating "publish a private draft" beyond what has been
safely proved on hosted Railway?

- README and current ACTIVE_STATUS are honest: they point to the roadmap/status
  truth and describe safe private drafting plus existing public readback.
- PR386's optional full-mutation note overstated the API delete route as a
  possible cleanup instruction. This result corrects that note: current
  document delete is not safe cleanup for linked discussion artifacts.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| Code route map | Pass | Inspected document create/patch/delete/publish, approval transitions, document-discussion sync, thread delete, UI publish flow, and publishing dashboard. |
| Schema map | Pass | Confirmed `threads.linked_document_id` uses `on delete set null`, while approval rows/events cascade through document deletion. |
| Existing test map | Pass | `publishing-approvals.test.ts` proves local publish transition; `document-discussions.test.ts` proves visibility-to-private hides linked thread reads. |
| `git diff --check` | Pass | Docs-only map; whitespace check passed. |

No product code changed, so package tests and typechecks were not rerun for
PR392.

## Handoff

MIMIR should choose one of these:

1. Close the current public-writing boundary as protected-alpha complete using
   PR387 private draft proof plus PR391 existing public replay proof.
2. Open a cleanup/retract implementation lane before any hosted full public or
   unlisted publish mutation.
3. Explicitly accept a long-lived owner-only/retracted hosted artifact and ask
   ARIADNE to run a publish-and-retract proof, not a publish-and-delete proof.
