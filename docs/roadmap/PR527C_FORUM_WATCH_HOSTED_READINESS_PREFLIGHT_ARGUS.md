# PR527C - Forum Watch Hosted Readiness Boundary Preflight

Owner: MIMIR / A1 -> ARGUS / A3 -> MIMIR / A1

Date opened: 2026-07-15

Status:

```text
OPEN_PR527C_FORUM_WATCH_HOSTED_READINESS_PREFLIGHT
```

## Why This Is Next

ARIADNE's PR527 hosted inventory found a direct failure in the visible Forum
thread Watch command:

- `GET /threads/:id/watch` returned `500/thread_watch_load_failed`;
- `PUT /threads/:id/watch` returned `500/thread_watch_update_failed`;
- `DELETE /threads/:id/watch` returned `500/thread_watch_update_failed`.

The product therefore cannot load, set, refresh, or clean up a paid-tier watch
state. This is ranked third in the accepted PR527 correction order, after the
now-closed PR527A and PR527B lanes.

Authoritative evidence:

- `docs/roadmap/PR527_UI_PRODUCT_COMPLETENESS_HOSTED_JOURNEY_INVENTORY_ARIADNE_RESULT.md`
- `infra/supabase/migrations/040_community_notifications.sql`
- `apps/api/src/routes/threads.ts`
- `apps/api/src/routes/community.test.ts`
- `apps/web/app/forums/[categorySlug]/[threadId]/page.tsx`

The root environment has non-empty `SUPABASE_POOLER_URL`, `DATABASE_URL`,
`SUPABASE_URL`, and `SUPABASE_SERVICE_ROLE_KEY` entries by name. Secrets must
not be printed. The Supabase MCP session currently requests renewed auth after
the editor restart, but that is not a blocker while the existing pooler path
can perform sanitized read-only schema inspection.

## Current Contract

1. Migration `040_community_notifications.sql` defines
   `community_thread_watches` with owner and thread foreign keys, a unique
   `(user_id, thread_id)` constraint, `is_muted`, timestamps, an updated-at
   trigger, RLS, and own-row select/insert/update/delete policies.
2. All three watch routes require authentication and first verify that the
   thread and any parent subcommunity are readable by the current user.
3. Watch writes additionally require Private tier or higher.
4. The API uses its server client, so route-level `user_id = req.user.id`
   filtering remains essential even when RLS is also correct.
5. `PUT` is intended to be idempotent through the unique owner/thread key.
   `DELETE` is intended to be current-user scoped and safely repeatable.
6. Local community tests already cover anonymous and below-tier denial,
   unreadable-thread `404`, duplicate-watch idempotency, current-user readback,
   unwatch cleanup, notification fanout, and bounded error contracts.
7. The three matching hosted `500` responses make missing or drifted hosted
   schema the leading hypothesis, not an accepted diagnosis.

## ARGUS Preflight

ARGUS must establish the exact failure before authorizing a repair.

1. Confirm current hosted web/API deployment identity and reproduce only the
   minimum safe watch read needed to verify the failure still exists.
2. Through a sanitized read-only hosted schema probe, inspect:
   - table existence and the six expected columns;
   - both foreign keys and the unique `(user_id, thread_id)` constraint;
   - the thread/mute index and updated-at trigger;
   - RLS enablement and all four own-row policies;
   - migration-ledger evidence for migration `040`, without editing the ledger.
3. Classify the root cause exactly as one of:
   - migration `040` absent;
   - partial or divergent watch-table contract;
   - schema present but API/service-client behavior failing;
   - route or web-state defect independent of schema;
   - another named blocker supported by sanitized evidence.
4. Decide the smallest safe repair. If migration `040` is absent, assess the
   whole existing migration before authorizing it because it also defines
   `community_notifications`. If only part of the contract has drifted, do not
   paper over it with a client fallback or an ad hoc ledger edit.
5. Lock the implementation, review, hosted mutation, restoration, and evidence
   boundaries for DAEDALUS and ARIADNE.

## Required Product Semantics

- Never turn a failed watch read into a false `isWatching: false` success.
- Never store watch state in browser memory, Redis, or another ephemeral
  fallback when the durable owner-scoped table is unavailable.
- Preserve authentication, Private-tier write gating, readable-thread and
  subcommunity checks, and current-user filtering.
- Preserve idempotent `PUT` behavior and owner/thread uniqueness.
- Preserve current-user-only `GET` and `DELETE`; no cross-owner identifiers or
  watch rows may be returned or altered.
- Keep stable public errors bounded. Do not expose SQL text, table names,
  owner ids, tokens, or service details to the browser or committed evidence.
- Keep notification fanout behavior unchanged unless ARGUS proves the existing
  migration cannot be safely applied without a focused compatibility repair.
- Do not combine the separate near-black Forum thread readability defect into
  this lane. That remains the next ranked PR527D presentation repair.

## Proposed Repair Allow-List

ARGUS should narrow this further after diagnosis. The maximum proposed set is:

```text
infra/supabase/migrations/040_community_notifications.sql
infra/supabase/migrations/<new-focused-repair-only-if-required>.sql
apps/api/src/routes/threads.ts
apps/api/src/routes/community.test.ts
apps/web/app/forums/[categorySlug]/[threadId]/page.tsx
apps/web/lib/community-notifications.test.ts
docs/roadmap/PR527C_FORUM_WATCH_HOSTED_READINESS_DAEDALUS_RESULT.md
docs/roadmap/ACTIVE_STATUS.md
docs/roadmap/LANE_INDEX.md
docs/testing/VALIDATION_BASELINE.md
.station-agents/state/DAEDALUS.json
```

No code file should change if the exact accepted local contract is already
correct and the entire repair is applying and proving an absent hosted
migration. Any new migration must be justified as safer than applying the
existing accepted `040` file and must not duplicate or rewrite migration
history.

## Required Local And Hosted Gates

ARGUS should require at least:

- a read-only pre-repair hosted probe that records only sanitized booleans and
  counts, never schema payloads or row data;
- focused route tests plus `test:community`, API/web typecheck, web lint if web
  changes, migration-shape checks if schema changes, and scope/secret/
  whitespace checks;
- signed-out and below-tier behavior remains bounded and non-mutating;
- unreadable or hidden threads remain `404` without confirming their existence;
- hosted replay-owner flow against an already readable, non-private thread:
  capture initial watch boolean, `PUT`, `GET` true, browser refresh true,
  duplicate `PUT` still one logical watch, `DELETE`, `GET` false, and browser
  refresh false;
- restore the exact initial watch boolean at the end and prove that restoration
  by API and refreshed UI readback;
- zero thread, comment, vote, witness, report, moderation, notification,
  billing, profile, or publication mutation beyond the reversible current-user
  watch row required by the rehearsal;
- exact hosted web/API SHA and readiness before and after proof;
- zero page errors, unclassified console errors, clipped watch states, or
  misleading success copy at desktop and narrow mobile widths.

If the accepted repair is hosted migration-only, DAEDALUS may apply and prove
that migration before ARGUS reviews the resulting hosted schema and route
behavior. ARIADNE still owns the final human-eye Watch/refresh/Unwatch rehearsal
after hostile review.

## Required Result And Handoff

Create:

```text
docs/roadmap/PR527C_FORUM_WATCH_HOSTED_READINESS_PREFLIGHT_ARGUS_RESULT.md
```

Return exactly one verdict:

```text
ACCEPT_PR527C_FORUM_WATCH_HOSTED_READINESS_BOUNDARIES
BLOCK_PR527C_<EXACT_CONCRETE_BOUNDARY>
```

Commit the result and wake MIMIR. Do not apply a migration, mutate a hosted
watch, implement a repair, broaden into PR527D, or go idle without a committed
response.

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS completed the PR527C Forum Watch hosted-readiness preflight.
Diagnosis:
- <exact sanitized root cause>
Verdict:
- <accepted or exact blocker>
Task:
- If accepted, wake DAEDALUS with the exact repair/proof allow-list and gates.
- Keep the wider PR527 correction programme moving.
```
