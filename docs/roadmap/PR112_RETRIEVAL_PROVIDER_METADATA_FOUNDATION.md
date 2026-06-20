# PR112 - Retrieval Provider Metadata Foundation

Date opened: 2026-06-20
Opened by: A1 / MIMIR
Owner: DAEDALUS implements or precisely blocks, ARGUS reviews. ARIADNE rehearses
only if visible route behavior changes.
Status: closed by MIMIR on 2026-06-20

## Why This Lane

PR111 made Developer Space provider/data posture explicit. The next backend
roadmap item is BE-04 Retrieval provider metadata.

Station has discussed Gemini embeddings, OpenAI-compatible providers, NVIDIA
model routing, Cloudflare Vectorize, Redis vectors, and future reindex/backfill.
Before any embedding swap or vector backend change, Station needs durable
metadata recording provider, model, dimension, index/source, and embedding
version.

## Goal

Prepare retrieval for configurable providers without changing the active
retrieval provider.

Current default remains the existing `1536` vector retrieval behavior unless
current code says otherwise. Do not switch to Gemini, OpenAI, NVIDIA,
Cloudflare Vectorize, Redis vectors, or another provider.

## Scope

DAEDALUS should implement or precisely block:

- track embedding provider, model, dimension, index/source name, and backfill or
  embedding-version marker for generated vectors where the current schema/code
  can support it;
- reject vector writes whose dimensions do not match the active configured
  schema/index dimension;
- preserve compatibility with current `1536` vector shape and existing memory
  search behavior;
- document active default and future backfill/reindex contract;
- add focused tests for metadata defaults, accepted dimensions, rejected mixed
  dimensions, existing memory search compatibility, and no provider switch.

If a schema migration is required, keep it narrow and owner-safe. If the schema
cannot support metadata without a larger migration, document the blocker and
implement the smallest type/helper guard that is safe now.

## Non-Scope

Do not add:

- Gemini embedding execution;
- OpenAI/Gemini/NVIDIA provider switching;
- Cloudflare Vectorize;
- Redis/Upstash vector storage;
- vector backfill execution;
- background jobs;
- retrieval ranking rewrite;
- public/private visibility changes;
- private archive retrieval changes;
- provider key logging;
- raw prompt/payload logging;
- broad UI work.

## ARGUS Review Requirements

ARGUS should verify:

- current `1536` retrieval remains compatible;
- mixed-dimension writes are rejected or precisely blocked;
- metadata defaults are deterministic and documented;
- no embedding provider execution changed;
- no vector backend changed;
- no private payloads, keys, prompts, archive excerpts, unsafe ids, or raw
  provider internals are logged;
- any migration is narrow and safe for existing rows;
- validation passed.

No ARIADNE rehearsal is required if this remains API/data/test/docs only. If
visible route behavior changes, ARGUS should wake ARIADNE after technical
acceptance.

## Validation

Minimum expected validation:

```bash
npm exec --yes pnpm@10.32.1 -- run test:persona-context
npm exec --yes pnpm@10.32.1 -- run test:conversation-archive
npm exec --yes pnpm@10.32.1 -- run test:continuity
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

Add retrieval-specific package tests if touching `packages/ai` or archive
retrieval helpers.

## DAEDALUS Implementation

Implemented on 2026-06-20.

Current main already contained the narrow retrieval metadata foundation:

- `infra/supabase/migrations/028_retrieval_provider_metadata.sql` and
  `029_gemini_embedding_provider_prep.sql` add memory embedding metadata,
  constrain embedded rows to the `1536` shape, and filter vector RPCs by
  provider/model/index metadata.
- `packages/db/src/types.ts` exposes the memory metadata columns and retrieval
  RPC arguments.
- `packages/ai/src/retrieval/embeddings.ts` defines active embedding metadata,
  profile resolution, active vector assertion, and mixed-dimension rejection.
- `apps/api/src/services/archive.service.ts` stamps active embedding metadata
  on archive/memory vector writes and rethrows dimension mismatch errors.
- `packages/ai/test/retrieval-metadata.test.ts` already proves active metadata,
  `1536` RPC compatibility, one-query-embedding runtime context reuse,
  keyword fallback, Gemini REST casing, and stale override rejection.

This DAEDALUS pass added the missing durable validation and documentation:

- root `package.json` now has `test:retrieval-metadata`;
- `docs/architecture/retrieval-provider-metadata.md` documents active defaults,
  stored metadata, mixed-dimension guard behavior, and the future
  backfill/reindex contract;
- roadmap/status/baseline docs now record PR112 validation and scope.

Active default:

- profile code: `station_free_1536`
- provider metadata: `gemini`
- model metadata: `gemini-embedding-2`
- dimension: `1536`
- index name: `memory_items_embedding_1536`
- index source: `supabase_pgvector`
- backfill version: `2`

Compatibility and mixed-dimension proof:

- Current memory and private archive retrieval continue to call the existing
  `vector(1536)` RPC contract.
- `assertActiveEmbeddingVector` throws `EmbeddingDimensionMismatchError` for
  non-1536 vectors.
- Archive write paths rethrow that mismatch instead of falling back to null, so
  mixed-dimension vectors are rejected before insert.

Explicit non-scope confirmation:

- No Gemini/OpenAI/NVIDIA provider execution switch, Cloudflare Vectorize,
  Redis/Upstash vector storage, vector backfill, background job, retrieval
  ranking rewrite, visibility change, private archive retrieval change,
  provider key logging, raw prompt/payload logging, broad UI work, or visible
  route change was added.

DAEDALUS validation on 2026-06-20:

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:retrieval-metadata` | Pass | 8 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:persona-context` | Pass | 7 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:conversation-archive` | Pass | 35 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:continuity` | Pass | 5 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck passed. |
| `git diff --check` | Pass | CRLF normalization warnings only for touched files and local watcher state. |

## ARGUS Review

Accepted by ARGUS on 2026-06-20 for MIMIR closeout.

ARGUS confirmed that PR112 adds the canonical `test:retrieval-metadata` root
gate, documents the active metadata/backfill contract, and preserves current
retrieval execution. The active `1536` vector contract remains compatible,
mixed-dimension vectors are rejected through `assertActiveEmbeddingVector`, and
archive write paths rethrow dimension mismatch errors instead of inserting null
or mixed-dimension vectors.

ARGUS validation passed:

- `npm exec --yes pnpm@10.32.1 -- run test:retrieval-metadata`
- `npm exec --yes pnpm@10.32.1 -- run test:persona-context`
- `npm exec --yes pnpm@10.32.1 -- run test:conversation-archive`
- `npm exec --yes pnpm@10.32.1 -- run test:continuity`
- `npm exec --yes pnpm@10.32.1 -- run typecheck`
- `git diff --check`

ARGUS confirmed no Gemini/OpenAI/NVIDIA provider execution switch, Cloudflare
Vectorize, Redis/Upstash vector storage, vector backfill, background job,
retrieval ranking rewrite, visibility change, private archive retrieval change,
provider key logging, raw prompt/payload logging, broad UI work, or visible
route change.

## MIMIR Closeout

MIMIR closes PR112 on 2026-06-20 as the retrieval provider metadata foundation.

The next lane is a narrow Redis/Valkey/Upstash cache foundation with explicit
scope, key format, TTL, invalidation boundaries, disabled-without-config
behavior, and no canonical memory/vector-store role.
