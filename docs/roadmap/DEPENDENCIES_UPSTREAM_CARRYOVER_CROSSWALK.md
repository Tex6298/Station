# Dependencies: Upstream carry-over vs current Station implementation

Date: 2026-06-10

Status: DAEDALUS decision note for MIMIR. Evidence is from repo docs and code
only.

## Decision summary

Station should keep a hybrid architecture:

- Canonical private data stays in Station/Supabase.
- Active retrieval stays on Supabase pgvector with OpenAI
  `text-embedding-3-small` and `vector(1536)`.
- Remote systems such as Cloudflare, Redis/Upstash, or future provider-specific
  retrieval indexes can supplement as caches, mirrors, or adapters only after
  owner/visibility, deletion, export, reindex, and privacy gates are explicit.
- NVIDIA is active as platform chat in staging, not as a retrieval embedding
  replacement.
- BYOK chat remains OpenAI/Anthropic/DeepSeek in code; Gemini chat is
  vocabulary/UI concept only until a provider class and tests exist. Gemini
  embeddings now have an optional prep lane, but OpenAI remains the active
  default until migration/reindex proof exists.

Recommended roadmap next step: record Cloudflare as explicitly deferred for the
current staging replay, keep OpenAI embeddings as active primary, and use replay
evidence to decide whether a later retrieval-provider lane needs Cloudflare,
Redis, NVIDIA embeddings, or only better Supabase indexing/UX.

## Upstream carry-over matrix

| Upstream/reference list | Dependency or idea in source docs | Carried into Station | Current state | Keep as |
| --- | --- | --- | --- | --- |
| `coollabsio/coolify` | Deployment dashboard, self-hosting, health checks, Docker/git-push clarity. | Deployment readiness docs, Railway service-aware web/API setup, `/health`, `/health/deployment`. | Active staging support; Station is not becoming a PaaS. | Active primary for readiness; reject PaaS expansion. |
| `cogniolab/agent-monitor`, `simple10/agents-observe`, `tobilg/ai-observer`, `BlazeUp-AI/Observal`, `builderz-labs/mission-control` | Trace analytics, replay/event timelines, provider-aware observability, operational gates. | `ai_trace_sessions`, `ai_trace_events`, read-only `/observability`, replay-readiness prep, Settings AI activity. | Active for evidence capture; no external telemetry backend. | Active primary for local/replay observability; defer external telemetry. |
| `acnlabs/OpenPersona`, `Ate329/PersonaFlow`, `marc-shade/ai-persona-lab`, `agentic-box/memora`, `huss-mo/GroundMemory`, `marisombra-dev/identity-continuity`, `mrjessek/shang-tsung`, `AILIFE1/Cathedral`, `letta-ai/characterai-memory`, `Sakushi-Dev/PersonaUI`, `carsteneu/yesmem`, `wangjiake/JKRiver` | Persona layers, handoffs, memory graph, shared memory, lifecycle/trust/decay, continuity rituals, local memory tiers. | Persona layer profiles, lifecycle events, handoff records, memory graph edges, owner memory blocks, memory lifecycle metadata, memory cycle state, memory briefing. | Active/protected-alpha. Direct Python/Ollama/NetworkX, daemon loops, autonomous self-modification, cryptographic drift checks, and full sleep pipelines are deferred or rejected. | Active primary for Station-native memory; defer autonomous/runtime imports. |
| `cindiekinzz-coder/NESTstack` | Cloudflare-native emotional continuity, three-layer memory, daemon heartbeat, D1/Vectorize/Worker posture. | Conceptual influence only plus `@station/ai` disabled-safe Cloudflare adapter boundary. | Adapter concept only; no Worker, D1, Vectorize binding, SDK, live call, or runtime route. | Deferred lane; optional remote mirror only. |
| `msalsas/amanuensis` | Human-veto publishing and approval queue. | Continuity publication and owner-only export/provenance patterns align with approval-first publishing. | Social publishing dispatcher and Telegram queue are deferred. | Hybrid supplement for future publishing workflow. |
| `discourse/discourse`, `flarum/framework`, `LemmyNet/lemmy`, `forem/forem`, `elkarte/Elkarte`, `mbeps/next_discussion_platform` | Forums, trust, voting, moderation actions/logs, category/thread hygiene. | Forum categories/threads/comments, votes, community trust profiles, moderation actions/logs, Discover/forum visibility rules. | Active/protected-alpha. Federation, plugin systems, full semantic feed, saved posts, image upload, and large admin hierarchy are deferred. | Active primary for Community Beta core; defer ecosystem features. |
| IntelHub integration notes | Developer Spaces observatory, model gateway/provider catalogue ideas; CTI/finance/exposure/recon/dark-provider/browser-worker/PM/model-gateway modules. | Developer Spaces observatory and provider-policy concepts. | Developer Spaces are Station-native. CTI/finance/exposure/recon/dark-provider/browser-worker/PM/model-gateway code remains rejected. | Active primary for Developer Spaces; reject unrelated IntelHub domains. |
| Product technical spec provider list | Later providers such as Gemini, custom OpenAI-compatible endpoints, local GPU/NVIDIA ideas. | Provider type vocabulary includes `gemini`; router implements platform, OpenAI, Anthropic, DeepSeek; NVIDIA platform chat aliases use OpenAI-compatible path. Gemini embedding prep now exists separately from chat provider support. | Gemini has no chat provider class or UI option in awakening flow. NVIDIA local GPU is not current runtime; NVIDIA API chat is staging-proven. Gemini embeddings are opt-in prep, not the active corpus. | Hybrid supplement for chat; defer Gemini chat/local GPU until provider lane. |

## Current implementation matrix

| Stack piece | Evidence in repo | Overlap/conflict | Pros | Cons | Recommendation |
| --- | --- | --- | --- | --- | --- |
| Supabase/pgvector + OpenAI embeddings | `packages/ai/src/retrieval/embeddings.ts`, migrations `001`, `003`, `028`, `match_memory_items`, `match_private_archive_chunks`. | Matches active schema: OpenAI `text-embedding-3-small`, `vector(1536)`, `memory_items_embedding_1536`. | Stable, tested, canonical owner/visibility path, no mixed-dimension risk. | Requires `OPENAI_API_KEY` for meaningful remote vectors; pseudo-embedding fallback is dev/test only. | Active primary. |
| Cloudflare retrieval adapter | `packages/ai/src/retrieval/cloudflare-adapter.ts`, adapter tests, `docs/architecture/cloudflare-retrieval-adapter.md`, `docs/ops/CLOUDFLARE_DEPENDENCY_CHECK.md`. | Complements retrieval as future remote candidate-ID mirror; must not replace Supabase authorization. | Edge-friendly optional index, can keep canonical private rows in Station. | No live Worker/Vectorize today; privacy/deletion/export/reindex gates still required. | Deferred lane; optional hybrid supplement later. |
| NVIDIA platform chat | `packages/ai/src/providers/router.ts`, API env `NVIDIA_AI_API_KEY`, health readiness provider checks, provider-router tests. | Uses OpenAI-compatible chat provider path; does not change embeddings. | Staging-proven platform chat option, no schema migration. | Trial/data-policy and model usage expectations still need MIMIR/Marty decision before sensitive replay. | Hybrid supplement for chat. |
| BYOK OpenAI/Anthropic/DeepSeek | `resolveProvider`, `OpenAIProvider`, `AnthropicProvider`, `DeepseekProvider`, persona provider types/UI. | BYOK applies to chat. OpenAI BYOK can also feed embeddings through existing embedding helpers where profile keys are passed. | Gives owners control without broad gateway scope. | BYOK secret storage/data-policy posture must stay guarded; Gemini type has no implementation. | Active primary for supported chat providers; defer Gemini. |
| Developer Space provider policy | `developer_spaces.provider_policy`, `evaluateDeveloperSpaceProviderPolicy`, Developer Space route tests. | Governs whether public/private context can be sent to platform or owner BYOK providers. | Structural fail-closed privacy control; per-Space posture avoids global provider assumptions. | It evaluates policy; it does not by itself prove provider calls are safe. | Active primary guardrail. |
| Memory lifecycle filters | `memory_item_lifecycle`, runtime context/search filters, Cloudflare candidate reauthorization helper. | Applies before canonical private records return, including future remote candidate IDs. | Prevents rejected/quarantined/expired/superseded memories from re-entering context. | Remote mirrors still need deletion/stale-index handling if enabled. | Active primary guardrail. |
| Redis/Valkey/Upstash cache | `apps/api/src/services/operational-cache.service.ts`, cache tests, future lane docs. | Cache/idempotency/queue helper, not canonical memory. | Useful for replay performance/rate-limit/idempotency later. | Provider choice not made; TCP Redis client path is disabled pending concrete client. | Deferred lane; hybrid supplement only. |
| Gemini embeddings | `EMBEDDINGS_PROVIDER`, Gemini embedding key envs, `packages/ai/src/retrieval/embeddings.ts`, migration `029`, and `docs/ops/GEMINI_EMBEDDING_MIGRATION_PLAN.md`. | Complements Supabase pgvector only after provider-aware metadata/RPC prep and corpus reindex; does not replace chat providers. | Keeps the existing 1536 index shape and gives a bounded trial path. | Not applied to staging, not reindexed, and not safe to enable for replay until migration `029` plus data-backed smoke pass. | Deferred lane; opt-in hybrid supplement later. |
| Gemini chat | `PersonaProvider` type includes `gemini`; product docs mention Gemini as later provider. | No `GeminiProvider`, no env-backed chat routing, no awakening-flow option, no tests. | Could widen BYOK/provider choice later. | Current type vocabulary overstates implementation if treated as active. | Deferred; do not advertise as active. |

## Hybrid retrieval recommendation

Use local canonical plus optional remote mirror:

1. Keep Supabase tables, RLS, owner/persona IDs, visibility, lifecycle status,
   source refs, deletion/export semantics, and audit truth canonical.
2. Keep OpenAI 1536-dimensional embeddings as the current primary index until a
   schema/RPC/generated-types/backfill/reindex lane is opened.
3. If Cloudflare opens later, mirror IDs and minimal metadata first. Query
   Vectorize for candidate IDs only, then fetch canonical records through
   Station/Supabase filters.
4. If Redis opens later, start with cache/rate-limit/idempotency/queue state.
   Do not promote Redis to memory truth without durability/export/deletion
   review.
5. If NVIDIA or another embedding provider opens later, make provider/model/
   dimension metadata and mixed-dimension rejection non-negotiable.

This avoids dependency drift because every optional provider has a bounded role:
canonical truth, active index, chat provider, remote mirror, or cache. Nothing
quietly becomes the new memory authority.
