# PR499A - Public Seminar Schedule Metadata Hosted Rehearsal

Owner: ARIADNE / A4

Opened by: MIMIR / A1

Date opened: 2026-07-06

Status: Open

## Source Decision

ARGUS accepted the PR499A implementation without a review code patch:

`docs/roadmap/PR499A_PUBLIC_SEMINAR_SCHEDULE_METADATA_REVIEW_RESULT.md`

Result:

```text
ACCEPT_PR499A_PUBLIC_SEMINAR_SCHEDULE_METADATA_IMPLEMENTATION
```

The PR499 preflight explicitly required hosted ARIADNE proof after ARGUS
review. Do not close PR499A until hosted schedule behavior is proven or a
concrete hosted blocker is recorded.

## Rehearsal Goal

Prove hosted Station treats seminar schedule as narrow owner-entered metadata:
stored start instant, stored time zone, and optional bounded duration. The
surface must remain public readback, not event delivery infrastructure.

## Hosted Targets

Use:

```text
Web: https://stationweb-production.up.railway.app
API: https://stationapi-production.up.railway.app
```

Use the existing hosted replay owner account/session. If auth is unavailable,
return `HOSTED_AUTH_BLOCKER` with the exact bounded blocker.

## Required Hosted Checks

Deployment freshness:

- confirm hosted web/API are fresh enough to include runtime commit
  `a8a384c9` or later;
- record sanitized web/API health/deployment identity;
- if the hosted app has not deployed the schedule metadata runtime, return
  `DEPLOYMENT_WAIT`.

Migration and owner schedule mutation:

- confirm migration `071_public_seminar_schedule_metadata.sql` is applied in
  hosted by using the owner schedule route, not by exposing raw table detail;
- on an owner seminar record, set schedule metadata with a valid ISO instant,
  time zone, and bounded duration;
- update the schedule metadata once;
- clear the schedule metadata exactly;
- prove set/update/clear are owner-only, creator-tier-gated, and bounded when
  unauthenticated or lower-tier access is attempted if practical;
- confirm invalid ISO, invalid time zone, invalid duration, or extra keys are
  rejected through bounded errors if practical.

Owner behavior:

- owner Studio publishing shows schedule controls only inside the existing
  Seminar readiness/records panel;
- schedule set/clear does not publish a draft by itself;
- schedule set/clear does not change ready, publish, rollback, duplicate
  publish, or duplicate rollback semantics;
- copy stays metadata-only and does not promise a live room, RSVP, reminder,
  ticket, calendar invite, attendance, delivery, stream, recording, transcript,
  provider/runtime behavior, or launch readiness.

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
- ARGUS accepted PR499A public seminar schedule metadata locally.
- PR499 preflight still requires hosted proof before closeout.
- Schedule is metadata-only: stored start instant, stored time zone, and
  optional bounded duration on owner seminar records.
Task:
- Run the hosted desktop/375px/390px rehearsal using this document.
- Wake MIMIR with PASS_PR499A_HOSTED_SEMINAR_SCHEDULE_CLOSEOUT or the concrete
  blocker/defect.
```
