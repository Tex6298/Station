# PR432 - station_free_1536 Retrieval Proof Result

Date: 2026-06-28

Owner: DAEDALUS / A2

Reviewer: ARGUS / A3

Status: accepted by ARGUS

## Verdict

DAEDALUS found that the `station_free_1536` retrieval path is currently
provable for the bounded staging replay corpus.

A tiny API readback truth patch was made after proof: authenticated
`/observability/replay-readiness` now lists the PR432
`station_free_1536_retrieval_path` as setup-proven instead of continuing to
show embedding profile proof and hostile vector smoke as blockers.

## Evidence Summary

1. Migration `029_gemini_embedding_provider_prep.sql` is present in the repo.
2. Hosted `/health/deployment` returned HTTP `200`, `ready: true`,
   `station_free_1536`, provider `gemini`, embeddings configured, and migration
   readiness `ok: true`.
3. Hosted migration proof includes green `memory_rpc` and `archive_rpc` proofs.
4. `node scripts/prove-staging-migration-029.mjs` passed against staging:
   `match_memory_items` and `match_private_archive_chunks` both returned HTTP
   `200` with `rowCount: 0` for the no-data RPC signature smoke.
5. Read-only replay-corpus metadata proof found:
   - replay memory rows: `5`;
   - Gemini/1536/backfill-v2 rows: `5`;
   - archive rows: `3`;
   - non-archive rows: `2`;
   - lifecycle status counts: `4 active`, `1 rejected`.
6. Read-only hosted retrieval smoke found:
   - query embedding dimension: `1536`;
   - memory RPC rows: `3`;
   - memory rows same owner: `true`;
   - memory rows generic/non-archive only: `true`;
   - archive RPC rows: `6`;
   - archive rows same owner: `true`;
   - product context preview memory count: `4`;
   - product context preview archive count: `4`;
   - memory retrieval mode: `vector`;
   - archive retrieval mode: `vector`;
   - archive route mode: `vector`;
   - archive route chunks: `4`;
   - rejected-control text absent from product readback: `true`;
   - captured trace evidence omitted raw private corpus text: `true`.
7. Negative hosted RPC smoke found:
   - mismatched persona memory rows: `0`;
   - mismatched owner archive rows: `0`.

## Boundary

The hosted proof recorded only sanitized counts, modes, profile/provider/model
labels, and pass/fail booleans. It did not commit or document API keys,
database URLs, Supabase tokens, raw private rows, prompts, completions, provider
payloads, owner IDs, persona IDs, archive source IDs, trace IDs, cookies, or
secret values.

No migrations, reindexing, deletes, nulling operations, storage changes,
provider switches, Cloudflare/Redis/vector-backend changes, worker/queue
changes, chat UI changes, or schema changes were performed in this PR432 pass.

Code files changed:

- `apps/api/src/services/replay-readiness.service.ts`
- `apps/api/src/routes/replay-readiness.test.ts`

## Validation

Passed:

```bash
node scripts/prove-staging-migration-029.mjs
hosted /health/deployment sanitized readiness probe
hosted read-only replay-corpus metadata probe
hosted read-only retrieval smoke probe
hosted read-only negative RPC smoke probe
npm exec --yes pnpm@10.32.1 -- run test:retrieval-metadata
npm exec --yes pnpm@10.32.1 -- run test:persona-context
npm exec --yes pnpm@10.32.1 -- run test:conversation-archive
npm exec --yes pnpm@10.32.1 -- run test:continuity
npm exec --yes pnpm@10.32.1 -- run test:replay-readiness
npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck
git diff --check
```

`git diff --check` passed with CRLF normalization warnings only.

## Residual Risk

PR432 proves the current bounded staging replay corpus path. It does not prove
future embedding-provider swaps, a broader corpus reindex, Cloudflare/Redis
retrieval, production disaster recovery, managed backup, or long-term replay
quality. If the replay corpus changes, re-run the metadata and hostile
retrieval smoke before relying on the result.

## ARGUS Review

ARGUS accepted PR432 on 2026-06-28:

`docs/roadmap/PR432_STATION_FREE_1536_RETRIEVAL_PROOF_REVIEW_RESULT.md`
