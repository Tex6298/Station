# PR390 - Writing Linked Cue Renderability Result

Owner: DAEDALUS

Date: 2026-06-27

Status: Accepted by ARGUS

## Summary

DAEDALUS inspected the PR389 hosted block and patched the smallest
renderability gap in `/writing`.

MIMIR had already confirmed hosted `/discover/feed?tab=new&limit=100` contains
public document items with linked discussion pointers, including the replay
public document family. Code inspection confirmed `/writing` consumes that same
public feed shape. Signing in as the replay owner should not remove linked
writing cards because `WritingIndex` calls `apiGet` without a token, and
`apiGet` only sends `Authorization` when a token argument is passed.

The remaining gap was visibility. PR388 rendered the cue as a small 10px
metadata pill beside the document type. That preserved the data correctly but
was too easy for a hosted human pass to miss.

## What Changed

- Promoted the `/writing` linked-discussion cue to its own visible card-level
  route-through line.
- Kept the cue text identical to the shared public affordance:
  `Open document and linked discussion`.
- Added `writingCardDiscussionCue` so the card and tests use the same
  eligibility decision.
- Added focused coverage proving the writing cue appears only for document
  items with a linked discussion pointer and does not appear for no-thread or
  non-document items.

The card still opens the public document detail route. Document detail remains
the live surface for `Open linked discussion` or owner-only `Start discussion`.
No forum thread is opened directly from `/writing`.

No public document, discussion thread, publishing transition, API route,
document-discussion semantics, schema, migration, Station Press, social
dispatch, scheduled publishing, rich text, approval expansion, provider,
billing, Redis, Cloudflare, worker, queue, or broad UI behavior changed.

## ARIADNE Rerun Steps

After hosted web deploys at or after this commit:

1. Sign in as replay owner if needed.
2. Open `/writing`.
3. Use the writing search box for:

```text
Station Replay Alpha Note
```

4. Confirm the matching card visibly shows:

```text
Open document and linked discussion
```

5. Open the card.
6. On the public document detail route, confirm:

```text
Open linked discussion
```

7. Open that linked discussion route and confirm it reaches the public forum
   thread.
8. Do not publish new public data or start a new discussion by default.

If the title is not present in `/writing` after a fresh deploy, return
`BLOCKED` with the hosted freshness prefix instead of creating data.

## Validation

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:writing` | Pass | 22 tests passed, including the writing card cue decision. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 126 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:document-discussions` | Pass | 2 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck` | Pass | Web TypeScript check passed. |
| `git diff --check` | Pass | Whitespace check passed with CRLF normalization warnings only. |

API typecheck was not rerun for PR390 because no API code or shared API contract
changed.

## ARGUS Review

Verdict: `PASS`.

ARGUS accepts PR390 as a narrow `/writing` visual cue renderability patch:

- The implementation matches the requested lane: `/writing` now renders the
  existing linked-discussion cue as a visible card-level route-through line.
- The linked discussion pointer is still required, and the visible cue text does
  not expose raw document or thread identifiers.
- `/writing` remains a document route-through surface. Public document detail
  remains the live `Open linked discussion` surface, and no new discussion
  creation or publishing action was added.
- Scope stayed bounded: no public document, discussion semantics, publishing
  transition, API route, schema, migration, Station Press, social dispatch,
  provider, billing, Redis, Cloudflare, worker, queue, or broad UI behavior
  changed.
- ARGUS validation passed the requested focused tests, web typecheck, and diff
  checks.

MIMIR can close PR390 and decide whether to open ARIADNE for a second hosted
rerun using the title-targeted steps above.
