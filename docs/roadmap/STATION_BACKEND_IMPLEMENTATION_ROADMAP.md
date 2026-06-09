# Station backend implementation roadmap

Date: 2026-06-08

Status: MIMIR-opened backend roadmap. BE-00 is ARGUS-accepted and deployed far
enough for the public Railway readiness endpoint to return the new readiness
shape. BE-01 is ARGUS-accepted locally after prompt-boundary hardening. BE-02 is
ARGUS-accepted locally after memory prompt-boundary hardening. Migrations 025
and 026 still need staging Supabase apply/RPC proof before remote vector
retrieval and lifecycle filtering are proven. Later lanes are ordered
implementation scope, not permission to build everything at once.

## Current staging truth

- Railway web is live at `https://stationweb-production.up.railway.app`.
- Railway API is live at `https://stationapi-production.up.railway.app`.
- API `/health` and web `/health` return `200` with `{ "ok": true }`.
- API `/health/deployment` reports the Railway app/API URLs, not localhost, and
  now includes the BE-00 `ready` plus `readiness` shape.
- API `/health/deployment.ready` is currently false while database, migration,
  storage, auth-redirect, provider, and Stripe readiness remain pending or
  failing in deployment checks.
- Supabase staging target is `jdewavktyemnpehdzvgl`.
- Supabase migrations `001` through `024` are present in remote migration
  history.
- The `persona-files` Supabase Storage bucket exists and is private.
- Local `.env` has the corrected Supabase project URL and a non-placeholder
  `DATABASE_URL`.

Still external or replay-adjacent:

- Supabase Auth site URL and redirect allow-list need dashboard confirmation,
  including the reset-password route decision.
- Stripe test resources, webhook secret, price IDs, and replay account/data
  still need setup or confirmation.
- Railway variable inventory still needs dashboard/API proof if MIMIR wants
  exact service-variable audit beyond public health booleans.
- Remote readiness blockers are not BE-01 implementation blockers. Missing
  external config should fail closed, report sanitized pending status, and be
  carried as exact E2E asks for Marty.
- BE-01 migration 025 is present repo-side and should be applied/proven against
  staging before remote vector archive retrieval is considered complete.

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

Immediate active task:

- MIMIR decides whether BE-03 provider policy should open next or whether
  staging migration/RPC proof for BE-01/BE-02 migrations 025 and 026 should come
  first.
