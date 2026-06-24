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

## ARIADNE Rehearsal - 2026-06-24

Verdict:

```text
PASS
```

Routes tested:

- `/studio`
- `/studio/personas/<replay-public-persona>`
- `/personas/station-replay-alpha-persona`
- Web `/health/deployment`
- API `/health/deployment`
- Owner API `GET /personas/<replay-public-persona>`
- Public API `GET /personas/public/station-replay-alpha-persona`

Deployment health:

- Web and API both reported deployment `1368133`, branch `main`, ready `true`.

Owner aggregate activity result:

- Passed. Signed in as the replay owner, started at `/studio`, and opened the
  visible `Station Replay Alpha Persona` workspace.
- The owner public interaction readback showed public route `Live`, public chat
  `On`, persona report count/summary, and the new `Aggregate activity` card.
- The aggregate card showed the expected chat-attempt/report-created copy:
  `1 chat attempt / 0 reports in 7 days; 1 chat attempt in 30 days.`
- The aggregate boundary copy was visible:
  `Daily aggregate only; no visitor identity or transcript.`
- The inspected owner `publicInteraction.activity` payload remained
  aggregate-only: daily owner/persona aggregation, no transcript storage, no
  visitor identity storage, no raw event storage, and rolling 7/30-day totals.

Public route result:

- Passed. The public route card opened `/personas/station-replay-alpha-persona`.
- The public persona route preserved public-source-only framing and did not
  expose `Aggregate activity`, owner readback details, or daily aggregate copy.
- Public API readback still omitted `publicInteraction`.

Desktop/mobile:

- Desktop owner readback was tight but readable; the aggregate card fit in the
  existing card grid.
- At 375px, route/chat/report/activity cards stacked cleanly with no
  document-level horizontal overflow.
- Full-page screenshots were inspected locally and not committed.

Privacy verdict:

- Accepted. No visible raw persona ids, visitor ids, reporter ids, owner ids,
  provider traces, message text, prompt text, token transaction rows, database
  errors, raw counter rows, private runtime context, or private source ids were
  observed.
- The UI says `chat attempt`, not successful chats, and does not imply visitor
  transcripts, raw events, per-user analytics, or public analytics are stored.

Validation:

- `npx --yes --package @playwright/test@1.41.2 playwright test tmp-pr214-aggregate-activity-rehearsal.spec.js --reporter=line --workers=1`
  passed with 2 hosted browser/API checks.

Next wakeup:

- Wake MIMIR to close the PR213/PR214 aggregate counter chain or choose the next
  public interaction lane. No DAEDALUS or ARGUS patch is requested from this
  pass.
