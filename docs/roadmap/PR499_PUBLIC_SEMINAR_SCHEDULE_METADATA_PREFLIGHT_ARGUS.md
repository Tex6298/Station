# PR499 - Public Seminar Schedule Metadata Preflight

Owner: ARGUS / A3

Opened by: MIMIR / A1

Date opened: 2026-07-06

Status: Open

## Why This Lane

PR498A closed the public seminar detail/readback surface. Station can now show
public seminar cards and route visitors into bounded detail pages with
aggregate/viewer-local interest.

The product docs describe Persona Salons as scheduled public events listed in
an events calendar. The smallest next Phase 3 seminar step is not live hosting;
it is schedule metadata and honest calendar/readback shape for already-owned
public seminar records.

## ARGUS Task

Run hostile preflight for a possible PR499A implementation lane.

Decide whether DAEDALUS may add a narrow schedule metadata contract for public
seminar records and public seminar list/detail readback.

Return one of:

```text
ACCEPT_PR499A_PUBLIC_SEMINAR_SCHEDULE_METADATA
BLOCKED_PR499_WITH_CONCRETE_UNBLOCKER
REJECT_PR499_CHOOSE_DIFFERENT_PHASE3_LANE
```

## Candidate Product Shape

If accepted, the next implementation should be limited to:

- owner-side schedule metadata for public seminar records, likely date/time and
  optional duration/status copy;
- public-safe list/detail serialization of schedule metadata for already-public
  eligible seminar records;
- clear distinction between `scheduled`, `published/readback`, and
  unavailable/thin states;
- route/readback copy that says "scheduled" only when backed by stored metadata;
- focused owner/public tests and hosted proof.

## Explicit Non-Goals

Do not include:

- live session rooms;
- host controls or moderator controls;
- audience question queues;
- registration, RSVP, attendance, ticketing, payments, Stripe, invoices,
  billing, refunds, or taxes;
- reminders, email, calendar invites, push notifications, or scheduled jobs;
- provider/model/runtime calls, streaming, voice/avatar, transcripts, media, or
  recordings;
- Redis, Cloudflare, queues, workers, realtime infrastructure, or cache
  architecture;
- public write/mutation surfaces beyond already-accepted interest behavior;
- public launch, commercial availability, delivery guarantees, or partner
  claims.

## Evidence To Inspect

Read at minimum:

- `docs/product/Station_Document_1_Platform_Overview.md`
- `docs/product/Station_Document_3_Future_Vision.md`
- `docs/roadmap/PR498A_PUBLIC_SEMINAR_DETAIL_READBACK_CLOSEOUT.md`
- `docs/roadmap/PR498A_PUBLIC_SEMINAR_DETAIL_READBACK_REVIEW_RESULT.md`
- `docs/roadmap/PR498A_PUBLIC_SEMINAR_DETAIL_READBACK_REHEARSAL_RESULT.md`
- `packages/types/src/live-events.ts`
- `apps/api/src/routes/events.ts`
- `apps/web/app/events/seminars/page.tsx`
- `apps/web/app/events/seminars/[seminarId]/page.tsx`
- current owner publishing/seminar UI before recommending DAEDALUS.

## Preflight Questions

ARGUS should answer:

- Is schedule metadata the right next Phase 3 seminar slice after PR498A?
- Does the current `public_seminar_records` contract need a migration, or can
  this be derived safely from existing fields?
- Which owner/public fields are allowed?
- How should time zones and missing dates be represented without overclaiming?
- Which public list/detail copy is allowed?
- Which private owner data must remain excluded?
- Which files/surfaces may DAEDALUS touch?
- Which validation and hosted proof are required?
- Is there a smaller concrete unblocker before schedule metadata?

## Guardrails

Any accepted lane must preserve:

- owner-only draft/ready/publish/rollback semantics;
- public/private visibility gates;
- digest-id public routeability;
- aggregate/viewer-local interest behavior;
- bounded public errors;
- no raw durable ids, owner ids, source id fields, private/source bodies,
  storage paths, provider payloads, cookies, tokens, SQL/table detail, stack
  traces, or secret-shaped values in public readback.

## Wakeup

Wake MIMIR with the verdict and next owner recommendation.
