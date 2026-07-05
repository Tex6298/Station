# PR495B - Durable Seminar Record Contract Preflight Result

Date: 2026-07-05

Owner: ARGUS / A3

Result:

```text
ACCEPT_PR495B_DURABLE_SEMINAR_RECORD_CONTRACT
```

## ARGUS Verdict

ARGUS accepts a real durable seminar record contract slice.

`ACCEPT_PR495B_SOURCE_REFERENCE_CONTRACT_ONLY` is not enough. Station already
has source references through `public_seminar_interests.source_type` and
`source_id`; the missing blocker before future host/propose/schedule language is
a stable owner-scoped seminar record id, status model, RLS boundary, and owner
API contract.

PR495B must stay contract-only. It must not add public UI, owner UI, public
`/events/seminars` record sourcing, scheduling, proposals, hosting claims,
tickets, payments, RSVP, attendee lists, reminders, rooms, media, transcripts,
provider calls, queues/workers, Redis, Cloudflare, or launch claims.

## Exact DAEDALUS Scope

Allowed files:

- `infra/supabase/migrations/069_public_seminar_records.sql`
- `packages/db/src/types.ts`
- `packages/types/src/live-events.ts`
- `apps/api/src/routes/events.ts`
- `apps/api/src/routes/live-events.test.ts`
- focused roadmap/result docs

Do not touch web UI, public `/events/seminars` rendering, public seminar card
derivation, public interest mark/withdraw behavior, billing, provider/runtime,
queues/workers, Redis, Cloudflare, Discover curation, forum moderation, archive
imports, persona runtime, or broad API/app structure.

## Contract Shape

Add a new owner-scoped table:

```text
public.public_seminar_records
```

Minimum columns:

- `id uuid primary key default gen_random_uuid()`;
- `owner_user_id uuid not null references public.profiles(id) on delete cascade`;
- `source_type text not null check (source_type in ('document'))`;
- `source_id uuid not null references public.documents(id) on delete restrict`;
- `title text not null`;
- `summary text`;
- `status text not null default 'draft' check (status in ('draft', 'ready', 'published', 'cancelled'))`;
- `visibility text not null default 'private' check (visibility in ('private', 'public'))`;
- `discussion_thread_id uuid references public.threads(id) on delete set null`;
- `created_at timestamptz not null default now()`;
- `updated_at timestamptz not null default now()`.

Required indexes/constraints:

- unique owner/source record, for example
  `(owner_user_id, source_type, source_id)`;
- owner/status/updated index for owner listing;
- source index for future interest/source mapping.

The first accepted source type is `document` only. Thread and Space source
records are deferred because their owner semantics are broader than the PR495A
readiness slice. Future lanes may expand the source set after ARGUS reviews the
owner and public-readback boundary.

## API Shape

Add owner API only:

- `GET /events/seminars/records`
- `POST /events/seminars/records`

`POST` must require auth and creator-tier authority. It accepts only:

```json
{
  "sourceType": "document",
  "sourceId": "<document id>"
}
```

The server must resolve and validate the source before writing:

- source document is owned by the signed-in user;
- document `status === "published"`;
- document `visibility === "public"`;
- document has a Space;
- Space is public;
- Space slug is route-safe using the same public seminar routeability boundary
  as PR469/PR495A;
- linked discussion, if present, is copied only as metadata.

The server, not the client, derives the stored title/summary snapshot from the
accepted public document source. Keep title/summary bounded and sanitized.

`POST` should be idempotent for the same owner/source pair: return the existing
record rather than creating duplicates.

`GET` should list the signed-in owner's records only.

No `PATCH`, delete/cancel, public read, public search, public seminar card
transition, interest migration, or status transition route is accepted in
PR495B.

## Response Shape

Add types for owner record readback in `packages/types/src/live-events.ts`.

The owner API response may include:

- record id;
- source type;
- safe title;
- safe summary;
- status;
- visibility;
- public document href;
- public Space title/href;
- `discussionLinked: boolean`;
- created/updated timestamps.

Do not serialize:

- `owner_user_id`;
- raw `source_id`;
- raw `discussion_thread_id`;
- source body;
- private source labels;
- SQL details;
- storage paths;
- provider payloads;
- tokens, cookies, headers, IP/user-agent values, webhook data, stack traces, or
  secret-shaped values.

## RLS Boundary

Enable RLS on `public.public_seminar_records`.

For PR495B, add owner-only policies:

- owner select/write/update/delete policy using `auth.uid() = owner_user_id`;
- no direct public/anonymous select policy in this lane.

Do not add public table select because the table contains raw source references.
Future public readback must go through a public-safe API serializer or a
separate public-safe view that omits raw source ids.

## Interest Relationship

Do not migrate or rewrite `public_seminar_interests` in PR495B.

Existing interest rows remain keyed by `(source_type, source_id)`. The new
record keeps the same source pair so a later lane can safely map aggregate
interest onto durable seminar records without trusting public digest ids or
changing current public interest behavior.

## Required DAEDALUS Tests

DAEDALUS must add focused API tests proving:

- unauthenticated record access fails closed;
- non-creator create fails closed if `POST` uses creator-tier gating;
- creating a record from an owned public published document in a routeable public
  Space succeeds;
- duplicate create for the same owner/source returns one stable record;
- owner list returns only the signed-in owner's records;
- private, community, unlisted, draft, archived, no-Space, private-Space,
  UUID-slug Space, unsafe-slug Space, non-owned document, thread source, and
  Space source targets fail closed;
- response JSON omits raw source ids, owner ids, discussion ids, source bodies,
  private labels, SQL details, storage paths, provider payloads, tokens,
  cookies/headers, IP/user-agent values, stack traces, and secret-shaped values;
- public `GET /events/seminars`, signed-in interest mark/withdraw, and
  interest aggregate/viewer-local behavior do not drift;
- storage/query failures return bounded errors.

## Required Validation

DAEDALUS must run at least:

```powershell
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/live-events.test.ts apps/web/lib/live-events-route.test.ts apps/web/lib/auth-routes.test.ts
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- run lint
git diff --check
```

The result doc must include the migration path and the hosted proof required
before closeout.

## Hosted Proof Required After ARGUS Review

If ARGUS accepts the implementation, MIMIR should route ARIADNE or a MIMIR
hosted migration proof covering:

- migration `069_public_seminar_records.sql` applied on hosted Supabase;
- table, constraints, indexes, trigger, and owner-only RLS policies exist;
- no direct public/anonymous table select policy exists;
- owner can create/list one durable seminar record for an accepted public
  document source;
- duplicate owner create returns one stable record;
- signed-out/public requests cannot access owner records;
- public `/events/seminars` still renders derived public cards and existing
  interest behavior without drift;
- no raw source id, owner id, discussion id, private body, SQL output, stack
  trace, secret-shaped value, ticket, payment, RSVP, attendee, reminder, room,
  media, transcript, provider, queue, Redis, Cloudflare, or launch claim leaks.

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARGUS accepts PR495B as ACCEPT_PR495B_DURABLE_SEMINAR_RECORD_CONTRACT.
- Implement a contract-only durable owner seminar record table plus owner API/types/tests.
- First source type is document only; public /events/seminars and interest behavior must not change.
Task:
- Add migration 069, db/types/live-events types, owner GET/POST records API, focused live-events tests, and result docs exactly within the scope above.
- Keep public readback, UI, status transitions, interest migration, schedule/proposal/host claims, RSVP/tickets/payments/reminders/live rooms/provider/runtime/queues/Redis/Cloudflare out of scope.
```
