# Gemini embedding migration and rollback plan

Date: 2026-06-10

Status: PR432 proof current for the bounded staging replay corpus. The chosen
product-testing profile is `station_free_1536`; today that profile is backed by
Gemini because Gemini has a free tier. This plan remains the historical
migration/rollback record.

## Current truth

- Active production/staging retrieval for product testing should move to the
  `station_free_1536` embedding profile over Supabase pgvector `vector(1536)`.
- PR432 proves the current bounded staging replay corpus on
  `station_free_1536`: migration `029` is applied, hosted readiness is green,
  replay memory rows are Gemini/1536/backfill-v2, and read-only hostile
  retrieval smoke passed without recording raw private corpus text.
- Migration `029_gemini_embedding_provider_prep.sql` is a forward-compatible
  schema prep: it permits `openai` or `gemini` metadata on 1536-dimensional
  rows and adds provider-aware RPC overloads.
- The repo default is now `EMBEDDING_PROFILE_CODE=station_free_1536`.
- That profile currently resolves to Gemini for product testing. Future corpus
  changes or provider/dimension changes still need scoped reindex and hostile
  retrieval smoke before relying on the new data.
- OpenAI `text-embedding-3-small` remains the `openai_1536` native/rollback
  profile for the same 1536-dimensional Supabase index shape.
- NVIDIA remains chat/model provider work; it does not replace embeddings in
  this lane.

## PR432 staging retrieval proof

DAEDALUS completed the PR432 proof on 2026-06-28:

`docs/roadmap/PR432_STATION_FREE_1536_RETRIEVAL_PROOF_RESULT.md`

Sanitized result:

- hosted `/health/deployment` returned `ready:true`, `station_free_1536`,
  provider `gemini`, embeddings configured, and green `memory_rpc` plus
  `archive_rpc`;
- `node scripts/prove-staging-migration-029.mjs` passed for both
  provider-aware RPCs;
- the replay corpus had `5` replay memory rows and all `5` used
  Gemini/1536/backfill-v2 metadata;
- read-only hosted retrieval smoke returned vector-mode memory/archive
  readback, same-owner rows, rejected-control absence, and no raw private
  corpus text in captured trace evidence;
- negative RPC smoke returned zero rows for mismatched persona memory and
  mismatched owner archive queries.

No migration, reindex, delete, nulling operation, provider switch, or
infrastructure change was performed in PR432.

## Historical staging proof attempt

DAEDALUS rechecked staging on 2026-06-11 after MIMIR opened the migration `029`
proof lane.

- Supabase MCP apply is blocked in this shell by missing OAuth authorization.
- Supabase CLI linked-project apply is blocked because the CLI is not logged in
  or linked.
- Supabase CLI explicit-`DATABASE_URL` apply is blocked from this shell because
  the direct Supabase database host resolves only to IPv6 and the CLI cannot
  connect from this machine.
- Public `/health/deployment` reports
  `embeddingProfileCode=station_free_1536`, `embeddingProvider=gemini`,
  `readiness.migrations.ok=false`, and `readiness.migrations.error=query_failed`.
- Direct PostgREST RPC proof fails with `PGRST202` for the provider-aware
  `match_memory_items` and `match_private_archive_chunks` signatures. The hints
  show only the pre-029 signatures are present in the schema cache.

The exact blocker and ready-to-run apply/proof checklist live in
`docs/ops/STAGING_MIGRATION_029_PROOF.md`.

## Provider switch plan

1. Confirm staging env selects the free testing profile.
2. Apply migration `029` to staging and run no-data RPC smoke for both
   `match_memory_items` and `match_private_archive_chunks`.
3. Set staging env:
   - `EMBEDDING_PROFILE_CODE=station_free_1536`
   - `EMBEDDING_MODEL` blank or unset unless deliberately overriding within
     the selected profile
   - `EMBEDDING_DIM=1536`
   - `GEMINI_API_KEY` or `GOOGLE_API_KEY`
4. Reindex owner replay corpus into free-profile vectors with
   `embedding_provider='gemini'`, `embedding_model='gemini-embedding-2'`,
   `embedding_dimension=1536`, `embedding_index_name='memory_items_embedding_1536'`,
   and `embedding_backfill_version=2`.
5. Run hostile retrieval smoke:
   - same owner/persona vector retrieval returns expected Gemini rows;
   - other owner/persona returns no private rows;
   - keyword fallback still works when vector retrieval returns no candidates;
   - lifecycle filters still exclude rejected, quarantined, expired, and
     superseded memory rows.
6. Run replay evidence with counts, modes, ratings, and sanitized labels only.
   Do not store private excerpts, prompts, or raw archive content in evidence.

## OpenAI rollback plan

1. Set `EMBEDDING_PROFILE_CODE=openai_1536` and restore the OpenAI embedding key.
2. Leave free-profile rows in place but stop writing new free-profile vectors.
3. If Gemini rows cause ranking confusion, null only Gemini vector fields for
   the replay owner/persona or restore OpenAI vectors from the last export:
   - `embedding=null`
   - `embedding_provider=null`
   - `embedding_model=null`
   - `embedding_dimension=null`
   - `embedding_index_name=null`
   - `embedding_index_source=null`
   - `embedding_backfill_version=null`
4. Run OpenAI no-data and data-backed retrieval smoke again.
5. Keep migration `029` in place unless the constraint itself is proven harmful;
   it is backward-compatible for the OpenAI default path.

## Notes

- Gemini Embedding 2 defaults to larger vectors but supports reduced output
  dimensions, including 1536, which keeps the existing pgvector index shape.
- For Gemini 2, Station formats retrieval queries and stored documents
  differently before embedding so query vectors and document vectors are not
  silently mixed.
- Gemini chat/provider support remains separate from embedding support.
