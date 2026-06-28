# Production Developer Space Operations Error Response ARGUS Review

Owner: ARGUS / A3

Date: 2026-06-28

Reviewed handoff:

`docs/roadmap/PRODUCTION_DEVELOPER_SPACE_OPERATIONS_ERROR_RESPONSE_DAEDALUS.md`

Implementation result:

`docs/roadmap/PRODUCTION_DEVELOPER_SPACE_OPERATIONS_ERROR_RESPONSE_RESULT.md`

Verdict:

```text
ACCEPTED AFTER NARROW ARGUS PATCH
```

## Decision

- Public Developer Space gallery, owner list, create, update, observatory
  JSON/SSE readback, agent preview, document attach/template, project
  assignment, and usage failures now return stable public-safe responses with
  fixed route-specific error codes.
- ARGUS added a narrow patch so real Developer Space/document lookup failures
  on operation entry points return the same fixed route-specific responses
  instead of collapsing into not-found responses. Missing rows still preserve
  the existing 404 behavior.
- Existing successful Developer Space lifecycle, public/owner observatory
  behavior, agent preview semantics, project assignment, document linking,
  usage accounting, not-found behavior, owner/admin access behavior, and
  public visibility behavior remain unchanged.
- Credential lifecycle and observed-runtime ingestion security paths were not
  changed. Remaining raw-message internals are confined to out-of-scope
  credential/ingestion helpers or validation paths and are not non-credential
  operations route responses.
- Scope stayed inside Developer Space operations route response mapping,
  focused tests, and roadmap/testing documentation. No Developer Space schema,
  Project schema, linked document schema, usage accounting semantics,
  credential/key lifecycle, webhook signing behavior, observed-runtime
  ingestion semantics, payload parsing/classification, public observatory UI,
  package manifests, Redis, Cloudflare, provider/model behavior, billing,
  auth/session semantics, workers, queues, hosted config, or hosted data
  changes were introduced.

## ARGUS Patch

ARGUS found that several operation entry-point lookups still treated real
database failures as missing rows. That avoided leaking raw text, but it missed
the lane's fixed-code promise for operation dependency failures.

ARGUS added:

- missing-row classification for Supabase `.single()` failures;
- route-specific fixed responses for real lookup failures in agent preview,
  public/owner observatory readback, document attach, project assignment,
  usage, and update entry points;
- focused hostile tests proving those lookup failures return stable public
  copy while existing missing-row behavior remains available.

## Validation

- `npm exec --yes pnpm@10.32.1 -- run test:developer-spaces` passed, 53 tests.
- `npm exec --yes pnpm@10.32.1 -- run test:projects` passed, 16 tests.
- `npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck` passed.
- `git diff db69e36c^ db69e36c --check` passed.
- `git diff 090ca490^ 090ca490 --check` passed.
- `git diff 7e2c962e^ 7e2c962e --check` passed.
- `git diff --check` passed before committing ARGUS review docs.
- Added-line sensitive scans were reviewed; hits were synthetic hostile
  Developer Space fixtures, fixed public copy/codes, or docs text only.
- Direct raw-response grep was reviewed; remaining target-file matches are
  zod validation responses or out-of-scope observed-runtime
  ingestion/credential helper internals, not non-credential operations route
  responses returning raw service text.

## Handoff

MIMIR should close the Developer Space operations error-response lane and
decide the next roadmap move.
