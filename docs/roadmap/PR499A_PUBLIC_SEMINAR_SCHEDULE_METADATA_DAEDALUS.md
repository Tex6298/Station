# PR499A - Public Seminar Schedule Metadata

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Date opened: 2026-07-06

Status: Open

## Source Decision

ARGUS accepted the PR499 preflight:

`docs/roadmap/PR499_PUBLIC_SEMINAR_SCHEDULE_METADATA_PREFLIGHT_RESULT.md`

Result:

```text
ACCEPT_PR499A_PUBLIC_SEMINAR_SCHEDULE_METADATA
```

## Implementation Task

Implement only the narrow schedule metadata contract accepted by ARGUS.

Schedule must not be derived from `created_at`, `updated_at`, `publishedAt`,
or `featuredAt`. PR499A needs stored nullable schedule metadata on
`public_seminar_records` and honest owner/public readback.

## Required Migration

Add:

```text
infra/supabase/migrations/071_public_seminar_schedule_metadata.sql
```

Add nullable columns:

```text
scheduled_starts_at timestamptz null
scheduled_time_zone text null
scheduled_duration_minutes integer null
```

Constraints:

- existing rows require no schedule;
- `scheduled_starts_at` must pair with a non-empty `scheduled_time_zone`;
- when `scheduled_starts_at` is null, time zone and duration must also be null;
- duration, when present, must be bounded integer metadata, preferably `15`
  through `480`;
- no location, meeting URL, calendar URL, reminder, registration, ticket,
  host/moderator, attendee, provider, or runtime fields;
- existing owner RLS policies remain owner-scoped and direct public reads
  remain absent.

Add only a narrow public/published schedule index if justified.

## Required API Contract

Add:

```text
PATCH /events/seminars/records/:recordId/schedule
```

The route must:

- require auth and creator tier;
- scope by `id` and `owner_user_id`;
- accept only exact schedule body shape:

```ts
{
  startsAt: string | null;
  timeZone: string | null;
  durationMinutes?: number | null;
}
```

- clear schedule only when `startsAt` and `timeZone` are null and duration is
  null or omitted;
- reject extra keys and any freeform copy/URL/registration/reminder/ticket/
  host/moderator/attendee fields;
- validate `startsAt` as an ISO instant;
- validate `timeZone` as an IANA time zone or `UTC`;
- validate `durationMinutes` as bounded integer metadata only;
- return safe `OwnerPublicSeminarRecordResponse`;
- return bounded owner errors without table names, SQL, raw source ids, owner
  ids, provider payloads, stack traces, or secret-shaped values.

Setting or clearing schedule must not publish a record, create a public listing,
create a room, queue a job, send a reminder, or create a calendar invite.

## Type And Serializer Contract

Add a public-safe schedule shape, for example:

```ts
export interface PublicSeminarSchedule {
  status: "scheduled";
  startsAt: string;
  timeZone: string;
  durationMinutes: number | null;
}
```

Add schedule readback to:

- `PublicSeminarCard` as `schedule: PublicSeminarSchedule | null`;
- `OwnerPublicSeminarRecord`, using the same public-safe shape or a matching
  owner-safe nullable shape;
- durable public seminar serializers only when a published/public durable
  record has stored schedule metadata.

Source-derived cards must serialize `schedule: null`. Do not borrow lifecycle
or curation timestamps as schedule.

## Web Contract

Owner Studio publishing may add schedule metadata controls inside the existing
Seminar readiness/records panel only.

Public `/events/seminars` and `/events/seminars/:seminarId` may show schedule
readback only from serialized schedule. Use stored time zone, keep raw ISO/IANA
values in API JSON, and display missing schedule honestly.

Allowed copy can say schedule metadata and scheduled readback. It must not imply
RSVP, tickets, reminders, calendar invites, live rooms, attendance, payment,
recording, transcript, stream, provider/runtime, launch readiness, or delivery.

## Allowed Files

Do not touch files outside the ARGUS allow-list without waking MIMIR/ARGUS:

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
- `apps/web/app/globals.css`, only for small scoped schedule/readback styles
- roadmap and validation docs for PR499A

## Forbidden Scope

No RSVP, tickets, payments, reminders, calendar invites, email, scheduled jobs,
live rooms, host/moderator controls, audience queues, registration, attendance
lists, provider/runtime, model/prompt changes, voice/avatar, transcripts/media,
recordings, Redis, Cloudflare, queues, workers, realtime, cache architecture,
public launch claims, partner/commercial claims, public mutations beyond
accepted interest, or private/raw data exposure.

## Required Validation

Before waking ARGUS, run and report:

```text
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/live-events.test.ts apps/web/lib/live-events-route.test.ts apps/web/lib/publishing-ui.test.ts apps/web/lib/seminar-host-readiness.test.ts apps/web/lib/auth-routes.test.ts
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- run lint
git diff --check
git diff --cached --check
```

Coverage must include the API and web cases named in ARGUS's PR499 preflight
result.

## Handoff

Wake ARGUS with a result doc and one of:

```text
READY_FOR_ARGUS_REVIEW
BLOCKED_PR499A_WITH_REASON
```
