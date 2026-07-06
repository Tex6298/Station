# PR495E - Public Seminar Durable Card Contract Preflight Result

Date: 2026-07-06

Owner: ARGUS / A3

Result:

```text
ACCEPT_PR495E_DURABLE_PUBLIC_CARD_SERIALIZER_CONTRACT
```

## ARGUS Verdict

ARGUS accepts a contract-only durable public-card serializer slice.

Do not turn on durable records in public `/events/seminars` yet. Do not add an
owner publish action yet. The first safe PR495E step is to write and test the
server-side card serializer, card-id rule, dedupe rule, and interest-key rule
that a later public-readback lane can use.

This keeps PR495E out of launch, hosting, RSVP, ticketing, scheduling, payment,
runtime, worker, Redis, Cloudflare, and broad public UI scope.

## Preflight Answers

- Smallest safe first public slice: public serializer and merge/dedupe contract
  only, under focused API tests. No public route sourcing switch.
- Public durable cards must require `status === "published"` and
  `visibility === "public"`.
- Owner `ready` to `published` is not accepted in PR495E. That needs a later
  owner publish/rollback lane after the serializer contract exists.
- Rollback is deferred. Do not add unpublish, cancel, published-to-ready, or
  published-to-draft behavior in this slice.
- Durable public card ids should be deterministic digests of the durable record
  id with a versioned Station namespace, never raw record ids. Use the existing
  public `seminar_<16 hex>` shape.
- Durable record cards dedupe against current source-derived cards by
  `sourceType:sourceId`. When both exist for the same document source, the
  durable card wins in the contract helper, while thread and Space cards remain
  unchanged.
- Interest remains source-derived. Durable document cards must resolve to the
  same internal interest key as the source document: `document:<document id>`.
- Do not migrate `public.public_seminar_interests`; do not add a durable-record
  `source_type`.
- Public serializer fields are limited to safe card fields: hashed card id,
  `sourceType: "document"`, safe title, safe summary excerpt, public document
  href, safe public discussion href, safe public Space title/href, compatible
  timestamps, aggregate interest defaults, and viewer-local interest only when
  the existing readback helper is explicitly applied.
- Public `/events/seminars` response `source` remains unchanged in this slice.
  Do not change `PublicSeminarsResponse.source`.
- Public copy stays readback-only and must not claim scheduling, hosting,
  tickets, RSVP, payments, reminders, attendance, rooms, streams, recordings,
  transcripts, provider runtime, launch readiness, or delivery guarantees.
- ARIADNE hosted proof is not required for this serializer-only implementation.
  Hosted proof is required in the later lane that enables owner publish or
  public durable-record readback.

## Exact DAEDALUS Scope

Allowed files:

- `apps/api/src/routes/events.ts`
- `apps/api/src/routes/live-events.test.ts`
- `packages/types/src/live-events.ts` only if a small internal/public helper
  type is truly needed
- `apps/web/lib/live-events-route.test.ts` only for no-drift assertions
- focused roadmap/result docs

Avoid web component changes. Do not touch:

- Supabase migrations or RLS policies;
- `public.public_seminar_interests` schema;
- owner publish/rollback APIs;
- `/studio/publishing` controls;
- public `/events/seminars` route behavior;
- public interest mark/withdraw behavior;
- Discover/search/forum behavior;
- billing, provider runtime, queues/workers, Redis, Cloudflare, archive/import,
  persona runtime, or broad UI shell structure.

## Serializer Contract

Add a server-side helper for durable public seminar records. It may live in
`apps/api/src/routes/events.ts` or in a small adjacent API helper module if that
keeps tests cleaner.

The helper may be exported for tests, but it must not be wired into
`GET /events/seminars`, `POST /events/seminars/:seminarId/interest`, or
`DELETE /events/seminars/:seminarId/interest` in PR495E.

Eligible durable rows must satisfy all of:

- `public_seminar_records.source_type === "document"`;
- `public_seminar_records.status === "published"`;
- `public_seminar_records.visibility === "public"`;
- source document exists;
- source document `author_user_id === owner_user_id`;
- source document `status === "published"`;
- source document `visibility === "public"`;
- source document belongs to a routeable public Space with a safe slug.

Rows that are `draft`, `ready`, `cancelled`, private, non-document,
non-owner-matching, unroutable, or source-invalid must return no card.

The durable card id contract:

```text
seminar_<sha256("station.public-seminar-record:v1:" + record.id).slice(0, 16)>
```

Do not serialize `record.id`; only serialize the digest card id.

The public card should use:

- `sourceType: "document"`;
- internal source key `document:<source document id>` for interest readback;
- label such as `Public seminar`;
- title from the durable record title, bounded and redacted;
- description from the durable record summary, bounded and redacted, or `null`;
- href from the source document public route;
- discussion href only when the linked discussion is public, routeable, and
  linked to the same document;
- Space title/href from the public Space, bounded and redacted;
- compatible timestamps from the durable record, such as `updated_at` for
  `featuredAt` and `publishedAt`, until a later migration adds a dedicated
  seminar publish timestamp.

The serializer must not expose raw owner ids, raw source ids, raw record ids,
raw discussion ids, source document bodies beyond the accepted durable summary
excerpt, private labels, SQL/storage internals, provider payloads, tokens,
cookies/headers, IP/user-agent values, stack traces, or secret-shaped values.

## Merge And Dedupe Contract

Add a tested pure merge/dedupe helper for future use. Do not wire it into the
public route yet.

Contract:

- dedupe by internal interest key `sourceType:sourceId`;
- durable document card wins over a source-derived document card for the same
  document source;
- when durable replaces an existing discover document card, keep that list slot
  so the surrounding public ordering does not churn more than necessary;
- discover thread and Space cards remain unchanged;
- durable-only cards append after source-derived cards in durable
  `updated_at desc` order;
- apply the existing `limit` after merge;
- interest readback remains source-derived and can reuse the existing
  `applySeminarInterestReadback` contract because durable document cards still
  resolve to `document:<source id>`.

## Required DAEDALUS Tests

API tests must prove:

- eligible `published` + `public` durable document records serialize to safe
  public cards with `seminar_<16 hex>` ids and no raw record/source/owner ids;
- draft, ready, cancelled, private, non-document, source-private,
  source-unlisted/community, source-draft/archived, no-Space, private-Space,
  unsafe-slug Space, UUID-slug Space, and owner/source mismatch rows return no
  durable card;
- title, summary, and Space text are bounded and redacted for token, cookie,
  authorization, source id, owner id, discussion id, IP, UUID, stack trace, and
  secret-shaped values;
- discussion href is present only for a public routeable thread linked to the
  same source document;
- durable card id is stable for a record and does not include the raw record id;
- merge/dedupe makes durable document cards win over source-derived document
  cards for the same source, keeps thread/Space cards, appends durable-only
  cards after current source-derived cards, and applies limit after merge;
- internal interest keys remain `document:<source id>` and no durable-record
  interest source type is added;
- current `GET /events/seminars` still ignores durable records, even
  `published` + `public` ones;
- signed-in interest mark/withdraw still resolves only current source-derived
  public cards;
- public `PublicSeminarsResponse.source` remains `discover_feed_featured`;
- storage failures return bounded errors and do not leak SQL/table details.

Static/no-drift tests should prove:

- no migration changes were added;
- no `/studio/publishing` publish/public controls were added;
- no new `public_seminar_interests.source_type` value was added;
- no public route copy claims hosting, scheduling, RSVP, tickets, payments,
  reminders, attendance, rooms, streams, recordings, transcripts, provider
  runtime, launch readiness, or delivery guarantees.

## Required Validation

DAEDALUS must run at least:

```powershell
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/live-events.test.ts apps/web/lib/live-events-route.test.ts apps/web/lib/auth-routes.test.ts
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/seminar-host-readiness.test.ts apps/web/lib/publishing-ui.test.ts
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- run lint
git diff --check
```

The result doc must list exact files touched and explicitly confirm that public
`/events/seminars`, public interest mark/withdraw, owner publish/rollback,
schema/RLS, migrations, UI, runtime, provider, queue/worker, Redis, Cloudflare,
billing, hosting, scheduling, RSVP, ticketing, payments, reminders, media,
transcripts, and launch claims did not change.

## ARGUS Preflight Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| Hostile review of PR495E surface | Pass | Reviewed seminar record and interest migrations, public route/card/id/interest helpers, owner ready transition surface, shared types, web public route copy/tests, and PR495D closeout. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/live-events.test.ts apps/web/lib/seminar-host-readiness.test.ts apps/web/lib/publishing-ui.test.ts apps/web/lib/live-events-route.test.ts apps/web/lib/auth-routes.test.ts` | Pass | 44 focused tests passed before PR495E implementation. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck replayed from cache. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass | Web lint replayed from cache with no warnings or errors. |
| `git diff --check` | Pass | No whitespace errors. |

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARGUS accepts PR495E as ACCEPT_PR495E_DURABLE_PUBLIC_CARD_SERIALIZER_CONTRACT.
- Implement only a tested server-side durable public-card serializer plus merge/dedupe contract for eligible published/public durable document records.
- Do not enable durable records in public /events/seminars, do not add owner publish/rollback, and do not change public interest behavior or migrations.
Task:
- Add the serializer/card-id/dedupe/interest-key helper and focused API/static tests within the exact scope above.
- Keep public route sourcing, owner publish/public controls, interest migration, schema/RLS, UI, scheduling, hosting, RSVP/tickets/payments/reminders/live rooms/media/transcripts/provider/runtime/queues/Redis/Cloudflare/billing/launch claims out of scope.
```
