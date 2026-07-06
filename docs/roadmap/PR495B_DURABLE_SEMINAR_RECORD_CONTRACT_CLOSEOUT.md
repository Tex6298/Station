# PR495B - Durable Seminar Record Contract Closeout

Date: 2026-07-05

Owner: MIMIR / A1

Result:

```text
CLOSE_PR495B_ACCEPTED
```

## Closeout

PR495B is accepted and closed.

The lane delivered the contract-only durable owner seminar record foundation:

- migration `069_public_seminar_records.sql`;
- owner-scoped `public.public_seminar_records`;
- DB and shared live-event types;
- owner-only `GET /events/seminars/records`;
- creator-gated owner-only `POST /events/seminars/records`;
- document-only source references for the first slice;
- safe owner serializer that returns public routes and bounded readback instead
  of raw owner/source/discussion ids.

## Accepted Chain

- MIMIR opened PR495B after PR495A proved owner readiness readback.
- ARGUS accepted durable seminar records as the smallest unblock before any
  future host/propose/schedule claim.
- DAEDALUS implemented the contract-only migration/API/types/tests slice.
- ARGUS accepted the implementation without a code patch.
- MIMIR applied hosted migration 069 and passed hosted API/schema proof.

Key records:

- `docs/roadmap/PR495B_DURABLE_SEMINAR_RECORD_CONTRACT_PREFLIGHT_ARGUS.md`
- `docs/roadmap/PR495B_DURABLE_SEMINAR_RECORD_CONTRACT_PREFLIGHT_RESULT.md`
- `docs/roadmap/PR495B_DURABLE_SEMINAR_RECORD_CONTRACT_RESULT.md`
- `docs/roadmap/PR495B_DURABLE_SEMINAR_RECORD_CONTRACT_REVIEW_RESULT.md`
- `docs/roadmap/PR495B_DURABLE_SEMINAR_RECORD_CONTRACT_HOSTED_PROOF_RESULT.md`

## Product Truth

Accepted:

- hosted Supabase has the durable owner seminar records table and owner-only
  RLS policies;
- hosted owner API can create/list a private `draft` seminar record from an
  owned public published document in a routeable public Space;
- duplicate owner create is stable and idempotent;
- signed-out and non-owner access is denied or owner-empty as expected;
- public `/events/seminars` and signed-in interest still use the accepted
  public readback/interest paths without drift.

Still not claimed:

- owner UI to create a draft record;
- public seminar cards sourced from durable records;
- publishing a seminar record;
- proposal, scheduling, hosting, RSVP, booking, waitlists, attendee lists,
  tickets, payments, reminders, live rooms, media, recordings, transcripts,
  provider runtime, queue/worker behavior, Redis, Cloudflare, billing, or
  launch readiness.

## Validation

| Check | Result | Notes |
| --- | --- | --- |
| ARGUS review | Pass | Migration/RLS, owner document authority, creator gate, idempotency, serializer redaction, forbidden scope, and public seminar/interest no-drift accepted. |
| Focused tests | Pass | 19 tests passed across live-events API, web live-events route helpers, and auth routes. |
| Typecheck | Pass | API and web typecheck passed during ARGUS review. |
| Lint | Pass | Web lint passed during ARGUS review. |
| Hosted migration apply | Pass | Migration 069 applied statement-by-statement through the hosted Supabase pooler. |
| Hosted schema proof | Pass | Table, RLS, policies, indexes, trigger, and constraints verified; anonymous REST table read returned zero rows. |
| Hosted owner API proof | Pass | Owner create/list, duplicate stability, signed-out denial, non-owner denial, public seminars no-drift, interest mark/withdraw no-drift, and response no-leak checks passed. |

## Next Lane

The next useful Public Seminar / Live Events feature slice is owner-facing UI
that uses the accepted record contract without pretending scheduling or hosting
exists.

MIMIR opens:

`docs/roadmap/PR495C_OWNER_SEMINAR_DRAFT_ACTION_PREFLIGHT_ARGUS.md`

This should preflight a small `/studio/publishing` action/readback slice:
create or restore a private seminar draft from an accepted readiness candidate,
show the durable draft state, and preserve all public seminar no-drift
boundaries.
