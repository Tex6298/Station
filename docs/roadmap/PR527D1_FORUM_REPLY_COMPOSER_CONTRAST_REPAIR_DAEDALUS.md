# PR527D1 - Forum Reply Composer Contrast Repair

Owner: MIMIR / A1 -> DAEDALUS / A2 -> ARGUS / A3 -> MIMIR / A1 -> ARIADNE / A4 -> MIMIR / A1

Date opened: 2026-07-15

Status:

```text
OPEN_PR527D1_FORUM_REPLY_COMPOSER_CONTRAST_REPAIR
```

## Product Problem

ARIADNE completed all `18` exact-SHA hosted PR527D cases. Thread and reply
content, metadata, actions, source navigation, Watch truth, focus, wrapping,
mobile navigation, theme persistence, diagnostics, and mutation boundaries
passed.

The live signed-in reply textarea is the one remaining presentation failure:

- its resting boundary measured `1.49:1` in Light and `1.55:1` in both
  System-resolved Dark and explicit Dark, below the `3:1` non-text gate; and
- its placeholder measured `3.41:1` in both Dark cases, below the `4.5:1`
  normal-text gate. Light placeholder text passed at `4.61:1`.

Source:

- `docs/roadmap/PR527D_FORUM_THREAD_SEMANTIC_THEME_REPAIR_HOSTED_REHEARSAL_RESULT.md`

## Required Implementation

1. Give the reply textarea a dedicated `forum-thread-detail-*` composer class
   instead of relying on the generic `.textarea` theme boundary alone.
2. Use existing `--station-page-*` semantic tokens so the enabled resting
   textarea edge reaches at least `3:1` against its surrounding card in
   System, Light, and Dark.
3. Give the scoped placeholder an explicit semantic color and opacity so it
   reaches at least `4.5:1` in every theme without becoming primary text.
4. Preserve the existing focus indicator, enabled/disabled truth, input text,
   textarea geometry, keyboard behavior, submit behavior, and wrapping.
5. Extend focused source-contract coverage for the dedicated class, resting
   boundary token, placeholder token, and placeholder opacity.

Do not weaken the locked contrast gates to fit the current values. Do not
change the generic `.textarea` contract for unrelated routes.

## Frozen Product Behavior

PR527D1 must not change:

- Forum routes, queries, reply creation/deletion, thread cleanup, or counts;
- Watch, vote, report, witness, moderation, source-link, or lock semantics;
- auth/session, owner, tier, RLS, API, database, migration, or fixture logic;
- global theme preference/storage/first-paint behavior;
- Forum index/category, Discover, Studio, or any unrelated page; or
- packages, lockfiles, seed data, Railway/Supabase config, and PR527E+ scope.

The hosted fixture summary said `1 reply` while two replies rendered. Preserve
that as a separate data/count-truth triage item. It is not permission to widen
this CSS correction.

## Repo Allow-List

DAEDALUS may change only:

```text
apps/web/app/forums/[categorySlug]/[threadId]/page.tsx
apps/web/app/globals.css
apps/web/lib/forum-copy.test.ts
docs/roadmap/PR527D1_FORUM_REPLY_COMPOSER_CONTRAST_REPAIR_DAEDALUS_RESULT.md
docs/roadmap/ACTIVE_STATUS.md
docs/roadmap/LANE_INDEX.md
docs/testing/VALIDATION_BASELINE.md
.station-agents/state/DAEDALUS.json
```

If another file is genuinely required, stop and wake MIMIR with the exact
reason before editing it.

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
For a signed-in populated thread at `1440x900`, `390x844`, and `375x812`, prove
System, Light, and Dark with the reply textarea enabled and empty.

Required rendered checks:

- resting textarea boundary contrast at least `3:1`;
- placeholder contrast at least `4.5:1`;
- input text and visible focus remain readable and at least their locked gates;
- no horizontal overflow, clipping, overlap, page errors, or unclassified
  console errors; and
- no Forum command or hosted product mutation.

This local proof is implementation evidence, not hosted acceptance.

## Required Result And Review Handoff

Create:

```text
docs/roadmap/PR527D1_FORUM_REPLY_COMPOSER_CONTRAST_REPAIR_DAEDALUS_RESULT.md
```

Return exactly one result:

```text
READY_PR527D1_FORUM_REPLY_COMPOSER_CONTRAST_REPAIR_FOR_ARGUS
BLOCK_PR527D1_<EXACT_STYLE_TEST_OR_RENDER_BLOCKER>
```

Record changed files, semantic class/token mapping, test totals, all nine
viewport/theme cases, contrast minima, focus/overflow/error results, and scope
checks. Commit the result and wake ARGUS. Do not go idle without a committed
review handoff.

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS completed the bounded PR527D1 reply-composer contrast repair.
Task:
- Hostile-review class/token scope, contrast gates, frozen Forum behavior, tests, and an independent nine-case rendered proof.
- Wake MIMIR with an accept/block verdict; hosted acceptance remains ARIADNE's separate rerun.
```
