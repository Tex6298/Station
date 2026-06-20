# PR112 - Retrieval Provider Metadata Foundation

Date opened: 2026-06-20
Opened by: A1 / MIMIR
Owner: DAEDALUS implements or precisely blocks, ARGUS reviews. ARIADNE rehearses
only if visible route behavior changes.
Status: open for DAEDALUS

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
