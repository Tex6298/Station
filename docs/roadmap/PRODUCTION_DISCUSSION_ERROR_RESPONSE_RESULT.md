# Production Discussion Error Response Result

Owner: DAEDALUS / A2

Date: 2026-06-28

Verdict:

```text
READY FOR ARGUS DISCUSSION ERROR RESPONSE REVIEW
```

## Decision

- Forum and subcommunity list/read/create failures now return stable
  public-safe responses with fixed route-specific error codes.
- Thread list/read comment-load, create, watch load/update/delete, vote,
  moderation, delete, and subcommunity visibility failures now return stable
  public-safe responses with fixed route-specific error codes.
- Comment list, create, vote, moderation, delete, and subcommunity visibility
  failures now return stable public-safe responses with fixed route-specific
  error codes.
- Recognition readback, delegated moderation report listing, moderator list,
  moderator assignment, and moderator revoke failures now return stable
  public-safe responses. Moderator assignment keeps the existing not-found and
  owner-assignment status distinctions without returning raw service text.
- Successful forum taxonomy, subcommunity read/list/create, thread/comment
  behavior, voting, watch state, moderation, recognition, linked document
  discussion semantics, public visibility behavior, hosted config, and hosted
  data did not change.

## Tests

- `apps/api/src/routes/community.test.ts` now forces hostile service payloads
  through forum, thread, and comment failure paths and proves private IDs,
  table markers, URLs/tokens, hidden comment bodies, draft/publication content,
  moderator internals, provider payload labels, and stack-shaped strings are
  not returned from failing route responses.
- Existing community tests continue to cover forum taxonomy, subcommunity
  gates, moderator roles, delegated queues, tier gates, witnesses, watches,
  notification fanout, provenance labels, moderation actions, comments,
  documents, and Discover behavior.

## Validation

- `npm exec --yes pnpm@10.32.1 -- run test:community` passed, 38 tests.
- `npm exec --yes pnpm@10.32.1 -- run test:document-discussions` passed, 4
  tests.
- `npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck` passed.
- `git diff --check` passed.
- `npm exec --yes pnpm@10.32.1 -- run test:reports` passed, 6 tests,
  because delegated moderation/report-adjacent response paths were touched.
- Added-line sensitive scan was reviewed; hits were synthetic discussion
  fixtures, fake tokens/URLs, fixed public copy/codes, or docs text only.
- Direct raw-response grep was reviewed; remaining matches in forum/thread/
  comment routes are zod parse errors, internal status classification, or
  schema-detection helpers rather than route responses that return raw service
  text.
## Handoff

ARGUS should hostile-review the discussion response mapping, voting/watch/
moderation/recognition behavior preservation, linked document discussion
compatibility, and focused tests. ARGUS should wake MIMIR if accepted, or
DAEDALUS if fixes are required.
