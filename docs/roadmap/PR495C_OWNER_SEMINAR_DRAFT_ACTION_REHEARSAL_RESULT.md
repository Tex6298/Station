# PR495C - Owner Seminar Draft Action Hosted Rehearsal Result

Date: 2026-07-06

Owner: ARIADNE / A4

State: PASS_READY_FOR_PR495C_CLOSEOUT

Return value:

```text
PASS_READY_FOR_PR495C_CLOSEOUT
```

## Scope

ARIADNE ran the hosted PR495C rehearsal requested in:

`docs/roadmap/PR495C_OWNER_SEMINAR_DRAFT_ACTION_REHEARSAL_ARIADNE.md`

Targets:

- `https://stationweb-production.up.railway.app`
- `https://stationapi-production.up.railway.app`

The proof covered owner `/studio/publishing` Seminar draft action/readback,
duplicate stability, creator/signed-out gates, public `/events/seminars`,
interest mark/withdraw no-drift, privacy/no-leak boundaries, mobile fit, and
product-scope drift.

## Hosted Freshness

Hosted web and API health both reported code at or after:

```text
6ca19c88
```

The replay owner authenticated successfully and had creator-or-above
entitlement for the accepted owner draft action.

## Owner Draft Action Proof

ARIADNE entered the owner surface through the human Studio flow:

```text
/studio -> /studio/publishing
```

Validated on:

- desktop `1280px`;
- mobile `375px`;
- mobile `390px`.

Initial owner readback:

- four ready public-document candidates;
- one existing private draft readback;
- three enabled `Create seminar draft` actions.

Desktop create/readback proof:

- clicked one real `Create seminar draft` action from the Seminar readiness
  panel;
- the action called the accepted owner records API and returned successfully;
- the row swapped to bounded `Private draft saved` readback;
- visible state became two private drafts and two remaining create actions;
- duplicate restore through the owner records API stayed idempotent;
- refreshing `/studio/publishing` kept four candidate rows and did not create a
  duplicate visible draft row.

Mobile readback after create:

- `375px` and `390px` both showed four candidate rows;
- both mobile widths showed two private draft readbacks and two remaining
  create actions;
- panel controls wrapped cleanly without horizontal clipping or panel overflow.

The visible owner copy stayed in draft/private-draft vocabulary. It did not
claim scheduling, hosting, public publishing, RSVP, tickets, payments,
reminders, live rooms, media, recordings, transcripts, providers, queues,
Redis, Cloudflare, billing, runtime readiness, or launch readiness.

## Creator And Signed-Out Gates

Non-creator proof:

- a private-tier replay fixture could reach `/studio/publishing`;
- its owner data had no seminar-ready candidates and no enabled draft action;
- a direct owner records API create attempt returned `403`;
- no broken create affordance appeared.

Signed-out proof:

- signed-out `/studio/publishing` redirected to the existing login flow with
  the publishing target preserved;
- the protected route did not leak owner Seminar readiness or draft actions.

## Public Seminars And Interest No-Drift

Public API/UI proof:

- public seminar API returned three public cards;
- signed-in interest mark and withdraw both passed;
- signed-out public `/events/seminars` loaded as the accepted public readback
  surface on desktop, `375px`, and `390px`;
- signed-out public view rendered no interest mutation buttons;
- signed-in desktop preserved viewer-local interest controls;
- interest copy remained honest that interest is not ticketing, booking,
  waitlisting, reminders, payment, attendance, or a delivery guarantee;
- public view did not expose owner draft records, owner Seminar readiness,
  private draft readback, owner-only data, tokens, cookies, headers, provider
  payloads, SQL, stack traces, storage paths, or secret-shaped values.

## Drift Check

No broad UI or product drift was observed:

- no Discover, public search, Forum moderation, billing, API/schema,
  provider-runtime, queue/worker, Redis, Cloudflare, schedule, host, publish,
  RSVP, ticket, payment, reminder, live-room, media, transcript, or launch scope
  entered the hosted surface;
- no broad Studio shell/sidebar/topbar replacement appeared;
- no Discern global CSS import or placeholder control appeared.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| Hosted Chrome/CDP rehearsal | Pass | Proved web/API freshness, replay-owner auth, `/studio` to `/studio/publishing` clickthrough, desktop create/readback, duplicate stability, refresh stability, 375px/390px mobile fit, non-creator API denial, signed-out protection, public seminars no-drift, signed-in interest mark/withdraw, privacy boundaries, and no product drift. |
| `git diff --check` | Pass | No whitespace errors. |
| `git diff --cached --check` | Pass | No whitespace errors. |

## Verdict

PR495C is ready for MIMIR closeout.
