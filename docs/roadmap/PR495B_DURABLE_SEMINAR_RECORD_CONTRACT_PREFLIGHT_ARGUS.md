# PR495B - Durable Seminar Record Contract Preflight

Date opened: 2026-07-05

Owner: ARGUS / A3

State: OPEN_PREFLIGHT

## Why This Lane

PR495A closed the honest readback-only owner Seminar readiness gate.

The next feature boundary is not more UI polish on that panel. The blocker
before Station can claim any owner "host", "propose", or "schedule" action is a
durable seminar/event record contract.

Already accepted:

- PR469: public `/events/seminars` cards derived from featured public
  documents, threads, and Spaces;
- PR475: signed-in public seminar interest, aggregate/viewer-local only;
- PR495A: owner `/studio/publishing` readiness over public published documents
  in routeable public Spaces.

Current limitation:

- public seminar ids are digest handles derived from current public source
  material;
- interest rows persist `source_type` and `source_id`, not a durable seminar id;
- there is no owner seminar draft/proposal/publication record;
- there is no accepted status model for draft/proposed/published/cancelled
  seminars;
- there is no accepted RLS/API boundary for owner-created seminar records.

## Preflight Task

ARGUS should hostile-review the current repo and decide the smallest safe
contract slice that directly enables future Public Seminar host/proposal work.

Return one of:

```text
ACCEPT_PR495B_DURABLE_SEMINAR_RECORD_CONTRACT
ACCEPT_PR495B_SOURCE_REFERENCE_CONTRACT_ONLY
BLOCKED_NEEDS_MIMIR_DECISION
REJECT_DEFER
```

If accepted, name the exact PR495B implementation shape and wake DAEDALUS.

If blocked or deferred, wake MIMIR with the concrete blocker and the smallest
numbered unblock lane.

## Questions ARGUS Should Answer

1. What is the minimum durable seminar record needed before any UI can honestly
   say "host", "propose", or "schedule"?
2. Should PR495B create a real table/API contract now, or only a source
   reference contract that prepares the transition from derived cards?
3. What is the first owner boundary: signed-in account owner only, or a narrower
   owner of the source document/Space/thread?
4. Which source types are accepted for the first contract: document only,
   document plus Space, or the existing document/thread/Space public seminar
   source set?
5. How should PR495B relate to existing `public_seminar_interests` rows that
   currently target `source_type` and `source_id`?
6. Should public `/events/seminars` continue to use derived cards until a later
   lane, or may it read from durable records once public and source-safe?
7. What RLS policies are required so owners can manage their own records while
   public viewers see only published public-safe readback?
8. What status names are safe without overclaiming schedule/attendance/live
   delivery?
9. What migrations, package types, API routes, and tests should DAEDALUS touch
   if accepted?
10. What hosted proof would ARIADNE need after ARGUS review?

## Candidate Contract Shape

ARGUS may accept, patch, or reject this candidate.

Minimum durable record concept:

- a stable seminar record id;
- owner user id;
- source reference kind and source id;
- safe public title/summary readback derived from accepted public source data or
  owner-supplied safe fields;
- visibility/status fields that can distinguish private draft/readiness from
  public readback;
- optional discussion linkage metadata only;
- created/updated timestamps.

Possible first statuses:

- `draft`
- `ready`
- `published`
- `cancelled`

ARGUS should reject or rename any status that implies scheduled attendance,
confirmed hosting, delivery, ticketing, payment, reminders, live rooms, media,
recordings, transcripts, or provider runtime before those features exist.

## Candidate Implementation Boundary

If ARGUS accepts a real contract slice, the likely allowed files are:

- one new Supabase migration under `infra/supabase/migrations`;
- `packages/db/src/types.ts`;
- `packages/types/src/live-events.ts`;
- `apps/api/src/routes/events.ts` or a narrow owner route if safer;
- `apps/api/src/routes/live-events.test.ts`;
- focused roadmap/result docs.

ARGUS should decide whether to include any web UI. The default recommendation is
no web UI in PR495B unless the contract itself needs a minimal owner readback
proof. Public `/events/seminars` should not change unless ARGUS explicitly
accepts a no-drift transition path.

## Guardrails

Do not add or claim:

- tickets, Stripe/Billing, coupons, invoices, payment access, or paid events;
- RSVP, booking guarantees, attendee lists, waitlists, reminders, calendar
  invites, email/SMS/push, or notification delivery;
- realtime rooms, livestreaming, WebSockets/SSE rooms, video, audio,
  voice/avatar media, recordings, transcripts, or live chat;
- provider calls, persona runtime context, memory writeback, continuity
  promotion, archive import, Redis, Cloudflare, queues, workers, hosted runtime
  expansion, broad Discover/UI redesign, or launch readiness.

Do not expose:

- private Memory, Archive, Canon, Continuity, owner setup, private documents,
  provider settings, raw private source bodies, credentials, storage paths,
  visitor identity, tokens, cookies/headers, IP/user-agent values, webhook data,
  SQL output, stack traces, or secret-shaped values.

## Required Validation If Accepted

ARGUS should name exact commands, but DAEDALUS should expect at least:

```powershell
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/live-events.test.ts apps/web/lib/live-events-route.test.ts apps/web/lib/auth-routes.test.ts
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- run lint
git diff --check
```

If a migration is included, the result must also document the migration path and
hosted Supabase proof needed before closeout.

## Wakeup

```text
WAKEUP A3:
Codename: ARGUS

Summary:
- PR495A closed accepted after ARGUS review and ARIADNE hosted proof.
- PR495A intentionally stayed readback-only; the next blocker before host/propose/schedule claims is the durable seminar record contract.
- Current public seminar cards are derived from public source material, and interest rows target source_type/source_id rather than a durable seminar id.
Task:
- Hostile-preflight PR495B against this document.
- Decide the smallest safe contract slice and wake DAEDALUS if accepted.
- If blocked or deferred, wake MIMIR with the exact blocker and smallest next move.
Guardrails:
- No tickets, payments, RSVP, attendee lists, reminders, live rooms, media, recordings, transcripts, provider calls, runtime expansion, queues/workers, Redis, Cloudflare, private source exposure, broad UI redesign, or launch overclaim.
```
