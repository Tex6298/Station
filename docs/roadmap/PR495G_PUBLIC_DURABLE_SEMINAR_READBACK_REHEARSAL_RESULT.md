# PR495G - Public Durable Seminar Readback Hosted Rehearsal Result

Date: 2026-07-06

Owner: ARIADNE / A4

State: PASS_READY_FOR_PR495G_CLOSEOUT

Return value:

```text
PASS_READY_FOR_PR495G_CLOSEOUT
```

## Scope

ARIADNE ran the hosted PR495G rehearsal requested in:

`docs/roadmap/PR495G_PUBLIC_DURABLE_SEMINAR_READBACK_REHEARSAL_ARIADNE.md`

Targets:

- `https://stationweb-production.up.railway.app`
- `https://stationapi-production.up.railway.app`

The proof covered public durable seminar readback, durable-only append,
durable replacement of a source-derived document card, durable digest interest
mark/duplicate/withdraw/repeated withdraw, signed-out denial, rollback/stale
disappearance with `seminar_not_found`, source-derived aggregate interest,
privacy/no-leak boundaries, product-scope drift, and desktop/`375px`/`390px`
fit.

## Hosted Freshness

Hosted web and API health both reported the accepted PR495G code commit:

```text
018edcaf
```

ARGUS review commit:

```text
9c090d51
```

The ARGUS review/routing commits after `018edcaf` are docs/state-only, so
Railway correctly skipped a new deploy with no watched-file changes. The
hosted code under rehearsal is the accepted PR495G implementation.

The replay owner authenticated successfully and had creator-or-above
entitlement.

## Public Baseline

Signed-out public API baseline:

- `GET /events/seminars?limit=24` returned HTTP `200`;
- response source was `discover_feed_featured_and_durable_records`;
- three public seminar cards were present before durable setup;
- the baseline contained one Space card, one thread/discussion card, and one
  source-derived document card;
- no `sourceId`, `source_id`, owner id field, record id field, storage detail,
  provider payload, stack trace, token, cookie, header, or secret-shaped value
  appeared in the public response.

## Owner Setup

Hosted owner data was sufficient for both required durable-card scenarios:

- four public-document candidates were available from owner `/studio/publishing`
  readiness data;
- two owner seminar records already existed;
- one candidate matched the current source-derived public document card and was
  used for durable replacement proof;
- one candidate was absent from the current public card set and was used for
  durable-only proof.

ARIADNE used the accepted owner record API/transition path to prepare records as
needed, then restored them to non-public states after proof.

Owner browser proof:

- authenticated owner entered through `/studio -> /studio/publishing`;
- the page rendered the Publishing Dashboard and Seminar readiness panel;
- desktop layout had no horizontal overflow;
- owner controls remained bounded to the accepted readiness/publish vocabulary
  (`Create seminar draft`, `Mark ready for review`, `Publish record`,
  `Return to draft`);
- no scheduling, hosting, RSVP, tickets, payments, reminders, attendance,
  rooms, media, recordings, transcripts, provider runtime, Redis, Cloudflare,
  billing, launch-ready claim, or delivery guarantee appeared.

## Durable Readback Proof

Durable replacement:

- publishing the matching candidate produced public digest card
  `seminar_18b38da421bf0c58`;
- the durable card replaced the prior source-derived document card for the same
  public document href;
- only one public card remained for that href;
- the thread and Space cards kept their source-derived order;
- the durable card label was `Public seminar`.

Durable-only append:

- publishing the non-featured candidate produced public digest card
  `seminar_d22973dcc1991bc2`;
- that href was absent from the public card set before publish;
- the durable card appeared publicly after publish with bounded title/summary,
  public document href, public discussion href, and `Public seminar` label;
- no raw durable record id or owner/source internals appeared.

## Durable Interest Proof

The durable-only digest card was used for signed-in interest mutation:

- signed-out `POST /events/seminars/:digest/interest` returned `401`;
- signed-in mark returned HTTP `200`, the same public digest card id,
  viewer-local `viewerInterested: true`, and aggregate count `1`;
- duplicate mark returned HTTP `200` and kept the same aggregate count;
- withdraw returned HTTP `200` and cleared viewer-local interest;
- repeated withdraw returned HTTP `200` and kept the baseline aggregate count;
- public responses and mutation responses exposed only aggregate/viewer-local
  state, not attendee identities, user ids, owner ids, source id fields, durable
  record ids, or storage details.

## Rollback And Stale Digest Proof

The durable-only record was rolled back through the accepted owner transition
API:

- rollback returned `ready` + `private`;
- public `/events/seminars` no longer returned digest
  `seminar_d22973dcc1991bc2`;
- signed-in mark against the stale digest returned HTTP `404` with
  `seminar_not_found`;
- signed-in withdraw against the stale digest returned HTTP `404` with
  `seminar_not_found`;
- no durable-record interest write was visible through public readback or
  mutation response behavior.

## Browser Fit And Copy

Hosted Chrome/CDP screenshots were captured for:

- owner desktop `/studio -> /studio/publishing`;
- signed-out public `/events/seminars` desktop;
- signed-out public `/events/seminars` at `375px`;
- signed-out public `/events/seminars` at `390px`;
- signed-in public `/events/seminars` at `390px`.

Browser proof:

- signed-out desktop/`375px`/`390px` all rendered three public cards with
  sign-in interest prompts and no mutation buttons;
- signed-in `390px` rendered viewer-local interest controls;
- all checked viewports had no horizontal overflow, clipped labels, broken tap
  targets, or incoherent overlap;
- public copy stayed in readback/interest language;
- safety copy remained negative-boundary copy (`not a ticket`, not a booking,
  waitlist, reminder, payment, or attendance guarantee), not a launch claim.

## Drift Check

No broad UI or product drift was observed:

- no public detail page, scheduling, hosting, RSVP, tickets, payments,
  reminders, attendance, live rooms, media, recordings, transcripts, provider
  runtime, Redis, Cloudflare, billing, or launch-ready claim entered the public
  surface;
- no Discover/search/forum/billing/Studio shell drift appeared;
- no Discern global CSS import or placeholder control appeared;
- Station public readback, owner readiness, and signed-in interest remained
  structurally separate.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| Hosted Chrome/CDP rehearsal | Pass | Proved hosted web/API freshness at accepted code commit `018edcaf`, replay-owner auth, owner `/studio -> /studio/publishing`, durable-only public readback, durable replacement, durable digest interest mark/duplicate/withdraw/repeated withdraw, signed-out denial, rollback/stale disappearance with `seminar_not_found`, aggregate/viewer-local interest only, no private/raw/secret/runtime/scope leak, no launch/scheduling/hosting/payment claims, and desktop/`375px`/`390px` fit. |
| Temporary rehearsal harness syntax check | Pass | Node syntax check passed before execution. |
| `git diff --check` | Pass | No whitespace errors; Git reported CRLF normalization warnings only. |
| `git diff --cached --check` | Pass | No whitespace errors; Git reported CRLF normalization warnings only. |

## Verdict

PR495G is ready for MIMIR closeout.
