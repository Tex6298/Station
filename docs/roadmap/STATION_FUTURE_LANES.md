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

## Current staged replay baton

Status, 2026-06-24: PR271 passed ARIADNE's hosted human-eye rehearsal with
caveats. ARGUS accepted PR272's tiny polish lane for the three bounded visible
defects with no review patch: Discover right-rail `Drawing...` honesty, public
Developer Space live/readback status wording, and one public forum category
encoding artifact. MIMIR should send those three visible caveats back to
ARIADNE for a focused hosted rerun before closing them from product evidence.
PR273 is that focused hosted rerun.

Do not use PR272 or PR273 to reopen backend semantics, schema, auth, providers,
Redis/Cloudflare, billing, queues, workers, staged data, or broad visual
redesign. They are a polish bridge before deciding the next product/backend
lane.

PR273 passed. PR274 completed as `PASS WITH CAVEATS`: hosted freshness,
replay-owner auth/session persistence, context readback, and observability
passed, and the single chat turn was safe and traceable. The caveat is runtime
answer quality: the model only partially recalled the seeded anchor set despite
Memory, Archive, Continuity, Integrity, and Canon context being present.

MIMIR chose full two-anchor recall as the acceptance bar for the seeded replay
probe. PR275 patched the narrow retrieval-selection defect: vector Memory
retrieval now backfills spare requested slots with owner-scoped,
lifecycle-filtered lexical Memory matches. ARGUS accepted the patch after
hardening the supplemental retrieval fixture to exclude other-owner and
archive-source candidates. PR276 then failed the hosted recall bar: hosted
generic context still selected only partial accepted-anchor evidence. PR277
patched that follow-up retrieval-selection defect by blending owner-scoped,
lifecycle-filtered lexical Memory candidates with full vector Memory results
before slicing to the requested limit. ARGUS accepted the patch; MIMIR opened
the ARIADNE hosted PR278 rerun after deploy.
PR278 failed the hosted recall bar with deploy/auth/session/persona/chat
safety/rejected-control/observability passing and hosted generic context still
partial. PR279 patched the hosted/local context-selection mismatch: selected
private Memory now contributes full content alongside a differing summary, so a
partial summary cannot erase selected owner-safe evidence before prompt
assembly. ARGUS accepted the patch; the next proof should be an ARIADNE hosted
PR280 rerun after deploy. MIMIR opened that PR280 hosted rerun.
PR280 proved full selected context on hosted Railway but the answer still
missed the full recall bar. PR281 patched the bounded answer-grounding layer:
private persona prompts with selected context now explicitly answer direct
factual questions from selected context first, preserve safe requested shapes,
and avoid omitting directly relevant selected names/phrases for persona-only
style. ARGUS accepted the patch; the next proof should be an ARIADNE hosted
PR282 rerun after deploy. MIMIR opened that PR282 hosted rerun.
PR282 proved PR281 deployed and full selected context is present, but the answer
still missed the recall bar. PR283 patched hosted answer-grounding enforcement
with a final selected-context answer-focus guard after the persona voice close.
ARGUS accepted the patch; the next proof should be an ARIADNE hosted PR284
rerun after deploy. MIMIR opened that PR284 hosted rerun.
PR284 proved PR283 deployed and improved hosted answer behavior: the answer now
recalls both invented retrieval phrases, but neither paired accepted concept
label. PR285 patched answer-label preservation by formatting Memory prompt
input with selected source titles/labels alongside content, matching Archive
and Integrity behavior. ARGUS accepted the patch; MIMIR opened the ARIADNE
hosted PR286 rerun after deploy.
PR286 proved selected context still contains both labels and phrases, but the
hosted answer recalled none of them. PR287 opens DAEDALUS repair for reliable
selected-context answer use after context selection, with retrieval/context
assembly closed unless provider-prompt evidence proves selected context is
absent.
DAEDALUS completed PR287 by duplicating compact selected-context focus into the
provider-facing final user message, keeping the original owner message under an
`Owner message:` section and counting the actual provider payload length in
runtime budget/quota estimates. ARGUS accepted the patch after adding a focused
stored-message boundary assertion; MIMIR opened the ARIADNE hosted PR288 rerun
after deploy.
PR288 proved the hosted answer now recalls both matching invented phrases, but
still drops both paired accepted concept labels. PR289 opens DAEDALUS
concept-label carry-through repair, with retrieval/context placement closed
unless provider-prompt evidence proves selected labels are absent.
DAEDALUS completed PR289 by changing provider selected-context focus from
parenthetical titles to explicit `selected label/name` plus `supporting fact`
pairs and adding a generic instruction to include selected labels, names, or
titles with relevant facts. ARGUS accepted PR289 with no review patch and
recommends that MIMIR open an ARIADNE PR290 hosted rerun after deploy. MIMIR
opened that PR290 hosted rerun for post-deploy label and phrase recall proof.
PR290 proved hosted selected context still contained both labels and phrases,
but the hosted answer recalled none. PR291 opens a DAEDALUS selected-context
answer-contract diagnostic/repair lane with ARGUS required to gate any retry,
verifier, accounting, or trace behavior before another hosted rerun.
DAEDALUS completed PR291 by adding a private-only answer contract verifier and
one-shot retry for direct/factual private persona prompts that miss all selected
focus. Trace payloads store only sanitized counts/reason codes, and quota/token
accounting includes the possible retry conservatively. ARGUS accepted PR291
after tightening the direct-factual gate so creative/style prompts do not retry
just because they contain a question mark. MIMIR opened the ARIADNE PR292
hosted rerun after deploy.

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

Status, 2026-06-24: PR192 is accepted after a narrow MIMIR implementation.
PR193 is closed after ARIADNE rehearsal. PR194 is accepted after the narrow
Continuity readability patch and ARIADNE hosted desktop/mobile recheck. PR195
through PR197 then closed the hosted replay evidence refresh, product demo
walkthrough, and protected-alpha demo runbook refresh with no implementation
blocker. PR199/PR200 accepted the UX-01A Studio place/mobile workbench clarity
slice. PR262 is accepted by ARGUS as the owner-only runtime provenance
stitching slice, PR263 passed ARIADNE hosted desktop/mobile rehearsal, and
PR264 is accepted by ARGUS with a narrow source-count honesty patch as UX-02A
Per-Persona Archive Trust States. PR265 passed ARIADNE hosted desktop/mobile
rehearsal. PR266 is complete: DAEDALUS found UX-02B and UX-DEBT-01 current,
accepted PR264/PR265 as UX-02A closeout, and recommends no new local UX
implementation lane before a staging readiness truth check. PR267 failed
because staged `/developer` returned HTTP 404 while `/developer-spaces` and the
replay Developer Space observatory were live. PR268 is accepted locally with an
ARGUS route-handler patch for `/developer` to `/developer-spaces`, but hosted
deploy freshness at `b31cf1e` still returned HTTP `307` without a `Location`
header. PR269 adds a middleware-level redirect and dynamic/no-store route
fallback. ARGUS patched redirect URL construction to avoid Railway's internal
`0.0.0.0:8080` origin, then hosted route probes passed at `c2cf0cb`. ARGUS
accepted PR270 staged replay owner measurement; the recommended next move is
ARIADNE human-eye replay rehearsal so product judgement comes from hosted
owner-route evidence. PR271 completed that rehearsal as `PASS WITH CAVEATS`;
ARGUS accepted PR272's narrow polish response and recommends a focused ARIADNE
hosted rerun before MIMIR closes the visible caveats.

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
- PR261 result: DAEDALUS recommends **PR262 - Owner Runtime Provenance
  Stitching Readback** as the next narrow Memory/observability implementation
  lane. Existing Memory runtime/lifecycle readback, Continuity stop/readability,
  Memory graph/supersession, AI trace sanitization, Archive trust, and Studio
  place clarity are done enough for protected-alpha. The remaining gap is that
  owners must still mentally stitch runtime context, Memory, Continuity,
  Archive, Canon, and Integrity provenance across separate surfaces. PR262
  should be owner-only, use existing authorized inputs, hide source bodies and
  compiled prompts, and show only sanitized labels, counts, reasons, and review
  targets. ARGUS reviewed the audit before MIMIR opened implementation.
- PR261 ARGUS review accepted the audit with no patch. MIMIR may open PR262
  with the owner-only/readback-only boundary, or pause Memory work if roadmap
  priorities change.
- PR262 result: DAEDALUS implemented and ARGUS accepted owner-only runtime
  provenance stitching on `/studio/personas/[personaId]/continuity` with no
  review patch. The readback groups Canon, Integrity, Continuity, Memory, and
  Archive runtime sources with sanitized labels/counts/reasons/review targets
  only. Compiled prompts and source bodies stay hidden, retrieval/provider/
  schema/public behavior did not change, and the visible owner route should go
  to ARIADNE desktop/mobile rehearsal before closeout.
- PR263 opens ARIADNE hosted desktop/mobile rehearsal for the visible owner
  Continuity route before PR262 closeout.
- PR263 result: ARIADNE passed hosted desktop/mobile rehearsal with no repair
  needed. MIMIR closes the PR262/PR263 Memory/observability chain and opens
  PR264 as UX-02A Per-Persona Archive Trust States.
- PR264 result: DAEDALUS implemented and ARGUS accepted per-persona Archive
  trust state rows on `/studio/personas/[personaId]/files` using existing owner
  APIs and reusable archive trust helpers. ARGUS patched the helper/tests so
  uploaded file import jobs remain status signals instead of double-counting as
  separate owner-only source material. The route calls out owner-only sources,
  ready for Continuity, needs-review failures, and queued/processing imports
  while keeping failed import messages visible and storage/quota
  server-reported. PR265 opens ARIADNE hosted desktop/mobile rehearsal before
  UX-02A closeout.
- PR265 result: ARIADNE passed hosted desktop/mobile rehearsal with no repair
  needed. MIMIR closes PR264/PR265 and opens PR266 for DAEDALUS to reconcile
  current UI/UX lane truth before any further implementation.
- PR266 result: DAEDALUS recommends **PR267 - Staging Readiness Truth Check**
  instead of another local UX implementation lane. UX-02B Persona Export Status
  and UX-DEBT-01 mobile top-nav are current; UX-01B and UX-03 should wait for
  staged replay evidence or a concrete MIMIR-named blocker.
- PR267 result: ARGUS found hosted web/API health and readiness fresh enough
  for product-code purposes, with runtime deployed at commit `38ad00e` and only
  docs/state commits after it. Public `/`, `/discover`, `/forums`,
  `/developer-spaces`, and `/developer-spaces/station-replay-dev-alpha` returned
  HTTP 200, but `/developer` returned HTTP 404. MIMIR should open a narrow
  DAEDALUS repair lane for a public `/developer` redirect or alias to
  `/developer-spaces`, then rerun public route probes before broader UX/product
  work. PR268 is that repair lane.
- PR268 result: ARGUS accepted the narrow `/developer` repair with a review
  patch after the hosted DAEDALUS page-level redirect returned HTTP `307`
  without a `Location` header. The accepted route-handler patch emits a real
  HTTP `307` redirect to `/developer-spaces` locally and preserves Developer
  Space API/schema/auth/env/product behavior. MIMIR reran hosted probes after
  deploy freshness at `b31cf1e`: web/API health were fresh, but hosted
  `/developer` still returned HTTP `307` without `Location` and
  `x-nextjs-cache: HIT`. PR269 adds the next narrow hosted redirect repair:
  middleware intercepts `/developer` before route handling/cache, while the
  route handler remains dynamic/no-store as a fallback. ARGUS patched redirect
  URL construction so hosted redirects use forwarded public host/proto or
  `NEXT_PUBLIC_APP_URL` instead of Railway's internal `0.0.0.0:8080` origin.
  Hosted probes passed at `c2cf0cb`: `/developer` returned HTTP `307` with
  `Location: https://stationweb-production.up.railway.app/developer-spaces`,
  and the PR267 public route set returned HTTP `200`. ARGUS accepted PR270
  hosted owner-route measurement using the existing local replay-owner env; the
  packet is sanitized to statuses/counts/booleans/timing buckets and recommends
  ARIADNE human-eye replay rehearsal before any next implementation lane. PR271
  completed that rehearsal as `PASS WITH CAVEATS`; ARGUS accepted PR272's
  narrow polish response and recommends a focused ARIADNE hosted rerun before
  MIMIR closes the visible caveats.
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
- PR226 result: ARIADNE passed hosted Discover Salon search rehearsal. PR227
  opens the deferred public persona Salon readback lane, limited to
  anonymous/public already-routeable Salon thread links and counts in the
  public persona context preview/readback path.
- PR227 implementation result: DAEDALUS added bounded public persona context
  preview/readback for public Salon threads linked to the same eligible public
  persona. ARGUS passed after excluding document-linked threads from the new
  Salon source path. PR228 opens hosted proof and bounded seed preparation
  before ARIADNE human rehearsal.
- PR228 result: DAEDALUS proved hosted Railway freshness at commit `e58a5e4`,
  created the bounded persona-linked public Salon proof thread, and confirmed
  anonymous context-preview returns one safe `public_salon_thread` source with
  no private/raw-id leakage. PR229 opens ARIADNE hosted human rehearsal.
- PR229 result: ARIADNE passed hosted public persona Salon rehearsal. The public
  persona page can show and route one bounded public Salon thread source in
  the visitor-safe context preview without private/raw-id leakage. PR230 opens
  ARGUS hostile preflight for public persona events before any event feed,
  timeline, readback, or schema work.
- PR230 result: ARGUS accepted a first public persona events slice only as
  derived-only public persona page readback. PR231 opens DAEDALUS implementation
  with no event table, write path, global feed, event-level moderation,
  chat/report/counter/provider events, or new external config.
- PR231 result: DAEDALUS implemented derived-only public persona event readback
  and ARGUS accepted after hardening public discussion event route safety to
  require safe non-UUID forum category slugs. PR232 opens hosted ARIADNE
  rehearsal before the next product lane.
- PR232 result: ARIADNE passed hosted public persona event readback rehearsal.
  PR233 opens a DAEDALUS institutional/research Project lane map before
  implementation, because existing Project scaffolding is private-owner only
  and PR215 deferred institutional/research work until ownership shape is
  reconciled.
- PR233 result: DAEDALUS mapped the current Project/institutional/research
  truth. Projects are private owner scaffolding only; membership roles,
  public Projects, Project exports, institutional admin/billing, and hosted
  runtime remain blocked. Recommended next lane: PR234 Owner Project Evidence
  Readback, private owner-only and schema-free, deriving evidence/citation
  metadata from already-attached Developer Spaces and linked documents.
- PR234 result: DAEDALUS implemented private owner-only Project evidence
  readback from attached owner Developer Spaces and linked documents. ARGUS
  accepted after removing the raw internal link-row id path. PR235 opens
  hosted ARIADNE rehearsal before treating the visible owner Project detail UI
  lane as closed or broadening Project/institutional work.
- PR235 result: ARIADNE passed hosted freshness, visible owner Project
  evidence UX, evidence links, desktop/mobile fit, and signed-out boundary, but
  failed the API payload boundary because `project.ownerUserId` still leaks
  from the broader Project serializer. PR236 opens a narrow DAEDALUS repair.
- PR236 result: DAEDALUS removed browser-facing Project owner id exposure while
  preserving server-side owner authorization and Project owner membership
  writes. ARGUS accepted and requires a focused hosted rerun before PR235's
  Railway-found boundary failure is considered resolved.
- PR237 result: ARIADNE passed the hosted owner id rerun. Project list/detail
  payloads no longer expose owner id fields, owner Project evidence still
  renders on desktop/mobile, and signed-out boundaries remain closed. PR238
  opens ARGUS preflight before public Project readback or broader
  institutional/research Project surfaces.
- PR238 result: ARGUS patched the first public Project lane down to PR239
  Public Project Profile Readback: anonymous public route/page for public
  Projects only, safe slug only, no Project evidence/documents/activity/
  Discover/reporting/membership/export/billing/runtime/provider/Redis/
  Cloudflare scope.
- PR239 result: DAEDALUS implemented the standalone anonymous public Project
  profile route/page with public-only Project metadata and same-owner attached
  public Developer Space summaries. ARGUS accepted and requires ARIADNE hosted
  rehearsal before the route is treated as complete.
- PR240 result: ARIADNE passed hosted API/public-private boundary checks for
  public Project profile readback, but the anonymous web page
  `/projects/public/:slug` redirected to login because the web auth guard still
  protected the entire `/projects` route family. PR241 opens the narrow web
  auth exception repair.
- PR241 result: DAEDALUS added the `/projects/public` web auth-route exception
  while preserving auth protection for owner Project routes. ARGUS accepted and
  requires focused hosted rerun before PR240's web redirect failure is
  considered resolved.
- PR242 result: ARIADNE passed the focused hosted rerun. Anonymous hosted
  `/projects/public/:slug` now renders public Project profile readback instead
  of redirecting to login, public/private slug boundaries stayed closed, and
  owner Project evidence routes remain protected.
- PR243 opens Discover Public Project Surfacing as the next narrow step:
  routeable Discover search results for already-public Projects only, using the
  accepted `/projects/public/:slug` destination and safe public summary fields.
- PR243 result: DAEDALUS implemented Discover public Project search surfacing
  and ARGUS accepted the local/API/web boundary. PR244 opens hosted ARIADNE
  rehearsal before the Discover Project surfacing loop is closed.
- PR244 result: ARIADNE passed hosted Discover public Project rehearsal.
  Anonymous visitors can now find an already-public Project through Discover
  search and route to `/projects/public/:slug` without login or owner-route
  leakage.
- PR245 opens ARGUS preflight for public Project evidence/readback before any
  visitor-facing Project evidence, document, provenance, or research context is
  exposed on public Project pages.
- PR245 result: ARGUS returned `PATCH`. Public Project evidence can proceed
  only as PR246 Public Project Evidence Minimal Readback: a bounded
  `publicEvidence` bucket on `GET /projects/public/:slug`, sourced from
  same-owner attached public Developer Spaces, public link rows, and
  same-owner published public documents, with no private owner evidence shape,
  direct document links, body excerpts, raw source labels, internal ids, or
  runtime/provider/billing/queue/cache scope.
- PR246 result: DAEDALUS implemented public Project evidence minimal readback
  and ARGUS accepted with one narrow web fallback patch. PR247 opens hosted
  ARIADNE rehearsal before the public evidence loop is closed.
- PR247 result: ARIADNE passed hosted public Project evidence rehearsal.
  Public Project evidence appears on hosted Railway for a valid public-evidence
  seed, links only to `/developer-spaces/:slug`, and no-evidence Projects
  remain neutral.
- PR248 opens ARGUS preflight for owner-only Project export boundaries before
  any Project export package, manifest, bundle, migration, membership
  permission, or background export work.
- PR248 result: ARGUS returned `PATCH`. Project export can proceed only as
  PR249 Owner Project Export Manifest Foundation: owner-only API routes,
  explicit `export_packages.project_id`, `project_manifest` package kind, RLS
  target ownership, manifest-only JSON/Markdown readback, no bundle support,
  no document/file bodies, no nested Developer Space export data, no public
  routes, and no membership/admin/billing/background worker scope.
- PR249 result: DAEDALUS implemented the owner-only Project export manifest
  foundation and ARGUS accepted. Project manifest packages now have explicit
  package targeting, owner-only list/create/readback, bounded JSON/Markdown
  manifest sections, separate owner/public evidence refs, and a deliberate
  `/exports/:id/bundle` `409` until a separate bundle boundary lane is
  approved.
- PR250 opens ARGUS preflight for enabling owner-only Project manifest bundles
  without broadening export payloads or adding public/download/background/UI
  scope.
- PR250 result: ARGUS returned `PATCH`. Project manifest bundle support can
  proceed only as PR251 Owner Project Manifest Bundle Readback: existing
  authenticated `/exports/:id/bundle`, completed `project_manifest` rows with
  valid stored readback only, exactly `README.md`, `manifest.json`, and
  `manifest.md`, no live Project/source-table regeneration, no raw owner/target
  ids beyond the stored manifest content, and no public/download/UI/background
  scope.
- PR251 result: DAEDALUS implemented owner-only Project manifest bundle
  readback and ARGUS accepted with one narrow validation-hardening patch.
  Completed `project_manifest` bundles now return stored `README.md`,
  `manifest.json`, and `manifest.md` only; malformed or schema-only stored
  readbacks return bounded `409`; persona and Developer Space bundle behavior
  remains unchanged.
- PR252 opens DAEDALUS implementation for the private owner Project export UI
  panel, using accepted Project export APIs only and adding no schema, public
  route, membership/admin/billing, jobs, Redis, Cloudflare, provider/runtime,
  or payload changes.
- PR252 result: DAEDALUS implemented the private owner Project export panel and
  ARGUS accepted with one narrow UI honesty patch. ARIADNE hosted owner-eye
  rehearsal is required before closeout because visible browser behavior
  shipped.
- PR253 opens ARIADNE hosted rehearsal for the private owner Project export
  panel at or beyond ARGUS review commit `ac1cb40`.
- PR253 result: ARIADNE was blocked before browser panel checks because hosted
  Supabase was missing `export_packages.project_id`. MIMIR applied and verified
  migration `059_project_export_manifest.sql` on hosted Supabase through the
  pooler.
- PR254 opens the ARIADNE hosted rerun for the same owner Project export panel
  rehearsal after hosted schema repair.
- PR254 result: ARIADNE passed the hosted owner Project export rerun. The
  private owner panel, package listing, create-manifest action, manifest
  readback, bundle readback, stale-selection clearing, unrelated-route absence,
  privacy boundaries, and desktop/mobile layout are accepted for
  protected-alpha scope.
- PR255 result: DAEDALUS completed the Developer Space Partner Readiness Map in
  `docs/roadmap/DEVELOPER_SPACE_PARTNER_READINESS_MAP.md`. Current Station has
  strong Tier 1 protected-alpha pieces: public observatory, owner manage
  console, ingestion API, developer client, evidence documents, usage/quota/key
  controls, field visibility controls, exports, and bounded agent
  readbacks/receipts. It is not yet a full partner-ready Developer Page
  template, and it must not claim Tier 2 hosted infrastructure or destructive
  developer-agent readiness.
- Recommended next lane: PR256 should be an ARGUS preflight for Developer Space
  Tier 1 partner readiness before DAEDALUS implements standalone partner
  onboarding/readback docs or small public/owner framing improvements.
- ARGUS accepts PR255 with a wording patch clarifying owner-managed
  observed-runtime signing-secret controls versus blocked developer-agent
  signing-secret creation. MIMIR should open or revise PR256 next.
- PR256 opens ARGUS hostile preflight for the exact Tier 1 partner-readiness
  implementation boundary before DAEDALUS changes partner-facing docs or
  visible Developer Space framing.
- PR256 result: ARGUS returned `PATCH`. PR257 may open only as docs-only
  Developer Space Tier 1 Partner Onboarding Docs. Visible public Developer Space
  framing and owner-console UI copy must wait for a separate browser-rehearsed
  DAEDALUS/ARIADNE lane.
- PR257 opens DAEDALUS docs-only implementation for
  `docs/integration/developer-space-tier1-partner-onboarding.md`, with
  placeholder-only ingestion examples, TypeScript client examples,
  visibility/privacy explanation, owner-console readiness checklist,
  sanitized troubleshooting, and explicit Tier 2/Tier 3 deferrals.
- PR257 result: DAEDALUS added the Tier 1 partner onboarding/readback docs with
  placeholder-only curl and TypeScript ingestion examples, visibility/privacy
  guidance, owner-console readiness checklist, sanitized troubleshooting, and
  explicit deferrals. Scope stayed docs-only; visible public Developer Space
  framing and owner-console UI copy remain split into a later browser-rehearsed
  lane.
- PR257 ARGUS review accepted the docs with no patch. MIMIR should decide
  whether PR258 opens visible public Developer Space framing and owner-console
  copy as a separate browser-rehearsed lane, without API/schema/client/hosted
  infrastructure scope.
- PR258 opens the visible Developer Space Tier 1 framing lane for DAEDALUS.
  Scope is limited to existing public `/developer-spaces/[slug]` framing,
  owner `/developer-spaces/[slug]/manage` copy, observatory helper copy, and
  focused tests. Tier 1 must read as external/self-hosted developer runtime
  plus Station-hosted showcase/observatory/evidence/readback; no API/schema/
  client/package/infra/billing/community/developer-agent execution scope opens.
- PR258 result: DAEDALUS updated existing public and owner Developer Space
  browser framing plus observatory helper copy/tests. The public page now reads
  as Station-hosted Tier 1 showcase/observatory/evidence/readback for an
  external self-hosted runtime. The owner page now reads as a private operating
  console for keys, usage/quota, evidence, exports, visual framing, and bounded
  readbacks. API/schema/client/package/infra/billing/community/developer-agent
  execution scope stayed closed.
- PR258 ARGUS review accepted the visible framing with no review patch. Because
  the lane changes visible browser behavior, MIMIR should route ARIADNE
  desktop/mobile rehearsal before closeout.
- PR259 opens ARIADNE hosted desktop/mobile rehearsal for PR258. It should
  verify Railway freshness at or beyond `9c18eb6`, public
  `/developer-spaces/station-replay-dev-alpha`, and owner
  `/developer-spaces/station-replay-dev-alpha/manage` without widening product
  scope.
- PR259 result: ARIADNE passed hosted desktop/mobile rehearsal. PR260 opens a
  docs-only Developer Space Tier 1 closeout audit before any further
  implementation slice.
- PR260 result: DAEDALUS recommends closing Developer Space Tier 1
  protected-alpha for now. No blockers remain after mapping, ARGUS preflight,
  partner onboarding docs, visible public/owner framing, ARGUS review, and
  ARIADNE hosted desktop/mobile rehearsal. Remaining items are either accepted
  caveats or deferred lanes: project updates/changelog/feed, Developer
  Space-specific community/forum, connection-tier product state, pricing/
  tipping, Tier 2 hosted infrastructure, Tier 3 lab work, Cloudflare/Redis/
  provider questions, and developer-agent execution expansion.
- PR260 ARGUS review accepted the closeout audit with no patch. MIMIR can close
  Developer Space Tier 1 protected-alpha for now and return sequencing to
  non-Developer-Space priorities unless a real partner pilot names a gap.
- PR262 result: DAEDALUS implemented and ARGUS accepted Owner Runtime Provenance
  Stitching Readback. PR263 passed ARIADNE hosted desktop/mobile rehearsal.
  PR264 implements UX-02A Per-Persona Archive Trust States and ARGUS accepted it
  with a narrow source-count honesty patch. PR265 opens ARIADNE hosted
  desktop/mobile rehearsal for the visible owner Archive route. PR266 confirmed
  UX-02B and mobile top-nav debt are current, closes the post-Archive lane
  selection audit, and recommends a staging readiness truth check before any
  further local UX implementation.

## Phase 3 bridge sequence

Status, 2026-06-24: PR202 through PR266 are accepted. Developer Space Tier 1
protected-alpha is closed for now. PR266 recommends staging readiness evidence
before another local Studio/Archive UI implementation lane.

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
27. Done: Discover Salon Surfacing Rehearsal.
28. Done: Public Persona Salon Readback.
29. Done: Public Persona Salon Hosted Proof.
30. Done: Public Persona Salon Human Rehearsal.
31. Done: Public Persona Events Preflight.
32. Done: Public Persona Event Readback.
33. Done: Public Persona Event Readback Hosted Rehearsal.
34. Done: Institutional/Research Project Lane Map.
35. Done: Owner Project Evidence Readback.
36. Failed: Owner Project Evidence Hosted Rehearsal, owner id payload defect.
37. Done: Project Owner Id Serializer Repair.
38. Done: Project Owner Id Hosted Rerun.
39. Done: Public Project Readback Preflight.
40. Done: Public Project Profile Readback.
41. Failed: Public Project Profile Hosted Rehearsal, web auth exception defect.
42. Done: Public Project Web Auth Exception.
43. Done: Public Project Profile Focused Hosted Rerun.
44. Done: Discover Public Project Surfacing local/API/web review.
45. Done: Discover Public Project Hosted Rehearsal.
46. Done: Public Project Evidence Preflight.
47. Done: Public Project Evidence Minimal Readback local/API/web review.
48. Done: Public Project Evidence Hosted Rehearsal.
49. Done: Project Export Boundary Preflight.
50. Done: Owner Project Export Manifest Foundation.
51. Done: Project Export Bundle Boundary Preflight.
52. Done: Owner Project Manifest Bundle Readback.
53. Done: Owner Project Export UI Panel.
54. Blocked then repaired: Owner Project Export Hosted Rehearsal.
55. Done: Owner Project Export Hosted Rerun.
56. Done: Developer Space Partner Readiness Map.
57. Done: Developer Space Tier 1 Partner Readiness Preflight.
58. Done: Developer Space Tier 1 Partner Onboarding Docs.
59. ARGUS accepted: Developer Space Tier 1 Visible Framing implementation.
60. Done: ARIADNE hosted desktop/mobile rehearsal for PR258 visible public and
    owner Developer Space routes.
61. ARGUS accepted: Developer Space Tier 1 closeout audit.
62. ARGUS accepted: Memory Observability Next Slice Audit recommends PR262
    Owner Runtime Provenance Stitching Readback.
63. ARGUS accepted: Owner Runtime Provenance Stitching Readback.
64. Done: ARIADNE Runtime Provenance Rehearsal.
65. ARGUS accepted: Per-Persona Archive Trust States.
66. Done: ARIADNE Archive Trust Rehearsal.
67. DAEDALUS completed: Post-Archive UX Lane Selection recommends PR267
    Staging Readiness Truth Check.
68. ARGUS failed: Staging Readiness Truth Check found staged `/developer` 404;
    repair with a `/developer` redirect or alias to `/developer-spaces`.
69. ARGUS accepted: Developer Route Alias Repair with a route-handler patch;
    hosted rerun at `b31cf1e` still returned `/developer` 307 without
    `Location`.
70. ARGUS accepted: Developer Route Hosted Redirect Repair with a forwarded
    public-origin patch and hosted route proof at `c2cf0cb`.
71. ARGUS accepted: Staged Replay Owner Measurement Refresh; recommend ARIADNE
    human-eye replay rehearsal.
72. Open: ARIADNE Staged Replay Human-Eye Rehearsal.

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

PR261 update, 2026-06-24: Developer Space Tier 1 is closed for protected-alpha
after PR260. DAEDALUS completed the Memory Observability Next Slice Audit and
recommends `PR262 - Owner Runtime Provenance Stitching Readback`, pending ARGUS
review.

PR261 decision:

- Do not reopen generic Memory state, lifecycle review, graph exploration,
  richer trace detail, or hosted rehearsal by inertia. Runtime Memory
  explanation, lifecycle review, Memory graph/supersession, AI trace
  sanitization/readback, Continuity stop/readability, Archive trust, and Studio
  place clarity are done enough for protected-alpha.
- The remaining gap is cross-surface provenance comprehension: runtime context
  lists Canon, Integrity, Continuity, Memory, and Archive sources, but the owner
  still has to stitch that list to Memory lifecycle state, Continuity source
  labels, Archive trust/readiness, and review targets across separate routes.
- PR262 should add owner-only, readback-only runtime provenance stitching near
  the Continuity route runtime preview. It should use existing authorized
  inputs and render only sanitized source groups, counts, titles/labels,
  reasons, provenance labels already available, and review-target copy.
- PR262 must hide source bodies and compiled prompts for this surface and must
  not change retrieval ranking, embeddings, memory truth, source serialization,
  visibility, providers, Redis/Cloudflare, queues/workers, schema/migrations,
  billing, auth/session, deployment, public memory, public observability, or
  broad Studio design.
- PR262 result: DAEDALUS implemented owner-only/readback-only runtime provenance
  stitching on the Continuity route and ARGUS accepted it with no patch. The
  readback uses existing context-preview data to group Canon, Integrity,
  Continuity, Memory, and Archive sources with sanitized labels/counts/reasons/
  review targets only. Compiled prompts and source bodies remain hidden.
  PR263 opens ARIADNE hosted desktop/mobile rehearsal for
  `/studio/personas/[personaId]/continuity` before closeout.

Original PR261 candidate set:

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
- Recommended next: owner-only runtime provenance stitching across selected
  Canon, Integrity, Continuity, Memory, and Archive sources using sanitized
  labels/counts/reasons/review targets only.
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
