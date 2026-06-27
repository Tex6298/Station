# Production Operations Readiness Delta Result

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Date: 2026-06-27

Status: COMPLETE - WAKE MIMIR

## Verdict

ARGUS PREFLIGHT

## Executive Summary

- Station has credible protected-alpha launch-core evidence, including recent
  Railway staging browser proof, but that is not the same as production
  operations readiness.
- Web/API `/health` and `/health/deployment` are the right read-only probes for
  deployment freshness; current code exposes readiness booleans, Railway
  deployment identity, app/API URLs, Supabase object checks, Stripe readiness,
  provider readiness, and Redis/cache/queue status without printing secrets.
- Docs-only commits do not need to trigger a Railway runtime deploy. Runtime or
  route-affecting commits should be treated as fresh only after web and API
  `/health/deployment` report the expected commit prefix and `ready:true`, or a
  specific waiver is recorded.
- Supabase remains the authority for private memory, archive, visibility,
  lifecycle, owner authorization, storage accounting, Developer Space records,
  and exports. The private `persona-files` bucket and auth redirect checks are
  covered by readiness probes, but current hosted truth still needs read-only
  proof before production claims.
- Upstash/Redis is accepted only as operational cache, idempotency,
  rate-limiting, and queue-state support. Redis is not Memory truth, vector
  truth, durable queue execution, or retrieval ranking truth.
- Gemini-backed `station_free_1536` is the current free-tier embedding posture;
  OpenAI remains the compatible rollback profile, and provider switching still
  needs migration/reindex discipline.
- Stripe subscription readback is coherent for test-mode protected alpha, but
  live-money posture, top-up proof, tax/invoice depth, usage billing, and raw
  identifier exposure rules remain outside production readiness.
- Durable workers, broad realtime guarantees, backup/restore rehearsal,
  Cloudflare live authorization/index mirroring, partner-ready Developer Spaces,
  and full operations monitoring remain deferred, fragile, or unproven.
- The next safest lane is an ARGUS-owned read-only operations proof preflight.
  That preflight should define exactly what can be queried, printed, and
  redacted before anyone runs fresh hosted checks.

## Readiness Matrix

| Area | Classification | Current truth | Gap or next proof |
| --- | --- | --- | --- |
| Railway web/API deployment truth | FRAGILE / PARTIAL | Recent hosted UX evidence passed web/API `/health` and `/health/deployment` at commit prefix `4575b10b`; `apps/api/src/routes/health.ts` exposes Railway identity and readiness output. | Current HEAD includes docs-only baton commits after that proof. Runtime freshness should be rechecked only for app/runtime changes or recorded as waived for docs-only commits. |
| Watched-file deploy behavior | FRAGILE / PARTIAL | Roadmap docs already warn that docs-only commits may not create a new Railway runtime deploy. | Need an explicit proof rule: docs-only commits can rely on the last accepted runtime commit; code/config/package changes need fresh web/API deployment-health evidence. |
| Supabase database and migrations | CONFIG-DEPENDENT | `buildDeploymentReadiness()` checks database connectivity and object-level migration proofs instead of relying on Supabase's migration ledger visibility. Local migrations now run through `059_project_export_manifest.sql`. | Hosted `/health/deployment` must prove current objects/RPCs. Older pooler/direct URL caveats remain relevant for CLI migration operations. |
| Private `persona-files` bucket | CONFIG-DEPENDENT | Readiness checks bucket existence and `public === false`. | Need current hosted readiness output before production claims. No broad file backup/delete proof is implied. |
| Supabase Auth redirects | CONFIG-DEPENDENT | Readiness can use `SUPABASE_ACCESS_TOKEN` and project ref to confirm site URL plus app and reset-password redirects. | Current hosted auth redirect truth is a configuration proof, not a repo-only fact. |
| Service role, JWT, and DB URL boundaries | CONFIG-DEPENDENT | API env requires Supabase URL/anon/service-role keys; readiness rejects default `JWT_SECRET`; web should never receive server-only keys. | Need preflight redaction rules before any hosted config/readiness capture. DB URL/pooler usage must stay ops-scoped. |
| Upstash/Redis | PROTECTED-ALPHA READY | `operational-cache.service.ts` supports Upstash REST cache for runtime context, idempotency, rate limits, and queue state. TCP Redis/Valkey is detected but disabled in cache until a client exists. | Do not promote Redis to Memory, vector, retrieval ranking, or durable queue truth. |
| Queue/worker posture | DEFERRED | `queueProviderStatus()` reports inline fallback, TCP queue config, or Upstash cache-only status; background job docs say broad worker execution is not implemented. | Durable worker execution, queue-provider migration, retry operations, and hosted queue observability need a separate lane. |
| Embeddings/provider posture | CONFIG-DEPENDENT | Current profile is `station_free_1536` with Gemini-compatible 1536-dimensional RPC proofs; OpenAI `openai_1536` remains rollback/native profile; NVIDIA is platform-chat/dev acceptable when configured. | Provider switching, backfill/reindex, policy changes, and embedding dimension changes remain separate operations work. |
| Stripe/billing | FRAGILE / PARTIAL | Billing, Pricing, token credits, storage quota, and subscription entitlement readback are mapped and test-mode protected-alpha evidence is accepted. | Live money, top-up payment-mode proof, tax/invoice/coupon/Connect/marketplace/usage billing, and raw Stripe identifier exposure hardening remain deferred. |
| Realtime and Developer Space observability | FRAGILE / PARTIAL | Developer Space public/owner surfaces, ingestion, usage, exports, and hosted rehearsals are protected-alpha accepted. | Partner readiness, durable realtime guarantees, live external partner traffic, and broader export guarantees remain future lanes. |
| Usage, quotas, limits, and storage accounting | FRAGILE / PARTIAL | Storage uses `reserve_storage_bytes`/`release_storage_bytes`; token credits and Developer Space usage have server readback; tier limits come from shared config. | Production entitlement enforcement, billing alignment, storage-accounting reconciliation, and top-up purchase proof remain incomplete. |
| Backup/restore and migration discipline | UNKNOWN / NEEDS PROOF | Export and archive surfaces avoid overclaiming backup. Docs contain migration and rollback notes, but no accepted restore rehearsal was found in this pass. | Open a restore-rehearsal or operations-backup lane only after preflight defines safe non-destructive proof. |
| Monitoring, logging, redaction, and AI Activity | FRAGILE / PARTIAL | AI Activity/operator readback and job-error sanitizers avoid prompts, completions, provider payloads, auth headers, URLs, and secret-shaped values. | Production log aggregation, alerting, retention, incident drills, and hosted log-readback policy are not complete. |
| Secrets/config inventory | CONFIG-DEPENDENT | The repo has a clear env-name surface and readiness emits booleans/status, not values. | Any hosted proof must list variable names only and must not print values, IDs, tokens, cookies, provider payloads, SQL output, or stack traces. |
| Cloudflare | DEFERRED | `docs/architecture/cloudflare-retrieval-adapter.md` keeps Cloudflare as disabled-safe adapter/index-mirror only, with Station/Supabase reauthorization required later. | No live Cloudflare Worker, Vectorize index, authorization authority, or private archive duplication is accepted. |
| Local Windows versus Railway/Linux | FRAGILE / PARTIAL | Local validation has been run repeatedly on Windows with CRLF warnings; Railway hosted proof is separate. | Treat local green as repo health, not deployed proof. Any Linux/Railway-only failure needs hosted evidence or CI. |

## Next Safe Lane

Name: Production Operations Read-Only Proof Preflight

Owner: ARGUS / A3

Why next: the repo has enough code and docs to answer the operations question,
but the dangerous part is proof handling. A preflight should define a
strictly read-only evidence packet before anyone queries hosted readiness or
external provider state. That keeps the next action small, prevents accidental
secret capture, and avoids turning this delta into a surprise implementation
lane.

Recommended scope:

- Define allowed read-only endpoints: web/API `/health`, web/API
  `/health/deployment`, and source/docs inspection.
- Define allowed output: HTTP status, `ok`, `ready`, short commit prefix,
  check booleans, provider/cache/queue status names, and high-level readiness
  errors such as `not_configured`, `timeout`, or `config_mismatch`.
- Define forbidden output: credential values, cookies, auth headers, raw owner
  IDs, private documents, prompts, completions, provider payloads, Stripe
  object identifiers, hosted logs, SQL rows, stack traces, or secret-looking
  values.
- Decide whether docs-only commits after the latest accepted hosted proof need
  fresh deployment proof or can be explicitly waived.
- If ARGUS accepts the preflight, wake MIMIR to choose ARIADNE hosted proof,
  DAEDALUS ops-doc patching, or no immediate ops slice.

## Do Not Open Yet

- No Supabase Auth/session rewrite.
- No Supabase schema or migration changes.
- No Redis Memory truth, Redis vector store, or Redis-backed retrieval ranking.
- No Cloudflare live Worker, Vectorize mirror, or Cloudflare authorization path.
- No provider/model/embedding default change, backfill, or reindex.
- No Stripe live-money work, top-up proof, tax/invoice expansion, or billing
  architecture rewrite.
- No durable worker/queue implementation.
- No production monitoring/logging platform or hosted log inspection lane
  before redaction rules are explicit.
- No backup/restore mutation or restore rehearsal until a separate preflight
  defines safe inputs and outputs.
- No Developer Space partner expansion or realtime guarantee work.
- No UI/product polish just because the operations delta touched the docs.

## Config Inventory By Variable Name Only

Server/API:

- `PORT`
- `API_URL`
- `NEXT_PUBLIC_APP_URL`
- `JWT_SECRET`
- `STATION_EXPOSE_AI_DEBUG`
- `STATION_ENV`

Supabase:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `SUPABASE_ACCESS_TOKEN`

Providers:

- `DEEPSEEK_API_KEY`
- `DEEPSEEK_BASE_URL`
- `DEEPSEEK_MODEL`
- `NVIDIA_AI_API_KEY`
- `NVIDIA_MODEL_BASE_URL`
- `NVIDIA_MODEL`
- `ANTHROPIC_API_KEY`
- `OPENAI_API_KEY`
- `EMBEDDING_PROFILE_CODE`
- `EMBEDDINGS_PROVIDER`
- `GEMINI_API_KEY`
- `GOOGLE_API_KEY`
- `EMBEDDING_MODEL`
- `EMBEDDING_DIM`

Stripe:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_BASIC_MONTHLY`
- `STRIPE_PRICE_BASIC_YEARLY`
- `STRIPE_PRICE_CREATOR_MONTHLY`
- `STRIPE_PRICE_CREATOR_YEARLY`
- `STRIPE_PRICE_SEEKER_MONTHLY`
- `STRIPE_PRICE_SEEKER_YEARLY`
- `STRIPE_PRICE_KEEPER_MONTHLY`
- `STRIPE_PRICE_KEEPER_YEARLY`
- `STRIPE_PRICE_CANON_MONTHLY`
- `STRIPE_PRICE_CANON_YEARLY`

Social publishing:

- `TUMBLR_CLIENT_ID`
- `TUMBLR_CLIENT_SECRET`
- `LINKEDIN_CLIENT_ID`
- `LINKEDIN_CLIENT_SECRET`
- `REDDIT_CLIENT_ID`
- `REDDIT_CLIENT_SECRET`

Cache/queue/Railway identity:

- `REDIS_URL`
- `REDIS_PRIVATE_URL`
- `VALKEY_URL`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `RAILWAY_GIT_COMMIT_SHA`
- `RAILWAY_GIT_BRANCH`
- `RAILWAY_GIT_REPO_OWNER`
- `RAILWAY_GIT_REPO_NAME`
- `RAILWAY_DEPLOYMENT_ID`
- `RAILWAY_SERVICE_NAME`
- `RAILWAY_ENVIRONMENT_NAME`

Replay proof keys referenced by staging docs:

- `STATION_REPLAY_OWNER_EMAIL`
- `STATION_REPLAY_OWNER_PASSWORD`
- `STATION_REPLAY_OWNER_ID`
- `STATION_REPLAY_OWNER_USERNAME`
- `STATION_REPLAY_CORPUS_PATH`

## Validation / Evidence

Files inspected:

- `docs/roadmap/PRODUCTION_OPERATIONS_READINESS_DELTA_DAEDALUS.md`
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/testing/VALIDATION_BASELINE.md`
- `docs/roadmap/STATION_FUTURE_LANES.md`
- `docs/roadmap/STATION_LAUNCH_CORE_ALPHA_CLOSEOUT.md`
- `docs/roadmap/builds.md`
- `docs/ops/STAGING_SETUP_BLOCKERS.md`
- `docs/architecture/background-jobs-foundation.md`
- `docs/architecture/operational-cache-foundation.md`
- `docs/architecture/cloudflare-retrieval-adapter.md`
- `docs/roadmap/UX07_BILLING_ENTITLEMENT_FEASIBILITY_RESULT.md`
- `docs/roadmap/UX09_RAILWAY_STAGING_UX_REVIEW_PACKET.md`
- `docs/roadmap/UX09_RAILWAY_STAGING_UX_REVIEW_RESULT.md`
- `apps/api/src/routes/health.ts`
- `apps/api/src/lib/env.ts`
- `apps/api/src/services/readiness.service.ts`
- `apps/api/src/services/background-jobs.service.ts`
- `apps/api/src/services/operational-cache.service.ts`
- `apps/api/src/services/storage.service.ts`
- `apps/api/src/routes/token-credits.ts`
- `apps/api/src/routes/billing.ts`
- `infra/supabase/migrations/*`

Commands and checks:

- `git status --short --branch`
- `Get-Content` source/doc inspections listed above.
- `Get-ChildItem infra/supabase/migrations`
- Targeted `rg` searches for operations, env, provider, Stripe, Redis,
  Cloudflare, backup/restore, readiness, and migration evidence.

No hosted endpoints were called, no secret values were printed, and no code,
config, schema, provider, Redis, Cloudflare, Stripe, worker, queue, UI, or
hosted data behavior was changed.
