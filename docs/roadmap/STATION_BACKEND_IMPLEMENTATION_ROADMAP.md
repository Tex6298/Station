# Station backend implementation roadmap

Date: 2026-06-08

Status: MIMIR-opened backend roadmap. BE-00 through BE-08 are accepted as the
backend foundation. As of the PR157 refresh on 2026-06-21, staging has moved
past the old setup blockers: the public Railway web/API deployment checks are
ready, migration proof now reports through the `025-037` public-schema object
range, the private `persona-files` bucket is proven, Supabase Auth redirects
are configured for the Railway web URL and reset-password route, Redis/Upstash
and Stripe test config are present at readiness level, and the active
`station_free_1536` embedding profile is backed by Gemini with populated replay
evidence. Later lanes remain ordered implementation scope, not permission to
build everything at once.

## Current staging truth

- Railway web is live at `https://stationweb-production.up.railway.app`.
- Railway API is live at `https://stationapi-production.up.railway.app`.
- API `/health` and web `/health` return `200` with `{ "ok": true }`.
- Web `/health/deployment` and API `/health/deployment` return `200`,
  `ok:true`, and `ready:true` for Railway branch `main`, commit
  `508b4acc2dbe`.
- API `/health/deployment` reports the Railway app/API URLs, not localhost, and
  includes the BE-00 `ready` plus `readiness` shape.
- API readiness is green for database, migration object proof, private storage,
  Supabase Auth redirects, Gemini-backed embedding config, Stripe test config,
  Redis/Upstash operational cache config, and public URL checks.
- Migration `029` provider-aware RPC proof, migration `030` integrity
  question-bank RLS proof, and the later public-schema object proof through
  `025-037` are accepted on staging.
- Populated Gemini retrieval/context-preview evidence is accepted for the seeded
  replay corpus, including owner-scoped vector mode, rejected-memory exclusion,
  and hostile anonymous/invalid/wrong-persona/second-owner blocks.
- PR156 closes the immediate Archive-retrieval latency loop for now:
  context-preview outer median improved from 4571ms to 1864ms, trace `total`
  median from 3549ms to 892ms, and `archive_retrieval` median from 3207ms to
  531ms; 0 of 7 counted requests exceeded 3000ms.
- The staged deployed-API replay walkthrough, browser/mobile replay
  walkthrough, portable export-bundle readback, and narrow non-zero-token LLM
  observability proof are accepted.
- Supabase staging target is `jdewavktyemnpehdzvgl`.
- Supabase migrations `001` through `030` are applied/proven for this staging
  target.
- The `persona-files` Supabase Storage bucket exists and is private.
- Local `.env` has the corrected Supabase project URL and a non-placeholder
  `DATABASE_URL`.

Still external or replay-adjacent:

- Stripe paid subscription activation remains externally blocked on a real
  hosted Checkout payment or a real signed Stripe test subscription event for
  the replay owner. Current Stripe readiness is config/test-resource readiness;
  do not fabricate subscription state.
- The LLM trace proof is accepted; the two-trace/status-capture retry caveat is
  hygiene only if exact one-call replay ergonomics become part of the demo bar.
- Cloudflare remains a future adapter/index-mirror lane unless a concrete
  Cloudflare-specific replay objective is opened.
- Redis/Valkey remains cache, idempotency, rate-limit, and cache-only
  queue-state support unless a separate memory-truth decision is opened.

## Roadmap rule

Build the backend in lanes that are small enough for DAEDALUS to implement,
ARGUS to review hostile owner/visibility paths, and ARIADNE to review only when
the lane changes the user journey.

Do not turn Redis, Cloudflare, NVIDIA retrieval, or provider privacy into a
single global decision before the backend can prove what it is doing online.

Config/API key blockers should not freeze backend completion. Build the backend
paths with safe disabled or pending states, keep secrets out of logs and health
responses, and document the exact E2E value or dashboard action needed.

## BE-00 - Staging truth and readiness probes

Owner: DAEDALUS first. ARGUS reviews. ARIADNE only if the probe output becomes
user-facing.

Purpose: make the deployed API prove real dependency readiness without exposing
secrets.

Scope:

- Extend the deployment health surface with non-secret readiness checks:
  - database connectivity,
  - migration count/latest migration name,
  - `persona-files` bucket existence and private status,
  - public app/API URL sanity,
  - Supabase auth redirect status only if available through management API,
  - Stripe/provider/Redis booleans only, never values.
- Keep `/health` cheap and unchanged.
- Keep `/health/deployment` free of secret values, database URLs, tokens, and
  raw service variables.
- Add focused tests for masking, failure handling, and no-secret response shape.

Acceptance gates:

- `pnpm test:auth` or a focused health-route test suite.
- `pnpm --filter @station/api build`.
- Remote `/health` remains `200`.
- Remote readiness endpoint returns useful booleans and does not print secrets.
- ARGUS hostile review confirms no secret values or internal connection strings
  are serialized.

## BE-01 - Private archive retrieval foundation

Owner: DAEDALUS first. ARGUS reviews owner scope. ARIADNE reviews context
preview language after API behavior is stable.

Purpose: move private archive from "referenced in prompt" to retrievable source
material.

Scope:

- Add a Station-native archive chunk model or a clearly bounded reuse of
  `memory_items` with stronger provenance.
- Ingest text from archive imports, archived chats, and supported persona files
  into searchable chunks.
- Keep chunk records owner-scoped and persona-scoped.
- Add retrieval that can return private archive excerpts for the owning user
  only.
- Add context-preview source citations: source type, title/name, chunk reason,
  and created timestamp.
- Bound prompt injection by maximum chunks, maximum characters, and source-type
  caps.
- Preserve existing keyword fallback when embeddings are unavailable.

Acceptance gates:

- Owner A cannot retrieve Owner B archive chunks.
- Public/community reads cannot receive private archive chunks.
- Failed imports do not create authoritative chunks.
- Deleting or rejecting a source prevents future retrieval.
- Context preview names sources without leaking raw private content to
  non-owners.

## BE-02 - Memory lifecycle engine

Owner: DAEDALUS first. ARGUS reviews owner scope and lifecycle state changes.
ARIADNE reviews Studio copy later if surfaces are added.

Purpose: use the memory lifecycle schema that now exists instead of treating it
as passive metadata.

Scope:

- Inject active `owner_memory_blocks` into runtime persona context with clear
  priority rules.
- Filter or deprioritize memory lifecycle states:
  - active,
  - superseded,
  - rejected,
  - expired,
  - quarantined.
- Add owner-only endpoints for reviewing and updating lifecycle state.
- Add reinforcement and evidence updates with source refs.
- Expose a structured memory briefing endpoint for Studio/replay.

Acceptance gates:

- Rejected/quarantined/expired memory is not injected into chat context.
- Superseded memory points to its replacement without double-injection.
- Owner memory blocks are owner-scoped and never public.
- Lifecycle updates are owner-only and validated.

## BE-03 - Provider policy per Developer Space

Status: accepted foundation via PR111 Developer Space Provider Policy
Foundation. Future provider-policy expansion requires a new MIMIR lane.

Owner: DAEDALUS first. ARGUS reviews provider privacy and logs. ARIADNE reviews
operator-facing mode names.

Purpose: make provider/data posture configurable rather than global.

Scope:

- Add explicit provider-policy modes, for example:
  - `public_synthetic_only`,
  - `public_context_allowed`,
  - `private_archive_allowed`,
  - `owner_byok_only`,
  - `platform_allowed`.
- Attach policy to Developer Spaces first; later personas can reuse the model.
- Record which mode was used in AI observability metadata.
- Keep NVIDIA chat behind the existing OpenAI-compatible provider path.
- Do not switch embeddings or vector dimensions in this lane.

Acceptance gates:

- Private archive-aware calls require an explicit accepted mode.
- Public/synthetic modes cannot include private archive chunks.
- No provider key or private prompt payload is logged.
- Existing DeepSeek/NVIDIA fallback tests still pass.

## BE-04 - Retrieval provider metadata

Status: accepted foundation via PR112 Retrieval Provider Metadata Foundation.
This records metadata and guards; it does not imply a provider switch.

Owner: DAEDALUS first. ARGUS reviews mixed-dimension and migration failure
paths.

Purpose: prepare for configurable retrieval providers before any embedding swap.

Scope:

- Track embedding provider, model, dimension, index name/source, and backfill
  version for generated vectors.
- Reject vectors whose dimensions do not match the active index/schema.
- Preserve OpenAI `text-embedding-3-small` and `vector(1536)` as the current
  default.
- Define a backfill/reindex contract before NVIDIA, Cloudflare Vectorize, Redis
  vectors, or any non-1536 provider is accepted.

Acceptance gates:

- Mixed-dimension writes are rejected.
- Existing memory search remains compatible with current `1536` vectors.
- No retrieval provider change is implied by metadata alone.

## BE-05 - Redis or Valkey foundation

Status: accepted foundation via PR113 Redis/Valkey Cache Foundation. Redis/
Upstash is operational cache, idempotency, rate-limit, and cache-only
queue-state support; it is not canonical Memory truth.

Owner: MIMIR decides role, then DAEDALUS builds. ARGUS reviews key scoping,
expiry, and privacy.

Purpose: add Redis only after its first role is explicit.

Conservative first scope:

- Runtime context cache.
- Idempotency keys.
- Rate limits.
- Lightweight queue state.
- Short-lived working memory only if explicitly accepted.

Required design before implementation:

- Key format includes environment, owner, persona or Developer Space scope.
- TTL and invalidation rules are explicit.
- Cache is bypassed or invalidated on archive import, memory/canon edits,
  continuity writes, persona edits, and visibility changes.
- Redis is not canonical memory unless MIMIR opens a separate memory-truth
  decision and ARGUS accepts durability/export/deletion semantics.

## BE-06 - Background jobs

Status: accepted foundation via PR114 Background Jobs Foundation. No worker
runtime is active; future worker execution opens only from concrete replay or
import/export pain.

Owner: DAEDALUS first after BE-01 or BE-05 exposes real need. ARGUS reviews job
ownership and failure surfaces.

Purpose: move slow protected-alpha synchronous flows into retryable backend work
only when staged replay proves it is needed.

Candidate jobs:

- Archive text extraction.
- Embedding backfill.
- Memory consolidation.
- Export package assembly.
- Replay seed/setup.
- Developer Space import batches.

Acceptance gates:

- Failed jobs have owner-visible status.
- Queue payloads do not contain unnecessary private text or secrets.
- Retries are idempotent.
- Replay evidence justifies the infrastructure.

## BE-07 - Cloudflare retrieval adapter

Status: accepted boundary via PR115 Cloudflare Retrieval Boundary. Cloudflare
is adapter/index-mirror scope only; no live Worker, Queue, Vectorize call, or
authoritative private-memory behavior is accepted.

Owner: MIMIR opens only after imported repo demands are concrete. DAEDALUS
prototypes. ARGUS reviews authorization and index contents.

Purpose: evaluate Cloudflare-only retrieval patterns without making Cloudflare
the authority.

Default posture:

- Worker as adapter or index mirror.
- Vectorize stores IDs and minimal metadata first.
- Canonical records are fetched through Station/Supabase after owner and
  visibility checks.
- Delete/export/reindex behavior is documented before private snippets enter a
  Cloudflare index.

## BE-08 - Replay-driven optimization

Owner: MIMIR coordinates. DAEDALUS patches bottlenecks. ARGUS validates.
ARIADNE reviews journey quality.

Purpose: optimize actual online behavior after staging replay, not local
guesswork.

Measure:

- Chat latency and context quality.
- Archive upload/import confidence.
- Retrieval relevance.
- Provider cost and failure rate.
- Job failure recovery.
- Export trust.
- Billing/webhook path reliability.

## Team handoff

Default order:

1. MIMIR opens a bounded lane and names the acceptance gates.
2. DAEDALUS implements or inventories the lane.
3. ARGUS reviews hostile owner/visibility/security paths.
4. ARIADNE reviews product experience only when user-facing surfaces change.
5. MIMIR accepts, narrows, or reorders the next lane.

Current source-of-truth reconciliation:

- `docs/roadmap/STATION_BACKEND_PRODUCT_PR_PLAN.md` remains the sequencing
  reference, but its early backend/product foundations are no longer pending
  blockers.
- PR157 completed the staging alpha closure plus source/live evidence
  alignment.
- PR111 through PR115 accepted the provider-policy, retrieval metadata,
  operational cache, background-job foundation, and Cloudflare-boundary work.
- PR156 closed the immediate Archive-retrieval latency loop; no worker,
  provider, Redis, Cloudflare, or cache optimization lane is justified by that
  sample alone.
- Do not assign broad checking back to Marty. ARIADNE owns human-eye rehearsals
  when a lane changes the user journey or when a concrete staging-facing defect
  needs verification.
- Next implementation should be chosen by MIMIR from fresh hosted replay or
  product evidence, not stale foundation text.
