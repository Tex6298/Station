# PR495B - Durable Seminar Record Contract Review Result

Date: 2026-07-05

Owner: ARGUS / A3

Result:

```text
ACCEPT_PR495B_DURABLE_SEMINAR_RECORD_CONTRACT_IMPLEMENTATION
```

## ARGUS Verdict

ARGUS accepts the PR495B implementation without a code patch.

The shipped slice matches the accepted contract-only preflight:

- migration `069_public_seminar_records.sql` adds
  `public.public_seminar_records` with owner/source uniqueness, owner listing
  and source indexes, an updated-at trigger, and owner-only RLS policies;
- DB and shared live-event types define the owner record contract;
- owner `GET /events/seminars/records` is auth-bound and owner-filtered;
- owner `POST /events/seminars/records` is auth-bound, creator-tier gated,
  document-source-only, and idempotent by owner/source pair;
- source validation requires the signed-in document author, published public
  document state, and a routeable public Space using the existing safe-slug and
  UUID-shaped slug boundary;
- the serializer returns the durable record id, safe title/summary, status,
  visibility, public document/Space routes, `discussionLinked`, and timestamps;
- raw `owner_user_id`, raw `source_id`, raw `discussion_thread_id`, source
  bodies, private labels, SQL details, storage paths, provider payloads,
  tokens, cookies/headers, IP/user-agent values, stack traces, and
  secret-shaped values are not serialized;
- public `GET /events/seminars` and signed-in interest mark/withdraw behavior
  remain unchanged.

No public seminar UI, owner UI, public `/events/seminars` sourcing change,
interest migration, status transition route, schedule/proposal/host claim,
RSVP, ticket, payment, reminder, attendee list, live room, media, recording,
transcript, provider runtime, queue/worker, Redis, Cloudflare, billing, or
launch claim entered scope.

## Review Notes

Accepted:

- Migration shape matches the preflight: document-only source references,
  owner-scoped records, stable unique owner/source contract, and no direct
  public or anonymous table select policy.
- The API uses server-side document resolution before writing and does not let
  clients submit title, summary, status, visibility, discussion id, owner id, or
  public route fields.
- The record response intentionally includes a public document href because the
  source must already be a public published document in a routeable public
  Space; it does not include raw source or owner fields.
- Existing public seminar card and interest readback code paths still derive
  from `discover_feed` and `public_seminar_interests`, not from the new records
  table.
- The focused tests cover auth/tier gates, owner-only listing, idempotent
  create, private/community/unlisted/draft/archived/no-Space/private-Space/
  unsafe-Space/non-owned/unsupported-source failures, bounded storage errors,
  redaction/no-leak expectations, and public seminar/interest no-drift.

Residual risk:

- This is local review only. Hosted proof must apply migration 069 and verify
  the deployed owner API and public seminar no-drift behavior against hosted
  Supabase before MIMIR closes the lane.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| Code review | Pass | Migration/RLS, owner document authority, serializer redaction, idempotent owner API behavior, forbidden scope, and public seminar/interest no-drift reviewed. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/live-events.test.ts apps/web/lib/live-events-route.test.ts apps/web/lib/auth-routes.test.ts` | Pass | 19 focused tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck passed. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass | Web lint passed with no warnings or errors. |
| `git diff --check` | Pass | CRLF normalization warning for consumed ARGUS state only; no whitespace errors. |

## Required Hosted Proof

MIMIR should route ARIADNE or an equivalent hosted proof before closeout.

Hosted proof should cover:

- hosted app/API freshness at runtime commit `3afa40d7` or later;
- migration `069_public_seminar_records.sql` applied on hosted Supabase;
- table, constraints, indexes, updated-at trigger, and owner-only RLS policies
  exist;
- no direct public or anonymous select policy exists for
  `public.public_seminar_records`;
- an authenticated creator owner can create and list one durable seminar record
  for an accepted public document source;
- duplicate owner create returns one stable record id for the same owner/source
  pair;
- signed-out and non-owner public requests cannot access owner records;
- public `GET /events/seminars`, signed-in interest mark/withdraw, aggregate
  interest, and viewer-local interest behavior do not drift;
- API responses leak no raw source id, owner id, discussion id, private source
  body, private labels, SQL output, storage path, provider payload, token,
  cookie/header, IP/user-agent value, stack trace, secret-shaped value, ticket,
  payment, RSVP, attendee, reminder, room, media, recording, transcript,
  provider, queue, Redis, Cloudflare, billing, or launch claim.

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS accepts PR495B as ACCEPT_PR495B_DURABLE_SEMINAR_RECORD_CONTRACT_IMPLEMENTATION.
- The implementation stayed contract-only: migration 069, db/types/live-event types, owner GET/POST records API, focused tests, and docs.
- Owner record create is auth-bound, creator-gated, document-source-only, owner-authority checked, route-safe, and idempotent.
- Focused tests, typecheck, lint, and git diff --check passed.
Task:
- Route hosted migration/API proof before closeout.
- Hosted proof must apply migration 069, verify owner-only RLS/no public table select, prove owner create/list and duplicate stability, re-check signed-out/non-owner denial, and confirm public /events/seminars plus interest behavior did not drift.
```
