# PR498A - Public Seminar Detail Readback Review Result

Owner: ARGUS / A3

Date: 2026-07-06

Result:

```text
ACCEPT_PR498A_PUBLIC_SEMINAR_DETAIL_READBACK_IMPLEMENTATION
```

## Decision

ARGUS accepts PR498A with one narrow review patch.

The implementation matches the accepted lane: it adds a routeable public
seminar detail/readback surface for cards already eligible for
`/events/seminars`. It does not add live rooms, scheduling expansion, RSVP,
tickets, payments, billing, provider/runtime calls, voice/avatar, transcripts,
media, recordings, queues, Redis, Cloudflare, migrations/RLS, owner publishing
expansion, public exports, private data, launch copy, or broad `/events`
redesign.

Hosted ARIADNE proof is required before closeout.

## ARGUS Patch

ARGUS tightened one helper boundary:

- `publicSeminarSpaceHref` now accepts only `/space/` hrefs.
- Focused web helper coverage now rejects `/forums/...` as a Space link.

This keeps source and discussion links on the existing `/space/` or `/forums/`
safe set, while ensuring the separately labeled Space link cannot drift into a
forum route.

## Review Notes

- `GET /events/seminars/:seminarId` is public read-only, uses optional auth
  only for viewer-local `viewerInterested`, and returns only
  `PublicSeminarDetailResponse` with `source: "public_seminar_detail"`, a
  public `PublicSeminarCard`, and `generatedAt`.
- Detail resolution reuses `resolvePublicSeminarTargetByCardId`, which requires
  `seminar_[a-f0-9]{16}` and resolves through the same eligible-card pipeline
  as the list route and interest mutations.
- Malformed, stale, private, owner-mismatched, missing, unsafe-space, and
  hidden/private discussion cases fail closed or omit unsafe links through the
  existing PR495G resolver/serializer path.
- Primary resolver storage failures return bounded
  `live_events_unavailable`; interest readback storage failures keep the
  pre-existing safe list behavior and degrade to public card readback without
  raw storage details.
- Durable cards remain routeable only by `durablePublicSeminarCardId(record.id)`.
  Interest rows remain keyed server-side by public source type/id, not durable
  record ids.
- Web list cards route valid digest ids to `/events/seminars/:seminarId` and
  keep source, Space, and discussion links sanitized.
- Visible copy remains readback/interest language and does not claim hosting,
  scheduling, RSVP, attendance, tickets, payments, reminders, streaming,
  transcripts, launch readiness, or delivery guarantees.

## Validation

ARGUS ran validation after the review patch:

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/live-events.test.ts apps/web/lib/live-events-route.test.ts apps/web/lib/auth-routes.test.ts` | Pass | 40 focused public seminar/auth route tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck passed. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass | Web lint passed with no warnings or errors. |
| `git diff --check` | Pass | CRLF normalization warnings only; no whitespace errors. |
| `git diff --cached --check` | Pass | No staged whitespace errors. |

## Hosted Proof Required

MIMIR should route ARIADNE for hosted proof covering:

- hosted `GET /events/seminars` and at least one detail route from an eligible
  card;
- a durable public seminar detail route when a hosted durable fixture is
  available;
- malformed/stale/private detail ids returning bounded `seminar_not_found`;
- signed-out public detail readback and signed-in viewer-local interest
  readback;
- interest mark/withdraw no-drift from PR495G;
- desktop, `375px`, and `390px` detail/list screenshots with no overflow,
  clipping, or incoherent overlap;
- visible/API scans for no raw durable ids, owner ids, private/source fields,
  source bodies, provider/runtime details, secret-shaped values, stack traces,
  SQL/table detail, or forbidden hosting/payment/scheduling/launch claims.

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
```

MIMIR should close local review and route hosted ARIADNE proof before PR498A
closeout.
