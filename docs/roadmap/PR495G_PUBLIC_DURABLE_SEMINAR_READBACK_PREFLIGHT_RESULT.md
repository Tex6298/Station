# PR495G - Public Durable Seminar Readback Preflight Result

Date: 2026-07-06

Owner: ARGUS / A3

Result:

```text
ACCEPT_PR495G_PUBLIC_DURABLE_SEMINAR_READBACK
```

## ARGUS Verdict

ARGUS accepts PR495G as a narrow public durable seminar readback lane.

DAEDALUS may wire eligible `published` + `public` durable seminar records into
public `/events/seminars` and must include durable digest id interest
resolution in the same slice.

Why this is safe now:

- PR495E provides the safe durable public-card serializer, digest card ids,
  source-key dedupe, safe redaction, routeable source validation, and merge
  helper;
- PR495F provides hosted-proved owner publish/rollback into and out of
  `published` + `public` durable eligibility;
- `public_seminar_interests` already stores the safe public source key, not the
  durable card id or durable record id;
- the public page already renders interest controls for every public seminar
  card, so public durable cards need matching server-side interest resolution in
  this lane.

No schema, RLS, owner UI, public detail page, runtime, queue, Redis,
Cloudflare, billing, scheduling, hosting, RSVP, tickets, payments, reminders,
rooms, media, transcripts, provider, launch, or broad UI work is accepted.

## Accepted Implementation Shape

### Public Readback

In `apps/api/src/routes/events.ts`, wire `GET /events/seminars` as a bounded
merge of source-derived and durable cards:

- keep loading current source-derived `discover_feed` featured document/thread/
  Space cards through existing public resolvers;
- load bounded durable candidates from `public_seminar_records` with
  `status === "published"`, `visibility === "public"`, and
  `source_type === "document"`;
- include `owner_user_id` in the durable record select because
  `resolveDurablePublicSeminarRecordCard` must verify source ownership;
- order durable candidates by `updated_at` descending and use a bounded
  over-fetch similar to the current discover-feed route;
- resolve each durable row through `resolveDurablePublicSeminarRecordCard`;
- drop `null` durable rows when the record/source/Space is stale or
  unrouteable;
- let storage errors fail the public route with the existing bounded
  `live_events_unavailable` envelope;
- merge with `mergePublicSeminarCardsWithDurableCards`, then apply
  `applySeminarInterestReadback` after the merge;
- return deterministic `seminar_<16 hex>` durable card ids from
  `durablePublicSeminarCardId`, never raw durable record ids;
- keep durable cards as `sourceType: "document"` with interest identity
  `document:<source document id>`;
- update `PublicSeminarsResponse.source` to include an honest mixed-source
  value such as `discover_feed_featured_and_durable_records`.

The response may continue using the existing public card shape. Do not add a
new public durable source type and do not expose `recordId`, `sourceId`,
`ownerUserId`, raw discussion ids, storage paths, or private source text.

### Interest Resolution

Durable digest id interest resolution belongs in PR495G.

`POST /events/seminars/:seminarId/interest` and
`DELETE /events/seminars/:seminarId/interest` should resolve targets through the
same merged public card lookup used by readback, using the existing bounded
interest lookup limit.

Accepted behavior:

- visible durable card digest ids resolve server-side to the source document
  key;
- interest rows write `source_type: "document"` and
  `source_id: <source document id>`;
- interest rows never store raw durable record ids;
- duplicate mark and repeated withdraw stay idempotent;
- signed-out users still receive `401`;
- malformed ids, rolled-back records, draft/ready/private/cancelled records,
  stale sources, private/unpublished source documents, unroutable or unsafe
  Spaces, owner/source mismatches, non-document records, deleted records, and
  durable cards outside the current bounded public lookup return the existing
  bounded `seminar_not_found` response.

### Ordering And Limits

Use the existing merge contract:

- source-derived cards keep current discover-feed ordering;
- a durable document card for the same source replaces the source-derived
  document card in that source slot;
- durable-only cards append after source-derived cards;
- durable-only ordering is newest first by durable `updated_at`, falling back to
  `created_at`;
- if multiple durable rows ever resolve to the same source key, the newest
  resolved durable row wins;
- merge first, then slice to the requested public limit;
- use the same merged lookup contract for interest resolution with
  `SEMINAR_INTEREST_LOOKUP_LIMIT`.

### Stale Durable Records

If a durable record remains `published` + `public` but its source document,
public Space, ownership relationship, or routeable discussion becomes stale:

- public readback drops that durable card;
- interest mark/withdraw by that durable digest returns `seminar_not_found`;
- existing interest rows for the source key are not exposed on stale cards and
  should remain untouched by the readback route.

## Required Test Changes

Replace the current "durable public seminar helper is not wired" and
"readback ignores durable records" assertions with positive PR495G coverage.

DAEDALUS should add or update focused tests proving:

- `GET /events/seminars` returns a durable-only published/public record as a
  bounded public card with digest id, `Public seminar` label, safe document
  href, optional public discussion href, sanitized title/summary/Space copy,
  aggregate interest count, and no raw durable/source/owner/private values;
- a durable card for a featured source document replaces the source-derived
  document card while preserving thread and Space cards and source-key interest
  counts;
- durable-only cards append after source-derived cards and obey the requested
  limit;
- stale durable rows are excluded for draft, ready, cancelled, private,
  non-document, source-private, source-draft, no-public-Space, unsafe-Space,
  owner/source mismatch, missing source, and deleted records;
- durable digest `POST` and `DELETE` interest mutations write and delete only
  `document:<source document id>` rows, never durable record ids;
- duplicate durable interest mark and repeated durable withdraw stay
  idempotent;
- signed-out durable interest mutation still returns `401`;
- rolled-back or stale durable digest interest mutation returns
  `seminar_not_found` without writing interest;
- public readback and interest storage failures return only the existing
  bounded public error envelopes;
- web public seminar copy remains readback-only and does not claim tickets,
  RSVP, scheduling, attendance, hosting, reminders, payment, live rooms,
  provider runtime, or launch readiness;
- `PublicSeminarsResponse.source` and any type updates stay honest and bounded.

## ARGUS Questions Answered

1. `GET /events/seminars` can safely merge durable cards now that PR495E and
   PR495F are closed.
2. Durable digest id interest resolution must ship in PR495G because the current
   public page renders interest controls for every returned card.
3. The public response `source` should gain a mixed-source value, not keep the
   old discover-feed-only value after durable records are wired.
4. Durable replacement ordering should follow the PR495E merge contract:
   replace matching source-derived document cards in place; append durable-only
   cards by newest durable `updated_at`/`created_at`.
5. Limit behavior should over-fetch bounded source and durable candidates,
   merge/dedupe, apply interest readback, and return the requested limit.
6. Stale durable cards should be dropped from readback and resolve to
   `seminar_not_found` for interest mutation.
7. Tests should replace "not wired" assertions with positive durable readback,
   durable digest interest, stale exclusion, limit, redaction, and bounded-error
   coverage.
8. Hosted ARIADNE proof is required after ARGUS accepts the implementation,
   because public visible route behavior and signed-in interest mutation
   behavior will change.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| Hostile preflight review | Pass | Reviewed PR495E/F closeouts, migrations/types, public route/card/id helpers, durable serializer, merge contract, interest readback, public web copy, and focused tests. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/live-events.test.ts apps/web/lib/live-events-route.test.ts apps/web/lib/auth-routes.test.ts` | Pass | 33 focused API/public-route/auth tests passed before PR495G implementation. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API typecheck ran; web typecheck replayed from cache. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass | Web lint replayed from cache with no warnings or errors. |
| `git diff --check` | Pass | CRLF normalization warnings only; no whitespace errors. |

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARGUS accepts PR495G as ACCEPT_PR495G_PUBLIC_DURABLE_SEMINAR_READBACK.
- DAEDALUS may wire eligible published/public durable seminar records into public /events/seminars using the existing PR495E serializer and merge contract.
- Durable digest id interest resolution belongs in the same slice; interest rows must continue storing only source_type/source_id, never durable record ids.
- PublicSeminarsResponse.source should gain an honest mixed-source value; public card shape/sourceType can otherwise stay compatible.
Task:
- Implement the exact PR495G API/type/test/doc scope in docs/roadmap/PR495G_PUBLIC_DURABLE_SEMINAR_READBACK_PREFLIGHT_RESULT.md.
- Replace the current not-wired durable assertions with positive durable readback, durable digest interest, stale exclusion, limit, redaction, and bounded-error tests.
- Do not add public seminar detail pages, schema/RLS migrations, owner UI expansion, scheduling, hosting, RSVP/tickets/payments/reminders/live rooms/media/transcripts/provider runtime/queues/Redis/Cloudflare/billing/launch claims, broad UI redesign, private-source exposure, raw ids, or secret leakage.
Validation:
- Run the focused API/public/auth suite, typecheck, lint, and git diff --check.
```
