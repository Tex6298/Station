# PR498 - Public Seminar Detail Readback Preflight

Owner: ARGUS / A3

Opened by: MIMIR / A1

Date opened: 2026-07-06

Status: Open

## Why This Lane

PR496A/B/C closed the owner workspace export package contract. PR497 already
closed the Discern companion-home translation requested by the repeated A1
wakeup.

The next feature-expansion lane should therefore move to a named Phase 3
customer-facing capability, not another open-ended hardening sweep. Product
docs name persona lecture/seminar hosting as Phase 3, and PR495A-G already
proved the narrow durable public seminar card/list/readback foundation.

The smallest useful next slice is a public seminar detail/readback preflight:
can Station expose a routeable, visitor-safe seminar detail page for an
already-public durable seminar card without claiming live hosting?

## ARGUS Task

Run hostile preflight for a possible PR498A DAEDALUS lane.

Decide whether the next implementation should be:

```text
ACCEPT_PR498A_PUBLIC_SEMINAR_DETAIL_READBACK
```

or blocked with the smallest concrete unblocker.

## Candidate Product Shape

If accepted, DAEDALUS should implement only a narrow public detail/readback
slice:

- routeable public seminar detail page for already-public eligible seminar
  cards from the accepted PR495G card contract;
- bounded public-safe serializer for detail copy;
- durable digest/card id routeability, never raw durable ids;
- source-derived and durable cards handled honestly;
- public list/card links route to the detail page where eligible;
- existing public seminar interest behavior remains aggregate/viewer-local;
- owner/private draft, ready, publish, rollback semantics remain unchanged;
- desktop and `375px`/`390px` hosted proof after ARGUS review.

## Explicit Non-Goals

Do not include:

- live session rooms;
- scheduling beyond already-stored public card fields;
- RSVP, attendance, tickets, payments, Stripe, billing, reminders, calendars, or
  email;
- host controls, moderator queue, audience question queue, transcripts, media,
  recordings, voice/avatar, provider/runtime calls, streaming, model changes, or
  prompt changes;
- new Redis, Cloudflare, worker, queue, cache, or realtime infrastructure;
- public write/mutation surfaces beyond already-accepted seminar interest;
- private owner draft/readback data, raw source bodies, raw ids, storage paths,
  credentials, provider payloads, stack traces, SQL/table detail, or
  secret-shaped values;
- broad `/events` redesign or launch/commercial copy.

## Evidence To Inspect

Read at minimum:

- `docs/product/Station_Document_1_Platform_Overview.md`
- `docs/product/Station_Document_3_Future_Vision.md`
- `docs/roadmap/PR495G_PUBLIC_DURABLE_SEMINAR_READBACK_CLOSEOUT.md`
- `docs/roadmap/PR495G_PUBLIC_DURABLE_SEMINAR_READBACK_REVIEW_RESULT.md`
- `docs/roadmap/PR495G_PUBLIC_DURABLE_SEMINAR_READBACK_REHEARSAL_RESULT.md`
- current `docs/roadmap/ACTIVE_STATUS.md`
- current seminar list/detail/API code and tests before recommending DAEDALUS.

## Acceptance Bar

ARGUS should answer:

- whether a detail page is the right next Phase 3 seminar slice;
- exact allowed files/surfaces for DAEDALUS;
- exact serializer/linking behavior required;
- exact forbidden private data and product claims;
- local validation required before review;
- hosted ARIADNE rehearsal requirements after review;
- whether any concrete blocker requires a smaller unblock lane first.

## Expected Validation If Accepted

Starting validation for DAEDALUS, adjusted by ARGUS after code inspection:

- focused seminar/public event API tests;
- focused public events/list/detail web tests;
- `npm exec --yes pnpm@10.32.1 -- run typecheck`;
- `npm exec --yes pnpm@10.32.1 -- run lint`;
- `git diff --check`;
- `git diff --cached --check`.

## Wakeup

ARGUS should wake MIMIR with one of:

```text
ACCEPT_PR498A_PUBLIC_SEMINAR_DETAIL_READBACK
BLOCKED_PR498_WITH_CONCRETE_UNBLOCKER
REJECT_PR498_CHOOSE_DIFFERENT_PHASE3_LANE
```
