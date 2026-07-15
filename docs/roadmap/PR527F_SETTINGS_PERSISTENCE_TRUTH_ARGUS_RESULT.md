# PR527F - Settings Persistence Truth ARGUS Result

Owner: ARGUS / A3

Date completed: 2026-07-16

Status: Accepted locally with narrow ARGUS safety patch

```text
ACCEPT_PR527F_OWNER_ONLY_FORUM_REPLY_PREFERENCE_WITH_ARGUS_SAFETY_PATCH
```

## Verdict

ARGUS accepts the local PR527F implementation after correcting three material
defects inside the locked allow-list. The resulting slice persists exactly one
owner-only Forum reply notification preference, gates only future
`thread_comment` fanout, and presents one authoritative non-optimistic Settings
control. It does not establish hosted acceptance: migration `084` has not been
applied and the hosted lifecycle remains MIMIR's next routing decision.

Reviewed implementation commit:
`71ef60b655c4fbabc841de0db9db14323cd9ca6c`.

## Findings And ARGUS Corrections

### 1. Migration `084` did not parse

The submitted PL/pgSQL precondition block ended with `end` rather than `end;`.
The source-regex test passed despite the executable migration being invalid.
ARGUS added the terminator, strengthened the migration source assertion, and
executed the exact migration in a disposable PostgreSQL/PGlite engine.

### 2. Keyboard activation did not persist

The submitted checkbox prevented default Space/Enter behavior but never called
the save path. Its mouse-down handler also prevented normal pointer focus. A
direct pre-patch browser probe recorded zero PATCH requests for both Space and
Enter, so the submitted `21/21` matrix did not prove keyboard activation.

ARGUS removed the mouse-down suppression and routes non-repeating Space/Enter
through the same authoritative save path as pointer activation. Independent
rendered proof now records exactly one PATCH for pointer, Space, and Enter.

### 3. Malformed persisted rows were not fully fail-closed

GET could serialize a non-boolean stored value instead of returning a bounded
load failure. Fanout filtered only strict `false`, so malformed returned rows
could be treated like enabled or missing preferences. ARGUS now validates the
shape and boolean type of every non-null GET row and every fanout preference
row, including membership in the requested recipient set. Malformed data
causes bounded GET failure or zero reply fanout while the valid comment remains
`201`.

These were review defects, not new roadmap scope. The patches touch only the
accepted migration, API, fanout, UI control, and focused tests.

## Contract Review

The accepted implementation now matches the preflight boundary:

- `public.community_notification_preferences` is a dedicated four-column
  owner table; `profiles` and per-thread Watches are not reused as global
  preference storage.
- Missing owner rows mean enabled and no backfill is introduced.
- GET/PATCH `/settings/notifications` derive ownership only from the
  authenticated user, accept only the strict boolean field, and return bounded
  errors without database detail.
- RLS exposes owner SELECT/INSERT/UPDATE only. There is no DELETE policy or
  authenticated DELETE grant.
- Only `notifyThreadComment` performs the one bulk preference read before any
  notification insert. Explicit false suppresses future reply recipients;
  malformed data or lookup failure suppresses all reply fanout.
- Report/review notifications, generic notification creation, Watches,
  existing rows/read state, comments, and external delivery are unchanged.
- Settings exposes one live Forum replies control. Archive completions,
  Integrity session reminders, Follower notifications, and Event reminders
  are plain unavailable facts with no fake controls or default-on claim.
- No secret value, credential material, raw database error, owner identifier,
  or preference row was added to logs, UI copy, roadmap evidence, or committed
  fixtures.

No Cloudflare work, hosted runtime change, queue, partner adapter, billing,
generic preference framework, package/config change, or unrelated UI expansion
entered the lane.

## Independent Validation

| Command / proof | Result |
| --- | --- |
| `npx --yes pnpm@10.32.1 test:ai-settings` | Pass, `14/14` |
| `npx --yes pnpm@10.32.1 test:community` | Pass, `54/54` |
| `npx --yes pnpm@10.32.1 test:reports` | Pass, `9/9` |
| `npx --yes pnpm@10.32.1 exec tsx --test apps/web/lib/notification-preferences.test.ts` | Pass, `5/5` |
| `npx --yes pnpm@10.32.1 --filter @station/db build` | Pass |
| API and web typecheck | Pass |
| Web lint | Pass, zero warnings/errors |
| `git diff --check` | Pass; line-ending warnings only |

The disposable PostgreSQL/PGlite migration run proved:

- exact migration execution, zero initial preference rows, four columns, RLS,
  three owner policies, one updated-at trigger, and no DELETE policy;
- authenticated grants limited to SELECT/INSERT/UPDATE, no anonymous grant,
  and full service-role table grants;
- default true and owner update to false;
- cross-owner INSERT blocked and cross-owner UPDATE changed zero rows;
- owner DELETE and anonymous SELECT blocked; and
- replay blocked by the migration precondition.

Independent intercepted rendering passed `21/21` cases across System, Light,
and Dark at `1440x900` and `390x844`. It covered enabled/disabled truth,
loading, load failure, malformed initial readback, signed-out/expired sessions,
pointer/Space/Enter saves, malformed and mismatched PATCH reconciliation,
failed save/reconciliation, and stale GET after unmount.

All rendered cases had zero page errors, unclassified console errors,
horizontal overflow, section overlap, unavailable-category controls, and
hosted reachability. Saving retained the old authoritative checked state,
disabled the control, rendered `Saving...`, and sent exactly one strict PATCH.
Every reconciliation case sent exactly GET/PATCH/GET. Temporary scripts,
screenshots, package sandbox, and local server were removed or stopped.

## Hosted Boundary

A post-review read-only hosted transaction confirmed:

```text
preference_table_present=false
ledger_084=0
watches=0
notifications=0
```

The transaction was rolled back. No hosted migration, ledger, preference,
comment, Watch, notification, profile, report, review, or Settings product
write occurred. No secret or row content was printed.

MIMIR may now route the exact migration/deployment/proof lifecycle locked by
the preflight. This result does not authorize a broader schema or product-data
change and must not be represented as hosted acceptance.

## Handoff

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS accepts PR527F locally after narrow migration, keyboard, and malformed-readback safety corrections.
Task:
- Route the exact hosted migration/deployment/proof lifecycle from the accepted preflight.
- Keep hosted acceptance, broader Settings capability, and unrelated runtime/product scope unclaimed until separately proven.
```
