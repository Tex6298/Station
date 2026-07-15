# PR527C - Forum Watch Hosted Readiness Repair ARGUS Result

Owner: ARGUS / A3

Requested by: MIMIR / A1

Implementation reviewed: `f17fcd1b6bd070fea690c3b506e1a657ab623ccc`

Date completed: 2026-07-15

Status:

```text
ACCEPT_PR527C_FORUM_WATCH_HOSTED_READINESS_REPAIR_WITH_ARGUS_PATCH
```

## Verdict

ARGUS accepts PR527C locally and accepts the hosted migration post-state. The
whole existing migration `040_community_notifications.sql` is now present on
the configured Supabase target with its exact watch and notification schema,
RLS, policies, constraints, indexes, trigger, PostgREST visibility, and one
honest ledger row. Independent GET-only proof found zero watch rows, zero
notification rows, and bounded current-owner watch readback.

The web repair correctly fails closed for unknown reads and ambiguous writes.
ARGUS made one narrow sequencing patch: the initial watch GET no longer holds
the entire thread page behind its generic loader. Eligible owners now see the
required `Loading watch state...` state while that GET is pending, with no
mutation command or watch claim.

This is not final hosted journey acceptance. The ARGUS patch creates a new
review SHA that must deploy before ARIADNE performs the reversible Watch,
refresh, duplicate Watch, Unwatch, repeat Unwatch, and exact initial-state
restoration rehearsal. The separate near-black Forum thread presentation
defect remains PR527D.

## Review Finding And Patch

### Initial watch loading state was unreachable

DAEDALUS introduced an explicit `idle | loading | ready | updating | error`
watch state, but the page awaited `loadWatchState()` before clearing its
page-wide `loading` flag. On a delayed initial watch GET, the browser therefore
showed only generic `Loading...`; the promised `Loading watch state...` panel
was reachable on Retry but not on first load.

ARGUS changed only that call from awaited to deliberately detached:

```text
void loadWatchState(data.thread.id, sess.access_token)
```

`loadWatchState()` owns and catches its failures, so this introduces no
unhandled rejection. The page can render the already-loaded readable thread,
but the watch panel remains non-actionable until a valid boolean response moves
it to `ready`. The focused source test now rejects a regression back to the
awaited call.

No route, API client, auth, tier, database, migration, notification, or shared
helper behavior changed in the review patch.

## Hosted Migration Review

ARGUS used a fresh read-only database transaction and GET-only HTTP probes.
The probe emitted only booleans, counts, HTTP statuses, service labels, and a
commit prefix. It did not emit URLs, credentials, tokens, cookies, ids, row
bodies, schema payloads, SQL definitions, or private content.

| Check | Independent ARGUS result |
| --- | --- |
| Hosted identity | Web and API returned `200/ready:true`, service `@station/web` and `@station/api`, branch `main`, exact shared SHA prefix `f17fcd1b6bd0`. |
| Project agreement | Pooler and hosted Supabase project checks agreed. |
| Checked-in migration | SHA-256 remains `88F6CF617878D1C3DE52B9CDB011F81ECA168D92DBF20C475996BC0B04DC8B9D`; no migration file changed. |
| Tables and columns | Both tables exist with exact `6` watch and `13` notification columns, accepted types, nullability, and defaults. |
| Watch constraints | Exact primary key, two cascade foreign keys, and owner/thread unique constraint; `4` constraints total. |
| Notification constraints | Exact primary key, recipient cascade and actor set-null foreign keys, two exact type checks, and recipient/event unique constraint; `6` constraints total. |
| Indexes and trigger | All four named query indexes and the one watch updated-at trigger/function are exact and enabled. |
| RLS and policies | RLS is enabled on both tables; all four watch own-row expressions and both notification recipient-only expressions are exact. |
| Migration ledger | Exactly one `040_community_notifications` row at version `20260715095133`; the four later community rows remain one each. |
| PostgREST | Both tables resolve with HTTP `200` through the schema cache. |
| Hosted watch API | Replay-owner sign-in `200`, selected readable thread GET `200`, signed-out watch GET `401`, owner watch GET `200`, boolean value `false`, watch row `null`. |
| Product rows | Watch count `0 -> 0`; notification count `0 -> 0` across the ARGUS probe. |
| Hosted mutations | ARGUS sent no watch PUT/DELETE and no product write. |

The independent false/null readback disambiguates DAEDALUS's shape-check
booleans: there was no pre-existing hosted watch row. The exact empty product
tables also support the claim that applying this DDL and ledger operation did
not create a watch or notification.

DAEDALUS records that the operation used one transaction, an advisory lock,
an inside-transaction precondition recheck, exact checked-in migration bytes,
one ledger insert, and PostgREST reload. ARGUS can independently prove the
durable post-state and lack of product rows; it does not claim to reconstruct
each transient SQL statement after the fact.

## Product Safety Review

The accepted web state contract is now:

- `idle` and `loading` show only `Loading watch state...`;
- `updating` shows only `Saving watch state...`;
- only `ready` can show Watch/Unwatch or Watching/Not-watching;
- load failure or malformed GET shows bounded unavailable copy and GET-only
  Retry;
- failed, timed-out, malformed, or outcome-inconsistent PUT/DELETE shows
  `Watch change unconfirmed` and GET-only Retry;
- mutation success requires a runtime boolean matching the requested action;
- no watch write is optimistic or automatically replayed;
- no API exception, response body, SQL detail, table name, or owner id is
  rendered.

The accepted API authority remains unchanged:

- every watch route requires authentication;
- every route validates thread and parent-subcommunity readability;
- PUT and DELETE retain the Private-tier guard;
- GET and DELETE filter by both thread and current owner;
- PUT uses the owner/thread conflict key;
- route errors remain stable and bounded;
- server-client filtering remains authoritative even with RLS present.

The new API test proves all three hidden-thread `404` results, cross-owner GET
isolation, one logical row per owner after duplicate PUT, current-owner-only
DELETE, and idempotent repeated DELETE. No route implementation change was
needed.

## Scope Review

DAEDALUS changed exactly the accepted seven tracked paths:

```text
apps/web/app/forums/[categorySlug]/[threadId]/page.tsx
apps/api/src/routes/community.test.ts
apps/web/lib/community-notifications.test.ts
docs/roadmap/PR527C_FORUM_WATCH_HOSTED_READINESS_DAEDALUS_RESULT.md
docs/roadmap/ACTIVE_STATUS.md
docs/roadmap/LANE_INDEX.md
docs/testing/VALIDATION_BASELINE.md
```

ARGUS adds only the two-file loading-state patch above, this review result,
roadmap/testing truth updates, and watcher receipts.

Confirmed unchanged:

- migration `040` and every other migration;
- `apps/api/src/routes/threads.ts`;
- notification routes and service;
- the shared community notification helper;
- global CSS and Forum thread/body/theme presentation;
- auth, tier, billing, packages, lockfile, schema types, seeds, and API client;
- Cloudflare, Railway configuration, queues/workers, Redis, storage, provider
  and partner adapters, publication, Spaces, and unrelated UI.

PR527D remains the owner of the dark Forum thread readability defect. PR527C
must not be used to claim that presentation is repaired.

## Validation

| Command / check | ARGUS result |
| --- | --- |
| Focused notification/watch test | Pass, `4/4` |
| `npx --yes pnpm@10.32.1 test:community` | Pass, `49/49` |
| `npx --yes pnpm@10.32.1 test:studio-ui` | Pass, `263/263` |
| API typecheck | Pass |
| Web typecheck | Pass |
| Web lint | Pass, no warning or error |
| Independent hosted schema/ledger/API probe | Pass |
| Independent intercepted Playwright proof | Pass, `12/12` groups |
| Changed-path, frozen-path, migration-hash, secret, and whitespace checks | Pass |

The independent browser proof covered:

- signed-out and below-tier states with no watch request or command;
- delayed initial GET with visible watch-specific loading and no claim/command;
- `500` and malformed GET failure, bounded copy, and GET-only recovery;
- ready false and ready true controls;
- delayed PUT saving state, success, and refresh persistence;
- successful DELETE and false readback;
- PUT and DELETE `500` failures with no automatic replay;
- PUT and DELETE that changed synthetic server state but returned malformed
  responses, followed by GET reconciliation to the true result;
- unexpected successful mutation booleans becoming unconfirmed;
- `1440x900`, `390x844`, and `375x812` fit with no horizontal overflow, page
  errors, or unclassified console errors.

All browser API calls targeted an intercepted synthetic origin. The proof made
no real watch or database write. ARGUS inspected the narrow unavailable and
reconciled screenshots, then removed all temporary scripts, packages, and
images.

## Required ARIADNE Rehearsal

MIMIR should open the final PR527C hosted rehearsal only after web and API are
ready at the exact accepted ARGUS review SHA. ARIADNE must then:

1. capture the replay owner's initial watch boolean and sanitized row count for
   one already-readable non-private thread;
2. prove signed-out `401`, below-tier write `403`, and unreadable-thread GET,
   PUT, and DELETE `404` without mutation;
3. PUT, GET true, refresh the UI to true, duplicate PUT, and prove exactly one
   logical current-owner/thread row;
4. DELETE, GET false, refresh the UI to false, repeat DELETE, and prove
   `200/false` with no cross-owner effect;
5. restore the exact initial boolean and prove the final sanitized row count is
   the same `0` or `1` as the initial count;
6. verify loading, ready, and bounded failure/reconciliation presentation at
   desktop, `390px`, and `375px` without claiming PR527D;
7. reconfirm schema/ledger presence, exact web/API SHA and readiness, no page
   error, no unclassified console error, and zero unrelated product mutation.

No notification, thread, comment, vote, witness, report, moderation, billing,
profile, publication, Space, document, provider, queue, or other product write
is allowed. Evidence remains sanitized and must contain no ids, row bodies,
tokens, cookies, credentials, private screenshots, or connection details.

## Claims Not Made

- The new ARGUS review SHA has not yet passed hosted UI rehearsal.
- No hosted watch mutation or restoration was performed during ARGUS review.
- PR527C is not customer-journey closed until ARIADNE passes the exact-SHA
  reversible rehearsal and MIMIR closes it.
- PR527D's dark Forum thread readability defect is not fixed.
- No broader Forum, notification, moderation, billing, infrastructure, or
  product-completeness claim is made.

## Handoff

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS accepted the PR527C Forum Watch hosted-readiness repair with one narrow initial-loading sequencing patch.
- Exact hosted migration 040 schema, RLS/policies, ledger row, PostgREST visibility, zero product rows, and GET-only watch readback passed independent review.
Verdict:
- ACCEPT_PR527C_FORUM_WATCH_HOSTED_READINESS_REPAIR_WITH_ARGUS_PATCH
Task:
- Close the local repair and wake ARIADNE for the exact accepted-SHA reversible hosted Watch/refresh/duplicate/Unwatch/restoration rehearsal.
- Keep PR527D's dark Forum presentation defect separate and keep the wider PR527 correction programme moving.
```
