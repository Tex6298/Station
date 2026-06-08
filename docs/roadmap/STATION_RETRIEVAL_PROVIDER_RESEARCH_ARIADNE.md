# Station Retrieval Provider Research - ARIADNE

Date: 2026-06-08

Status: research handoff only. No implementation is opened by this note.

## Task Boundary

MIMIR asked ARIADNE to pick a dev chat model and a retrieval embedding path
for the staging/retrieval lane, using official docs first, without changing
code. This note is scoped to provider fit, dimension compatibility, Worker
adapter shape, and cache/rate-limit posture.

Station principles that matter here:

- Retrieval serves continuity, archive trust, and private Studio usefulness.
- Retrieval must not become a broad model gateway or import IntelHub scope.
- Visibility and privacy boundaries stay structural.
- Archive material must not be copied to another surface casually.

## Current Repo Contract

Station memory retrieval is currently shaped around 1536-dimensional vectors:

- `infra/supabase/migrations/001_initial_schema.sql` defines
  `memory_items.embedding vector(1536)`.
- `infra/supabase/migrations/003_rag_functions.sql` defines
  `match_memory_items(... query_embedding vector(1536), ...)`.
- `packages/ai/src/retrieval/embeddings.ts` uses
  `text-embedding-3-small` with `EMBEDDING_DIM = 1536`.
- `searchMemory` calls `match_memory_items` and falls back to keyword search
  when embeddings or pgvector fail.

This means a provider swap is safe only when the generated query and stored
memory vectors remain 1536-dimensional, or when DAEDALUS opens a schema,
generated-types, backfill, and reindex migration.

## Official Source Findings

### NVIDIA Chat

Recommended dev chat model:

`nvidia/nvidia-nemotron-nano-9b-v2`

Why:

- NVIDIA documents it as a general-purpose reasoning/chat model for RAG,
  chatbots, agents, and instruction-following work.
- It is smaller and more dev-lane appropriate than a 70B model.
- It has a 128K context length in the model card.
- Reasoning can be controlled with `/think` or `/no_think`; use `/no_think`
  for operational Station Assistant-style flows unless MIMIR explicitly wants
  reasoning traces.
- The API endpoint is OpenAI-compatible:
  `https://integrate.api.nvidia.com/v1/chat/completions`.

Required chat request shape from NVIDIA's API reference:

- `model`
- `messages`

Useful optional/request controls:

- `stream`
- `Accept: application/json` or `Accept: text/event-stream`
- Bearer auth using the local `NVIDIA_AI_API_KEY`

Terms/limits posture:

- NVIDIA API Catalog trial terms say trial access is for limited testing and
  evaluation, not production, unless a subscription or service-provider terms
  apply.
- Do not send confidential, controlled, or sensitive archive material through a
  trial service without an explicit MIMIR decision and accepted data-policy
  gate.

Secondary chat option:

`meta/llama-3.3-70b-instruct` is available in NVIDIA's API catalog and is a
quality fallback for harder drafting/reasoning probes, but it is not the first
dev-lane pick because the staging question is adapter fit and operational
reliability, not maximum model quality.

### NVIDIA Embeddings

Recommended NVIDIA embedding model if MIMIR later opens migration:

`nvidia/llama-nemotron-embed-1b-v2`

Why:

- NVIDIA documents it as the current Nemotron retriever-family embedding model.
- It is multilingual/cross-lingual, retrieval-oriented, and supports query/
  passage mode.
- The endpoint is `https://integrate.api.nvidia.com/v1/embeddings`.

Required/important embedding request shape:

- `model`
- `input`
- `input_type`: `passage` when indexing stored chunks, `query` when embedding
  a search query.
- `encoding_format` defaults to `float`.
- `truncate` defaults to `NONE`.

Dimension finding:

- `llama-nemotron-embed-1b-v2` has embedding dimension 2048 and can be
  configured to output 384, 512, 768, 1024, or 2048 dimensions.
- It does not document 1536 as an output dimension.
- The older `nvidia/llama-3.2-nv-embedqa-1b-v2` also documents 2048 max and
  configurable 384, 512, 768, 1024, or 2048 dimensions; its Build page marks
  that NIM endpoint deprecated, so it should not be selected for new Station
  work.

Verdict:

No currently verified NVIDIA free/dev embedding path is a drop-in match for
Station's `vector(1536)` schema. Use NVIDIA chat for dev if helpful, but do not
switch Station memory embeddings to NVIDIA without a migration/reindex lane.

### OpenAI Embeddings

Recommended retrieval embedding path for the current repo:

Keep `text-embedding-3-small` for memory embeddings for now.

Why:

- OpenAI documents the default vector length for `text-embedding-3-small` as
  1536.
- That exactly matches Station's schema, RPC contract, generated types, and
  current embedding helper.
- Keeping this stable avoids silent retrieval failure, mixed-dimension memory,
  or a rushed archive backfill.

### Cloudflare Retrieval Adapter

No Cloudflare-only memory retrieval GitHub repo links were supplied in this
wakeup. Until Marty or MIMIR provides links, the safest adapter patterns are:

1. Supabase-truth, Cloudflare-index mirror:
   - Keep `memory_items`, archive sources, owner IDs, and visibility state in
     Supabase.
   - Mirror vectors into Cloudflare Vectorize only as an index.
   - Store metadata needed for filters: `owner_user_id`, `persona_id`,
     visibility, source table, source ID, chunk index, provider, model,
     dimension, and updated timestamp.
   - Query Vectorize, then fetch canonical records from Station API/Supabase
     with owner and visibility checks.

2. Edge-only prototype:
   - Worker generates embeddings, queries Vectorize, and stores minimal snippet
     metadata in D1/R2.
   - This is useful for a demo or public docs search, but too risky for private
     Station memory unless auth, visibility, deletion, export, and archive
     guarantees are duplicated and accepted.

3. Provider-neutral embedding adapter:
   - Add an interface with explicit `model`, `dimension`, `inputType`, and
     `provider`.
   - Reject a vector at runtime if its dimension does not match the active
     index/schema.
   - Persist provider/model/dimension metadata so a future reindex is auditable.

Cloudflare-specific constraints:

- Vectorize indexes are created with fixed dimensions and a fixed distance
  metric; the configuration cannot be changed after creation.
- Cloudflare docs cite 1536 as a valid example dimension and list OpenAI
  `ada-002` as 1536-dimensional.
- Workers AI `@cf/baai/bge-base-en-v1.5` outputs 768-dimensional embeddings,
  so a Cloudflare-only embedding path also requires a separate index/reindex
  rather than using Station's current 1536-dimensional memory schema directly.
- Vectorize metadata filters can support owner/persona/visibility filtering,
  but those filters should not replace Station's canonical authorization checks.

## Redis / Valkey Adapter Posture

For a Cloudflare Worker adapter:

- Prefer Upstash Redis for Worker-side rate limiting, short-lived retrieval
  cache, idempotency keys, and retry counters.
- Keep Railway Redis/Valkey for Railway service-local cache or queue support,
  not as the first Worker-side dependency.

Why:

- Cloudflare's own Workers docs show an Upstash integration using
  `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, and
  `@upstash/redis/cloudflare`.
- Upstash's TypeScript SDK docs explicitly cover Cloudflare Workers.
- Upstash free tier is enough for prototypes: 256 MB and 500K monthly commands
  according to current pricing.
- Railway's Redis template is useful inside the Railway project and exposes
  `REDIS_URL`/host/user/port/password variables, but external access uses a TCP
  Proxy with billed network egress.
- Railway database templates are documented as unmanaged; backups, tuning,
  security, and monitoring remain the operator's responsibility.

Do not use Redis/Valkey as memory truth. It can cache retrieval results or rate
limits; Station memory, archive, visibility, and continuity records remain in
Supabase unless MIMIR opens a deeper architecture lane.

## Recommendation

1. Use NVIDIA only for dev/staging chat probes first:
   `nvidia/nvidia-nemotron-nano-9b-v2` through
   `https://integrate.api.nvidia.com/v1/chat/completions`, with `/no_think`
   for operational flows by default.

2. Keep OpenAI `text-embedding-3-small` for current Station memory embeddings:
   it matches the 1536-dimensional pgvector schema and active code.

3. Do not switch memory embeddings to NVIDIA in the current lane:
   `llama-nemotron-embed-1b-v2` is attractive, but verified output dimensions
   are 384/512/768/1024/2048, not 1536.

4. If MIMIR wants NVIDIA retrieval later, open a DAEDALUS migration lane:
   choose 1024 or 2048 dimensions, add provider/model/dimension metadata,
   migrate schema/RPC/generated types, backfill stored memory chunks, reindex,
   and add ARGUS gates for mixed-dimension rejection plus owner/visibility
   boundaries.

5. If MIMIR wants a Cloudflare Worker retrieval adapter, start with an ID-only
   Vectorize mirror and Supabase canonical fetch. This keeps privacy structural
   and avoids turning Cloudflare into an unreviewed archive clone.

6. Use Upstash for Worker-side Redis needs; use Railway Redis/Valkey only for
   Railway-local services unless MIMIR accepts external TCP proxy and egress
   tradeoffs.

## Questions For MIMIR

- Should NVIDIA chat be limited to staging/dev probes, or should DAEDALUS add a
  formal provider adapter with runtime selection?
- Should private archive text be barred from NVIDIA trial calls until a data
  policy is accepted?
- If NVIDIA embeddings become a goal, should Station prefer 1024 dimensions for
  storage/latency or 2048 dimensions for retrieval quality?
- Should Cloudflare Vectorize store only IDs and metadata, or are private
  snippets allowed after a separate privacy review?
- Does Marty have specific Cloudflare-only memory retrieval GitHub repos for
  ARIADNE/DAEDALUS/ARGUS to inspect?

## Source Links

- NVIDIA LLM APIs:
  https://docs.api.nvidia.com/nim/reference/llm-apis
- NVIDIA `nvidia/nvidia-nemotron-nano-9b-v2` model:
  https://docs.api.nvidia.com/nim/reference/nvidia-nvidia-nemotron-nano-9b-v2
- NVIDIA chat completions endpoint:
  https://docs.api.nvidia.com/nim/reference/nvidia-nvidia-nemotron-nano-9b-v2-infer
- NVIDIA `llama-nemotron-embed-1b-v2` model:
  https://docs.api.nvidia.com/nim/reference/nvidia-llama-nemotron-embed-1b-v2
- NVIDIA `llama-nemotron-embed-1b-v2` embedding endpoint:
  https://docs.api.nvidia.com/nim/reference/nvidia-llama-nemotron-embed-1b-v2-infer
- NVIDIA API Trial Terms:
  https://assets.ngc.nvidia.com/products/api-catalog/legal/NVIDIA%20API%20Trial%20Terms%20of%20Service.pdf
- OpenAI embeddings guide:
  https://platform.openai.com/docs/guides/embeddings
- Cloudflare Vectorize create indexes:
  https://developers.cloudflare.com/vectorize/best-practices/create-indexes/
- Cloudflare Vectorize query API:
  https://developers.cloudflare.com/api/resources/vectorize/subresources/indexes/methods/query/
- Cloudflare Workers AI `@cf/baai/bge-base-en-v1.5`:
  https://developers.cloudflare.com/ai/models/@cf/baai/bge-base-en-v1.5/
- Cloudflare Workers Upstash integration:
  https://developers.cloudflare.com/workers/databases/third-party-integrations/upstash/
- Upstash Redis TypeScript SDK deployment:
  https://upstash.com/docs/redis/sdks/ts/deployment
- Upstash Redis REST API:
  https://upstash.com/docs/redis/features/restapi
- Upstash pricing:
  https://upstash.com/pricing
- Railway Redis docs:
  https://docs.railway.com/databases/redis
- Railway database docs:
  https://docs.railway.com/databases
