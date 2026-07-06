# PR495D - Seminar Draft Publication Boundary Preflight

Date: 2026-07-06

Owner: MIMIR / A1

State:

```text
OPEN_PREFLIGHT
```

## Why This Lane

PR495A proved owner Seminar readiness readback. PR495B hosted-proved the durable
owner seminar record contract. PR495C hosted-proved owner creation/readback of
private seminar drafts.

The next boundary is not another private readback polish. The next real product
question is whether a private durable draft can become public seminar readback,
and what the smallest safe implementation should be.

Current facts:

- `public.public_seminar_records` already has `draft`, `ready`, `published`,
  and `cancelled` statuses;
- the table already has `private` and `public` visibility;
- owner APIs currently support owner list/create/restore only;
- public `/events/seminars` currently resolves featured public documents,
  threads, and Spaces from `discover_feed`;
- interest mark/withdraw currently resolves those public cards, not durable
  seminar records.

## ARGUS Task

Run a hostile preflight for the private-draft to public-seminar boundary.

Decide whether DAEDALUS can safely implement a small PR495D slice, and if so
write the exact implementation contract. If not, wake MIMIR with the concrete
blocker and the smallest numbered unblock lane.

Do not wake DAEDALUS with a vague "publish seminars" instruction.

## Preflight Questions

ARGUS should answer:

- Is the smallest safe product slice an owner-only publish/promote action, a
  public durable-record readback path, or a smaller owner-only draft detail
  unblock?
- Should a public seminar require both `status === "published"` and
  `visibility === "public"`?
- Should a `ready` state exist in the first UI path, or remain unused until a
  later scheduling/review workflow?
- Can public `/events/seminars` safely merge durable published records with
  current `discover_feed` featured sources, or must it stay source-derived until
  another contract is added?
- How should public seminar card ids and interest keys remain stable if durable
  records are added?
- Does public interest continue to target source references, or must interest
  support durable seminar records before any public durable seminar appears?
- What owner-visible rollback is required in this slice: unpublish, cancel, or
  explicit defer?
- What hosted proof must ARIADNE run after review?

## Allowed Direction Candidates

ARGUS may accept one of these shapes:

1. **Owner publish action only**

   Add an owner-only transition from private `draft` to public `published` for
   an existing durable seminar record, with owner readback and no public
   `/events/seminars` sourcing change yet. This is acceptable only if visible
   copy says the public listing is not live yet.

2. **Published-record public readback**

   Add a safe serializer and public card resolver for durable records where
   `status === "published"` and `visibility === "public"`, preserving current
   public card route safety and public interest no-drift or explicitly extending
   interest with a reviewed durable-record key.

3. **Owner draft detail/readback unblock**

   If publish/public sourcing is too risky, add the smallest owner-only detail
   or status-readback lane that removes the blocker without claiming public
   seminars are live.

4. **Block/defer**

   If none of the above is safe, return the concrete blocker to MIMIR and name
   the smallest numbered unblock lane.

## Hard Guardrails

Do not accept any implementation that claims or adds:

- scheduling, hosting, rooms, live delivery, livestreaming, recordings,
  transcripts, reminders, notifications, RSVP, booking, waitlists, attendees,
  tickets, payments, Stripe, provider runtime, queue/worker execution, Redis,
  Cloudflare, billing, or launch readiness;
- broad Studio/public reskin;
- public exposure of raw owner ids, raw source ids, discussion ids, document
  bodies, private labels, SQL/storage internals, provider payloads, tokens,
  cookies/headers, IP/user-agent values, stack traces, or secret-shaped values;
- direct public table reads that bypass a safe API serializer;
- public visibility for `draft`, `ready`, `cancelled`, private, unroutable, or
  non-owner records.

## Expected Review Surface

ARGUS should inspect at least:

- `infra/supabase/migrations/069_public_seminar_records.sql`
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
ACCEPT_PR495D_<EXACT_SLICE_NAME>
BLOCK_PR495D_<CONCRETE_BLOCKER>
DEFER_PR495D_<WHY>
```

If accepted, wake DAEDALUS with:

- the exact route/API/type/UI files allowed;
- the exact state transition or public readback contract;
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
- MIMIR closed PR495C as CLOSE_PR495C_ACCEPTED after ARIADNE passed hosted owner seminar draft action rehearsal.
- Owner private durable seminar drafts are now hosted-proven on /studio/publishing.
- The next Public Seminar boundary is whether/how private durable drafts can become public seminar readback.
Task:
- Run PR495D hostile preflight from docs/roadmap/PR495D_SEMINAR_DRAFT_PUBLICATION_BOUNDARY_PREFLIGHT_ARGUS.md.
- Wake DAEDALUS with the smallest safe implementation slice, or wake MIMIR with the concrete blocker/defer verdict.
```
