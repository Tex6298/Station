# PR155 - Archive Retrieval Batch Validation

Date opened: 2026-06-21
Opened by: A1 / MIMIR
Owner: DAEDALUS implements or blocks; ARGUS reviews before closeout.
Status: implemented by DAEDALUS; ready for ARGUS review

## Why This Lane

PR154 measured hosted owner context-preview timing after PR153 added sanitized
stage metadata. The result was clear enough to target the next DAEDALUS lane:

- outer context-preview latency stayed above 4s for 7 of 7 counted requests;
- trace `total` median was 3549ms;
- `archive_retrieval` dominated the timed stages with median 3207ms and
  max / rough p95 3259ms;
- `query_embedding` median was 372ms, `memory_vector_search` median was 747ms,
  `continuity` median was 188ms, and `topology_prompt_assembly` median was 0ms;
- retrieval shape stayed stable: Memory vector, Archive vector, no Memory
  fallback, Gemini `station_free_1536`, 3 Memory searched, 12 Archive searched,
  4 Continuity searched, and 5 quarantined Archive skips.

Code inspection points at the likely repo-local cost: `retrievePrivateArchive`
does one vector candidate search, then validates candidate lifecycle/source
citations row-by-row. On the replay shape that means repeated Supabase calls for
candidate lifecycle and source citation checks before only a few archive sources
are retained for runtime context.

## Goal

Reduce the `archive_retrieval` stage cost for owner runtime-context assembly
without weakening privacy, owner scope, lifecycle filtering, citation
correctness, source caps, or retrieval quality.

## Scope

DAEDALUS should inspect and patch the Archive retrieval path:

- `packages/ai/src/retrieval/archive-retrieval.ts`
- `packages/ai/src/retrieval/context-builder.ts` only if a trace/type surface
  needs to expose sanitized Archive sub-timings
- `apps/api/src/routes/archive-retrieval.test.ts`
- `apps/api/src/routes/persona-context.test.ts`
- `packages/ai/test/retrieval-metadata.test.ts`

Preferred implementation direction:

- Batch candidate lifecycle reads for candidate `memory_items` using
  owner/persona scope and candidate IDs.
- Batch citation source reads by authoritative source type:
  `import_jobs`, `persona_files`, and `archived_chat_transcripts`.
- Preserve the original candidate order, score ordering, source caps, max chunk
  limits, max character limits, and citation reasons.
- Preserve runtime lifecycle exclusion semantics, including quarantined,
  rejected, expired, superseded, missing-lifecycle, source-not-ready, and
  unauthoritative skip counts.
- Keep `includeQuarantined` behavior compatible for non-runtime archive search.
- Add focused tests that prove batched validation remains owner-scoped and does
  not return failed/pending/missing/other-owner sources.
- If useful, add sanitized Archive retrieval sub-timing metadata with stage
  names and durations only. Do not expose raw IDs or private text.

If batching proves unsafe, DAEDALUS should commit the smallest useful timing or
diagnostic improvement and wake MIMIR with the exact blocker instead of changing
candidate depth or retrieval policy by guesswork.

## Guardrails

Do not:

- reduce Archive vector candidate depth, source caps, `maxArchive`, or
  `maxCharacters` as the first optimization;
- change embedding provider, embedding model, embedding dimension, active
  profile, vector schema, vector RPC contract, or reindex behavior;
- add Redis/Upstash Memory truth, vector storage, or retrieval ranking;
- add Cloudflare, Workers, Vectorize, or queue work;
- add operational cache changes unless MIMIR opens a separate cache lane after
  this batch-validation attempt;
- add background workers, import retry repair, billing/auth/session changes, or
  broad UI changes;
- expose prompts, completions, provider payloads, private archive excerpts,
  source contents, raw owner/persona/source/trace IDs, cache keys, tokens,
  cookies, API keys, DB URLs, or secret-shaped values.

## Validation

Expected validation:

```bash
pnpm test:conversation-archive
pnpm test:persona-context
pnpm test:retrieval-metadata
pnpm typecheck
git diff --check
```

If operational cache is unexpectedly touched, also run:

```bash
pnpm test:cache
```

## Handoff Requirement

DAEDALUS should wake ARGUS with:

- what changed in Archive candidate validation/citation loading;
- proof that owner/persona scope and lifecycle/source readiness still hold;
- whether sanitized Archive sub-timings were added;
- validation results;
- any remaining hosted measurement caveat.

ARGUS should review the hostile owner/privacy paths before MIMIR opens any
hosted remeasurement lane.

## DAEDALUS Implementation

Implemented on 2026-06-21.

Archive retrieval now validates candidate metadata with owner/persona-scoped
batch reads instead of per-candidate reads:

- runtime lifecycle rows are loaded once from `memory_item_lifecycle` with
  `owner_user_id`, `persona_id`, and candidate `memory_item_id IN (...)`;
- completed import citations are loaded once from `import_jobs` with
  `owner_user_id`, `persona_id`, and source `id IN (...)`;
- processed file citations are loaded once from `persona_files` with
  `owner_user_id`, `persona_id`, and source `id IN (...)`;
- archived conversation citations are loaded once from
  `archived_chat_transcripts` with `owner_user_id`, `persona_id`, and source
  `id IN (...)`.

The candidate order, score ordering, source caps, max chunk limit, max
character limit, citation reason strings, runtime lifecycle exclusion reasons,
and `includeQuarantined` behavior are preserved. The batch lookup feeds the
existing downstream limit/cap application rather than changing candidate depth
or retrieval policy.

Focused test coverage was extended so an owner candidate pointing at another
owner's import source is not returned by the batched citation lookup. The
existing failed import, deleted import, pending file, quarantined lifecycle,
missing lifecycle, and owner-only archive/context-preview assertions remain
green.

No sanitized Archive sub-timing metadata was added in this patch. PR153 already
exposes the owner-level `archive_retrieval` stage, and PR155 specifically
removes repeated readback calls inside that stage without adding another public
trace surface.

Validation:

- `npm exec --yes pnpm@10.32.1 -- run test:conversation-archive` passed with
  35 tests.
- `npm exec --yes pnpm@10.32.1 -- run test:persona-context` passed with 8
  tests.
- `npm exec --yes pnpm@10.32.1 -- run test:retrieval-metadata` passed with 8
  tests.
- `npm exec --yes pnpm@10.32.1 -- run typecheck` passed.
- `git diff --check` passed with CRLF normalization warnings only.
