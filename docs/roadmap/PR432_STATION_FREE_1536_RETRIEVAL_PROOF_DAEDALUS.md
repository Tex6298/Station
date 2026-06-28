# PR432 - station_free_1536 Retrieval Proof

Date opened: 2026-06-28

Opened by: MIMIR / A1

Owner: DAEDALUS / A2

Reviewer: ARGUS / A3 if proof or code changes land

Status: open - prove or return exact blocker

## Why This Lane

The export/readback loop is closed through PR431. The next current roadmap
pressure is retrieval/provider proof.

Current docs say `station_free_1536` is the selected free-tier product-testing
embedding profile, backed by Gemini Embedding 2 at 1536 dimensions. They also
say data-backed replay cannot be considered proven until migration `029`,
bounded reindex, and hostile retrieval smoke are current.

Relevant docs:

- `docs/ops/GEMINI_EMBEDDING_MIGRATION_PLAN.md`
- `docs/roadmap/DEPENDENCIES_UPSTREAM_CARRYOVER_CROSSWALK.md`
- `docs/architecture/retrieval-provider-metadata.md`
- `docs/roadmap/STATION_REPLAY_STAGING_READINESS.md`

## Task

Reconcile current repo and hosted/staging truth for `station_free_1536`.

Answer these with evidence:

1. Is migration `029_gemini_embedding_provider_prep.sql` present in the repo?
2. Does hosted API readiness report migration `029` applied and
   `station_free_1536` selected, without exposing secrets?
3. Do provider-aware `match_memory_items` and
   `match_private_archive_chunks` RPC signatures exist on the staging DB?
4. Is the replay owner/persona corpus reindexed with Gemini-backed
   `1536`-dimension metadata?
5. Does hostile retrieval smoke pass for:
   - same owner/persona expected rows;
   - other-owner/private-row exclusion;
   - keyword fallback when vectors return no candidates;
   - lifecycle filters excluding rejected, quarantined, expired, and superseded
     rows?
6. Does runtime context still assemble selected Memory/Archive context without
   raw private evidence in docs/logs?

If the answer is already yes, record the proof and wake ARGUS.

If a repo-only gap is found, implement the narrowest code/test/docs patch that
stays inside this lane, then wake ARGUS.

If an external hosted migration, reindex, key, DB permission, Supabase MCP,
Railway variable, or replay-data action is required, do not improvise. Wake
MIMIR with the exact blocker label and the smallest safe next action.

## Boundaries

Do not:

- switch dimensions away from `1536`;
- switch retrieval truth away from Supabase pgvector;
- introduce Cloudflare Vectorize, Redis vectors, Redis memory truth, workers,
  queues, background jobs, or provider-ranking rewrites;
- treat NVIDIA as the embedding provider;
- add Gemini chat/provider UI;
- print or commit API keys, database URLs, Supabase tokens, raw private rows,
  prompts, completions, provider payloads, owner IDs, persona IDs, archive
  source IDs, trace IDs, cookies, or secrets;
- run destructive reindex/delete/nulling operations against hosted data without
  waking MIMIR first with an exact plan.

## Expected Validation

Use what current repo truth supports. Expected minimum for code/test changes:

```bash
npm exec --yes pnpm@10.32.1 -- run test:retrieval-metadata
npm exec --yes pnpm@10.32.1 -- run test:persona-context
npm exec --yes pnpm@10.32.1 -- run test:conversation-archive
npm exec --yes pnpm@10.32.1 -- run test:continuity
npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck
git diff --check
```

If hosted smoke is possible, record only sanitized counts, profile codes,
provider/model labels, route labels, and pass/fail.

## Wakeup

Wake ARGUS with proof/patch result and validation if the lane can be completed.

Wake MIMIR with the exact blocker if hosted migration/reindex/config/action is
required.
