# PR499 - Public Seminar Schedule Metadata Preflight Result

Owner: ARGUS / A3

Date: 2026-07-06

Result:

```text
ACCEPT_PR499A_PUBLIC_SEMINAR_SCHEDULE_METADATA
```

## Decision

ARGUS accepts PR499A as the next safe Phase 3 seminar slice.

No smaller unblocker is required, but DAEDALUS must not derive schedule from
`created_at`, `updated_at`, `publishedAt`, or `featuredAt`. Those are lifecycle
and curation timestamps, not event schedule metadata. PR499A therefore needs a
narrow nullable schedule metadata migration on `public_seminar_records`.

The accepted lane is only stored schedule metadata and honest owner/public
readback for already-owned seminar records. It is not live hosting,
registration, RSVP, tickets, payments, reminders, calendar invites, email,
jobs, rooms, streaming, provider/runtime, or launch work.

## Required Scope

DAEDALUS may touch only:

- `infra/supabase/migrations/071_public_seminar_schedule_metadata.sql`
- `packages/db/src/types.ts`
- `packages/types/src/live-events.ts`
- `apps/api/src/routes/events.ts`
- `apps/api/src/routes/live-events.test.ts`
- `apps/web/components/studio/publishing-dashboard.tsx`
- `apps/web/lib/seminar-host-readiness.ts`
- `apps/web/lib/seminar-host-readiness.test.ts`
- `apps/web/lib/publishing-ui.test.ts`
- `apps/web/lib/live-events-route.ts`
- `apps/web/lib/live-events-route.test.ts`
- `apps/web/app/events/seminars/page.tsx`
- `apps/web/app/events/seminars/[seminarId]/page.tsx`
- `apps/web/app/globals.css`, only for small scoped schedule/readback styles if
  existing styles are insufficient
- roadmap and validation docs for PR499A

No other migrations, tables, RLS expansion, public write routes, background
jobs, scheduled jobs, queues, Redis, Cloudflare, workers, realtime, cache
architecture, provider/runtime code, voice/avatar, transcripts/media,
recordings, billing, Stripe, email, calendar integration, public launch copy,
or broad `/events` redesign is accepted.

## Migration Contract

Add nullable schedule metadata columns to `public.public_seminar_records`:

```text
scheduled_starts_at timestamptz null
scheduled_time_zone text null
scheduled_duration_minutes integer null
```

Required constraints:

- no schedule fields are required for existing rows;
- `scheduled_starts_at` must be paired with a non-empty
  `scheduled_time_zone`;
- when `scheduled_starts_at` is null, `scheduled_time_zone` and
  `scheduled_duration_minutes` must also be null;
- `scheduled_duration_minutes`, when present, must be a bounded integer,
  preferably `15` through `480`;
- no freeform schedule copy, location, meeting URL, calendar URL, reminder
  setting, registration URL, ticket URL, host/moderator field, attendee field,
  or provider/runtime field is added;
- existing owner RLS policies remain owner-scoped and direct public table reads
  remain absent.

DAEDALUS should add a public-record schedule index only if it is narrow and
justified, for example over public published rows and `scheduled_starts_at`.

## API Contract

Add owner-only schedule mutation for durable seminar records:

```text
PATCH /events/seminars/records/:recordId/schedule
```

The route must:

- require auth and creator tier;
- scope by both `id` and `owner_user_id`;
- accept only an exact body shape such as:

```ts
{
  startsAt: string | null;
  timeZone: string | null;
  durationMinutes?: number | null;
}
```

- clear schedule only when `startsAt` and `timeZone` are null and duration is
  null or omitted;
- reject extra keys, freeform copy, URLs, calendar/reminder fields,
  registration/RSVP/ticket/payment fields, host/moderator fields, and attendee
  fields;
- validate `startsAt` as an ISO instant;
- validate `timeZone` as an IANA time zone or `UTC` using application logic;
- validate `durationMinutes` as bounded integer metadata only;
- return the safe `OwnerPublicSeminarRecordResponse`;
- return bounded owner errors and never leak table names, SQL, raw source ids,
  owner ids, provider payloads, stack traces, or secret-shaped values.

Existing draft/ready/publish/rollback semantics must not change. Setting or
clearing schedule metadata must not publish a record, create a public listing,
create a room, queue a job, send a reminder, or create any calendar invite.

## Type And Serializer Contract

Add a small public-safe schedule shape, for example:

```ts
export interface PublicSeminarSchedule {
  status: "scheduled";
  startsAt: string;
  timeZone: string;
  durationMinutes: number | null;
}
```

Then add schedule readback to:

- `PublicSeminarCard`, as `schedule: PublicSeminarSchedule | null`;
- `OwnerPublicSeminarRecord`, using the same public-safe shape or a matching
  owner-safe nullable shape;
- durable public seminar serializers only when a published/public durable
  record has stored schedule metadata.

Source-derived discover-feed cards have no durable schedule metadata. They must
serialize `schedule: null` and must not borrow `featuredAt`, `publishedAt`,
`created_at`, or `updated_at` as schedule.

Public copy may say "Scheduled" only when `schedule` is non-null and backed by
stored `scheduled_starts_at`. Missing schedule must be represented honestly,
for example "Schedule not posted" or no schedule badge.

## Web Contract

Owner Studio publishing may add schedule metadata controls inside the existing
Seminar readiness/records panel only. The UI must:

- operate on existing owner seminar records;
- show bounded metadata copy such as "Schedule metadata only";
- avoid claims that a public room, RSVP, reminder, ticket, calendar invite,
  email, attendance list, payment, recording, transcript, stream, or delivery
  exists;
- avoid freeform public schedule notes in PR499A.

Public `/events/seminars` and `/events/seminars/:seminarId` may show schedule
readback only from the serialized schedule shape. Formatting should:

- use the stored time zone, not an inferred browser/local owner time zone;
- keep the raw ISO and IANA time zone in API JSON;
- display a human label without implying registration, attendance, reminders,
  tickets, or launch readiness;
- show missing schedule honestly.

Because schedule metadata is now in scope, web tests should replace any global
ban on the words `schedule`, `scheduled`, or `calendar` with targeted bans on
overclaim phrases such as `calendar invite`, `add to calendar`, `reminder`,
`RSVP`, `ticket`, `payment`, `attendance`, `live room`, `stream`, `recording`,
`transcript`, `provider`, and `launch readiness`.

## Forbidden Data And Claims

PR499A must not expose or claim:

- raw durable ids, owner ids, source id fields, private/source bodies, storage
  paths, provider payloads, cookies, tokens, API keys, SQL/table detail, stack
  traces, or secret-shaped values;
- registration, RSVP, attendee lists, attendance guarantees, tickets, payments,
  Stripe, invoices, billing, refunds, taxes, reminders, email, push
  notifications, calendar invites, `.ics` downloads, scheduled jobs, host
  controls, moderator controls, audience queues, question queues, live rooms,
  streaming, voice/avatar, transcripts, media, recordings, provider/model
  runtime, Redis, Cloudflare, workers, queues, realtime, public launch, partner
  claims, commercial availability, or delivery guarantees.

## Required DAEDALUS Validation

Before waking ARGUS, DAEDALUS must run and report:

```text
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/live-events.test.ts apps/web/lib/live-events-route.test.ts apps/web/lib/publishing-ui.test.ts apps/web/lib/seminar-host-readiness.test.ts apps/web/lib/auth-routes.test.ts
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- run lint
git diff --check
git diff --cached --check
```

Focused API coverage must include:

- migration shape and DB type updates;
- owner schedule set, clear, duplicate update, signed-out denial, lower-tier
  denial, and non-owner denial;
- invalid ISO/time zone/duration and extra-key rejection;
- schedule metadata does not alter draft/ready/publish/rollback behavior;
- public list/detail schedule appears only for eligible durable published/public
  records with stored schedule metadata;
- source-derived cards and durable records without schedule serialize
  `schedule: null`;
- rollback/private/stale records disappear from public schedule readback;
- bounded errors and no raw/private/secret/provider/SQL leakage.

Focused web coverage must include:

- owner schedule controls are wired only inside the Seminar readiness/records
  panel and use bounded metadata-only copy;
- public list/detail schedule labels appear only when schedule is non-null;
- missing schedule is honest and does not imply a hidden event;
- no RSVP, ticket, payment, reminder, calendar invite, live-room,
  provider/runtime, launch, attendance, recording, or transcript claims enter
  visible copy.

## Hosted Proof Required After Review

If ARGUS accepts the implementation, ARIADNE must prove hosted behavior before
closeout:

- migration 071 is applied in hosted;
- owner can set, update, and clear schedule metadata on an owner seminar record;
- schedule set/clear does not publish by itself and does not change owner
  draft/ready/publish/rollback semantics;
- published/public durable seminar list/detail readback shows schedule only
  after stored metadata exists;
- rollback/private/stale cases remove public schedule readback;
- signed-out public list/detail remains bounded and read-only;
- desktop, `375px`, and `390px` owner/public views fit without overflow,
  clipped controls, or incoherent overlap;
- API/visible scans find no private/raw/secret/provider/SQL leakage and no
  RSVP/ticket/payment/reminder/calendar-invite/live-room/runtime/launch claims.

## ARGUS Validation

ARGUS ran the current preflight baseline:

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/live-events.test.ts apps/web/lib/live-events-route.test.ts apps/web/lib/publishing-ui.test.ts apps/web/lib/seminar-host-readiness.test.ts apps/web/lib/auth-routes.test.ts` | Pass | 60 focused seminar/public/owner-publishing/auth tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck replayed from cache. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass | Web lint replayed from cache with no warnings or errors. |

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
```

MIMIR should close the preflight and, if still aligned, route DAEDALUS for
PR499A using the contract above.
