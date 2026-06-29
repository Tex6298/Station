# PR469B - Public Seminar Populated Browser Rehearsal

Owner: ARIADNE / A4

Opened by: MIMIR / A1

Date opened: 2026-06-29

Status: Open - hosted populated-card browser rerun

## Why This Rerun

ARGUS accepted PR469B:

`docs/roadmap/PR469B_PUBLIC_SEMINAR_POPULATED_REPLAY_SEED_REVIEW_RESULT.md`

The hosted API now returns three opaque-id public seminar cards after the
staging replay seed. PR469A already passed hosted empty-state browser proof, but
the visible populated-card layout has not been checked on hosted desktop/mobile.

This rerun is the final visual proof before MIMIR closes PR469A/PR469B.

## Required Checks

Run against hosted Railway.

1. Freshness:
   - hosted web/API health are ready at `8b05122e` or later;
   - the hosted API is using the seeded state where `GET /events/seminars`
     returns at least one card.
2. Signed-out API:
   - `GET /events/seminars` returns HTTP 200;
   - `cards.length >= 1`;
   - card ids are `seminar_<digest>` opaque ids;
   - card hrefs and discussion hrefs are public `/space/` or `/forums/` paths.
3. Signed-out web:
   - `/events/seminars` loads on desktop and 390px mobile;
   - at least one populated seminar/readback card is visible;
   - card actions route only to public-safe pages;
   - populated cards fit without clipped controls, horizontal overflow,
     unreadable labels, or broken hover/tap states.
4. Claim boundary:
   - page/card copy reads as public seminar/readback bundles only;
   - no live-room, livestream, attendance, RSVP, ticket, payment, recording,
     transcript, provider-call, private memory, or owner-runtime claim appears.
5. Safety scan:
   - no private Memory, Archive, Canon, Continuity, Integrity, owner setup,
     provider settings, private document text, private archive source text,
     credential, stack trace, storage path, raw internal id, raw SQL/table name,
     visitor identity, or secret-shaped material appears in the public UI/API.

## Out Of Scope

Do not request implementation beyond a smallest PR469B repair if this fails.
Do not open realtime rooms, media, attendance, RSVP, tickets, payments, Stripe,
provider, Redis, Cloudflare, worker, queue, admin curation UI, or broad UI
redesign scope.

## Verdicts

Return one of:

```text
PASS
PRODUCT_DEFECT_NEEDS_DAEDALUS
DEPLOYMENT_WAITING
PRIVACY_BOUNDARY_FAIL
```

If `PASS`, wake MIMIR for PR469A/PR469B closeout.

If `PRODUCT_DEFECT_NEEDS_DAEDALUS`, name the smallest visible-card repair.

If `DEPLOYMENT_WAITING`, include the observed deployed commit/status and wake
MIMIR to wait/recheck.

If `PRIVACY_BOUNDARY_FAIL`, include exact visible evidence and wake MIMIR.

## Wakeup Template

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE completed PR469B hosted populated seminar browser rehearsal.
Verdict:
- PASS | PRODUCT_DEFECT_NEEDS_DAEDALUS | DEPLOYMENT_WAITING | PRIVACY_BOUNDARY_FAIL
Task:
- Close PR469A/PR469B or route the smallest repair.
```
