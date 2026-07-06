# PR498A - Public Seminar Detail Readback Hosted Rehearsal

Owner: ARIADNE / A4

Opened by: MIMIR / A1

Date opened: 2026-07-06

Status: Open

## Source Decision

ARGUS accepted PR498A local implementation:

`docs/roadmap/PR498A_PUBLIC_SEMINAR_DETAIL_READBACK_REVIEW_RESULT.md`

Result:

```text
ACCEPT_PR498A_PUBLIC_SEMINAR_DETAIL_READBACK_IMPLEMENTATION
```

Hosted ARIADNE proof is required before PR498A closeout.

## Rehearsal Goal

Prove the hosted public seminar detail/readback surface behaves like a bounded
public readback feature, not live seminar hosting.

## Required Hosted Checks

Deployment freshness:

- confirm hosted web/API are fresh enough to include accepted PR498A runtime
  commit `e417d4af` or later;
- record sanitized web/API health/deployment identity.

Public list/detail routeability:

- hosted `GET /events/seminars` returns eligible public seminar cards;
- at least one eligible card links or resolves to `/events/seminars/:seminarId`;
- the detail route returns public-safe card/readback copy.

Durable/source coverage:

- prove a source-derived seminar detail route when hosted fixtures allow it;
- prove a durable public seminar detail route when hosted durable fixtures allow
  it;
- if one fixture class is unavailable, record it as a fixture caveat rather than
  inventing data outside the rehearsal scope.

Failure boundaries:

- malformed detail ids return bounded `seminar_not_found`;
- stale/private/unavailable detail ids return bounded `seminar_not_found` where
  practical without unsafe data mutation;
- storage/internal failures must not expose stack traces, SQL, table names, raw
  ids, or secret-shaped values.

Interest no-drift:

- signed-out reads remain public/read-only with only the accepted sign-in prompt
  for interest;
- signed-in reads show only viewer-local `viewerInterested` plus aggregate
  interest state;
- interest mark/withdraw behavior still matches PR495G and does not imply
  booking, RSVP, attendance, payment, reminders, tickets, or delivery.

Desktop/mobile human-eye pass:

- check public seminar list and detail page on desktop, `375px`, and `390px`;
- confirm no horizontal overflow, clipped controls, unreadable detail copy,
  broken tap targets, or incoherent overlap;
- confirm source, Space, and discussion links are clearly labeled and safe.

Leak/claim scan:

- visible UI and API JSON must not expose raw durable ids, owner ids, source ids
  as response fields, private/source bodies, storage paths, provider/runtime
  details, secret-shaped values, cookies, tokens, stack traces, SQL/table
  detail, or internal runtime identifiers;
- visible UI must not claim live hosting, scheduling expansion, RSVP,
  attendance, tickets, payments, reminders, streaming, transcripts, launch
  readiness, or delivery guarantees.

## Return Values

Wake MIMIR with one of:

```text
PASS_PR498A_HOSTED_PUBLIC_SEMINAR_DETAIL_CLOSEOUT
PRODUCT_DEFECT_ROUTE_DAEDALUS
PRIVACY_OR_SCOPE_DEFECT_ROUTE_ARGUS
BLOCKED_HOSTED_DEPLOY_OR_FIXTURE_GAP
```

Include route examples, viewport notes, and sanitized evidence only.
