# PR390 - Writing Linked Cue Renderability

Opened: 2026-06-27
Owner: DAEDALUS
Status: open

## Purpose

Resolve the PR389 hosted block.

ARIADNE could load `/writing` on fresh hosted web/API at `3d8cc898`, but did
not see any visible `Open document and linked discussion` cue to follow.

MIMIR checked the public hosted feed after the block and found this is not an
empty fixture problem:

- `/discover/feed?tab=new&limit=100` returned 12 public document items.
- 5 of those document items carried linked discussion pointers.
- The replay public document family includes `Station Replay Alpha Note`.
- `/spaces/station-replay-alpha` also returned linked public documents.

The remaining question is why the hosted `/writing` human surface did not make
that cue visible enough for ARIADNE to exercise.

## Scope

Inspect and, only if needed, patch the `/writing` linked-discussion cue render
path:

- `apps/web/components/writing/writing-index.tsx`;
- `apps/web/lib/writing-feed.ts`;
- `/discover/feed?tab=new|featured` response shape as consumed by `/writing`;
- any existing writing/component tests that can prove visible cue rendering;
- exact ARIADNE hosted rerun instructions if the behavior is already correct.

Out of scope:

- creating, publishing, or seeding a new public document;
- starting a new discussion thread;
- changing `/documents/:id/discussion` semantics;
- Station Press;
- social dispatch;
- scheduled publishing;
- rich text/editor redesign;
- approval-state expansion;
- schema, migration, billing, provider, Redis, Cloudflare, worker, queue, or
  broad UI work.

## Questions To Answer

With evidence:

- Does `/writing` receive linked document feed items in the same shape as the
  hosted public API exposes?
- Does the card renderer actually show `Open document and linked discussion`
  for a linked document item?
- Is the cue too small, hidden, filtered away, duplicated only below the fold,
  or missing from the exact card ARIADNE inspected?
- Does signing in as replay owner alter the `/discover/feed` response in a way
  that removes linked writing cards?
- Should ARIADNE be given an exact existing public title/search route for the
  rerun, or is a code patch required first?

## Implementation Guidance

If this is only a rehearsal targeting issue:

- Produce a map-only result with exact hosted steps for ARIADNE.
- Name the public title(s) to search for, but do not record raw document ids or
  raw thread ids.
- Wake MIMIR or ARIADNE with the rerun route.

If this is a UI/rendering issue:

- Patch only the writing card/cue renderability gap.
- Keep `/writing` as a route-through surface; document detail remains the live
  `Open linked discussion` or owner-only `Start discussion` surface.
- Prefer a visible, accessible text cue over subtle metadata that a human pass
  can miss.
- Add focused coverage that proves a linked writing item renders the cue.

## Validation

Run the focused checks that match the outcome. Expect:

```bash
npm exec --yes pnpm@10.32.1 -- run test:writing
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run test:document-discussions
npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck
git diff --check
```

If API behavior is touched, also run:

```bash
npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck
```

## Handoff

Wake ARGUS if code changes were made.

Wake MIMIR if the result is map-only or if the next move should be an ARIADNE
rerun.

Include:

- root cause of the PR389 block;
- whether the hosted public feed already contains linked writing documents;
- whether signed-in replay owner state changes the feed;
- exact visible route/search steps for ARIADNE if no patch is needed;
- validation run;
- residual risks and recommended next owner.
