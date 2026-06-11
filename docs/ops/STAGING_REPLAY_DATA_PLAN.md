# Staging replay data and Gemini retrieval measurement plan

Date: 2026-06-11

Status: replay seed/helper implemented for ARGUS review; live corpus seeding has
not been executed from this handoff. Setup/config blockers are closed; this lane
is about creating trustworthy replay data, not another no-data readiness probe.

## Current truth

- Public `https://stationapi-production.up.railway.app/health/deployment`
  returns `ready:true` after ARGUS accepted the Supabase Auth redirect proof.
- Migration `029` is applied and the provider-aware
  `match_memory_items`/`match_private_archive_chunks` RPCs are callable.
- Migration `030` is applied and `integrity_questions` has explicit read-only
  client RLS.
- The active product-testing embedding profile is `station_free_1536`, backed
  by Gemini for the free-tier testing lane.
- The previous RPC proof returned zero rows by design. That proves shape and
  availability only; it does not prove retrieval quality.

## DAEDALUS route audit result

DAEDALUS did not populate staging replay data in this pass. Existing UI/API
paths cannot create the full bounded corpus from a fresh replay signup without
an explicit setup helper:

- API beta signup creates a confirmed account but the profile defaults to
  `visitor`.
- Persona creation requires at least `private`.
- Space and document creation require at least `creator`.
- Developer Space creation requires `canon`.
- Persona-file archive ingestion, conversation archive, context preview,
  continuity records, discussion/comment paths, and export readback all depend
  on first having a usable owner/persona and, for the public corpus, creator
  surfaces.
- No reusable replay-account env keys or documented replay account credentials
  exist in this repo/worktree.
- The local `.env` has staging Supabase/Gemini values, but using service-role
  credentials directly to mutate tiers or seed rows would be an unreviewed
  helper path, not "existing UI/API paths."

ARGUS accepted the narrow replay seed/helper lane. MIMIR opens it as the next
setup-only implementation task before populated measurement.

## Seed/helper scope

DAEDALUS should design and implement the smallest helper that can prepare a
staging replay owner and bounded replay corpus without smuggling direct
service-role mutation into the measurement lane.

Hard constraints:

- create or reuse exactly one non-production replay owner;
- assign the minimum explicit tier needed for the bounded corpus;
- seed only owner-scoped replay rows for that owner/persona;
- write Gemini `station_free_1536` vectors with the active metadata;
- avoid committed secrets, passwords, cookies, tokens, private excerpts, prompt
  bodies, and raw archive text;
- make the helper repeatable or at least idempotent enough that re-running it
  does not create uncontrolled duplicate replay evidence;
- document the exact data categories created using sanitized labels/counts only;
- wake ARGUS for hostile review before seeded data is treated as measurement
  evidence.

## DAEDALUS helper implementation result

DAEDALUS implemented `scripts/staging-replay-seed.mjs` as setup-only helper
code. It has not been executed against staging from this handoff.

- Creates or reuses exactly one replay owner keyed by
  `STATION_REPLAY_OWNER_USERNAME`.
- Existing replay-owner reuse now requires `STATION_REPLAY_OWNER_ID` to match
  the profile id before the helper updates auth credentials or tier. This keeps
  username collisions from becoming accidental account takeover during setup.
- Requires local-only `STATION_REPLAY_OWNER_EMAIL` and
  `STATION_REPLAY_OWNER_PASSWORD` so the replay owner can later sign in for
  route measurement; those values are never printed or committed.
- Assigns `canon`, the minimum single-owner tier that can create persona,
  Space/document, and Developer Space replay surfaces.
- Reads corpus text from the ignored local path
  `docs/ops/staging-replay-corpus.local.json` by default. The committed
  `docs/ops/STAGING_REPLAY_CORPUS.example.json` is placeholders only.
- Seeds deterministic owner-scoped persona, conversation/archive transcript,
  active/excluded memory rows, continuity record, public Space/document,
  thread/comment, Developer Space node/event/snapshot, usage row, and export
  manifest.
- Writes Gemini `station_free_1536` memory vectors with provider/model/
  dimension/index/backfill metadata and emits sanitized labels/counts only.
- Adds `pnpm replay:seed:validate` for structural validation of the example
  corpus without staging mutation.

## DAEDALUS scope

Build and execute a bounded populated replay plan against staging.

1. Confirm the live setup still reports `ready:true` before touching replay
   data.
2. Create or reuse one non-production replay account.
3. Prepare one replay persona with enough source material to exercise private
   archive retrieval.
4. Ingest a small corpus that includes:
   - private archive text with two or three distinctive query anchors;
   - at least one chat/archive path that writes `memory_items`;
   - one continuity record linked to owner-owned source material;
   - one Space/document path with public-safe material;
   - one discussion/comment path;
   - one Developer Space with one node, one event, and one snapshot;
   - one owner-only export manifest;
   - one Stripe test-mode billing path if the deployed config supports it.
5. Ensure new/rebuilt replay vectors use the active embedding metadata:
   - `embedding_provider='gemini'`
   - `embedding_model='gemini-embedding-2'`
   - `embedding_dimension=1536`
   - `embedding_index_name='memory_items_embedding_1536'`
   - `embedding_backfill_version=2`
6. Run data-backed retrieval measurement through real routes:
   - `/conversations/persona/:personaId/archive-retrieval`
   - `/conversations/persona/:personaId/context-preview`
   - `/observability/replay-readiness`
   - `/observability/summary`
   - `/observability/traces`
7. Run hostile privacy smokes:
   - same owner/persona retrieves expected rows;
   - anonymous visitor retrieves nothing private;
   - a different authenticated owner retrieves nothing private;
   - wrong persona scope retrieves nothing private;
   - lifecycle filters still exclude rejected, quarantined, expired, or
     superseded memory rows where that data is available.
8. Capture non-secret evidence only: route status, counts, retrieval mode,
   provider/model/profile, latency/cost metadata, skipped-source counts, and
   human relevance ratings. Do not commit private excerpts, prompt bodies,
   raw archive text, API keys, cookies, tokens, or account passwords.

## Acceptance evidence

DAEDALUS should update these docs with sanitized results:

- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/testing/VALIDATION_BASELINE.md`
- `docs/ops/STAGING_REPLAY_READINESS.md`
- this file, if the data plan changes during execution

Minimum local/remote commands for the handoff:

```bash
curl.exe -fsS --max-time 30 https://stationapi-production.up.railway.app/health/deployment
npx --yes pnpm@10.32.1 test:replay-readiness
npx --yes pnpm@10.32.1 test:health
npx --yes pnpm@10.32.1 test:storage
npx --yes pnpm@10.32.1 test:persona-context
npx --yes pnpm@10.32.1 test:conversation-archive
npx --yes pnpm@10.32.1 test:continuity
git diff --check
```

When the helper is implemented, DAEDALUS should run the local helper tests or
the narrowest safe validation available, update this plan with sanitized setup
evidence, and wake ARGUS. Populated measurement resumes only after ARGUS accepts
the helper.

## Out of scope

- Switching away from `station_free_1536` unless MIMIR opens a rollback lane.
- Treating Cloudflare as required. Current recommendation remains: defer
  Cloudflare retrieval unless a replay objective explicitly needs it.
- Broad UX redesign. Capture usability notes during replay, then hand them to
  ARIADNE if they become staging blockers.
- Optimizing model ranking before basic owner-scoped populated retrieval is
  proven.
