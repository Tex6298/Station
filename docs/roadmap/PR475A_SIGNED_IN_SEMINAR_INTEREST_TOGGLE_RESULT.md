# PR475A - Signed-In Seminar Interest Toggle Result

Owner: DAEDALUS / A2

Date: 2026-06-29

State: `READY_FOR_ARGUS_REVIEW`

## Implementation

DAEDALUS implemented the ARGUS-scoped signed-in seminar interest slice:

- added `public.public_seminar_interests` in
  `infra/supabase/migrations/061_public_seminar_interests.sql`;
- keyed durable interest by signed-in `user_id` plus server-resolved
  `(source_type, source_id)` for `document`, `thread`, or `space`;
- kept the public `seminar_<digest>` id as a client handle only;
- kept `GET /events/seminars` public and added optional auth only for current
  viewer state;
- added signed-in-only `POST /events/seminars/:seminarId/interest`;
- added signed-in-only `DELETE /events/seminars/:seminarId/interest`;
- made mark-interest idempotent through upsert;
- made withdrawal idempotent through hard delete;
- returned only aggregate `interestCount` and current viewer
  `viewerInterested`;
- updated `/events/seminars` with aggregate count, signed-in toggle,
  signed-out sign-in prompt, and negative safety copy.

## Boundary

The implementation does not persist or return public attendee lists, owner or
admin identity lists, raw source targets, raw auth values, cookies, IPs, user
agents, payment identifiers, reminder destinations, or anonymous visitor
identity.

Interest remains a private signed-in account signal. It is not RSVP, ticketing,
booking, waitlist, calendar integration, reminders, livestreaming, media rooms,
attendance guarantee, or event-host management.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/live-events.test.ts` | Pass | 5 tests passed for public routeability, auth-required mark/withdraw, idempotency, viewer-local state, fail-closed stale/private targets, and bounded errors. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/live-events-route.test.ts` | Pass | 3 tests passed for readback-only copy, safe route helpers, and aggregate/viewer-local interest helper copy. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck completed successfully. |
| `git diff --check` | Pass | No whitespace errors; line-ending normalization warnings only. |
| `git diff --cached --check` | Pass | No staged whitespace errors; line-ending normalization warnings only. |
| Diff-only sensitive-pattern scan | Pass | Expected schema/docs/copy matches only; no secrets, auth tokens, cookies, visitor identifiers, payment ids, raw SQL output, logs, or attendee identity output. |
| Diff-only scope scan | Pass | Expected negative safety copy and guardrail docs only; no implementation of tickets, Stripe, billing, reminders, livestreams, rooms, provider calls, queues, workers, Redis, or Cloudflare. |

## Handoff

Wake ARGUS:

```text
WAKEUP A3:
Codename: ARGUS
```

Task: review PR475A with hostile focus on source target resolution, viewer
privacy, aggregate count behavior, stale/private fail-closed behavior, and UI
copy boundaries.
