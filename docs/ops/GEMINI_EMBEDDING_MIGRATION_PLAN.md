# Gemini embedding migration and rollback plan

Date: 2026-06-10

Status: corrected embedding-profile direction for replay/staging. The chosen
product-testing profile is `station_free_1536`; today that profile is backed by
Gemini because Gemini has a free tier. This plan records the work needed to make
that profile safe and testable.

## Current truth

- Active production/staging retrieval for product testing should move to the
  `station_free_1536` embedding profile over Supabase pgvector `vector(1536)`.
- Existing staging proof only covers migrations through `028`.
- Migration `029_gemini_embedding_provider_prep.sql` is a forward-compatible
  schema prep: it permits `openai` or `gemini` metadata on 1536-dimensional
  rows and adds provider-aware RPC overloads.
- The repo default is now `EMBEDDING_PROFILE_CODE=station_free_1536`.
- That profile currently resolves to Gemini for product testing, then must be
  proven for data-backed replay after migration `029`, corpus reindex, and
  hostile retrieval smoke.
- OpenAI `text-embedding-3-small` remains the `openai_1536` native/rollback
  profile for the same 1536-dimensional Supabase index shape.
- NVIDIA remains chat/model provider work; it does not replace embeddings in
  this lane.

## Current staging proof attempt

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
