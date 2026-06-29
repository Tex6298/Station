# PR469A - Public Seminar Readback Bundles Hosted Rehearsal

Owner: ARIADNE / A4

Opened by: MIMIR / A1

Date opened: 2026-06-29

Status: Open - hosted rehearsal

## Why This Rehearsal

ARGUS accepted PR469A after two narrow review patches:

`docs/roadmap/PR469A_PUBLIC_SEMINAR_READBACK_BUNDLES_REVIEW_RESULT.md`

PR469A is the first Live Events / Seminars product slice. Because it is a new
customer-facing public surface, MIMIR is routing it through hosted human-eye
confirmation before closeout.

## Scope To Prove

Confirm the hosted public readback surface:

- API: `GET /events/seminars`
- Web: `/events/seminars`

The page should read as a public seminar/readback bundle surface, not a live
room or ticketing product.

## Required Checks

Run against the deployed Railway web/API once the deployment reports the
PR469A accepted commit `8b05122e` or later.

1. Hosted freshness:
   - web `/health/deployment` is ready at `8b05122e` or later;
   - API `/health/deployment` is ready at `8b05122e` or later.
2. Signed-out public API:
   - `GET /events/seminars` returns HTTP 200 or a bounded
     `live_events_unavailable` response;
   - if cards are returned, ids are opaque `seminar_<digest>` values, not raw
     document, thread, Space, user, or table ids;
   - returned hrefs are routeable public hrefs only.
3. Signed-out public web:
   - `/events/seminars` loads on desktop and 390px mobile;
   - loading, empty, or populated states fit without clipped controls,
     horizontal overflow, or unreadable text;
   - copy stays readback-only and does not imply realtime rooms, livestreams,
     attendance, RSVP, tickets, payments, recordings, transcripts, provider
     calls, private memory, or owner-only runtime behavior.
4. Routeability:
   - every visible card action routes to public-safe pages only;
   - missing or empty data should show bounded public copy, not a broken
     staging demo.
5. Safety scan:
   - no private Memory, Archive, Canon, Continuity, Integrity, owner setup,
     provider settings, private document text, private archive source text,
     credential, stack trace, storage path, raw internal id, raw SQL/table name,
     visitor identity, or secret-shaped material appears in the public UI/API.

## Out Of Scope

Do not open or require:

- realtime rooms, chat, livestreaming, audio/video, avatars, recordings, or
  transcripts;
- attendance, RSVP, reminders, calendars, tickets, payments, Stripe, billing, or
  entitlement work;
- admin curation UI;
- provider calls, private runtime context, memory writeback, Redis, Cloudflare,
  queue, worker, migration, or hosted infrastructure changes;
- broad Discover/public UI redesign or public persona chat expansion.

## Verdicts

Return one of:

```text
PASS
PRODUCT_DEFECT_NEEDS_DAEDALUS
DEPLOYMENT_WAITING
PRIVACY_BOUNDARY_FAIL
```

If `PASS`, wake MIMIR for PR469A closeout and next-lane choice.

If `PRODUCT_DEFECT_NEEDS_DAEDALUS`, name the smallest PR469A repair.

If `DEPLOYMENT_WAITING`, include the observed deployed commit/status and wake
MIMIR to wait/recheck.

If `PRIVACY_BOUNDARY_FAIL`, include exact visible evidence and wake MIMIR.

## Wakeup Template

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE completed PR469A hosted public seminar readback rehearsal.
Verdict:
- PASS | PRODUCT_DEFECT_NEEDS_DAEDALUS | DEPLOYMENT_WAITING | PRIVACY_BOUNDARY_FAIL
Task:
- Close PR469A or route the smallest repair.
```
