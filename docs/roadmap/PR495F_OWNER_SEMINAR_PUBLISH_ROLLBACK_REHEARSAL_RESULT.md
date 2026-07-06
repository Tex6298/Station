# PR495F - Owner Seminar Publish/Rollback Hosted Rehearsal Result

Date: 2026-07-06

Owner: ARIADNE / A4

State: PASS_READY_FOR_PR495F_CLOSEOUT

Return value:

```text
PASS_READY_FOR_PR495F_CLOSEOUT
```

## Scope

ARIADNE ran the hosted PR495F rehearsal requested in:

`docs/roadmap/PR495F_OWNER_SEMINAR_PUBLISH_ROLLBACK_REHEARSAL_ARIADNE.md`

Targets:

- `https://stationweb-production.up.railway.app`
- `https://stationapi-production.up.railway.app`

The proof covered owner `/studio/publishing` publish/rollback behavior,
duplicate publish stability, duplicate rollback stability, creator/signed-out
gates, public `/events/seminars`, interest mark/withdraw no-drift, no durable
public card drift, privacy/no-leak boundaries, mobile fit, and product-scope
drift.

## Hosted Freshness

Hosted web and API health both reported code at or after:

```text
b991662c
```

The replay owner authenticated successfully and had creator-or-above
entitlement for the accepted owner publish/rollback gate.

## Owner Publish/Rollback Proof

ARIADNE entered the owner surface through the human Studio flow:

```text
/studio -> /studio/publishing
```

Validated on:

- desktop `1280px`;
- mobile `375px`;
- mobile `390px`.

Initial hosted owner readback:

- four ready public-document candidates;
- two private draft records;
- zero ready records;
- zero published records;
- two enabled `Create seminar draft` actions;
- two enabled `Mark ready for review` actions.

The hosted owner had draft records but no ready/published record at the start
of the run. ARIADNE used the already-accepted owner `Mark ready for review`
control as visible setup, then exercised the PR495F publish/rollback gate on
that same record.

Desktop publish/rollback proof:

- setup moved one private draft to private ready state;
- ready state showed `Ready for review`, `Public listing is not live.`,
  `Publish record`, and `Return to draft`;
- clicked one real `Publish record` action;
- the transition called the accepted owner transition API with the published
  target;
- the row changed to `Public record` with
  `Public listing pending readback wiring.`;
- the published state exposed `Return to ready`;
- the owner record became `published` + `public`;
- public card ids stayed unchanged while the owner record was public-eligible;
- duplicate publish retry stayed stable and did not create duplicate visible
  rows, actions, or user-facing errors;
- clicked `Return to ready`;
- the same record returned to `ready` + `private`;
- duplicate rollback retry stayed stable;
- refresh kept four visible candidate rows with no duplicate ready/published
  row.

Mobile proof after rollback:

- `375px` and `390px` both showed four candidate rows;
- both mobile widths showed one private ready readback, one `Publish record`
  action, one `Return to draft` action, one remaining `Mark ready for review`
  action, and two `Create seminar draft` actions;
- panel controls wrapped cleanly without horizontal clipping or panel overflow.

Visible owner copy stayed in owner publishing-boundary language. It said the
public listing was not live or pending readback wiring, and did not claim live
public durable readback, hosting, scheduling, RSVP, tickets, payments,
reminders, rooms, media, recordings, transcripts, providers, queues, Redis,
Cloudflare, billing, runtime readiness, or launch readiness.

## Creator And Signed-Out Gates

Non-creator proof:

- a private-tier replay fixture could reach `/studio/publishing`;
- direct owner publish transition API attempt returned `403`;
- no enabled `Publish record` or `Return to ready` action appeared.

Signed-out proof:

- signed-out owner publish transition API attempt returned `401`;
- signed-out `/studio/publishing` redirected to the existing login flow with
  the publishing target preserved;
- the protected route did not leak owner Seminar readiness, public-record
  readback, or publish/rollback actions.

## Public Seminars And Interest No-Drift

Public API/UI proof:

- public seminar API returned three public cards;
- public card ids stayed unchanged before publish, while the durable owner
  record was `published` + `public`, after duplicate publish, after rollback,
  and after duplicate rollback;
- no durable seminar record appeared as a public card;
- signed-in interest mark and withdraw both passed;
- signed-out public `/events/seminars` loaded as the accepted public readback
  surface on desktop, `375px`, and `390px`;
- signed-out public view rendered no interest mutation buttons;
- signed-in desktop preserved viewer-local interest controls;
- public view did not expose private ready records, published eligibility
  internals, owner publishing state, owner Seminar readiness, transition
  actions, tokens, cookies, headers, provider payloads, SQL, stack traces,
  storage paths, or secret-shaped values.

## Drift Check

No broad UI or product drift was observed:

- no Discover, public search, Forum moderation, billing, schema/RLS,
  provider-runtime, queue/worker, Redis, Cloudflare, schedule, host, RSVP,
  ticket, payment, reminder, live-room, media, transcript, durable public
  readback wiring, durable-record interest key, or launch scope entered the
  hosted surface;
- no broad Studio shell/sidebar/topbar replacement appeared;
- no Discern global CSS import or placeholder control appeared.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| Hosted Chrome/CDP rehearsal | Pass | Proved web/API freshness, replay-owner auth, `/studio` to `/studio/publishing` clickthrough, owner ready setup, publish, duplicate publish, rollback, duplicate rollback, refresh stability, 375px/390px mobile fit, non-creator API denial, signed-out API/UI protection, public seminars no-drift, signed-in interest mark/withdraw, no durable public card drift, privacy boundaries, and no product drift. |
| `git diff --check` | Pass | No whitespace errors. |
| `git diff --cached --check` | Pass | No whitespace errors. |

## Verdict

PR495F is ready for MIMIR closeout.
