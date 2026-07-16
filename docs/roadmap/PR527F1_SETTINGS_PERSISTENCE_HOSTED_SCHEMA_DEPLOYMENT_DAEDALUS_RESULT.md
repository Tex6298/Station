# PR527F1 - Settings Persistence Hosted Schema And Deployment Result

Owner: DAEDALUS / A2

Date completed: 2026-07-16

Status: Passed - ready for ARIADNE hosted lifecycle

```text
PASS_PR527F1_HOSTED_SCHEMA_084_DEPLOYMENT_ALIGNMENT
```

## Authority

Executed the bounded hosted schema lane from:

- `docs/roadmap/PR527F1_SETTINGS_PERSISTENCE_HOSTED_SCHEMA_DEPLOYMENT_DAEDALUS.md`
- `docs/roadmap/PR527F_SETTINGS_PERSISTENCE_TRUTH_PREFLIGHT_ARGUS_RESULT.md`
- `docs/roadmap/PR527F_SETTINGS_PERSISTENCE_TRUTH_ARGUS_RESULT.md`

Accepted product floor:

```text
e542423bc07a9be77e7ad82f2b5ac6b65af087da
ACCEPT_PR527F_OWNER_ONLY_FORUM_REPLY_PREFERENCE_WITH_ARGUS_SAFETY_PATCH
```

Exact migration:

```text
infra/supabase/migrations/084_community_notification_preferences.sql
SHA-256 BB23AB2222AD5F159000F93931842497CE6830BC10C19E676516D13820671263
```

## Deployment And Source Alignment

Both Railway services were healthy and ready on `main` at the accepted product
floor before and after the schema apply:

| Service | Result |
| --- | --- |
| Web `/health/deployment` | `ok:true`, `ready:true`, branch `main`, SHA `e542423bc07a9be77e7ad82f2b5ac6b65af087da` |
| API `/health/deployment` | `ok:true`, `ready:true`, branch `main`, SHA `e542423bc07a9be77e7ad82f2b5ac6b65af087da` |

Locked product-path drift from the accepted floor through current local HEAD
was empty for migration `084`, DB types, Settings API/tests, notification
fanout, web API client/helpers/tests, Settings panel, and Settings page.

MIMIR's observed API-before-schema inversion is real and now closed: the
accepted code was deployed before `084` existed. Precheck proved zero Watches
and zero notifications during that bounded fail-closed interval.

## Hosted Precheck

Read-only precheck used the hosted pooler and printed no connection string,
token, credential, id, row body, or secret.

| Check | Result |
| --- | --- |
| Migration hash | Exact expected SHA-256 |
| Ledger | No `084_community_notification_preferences` name and no `20260716010501` version |
| Table | `public.community_notification_preferences` absent |
| Preconditions | `public.profiles` present; `public.handle_updated_at()` present |
| Watches | `0` |
| Notifications | `0` |
| PR527F disposable residue | Profiles `0`, threads `0`, comments `0`, notifications `0` |

The residue probe adapted to hosted `profiles` columns (`display_name`,
`username`) and did not read or print private profile values.

## Migration And Ledger

Applied only the exact checked-in migration bytes through the hosted pooler.
The migration's own transaction, advisory lock, preconditions, DDL, grants,
comments, PostgREST schema reload request, and commit completed.

After the schema transaction committed and the preference table existed with
zero rows, inserted one honest ledger row:

| Field | Value |
| --- | --- |
| `version` | `20260716010501` |
| `name` | `084_community_notification_preferences` |
| `created_by` | `DAEDALUS_PR527F1` |
| `idempotency_key` | `pr527f1-084-community-notification-preferences` |

Postcheck found exactly one row matching the `084` name/version.

## Catalog, RLS, Grants, Comments

Postcheck proved:

- columns: `owner_user_id uuid`, `forum_reply_notifications_enabled boolean default true`, `created_at timestamptz default now()`, `updated_at timestamptz default now()`;
- primary key: `owner_user_id`;
- foreign key: `owner_user_id` references `profiles(id)` on delete cascade;
- trigger: `trg_community_notification_preferences_updated_at` before update using `handle_updated_at()`;
- RLS enabled;
- policies: owner INSERT with check, owner SELECT using, owner UPDATE using and with check;
- no DELETE policy;
- authenticated grants: SELECT, INSERT, UPDATE only;
- no anon grant;
- service-role table grants present;
- table comment states missing row means enabled;
- boolean column comment states it gates only future in-app `thread_comment` creation.

Hosted row counts after apply:

| Table | Count |
| --- | --- |
| `community_notification_preferences` | `0` |
| `community_thread_watches` | `0` |
| `community_notifications` | `0` |

PR527F disposable residue remained `0` for profiles, threads, comments, and
notifications.

## API Boundary

Against the deployed API after schema reload:

| Request | Result |
| --- | --- |
| Signed-out `GET /settings/notifications` | `401` |
| Signed-out `PATCH /settings/notifications` | `401` |
| Replay-owner `GET /settings/notifications` | `200`, response shape contains only `settings.forumReplyNotificationsEnabled: true` |

The replay-owner GET proved missing-row enabled truth and created no preference
row. Preference, Watch, and notification counts remained `0`.

## Cleanup

Temporary `pg@8.13.1` tooling and all temporary scripts under the OS temp
directory were removed. No screenshots, traces, videos, credentials, tokens,
connection strings, row bodies, private ids, or raw hosted logs were retained
or committed.

## Claim Boundary

PR527F1 applied and proved schema only. It did not create a preference,
account, profile, thread, comment, notification, Watch, report, review request,
billing row, OAuth/provider row, external delivery, or other hosted product
data.

ARIADNE must still execute the separate PR527F2 disposable hosted lifecycle
before PR527F receives hosted product acceptance.

## Handoff

```text
WAKEUP A4:
Codename: ARIADNE
Summary:
- DAEDALUS applied and proved exact hosted migration 084, its one honest ledger row, deployed source alignment, zero preference rows, and zero unrelated product drift.
Task:
- Execute docs/roadmap/PR527F2_SETTINGS_PERSISTENCE_HOSTED_LIFECYCLE_ARIADNE.md exactly.
- Commit and push the result, then wake MIMIR with WAKEUP A1:. Do not stop without a committed pass/block handoff and cleanup proof.
```
