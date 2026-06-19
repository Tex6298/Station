# PR71 - Live Config Readiness Refresh

Date opened: 2026-06-19
Opened by: A1 / MIMIR
Owner: DAEDALUS proves and documents, ARGUS reviews. ARIADNE is not needed
unless a user-facing flow changes.
Status: accepted by ARGUS; ready for MIMIR sequencing

## Why This Lane

PR70 closed the public-story caveats. Marty has confirmed Stripe test config
and Upstash Redis config are now available. The repo also already carries
accepted Stripe, Redis, provider-policy, memory/retrieval, archive/import, and
replay-readiness lanes.

Do not reopen those lanes just because config exists. PR71 exists to record the
current live deployment truth and decide whether config creates a concrete
repair lane.

MIMIR's preliminary public probes on 2026-06-19 found:

- web `/health` returned `ok:true`;
- web `/health/deployment` returned `ok:true`, `ready:true`, service
  `@station/web`, runtime commit `f830041df118c4e3e63cb1d9b5985e2ffb2121b7`;
- API `/health/deployment` returned `ok:true`, `ready:true`, service
  `@station/api`, runtime commit `f830041df118c4e3e63cb1d9b5985e2ffb2121b7`;
- Supabase URL, anon key, service-role key, database URL, JWT secret,
  `persona-files` private bucket, public URLs, and Supabase Auth redirects were
  reported ready by sanitized readiness booleans;
- embedding readiness reported `station_free_1536`, provider `gemini`,
  `embeddingsConfigured:true`, `geminiEmbeddings:true`,
  `openaiEmbeddings:false`;
- platform chat readiness reported `nvidiaProvider:true`;
- Stripe readiness reported billing secrets and all Basic/Creator/Canon monthly
  and yearly price IDs configured;
- Redis readiness reported `upstashRest:true`, operational cache enabled as
  `upstash_rest`, and worker queue not ready because Upstash REST is cache-only
  with inline fallback.

## Goal

Produce one accepted current-truth evidence note answering:

- Is deployed staging currently configured for Supabase, Gemini embeddings,
  NVIDIA platform chat, Stripe test billing, and Upstash operational cache?
- Is any config still blocking replay/productization?
- Does any measured route justify opening code work now?

## Scope

DAEDALUS should:

- rerun public web/API health and deployment readiness probes;
- run local focused tests for the same surfaces:
  - `test:health`;
  - `test:replay-readiness`;
  - `test:billing`;
  - operational-cache service tests;
  - provider-router and retrieval-metadata tests if relevant;
- record sanitized evidence only: booleans, provider labels, readiness status,
  runtime commit/service, command results, and explicit caveats;
- reconcile the result against PR3 Stripe, PR4 Redis, PR5 provider policy, PR29
  live replay refresh, PR66 memory observability closeout, and PR70 public story
  closeout;
- recommend exactly one next step:
  - no code now;
  - one config-specific repair;
  - one Stripe test-mode smoke refresh;
  - one Upstash/operational-cache follow-up;
  - one embedding/profile/reindex smoke follow-up;
  - one replay/user-facing rehearsal.

## Non-Scope

- Do not print or commit secrets, URLs containing session credentials, Stripe
  IDs, customer IDs, subscription IDs, webhook bodies, JWTs, cookies, owner IDs,
  persona IDs, API keys, or `.env` values.
- Do not run live-money billing.
- Do not add a provider marketplace, BYOK secret store, model gateway, Gemini
  chat provider, or hosted open-source model runtime.
- Do not promote Redis/Upstash to memory truth.
- Do not add BullMQ/worker infrastructure from Upstash REST alone.
- Do not open Cloudflare retrieval, Vectorize, parser/OAuth, social posting,
  Project/DexOS, broad UI, or public/private policy changes.
- Do not change product code unless a precise failing readiness route or test
  names the minimal repair.

## Acceptance

ARGUS can accept PR71 if:

- live readiness evidence is sanitized and current;
- Stripe test readiness is reconciled with PR3 without overclaiming production
  billing;
- Upstash readiness is reconciled with PR4 as operational cache, not queue or
  memory truth;
- Gemini/NVIDIA readiness is reconciled with PR5 and the current embedding/chat
  split;
- any remaining blocker is concrete, named, and assigned to a single next lane;
- no secrets or private replay data are committed.

## Handoff

Wake ARGUS with:

- live route set and deployment identity;
- sanitized readiness booleans/status labels;
- validation commands/results;
- whether code changed;
- one ranked next recommendation;
- privacy statement.

If a concrete implementation repair is needed before review, keep it narrow and
name the failing route/test in the handoff. If there is no repair, this is a
docs/evidence lane.

## DAEDALUS Evidence Refresh

Completed on 2026-06-19 as a docs/evidence lane. No product code changed.

### Live Public Probes

Sanitized Railway readiness evidence from public routes:

| Route | Result | Sanitized evidence |
| --- | --- | --- |
| Web `/health` | Pass | `ok:true`. |
| API `/health` | Pass | `ok:true`. |
| Web `/health/deployment` | Pass | `ok:true`, `ready:true`, service `@station/web`, branch `main`, environment `production`, commit `f830041df118c4e3e63cb1d9b5985e2ffb2121b7`. |
| API `/health/deployment` | Pass | `ok:true`, `ready:true`, service `@station/api`, branch `main`, environment `production`, commit `f830041df118c4e3e63cb1d9b5985e2ffb2121b7`. |

Sanitized API readiness booleans/status:

| Surface | Current reported truth |
| --- | --- |
| Database | Configured and ready. |
| Migrations | Ready; latest proof `025-037 public_schema_object_rpc_and_document_version_proof`. |
| Storage | `persona-files` bucket exists and is private. |
| Supabase Auth redirects | Management API/project/app URL configured; site URL, app redirect, and password reset redirect all ready. |
| Public URLs | App and API public URL checks ready. |
| Embeddings | `station_free_1536`, provider `gemini`, configured; Gemini embeddings true, OpenAI embeddings false. |
| Platform chat | Platform chat true; NVIDIA true; Anthropic and DeepSeek false. |
| Stripe | Billing secrets true; Basic/Creator/Canon monthly and yearly price IDs true; Stripe readiness true. |
| Redis/cache | Railway Redis false; Upstash REST true; Redis configured true; operational cache enabled as `upstash_rest`. |
| Queue/worker | Upstash REST reports `upstash_rest_cache_only`; worker queue is not ready, queue configured false, inline fallback true. |

No secrets, Stripe/customer/subscription IDs, session URLs, webhook bodies, JWTs,
cookies, owner/persona IDs, raw private data, or `.env` values were printed or
recorded.

### Local Validation

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:health` | Pass | 16 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:replay-readiness` | Pass | 1 test passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:billing` | Pass | 4 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/services/operational-cache.service.test.ts packages/ai/test/provider-router.test.ts packages/ai/test/retrieval-metadata.test.ts` | Pass | 22 tests passed. |

### Reconciliation

- PR3 Stripe paid-path proof remains bounded to Stripe test-mode readiness and
  server-controlled billing routes. PR71 confirms the deployed API now reports
  billing secrets and every Basic/Creator/Canon monthly/yearly price configured,
  but it does not claim live-money or production billing readiness.
- PR4 Redis operational boundary remains correct: Upstash REST is configured
  and operational cache is enabled, but it is not memory truth and not a
  BullMQ-compatible worker queue.
- PR5 provider policy remains split: Gemini is the active
  `station_free_1536` embedding provider, while NVIDIA is the platform chat
  provider. PR71 does not add a provider marketplace, BYOK store, Gemini chat
  route, or hosted model runtime.
- PR29 live replay refresh is strengthened on configuration truth: the current
  deployed runtime reports Supabase/database/storage/auth redirects, Gemini
  embeddings, NVIDIA platform chat, Stripe test billing, and Upstash cache as
  ready. PR71 still does not print credentialed replay data or prove every
  private replay workflow.
- PR66 memory observability closeout remains intact: this refresh records
  readiness/config truth and does not redesign memory, expose private
  observability, add Redis memory truth, or open Cloudflare/provider/worker
  work.
- PR70 public story closeout remains intact: runtime `f830041d` is deployed,
  and this refresh does not change public Space, Discover, forum, or route
  behavior.

### Verdict

No measured route or focused test justifies a code repair lane now. The current
Railway runtime reports ready for Supabase, Gemini embeddings, NVIDIA platform chat,
Stripe test billing, and Upstash operational cache. The only caveat is expected
and already documented: Upstash REST is cache-only, with inline fallback, and is
not a worker queue or memory source of truth.

Recommended next step: run one replay/user-facing rehearsal against the current
runtime to prove the now-configured stack in the real protected-alpha story.

## ARGUS Review

Accepted on 2026-06-19 as a docs/evidence lane.

- ARGUS rechecked the public web/API health and deployment endpoints. Both
  services report `ok:true`, deployment readiness reports `ready:true`, branch
  `main`, services `@station/web` and `@station/api`, and runtime commit
  `f830041df118c4e3e63cb1d9b5985e2ffb2121b7`.
- ARGUS confirmed the API readiness response supports the documented sanitized
  status: database, migration proof, private `persona-files` storage, Supabase
  Auth redirects, public URLs, Gemini `station_free_1536` embeddings, NVIDIA
  platform chat, Stripe test billing/prices, and Upstash operational cache are
  ready/configured.
- ARGUS confirmed Upstash is framed correctly as REST cache with inline
  fallback, not a BullMQ worker queue and not memory truth.
- ARGUS corrected the verdict wording from `current staging` to `current
  Railway runtime` because the deployment readiness environment is
  `production`.
- No secrets, deployment IDs, Stripe/customer/subscription IDs, session URLs,
  webhook bodies, JWTs, cookies, owner/persona IDs, raw private data, or `.env`
  values were added to the committed evidence.

ARGUS validation:

```bash
Invoke-RestMethod https://stationweb-production.up.railway.app/health
Invoke-RestMethod https://stationapi-production.up.railway.app/health
Invoke-RestMethod https://stationweb-production.up.railway.app/health/deployment
Invoke-RestMethod https://stationapi-production.up.railway.app/health/deployment
npm exec --yes pnpm@10.32.1 -- run test:health
npm exec --yes pnpm@10.32.1 -- run test:replay-readiness
npm exec --yes pnpm@10.32.1 -- run test:billing
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/services/operational-cache.service.test.ts packages/ai/test/provider-router.test.ts packages/ai/test/retrieval-metadata.test.ts
git diff --check
```

ARGUS recommendation: MIMIR should open one replay/user-facing rehearsal against
the current Railway runtime. Do not open a code repair lane from PR71 unless the
rehearsal finds a concrete route, role, expected/actual defect.
