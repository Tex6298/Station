# PR478B - Public Forum Score Copy Repair

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Date opened: 2026-06-29

Status: Open - repair PR478A hosted proof blocker

## Why This Repair

ARIADNE completed the hosted PR478A Community Trust Readback rehearsal and
returned:

`PRODUCT_DEFECT_NEEDS_DAEDALUS`

Result file:

`docs/roadmap/PR478A_COMMUNITY_TRUST_READBACK_REHEARSAL_RESULT.md`

The PR478A trust readback itself passed, but hosted public forum thread detail
still displays legacy positive public score/vote language on the same public
discussion surface. That conflicts with the PR478A boundary: community trust
readback must not read like public author scoring, public reputation, ranking,
badges, clout, or leaderboard mechanics.

## Task

Repair the visible public forum copy so PR478A trust readback can pass hosted
proof.

Expected direction:

- remove or reframe visible `Score N` / vote-count language from public forum
  thread/detail surfaces;
- keep the underlying existing vote mechanics and API contract intact unless a
  visible-copy-only repair is impossible;
- prefer neutral discussion/activity/readback copy over score/rank/vote copy;
- keep any current-viewer action wording honest but not reputation-like;
- keep aggregate witness marks distinct from forum participation signals.

Likely starting points:

- `apps/web/lib/forum-copy.ts`
- `apps/web/lib/forum-copy.test.ts`
- `apps/web/app/forums/[categorySlug]/[threadId]/page.tsx`
- `apps/web/app/forums/[categorySlug]/page.tsx`
- `apps/web/lib/community-trust-readback.test.ts`
- `apps/web/lib/community-witness.test.ts`

## Acceptance Criteria

- Public forum thread detail no longer shows positive public `Score N` copy.
- Public forum thread detail no longer presents vote-count copy as public
  reputation, rank, clout, leaderboard, badge, or author score.
- Category/thread list surfaces, if touched, use the same neutral copy contract.
- Existing vote endpoints and write behavior are not changed unless DAEDALUS
  stops and wakes MIMIR with the exact blocker.
- PR478A witness/trust readback remains unchanged or clearer:
  - witness counts stay aggregate-only;
  - current-viewer state stays visible only to the signed-in viewer;
  - `/forums/witnesses` stays private signed-in-author readback;
  - no witnesser identity, reporter identity, hidden/deleted body, moderation
    note, raw report/witness row, SQL/table detail, stack trace, provider
    payload, or private comment is exposed.
- No new public reputation system, score, ranking, badge, clout, leaderboard,
  public moderator directory, public reporter list, new moderation power,
  automated moderation, broad forum redesign, schema change, billing, Redis,
  Cloudflare, worker, or queue is introduced.

## Required Validation

Run the smallest relevant set plus whitespace:

```bash
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run test:community
npm exec --yes pnpm@10.32.1 -- run test:reports
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
git diff --cached --check
```

Also run a diff/source scan proving positive public score/reputation language
is gone from the PR478A forum trust proof:

- `Score `
- `public score`
- `user score`
- `rank`
- `leaderboard`
- `badge`
- `clout`
- `reputation profile`

Expected allowed matches are negative-boundary docs/tests only.

## Handoff

Wake ARGUS:

```text
WAKEUP A3:
Codename: ARGUS
```

Summary should state exactly what visible copy changed and whether any vote
mechanics/API behavior changed.

If a visible-copy-only repair is impossible, wake MIMIR instead with the exact
reason and the smallest safe next unblock.
