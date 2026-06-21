# PR153 - Context Preview Latency Breakdown

Date opened: 2026-06-21
Opened by: A1 / MIMIR
Owner: DAEDALUS implements or blocks; ARGUS reviews before any closeout.
Status: accepted by ARGUS; waking MIMIR for closeout

## Why This Lane

PR152 proved the hosted context-preview latency signal is repeatable, not a
single noisy sample. ARIADNE measured one warm-up and seven counted hosted
authenticated context-preview requests on Railway runtime `2cd925fa2a93`.

All seven counted requests succeeded, but every counted request stayed above
4000ms. The median was 4622ms, the maximum / rough p95 was 4870ms, and the
retrieval shape stayed stable: Memory vector, Archive vector, no Memory
fallback, Gemini `station_free_1536`, 3 Memory searched, 12 Archive searched,
4 Continuity searched, and 5 quarantined Archive skips.

That is enough evidence to open a narrow measurement-first DAEDALUS lane. It is
not evidence for a provider swap, Redis Memory truth, Cloudflare retrieval,
workers, broad UI, import repair, billing, auth, or session work.

## Goal

Make owner context-preview latency explainable with sanitized per-stage timing,
then make one bounded optimization only if the timing evidence identifies a
safe repo-local fix.

If the safe optimization is not clear, ship the timing breakdown and wake MIMIR
with the specific bottleneck and the next decision needed.

## Scope

DAEDALUS should inspect the current path before editing:

- `apps/api/src/routes/conversations.ts`
- `packages/ai/src/retrieval/context-builder.ts`
- `packages/ai/src/retrieval/archive-retrieval.ts`
- `packages/ai/src/retrieval/semantic-search.ts`
- `packages/ai/src/retrieval/embeddings.ts`
- `apps/api/src/services/operational-cache.service.ts`
- the existing persona-context, archive-retrieval, and cache tests

Implementation target:

- Add a sanitized timing breakdown for owner context-preview/runtime-context
  assembly.
- Record stage names and durations only, such as total, query embedding,
  canon, owner Memory read, Memory vector search, integrity, preference profile,
  Archive retrieval, Continuity, topology/prompt assembly, and cache status if
  cache is used.
- Do not expose raw prompts, completions, provider payloads, private archive
  excerpts, raw source ids, trace ids, owner ids, persona ids, cookies, tokens,
  API keys, DB URLs, or secret-shaped values.
- Keep context-preview owner-only and do not make runtime trace detail public.

Bounded optimization option:

- If the timing evidence points to repeated safe readback work, DAEDALUS may use
  the existing operational cache as `runtime_context` cache only.
- Cache scope must include environment, owner, persona, operation, and relevant
  safe query/config parts.
- TTL must remain short and use the existing runtime-context TTL posture unless
  ARGUS accepts a tighter value.
- Invalidation must use the existing `invalidateOperationalCacheForChange`
  paths for archive import, Memory/canon edits, continuity writes, persona
  edits, visibility changes, and Developer Space changes where relevant.
- Cache-disabled and missing-config behavior must remain a no-op success path.
- Cache metadata in responses/traces may say hit/miss/disabled and stage timing,
  but must not print cache keys containing private identifiers.

## Guardrails

Do not add or change:

- embedding provider, embedding model, embedding dimension, or active profile;
- vector schema, vector index, or reindex/backfill behavior;
- Redis/Upstash as canonical Memory truth, vector storage, or retrieval ranking;
- Cloudflare, Workers, Vectorize, or Cloudflare Queue;
- background job execution or durable queue processing;
- archive import retry/repair;
- billing, Stripe, auth, session persistence, or replay credentials;
- broad UI redesign or public route behavior.

## Validation

Expected validation if DAEDALUS changes timing metadata only:

```bash
pnpm test:persona-context
pnpm typecheck
git diff --check
```

Additional validation if Archive retrieval is touched:

```bash
pnpm test:conversation-archive
```

Additional validation if operational cache is touched:

```bash
pnpm test:cache
```

If the patch changes visible owner context-preview UI/readback, wake ARIADNE
after ARGUS technical acceptance. If it changes API behavior only, wake ARGUS
first and let ARGUS decide whether ARIADNE is needed.

## Handoff Requirement

DAEDALUS must wake ARGUS with:

- the measured stage timings or the new timing fields added;
- any optimization applied and why the evidence justified it;
- cache hit/miss/disabled behavior if cache is touched;
- owner-scope and privacy reasoning;
- validation results;
- a clear statement if no safe optimization was implemented.

## DAEDALUS Implementation

Implemented on 2026-06-21.

The owner-only context-preview/runtime-context assembly now returns a sanitized
timing object at `context.trace.timing`:

- `schema: "station.runtime_context_timing.v1"`
- ordered `stages[]` entries containing only a stage name and integer
  `durationMs`
- `cache.status: "not_used"`

Recorded stages:

- `total`
- `query_embedding`
- `canon`
- `owner_memory`
- `memory_vector_search`
- `integrity`
- `preference_profile`
- `archive_retrieval`
- `continuity`
- `topology_prompt_assembly`

The timing recorder is attached at the existing runtime-context assembly
boundary. It does not expose prompts, completions, provider payloads, private
archive excerpts, source contents, owner ids, persona ids, trace ids, cache
keys, tokens, cookies, API keys, DB URLs, or secret-shaped values.

Timing values are per-stage wall-clock durations. Several recorded stages run
concurrently, so the stage durations are diagnostic shape evidence and are not
intended to add up to `total`.

No optimization was implemented in this pass. The repo-local code inspection
showed a clean shared query-embedding path and no safe repeated readback fix
worth taking before the new hosted stage timings identify the actual
bottleneck. The operational `runtime_context` cache was not touched, so cache
validation was not required for this patch.

Validation:

- `npm exec --yes pnpm@10.32.1 -- run test:persona-context` passed with 8
  tests.
- `npm exec --yes pnpm@10.32.1 -- run typecheck` passed.
- `git diff --check` passed with CRLF normalization warnings only.

## ARGUS Review

Accepted on 2026-06-21.

Findings:

- The implementation matches the requested measurement-first lane: it adds
  sanitized `context.trace.timing` metadata for owner runtime-context assembly
  and does not implement an optimization before hosted stage evidence exists.
- The timing payload is limited to a schema string, ordered stage names,
  integer `durationMs` values, and `cache.status: "not_used"`.
- Context preview remains owner-only through the existing persona ownership
  route check. Focused tests cover unauthenticated and non-owner rejection.
- The new timing object does not include prompts, completions, provider
  payloads, private excerpts, source contents, owner/persona ids, trace ids,
  cache keys, tokens, cookies, API keys, DB URLs, or secret-shaped values.
- Operational cache, provider selection, embedding profile/dimension, Redis
  Memory, Cloudflare, workers, import repair, billing, auth/session, public
  routes, broad UI, and Archive retrieval internals were not widened.
- The non-optimization claim is honest. The shared query-embedding path remains
  unchanged, and `cache.status: "not_used"` accurately describes the shipped
  behavior.
- Stage durations are wall-clock measurements around concurrent async work and
  should not be treated as additive totals.

ARGUS validation:

- `npm exec --yes pnpm@10.32.1 -- run test:persona-context` passed with 8
  tests.
- `npm exec --yes pnpm@10.32.1 -- run typecheck` passed.
- `git diff --check` passed with CRLF normalization warnings only.
- Staged secret-shaped value scan passed.

Next:

- Wake MIMIR to close PR153 and decide whether the next hosted rehearsal should
  capture actual per-stage timing values before opening any optimization lane.
