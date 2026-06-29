# PR475 - Live Events / Seminars Attendance Interest Preflight Result

Owner: ARGUS / A3

Date: 2026-06-29

Verdict: `ACCEPT_FOR_DAEDALUS`

## Decision

ARGUS accepts a narrow second Live Events / Seminars lane:

```text
PR475A - Signed-In Seminar Interest Toggle
```

This is a signed-in, withdrawable interest/readback slice for currently public
seminar cards. It is not RSVP, ticketing, payment, reminder delivery,
calendar integration, livestreaming, attendee management, or event-host
operations.

## Boundary Finding

The public `seminar_<digest>` card id from PR469 is safe as a public client
handle, but it is not sufficient as the durable interest target. The digest is
derived from source type, public href, and feature timestamp, so it can change
if curation, slugs, or readback shape changes.

PR475A must therefore resolve the public card id server-side to an existing
public source reference, then persist interest against that stable internal
source reference:

```text
source_type in document | thread | space
source_id = the resolved public source row id
```

Raw source ids must remain server-side and must not be returned in public JSON,
UI, logs, or roadmap examples.

## Answers To Preflight Questions

1. Stable target: server-resolved public source reference. The public digest is
   only the handle sent back by the client.
2. Migration: required. Add one narrow interest table; do not introduce a full
   event/seminar table yet.
3. First slice auth: signed-in only. Do not add anonymous interest or any
   hashed visitor identity path in PR475A.
4. Privacy posture: aggregate public count only plus current viewer state for
   the signed-in viewer. No public attendee list and no owner/admin identity
   list.
5. Withdrawal: required. A signed-in user must be able to remove their interest
   and disappear from the aggregate count. Prefer hard deletion of the row over
   retaining withdrawn identity history.
6. Existing discussion affordances are not a substitute for "keep me posted";
   using forum comments as interest would overclaim notification intent and add
   user-generated content scope.
7. Exact files/tests are listed below.
8. Hosted rehearsal should prove the public route and signed-in toggle without
   creating payments, tickets, reminders, livestream rooms, attendee lists, or
   event-host tools.

## Accepted PR475A Scope

DAEDALUS may implement:

- a new migration such as
  `infra/supabase/migrations/061_public_seminar_interests.sql`;
- one table, for example `public.public_seminar_interests`, with:
  - `id uuid primary key default gen_random_uuid()`;
  - `user_id uuid not null references public.profiles(id) on delete cascade`;
  - `source_type text not null check (source_type in ('document', 'thread', 'space'))`;
  - `source_id uuid not null`;
  - `created_at` and `updated_at`;
  - `unique (user_id, source_type, source_id)`;
  - an aggregate index on `(source_type, source_id)`;
  - actor-only RLS for direct select/mutation;
  - comments documenting that IPs, user agents, cookies, auth headers, payment
    data, reminder destinations, and attendee-list semantics do not belong in
    the table;
- API support in `apps/api/src/routes/events.ts`:
  - keep `GET /events/seminars` public, with optional auth only to compute the
    current viewer's interest state;
  - return aggregate `interestCount` and signed-in viewer state without raw
    source ids or attendee identities;
  - add signed-in-only `POST /events/seminars/:seminarId/interest`;
  - add signed-in-only `DELETE /events/seminars/:seminarId/interest`;
  - resolve `:seminarId` by reusing the PR469 public seminar resolver and
    failing closed if the card is no longer current, public, and routeable;
  - upsert idempotently on mark-interest and hard-delete/idempotently withdraw
    on delete;
  - return bounded errors only;
- type updates in `packages/types/src/live-events.ts`;
- web updates in `apps/web/app/events/seminars/page.tsx` and, if useful,
  `apps/web/lib/live-events-route.ts`:
  - show aggregate count only;
  - show current viewer's interested state only to that viewer;
  - show a signed-in toggle and a signed-out sign-in prompt;
  - include clear safety copy that interest is not a ticket, booking, reminder,
    payment, waitlist, or attendance guarantee;
  - no attendee names, emails, avatars, owner-only controls, admin panels, or
    event-host management UI;
- focused tests in:
  - `apps/api/src/routes/live-events.test.ts`;
  - `apps/web/lib/live-events-route.test.ts`;
  - `packages/types` build/typecheck through the normal typecheck command.

## Required Tests

DAEDALUS should prove:

- signed-out `GET /events/seminars` remains public and returns public aggregate
  counts only;
- signed-in `GET /events/seminars` returns the viewer's own interested state
  without exposing any other user identity;
- `POST /events/seminars/:seminarId/interest` requires auth, resolves the
  public digest to a currently public routeable source, and is idempotent;
- `DELETE /events/seminars/:seminarId/interest` requires auth and removes the
  viewer from the count;
- private, hidden, community-only, unsafe-slug, removed, missing, or stale
  seminar/card targets fail closed with bounded copy;
- no response, UI, log, or docs output exposes raw source ids, user ids, emails,
  cookies, auth headers, IPs, user agents, payment identifiers, stack traces,
  table names, SQL, provider payloads, secrets, or attendee lists;
- page copy does not imply tickets, bookings, waitlists, reminders, calendar
  integration, livestreams, media rooms, attendance guarantees, payment,
  Stripe, provider calls, or owner-private access except in explicit negative
  safety copy.

## Required Validation

DAEDALUS should run:

```bash
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/live-events.test.ts
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/live-events-route.test.ts
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
git diff --cached --check
```

Also run a diff-only sensitive-pattern scan covering Stripe/payment ids,
secrets, auth tokens, cookies, IP/user-agent/header storage, raw source ids,
SQL/table output, and visitor identity fields.

## Hosted Rehearsal Requirement

After DAEDALUS implements PR475A and ARGUS accepts it, MIMIR should route
ARIADNE for hosted proof of:

- signed-out `/events/seminars` desktop and 390px mobile;
- signed-in `/events/seminars` desktop and 390px mobile;
- interest mark and withdrawal for one public card;
- aggregate count changes without attendee identity exposure;
- no tickets, payments, Stripe, reminders, calendar integration, livestreams,
  media rooms, attendee lists, event-host management, provider calls, queues,
  workers, Redis, Cloudflare, or broad UI.

## Non-Goals

PR475A must not add or claim:

- tickets, payments, Stripe, billing entitlements, invoices, coupons, Connect,
  marketplace payments, pricing, or subscriptions;
- RSVP, booking guarantees, waitlists, calendar integration, email/SMS/push
  reminders, or guaranteed attendance;
- realtime rooms, livestreaming, WebSockets/SSE room behavior, video, audio,
  recordings, transcripts, or live chat;
- public attendee lists, owner/admin attendee identity lists, event-host
  management, admin curation UI, broad moderation console work, or public
  identity analytics;
- anonymous interest persistence, hashed visitor identity, IP/header/user-agent
  capture, cookies, device metadata, location metadata, or raw auth values;
- provider calls, persona runtime context, memory writeback, continuity
  promotion, archive import, Redis, Cloudflare, queues, workers, hosted runtime
  expansion, or broad Discover/UI redesign.

## ARGUS Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| Repo evidence inspection | Pass | PR469 closeout/preflight/rehearsal docs, events API route, web route helpers, shared types, auth middleware, and community witness/counter persistence patterns inspected. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/live-events.test.ts` | Pass | 2 tests passed for public routeability and bounded errors. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/live-events-route.test.ts` | Pass | 2 tests passed for readback-only copy and safe route helpers. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API typecheck replayed from cache; web typecheck ran successfully. |
| `git diff --check` | Pass | No whitespace errors. |
| `git diff --cached --check` | Pass | No staged whitespace errors. |
| Diff-only sensitive-pattern scan | Pass | No payment ids, secrets, auth tokens, cookies, IP/user-agent/header storage, raw source ids, SQL/table output, or visitor identity values. |
| Diff-only scope scan | Pass | Expected guardrail and negative-scope wording only. |

## Handoff

Wake DAEDALUS:

```text
WAKEUP A2:
Codename: DAEDALUS
```

Task: implement `PR475A - Signed-In Seminar Interest Toggle` exactly as scoped
above. If the current PR469 resolver cannot safely map a public digest back to
a server-only source reference, stop and wake MIMIR with that concrete blocker
instead of persisting interest against the digest alone.
