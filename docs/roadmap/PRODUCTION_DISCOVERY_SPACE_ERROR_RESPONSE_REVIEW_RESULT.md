# Production Discovery Space Error Response ARGUS Review

Owner: ARGUS / A3

Date: 2026-06-28

Reviewed handoff:

`docs/roadmap/PRODUCTION_DISCOVERY_SPACE_ERROR_RESPONSE_DAEDALUS.md`

Implementation result:

`docs/roadmap/PRODUCTION_DISCOVERY_SPACE_ERROR_RESPONSE_RESULT.md`

Verdict:

```text
ACCEPTED AFTER NARROW ARGUS PATCH
```

## Decision

- `/discover/feed` and `/discover/sidebar` dependency failures now return
  stable public-safe responses with fixed route-specific error codes.
- Featured discovery item visibility lookup failures now also return the fixed
  discovery feed response after ARGUS added a narrow patch for the missed
  dependency path. Missing featured records remain filtered out.
- Owner Space list, Space create, Space update, Space delete, Space page
  create, Space page update, and public Space composition failures now return
  stable public-safe responses with fixed route-specific error codes.
- Public Space persona eligibility lookup failures now return the fixed public
  Space load response after ARGUS added a narrow patch for the missed
  composition dependency. Missing owner profile rows remain ineligible rather
  than fatal.
- Existing safe outcomes for not-found Space reads, private Space access,
  owner manage access, slug conflicts, tier limits, and page authorization
  remain unchanged.
- Successful discovery feed/sidebar/search behavior, public Space readback,
  owner Space management, Space page management, tier checks, visibility
  policy, presentation encoding, hosted config, and hosted data did not change.
- Scope stayed inside discovery/Space route response mapping, focused tests,
  and roadmap/testing documentation. No discovery ranking/search behavior,
  Space schema, page schema, presentation encoding, slug generation,
  tier permissions, visibility policy, forum/thread/comment route behavior,
  UI, package manifests, Redis, Cloudflare, provider/model behavior, billing,
  auth/session semantics, workers, queues, hosted config, or hosted data
  changes were introduced.

## ARGUS Patch

ARGUS found two dependency-error paths that still silently composed from failed
query results instead of returning route-specific fixed responses:

- featured discovery item visibility checks in `canShowFeaturedItem`;
- public Space persona eligibility checks during public Space composition.

ARGUS added:

- non-missing featured visibility query errors mapped to
  `DISCOVER_ERROR_RESPONSES.feed`;
- public Space persona eligibility query errors mapped to
  `SPACE_ERROR_RESPONSES.publicRead`;
- focused hostile tests for featured persona visibility and public Space
  persona eligibility failures.

## Validation

- `npm exec --yes pnpm@10.32.1 -- run test:spaces` passed, 2 tests.
- `npm exec --yes pnpm@10.32.1 -- run test:community` passed, 39 tests.
- `npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck` passed.
- `git diff 591dad48^ 591dad48 --check` passed.
- `git diff 56b5125^ 56b5125 --check` passed.
- `git diff e04cb219^ e04cb219 --check` passed.
- `git diff --check` passed before committing ARGUS review docs.
- Added-line sensitive scans were reviewed; hits were synthetic discovery/Space
  fixtures, fake tokens/URLs, fixed public copy/codes, or docs text only.
- Direct raw-response grep was reviewed; the remaining target-file match is
  the internal missing-single classifier in `spaces.ts`, not a route response
  returning raw service text.
- `test:writing` was not run because public document readback and writing feed
  behavior were not changed.

## Handoff

MIMIR should close the discovery/Space error-response lane and decide the next
roadmap move.
