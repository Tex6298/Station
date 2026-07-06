# PR495F - Owner Seminar Publish/Rollback Preflight

Date: 2026-07-06

Owner: MIMIR / A1

State:

```text
OPEN_PREFLIGHT
```

## Why This Lane

PR495D proved owner-private `draft` to `ready` and `ready` to `draft`.
PR495E proved the dormant safe serializer for `published` + `public` durable
seminar records.

The next boundary is the owner publication action and rollback semantics. Public
durable readback now has a safe serializer, but there is not yet a real owner
flow that turns a reviewed private record into a public-eligible durable record.

This lane is a preflight. It should decide the smallest safe next implementation
without drifting into scheduling, hosting, RSVP, ticketing, payments, media, or
launch claims.

## ARGUS Task

Run a hostile preflight for PR495F.

Decide whether DAEDALUS can safely implement an owner publish/rollback gate, a
public durable readback wiring lane, a combined slice, or whether a concrete
blocker must be removed first.

Do not wake DAEDALUS with a vague "turn on public seminars" task.

## Preflight Questions

ARGUS should answer:

- Should the next implementation be owner publish/rollback only, public durable
  readback only, or a combined publish-plus-readback slice?
- Is it acceptable to set durable records to `status === "published"` and
  `visibility === "public"` before public `/events/seminars` is wired, or
  should publish and public readback land together?
- Should owner publish require current `status === "ready"` and
  `visibility === "private"`?
- Should rollback be `published` to `ready` with `visibility` back to
  `private`, or should rollback be deferred?
- Do we need a dedicated `published_at` migration before owner publish, or can
  the first slice use existing timestamps until a later migration?
- Must source ownership, source public/published state, public Space
  routeability, and discussion route safety be revalidated at publish time?
- What owner copy is allowed if public durable cards are not wired yet?
- If public durable cards are wired in the same lane, how should the route use
  the PR495E serializer, merge/dedupe helper, existing source-derived interest
  keys, and no-drift tests?
- What hosted proof must ARIADNE run before closeout?

## Allowed Direction Candidates

ARGUS may accept one of these shapes:

1. **Owner publish/rollback gate only**

   Add owner-only transition from private `ready` to `published` + `public`, and
   rollback to `ready` + `private`, while keeping public `/events/seminars`
   unwired. Visible copy must say the public listing path is not live yet or is
   pending separate public readback wiring.

2. **Public durable readback only**

   Wire public `/events/seminars` to include already-eligible durable records
   through the PR495E serializer/merge helper, but do not add owner publish UI.
   This is acceptable only if ARGUS names how eligible records can exist for
   test/proof without inventing an owner flow.

3. **Combined publish-plus-readback**

   Add owner publish/rollback and public durable readback in one small reviewed
   slice. Accept only if the route/API/type/UI/test surface remains tight and
   hosted proof can cover both without drifting into hosting/scheduling/RSVP.

4. **Block/defer**

   If publish requires a migration, policy decision, public route contract, or
   rollback decision first, return the concrete blocker to MIMIR and name the
   smallest next lane.

## Hard Guardrails

Do not accept any implementation that claims or adds:

- scheduling, hosting, rooms, live delivery, livestreaming, recordings,
  transcripts, reminders, notifications, RSVP, booking, waitlists, attendees,
  tickets, payments, Stripe, provider runtime, queue/worker execution, Redis,
  Cloudflare, billing, or launch readiness;
- broad Studio/public reskin;
- public exposure of raw owner ids, raw source ids, raw record ids, discussion
  ids, document bodies beyond accepted excerpts, private labels, SQL/storage
  internals, provider payloads, tokens, cookies/headers, IP/user-agent values,
  stack traces, or secret-shaped values;
- direct public table reads that bypass the safe serializer;
- public visibility for `draft`, `ready`, `cancelled`, private, unroutable, or
  non-owner records;
- durable-record interest keys unless a focused migration and no-drift contract
  are explicitly accepted.

## Expected Review Surface

ARGUS should inspect at least:

- `infra/supabase/migrations/069_public_seminar_records.sql`
- current `public_seminar_interests` migration/type contract
- `apps/api/src/routes/events.ts`
- `apps/api/src/routes/live-events.test.ts`
- `packages/types/src/live-events.ts`
- `apps/web/components/studio/publishing-dashboard.tsx`
- `apps/web/lib/seminar-host-readiness.ts`
- `apps/web/lib/seminar-host-readiness.test.ts`
- `apps/web/lib/live-events-route.ts`
- `apps/web/lib/live-events-route.test.ts`
- `docs/roadmap/PR495E_DURABLE_PUBLIC_CARD_SERIALIZER_CLOSEOUT.md`

## Required Return

Return one of:

```text
ACCEPT_PR495F_<EXACT_SLICE_NAME>
BLOCK_PR495F_<CONCRETE_BLOCKER>
DEFER_PR495F_<WHY>
```

If accepted, wake DAEDALUS with:

- exact route/API/type/UI files allowed;
- exact status/visibility transition and rollback contract;
- whether public `/events/seminars` is allowed to change;
- focused tests required;
- forbidden scope;
- whether ARIADNE hosted proof is required.

If blocked or deferred, wake MIMIR with the blocker and the smallest next
numbered lane.

## Wakeup

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- MIMIR closed PR495E as CLOSE_PR495E_ACCEPTED after ARGUS accepted the dormant durable public-card serializer contract.
- Durable public-card serialization, digest card ids, source-key dedupe, and source-derived interest identity are now reviewed but unwired.
- The next product boundary is owner publish/rollback versus public durable readback wiring.
Task:
- Run PR495F hostile preflight from docs/roadmap/PR495F_OWNER_SEMINAR_PUBLISH_ROLLBACK_PREFLIGHT_ARGUS.md.
- Wake DAEDALUS with the smallest safe implementation slice, or wake MIMIR with the concrete blocker/defer verdict.
```
