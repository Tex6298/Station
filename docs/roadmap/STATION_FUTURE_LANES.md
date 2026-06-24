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

## Phase 2D Developer Agent closeout

Status, 2026-06-23: PR176 closes Phase 2D Developer Agent expansion as a
source-of-truth packet rather than opening another automation verb by inertia.

Current truth:

- Safe readbacks, confirmation envelopes, non-external capability receipts,
  private draft save, selected draft publish, sanitized activity readback, and
  selected observatory status note are implemented and bounded.
- Hosted migrations `049` through `053` are present in the migration ledger for
  the Developer Agent confirmation/receipt lane.
- `update_layout`, `push_to_repo`, `run_job`, `rotate_ingestion_key`, and
  `create_webhook_signing_secret` remain blocked future actions even after
  owner approval.

Recommendation: open a protected-alpha human rehearsal lane next. Keep repo
push, job execution, key rotation, signing-secret creation, and layout mutation
blocked until rehearsal evidence identifies a concrete, reviewable gap.

## Phase 2E Developer Agent production readiness

Status, 2026-06-23: PR188 through PR191 are accepted after Phase 2D closeout
and the protected-alpha human rehearsal. Developer Agent Phase 2E is bounded
enough for now unless fresh evidence names a production blocker.

Phase 2E does not mean every Developer Agent tool is production-ready. It means
Station now needs a production-readiness classification for every action and a
single first hardening lane.

Current intended posture:

- Safe readbacks and preview-only `draft_project_update` are classified as
  production-capable now, bounded by owner-only access, minimized payloads, and
  no external side effects.
- Owner-confirmed receipt/artifact/public-note paths covered by PR189 are now
  production-capable when kept behind owner confirmation, receipt, audit-export,
  and minimized-payload boundaries.
- `update_layout` is accepted as owner-only suggestion/readback. Direct layout
  mutation remains blocked until a separate lane proves rollback/readback and
  owner safety.
- `run_job` is accepted as owner-only dry-run/readiness readback. Actual job
  execution remains blocked until a separate lane proves worker/queue, timeout,
  retry, idempotency, and owner status safety.
- `push_to_repo`, `rotate_ingestion_key`, and
  `create_webhook_signing_secret` remain blocked beyond Phase 2E; future
  planning packets may describe intent, but they must not add repo writes,
  credential mutation, or secret creation.
- Completed first Phase 2E implementation slice: Developer Agent production
  audit and receipt export hardening for `request_capability`,
  `save_project_update_draft`, `publish_to_page`, and `update_observatory`.
- Completed second Phase 2E implementation slice: `update_layout`
  suggestion/readback only. Direct layout mutation remains blocked and needs a
  separate future lane.
- Completed third Phase 2E implementation slice: `run_job` dry-run/readiness
  boundary only. Actual job execution, worker/queue enqueue, provider calls,
  shell, Redis/Upstash job state, deploys, and credential mutation remain out
  of scope.

## Memory continuity and observability UX

Status, 2026-06-23: PR192 is accepted after a narrow MIMIR implementation.
PR193 is closed after ARIADNE rehearsal. PR194 is accepted after the narrow
Continuity readability patch and ARIADNE hosted desktop/mobile recheck. PR195
through PR197 then closed the hosted replay evidence refresh, product demo
walkthrough, and protected-alpha demo runbook refresh with no implementation
blocker.

Current intent:

- Make Continuity a first-class persona stop instead of hiding the existing
  continuity route behind a `Timeline` label.
- Keep memory lifecycle/evidence readback on existing authorized fields; current
  Memory page helpers already expose runtime/lifecycle review.
- Keep Developer Space storytelling on existing public-safe methodology,
  evidence ordering, field-log, and reading-guide helpers already present on
  the public observatory route.
- Do not change provider, embedding, Redis/Cloudflare, queue, worker, billing,
  migration, auth/session, deployment, retrieval ranking, or memory truth in
  this lane.
- Use PR193 to decide whether the next implementation slice should be Memory
  lifecycle/evidence polish, Developer Space methodology/field-log storytelling,
  or no immediate UX follow-up.
- PR193 found Memory and Developer Space pass. PR194 closed the remaining
  CSS/copy-only Continuity readability issue for trust metric labels,
  record/source cards, record titles, and record body copy.
- Active follow-up: PR198 opens DAEDALUS feasibility mapping for UX-01 Studio IA
  and UX-02 Archive trust because the owner-side surfaces are demoable but
  dense. This is route/component mapping and ranked slice planning, not a broad
  reskin or backend lane.
- PR198 result: DAEDALUS recommended UX-01A Studio place and mobile workbench
  clarity as the first implementation slice. PR199 opens that slice for
  DAEDALUS. UX-02A Archive trust and UX-01B dense owner console grouping stay
  queued behind the Studio workbench pass.
- PR199 result: DAEDALUS implemented UX-01A inside Studio helpers/frame/sidebar/
  dashboard/persona workspace and scoped CSS, with no backend or boundary-scope
  change. PR200 opens ARIADNE visible desktop/375px review before MIMIR closes
  the slice or opens UX-02A/UX-01B.
- Phase 3 bridge decision, 2026-06-23: Phase 3 is not ready for direct product
  implementation. It is ready for a bridge/preflight sequence because public
  persona pages and bounded visitor interaction remain unproven. PR201 opens
  ARGUS hostile boundary preflight. DAEDALUS should not implement public persona
  eligibility/readback until ARGUS accepts or patches the bridge gates.
- PR200 result: ARIADNE accepted UX-01A with no DAEDALUS or ARGUS follow-up.
- PR201 result: ARGUS accepted the Phase 3 bridge only after correcting the
  first implementation lane to P3-B1A public persona eligibility, serializer
  split, and owner readback. PR202 opens that safety lane for DAEDALUS before
  UX-02A Archive trust or UX-01B dense owner-console grouping.
- PR202 result: DAEDALUS implemented and ARGUS accepted P3-B1A. PR203 opened
  P3-B2 public persona page readback with a hard route-contract guard. MIMIR
  has patched the first hostile-review blockers: UUID-shaped public slugs are
  rejected/prefixed, and public Space persona cards now require current owner
  public-persona exposure eligibility. Follow-up review accepted the second
  repair at `c898f82`; PR204 now sends the public persona page to ARIADNE for
  visible rehearsal.
- PR204 result: ARIADNE accepted the public persona page rehearsal on Railway
  after MIMIR repaired staging schema/seed drift. PR205 added and ARGUS
  accepted a visitor-safe public persona context preview shell. The first
  preview is intentionally public-profile-only.
- PR206 opens the next pre-chat bridge slice: expand the public context preview
  to already-public, already-routeable published documents and linked public
  discussion sources before any visitor chat product opens.
- PR206 result: DAEDALUS implemented and ARGUS accepted public document and
  linked public discussion sources in the anonymous preview. PR207 now opens a
  design gate for bounded public persona visitor chat before any provider-call
  implementation.
- PR207 result: DAEDALUS produced and ARGUS accepted the signed-in public
  persona chat gate. PR208 opens implementation with owner opt-in default-off,
  platform provider only, fail-closed rate limits, PR206 public sources only,
  and no durable visitor transcript.
- PR208 result: DAEDALUS implemented signed-in public persona chat alpha and
  ARGUS accepted the boundary. PR209 sent it to ARIADNE for hosted human
  rehearsal.
- PR209/PR210 result: ARIADNE initially found hosted schema/seed drift.
  DAEDALUS repaired the hosted public persona readback and enabled exactly one
  replay public-chat seed, then ARIADNE accepted the signed-out, signed-in,
  report, desktop/mobile, and public-source-only rehearsal.
- PR211 result: DAEDALUS implemented and ARGUS accepted owner/admin public
  interaction readback for public personas using existing safe data only.
  Unsafe legacy UUID-shaped public slugs are nulled before owner serialization.
- PR212 result: ARIADNE accepted the visible owner readback on hosted Railway.
- PR213 result: DAEDALUS implemented and ARGUS accepted aggregate-only public
  persona interaction counters after RPC scope hardening and UI copy
  clarification.
- PR214 result: DAEDALUS repaired/proved hosted migration/deploy readiness for
  the counters, then ARIADNE accepted the visible owner aggregate activity card
  on deployed Railway.
- PR215 result: DAEDALUS recommends Public Persona Roulette as the first next
  slice: no-new-config discovery/readback only, eligible public personas,
  existing public serializers, and no provider call.
- PR216 result: DAEDALUS implemented narrow Public Persona Roulette
  discovery/readback with a bounded draw route, routeable Discover persona
  search, and a small Discover sidebar affordance.
- PR216 review result: ARGUS accepted after hardening public search routeability
  so persona routes derive only from safe public slugs and ignore untrusted
  `href` values.
- PR217 result: ARIADNE accepted deployed Roulette API, Discover panel, public
  persona search routeability, desktop/mobile fit, and privacy boundaries.
- PR218 result: DAEDALUS recommends a branded subcommunity-backed Public Salon
  alpha, preceded by ARGUS hostile preflight because the slice touches
  public/community visibility, delegated moderation, membership expectations,
  persona linkage, Discover routeability, and public persona readback.
- PR219 decision: MIMIR accepts the PR218 product shape and opens ARGUS Salon
  Alpha Preflight before any Salon schema or product implementation. Salons
  should begin as asynchronous subcommunity-backed forum collections unless
  ARGUS blocks that route.
- PR219 result: ARGUS accepts Salon Alpha only with implementation gates.
  PR220 opens a narrow Public Salon Type Foundation lane for DAEDALUS:
  migration/types/API/web labels, existing forum gates preserved, persona-link
  routeability tightened, and Discover/public persona Salon readback deferred.
- PR220 result: DAEDALUS implemented and ARGUS accepted the Public Salon Type
  Foundation. PR221 opens hosted proof before any Salon UX/readback widening,
  because migration `058` must be present in hosted Supabase for staging to
  exercise the new `salon` type safely.
- PR221 result: DAEDALUS repaired hosted Community Beta schema drift for
  migrations `041` through `044` plus `058`, proved Railway web/API are on the
  PR220 code commit, created bounded public Salon seed
  `station-replay-salon-alpha`, and proved anonymous public-safe Salon
  read/list/category behavior. Recommended next lane: ARIADNE hosted Salon
  foundation rehearsal before Discover Salon grouping or public persona Salon
  readback.
- PR222 result: ARIADNE passed the hosted Salon foundation rehearsal and found
  only a non-blocking directory intro copy polish. PR223 opens the narrow public
  Salon directory/category readback polish before Discover or public persona
  Salon surfaces.
- PR223 result: DAEDALUS updated and ARGUS accepted the existing forum
  subcommunity directory and category empty-state readback to be honestly
  Salon-aware without changing API behavior, visibility gates, creation policy,
  Discover, or public persona surfaces. PR224 opens one focused ARIADNE hosted
  rehearsal for the changed visible copy.
- PR224 result: ARIADNE passed hosted Salon directory/category readback.
  PR225 opens Discover public Salon surfacing as routeable public
  forum/subcommunity results before public persona Salon readback.
- PR225 result: DAEDALUS implemented and ARGUS accepted Discover public Salon
  search surfacing as a bounded `salons` search bucket routed to existing
  `/forums/<categorySlug>` pages, with public/community visibility semantics
  preserved and route slugs hardened. PR226 opens a focused ARIADNE hosted
  rehearsal.
## Phase 3 bridge sequence

Status, 2026-06-24: PR202 through PR225 are accepted. PR226 Discover Salon
Surfacing Rehearsal is open for ARIADNE.

Current MIMIR position:

- The repo has public-safe patterns for Public Spaces, Developer Spaces,
  published documents, community read paths, and protected-alpha Studio.
- The repo has a real public persona route, visitor-safe public source catalog,
  an accepted signed-in visitor-chat implementation gate, signed-in public chat
  route, owner enable/disable control, and public persona reporting resolver.
  It now has hosted human rehearsal evidence for the public chat alpha,
  owner/admin interaction readback for public persona reports and public
  route/chat status, aggregate-only rolling counters for per-persona public
  interaction activity, and hosted rehearsal evidence for the owner aggregate
  activity card.
- Tier limits already include `publicPersonas`, but entitlement shape is not
  enough to open Phase 3 safely.

Bridge order:

1. ARGUS hostile boundary preflight.
2. Done: public persona eligibility, server-side visibility guards, serializer
   split, and owner readback.
3. Done: public persona page readback with no visitor chat.
4. Done: ARIADNE public persona page rehearsal.
5. Done: profile-only visitor-safe context preview shell.
6. Done: public document and linked public discussion context sources.
7. Done: bounded visitor chat design gate.
8. Done: signed-in public persona chat alpha with rate/message limits and
   reporting.
9. Done: DAEDALUS hosted schema/seed/readback repair for PR209.
10. Done: ARIADNE hosted human rehearsal of signed-in public persona chat
    alpha.
11. Done: owner/admin interaction readback for public persona reports and
    public route/chat status.
12. Done: ARIADNE hosted human rehearsal of owner public interaction readback.
13. Done: aggregate-only public persona interaction counters.
14. Done: hosted migration/deploy proof for aggregate counters.
15. Done: ARIADNE hosted human rehearsal of owner aggregate activity readback.
16. Done: compare Roulette, Salons, voice/avatar, public persona events,
   institutional/research features, and persona-to-persona encounters before
   choosing PR216.
17. Done: Public Persona Roulette discovery/readback with ARGUS routeability
    hardening.
18. Done: ARIADNE hosted human rehearsal of Roulette/search routeability.
19. Done: Public Salons feasibility/boundary gate.
20. Done: ARGUS Salon Alpha Preflight before any Salon schema or product
    code.
21. Done: Public Salon Type Foundation implementation and ARGUS review.
22. Done: Public Salon Foundation Hosted Proof.
23. Done: Public Salon Foundation Rehearsal.
24. Done: Public Salon Directory Readback.
25. Done: Public Salon Directory Readback Rehearsal.
26. Done: Discover Public Salon Surfacing.
27. Active: Discover Salon Surfacing Rehearsal.

ARGUS P3-B1A gates:

- `packages/config/src/tiers.ts` says `private.publicPersonas` is `0`, so
  private-tier owners must not be able to create or transition public personas.
- Existing persona create/update/read surfaces must enforce the eligibility
  decision server-side; client-supplied `skipIntegrityPreflight` cannot bypass
  public-persona tier eligibility.
- Owner and public/non-owner persona serializers must be split before any public
  persona route work. Public/non-owner readback and public Space persona cards
  may expose only explicit public profile/card fields, not owner/setup/private
  fields.
- Persona report context remains label/visibility-only with no route hint until
  a real public persona route exists and tests prove private personas still have
  no public route hint.

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
another optimization by guesswork.

PR181 update, 2026-06-23: the bounded Stripe paid-activation proof is accepted
for protected-alpha test mode. A clean non-production account completed hosted
Checkout, entitlement stayed inactive after Checkout creation alone, and
webhook-backed subscription state produced `canon/active`. Keep live-money
billing, broader Billing UX, pricing, invoices, tax, token top-ups, and the
dirty replay-owner cleanup as separate future lanes.

PR158 update, 2026-06-21: PR158 is accepted by ARGUS for MIMIR closeout. The
backend/product roadmap has been reconciled so PR111 through PR115 foundations
are not treated as pending blockers. Redis/Upstash remains operational cache/
idempotency/rate-limit/cache-only queue-state support, Cloudflare remains
adapter/index-mirror boundary only, and MIMIR should choose the next lane from
fresh hosted replay or product evidence.

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
