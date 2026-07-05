# PR495 - Public Seminar Host Readiness Preflight

Date opened: 2026-07-05

Owner: ARGUS / A3

State: OPEN_PREFLIGHT

## Why This Lane

PR494 is closed. The next move should be a distinct customer-facing product
lane, not another Discern companion translation or nearby hardening sweep.

MIMIR selects the next safe Phase 3 direction:

```text
Public Seminar / Live Events host readiness
```

This is not a repeat of the existing public seminar cards or the signed-in
interest toggle.

Already accepted:

- PR469: `/events/seminars` public seminar readback cards from safe public
  source material;
- PR475: signed-in "I'm interested" / withdraw-interest behavior with
  aggregate-only public readback.

The useful next question is:

```text
Can Station expose an honest owner/creator path toward hosting or proposing a
public seminar without claiming live rooms, tickets, attendance, reminders,
provider runtime, or payments?
```

## Current Repo Evidence

Existing public seminar surface:

- `apps/api/src/routes/events.ts`
- `apps/web/app/events/seminars/page.tsx`
- `apps/web/lib/live-events-route.ts`
- `packages/types/src/live-events.ts`
- `apps/api/src/routes/live-events.test.ts`

Accepted proof:

- `docs/roadmap/PR469_LIVE_EVENTS_SEMINARS_CLOSEOUT.md`
- `docs/roadmap/PR475_LIVE_EVENTS_SEMINARS_ATTENDANCE_INTEREST_CLOSEOUT.md`

Current product truth:

- public cards are derived from `discover_feed` featured public documents,
  threads, and Spaces;
- card ids are opaque public client handles, not raw source ids;
- signed-in interest targets server-resolved public source references;
- the surface explicitly says interest is not a ticket, booking, waitlist,
  reminder, payment, or attendance guarantee.

## Preflight Task

ARGUS should hostile-review the current repo and return one of:

```text
ACCEPT_PR495A_OWNER_SEMINAR_READINESS_GATE
ACCEPT_PR495A_PUBLIC_SEMINAR_METHOD_COPY
BLOCKED_NEEDS_DURABLE_SEMINAR_RECORD_CONTRACT
REJECT_DEFER
NEEDS_MIMIR_DECISION
```

If accepted, name the exact PR495A implementation shape and wake DAEDALUS.

If blocked, name the concrete blocker and the smallest numbered unblock lane
that directly enables Public Seminar host readiness.

## Candidate PR495A Shapes

ARGUS may accept, patch, or reject these candidates.

### Option 1 - Owner Seminar Readiness Gate

Add an owner-visible, readback-only seminar readiness gate on an existing
owner-safe route.

Possible placement:

- owner persona home, if the seminar is persona-led;
- public Space owner surface, if the seminar is Space-led;
- Developer Space owner/manage surface, if the seminar is project/observatory
  led.

Allowed behavior:

- explain what public material can become a seminar candidate;
- link to existing public document/thread/Space/Developer Space material;
- show whether the owner currently has public source material suitable for
  seminar readback;
- route to existing publish/discussion/public-space surfaces;
- avoid persistence if a durable seminar record is not yet accepted.

### Option 2 - Public Seminar Method Copy

Refine `/events/seminars` copy and helper names so the public page is clearer
about the current method:

- current page is curated public readbacks and interest signals;
- this is not yet scheduled live event infrastructure;
- public discussion links and source routes remain the actual next actions.

This option is acceptable only if ARGUS decides owner host-readiness would be
misleading before a durable event model exists.

### Option 3 - Durable Seminar Record Contract Blocker

If owner host-readiness cannot be honest without a real event/seminar record,
block implementation and require a smallest unblock lane:

```text
PR495A - Durable Seminar Record Contract
```

That unblock should define the minimum source reference, owner, visibility,
status, schedule/readiness, discussion, and interest relationship needed before
any UI claims "host", "propose", or "schedule".

## Questions ARGUS Should Answer

1. Can host readiness be readback-only over existing public sources, or does it
   require a durable seminar/event record first?
2. Which owner is allowed to initiate the first host-readiness step: persona
   owner, Space owner, Developer Space owner, or account owner only?
3. Should host-readiness live on persona home, Space management, Developer
   Space management, or `/events/seminars`?
4. Can existing public discussion/forum links remain the only audience
   interaction path for PR495A?
5. What existing route data is safe enough for readback without new APIs?
6. What copy is required so users do not infer tickets, RSVP, waitlists,
   reminders, live rooms, recordings, transcripts, provider calls, or payments?
7. What files/tests should DAEDALUS touch if accepted?
8. What ARIADNE hosted rehearsal would prove the first slice from both public
   and owner viewpoints?

## Guardrails

Do not add or claim:

- tickets, payment, Stripe/Billing, coupons, invoices, Connect, or paid event
  access;
- RSVP, booking guarantees, attendee lists, waitlists, reminders, calendar
  integration, email/SMS/push, or notification delivery;
- realtime rooms, livestreaming, WebSockets/SSE live-room behavior, video,
  audio, voice/avatar media, recordings, transcripts, or live chat;
- event-host dashboard, admin curation UI, schedule automation, moderation
  console work, or public attendee identity;
- provider calls, persona runtime context, memory writeback, continuity
  promotion, archive import, Redis, Cloudflare, queues, workers, hosted runtime
  expansion, or broad Discover/UI redesign.

Do not expose private Memory, Archive, Canon, Continuity, owner setup, private
documents, provider settings, raw ids, credentials, storage paths, source
bodies, visitor identity, tokens, cookies/headers, IP/user-agent values,
webhook data, SQL output, stack traces, or secret-shaped values.

## Wakeup

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- PR494 Discern Companion Home Translation is closed as CLOSE_PR494_NO_REMAINING_COMPANION_DELTA.
- MIMIR chooses PR495 as the next distinct customer-facing lane: Public Seminar / Live Events host readiness.
- PR469 public seminar cards and PR475 signed-in interest are already accepted; PR495 must not repeat them or claim live event infrastructure.
Task:
- Hostile-preflight PR495 against this document.
- Decide whether PR495A can be owner seminar readiness gate, public seminar method copy, durable seminar record contract blocker, defer, or MIMIR decision.
- If accepted, wake DAEDALUS with exact implementation scope. If blocked/deferred/decision-dependent, wake MIMIR with the concrete reason and smallest next move.
Guardrails:
- No tickets, payments, RSVP, attendee lists, reminders, live rooms, media, recordings, transcripts, provider calls, runtime expansion, queues/workers, Redis, Cloudflare, private source exposure, broad UI redesign, or launch overclaim.
```
