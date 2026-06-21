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
- Redis/Valkey's role is undecided beyond operational support. The accepted
  current role is cache, queue state, idempotency, rate-limit, and short-lived
  working state only; Redis as Memory truth is not a current implementation
  role and would require a separate MIMIR lane plus ARGUS privacy review.
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

Status: accepted foundation via PR113 Redis/Valkey Cache Foundation and PR114
Background Jobs Foundation. Current Redis/Upstash truth is operational cache,
idempotency, rate-limit, and cache-only queue-state support. Redis-backed
Memory truth is still not accepted.

MIMIR correction:

- Redis-backed Memory truth is not an accepted current role. MIMIR's
  conservative recommendation is to start with cache/queue/working-state roles
  because the current system's durable memory, visibility, export, and deletion
  contracts are Supabase-led.
- If a Developer Space or imported repo pattern wants Redis-backed memory truth,
  discuss it explicitly and define the durability, eviction, backup, ownership,
  deletion, export, search, and audit contracts before implementing.

Railway-side default:

- Use Railway Redis/Valkey for API-local cache, queue, idempotency, or
  rate-limit state when the API owns the workload, if the cache/queue path is
  chosen.
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

Status: accepted boundary via PR115 Cloudflare Retrieval Boundary. Cloudflare
remains adapter/index-mirror scope only; no live Worker, Queue, Vectorize call,
or authoritative private-memory behavior is accepted.

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

PR148 update, 2026-06-21: PR147 is closed with a no-worker verdict. The next
Lane 7 step is `PR148 - Owner Background Job Status Readback`: consolidate
existing owner import/export job status readback while keeping workers deferred.

PR149 update, 2026-06-21: PR148 is closed. The next lane is
`PR149 - Staged Replay Measurement Baseline`: measure current hosted/local
readiness and choose later optimization lanes from evidence rather than adding
workers, Cloudflare, Redis Memory truth, or provider changes by guesswork.

PR150 update, 2026-06-21: PR149 is sufficient as hosted measurement baseline.
The next lane is `PR150 - Memory Graph Edge Recording`: the hosted replay owner
has Memory graph nodes but 0 edges, so make explicit owner/lifecycle Memory
relationship actions create real owner-scoped `memory_item_edges` rows before
any richer graph UI or broad optimization work.

PR151 update, 2026-06-21: PR150 is closed and PR151 is closed after ARIADNE
hosted owner rehearsal. Memory supersession can now be exercised through the
owner Memory page and graph readback reports a real `supersedes` edge.

PR152 update, 2026-06-21: PR152 is closed. ARIADNE's repeated hosted sample
found context-preview latency is persistently above 4s on the current Railway
runtime: 7 counted HTTP 200 requests, median 4622ms, max / rough p95 4870ms,
and stable Memory/Archive vector retrieval shape.

PR153 update, 2026-06-21: `PR153 - Context Preview Latency Breakdown` is
accepted by ARGUS for MIMIR closeout. Owner context-preview now emits sanitized
`context.trace.timing` stage names and wall-clock durations for runtime context
assembly. Stage durations are not additive because several stages run
concurrently. No optimization was implemented before hosted per-stage evidence,
and operational cache was not touched. Provider swaps, Redis Memory truth/vector
storage/ranking, Cloudflare, workers, import repair, billing/auth/session work,
and broad UI remain out of scope.

PR154 update, 2026-06-21: PR153 is closed and accepted. The next lane is
`PR154 - Hosted Context Preview Timing Sample`: ARIADNE should capture hosted
`context.trace.timing` stage durations before MIMIR opens any optimization
lane. If timings identify a concrete bottleneck, MIMIR can open a targeted
DAEDALUS lane; if not, do not guess at cache/provider/Redis/Cloudflare/worker
changes.

PR155 update, 2026-06-21: PR154 is closed and PR155 is accepted by ARGUS for
MIMIR closeout. Hosted timing identified `archive_retrieval` as the first
target: median 3207ms versus trace total median 3549ms. PR155 batches Archive
candidate lifecycle validation and source citation loading through owner-scoped
reads, with a hardened hostile-source test for a candidate pointing at another
owner's import source, before considering retrieval-depth, provider, cache,
Redis, Cloudflare, or worker changes.

PR156 update, 2026-06-21: PR155 is closed and accepted. The next lane is
`PR156 - Hosted Archive Retrieval Remeasurement`: ARIADNE should remeasure the
same hosted context-preview timing shape against the PR154 baseline before
MIMIR opens any further optimization lane.

PR157 update, 2026-06-21: PR157 is accepted by ARGUS for MIMIR closeout. PR156
closes the immediate Archive-retrieval latency loop: hosted context-preview
outer median is now 1864ms and no counted request exceeded 3000ms. Current docs
now consolidate protected-alpha evidence and caveats rather than opening
another optimization by guesswork. Stripe paid activation remains a separate
proof until a real hosted test-mode Checkout or signed webhook mutation is run.

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

PR147 update, 2026-06-21: DAEDALUS recommends no queue/worker activation yet.
The current evidence supports protected-alpha inline fallback plus staged replay
measurement. Upstash REST is cache-only, not worker queue readiness; TCP
Redis/Valkey is queue-capable config only if present, and inline fallback
remains available. If MIMIR wants a PR148 before replay, it should be an
owner-only background job status/readback consolidation lane, not BullMQ,
Redis/Valkey worker runtime, Cloudflare Queue, or broad job processing.

Current status: PR149 is closed as sufficient hosted measurement, PR150 and
PR151 are closed, PR152 is closed as repeated hosted latency evidence, PR153 is
closed as timing instrumentation, PR154 is closed as hosted timing evidence, and
PR155 is closed as Archive retrieval batch validation, PR156 is closed as hosted
remeasurement, and PR157 is open for staging alpha evidence refresh.
Do not open a worker, Redis Memory, Cloudflare, provider, billing, or broad UI
optimization lane from local proof alone; choose future follow-up from hosted
replay evidence and ARGUS/MIMIR sequencing.

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
