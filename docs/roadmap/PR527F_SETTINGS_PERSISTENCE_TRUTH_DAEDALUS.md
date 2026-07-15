# PR527F - Settings Persistence Truth Implementation

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Date opened: 2026-07-16

Status: Open - exact accepted local implementation

## Authority

Implement the complete accepted boundary in:

`docs/roadmap/PR527F_SETTINGS_PERSISTENCE_TRUTH_PREFLIGHT_ARGUS_RESULT.md`

Verdict:

```text
ACCEPT_PR527F_OWNER_ONLY_FORUM_REPLY_NOTIFICATION_PREFERENCE_GATING_FUTURE_THREAD_COMMENT_FANOUT
```

The result document is authoritative for schema, defaults, RLS/grants, API
shapes, fanout semantics, UI copy/state machine, non-destruction guarantees,
tests, rendered proof, hosted lifecycle design, and frozen scope. Do not
simplify it into checkbox persistence.

## Required Product Slice

Implement one real in-app owner preference:

```text
Forum reply notifications
```

Required end-to-end behavior:

- migration `084` creates only the dedicated owner preference table with one
  default-true boolean, updated-at trigger, exact owner RLS, least grants,
  comments, advisory lock, schema reload, and no backfill;
- missing row and explicit true mean enabled; explicit false means disabled;
- authenticated GET/PATCH return authoritative owner-only state with strict
  validation and bounded errors;
- `notifyThreadComment` performs one bulk preference read after recipient
  deduplication/self-removal and before the first insert;
- explicit-false authors/watchers receive no future `thread_comment` row;
- preference-read failure inserts no reply notifications but does not turn a
  valid comment `201` into a comment failure;
- report/review notification creation, Watches, existing notifications, and
  read/unread behavior remain unchanged;
- Settings exposes one controlled, non-optimistic live preference with stale
  response and one-GET reconciliation handling; and
- the four unsupported categories are plain unavailable facts with no control
  or default-on implication.

## Exact Allow-List

```text
infra/supabase/migrations/084_community_notification_preferences.sql
packages/db/src/types.ts
apps/api/src/routes/settings.ts
apps/api/src/routes/settings.test.ts
apps/api/src/services/community-notifications.service.ts
apps/api/src/routes/community.test.ts
apps/web/lib/api-client.ts
apps/web/lib/notification-preferences.ts
apps/web/lib/notification-preferences.test.ts
apps/web/components/settings/notification-preferences-panel.tsx
apps/web/app/settings/page.tsx
docs/roadmap/PR527F_SETTINGS_PERSISTENCE_TRUTH_DAEDALUS_RESULT.md
docs/roadmap/ACTIVE_STATUS.md
docs/roadmap/LANE_INDEX.md
docs/testing/VALIDATION_BASELINE.md
.station-agents/state/DAEDALUS.json
```

Respect every file-specific limit in the accepted ARGUS result. Do not change
CSS/global theme, packages, lockfile, auth, middleware, notification list,
Watch/comment/report/review routes, AI providers, Profile/Privacy, deletion,
social, billing, Archive, external delivery, config, or infrastructure.

## Validation

Prove all schema, API, fanout, state-machine, stale/reconciliation, exact-copy,
non-destruction, and forbidden-scope cases listed by ARGUS. Run exactly:

```text
npx --yes pnpm@10.32.1 test:ai-settings
npx --yes pnpm@10.32.1 test:community
npx --yes pnpm@10.32.1 test:reports
npx --yes pnpm@10.32.1 exec tsx --test apps/web/lib/notification-preferences.test.ts
npx --yes pnpm@10.32.1 --filter @station/db build
npx --yes pnpm@10.32.1 --filter @station/api typecheck
npx --yes pnpm@10.32.1 --filter @station/web typecheck
npx --yes pnpm@10.32.1 --filter @station/web lint
git diff --check
```

Run intercepted local rendered proof for every required state in System,
Light, and Dark at `1440x900` and `390x844`. Record controlled checked-state
timing, requests, focus/keyboard behavior, geometry/overflow, page errors, and
console errors. No hosted route or real product mutation may be reachable.
Remove all temporary harnesses, screenshots, sessions, and servers.

Do not apply migration `084`, add a hosted ledger row, create a preference,
comment, notification, Watch, disposable account, or other hosted product row.
Hosted mutation begins only after ARGUS independently accepts this
implementation.

## Result And Handoff

Create:

`docs/roadmap/PR527F_SETTINGS_PERSISTENCE_TRUTH_DAEDALUS_RESULT.md`

Record changed paths, exact migration/API/fanout/UI behavior, every test count,
rendered state matrix, diagnostics, zero hosted mutation, and artifact cleanup.
Do not claim hosted acceptance.

Commit and push the complete implementation, then wake ARGUS:

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS implemented PR527F's owner-only Forum reply notification preference across migration, API, fanout, and Settings UI.
Task:
- Hostile-review against the complete accepted preflight, rerun all local and rendered gates, patch only inside the allow-list if required, and wake MIMIR with the verdict.
- Do not apply migration 084 or mutate hosted product data before acceptance.
```
