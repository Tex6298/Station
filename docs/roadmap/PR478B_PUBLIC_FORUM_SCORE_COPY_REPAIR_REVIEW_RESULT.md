# PR478B - Public Forum Score Copy Repair ARGUS Review Result

Owner: ARGUS / A3

Date: 2026-06-29

Verdict: `ARGUS_ACCEPTED_PR478B_PUBLIC_FORUM_SCORE_COPY_REPAIR`

## Decision

ARGUS accepts DAEDALUS' PR478B Public Forum Score Copy Repair.

The implementation repairs the hosted PR478A blocker by removing visible
positive score/vote/trust framing from public forum thread and list surfaces
while preserving the existing vote endpoints, API response fields, and local
score/vote state updates.

## Reviewed Surface

ARGUS reviewed the PR478B implementation delta from `18c475a0` to `1fc9b184`:

- `apps/web/lib/forum-copy.ts`
- `apps/web/lib/forum-copy.test.ts`
- `apps/web/app/forums/[categorySlug]/page.tsx`
- `apps/web/app/forums/[categorySlug]/[threadId]/page.tsx`
- PR478B roadmap and validation docs

ARGUS also read the ARIADNE defect result and MIMIR repair handoff:

- `docs/roadmap/PR478A_COMMUNITY_TRUST_READBACK_REHEARSAL_RESULT.md`
- `docs/roadmap/PR478B_PUBLIC_FORUM_SCORE_COPY_REPAIR_DAEDALUS.md`

## Findings

Accepted:

- Public thread detail no longer renders visible `Score N` copy.
- Comment cards no longer render visible `N votes` copy.
- Category thread cards no longer render public `trust N` author byline copy.
- Signed-in feedback controls now render `Useful` and `Needs work` instead of
  `Up` and `Down`.
- Public readback copy uses neutral `Discussion feedback` and `Comment
  feedback`.
- Vote endpoints, payload values, response fields, and local state updates
  remain intact.
- Forum witness/trust readback remains separate from forum participation
  feedback.

No safety gap found:

- no API route, schema, serializer, report queue, moderation action, witness
  behavior, notification behavior, Redis, Cloudflare, worker/queue, billing, or
  provider scope changed;
- no witnesser identity, reporter identity, raw report/witness row,
  hidden/deleted body, private comment, moderation note, SQL/table detail,
  stack trace, provider payload, hosted log, auth header, cookie, or
  secret-shaped value was added.

## Validation

ARGUS reran the requested validation locally:

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 168 tests passed, including forum copy source regression and PR478A trust-readback assertions. |
| `npm exec --yes pnpm@10.32.1 -- run test:community` | Pass | 41 tests passed, including forum copy and existing vote behavior coverage. |
| `npm exec --yes pnpm@10.32.1 -- run test:reports` | Pass | 6 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API typecheck replayed from cache; web typecheck ran successfully. |
| `git diff --check 18c475a0..1fc9b184` | Pass | No implementation-diff whitespace errors. |
| `git diff --cached --check` | Pass | No staged whitespace errors. |
| API/schema diff check | Pass | No changed files under API, packages/types, packages/db, db, migrations, or Supabase paths. |
| Diff/source score-language scan | Pass | Legacy labels appeared only as removed lines or negative-boundary docs/tests. |
| Secret-shaped diff scan | Pass | No secret-shaped values or provider key material found. |

## Handoff

Wake MIMIR:

```text
WAKEUP A1:
Codename: MIMIR
```

Task: close PR478B as accepted and decide the next move. ARGUS recommends
routing ARIADNE for a PR478A hosted rerun at app commit `1fc9b184` or later to
confirm the original hosted score/vote-copy blocker is gone:

- signed-out public thread detail desktop/mobile should show PR478A witness
  readback without visible `Score N`, `N votes`, `Up`, `Down`, or public
  `trust N` byline copy;
- signed-in eligible viewer should see neutral `Useful` / `Needs work`
  controls without reputation, ranking, badge, clout, or leaderboard language;
- existing vote mechanics should still work if exercised in a bounded hosted
  proof;
- private `/forums/witnesses` and all witness/reporter/moderation/privacy
  boundaries should remain as previously accepted.
