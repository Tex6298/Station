# PR495G - Public Durable Seminar Readback Review Result

Date: 2026-07-06

Owner: ARGUS / A3

Result:

```text
ACCEPT_PR495G_PUBLIC_DURABLE_SEMINAR_READBACK_IMPLEMENTATION
```

## ARGUS Verdict

ARGUS accepts the PR495G implementation without a code patch.

The implementation matches the accepted public durable readback lane:

- public `GET /events/seminars` merges current discover-feed featured cards
  with eligible `published` + `public` durable seminar records;
- durable records resolve only through the PR495E safe serializer and stale
  records are dropped;
- durable document cards replace matching source-derived document cards by
  `document:<source id>`;
- thread and Space cards keep their source-derived order;
- durable-only cards append after source-derived cards and the requested limit
  applies after merge;
- interest readback runs after merge;
- durable digest ids resolve for public interest mark/withdraw;
- interest rows still store only source-derived `source_type` and `source_id`,
  never durable record ids;
- `PublicSeminarsResponse.source` now honestly returns
  `discover_feed_featured_and_durable_records`.

## Review Notes

Accepted:

- Durable record lookup is bounded, document-only, `published` + `public`, and
  includes `owner_user_id` only for server-side serializer verification.
- The PR495E serializer still revalidates source document ownership, public
  published status, and routeable public Space before a durable card can appear.
- Stale durable records, rolled-back records, private/draft/ready/cancelled
  records, non-document records, owner/source mismatches, unsafe Spaces, and
  missing sources do not appear publicly.
- Interest target lookup uses the same merged public card resolver, so durable
  digest ids are valid only while they are current bounded public cards.
- Mark/withdraw remains authenticated, idempotent, viewer-local, and aggregate
  only.
- Storage failures return the existing bounded public error envelopes without
  table names, owner ids, source ids, storage paths, stack traces, provider
  payloads, tokens, cookies, headers, IP/user-agent values, or secret-shaped
  values.
- Public response JSON does not expose durable record ids, owner ids,
  `sourceId` fields, private source text, raw discussion ids, SQL/storage
  internals, or secret-shaped values.
- Public copy remains readback-only and does not claim scheduling, hosting,
  RSVP, tickets, payment, reminders, attendance, rooms, streaming, recordings,
  transcripts, provider runtime, launch readiness, or delivery guarantees.

Not changed:

- no public seminar detail page;
- no new public card source type;
- no schema, migration, RLS, or generated DB type change;
- no owner `/studio/publishing` expansion;
- no billing, provider runtime, queue/worker, Redis, Cloudflare, archive/import,
  persona runtime, memory/continuity, broad UI redesign, private-source
  exposure, raw id exposure, or launch claim.

Residual risk:

- This is local review only. Because public visible route behavior and signed-in
  interest mutation behavior changed, hosted ARIADNE proof is required before
  PR495G closeout.

## Required Hosted Rehearsal

MIMIR should route ARIADNE for hosted desktop, `375px`, and `390px` proof.

Hosted proof should cover:

- hosted app/API freshness at the accepted implementation/review commit or
  later;
- public `/events/seminars` renders at least one eligible durable public seminar
  card;
- durable-only card readback is safe, bounded, and mobile-fit;
- durable card replacing a source-derived document card keeps thread and Space
  cards stable;
- durable digest interest mark, duplicate mark, withdraw, and repeated withdraw
  work for a signed-in user;
- interest rows remain source-derived and aggregate only;
- signed-out durable interest mutation remains blocked;
- rolled-back or stale durable cards disappear and their durable digest returns
  `seminar_not_found`;
- no durable record id, owner id, raw source id field, private source body,
  raw discussion id, secret-shaped value, provider/runtime payload, storage
  detail, cookie/header/token, IP/user-agent, SQL output, or stack trace leaks;
- no scheduling, hosting, RSVP, tickets, payment, reminders, attendance,
  live-room, media, transcript, provider runtime, Redis, Cloudflare, billing,
  or launch-ready claim appears;
- desktop, `375px`, and `390px` layouts have no horizontal overflow or clipped
  controls.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| Code review | Pass | Merge ordering, limit behavior, stale durable exclusion, durable digest interest resolution, source-derived interest persistence, bounded errors, response source honesty, and leak boundaries reviewed. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/live-events.test.ts apps/web/lib/live-events-route.test.ts apps/web/lib/auth-routes.test.ts` | Pass | 36 focused API/public-route/auth tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck replayed from cache. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass | Web lint replayed from cache with no warnings or errors. |
| `git diff --check` | Pass | CRLF normalization warnings only; no whitespace errors. |

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS accepts PR495G as ACCEPT_PR495G_PUBLIC_DURABLE_SEMINAR_READBACK_IMPLEMENTATION.
- Public /events/seminars now merges eligible published/public durable seminar records with discover-feed cards through the PR495E serializer and merge contract.
- Durable digest ids resolve for public interest mark/withdraw while interest rows continue storing only source_type/source_id, never durable record ids.
- Response source is now the honest mixed value discover_feed_featured_and_durable_records; schema/RLS, owner UI, runtime, queues, Redis, Cloudflare, billing, and launch scope remain unchanged.
Validation:
- Focused API/public/auth suite passed with 36 tests.
- Typecheck, lint, and git diff --check passed.
Task:
- Route ARIADNE for hosted desktop/375px/390px proof before PR495G closeout.
- Hosted proof should cover durable-only readback, durable replacement of source-derived document cards, durable digest interest mark/duplicate/withdraw/repeated withdraw, signed-out denial, stale/rolled-back disappearance and seminar_not_found, aggregate source-derived interest only, no raw/private/secret/runtime/scope leak, no launch/scheduling/hosting/payment claims, and mobile fit.
```
