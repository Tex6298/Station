# PR495E - Public Seminar Durable Card Contract Preflight

Date: 2026-07-06

Owner: MIMIR / A1

State:

```text
OPEN_PREFLIGHT
```

## Why This Lane

PR495A proved owner Seminar readiness readback. PR495B hosted-proved durable
owner seminar records. PR495C hosted-proved private draft create/readback.
PR495D hosted-proved owner-private ready/return-to-draft.

The next real blocker is now the public durable-card contract. PR495D explicitly
left this unresolved:

- durable-record public card ids;
- dedupe with `discover_feed`;
- public interest keys;
- safe public serializer;
- owner publish/rollback semantics;
- hosted proof boundary.

Do not let this become a broad launch or hosting lane. This is the contract that
must exist before public `/events/seminars` can honestly include durable seminar
records.

## ARGUS Task

Run a hostile preflight for PR495E.

Decide whether DAEDALUS can safely implement a narrow durable public-card
contract, and if so write the exact implementation lane. If not, wake MIMIR with
the concrete blocker and smallest numbered unblock lane.

Do not wake DAEDALUS with a vague "publish seminars" or "make seminars public"
task.

## Preflight Questions

ARGUS should answer:

- What is the smallest safe first public slice: public serializer only, owner
  publish/rollback action only, public durable-card readback, or a combined
  publish-plus-readback slice?
- Should public durable cards require `status === "published"` and
  `visibility === "public"`?
- Is an owner transition from `ready` to `published` accepted now, or does it
  need a separate lane?
- Is rollback `published` to `ready`, `published` to `draft`, `cancelled`, or
  deferred?
- Should public card ids be derived from durable record id, source route, or a
  stable composite?
- How should durable-record cards dedupe against existing `discover_feed`
  document/thread/Space cards?
- Should interest remain source-derived, add a durable-record source type, or
  require a migration before public durable cards can ship?
- Does the existing `public_seminar_interests` source-type contract need a
  migration for durable records, or can PR495E avoid touching it?
- What safe public serializer fields are allowed?
- Does public `/events/seminars` response `source` need a new value, or should
  durable records merge under the existing response without changing the public
  type yet?
- What public empty/error/readback copy must stay honest about no scheduling,
  hosting, ticketing, or delivery guarantees?
- What hosted proof must ARIADNE run before closeout?

## Allowed Direction Candidates

ARGUS may accept one of these shapes:

1. **Public serializer contract only**

   Add API/helper/type tests for transforming eligible durable records into safe
   public cards without enabling public `/events/seminars` sourcing yet.

2. **Owner publish gate only**

   Add owner-only transition from private `ready` to published/public with
   explicit non-live or pending-public-readback copy, but keep public
   `/events/seminars` unchanged.

3. **Durable public-card readback**

   Add public `/events/seminars` durable-record card readback for eligible
   published/public records, including card-id, dedupe, interest, serializer,
   no-leak, rollback, and no-drift tests.

4. **Combined publish-plus-readback**

   Accept only if ARGUS can keep the route/API/type/UI/test surface small and
   prove rollback and public interest semantics without inventing launch,
   hosting, RSVP, ticketing, or delivery behavior.

5. **Block/defer**

   If the card-id, dedupe, interest, serializer, or rollback contracts are not
   safe enough, return the concrete blocker to MIMIR and name the smallest next
   lane.

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
- direct public table reads that bypass a safe API serializer;
- public visibility for `draft`, `ready`, `cancelled`, private, unroutable, or
  non-owner records;
- hidden migration of public interest behavior without focused no-drift tests.

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

## Required Return

Return one of:

```text
ACCEPT_PR495E_<EXACT_SLICE_NAME>
BLOCK_PR495E_<CONCRETE_BLOCKER>
DEFER_PR495E_<WHY>
```

If accepted, wake DAEDALUS with:

- exact route/API/type/UI files allowed;
- exact public serializer/card id/dedupe/interest/rollback contract;
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
- MIMIR closed PR495D as CLOSE_PR495D_ACCEPTED after ARIADNE passed hosted owner ready gate rehearsal.
- Owner private draft/ready transitions are now hosted-proven on /studio/publishing.
- The next Public Seminar blocker is the durable public-card contract: card ids, dedupe with discover_feed, safe serializer, interest keys, publish/rollback boundaries, and hosted proof.
Task:
- Run PR495E hostile preflight from docs/roadmap/PR495E_PUBLIC_SEMINAR_DURABLE_CARD_CONTRACT_PREFLIGHT_ARGUS.md.
- Wake DAEDALUS with the smallest safe implementation slice, or wake MIMIR with the concrete blocker/defer verdict.
```
