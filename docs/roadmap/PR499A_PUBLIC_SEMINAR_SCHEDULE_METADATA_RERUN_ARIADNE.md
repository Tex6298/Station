# PR499A - Public Seminar Schedule Metadata Hosted Rerun

Owner: ARIADNE / A4

Opened by: MIMIR / A1

Date opened: 2026-07-06

Status: Open

## Source Context

ARIADNE's first PR499A hosted rehearsal returned:

```text
SCHEDULE_ROUTE_DEFECT
```

`docs/roadmap/PR499A_PUBLIC_SEMINAR_SCHEDULE_METADATA_REHEARSAL_RESULT.md`

DAEDALUS repaired that blocker as PR499B:

`docs/roadmap/PR499B_PUBLIC_SEMINAR_SCHEDULE_ROUTE_DEFECT_RESULT.md`

Result:

```text
MIGRATION_071_APPLIED_READY_FOR_PR499A_RERUN
```

Hosted migration 071 is now applied. DAEDALUS reported schedule columns `3/3`,
the schedule constraint present, the schedule index present, and replay-owner
`GET /events/seminars/records` returning `200` with record count `2`.

## Rerun Goal

Complete the original PR499A hosted schedule proof now that the owner seminar
records route is unblocked.

PR499A remains metadata-only schedule readback. It is not live hosting,
registration, RSVP, tickets, payments, reminders, calendar invites, email,
jobs, rooms, streaming, provider/runtime, launch, or partner availability.

## Hosted Targets

Use:

```text
Web: https://stationweb-production.up.railway.app
API: https://stationapi-production.up.railway.app
```

Use the existing hosted replay owner account/session. If auth is unavailable,
return `HOSTED_AUTH_BLOCKER` with the exact bounded blocker.

## Required Rerun Checks

Deployment and route readiness:

- confirm hosted web/API are fresh enough to include runtime commit
  `a8a384c9` or later;
- confirm `GET /events/seminars/records` still returns `200` for the replay
  owner before mutation;
- record sanitized web/API health/deployment identity.

Owner schedule mutation:

- choose an owner seminar record from the hosted owner records route;
- set schedule metadata with a valid ISO instant, stored time zone, and bounded
  duration;
- update schedule metadata once;
- clear schedule metadata exactly;
- prove set/update/clear are owner-only and creator-tier-gated where practical;
- prove invalid ISO, invalid time zone, invalid duration, and extra keys are
  rejected where practical.

Owner behavior:

- owner Studio publishing shows schedule controls only inside the existing
  Seminar readiness/records panel;
- schedule set/clear does not publish a draft by itself;
- schedule set/clear does not change ready, publish, rollback, duplicate
  publish, or duplicate rollback semantics;
- copy stays metadata-only.

Public readback:

- source-derived public seminar cards serialize and render `schedule: null`;
- durable published/public seminar cards show schedule only after stored
  metadata exists;
- public `/events/seminars` and `/events/seminars/:seminarId` show schedule
  from the serialized schedule shape only;
- clearing or rolling back the owner record removes public schedule readback;
- stale/private/unavailable records return bounded not-found behavior where
  practical without unsafe data mutation.

Desktop/mobile human-eye pass:

- check owner publishing panel, public seminar list, and public seminar detail
  on desktop, `375px`, and `390px`;
- confirm no horizontal overflow, clipped controls, unreadable labels, broken
  tap targets, or incoherent overlap;
- confirm schedule labels are understandable without implying event delivery.

Leak/claim scan:

- visible UI and API JSON must not expose raw durable ids, owner ids, source id
  fields, private/source bodies, storage paths, provider/runtime payloads,
  stack traces, SQL/table detail, cookies, tokens, API keys, or secret-shaped
  values;
- visible UI must not claim RSVP, booking, tickets, payments, reminders,
  calendar invites, email, push, attendance lists, live rooms, streams,
  recordings, transcripts, queues, workers, Redis, Cloudflare, provider
  runtime, public launch, partner launch, or delivery guarantees.

## Return Values

Wake MIMIR with one of:

```text
PASS_PR499A_HOSTED_SEMINAR_SCHEDULE_CLOSEOUT
DEPLOYMENT_WAIT
HOSTED_AUTH_BLOCKER
HOSTED_DATA_NEEDS_SCHEDULE_RECORD
SCHEDULE_ROUTE_DEFECT
SCHEDULE_MUTATION_DEFECT
OWNER_SCOPE_DEFECT
PUBLIC_READBACK_DEFECT
MOBILE_FIT_DEFECT
PRIVACY_LEAK_DEFECT
PRODUCT_DRIFT_DEFECT
BLOCKED_HOSTED_DEPLOY_OR_FIXTURE_GAP
```

Include route examples, viewport notes, sanitized API evidence, and the exact
deployed runtime identity. Do not include secrets.

## Wakeup

```text
WAKEUP A4:
Codename: ARIADNE

Summary:
- DAEDALUS repaired PR499B as hosted migration 071 drift.
- Hosted owner seminar records now returns 200 after migration 071 apply.
- PR499A hosted schedule proof still needs the full rerun.
Task:
- Rerun the hosted PR499A schedule metadata rehearsal using this document.
- Wake MIMIR with PASS_PR499A_HOSTED_SEMINAR_SCHEDULE_CLOSEOUT or the concrete
  blocker/defect.
```
