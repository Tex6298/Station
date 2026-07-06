# PR495D - Owner Ready Gate Hosted Rehearsal Result

Date: 2026-07-06

Owner: ARIADNE / A4

State: PASS_READY_FOR_PR495D_CLOSEOUT

Return value:

```text
PASS_READY_FOR_PR495D_CLOSEOUT
```

## Scope

ARIADNE ran the hosted PR495D rehearsal requested in:

`docs/roadmap/PR495D_OWNER_READY_GATE_REHEARSAL_ARIADNE.md`

Targets:

- `https://stationweb-production.up.railway.app`
- `https://stationapi-production.up.railway.app`

The proof covered owner `/studio/publishing` private ready/return-to-draft
behavior, duplicate stability, creator/signed-out gates, public
`/events/seminars`, interest mark/withdraw no-drift, no durable-record public
card drift, privacy/no-leak boundaries, mobile fit, and product-scope drift.

## Hosted Freshness

Hosted web and API health both reported code at or after:

```text
06441fb8
```

The replay owner authenticated successfully and had creator-or-above
entitlement for the accepted private owner ready gate.

## Owner Ready Gate Proof

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
- two private draft records;
- zero ready records;
- two enabled `Create seminar draft` actions;
- two enabled `Mark ready for review` actions.

Desktop ready/return proof:

- clicked one real `Mark ready for review` action;
- the transition called the accepted owner transition API;
- the row changed to bounded private ready readback;
- ready state showed `Ready for review`, `Public listing is not live.`, and
  `Return to draft`;
- `visibility` remained private;
- public card ids stayed unchanged while the private record was ready;
- duplicate ready transition stayed stable and did not create duplicate visible
  rows or actions;
- clicked `Return to draft`;
- the same row returned to stable private draft state with
  `Mark ready for review`;
- refresh kept four visible candidate rows with no duplicate ready/draft row;
- public card ids remained unchanged after the return-to-draft state.

Mobile proof:

- `375px` and `390px` both showed four candidate rows;
- both mobile widths showed two enabled `Create seminar draft` actions and two
  enabled `Mark ready for review` actions after the record returned to draft;
- panel controls wrapped cleanly without horizontal clipping or panel overflow.

The visible owner copy stayed in private draft/readiness language. It did not
claim public listing, public publishing, scheduling, hosting, RSVP, tickets,
payments, reminders, live rooms, media, recordings, transcripts, providers,
queues, Redis, Cloudflare, billing, runtime readiness, or launch readiness.

## Creator And Signed-Out Gates

Non-creator proof:

- a private-tier replay fixture could reach `/studio/publishing`;
- direct owner transition API attempt returned `403`;
- no enabled `Mark ready for review` or `Return to draft` action appeared.

Signed-out proof:

- signed-out owner transition API attempt returned `401`;
- signed-out `/studio/publishing` redirected to the existing login flow with
  the publishing target preserved;
- the protected route did not leak owner Seminar readiness, ready readback, or
  transition actions.

## Public Seminars And Interest No-Drift

Public API/UI proof:

- public seminar API returned three public cards;
- public card ids stayed unchanged before ready, while ready, after duplicate
  ready, and after return to draft;
- no durable seminar record appeared as a public card;
- signed-in interest mark and withdraw both passed;
- signed-out public `/events/seminars` loaded as the accepted public readback
  surface on desktop, `375px`, and `390px`;
- signed-out public view rendered no interest mutation buttons;
- signed-in desktop preserved viewer-local interest controls;
- public view did not expose owner draft records, ready records, owner
  publishing state, owner Seminar readiness, transition actions, tokens,
  cookies, headers, provider payloads, SQL, stack traces, storage paths, or
  secret-shaped values.

## Drift Check

No broad UI or product drift was observed:

- no Discover, public search, Forum moderation, billing, schema/RLS,
  provider-runtime, queue/worker, Redis, Cloudflare, schedule, host, publish,
  RSVP, ticket, payment, reminder, live-room, media, transcript, durable public
  card, durable-record interest key, or launch scope entered the hosted surface;
- no broad Studio shell/sidebar/topbar replacement appeared;
- no Discern global CSS import or placeholder control appeared.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| Hosted Chrome/CDP rehearsal | Pass | Proved web/API freshness, replay-owner auth, `/studio` to `/studio/publishing` clickthrough, desktop ready/return-to-draft, duplicate ready stability, refresh stability, 375px/390px mobile fit, non-creator API denial, signed-out API/UI protection, public seminars no-drift, signed-in interest mark/withdraw, no durable public card drift, privacy boundaries, and no product drift. |
| `git diff --check` | Pass | No whitespace errors. |
| `git diff --cached --check` | Pass | No whitespace errors. |

## Verdict

PR495D is ready for MIMIR closeout.
