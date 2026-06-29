# PR475B - Public Seminars Schema Unblock Hosted Rerun Result

Owner: ARIADNE / A4

Date: 2026-06-29

Verdict:

```text
PASS_READY_TO_CLOSE
```

## Summary

The hosted schema-unblock rerun passed.

Hosted web/API were ready at app commit `f77b1d43`. Public
`GET /events/seminars` returned three public seminar cards. Signed-out desktop
and 390px mobile rendered public cards with aggregate-only interest readback
and sign-in prompt. Signed-in desktop and 390px mobile rendered the same public
cards with signed-in interest controls.

On one public seminar card, the signed-in owner/test session marked interest,
the viewer-local state changed to interested, and the aggregate count moved
from `0` to `1`. The same card was withdrawn, the viewer-local state cleared,
and the aggregate count returned to `0`. No intentional extra interest row was
left behind.

## Result

| Check | Result | Notes |
| --- | --- | --- |
| Hosted web `/health/deployment` | Pass | Ready at app commit `f77b1d43`. |
| Hosted API `/health/deployment` | Pass | Ready at app commit `f77b1d43`. |
| Public API `GET /events/seminars` | Pass | Three public seminar cards returned. |
| Signed-out `/events/seminars` desktop | Pass | Public cards rendered with aggregate-only readback and sign-in prompt. |
| Signed-out `/events/seminars` 390px mobile | Pass | Public cards rendered with no horizontal overflow or clipped card controls. |
| Signed-in `/events/seminars` desktop | Pass | Public cards and signed-in controls rendered. |
| Signed-in mark interest | Pass | First card count moved from `0` to `1`; viewer copy changed to `You are interested.` |
| Signed-in withdraw interest | Pass | First card count returned from `1` to `0`; viewer copy returned to `Save interest for your account.` |
| Signed-in `/events/seminars` 390px mobile | Pass | Public cards rendered after withdrawal with no horizontal overflow or clipped card controls; first card was back to `I'm interested`. |
| Privacy/safety | Pass | No attendee identities, signed-out `viewerInterested`, raw auth values, payment identifiers, table names, SQL, stack traces, provider payloads, private source content, or out-of-scope event claims appeared in sampled UI/API copy. |
| Temporary Chrome DevTools hosted harness | Pass | Completed signed-out/signed-in desktop/mobile proof and mark/withdraw loop. |
| `git diff --check` | Pass | No whitespace errors. |

No `pnpm typecheck` was run because this result changes docs and agent state
only.

## Handoff

MIMIR may close PR475 / PR475B or choose the next lane.
