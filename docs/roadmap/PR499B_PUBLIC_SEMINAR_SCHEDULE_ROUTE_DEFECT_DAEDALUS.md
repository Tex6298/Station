# PR499B - Public Seminar Schedule Route Defect

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Date opened: 2026-07-06

Status: Open

## Source Defect

ARIADNE ran the PR499A hosted schedule rehearsal and returned:

```text
SCHEDULE_ROUTE_DEFECT
```

Result document:

`docs/roadmap/PR499A_PUBLIC_SEMINAR_SCHEDULE_METADATA_REHEARSAL_RESULT.md`

Hosted web/API were fresh at runtime commit `a8a384c9452e`. Replay owner auth
passed, and ordinary owner reads passed:

- `GET /auth/me`: `200`
- `GET /documents`: `200`

The owner seminar record entry point failed:

```text
GET /events/seminars/records -> 503 seminar_records_unavailable
```

No schedule mutation, public readback, or desktop/mobile proof could run
because the owner record list failed before record selection.

## Likely Shape

The PR499A owner list route selects the new nullable schedule columns:

```text
scheduled_starts_at
scheduled_time_zone
scheduled_duration_minutes
```

If hosted migration `071_public_seminar_schedule_metadata.sql` has not been
applied, the bounded `503 seminar_records_unavailable` is expected. Treat
hosted migration drift as the first hypothesis, but prove it rather than
guessing.

## Task

Diagnose and repair the smallest real blocker to hosted
`GET /events/seminars/records`.

Allowed repair paths:

1. If hosted migration 071 is missing, apply the existing accepted migration
   only. Do not edit repo code for a pure hosted migration drift repair.
2. If migration 071 is present and the route still fails, patch the narrow route
   defect. Keep changes limited to the owner seminar records/schedule path and
   focused tests.

Do not widen PR499A into live hosting, RSVP, tickets, payments, reminders,
calendar invites, email, jobs, live rooms, host/moderator controls,
provider/runtime, Redis, Cloudflare, queues, workers, launch claims, or private
data exposure.

## Required Evidence

For a migration-only repair, record:

- sanitized proof that hosted migration 071 availability was the blocker;
- sanitized proof that `GET /events/seminars/records` no longer returns
  `503 seminar_records_unavailable`;
- confirmation no secrets, connection strings, SQL errors, table details, stack
  traces, raw owner ids, or private/source bodies were printed in docs or
  commit output.

For a code repair, run and report:

```text
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/live-events.test.ts apps/web/lib/live-events-route.test.ts apps/web/lib/publishing-ui.test.ts apps/web/lib/seminar-host-readiness.test.ts apps/web/lib/auth-routes.test.ts
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- run lint
git diff --check
git diff --cached --check
```

Focused repair coverage must prove:

- owner seminar record listing remains authenticated and bounded;
- schedule metadata fields are read only from durable owner records with the
  accepted nullable schedule contract;
- missing-hosted-schema failures are not hidden as a false pass;
- errors remain bounded and do not leak SQL/table/stack/secret/private data.

## Handoff Rules

- If this is migration-only and the route is repaired, wake MIMIR with
  `MIGRATION_071_APPLIED_READY_FOR_PR499A_RERUN`.
- If repo code or migration files change, wake ARGUS for review with
  `READY_FOR_ARGUS_REVIEW`.
- If blocked by missing credentials/tooling/deploy state, wake MIMIR with
  `BLOCKED_HOSTED_MIGRATION_OR_ROUTE_REPAIR` and the exact bounded blocker.

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS

Summary:
- ARIADNE found PR499A hosted schedule proof blocked before record selection.
- Hosted web/API are fresh at a8a384c9452e, owner auth works, and /documents works.
- GET /events/seminars/records returns 503 seminar_records_unavailable.
Task:
- Diagnose hosted migration 071 drift first, then repair the smallest real blocker.
- If migration-only, apply the existing accepted migration and wake MIMIR for rerun.
- If code changes are needed, keep the patch narrow and wake ARGUS.
```
