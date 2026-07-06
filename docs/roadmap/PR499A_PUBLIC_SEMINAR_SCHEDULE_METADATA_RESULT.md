# PR499A - Public Seminar Schedule Metadata Result

Owner: DAEDALUS / A2

Reviewer: ARGUS / A3

Date: 2026-07-06

Status: READY_FOR_ARGUS_REVIEW

## Result

```text
READY_FOR_ARGUS_REVIEW
```

DAEDALUS implemented the narrow schedule metadata contract accepted by ARGUS
for PR499A.

## Implementation

- Added migration `071_public_seminar_schedule_metadata.sql` with nullable
  `scheduled_starts_at`, `scheduled_time_zone`, and
  `scheduled_duration_minutes` fields on `public_seminar_records`.
- Added a narrow table constraint requiring either no schedule metadata or a
  start instant plus non-empty time zone, with optional duration bounded to
  15 through 480 minutes.
- Added a partial public/published schedule index for future ordered readback
  without adding public direct-table reads or new RLS behavior.
- Added owner-only
  `PATCH /events/seminars/records/:recordId/schedule`, scoped by authenticated
  owner and creator tier.
- The schedule patch body accepts only `startsAt`, `timeZone`, and optional
  `durationMinutes`, rejects extra keys, validates ISO instants and time zones,
  and supports exact null clearing.
- Added typed schedule readback on `OwnerPublicSeminarRecord` and
  `PublicSeminarCard`.
- Durable published/public seminar records serialize stored schedule metadata.
  Source-derived cards and unscheduled durable records serialize
  `schedule: null`.
- Owner Studio publishing now has schedule metadata controls inside the
  existing seminar readiness/records panel.
- Public seminar list/detail pages show stored schedule readback when present
  and honest missing-schedule copy otherwise.

## Scope Boundary

No RSVP, tickets, payments, reminders, calendar invites, email, scheduled jobs,
live rooms, host/moderator controls, audience queues, registration, attendance
lists, provider/runtime, model/prompt changes, voice/avatar, transcripts/media,
recordings, Redis, Cloudflare, queues, workers, realtime, cache architecture,
public launch claims, partner/commercial claims, new public mutations, or
private/raw data exposure were added.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/live-events.test.ts apps/web/lib/live-events-route.test.ts apps/web/lib/publishing-ui.test.ts apps/web/lib/seminar-host-readiness.test.ts apps/web/lib/auth-routes.test.ts` | Pass | 66 focused seminar/public/owner-publishing/auth tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck passed. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass | Web lint passed with no warnings or errors. |
| `git diff --check` | Pass | No whitespace errors; CRLF normalization warnings only. |
| `git diff --cached --check` | Pass | No staged whitespace errors. |

## ARGUS Review Focus

- Confirm migration 071 is only nullable schedule metadata and does not imply
  runtime/event delivery infrastructure.
- Confirm owner schedule mutation is owner-scoped, tier-gated, exact-body
  validated, and returns bounded errors.
- Confirm public readback says schedule only from stored metadata and never
  derives schedule from lifecycle timestamps.
- Confirm owner Studio and public web copy do not imply RSVP, tickets,
  reminders, calendar invites, live rooms, attendance, launch readiness, or
  provider/runtime scope.
