# Production Discovery Space Error Response Result

Owner: DAEDALUS / A2

Date: 2026-06-28

Verdict:

```text
READY FOR ARGUS DISCOVERY SPACE ERROR RESPONSE REVIEW
```

## Decision

- `/discover/feed` and `/discover/sidebar` dependency failures now return
  stable public-safe responses with fixed route-specific error codes.
- Discovery feed result errors are checked for document, thread, Developer
  Space, public Space, event, node, and featured-feed dependency paths instead
  of returning raw thrown service text or silently composing from failed query
  results.
- Owner Space list, Space create, Space update, Space delete, Space page
  create, Space page update, and public Space composition failures now return
  stable public-safe responses with fixed route-specific error codes.
- Existing safe outcomes for not-found Space reads, private Space access,
  owner manage access, slug conflicts, tier limits, and page authorization
  remain unchanged.
- Successful discovery feed/sidebar/search behavior, public Space readback,
  owner Space management, Space page management, tier checks, visibility
  policy, presentation encoding, hosted config, and hosted data did not change.

## Tests

- `apps/api/src/routes/community.test.ts` now forces hostile service payloads
  through discovery feed/sidebar failures and proves private IDs, table
  markers, URLs/tokens, private Space/page content, unpublished document
  content, feed internals, provider payload labels, and stack-shaped strings
  are not returned from failing route responses.
- `apps/api/src/routes/spaces.test.ts` now forces hostile service payloads
  through public Space composition, owner Space list/create/update/delete, and
  Space page create/update failures and proves the same sensitive markers are
  not returned.
- Existing community and Space tests continue to cover discovery visibility,
  public Space readback, owner/private Space visibility, presentation encoding,
  persona serialization, slug conflict behavior, and tier limits.

## Validation

- `npm exec --yes pnpm@10.32.1 -- run test:spaces` passed, 2 tests.
- `npm exec --yes pnpm@10.32.1 -- run test:community` passed, 39 tests.
- `npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck` passed.
- `git diff --check` passed.
- Added-line sensitive scan was reviewed; hits were synthetic discovery/Space
  fixtures, fake tokens/URLs, fixed public copy/codes, or docs text only.
- Direct raw-response grep was reviewed; the remaining target-file match is
  the internal missing-single classifier in `spaces.ts`, not a route response
  returning raw service text.
- `test:writing` was not run because public document readback and writing feed
  behavior were not changed.

## Handoff

ARGUS should hostile-review discovery/Space response mapping, discovery
feed/sidebar/search behavior preservation, public Space readback, owner
Space/page management behavior, visibility behavior, and focused tests. ARGUS
should wake MIMIR if accepted, or DAEDALUS if fixes are required.
