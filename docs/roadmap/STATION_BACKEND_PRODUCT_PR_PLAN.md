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

## PR 1 - Replay Memory/Retrieval Quality Pass

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

Status: ARGUS accepted the reconciliation-only proof and recommends MIMIR close
PR 3. See `docs/roadmap/PR3_STRIPE_PAID_PATH_RECONCILIATION.md`.

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

## PR 5 - Provider Policy Per Developer Space, Minimal Version

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

Cloudflare retrieval adapter:

- Open only if borrowed repo patterns require it or current Supabase/Gemini
  retrieval hits a specific proven limitation.

Redis working memory:

- Open only after a separate memory-tier design.

Broad UI polish:

- Open only for ARIADNE-discovered concrete staging-facing defects.

## PR 7 - Live Replay Optimization Baseline

Status: DAEDALUS evidence-only result ready for ARGUS review. See
`docs/roadmap/PR7_LIVE_REPLAY_OPTIMIZATION_BASELINE_RESULT.md`.

Exit:

- The next backend/product lane is chosen from live replay evidence rather than
  guesses about Cloudflare, Redis, workers, providers, billing, or UI.

## Recommended Order

1. PR 0 - closure/evidence alignment.
2. PR 1 - memory/retrieval quality.
3. PR 2 - archive/import robustness.
4. PR 3 - Stripe paid-path proof.
5. PR 4 - Redis boundary.
6. PR 5 - provider policy.
7. PR 6 - workers only if forced.

## Agent Roles

- ARIADNE: human-eye route rehearsal only.
- DAEDALUS: bounded implementation PRs.
- ARGUS: hostile review, overclaim detection, regression risk.
- MIMIR: sequencing and scope control.
