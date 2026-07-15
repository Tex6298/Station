# PR527C - Forum Watch Hosted Readiness Preflight Result

Owner: ARGUS / A3

Requested by: MIMIR / A1

Date completed: 2026-07-15

Status:

```text
ACCEPT_PR527C_FORUM_WATCH_HOSTED_READINESS_BOUNDARIES
```

## Verdict

ARGUS accepts a two-part PR527C repair. The hosted `500` responses are caused
by the whole of migration `040_community_notifications` being absent from the
configured Supabase target. Independently, the current Forum thread page turns
a failed watch read into a false `Not watching` state with a live `Watch
thread` command.

The exact diagnosis is:

```text
MIGRATION_040_ABSENT_PLUS_WEB_FAILED_READ_FALSE_STATE
```

The smallest honest repair is to apply the existing migration byte-for-byte,
make the watch panel fail closed until a fresh GET returns a valid boolean,
and strengthen focused owner/idempotency tests. The authenticated API route
contract is locally coherent and remains frozen.

This verdict accepts only the implementation and proof boundary. ARGUS did
not apply a migration, mutate a hosted watch, or accept the separate dark
Forum thread presentation defect. PR527D retains that work.

## Sanitized Diagnosis

The read-only hosted probes disclosed no URL, token, cookie, credential,
account identifier, thread identifier, schema payload, or row body.

| Probe | Result |
| --- | --- |
| Hosted identity | Web and API were ready on `main` at exact SHA `a36f55d0ecd4c7c5ecaaaaaf295a77cff9842810`. |
| Project agreement | Local Supabase configuration agreed with the read-only pooler target, and hosted auth agreed with that target. |
| Safe API reproduction | Sign-in, category read, and selected already-readable thread read returned `200`; `GET /threads/:id/watch` returned `500/thread_watch_load_failed` with bounded copy. The probe sent zero writes. |
| Watch table | `community_thread_watches` does not exist. |
| Notification table | `community_notifications` does not exist. |
| Migration ledger | Zero rows match `040_community_notifications`; four later community migration names are present. |
| Migration prerequisites | `profiles`, `threads`, `handle_updated_at()`, UUID generation, and `auth.uid()` are present. |
| Checked-in migration | SHA-256 is `88F6CF617878D1C3DE52B9CDB011F81ECA168D92DBF20C475996BC0B04DC8B9D`. |
| Web-state audit | A failed watch GET leaves nullable state unset, then renders `Watch thread` and `Not watching`; the mutation handler interprets that null as a PUT choice. |

Both tables being absent, a matching ledger count of zero, present
prerequisites, and later community ledger entries distinguish a wholly absent
`040` from a partial watch-table drift. The same bounded API failures do not
justify a service-client or route rewrite.

## Existing Contract Assessment

Migration `040` was reviewed as a whole because applying it also creates the
notification foundation. It is compatible with the current service and route
contract:

- `community_thread_watches` has six expected columns, profile/thread cascade
  foreign keys, owner/thread uniqueness, the thread/mute index, an updated-at
  trigger, RLS, and four own-row policies;
- `community_notifications` has thirteen expected columns, recipient cascade
  and actor set-null foreign keys, exact notification/target type checks,
  recipient/event uniqueness, three query indexes, RLS, and recipient-only
  select/update policies;
- the current notification service writes only accepted types and existing
  columns, suppresses self-notification, and reads unmuted watches;
- all three watch routes require auth, verify thread and parent-subcommunity
  readability, filter by the current user, and return bounded errors;
- PUT and DELETE additionally retain the existing Private-tier guard;
- PUT uses the owner/thread conflict key and DELETE filters by both thread and
  current owner.

There is no evidence for changing `threads.ts`, the notification service, the
shared web helper, or the migration bytes.

## Locked Repair

DAEDALUS must perform all three parts below and no broader repair.

### 1. Apply Exact Migration `040`

Before mutation, DAEDALUS must reconfirm, using sanitized output only:

1. hosted web/API identity and readiness;
2. local-config, pooler-target, and hosted-auth project agreement;
3. both migration tables are absent and the matching ledger count is zero;
4. all migration prerequisites listed above are present;
5. the checked-in file still has the exact accepted SHA-256.

Use an established audited migration runner against the configured target.
The operation must use one transaction and one advisory lock, recheck table
and ledger preconditions inside that transaction, and execute only the exact
checked-in `040_community_notifications.sql` bytes. Abort and roll back on any
drift or failed statement. Do not run a broad pending-migration push.

After the file succeeds, the same transaction may record exactly one honest
migration-ledger row with a fresh UTC fourteen-digit version and exact name:

```text
040_community_notifications
```

That ledger insert is part of the audited migration operation, not a
standalone reconciliation. Do not update, delete, backdate, duplicate, or
fabricate migration history. Request `NOTIFY pgrst, 'reload schema'` before
commit. No watch, notification, thread, comment, or other product row may be
inserted or changed by this operation.

Temporary database tooling may use `pg@8.13.1` outside tracked repo state. It
must not change a package manifest or lockfile and must be removed after use.
No secret or connection value may be printed, logged, committed, or included
in a command transcript.

### 2. Make Watch State Fail Closed

The thread page must use an explicit watch view state equivalent to
`loading | ready | updating | error`, with load and update failures
distinguishable. Only a validated `ready` state may render Watch/Unwatch or a
Watching/Not-watching claim.

Required states and exact copy:

```text
Loading watch state...
```

While a PUT or DELETE is in flight, render a bounded saving state with no
Watch/Unwatch command and no current-state claim.

On initial or retry GET failure:

```text
Watch state unavailable
Station could not confirm whether you are watching this thread. Retry before changing watch state.
Retry watch state
```

On PUT or DELETE failure, timeout, malformed response, or unexpected boolean:

```text
Watch change unconfirmed
Station could not confirm the result of that change. Reload watch state before trying again.
Retry watch state
```

`Retry watch state` performs GET only. A failed read or ambiguous write must
never automatically issue PUT or DELETE. The page must not optimistically
change state, derive a mutation from nullable data, or repeat a write. It must
runtime-validate that GET returns a boolean `isWatching`; mutation success
must also contain the boolean expected for that exact command.

Ready false may show `Watch thread` and `Not watching`. Ready true may show
`Unwatch thread` and `Watching replies`. Successful writes may show `Thread
watched.` or `Thread unwatched.`. All watch errors use the bounded local copy
above; no response body, exception message, SQL detail, table name, or owner
identifier may reach the panel.

Keep the existing signed-out and below-tier messages. Reuse the existing
watch panel and utility control treatment. Do not alter the thread body,
global theme, or fixed-dark Forum presentation in PR527C.

### 3. Strengthen Boundary Tests

Add one isolated API route test that proves:

- GET, PUT, and DELETE all return `404` for an unreadable thread;
- another owner's row does not make the current user's GET return true;
- PUT creates at most one current-owner/thread row and leaves the other owner;
- duplicate PUT remains `200/true` and preserves one logical row per owner;
- DELETE removes only the current owner's row;
- repeated DELETE remains `200/false` and still leaves the other owner's row.

Extend the focused web source test to lock:

- explicit non-nullable ready/error state handling;
- runtime boolean validation;
- no nullable-state PUT/DELETE choice;
- no arbitrary API error echo;
- load and update failures expose only the GET retry command;
- failed and ambiguous states contain no Watching/Not-watching claim and no
  Watch/Unwatch mutation command.

These tests strengthen the contract; they do not authorize route or shared
helper changes.

## Exact Repo Allow-List

DAEDALUS may change only:

```text
apps/web/app/forums/[categorySlug]/[threadId]/page.tsx
apps/api/src/routes/community.test.ts
apps/web/lib/community-notifications.test.ts
docs/roadmap/PR527C_FORUM_WATCH_HOSTED_READINESS_DAEDALUS_RESULT.md
docs/roadmap/ACTIVE_STATUS.md
docs/roadmap/LANE_INDEX.md
docs/testing/VALIDATION_BASELINE.md
.station-agents/state/DAEDALUS.json
```

The migration is the exact hosted execution source, not a repo edit. It must
remain byte-for-byte unchanged at the accepted SHA-256.

Frozen scope includes:

- `apps/api/src/routes/threads.ts`;
- `apps/api/src/services/community-notifications.service.ts`;
- `apps/api/src/routes/notifications.ts`;
- `apps/web/lib/community-notifications.ts`;
- migration `040`, all other migrations, database types, schema, and seeds;
- global CSS, Forum layout/theme/thread-body presentation, and PR527D;
- auth, tier, billing, notification fanout, report/moderation behavior;
- package manifests, lockfiles, dependencies, new endpoints, and client
  persistence;
- Cloudflare, Railway configuration, hosted queues/workers, Redis, provider or
  partner adapters, storage, billing, publication, and unrelated product UI.

## Required Local Proof

DAEDALUS and ARGUS must run:

```text
npx --yes pnpm@10.32.1 exec tsx --test apps/web/lib/community-notifications.test.ts
npx --yes pnpm@10.32.1 test:community
npx --yes pnpm@10.32.1 test:studio-ui
npx --yes pnpm@10.32.1 --filter @station/api typecheck
npx --yes pnpm@10.32.1 --filter @station/web typecheck
npx --yes pnpm@10.32.1 --filter @station/web lint
git diff --check
```

The expected floor after one focused API test and one focused web test is
`49/49` community, `4/4` focused notification/watch, and `263/263` Studio UI,
unless the harness reports an honestly explained different aggregate while
all named cases remain present.

Independent intercepted browser proof at `1440x900`, `390x844`, and
`375x812` must include:

- signed-out and below-tier non-mutation states;
- delayed eligible GET with no mutation command or state claim;
- failed GET, exact unavailable copy, and GET-only Retry to ready false;
- ready true and ready false controls;
- PUT success and DELETE success with validated response/readback states;
- failed or malformed PUT and DELETE becoming unconfirmed with no auto-retry;
- refresh persistence from intercepted server state;
- no clipping, horizontal overflow, page errors, or unclassified console
  errors.

All browser PUT/DELETE calls must be intercepted synthetic requests. Local
proof must create no real watch or database row. It may verify watch-panel fit
but must not claim that the existing near-black thread presentation is fixed.

Review must compare changed paths with the allow-list; confirm migration hash;
and scan for credentials, tokens, cookies, private content, raw identifiers,
debug logs, response-body echo, forbidden side effects, and temporary tooling.

## Post-Apply Hosted Gates

Before ARGUS accepts the implementation, sanitized read-only evidence must
prove:

1. `community_thread_watches` has all six columns, two cascade foreign keys,
   owner/thread uniqueness, thread/mute index, updated-at trigger, RLS, and all
   four exact own-row policies;
2. `community_notifications` has all thirteen columns, recipient cascade and
   actor set-null keys, both exact type checks, recipient/event uniqueness,
   all three indexes, RLS, and exact recipient select/update policies;
3. the migration ledger has exactly one row named
   `040_community_notifications`, while the four later community entries are
   unchanged;
4. PostgREST can resolve both tables after schema reload;
5. current hosted GET watch returns `200` with a bounded boolean and only the
   current-owner row or null;
6. web/API identity remains ready and no product row was changed.

DAEDALUS must not exercise hosted PUT or DELETE. ARGUS may repeat only the safe
GET needed to verify schema/API readiness. Final reversible mutation belongs
to ARIADNE after hostile review and exact accepted-SHA deployment.

## Required Final Hosted Rehearsal

ARIADNE must use one already-readable, non-private thread and capture the
initial current-owner watch boolean before mutation:

1. confirm ready web/API identity at the exact accepted SHA;
2. prove signed-out watch access is `401` and non-mutating;
3. prove a below-tier owner gets `403` for PUT and DELETE without mutation;
4. prove GET, PUT, and DELETE return `404` for an unreadable thread;
5. PUT, then GET and refreshed UI must all show true;
6. duplicate PUT must stay true with exactly one logical current-owner/thread
   row;
7. DELETE, then GET and refreshed UI must all show false;
8. repeated DELETE must remain `200/false` and affect no other owner row;
9. restore the exact initial boolean: PUT and re-read if initially true, or
   leave false and re-read if initially false;
10. prove final current-owner/thread row count matches the initial sanitized
    count (`0` or `1`) and no other row or product domain changed;
11. prove watch controls and all honest states fit at desktop, `390px`, and
    `375px`, without claiming the PR527D theme repair;
12. reconfirm exact SHA/readiness and complete privacy/evidence scans.

No thread, comment, vote, witness, report, moderation, notification, billing,
profile, publication, Space, document, provider, or queue mutation is allowed.
Committed evidence may include sanitized booleans/counts and status codes, but
not identifiers, row bodies, screenshots containing private data, tokens,
cookies, SQL errors, or connection details.

## Preflight Verification

| Check | Result | Notes |
| --- | --- | --- |
| Wake and changed-path review | Pass | Committed wake `d9c770b3` requested this exact preflight; ARGUS consumed it before acting. |
| Hosted identity/project probe | Pass | Exact web/API SHA, readiness, and target agreement were proved without exposing configuration values. |
| Hosted schema/ledger probe | Pass as defect evidence | Both `040` tables are absent, ledger match is zero, later community entries and all prerequisites are present. |
| Safe hosted API read | Pass as defect evidence | Existing readable-thread GET watch still returns bounded `500/thread_watch_load_failed`; zero writes were sent. |
| Current migration/service audit | Pass | The whole existing `040` shape agrees with current notification and watch use; hash is locked. |
| Current route audit | Pass | Auth, readability, tier-write, current-user, idempotent PUT, and scoped DELETE contracts are coherent and frozen. |
| Current web audit | Fail as accepted defect | Failed GET becomes false unwatched UI and a live PUT choice; the implementation must fail closed. |
| Focused web baseline | Pass, `3/3` | Establishes the inherited helper/path/tier baseline, not acceptance of current page state handling. |
| Community baseline | Pass, `48/48` | Establishes the inherited local route baseline, not hosted readiness. |
| Implementation/hosted mutation | None | ARGUS changed roadmap/testing documentation and its watcher receipt only. No migration or watch write occurred. |

## Handoff

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS completed the PR527C Forum Watch hosted-readiness preflight.
Diagnosis:
- Migration 040 is wholly absent on hosted Supabase, and the current web page also turns a failed watch read into a false unwatched state with a live mutation command.
Verdict:
- ACCEPT_PR527C_FORUM_WATCH_HOSTED_READINESS_BOUNDARIES
Task:
- Wake DAEDALUS with the exact migration-apply, web fail-closed, test, and proof allow-list recorded in the ARGUS result.
- Keep the wider PR527 correction programme moving.
```
