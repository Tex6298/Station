# Station future lanes

Date: 2026-06-08

Status: MIMIR opened Lane 0 with `WAKEUP A2` on 2026-06-08. DAEDALUS has
prepared the fork/upstream convergence for ARGUS review; later lanes remain
future scope until MIMIR opens them.

## Inputs integrated

This note folds the current external/upstream work into future sequencing:

- `origin/main` feature commits:
  - `c890948 feat: add AI observability foundation`
  - `c4a183e feat: add live observatory widgets`
  - `866d13d feat: add persona lifecycle graph`
  - `9bee0b1 feat: add memory continuity controls`
  - `269ad48 feat: add community trust and voting`
- `origin/main:docs/ops/open-repo-upgrade-review.md`, which already reviewed
  open memory/persona/observability repos and ported selected concepts into
  Station-native schema/routes/UI.
- `docs/roadmap/STATION_RETRIEVAL_PROVIDER_RESEARCH_ARIADNE.md`, which
  recommends NVIDIA chat for dev/staging probes, keeps OpenAI 1536-dimensional
  embeddings for current retrieval, and treats Cloudflare/Redis as adapter
  choices rather than memory truth.
- `docs/ops/STAGING_SETUP_BLOCKERS.md`, which separates repo-side work from
  Supabase dashboard/credential blockers.
- The active Railway fork constraint: staging work is on `fork/main` and must
  preserve the service-aware Railway web/API scripts and web `/health` route.

## Current defaults

- Supabase remains the source of truth for private memory, archive, visibility,
  continuity, and owner authorization.
- Current memory embeddings remain OpenAI `text-embedding-3-small` because the
  schema and RPC are fixed at `vector(1536)`.
- NVIDIA is acceptable for dev/staging chat probes after provider/data-policy
  review, but NVIDIA embeddings are not a drop-in swap.
- Redis/Valkey is cache or queue infrastructure only, not memory truth.
- Cloudflare can be an edge adapter or index mirror, not a replacement for
  Station authorization unless a separate privacy review accepts it.

## Lane 0 - Fork/upstream convergence

Purpose: bring the useful `Discern-AI/Station` memory/observability work into
the active Railway fork without regressing deployment.

DAEDALUS status, 2026-06-08: ready for ARGUS review. The convergence merge
brings `origin/main` through `269ad48` into the active `fork/main` line while
preserving the Railway service-aware deployment files and NVIDIA platform-chat
aliases. Supabase migrations `020` through `024` remain repo migrations only;
no staging project migration was applied.

Scope:

- Merge or cherry-pick the upstream feature commits through `269ad48` into
  `fork/main`.
- Preserve root `railway.json`, `scripts/railway-build.mjs`,
  `scripts/railway-start.mjs`, `apps/web/next.config.mjs` standalone output,
  and `apps/web/app/health/route.ts`.
- Preserve the NVIDIA platform-chat aliases if DAEDALUS's setup patch has
  landed before this lane opens.
- Keep upstream migrations `020` through `023` as repo migrations only until
  Supabase staging credentials and project targeting are confirmed.

ARGUS gates:

- `git merge-tree` or equivalent merge preview shows no deployment-file
  regression.
- `node --check scripts/railway-build.mjs`
- `node --check scripts/railway-start.mjs`
- `npx --yes pnpm@10.32.1 typecheck`
- Focused API/web builds and tests touched by the upstream feature set.
- Remote Railway web/API `/health` checks after deploy, if the merge is pushed
  to staging.

Do not:

- Apply Supabase migrations to an unknown project.
- Replace the current Railway service-aware deployment shell with API-only
  commands.
- Turn upstream memory tables into a claim that staged replay is ready.

## Lane 1 - Staging setup closeout

Purpose: clear the external setup blockers needed before useful online replay.

Scope:

- Apply Supabase migrations to the confirmed staging project.
- Create and verify the private `persona-files` bucket.
- Configure Supabase Auth site URL and allowed redirects for the Railway web
  URL.
- Confirm API service variables on Railway, including Supabase, JWT, Stripe,
  and optional provider keys.
- Verify replay account/data policy.

Blocked on:

- Confirmed staging Supabase project ref.
- Supabase dashboard or CLI credentials with migration permissions.
- Confirmation that `persona-files` is private.
- Exact auth redirect list.
- Stripe test resources and replay account/data.

## Lane 2 - Provider policy and NVIDIA chat

Purpose: use the local NVIDIA key safely for dev/staging chat without changing
memory retrieval.

Scope:

- Keep NVIDIA behind platform-chat configuration.
- Default operational prompts to `/no_think` unless a reasoning trace is
  explicitly useful.
- Keep OpenAI embeddings on the current 1536-dimensional path.
- Add a data-policy decision before sending private archive text to NVIDIA
  trial endpoints.

ARGUS gates:

- Provider request-shape tests.
- No secret logging.
- DeepSeek fallback still works when NVIDIA is not configured.
- Health/deployment checks expose only boolean configuration status.

## Lane 3 - Retrieval provider hardening

Purpose: make retrieval provider choices auditable before any embedding swap.

Scope:

- Add provider/model/dimension metadata to retrieval records or side tables
  before mixed-provider storage is allowed.
- Reject vectors whose length does not match the active schema/index.
- Preserve keyword fallback behavior.
- Define a backfill/reindex plan before switching stored memory embeddings.

Decision point:

- Stay on 1536-dimensional OpenAI embeddings for the near term, or open a
  migration to 1024/2048 dimensions for NVIDIA/Cloudflare candidates.

Required migration work if switching dimensions:

- Update Supabase vector columns and RPC signatures.
- Update generated DB types.
- Backfill stored memory chunks.
- Rebuild vector indexes.
- Add mixed-dimension rejection tests.
- Run owner/visibility hostile review after reindex.

## Lane 4 - Redis cache posture

Purpose: add cache or queue infrastructure only where it reduces staging pain
without weakening privacy.

Railway-side default:

- Use Railway Redis/Valkey for API-local cache, queue, idempotency, or rate
  limit state when the API owns the workload.
- Use owner/persona-scoped keys and short TTLs.

Cloudflare-side default:

- Use Upstash Redis for Worker-side cache/rate-limit needs because it exposes a
  Worker-friendly REST/HTTP integration.

Rules:

- Supabase remains canonical.
- Do not cache provider secrets, Supabase service-role keys, auth tokens, or raw
  private archive blobs.
- Cache keys must include owner and persona scope where private data is
  involved.
- Invalidate or bypass cache on archive import, memory/canon edits,
  continuity writes, persona edits, visibility changes, and deletion.

## Lane 5 - Cloudflare retrieval adapter

Purpose: evaluate Cloudflare-only memory retrieval repos without forcing
Station onto Cloudflare.

Default architecture:

- Use a Worker as an adapter only.
- If Vectorize is used, store IDs and minimal metadata first.
- Fetch canonical records through Station/Supabase after owner and visibility
  checks.

Open questions:

- Which specific GitHub repos should be inspected next?
- Should Vectorize contain private snippets, or only IDs and filters?
- Is the first target public/Discover retrieval, private Studio retrieval, or a
  prototype-only harness?

ARGUS gates:

- Owner and visibility filters remain structural.
- Deletion/export/privacy obligations are not duplicated incorrectly.
- Cloudflare index contents are auditable and reindexable.
- Provider dimension and index dimension are fixed and documented.

## Lane 6 - Memory UX and observability

Purpose: turn the upstream memory/observability foundations into user-visible
trust surfaces after staging is coherent.

Inputs:

- AI trace sessions and events.
- Persona lifecycle and handoff records.
- Memory graph edges.
- Owner memory blocks.
- Memory lifecycle trust/status/decay/quarantine records.
- Developer Space live observatory widgets.

Likely UI work:

- Memory trust/status controls in Studio.
- Review surfaces for quarantined or superseded memories.
- Lifecycle/handoff summaries that help users understand continuity without
  exposing private internals publicly.
- AI activity panels that show useful operational truth without becoming a
  telemetry product.

Do not:

- Start a broad redesign.
- Promote raw traces or private memory graph data into public surfaces without
  ARGUS privacy gates.
- Treat observability as a replacement for focused validation.

## Lane 7 - Background jobs and realtime

Purpose: decide when Station needs real background infrastructure rather than
bounded synchronous protected-alpha flows.

Candidate triggers:

- Archive import backfills are too slow for staging replay.
- Memory reindex or embedding backfill is opened.
- Export packages need retryable package assembly.
- Developer Space live updates need better fanout than polling/SSE.

Options:

- Railway API plus Redis/Valkey queue.
- Supabase-triggered or scheduled job scripts.
- Cloudflare Worker/Queue adapter only for edge-friendly public or index-mirror
  workloads.

ARGUS gates:

- Job ownership and retry semantics are tested.
- Failed jobs have owner-visible status.
- No private data leaks through queue payloads or logs.
- Staged replay proves the queue is useful before deeper infrastructure is
  added.

## Sequencing recommendation

1. Finish/ARGUS-review DAEDALUS's current NVIDIA/setup patch.
2. Open Lane 0 to merge upstream memory/observability work into the Railway
   fork while preserving deployment.
3. Clear Lane 1 external Supabase/auth/storage blockers.
4. Run staged replay with current OpenAI embeddings and optional NVIDIA chat.
5. Decide whether retrieval needs Cloudflare/Redis/NVIDIA migration work based
   on staged replay evidence and the specific GitHub repos Marty supplies.
