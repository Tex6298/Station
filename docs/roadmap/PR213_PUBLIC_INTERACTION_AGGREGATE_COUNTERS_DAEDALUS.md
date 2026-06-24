# PR213 Public Interaction Aggregate Counters - DAEDALUS

Date opened: 2026-06-24
Agent: A2 / DAEDALUS
Opened by: A1 / MIMIR
Status: implemented; awaiting ARGUS review

## Frame

PR211 and PR212 are accepted. Owners can now see public persona route/chat/report
readback, and ARIADNE proved the deployed UI is coherent and safe.

The remaining gap is lightweight public interaction analytics. PR211 correctly
did not invent per-persona usage analytics because existing token transactions
do not store persona/public-chat attribution. The next slice should add useful
owner activity counters without creating a raw event log or storing visitor
chat material.

## MIMIR Decision

Use aggregate counters, not raw event retention.

Allowed:

- daily aggregate counts by owner/persona/day;
- public chat attempt/success/failure counts;
- public chat rate-limit or infrastructure-block counts if the route already
  distinguishes them safely;
- public persona report-created counts;
- owner-only readback of rolling totals such as last 7 days and last 30 days.

Not allowed:

- visitor message text;
- model response text;
- durable visitor transcripts;
- visitor user ids;
- reporter identity;
- IP addresses, user-agent strings, device fingerprints, or location;
- raw public event log rows exposed to owners;
- provider traces, prompt/source payloads, token transaction rows, private
  memory/archive/canon/continuity/integrity data;
- Redis/Upstash, Cloudflare, workers, queues, or cache dependency in this lane.

If a useful implementation cannot stay aggregate-only, wake MIMIR with options
instead of adding a raw event table.

## Required Repo Map

Before coding, map the current paths:

- `apps/api/src/routes/personas.ts`
  - public chat route;
  - public persona report route;
  - owner persona readback and `publicInteraction` serialization.
- Existing Supabase migration patterns under `infra/supabase/migrations`.
- Existing tests in `apps/api/src/routes/personas.test.ts` and
  `apps/api/src/routes/reports.test.ts`.
- Web helper/UI from PR211:
  `apps/web/lib/public-persona-interaction.ts` and
  `apps/web/components/studio/persona-workspace.tsx`.
- Public persona types in `packages/types/src/persona.ts`.

Record any existing helper/pattern you reuse for date buckets, upserts, or
owner-only serialization.

## Implementation Target

Implement the narrow aggregate slice if feasible:

1. Schema
   - Add a Supabase migration for a daily aggregate public persona interaction
     counter table or equivalent existing-pattern table.
   - Keep rows keyed to owner/persona/day, not visitor/reporters/messages.
   - Add a unique constraint for one row per persona/day.
   - Include only numeric counters and timestamps needed for safe maintenance.

2. Counter updates
   - Increment chat attempt/success/failure counters inside the signed-in public
     persona chat route.
   - Increment report-created counters inside the public persona report route
     only when a new report is created, not when a duplicate report is returned.
   - Counter failures must not break the user-facing chat/report response. Use
     the repo's existing safe logging/error pattern if available.

3. Owner readback
   - Extend owner-only `publicInteraction` readback with aggregate activity
     totals for a small rolling window, preferably last 7 and last 30 days.
   - Label the readback as aggregate activity, not transcripts or per-user
     analytics.
   - Do not expose raw counter row ids.

4. Owner UI
   - Add a compact owner Studio readback using the existing PR211 card pattern.
   - Keep it factual and small: rolling chat activity, report-created activity,
     and a clear aggregate/no-transcript framing.
   - Do not redesign the Studio page.

5. Tests
   - Add API tests proving owner-only aggregate readback.
   - Add tests proving duplicates do not increment report-created counts.
   - Add tests proving no visitor identity, message content, raw ids, provider
     traces, or token transaction rows appear in owner readback.
   - Add web helper/UI tests for labels if the repo has focused coverage.

## Hard Boundaries

Do not add:

- raw event tables or owner-readable event logs;
- transcript/message/response storage;
- visitor/reporter identity storage for analytics;
- IP/user-agent/device/location tracking;
- public analytics;
- admin moderation behavior changes;
- provider, embedding, Redis, Cloudflare, queue, worker, billing, auth/session,
  or deployment changes;
- broad UI styling work.

## Validation

Run focused validation:

```text
npm exec --yes pnpm@10.32.1 -- run test:personas
npm exec --yes pnpm@10.32.1 -- run test:reports
npm exec --yes pnpm@10.32.1 -- run test:writing
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- run lint
git diff --check
git diff --cached --check
```

If a known unrelated lint warning remains, record it exactly. Run any migration
syntax/check command the repo already uses for Supabase migrations.

## Output

Return one of:

```text
IMPLEMENTED
BLOCKED: aggregate-only counters need a MIMIR decision
BLOCKED: migration/config permission
```

Include:

- schema summary;
- touched routes and serialization;
- owner UI/readback summary;
- safety/privacy notes;
- validation results;
- next wakeup target.

## Wakeup

If implemented, wake ARGUS:

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS implemented PR213 aggregate-only public persona interaction counters.
- The lane should add owner-visible rolling counts without raw event logs,
  visitor identities, transcripts, IP/user-agent storage, or provider traces.
Risk:
- Analytics storage can drift into surveillance or transcript retention if the
  schema or serializers are too broad.
Task:
- Review schema, route increments, owner serialization, UI copy, duplicate
  report counting, and tests for aggregate-only privacy boundaries.
```

If aggregate-only scope is not feasible, wake MIMIR with options and do not
implement raw event storage.

## DAEDALUS Result

Implemented on 2026-06-24.

Repo map reused:

- `apps/api/src/routes/personas.ts` already held the signed-in public chat
  route, public persona report route, and owner-only `publicInteraction`
  serializer from PR211.
- Migration patterns reused `developer_space_usage` for owner-scoped counter
  table/RLS/updated-at trigger shape and token-credit RPCs for atomic
  `insert ... on conflict do update` increments.
- `apps/api/src/routes/personas.test.ts` already had a route-local in-memory
  Supabase fixture with RPC support for token usage; PR213 extends that fixture
  for aggregate counter RPC coverage.
- `apps/web/lib/public-persona-interaction.ts` and
  `apps/web/components/studio/persona-workspace.tsx` were the existing compact
  owner readback helper/card seam from PR211.

Implementation:

- Added migration `057_public_persona_interaction_counters.sql`.
- Added `public.public_persona_interaction_counters`, keyed by
  owner/persona/day with a unique `(persona_id, bucket_date)` constraint.
- Stored columns are numeric counters only:
  `chat_attempt_count`, `chat_success_count`, `chat_failure_count`, and
  `report_created_count`, plus maintenance timestamps.
- Added atomic RPC
  `increment_public_persona_interaction_counters(...)` with non-negative
  deltas and UTC day-bucket defaulting. The migration revokes broad client
  execution and grants execution to `service_role` for API-side writes.
- Updated DB/type surfaces and shared persona public-interaction types.
- Public chat increments one aggregate attempt after the persona is found,
  eligible, and owner-enabled; success/failure counters are incremented
  best-effort around provider/quota/rate-limit outcomes.
- Public persona report creation increments `report_created_count` only after a
  new moderation report is inserted; duplicate active reports do not increment.
- Owner-only `persona.publicInteraction.activity` now returns last-7-day and
  last-30-day rolling totals. It exposes no raw counter row ids.
- Studio owner readback adds one compact `Aggregate activity` card with daily
  aggregate/no-transcript framing.

Safety:

- No raw event table, public analytics endpoint, visitor user id, reporter id,
  IP address, user-agent, device/location field, transcript, message text,
  model response, provider trace, prompt/source payload, token transaction row,
  Redis/Cloudflare dependency, worker, or queue was added.
- Counter RPC failures are swallowed so public chat/report responses do not
  fail because analytics storage is unavailable.
- The increment RPC is not broadly executable by client roles.
- Owner serialization exposes camel-case rolling totals only and keeps raw DB
  counter column names/ids out of the response.

Validation:

- `npm exec --yes pnpm@10.32.1 -- run test:personas` passed with 11 tests.
- `npm exec --yes pnpm@10.32.1 -- run test:reports` passed with 6 tests.
- `npm exec --yes pnpm@10.32.1 -- run test:writing` passed with 13 tests.
- `npm exec --yes pnpm@10.32.1 -- run typecheck` passed.
- `npm exec --yes pnpm@10.32.1 -- run lint` passed with existing raw `<img>`
  warnings in `apps/web/app/space/[slug]/page.tsx` and
  `apps/web/components/discover/discover-front-door.tsx`.
- `git diff --check` passed with CRLF normalization warnings only.
- No root package script exists for Supabase migration syntax/schema checks.

Next wakeup:

- Wake ARGUS for aggregate-only privacy/storage review.
