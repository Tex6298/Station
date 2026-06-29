# PR475 - Live Events / Seminars Attendance Interest Preflight

Owner: ARGUS / A3

Opened by: MIMIR / A1

Date opened: 2026-06-29

Status: Open - wake ARGUS

## Why This Lane

PR474A is closed. The next move should stay in named Phase 3/customer-facing
feature expansion, not drift into adjacent polish.

PR469 proved the first Live Events / Seminars slice:

- public route: `/events/seminars`;
- API route: `GET /events/seminars`;
- populated hosted public cards with safe `/space/` and `/forums/` actions;
- no attendance, RSVP, tickets, payments, media, realtime rooms, reminders, or
  event-host management.

The useful next question is whether Station can add the smallest honest public
seminar interest capability:

```text
Can a visitor express "I'm interested / keep me posted" for a public seminar
without implying tickets, payment, attendance guarantees, reminders, livestream
rooms, or private owner access?
```

## Preflight Task

ARGUS should hostile-review the current repo and return one of:

```text
ACCEPT_FOR_DAEDALUS
BLOCKED
NEEDS_MIMIR_DECISION
```

If accepted, name the smallest PR475A implementation shape and wake DAEDALUS.

The preferred shape is a bounded interest/readback capability:

- likely signed-in first, unless ARGUS proves anonymous interest can be
  minimized safely;
- no public attendee list;
- aggregate-only public interest count, if any count is shown;
- owner/admin readback only if already safe or narrowly scoped;
- clear copy that interest is not a ticket, booking, reminder, payment, or
  guaranteed attendance.

ARGUS should decide whether PR475A can implement this directly or whether the
smallest unblock is a stable public seminar reference first. Current PR469
cards are derived/readback cards with opaque `seminar_<digest>` ids; durable
interest may need a stable source reference or a minimal event/seminar table
before it can be safe.

## Questions ARGUS Should Answer

1. What is the stable target for interest: derived PR469 card id, source
   document/thread/Space reference, or a new seminar/event record?
2. Is a migration required before interest can be durable and reviewable?
3. Should the first slice be signed-in only?
4. What privacy posture is acceptable: aggregate public count only, private
   owner list, or no visible count?
5. What rollback/delete path is required for a user to withdraw interest?
6. Can existing forum/document discussion affordances satisfy the product need
   without adding interest persistence, or would that be misleading?
7. What exact DAEDALUS files/tests should be touched if accepted?
8. What hosted ARIADNE rehearsal would prove the slice without creating event
   payments, tickets, reminders, livestreams, or attendee-list exposure?

## Guardrails

Do not add or claim:

- tickets, payment, Stripe, billing entitlements, invoices, coupons, Connect,
  marketplace payments, or pricing;
- RSVP/booking guarantees, calendar integration, email/SMS/push reminders, or
  waitlists;
- realtime rooms, livestreaming, WebSockets/SSE room behavior, video, audio,
  recordings, transcripts, or live chat;
- event-host management, admin curation UI, broad moderation console work, or
  public attendee lists;
- provider calls, persona runtime context, memory writeback, continuity
  promotion, archive import, Redis, Cloudflare, queues, workers, hosted runtime
  expansion, or broad Discover/UI redesign.

Do not persist raw visitor IP/header/user-agent/cookie/auth values. If anonymous
interest is considered, require hashed/minimized, short-lived, and non-public
identity handling before any DAEDALUS implementation.

## Inputs

- `docs/roadmap/PR469_LIVE_EVENTS_SEMINARS_CLOSEOUT.md`
- `docs/roadmap/PR469_LIVE_EVENTS_SEMINARS_PREFLIGHT_RESULT.md`
- `docs/roadmap/PR469B_PUBLIC_SEMINAR_POPULATED_BROWSER_REHEARSAL_RESULT.md`
- `apps/api/src/routes/live-events.test.ts`
- `apps/web/lib/live-events-route.test.ts`
- `packages/types/src/live-events.ts`

## Wakeup Templates

If accepted:

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARGUS accepted PR475 Live Events / Seminars Attendance Interest preflight.
Task:
- Implement the exact PR475A slice ARGUS names.
Guardrails:
- Keep it bounded to interest/readback; no tickets, payments, reminders, livestream rooms, attendee lists, provider calls, queues/workers, or broad UI.
```

If blocked or decision-dependent:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS completed PR475 Live Events / Seminars Attendance Interest preflight.
Verdict:
- BLOCKED | NEEDS_MIMIR_DECISION
Task:
- Choose the smallest unblock lane or make the named product decision.
```
