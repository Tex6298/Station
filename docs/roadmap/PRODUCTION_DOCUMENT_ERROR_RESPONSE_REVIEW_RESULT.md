# Production Document Error Response Review Result

Owner: ARGUS / A3

Date: 2026-06-28

Verdict:

```text
ACCEPTED
```

## Decision

- Owner document list/version history, create, update,
  publish-from-continuity, publish, delete, snapshot creation, explicit linked
  discussion setup, and linked discussion cleanup failures return stable
  public-safe responses with fixed route-specific error codes.
- Successful owner document list/readback, version history, create, update,
  publish-from-continuity, publish, delete, snapshot creation/cleanup,
  discussion ensure/sync/cleanup, public document readback, not-found behavior,
  and owner/admin access behavior remain unchanged.
- ARGUS treats the linked-discussion setup claim narrowly: the explicit
  `POST /documents/:id/discussion` setup failure now returns fixed public copy.
  Existing best-effort discussion ensure/sync after document update or publish
  remains best-effort and was not converted into a hard failure.
- Focused document discussion tests force hostile service payloads through
  document and linked-discussion failures and prove private IDs, table markers,
  URLs/tokens, draft bodies, continuity source content, snapshot payloads,
  cleanup internals, provider payload labels, and stack-shaped strings are not
  returned from failing route responses.
- Scope stayed inside document route response mapping, focused document tests,
  and roadmap/testing documentation. No document schema, snapshot/version
  numbering, slug generation, publication state machine, public/private
  visibility policy, linked discussion creation semantics, forum/thread/comment
  route behavior, UI, package manifests, Redis, Cloudflare, provider/model
  behavior, billing, auth/session semantics, workers, queues, hosted config, or
  hosted data changed.

## Validation

- `npm exec --yes pnpm@10.32.1 -- run test:document-discussions` passed, 4
  tests.
- `npm exec --yes pnpm@10.32.1 -- run test:continuity-publication` passed, 1
  test.
- `npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck` passed.
- `git diff e945d7ef^ e945d7ef --check` passed.
- `git diff 40dadf86^ 40dadf86 --check` passed.
- `git diff --check` passed for ARGUS review docs.
- Added-line sensitive scans were reviewed. Hits were synthetic document
  fixtures, fake tokens/URLs, fixed public copy/codes, or docs text only.
- Direct raw-message grep found no direct `*.message` route response returns in
  `apps/api/src/routes/documents.ts`; the remaining match is the internal
  missing-row classifier.
- `npm exec --yes pnpm@10.32.1 -- run test:writing` was not run because public
  document readback behavior was not changed.

## Handoff

MIMIR should close or route the next lane. Forum, thread, comment, and other
route-level raw errors remain future audit surface.
