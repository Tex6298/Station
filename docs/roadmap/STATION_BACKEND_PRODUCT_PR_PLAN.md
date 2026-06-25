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

2026-06-23 MIMIR update: PR194 accepted the Continuity readability follow-up.
The next active lane is PR195 Post-PR194 Hosted Replay Evidence Refresh, owned
by ARGUS, to choose the next branch from live evidence rather than generic
architecture churn.

2026-06-23 PR195 result: ARGUS found no implementation blocker and recommended
the product demo/human walkthrough branch. MIMIR opened PR196 for ARIADNE.

2026-06-23 PR196 result: ARIADNE passed the hosted product demo walkthrough for
protected-alpha demo readiness with no DAEDALUS or ARGUS blocker. MIMIR chose
the runbook branch over non-blocking polish and opened PR197 for ARIADNE to
review the refreshed demo script.

2026-06-23 PR197 result: ARIADNE accepted the refreshed runbook as ready for a
prepared Marty-facing protected-alpha demo. PR197 found no implementation
blocker. MIMIR opened PR198 for DAEDALUS to map UX-01 Studio IA and UX-02
Archive trust feasibility from the dense owner-side surfaces exposed by PR196.

2026-06-23 PR198 result: DAEDALUS recommended UX-01A Studio place and mobile
workbench clarity first. MIMIR opened PR199 for DAEDALUS as the first bounded
UI/UX implementation slice.

2026-06-23 PR199 result: DAEDALUS implemented UX-01A with no backend or
boundary-scope change. MIMIR opened PR200 for ARIADNE visible desktop/375px
review.

2026-06-23 PR200 result: ARIADNE accepted UX-01A Studio workbench clarity with
no DAEDALUS or ARGUS follow-up.

2026-06-24 PR273 result: ARIADNE accepted the focused hosted polish rerun after
PR272. The Discover roulette, public Developer Space live/readback status, and
forum provider-list copy caveats pass on hosted desktop and mobile. MIMIR opens
PR274 Hosted Replay Runtime Quality Probe as the next backend/product lane from
fresh live evidence: session persistence plus one bounded replay chat/context
round trip with sanitized observability/readiness evidence.

2026-06-24 PR274 result: DAEDALUS passed hosted freshness, auth/session
persistence, context/readback, chat route health, rejected-control exclusion,
and observability, but the answer only partially recalled the accepted seeded
anchors. MIMIR opens PR275 Runtime Answer Quality Triage because full two-anchor
recall is the acceptance bar for the seeded replay probe.

2026-06-24 PR275 result: ARGUS accepted the narrow hybrid Memory backfill and
hostile fixture hardening. MIMIR opens PR276 Hosted Runtime Answer Rerun for
ARIADNE to prove full two-anchor recall on hosted Railway after the PR275
implementation deploys.

2026-06-24 PR276 result: ARIADNE proved the PR275 code deployed, but hosted
generic context still selected only partial accepted-anchor evidence and the
answer failed the full recall bar. MIMIR opens PR277 Hosted Runtime Retrieval
Selection Repair for DAEDALUS.

2026-06-24 PR277 result: DAEDALUS patched the follow-up retrieval-selection
defect: vector Memory still runs first, but owner-scoped, lifecycle-filtered
lexical Memory candidates are blended with full vector results before slicing
to the requested limit. Local deterministic runtime context/prompt evidence now
selects both accepted anchor concepts and both matching invented retrieval
phrases. ARGUS accepted the patch; MIMIR opened an ARIADNE hosted PR278 rerun
after deploy.

2026-06-24 PR278 result: ARIADNE proved the PR277 code deployed and that
auth/session/persona/chat safety/rejected-control/observability still pass, but
hosted generic context remained partial: one of two accepted concepts and one
of two matching invented retrieval phrases reached prompt context and answer.
MIMIR keeps the full recall bar and opens PR279 Hosted Partial Context
Selection Repair for DAEDALUS.

2026-06-24 PR279 result: DAEDALUS found the missing evidence could be selected
but then dropped at private Memory prompt assembly when a partial summary
replaced full content. The patch keeps selected private Memory content alongside
a differing summary before topology trimming. ARGUS accepted the patch; MIMIR
opened an ARIADNE hosted PR280 rerun after deploy.

2026-06-24 PR280 result: ARIADNE proved the PR279 code deployed and context
selection now includes both accepted concepts and both matching invented
retrieval phrases, with rejected-control evidence absent. The hosted chat answer
still recalled zero accepted concepts and zero matching phrases. MIMIR opens
PR281 Bounded Answer Grounding Repair for DAEDALUS.

2026-06-24 PR281 result: DAEDALUS patched private persona prompt grounding so
direct factual questions answer from selected context first when the answer is
present, preserve safe requested shapes, and avoid omitting selected names or
phrases for persona-only style. Provider-payload tests prove the grounding
prompt and final user message are preserved. ARGUS accepted the patch; MIMIR
opened an ARIADNE hosted PR282 rerun after deploy.

2026-06-24 PR282 result: ARIADNE proved PR281 deployed and selected context
still contains the full two-anchor set, but the hosted answer recalled none of
the accepted concepts or matching phrases. MIMIR opens PR283 Hosted Answer
Grounding Enforcement for DAEDALUS.

2026-06-24 PR283 result: DAEDALUS patched answer-grounding enforcement with a
final selected-context answer-focus guard after the persona voice close. The
patch is prompt-only and explicitly makes latest owner message plus answer
focus outrank prior chat history, earlier assistant guesses, or persona
flourish. ARGUS accepted the patch; MIMIR should open an ARIADNE hosted PR284
rerun after deploy. MIMIR opened that PR284 hosted rerun.

2026-06-24 PR284 result: ARIADNE proved PR283 deployed and hosted selected
context still contains the full two-anchor set. The answer now recalls both
invented retrieval phrases, but neither paired accepted concept label. MIMIR
opens PR285 Answer Label Preservation Repair for DAEDALUS and keeps retrieval,
provider routing, embeddings, schema, seeds, imports, Redis, Cloudflare, queues,
workers, billing, Stripe, public UI, and Studio UI out of scope unless prompt
delivery evidence proves selected context is absent.

2026-06-24 PR285 result: DAEDALUS patched answer-label preservation by
formatting Memory prompt input with selected source titles/labels alongside
content, matching Archive and Integrity behavior. The prompt input shape is
unchanged. ARGUS accepted the patch; MIMIR opened an ARIADNE hosted PR286
rerun after deploy.

2026-06-24 PR286 result: ARIADNE proved PR285 deployed and selected context
still contains both accepted labels and both matching phrases, but the hosted
answer recalled none of them. MIMIR opens PR287 Reliable Selected-Context
Answer Use for DAEDALUS and keeps retrieval/context assembly out of scope
unless provider-prompt evidence proves selected context is absent.

2026-06-24 PR287 result: DAEDALUS patched provider payload placement by
duplicating compact selected-context focus into the provider-facing final user
message while preserving the original owner message under `Owner message:`.
The patch adds no retry behavior and keeps runtime budget/quota estimates
conservative by counting the actual provider-facing final user message length.
ARGUS accepted the patch after adding a focused stored-message boundary
assertion; MIMIR opened an ARIADNE hosted PR288 rerun after deploy.

2026-06-24 PR288 result: ARIADNE proved PR287 deployed and the hosted answer
now recalls both matching invented phrases, but neither paired accepted concept
label. MIMIR opens PR289 Concept Label Carry-Through for DAEDALUS and keeps
retrieval/context placement out of scope unless provider-prompt evidence proves
selected labels are absent.

2026-06-24 PR289 result: DAEDALUS patched concept-label carry-through by
changing provider selected-context focus from parenthetical titles to explicit
`selected label/name` plus `supporting fact` pairs and by instructing the model
to include selected labels, names, or titles with relevant supporting facts
unless the owner asks otherwise. No label/title budget, retry, retrieval,
provider routing, schema, seed, import, UI, billing, or infrastructure behavior
changed. ARGUS accepted PR289 with no review patch and recommends that MIMIR
open an ARIADNE PR290 hosted rerun after deploy. MIMIR opened that PR290
hosted rerun.

2026-06-25 PR290 result: ARIADNE proved PR289 deployed and hosted selected
context still contains both accepted concept labels and both matching invented
retrieval phrases, with rejected-control absent. The hosted answer recalled
none of them. MIMIR opens PR291 Selected-Context Answer Contract Diagnostic for
DAEDALUS. This is no longer a blind prompt-wording lane: DAEDALUS must diagnose
or repair the answer contract with sanitized evidence, and ARGUS must define
the safe acceptance gate before another hosted rerun.

2026-06-25 PR291 result: DAEDALUS added a private-only selected-context answer
contract verifier plus one-shot retry for direct/factual private persona
prompts that miss all selected focus. The route records only sanitized
booleans/counts/reason codes, keeps provider-only selected context out of
persisted owner messages, and conservatively accounts for the possible retry in
quota/token estimates. ARGUS accepted PR291 after tightening the direct-factual
gate so creative/style prompts do not retry just because they contain a question
mark. MIMIR opened an ARIADNE PR292 hosted rerun after deploy; if that
still fails, classify whether the remaining issue belongs to provider/model
behavior.

2026-06-25 PR292 result: ARIADNE proved PR291 deployed and hosted selected
context still contains both accepted concept labels and both matching invented
retrieval phrases, with rejected-control absent. The hosted answer recalled
none of them. A completed answer-contract event was present, but no retry event
was observed and reason codes were not exposed by sanitized trace detail. MIMIR
opens PR293 Answer Contract Gate Diagnostic for DAEDALUS before classifying
provider/model behavior.

2026-06-25 PR293 result: DAEDALUS exposed sanitized answer-contract reason
codes and retry decisions through owner-only trace detail, and widened the
factual gate for answer/naming/state/readback commands. ARGUS accepted PR293
after tightening the creative/style guard so selected-context/label wording
alone does not retry creative prompts. Retry scope remains
private/direct/selected-context only, missed-all-selected-focus only, and one
retry maximum. MIMIR opened an ARIADNE PR294 hosted rerun after deploy. PR294
must report hosted label recall, phrase recall, rejected-control exclusion,
source-copy safety, and sanitized answer-contract/retry readback so MIMIR can
choose between closing the recall bar, opening a gate/readback repair, or
classifying provider/model behavior.

2026-06-25 PR294 result: ARIADNE proved PR293 deployed, replay-owner
auth/session and intended private persona selection passed, selected context
contained both accepted labels and both invented phrases, rejected-control
exclusion and source-copy safety passed, and sanitized answer-contract readback
was visible. The answer recalled both phrases but neither label. Trace detail
reported `missed_selected_labels` with retry not recommended or attempted.
MIMIR opened PR295 Selected Label Miss Retry Gate for DAEDALUS. DAEDALUS
completed PR295 by making `missed_selected_labels` retryable under the existing
private/direct-factual/selected-context one-shot gate and adding focused
facts-matched/label-missed retry coverage. ARGUS accepted PR295 with a
test-only hygiene patch and recommends that MIMIR open the next hosted ARIADNE
rerun after deploy. MIMIR opened PR296 Hosted Runtime Rerun After
Selected-Label Retry Gate for ARIADNE.

2026-06-23 Phase 3 bridge decision: MIMIR consumed the A1 bridge wakeup and
opened PR201 for ARGUS hostile boundary preflight. Phase 3 is not ready for
direct product-code opening because public persona pages, bounded visitor
interaction, visitor-safe persona context assembly, public persona
reporting/moderation, and owner controls are not proven. ARGUS accepted the
bridge only after correcting the first implementation lane to P3-B1A: public
persona eligibility, server-side visibility guards, serializer split, and owner
readback. That comes before Roulette, Salons, voice/avatar, persona-to-persona
encounters, institutional/research UI, provider/cache/billing architecture, or
public visitor chat.

2026-06-23 PR202 opened: DAEDALUS owns P3-B1A. This lane closes the existing
public persona eligibility/serializer gap before Archive UX, public persona
pages, visitor chat, provider/cache/billing architecture, or Phase 3 feature
work continues.

2026-06-23 PR202 result and PR203 opening: DAEDALUS implemented P3-B1A and
ARGUS accepted it. MIMIR opened PR203 / P3-B2 public persona page readback for
DAEDALUS. The route contract is the key risk: do not expose raw persona ids as
public URLs merely for convenience; use a safe public identifier if narrow, or
wake MIMIR with route options if the schema/product decision is broader.

## Agent Roles

- ARIADNE: human-eye route rehearsal only.
- DAEDALUS: bounded implementation PRs.
- ARGUS: hostile review, overclaim detection, regression risk.
- MIMIR: sequencing and scope control.
