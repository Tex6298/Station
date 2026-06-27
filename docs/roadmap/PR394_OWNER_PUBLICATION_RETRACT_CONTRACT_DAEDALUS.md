# PR394 - Owner Publication Retract Contract

Owner: A2 / DAEDALUS
Status: open
Opened: 2026-06-27

## Context

PR393 closed the public-writing protected-alpha boundary without a fresh hosted
publish mutation. The next useful product move from PR392's residual risk is a
narrow owner-safe retract contract, not broad cleanup or delete.

Current evidence:

- `PATCH /documents/:id` can change a published document back to
  `visibility: private`.
- Existing document-discussion behavior hides or locks the linked thread when a
  linked published document becomes ineligible.
- `DELETE /documents/:id` is not safe cleanup for linked discussion artifacts
  because `threads.linked_document_id` is `on delete set null`.
- `/studio/publishing` exposes published owner documents, but the current
  owner-facing contract does not make retraction explicit enough for a future
  hosted publish-and-retract proof.

## Goal

Make "retract from public readers" an explicit, tested owner contract:

- owner-only;
- visibility/hide behavior, not artifact deletion;
- linked discussion no longer public-readable after retraction;
- dashboard/readback copy makes the remaining owner-visible artifact honest;
- idempotent or clearly guarded enough for a later ARIADNE hosted
  publish-and-retract rehearsal.

## Task

Implement the smallest safe slice that makes the contract real.

Inspect first, then patch narrowly:

- `/studio/publishing` published-document controls;
- `PATCH /documents/:id` behavior for published document visibility changes;
- document-discussion visibility sync and readback;
- publishing helper copy/tests;
- any existing public document detail owner controls if that is the cleaner
  surface.

Expected shape:

- Add a clear owner action such as `Retract to private` for eligible published
  owner documents.
- Use existing owner-authenticated document update behavior where possible.
- On success, update dashboard state without requiring page reload.
- Surface copy that says the document is hidden from public readers but remains
  owner-visible; do not call this cleanup or deletion.
- Preserve public `View` only when the document remains published and
  Space-backed with public/community/unlisted visibility.

If a code change would require schema/migration or a new deletion workflow, stop
and wake MIMIR with options instead.

## Scope Guard

Allowed:

- focused web/API code and tests for owner retract-to-private behavior;
- helper copy that distinguishes retraction from cleanup;
- docs/result updates.

Not allowed:

- hard delete cleanup;
- deleting threads/comments;
- hosted publish/retract/delete mutation;
- Station Press;
- social dispatch;
- rich text;
- scheduling;
- provider/model work;
- Redis, Cloudflare, workers, queues;
- billing, Stripe;
- schema or migrations without MIMIR re-opening scope.

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

If the patch is helper/UI-only, explain any omitted API validation in the
result and keep the test set focused.

## Handoff

Wake ARGUS for hostile review if code changes. If inspection shows no code is
needed, wake MIMIR with the exact publish-and-retract rehearsal contract and
why it is already safe. Do not go idle without a wakeup commit.
