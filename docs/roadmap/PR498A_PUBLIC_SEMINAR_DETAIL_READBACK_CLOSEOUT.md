# PR498A - Public Seminar Detail Readback Closeout

Owner: MIMIR / A1

Date: 2026-07-06

Status: Closed

## Decision

MIMIR closes PR498A as accepted.

The lane completed through ARGUS preflight, DAEDALUS implementation, ARGUS
review with one narrow Space-link helper patch, and ARIADNE hosted proof.

## Accepted Product Truth

Station now has a bounded public seminar detail/readback surface:

- `GET /events/seminars/:seminarId` reads one already-eligible public seminar
  card by digest-shaped route id;
- malformed and stale valid-shaped ids return bounded `404 seminar_not_found`;
- public list cards with valid digest ids route to
  `/events/seminars/:seminarId`;
- detail readback uses `PublicSeminarDetailResponse` with a public
  `PublicSeminarCard` and `generatedAt`;
- source, Space, and discussion links remain sanitized and separately labeled;
- interest behavior remains aggregate and viewer-local only.

## Hosted Proof

ARIADNE completed hosted proof:

`docs/roadmap/PR498A_PUBLIC_SEMINAR_DETAIL_READBACK_REHEARSAL_RESULT.md`

Verdict:

```text
PASS_PR498A_HOSTED_PUBLIC_SEMINAR_DETAIL_CLOSEOUT
```

Accepted evidence:

- hosted web/API were fresh at accepted commit `e417d4af`;
- `GET /events/seminars?limit=20` returned `200` with three public cards;
- source-derived Space, thread, and document cards were present;
- a source-derived document detail route returned `200`;
- malformed and stale valid-shaped detail ids returned bounded
  `seminar_not_found`;
- signed-out interest mutation returned `401`;
- signed-in interest mark, duplicate mark, withdraw, and repeated withdraw
  preserved aggregate counts and viewer-local state;
- desktop, `375px`, and `390px` list/detail views passed fit and visible
  privacy/product-boundary scans.

## Fixture Caveat

Hosted did not currently expose a durable `Public seminar` card in the public
seminar list. ARIADNE correctly recorded this as:

```text
fixture_caveat_no_durable_public_card_in_hosted_list
```

This does not block PR498A closeout because the rehearsal instructions allowed
fixture caveats and prohibited creating hosted data outside the rehearsal scope.

## Boundaries Kept

PR498A does not add or claim live rooms, hosting, scheduling expansion, RSVP,
attendance, tickets, payments, Stripe, billing, reminders, calendars, email,
provider/runtime calls, voice/avatar, transcripts/media/recordings, Redis,
Cloudflare, workers, queues, new public mutations beyond accepted interest,
schema/RLS migration, private owner data, launch readiness, delivery
guarantees, or broad `/events` redesign.

Visible UI and API JSON did not expose owner ids, raw durable ids, source id
fields, private/source bodies, storage paths, provider payloads, cookies,
tokens, stack traces, SQL/table details, or secret-shaped values.

## Next Lane

MIMIR opens:

`docs/roadmap/PR499_PUBLIC_SEMINAR_SCHEDULE_METADATA_PREFLIGHT_ARGUS.md`

Rationale: PR498A proves routeable public list/detail/readback and interest.
The next named Phase 3 seminar capability in the product docs is scheduled
public events. PR499 is only an ARGUS preflight for schedule metadata and
calendar/readback shape; it is not RSVP, tickets, reminders, live rooms,
streaming, provider/runtime, or payment work.
