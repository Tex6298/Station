# PR498A - Public Seminar Detail Readback Hosted Rehearsal Result

Owner: ARIADNE / A4

Date: 2026-07-06

Result:

```text
PASS_PR498A_HOSTED_PUBLIC_SEMINAR_DETAIL_CLOSEOUT
```

## Scope

MIMIR asked ARIADNE to prove hosted public seminar detail/readback behavior for
PR498A before closeout.

The rehearsal checked:

- hosted web/API freshness;
- public list/detail routeability;
- source-derived detail readback;
- durable coverage where hosted fixtures allow it;
- malformed/stale bounded failures;
- signed-out and signed-in viewer-local interest behavior;
- desktop, `375px`, and `390px` list/detail fit;
- visible UI and API JSON scans for privacy, scope, and forbidden live-hosting
  claims.

## Hosted Freshness

Hosted web and API health both reported ready at:

```text
web commit: e417d4af
api commit: e417d4af
```

This is the accepted PR498A review commit, so this is not a stale-deploy result.

## Routeability

Hosted public list/detail routeability passed:

| Check | Result |
| --- | --- |
| `GET /events/seminars?limit=20` | `200` |
| Hosted public cards | 3 |
| Hosted source types | Space, thread, document |
| Source-derived document detail | `200` |
| Detail response source | `public_seminar_detail` |
| Detail card match | Pass |

The public detail route used a digest-shaped seminar route id. The result docs
intentionally omit the concrete id.

## Durable Coverage

Hosted did not currently expose a durable `Public seminar` card in the public
seminar list. ARIADNE did not create hosted data outside the rehearsal scope.

Durable detail coverage is recorded as a fixture caveat:

```text
fixture_caveat_no_durable_public_card_in_hosted_list
```

This does not block the pass because the rehearsal instructions said to record
an unavailable fixture class rather than inventing data outside scope.

## Failure Boundaries

Bounded failure checks passed:

| Check | Result |
| --- | --- |
| Malformed detail id | `404 seminar_not_found` |
| Stale valid-shaped detail id | `404 seminar_not_found` |

The error bodies did not expose raw ids, owner/private data, source bodies,
stack traces, SQL/table details, provider/runtime details, or secret-shaped
values.

## Interest No-Drift

Signed-out reads remained public/read-only:

| Check | Result |
| --- | --- |
| Signed-out interest mutation | `401` |

Signed-in viewer-local interest behavior passed:

| Step | Result |
| --- | --- |
| Initial owner detail | `viewerInterested: false`, aggregate count `0` |
| Mark interest | `200`, owner `viewerInterested: true`, aggregate count `1` |
| Duplicate mark | `200`, aggregate count stayed `1` |
| Second replay identity read | `200`, aggregate count `1`, second viewer `viewerInterested: false` |
| Withdraw | `200`, owner `viewerInterested: false`, aggregate count `0` |
| Repeated withdraw | `200`, aggregate count stayed `0` |

The final owner state was restored to its initial state.

## Desktop And Mobile

ARIADNE captured hosted signed-out list/detail screenshots on desktop, `375px`,
and `390px`.

Result:

- list page rendered public seminar cards and sign-in interest copy;
- detail page rendered source, Space, and discussion links where safe;
- desktop, `375px`, and `390px` had no measured horizontal overflow;
- no clipped controls, incoherent overlap, or broken visible tap targets were
  found;
- visible copy remained public readback and aggregate/viewer-local interest
  copy.

## Privacy And Product Boundary

API and visible UI scans passed:

- no owner ids, raw durable ids, source id fields, private/source bodies,
  storage paths, provider payloads, cookies, tokens, stack traces, SQL/table
  details, or secret-shaped values;
- no visible raw UUIDs;
- no positive claims for live hosting, scheduling, RSVP, attendance, tickets,
  payments, reminders, calendars, streaming, transcripts, launch readiness, or
  delivery guarantees;
- interest copy stayed explicit that interest is not a ticket, booking,
  waitlist, reminder, payment, or attendance guarantee.

## Validation

| Check | Result | Notes |
| --- | --- | --- |
| Hosted API/browser proof | Pass | List/detail routeability, failure boundaries, interest mark/withdraw, and desktop/mobile proof passed. |
| Screenshot inspection | Pass | Desktop, `375px`, and `390px` list/detail views fit without visible privacy/scope drift. |
| API leak/scope scan | Pass | List/detail/error JSON stayed bounded. |
| Durable fixture coverage | Caveat | No durable `Public seminar` card was present in hosted list; no out-of-scope data creation was performed. |

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR

Summary:
- ARIADNE completed PR498A hosted public seminar detail proof.
- Hosted web/API were fresh at e417d4af.
- Public list/detail routeability passed with source-derived Space/thread/document cards and a document detail readback.
- Malformed and stale detail ids returned bounded 404 seminar_not_found.
- Signed-out reads stayed read-only; signed-in interest mark/duplicate/withdraw/repeated-withdraw preserved viewer-local state and aggregate counts.
- Desktop, 375px, and 390px list/detail views passed fit, privacy, and product-boundary scans.
- Durable public seminar detail coverage is a fixture caveat because hosted currently had no durable Public seminar card in the list.
Next:
- Close PR498A or proceed according to roadmap ownership.
```
