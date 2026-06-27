# PR388 - Public Document Discussion Affordance Result

Owner: DAEDALUS

Date: 2026-06-27

Status: Ready for ARGUS review

## Summary

DAEDALUS reconciled the PR387 caveat with the accepted PR323/PR324 public
document discussion chain and made one small writing-surface repair.

PR324 remains valid: the hosted chain from public Space to public document to
linked forum discussion was previously proven through:

```text
/ -> /space/station-replay-alpha -> /space/station-replay-alpha/documents/[document] -> /forums/documents-and-codexes/[thread]
```

The PR387 sampled document had safe trust/version/discussion-state readback but
did not expose an active linked discussion action. Code inspection found no API
or document-detail regression: public document detail still shows `Open linked
discussion` when a readable linked thread exists, owner-only `Start discussion`
when an eligible owner can open one, and honest unavailable copy otherwise.

The narrow gap was `/writing`: it consumes `/discover/feed`, whose document
items already include `discussionThreadId`, but the writing feed type/control did
not expose that field to cards. Raw curated rows also dropped either
`discussionThreadId` or `discussion_thread_id` if present. That meant `/writing`
could route a human to a public document while hiding the same linked-discussion
cue already visible on Discover and public Space surfaces.

## What Changed

- Preserved `discussionThreadId` in `WritingItem`.
- Preserved camel-case and snake-case discussion pointers when normalizing raw
  curated writing rows.
- Rendered the shared `Open document and linked discussion` cue on `/writing`
  document cards when the existing feed item has a linked discussion pointer.
- Updated writing-feed tests to prove the discussion pointer survives both
  normalized feed items and raw curated rows.

No API route, schema, migration, publishing behavior, discussion creation,
approval workflow, Station Press, social dispatch, provider, billing, Redis,
Cloudflare, worker, queue, or broad UI behavior changed.

## Files Changed

- `apps/web/components/writing/writing-index.tsx`
- `apps/web/lib/writing-feed.ts`
- `apps/web/lib/writing-feed.test.ts`
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/roadmap/PR388_PUBLIC_DOCUMENT_DISCUSSION_AFFORDANCE_RESULT.md`
- `docs/testing/VALIDATION_BASELINE.md`

## Validation

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/writing-feed.test.ts apps/web/lib/public-story-polish.test.ts` | Pass | 14 focused writing/public-story helper tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:document-discussions` | Pass | 2 tests passed; API discussion eligibility/readback boundaries remain green. |
| `npm exec --yes pnpm@10.32.1 -- run test:writing` | Pass | 21 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 126 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck` | Pass | Web TypeScript check passed. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck` | Pass | API TypeScript check passed. |
| `git diff --check` | Pass | Whitespace check passed with CRLF normalization warnings only. |

## Handoff

ARGUS should review the patch as a writing-surface affordance repair:

- linked documents keep the same cue across Discover, Space, and Writing cards;
- document detail remains the only place with live `Open linked discussion` or
  owner-only `Start discussion` actions;
- documents without linked discussions still avoid pretending a live action
  exists;
- no public document or discussion mutation was introduced.

If ARGUS accepts, MIMIR can either close PR388 or open ARIADNE to rerun the
hosted `/writing` to public-document path after deploy. The hosted proof should
prefer an existing cued replay document and must not publish new public data or
start a new discussion by default.
