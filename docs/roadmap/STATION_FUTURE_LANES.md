# Station future lanes

Date: 2026-06-08

Status: Lane 0 was accepted by ARGUS on 2026-06-08 after targeted
moderation/privacy hardening. Later lanes remain future scope until MIMIR opens
them.

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
  researched NVIDIA chat, OpenAI embeddings, Cloudflare/Redis adapter questions,
  and now feeds the corrected Gemini-first embedding decision.
- `docs/ops/STAGING_SETUP_BLOCKERS.md`, which separates repo-side work from
  Supabase dashboard/credential blockers.
- The active Railway fork constraint: staging work is on `fork/main` and must
  preserve the service-aware Railway web/API scripts and web `/health` route.

## Current defaults

- Supabase remains the source of truth for private memory, archive, visibility,
  continuity, and owner authorization.
- Current product-testing memory embeddings should use the `station_free_1536`
  profile. That profile is backed by Gemini `gemini-embedding-2` for now because
  it has a free tier and can preserve the `vector(1536)` shape. OpenAI
  `text-embedding-3-small` remains the `openai_1536` native/rollback profile.
- NVIDIA is acceptable for dev/staging chat probes after provider/data-policy
  review, but NVIDIA embeddings are not a drop-in swap. Provider/data-policy
  posture may vary by Developer Space requirement; do not assume one global
  production policy before replay evidence exists.
- Redis/Valkey's role is undecided. The conservative current recommendation is
  cache, queue, idempotency, rate-limit, and short-lived working-memory support,
  but Redis as a memory source of truth remains an architecture option for
  discussion if a Developer Space or imported repo pattern requires it.
- Cloudflare can be an edge adapter or index mirror, not a replacement for
  Station authorization unless a separate privacy review accepts it. Cloudflare
  work should follow the concrete demands of imported repo ideas rather than
  forcing Station into a Cloudflare-first architecture.

## MIMIR decisions after provider/repo questions

- Treat `origin/main:docs/ops/open-repo-upgrade-review.md` and any later
  `Discern-AI/Station` updates as the first source of GitHub repo clues before
  asking Marty for duplicate links. If specific repo gaps remain after reading
  that file, ask for only those missing links.
- Provider/data-policy requirements may differ across Developer Spaces. Some
  spaces may need public/synthetic-only model calls; others may need private
  archive-aware calls. If we are building configurability for one side of this,
  we should design the provider/privacy surface broadly enough to support both.
- Embedding profile and vector dimension should remain configurable and
  auditable. `station_free_1536` is the selected near-term testing profile, but
  the metadata/reindex path must keep later per-index or per-Space choices
  possible.
- Cloudflare adapter work should be driven by the imported repo patterns and
  their constraints. The default remains adapter/index-mirror posture unless the
  accepted repo pattern proves a stronger Cloudflare dependency is necessary.

## Lane 0 - Fork/upstream convergence

Purpose: bring the useful `Discern-AI/Station` memory/observability work into
the active Railway fork without regressing deployment.

DAEDALUS status, 2026-06-08: ready for ARGUS review. The convergence merge
brings `origin/main` through `269ad48` into the active `fork/main` line while
preserving the Railway service-aware deployment files and NVIDIA platform-chat
aliases. Supabase migrations `020` through `024` remain repo migrations only;
no staging project migration was applied.

ARGUS status, 2026-06-08: accepted after hardening the moderation and handoff
boundaries. Public thread detail payloads expose moderation actions to admins
only, moderation action direct RLS select is admin-only, direct community trust
profile writes are admin-only, persona handoffs verify attached conversation
ownership, and AI trace detail misses return not-found instead of an accidental
error path.

Scope:

- Merge or cherry-pick the upstream feature commits through `269ad48` into
  `fork/main`.
- Preserve root `railway.json`, `scripts/railway-build.mjs`,
  `scripts/railway-start.mjs`, `apps/web/next.config.mjs` standalone output,
  and `apps/web/app/health/route.ts`.
- Preserve the NVIDIA platform-chat aliases if DAEDALUS's setup patch has
  landed before this lane opens.
- Keep upstream migrations `020` through `024` as repo migrations only until
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

Purpose: use the local NVIDIA key safely for dev/staging chat while the selected
embedding profile owns retrieval.

Scope:

- Keep NVIDIA behind platform-chat configuration.
- Default operational prompts to `/no_think` unless a reasoning trace is
  explicitly useful.
- Keep `station_free_1536` on the current 1536-dimensional path once migration
  `029` and reindex/smoke proof are complete.
- Design provider/privacy configuration per Developer Space rather than a
  single global yes/no rule.
- Support both public/synthetic-only calls and private archive-aware calls as
  explicit modes once the provider contract is explicit and ARGUS-reviewed.
- Before production use, document what each mode sends to the provider and how
  it affects replay, audit, export, and deletion expectations.

ARGUS gates:

- Provider request-shape tests.
- No secret logging.
- DeepSeek fallback still works when NVIDIA is not configured.
- Health/deployment checks expose only boolean configuration status.

## Lane 3 - Retrieval provider hardening

Purpose: make embedding profile selection auditable and keep future provider
choices safe.

Scope:

- Apply the provider/model/dimension metadata from migration `029` before
  mixed-provider storage is treated as replay-ready.
- Reject vectors whose length does not match the active schema/index.
- Preserve keyword fallback behavior.
- Backfill/reindex the replay corpus before judging the selected profile's
  retrieval quality.
- Design the provider/dimension contract so retrieval can become configurable by
  index, environment, or Developer Space where justified.

Decision point:

- Use `station_free_1536` for the near-term free-tier path, with `openai_1536`
  retained as rollback/native route. Later Qwen, NVIDIA, Cloudflare, local, or
  custom candidates should open their own profile/dimension lanes only when
  replay or imported repo demands justify them.

Required migration work if switching dimensions:

- Update Supabase vector columns and RPC signatures.
- Update generated DB types.
- Backfill stored memory chunks.
- Rebuild vector indexes.
- Add mixed-dimension rejection tests.
- Run owner/visibility hostile review after reindex.

## Lane 4 - Redis role decision

Purpose: decide what Redis/Valkey should be for Station before implementing it.

MIMIR correction:

- Redis is not rejected as memory truth. MIMIR's conservative recommendation is
  to start with cache/queue/working-memory roles because the current system's
  durable memory, visibility, export, and deletion contracts are Supabase-led.
  That recommendation is not an accepted architecture decision.
- If a Developer Space or imported repo pattern wants Redis-backed memory truth,
  discuss it explicitly and define the durability, eviction, backup, ownership,
  deletion, export, search, and audit contracts before implementing.

Railway-side default:

- Use Railway Redis/Valkey for API-local cache, queue, idempotency, or rate
- limit state when the API owns the workload, if the cache/queue path is chosen.
- Use owner/persona-scoped keys and short TTLs.

Cloudflare-side default:

- Use Upstash Redis for Worker-side cache/rate-limit needs because it exposes a
  Worker-friendly REST/HTTP integration, if the Worker adapter path is chosen.

Discussion axes before choosing Redis as memory truth:

- Which memory tier is in scope: session scratchpad, short-term working memory,
  retrieval hot set, long-term persona memory, or queue/job state?
- What durability is required: Redis persistence/backups, Supabase mirror,
  rebuildable cache, or explicit ephemeral behavior?
- How eviction and expiry interact with continuity, user trust, and export.
- How owner/persona/Developer Space isolation is represented in keys and tests.
- How deletion, export, and audit work if Redis holds canonical private data.
- How semantic search works: Redis vectors, Supabase pgvector, Cloudflare
  Vectorize, or a hybrid.
- Whether Railway Redis, Upstash, or another provider matches the chosen runtime
  and compliance expectations.

## Lane 5 - Cloudflare retrieval adapter

Purpose: evaluate Cloudflare-only memory retrieval repos without forcing
Station onto Cloudflare.

Default architecture:

- Use a Worker as an adapter only.
- If Vectorize is used, store IDs and minimal metadata first.
- Fetch canonical records through Station/Supabase after owner and visibility
  checks.
- Read the current `Discern-AI/Station` repo-review notes first, then inspect
  any named Cloudflare-native repos or copied implementations that remain
  relevant after convergence.

Open questions:

- Which imported repo pattern actually requires Cloudflare runtime semantics,
  rather than merely being deployable on Cloudflare?
- Should a first adapter target public/Discover retrieval, private Studio
  retrieval, or a prototype-only harness?
- Should Vectorize contain private snippets, or only IDs and filters, after
  privacy review?

ARGUS gates:

- Owner and visibility filters remain structural.
- Deletion/export/privacy obligations are not duplicated incorrectly.
- Cloudflare index contents are auditable and reindexable.
- Provider dimension and index dimension are fixed and documented.

## Lane 6 - Memory UX and observability

Purpose: turn the upstream memory/observability foundations into user-visible
trust surfaces after staging is coherent.

PR109 audit update, 2026-06-20: the accepted PR60 through PR67 owner-readback
stack is useful and sanitized enough to build from. No required blocker was
found before the next Memory UX/observability slice. The recommended next
implementation lane is `PR110 - Memory Runtime Explanation Readback`: connect
owner-only Memory lifecycle state, selected runtime Memory rows, retrieval mode,
and skip/holdout reasons so owners can understand why memory did or did not
enter runtime context without exposing raw trace payloads, prompts,
completions, provider payloads, private archive excerpts, or private ids.

PR143 update, 2026-06-21: PR110 is closed. After ARGUS accepted PR142 as an
operator packet and MIMIR accepted the migration-ledger drift as an operator
caveat, the next Memory UX/observability implementation lane is
`PR143 - Memory Lifecycle Review Surface`: make quarantined, rejected, expired,
superseded, active-not-selected, and archive/source-held Memory legible to the
owner, with every visible control either wired or clearly disabled/preview-only.

PR144 update, 2026-06-21: PR143 is closed. The next Memory UX/observability
lane is `PR144 - AI Trace Detail Sanitization Gate`: harden
`/observability/traces/:traceId` and any owner UI helper around an explicit
allow-list before richer trace detail is exposed.

PR145 update, 2026-06-21: PR144 is closed. The next Memory UX/observability
lane is `PR145 - Settings AI Trace Detail Readback`: add a small owner-visible
Settings expansion that consumes the sanitized trace-detail route and shows a
safe event timeline.

PR146 update, 2026-06-21: PR145 is closed. The next Memory UX/observability
lane is `PR146 - Memory Graph Relationship Readback`: explain existing owner
memory relationships when edges exist, and keep an honest thin-state when they
do not.

PR147 update, 2026-06-21: PR146 is closed and Lane 6 is sufficiently complete
for now. The next lane is `PR147 - Background Jobs Activation Audit` under Lane
7: decide whether replay/import/export/developer-space evidence justifies a
real queue/worker implementation, or whether protected-alpha inline fallback
remains the right posture.

Inputs:

- AI trace sessions and events.
- Persona lifecycle and handoff records.
- Memory graph edges.
- Owner memory blocks.
- Memory lifecycle trust/status/decay/quarantine records.
- Developer Space live observatory widgets.

Likely UI work:

- Done: Memory runtime explanation readback.
- Done: richer review surfaces for quarantined, rejected, expired, superseded,
  active-not-selected, and archive/source-held Memory.
- Done: AI trace detail sanitization gate.
- Done: Settings AI trace detail readback.
- Done: Memory graph relationship readback.
- Later: deeper lifecycle/handoff workflows if current summaries prove
  insufficient in rehearsal.
- Later: richer AI trace detail only with a sanitization spec and ARGUS privacy
  gates.
- Later: Memory graph exploration after graph edges become meaningful enough for
  owner decisions.

Do not:

- Start a broad redesign.
- Promote raw traces or private memory graph data into public surfaces without
  ARGUS privacy gates.
- Treat observability as a replacement for focused validation.

## Lane 7 - Background jobs and realtime

Purpose: decide when Station needs real background infrastructure rather than
bounded synchronous protected-alpha flows.

Current next lane: `PR147 - Background Jobs Activation Audit`.

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

1. Lane 0 is accepted: upstream memory/observability/community work has been
   converged into the Railway fork.
2. Clear Lane 1 external Supabase/auth/storage blockers.
3. Apply/prove the `station_free_1536` embedding path, then run staged replay
   with optional NVIDIA chat.
4. Decide whether retrieval needs Cloudflare/Redis/NVIDIA migration work based
   on staged replay evidence and the imported repo demands now visible in
   `Discern-AI/Station`.
5. If retrieval migration opens, design it as configurable provider/dimension
   infrastructure rather than a single hard-coded provider swap.
