# PR495C - Owner Seminar Draft Action Preflight

Date opened: 2026-07-05

Owner: ARGUS / A3

State: OPEN_PREFLIGHT

## Why This Lane

PR495A gave owners a readback-only Seminar readiness panel on
`/studio/publishing`.

PR495B added and hosted-proved the durable private `draft` seminar record
contract and owner API.

The next product capability should be the smallest owner-facing use of that
contract:

```text
From a ready public document candidate, create or restore a private seminar
draft record, then show the owner that the draft exists.
```

This is not scheduling, publishing, hosting, ticketing, RSVP, reminders, live
rooms, or public event launch.

## Preflight Task

ARGUS should hostile-review the current repo and decide whether PR495C can be a
small web-only owner action/readback slice.

Return one of:

```text
ACCEPT_PR495C_OWNER_SEMINAR_DRAFT_ACTION
ACCEPT_PR495C_OWNER_SEMINAR_RECORD_READBACK_ONLY
BLOCKED_NEEDS_API_OR_HOSTED_FIX
REJECT_DEFER
NEEDS_MIMIR_DECISION
```

If accepted, name the exact DAEDALUS implementation shape and wake DAEDALUS.

If blocked or deferred, wake MIMIR with the concrete blocker and smallest next
move.

## Candidate Product Shape

Add to the existing `/studio/publishing` Seminar readiness panel:

- load owner seminar records through `GET /events/seminars/records`;
- for each ready public document candidate, show whether a private durable
  draft already exists;
- provide one real action for creator-tier owners:
  `Create seminar draft` or `Save seminar draft`;
- call `POST /events/seminars/records` with `{ sourceType: "document",
  sourceId }`;
- on success, replace the action with a bounded private draft readback;
- duplicate clicks must be idempotent and must not create visible duplicates;
- non-creator users should see honest unavailable copy or no action, not a
  broken button.

Copy should say "draft" or "private draft". It must not say host, propose,
schedule, publish, launch, book, RSVP, ticket, payment, reminder, attendance,
live room, stream, record, transcript, or notify.

## Candidate Implementation Boundary

Likely allowed files:

- `apps/web/components/studio/publishing-dashboard.tsx`;
- `apps/web/lib/seminar-host-readiness.ts`;
- `apps/web/lib/seminar-host-readiness.test.ts`;
- `apps/web/lib/publishing-ui.test.ts`;
- shared API client/types imports only as needed;
- roadmap/result docs.

Avoid API/schema changes unless ARGUS finds a concrete blocker. PR495B already
accepted and hosted-proved the owner API contract.

## Required No-Drift Checks

DAEDALUS should prove:

- owner record loading is auth-bound through existing owner API behavior;
- candidate actions only appear for public published document candidates in
  routeable public Spaces;
- create action sends only the source type and source id needed by the accepted
  API;
- response readback uses safe title/status/visibility/public route fields only;
- raw owner ids, raw source ids, raw discussion ids, private source bodies,
  private labels, storage paths, provider payloads, tokens, cookies/headers,
  IP/user-agent values, stack traces, SQL, and secret-shaped values do not
  render;
- public `/events/seminars`, signed-in interest, Discover, public search, and
  forums do not drift;
- mobile `375px`/`390px` fit remains readable with no clipped controls.

## Guardrails

Do not add or claim:

- public seminar record publishing;
- schedule/propose/host workflow;
- tickets, Stripe/Billing, coupons, invoices, paid events, or payment access;
- RSVP, booking guarantees, attendee lists, waitlists, reminders, calendar
  invites, email/SMS/push, or notification delivery;
- realtime rooms, livestreaming, WebSockets/SSE rooms, video, audio,
  voice/avatar media, recordings, transcripts, or live chat;
- provider calls, persona runtime context, memory writeback, continuity
  promotion, archive import, Redis, Cloudflare, queues, workers, hosted runtime
  expansion, broad Discover/UI redesign, or launch readiness.

## Hosted Rehearsal If Accepted

If ARGUS accepts and DAEDALUS implements PR495C, MIMIR should route ARIADNE for
hosted desktop/`375px`/`390px` proof:

- hosted app/API at implementation commit or later;
- owner `/studio` -> `/studio/publishing` flow;
- ready candidate shows real draft action;
- create draft succeeds and readback updates;
- duplicate action is stable/idempotent;
- signed-out/non-owner cannot create owner drafts;
- public `/events/seminars` and interest mark/withdraw do not drift;
- no private/raw/secret/runtime/scope leak;
- no mobile fit defect.

## Wakeup

```text
WAKEUP A3:
Codename: ARGUS

Summary:
- PR495B closed accepted after hosted migration/API proof.
- The durable private seminar draft record contract is now available on hosted API.
- The next product slice should use that contract from /studio/publishing without claiming schedule/host/publish behavior.
Task:
- Hostile-preflight PR495C against this document.
- Accept the smallest owner draft action/readback slice if safe, or return the concrete blocker.
Guardrails:
- No public seminar publishing, scheduling, hosting, tickets, payments, RSVP, reminders, attendee lists, live rooms, media, transcripts, provider/runtime, queues/workers, Redis, Cloudflare, private source exposure, broad UI redesign, or launch overclaim.
```
