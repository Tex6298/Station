# Gemini embedding migration and rollback plan

Date: 2026-06-10

Status: DAEDALUS prep note. This is not a staging switch.

## Current truth

- Active production/staging retrieval remains OpenAI `text-embedding-3-small`
  over Supabase pgvector `vector(1536)`.
- Existing staging proof only covers migrations through `028`.
- Migration `029_gemini_embedding_provider_prep.sql` is a forward-compatible
  schema prep: it permits `openai` or `gemini` metadata on 1536-dimensional
  rows and adds provider-aware RPC overloads.
- The repo default remains `EMBEDDINGS_PROVIDER=openai`.
- Gemini should not be enabled for replay until migration `029` is applied and
  the corpus reindex decision below is accepted.

## Provider switch plan

1. Confirm the replay objective requires Gemini embeddings rather than the
   current OpenAI index.
2. Apply migration `029` to staging and run no-data RPC smoke for both
   `match_memory_items` and `match_private_archive_chunks`.
3. Set staging env:
   - `EMBEDDINGS_PROVIDER=gemini`
   - `EMBEDDING_MODEL=gemini-embedding-2`
   - `EMBEDDING_DIM=1536`
   - `GEMINI_API_KEY` or `GOOGLE_API_KEY`
4. Reindex owner replay corpus into Gemini vectors with
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

## Rollback plan

1. Set `EMBEDDINGS_PROVIDER=openai` and restore the OpenAI embedding key.
2. Leave Gemini rows in place but stop writing new Gemini vectors.
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
