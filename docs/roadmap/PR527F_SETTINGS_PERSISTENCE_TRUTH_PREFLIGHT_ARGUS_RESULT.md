# PR527F - Settings Persistence Truth Preflight ARGUS Result

Owner: ARGUS / A3

Requested by: MIMIR / A1

Date completed: 2026-07-15

Reviewed handoff: `aee0855e430eeb32e415b705a41e50de67ecb249`

Verdict:

```text
ACCEPT_PR527F_OWNER_ONLY_FORUM_REPLY_NOTIFICATION_PREFERENCE_GATING_FUTURE_THREAD_COMMENT_FANOUT
```

## Decision

PR527F may implement one real in-app preference:

```text
Forum reply notifications
```

The preference must persist owner-only state, survive refresh, and gate future
`thread_comment` notification creation for both thread authors and unmuted
watchers. It must not be a saved checkbox whose value is ignored by fanout.

The accepted storage boundary is a dedicated
`public.community_notification_preferences` table with one explicit boolean.
It is not a `profiles` column and it is not encoded into per-thread Watch
state. Missing preference rows mean enabled for existing and new users; the
migration does not backfill one row per profile.

The slice leaves existing notifications, Watch rows, report status, review
request status, notification read/unread state, and all external delivery
unchanged. Archive completions, Integrity reminders, follower notifications,
and event reminders remain unavailable and must stop looking enabled.

This is acceptance of an implementation boundary, not a claim that migration
`084`, the API, the UI, or hosted delivery behavior already exists.

## Why A Dedicated Table

`profiles` is the wrong privacy boundary. Source and hosted catalog both have
`profiles_select_public` with `USING (true)`, and hosted `anon` and
`authenticated` roles have table SELECT privilege. Adding an account
preference there would make it readable through the public profile relation
unless a wider profile projection/grant redesign also shipped. PR527F must not
copy that exposure or widen into a profile-security migration.

`community_thread_watches` is also wrong. It represents one user's state for
one thread. A global preference row there would overload the `(user_id,
thread_id)` contract, change Watch semantics, and complicate cleanup and
fanout.

A dedicated owner table gives one primary-key row, owner RLS, atomic upsert
readback, no public profile exposure, and room to add an independently accepted
column later without introducing a generic category/value abstraction now.

## Current Source Map

The Settings page currently presents these truthful live or linked surfaces:

| Surface | Current truth | PR527F disposition |
| --- | --- | --- |
| AI provider | Live on-page GET/PATCH owner settings | Frozen |
| Social publishing | Link to `/settings/social` | Frozen |
| Billing and plan | Link to `/billing` | Frozen |
| Profile | Disabled `Coming soon` card | Frozen |
| Privacy | Disabled `Coming soon` card | Frozen |
| Export workspace | Link to `/studio/export` | Frozen |
| Notifications | Link to `/notifications` | Retain; it lists in-app rows and manages read state |
| Usage, storage, AI activity | Existing readbacks | Frozen |
| Profile editor | Disabled and unavailable | Frozen |
| Account deletion | Disabled and unavailable | Frozen |

The Notification Preferences panel currently renders five checked, disabled
checkboxes and says none persist. Only `Forum replies` has an accepted product
contract. The other four labels have no corresponding notification type or
creator in the current backend.

All current notification creation call sites were traced:

| Type | Creation path | PR527F disposition |
| --- | --- | --- |
| `thread_comment` | `POST /comments` -> `notifyThreadComment` | Gate eligible recipients by the saved forum-reply preference |
| `report_status` | forum/report moderation status routes -> `notifyReportStatus` | Frozen and never preference-gated |
| `review_request_status` | review request status route -> `notifyReviewRequestStatus` | Frozen and never preference-gated |

`createCommunityNotification` remains the generic insert helper. The new
preference check must not be added there because that would silently affect
moderation notifications.

## Exact Schema Contract

DAEDALUS must add exactly:

```text
infra/supabase/migrations/084_community_notification_preferences.sql
```

The table shape is:

```sql
public.community_notification_preferences (
  owner_user_id uuid primary key
    references public.profiles(id) on delete cascade,
  forum_reply_notifications_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
)
```

Migration `084` must:

1. Run in one transaction under a lane-specific advisory lock.
2. Require `public.profiles` and `public.handle_updated_at()` to exist and
   require the preference table to be absent before creation. It must fail on
   an unexpected partial/pre-existing shape rather than bless it with broad
   `IF NOT EXISTS` statements.
3. Add the existing `handle_updated_at()` trigger to this table.
4. Enable RLS.
5. Add separate owner SELECT, INSERT, and UPDATE policies using
   `auth.uid() = owner_user_id`, with matching UPDATE/INSERT checks.
6. Add no DELETE policy for authenticated users. Profile deletion retains the
   existing FK cascade.
7. Revoke all table privileges from `PUBLIC`, `anon`, and `authenticated`;
   then grant only SELECT, INSERT, and UPDATE to `authenticated` and explicit
   full table access to `service_role` for the API.
8. Add comments stating that a missing row means enabled and the boolean gates
   only future in-app `thread_comment` creation.
9. Request PostgREST schema reload and commit atomically.

No profile row, existing notification, Watch, report, review request, comment,
thread, or preference row is inserted or updated by the migration. Hosted
migration history may receive exactly one honest `084` ledger row only when
the exact migration is applied after local review.

`packages/db/src/types.ts` must mirror all four columns. No shared product type
or generic preference registry is required.

## Default And Concurrency Semantics

The default is defined identically at both read points:

```text
no owner preference row => forum reply notifications enabled
explicit true row       => enabled
explicit false row      => disabled
```

This gives existing and new users enabled behavior without a hosted backfill.
PATCH creates or updates the one owner row. Repeating the same desired boolean
is semantically idempotent: it returns the same boolean and cannot create a
second row because `owner_user_id` is the primary key. An `updated_at` advance
on a repeated upsert is not exposed as a product-state change.

The fanout decision linearizes at its preference read. A comment fanout whose
preference read began before a concurrent PATCH commits may use the prior
state. After PATCH returns authoritative `false`, a subsequently started
fanout must observe disabled state. PR527F does not claim serializable ordering
against a comment already in flight.

## Exact API Contract

Both routes live behind the existing `settingsRouter.use(requireAuth)`:

```text
GET   /settings/notifications
PATCH /settings/notifications
```

GET has no query or body and returns:

```json
{
  "settings": {
    "forumReplyNotificationsEnabled": true
  }
}
```

PATCH accepts exactly this strict body:

```json
{
  "forumReplyNotificationsEnabled": false
}
```

Missing, unknown, nullable, string, numeric, array, or object values return:

```json
{
  "error": "Forum reply notification preference must be true or false.",
  "code": "invalid_forum_reply_notification_preference"
}
```

with HTTP `400`. The request cannot supply an owner id. The authenticated user
id is the only owner key.

GET selects only the authenticated owner's row with `maybeSingle()`. A missing
row returns enabled. Any storage error returns HTTP `500`:

```json
{
  "error": "Could not load notification preferences.",
  "code": "notification_preferences_load_failed"
}
```

PATCH performs one owner-keyed upsert with conflict target `owner_user_id`,
selects `forum_reply_notifications_enabled` from that same statement, and
returns the saved boolean in the GET response shape. Missing/malformed
readback or storage failure returns HTTP `500`:

```json
{
  "error": "Could not save notification preferences.",
  "code": "notification_preferences_save_failed"
}
```

Unauthenticated calls retain the existing bounded `401`. Responses must never
contain a database message, table/column/policy name, owner id, token, session,
stack, request body, or another owner's state. No DELETE route, bulk route, or
category-key route is authorized.

## Exact Generation Gate

Only `notifyThreadComment` may consult the preference table.

After the current thread-author plus unmuted-watcher set is built and the
commenter is removed, the service must perform one bulk preference query for
the remaining recipient ids before inserting any notification. It may select
only `owner_user_id` and `forum_reply_notifications_enabled`.

Recipients with an explicit `false` row are removed. Missing and explicit
`true` rows remain. Duplicate author/watcher membership and self-suppression
retain current behavior.

If the preference query fails, throws, or returns a malformed non-array body,
`notifyThreadComment` must throw before the first notification insert. The
existing comment route catches notification fanout failure, so the valid
comment remains `201` while reply notification creation fails closed. No raw
lookup error is logged or returned to the commenter.

The following are forbidden:

- checking the preference inside `createCommunityNotification`;
- changing `notifyReportStatus` or `notifyReviewRequestStatus`;
- muting, deleting, creating, or rewriting Watch rows;
- deleting or marking existing notifications read;
- suppressing comment creation; and
- adding email, push, realtime, queue, worker, or provider delivery.

## Exact UI Contract

`Notification Preferences` remains one existing Settings panel. It must not
reskin the Settings page or alter other cards/panels. The five checked-disabled
checkboxes are removed.

Visible panel copy is exact:

```text
Notification Preferences
Forum reply notifications are saved to your Station account. Moderation
status updates remain enabled and are not controlled here.

Forum replies
Notify me in Station when someone else replies to a thread I authored or
watch.

These categories are unavailable; Station does not create these
notifications.
Archive completions
Unavailable
Integrity session reminders
Unavailable
Follower notifications
Unavailable
Event reminders
Unavailable
```

The Forum replies row uses one controlled checkbox/switch with accessible
name `Forum reply notifications`. The other four rows are plain unavailable
facts with no checkbox, switch, button, link, checked state, or default-on
implication.

The client states are locked:

| State | Required behavior and visible status |
| --- | --- |
| Initial loading | Show `Loading saved preference...`; control visible but disabled and not presented as checked truth until GET succeeds. |
| Ready enabled | Authoritative checked/on state with status `On`. |
| Ready disabled | Authoritative unchecked/off state with status `Paused`. |
| Saving | Keep the last authoritative checked state, disable the control, and show `Saving...`; do not optimistically toggle. |
| Saved enabled | Apply only returned API state and show `Forum reply notifications enabled.` |
| Saved disabled | Apply only returned API state and show `Forum reply notifications paused.` |
| Reconciliation | On a rejected, interrupted, malformed, or stale PATCH response, keep the prior state disabled, show `Confirming current account setting...`, and issue one GET. |
| Reconciled | Replace the control from GET and show `Current account setting reloaded.` No automatic PATCH retry. |
| Initial load failed | Disable the control with no claimed value and show `Could not load forum reply notifications. Reload Settings to try again.` |
| Save and reconcile failed | Disable the control with no claimed current value and show `Could not confirm forum reply notifications. Reload Settings to try again.` |
| Signed out/expired | Disable the control and show `Sign in again to manage forum reply notifications.` |

The component must keep a monotonically increasing request generation or
equivalent stale-response guard. Results after unmount and results older than
the latest load/reconciliation are ignored. Only one PATCH may be in flight.
A controlled input click/keyboard event must prevent the browser from showing
the desired checked state before authoritative readback.

Refresh always starts with GET. Client storage, cookies, query parameters,
optimistic caches, and the checked value in HTML are not persistence
authorities.

Use the existing fixed-white Settings panel shell and its current compact
visual language for this narrow slice. New text, status, control boundaries,
focus, disabled state, and success/error copy must remain readable in System,
Light, and Dark and at `1440x900` and `390x844`. Do not edit global theme
tokens or restyle the other Settings panels. The panel must retain zero
document overflow and zero card/panel overlap.

## Non-Destruction Guarantees

Toggling the preference affects only whether a later `thread_comment` row is
created for that recipient. It does not:

- delete, hide, mark read, or rewrite any existing notification;
- create, mute, unmute, or delete any thread Watch;
- change whether an author is implicitly eligible for reply fanout;
- change who may comment, author a thread, or read a thread;
- change report/review moderation transitions or their notifications; or
- send or schedule anything outside Station.

Re-enabling affects later eligible comments only. Suppressed historical events
are not backfilled.

## Exact DAEDALUS Allow-List

MIMIR may open one implementation lane with only:

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

File-specific limits:

- `settings.ts` adds only the two notification preference handlers and their
  bounded helpers; AI provider behavior remains byte-for-byte outside required
  import/placement movement.
- `community-notifications.service.ts` changes only the pre-insert recipient
  preference gate inside `notifyThreadComment`.
- `community.test.ts` may add migration-source and fanout regression cases;
  existing forum, Watch, read/unread, report, and review behavior stays intact.
- `api-client.ts` adds only the exact GET/PATCH types and wrappers.
- `notification-preferences.ts` contains exact copy, response validation, and
  pure state/reconciliation helpers; it is not a generic settings framework.
- the new panel component owns only the state machine and presentation above;
  `settings/page.tsx` replaces only its current notification panel contents.
- no `package.json`, lockfile, config, CSS/global-theme, middleware, auth,
  notification-list page, Watch route, comment route, report route, or review
  route change is authorized.

## Required Local Validation

Focused implementation coverage must prove:

- migration `084` exact columns/default/FK/trigger/RLS/policies/grants, no
  profile column, no backfill, and no generic preference key/value table;
- GET/PATCH auth, strict validation, missing-row enabled default, owner-keyed
  upsert/readback, semantic idempotency, cross-owner non-mutation, and bounded
  hostile storage errors;
- author and watcher fanout when missing/true, suppression for false authors
  and false watchers, mixed recipient sets, self-suppression, duplicate
  recipient collapse, and zero notification insert on preference-read failure;
- comment creation still succeeds when fanout fails closed;
- report and review-request notification creation remains unchanged;
- loading, enabled, disabled, saving, saved, reconcile-success,
  reconcile-failure, stale-response, expired-session, and refresh behavior;
- exact copy and absence of controls for all four unavailable categories; and
- no existing notification or Watch mutation from GET/PATCH or generation.

DAEDALUS must run:

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

Rendered validation uses an intercepted local owner session and API. It must
cover loading, enabled, disabled, saving, saved, load failure, save plus
reconciliation success/failure, stale response, System/Light/Dark, desktop,
and `390px`. It must record geometry/overflow, keyboard/focus, checked-state
timing, requests, page errors, and console errors. No real hosted write belongs
in the DAEDALUS implementation lane.

ARGUS preflight baseline:

| Check | Result |
| --- | --- |
| `npx --yes pnpm@10.32.1 test:ai-settings` | Pass, `12/12` |
| `npx --yes pnpm@10.32.1 test:community` | Pass, `51/51` |
| `npx --yes pnpm@10.32.1 test:reports` | Pass, `9/9` |
| API typecheck | Pass |
| Web typecheck | Pass |
| Web lint | Pass, zero warnings/errors |

## Read-Only Hosted Orientation

ARGUS performed no hosted product write, preference write, notification write,
Watch mutation, comment, report, review transition, or migration application.
The database probe ran in a read-only transaction and retained aggregate and
catalog facts only. Browser orientation used the existing replay owner, sent
no Settings command, and retained no token, identity, private value, or
screenshot in the repo.

| Check | Observed truth |
| --- | --- |
| Deployment | Web/API health `200`, ready `true`, branch `main`, exact shared product SHA `c8bceb1df006...` |
| Migration ledger | Exact `040_community_notifications` and `083_forum_visible_reply_count_integrity` rows exist; no `084` row |
| Preference schema | Dedicated table absent; profile preference column absent |
| Profile boundary | Public SELECT policy is `USING (true)` and client roles have SELECT privilege |
| Community schema | Existing notification/Watch RLS policy count `6` |
| Aggregate rows | Profiles `14`, Watches `0`, notifications `0`; no notification-type rows |
| Signed-out candidate API | `GET /settings/notifications` currently reaches auth first and returns `401` |
| Current panel | Five checked, disabled checkboxes; no persisted preference request |
| Render matrix | System-dark, Light, and Dark at `1440x900` and `390x844`; all `6/6` cases loaded |
| Geometry | Document width equalled viewport; notification panel width `400px` desktop and `358px` mobile; overlap count `0` |
| Current palette | System/Dark canvas is dark while Settings panels remain fixed white; the panel is readable but is a legacy fixed-light island that this lane must not expand into a page reskin |
| Diagnostics | Final settled route check had zero failed responses, page errors, and console errors |

This is pre-implementation orientation, not hosted acceptance evidence.

## Reversible Hosted Lifecycle

After ARGUS accepts the implementation commit, MIMIR may authorize a separate
hosted migration/deployment/proof lane. Apply schema before deploying API code;
an API-before-schema window would intentionally fail reply fanout closed.

The hosted lifecycle must use the accepted Station signup boundary to create
one tagged disposable Visitor as the preference owner and notification
recipient. The existing replay owner may act as the eligible commenter. Do
not alter any retained account tier, billing state, profile, Watch, or
notification preference.

Required sequence:

1. Require exact reviewed SHA/readiness, exact migration `084` hash, absence of
   its ledger/table before apply, and unchanged current catalog preconditions.
2. Apply only migration `084` in one transaction, add one honest ledger row,
   request schema reload, and prove exact columns/default/FK/trigger/RLS/
   policies/grants plus zero preference rows.
3. Snapshot aggregate counts by notification type, Watches, threads, comments,
   preferences, profiles, and tagged residue. Require no existing tag match.
4. Prove signed-out GET/PATCH `401` and malformed authenticated PATCH `400`
   with zero row change.
5. Create one in-memory tagged disposable Visitor through ordinary Station
   signup using the accepted bounded password contract. Keep credentials,
   token, and ids in memory only.
6. Prove the new owner has no preference row and GET returns authoritative
   enabled. Insert one tagged readable fixture thread authored by that
   disposable profile under an existing safe public category. Do not change
   the disposable tier.
7. Have the replay owner create one safe tagged comment through the deployed
   comment API. Require `201`, exactly one disposable-recipient
   `thread_comment`, owner-safe notification GET readback, and no Watch,
   report-status, or review-request-status change.
8. PATCH the disposable preference false. Require response false, GET false,
   exactly one owner preference row, and the same false state after a fresh
   Settings browser load/refresh.
9. Repeat PATCH false once. Require false and still exactly one row.
10. Have the replay owner create a second safe tagged comment. Require comment
    `201`, zero notification for that event, the first existing notification
    unchanged, Watch rows unchanged, and report/review notification counts
    unchanged.
11. PATCH true and require authoritative true plus refreshed UI `On`. No
    suppressed historical event may be backfilled.
12. Prove direct authenticated RLS: the disposable token can read only its row;
    the replay owner cannot read or update that row; anon reads zero and cannot
    write. Use aggregate/status evidence only.
13. Cleanup in `finally`: delete exact tagged notification/comment/thread rows,
    then delete the exact disposable Auth user so profile and preference rows
    cascade. If any request is ambiguous, resolve only in-memory ids and the
    exact generated tag; never use a broad delete.
14. Prove zero tagged Auth/profile/preference/thread/comment/notification
    residue, exact restored row baselines, unchanged Watch rows, unchanged
    report/review notification counts, and no external delivery attempt.

The fixture thread is inserted directly because a new Visitor cannot author a
thread through the product entitlement gate. The actual behavior under test is
the normal eligible comment route and its notification fanout. This does not
claim Visitor thread-creation capability.

If disposable signup, safe fixture insertion, cleanup, exact deployment, or
catalog preconditions fail, stop and wake MIMIR with sanitized evidence. Do
not reuse the designated non-owner tester, change a retained tier, forge a
token, bypass auth middleware, or leave a permanent fixture.

## Frozen Scope

PR527F does not change AI provider storage/routing, Gemini/NVIDIA policy,
Profile or Privacy behavior, deletion, social publishing, billing/Stripe,
storage/usage, auth/session policy, comment entitlement, thread visibility,
Watch semantics, notification list/read state, reports/review requests,
moderation, Archive configuration, packages, lockfiles, queues, Redis,
Cloudflare, Railway variables, hosted adapters, email, push, realtime, or any
unsupported category.

## Claim Boundary

ARGUS proved current source paths, current tests, hosted absence/catalog truth,
and current rendered presentation. ARGUS did not apply migration `084`, create
a preference row, create a comment or notification, mutate a Watch, change a
profile, or run the future lifecycle. The implementation and hosted proof must
still pass independent review.

## Handoff

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS accepts one owner-only Forum reply notification preference backed by a dedicated RLS table and authoritative GET/PATCH readback.
- Only future thread_comment fanout is gated; Watches, existing notifications, moderation notifications, read state, and unsupported categories remain unchanged.
Verdict:
- ACCEPT_PR527F_OWNER_ONLY_FORUM_REPLY_NOTIFICATION_PREFERENCE_GATING_FUTURE_THREAD_COMMENT_FANOUT
Task:
- Open DAEDALUS implementation with the exact allow-list and local gates above; keep hosted mutation deferred until independent implementation review.
```
