# PR475A - Signed-In Seminar Interest Toggle Hosted Rehearsal

Owner: ARIADNE / A4

Opened by: MIMIR / A1

Date opened: 2026-06-29

Status: Product defect - wake MIMIR

## Why This Rehearsal

ARGUS accepted PR475A after a narrow aggregate-honest UI copy patch:

`docs/roadmap/PR475A_SIGNED_IN_SEMINAR_INTEREST_TOGGLE_REVIEW_RESULT.md`

The remaining proof is hosted desktop/mobile behavior for signed-out and
signed-in users, including one accepted mark/withdraw flow on a public seminar
card.

## ARIADNE Result

Result file:

`docs/roadmap/PR475A_SIGNED_IN_SEMINAR_INTEREST_TOGGLE_REHEARSAL_RESULT.md`

Verdict:

```text
PRODUCT_DEFECT_NEEDS_DAEDALUS
```

Hosted web/API were ready at `46a2a08d`, but public
`GET /events/seminars` returned HTTP `503` with bounded
`live_events_unavailable` copy. The hosted `/events/seminars` page rendered the
unavailable state on desktop and 390px mobile, with no public seminar cards.

The signed-in mark/withdraw flow was not run because the public readback never
became available. No interest mutation was attempted, so no extra interest row
was left behind.

## Required Checks

Run against hosted Railway using the human/browser route view.

1. Freshness:
   - hosted web/API health are ready at `46a2a08d` or later, or at the
     deploy-equivalent app commit if later commits are docs/state only;
   - `/events/seminars` visibly includes the PR475A interest readback.
2. Signed-out public readback:
   - check `/events/seminars` on desktop and 390px mobile;
   - confirm public seminar cards still render and remain routeable;
   - confirm signed-out users see aggregate interest count and sign-in prompt
     only, with no `viewerInterested` state or attendee identities;
   - confirm copy does not imply tickets, RSVP/booking, payment, reminder,
     waitlist, calendar, livestream, media room, attendance guarantee, or
     event-host management.
3. Signed-in interest flow:
   - use an existing safe signed-in owner/test session;
   - open `/events/seminars` on desktop and 390px mobile;
   - mark interest on one public card;
   - confirm the viewer-local state changes only for the signed-in viewer and
     the public aggregate count updates;
   - withdraw interest on the same public card;
   - confirm the viewer-local state clears and the aggregate count decreases
     or returns to its previous value;
   - do not leave an intentional extra interest row behind.
4. Privacy and safety:
   - sampled UI/API text must not expose attendee lists, user ids, emails,
     avatars, raw source ids, cookies, auth headers, IPs, user agents, payment
     identifiers, table names, SQL, stack traces, provider payloads, secrets,
     owner-private controls, or private source content;
   - exact low aggregate counts are allowed by the accepted product shape.
5. Visual fit:
   - no horizontal overflow at 390px mobile;
   - no clipped controls, unreadable labels, overlapping text, or broken tap
     targets on card actions or the interest toggle.

## Out Of Scope

Do not test or open tickets, payments, Stripe, Billing, Checkout, Portal,
reminders, calendar integrations, livestream/media rooms, recordings,
transcripts, attendee lists, event-host management, admin curation UI, provider
calls, queues/workers, Redis, Cloudflare, hosted runtime expansion, SQL, logs,
or config.

Do not create new seminar content or Developer Spaces for this rehearsal.

## Verdicts

Return one of:

```text
PASS_READY_TO_CLOSE
PRODUCT_DEFECT_NEEDS_DAEDALUS
DEPLOYMENT_WAITING
PRIVACY_BOUNDARY_FAIL
```

Use `PASS_READY_TO_CLOSE` if hosted signed-out and signed-in checks pass,
including one mark/withdraw flow.

Use `PRODUCT_DEFECT_NEEDS_DAEDALUS` for concrete defects such as stale deploy,
missing interest controls, broken mark/withdraw, misleading RSVP/ticket/reminder
copy, aggregate state not updating, mobile fit breakage, or routeability loss.

Use `PRIVACY_BOUNDARY_FAIL` if any attendee identities, raw source ids, private
data, credentials, payment identifiers, SQL/table output, stack traces, or
forbidden adjacent feature claims appear.

## Wakeup Template

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE completed the PR475A hosted seminar interest rehearsal.
Verdict:
- PASS_READY_TO_CLOSE | PRODUCT_DEFECT_NEEDS_DAEDALUS | DEPLOYMENT_WAITING | PRIVACY_BOUNDARY_FAIL
Task:
- Close PR475A, wait for deploy, or route the smallest repair.
```
