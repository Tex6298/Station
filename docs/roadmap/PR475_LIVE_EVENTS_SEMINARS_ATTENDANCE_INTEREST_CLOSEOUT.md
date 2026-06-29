# PR475 - Live Events / Seminars Attendance Interest Closeout

Owner: MIMIR / A1

Date: 2026-06-29

Status: Closed

## Decision

MIMIR closes PR475 as accepted.

This lane ran through:

- PR475 ARGUS preflight;
- PR475A DAEDALUS signed-in seminar interest toggle;
- ARGUS review and narrow aggregate-honest UI copy patch;
- ARIADNE hosted PR475A rehearsal, which found a hosted readback defect;
- PR475B DAEDALUS public seminar readback repair;
- ARGUS review;
- ARIADNE hosted schema-blocker proof;
- MIMIR hosted migration apply/verification for `061_public_seminar_interests.sql`;
- ARIADNE hosted schema-unblock rerun.

## Accepted Product Shape

- `/events/seminars` can render public seminar cards to signed-out visitors with
  aggregate-only interest readback and sign-in prompt.
- Signed-in users can mark interest on a public seminar card.
- Signed-in users can withdraw interest from the same card.
- The public aggregate count updates for the mark/withdraw loop.
- Viewer-local state clears after withdrawal.
- Public seminar card readback remains resilient when additive interest readback
  storage lags.
- Durable interest rows target a server-resolved public source reference, not a
  client-trusted digest.

## Hosted Evidence

- PR475A review:
  `docs/roadmap/PR475A_SIGNED_IN_SEMINAR_INTEREST_TOGGLE_REVIEW_RESULT.md`
- PR475A hosted rehearsal defect:
  `docs/roadmap/PR475A_SIGNED_IN_SEMINAR_INTEREST_TOGGLE_REHEARSAL_RESULT.md`
- PR475B repair:
  `docs/roadmap/PR475B_PUBLIC_SEMINARS_HOSTED_READBACK_REPAIR_RESULT.md`
- PR475B review:
  `docs/roadmap/PR475B_PUBLIC_SEMINARS_HOSTED_READBACK_REPAIR_REVIEW_RESULT.md`
- PR475B hosted schema blocker:
  `docs/roadmap/PR475B_PUBLIC_SEMINARS_HOSTED_READBACK_REPAIR_HOSTED_PROOF_RESULT.md`
- PR475B hosted schema-unblock rerun:
  `docs/roadmap/PR475B_PUBLIC_SEMINARS_SCHEMA_UNBLOCK_RERUN_RESULT.md`

## Validation Accepted

- `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/live-events.test.ts`:
  pass, 6 tests.
- `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/live-events-route.test.ts`:
  pass, 3 tests.
- `npm exec --yes pnpm@10.32.1 -- run typecheck`: pass.
- Hosted web/API `/health/deployment`: pass at app commit `f77b1d43`.
- Hosted public `GET /events/seminars`: pass, three public seminar cards.
- Hosted signed-out desktop and 390px mobile: pass.
- Hosted signed-in desktop and 390px mobile: pass.
- Hosted mark/withdraw loop: pass, first card aggregate moved `0 -> 1 -> 0`
  and viewer-local state cleared.
- `git diff --check`: pass.

## Boundaries Kept

No tickets, payments, Stripe/Billing, attendee lists, RSVP/booking guarantees,
waitlists, reminders, calendar integration, email/SMS/push, livestream/media
rooms, recordings, transcripts, event-host management, admin curation UI,
provider calls, persona runtime context, memory writeback, continuity
promotion, archive import, Redis, Cloudflare, queues, workers, hosted runtime
expansion, or broad Discover/UI redesign were added.

## Next Lane

Per Marty's feature-expansion rule, the next feature choice should move to a
different named Phase 3/customer-facing capability unless a concrete blocker
requires the smallest direct unblock.

MIMIR therefore opens:

`docs/roadmap/PR476_SOCIAL_PUBLISHING_CONNECTOR_PREFLIGHT_ARGUS.md`
