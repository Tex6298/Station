# PR527F - Settings Persistence Truth DAEDALUS Result

Owner: DAEDALUS / A2

Date completed: 2026-07-16

Status: Ready for ARGUS hostile review

```text
READY_PR527F_SETTINGS_PERSISTENCE_TRUTH_FOR_ARGUS
```

## Scope Completed

Implemented the accepted local PR527F slice from
`docs/roadmap/PR527F_SETTINGS_PERSISTENCE_TRUTH_PREFLIGHT_ARGUS_RESULT.md`.

Changed only the allowed product paths:

- `infra/supabase/migrations/084_community_notification_preferences.sql`
- `packages/db/src/types.ts`
- `apps/api/src/routes/settings.ts`
- `apps/api/src/routes/settings.test.ts`
- `apps/api/src/services/community-notifications.service.ts`
- `apps/api/src/routes/community.test.ts`
- `apps/web/lib/api-client.ts`
- `apps/web/lib/notification-preferences.ts`
- `apps/web/lib/notification-preferences.test.ts`
- `apps/web/components/settings/notification-preferences-panel.tsx`
- `apps/web/app/settings/page.tsx`
- roadmap/testing docs

No hosted migration, hosted ledger row, preference row, comment,
notification, Watch, profile, report, review request, external delivery, or
other product-data mutation was performed.

## Migration 084

Added `public.community_notification_preferences` with:

- `owner_user_id uuid primary key references public.profiles(id) on delete cascade`
- `forum_reply_notifications_enabled boolean not null default true`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

The migration uses a lane-specific advisory lock, requires `profiles` and
`handle_updated_at()` to exist, fails if the preference table already exists,
adds the existing updated-at trigger, enables RLS, creates separate owner
SELECT/INSERT/UPDATE policies, grants only SELECT/INSERT/UPDATE to
`authenticated`, grants full table access to `service_role`, adds comments for
missing-row-enabled and future-only `thread_comment` gating, requests
PostgREST schema reload, and commits atomically.

It does not add a Profile column, generic preference registry, DELETE policy,
backfill, or data write.

## API And Fanout

Added authenticated:

```text
GET   /settings/notifications
PATCH /settings/notifications
```

GET returns missing rows as enabled. PATCH accepts only
`forumReplyNotificationsEnabled: boolean`, ignores any client owner identity,
upserts by `req.user!.id`, and returns the authoritative saved boolean. Invalid
PATCH bodies return bounded `400`
`invalid_forum_reply_notification_preference`. Storage failures return bounded
`500` load/save codes without raw database detail.

`notifyThreadComment` now performs one bulk preference read after author and
unmuted-watcher recipient dedupe/self-removal and before any notification
insert. Explicit-false recipients are removed; missing and true rows remain.
Preference lookup failure throws before insert, so the existing comment route
keeps a valid comment `201` while reply notification fanout fails closed.

`createCommunityNotification`, report status notifications, review request
notifications, Watches, existing notification rows, and read/unread behavior
were not changed.

## Settings UI

Replaced the five checked-disabled notification placeholders with one live
Forum replies control and four unavailable facts.

The live control:

- restores by GET on page load/refresh;
- uses the API response as the only checked-state authority;
- keeps the previous authoritative checked value while saving;
- disables during save/reconcile/failure states;
- handles malformed/stale PATCH responses by issuing one GET reconciliation;
- handles reconcile failure and signed-out/expired state with bounded copy;
- prevents the browser from visually toggling before authoritative readback;
- uses no localStorage, cookie, query, or optimistic cache as preference truth.

The unavailable categories are rendered as text facts only:

- Archive completions
- Integrity session reminders
- Follower notifications
- Event reminders

No checkbox, switch, button, link, checked state, or default-on implication is
rendered for those four categories.

## Validation

| Command / proof | Result |
| --- | --- |
| `npx --yes pnpm@10.32.1 test:ai-settings` | Pass, `14/14` |
| `npx --yes pnpm@10.32.1 test:community` | Pass, `54/54` |
| `npx --yes pnpm@10.32.1 test:reports` | Pass, `9/9` |
| `npx --yes pnpm@10.32.1 exec tsx --test apps/web/lib/notification-preferences.test.ts` | Pass, `5/5` |
| `npx --yes pnpm@10.32.1 --filter @station/db build` | Pass |
| `npx --yes pnpm@10.32.1 --filter @station/api typecheck` | Pass |
| `npx --yes pnpm@10.32.1 --filter @station/web typecheck` | Pass |
| `npx --yes pnpm@10.32.1 --filter @station/web lint` | Pass, zero warnings/errors |

Rendered intercepted local proof used Next at `127.0.0.1:3160` and a synthetic
API origin at `127.0.0.1:4999`; every `/auth/me`, `/auth/refresh`, and
`/settings/notifications` request was intercepted. No hosted route or hosted
product mutation was reachable.

Rendered matrix: `21/21` cases passed:

- System, Light, and Dark at `1440x900` and `390x844`;
- ready enabled and ready disabled;
- initial loading;
- initial load failure;
- signed-out shell state;
- expired-session state with expected filtered `401` resource noise only;
- save disabled success;
- save enabled success;
- malformed/stale PATCH followed by one GET reconciliation;
- save plus reconcile failure;
- stale initial GET ignored after unmount.

All rendered cases had zero page errors, zero unfiltered console errors, zero
document overflow, and zero section overlap. Ready cases proved the control
was focusable. Loading/error/signed-out failure states kept the control
disabled and did not present checked truth. Saving proof showed the prior
authoritative checked state remained visible while the PATCH was in flight.

The temporary Playwright harness under `.tmp` and the local Next server were
removed/stopped after proof.

## Claim Boundary

This is local implementation evidence only. Migration `084` was not applied
to hosted Supabase, no hosted ledger row was inserted, and no hosted product
data was created or changed. The hosted lifecycle in the ARGUS preflight
remains a separate future lane after independent ARGUS acceptance.

## Handoff

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS implemented PR527F's owner-only Forum reply notification preference across migration, API, fanout, and Settings UI.
Task:
- Hostile-review against the complete accepted preflight, rerun all local and rendered gates, patch only inside the allow-list if required, and wake MIMIR with the verdict.
- Do not apply migration 084 or mutate hosted product data before acceptance.
```
