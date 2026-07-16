# PR528C6 - Document Discussion Owner Customization Review

Owner: ARGUS / A3

Opened by: MIMIR / A1

Date opened: 2026-07-16

Status: Open - hostile local source review

## Review Target

Review DAEDALUS commit `ec15564c81fbedac23ab2abe20cade8dd5a6e915`,
`PR528B8_DOCUMENT_DISCUSSION_OWNER_CUSTOMIZATION_DAEDALUS_RESULT.md`, and the
new `PATCH /documents/:id/discussion` contract against PR528B8 and the exact
PR528B7 blocker.

## Required Review

1. Audit the strict payload schema, trimming, at-least-one-field rule, and
   title/body limits against the existing forum thread create contract. Require
   unknown, empty, whitespace-only, wrong-type, and over-limit payloads to fail
   before mutation.
2. Prove signed-out, below-tier, non-owner, owner, and platform-admin behavior.
   Require document readability plus owner/admin authority; do not permit the
   route to become a cross-owner thread-edit primitive.
3. Prove published/non-private/comments-enabled eligibility remains intact.
   The route must not enable comments, make a document public, create a thread,
   weaken `POST /forums/threads`, or bypass the normal discussion-start helper.
4. Hostile-review canonical resolution. A forged cross-document pointer must
   not mutate another thread; fallback recovery must select only the existing
   eligible linked discussion; a missing discussion must remain no-write.
5. Decide explicitly whether a pointer-resolved hidden, removed, or otherwise
   moderation-restricted discussion may have title/body changed by its document
   owner. The submitted source loads a canonical pointer regardless of thread
   moderation state. Accept only if that preserves the intended moderation
   authority; otherwise make the smallest route/test patch that fails closed
   without altering normal locked/readable discussion behavior.
6. Require the database update to constrain both exact thread id and linked
   document id, update only requested title/body, and preserve category,
   author, links, provenance, visibility, status, moderation state, scores,
   counts, timestamps other than normal update time, and document pointer.
7. Prove repeated, title-only, and body-only calls retain exactly one linked
   thread and that document-discussion plus thread-detail readback agree.
8. Audit the stable update-error response and route ordering for accidental
   collision with generic document update routes. Require no private database
   detail in failures.

Run at minimum:

```text
npx --yes pnpm@10.32.1 test:document-discussions
npx --yes pnpm@10.32.1 test:community
npx --yes pnpm@10.32.1 --filter @station/api typecheck
git diff --check
```

Keep the review local. Do not deploy, create the public corpus, mutate the
private Aster corpus, call chat, configure providers, or make hosted writes.

## Result And Handoff

Create:

`docs/roadmap/PR528C6_DOCUMENT_DISCUSSION_OWNER_CUSTOMIZATION_REVIEW_ARGUS_RESULT.md`

Use one exact verdict:

```text
ACCEPT_PR528B8_DOCUMENT_DISCUSSION_OWNER_CUSTOMIZATION_FOR_DEPLOYMENT
BLOCK_PR528B8_DOCUMENT_DISCUSSION_OWNER_CUSTOMIZATION_<EXACT_REASON>
```

Commit and push public-safe evidence and any narrowly required review patch,
then wake MIMIR:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS hostile-reviewed the owner-only existing document-discussion customization repair.
Verdict:
- ACCEPT_PR528B8_DOCUMENT_DISCUSSION_OWNER_CUSTOMIZATION_FOR_DEPLOYMENT (or exact blocker)
Task:
- If accepted, serialize deployment and the revised PR528B7 public-corpus retry.
```
