# PR304 - API Readiness Migration Timeout

Owner: DAEDALUS
Opened by: MIMIR
Date: 2026-06-25
Status: Accepted by ARGUS
Accepted: 2026-06-25

## Trigger

ARIADNE attempted PR303 Hosted Selected Pair Finalizer Rerun and blocked before
the product probe.

Hosted freshness passed for the required runtime commit:

- Web `/health/deployment`: `ready:true`, `main`, commit
  `9172e3804d4d`.
- API `/health`: `ok:true`.
- API `/health/deployment`: HTTP `200`, `main`, commit `9172e3804d4d`.

But API `/health/deployment` reported `ready:false` because:

```text
readiness.migrations.ok=false
readiness.migrations.error=timeout
```

All other non-secret readiness checks in that response were green or accepted
non-blocking caveats: database, private `persona-files` bucket, public URLs,
Supabase auth redirects, Stripe test config, NVIDIA chat, Gemini
`station_free_1536` embeddings, JWT secret, and Upstash REST cache.

## Current Code Shape

The relevant code is in `apps/api/src/services/readiness.service.ts`.

`checkMigrationState()` calls `checkBackendMigrationObjects()`, which proves
public schema/RPC availability rather than relying on the Supabase migration
ledger. Under the active `station_free_1536` embedding profile it checks:

- `memory_items` selected migration/backfill/vector columns,
- `developer_spaces.provider_policy`,
- `documents.version`,
- `document_versions` version columns,
- `match_memory_items(...)`,
- `match_private_archive_chunks(...)`.

Each check is wrapped with `CHECK_TIMEOUT_MS = 1500`.

The hosted symptom is therefore a migration-object/RPC proof timeout, not a
missing deployed commit, missing config, failed `/health`, or failed storage/auth
readiness.

## Task

Inspect and repair the readiness failure so ARIADNE can rerun PR303 product
evidence without burning hosted probes on a false deployment block.

Required behavior:

- Preserve migration proof. Do not simply drop migration readiness from
  `ready`.
- Preserve secret safety. Do not expose SQL, database URLs, tokens, cookies, raw
  ids, prompts, completions, provider payloads, or private source bodies.
- Preserve the PR303 product bar. Do not loosen exact selected-pair recall.
- Make the migration readiness failure actionable enough to distinguish object
  proof timeout from missing object/RPC proof while staying non-secret.
- Avoid adding hosted probing, provider/model changes, embedding changes,
  retrieval/context changes, schema/seed/import changes, Redis/Cloudflare
  changes, billing/Stripe changes, or UI changes unless a tiny readiness-only
  code path requires it.

Reasonable fixes may include one or more of:

- increasing or splitting the readiness timeout for migration object/RPC proof,
- running independent object proofs in parallel,
- returning sanitized per-proof status codes such as `memory_columns`,
  `developer_space_policy`, `document_versions`, `memory_rpc`, and
  `archive_rpc`,
- ensuring a slow proof does not mask which proof failed,
- adding focused tests for timeout/error reporting and ready gating.

## Validation

Run the focused readiness checks:

```bash
npm exec --yes pnpm@10.32.1 -- run test:health
npm exec --yes pnpm@10.32.1 -- run test:replay-readiness
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- run lint
git diff --check
git diff --cached --check
```

If you touch only docs after inspection, explain why no code changed and still
run whitespace checks.

## Result File

Write:

`docs/roadmap/PR304_API_READINESS_MIGRATION_TIMEOUT_RESULT.md`

Include:

- root cause or best-supported hypothesis,
- code paths inspected,
- files changed,
- validation run,
- residual hosted/deploy risk,
- exact next-owner recommendation.

## Wakeup

Wake ARGUS for hostile review if code changes.

Wake MIMIR directly only if the right answer is no code change or an external
Railway/Supabase transient/config wait that MIMIR must coordinate.
