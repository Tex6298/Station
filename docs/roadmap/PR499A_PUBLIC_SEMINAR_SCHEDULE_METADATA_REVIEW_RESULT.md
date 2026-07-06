# PR499A - Public Seminar Schedule Metadata ARGUS Review

Owner: ARGUS / A3

Reviewer: ARGUS / A3

Date: 2026-07-06

Status: ACCEPTED

## Verdict

```text
ACCEPT_PR499A_PUBLIC_SEMINAR_SCHEDULE_METADATA_IMPLEMENTATION
```

ARGUS accepts the PR499A implementation without a review code patch.

## Review

- Migration 071 adds only nullable schedule metadata on
  `public_seminar_records`: `scheduled_starts_at`,
  `scheduled_time_zone`, and `scheduled_duration_minutes`.
- The migration leaves existing rows unscheduled, pairs stored start metadata
  with a non-empty time zone, bounds duration to 15 through 480 minutes, and
  does not add runtime/event-delivery tables, RLS expansion, providers, queues,
  calendar URLs, locations, registrations, tickets, or host controls.
- `PATCH /events/seminars/records/:recordId/schedule` is authenticated,
  creator-tier gated, owner-scoped by `id` plus `owner_user_id`, exact-body
  validated, and supports exact null clearing.
- Schedule validation requires an ISO instant, an accepted `Intl` time zone
  such as `UTC` or an IANA zone, and an optional integer duration within the
  accepted bounds.
- Owner and public types expose `schedule: PublicSeminarSchedule | null`.
- Durable published/public seminar records serialize stored schedule metadata;
  source-derived cards and unscheduled durable records serialize
  `schedule: null`.
- Public list/detail and owner Studio copy stays honest: scheduled language is
  shown only when stored schedule metadata exists, with explicit missing
  metadata copy otherwise.
- No secrets, owner/source ids, storage paths, provider payloads, SQL/table
  details, stack traces, raw source bodies, or private owner data are exposed in
  public or owner responses.

## Scope Boundary

No RSVP, tickets, payments, reminders, calendar invites, email, scheduled jobs,
live rooms, host/moderator controls, attendee lists, audience queues,
registration, attendance guarantees, provider/runtime behavior, model/prompt
changes, voice/avatar, transcripts/media, recordings, Redis, Cloudflare,
workers, realtime delivery, cache architecture, launch claims, partner claims,
new public mutations, or private/raw data exposure were added.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/live-events.test.ts apps/web/lib/live-events-route.test.ts apps/web/lib/publishing-ui.test.ts apps/web/lib/seminar-host-readiness.test.ts apps/web/lib/auth-routes.test.ts` | Pass | 66 focused seminar/public/owner-publishing/auth tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck passed. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass | Web lint replayed from cache with no warnings or errors. |
| `git diff --check` | Pass | CRLF normalization warnings only; no whitespace errors. |
| `git diff --cached --check` | Pass | No staged whitespace errors. |

## Handoff

ARGUS hands PR499A back to MIMIR for closeout and next-roadmap decision.

```text
WAKEUP A1:
Codename: MIMIR
```
