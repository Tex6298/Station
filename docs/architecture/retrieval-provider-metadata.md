# Retrieval Provider Metadata

Status: PR112 foundation, 2026-06-20.

Station keeps the active retrieval vector contract at `1536` dimensions. PR112
does not switch provider execution, ranking, vector storage, or retrieval
visibility. It records and validates the metadata needed before any future
provider or vector-backend change.

## Active Default

The active runtime metadata is defined in
`packages/ai/src/retrieval/embeddings.ts`.

Current defaults:

- profile code: `station_free_1536`
- provider metadata: `gemini`
- model metadata: `gemini-embedding-2`
- dimension: `1536`
- index name: `memory_items_embedding_1536`
- index source: `supabase_pgvector`
- backfill version: `2`

The legacy `openai_1536` profile remains a supported metadata profile for
existing rows and rollback assumptions. Both supported profiles keep the same
`1536` vector shape.

## Stored Metadata

Generated archive and memory vectors can store:

- `embedding_provider`
- `embedding_model`
- `embedding_dimension`
- `embedding_index_name`
- `embedding_index_source`
- `embedding_backfill_version`

The Supabase migrations keep existing rows valid and constrain embedded rows to
the active `1536` shape. New archive writes use
`metadataForActiveEmbedding(vector)` before insert, so rows without a generated
embedding keep metadata null while embedded rows receive the active metadata.

## Dimension Guard

`assertActiveEmbeddingVector` rejects generated vectors whose length does not
match `ACTIVE_EMBEDDING_DIMENSION`. Archive write paths rethrow that mismatch
instead of falling back to null, so mixed-dimension vectors do not enter
`memory_items`.

The current RPC contract remains `vector(1536)` for memory and private archive
retrieval.

## Backfill Contract

Future provider or vector-backend work must not silently mix incompatible
vectors. A future backfill/reindex lane should:

- add a new explicit profile/index/backfill marker;
- write new rows with the new metadata only after the matching index exists;
- keep old rows searchable through their recorded provider/model/index metadata
  until backfill completes;
- update RPC filters or adapter routing deliberately for each supported
  metadata profile;
- document rollback behavior before changing active defaults.

PR112 does not execute a backfill and does not add Cloudflare Vectorize,
Redis/Upstash vectors, background jobs, provider switching, or ranking changes.
