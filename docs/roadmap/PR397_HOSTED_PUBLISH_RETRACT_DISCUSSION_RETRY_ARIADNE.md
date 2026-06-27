# PR397 - Hosted Publish Retract Discussion Retry

Owner: A4 / ARIADNE
Status: open
Opened: 2026-06-27

## Context

PR395 proved hosted publish-and-retract but blocked before confirming
pre-retract public trust labels and linked discussion behavior:
`docs/roadmap/PR395_HOSTED_PUBLISH_AND_RETRACT_REHEARSAL_RESULT.md`.

PR396 fixed the narrow API defect:
`docs/roadmap/PR396_APPROVAL_PUBLISHED_DISCUSSION_READBACK_RESULT.md`.

Approval publish now attaches or recovers an eligible linked document discussion
and writes `discussion_thread_id` before hydrating the approval response.

MIMIR authorizes one additional public-safe owner-visible retracted artifact for
this retry.

## Freshness Gate

Hosted API must include PR396 product code:

```text
8b57a727
```

Hosted web must include the PR394 retract UI code:

```text
a0627335
```

Later deployments are acceptable if the relevant behavior is visible.

## Route

Use replay owner / Creator-capable hosted credentials from ignored local
environment only. Use public-safe synthetic content only.

1. Sign in.
2. Open `/studio/publish`.
3. Create one clearly named PR397 test document.
4. Select an existing owned Space.
5. Use `unlisted` visibility unless the UI blocks that; if blocked, use
   `public`.
6. Keep comments enabled.
7. Save/send for review.
8. Open `/studio/publishing`.
9. Move through:
   `Review` -> `Human review` -> `Approve` -> `Publish`.
10. Open public `View`.
11. Before retraction, confirm public document detail shows trust/readback:
    document state, provenance, version, and discussion state.
12. Before retraction, confirm `Open linked discussion` appears.
13. Open the linked discussion route and confirm it is public/route-holder
    readable without private material.
14. Return to `/studio/publishing`.
15. Click `Retract to private`.
16. Confirm dashboard state updates in place, visibility is private, public
    `View` is removed/disabled, and copy says public readers and linked
    discussion routes can no longer open it while owner record remains.
17. Revisit the previously captured public document route and linked discussion
    route; both should now be hidden/blocked/not public-readable.
18. Confirm owner-private Studio readback still works.

Use a title like:

```text
[replay:pr397] publish retract discussion retry
```

Do not copy raw document IDs, thread IDs, cookies, secrets, SQL, logs, stack
traces, or private source text into the result.

## If The Linked Discussion Still Does Not Appear

Do not create a third artifact.

Record the missing state, retract the artifact to private for safety, confirm
public document hiding after retraction, and wake MIMIR as `BLOCKED`.

## Required Result

Report:

- hosted web/API freshness;
- title used, no raw IDs;
- approval transition result;
- pre-retract public document trust/readback result;
- pre-retract `Open linked discussion` result;
- linked discussion route result before retraction;
- retract result;
- post-retract public document route result;
- post-retract linked discussion route result;
- owner-private readback result;
- whether one owner-visible retracted PR397 artifact remains.

## Scope Guard

Allowed:

- one hosted public-readable publish mutation;
- one hosted retract-to-private mutation;
- route/readback checks needed to prove the fixed contract.

Not allowed:

- hard delete cleanup;
- deleting threads/comments;
- more than one artifact in this retry;
- social dispatch;
- Station Press;
- rich text expansion;
- scheduling;
- billing or Stripe;
- provider/model config;
- Redis, Cloudflare, workers, queues;
- schema or migrations;
- copying secrets or raw identifiers into docs.

## Handoff

Wake MIMIR with PASS/BLOCKED and exact residual risk. Do not go idle without a
wakeup commit.
