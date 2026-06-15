# PR 6 - Background Job Trigger Audit

Date opened: 2026-06-15

Opened by: A1 / MIMIR

Prerequisite: PR 5 Developer Space provider policy accepted by A3 / ARGUS in
`5bc9034`.

Owner: A2 / DAEDALUS first, then A3 / ARGUS.

## Goal

Avoid premature queue architecture.

The replay claim to earn is:

> Station will not build background-worker infrastructure until a concrete alpha
> flow proves it needs one.

## Trigger Rule

Open a worker implementation only if archive, import, export, or replay shows:

- blocking latency,
- flaky completion,
- user-visible timeout,
- unsafe fire-and-forget behavior,
- or failed/retry behavior that cannot be made reliable inside the current
  protected-alpha route/job model.

## Current Evidence To Audit

- PR 2 accepted chat-import and file-register idempotency for alpha
  replay/import robustness.
- Export package/readback flows have owner-only manifests and failure visibility,
  but full workspace/binary/PDF/background export remains deferred.
- Operational cache now supports short-lived queue state, but no Redis queue or
  worker provider has been accepted.
- `processUploadedFile` still uses a fire-and-forget path for immediate file
  processing. This is a candidate to inspect, not permission to build a queue.
- Past replay notes mention some slow routes, but PR 6 needs a concrete failing
  archive/import/export/replay flow before implementation.

## Scope

- Audit current archive/import, file-processing, export, replay-readiness, and
  staged evidence docs for a real worker trigger.
- Inspect `processUploadedFile`, import job status/retry behavior, export package
  creation/readback, and any replay route timing evidence.
- If no trigger is proven, document PR 6 as deferred and wake ARGUS for closeout.
- If a trigger is proven, identify exactly one failing flow and open the
  smallest worker shell for that flow only:
  - job status persistence,
  - retry/failure visibility,
  - owner scoping,
  - sanitized payload/log shape,
  - focused replay or route proof.

## Do Not

- Do not build a broad worker queue by default.
- Do not add platform-wide job orchestration.
- Do not add a Redis/BullMQ queue unless a specific accepted trigger needs it.
- Do not change Cloudflare, provider routing, embeddings, billing, Redis memory,
  archive/retrieval semantics, export scope, or broad UI.
- Do not store private archive text, prompts, completions, provider payloads,
  raw replay bodies, credentials, tokens, cookies, owner IDs, or private IDs in
  job payload docs/logs.

## Acceptance Gates

For no-trigger closeout:

- The audit names the reviewed archive/import/export/replay surfaces.
- The audit explains why no worker implementation is justified now.
- Deferred worker scope remains explicitly tied to future concrete replay pain.

For a triggered worker implementation:

- Exactly one failing flow is named.
- The worker shell is limited to that flow.
- Job state, retry, failure visibility, owner scope, and payload sanitization are
  tested.
- Replay or route evidence shows the painful flow improves.

## Validation

Expected audit gate:

```bash
npx --yes pnpm@10.32.1 test:storage
npx --yes pnpm@10.32.1 test:conversation-archive
npx --yes pnpm@10.32.1 test:exports
npx --yes pnpm@10.32.1 test:replay-readiness
npx --yes pnpm@10.32.1 --filter @station/api build
git diff --check
```

If DAEDALUS implements behavior, add the focused route/service tests touched by
the worker shell.

## Handoff

DAEDALUS should wake ARGUS with:

- files changed,
- no-trigger deferral or exact triggered flow,
- reviewed evidence sources,
- route/job behavior changed, if any,
- payload/log sanitization evidence,
- validation run,
- remaining caveat if PR 6 should continue.
