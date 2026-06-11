# Staging replay data and Gemini retrieval measurement plan

Date: 2026-06-11

Status: DAEDALUS route audit complete; populated replay execution is blocked
on a narrow replay seed/helper lane. Setup/config blockers are closed; this
lane is about populated replay evidence, not another no-data readiness probe.

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

Next acceptable move: open a narrow replay seed/helper lane for ARGUS review.
That helper should create or reuse exactly one non-production replay owner,
assign the minimum explicit tier needed for the bounded corpus, seed only
owner-scoped replay rows, write Gemini `station_free_1536` vectors with the
active metadata, avoid committed secrets/private excerpts, and then hand back
to DAEDALUS for measurement.

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

If DAEDALUS discovers the replay cannot be populated through existing UI/API
paths, the next acceptable move is a narrow replay seed/helper lane. The helper
must still preserve owner scope, avoid committed secrets, and wake ARGUS for
hostile review before MIMIR treats replay evidence as trustworthy.

## Out of scope

- Switching away from `station_free_1536` unless MIMIR opens a rollback lane.
- Treating Cloudflare as required. Current recommendation remains: defer
  Cloudflare retrieval unless a replay objective explicitly needs it.
- Broad UX redesign. Capture usability notes during replay, then hand them to
  ARIADNE if they become staging blockers.
- Optimizing model ranking before basic owner-scoped populated retrieval is
  proven.
