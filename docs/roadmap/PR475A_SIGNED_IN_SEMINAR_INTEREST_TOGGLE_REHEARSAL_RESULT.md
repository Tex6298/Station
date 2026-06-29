# PR475A - Signed-In Seminar Interest Toggle Hosted Rehearsal Result

Owner: ARIADNE / A4

Date: 2026-06-29

Verdict:

```text
PRODUCT_DEFECT_NEEDS_DAEDALUS
```

## Summary

The hosted PR475A rehearsal did not reach the signed-in mark/withdraw flow
because the public seminars readback is unavailable on the fresh deploy.

Hosted web/API were ready at `46a2a08d`. The public API
`GET /events/seminars` returned HTTP `503` with bounded
`live_events_unavailable` copy. The hosted `/events/seminars` page rendered the
unavailable state on desktop and 390px mobile, with zero public seminar cards.

No interest mark, withdrawal, ticketing, RSVP, booking, payment, reminder,
waitlist, calendar, livestream, media room, attendance, SQL, log, config,
provider, queue, worker, Redis, Cloudflare, or admin/private route action was
opened. No intentional extra interest row was left behind because no interest
mutation was attempted.

## Result

| Check | Result | Notes |
| --- | --- | --- |
| Hosted web `/health/deployment` | Pass | Ready at `46a2a08d`. |
| Hosted API `/health/deployment` | Pass | Ready at `46a2a08d`. |
| Public API `GET /events/seminars` | Fail | Returned HTTP `503` with bounded `live_events_unavailable` copy. |
| Signed-out `/events/seminars` desktop | Fail | Page rendered the public readback unavailable state and no seminar cards. |
| Signed-out `/events/seminars` 390px mobile | Fail | Same unavailable state; no horizontal overflow observed. |
| Signed-in mark/withdraw flow | Not run | Blocked by unavailable public seminar readback; no mutation attempted. |
| Privacy/safety | Pass for sampled failure state | Bounded public error only; no attendee identities, raw auth values, payment identifiers, stack traces, SQL, table names, provider payloads, or private source content appeared. |
| Scope boundary | Pass for sampled failure state | No ticketing, RSVP, booking, payment, reminder, waitlist, calendar, livestream, media room, event-host management, provider, queue, worker, Redis, Cloudflare, or hosted runtime action was opened. |
| Temporary Chrome DevTools hosted harness | Product defect found | Confirmed fresh deploy, API `503`, desktop/mobile unavailable state, zero mobile seminar cards, no mobile overflow, and no mutation. |
| `git diff --check` | Pass | No whitespace errors. |

No `pnpm typecheck` was run because this result changes docs and agent state
only.

## Exact Blocker

```text
fresh hosted /events/seminars returns bounded live_events_unavailable before public cards render
```

## Handoff

MIMIR should route the smallest repair. The likely repair owner is DAEDALUS,
but ARIADNE is not asserting the cause from logs, SQL, or private config.
