# PR527C2 - Forum Watch Fixture Auth Unblock Preflight ARGUS Result

Owner: ARGUS / A3

Requested by: MIMIR / A1

Date completed: 2026-07-15

Status:

```text
ACCEPT_PR527C2_DISPOSABLE_AUTH_CREATE_REPAIR_BCRYPT_72_BYTE_INPUT_GUARD
```

## Verdict

ARGUS accepts Option A: repair the disposable auth-create input and the same
real Station signup boundary, then rerun PR527C1 with a disposable Visitor.

The PR527C1 failures now have an exact evidenced cause. Both Supabase Auth
admin-create requests carried passwords beyond bcrypt's 72-byte input limit.
Supabase Auth panicked and returned `500`; changing only the email and username
could not repair that input.

No profile trigger, constraint, grant, migration, or tier mutation is needed.
The accepted implementation is one authoritative UTF-8 byte-length guard at
Station's signup request schema, focused tests, and a bounded in-memory
password in the disposable proof harness.

## Read-Only Root-Cause Proof

ARGUS performed no hosted mutation. Postgres ran inside a read-only
transaction; Supabase project configuration and logs were queried with GET
only. Raw logs, identities, ids, request ids, addresses, row bodies, URLs,
credentials, tokens, and connection values were not emitted.

| Check | Sanitized result |
| --- | --- |
| Review input | Repo commit `cc7042f347af6137893ff5282bc3cbb0864edb0e` |
| Auth edge requests | Exactly two `POST /auth/v1/admin/users` requests at the DAEDALUS attempt times; both returned `500` |
| Matching Auth events | Exactly two `request panicked` events; both report `bcrypt: password length exceeds 72 bytes` |
| Matching Postgres errors | `0` in the exact create windows |
| Public Auth settings | GET `200`; signup enabled; email provider enabled |
| Management Auth config | GET `200`; signup enabled |
| New-user trigger | Enabled `AFTER INSERT` trigger calls `public.handle_new_user()` |
| Trigger function | Security definer; function owner can insert profiles; supplied fields cover the only required no-default profile columns, `id` and `username` |
| Profile insert chain | Storage and current-token limit triggers present and enabled; all auth users have profiles; all profiles have storage rows |
| Global baseline | Profiles `14`; threads `12`; comments `7`; watches `0`; notifications `0` |
| Tagged residue | Auth users `0`; profiles `0`; threads `0` |
| Hosted writes by ARGUS | `0` |

Nine existing profiles do not currently have a current-period token-usage row.
That pre-existing observation is outside the two create windows, is not the
cause of either Auth panic, and is frozen from this lane. The new-profile token
trigger itself is present and enabled.

## Real Signup Boundary

Station's `signUpSchema` currently requires only a minimum of eight characters.
It has no byte-length ceiling, so the deployed `/auth/signup` path can forward
the same oversized password to `auth.admin.createUser`. The controller catches
the resulting failure, but that does not make the upstream panic acceptable.

The repair must count UTF-8 bytes, not JavaScript characters. A 72-character
ASCII password is 72 bytes, while a shorter multibyte password can exceed the
same limit. The server request schema is the authoritative boundary.

## Rejected Alternative

ARGUS rejects Option B, the designated-account tier change.

The account is non-admin and Stripe-inactive, but it is not exclusive or
empty. Independent database reads found `256` session rows with `256`
unrevoked refresh tokens; `41` session rows were created or updated in the
previous hour. The ignored credentials are also available to concurrent repo
rehearsals. Station reads profile tier live, so another valid session could
observe or act under the temporary Visitor tier. A profile row lock cannot
fence those clients across the required API calls.

The account also retains a persona, reports, storage usage, token-usage
periods, and a token transaction. A tier change would update its profile,
storage limit, current token limit, and three `updated_at` values even if the
semantic limits were restored. That is unnecessary risk now that the exact
disposable-create input defect is known.

No designated account session, profile, tier, quota, product row, or timestamp
may change in the accepted lane.

## Exact DAEDALUS Allow-List

MIMIR may authorize DAEDALUS to change only:

```text
apps/api/src/schemas/auth.schema.ts
apps/api/src/routes/auth.test.ts
docs/roadmap/PR527C2_FORUM_WATCH_FIXTURE_AUTH_UNBLOCK_DAEDALUS_RESULT.md
docs/roadmap/ACTIVE_STATUS.md
docs/roadmap/LANE_INDEX.md
docs/testing/VALIDATION_BASELINE.md
.station-agents/state/DAEDALUS.json
```

No web file, auth service, middleware, database migration, schema, trigger,
RLS policy, package, lockfile, seed, permanent fixture, Supabase setting, or
designated-account change is authorized. PR527D remains separate.

## Required Product Patch

1. Keep the existing eight-character minimum.
2. Reject signup passwords whose UTF-8 encoding exceeds `72` bytes before
   `auth.admin.createUser` is called.
3. Return the existing validation `400` shape with bounded copy that neither
   echoes the password nor exposes bcrypt, Supabase, a stack, or service detail.
4. Prove a 72-byte ASCII password reaches the fake create boundary.
5. Prove a 73-byte ASCII password is rejected before create.
6. Prove a password with at most 72 JavaScript characters but more than 72
   UTF-8 bytes is also rejected before create.
7. Preserve existing signup confirmation, session, profile-tier, and stable
   controller-failure behavior.

This patch fixes Station's real signup boundary. It does not claim to patch the
managed Supabase Auth binary itself.

## Required Hosted Proof

After local review and exact API deployment:

1. Require API readiness on the exact implementation SHA and retain the
   accepted unchanged web/Watch evidence.
2. Require zero `pr527c-boundary-` auth/profile/thread residue and snapshot
   global profile/thread/comment/watch/notification counts.
3. Generate the disposable email, username, and password in memory. The
   password must be ASCII, at least eight bytes, at most 72 bytes, and checked
   immediately before every create or signup call.
4. Send one oversized-password Station signup probe and require validation
   `400`, no Auth admin-create request, and zero tagged residue.
5. Call deployed Station `/auth/signup` once with the valid bounded password.
   Require `201`, fresh `/auth/me` Visitor truth, authoritative profile
   `tier = visitor`, and `is_admin = false`.
6. Complete the original readable-thread Watch PUT/DELETE `403` proof with no
   watch or notification change.
7. Create at most one synthetic removed thread under the disposable profile,
   only after the `403` proof. Require replay-owner Watch GET/PUT/DELETE `404`
   and no watch or notification change.
8. Cleanup in `finally`: delete the synthetic thread by its in-memory id, then
   delete the disposable Auth user by its in-memory id. If signup is ambiguous,
   resolve only the exact generated email and never use a broad delete.
9. Prove zero auth/profile/thread/storage/token/session/watch/notification
   residue for the disposable identity, all tagged prefixes zero, selected
   real rows still present, and all global baselines restored.

Credentials, ids, tokens, cookies, request ids, raw Auth logs, connection
values, and row bodies must never be printed or persisted. No blind retry is
authorized. The temporary harness and dependencies must be removed before
commit.

## Preflight Validation

| Check | ARGUS result |
| --- | --- |
| Independent Postgres read-only catalog/account/baseline probe | Pass |
| Supabase Auth config plus edge/Auth/Postgres log correlation | Pass, GET only |
| `npx --yes pnpm@10.32.1 test:auth` | Pass, `22/22` |
| `npx --yes pnpm@10.32.1 test:community` | Pass, `49/49` |
| `npx --yes pnpm@10.32.1 --filter @station/api typecheck` | Pass |
| Temporary harness and dependency cleanup | Pass |

## Validation Gate

DAEDALUS must run:

```text
npx --yes pnpm@10.32.1 test:auth
npx --yes pnpm@10.32.1 test:community
npx --yes pnpm@10.32.1 --filter @station/api typecheck
git diff --check
```

ARGUS will independently review the byte boundary, create-call suppression,
hosted Station signup, original `403/404` contract, cleanup, and exact scope.
Retained ARIADNE browser evidence need not be repeated because no web or Watch
product code is authorized.

## Signup-Lane Disposition

The hosted Station signup warning is included in this accepted implementation,
not deferred to a separate lane. It remains open until the authoritative guard
is deployed and both the oversized rejection and valid disposable Station
signup are proven. After those pass, the managed service's direct-admin panic
on invalid oversized input is an external behavior Station and temporary tools
must guard against, not a reason to mutate database/auth infrastructure.

## Handoff

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS traced both PR527C1 500s to exact Supabase Auth panics on passwords exceeding bcrypt's 72-byte input limit; the profile trigger chain was not implicated.
- The designated-account tier path is rejected because hundreds of refreshable sessions, including 41 recent session rows, prevent an exclusive safe mutation window.
Verdict:
- ACCEPT_PR527C2_DISPOSABLE_AUTH_CREATE_REPAIR_BCRYPT_72_BYTE_INPUT_GUARD
Task:
- Wake DAEDALUS with the exact API schema/test allow-list and hosted Station-signup plus original PR527C1 cleanup gates.
```
