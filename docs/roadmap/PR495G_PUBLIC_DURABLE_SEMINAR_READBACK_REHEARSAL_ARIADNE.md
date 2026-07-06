# PR495G - Public Durable Seminar Readback Hosted Rehearsal

Date: 2026-07-06

Owner: ARIADNE / A4

State: OPEN_HOSTED_REHEARSAL

## Context

ARGUS accepted PR495G without a code patch:

`docs/roadmap/PR495G_PUBLIC_DURABLE_SEMINAR_READBACK_REVIEW_RESULT.md`

Implementation record:

`docs/roadmap/PR495G_PUBLIC_DURABLE_SEMINAR_READBACK_RESULT.md`

PR495G wires public durable seminar readback:

- public `GET /events/seminars` merges current discover-feed featured cards
  with eligible `published` + `public` durable seminar records;
- durable records resolve only through the PR495E safe serializer;
- durable document cards replace matching source-derived document cards by
  `document:<source id>`;
- durable-only cards append after source-derived cards and limit after merge;
- durable digest ids resolve for public interest mark/withdraw;
- interest rows still store only source-derived `source_type` and `source_id`,
  never durable record ids;
- the public response source is now
  `discover_feed_featured_and_durable_records`.

This remains readback and interest only. It is not scheduling, hosting, RSVP,
tickets, payments, reminders, attendance, rooms, media, transcripts, provider
runtime, queues, Redis, Cloudflare, billing, or launch readiness.

## Task

Run hosted rehearsal against:

`https://stationweb-production.up.railway.app`

Hosted API:

`https://stationapi-production.up.railway.app`

Use desktop plus mobile widths `375px` and `390px`.

Use the existing hosted replay owner account/session. If the owner route cannot
be reached because auth/session is unavailable, return `HOSTED_AUTH_BLOCKER`
with the exact blocker.

## Checks

1. Prove hosted web/API freshness at review commit `9c090d51` or later. If the
   hosted app has not deployed PR495G, return `DEPLOYMENT_WAIT` with the
   deployed commit shown by the app.

2. Capture signed-out public baseline:
   - `GET /events/seminars` returns `200`;
   - response source is `discover_feed_featured_and_durable_records`;
   - public web `/events/seminars` renders on desktop, `375px`, and `390px`;
   - no raw durable record ids, owner ids, raw source id fields, private source
     bodies, raw discussion ids, SQL/storage details, token/cookie/header
     values, provider/runtime payloads, stack traces, or secret-shaped values
     appear.

3. Ensure hosted data can exercise durable cards. Use already accepted owner
   `/studio -> /studio/publishing` actions as setup if needed:
   - create or use an owner seminar record;
   - mark ready if needed;
   - publish it so it becomes `published` + `public`;
   - record the visible/public durable digest card id.

   If hosted data cannot produce at least one eligible durable public card,
   return `HOSTED_DATA_NEEDS_DURABLE_PUBLIC_FIXTURE` with the observed bounded
   state. Do not fake a pass.

4. Prove durable-only public readback if hosted data allows:
   - publish a durable record whose source is not already visible as a
     source-derived public seminar card;
   - confirm the durable card appears publicly with bounded title/summary,
     routeable public href/discussion href, digest id, and mobile fit.

   If no non-featured candidate exists, return
   `HOSTED_DATA_NEEDS_DURABLE_ONLY_FIXTURE` with the observed bounded state.

5. Prove durable replacement of a source-derived document card if hosted data
   allows:
   - publish a durable record whose source document already has a source-derived
     public seminar card;
   - confirm the durable card replaces that document card while thread and
     Space cards remain stable;
   - confirm the public aggregate interest state remains attached to
     `document:<source id>`.

   If no matching featured-source candidate exists, return
   `HOSTED_DATA_NEEDS_DURABLE_REPLACEMENT_FIXTURE` with the observed bounded
   state.

6. Exercise durable digest interest as a signed-in user:
   - mark interest on a durable digest card;
   - duplicate mark is stable and does not create duplicate visible or stored
     interest;
   - withdraw interest;
   - repeated withdraw is stable;
   - aggregate and viewer-local state remain source-derived and do not reveal
     attendee identity.

7. Verify signed-out durable interest mutation remains blocked:
   - signed-out `POST /events/seminars/:durableDigest/interest` returns `401`
     or the accepted signed-out gate;
   - no owner/private data leaks.

8. Verify stale or rolled-back durable cards disappear:
   - capture the durable digest id;
   - roll the owner record back to ready/private through the accepted owner UI
     or API path;
   - confirm public `/events/seminars` no longer returns that durable digest;
   - confirm interest mark/withdraw by that durable digest returns the bounded
     `seminar_not_found` behavior and writes no durable-record interest row.

9. Verify public copy and product boundaries:
   - visible copy remains public readback/interest language;
   - no public detail page, scheduling, hosting, RSVP, tickets, payments,
     reminders, attendance, waitlists, live rooms, media, recordings,
     transcripts, provider runtime, Redis, Cloudflare, billing, launch-ready
     claim, or delivery guarantee appears;
   - no broad Discover/search/forum/billing/Studio shell drift appears;
   - no Discern global CSS import or placeholder control appears.

10. Verify desktop, `375px`, and `390px` fit:
    - no horizontal overflow;
    - no clipped labels, broken tap targets, or incoherent overlap;
    - interest controls remain legible and usable on mobile.

## Return Values

Return one of:

```text
PASS_READY_FOR_PR495G_CLOSEOUT
DEPLOYMENT_WAIT
HOSTED_AUTH_BLOCKER
HOSTED_DATA_NEEDS_DURABLE_PUBLIC_FIXTURE
HOSTED_DATA_NEEDS_DURABLE_ONLY_FIXTURE
HOSTED_DATA_NEEDS_DURABLE_REPLACEMENT_FIXTURE
DURABLE_PUBLIC_READBACK_DEFECT
DURABLE_REPLACEMENT_DEFECT
DURABLE_INTEREST_DEFECT
SIGNED_OUT_PROTECTION_DEFECT
STALE_DURABLE_CARD_DEFECT
MOBILE_FIT_DEFECT
PRIVACY_LEAK_DEFECT
PRODUCT_DRIFT_DEFECT
PRODUCT_DEFECT
```

Wake MIMIR with the return value and the concrete proof or blocker.

## Wakeup

```text
WAKEUP A4:
Codename: ARIADNE

Summary:
- ARGUS accepted PR495G public durable seminar readback.
- Public /events/seminars now merges eligible published/public durable records with discover-feed cards, and durable digest ids resolve for interest mark/withdraw.
- Interest rows must remain source-derived; no durable record ids, owner ids, schema/RLS/runtime/Redis/Cloudflare/billing/launch scope, or scheduling/hosting/payment claims are allowed.
Task:
- Run hosted desktop/375px/390px rehearsal using this document.
- Wake MIMIR with PASS_READY_FOR_PR495G_CLOSEOUT or the concrete blocker/defect.
```
