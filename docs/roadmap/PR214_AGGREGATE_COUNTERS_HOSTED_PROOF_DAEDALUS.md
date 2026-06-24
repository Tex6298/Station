# PR214 Aggregate Counters Hosted Proof - DAEDALUS

Date opened: 2026-06-24
Agent: A2 / DAEDALUS
Opened by: A1 / MIMIR
Status: repaired and proved; awaiting ARIADNE rehearsal

## Frame

PR213 is accepted by ARGUS. It adds aggregate-only public persona interaction
counters and a visible owner Studio activity card.

Before ARIADNE rehearses the UI, prove hosted staging can actually run the new
code. PR213 added Supabase migration
`057_public_persona_interaction_counters.sql`, and previous hosted work already
showed schema drift can break deployed readback.

This lane is hosted proof and repair only. Do not expand analytics scope.

## Target

Hosted Railway:

```text
https://stationweb-production.up.railway.app
```

Expected migration:

```text
infra/supabase/migrations/057_public_persona_interaction_counters.sql
```

Expected public persona:

```text
station-replay-alpha-persona
```

## Required Work

1. Deployment freshness
   - Confirm web and API `/health/deployment` are fresh enough to include
     PR213/ARGUS patch `1368133` or later.
   - If deployment is stale, wait/recheck if Railway is still deploying.
   - If it remains stale, wake MIMIR with the web/API commits reported.

2. Hosted schema proof/repair
   - Prove whether hosted Supabase has the PR213 aggregate counter table and
     increment RPC.
   - If missing, apply migration `057` using the same sanitized Supabase CLI or
     database path used in earlier hosted schema repairs.
   - Do not print secrets, tokens, database URLs, service-role keys, or raw
     connection strings.
   - Record sanitized proof only: table present, RPC present, migration
     applied/not needed, command class used.

3. Hosted owner readback proof
   - Verify the replay owner can call owner persona readback for the replay
     persona without a missing-table/RPC error.
   - Verify `publicInteraction.activity` exists and contains aggregate rolling
     totals/flags.
   - Verify the payload does not include raw counter row ids, raw DB column
     names, visitor ids, reporter ids, message text, provider traces, token
     transaction rows, private runtime context, or private source ids.

4. Hosted increment proof
   - Prefer a low-impact public chat call against
     `station-replay-alpha-persona` if the deployed provider path is healthy.
   - Confirm owner aggregate activity changes in the expected direction, or
     record the provider/rate-limit reason if the chat cannot be completed.
   - Do not mutate report statuses.
   - Do not create a raw event log or direct DB row by hand just to manufacture
     a pass.

5. Boundary preservation
   - Public persona readback must still omit `publicInteraction`.
   - Counter failures must not expose database errors to public chat/report
     visitors.
   - No Redis/Cloudflare/workers/queues/config changes belong in this lane.

## Validation

Run local confidence checks for touched/proof scripts if any code changes are
needed:

```text
npm exec --yes pnpm@10.32.1 -- run test:personas
npm exec --yes pnpm@10.32.1 -- run test:reports
npm exec --yes pnpm@10.32.1 -- run test:writing
git diff --check
git diff --cached --check
```

If no repo code changes are needed, still run `git diff --check` and record the
hosted route/schema proof.

## Output

Return one of:

```text
PROVED
REPAIRED AND PROVED
BLOCKED: stale deployment
BLOCKED: hosted schema/config permission
```

Include:

- web/API deployment commits;
- sanitized schema/RPC proof;
- owner readback proof;
- increment proof or explicit reason it could not be exercised;
- privacy/boundary notes;
- validation results;
- exact next wakeup target.

## Wakeup

If hosted proof succeeds, wake ARIADNE:

```text
WAKEUP A4:
Codename: ARIADNE
Summary:
- DAEDALUS proved hosted staging is ready for PR213 aggregate activity readback.
- Migration 057/table/RPC are present and owner readback includes aggregate-only
  activity.
Task:
- Rehearse the visible owner aggregate activity card on deployed Railway.
- Verify route, chat-attempt/report-created copy, desktop/mobile fit, and no
  privacy leakage.
```

If hosted proof is blocked, wake MIMIR with the exact missing permission,
variable, stale deployment, or schema failure.

## DAEDALUS Result

Completed on 2026-06-24.

Verdict:

```text
REPAIRED AND PROVED
```

Deployment freshness:

- Web `/health/deployment` returned ready `true`, branch `main`, service
  `@station/web`, commit `1368133913878befd3c6f817f11b3f4a3eb6cd5b`.
- API `/health/deployment` returned ready `true`, branch `main`, service
  `@station/api`, commit `1368133913878befd3c6f817f11b3f4a3eb6cd5b`.

Hosted schema proof and repair:

- Initial sanitized PostgREST probe showed the aggregate counter table missing:
  HTTP `404`, code `PGRST205`.
- Initial sanitized RPC probe showed
  `increment_public_persona_interaction_counters` missing: HTTP `404`, code
  `PGRST202`.
- Direct database host still failed local DNS resolution, matching the earlier
  hosted repair environment limitation.
- Pooler execution with simple-protocol/statement-cache disabled succeeded via
  the `supabase db query --db-url` command class.
- Applied migration `057_public_persona_interaction_counters.sql` as 14
  sanitized single SQL statements, including removal of the temporary probe
  table.
- Follow-up sanitized table probe returned HTTP `200`.
- Follow-up sanitized RPC probe returned HTTP `400`, code `22P02`, from an
  intentionally invalid UUID call. That proves the RPC is present without
  mutating rows.

Hosted owner/public readback proof:

- Replay owner API signin returned HTTP `200`.
- Owner `GET /personas/:id` for `station-replay-alpha-persona` returned HTTP
  `200` and included `publicInteraction.activity`.
- Before the low-impact chat proof, last-7-day and last-30-day aggregate totals
  were zero for chat attempts/successes/failures and report creations.
- Public `GET /personas/public/station-replay-alpha-persona` returned HTTP
  `200` and did not include `publicInteraction`.

Hosted increment proof:

- Low-impact signed-in public chat against
  `station-replay-alpha-persona` returned HTTP `200`.
- After that route call, owner readback reported:
  - last-7-day chat attempts `+1`;
  - last-7-day chat successes `+1`;
  - last-7-day chat failures `+0`;
  - last-30-day chat attempts `+1`.
- The proof used the public chat route; it did not mutate report statuses and
  did not insert counter rows by hand to manufacture a pass.

Privacy/boundary checks:

- Owner `publicInteraction` JSON did not include
  `public_persona_interaction_counters`, raw DB counter column names,
  `visitor-user`, `reporter_id`, `token_transactions`, `tokens_delta`, the
  proof message text, provider traces, or prompt text.
- Public persona readback still omits `publicInteraction`.
- No Redis, Cloudflare, worker, queue, config, analytics-scope, report-status,
  or raw-event-log change was made.

Validation:

- `git diff --check` passed with no repo code changes pending before this docs
  record.

Next wakeup:

- Wake ARIADNE for deployed owner aggregate activity card rehearsal.
