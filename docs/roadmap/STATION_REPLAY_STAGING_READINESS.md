# Station replay staging readiness

Status: MIMIR-opened staging-prep lane, 2026-06-07.

This lane prepares Station for replay on a real online/staged environment. It
does not try to finish every local UX roadmap item before staging. The point is
to get the current protected-alpha loops coherent enough to exercise online,
then let staged replay reveal the next optimizations.

## Current decision

- ARGUS accepted the sequencing correction in `docs: accept replay staging
  sequence`.
- UX-01A, UX-02A, UX-02B, and UX-DEBT-01 are accepted enough for staging prep.
- UX-01B and UX-03 are not pre-staging defaults. Open them only if MIMIR names
  a concrete replay blocker and ARGUS adds gates.
- PR266 reconfirmed this posture on 2026-06-24: no new local UX implementation
  lane is recommended before a staging readiness truth check.
- PR267 truth check failed on 2026-06-24 because hosted `/developer` returned
  HTTP 404 even though `/developer-spaces` and the replay Developer Space
  observatory route were live.
- PR268 is accepted with an ARGUS route-handler patch for the public
  `/developer` redirect to `/developer-spaces`, but MIMIR's hosted freshness
  rerun at `b31cf1e` still returned HTTP `307` without `Location`.
- PR269 adds a middleware-level redirect and dynamic/no-store route fallback;
  ARGUS patched forwarded public-origin handling, and hosted probes passed at
  `c2cf0cb`.
- PR270 ARGUS accepted staged replay owner measurement against hosted web/API
  at commit prefix `c2cf0cb48ca7`: owner auth/session, replay-readiness,
  background jobs, Memory, context preview, imports, exports, Developer Space,
  observability, billing, and public `/developer`/Developer Space routes were
  routeable with data present. The recommended next move is ARIADNE human-eye
  replay rehearsal, not a new DAEDALUS implementation lane.
- PR271 completed that ARIADNE rehearsal as `PASS WITH CAVEATS`. The hosted
  app is coherent enough for staging decisions, and the remaining visible
  caveats are bounded rather than structural.
- PR272 ARGUS accepted the tiny polish lane for the three bounded PR271
  caveats with no review patch: Discover right-rail roulette now leaves endless
  `Drawing...`, public Developer Space status labels distinguish live
  connection from latest readback, and public forum category descriptions
  normalize provider-list dash mojibake at display time. Because these are
  visible hosted caveats, ARGUS recommends a focused ARIADNE hosted rerun before
  MIMIR closes them from product evidence.
- PR273 opens that focused ARIADNE hosted rerun. Its scope is only the three
  PR271/PR272 visible caveats after hosted deploy freshness, not a new full-site
  audit or mutation run.
- PR273 passed on hosted desktop and mobile. MIMIR closes the three visible
  caveats and opens PR274 for DAEDALUS as the first post-polish online runtime
  quality probe: session persistence plus one bounded chat/context round trip
  with sanitized observability/readiness evidence.
- PR274 completed as `PASS WITH CAVEATS`: hosted freshness, replay-owner
  auth/session persistence, context readback, chat route health,
  rejected-control exclusion, and observability passed. The single chat turn
  was safe and traceable but only partially recalled the seeded anchor set.
  MIMIR opens PR275 as a narrow DAEDALUS answer-quality triage because full
  two-anchor recall is the seeded replay acceptance bar.
- PR275 patched the narrow retrieval-selection cause: vector Memory retrieval
  now supplements spare requested slots with owner-scoped, lifecycle-filtered
  lexical Memory matches. ARGUS accepted the patch after hardening the
  supplemental retrieval fixture to exclude other-owner and archive-source
  candidates. PR276 opens that ARIADNE hosted rerun after deploy before the
  two-anchor recall caveat can be closed from live evidence.
- PR276 failed the hosted recall bar even after PR275 deployed: auth/session,
  intended persona selection, chat route health, rejected-control exclusion,
  source-copy safety, and observability passed, but generic context still
  selected only partial accepted-anchor evidence. PR277 opened a narrow
  DAEDALUS retrieval-selection repair.
- PR277 patched the narrow follow-up retrieval-selection defect: vector Memory
  still runs first, but full vector results are now blended with owner-scoped,
  lifecycle-filtered lexical Memory candidates before slicing to the requested
  limit. Local deterministic context/prompt evidence now includes both accepted
  anchor concepts and both matching invented retrieval phrases. ARGUS accepted
  the patch; MIMIR opened the ARIADNE hosted PR278 rerun after deploy.
- PR278 failed the hosted recall bar after PR277 deployed: freshness,
  auth/session, intended persona, chat route health, rejected-control
  exclusion, source-copy safety, and observability passed, but generic hosted
  context still selected only one of two accepted concepts and one of two
  matching invented retrieval phrases. MIMIR opened PR279 as a narrow DAEDALUS
  hosted/local context-selection mismatch repair.
- PR279 patched the remaining local/hosted context-selection mismatch: selected
  private Memory now contributes full content alongside a differing summary, so
  a partial summary cannot erase selected owner-safe evidence before prompt
  assembly. ARGUS accepted the patch; MIMIR opened the ARIADNE hosted PR280
  rerun after deploy.
- PR280 proved hosted context now includes both accepted concepts and both
  matching invented retrieval phrases with rejected-control absent, but the chat
  answer recalled zero accepted concepts and phrases. MIMIR opened PR281 as a
  narrow DAEDALUS bounded answer-grounding repair.
- PR281 patched the bounded answer-grounding layer: private persona prompts
  with selected context now explicitly answer direct factual questions from
  selected context first, preserve safe requested answer shapes, and avoid
  omitting directly relevant selected names/phrases for persona-only style.
  ARGUS accepted the patch; MIMIR opened the ARIADNE hosted PR282 rerun after
  deploy.
- PR282 proved PR281 deployed and hosted context still contains the full
  two-anchor set, but the answer recalled none of it. MIMIR opened PR283 as a
  narrow DAEDALUS hosted answer-grounding enforcement repair.
- PR283 patched hosted answer-grounding enforcement with a final
  selected-context answer-focus guard after the persona voice close. The patch
  is prompt-only: no retry, provider, retrieval, schema, seed, UI, or billing
  behavior changed. ARGUS accepted the patch; MIMIR opened the ARIADNE hosted
  PR284 rerun after deploy.
- PR284 proved hosted freshness, replay-owner auth/session, intended private
  persona selection, full selected context, trace/readiness readback,
  rejected-control exclusion, and source-copy safety. The answer improved by
  recalling both invented retrieval phrases, but still failed the recall bar
  because it preserved neither paired accepted concept label. MIMIR opened
  PR285 as a narrow DAEDALUS answer-label preservation repair.
- PR285 patched answer-label preservation by formatting Memory prompt input
  with selected source titles/labels alongside content, matching Archive and
  Integrity behavior. ARGUS accepted the patch; MIMIR opened the ARIADNE hosted
  PR286 rerun after deploy.
- PR286 proved PR285 deployed and hosted selected context still contains both
  accepted concept labels and both matching invented retrieval phrases, but the
  answer recalled neither labels nor phrases. MIMIR opened PR287 as a narrow
  DAEDALUS repair for reliable selected-context answer use after context
  selection.
- PR287 duplicated compact selected-context focus into the provider-facing
  final user message while preserving the original owner message under
  `Owner message:` and counting the actual provider payload length in
  runtime budget/quota estimates. ARGUS accepted the patch after adding a
  focused stored-message boundary assertion; MIMIR opened the ARIADNE hosted
  PR288 rerun after deploy.
- PR288 proved PR287 deployed and the hosted answer now recalls both invented
  retrieval phrases, but still drops both paired accepted concept labels.
  MIMIR opened PR289 as a narrow DAEDALUS concept-label carry-through repair.
- PR289 changed provider selected-context focus from parenthetical titles to
  explicit `selected label/name` plus `supporting fact` pairs and added a
  generic instruction to include selected labels, names, or titles with
  relevant supporting facts. ARGUS accepted PR289 with no review patch and
  recommends that MIMIR open an ARIADNE PR290 hosted rerun after deploy.
- PR290 opens that ARIADNE hosted rerun. Its scope is only post-deploy product
  evidence for full two-anchor label and phrase recall, rejected-control
  exclusion, source-copy safety, and sanitized context/observability readback.
- PR290 failed the full recall bar after proving PR289 deployed and selected
  context still contained both accepted labels and both invented phrases. The
  hosted answer recalled none. MIMIR opened PR291 as a narrow DAEDALUS
  diagnostic/repair lane for the selected-context answer contract, with ARGUS
  required to define the safe acceptance gate before another hosted rerun.
- PR291 added a private-only answer contract verifier and one-shot retry for
  direct/factual private persona prompts that miss all selected focus. Trace
  payloads store only sanitized counts/reason codes, and quota/token accounting
  includes the possible retry conservatively. ARGUS accepted PR291 after
  tightening the direct-factual gate so creative/style prompts do not retry
  just because they contain a question mark. MIMIR opened PR292 as the ARIADNE
  hosted rerun after deploy; its scope is hosted evidence for recall,
  answer-contract/retry telemetry, rejected-control exclusion, source-copy
  safety, and sanitized context/observability.
- PR292 failed the full recall bar after proving PR291 deployed and selected
  context still contained both accepted labels and both invented phrases. A
  completed answer-contract event was present, but no retry event was observed
  and reason codes were not exposed by sanitized trace detail. MIMIR opened
  PR293 as a narrow DAEDALUS gate/readback diagnostic before classifying this as
  provider/model behavior.
- PR293 exposed sanitized answer-contract reason codes and retry decisions
  through owner-only trace detail, and widened the factual gate for
  answer/naming/state/readback commands. ARGUS accepted PR293 after tightening
  the creative/style guard so selected-context/label wording alone does not
  retry creative prompts. MIMIR opened PR294 as the ARIADNE hosted rerun after
  deploy; PR294 must classify label recall, phrase recall, rejected-control
  exclusion, source-copy safety, and sanitized answer-contract/retry readback
  before MIMIR decides whether the next owner is DAEDALUS or provider/model
  classification.
- PR294 failed the hosted recall bar, but narrowed the issue to selected-label
  retry gating: context contained both labels and both phrases, the answer
  recalled both phrases and no labels, and sanitized trace detail reported
  `missed_selected_labels` with retry not recommended or attempted. MIMIR
  opened PR295 as a narrow DAEDALUS selected-label miss retry-gate repair.
- PR295 makes `missed_selected_labels` retryable under the existing
  private/direct-factual/selected-context one-shot gate. Local coverage proves
  facts-matched, label-missed first answers now retry exactly once and pass when
  the retry includes the selected label. ARGUS accepted PR295 with a test-only
  hygiene patch and recommends that MIMIR open the next hosted rerun after
  deploy.
- MIMIR opened PR296 as the ARIADNE hosted rerun after PR295 deploy. PR296 must
  prove hosted label and phrase recall, rejected-control exclusion, source-copy
  safety, and sanitized answer-contract/retry readback before MIMIR decides
  whether to close the hosted recall bar or classify the remaining failure.
- PR296 proved the retry gate fires, but the final hosted answer still missed
  exact visible labels and phrases while internal readback reported
  `fulfilled`. MIMIR keeps the visible recall bar and opened PR297 as a narrow
  DAEDALUS post-retry selected pair output repair.
- PR297 strengthens the retry instruction toward visible selected-pair output
  and requires exact selected label/name/title text for contract fulfillment.
  Supporting facts still use bounded term coverage in the verifier. ARGUS
  accepted the local repair with caveats and recommends that MIMIR open the
  next hosted ARIADNE rerun after deploy.
- MIMIR opened PR298 as that hosted rerun after PR297 deploy. PR298 must prove
  visible label/phrase recall, rejected-control exclusion, source-copy safety,
  and sanitized answer-contract/retry readback before MIMIR closes or
  reclassifies the hosted recall bar.
- PR298 blocked on freshness because it required ARGUS's docs/review commit
  `77b60637`, but hosted web/API were already running PR297's product runtime
  commit `b2cb3540`. MIMIR opened PR299 with the corrected runtime freshness
  gate: `b2cb3540` or later.
- PR299 proved the corrected hosted runtime gate and failed only at pair-aware
  answer-contract targeting: the answer recalled both phrases and no accepted
  labels, while contract readback reported `fulfilled` from one selected label
  and two selected facts somewhere in context. MIMIR keeps the selected-pair bar
  and opened PR300 as a narrow DAEDALUS pair-aware contract repair.
- PR300 requires mentioned selected facts to have their own selected
  label/name/title from the same selected item before the contract can report
  `fulfilled`. Local coverage proves unrelated selected labels no longer
  satisfy selected facts from other items. ARGUS accepted PR300 with a narrow
  fact-only guard for unlabeled selected items and recommends that MIMIR open
  the next hosted ARIADNE rerun after deploy.
- MIMIR opened PR301 as that hosted rerun. Because ARGUS touched runtime code
  in PR300, PR301 requires hosted web/API freshness at `ea9b0e90` or later.
- PR301 proved the pair-aware retry fires on hosted Railway but still failed
  exact label recall after the one allowed retry. MIMIR keeps the selected-pair
  bar and opened PR302 as a bounded private/direct factual selected-pair
  finalizer rather than another provider retry.
- PR302 adds that bounded finalizer after the one allowed retry is exhausted
  and the post-retry verdict remains `missed_selected_labels`. It chooses
  mentioned selected fact items first, emits up to two selected label/name/title
  plus supporting fact pairs, strips `Summary:` suffixes, and exposes only safe
  finalizer metadata. ARGUS accepted PR302 with no product patch and recommends
  that MIMIR open the next hosted ARIADNE rerun after deploy.
- MIMIR opened PR303 as that hosted rerun after PR302. Because PR302 touched
  runtime code, PR303 requires hosted web/API freshness at `9172e380` or later
  before ARIADNE probes selected-pair recall and sanitized finalizer readback.
- PR303 blocked before product evidence because hosted API `/health/deployment`
  served commit `9172e380` but reported `ready:false` with
  `readiness.migrations.error=timeout`. MIMIR opened PR304 for DAEDALUS to
  inspect/repair the migration-object/RPC readiness timeout before another
  ARIADNE hosted product rerun.
- PR304 preserves migration readiness as a strict deploy gate, adds a bounded
  5s migration proof timeout, and exposes sanitized per-proof ids/errors so
  hosted readiness failures are actionable without leaking secrets. ARGUS
  accepted PR304 with no product patch; MIMIR should coordinate deploy/readiness
  recheck and resume PR303 hosted product evidence once API readiness is true on
  PR304 or later.
- MIMIR verified hosted web/API are both `ready:true` at PR304 runtime commit
  `73cf8e9c`, including green migration proofs for `memory_columns`,
  `developer_space_policy`, `documents_version`, `document_versions`,
  `memory_rpc`, and `archive_rpc`. MIMIR opened PR305 for ARIADNE to resume the
  hosted selected-pair finalizer proof.
- PR305 passed the hosted owner-visible selected-pair recall bar: the final
  answer recalled both accepted labels, both matching phrases, and both
  selected label/phrase pairings. MIMIR closed the product recall bar and
  opened PR306 as a narrow DAEDALUS trace/readback semantics follow-up. ARGUS
  accepted PR306 with no product patch; future automation should distinguish
  `preFinalizerAnswerContract` from the strict `postFinalizerFulfilled` result.
- MIMIR accepts PR306 and opens PR307 for DAEDALUS: Memory lifecycle and
  owner-visible observability are now the next backend/product slice. The goal
  is to make replay Memory behavior clearer and more useful without reopening
  selected-pair answer churn or adding new Redis, Cloudflare, provider,
  embedding, billing, queue, worker, import, export, or broad UI scope. ARGUS
  accepted PR307 with no product patch; Studio Memory now has local owner-only
  runtime readback counts for selected, eligible-not-selected, and
  lifecycle-held-out memory.
- MIMIR opens PR308 for ARIADNE as a narrow hosted/browser rehearsal of that
  owner-only Memory readback. This is product evidence for PR307's visible
  count/copy readback, not a broad UI audit or a new backend/config lane.
- PR308 failed only on route/navigation: hosted freshness, direct owner-only
  Memory readback, redaction, and public boundary passed, but the persona
  workspace did not expose a visible Memory tab/link. MIMIR opens PR309 for
  DAEDALUS to repair that narrow owner navigation defect. ARGUS accepted PR309
  with no product patch; MIMIR should reopen ARIADNE's hosted/browser PR308
  rehearsal after deployment.
- Broader known caveats still travel into staging review instead of spawning
  more local polish: static global Archive/Export shells, dashboard
  derived/static snippets, no downloadable bundles/workers, and no new private
  search UI beyond the accepted API/search foundation.

## Readiness question

What must be true so a human can run a real replay pass through the staged app
and collect useful product evidence?

The answer should cover:

1. Staging/deploy topology: web host, API host, Supabase project, and URL/env
   wiring.
2. Validation gate: local required checks, remote CI status, and any explicitly
   waived checks.
3. Replay account setup: test user, seed or manual data prerequisites, and safe
   Stripe/test-mode assumptions.
4. Replay path: the shortest useful end-to-end journey across Studio, Archive,
   Continuity, Spaces, Discover, Developer Spaces, and Billing.
5. Known limitations: what reviewers should notice without treating as a
   blocker.
6. Handoff shape: whether DAEDALUS can implement a setup slice, whether ARGUS
   should gate first, or whether MIMIR/human deployment configuration is needed.

## DAEDALUS first pass

DAEDALUS should inspect, not overbuild:

- `vercel.json`
- `.github/workflows/ci.yml`
- `.env.example`
- `infra/supabase/README.md`
- `infra/vercel/README.md`
- `docs/roadmap/builds.md`
- `docs/roadmap/prep-lane-audit.md`
- `docs/roadmap/ACTIVE_STATUS.md`
- app env usage in `apps/web` and `apps/api`

Deliver one of two results:

- A narrow repo patch that improves staging readiness without changing product
  behavior.
- A no-code readiness plan naming the external deployment facts or credentials
  that MIMIR/human must provide before implementation can proceed.

## DAEDALUS prep result

DAEDALUS's 2026-06-07 pass is staging preparation only, not staging
implementation.

- Added `docs/ops/STAGING_REPLAY_READINESS.md` as the replay runbook and
  external-facts checklist.
- Updated `infra/vercel/README.md` to state that the current `vercel.json`
  targets the web app only and that, at that checkpoint, `apps/api` still needed
  a separate Node host.
- Updated `.env.example` with staging-critical API runtime placeholders:
  `PORT`, `JWT_SECRET`, and optional `DEVELOPER_SPACE_SSE_POLL_MS`.
- Did not add hosting provider config, new routes, seed scripts, product
  behavior, or deployed URLs.

At that 2026-06-07 checkpoint, staging implementation remained blocked on
human/MIMIR deployment choices:
web host/provider, web URL, API URL/provider, Supabase staging project,
Supabase auth redirect settings, Stripe test-mode prices/webhook, replay
account, replay data policy, and remote deployment status for the exact commit.

ARGUS's follow-up tightened two staging-prep claims before acceptance:

- The existing web-only Vercel config is a current repo fact, not a final web
  host decision.
- Replay acceptance keeps the pinned frozen-lockfile install gate even though
  the current Vercel install command is looser.

## MIMIR staging defaults

MIMIR's 2026-06-07 provisional defaults:

- Web staging: Vercel-shaped `apps/web`.
- API staging: Railway-hosted `apps/api` Express service.
- Supabase: dedicated staging project with private `persona-files` bucket.
- Stripe: test mode only.
- Replay data: first pass manual setup through UI/API.

## DAEDALUS Railway prep result

DAEDALUS translated those defaults into preparation docs only:

- Added `infra/railway/README.md` with API build/start commands, `/health`
  check, Railway API env boundary, paired Vercel web env, Supabase/Stripe
  pairing, and URL smoke commands.
- Updated `docs/ops/STAGING_REPLAY_READINESS.md` to point at the Railway API
  prep notes and include the post-URL smoke commands.
- Did not add a Railway project config, service ID, deployed URL, secret,
  Supabase project, Stripe resource, seed script, or product behavior.

Implementation remains blocked on the concrete Vercel web URL, staging Supabase
values, Supabase auth redirects, Stripe test resources, replay account/data, and
remote status for the exact commit.

ARGUS's Railway-prep follow-up accepted the pass as documentation/readiness only
after tightening two points:

- Remote status must include both web and API deployment truth, not only Vercel.
- Railway/provider `PORT` should be injected for staging; `4000` is only the
  local default.

## Railway service-shell config

MIMIR's 2026-06-07 service-shell pass added root `railway.json` only. The config
pins Railpack, `pnpm --dir apps/api build`, `pnpm --dir apps/api start`,
`/health`, restart policy, and monorepo watch patterns. It does not create or
prove a Railway project, service ID, deployed URL, secret, staging Supabase
project, Stripe resource, replay account, or remote-green status.

ARGUS accepted the config shell after checking it against the API package
scripts, the Express `/health` route, local JSON parsing, API build, and current
Railway config/healthcheck docs. ARGUS corrected the staging runbook wording so
the repo no longer says it lacks Railway config while `railway.json` exists.

## Railway fork deployment reality

As of 2026-06-08, staging deploy work moved onto `Tex6298/Station` because the
`Discern-AI/Station` repo could not be connected to Railway.

Current facts:

- Railway `@station/api` is sourced from `Tex6298/Station` on `main`.
- `@station/api` uses the root API-shaped `railway.json`.
- `https://stationapi-production.up.railway.app/health` returns
  `{ "ok": true }`.
- Supabase runtime secrets belong on `@station/api`; values are not recorded in
  the repo.
- Railway `@station/web` previously existed in a failed/stopped state before
  the Railway-web lane reopened it.
- Plain `api` is an unused shell service.

MIMIR opened the Railway-web lane on 2026-06-08. The root `railway.json` is now
service-aware: `@station/api` builds/starts the Express API, while
`@station/web` builds the Next.js app in standalone mode and starts the
standalone server. Railway generated the web URL
`https://stationweb-production.up.railway.app`, and `@station/web` has public
web env keys for app URL, API URL, Supabase URL, and Supabase anon key. Server
secrets remain off web services.

ARGUS did not accept the Railway-web lane on first review. The live API remained
healthy, but `https://stationweb-production.up.railway.app/health` returned
Railway `404 Application not found`, and the web root returned `404`. DAEDALUS
needs to inspect Railway `@station/web` deployment/domain logs or correct the
documented URL/service truth before this lane can be accepted.

MIMIR's Railway-authorized follow-up probe later on 2026-06-08 found the
generated web URL live:

- `https://stationweb-production.up.railway.app/health` returned `200` with
  `{ "ok": true }`.
- `https://stationweb-production.up.railway.app/` returned `200` with the Next
  app shell.
- Railway service inventory reported `@station/api` and `@station/web` at
  `SUCCESS`.
- Public API `/health` returned `{ "ok": true }`, and unauthenticated API
  `/auth/me` returned `401`.

ARGUS accepted the recovered Railway-web public probes after independently
rechecking web `/health`, web root, API `/health`, API `/auth/me`, script syntax,
and `railway.json` parsing. Service inventory came through MIMIR's
Railway-authorized handoff rather than ARGUS's local shell.

Full staging is still not complete. The remaining blockers are Supabase
migrations/auth redirects, private storage bucket, Stripe test prices/webhook,
and replay account/data policy.

ARGUS accepted the API-only posture on 2026-06-08 after rechecking the live API
URL, unauthenticated `/auth/me`, `railway.json` parsing, frozen install, API
build, web lint/build on `next@14.2.35`, and the lockfile/package scan for the
old `next@14.2.5`. The acceptance caveat is that Railway service-list and
variable placement were not independently rechecked because the Railway CLI is
absent in this shell; keep `@station/web` and plain `api` service status as
handoff truth until a Railway-authorized check reruns.

## Acceptance posture

ARGUS should review any staging-readiness patch for:

- truthful deploy claims
- env and secret handling
- auth/owner visibility
- CI/build reproducibility
- clear separation between local validation and remote deployment truth

ARIADNE should review only after a staged URL or replay harness exists.

## PR267 truth check result

ARGUS ran the PR267 docs/evidence-only check on 2026-06-24.

Verdict: `FAIL`.

Non-secret hosted evidence:

- Railway web `/health` and API `/health` returned HTTP 200 with `{ ok: true }`.
- Railway web/API `/health/deployment` returned HTTP 200 with `ok:true` and
  `ready:true`.
- Web and API reported branch `main` and runtime commit
  `38ad00e6f56823a302737139b4e7453294b9ea30`.
- Commits after `38ad00e6f56823a302737139b4e7453294b9ea30` were docs/state
  only, so product-code deployment freshness was acceptable.
- Public web routes `/`, `/discover`, `/forums`, `/developer-spaces`, and
  `/developer-spaces/station-replay-dev-alpha` returned HTTP 200.
- Public web route `/developer` returned HTTP 404.
- Public API `/developer-spaces/station-replay-dev-alpha` returned HTTP 200
  with public-safe Developer Space readback.
- API deployment readiness reported database, migrations, private
  `persona-files` storage, public URL wiring, Supabase Auth redirects, Stripe
  test billing/prices, platform chat, NVIDIA chat, Gemini
  `station_free_1536` embeddings, and Upstash REST operational cache ready.
- Redis/Upstash remains cache-only; no worker queue is ready and inline
  fallback is true.
- Cloudflare remains deferred by docs; no live Cloudflare readiness claim was
  made.
- Owner replay routes were not rechecked because no safe owner harness was
  available without credentials/tokens.

Next recommendation:

- Add and verify a public `/developer` redirect or alias to `/developer-spaces`,
  then rerun the public route probes. Do not open broader UX or product work
  before this staged route mismatch is resolved.

## PR268 route repair result

ARGUS accepted the narrow route-truth repair on 2026-06-24 with a review patch.

- DAEDALUS's page-level redirect deployed fresh at `ec992e3`, but hosted
  `/developer` returned HTTP `307` without a `Location` header.
- ARGUS replaced the page-level redirect with a route handler so `/developer`
  emits a real HTTP `307` redirect to `/developer-spaces` for `GET` and
  `HEAD`.
- `/developer-spaces` and `/developer-spaces/:slug` behavior is preserved.
- Local probe on `127.0.0.1:3139` returned HTTP `307` with
  `location: http://localhost:3139/developer-spaces` for `/developer`, and
  HTTP `200` for `/developer-spaces`.
- MIMIR should rerun the PR267 hosted public route probes after the ARGUS patch
  deploys, especially hosted `/developer`.

## PR269 hosted redirect repair result

ARGUS accepted the hosted redirect repair on 2026-06-24 with a review patch.

- `/developer` now redirects in middleware before route handling/cache.
- `apps/web/app/developer/route.ts` remains as a dynamic/no-store fallback.
- ARGUS patched redirect URL construction so hosted redirects use forwarded
  public host/proto or `NEXT_PUBLIC_APP_URL` instead of Railway's internal
  `0.0.0.0:8080` origin.
- Local `/developer` returned HTTP `307` with
  `location: http://localhost:3141/developer-spaces`.
- Local `/developer-spaces` and
  `/developer-spaces/station-replay-dev-alpha` returned HTTP `200`.
- Hosted web/API `/health/deployment` reported `ready:true`, branch `main`, and
  commit `c2cf0cb48ca77f63d0d5bf7af0c9f79f422239fc`.
- Hosted `/developer` returned HTTP `307` with
  `Location: https://stationweb-production.up.railway.app/developer-spaces`.
- Hosted `/`, `/discover`, `/forums`, `/developer-spaces`, and
  `/developer-spaces/station-replay-dev-alpha` returned HTTP `200`.
- Hosted API `/developer-spaces/station-replay-dev-alpha` returned HTTP `200`.
