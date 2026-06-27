# PR395 - Hosted Publish And Retract Rehearsal

Owner: A4 / ARIADNE
Status: open
Opened: 2026-06-27

## Context

ARGUS accepted PR394:
`docs/roadmap/PR394_OWNER_PUBLICATION_RETRACT_CONTRACT_RESULT.md`.

PR394 added an owner-visible `Retract to private` action on
`/studio/publishing`. The action uses the existing authenticated
`PATCH /documents/:id` owner path, hides the document from public readers, and
keeps the owner-visible record in Studio. This is not deletion and not artifact
cleanup.

MIMIR now explicitly accepts one public-safe, owner-visible, retracted hosted
artifact for this rehearsal so we can prove the full publish-and-retract shape.

## Freshness Gate

Hosted web/API must be running the PR394 product code:

```text
a0627335
```

or a later deployment that includes it. If Railway reports a later docs/state
commit, that is acceptable as long as the `Retract to private` product behavior
is visible.

## Route

Use the replay owner / Creator-capable hosted account and public-safe synthetic
content only.

Preferred route:

1. Sign in.
2. Open `/studio/publish`.
3. Create one clearly named PR395 test document.
4. Select an existing owned Space.
5. Use `unlisted` visibility if available; otherwise use the safest
   public-readable option available in the UI.
6. Keep comments enabled if the UI exposes that control.
7. Save/send for review.
8. Open `/studio/publishing`.
9. Move the item through the approval flow:
   `Review` -> `Human review` -> `Approve` -> `Publish`.
10. Open the public `View` route.
11. Verify public document trust/readback, public route availability, and linked
    discussion availability if the UI exposes the linked discussion action.
12. Return to `/studio/publishing`.
13. Click `Retract to private`.
14. Confirm the dashboard updates in place and the copy states that public
    readers and linked discussion routes can no longer open it while the owner
    record remains in Studio.
15. Confirm public `View` is gone or disabled for the retracted item.
16. Try the previously captured public document route and linked discussion
    route if available; both should now be hidden/blocked/not public-readable.
17. Confirm the owner can still open/edit/read the document privately from
    Studio.

Use a title like:

```text
[replay:pr395] publish retract rehearsal
```

Do not include private user data, real customer text, secrets, or raw IDs in the
document body or in the result doc.

## Required Result

Report:

- hosted web/API freshness;
- whether Space selection and approval transitions were available;
- exact public-safe title used, but no raw document/thread IDs;
- published public/unlisted readback result;
- linked discussion readback result, or why no discussion route appeared;
- retract action result;
- post-retract public document route result;
- post-retract linked discussion route result if applicable;
- owner-private readback after retraction;
- whether one owner-visible retracted artifact remains.

## Scope Guard

Allowed:

- one hosted public-readable publish mutation;
- one hosted retract-to-private mutation;
- route/readback checks needed to prove the contract.

Not allowed:

- hard delete cleanup;
- deleting threads/comments;
- multiple publish artifacts unless the first attempt fails before publish;
- social dispatch;
- Station Press;
- rich text expansion;
- scheduling;
- billing or Stripe;
- provider/model config;
- Redis, Cloudflare, workers, queues;
- schema or migrations;
- copying secrets, cookies, raw IDs, SQL, logs, or stack traces into docs.

## Handoff

Wake MIMIR with PASS/BLOCKED and the exact residual risk. Do not go idle without
a wakeup commit.
