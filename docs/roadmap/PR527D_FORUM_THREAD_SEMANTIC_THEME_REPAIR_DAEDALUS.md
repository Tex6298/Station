# PR527D - Forum Thread Semantic Theme Repair

Owner: MIMIR / A1 -> DAEDALUS / A2 -> ARGUS / A3 -> MIMIR / A1 -> ARIADNE / A4 -> MIMIR / A1

Date opened: 2026-07-15

Status:

```text
OPEN_PR527D_FORUM_THREAD_SEMANTIC_THEME_REPAIR
```

## Product Problem

PR527's hosted inventory found that Forum create, reply, refresh, and cleanup
work, and PR527C has now closed the Watch lifecycle and boundary defect. The
remaining direct J09 product failure is presentation: thread post and reply
bodies use fixed light-theme text such as `#1f2529` inside dark cards, making
the discussion nearly unreadable in Dark.

The thread-detail route also carries fixed light palette values across
breadcrumbs, bylines, participation, Watch, witness, moderation, feedback,
reply controls, and utility buttons. Existing shared `--station-page-*`
tokens already define coherent Light and Dark values. This lane translates
the route onto that semantic contract; it is not a Forum redesign or broad
reskin.

Sources:

- `docs/roadmap/PR527_UI_PRODUCT_COMPLETENESS_HOSTED_JOURNEY_INVENTORY_ARIADNE_RESULT.md`
- `docs/roadmap/PR527C_FORUM_WATCH_HOSTED_LIFECYCLE_BOUNDARIES_CLOSEOUT_MIMIR.md`

## Required Implementation

1. Give the thread-detail surface route-specific semantic classes for its
   breadcrumb, primary thread card, labels, title, author/date metadata, body,
   participation row, comments, reply form, Watch/witness/moderation panels,
   links, buttons, and status/feedback states.
2. Replace fixed palette values on that route with existing
   `--station-page-*` text, muted, faint, surface, soft, border, selected,
   accent, success, warning, and danger tokens as appropriate.
3. Keep layout-only inline styles only where they remain clearer than a class.
   Do not use a new global `[style*=...]` compatibility override.
4. Preserve visible focus, native disabled truth, hover/pressed distinction,
   and readable success/error copy in both themes.
5. Preserve current wrapping and stable geometry for long titles, bodies,
   labels, action rows, and controls at desktop and narrow widths.
6. Add focused source-contract coverage proving primary/reply body text and
   interactive states use semantic classes/tokens and the fixed light palette
   no longer controls the thread-detail route.

Do not change supported commands or their copy merely to satisfy styling.
Where a fixed color participates in a state distinction, translate the same
meaning to the matching existing semantic token.

## Frozen Product Behavior

PR527D must not change:

- Forum/category/thread routes, data loading, reply creation/deletion, or
  thread cleanup behavior;
- Watch loading/error/reconciliation, tier/readability gates, PUT/DELETE
  behavior, idempotency, or notifications;
- vote, report, witness, moderation, document-link, or lock semantics;
- auth/session, owner, tier, RLS, API, database, migration, or fixture logic;
- Forum index/category composition or unrelated pages;
- global theme preference/storage/first-paint behavior; or
- packages, lockfiles, seed data, Railway/Supabase config, and PR527E+ scope.

## Repo Allow-List

DAEDALUS may change only:

```text
apps/web/app/forums/[categorySlug]/[threadId]/page.tsx
apps/web/app/globals.css
apps/web/lib/forum-copy.test.ts
docs/roadmap/PR527D_FORUM_THREAD_SEMANTIC_THEME_REPAIR_DAEDALUS_RESULT.md
docs/roadmap/ACTIVE_STATUS.md
docs/roadmap/LANE_INDEX.md
docs/testing/VALIDATION_BASELINE.md
.station-agents/state/DAEDALUS.json
```

If a different test file is genuinely required, stop and wake MIMIR with the
exact reason before editing it. Do not broaden CSS ownership to make the test
easier.

## Validation Gate

Run:

```text
npx --yes pnpm@10.32.1 test:community
npx --yes pnpm@10.32.1 test:studio-ui
npx --yes pnpm@10.32.1 --filter @station/web typecheck
npx --yes pnpm@10.32.1 --filter @station/web lint
git diff --check
```

Use a temporary local intercepted browser harness and remove it before commit.
At `1440x900`, `390x844`, and `375x812`, prove System, Light, and Dark for a
populated thread with a reply. Include signed-out and signed-in states plus
loading, ready, saving/disabled, and bounded failure presentation without
triggering real hosted mutations.

Required rendered checks:

- post and reply title/body/metadata normal text contrast at least `4.5:1`;
- controls, focus indicators, selected/pressed states, and meaningful borders
  remain distinguishable, with non-text contrast at least `3:1` where
  applicable;
- no horizontal overflow, clipped controls, overlapping content, unreadable
  disabled text, or theme-incoherent white/dark islands; and
- page errors and unclassified console errors remain zero.

This local proof is implementation evidence, not hosted acceptance.

## Required Result And Review Handoff

Create:

```text
docs/roadmap/PR527D_FORUM_THREAD_SEMANTIC_THEME_REPAIR_DAEDALUS_RESULT.md
```

Return exactly one result:

```text
READY_PR527D_FORUM_THREAD_SEMANTIC_THEME_REPAIR_FOR_ARGUS
BLOCK_PR527D_<EXACT_STYLE_TEST_OR_RENDER_BLOCKER>
```

Record changed files, removed fixed-palette ownership, token/class mapping,
test totals, the full nine-case viewport/theme matrix, contrast minima, state
coverage, overflow/error counts, and scope/secret checks. Commit the result
and wake ARGUS. Do not go idle without a committed review handoff.

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS completed the bounded PR527D Forum thread semantic-theme repair.
Task:
- Hostile-review fixed-palette removal, semantic token/class scope, all Forum behavior boundaries, tests, and independent rendered System/Light/Dark proof.
- Wake MIMIR with an accept/block verdict; do not fold hosted rehearsal into local acceptance.
```
