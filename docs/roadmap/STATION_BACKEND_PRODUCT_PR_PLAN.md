# Station Backend/Product PR Plan

Date: 2026-06-15

Owner: MIMIR for sequencing. DAEDALUS implements bounded lanes. ARGUS reviews
hostile paths and overclaims. ARIADNE runs human-eye rehearsals only when a lane
changes the user journey or exposes a staging-facing defect.

Status: Source-of-truth sequence for the next backend/product lanes after the
accepted staging replay. This plan treats the current Railway staging replay as
alpha-proof, not product-complete.

## Sequencing Rule

Do not reopen broad UI or "backend not built" churn from the accepted staging
replay. Open work from this plan, from fresh human-eye defects, or from concrete
live replay evidence.

## PR 0 - Staging Alpha Closure And Source/Live Evidence Alignment

Status: accepted by ARGUS in PR157 on 2026-06-21 for MIMIR closeout. See
`docs/roadmap/PR157_STAGING_ALPHA_EVIDENCE_REFRESH.md` and
`docs/roadmap/STATION_LAUNCH_CORE_ALPHA_CLOSEOUT.md`.

Goal: close the current staging replay lane as alpha-proof and stop it being
reopened as "backend not built."

Scope:

- Add or update one concise staging status document.
- Record current Railway, Supabase, Gemini, NVIDIA, Stripe, and Redis readiness
  claims with source links or live commands.
- Add exact replay evidence links or commands.
- Add deployment identity/readiness evidence if live endpoints exist but repo
  docs do not reflect them.
- Clarify that current replay is alpha-proof, not product-complete.

Do not:

- Reopen UI.
- Rebuild replay.
- Add new product lanes.

Validation:

- `npx --yes pnpm@10.32.1 test:health`
- `npx --yes pnpm@10.32.1 test:replay-readiness`
- `npx --yes pnpm@10.32.1 --filter @station/api build`
- `npx --yes pnpm@10.32.1 --filter @station/web build`
- Live `/health` and `/health/deployment` checks for web and API.
- `git diff --check`

Exit:

- The team has one source-backed status saying staging replay is good enough for
  alpha proof, and remaining backend work is optimization/productization.

Current PR157 result:

- Public Railway web/API health and deployment endpoints return HTTP 200,
  `ok:true`, and deployment `ready:true` at commit `508b4acc2dbe`.
- API readiness reports Supabase database, migration proof, private
  `persona-files` storage, Supabase Auth redirects, Gemini
  `station_free_1536` embeddings, NVIDIA platform chat config, Stripe test
  config, and Upstash REST operational cache configured at accepted proof
  levels.
- PR156 closed the immediate Archive-retrieval latency loop: outer median
  1864ms, trace `total` median 892ms, `archive_retrieval` median 531ms, and
  0 of 7 counted requests above 3000ms.
- Stripe paid activation was later proven in bounded test mode by PR181 using a
  clean non-production account: hosted Checkout completed, Checkout creation
  alone did not grant entitlement, webhook-backed subscription state produced
  `canon/active`, and `/auth/me` read the activated tier. The dirty replay
  owner remains dirty and untouched.
- This is protected-alpha proof, not production readiness or product
  completeness.

## PR 1 - Replay Memory/Retrieval Quality Pass

Status: accepted by ARGUS on 2026-06-18 and closed by MIMIR with the
recall-depth caveat preserved. See
`docs/roadmap/PR26_REPLAY_MEMORY_RETRIEVAL_QUALITY.md`.

Goal: make the next replay feel meaningfully smarter, not just green.

Scope:

- Improve retrieval ranking over existing evidence and memory chunks.
- Reduce stale, noisy, or context-leaking recalls.
- Add clearer retrieval trace output:
  - selected memories,
  - rejected memories,
  - stale, superseded, quarantined, or expired counts,
  - reason each selected item was used.
- Add a replay fixture proving the answer improves because the right continuity
  or memory was recalled.
- Keep Gemini free `1536` staging profile as the intended staging path, without
  breaking OpenAI-compatible rollback/paid profiles.

Do not:

- Introduce Redis memory truth.
- Introduce Cloudflare retrieval as a new primary path.
- Rewrite the whole retrieval architecture.

Validation:

- Focused retrieval/context fixture added to the existing test family.
- `npx --yes pnpm@10.32.1 test:persona-context`
- `npx --yes pnpm@10.32.1 test:conversation-archive`
- `npx --yes pnpm@10.32.1 test:continuity`
- `npx --yes pnpm@10.32.1 --filter @station/api build`
- `git diff --check`

Exit:

- Founder/user replay can show: Station remembered the right thing, ignored the
  wrong thing, and explained why.

## PR 2 - Archive/Import Robustness For Replay Safety

Status: accepted by ARGUS on 2026-06-18 and closed by MIMIR with the
protected-alpha inline/batch caveat preserved. See
`docs/roadmap/PR27_ARCHIVE_IMPORT_ROBUSTNESS.md`.

Goal: prevent bad imports from poisoning memory/retrieval.

Scope:

- Make archive/import idempotent where practical.
- Add duplicate detection or safe overwrite behavior.
- Add partial-failure reporting.
- Make failed imports visible without silently degrading retrieval.
- Add replay fixtures for:
  - clean import,
  - duplicate import,
  - partial import failure,
  - retrieval after import.

Do not:

- Build a full worker queue yet.
- Build large async orchestration unless replay pain proves it necessary.

Validation:

- Focused archive/import tests.
- `npx --yes pnpm@10.32.1 test:storage`
- `npx --yes pnpm@10.32.1 test:conversation-archive`
- `npx --yes pnpm@10.32.1 test:persona-context`
- `npx --yes pnpm@10.32.1 --filter @station/api build`
- `git diff --check`

Exit:

- Imports are safe enough for alpha replay and do not silently create garbage
  memory.

## PR 3 - Stripe Paid-Path Proof

Status: superseded by the later PR181 clean-account activation proof. ARGUS
accepted that proof, and MIMIR closed the Stripe activation thread for
protected-alpha test-mode readiness. See
`docs/roadmap/PR181_STRIPE_CLEAN_PROOF_ACCOUNT_ACTIVATION.md` and
`docs/roadmap/ACTIVE_STATUS.md`. Earlier PR3/PR157 language about
config/test-resource readiness was true before PR181 and should not be read as
the current Stripe blocker.

Goal: prove commercial activation once without turning billing into a polish
rabbit hole.

Scope:

- Run one real Stripe test-mode subscription/payment path.
- Verify:
  - checkout session created,
  - webhook received,
  - subscription state persisted,
  - entitlement/tier state changes,
  - billing portal still opens.
- Add a short evidence note/runbook.

Do not:

- Redesign billing UX.
- Add pricing strategy.
- Add complex subscription tiers beyond current repo config.

Validation:

- Stripe test checkout.
- Stripe signed webhook event proof.
- Database subscription/entitlement proof without printing secrets.
- `npx --yes pnpm@10.32.1 test:billing`
- `npx --yes pnpm@10.32.1 test:token-credits`
- `npx --yes pnpm@10.32.1 --filter @station/api build`
- `git diff --check`

Exit:

- Station can honestly claim the paid activation path has been tested
  end-to-end in Stripe test mode.

## PR 4 - Redis Operational Boundary Hardening

Status: accepted foundation via PR113 Redis/Valkey Cache Foundation and PR114
Background Jobs Foundation. See
`docs/roadmap/PR113_REDIS_VALKEY_CACHE_FOUNDATION.md` and
`docs/roadmap/PR114_BACKGROUND_JOBS_FOUNDATION.md`.

Goal: keep Redis useful but boring.

Scope:

- Document Redis as cache, idempotency, rate-limit, and short-lived queue
  support.
- Add guardrails so Redis is not treated as canonical memory.
- Add or verify a small health/config check if missing.
- Add idempotency/cache helpers only if needed by replay, import, or Stripe.

Do not:

- Store canonical memory in Redis.
- Design working memory yet.
- Add Redis-dependent replay behavior.

Validation:

- Env/example coverage check.
- Focused operational-cache/idempotency tests if behavior changes.
- `npx --yes pnpm@10.32.1 --filter @station/api build`
- `git diff --check`

Exit:

- Redis is clearly infrastructure, not memory truth.
- Current accepted truth: Upstash REST is operational cache/idempotency/
  rate-limit/cache-only queue-state support; TCP Redis/Valkey is recognized as
  queue-capable config when present but no worker queue is active; Redis is not
  canonical Memory truth.

## PR 5 - Provider Policy Per Developer Space, Minimal Version

Status: accepted foundation via PR111 Developer Space Provider Policy
Foundation and PR112 Retrieval Provider Metadata Foundation. See
`docs/roadmap/PR111_DEVELOPER_SPACE_PROVIDER_POLICY_FOUNDATION.md` and
`docs/roadmap/PR112_RETRIEVAL_PROVIDER_METADATA_FOUNDATION.md`.

Goal: prevent provider confusion once staging has multiple AI routes.

Scope:

- Add a simple Developer Space provider-policy model/config.
- Record default staging policy:
  - Gemini free embedding profile,
  - OpenAI-compatible paid/rollback embedding profile,
  - NVIDIA chat/model-gateway profile where configured.
- Add policy read endpoint or internal resolver if needed.
- Add tests proving the selected provider route is explainable.

Do not:

- Build a full provider marketplace.
- Add per-user billing/provider complexity.
- Block current staging replay.

Validation:

- Focused provider/policy resolver tests.
- Existing model gateway/provider tests if touched.
- `npx --yes pnpm@10.32.1 test:developer-spaces`
- `npx --yes pnpm@10.32.1 --filter @station/api build`
- `git diff --check`

Exit:

- Space-level provider choice is explicit enough to avoid mystery routing.
- Current accepted truth: Developer Spaces have a bounded provider-policy
  foundation; retrieval metadata records active profile/provider/model/
  dimension/index/backfill posture; the active staging embedding profile remains
  Gemini `station_free_1536`; no provider execution switch or embedding
  dimension change is implied.

## PR 6 - Background Jobs Only If Replay/Import Proves Pain

Status: accepted by A3 / ARGUS on 2026-06-15 as a no-trigger deferral. See
`docs/roadmap/PR6_BACKGROUND_JOB_TRIGGER_AUDIT_RESULT.md`.

Goal: avoid premature queue architecture.

Trigger: open this only if archive, import, export, or replay shows blocking
latency, flaky completion, or user-visible timeout.

Scope:

- Worker shell for the specific failing flow.
- Job status persistence.
- Retry/failure visibility.
- No broad platform worker rewrite.

Validation:

- Focused job lifecycle tests.
- Replay of the failing flow.
- `npx --yes pnpm@10.32.1 --filter @station/api build`
- `git diff --check`

Exit:

- One painful alpha flow becomes reliable without turning workers into a
  platform project.

## Deferred Unless Forced

Retrieval candidate-depth follow-up:

- Accepted by ARGUS on 2026-06-18 and closed by MIMIR. See
  `docs/roadmap/PR28_RETRIEVAL_CANDIDATE_DEPTH_AUDIT.md`.
- PR28 proved the PR26 recall-depth caveat was real inside the old 50-row
  keyword fallback boundary and solved the protected-alpha replay need with a
  bounded Station/Supabase-native 200-row candidate pool.
- Cloudflare config remains deferred. Evidence buried beyond 200 rows belongs
  to future lexical/search/index design, not an immediate edge-index trigger.

Cloudflare retrieval adapter:

- Accepted boundary via PR115 Cloudflare Retrieval Boundary. See
  `docs/roadmap/PR115_CLOUDFLARE_RETRIEVAL_BOUNDARY.md`.
- Future Cloudflare work opens only if borrowed repo patterns require it or
  current Supabase/Gemini retrieval hits a specific proven limitation.
- Current truth: Cloudflare remains adapter/index-mirror scope only; no live
  Worker, Queue, Vectorize call, or authoritative private-memory behavior is
  accepted.

Redis working memory:

- Open only after a separate memory-tier design.

Broad UI polish:

- Open only for ARIADNE-discovered concrete staging-facing defects.

## PR 7 - Live Replay Optimization Baseline

Status: accepted by A3 / ARGUS on 2026-06-15 as evidence-only/no-code. See
`docs/roadmap/PR7_LIVE_REPLAY_OPTIMIZATION_BASELINE_RESULT.md`.

Refresh: `docs/roadmap/PR29_LIVE_STAGING_REPLAY_REFRESH.md` was accepted by
ARGUS on 2026-06-18 and closed by MIMIR after verifying the current pushed line
on Railway before choosing more feature work.

PR149 refresh packet: `docs/roadmap/STAGED_REPLAY_MEASUREMENT_BASELINE.md`
separates current local/source proof from hosted checks that must be rerun for
the exact deployed commit. Do not open the next optimization implementation lane
from local proof alone.

Exit:

- The next backend/product lane is chosen from live replay evidence rather than
  guesses about Cloudflare, Redis, workers, providers, billing, or UI.

## Post-Refresh Product Lane

Native document versioning alpha is closed via
`docs/roadmap/PR30_NATIVE_DOCUMENT_VERSIONING_ALPHA.md`.

Reason: PR29 found no backend repair lane and no Cloudflare/Redis/provider/
worker trigger. The remaining Station v1 gap with the cleanest product value is
making documents behave like durable authored works, starting with bounded
version history rather than a full rich editor.

The next active lane is PR31 Chat Runtime Budget Trace Alpha:
`docs/roadmap/PR31_CHAT_RUNTIME_BUDGET_TRACE_ALPHA.md`.

Reason: launch-core chat/runtime hardening already fixed latest-turn retrieval
and production debug gating. Before opening larger runtime work such as SSE
streaming, topology weighting changes, or provider route expansion, Station
needs internal budget/trace truth and clearer failure classification for quota,
provider configuration, and archived-state blocks.

PR31 is closed. The active follow-up is PR32 Chat Streaming Envelope Alpha:
`docs/roadmap/PR32_CHAT_STREAMING_ENVELOPE_ALPHA.md`.

Reason: PR31 created the budget/trace safety surface needed before chat
streaming. PR32 should add authenticated streaming/progress behavior while
keeping provider-delta claims honest and the existing non-streaming POST stable.

PR45/PR46 are closed as deployed staging complete for the second Developer Page
example. The active follow-up is PR47 Developer Pages Owner Evidence Console:
`docs/roadmap/PR47_DEVELOPER_PAGES_OWNER_EVIDENCE_CONSOLE.md`.

Reason: the public visitor pattern is now proven across two staging examples.
The next useful narrow step is owner-side curation: make the manage console's
evidence creation/listing surface match the public reading path without opening
developer agents, Tier 2 hosting, Cloudflare, route/table renames, or broad UI
redesign.

## Recommended Order

Current reconciliation, 2026-06-21:

- PR 0 evidence alignment is implemented by PR157 and accepted by MIMIR.
- PR 1 and PR 2 have accepted follow-on work through the later retrieval,
  archive, and context-preview lanes, including the PR156 latency closeout.
- PR 3's old config-readiness caveat is superseded by PR181's accepted clean
  non-production hosted Checkout proof. Further Stripe work should be a
  specific product/billing lane, not another attempt to prove the same
  test-mode activation path.
- PR 4, PR 5, and the Cloudflare boundary have accepted foundations through
  PR111 through PR115.
- PR 6 remains "workers only if forced"; PR156 does not force one.

Recommended next move: no backend implementation blocker is open from this
plan. MIMIR should choose the next lane from fresh hosted replay/product
evidence. Plausible branches are a product demo script/walkthrough, a specific
replay-quality issue if one is observed, or a new bounded billing/product lane
that is distinct from the already accepted PR181 test-mode activation proof.

## Agent Roles

- ARIADNE: human-eye route rehearsal only.
- DAEDALUS: bounded implementation PRs.
- ARGUS: hostile review, overclaim detection, regression risk.
- MIMIR: sequencing and scope control.
