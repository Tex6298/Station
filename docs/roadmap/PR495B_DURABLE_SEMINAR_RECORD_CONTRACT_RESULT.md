# PR495B - Durable Seminar Record Contract Result

Date: 2026-07-05

Owner: DAEDALUS / A2

Result:

```text
READY_FOR_ARGUS_REVIEW
```

## Implementation

PR495B adds the contract-only durable owner seminar record foundation:

- migration `infra/supabase/migrations/069_public_seminar_records.sql`;
- DB table typing for `public.public_seminar_records`;
- shared owner record request/response types in
  `packages/types/src/live-events.ts`;
- owner-only `GET /events/seminars/records`;
- creator-gated owner-only `POST /events/seminars/records`;
- focused live-events API tests for owner scope, idempotency, invalid sources,
  bounded errors, and public seminar no-drift.

The first accepted source type is `document` only.

## Boundary

The owner create path accepts only an owned public published document in a
routeable public Space. The server derives bounded title and summary snapshots,
copies linked discussion state only as `discussionLinked`, and returns public
document/Space routes instead of raw source ids.

No public seminar UI, owner UI, public `/events/seminars` sourcing change,
interest migration, status transition route, schedule/proposal/host claim,
RSVP, ticket, payment, reminder, live room, media, transcript, provider,
runtime, queue, Redis, Cloudflare, or launch claim was added.

## Validation

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/live-events.test.ts apps/web/lib/live-events-route.test.ts apps/web/lib/auth-routes.test.ts` | Pass | 19 focused tests passed, including 4 new durable seminar record route tests. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck passed. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass | Web lint passed with no warnings or errors. |
| `git diff --check` | Pass | No whitespace errors. |

## Hosted Proof Required Before Closeout

If ARGUS accepts this implementation, MIMIR should route hosted proof covering:

- migration `069_public_seminar_records.sql` applied on hosted Supabase;
- table, constraints, indexes, updated-at trigger, and owner-only RLS policies
  exist;
- no direct public/anonymous table select policy exists;
- owner can create/list one durable seminar record for an accepted public
  document source;
- duplicate owner create returns one stable record;
- signed-out/public requests cannot access owner records;
- public `/events/seminars` still renders derived public cards and existing
  interest behavior without drift;
- no raw source id, owner id, discussion id, private body, SQL output, stack
  trace, secret-shaped value, ticket, payment, RSVP, attendee, reminder, room,
  media, transcript, provider, queue, Redis, Cloudflare, or launch claim leaks.

## Wakeup

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS implemented PR495B as a contract-only durable owner seminar record baseline.
- Migration 069 adds public.public_seminar_records with owner/source uniqueness and owner-only RLS.
- Owner GET/POST records API is auth-bound; POST is creator-gated and document-source-only.
- Focused tests prove owner scope, idempotency, invalid source fail-closed behavior, bounded errors, and public seminar/interest no-drift.
Risk:
- Review source ownership via documents.author_user_id, public route serializer redaction, RLS policy shape, and no public /events/seminars behavior drift.
Task:
- Review PR495B implementation and validation.
- If accepted, wake MIMIR for hosted migration/API proof before closeout.
- If fixes are needed, wake DAEDALUS with the smallest repair.
```
