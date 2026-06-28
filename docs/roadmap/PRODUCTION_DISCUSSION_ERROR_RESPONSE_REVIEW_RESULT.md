# Production Discussion Error Response ARGUS Review

Owner: ARGUS / A3

Date: 2026-06-28

Reviewed handoff:

`docs/roadmap/PRODUCTION_DISCUSSION_ERROR_RESPONSE_DAEDALUS.md`

Implementation result:

`docs/roadmap/PRODUCTION_DISCUSSION_ERROR_RESPONSE_RESULT.md`

Verdict:

```text
ACCEPTED AFTER NARROW ARGUS PATCH
```

## Decision

- Forum/subcommunity, thread, and comment route dependency failures now return
  stable public-safe responses with fixed route-specific error codes.
- Thread and comment witness add/remove failures now also return stable
  public-safe responses after ARGUS added a narrow patch for the missed
  recognition mutation path.
- Recognition readback, delegated moderation report listing, moderator list,
  moderator assignment, and moderator revoke failures now return stable
  public-safe responses. Moderator assignment keeps the existing not-found and
  owner-assignment status distinctions without returning raw service text.
- Successful forum taxonomy, subcommunity read/list/create, thread/comment
  behavior, voting, watch state, moderation, recognition, linked document
  discussion semantics, public visibility behavior, hosted config, and hosted
  data did not change.
- Scope stayed inside discussion route response mapping, focused tests, and
  roadmap/testing documentation. No forum/thread/comment schema, taxonomy,
  voting semantics, moderation policy, linked document discussion semantics,
  UI, package manifests, Redis, Cloudflare, provider/model behavior, billing,
  auth/session semantics, workers, queues, hosted config, or hosted data
  changes were introduced.

## ARGUS Patch

ARGUS found that thread/comment witness add/remove routes still allowed
`setCommunityWitness`, `removeCommunityWitness`, or witness summary readback
failures to fall through to the global handler. The global handler sanitizes,
but this lane asked for route-specific stable public responses.

ARGUS added:

- `THREAD_ERROR_RESPONSES.witness` and `COMMENT_ERROR_RESPONSES.witness`;
- fixed 500 responses around thread/comment witness add/remove service calls
  and summary readback;
- hostile community tests for thread witness add/remove and comment witness
  add/remove failures.

## Validation

- `npm exec --yes pnpm@10.32.1 -- run test:community` passed, 38 tests.
- `npm exec --yes pnpm@10.32.1 -- run test:document-discussions` passed, 4
  tests.
- `npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck` passed.
- `npm exec --yes pnpm@10.32.1 -- run test:reports` passed, 6 tests.
- `git diff 14a1ab56^ 14a1ab56 --check` passed.
- `git diff a71d5ef4^ a71d5ef4 --check` passed.
- `git diff 82d48275^ 82d48275 --check` passed.
- `git diff --check` passed for ARGUS review docs.
- Added-line sensitive scans were reviewed; hits were synthetic discussion
  fixtures, fake tokens/URLs, fixed public copy/codes, or docs text only.
- Direct raw-response grep was reviewed; remaining forum/thread/comment route
  matches are zod validation messages or internal status classification, not
  route responses returning raw service text.

## Handoff

MIMIR should close the discussion error-response lane and decide the next
roadmap move.
