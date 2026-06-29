# PR475B - Public Seminars Hosted Readback Repair

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Date opened: 2026-06-29

Status: Open - wake DAEDALUS

## Why This Lane

ARIADNE completed the PR475A hosted rehearsal and found a product defect:

`docs/roadmap/PR475A_SIGNED_IN_SEMINAR_INTEREST_TOGGLE_REHEARSAL_RESULT.md`

Hosted web/API were fresh at `46a2a08d`, but public
`GET /events/seminars` returned HTTP `503` with bounded
`live_events_unavailable` copy. The hosted `/events/seminars` page rendered the
unavailable state on desktop and 390px mobile, so no public seminar cards
rendered and the signed-in mark/withdraw proof could not run.

## Task

Repair the smallest cause of hosted public seminar readback unavailability.

Start from the exact hosted blocker:

```text
fresh hosted /events/seminars returns bounded live_events_unavailable before public cards render
```

Expected investigation order:

1. Reproduce the hosted `GET /events/seminars` failure without exposing secrets,
   private rows, raw SQL, stack traces, cookies, auth headers, IPs, user agents,
   or provider payloads.
2. Compare the hosted failure against the current route and migration contract:
   - `apps/api/src/routes/events.ts`
   - `apps/api/src/routes/live-events.test.ts`
   - `apps/web/app/events/seminars/page.tsx`
   - `infra/supabase/migrations/061_public_seminar_interests.sql`
3. Identify whether the failure is code, schema/migration drift, seeded public
   data shape, or deployment readiness.
4. Patch only the smallest needed surface so hosted public seminar cards render
   again and signed-in mark/withdraw can be exercised.

## Guardrails

- Keep PR475B inside PR475A repair scope.
- Do not add tickets, RSVP, booking, payment, Stripe/Billing, reminders,
  waitlists, calendar integration, livestream/media rooms, recordings,
  transcripts, attendee lists, event-host management, admin curation UI,
  provider calls, queues/workers, Redis, Cloudflare, or broad UI redesign.
- Do not make `seminar_<digest>` durable storage. It remains only a client
  handle.
- Do not expose attendee identities, user ids, emails, avatars, raw source ids,
  cookies, auth headers, IPs, user agents, payment identifiers, table names,
  SQL, stack traces, provider payloads, secrets, owner-private controls, or
  private source content.
- Do not hide a real hosted schema/config defect by returning fake successful
  cards. If the route has no routeable public seminar sources, an empty state is
  acceptable; if the route has routeable sources but supporting storage is
  unavailable, repair that storage path or return an exact blocker.
- Exact low aggregate interest counts remain accepted by product design.

## Allowed Repair Shapes

Use the smallest one that fits evidence:

- Code repair: route-level compatibility, serializer fix, query correction, or
  safer per-card skip behavior when one featured item is malformed.
- Migration repair: add a forward-only migration if the current schema contract
  is incomplete or not safely idempotent.
- Seed/readback repair: if hosted replay seed no longer creates routeable public
  featured seminar sources, restore the bounded public seed/readback path.
- Deployment/config blocker: if hosted DB migration state is missing and cannot
  be corrected from the repo lane, wake MIMIR with the exact missing object and
  the smallest unblock step.

## Validation

Required before handoff:

```text
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/live-events.test.ts
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/live-events-route.test.ts
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

Also run any focused test added for the actual root cause.

If a hosted check is possible from A2, record:

- hosted web/API deployment freshness;
- hosted `GET /events/seminars` status;
- whether public cards render before ARIADNE reruns the full human proof.

## Handoff

If repaired, wake ARGUS first for review:

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS repaired PR475B public seminars hosted readback unavailability.
- Hosted/public seminar cards should render again for ARIADNE's PR475A replay.
Risk:
- Validate public-only routeability, schema/seed assumptions, signed-in interest
  privacy, aggregate-only exposure, and bounded failure behavior.
Task:
- Review PR475B, run validation, and if accepted wake ARIADNE for the same
  hosted signed-out/signed-in desktop/mobile proof with one mark/withdraw flow.
```

If blocked, wake MIMIR:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- DAEDALUS could not repair PR475B inside repo/code control.
Blocker:
- <exact missing object/config/deploy state>
Task:
- Route the smallest unblock or choose whether PR475 must pause at this blocker.
```
