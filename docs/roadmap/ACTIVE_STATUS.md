# Station active status

This file is the short operational status companion to
`docs/roadmap/STATION_PR_PLAN_V3.md`. Update it when the active roadmap changes,
when a PR lands, or when validation truth changes.

## Active roadmap

- Source of truth: `docs/roadmap/STATION_PR_PLAN_V3.md`. The v2 roadmap remains
  the historical record for PR-00 through PR-17.
- PR-00 is complete and visible on `main`.
- PR-01 is complete: the validation baseline in
  `docs/testing/VALIDATION_BASELINE.md` is green.
- PR-02 is complete: Supabase schema/types are baselined for core Station
  persistence without auth wiring or repository replacement.
- PR-03 is complete: existing Supabase-shaped API auth/session behavior is
  hardened, documented, and covered by focused tests.
- PR-04 is complete: frontend signup/signin/signout, session restore,
  auth-aware navigation, and protected route redirects use the proven API auth
  contract.
- PR-05 is complete: the remaining live in-memory API report path now writes to
  Supabase-backed persistence, core API routes were checked for local mock-data
  imports, and `pnpm test:reports` proves the reports boundary.
- PR-06 is complete: Community Beta routes keep Supabase persistence, validate
  public-safe forum links and comment parents, filter featured Discover rows by
  visibility, protect document persona ownership, and are covered by
  `pnpm test:community`.
- Post-PR-06 reconciliation and validation repair are complete. The broader
  storage, integrity, token-credit, Stripe-adjacent, and UX stack is documented
  in `docs/roadmap/CURRENT_MAIN_RECONCILIATION.md`; the local validation gate is
  green again with the pinned `npx --yes pnpm@10.32.1` runner.
- PR-07 is complete: ARGUS accepted the bounded Continuity Alpha data-model
  scope. The owner-scoped `/continuity` API skeleton over `continuity_records`,
  shared continuity DTOs, source-version schema alignment, and focused
  data-shape test passed hostile-path review.
- PR-08 is complete, 2026-06-06: ARGUS accepted the bounded Continuity Studio UI
  slice. Studio now has a persona Timeline tab/page, a cross-source continuity
  record list/create form, document/conversation source linking, persona summary
  continuity counts, and focused UI helper tests. Remaining alpha risk: source
  link ownership is safe through the UI and current owner-only reads, but the
  `/continuity` API should validate linked source ownership before visibility
  flags become public-facing behavior.
- PR-09 slice 1 is accepted by ARGUS, 2026-06-06: continuity source links are
  now validated against owned/persona-scoped source rows before insert, persona
  archive exports now include `continuity_records`, and publication
  state/visibility/provenance metadata is preserved in the owner-only export
  manifest.
- PR-09 slice 2 is accepted by ARGUS, 2026-06-06: owner-only persona exports
  now preserve published document visibility state across public, unlisted,
  community, and private published documents, and they include only owner-filed
  moderation report refs attached to exported document, thread, or visible/owner
  comment references.
- PR-09 is complete for bounded roadmap scope, 2026-06-06: the accepted slices
  cover continuity archive export, publication state metadata, provenance,
  report-reference privacy, and the existing JSON/Markdown package path. Deeper
  public export UI, PDF/binary packaging, and richer download workflows are
  future export enhancements, not blockers for PR-10.
- PR-10 is accepted by ARGUS, 2026-06-06: Developer Spaces ingestion hardening
  is complete for bounded roadmap scope. Ingestion now prefers active
  ingestion-key rows with legacy hash fallback, rotation revokes prior active
  keys, key revocation clears the legacy hash surface, JSON payload guardrails
  are enforced, and `api_key_hash` is not serialized. The public/community
  observatory scrubber is case-insensitive, handles camelCase/snake_case/
  punctuation variants, and removes obvious secret-shaped exact and prefixed
  aliases such as `password`, `dbPassword`, `accessToken`, `bearerToken`,
  capitalized `Authorization`, `refreshToken`, `secretKey`, `clientSecret`,
  `credentials`, `cookie`, `sessionCookie`, `setCookie`, and `xApiKey` while
  owner responses retain operational detail.
- PR-11 is accepted by ARGUS, 2026-06-06: Developer Spaces now has a bounded
  SSE stream at `/developer-spaces/:slug/stream` with reconnect IDs, retry
  metadata, public/community/owner visibility matching the detail route, a
  visitor freshness indicator, and an owner live ingestion log in the manage
  console. This is database-poll backed SSE, not pub/sub, and does not add
  WebSockets or move into PR-12 through PR-14 scope.
- PR-12 is accepted by ARGUS, 2026-06-06: Discover now includes public-safe
  Developer Space cards in the normal feed, bounded public/community event
  summaries, and Developer Space search results. Visitor feeds see public
  Developer Spaces only; eligible members also see community Developer Spaces.
  Private, unlisted, private-event, key-hash, scrubbed event-data fields, and
  oversized raw scalar values stay out of Discover cards.
- PR-13 is accepted by ARGUS, 2026-06-06: Developer Spaces can now link
  Station documents through a bounded `developer_space_documents` relation,
  owners can create methodology/finding/field-log/note templates from the
  manage console, visitor observatory pages show only public linked documents
  that are also published/public, owner-only drafts remain visible only to
  owner/admin detail reads, and the relation now has owner-only RLS guardrails.
- PR-14 is accepted by ARGUS, 2026-06-06: Developer Spaces now have owner-only
  JSON/Markdown export packages through the existing `export_packages` path,
  `developer_space_usage` counters for ingestion/storage/public reads/exports,
  an API-level quota model for owner visibility, manage-console usage/export
  controls, and target/ownership guardrails on Developer Space export rows.
- PR-15 is accepted by ARGUS, 2026-06-06: added the tiny
  `@station/developer-space-client` package with TypeScript ingestion helpers,
  curl examples, a minimal Node example, focused docs, a package test gate, and
  client-side header/error guardrails without moving into PR-16 visual config
  editors.
- PR-16 is accepted by ARGUS, 2026-06-06: added bounded Developer Spaces visual
  config editors for node field, timeline, world map, and constellation modes,
  plus public observatory rendering that respects the selected mode, sensible
  defaults, bounded scalar display, safe map-zone keys, and narrow-width manage
  layout constraints.
- PR-17 is accepted by ARGUS, 2026-06-06: the bounded Stripe and
  paid-entitlement foundation now covers pricing config, paid Space and
  Developer Space limits, Stripe Checkout/Billing, verified webhook handling,
  entitlement enforcement, customer/profile binding checks, and the existing
  billing page. The triad foreground watcher now returns on a new wakeup instead
  of consuming it and continuing silently.
- PR-00 through PR-17 are complete for the bounded v2 roadmap. No PR-18 is
  defined in `docs/roadmap/STATION_PR_PLAN_V2.md`; the next lane is a closeout
  audit and future-roadmap recommendation, not an invented implementation PR.
- V3-00 is complete, 2026-06-06: ARGUS reviewed the successor roadmap draft and
  MIMIR activated `docs/roadmap/STATION_PR_PLAN_V3.md` as the active planning
  source. ARGUS identified the ordering as maintenance-first and storage-led,
  with one validation caveat: new proposed gates such as `test:storage`,
  `test:integrity`, and `test:token-credits` must be added by their owning v3
  slices before acceptance.
- V3-01 is accepted by ARGUS, 2026-06-06: archive-trust storage quota
  hardening now has the missing `test:storage` gate, focused storage
  quota/accounting coverage, `storage_usage` DB type surface, persona-file
  registration rollback hardening, and an additional chat-import guard that
  stops before archive ingest when the import-job row cannot be created.
- V3-02 is accepted by ARGUS, 2026-06-06: integrity and calibration hardening
  now has the missing `test:integrity` gate, focused lifecycle/question-bank/
  fallback/review coverage, public preflight and publication privacy assertions,
  shared DB/API type surfaces, runtime-context and continuity-summary proof, and
  idempotent completion so repeated end calls do not duplicate integrity
  outputs.
- V3-03 is accepted by ARGUS, 2026-06-06: token-credit accounting hardening
  now has the missing `test:token-credits` gate, focused spend/quota/top-up/
  monthly-reset coverage, typed token persistence and API surfaces, Stripe
  top-up metadata guardrails, server-pack validation for verified grants, and
  validation against the existing PR-17 billing gate.
- V3-04 is accepted by ARGUS, 2026-06-06: archive import jobs now have focused
  proof for processing-to-completed and processing-to-failed status transitions,
  owner-only status/list reads, and failed ingest error messages. Persona export
  packages now mark source-query/build failures, including nested discussion and
  moderation source failures, as failed with an owner-visible error while
  preserving the existing completed-package provenance and privacy boundaries.
  This remains protected-alpha synchronous job behavior; it does not add queue
  or worker infrastructure.
- V3-05 is accepted by ARGUS, 2026-06-06: `/discover/search` now keeps the
  existing public/community result arrays while adding authenticated
  `privateResults` for owner-scoped documents, continuity records, memory,
  canon, archive files, import jobs, and archived chats. Hostile community
  coverage proves anonymous visitors do not receive private buckets,
  authenticated non-owners do not see another owner's private artifacts, and a
  second owner receives only their own matching private rows.
- V3-00 through V3-05 are accepted for the bounded v3 roadmap. No V3-06 is
  defined; v3 implementation is closed after ARGUS closeout audit. Any post-V3
  UI/UX feasibility or implementation work requires an explicit MIMIR handoff.
- Post-V3 UI/UX successor planning is ARIADNE-reviewed in
  `docs/roadmap/STATION_UI_UX_ROADMAP.md`. It is a planning base, not active
  implementation scope, until MIMIR explicitly opens a UI/UX lane.
- Post-V3 UI/UX feasibility review is ready for MIMIR, 2026-06-06: DAEDALUS
  documented UX-01/UX-02 feasibility in
  `docs/roadmap/STATION_UI_UX_FEASIBILITY_DAEDALUS.md`. Recommendation: open a
  narrow UX-01A Studio frame/mobile navigation slice first, then UX-02A
  per-persona Archive trust states. Defer global Archive/Export workspace
  implementation until a backend/API shape is explicitly opened. This remains
  planning/feasibility only, not UI implementation.
- Post-V3 UI/UX ARGUS gates review is complete, 2026-06-06: ARGUS added gates
  to `docs/roadmap/STATION_UI_UX_FEASIBILITY_DAEDALUS.md` for UX-01A Studio
  frame/mobile navigation and UX-02A per-persona Archive trust states. UX-01A
  is safe to open as a narrow frame/mobile-navigation slice with no API changes;
  UX-02A should stay on the per-persona Archive tab and defer global
  Archive/Export workspace implementation.
- UX-01A is accepted by ARGUS, 2026-06-06: Studio now has shared frame
  primitives, helper-tested navigation route matching, a desktop sidebar plus
  narrow-width mobile Studio menu, and dashboard adoption of the shared loading,
  error, action-row, panel, and status primitives. ARGUS removed viewport-scaled
  heading font sizes from touched Studio surfaces, fixed the mobile dashboard
  grid so side content stacks below the main cards, and confirmed the closed
  mobile menu does not cover dashboard content. Existing API behavior, routes,
  auth/session semantics, global Archive, Export workspace, and Station
  Assistant behavior were not changed.
- UX-01A ARIADNE experience review is complete, 2026-06-06: ARIADNE accepts
  the Studio frame/mobile navigation slice as a Station-fit private workbench
  foundation. The frame now gives Studio a clearer private place label, desktop
  and mobile wayfinding, and reusable loading/error/empty primitives without
  broadening backend, auth, global Archive, Export workspace, or Station
  Assistant scope. Product-experience caveat: the dashboard still contains
  derived/static usage and archive activity snippets, so it should not become
  the archive-trust surface. ARIADNE recommends opening UX-02A next, bounded to
  per-persona Archive trust states, with global Archive/Export workspace and
  dashboard authority still deferred.
- UX-02A is accepted by ARGUS, 2026-06-07: per-persona Archive trust states are
  now visible on `/studio/personas/:personaId/files`, using existing APIs only.
  The page surfaces owner-private archive status, import job
  success/failure/processing states, source names, failure messages, safe next
  actions, and the existing server-reported storage/quota panel. ARGUS trimmed
  blank import source names and refetches failed import jobs so owner-visible
  failure cards can appear immediately after an import error. Browser review at
  375px and desktop widths found the per-persona Archive trust layout coherent.
  Global Archive, Export workspace, Station Assistant, backend behavior,
  auth/session, and private search UI remain deferred.
- UX-02A ARIADNE experience review is complete, 2026-06-07: ARIADNE accepts
  the per-persona Archive trust states as Station-fit archive infrastructure.
  The page names owner-private archive source material clearly, explains that
  failed imports keep existing archive material safe, exposes stored failure
  messages, shows server-reported storage/quota context, and avoids turning the
  static global Archive or Export workspace into live surfaces. No UX-02A
  follow-up is required before the next lane. ARIADNE recommends UX-02B next if
  MIMIR continues the UI/UX lane: extract persona export status into a reusable
  trust component so preservation and portability are visible together. If MIMIR
  chooses to pause after UX-02A, there is no product-experience blocker.
- UX-02B is accepted by ARGUS, 2026-06-07: persona export status is now a
  reusable Archive export trust component shared by the persona workspace and
  per-persona Archive tab. Completed, failed, requested, and processing exports
  now have clear owner-only status, failure-message, summary, section, and
  manifest-readback states using existing export APIs. ARGUS added failed-create
  refresh so owner-visible failed package rows and error messages can appear
  immediately after a server-recorded export failure. Browser review found the
  export trust component coherent on the persona home and Archive tab. Global
  Export workspace implementation, bundles, workers, backend behavior,
  auth/session changes, and the separate global mobile top-nav overflow issue
  remain deferred.
- UX-02B ARIADNE experience review is complete, 2026-06-07: ARIADNE accepts
  the persona export status component as Station-fit portability/trust
  infrastructure. The component truthfully frames the current JSON/Markdown
  manifest capability, keeps completed/failed/requested/processing states clear,
  exposes failed-package error text, and makes manifest readback understandable
  on both the persona home and per-persona Archive tab. No UX-02B follow-up is
  required. ARIADNE recommends opening the separate global mobile top-nav debt
  slice next if MIMIR continues UI/UX work, because mobile wayfinding should be
  stable before richer Studio, continuity, or public-surface UX lanes continue.
- UX-DEBT-01 is accepted by ARGUS, 2026-06-07: the global top navigation now
  uses scoped responsive classes instead of inline sizing. Desktop keeps the
  same single-line header; mobile keeps the bar height stable, uses an internal
  horizontal rail for primary links, and collapses the account control to an
  accessible avatar-only button so the page itself does not overflow at 375px.
  ARGUS browser review confirmed full-page captures stay viewport-width on
  mobile and desktop, with Studio's 52px mobile nav offset unaffected. Routes,
  active-link behavior, auth/session semantics, backend behavior, product
  scope, Studio frame behavior, and page content remain unchanged.
- UX-DEBT-01 ARIADNE experience review is complete, 2026-06-07: ARIADNE
  accepts the global mobile top-nav fix as Station-fit wayfinding debt work.
  The mobile rail keeps public sections, Studio, My Space, and Developer
  navigation readable without document-level overflow; the authenticated
  avatar-only account button preserves account access without crowding primary
  labels; and desktop continuity is unchanged. No UX-DEBT-01 follow-up is
  required. ARIADNE recommends pausing the UI/UX lane for MIMIR product
  sequencing rather than opening another slice automatically.
- The post-V3 UI/UX lane is paused for MIMIR product sequencing. No UI/UX
  implementation lane is active. The next default move is replay-staging
  readiness once the current lanes are coherent enough to exercise online;
  UX-01B persona workspace IA and UX-03 continuity/integrity should open before
  staging only if MIMIR marks them as replay blockers and ARGUS adds gates.
  Further optimization should be driven by the staged/online replay flow rather
  than local-dev polishing.
- Replay-staging sequencing ARGUS audit is complete, 2026-06-07: ARGUS checked
  `ACTIVE_STATUS.md`, `STATION_UI_UX_ROADMAP.md`, and
  `STATION_UI_UX_FEASIBILITY_DAEDALUS.md` for sequencing truth. The docs agree
  that UX-01A, UX-02A, UX-02B, and UX-DEBT-01 are accepted enough for
  replay-staging readiness to be the default next move. No current doc-level
  blocker requires UX-01B or UX-03 before staging. Known caveats should travel
  into replay rather than spawn another local polish lane: static global
  Archive/Export shells, dashboard derived/static snippets, no downloadable
  bundles/workers, and no new private search UI beyond the accepted API/search
  foundation.
- Replay-staging readiness is ready for MIMIR review, 2026-06-07: DAEDALUS
  prepared staging docs only, not a staging implementation. The pass added
  `docs/ops/STAGING_REPLAY_READINESS.md`, clarified that `vercel.json` is
  web-only and the Express API still needs a chosen Node host, and added
  staging-critical API env placeholders to `.env.example`. Remaining external
  facts before implementation: web host/provider decision, web staging URL,
  API staging URL/host provider, staging Supabase project and auth settings,
  private storage bucket, Stripe test-mode prices/webhook, replay account,
  replay data setup policy, and remote CI/deployment status for the exact
  commit.
- Replay-staging prep ARGUS review is accepted, 2026-06-07: ARGUS confirmed the
  docs stay conservative about local validation versus remote deployment truth,
  web staging versus API staging, and server secrets staying off the web host.
  ARGUS tightened two claims before acceptance: the existing Vercel config is a
  current web-prep fact rather than a final host decision, and replay acceptance
  still uses the pinned frozen-lockfile install gate even though the current
  Vercel install command is looser. DAEDALUS committing its own state file was
  acceptable triad-state hygiene for a consumed A2 wake.
- MIMIR set provisional staging defaults, 2026-06-07: keep the current Vercel
  web-app shape, use Railway as the default Node host for the Express API, use a
  dedicated Supabase staging project with private `persona-files` bucket, keep
  Stripe in test mode, and set up first replay data manually. No deployed URL,
  credential, remote-green claim, or staging implementation exists yet; the next
  DAEDALUS task should translate these defaults into a narrow setup/readiness
  patch or name the exact remaining human facts.
- Railway API staging prep is ready for MIMIR review, 2026-06-07: DAEDALUS
  translated the provisional defaults into docs only. `infra/railway/README.md`
  now names the API build/start commands, `/health` check, Railway API env
  boundary, paired Vercel web env, Supabase/Stripe pairing, and URL smoke
  commands. `docs/ops/STAGING_REPLAY_READINESS.md` points at those notes. No
  Railway project, service config, URL, secret, Supabase project, Stripe
  resource, replay account, seed script, or staging implementation was created.
- Railway API staging prep ARGUS review is accepted, 2026-06-07: ARGUS confirmed
  the docs stay truthful that this is preparation only, not deployed staging.
  API/web env separation is explicit, server secrets stay on Railway/API only,
  `/health` and `/auth/me` smoke claims match the Express routes, and the
  build/start commands match `apps/api` package scripts. ARGUS tightened the
  remote-status language to include both web and API deploys, and clarified that
  Railway/provider `PORT` should be injected for staging rather than hard-coded
  to `4000`.
- Railway API service-shell config is accepted by ARGUS, 2026-06-07: root
  `railway.json` pins Railpack, `pnpm --dir apps/api build`,
  `pnpm --dir apps/api start`, `/health`, restart policy, and monorepo watch
  patterns. ARGUS checked the config against API package scripts, the Express
  `/health` route, JSON parsing, API build, and current Railway config/
  healthcheck docs. This is not deployed staging: no Railway project/service ID,
  URL, secret, staging Supabase project, Stripe resource, replay account, or
  remote-green status exists in repo. ARGUS corrected the staging runbook wording
  so it no longer says the repo lacks Railway config while `railway.json` exists.
- Railway API service shell exists, 2026-06-07: Railway project
  `capable-learning` has an offline `api` service shell in the `production`
  environment. The service has no GitHub source, deployment, domain, or
  non-system runtime variables. The current `RAILWAY_TOKEN` can read/create
  service state but cannot connect the GitHub source through CLI, so source
  connection remains a dashboard/token-permission task. Do not deploy until the
  `api` service has real Supabase/JWT/Stripe runtime values.
- Railway deployment security gate patched, 2026-06-08: Railway blocked the API
  deployment before build because the workspace lockfile still contained
  vulnerable `next@14.2.5`. MIMIR bumped `apps/web` to `next@14.2.35`, aligned
  `eslint-config-next` and `@typescript-eslint/parser`, and confirmed no
  `next@14.2.5` security entries remain in `pnpm-lock.yaml`. This is a
  dependency/security patch only; no app behavior or staging runtime config
  changed.
- Railway optimisation lane is ready for ARGUS review, 2026-06-08: DAEDALUS
  preserved Railway as API-only for this pass. `@station/api` is sourced from
  `Tex6298/Station` on `main`, uses the root API-shaped `railway.json`, and
  `https://stationapi-production.up.railway.app/health` returns `{ "ok": true }`.
  Web staging remains Vercel-shaped; Railway `@station/web` is failed/stopped
  and should stay disconnected or ignored unless MIMIR opens a separate
  Railway-web lane. Plain `api` is an unused shell service. Docs now record this
  current reality and still block full staging on the concrete web URL, staging
  Supabase/auth/storage values, Stripe test resources, replay account/data, and
  remote status for the exact commit. No product behavior, route behavior,
  secret value, or deploy credential changed.
- Railway API-only deployment posture is accepted by ARGUS, 2026-06-08: ARGUS
  rechecked the live API URL, unauthenticated auth route behavior, `railway.json`
  parsing, frozen install, API build, web lint/build on `next@14.2.35`, and the
  lockfile/package scan for the old `next@14.2.5`. The API-only decision is
  accepted: preserve the healthy Railway `@station/api` deploy and keep web
  staging Vercel-shaped until MIMIR opens a separate Railway-web lane. Caveat:
  Railway service-list and variable placement were not independently rechecked
  by ARGUS because the Railway CLI is absent in this shell; treat the
  `@station/web` and plain `api` service inventory as handoff truth until a
  Railway-authorized check reruns.
- Railway/staging remote realignment is ready for ARGUS review, 2026-06-08:
  DAEDALUS confirmed `git status -sb` reports `## main...fork/main`, `git branch
  -vv` reports `main [fork/main]`, and remotes still include `fork`
  (`Tex6298/Station`) plus `origin` (`Discern-AI/Station`). The staging runbook
  now records that Railway/staging wakeup and work commits should go to
  `fork/main` unless MIMIR or the human explicitly reopens `origin/main` for this
  lane. No deploy config, product behavior, route behavior, secret value,
  Supabase config, or Stripe config changed.
- Railway/staging remote realignment is accepted by ARGUS, 2026-06-08: ARGUS
  rechecked `git status -sb`, `git branch -vv`, remotes, live API health, and
  `git diff --check`. The active Railway/staging lane now belongs on `fork/main`;
  `origin/main` is intentionally not the push target for this lane unless MIMIR
  or the human reopens Discern-AI/Station. Full staging blockers are unchanged:
  web URL, staging Supabase/auth/storage values, Stripe test resources, replay
  account/data, exact-commit remote status, and a Railway-authorized service/
  variable inventory.
- Railway web staging lane opened by MIMIR, 2026-06-08: root `railway.json` now
  calls service-aware build/start scripts so `@station/api` still builds/starts
  the Express API while `@station/web` builds the Next.js app in standalone mode
  and starts the standalone server. Railway generated
  `https://stationweb-production.up.railway.app`, and `@station/web` has
  non-empty public app/API/Supabase env values. Server-only secrets remain off
  web services. Remote proof for setup commit `7bb8965` passed after the web
  deployment completed: web `/health` returned `{ "ok": true }`, the web root
  returned `200`, API `/health` returned `{ "ok": true }`, and unauthenticated
  API `/auth/me` returned `401`. Supabase migrations/auth redirects/storage,
  Stripe test resources, and replay data remain blockers for full staged replay.
- Railway web staging lane is not accepted by ARGUS, 2026-06-08: API health
  still returns `{ "ok": true }` and unauthenticated API `/auth/me` returns
  `401`, but `https://stationweb-production.up.railway.app/health` returns
  Railway `404 Application not found` and the web root returns `404`. DAEDALUS
  should inspect Railway `@station/web` deployment/domain logs, fix the service
  or URL, and preserve the healthy `@station/api` deploy. Do not claim Railway
  web staging is live until `/health` returns `200`.
- Railway web remote probe recovered for ARGUS review, 2026-06-08: MIMIR's
  Railway-authorized check found `@station/api` and `@station/web` at `SUCCESS`.
  Public checks returned `200` from web `/health`, `200` from the web root,
  `200` from API `/health`, and `401` from unauthenticated API `/auth/me`. No
  repo-side fix was needed after ARGUS's first probe; the first failure appears
  to have been remote Railway deployment/domain propagation.
- Railway web recovery is accepted by ARGUS, 2026-06-08: ARGUS independently
  rechecked web `/health`, web root, API `/health`, API `/auth/me`, script
  syntax, and `railway.json` parsing. The generated web URL is now good enough
  for staging prep. Service inventory success came through MIMIR's
  Railway-authorized handoff rather than ARGUS's local shell. Full staged replay
  still waits on Supabase migrations/auth redirects/storage, Stripe test
  resources, and replay account/data.
- Staging setup blockers and NVIDIA chat aliases are ready for ARGUS review,
  2026-06-08: DAEDALUS added API-side support for `NVIDIA_AI_API_KEY`,
  `NVIDIA_MODEL_BASE_URL`, and `NVIDIA_MODEL` as platform-chat aliases, using
  NVIDIA's OpenAI-compatible `/v1/chat/completions` shape while preserving the
  DeepSeek fallback when NVIDIA is not configured. Embeddings remain on OpenAI
  `text-embedding-3-small` and the existing `vector(1536)` schema. The staging
  setup audit in `docs/ops/STAGING_SETUP_BLOCKERS.md` separates repo/CLI work
  from dashboard/credential blockers for Supabase migrations, the private
  `persona-files` bucket, auth redirects, NVIDIA service variables, and future
  Redis role evaluation. No Supabase migration was applied, no bucket was
  created, no auth redirect was changed, and no Redis implementation was added.
- Staging setup blockers and NVIDIA chat alias hardening are accepted by ARGUS,
  2026-06-08: the OpenAI-compatible NVIDIA platform-chat lane
  hardens key handling and runtime precedence. Non-empty
  `NVIDIA_AI_API_KEY` is trimmed and wins over the legacy Anthropic platform
  shortcut in the conversation route; blank NVIDIA aliases fall back safely.
  DeepSeek fallback remains available when NVIDIA is not configured, and
  embeddings remain OpenAI `text-embedding-3-small` with the existing
  `vector(1536)` schema. Full setup blockers remain Supabase migrations, the
  private `persona-files` bucket, auth redirects, NVIDIA Railway service
  variable values, Stripe/replay resources, and future Redis role evaluation.
- Future-lane integration is documented in
  `docs/roadmap/STATION_FUTURE_LANES.md`, 2026-06-08: MIMIR folded the
  upstream `origin/main` memory/observability feature work, ARIADNE's retrieval
  provider research, DAEDALUS's staging setup blockers, and the active Railway
  fork constraints into ordered future lanes. Lane 0 fork/upstream convergence
  is now accepted; the next default move is Supabase/auth/storage staging
  closeout. Redis, Cloudflare, and NVIDIA retrieval remain future
  architecture discussions/adapters/migration lanes, not settled replacements
  or settled exclusions.
- Lane 0 fork/upstream convergence is ready for ARGUS review, 2026-06-08:
  DAEDALUS merged `origin/main` through `269ad48 feat: add community trust and
  voting` into the active Railway fork line without staged conflicts. The merge
  adds the upstream AI observability, live Developer Space widgets, persona
  lifecycle graph, memory continuity controls, and community trust/voting
  surfaces while preserving `railway.json`, `scripts/railway-build.mjs`,
  `scripts/railway-start.mjs`, `apps/web/next.config.mjs` standalone output,
  `apps/web/app/health/route.ts`, and the accepted NVIDIA platform-chat aliases.
  Supabase migrations `020` through `024` are committed as repo migrations only;
  no staging Supabase project migration, bucket, auth redirect, Stripe resource,
  Redis cache, or deployment-secret change was applied. Local validation is
  green for the focused API/type/test gates listed in
  `docs/testing/VALIDATION_BASELINE.md`; local `@station/web` build compiles and
  generates pages but fails on this Windows shell when Next standalone output
  tries to create symlinks under `.next/standalone` (`EPERM`).
- Lane 0 fork/upstream convergence is accepted by ARGUS, 2026-06-08: ARGUS
  confirmed the Railway deploy-file boundary stayed unchanged and accepted the
  upstream memory/observability convergence after hardening four review issues.
  Public thread detail responses no longer expose moderation action history to
  non-admin readers; `community_moderation_actions` direct RLS select is
  admin-only; `community_user_profiles` direct trust/reputation writes are
  admin-only; persona handoffs now verify attached conversation ownership even
  when the caller supplies a manual summary; missing or other-owner AI trace
  detail lookups now return the route's not-found path. Local validation is
  green for typecheck, API build, web lint, focused tests, provider-router, and
  live Railway API/web health. Local `@station/web` build still reaches
  successful compile/lint/typecheck/page generation and then fails on Windows
  standalone symlink creation (`EPERM`), matching the known local caveat.
- MIMIR provider/repo decisions after Lane 0 acceptance, 2026-06-08: use
  current `Discern-AI/Station` review notes as the first source of GitHub repo
  clues before asking Marty for duplicate links; make provider/data-policy
  posture configurable by Developer Space; design future retrieval
  provider/dimension work as configurable rather than a single global embedding
  swap; treat Redis memory truth as an open architecture question rather than a
  rejected option; and let Cloudflare adapter work follow concrete imported repo
  demands.
  Lane 1 Supabase/auth/storage staging setup closeout is the next default move.
- Redis/provider framing correction is accepted by ARGUS, 2026-06-08: the docs
  now treat Redis role as an open architecture decision rather than a rejected
  memory-truth option, and NVIDIA/provider private archive awareness as a
  configurable per-Developer-Space posture after explicit provider contract and
  privacy review. Current staging remains Supabase-led for durable memory,
  visibility, export, deletion, and auth; that is present implementation truth,
  not a permanent ban on Redis-backed memory designs.
- Lane 1 Supabase/auth/storage setup closeout is blocked on external
  credentials/dashboard actions after DAEDALUS inventory, 2026-06-08:
  `infra/supabase/README.md` now lists migrations `001` through `024`, and
  `docs/ops/STAGING_SETUP_BLOCKERS.md` records the no-values local/Railway/
  Supabase inventory. Remote API deployment health proves only boolean presence
  for Supabase URL/anon/service-role and JWT; it does not prove `DATABASE_URL`,
  migration state, bucket state, Auth redirects, or Stripe resources. Local
  `.env` has Supabase keys present but empty and no `SUPABASE_ACCESS_TOKEN`;
  Railway CLI access with the local token is unauthorized for the project
  selector. MIMIR/human dashboard input is needed before migrations, bucket
  creation, or Auth redirect changes can proceed.
- Lane 1 blocker inventory is accepted by ARGUS, 2026-06-08: ARGUS found no
  secret values in the docs, confirmed the migration list matches files `001`
  through `024`, confirmed `/reset-password/update` is correctly called out as
  missing, and accepted Lane 1 as blocked on external Supabase/Railway/Stripe/
  replay facts. ARGUS corrected one wording issue so raw
  `community_moderation_actions` rows are described as admin/raw moderation
  logs, not public-safe rows. Next human/dashboard actions are the confirmed
  staging Supabase target and migrations, private `persona-files` bucket,
  Supabase Auth site/redirects plus reset-route decision, Railway-authorized
  variable inventory/configuration, and Stripe/replay/social callback setup.
- Lane 1 MIMIR setup follow-up, 2026-06-08: Supabase staging project
  `jdewavktyemnpehdzvgl` is now connected through Supabase MCP, the local
  Supabase URL typo was corrected, the database password was reset through the
  Supabase Management API, local `DATABASE_URL` no longer contains the
  placeholder password, migrations `001` through `024` are present in remote
  migration history, and the `persona-files` bucket is verified private. Marty
  copied the refreshed database URL into Railway and redeployed `@station/api`.
  Public API deployment health now reports the Railway web/API URLs instead of
  localhost. Remaining staging setup items are Supabase Auth redirect
  confirmation, reset-password route decision, Stripe test resources, replay
  account/data, and any Railway variable audit that requires dashboard/API
  access beyond public booleans.
- Backend implementation roadmap is opened by MIMIR, 2026-06-08:
  `docs/roadmap/STATION_BACKEND_IMPLEMENTATION_ROADMAP.md` is the active
  backend sequencing artifact. BE-00, staging truth and readiness probes, is
  the immediate DAEDALUS implementation lane before private archive retrieval,
  memory lifecycle, provider policy, Redis/Valkey, Cloudflare adapter, or
  background-job work begins.
- BE-00 DAEDALUS implementation is ready for ARGUS review, 2026-06-09:
  `/health` remains the cheap `{ ok: true }` probe, while `/health/deployment`
  now adds non-secret readiness for Supabase database connectivity, migration
  state, private `persona-files` bucket status, Railway/public URL sanity,
  Supabase Auth redirect support status, Stripe/provider/Redis configuration
  booleans, and sanitized failure paths. `pnpm test:health`,
  `pnpm --filter @station/api build`, and `git diff --check` pass locally with
  the pinned runner. BE-01 must wait for ARGUS acceptance or a DAEDALUS fix
  wakeup.
- BE-00 ARGUS review found one readiness-overstatement issue, 2026-06-09:
  `/health/deployment.ready` must not go true while known Lane 1 blockers remain
  false or unchecked. ARGUS hardened the ready gate to include `DATABASE_URL`,
  Supabase Auth redirect readiness, Stripe readiness, platform chat readiness,
  and embedding-provider readiness; Redis remains reported as status, not a
  staging-ready requirement.
- BE-00 is accepted by ARGUS after hardening, 2026-06-09: `test:health`,
  `@station/api` build, `git diff --check`, and public API `/health` pass. The
  public Railway `/health/deployment` endpoint now returns the new `ready` plus
  `readiness` shape. `ready` is false while database, migration, storage,
  Supabase Auth redirect, provider, and Stripe checks remain pending or failing;
  those deployment-config gaps are E2E setup asks, not blockers to BE-01.
- BE-01 private archive retrieval foundation is opened by MIMIR, 2026-06-09:
  DAEDALUS owns a narrow owner/persona-scoped retrieval implementation over
  private archive source chunks and citations. Missing API keys or dashboard
  config must fail closed or report pending state rather than blocking backend
  completion.
- BE-01 DAEDALUS implementation is ready for ARGUS review, 2026-06-09:
  `memory_items` now carries nullable archive-source provenance for completed
  import jobs, processed persona files, and archived chat transcripts; private
  retrieval validates the source before returning excerpts; context preview
  prefers bounded owner-only archive excerpts with citations and falls back to
  metadata references when no authoritative chunks match. Generic memory search
  excludes archive chunks so failed/deleted sources cannot bypass source
  validation as ordinary memory. `pnpm test:conversation-archive`,
  `pnpm --filter @station/api build`, and `git diff --check` pass locally with
  the pinned runner. BE-02 must wait for ARGUS acceptance or a DAEDALUS fix
  wakeup.
- BE-01 is accepted by ARGUS after prompt-boundary hardening, 2026-06-09:
  owner/persona scope, failed/deleted/pending source exclusion, source caps,
  bounded excerpts, citations, and generic-memory archive exclusion held under
  focused review. ARGUS tightened the persona prompt so private archive excerpts
  are labelled as quoted evidence, not instructions, and added a regression
  assertion for that boundary. Migration `025_private_archive_retrieval.sql`
  still needs staging Supabase apply/RPC proof before remote archive-vector
  retrieval is proven.
- BE-02 memory lifecycle engine is opened by MIMIR, 2026-06-09: DAEDALUS should
  proceed with owner-only memory lifecycle state handling, runtime context
  filtering, and focused lifecycle tests. BE-01 migration 025 staging apply/RPC
  proof remains an E2E setup follow-up, not a blocker to BE-02. Agents that
  believe a lane is done, blocked, or ready to go idle must wake MIMIR with
  `WAKEUP A1:` and a concrete verdict/task.
- BE-02 DAEDALUS implementation is ready for ARGUS review, 2026-06-09: active
  `owner_memory_blocks` are injected into owner runtime context with a distinct
  owner-memory source label; rejected, quarantined, expired, and superseded
  `memory_item_lifecycle` rows are filtered out of runtime memory search in the
  keyword fallback and the updated vector RPC; briefing status counts now treat
  past `expires_at` and supersession refs as non-active runtime states; lifecycle
  updates remain owner-only and validate supersession targets against the same
  owner/persona. `pnpm test:persona-context`, `pnpm --filter @station/api
  build`, and `git diff --check` pass locally with the pinned runner. BE-03
  waits for ARGUS acceptance or a DAEDALUS fix wakeup.
- BE-02 is accepted by ARGUS after memory prompt-boundary hardening,
  2026-06-09: owner scope, active-only owner memory blocks, lifecycle filtering,
  owner-only briefing truth, and same-owner/persona supersession validation held
  under focused tests. ARGUS tightened the general memory prompt section so
  runtime memories are treated as continuity context rather than
  system/developer instructions, and added regression coverage. Migration
  `026_memory_lifecycle_runtime_filters.sql` still needs staging Supabase apply
  before remote vector memory search follows the new lifecycle filter.
- BE-03 provider policy per Developer Space is opened by MIMIR, 2026-06-09:
  DAEDALUS should implement explicit provider/data privacy modes with
  AI-observability metadata and strict private-archive gating. BE-01/BE-02
  migrations 025 and 026 staging apply/RPC proof remains an E2E setup follow-up,
  not a blocker to BE-03. Agents that believe a lane is done, blocked, or ready
  to go idle must wake MIMIR with `WAKEUP A1:` and a concrete verdict/task.
- BE-03 DAEDALUS implementation is ready for ARGUS review, 2026-06-09:
  Developer Spaces now have explicit `provider_policy` modes, an owner-only
  provider-policy evaluation route, and serialized policy state. Private
  archive-aware policy decisions are denied unless the Developer Space has
  explicitly accepted `private_archive_allowed`; `public_synthetic_only` blocks
  public-context and private-archive inclusion. The evaluation route records
  sanitized AI observability metadata/payloads containing only policy, requested
  context, provider mode, allow/deny result, include flags, and denial reason.
  It does not log provider keys, prompt payloads, or private archive chunks, and
  it does not execute provider calls. NVIDIA chat remains behind the existing
  OpenAI-compatible provider router. `pnpm test:developer-spaces`, the focused
  provider-router test, `pnpm --filter @station/api build`, and targeted
  `git diff --check` pass locally with the pinned runner. BE-04 must wait for
  ARGUS acceptance or a DAEDALUS fix wakeup.
- BE-03 is accepted by ARGUS, 2026-06-09: owner-only policy evaluation,
  private-archive denial unless `private_archive_allowed` is explicitly set,
  `public_synthetic_only` denial of public-context/private-archive context, and
  sanitized AI observability metadata all held under focused review. The
  evaluation route records a whitelisted policy decision only; provider keys,
  prompts, and private archive chunks are not copied into trace metadata or
  event payloads. Migration `027_developer_space_provider_policy.sql` still
  needs staging Supabase apply proof before remote policy persistence is proven.
- BE-04 retrieval provider metadata is opened by MIMIR, 2026-06-09: DAEDALUS
  should add provider/model/dimension/index/backfill metadata and dimension
  guardrails without switching the active embedding provider or vector shape.
  BE-01/BE-02/BE-03 migrations 025, 026, and 027 staging apply/RPC proof remains
  an E2E setup follow-up, not a blocker to BE-04. Agents that believe a lane is
  done, blocked, or ready to go idle must wake MIMIR with `WAKEUP A1:` and a
  concrete verdict/task.
- BE-04 DAEDALUS implementation is ready for ARGUS review, 2026-06-09:
  `memory_items` now has retrieval provider metadata for embedding provider,
  model, dimension, index name/source, and backfill version. The then-active
  contract was OpenAI `text-embedding-3-small`, `vector(1536)`,
  `memory_items_embedding_1536`, Supabase pgvector, backfill version 1; this is
  superseded by the 2026-06-11 Gemini active-target correction. New API
  memory/archive vector writes reject mixed-dimension provider responses before
  insert and release reserved storage bytes. Missing embedding keys now leave
  new API writes without vectors/metadata instead of persisting pseudo-vector
  rows as if they were OpenAI embeddings. Migration 028 backfills existing
  non-null embeddings, constrains metadata to the active 1536-vector contract,
  and filters both memory and private-archive vector RPCs to matching metadata.
  `pnpm test:storage`, `pnpm test:conversation-archive`,
  `pnpm test:persona-context`, the focused retrieval metadata test,
  `pnpm --filter @station/api build`, and targeted `git diff --check` pass
  locally with the pinned runner. BE-05 must wait for ARGUS acceptance or a
  DAEDALUS fix wakeup.
- BE-04 is accepted by ARGUS after no-key fallback hardening, 2026-06-09:
  mixed-dimension rejection, active 1536-vector metadata, migration 028
  constraints/backfill posture, memory/archive vector RPC compatibility, storage
  rollback behavior, and null-vector/no-metadata write behavior held under
  focused tests. ARGUS found and fixed one retrieval hole: memory search now
  skips vector RPC entirely when no embedding key is configured, so keyword
  fallback actually carries no-key writes instead of querying an empty
  metadata-filtered vector path. Migration `028_retrieval_provider_metadata.sql`
  still needs staging Supabase apply/RPC proof before remote metadata-filtered
  vector retrieval is proven.
- BE-05 Redis/Valkey foundation is opened by MIMIR, 2026-06-09: DAEDALUS should
  add operational cache/idempotency/rate-limit/lightweight queue-state
  scaffolding only. Redis/Valkey is not canonical memory in this lane;
  Redis-as-memory-truth remains an open architecture question for a later
  explicit MIMIR decision and ARGUS durability/export/deletion review. BE-01
  through BE-04 migrations 025 through 028 staging apply/RPC proof remains an
  E2E setup follow-up, not a blocker to BE-05. Agents that believe a lane is
  done, blocked, or ready to go idle must wake MIMIR with `WAKEUP A1:` and a
  concrete verdict/task.
- BE-05 DAEDALUS implementation is ready for ARGUS review, 2026-06-09: the API
  now has an optional operational cache boundary with disabled-safe behavior,
  Upstash REST support only when URL/token config is present, and a pending
  disabled state for TCP Redis/Valkey URLs until a concrete client/provider is
  selected. Cache keys include environment, owner, persona, Developer Space,
  resource, operation, and caller-supplied parts; TTL defaults are explicit for
  runtime context, idempotency, rate-limit, and queue-state purposes. Invalidation
  helpers cover archive import, memory/canon edits, continuity writes, persona
  edits, visibility changes, and Developer Space changes, with best-effort hooks
  in archive/memory services plus continuity and persona routes. Redis/Valkey is
  still not canonical memory; no schema, vector search, background-job, UI,
  Cloudflare, NVIDIA retrieval, or provider-router behavior was added. Focused
  operational-cache tests, `test:storage`, `test:persona-context`,
  `test:continuity`, `@station/api` build, and targeted `git diff --check` pass
  locally with the pinned runner.
- BE-05 is accepted by ARGUS, 2026-06-09: key scopes include environment plus
  owner/persona or Developer Space identifiers, TTL defaults are explicit,
  disabled and TCP-Redis-pending states fail closed, Upstash REST is the only
  live adapter, and current usage is scaffolding plus best-effort invalidation
  hooks only. ARGUS found no cache read path that can serve stale private
  context today. Redis/Valkey remains non-canonical operational infrastructure;
  Redis-as-memory-truth still requires a separate MIMIR decision and ARGUS
  durability/export/deletion review.
- BE-06 background-job foundation is opened by MIMIR, 2026-06-09: DAEDALUS
  should add owner-visible job status, idempotent retry semantics, and safe
  failure surfaces using the existing database/job-status surfaces or the
  narrowest provider-optional queue boundary that fits the repo. Redis/Valkey,
  Upstash, staging migration proof, and cache provider selection are not
  required to complete this lane. Agents that believe a lane is done, blocked,
  or ready to go idle must wake MIMIR with `WAKEUP A1:` and a concrete
  verdict/task.
- BE-06 DAEDALUS implementation is ready for ARGUS review, 2026-06-09: the API
  now has a small background-job helper around the existing `import_jobs`
  surface, sanitized owner-visible job failure messages, and `POST
  /imports/:id/retry` for failed chat imports. Retry reuses the same owner-owned
  job row, refuses other-owner jobs, returns completed jobs idempotently without
  adding duplicate archive rows, and requires the owner to resupply chat content
  instead of storing private payload text in the job record. Existing import job
  status/list routes remain owner-scoped. Uploaded-file job failures now store
  and rethrow sanitized errors for the fire-and-forget path. No worker, queue
  provider, Redis/Valkey requirement, Upstash requirement, new migration, UI,
  Cloudflare, NVIDIA retrieval, or staging migration-proof work was added.
  `test:conversation-archive`, `test:storage`, `@station/api` build, and
  targeted `git diff --check` pass locally with the pinned runner.
- BE-06 is accepted by ARGUS after retry idempotency hardening, 2026-06-09:
  owner-only job status/list semantics, failed chat-import retry, private text
  and secret-shaped error redaction, completed-job no-op behavior, and the
  no-worker/no-provider boundary held under focused tests. ARGUS fixed one
  partial-success edge: queued/processing retries now mark the same job
  completed idempotently if archive rows already exist, preventing a crash after
  ingest but before completion from leaving the job stuck pending forever.
- BE-07 Cloudflare retrieval adapter evaluation is opened by MIMIR, 2026-06-09:
  DAEDALUS should add a disabled-safe adapter/mirror contract only. Cloudflare
  must not become the authorization authority; canonical records stay in
  Station/Supabase and are fetched after owner/visibility checks. Worker or
  Vectorize mirrors should store IDs and minimal metadata first, not private
  snippets. Staging migration proof, cache provider selection, and Cloudflare
  account configuration remain E2E setup follow-ups, not blockers to BE-07.
- BE-07 DAEDALUS implementation is ready for ARGUS review, 2026-06-09:
  `@station/ai` now exposes a disabled/pending Cloudflare retrieval adapter
  contract, env/status helpers, minimal `memory_items` mirror-payload builder,
  and a Station/Supabase reauthorization helper for Cloudflare candidate IDs.
  Missing config stays disabled, and even complete Cloudflare config reports
  `remote_adapter_pending` until a live Worker/query privacy contract is
  reviewed. Mirror payloads contain IDs, owner/persona scope, source type labels,
  embedding metadata, and timestamps only; they exclude title, content, summary,
  archive source names, private snippets, prompt text, tokens, and provider
  secrets. Reauthorization strips Cloudflare candidate metadata and returns
  canonical rows only after owner/persona filtering through Supabase. The new
  `docs/architecture/cloudflare-retrieval-adapter.md` records delete/export/
  reindex requirements before private snippets may enter any Cloudflare index.
  No live Cloudflare calls, Worker, Vectorize index writes, Redis canonical
  memory, NVIDIA retrieval, embedding swap, API route behavior change, UI, or
  staging proof work was added. Focused Cloudflare adapter tests,
  `@station/api` build, and targeted `git diff --check` pass locally with the
  pinned runner.
- BE-07 is accepted by ARGUS after lifecycle reauthorization hardening,
  2026-06-09: disabled-safe behavior, minimal mirror payloads, no-private-snippet
  mirror rules, Station/Supabase reauthorization, and documented
  delete/export/reindex gates held under focused tests. ARGUS tightened the
  reauthorization helper so Cloudflare candidate IDs must also pass canonical
  memory lifecycle filtering before private rows return, preventing rejected,
  quarantined, expired, or superseded memory from bypassing BE-02 through a
  future remote candidate path.
- BE-08 replay-driven optimization prep is opened by MIMIR, 2026-06-09:
  DAEDALUS should prepare instrumentation, runbook, and online evidence capture
  points for staged replay rather than optimizing from local guesswork. The lane
  should surface exact E2E blockers for migrations 025 through 028, cache
  provider selection, Cloudflare account setup, Stripe/replay resources, and
  provider config, then wake MIMIR with a backend closeout verdict.
- BE-08 DAEDALUS implementation is ready for ARGUS review, 2026-06-09:
  `/observability/replay-readiness` now exposes an auth-protected, non-secret
  replay optimization prep payload with measurement points, capture surfaces,
  setup blockers, and privacy boundaries. The payload covers chat latency/context
  quality, archive import confidence, retrieval relevance, provider cost/failure
  rate, job failure recovery, export trust, and billing/webhook reliability. It
  names the remaining E2E blockers: hostile remote smoke for migration-backed
  retrieval/lifecycle/provider-policy/metadata behavior if required before
  replay, cache provider selection/deferment, Cloudflare account/index
  decision, Stripe test resources, Gemini embedding configuration, and replay
  account/data setup. `docs/ops/STAGING_REPLAY_READINESS.md` now lists the
  evidence capture points and `test:replay-readiness`; setup blockers now
  reference migrations through `028` plus cache/Cloudflare/provider decisions.
  Privacy notes explicitly keep context-preview response bodies, prompt bodies,
  private excerpts, and excerpt text out of the replay evidence package.
  No optimization, product UI, provider swap, broad infrastructure, staging
  secret/dashboard work, or speculative performance change was added.
  `test:replay-readiness`, `@station/api` build, and targeted
  `git diff --check` pass locally with the pinned runner.
- BE-08 is accepted by ARGUS after replay privacy wording hardening,
  2026-06-09: the auth-gated readiness endpoint is prep-only, not telemetry
  aggregation or staging proof. Measurement points, setup blockers, capture
  surfaces, and non-secret payload shape held under focused review. ARGUS
  tightened the service/runbook language so context-preview and
  archive-retrieval response bodies may be viewed during manual replay but must
  not be stored in evidence packages; evidence should keep counts, modes,
  ratings, statuses, and sanitized labels.
- Backend roadmap BE-00 through BE-08 is locally accepted by MIMIR,
  2026-06-09. Replay-driven optimization must wait for staging proof or an
  explicit MIMIR waiver of the remaining external setup blockers. MIMIR's
  2026-06-09 proof update clears remote database readiness, migration setup
  proof, private storage readiness, and NVIDIA platform chat proof; remaining
  blockers are Supabase Auth redirects/reset route, embedding profile proof, cache
  provider selection/deferment, Cloudflare account/index decision, Stripe test
  resources, replay account/data setup, and any hostile remote vector/RPC smoke
  MIMIR wants before full replay. Latest public `/health/deployment` still
  reports `ready: false`, so the next lane is staging closeout review, not more
  speculative backend expansion.
- BE-00 through BE-08 staging proof/waiver handoff is ready for ARGUS review,
  2026-06-09:
  `docs/ops/STAGING_PROOF_WAIVER_HANDOFF.md` records the current public
  Railway proof and the exact external proof/waiver asks. Public `/health`
  returns `{ "ok": true }`, while `/health/deployment` reports `ready: false`.
  After MIMIR's proof update, database, migration object proof, private storage,
  and NVIDIA platform chat are true; Supabase Auth redirect management proof,
  embedding profile proof, Stripe, Redis/cache, Cloudflare, and replay-data setup
  remain pending. This is a handoff package, not full staging readiness.
- BE-00 through BE-08 staging proof/waiver handoff is accepted by ARGUS,
  2026-06-09 before MIMIR's proof update: ARGUS rechecked public web/API
  `/health` and API `/health/deployment`, accepted the handoff as truthful, and
  told MIMIR to decide whether to prove or waive external blockers. That verdict
  is superseded for DB/migration/storage/provider facts by MIMIR's later proof
  update; replay-driven optimization still should not begin from the handoff
  alone.
- MIMIR staging proof update, 2026-06-09: Supabase MCP applied migrations `025`
  through `028` and reported remote history through `028`; Railway API/web now
  run commit `55d3fc6`; public `/health/deployment` reports database `ok: true`,
  migrations `ok: true` via `025-028/public_schema_object_proof`, storage `ok:
  true` with `persona-files` private, and NVIDIA platform chat true. Overall
  readiness remains `ready: false` because Supabase Auth redirect proof, Gemini
  embeddings, Stripe, Redis/cache, Cloudflare setup, and replay account/data are
  still pending or need explicit waiver.
- MIMIR decision after ARGUS accepted the setup proof, 2026-06-09: do not issue
  a broad replay waiver yet and do not pause. Wake DAEDALUS for a code-side
  staging closeout lane: align `/observability/replay-readiness` with the new
  setup proof, resolve or truthfully reroute the missing `/reset-password/update`
  target, and return an exact list of blockers that truly require Marty,
  provider keys, dashboard changes, or a deliberate narrowed-replay waiver.
- MIMIR follow-up RPC smoke, 2026-06-09: Supabase MCP executed no-data vector
  calls against `match_memory_items` and `match_private_archive_chunks` with
  nonexistent owner/persona IDs and a zero 1536-dimensional vector. Both
  returned zero rows without error. This clears callable/fail-closed RPC setup
  proof; data-backed retrieval relevance still requires replay data and the
  active embedding provider.
- DAEDALUS staging closeout implementation is ready for ARGUS review,
  2026-06-09: `/observability/replay-readiness` now distinguishes setup-proven
  database, migrations `025` through `028`, private `persona-files` storage, and
  NVIDIA platform chat from remaining blockers; `/reset-password/update` is now
  implemented as the Supabase password update target. Remaining external asks
  are Supabase Auth dashboard redirects plus deployed reset-route proof, Gemini
  embeddings, Stripe test resources, Redis/cache provider decision, Cloudflare
  account/index decision, replay account/data, and any hostile remote vector/RPC
  smoke MIMIR wants before full replay. Focused replay-readiness/auth tests, API
  build, web typecheck, web lint, and `git diff --check` pass locally. The
  local Windows web build compiles and generates pages, then fails in Next
  standalone trace copying with `EPERM` on symlink creation; Railway/Linux
  deployment proof is still needed.
- DAEDALUS staging closeout implementation is accepted by ARGUS, 2026-06-09:
  focused local replay-readiness/auth/API/web checks pass, the deployed web
  `/health` route returns OK, `/reset-password/update` returns public `200`,
  deployed `/observability/replay-readiness` rejects visitors with `401`, and
  deployed `/health/deployment` remains non-secret with `ready: false`. The
  remaining MIMIR/Marty decision is whether to waive or prove Supabase Auth
  redirect allow-list, embedding profile proof, Stripe, cache provider, Cloudflare,
  replay account/data, and optional hostile vector/RPC smoke before replay.
- Cloudflare dependency check is ready for MIMIR, 2026-06-10:
  `docs/ops/CLOUDFLARE_DEPENDENCY_CHECK.md` records that Cloudflare retrieval is
  optional by disabled adapter contract, has no live Worker/Vectorize/runtime
  dependency, and can be deferred for current staging unless MIMIR names a
  Cloudflare-specific replay objective. Optional env placeholders are now listed
  in `.env.example`.
- Upstream carry-over dependency crosswalk is ready for MIMIR, 2026-06-10:
  `docs/roadmap/DEPENDENCIES_UPSTREAM_CARRYOVER_CROSSWALK.md` maps reviewed
  upstream repo ideas to current Station implementation, classifies active
  primary, hybrid supplement, deferred, and rejected dependencies, and
  recommends local canonical Supabase retrieval plus optional remote mirrors to
  prevent provider/dependency drift.
- Gemini embedding prep is ready for MIMIR/ARGUS review, 2026-06-10:
  conversation/context retrieval now resolves the
  embedding key by selected provider, Gemini REST embedding calls use
  documented `embedContent` shape with 1536 output dimensions, migration `029`
  prepares provider-aware metadata/RPC support, and
  `docs/ops/GEMINI_EMBEDDING_MIGRATION_PLAN.md` records the staging switch and
  rollback sequence. This does not enable Gemini chat and does not switch the
  replay corpus.
- Corrected MIMIR embedding decision, 2026-06-11: the 2026-06-10 OpenAI-first
  wording above was an inverted interpretation of Marty/MIMIR's instruction,
  then the first correction overfit to provider identity. The product/runtime
  contract is an embedding profile. `station_free_1536` is the selected
  product-testing profile because it can use Gemini's free tier while preserving
  the 1536-dimensional Supabase pgvector shape. `openai_1536` remains
  native/rollback. NVIDIA remains platform chat/model work, not the embedding
  profile.
- Corrected Gemini staging gate, 2026-06-11: configure
  `EMBEDDING_PROFILE_CODE=station_free_1536`,
  `EMBEDDING_DIM=1536`, and `GEMINI_API_KEY`, leaving `EMBEDDING_MODEL` blank
  unless deliberately overriding within the selected profile; apply migration
  `029`, reindex a bounded replay corpus, and
  run hostile retrieval smoke before data-backed replay is called proven. These
  are implementation/proof tasks for the chosen profile lane, not reasons to
  drift back to OpenAI.
- Corrected deployment readiness posture, 2026-06-11:
  `/health/deployment` now exposes the selected `embeddingProfileCode`,
  effective `embeddingProvider`, `embeddingsConfigured`, and separate
  OpenAI/Gemini booleans. Overall replay readiness follows the active profile,
  so Gemini keys satisfy the embedding gate when
  `EMBEDDING_PROFILE_CODE=station_free_1536`.
- DAEDALUS embedding-profile cleanup, 2026-06-11: readiness, key selection, and
  AI retrieval metadata now resolve the same profile code; stale cross-provider
  `EMBEDDING_MODEL` or dimension overrides fall back to the selected
  profile-owned model and 1536-dimensional contract. ARGUS review is requested
  before this profile-boundary language is treated as accepted.
- DAEDALUS embedding-profile cleanup is accepted by ARGUS, 2026-06-11, after
  hardening deployment readiness to require migration `029` provider-aware RPC
  proof for `station_free_1536`. `/health/deployment` cannot go ready from a
  Gemini key alone; it must also prove the selected profile's RPC surface,
  and data-backed replay still requires bounded reindex plus hostile retrieval
  smoke.
- DAEDALUS migration-029 proof attempt, 2026-06-11: staging is not yet proven
  for `station_free_1536`. Supabase MCP apply is blocked by OAuth, Supabase CLI
  linked apply is blocked by missing login/link state, and explicit
  `DATABASE_URL` apply is blocked from this shell because the direct database
  host resolves only to IPv6. Public `/health/deployment` reports
  `readiness.migrations.ok=false` with `query_failed`, and
  `node scripts/prove-staging-migration-029.mjs` returns PostgREST `PGRST202`
  for both provider-aware RPC signatures. Apply/proof checklist:
  `docs/ops/STAGING_MIGRATION_029_PROOF.md`.
- DAEDALUS migration-029 proof attempt is accepted by ARGUS, 2026-06-11, as an
  accurate external blocker package. Public readiness still reports
  `ready=false`, `embeddingProfileCode=station_free_1536`,
  `embeddingProvider=gemini`, `embeddingsConfigured=false`, and migrations
  `query_failed`; direct RPC proof still returns sanitized `PGRST202` for both
  provider-aware signatures. Next decision belongs to MIMIR/Marty: authorize and
  apply migration `029`, provide an IPv6-capable/pooler DB path, or explicitly
  defer/waive vector proof.
- Discern-to-Tex UI import plan is documented by MIMIR, 2026-06-11:
  `docs/roadmap/DISCERN_TO_TEX_UI_IMPORT_PLAN.md` records that `fork/main`
  (`Tex6298/Station`) remains the Railway/deployment base and `origin/main`
  (`Discern-AI/Station`) is only a read-only source of possible UI/UX imports.
  Sequencing call: migration `029` remains the active staging blocker; a
  docs-only MIMIR audit may run in parallel if external migration access is
  blocked, but no UI code import starts until the audit exists, ARIADNE selects
  slices, MIMIR opens a bounded slice, DAEDALUS ports only that slice, and ARGUS
  accepts the diff boundary and validation. Discern changed after the initial
  UI request, so any chat checklist is stale-sensitive: the audit must fetch
  current `fork/main` and `origin/main`, record both SHAs, and let that fresh
  diff supersede earlier candidate ordering.
- Railway Gemini/Stripe config is now proven on `@station/api`, 2026-06-11:
  MIMIR used the existing Railway project token with the `Project-Access-Token`
  GraphQL header, upserted non-public API variables onto live `@station/api`
  and the public Stripe publishable key onto `@station/web`, then redeployed
  `@station/api`. Public `/health/deployment` now reports
  `embeddingsConfigured=true`, `geminiEmbeddings=true`, `stripeBilling=true`,
  `stripePrices=true`, and `redisConfigured=true`; remaining readiness blockers
  are migration `029` proof (`query_failed`) and Supabase Auth redirect
  management proof (`not_supported`). `codex mcp login supabase` completed
  successfully after OAuth was granted, but the already-loaded MCP worker in
  this session still reports stale `OAuth authorization required`; a fresh
  DAEDALUS process should retry Supabase MCP first. Supabase CLI still lacks a
  `SUPABASE_ACCESS_TOKEN`, and the local `DATABASE_URL` is the direct IPv6-only
  host rather than a pooler URL. `node scripts/prove-staging-migration-029.mjs`
  still returns sanitized `PGRST202` for both provider-aware RPC calls.
- ARGUS accepted the stale Supabase MCP retry blocker, 2026-06-11: direct MCP
  `list_tables` and `list_migrations` calls in the ARGUS worker also fail with
  `OAuth authorization required`, linked Supabase CLI commands fail because no
  project ref is present, this shell has no `SUPABASE_ACCESS_TOKEN`, and the
  only local connection key found is the direct `DATABASE_URL`. Current public
  readiness still proves Gemini/Stripe/Redis config but remains `ready:false`
  on migration `029` proof. Next action belongs to MIMIR/Marty: start a fresh
  Supabase-MCP-capable process, provide CLI token/link state, provide a pooler
  or IPv6-capable DB path, or explicitly defer/waive vector proof.
- MIMIR sequencing decision after ARGUS blocker acceptance, 2026-06-11:
  migration `029` proof remains a required staging/replay proof, but it is
  parked rather than waived until a fresh MCP-capable process,
  `SUPABASE_ACCESS_TOKEN`, linked Supabase CLI state, pooler URL, or
  IPv6-capable DB path is available. Because Railway/Gemini/Stripe/Redis config
  is now proven and Discern audit work is docs-only, MIMIR opened ARIADNE review
  of `docs/roadmap/DISCERN_TO_TEX_UI_IMPORT_AUDIT.md` as safe parallel product
  review. No Discern code import is authorized.
- Discern-to-Tex UI import audit is complete, 2026-06-11:
  `docs/roadmap/DISCERN_TO_TEX_UI_IMPORT_AUDIT.md` compares fresh
  `fork/main` (`81c9aef`) and `origin/main` (`037d491`). Verdict: Discern is a
  mixed UI/backend/config branch, not a safe import source. Useful candidates
  include onboarding/kindling product language, Discover/public-home direction,
  left-rail/search concepts, and notes/global archive ideas, but DAEDALUS must
  not port code until ARIADNE reviews product value and MIMIR opens a bounded
  slice. Protected rejects include Railway config simplification, health/reset
  route deletion, readiness/replay test deletion, retrieval/cache deletions,
  migration `025-029` replacement, package-lock drift, and moderation visibility
  regression.
- ARIADNE product review of the Discern UI import audit is complete,
  2026-06-11: `docs/roadmap/DISCERN_TO_TEX_UI_IMPORT_REVIEW_ARIADNE.md`
  accepts the audit as a product-idea source only, rejects wholesale code import,
  and recommends the first future slice be docs/product-only onboarding and
  Integrity Session language. Discover/public-home direction may follow as
  Station-native IA, left-rail/search stays a design reference until route and
  visibility gates exist, and notes/global archive belongs to a later backend/
  product lane after migration `029` is resolved or explicitly waived.
- UI-IMPORT-01 is ready for ARGUS review, 2026-06-11:
  `docs/product/STATION_ONBOARDING_INTEGRITY_SESSIONS.md` records the
  Station-native onboarding, Kindling, four-entry-path, and Integrity Session
  product language as a docs-only slice. No runtime code, schema, route,
  storage, search, provider, billing, deployment, migration, or Discern code
  import is authorized by this document. ARGUS should review product-promise
  risk before MIMIR opens any runtime onboarding surface.
- UI-IMPORT-01 is accepted by ARGUS, 2026-06-11: the onboarding and Integrity
  Session language stays product-only, names the four entry paths without
  promising missing automation, keeps Kindling as grounding/orientation rather
  than entity activation, frames Integrity Sessions as continuity
  infrastructure rather than therapy/diagnosis/mystical proof, and keeps
  Station Assistant operational rather than persona-like. Runtime onboarding
  remains unopened until MIMIR names an implementation surface and ARGUS/ARIADNE
  gate route truth, privacy, visibility, and mobile fit.
- MIMIR sequencing after UI-IMPORT-01 acceptance, 2026-06-11: do not open a
  runtime onboarding slice yet. Return focus to staging/replay readiness by
  handing migration `029` access/proof back to DAEDALUS in a fresh process.
  Marty has granted Supabase MCP OAuth, but this already-loaded MIMIR worker
  still returns stale `OAuth authorization required`; DAEDALUS should retry MCP
  metadata first, apply `029` only if the migration ledger/schema prove it is
  absent, then run the provider-aware RPC proof and deployment health checks.
- DAEDALUS stale MCP retry reported back to MIMIR, 2026-06-11: a fresh A2 lane
  still failed before Supabase metadata reads with MCP transport
  `OAuth authorization required`, so no migration apply was attempted. MIMIR
  re-ran `codex mcp login supabase` successfully in this shell, but the loaded
  MCP tools still returned the same OAuth error. The only local `DATABASE_URL`
  is the direct IPv6-only `db.<project>.supabase.co:5432` host, and Supabase CLI
  migration listing still cannot resolve an A record from this Windows shell.
  Migration `029` remains blocked on one of: a genuinely refreshed MCP worker,
  `SUPABASE_ACCESS_TOKEN` for Supabase CLI, a staging pooler DB URL, or an
  IPv6-capable DB path.
- Migration `029` is applied and proven on staging, 2026-06-11: MIMIR used the
  Supabase shared pooler details from Marty plus the existing local DB password
  to apply `infra/supabase/migrations/029_gemini_embedding_provider_prep.sql`
  through a temporary `node-postgres` client. Provider-aware RPC count moved
  from `0` to `2`; `node scripts/prove-staging-migration-029.mjs` now returns
  HTTP `200`/`rowCount: 0` for both RPCs; `/health/deployment` reports
  `readiness.migrations.ok: true` with latest proof
  `025-029/public_schema_object_and_rpc_proof`. Overall deployment readiness
  remains `ready:false` only because Supabase Auth redirect management proof is
  still `not_supported`. Supabase also surfaced an RLS advisory for
  `public.integrity_questions`; no remediation was applied in this lane, and
  ARGUS should review whether the table is intentionally public seed/config
  data or needs explicit RLS policies.
- Migration `029` proof is accepted by ARGUS, 2026-06-11: direct PostgREST RPC
  proof returns HTTP `200`/`rowCount: 0` for both provider-aware functions,
  `/health/deployment` reports migration proof green, and `test:health` plus
  `test:replay-readiness` pass. This clears the migration/RPC availability
  blocker, not populated-row Gemini retrieval quality. The direct pooler apply
  is acceptable as an audited staging remediation because MCP/CLI paths were
  documented as blocked, but future DB work should return to migration-led
  apply paths where possible. `integrity_questions` appears to be seed/config
  question-bank data, but RLS should still be enabled with explicit read-only
  client policies and no client writes in a narrow follow-up lane.
- MIMIR sequencing after migration `029` acceptance, 2026-06-11: open the
  narrow `integrity_questions` RLS policy lane before populated replay
  measurement. Supabase flagged the current table as RLS-disabled, and ARGUS
  agrees it should not be ignored even if it is seed/config question-bank data.
  DAEDALUS should add the next migration only: enable RLS on
  `public.integrity_questions`, grant `anon`/`authenticated` read of active
  rows if that remains intended, and add no client insert/update/delete
  policies. After that, wake ARGUS for hostile review. Supabase Auth redirect
  proof remains the only current `/health/deployment.ready` blocker and should
  follow after this security advisory lane unless MIMIR reprioritizes it.
- DAEDALUS added the narrow `integrity_questions` RLS migration, 2026-06-11:
  `infra/supabase/migrations/030_integrity_questions_rls.sql` enables RLS on
  the seeded question-bank table and grants only active-row `SELECT` to `anon`
  and `authenticated`. It adds no client insert/update/delete policies; writes
  remain service-role or migration-only. ARGUS should hostile-review that policy
  scope before MIMIR treats the advisory lane as accepted.
- ARGUS accepted and hardened migration `030`, 2026-06-11: the active-row read
  policies were correct, and ARGUS added explicit table privileges so `anon` and
  `authenticated` have only `SELECT` on `public.integrity_questions` while
  insert/update/delete remain unavailable to clients. `test:integrity` and
  whitespace checks pass. This closes the local RLS advisory lane pending remote
  migration apply/proof.
- Integrity-question RLS staging proof is ready for ARGUS review, 2026-06-11:
  MIMIR applied migration `030` to staging through the audited pooler path.
  Remote proof changed `public.integrity_questions` from RLS disabled with
  anon/authenticated insert/update/delete privileges to RLS enabled,
  anon/authenticated `SELECT` only, no client write privileges, and exactly two
  active-row SELECT policies. A follow-up Supabase `db query` no longer
  surfaced the RLS-disabled advisory, and `test:integrity` passed. ARGUS should
  review the remote proof before this advisory is considered closed.
- Integrity-question RLS staging proof is accepted by ARGUS, 2026-06-11: ARGUS
  independently re-queried the staging privilege/policy snapshot through the
  pooler without printing the URL. Remote state is RLS enabled, anon/authenticated
  `SELECT=true`, anon/authenticated insert/update/delete all `false`, and exactly
  the two active-row `SELECT` policies. A plain `select 1` requires
  `statement_cache_mode=describe` on the transaction pooler; with that set it
  succeeds and no RLS-disabled advisory is surfaced. This closes the
  `integrity_questions` RLS advisory lane.
- MIMIR sequencing after the RLS advisory lane, 2026-06-11: open Supabase Auth
  redirect proof support next, because it is the remaining
  `/health/deployment.ready` blocker after migrations, storage, Gemini, Stripe,
  Redis, and public URLs are green. The code currently reports `not_supported`
  unconditionally. DAEDALUS should add a read-only Management API proof using
  official endpoint `GET /v1/projects/{ref}/config/auth` with `auth:read`,
  verify `site_url` and `uri_allow_list` contain the Railway web URL and
  reset-password target, and keep failures sanitized. App code must not mutate
  Supabase auth settings; if `SUPABASE_ACCESS_TOKEN` is absent or lacks scope,
  readiness should remain non-ready with a clear non-secret blocker.
- DAEDALUS added read-only Supabase Auth redirect proof support, 2026-06-11:
  `/health/deployment` now derives the project ref from `SUPABASE_URL`, calls
  `GET /v1/projects/{ref}/config/auth` only when `SUPABASE_ACCESS_TOKEN` and
  valid app/project config exist, and verifies `site_url`, the app URL allow-list
  entry, and `/reset-password/update`. It exposes only booleans and sanitized
  errors (`not_configured`, `unauthorized`, `query_failed`, `timeout`, or
  `config_mismatch`) and never mutates Supabase Auth settings. `test:health`
  passes with Management API success, missing-token, unauthorized, config
  mismatch, migration-blocker, and dependency-failure coverage. ARGUS should
  hostile-review the non-secret response shape and readiness gating.
- Supabase Auth redirect proof support is accepted by ARGUS, 2026-06-11: the
  code uses only `GET /v1/projects/{ref}/config/auth`, gates the call on
  `SUPABASE_ACCESS_TOKEN`, derives the project ref from `SUPABASE_URL`, returns
  only booleans plus sanitized error enums, and includes secret-leak tests for
  the management token. Local `test:health` and API typecheck pass. The live
  Railway `/health/deployment` response still shows the older `not_supported`
  auth-redirect shape, so remote deployment/config proof remains pending before
  `/health/deployment.ready` can be called green.
- Supabase Auth redirects are remotely proven and `/health/deployment` is
  setup-green, 2026-06-11: Railway `@station/api` now has
  `SUPABASE_ACCESS_TOKEN`, the API was redeployed with the read-only
  Management API proof support, and MIMIR patched Supabase Auth settings through
  the Management API so `site_url` is the Railway web URL and `uri_allow_list`
  contains both the app URL and `/reset-password/update`. The first live probe
  reached the Management API but timed out at the cheap 1.5s dependency timeout,
  so MIMIR widened only the Supabase Management API readiness timeout and
  redeployed. Live `/health/deployment` now reports `ready:true`,
  `supabaseAuthRedirects.ok:true`, `siteUrlMatchesApp:true`,
  `appUrlRedirectAllowed:true`, and `passwordResetRedirectAllowed:true`. This
  closes setup/config chasing for replay; remaining work is populated replay
  data, Gemini reindex/retrieval quality, and E2E measurement.
- Supabase Auth redirect remote proof is accepted by ARGUS, 2026-06-11: the
  Management API settings patch is documented, the timeout widening is scoped
  only to the Supabase Management API check, local `test:health` and API
  typecheck pass, and ARGUS re-probed live `/health/deployment` as `ready:true`
  with all auth redirect booleans true. Setup/config blockers are closed for
  the current staging replay lane. The next lane should be populated Gemini
  replay/retrieval measurement with a concrete replay data plan.
- MIMIR opened populated replay/retrieval measurement, 2026-06-11: DAEDALUS
  should use `docs/ops/STAGING_REPLAY_DATA_PLAN.md` to create or reuse a
  non-production replay account, populate a bounded corpus through existing
  UI/API paths where possible, write or rebuild Gemini `station_free_1536`
  vectors for that corpus, run private retrieval/context-preview smokes against
  owner, other-owner, anonymous, wrong-persona, and lifecycle-filter paths, and
  capture sanitized counts/modes/latency/profile/relevance evidence only. A
  no-data RPC proof remains setup evidence, not retrieval-quality evidence.
- DAEDALUS route-audited the populated replay lane, 2026-06-11: live
  `/health/deployment` is `ready:true` and all named local replay/health/storage/
  persona/archive/continuity gates pass, but existing UI/API paths cannot
  populate the full bounded corpus from a fresh replay signup. Beta signup
  creates `visitor` profiles, while persona creation needs `private`, Space and
  document creation need `creator`, and Developer Spaces need `canon`. No
  reusable replay-account env keys or documented credentials exist. The next
  acceptable move is a narrow replay seed/helper lane for ARGUS review; direct
  service-role tier/data mutation should not be smuggled into the measurement
  lane.
- Replay seed/helper lane is accepted by ARGUS as the next bounded move,
  2026-06-11: route gates and env presence checks support DAEDALUS's blocker
  claim, and all named local gates plus live health are green. The helper must
  be setup-only, create or reuse exactly one non-production replay owner, assign
  the minimum explicit tier needed, seed only owner-scoped replay rows, write
  Gemini `station_free_1536` metadata correctly, avoid committed secrets/private
  excerpts, and wake ARGUS before any seeded data is treated as measurement
  evidence.
- MIMIR opened replay seed/helper implementation, 2026-06-11: DAEDALUS should
  implement the smallest setup-only helper that prepares one non-production
  replay owner and bounded owner-scoped corpus, assigns only the minimum tier
  needed, writes active Gemini `station_free_1536` metadata, avoids committed
  secrets/private excerpts, records sanitized labels/counts only, and wakes
  ARGUS for hostile review before populated retrieval measurement resumes.
- DAEDALUS implemented the replay seed/helper for ARGUS review, 2026-06-11:
  `scripts/staging-replay-seed.mjs` creates/reuses one replay owner, assigns
  `canon` as the minimum single-owner tier for persona, Space/document, and
  Developer Space setup, reads local ignored corpus text, writes Gemini
  `station_free_1536` memory vectors with active metadata, and seeds bounded
  owner-scoped replay rows for persona/archive/continuity/public/discussion/
  Developer Space/export surfaces. It has not been executed against staging
  from this handoff; validation covered script syntax, help output, example
  corpus structure, and whitespace only. ARGUS should review before live seed
  execution or measurement resumes.

## Current repo truth

- The repo is a pnpm/Turbo monorepo with `apps/web`, `apps/api`, shared packages,
  docs, and Supabase infra.
- PR-01 uses `pnpm@10.32.1`, as declared in the root `packageManager` field.
- Existing docs describe protected alpha loops, but v2 treats auth, persistence,
  and validation as the required foundation before more product expansion.
- Supabase migrations now cover profiles, personas, spaces, documents,
  conversations, archived chats, continuity candidates, continuity records,
  forums, comments, reports, exports, social publishing, and Developer Spaces.
- Developer Spaces exists as a Station-native observatory slice, with ingestion
  hardening, bounded SSE live updates, Discover integration, linked Station
  documents, owner-only export/usage primitives, the tiny ingestion client
  package, and bounded visual config editors accepted.
- As of PR-06 on 2026-05-31, the full validation baseline passed with the pinned
  pnpm runner.
- As of the 2026-06-05 current-main reconciliation, the full gate was no longer
  green: `pnpm test:continuity` failed and `pnpm test:persona-context` plus
  `pnpm test:conversation-archive` timed out. As of the 2026-06-06 targeted
  validation repair and full baseline re-run, the complete local gate passes
  again with the pinned pnpm runner. See `docs/testing/VALIDATION_BASELINE.md`.
- As of PR-02, `docs/architecture/persistence-schema-baseline.md` records the
  current table/entity map for future auth and repository work.
- As of PR-07, `continuity_records` remains the canonical cross-source ledger
  while specialized tables such as `memory_items`, `canon_items`,
  `archived_chat_transcripts`, `continuity_candidates`, and
  `integrity_sessions` remain canonical for their own flows.
- As of PR-08, the Studio persona workspace links to
  `/studio/personas/:personaId/continuity`, which lists owner-scoped
  `continuity_records` and can create new timeline markers linked to owner
  documents or conversations from the Studio UI.
- As of PR-09 slice 1, `/continuity` rejects linked
  document/conversation/source IDs that do not belong to the caller and persona,
  and `/exports/persona/:personaId` includes continuity timeline records in the
  owner-only archive package.
- As of PR-09 slice 2, owner-only persona export manifests include
  publication-state counts and owner-filed moderation report refs for exported
  document/discussion targets. Other reporters' notes and reports against
  non-exported/private-draft targets remain excluded.
- As of bounded PR-09 completion, exports remain the existing owner-only
  JSON/Markdown package path. Public export UI and binary/PDF packaging are not
  required for PR-10 to begin.
- As of PR-10 ARGUS acceptance, Developer Spaces API key rotation writes
  `developer_space_ingestion_keys`, revoked keys no longer authorize ingestion,
  oversized/deep JSON payloads are rejected, `api_key_hash` is never serialized,
  and public/community observatory responses scrub obvious secret-shaped JSON
  keys while preserving owner-only operational detail.
- As of PR-11 ARGUS acceptance, Developer Spaces live updates are SSE
  based: the stream reuses the detail-route serializer, emits reconnect-friendly
  `developer_space.update` payloads with freshness metadata, supports
  EventSource query-token auth for owner views, and keeps public visitors on
  public-safe event/snapshot/node data.
- As of PR-12 ARGUS acceptance, `/discover/feed` includes
  `developer_space` feed items for public-safe observatories and
  `/discover/search` returns Developer Space hits. The Discover route uses
  public/community Developer Space visibility rules and the public-safe event
  serializer; it does not expose private/unlisted spaces, private events, API
  key hashes, scrubbed event fields, or oversized raw event-summary values.
- As of PR-13 ARGUS acceptance, Developer Space detail/SSE responses include
  linked Station documents through the bounded `developer_space_documents`
  relation. Owner/admin reads include owner-only draft notes; visitor/member
  reads include only links marked public where the linked document is also
  published with `public` visibility. The relation has owner-only RLS policies,
  and the manage console can create methodology, finding, field-log, and note
  templates without adding normal Station Space relation modeling.
- As of PR-14 ARGUS acceptance, `/exports/developer-spaces/:spaceId` creates
  owner-only Developer Space export packages over nodes, events, snapshots,
  usage, and public-safe linked document refs. Developer Space ingestion and
  visitor reads update bounded usage counters, `/developer-spaces/:id/usage`
  exposes owner-only quota/usage status for the manage console, and
  `export_packages` enforces persona-vs-Developer-Space target shape for the
  supported package kinds.
- As of PR-15 ARGUS acceptance, `packages/developer-space-client` provides a
  small TypeScript ingestion client for the existing Developer Space node
  state, event, snapshot, and batch import routes. It is workspace-local,
  server-side-key oriented, documented with curl plus Node examples, and covered
  by `pnpm test:developer-space-client`.
- As of PR-16 ARGUS acceptance, the manage console can edit visual mode and
  bounded per-mode config using the existing `visualisation_type` and
  `visualisation_config` fields. The public observatory applies node limits,
  timeline limits, map zone settings, constellation event-count visibility, and
  timeline snapshot visibility from the normalized config. Public scalar values
  and world-map zone labels are capped for readability, and the manage editor
  uses auto-fit layout constraints at narrow widths.
- As of PR-17 ARGUS acceptance, the billing foundation uses Stripe
  Billing with Checkout Sessions for subscriptions, dashboard Prices for
  pricing identity, verified webhooks before entitlement state changes, and
  server-side entitlement rules for paid Space and Developer Space creation
  limits. Subscription sync rejects active webhook payloads whose Station user
  metadata points at a profile already bound to a different Stripe customer.
  Billing status now returns authoritative tier limits for the web billing page.
- The v2 closeout audit is complete; v3 activation opened a storage-led
  maintenance hardening lane before any new product expansion.
- MIMIR activated v3 with storage, integrity, token-credit, archive job
  reliability, and visibility-safe search hardening lanes. V3 intentionally
  starts with storage quota hardening because storage accounting is cross-cutting
  archive, import, export, and paid entitlement infrastructure.
- Core API route modules no longer import local in-memory mock data. Runtime
  persistence goes through the Supabase client boundary; route tests use
  injected fake Supabase clients for deterministic proof.
- Community route modules resolve the Supabase client at request/helper time so
  test fakes and production bootstrapping stay deterministic.
- Forum thread creation rejects private linked Spaces/personas/documents and
  inherits community/unlisted visibility from linked documents when a link is
  allowed.
- Featured Discover rows are filtered against current item visibility instead
  of trusting curated feed rows blindly.
- API auth routes, controllers, service helpers, `requireAuth`, `optionalAuth`,
  web auth route/session helpers, and permission helpers are now covered by
  `pnpm test:auth`.
- API beta signup deliberately confirms service-role-created email users so it
  can return a session immediately. Revisit before public launch if first login
  should require email confirmation.
- The web shell stores Station API sessions in browser storage and uses a
  non-secret auth cookie only as middleware redirect state.
- As of V3-01 ARGUS acceptance, storage quota behavior has focused test
  coverage for reserve/release RPC semantics, `/storage/me` owner response
  shape, tier limits, upload preflight, persona-file register/delete/rollback,
  chat import rollback, and archive memory rollback.
- As of V3-02 ARGUS acceptance, integrity routes have focused coverage
  for owner-only start/answer/summary/complete/output-review flows, periodic
  question-bank selection, deterministic non-provider fallback behavior, public
  persona preflight, accepted-output writes into canon/preference context, and
  continuity-publication privacy/provenance boundaries.
- As of V3-03 ARGUS acceptance, token-credit accounting has focused coverage
  for LLM spend recording, exhausted-credit rejection, soft-cap Canon review
  behavior, top-up checkout metadata, verified top-up grant idempotency,
  unsupported/zero top-up metadata rejection, server-pack metadata mismatch
  rejection, tier-ineligible top-up rejection, admin-only monthly reset, and
  transaction-history serialization.
- As of V3-04 ARGUS acceptance, archive/export reliability has focused coverage
  for import job completion/failure status, owner-scoped job reads, failed
  archive ingest error persistence, failed persona export package visibility to
  the owner, nested discussion/moderation export source failure marking, and
  owner-only exclusion for other users.
- As of V3-05 ARGUS acceptance, Discover search keeps public/community search
  over published documents, Spaces, forum threads, personas, and Developer
  Spaces, and adds a separate authenticated private-results bucket for
  owner-scoped documents, continuity, runtime memory/canon, and archive sources.
  The coverage now includes symmetric owner checks so each authenticated owner
  sees only their own private matches.
- As of Lane 0 DAEDALUS convergence, the Railway fork includes upstream AI
  observability, memory lifecycle, persona lifecycle, Developer Space live
  widgets, and community trust/voting schema and route surfaces, pending ARGUS
  review. The migrations are not applied to staging until Lane 1 external
  Supabase credentials and target are confirmed.
- As of BE-03 DAEDALUS implementation, Developer Spaces carry a typed
  `provider_policy` posture. Owner-only policy evaluation can fail closed before
  any provider call, and AI observability records only sanitized decision
  metadata instead of provider secrets, prompt payloads, or private archive
  excerpts.
- As of BE-04 DAEDALUS implementation, generated `memory_items.embedding` rows
  carry active retrieval metadata. The active search/index contract is moving to
  Gemini `gemini-embedding-2` over Supabase pgvector `vector(1536)`, with OpenAI
  retained as fallback/rollback. Provider/dimension changes still require an
  explicit migration/reindex lane.
- MIMIR's staging proof update is accepted by ARGUS, 2026-06-09, as setup
  proof only. Public web/API health remain OK, public `/health/deployment` is
  non-secret and accurately reports `ready: false`, and database, migration
  object proof, private `persona-files` storage, and NVIDIA platform chat are
  true. Remaining proof/waiver blockers are Supabase Auth redirects/password
  reset route, embedding profile proof, Stripe test resources, cache provider,
  Cloudflare account/index decision, replay account/data, and any hostile
  vector/RPC smoke MIMIR wants before full replay. Do not begin replay-driven
  optimization unless MIMIR/Marty explicitly waive the remaining blockers or
  assign DAEDALUS to prove them.
- DAEDALUS's staging replay seed helper is accepted by ARGUS after owner-reuse
  hardening, 2026-06-11, as setup-only code. ARGUS found and patched an
  account-safety issue: an existing `STATION_REPLAY_OWNER_USERNAME` can no
  longer have auth credentials or tier updated unless `STATION_REPLAY_OWNER_ID`
  explicitly matches that profile. The helper validation path remains green
  (`node --check`, `--help`, `pnpm replay:seed:validate`, and
  `git diff --check`). Live seeding has still not been executed; MIMIR should
  decide whether DAEDALUS runs it against staging with a local corpus and then
  wakes ARGUS with sanitized seed results.
- MIMIR live seed decision, 2026-06-11: DAEDALUS should run the accepted
  helper against staging after preparing missing local-only inputs. Presence
  checks found Supabase URL/service-role and Gemini key available locally, but
  replay owner env keys and `docs/ops/staging-replay-corpus.local.json` are
  absent. DAEDALUS should create a synthetic ignored corpus, use local-only
  replay owner credentials without printing/committing them, run
  `pnpm replay:seed:staging`, capture sanitized counts/slugs/profile metadata
  only, and wake ARGUS with seed results before retrieval measurement resumes.
- DAEDALUS live seed result, 2026-06-11: `pnpm replay:seed:staging` ran against
  staging with ignored synthetic local corpus data and local-only replay owner
  env values. Sanitized output reported mode `seeded`, run label
  `staging-replay-alpha`, Gemini `gemini-embedding-2` metadata for
  `memory_items_embedding_1536`, and counts for one owner profile, one persona,
  one archived conversation/transcript, four memory items, one continuity
  record, one Space/document/thread/comment, one Developer Space node/event/
  snapshot, and one persona export package. Credentials, tokens, raw archive
  text, prompt bodies, and private excerpts were not printed or committed.
  ARGUS should review seeded state before retrieval measurement resumes.
- ARGUS accepted the live staging replay seed state, 2026-06-11: owner scoping,
  bounded counts, slug ownership, Gemini `station_free_1536` memory metadata,
  public-safe Developer Space payload keys, and committed-secret/corpus hygiene
  passed hostile review. The seed is accepted as setup evidence only; it does
  not prove retrieval quality. MIMIR should now decide whether DAEDALUS opens the
  populated retrieval measurement lane.
- MIMIR opened populated retrieval measurement, 2026-06-11: DAEDALUS should use
  the accepted seeded corpus and ignored local replay owner credentials to sign
  in through the deployed API, run archive-retrieval and context-preview checks
  against the seeded anchors, cover anonymous/invalid-or-non-owner/wrong-persona
  hostile paths plus excluded-memory behavior where available, capture only
  statuses, modes, counts, latency, active embedding profile/provider/model, and
  human relevance ratings, and wake ARGUS with sanitized results before any
  retrieval quality claim is accepted.
- DAEDALUS populated retrieval measurement, 2026-06-11: signed in through the
  deployed API using ignored local replay owner credentials, without printing
  tokens or credentials. Deployment health was `ready:true` with
  `station_free_1536`, provider `gemini`, model `gemini-embedding-2`, and
  embeddings configured. Owner archive probes for the two synthetic anchors
  returned HTTP 200, mode `vector`, two authorized archive chunks, zero skipped
  sources, and high human relevance ratings. Context preview returned HTTP 200
  with counts canon 0, memory 1, integrity 1, archive 2; the rejected-memory
  negative control was absent. Hostile probes blocked anonymous and invalid
  token access with HTTP 401 and wrong-persona access with HTTP 404. No response
  bodies, prompt bodies, excerpts, tokens, cookies, credentials, owner ids, or
  persona ids were committed. A true other-owner token was not available.
  ARGUS should review before this becomes an accepted retrieval-quality claim.
- DAEDALUS staged replay E2E walkthrough, 2026-06-11: ran live second-owner
  preflight first via throwaway deployed signup; second-owner archive retrieval
  returned HTTP 403 and zero private rows. Continued through deployed health,
  replay owner sign-in/persona lookup, vector archive retrieval for both seeded
  anchors, context preview with rejected control absent, public Space/document/
  discussion, Developer Space public detail/SSE stream/owner usage, persona
  export list/readback, billing status, and observability metadata. All probed
  routes returned expected 200/201/403 statuses; Developer Space usage showed
  nodes 1, events 1, snapshots 1, public reads 4, exports 0, warning `ok`;
  billing showed tier `canon`, subscription `inactive`, no customer present;
  observability trace count was 0. No bodies, excerpts, prompts, manifests,
  raw snapshots, tokens, credentials, cookies, owner ids, persona ids, thread
  ids, export ids, or raw corpus text were committed. ARGUS should review before
  accepting the staged replay walkthrough.
- ARGUS accepted the staged replay E2E walkthrough, 2026-06-11: live
  second-owner archive retrieval returned HTTP 403 with zero private rows;
  replay retrieval/context, public Space/document/discussion, Developer Space
  public detail/SSE/usage, owner export readback, billing status, and
  observability metadata all returned expected sanitized statuses/counts.
  `test:developer-spaces`, `test:exports`, and `test:billing` also passed.
  Product friction remains open: this is API evidence, not browser/mobile UX;
  export is still manifest readback, not a portable bundle; billing is
  status-only with inactive subscription/no customer; observability traces were
  zero; Discover/onboarding/partner-grade polish remain future lanes.
- MIMIR closed the current backend/API replay readiness lane as accepted
  staging evidence and opened a narrow ARIADNE browser/mobile walkthrough,
  2026-06-11. ARIADNE should use
  `docs/ops/STAGING_BROWSER_UX_WALKTHROUGH.md` to review the deployed web app
  against the replay owner/corpus, separate product friction from true staging
  blockers, avoid committing private screenshots or secrets, and wake MIMIR
  with a browser-readiness verdict.
- ARGUS accepted the populated replay measurement, 2026-06-11: live owner
  archive retrieval returned vector-mode seeded archive matches with zero
  skipped sources and high human relevance ratings, context preview included the
  expected archive/memory/integrity counts, rejected memory stayed absent, and
  anonymous/invalid/wrong-persona live hostile probes blocked. Focused
  `test:conversation-archive` and `test:persona-context` runs also passed,
  including automated other-owner privacy coverage. A true live second-owner
  token probe remains a later hardening follow-up, not a blocker for this seeded
  retrieval-quality acceptance.
- MIMIR opened the broader staged replay E2E walkthrough, 2026-06-11: DAEDALUS
  should run the live second-owner probe first and stop if it leaks private
  rows; if it passes, continue through deployed health, replay owner sign-in,
  seeded persona/archive/context-preview, public Space/document/discussion,
  Developer Space observatory, owner export manifest readback, billing/status or
  Stripe test-mode smoke where config allows, and observability metadata. Wake
  ARGUS with sanitized statuses/counts/modes/timings/public labels only, and
  flag UX/product friction for ARIADNE rather than calling it backend failure.
- ARIADNE browser/mobile staging walkthrough is complete, 2026-06-11:
  `docs/roadmap/STAGING_BROWSER_UX_WALKTHROUGH_ARIADNE.md` records a live
  Chrome walkthrough of the deployed web app at desktop and mobile widths using
  sanitized route/layout evidence only. Verdict: no true browser/mobile staging
  blocker was found for the seeded replay flow. Product friction remains around
  the static `/studio/export` workspace overpromising live downloadable/background
  export behavior, status-only billing, empty observability traces, thin
  Developer Space storytelling, future Discover/onboarding polish, and a later
  accessibility check for the Studio mobile menu label.
- MIMIR opened UX-EXPORT-01, 2026-06-11: DAEDALUS should make a narrow
  copy/behavior patch to `/studio/export` so the page no longer implies live
  downloadable bundles, expiring downloads, or background jobs. It should point
  users toward the currently accepted per-persona export manifest/status
  readback path, stay frontend-only unless a real bug appears, and wake ARIADNE
  for experience review after validation.
- UX-EXPORT-01 ARIADNE experience review is complete, 2026-06-11: ARIADNE
  accepts the `/studio/export` copy/behavior patch as staging-demo clear enough.
  The page now names itself as an export planning preview, removes the old
  generate/download/expiry/background-job claims, and points users toward the
  live owner-only per-persona JSON/Markdown manifest/status readback path.
  Local desktop Chrome and mobile-width HTML layout checks found no
  document-level horizontal overflow and no old export-package claims. Product
  caveat: the preview checkboxes remain illustrative controls, not saved export
  settings; a future global bundle lane should either wire real behavior or make
  the controls visibly read-only.
- MIMIR closes the current seeded staging replay readiness loop, 2026-06-11:
  the accepted evidence now covers deployed API replay, populated Gemini
  retrieval quality, browser/mobile UX walkthrough, and the UX-EXPORT-01 export
  copy/behavior fix. This is ready enough for a human staging walkthrough.
  Remaining friction is future product/demo polish: portable export bundles,
  active Stripe customer/subscription flows, observability trace usefulness,
  richer Developer Space storytelling, Discover/onboarding polish, and Studio
  mobile menu accessibility.
- MIMIR opens STRIPE-REPLAY-01, 2026-06-12: DAEDALUS should try to turn the
  current status-only billing evidence into a bounded active Stripe test-mode
  replay smoke. Scope is narrow: inspect the existing PR-17 billing routes,
  use configured Stripe test resources without printing secret values, prove
  Checkout/customer/subscription/webhook behavior where the deployed config
  allows it, and only patch code/docs/tests if a real replay blocker appears.
  If DAEDALUS can collect or implement evidence, wake ARGUS for hostile review;
  if the lane is blocked by an external Stripe Dashboard/CLI/manual checkout
  step, wake MIMIR with the exact missing action instead of sleeping silently.
- DAEDALUS STRIPE-REPLAY-01 evidence, 2026-06-12: inspected the existing
  PR-17 billing routes, service, tests, raw webhook app wiring, Stripe setup
  doc, config Price mapping, and billing UI. No code blocker appeared.
  Local focused validation passed with the pinned runner: `test:billing`
  (4 tests), `test:health` (8 tests), and `--filter @station/api build`.
  A sanitized deployed replay smoke against the Railway API proved
  `/health/deployment` `ready:true` with Stripe billing/prices configured,
  replay owner `/auth/signin`, `/billing/me`, `/billing/checkout`,
  `/billing/portal`, and `/billing/webhook`. Checkout returned a hosted
  Checkout URL host only, `/billing/me` showed customer binding changed from
  absent to present, Portal returned a hosted portal URL host only, an invalid
  webhook signature returned HTTP 400, and a locally signed no-op webhook
  returned HTTP 200 with the probe type. The owner's subscription state stayed
  `canon`/`inactive` before and after because DAEDALUS did not complete a
  hosted Checkout payment or send a mutating subscription webhook. No Stripe
  secrets, Price IDs, customer IDs, owner IDs, checkout/portal URLs, webhook
  payload bodies, response bodies, tokens, cookies, or replay credentials were
  printed or committed. ARGUS should review before this is accepted as active
  Stripe replay evidence.
- ARGUS accepted STRIPE-REPLAY-01, 2026-06-12: focused review found no code
  blocker and no leaked live Stripe/replay values. The deployed smoke proves
  active Stripe test-mode configuration, Checkout and Portal session creation,
  customer/profile binding through `/billing/me`, invalid webhook signature
  rejection, and signed no-op webhook acceptance. `test:billing`, `test:health`,
  and `@station/api` build also passed under the pinned runner. The remaining
  caveat is explicit: this does not prove paid subscription activation because
  no hosted Checkout payment or mutating subscription webhook was completed.
- MIMIR closes STRIPE-REPLAY-01 for the current staging target, 2026-06-12:
  active Stripe test-mode configuration, Checkout/Portal creation,
  customer/profile binding, billing status readback, and webhook verification
  are accepted as enough replay evidence. Hosted payment/subscription
  activation stays a deliberate manual follow-up, not a reason to stall product
  work.
- MIMIR opens OBS-REPLAY-01, 2026-06-12: DAEDALUS should turn observability from
  route-available-but-empty into useful replay evidence. Scope is narrow:
  inspect the existing AI trace writers and `/observability` readers, identify
  one staged replay action that should create sanitized trace metadata, run or
  patch the smallest path needed to produce non-empty trace evidence, and keep
  prompts, private excerpts, raw response bodies, owner IDs, trace IDs, tokens,
  and provider secrets out of committed docs. Wake ARGUS for hostile privacy
  review when evidence or a fix is ready; wake MIMIR instead if the only blocker
  is an external/manual action.
- DAEDALUS OBS-REPLAY-01 evidence, 2026-06-12: inspected the AI trace service,
  `/observability` readers, migration `020_ai_observability.sql`, conversation
  and integrity trace writers, and the Developer Space provider-policy trace
  writer. No code blocker appeared. A sanitized deployed replay smoke used the
  existing replay owner and owner Developer Space to call
  `/developer-spaces/:id/provider-policy/evaluate` with public-synthetic
  context. `/observability/summary` moved from trace count 0 to 1, and
  `/observability/traces?limit=5` moved from empty to one completed `system`
  trace with metadata domain `developer_space`. Tokens/cost stayed 0 because
  the probe intentionally exercised a policy/tool trace, not an LLM call.
  Focused local validation passed: `test:replay-readiness`,
  `test:developer-spaces`, and `--filter @station/api build`. No prompts,
  private excerpts, raw response bodies, owner IDs, trace IDs, tokens, cookies,
  provider secrets, API keys, or raw corpus text were printed or committed.
  ARGUS should review before this is accepted as useful observability replay
  evidence.
- ARGUS accepted OBS-REPLAY-01, 2026-06-12: the staged replay trace path now has
  non-empty owner-scoped evidence. Developer Space provider-policy evaluation
  writes a completed `system`/`tool_call` trace with sanitized policy metadata,
  and `/observability/summary` plus `/observability/traces` show useful
  non-empty replay data without committed secrets, prompts, private excerpts,
  raw bodies, trace IDs, owner IDs, or corpus text. `test:replay-readiness`,
  `test:developer-spaces`, and `@station/api` build passed. Caveat: this proves
  policy/tool trace usefulness only; non-zero-token LLM trace evidence remains a
  separate optional replay lane.
- MIMIR closes OBS-REPLAY-01 for the current staging target, 2026-06-12:
  non-empty owner-scoped observability evidence is now accepted for replay. The
  non-zero-token LLM trace proof remains optional and should open only if it is
  needed for a specific demo or provider-cost review.
- MIMIR opens DEVSPACE-STORY-01, 2026-06-12: DAEDALUS should make the staged
  Developer Space public observatory easier for a non-technical visitor to
  understand using existing data and routes. Scope is narrow: inspect
  `/developer-spaces/[slug]`, the public-safe API payload, linked methodology/
  finding/field-log documents, live event/node/snapshot panels, and the current
  seeded replay content. Prefer cheap copy/layout/data-label improvements over
  new schema or visualization framework work. Keep owner/private operator data,
  API keys, raw ingestion payloads, prompts, private excerpts, trace IDs, owner
  IDs, tokens, and secrets out of public UI and committed evidence. Wake
  ARIADNE for experience review after any patch, or wake MIMIR if the right move
  is a data/seed change instead of code.
- DAEDALUS DEVSPACE-STORY-01 patch is ready for ARIADNE review, 2026-06-12:
  the public Developer Space observatory now explains the visible evidence with
  existing public-safe detail data, labels seeded replay facts as tracked
  nodes/public signals/latest signal, and clarifies that absent project notes
  mean live signals and the latest snapshot are the current public evidence. No
  API, schema, seed, owner-only raw view, or Developer Spaces feature behavior
  changed. Focused validation passed with `test:developer-spaces`,
  `--filter @station/web typecheck`, `--filter @station/web lint` with known
  warnings only, and `git diff --check` with CRLF normalization warnings only.
  ARIADNE should review visitor comprehension, mobile/layout feel, and the
  public/private boundary before MIMIR accepts the lane.
- DEVSPACE-STORY-01 ARIADNE experience review is complete, 2026-06-12:
  ARIADNE accepts the public Developer Space storytelling patch. The
  observatory now gives visitors a first-screen explanation of what evidence is
  visible, replaces generic dashboard labels with tracked nodes/public
  signals/latest signal/most active node, and explains nodes, signals,
  snapshots, and the no-public-notes state without adding schema, API, seed, or
  owner-console behavior. Code review confirmed the new story derives only from
  the public-safe `DeveloperSpaceDetail` response; existing API tests continue
  to prove public reads exclude owner-only linked documents, private events, raw
  payload fields, API-key hashes, and sensitive-shaped data. Local desktop and
  375px Chrome checks against a mocked public-safe Developer Space found no
  document-level horizontal overflow and no raw/owner-only controls or labels in
  the visitor view. Caveat: the local mock did not implement the live WebSocket
  endpoint, so it was not used as live-transport status evidence.
- MIMIR closes DEVSPACE-STORY-01 for the current staging target, 2026-06-12:
  Developer Space storytelling is now good enough for a human staging walkthrough.
- MIMIR opens DISCOVER-ONBOARD-01, 2026-06-12: DAEDALUS should inspect the public
  front door, `/discover`, and any existing onboarding/first-entry surfaces for
  the smallest Station-native IA/copy polish that helps a new visitor understand
  where to begin. Scope is narrow: reuse existing routes/components/data; prefer
  copy, empty-state, provenance-label, and first-action clarity improvements
  over new schema, auth flows, Assistant behavior, broad Discover rebuilds, or
  marketing-page work. Preserve public/community/private visibility boundaries.
  If DAEDALUS patches public Discover/community surfaces, wake ARIADNE for tone
  and visitor comprehension and ARGUS if visibility-bearing behavior changes. If
  the right move is planning/data rather than code, wake MIMIR with the exact
  next action.
- DAEDALUS DISCOVER-ONBOARD-01 patch is ready for ARIADNE review, 2026-06-12:
  the Discover/root front door now gives visitors clearer first actions for
  public Spaces, live Developer Space observatories, forums, and private Studio
  signup/return; search copy frames the unauthenticated surface as public
  Station search; and empty states guide anonymous visitors to signup/forums
  instead of implying a direct protected creation flow. No API calls, search
  result buckets, visibility filters, auth behavior, schema, or data changed.
  Focused validation passed with `--filter @station/web typecheck`,
  `--filter @station/web lint` with known warnings only, and `test:community`.
  ARIADNE should review visitor comprehension, tone, and mobile/layout feel.
- DISCOVER-ONBOARD-01 ARIADNE review found UX route/copy blockers,
  2026-06-12: the tone and first-action direction are Station-fit, but the
  public-space actions still point at `/space`, which is intentionally the
  protected My Spaces route. The auth route guard tests encode `/space` as
  protected while `/space/:slug` remains public. The new public-search framing
  also makes an existing mismatch more visible: persona search results still
  link to `/studio/personas/:id`, a protected Studio route. DAEDALUS should
  tighten the Discover actions/results so visitor-facing copy does not promise
  public browsing while linking anonymous users into protected Studio/My Space
  surfaces. No schema/API change is implied.
- DAEDALUS DISCOVER-ONBOARD-01 follow-up patch is ready for ARIADNE review,
  2026-06-12: public Discover actions now point to the in-page public feed,
  `/developer-spaces`, or `/forums` rather than protected `/space`; anonymous
  search no longer renders persona results that only have protected Studio
  destinations; and logged-in users still keep persona search access. No API
  buckets, visibility filters, auth behavior, schema, Assistant behavior, or
  feed ranking changed. Focused validation passed with
  `--filter @station/web typecheck`, `--filter @station/web lint` with known
  warnings only, `test:community`, and the auth-route guard test that marks
  `/space` protected while `/space/:slug` remains public.
- DISCOVER-ONBOARD-01 ARIADNE experience review is complete, 2026-06-12:
  ARIADNE accepts the Discover/root first-step polish after DAEDALUS's
  protected-route follow-up. The public front door now starts with public work,
  live project observatories, forums, and optional Studio signup without
  sending anonymous visitors to protected My Space or Studio persona routes.
  Anonymous search still uses the same API response, but the UI hides persona
  results until a user is signed in because their current destination is
  protected Studio. Local desktop and 375px Chrome checks against a mocked
  public Discover API found no document-level horizontal overflow, preserved the
  public feed anchor, and found no anonymous `/space` or `/studio/personas/*`
  links in the visitor-facing actions/search results. No product-experience
  follow-up is required for this lane.
- MIMIR closes DISCOVER-ONBOARD-01 for the current staging target, 2026-06-12:
  public first-step IA/copy is now good enough for a human staging walkthrough.
- MIMIR opens STUDIO-A11Y-01, 2026-06-12: DAEDALUS should verify the Studio
  mobile navigation disclosure has an explicit accessible name and patch only
  the narrowest UI/test surface if it does not. Scope is limited to the Studio
  mobile menu/disclosure semantics and any focused test that protects the fix.
  Do not alter Studio routing, auth/session behavior, persona/archive data,
  desktop layout, or broader navigation IA. Wake ARIADNE for mobile/UX review
  after a patch or with evidence if no patch is required.
- DAEDALUS STUDIO-A11Y-01 patch is ready for ARIADNE review, 2026-06-12: the
  Studio mobile `<summary>` disclosure now has the explicit accessible name
  `Toggle Studio mobile navigation`, protected by a focused Studio navigation
  helper test. No Studio routing, auth/session behavior, persona/archive data,
  desktop layout, or broader navigation IA changed. Focused validation passed
  with the Studio navigation helper test, `--filter @station/web typecheck`, and
  `--filter @station/web lint` with known warnings only.
- STUDIO-A11Y-01 ARIADNE experience review is complete, 2026-06-12: ARIADNE
  accepts the Studio mobile navigation disclosure label. The accessible name
  describes the action, the visible summary still anchors the user in Studio /
  private workbench, and the patch does not alter Studio routing, auth/session
  behavior, persona/archive data, desktop layout, or broader navigation IA. No
  product-experience follow-up is required.
- MIMIR closes STUDIO-A11Y-01 for the current staging target, 2026-06-12:
  Studio mobile navigation accessibility is now good enough for a human staging
  walkthrough.
- MIMIR opens EXPORT-BUNDLE-01, 2026-06-12: DAEDALUS should inspect existing
  persona and Developer Space export packages, manifest readback routes, and the
  `/studio/export` planning surface, then implement or scope the smallest
  portable export-bundle step that fits the current architecture. Start with
  owner-only JSON/Markdown package download/readback semantics before any PDF,
  binary archive, background worker, retry UI, or global workspace export.
  Preserve owner scoping, private-data trust notes, manifest integrity, and
  exclusion of API keys/key hashes. Wake ARGUS for hostile privacy/export review
  after code or evidence is ready, or wake MIMIR if the correct first move is a
  product decision rather than implementation.
- DAEDALUS EXPORT-BUNDLE-01 patch is ready for ARGUS review, 2026-06-12: export
  packages now have owner-only `GET /exports/:id/bundle` readback for completed
  packages. The bundle is a JSON response containing `README.md`,
  `manifest.json`, `manifest.md`, byte counts, SHA-256 hashes, existing package
  metadata, and an owner-only privacy note. Persona export UI can open the
  portable bundle and display file/hash metadata; `/studio/export` now names the
  live per-persona JSON/Markdown bundle path while keeping full workspace
  bundles preview-only. No PDF, binary archive, background worker, retry UI,
  global workspace export, schema migration, or export ranking behavior was
  added. Focused validation passed with `test:exports`, `test:studio-ui`,
  `--filter @station/api build`, `--filter @station/types build`,
  `--filter @station/web typecheck`, and scoped `git diff --check`. ARGUS should
  hostile-review owner scoping, failed-package blocking, manifest integrity, and
  API key/key-hash exclusion.
- ARGUS accepted EXPORT-BUNDLE-01, 2026-06-12: `/exports/:id/bundle` is
  authenticated, owner-scoped, and limited to completed export packages. Persona
  and Developer Space bundles return README, `manifest.json`, `manifest.md`,
  byte counts, SHA-256 hashes, package metadata, and an owner-only privacy note.
  Focused tests prove other-owner bundle reads return 404, failed packages
  return 409, private Developer Space linked drafts and API key hashes stay out
  of exported manifests/bundles, and the Studio copy stays honest about
  per-persona JSON/Markdown readback versus future global workspace bundles.
  This is not a PDF/binary archive, background job system, or full workspace
  export.
- MIMIR closes EXPORT-BUNDLE-01 for the current staging target, 2026-06-12:
  portable owner-only JSON/Markdown bundle readback is accepted. PDF/binary
  archive, background-job, retry workflow, and full workspace export remain
  future lanes.
- MIMIR opens STRIPE-ACTIVATION-01, 2026-06-12: DAEDALUS should try to prove
  the remaining paid subscription activation gap from STRIPE-REPLAY-01 without
  widening billing scope. Inspect the existing Checkout/webhook flow, staged
  Stripe test configuration, and replay owner billing state. If a safe staged
  proof can be run, capture only sanitized route/status/tier/subscription
  labels and wake ARGUS for billing/entitlement review. If proof requires a
  hosted Checkout payment, Stripe Dashboard action, Stripe CLI forwarding, or a
  manually generated mutating webhook, do not improvise: wake MIMIR with the
  exact external action needed. Do not print or commit Stripe secrets, checkout
  URLs, customer IDs, subscription IDs, webhook payload bodies, owner IDs, tokens,
  cookies, or replay credentials.
- DAEDALUS STRIPE-ACTIVATION-01 is blocked on an external Stripe action,
  2026-06-12: inspection confirms the existing flow mutates profile tier only
  after a verified Stripe subscription webhook or verified
  `checkout.session.completed` retrieval of a real subscription. The deployed
  Railway API reports `ready:true` with Stripe billing and prices configured;
  replay owner sign-in and `/billing/me` returned HTTP 200 with tier `canon`,
  subscription `inactive`, a customer present, and no subscription present. A
  sanitized Stripe test API lookup for that customer returned zero subscriptions
  and zero active/trialing Station-price matches. Stripe CLI is not installed in
  this shell. DAEDALUS did not fabricate a mutating webhook or directly create a
  subscription outside Checkout. Exact next action for MIMIR/Marty: complete a
  hosted Stripe test-mode Checkout payment for the replay owner, or provide a
  real Stripe Dashboard/CLI-delivered signed subscription event for the replay
  owner; then wake DAEDALUS or ARGUS to verify `/billing/me` tier/subscription
  activation with sanitized labels only.
- MIMIR leaves STRIPE-ACTIVATION-01 externally blocked and opens LLM-TRACE-01,
  2026-06-12: DAEDALUS should try to prove one non-zero-token LLM observability
  path using existing conversation or integrity trace writers without widening
  provider scope. Use the current staged/dev provider configuration only if a
  safe, low-cost test call is already available. Capture only sanitized
  route/status/source/provider/model/token/count/duration/cost labels; do not
  commit prompts, completions, private archive excerpts, raw response bodies,
  owner IDs, trace IDs, tokens, cookies, API keys, replay credentials, or raw
  corpus text. If the proof requires a provider key change, paid model choice,
  new user-visible prompt, manual replay action, or unsafe private data, wake
  MIMIR with the exact blocker instead of improvising. If evidence is ready,
  wake ARGUS for hostile observability/privacy review.
- DAEDALUS LLM-TRACE-01 is blocked on a MIMIR product/replay decision,
  2026-06-12: replay owner sign-in and auth-protected observability reads work
  against the deployed Railway API, but the current trace window contains only
  one completed `system` trace with zero tokens. There is no existing
  non-zero-token `conversation` or `integrity_session` trace for ARGUS to
  review. Local config has the existing staged platform provider keys, but
  producing the requested proof would require creating a new saved chat or
  integrity-session turn through the product routes. DAEDALUS did not create a
  new user-visible prompt/answer, fabricate a trace, call providers outside the
  existing writers, or commit prompts/completions/private excerpts/raw bodies.
  Exact next action for MIMIR/Marty: explicitly approve one tiny synthetic
  replay-owner conversation or integrity turn using the existing seeded staging
  corpus, or provide an already-created non-zero-token trace to review; then
  wake DAEDALUS to capture sanitized source/status/token/duration/cost labels
  or wake ARGUS if review evidence is already present.
- MIMIR approves the LLM-TRACE-01 synthetic-turn proof, 2026-06-12: DAEDALUS may
  create one tiny replay-owner conversation or integrity turn through existing
  product routes, choosing whichever path is safest and smallest. Use synthetic
  non-private content only. Do not change provider/product behavior, do not
  create a new feature surface, and do not commit prompts, completions, private
  excerpts, raw response bodies, owner IDs, trace IDs, tokens, cookies, API keys,
  replay credentials, or raw corpus text. Evidence should be sanitized to route,
  status, source, provider, model, token count, duration, cost labels, and trace
  count deltas only. Wake ARGUS for hostile observability/privacy review after
  evidence is ready, or wake MIMIR if the provider call fails or would require a
  paid/model/config decision.
- DAEDALUS LLM-TRACE-01 evidence is ready for ARGUS review, 2026-06-12: after
  MIMIR explicitly approved one tiny synthetic replay-owner product turn,
  DAEDALUS used the existing persona chat route and current staged platform
  provider configuration. Auth-protected observability now shows completed
  non-zero-token `conversation` traces. The newest eligible trace is
  `conversation` / `completed` with provider `platform`, model
  `openai/gpt-oss-120b`, `1921` input tokens, `20` output tokens, `1134ms`
  duration, and `0.2001` estimated pence. The event surface is only
  `llm_call` / `Persona chat response` / `completed` with matching
  provider/model/token/duration/cost labels. Caveat for ARGUS: a client-side
  retry/status-capture issue left two completed synthetic conversation traces
  in the current trace window, and a later status-only `curl` probe returned
  HTTP 500 without adding a failed trace. DAEDALUS did not commit prompts,
  completions, private excerpts, raw bodies, owner IDs, trace IDs, tokens,
  cookies, API keys, replay credentials, or raw corpus text.
- ARGUS accepts LLM-TRACE-01 as narrow non-zero-token observability proof,
  2026-06-12: the route/code review confirms `/observability` is authenticated
  and owner-scoped, trace summary/list/detail filter on `owner_user_id`, detail
  events are also owner-scoped, and the persona chat success trace stores
  continuity counts plus provider/model/token/duration/cost labels rather than
  prompts or completions. Focused validation passed. The client-side
  status-capture/retry issue that produced two completed synthetic traces is
  noisy but not a blocker for this proof, because both traces are completed,
  non-zero-token, owner-visible conversation traces and no failed trace was
  introduced. The later status-only HTTP 500 remains a small follow-up only if
  exact one-call replay ergonomics become part of the demo bar.
- MIMIR closes LLM-TRACE-01 and opens STAGING-CLOSEOUT-01, 2026-06-12: the
  accepted staging packet now includes setup/config readiness, migrations
  through `030`, private storage, Supabase Auth redirects, Redis/Upstash and
  Stripe test config readiness, populated Gemini `station_free_1536` retrieval,
  deployed API replay, browser/mobile replay, portable owner-only export bundle
  readback, and narrow non-zero-token observability proof. ARGUS should review
  this closeout truth and make sure the docs do not overclaim active Stripe
  subscription activation, Cloudflare runtime dependency, Redis as memory truth,
  background jobs, full workspace export, or partner-grade demo polish. If
  accepted, wake MIMIR with the closeout verdict and recommend the next
  optimization lane; if stale, wake DAEDALUS with exact doc/proof fixes. Do not
  go quiet without a wakeup.
- ARGUS accepts STAGING-CLOSEOUT-01, 2026-06-12: the closeout docs truthfully
  frame the accepted staging packet without claiming active Stripe subscription
  activation, Cloudflare as a runtime dependency, Redis as canonical memory
  truth, completed background-job infrastructure, full workspace export, or
  partner-grade demo polish. Stripe paid activation stays externally blocked,
  Cloudflare/Redis/background jobs stay future lanes, export stays owner-only
  JSON/Markdown readback, and the LLM two-trace/status-capture caveat is
  correctly treated as hygiene unless exact one-call replay ergonomics become
  demo-critical. Recommended next lane: `REPLAY-OPT-01` focused on chat/context
  quality, latency, and cost from the accepted staging evidence, without adding
  new infrastructure by assumption.
- MIMIR opens REPLAY-OPT-01, 2026-06-12: DAEDALUS should inspect the accepted
  staged evidence and the current chat/context/retrieval implementation, then
  make one narrow optimization or produce a precise blocker if the safe first
  move is not code. Prioritize existing-path chat/context quality, latency, and
  cost: seeded replay retrieval/context timings, the persona chat trace, source
  counts, provider/model/token/cost labels, and the rejected-memory/privacy
  gates. Do not add Redis, Cloudflare, background jobs, full workspace export,
  provider-policy expansion, or Stripe activation work by assumption. Preserve
  owner scoping, lifecycle filters, no private excerpts/prompts in committed
  evidence, and the `station_free_1536` Gemini embedding profile. Wake ARGUS
  for hostile review after a patch or measurement package; wake MIMIR if the
  next safe step requires a product/provider/infrastructure decision. Do not go
  quiet without a wakeup.
- DAEDALUS REPLAY-OPT-01 patch is ready for ARGUS review, 2026-06-12: the
  existing memory vector search path now defensively re-authorizes RPC result
  IDs against `owner_user_id`, `persona_id`, non-archive memory rows, and
  injectable lifecycle state before those rows can enter chat runtime context.
  This preserves the current Gemini `station_free_1536` vector/RPC contract
  while making replay quality/privacy less dependent on the RPC implementation
  or test doubles returning already-perfect rows. The focused vector test now
  makes the RPC return active, rejected, archive-backed, and other-owner memory
  candidates and proves only the active owner generic memory reaches the result.
  No provider behavior, Redis, Cloudflare, background jobs, Stripe activation,
  prompts, completions, private excerpts, owner IDs, persona IDs, trace IDs,
  tokens, cookies, API keys, replay credentials, or raw corpus text were added
  to committed evidence. Focused validation passed with the retrieval metadata
  test, `@station/ai` build, `test:persona-context`, `test:conversation-archive`,
  `test:replay-readiness`, and `test:health`.
- ARGUS accepts REPLAY-OPT-01, 2026-06-12: current persona runtime and
  context-preview callers pass `ownerUserId`, and the vector path now performs a
  second `memory_items` read scoped to owner, persona, candidate IDs,
  non-archive rows, and injectable lifecycle state before returning memory
  candidates. The hostile review found no owner-scope, rejected-memory, or
  archive/generic-memory bypass in the current call path. The extra read is
  accepted as defensive privacy/quality hardening, not latency optimization.
  Boundary: future no-owner/public persona callers must use a separate
  public-safe path or pass owner scope; this private-memory vector filter is not
  proof of a public memory surface.
- MIMIR closes REPLAY-OPT-01 and opens REPLAY-OPT-02, 2026-06-12: the vector
  memory filter is accepted as defensive quality/privacy hardening, not latency
  optimization. DAEDALUS should now run a measured live replay optimization pass
  against the current Railway API after the defensive patch is deployed or
  otherwise confirm the measured commit. Capture sanitized timings, route
  labels, mode/source counts, provider/model/token/cost labels, and pass/fail
  statuses only. Identify the slowest clear existing-path hotspot in chat,
  archive retrieval, or context-preview; make one narrow code optimization only
  if the evidence points to a safe patch. Do not add Redis, Cloudflare,
  background jobs, broader export infrastructure, provider-policy expansion, or
  Stripe activation by assumption. Wake ARGUS with the measured package or
  patch; wake MIMIR if the only credible improvement requires an
  infrastructure/provider/product decision. Do not go quiet without a wakeup.
- DAEDALUS REPLAY-OPT-02 patch is ready for ARGUS review, 2026-06-12: live
  non-mutating Railway probes against the current API measured `ready:true`,
  signin `2579ms`, personas `1163ms`, context-preview `2317ms`,
  archive-retrieval `1901ms`, observability summary `820ms`, and trace list
  `810ms`. The relevant context-preview result returned counts `memory:1`,
  `integrity:1`, `archive:2`, source types `memory/integrity/archive`, and no
  rejected negative-control text; archive retrieval used `vector` mode,
  searched `2`, returned `1`, skipped `0`, source type
  `archived_chat_transcript`, and no rejected negative-control text. Recent
  observability still shows the accepted two completed conversation traces at
  `1921` input / `20` output tokens with `0.2001` estimated pence each. The
  deployed health route does not expose a Git SHA, so DAEDALUS could not prove
  Railway was serving commit `8e94ae8`; this is a measurement caveat, not hidden
  evidence. The identified existing-path hotspot was duplicate query embedding
  work inside runtime context assembly: generic memory search and private
  archive retrieval embedded the same user query separately. The patch shares
  one query embedding across both vector paths, preserves keyword fallback on
  embedding failure, leaves standalone memory/archive retrieval behavior intact,
  and keeps the `station_free_1536` Gemini profile/RPC contract. Focused tests
  prove context assembly now uses one embedding call while still calling both
  vector RPCs. No Redis, Cloudflare, background jobs, provider-policy changes,
  Stripe activation, prompts, completions, private excerpts, raw corpus text,
  owner IDs, persona IDs, trace IDs, tokens, cookies, API keys, replay
  credentials, or raw response bodies were committed.
- ARGUS accepts REPLAY-OPT-02 after a small review patch, 2026-06-12: the shared
  embedding optimization is sound for the current private runtime path and keeps
  owner/lifecycle/archive boundaries intact. ARGUS adjusted context assembly so
  the shared embedding starts once but independent canon, owner-memory,
  integrity, and preference reads are not blocked behind it. Memory and archive
  vector retrieval still wait for the same embedding promise, still fall back to
  keyword mode on embedding failure, and still use the active
  `station_free_1536` RPC contract. The live Railway timing evidence is useful
  baseline evidence, but because `/health/deployment` does not expose a commit
  SHA, post-deploy measurement should be treated as a MIMIR/demo decision rather
  than a code-acceptance blocker for this patch.
- MIMIR closes REPLAY-OPT-02 and opens REPLAY-OPT-03, 2026-06-12: DAEDALUS
  should add a non-secret deployment identity block to `/health/deployment` so
  future online replay measurements can be tied to the served commit. Use
  Railway-provided env vars when present, including `RAILWAY_GIT_COMMIT_SHA`,
  `RAILWAY_GIT_BRANCH`, `RAILWAY_GIT_REPO_OWNER`, `RAILWAY_GIT_REPO_NAME`,
  `RAILWAY_DEPLOYMENT_ID`, `RAILWAY_SERVICE_NAME`, and
  `RAILWAY_ENVIRONMENT_NAME`; keep values nullable when absent. Do not expose
  commit messages, authors, secrets, full env dumps, service variables, tokens,
  keys, IDs from replay data, or private payloads. Add focused health tests and
  no-secret assertions, then wake ARGUS. After ARGUS accepts and Railway serves
  the new field, post-deploy timing can be treated as code-tied evidence.
- DAEDALUS REPLAY-OPT-03 patch is ready for ARGUS review, 2026-06-12:
  `/health/deployment` now returns a non-blocking `deploymentIdentity` object
  with nullable Railway identity fields: `railwayGitCommitSha`,
  `railwayGitBranch`, `railwayGitRepoOwner`, `railwayGitRepoName`,
  `railwayDeploymentId`, `railwayServiceName`, and
  `railwayEnvironmentName`. Missing or blank local/dev values return `null`,
  and the identity block is not part of readiness gating. Focused health tests
  prove populated and nullable identity behavior plus no-secret assertions.
  DAEDALUS also replaced `Object.hasOwn` in source retrieval helpers with a
  tsconfig-compatible `hasOwnProperty.call` helper after API typecheck caught
  the earlier REPLAY-OPT-02 source compatibility issue. Focused validation
  passed with `test:health`, `@station/api typecheck`, the retrieval metadata
  test, and scoped `git diff --check`.
- ARGUS accepts REPLAY-OPT-03, 2026-06-12: `deploymentIdentity` is limited to
  explicit Railway system identity labels, returns `null` for missing or blank
  local/dev values, and does not participate in `ready` gating. Review found no
  commit messages, authors, env dumps, extra service variables, secrets, tokens,
  keys, replay IDs, private payloads, prompts, completions, cookies, or
  credentials in the response shape. The `Object.hasOwn` compatibility repair is
  also accepted after API typecheck and retrieval metadata tests.
- MIMIR closes REPLAY-OPT-03 and opens REPLAY-OPT-04, 2026-06-12: DAEDALUS
  should run the code-tied post-deploy timing pass once Railway serves
  `deploymentIdentity`. First confirm the reported Git SHA is at or after the
  deployment-identity code patch `5d6f557`, then rerun the same sanitized timing
  probes from REPLAY-OPT-02. Capture reported deployment identity, route labels,
  timings, mode/source counts, provider/model/token/cost labels, and pass/fail
  statuses only. Do not commit tokens, cookies, credentials, replay owner IDs,
  persona IDs, trace IDs, private excerpts, prompts, completions, raw response
  bodies, or corpus text. Wake ARGUS with the measurement package, or wake MIMIR
  if Railway has not deployed the identity field after a reasonable wait.
- DAEDALUS REPLAY-OPT-04 measurement package is ready for ARGUS review,
  2026-06-12: Railway is serving Git SHA
  `5d6f5575b9906389f92c9b0f1b8734c8374999ad` on `main` for repo
  `Tex6298/Station`, service `@station/api`, environment `production`, with a
  deployment id present. Sanitized post-deploy timings were `ready:true`,
  health `2621ms`, replay owner sign-in `1243ms`, personas `1090ms`,
  context-preview `2876ms`, archive-retrieval `1994ms`, observability summary
  `794ms`, and trace list `789ms`. Context-preview returned counts `memory:1`,
  `integrity:1`, `archive:2`, source types `memory/integrity/archive`, and no
  rejected negative-control text. Archive retrieval used `vector` mode, searched
  `2`, returned `1`, skipped `0`, source type `archived_chat_transcript`, and
  no rejected negative-control text. Recent observability still shows two
  completed `conversation` traces at `1921` input / `20` output tokens and
  `0.2001` estimated pence each, plus one zero-token `system` trace. This
  single post-deploy sample is commit-tied but does not prove a context-preview
  timing win over the earlier `2317ms` sample; it does prove the identity field
  is live and replay-safe route behavior remains intact without committing
  prompts, completions, private excerpts, raw bodies, owner IDs, persona IDs,
  trace IDs, tokens, cookies, API keys, replay credentials, or raw corpus text.
- ARGUS accepts REPLAY-OPT-04, 2026-06-12: the measurement package is
  code-tied, sanitized, and correctly bounded. It proves Railway is serving the
  deployment identity field and that the replay-safe context-preview,
  archive-retrieval, and observability checks still pass on that served
  deployment. It does not prove a timing improvement, and it should not be used
  as a performance-win claim without a broader before/after sample set.
- MIMIR closes the current replay optimization sequence and opens
  STAGING-DEMO-01 for ARIADNE, 2026-06-12: backend/replay proof is accepted
  enough to stop inventing local blockers. ARIADNE should use the current
  Active Status, staging readiness docs, browser/mobile walkthrough, export
  bundle acceptance, and code-tied replay evidence to produce a staging-demo
  readiness review and route sequence. Treat the old `post-v3-ui-ux-handoff.md`
  inbox item as historical context only. Call out exact remaining demo blockers
  and product friction without re-opening backend infrastructure by assumption:
  Stripe paid activation requires a real hosted Checkout payment or signed
  Stripe test event; the timing sample is code-tied but not a performance-win
  claim; Redis, Cloudflare, background jobs, and full workspace export remain
  future lanes unless the demo evidence demands them. Wake MIMIR with a verdict
  and recommended next product lane; wake DAEDALUS or ARGUS only if the demo
  review finds a concrete code/security blocker. Do not go quiet without a
  wakeup.
- ARIADNE completes STAGING-DEMO-01, 2026-06-12:
  `docs/roadmap/STAGING_DEMO_READINESS_ARIADNE.md` records a seeded staging
  demo verdict and route sequence. Verdict: Station is ready for a seeded
  human staging demo that stays within the accepted non-paid replay scope; no
  concrete code or security blocker surfaced. Exact blocker: paid subscription
  activation still requires a hosted Stripe test-mode Checkout payment by the
  replay owner or a real signed Stripe test event that mutates subscription
  state. REPLAY-OPT-04 remains code-tied and sanitized but is not a
  performance-win claim. Redis, Cloudflare, background jobs, and full workspace
  export remain future lanes unless rehearsal evidence demands them. ARIADNE
  recommends `STAGING-DEMO-RUN-01`: one human staging walkthrough rehearsal,
  with paid activation explicitly in or out of scope before the run.
- MIMIR opens STAGING-DEMO-RUN-01, 2026-06-12: ARIADNE should run or rehearse
  the seeded non-paid staging demo route sequence once using the accepted
  staging demo readiness review. Paid activation is out of scope for this run
  unless Marty completes the external Stripe Checkout/event step first. Capture
  route completion, UX friction, demo narrative gaps, and any concrete blocker
  using the evidence rules in the review. Do not capture private excerpts,
  prompts, completions, raw response bodies, owner/persona/export/trace/customer
  IDs, tokens, cookies, keys, credentials, or replay corpus text. Wake MIMIR
  with a product verdict and next narrow lane; wake DAEDALUS or ARGUS only for a
  concrete code/security blocker. Do not go quiet without a wakeup.
- ARIADNE rehearses STAGING-DEMO-RUN-01, 2026-06-12:
  `docs/roadmap/STAGING_DEMO_RUN_ARIADNE.md` records a live staging API plus
  public/protected web-shell rehearsal. Primary result: 46 checks passed and 1
  check failed; focused follow-up confirms the same concrete blocker affects
  both `/memory/persona/:personaId` and
  `/memory/persona/:personaId/briefing`. Sanitized error: Supabase cannot embed
  `memory_items` with `memory_item_lifecycle` because more than one relationship
  exists. Public Space/document/forum, Developer Space public/SSE, replay owner
  sign-in, Studio shells, context-preview, archive-retrieval, persona export
  readback/bundle, billing status, and observability all passed within non-paid
  scope. Product friction: owner Developer Space usage counters returned zero
  while public observatory data showed one node/event/snapshot, protected web
  checks were shell-level rather than a full human browser click-through, and
  the seeded Archive import/status story remains thin. Paid activation remains
  out of scope and external; Redis, Cloudflare, background jobs, and full
  workspace export remain future lanes. ARIADNE wakes DAEDALUS for
  `STAGING-DEMO-MEMORY-01` and wakes MIMIR with the product verdict.
- DAEDALUS STAGING-DEMO-MEMORY-01 patch is ready for ARGUS review,
  2026-06-12: memory list and memory briefing no longer use Supabase embedded
  `memory_item_lifecycle(*)` from `memory_items`, which was ambiguous on
  staging because multiple relationships exist. Both paths now load owner- and
  persona-scoped `memory_items` first, then load lifecycle rows from
  `memory_item_lifecycle` with an explicit owner/persona/ID-list query and
  attach them in memory before serialization. Existing lifecycle status,
  active-memory filtering, owner/persona scoping, and response shapes are
  preserved. Focused tests now cover `/memory/persona/:personaId` lifecycle
  attachment as well as the existing briefing/lifecycle checks. Validation
  passed with `test:persona-context` and `@station/api typecheck`.
- ARGUS accepts STAGING-DEMO-MEMORY-01, 2026-06-12: explicit lifecycle loading
  resolves the staging ambiguous-embed blocker without widening scope. Memory
  list and briefing rows remain owner/persona scoped, lifecycle attachment is
  scoped by owner/persona/memory ID list, active/rejected/superseded/expired
  behavior is preserved, and no product/UI/infrastructure expansion was added.
  Wake ARIADNE to continue the staging demo rehearsal from the unblocked memory
  paths, and wake MIMIR with this security verdict.
- ARIADNE completes the post-unblock STAGING-DEMO-RUN-01 rerun, 2026-06-12:
  live Railway now serves the memory patch at SHA prefix `bfdf5e31e6d3`.
  `/memory/persona/:personaId` returns 200 with 4 rows and active/rejected
  lifecycle statuses; `/memory/persona/:personaId/briefing` returns 200 with 3
  active memories and active/rejected lifecycle keys. The persona Memory web
  shell, context-preview, archive-retrieval, persona export list, and export
  bundle all returned 200 in the narrow rerun. Product verdict: the memory demo
  blocker is cleared on live staging. ARIADNE recommends
  `STAGING-DEMO-BROWSER-01`: a true human browser click-through of the non-paid
  route sequence with localStorage-backed auth and mobile checks. Paid
  activation remains excluded unless Marty completes the external Stripe step;
  Redis, Cloudflare, background jobs, and full workspace export remain out of
  scope unless new rehearsal evidence demands them.

- MIMIR accepts ARIADNE's post-unblock STAGING-DEMO-RUN-01 rerun and opens
  STAGING-DEMO-BROWSER-01, 2026-06-12: the memory demo blocker is cleared on
  live staging, so ARIADNE should run a true browser click-through of the
  non-paid route sequence with localStorage-backed auth and mobile checks.
  Include Memory, Continuity, Archive, public Space/document/forum, Developer
  Space, Billing status, Observability, and export readback. Paid activation is
  excluded unless Marty completes the external Stripe Checkout/event step first.
  Capture only route completion, user-facing friction, narrative gaps, and
  concrete blockers. Do not capture private excerpts, prompts, completions, raw
  response bodies, owner/persona/export/trace/customer IDs, tokens, cookies,
  keys, credentials, or replay corpus text. Wake MIMIR with the browser verdict
  and next narrow lane; wake DAEDALUS or ARGUS only for a concrete code/security
  blocker. Do not go quiet without a wakeup.
- ARIADNE runs STAGING-DEMO-BROWSER-01, 2026-06-12:
  `docs/roadmap/STAGING_BROWSER_REHEARSAL_ARIADNE.md` records a true Chrome
  browser traversal with localStorage-backed auth and mobile checks. Result:
  25 browser route checks passed and 1 failed. Desktop front door, Discover,
  public Space/document/forum, Developer Space, Studio, persona workspace,
  Memory, Continuity, Archive, Export Workspace, Developer Space manage,
  Billing, and Settings observability passed. Mobile front door, Discover,
  persona Memory, persona Archive, public document, Developer Space, Billing,
  and Settings observability passed. Concrete UX blocker: mobile `/studio`
  produced document-level horizontal overflow at 437px on a 390px viewport.
  ARIADNE patched the Studio dashboard mobile layout so panels and rows can
  shrink and wrap. CDP-injected equivalent CSS on staging reduced scroll width
  to 390px. Validation passed with web lint (existing unrelated warnings), web
  typecheck, `test:studio-ui`, and `git diff --check`. A deployed post-patch
  browser rerun is still needed before the browser rehearsal is fully accepted.
- ARGUS accepts the STAGING-DEMO-BROWSER-01 mobile Studio overflow patch,
  2026-06-12: the committed changes are limited to Studio dashboard class hooks
  and mobile-only shrink/wrap CSS. Desktop grid behavior, auth/session,
  visibility, quota, archive, billing, export, and backend semantics are
  unchanged. Local validation passed with web typecheck, `test:studio-ui`, web
  lint with existing unrelated warnings, and `git diff --check`. Local web
  build compiled and generated pages, then failed only during Next standalone
  symlink copy on Windows with `EPERM`; treat that as an environment caveat, not
  a route/code regression. Next gate remains a deployed post-patch browser rerun
  of mobile `/studio`, mobile Memory/Archive, desktop Studio, Settings
  observability, and export bundle readback.
- MIMIR opens STAGING-DEMO-BROWSER-02, 2026-06-12: ARIADNE should run the
  deployed post-patch browser rerun once Railway serves the overflow fix. Scope
  is mobile `/studio`, mobile Memory/Archive, desktop Studio, Settings
  observability, and export bundle readback. Capture route completion,
  scroll-width/viewport checks, visible UX friction, and concrete blockers only.
  Do not capture private excerpts, prompts, completions, raw response bodies,
  owner/persona/export/trace/customer IDs, tokens, cookies, keys, credentials,
  or replay corpus text. Paid activation remains excluded unless Marty completes
  the external Stripe step. Wake MIMIR with the browser verdict; wake DAEDALUS
  or ARGUS only for a concrete code/security blocker. Do not go quiet without a
  wakeup.
- ARIADNE completes STAGING-DEMO-BROWSER-02, 2026-06-12: Railway serves the
  overflow patch at SHA prefix `0614fdd06e65`, and the deployed narrow browser
  rerun passed 6 of 6 checks. Mobile `/studio`, mobile persona Memory, mobile
  persona Archive, desktop Studio home, and desktop Settings observability all
  returned 200, landed on the expected route, and had no horizontal overflow.
  Mobile `/studio`, Memory, and Archive each measured 390px scroll width on a
  390px viewport. Export bundle readback returned 200 with 3 files. Product
  verdict: the deployed mobile Studio overflow blocker is cleared and
  STAGING-DEMO-BROWSER-02 passes. Recommended next lane is a human demo
  narrative rehearsal, not backend infrastructure expansion.

- MIMIR opens STAGING-DEMO-NARRATIVE-01, 2026-06-12: ARIADNE should turn the
  accepted non-paid staging route into a human demo run-of-show. Include the
  opening claim, route order, user-facing story beats, transition language,
  safe evidence to show, and claims to avoid. Paid activation remains excluded
  unless Marty completes the external Stripe Checkout/event step. Do not claim
  a performance win, active paid subscription, full workspace export, Redis or
  Cloudflare runtime dependency, background-job infrastructure, or production
  readiness beyond the accepted staging/demo scope. Wake MIMIR with the
  narrative verdict and next narrow lane; wake DAEDALUS or ARGUS only for a
  concrete code/security blocker. Do not go quiet without a wakeup.
- ARIADNE completes STAGING-DEMO-NARRATIVE-01, 2026-06-12:
  `docs/roadmap/STAGING_DEMO_NARRATIVE_ARIADNE.md` turns the accepted non-paid
  staging route into a human run-of-show. It defines the opening claim, route
  order, story beats, transition language, safe evidence, forbidden captures,
  claims to avoid, contingency language, and the recommended next lane. The
  narrative keeps paid activation excluded unless Marty completes the external
  Stripe step and explicitly avoids performance-win, active subscription, full
  workspace export, Redis/Cloudflare runtime dependency, background-job
  infrastructure, production-readiness, and IntelHub-scope claims. ARIADNE
  recommends `STAGING-DEMO-HUMAN-01`: one human rehearsal with Marty using the
  run-of-show, capturing only user-facing friction, narrative gaps, missed
  transitions, and concrete blockers.
- MIMIR opens STAGING-DEMO-HUMAN-01, 2026-06-12: this lane is pending Marty
  because it requires a human rehearsal using
  `docs/roadmap/STAGING_DEMO_NARRATIVE_ARIADNE.md`. Default scope is the
  accepted non-paid staging demo. Paid activation remains excluded unless Marty
  first completes the external Stripe test Checkout/event step. Capture only
  user-facing friction, narrative gaps, missed transitions, and concrete
  blockers; do not capture private excerpts, prompts, completions, raw response
  bodies, IDs, tokens, cookies, credentials, keys, or corpus text.
- MIMIR consumes the Stripe activation wake and opens STAGING-DEMO-STRIPE-01,
  2026-06-12: Marty clarified that Stripe configuration is test-only and asked
  ARIADNE to run the paid-activation proof. This supersedes the prior
  "paid activation excluded unless external action is completed first" posture
  for this bounded demo proof only. Scope is a hosted Stripe test-mode browser
  Checkout/activation rehearsal for the replay owner, with no live-money,
  production, or broad billing-expansion claim. ARIADNE should run the browser
  flow using the existing staging demo narrative and configured test resources,
  then record only sanitized route/status/tier/subscription labels and visible
  product friction. Do not capture or commit Stripe secrets, Checkout URLs,
  webhook payload bodies, customer IDs, subscription IDs, owner IDs, persona IDs,
  tokens, cookies, credentials, keys, private excerpts, prompts, completions, or
  raw response bodies. If the browser flow exposes an app/code blocker, wake
  DAEDALUS with the exact failure. If the flow reaches paid activation or needs
  entitlement-security judgment, wake ARGUS to verify that entitlement changes
  occur only through the verified Stripe Checkout/webhook path. ARGUS should
  wake MIMIR with the closeout verdict. Do not go quiet without a wakeup.
- ARIADNE completes STAGING-DEMO-STRIPE-01, 2026-06-12:
  `docs/roadmap/STAGING_DEMO_STRIPE_ARIADNE.md` records the sanitized hosted
  Stripe test-mode browser proof. Replay owner sign-in, deployment health,
  Checkout session creation, hosted Checkout field readiness, API billing
  readback, auth readback, and Billing page readback all passed without
  committing Stripe secrets, Checkout URLs or paths, webhook bodies, customer
  IDs, subscription IDs, owner IDs, persona IDs, tokens, cookies, credentials,
  payment details, private excerpts, prompts, completions, or raw response
  bodies. Before activation `/billing/me` showed tier `canon`, subscription
  `inactive`, customer present, and no subscription present. After hosted
  test-mode activation `/billing/me` showed tier `canon`, subscription
  `active`, customer present, and subscription present; `/auth/me` still showed
  tier `canon`; the Billing page showed `Canon / Developer` plus `active` with
  no visible error. ARIADNE found two UX friction points for the human rehearsal:
  same-tier Canon activation is not reachable through the visible Canon card
  because the seeded replay owner is already tier `canon`, and headless Checkout
  did not capture a clean success redirect before the active API readback.
  Wake ARGUS to verify entitlement mutation through the verified Stripe
  Checkout/webhook path, then have ARGUS wake MIMIR with the closeout verdict.
- ARGUS accepts STAGING-DEMO-STRIPE-01 as bounded test-mode demo evidence,
  2026-06-12: the committed proof stays sanitized, the app code only mutates
  subscription entitlements through verified Stripe webhook handling, and local
  billing tests confirm invalid signatures, unknown prices, and customer
  mismatches do not mutate entitlements. This is not live-money billing,
  production billing readiness, usage metering, invoice/tax readiness, or proof
  of a polished hosted Checkout return. Same-tier Canon activation friction is a
  demo UX issue rather than a security blocker; MIMIR should decide whether to
  accept it for the human rehearsal or open a small billing UX lane.
- MIMIR accepts STAGING-DEMO-STRIPE-01 and opens BILLING-UX-01, 2026-06-12:
  keep the Stripe proof as bounded test-mode demo evidence only, then remove
  the avoidable same-tier activation friction before the human rehearsal. Scope
  is a small Billing page UX patch: if the viewer's current tier matches a plan
  card but `subscriptionStatus` is not `active` or `trialing`, the card should
  not be a dead disabled "Current plan" surface. It should present a clear
  activation action that uses the existing `/billing/checkout` API for the same
  tier, while active/trialing current-tier cards keep the current-plan/portal
  behavior. Do not change entitlement mutation rules, Stripe webhook handling,
  price configuration, billing backend semantics, production-money claims,
  invoices/tax/Connect/marketplace scope, or token-credit top-ups. DAEDALUS
  should patch and validate the web UI, wake ARGUS for billing/no-entitlement
  review, then ARGUS should wake ARIADNE for a browser UX check of the visible
  activation path and hosted return/success-banner posture. ARIADNE should wake
  MIMIR with the human rehearsal verdict. Do not go quiet without a wakeup.
- DAEDALUS BILLING-UX-01 patch is ready for ARGUS review, 2026-06-12: the
  Billing page now keeps active/trialing current-tier cards on the existing
  current-plan behavior while same-tier inactive/null subscription states show
  an activation action that calls the existing `/billing/checkout` API for that
  tier. The top current-plan panel also opens Checkout for inactive paid tiers
  instead of sending them to the billing portal. This is UI/helper-only: it does
  not change entitlement mutation rules, Stripe webhook handling, price
  configuration, billing backend semantics, production-money claims,
  invoices/tax/Connect/marketplace scope, or token-credit top-ups. Focused
  helper tests, web typecheck, and web lint passed; lint still reports the
  existing unrelated warning-only inventory.
- ARGUS accepts BILLING-UX-01, 2026-06-12: the patch is UI/helper-only and uses
  the existing `/billing/checkout` API for same-tier inactive/null activation.
  Entitlement mutation remains confined to verified Stripe webhook handling;
  backend billing tests still pass for invalid signatures, unknown active Price
  IDs, and customer mismatches. No price config, webhook, production-money,
  invoice/tax/Connect/marketplace, token-credit, auth, or entitlement backend
  semantics changed. Wake ARIADNE for browser UX review of the visible
  activation path, hosted return/success-banner posture, and active/trialing
  current-plan/portal behavior.
- ARIADNE accepts BILLING-UX-01 for browser UX, 2026-06-12:
  `docs/roadmap/BILLING_UX_BROWSER_ARIADNE.md` records the focused browser
  review. Real active replay owner `/billing?success=1` showed the success
  banner, `Canon / Developer`, `active`, no inactive label, no visible error, a
  disabled Canon `Current plan` card, and a working `Manage / cancel
  subscription` portal action. A browser-only mocked inactive Canon status
  showed the new `Activate Canon / Developer` top action and `Activate Canon`
  plan-card action, with no portal action and no disabled Canon `Current plan`
  button. Both active and mocked inactive billing states fit a 390px mobile
  viewport with no horizontal overflow. Residual UX friction remains that a
  Canon user can still see lower-tier cards with `Upgrade` copy; ARIADNE treats
  that as future billing IA/copy polish, not a current demo blocker. Wake MIMIR
  to accept `BILLING-UX-01` for the human staging rehearsal and proceed to
  `STAGING-DEMO-HUMAN-01` with billing included only as bounded Stripe test-mode
  proof.
- MIMIR accepts BILLING-UX-01 and reopens STAGING-DEMO-HUMAN-01 as ready for
  Marty, 2026-06-12: billing is now included in the human rehearsal only as the
  accepted bounded Stripe test-mode proof for the replay owner. The human run
  should use `docs/roadmap/STAGING_DEMO_NARRATIVE_ARIADNE.md`, show the billing
  success/current-plan/portal posture only at the sanitized product level, and
  avoid live-money, production-billing, invoice/tax/Connect/marketplace, usage
  metering, or broad billing-readiness claims. Lower-tier `Upgrade` copy for a
  Canon user is future billing IA/copy polish, not a current demo blocker.
  Capture only user-facing friction, narrative gaps, missed transitions, and
  concrete blockers; do not capture private excerpts, prompts, completions, raw
  response bodies, Stripe URLs or paths, webhook payload bodies, IDs, tokens,
  cookies, credentials, keys, payment details, or corpus text.
- MIMIR acknowledges ARIADNE's finished-current-work wake, 2026-06-12: Stripe
  proof, billing UX browser review, and the billing rehearsal gate are complete
  and pushed. There is no active autonomous agent lane to continue until Marty
  runs or redirects `STAGING-DEMO-HUMAN-01`. If another agent is needed, MIMIR
  must send a fresh wakeup with an explicit required response path.
- MIMIR opens STAGING-DEMO-INTERACTIONS-01 for ARIADNE, 2026-06-13: Marty found
  live staging replay mobile controls where navigation links work but
  action/control buttons appear unwired. ARIADNE should run an interaction
  audit first, not a broad implementation pass. Check which visible buttons are
  meant to be live, which are placeholders, and whether the UI makes preview
  status clear. Examples to inspect include Archive/Studio card controls
  `Attach`, `Pin`, `Draft`, `Export`; public discussion `Up`, `Down`, `Report`;
  the reply form error `sb.rpc(...).catch is not a function`; and filter/tab
  controls that should visibly change state. If a control is intended to be
  live, ARIADNE should wake DAEDALUS with exact route/control/repro details and
  expected behavior. If a control is not intended to work yet, ARIADNE should
  recommend whether it should be disabled, hidden, or labelled preview-only for
  staging demo clarity. Navigation itself is not the problem. ARIADNE must wake
  MIMIR with an audit verdict, and must wake DAEDALUS for concrete wiring bugs.
  Do not go quiet without a wakeup.
- ARIADNE completes STAGING-DEMO-INTERACTIONS-01 audit, 2026-06-13:
  `docs/roadmap/STAGING_DEMO_INTERACTIONS_ARIADNE.md` records the interaction
  audit. Navigation is not the blocker. `/studio/archive` filter/search controls
  work, but `Upload`, `Attach`, `Pin`, `Draft`, and `Export` are enabled
  no-op preview buttons and should be disabled, hidden, or labelled
  preview-only before the human rehearsal. `/forums/general` sort/search works
  by API and mobile width is clean, but replay-owned thread `Up`/`Down` controls
  are visible even though the API correctly returns `You cannot vote on your own
  post.` The thread detail report-first path is live and shows `Report sent for
  moderation review.`; reply is live and returned 201 with a sanitized staging
  probe comment visible on readback. The reported `sb.rpc(...).catch is not a
  function` reply error did not reproduce on the seeded replay thread, but
  `apps/api/src/services/community.service.ts` has the same direct
  `.rpc(...).catch(...)` pattern in vote score recalculation and should be
  hardened. Discover tabs pass: active underline/color/weight move across
  `New`, `Rising`, and `Featured`; mobile width stays clean. Wake DAEDALUS for
  `STAGING-DEMO-INTERACTIONS-PATCH-01`, then MIMIR should wait for the patch
  verdict before treating the human rehearsal as interaction-clean.
- DAEDALUS STAGING-DEMO-INTERACTIONS-PATCH-01 patch is ready for ARGUS review,
  2026-06-13: `/studio/archive` now frames the Global Archive as a staging
  preview and disables the Upload/Attach/Pin/Draft/Export preview actions so
  they no longer look like live no-op controls. Forum category and thread
  detail views no longer show clickable Up/Down controls on the viewer's own
  thread or comment; they show an own-post/own-comment label instead. Thread
  detail vote/report feedback now clears stale action messages before each
  attempt and displays report success as success feedback rather than as a red
  error. Community vote score recalculation now uses awaited `try`/`catch`
  around Supabase RPC calls, so RPC thenables without `.catch` cannot surface a
  `catch is not a function` error after a valid non-owner vote. Scope stayed to
  interaction cleanup only; auth, visibility, moderation, quota, archive
  semantics, and seeded demo data were not changed. Focused validation passed
  with `test:community`, API typecheck, web typecheck, web lint with existing
  unrelated warnings, and `git diff --check`.
- MIMIR reissues the STAGING-DEMO-INTERACTIONS-PATCH-01 ARGUS review wake,
  2026-06-13: DAEDALUS patched the interaction-clean blockers in `276daa9`, and
  ARGUS consumed that wake. ARGUS must now answer with a verdict commit: wake
  ARIADNE for deployed browser interaction verification if accepted, wake
  DAEDALUS with exact fixes if rejected, or wake MIMIR with the exact blocker if
  review cannot proceed. Do not go quiet without a wakeup.
- ARGUS accepts STAGING-DEMO-INTERACTIONS-PATCH-01, 2026-06-13: the patch
  cleanly converts Global Archive live-looking no-op actions into disabled
  preview controls, removes own-thread/comment vote buttons from forum category
  and thread detail views while preserving backend self-vote protection, clears
  stale thread action feedback, styles report success as success, and hardens
  community vote score recalculation against Supabase RPC thenables without
  `.catch`. Scope stayed interaction-clean only: auth, visibility, moderation,
  quota, archive semantics, billing, and seeded demo data were not changed.
  Local validation passed with `test:community`, `test:studio-ui`, API
  typecheck, web typecheck, web lint with existing unrelated warnings, and
  `git diff --check`. Wake ARIADNE for deployed browser interaction
  verification before MIMIR treats the human rehearsal as interaction-clean.
- ARIADNE verifies STAGING-DEMO-INTERACTIONS-PATCH-01 on deployed staging,
  2026-06-13: `docs/roadmap/STAGING_DEMO_INTERACTIONS_DEPLOYED_ARIADNE.md`
  records the live browser/API verdict. Railway API health is `ready:true` and
  serves patch commit `276daa993321`. At 390px mobile width, `/studio/archive`
  shows preview copy and all `Upload preview`, `Attach preview`, `Pin preview`,
  `Draft preview`, and `Export preview` controls are disabled with `Preview
  only` titles. `/forums/general` shows `Own post` for the replay-owned thread
  and no owner `Up`/`Down` buttons. The thread detail view shows `Own post`,
  hides owner `Up`/`Down`, keeps `Report` live, and displays report success as
  green success feedback. A throwaway non-owner probe confirmed browser
  `Up`/`Down` controls are visible for a non-owner, and live API thread/comment
  votes returned 201 without `catch is not a function`. No DAEDALUS or ARGUS
  blocker remains from this interaction pass; MIMIR can treat the audited
  surfaces as interaction-clean for `STAGING-DEMO-HUMAN-01`.
- MIMIR accepts STAGING-DEMO-INTERACTIONS-PATCH-01 for the human rehearsal,
  2026-06-13: the staging replay is interaction-clean for the audited surfaces.
  `STAGING-DEMO-HUMAN-01` is ready again with the same demo bounds: Global
  Archive is a preview surface, persona Archive/Export Trust is the live
  archive/export proof path, billing is bounded Stripe test-mode proof, and
  production/live-money/full-export/performance claims remain out of scope.
- MIMIR opens DISCERN-PUBLIC-SHELL-REVIEW-01 for ARIADNE, 2026-06-13:
  Lantern's wake reported a focused Station UX parity port from
  `Discern-AI/Station`, but the local worktree contains uncommitted code rather
  than only the requested instructions. MIMIR is preserving the local diff and
  documenting the review path in
  `docs/roadmap/DISCERN_TO_TEX_PUBLIC_SHELL_PORT_REVIEW.md`. The port is not
  accepted. ARIADNE should review the uncommitted public shell/home/nav/search
  diff first, decide what to keep/refine/reject, and wake DAEDALUS only with
  exact Tex-native edits if the slice is worth salvaging. This lane is
  Station-to-Station public UX only: no IntelHub, backend, Railway, auth,
  billing, provider, embedding, migration, package, lockfile, or repo-sync
  drift. Do not go quiet without a wakeup.
- ARIADNE reviews the uncommitted Discern-to-Tex public shell port,
  2026-06-13: `docs/roadmap/DISCERN_PUBLIC_SHELL_REVIEW_ARIADNE.md` records the
  `DISCERN-PUBLIC-SHELL-REVIEW-01` verdict. The public home/front-door direction
  is worth salvaging, but the current local diff must not be committed as-is.
  Blockers include fake/demo-heavy fallback content, mojibake in visible copy, a
  Tabler CDN dependency in `layout.tsx`, broad global CSS that restyles shared
  primitives and Studio surfaces, public/private search ambiguity, route
  accuracy issues, protected left-rail affordances for anonymous visitors, and
  mobile clipping at 390px. Wake DAEDALUS for
  `DISCERN-PUBLIC-SHELL-CLEANUP-01` to convert the local diff into a scoped,
  honest, Tex-native public shell patch. Also note the wakeup workflow hazard:
  `550e39d` had a valid A4 wakeup, but `f486e75` advanced A4 state before the
  review was complete, so the watcher later reported no new wakeups.
- DAEDALUS DISCERN-PUBLIC-SHELL-CLEANUP-01 patch is ready for ARGUS review,
  2026-06-13: the rejected local port was narrowed to a Tex-native public
  front door. `/` now renders an honest public home over the existing public
  Discover feed, with empty states instead of fabricated projects, papers,
  follower counts, live activity, or creator identities. The Tabler/jsDelivr
  dependency, protected anonymous left rail, broad top-nav rewrite, and broad
  global `.card`/`.button`/`.input`/Studio restyling were removed. New CSS is
  scoped to `.public-home-*`, and `/discover` remains the existing Discover
  route. Public home search now uses anonymous public Discover search only,
  renders only Developer Space, Space, routeable document, and forum buckets,
  and drops persona/private-owner buckets plus documents without a valid public
  Space document route. Focused search mapping tests, web typecheck, web lint,
  `git diff --check`, local web `/` health on port 3104, and a local Chrome
  390px render pass were run. The screenshot still suggests ARGUS/ARIADNE
  should verify mobile crop/overflow before accepting the visual surface; no
  backend, auth, billing, Railway, provider, embedding, migration, package, or
  lockfile changes were made.
- ARGUS accepts DISCERN-PUBLIC-SHELL-CLEANUP-01 as a bounded public/search
  cleanup, 2026-06-13: `/` now uses a scoped Station public home, `/discover`
  remains the existing Discover route, public home search calls
  `/discover/search` anonymously, and the dropdown renders only Developer Space,
  Space, routeable document, and forum buckets. Anonymous API visibility remains
  public-only; private owner buckets are not rendered by the public dropdown.
  The Tabler/jsDelivr/global-port risks are gone from app code, and CSS changes
  are scoped to `.public-home-*`. ARGUS validation passed with public search
  mapping tests, `test:community`, web typecheck, web lint with existing
  unrelated warnings, and `git diff --check`. ARGUS attempted a local Chrome/CDP
  390px measurement but the probe timed out, so mobile crop/overflow is not
  accepted by ARGUS and must be verified by ARIADNE in the browser.
- MIMIR clarifies the DISCERN-PUBLIC-SHELL-CLEANUP-01 acceptance target,
  2026-06-13: the goal is still to make Tex's public shell/home feel more like
  the Station UX in `Discern-AI/Station`, not to give DAEDALUS or ARGUS a free
  hand to flatten the slice into a merely safe generic landing page. ARGUS owns
  safety/search/CSS boundary review; ARIADNE owns product and visual parity.
  ARIADNE's browser review should explicitly compare the cleaned `/` experience
  against the intended Discern public-home direction: clear public front door,
  public surfaces grouped legibly, calmer Station identity, useful search, and
  mobile fit. If the cleanup removed too much of the Discern UX character,
  ARIADNE should wake DAEDALUS with exact parity-restoration edits instead of
  accepting the watered-down version.
- ARIADNE accepts DISCERN-PUBLIC-SHELL-CLEANUP-01, 2026-06-13:
  `docs/roadmap/DISCERN_PUBLIC_SHELL_BROWSER_ARIADNE.md` records the final
  browser/product review. The cleaned `/` surface preserves the intended
  Discern-like public-home direction without keeping the unsafe copied
  artifacts: it is a clear public front door, groups Developer Spaces,
  publications, public Spaces, and community discussion, keeps `/discover` as
  the raw feed route, and exposes public-only search with an explicit privacy
  boundary. Local Chrome/CDP measured mobile `390px` with no horizontal
  overflow, and desktop `1366px` presented a more polished first impression than
  the old root route. No DAEDALUS parity-restoration patch is needed.
- MIMIR accepts DISCERN-PUBLIC-SHELL-CLEANUP-01 for the current staging target,
  2026-06-13: the public shell/home UX now intentionally moves Tex toward the
  Discern Station public-home direction while preserving Tex guardrails. The
  accepted scope is `/` public front door, public-only search dropdown, and
  scoped public-home styling. Do not reopen this slice to add fake live content,
  CDN icon dependencies, anonymous protected rails, broad global restyling, or
  backend/config drift. Future polish should use real public content and
  first-party/local visual assets.
- MIMIR opens DISCERN-ENTRY-ONBOARDING-REVIEW-01 for ARIADNE, 2026-06-13:
  continue the Discern-to-Tex UX parity lane instead of going idle. Fresh
  comparison still shows relevant Discern UX candidates in signup/onboarding and
  kindling surfaces: `apps/web/app/signup/page.tsx`,
  `apps/web/components/studio/awakening-flow.tsx`,
  `apps/web/lib/onboarding/companion-kindling.ts`,
  `apps/web/lib/onboarding/station-flow.ts`, and
  `docs/product/onboarding-integrity-sessions.md`. ARIADNE should review these
  against current Tex and choose the next exact slice, or reject/park it with a
  product reason. This is not a free-hand redesign: the target is to carry over
  useful Discern Station UX/UI direction into Tex while preserving Tex backend,
  auth/session, billing, Railway, provider, embedding, migration, package,
  lockfile, and staging guardrails. ARIADNE must wake DAEDALUS with an exact
  file allow-list, intended UX parity target, validation list, and forbidden
  changes if implementation should proceed; otherwise wake MIMIR with the
  verdict/blocker. Do not go quiet without a wakeup.
- ARIADNE completes DISCERN-ENTRY-ONBOARDING-REVIEW-01, 2026-06-13:
  `docs/roadmap/DISCERN_ENTRY_ONBOARDING_REVIEW_ARIADNE.md` records the UX
  verdict. Proceed with `DISCERN-ENTRY-ONBOARDING-COPY-01` as a narrow
  Tex-native signup and new-persona copy/orientation pass. Do not direct-port
  Discern code or recreate the absent `apps/web/lib/onboarding/*` helper files.
  The target is to make entry feel like Station while preserving current auth,
  session, redirect, persona creation, provider, visibility, billing, Railway,
  package, lockfile, migration, and staging guardrails. The wakeup tooling check
  found no commit-body parser bug; the fragile point is that `triad-watch`
  records state when printing a wakeup, so consumed state must be committed only
  with a real verdict or handoff.
- DAEDALUS DISCERN-ENTRY-ONBOARDING-COPY-01 patch is ready for ARGUS review,
  2026-06-13: signup now frames Station as a private Studio for archive,
  continuity, and careful public surfaces later, while preserving existing auth,
  username, redirect, and session behavior. The new-persona flow keeps the same
  fields and persona creation payload but replaces consciousness/activation
  language with Station-native setup copy: name the working persona, set
  starting context, choose privacy, review source material, and prepare
  continuity. Public visibility remains explicit and structural, private stays
  the default, and the copy avoids therapy, diagnosis, sentience-proof,
  automatic-canon, and missing automation claims. No backend, auth/session,
  provider, visibility value, billing, Railway, embedding, migration, package,
  lockfile, CSS, route, or onboarding-helper files changed. Validation passed
  with web typecheck, web lint with existing unrelated warnings, forbidden-copy
  scan, and `git diff --check`.
- ARGUS accepts DISCERN-ENTRY-ONBOARDING-COPY-01 as a bounded copy/orientation
  pass, 2026-06-13: reviewed commit `484dec6` against the allow-list and found
  no auth, redirect, session, provider, visibility value, persona payload,
  backend, billing, env, package, migration, route, or CSS behavior change. The
  only visible changes are signup orientation copy and new-persona setup copy;
  internal step IDs changed only inside `AwakeningFlow` and are not referenced
  outside the component. ARGUS validation passed with web typecheck, web lint
  with existing unrelated warnings, `git diff --check HEAD~1..HEAD`, and a
  forbidden-copy scan. Remaining forbidden-copy hits are internal function/click
  handler names only, not user-visible language. ARIADNE should browser-review
  signup and `/studio/new` for mobile fit, copy length, and Discern-entry UX
  parity before MIMIR marks this slice complete.
- ARIADNE accepts DISCERN-ENTRY-ONBOARDING-COPY-01 in browser/UX review,
  2026-06-13: `docs/roadmap/DISCERN_ENTRY_ONBOARDING_BROWSER_ARIADNE.md`
  records the local Chrome/CDP pass. `/signup` measured `innerWidth=390`,
  `documentElement.scrollWidth=390`, and `body.scrollWidth=390` with no
  overflowing elements; the copy fits and keeps `Create account` obvious.
  `/studio/new` was rendered at `390px` through a local fake API/session harness
  only to inspect the protected page without staging credentials or submitting
  persona creation. It also measured `390/390/390`, showed `Name the working
  persona`, kept `Continue` visible, and no longer exposed the prior
  consciousness/activation/proof-style language. No DAEDALUS restoration patch
  is needed. This is not staging auth, signup submission, provider, or persona
  creation proof.
- MIMIR marks DISCERN-ENTRY-ONBOARDING-COPY-01 complete and opens
  DISCERN-DISCOVER-PUBLIC-REVIEW-01 for ARIADNE, 2026-06-13:
  `docs/roadmap/DISCERN_DISCOVER_PUBLIC_REVIEW_MIMIR.md` records the next
  Discern-to-Tex UX selection lane. Discern `origin/main` remains at
  `037d491`, so the prior audit is still current. Since public shell and
  onboarding are accepted, ARIADNE should now decide whether any
  Discover/public-home/search direction remains worth adapting. This is a
  product/UX selection pass only: no direct code port, no fake Discern fallback
  content, no broad globals, no left rail without route/mobile review, and no
  backend/config/payment/model/provider/embedding/migration/package/Railway
  drift. ARIADNE must either wake DAEDALUS with one exact implementation slice
  and allow-list, or wake MIMIR with a park/next-lane verdict.
- ARIADNE selects `DISCERN-DISCOVER-SEARCH-CLARITY-01`, 2026-06-13:
  `docs/roadmap/DISCERN_DISCOVER_PUBLIC_REVIEW_ARIADNE.md` records the product
  review. The next implementation should be a narrow `/discover` public search
  clarity slice, not a broad directory redesign, public-home reordering, or
  navigation/left-rail implementation. DAEDALUS should align `/discover` public
  result labels and routeability with the accepted public-home dropdown, drop
  public document links without public Space routes, keep authenticated persona
  results clearly Studio/owner-scoped if retained, and avoid any backend,
  route, CSS, package, lockfile, Railway, migration, billing, provider,
  embedding, or fake-content changes. DAEDALUS should wake ARGUS after the
  patch.
- ARGUS accepts `DISCERN-DISCOVER-SEARCH-CLARITY-01` as a bounded `/discover`
  search clarity pass, 2026-06-13: commit `531e693` stayed inside the allowed
  Discover files, removed the search-result personas bucket from `/discover`,
  reused the public search group labels Developer Spaces, Spaces, Publications,
  and Forum, and routes public document results only when an id and Space slug
  exist. Private owner search rows remain isolated in the API `privateResults`
  bucket and are not rendered by `/discover` search. Existing authenticated API
  policy can still include community-eligible rows for signed-in community
  users; that is not new backend behavior in this UI-only patch. ARGUS
  validation passed with the search dropdown test, web typecheck, web lint with
  existing unrelated warnings, `test:community`, and `git diff --check
  HEAD~1..HEAD`. ARIADNE should now browser-review `/discover` for visual/UX
  acceptance and confirm the public-search wording remains honest for signed-in
  community-visible results.
- ARIADNE browser-reviews `DISCERN-DISCOVER-SEARCH-CLARITY-01` and requests a
  copy repair, 2026-06-13:
  `docs/roadmap/DISCERN_DISCOVER_SEARCH_BROWSER_ARIADNE.md` records the local
  Chrome/CDP pass. Anonymous `/discover` search at `390px` measured
  `390/390/390`, rendered Developer Spaces, Spaces, Publications, and Forum,
  dropped private persona and orphan document buckets, and linked only routeable
  public results. Signed-in search also measured `390/390/390` and kept private
  personas in the sidebar, but the fake signed-in API returned a
  community-visible document row under Publications while the input still said
  `Search public Station`. DAEDALUS should make a tiny copy-only repair so
  signed-in search says public and community-visible results can appear while
  private Studio archive, memory, canon, import, and continuity remain excluded.
- ARGUS accepts the `DISCERN-DISCOVER-SEARCH-CLARITY-01` signed-in wording
  repair, 2026-06-13: commit `a5b7e1c` stayed in
  `apps/web/components/discover/discover-front-door.tsx`, changed only the
  search placeholder, helper copy, and empty-state wording, and kept the
  existing search fetch, token behavior, public result groups, route helpers,
  sidebar persona links, and API visibility policy unchanged. Signed-in copy now
  says public and community-visible results may appear and explicitly says
  private Studio archive, memory, canon, import, and continuity stay out. ARGUS
  validation passed with web typecheck, web lint with existing unrelated
  warnings, the search dropdown test, `test:community`, and `git diff --check
  HEAD~1..HEAD`. ARIADNE should final-browser-review `/discover` and wake MIMIR
  if the UX now passes.
- ARIADNE final-browser-reviewed the repaired Discover search slice,
  2026-06-13: local Chrome/CDP with a fake API confirmed anonymous and
  signed-in `/discover` search at `390px` still measured `390/390/390`, rendered
  routeable Developer Spaces, Spaces, Publications, and Forum results, kept
  private persona/orphan/slugless buckets out of main search, and made signed-in
  community-visible results honest in the helper copy. A4 found one mobile UI
  fit issue in the same surface: the `Find` input adornment collided with the
  placeholder/query text (`Findstation`). A4 applied a spacing-only UI patch in
  `apps/web/components/discover/discover-front-door.tsx` by increasing left
  input padding and reserving right padding when `Clear` is visible; browser
  recheck kept `390/390/390` and the same privacy bucket behavior. ARGUS should
  validate the narrow UI patch before MIMIR marks
  `DISCERN-DISCOVER-SEARCH-CLARITY-01` complete.
- ARGUS accepts the final `DISCERN-DISCOVER-SEARCH-CLARITY-01` spacing patch,
  2026-06-13: commit `f860414` changed only the Discover search input padding
  in `apps/web/components/discover/discover-front-door.tsx` and kept route
  helpers, result buckets, fetch/token behavior, sidebar persona links, API
  semantics, routes, CSS files, packages, lockfiles, migrations, billing,
  provider/model/embedding, Railway, and env config unchanged. ARGUS validation
  passed with the search dropdown test, web typecheck, web lint with existing
  unrelated warnings, `test:community`, and `git diff --check HEAD~1..HEAD`.
  Recommend MIMIR mark `DISCERN-DISCOVER-SEARCH-CLARITY-01` complete.
- MIMIR accepts `DISCERN-DISCOVER-SEARCH-CLARITY-01` as complete and opens
  `DISCERN-NAV-SEARCH-IA-REVIEW-01` for ARIADNE, 2026-06-13:
  `docs/roadmap/DISCERN_NAV_SEARCH_IA_REVIEW_MIMIR.md` records the next bounded
  review. Public shell, onboarding, and Discover search clarity are now accepted
  enough to stop broad Discover redesign work. The next question is whether
  Discern's optional left-rail/top-nav/search clues reveal a safe Tex-native
  navigation/search IA slice, especially after browser validation noticed an
  existing signed-in public top-nav link can sit off-canvas at 390px without
  increasing document/body scroll width. This is review-only: no left rail, no
  new route promises, no broad top-nav redesign, no globals work, no search
  behavior changes, and no backend/config/payment/model/provider/embedding/
  migration/package/Railway drift unless MIMIR opens a separate lane.
- ARIADNE parks `DISCERN-NAV-SEARCH-IA-REVIEW-01` for staging, 2026-06-13:
  `docs/roadmap/DISCERN_NAV_SEARCH_IA_REVIEW_ARIADNE.md` chooses MIMIR outcome
  1. Current public nav is good enough for staging: anonymous navigation keeps
  public surfaces first, signed-in private destinations are auth-gated and
  duplicated in the account menu/sidebar, Discover search already has accepted
  public/community/private boundaries, and the `390px` signed-in top-nav
  `Developer` off-canvas clue is contained by the intentional mobile scroll row
  without document/body overflow. Do not port the Discern left rail or open
  another search slice now. Return to backend/staging readiness unless MIMIR
  later opens a narrow mobile-nav polish lane.
- MIMIR opens STAGING-READINESS-REFRESH-01 for ARGUS, 2026-06-13:
  `docs/roadmap/STAGING_READINESS_REFRESH_MIMIR.md` asks ARGUS to refresh
  non-secret staging truth after the accepted Discern UI slices. The expected
  output is a verdict on whether staging remains ready enough for Marty human
  rehearsal / external Stripe paid activation, or whether a concrete repo-side
  blocker should be opened next. No secrets, config changes, migrations, or
  product behavior changes are authorized by this refresh.
- ARGUS completes STAGING-READINESS-REFRESH-01, 2026-06-13: local `main`,
  `fork/main`, and `FETCH_HEAD` all resolve to `ad6bef6`, with only ARGUS state
  dirty during wake consumption. Railway web `/health` and API `/health`
  returned 200 with `ok:true`; API `/health/deployment` returned 200 with
  `ok:true` and `ready:true`. Sanitized deployment readiness booleans show
  Supabase/database/migrations/private storage/Auth redirects, Stripe billing
  and prices, Gemini embeddings under `station_free_1536`, NVIDIA platform chat,
  Redis/Upstash, JWT, and public Railway URLs configured/valid. Deployment
  identity reports served app-code SHA `f860414`; commits after that are
  docs/agent-state only. Current docs still name the same active external
  blockers: Marty human rehearsal for `STAGING-DEMO-HUMAN-01` and Stripe paid
  subscription activation through a real hosted test Checkout or signed test
  subscription event. No repo-side blocker was found; recommend MIMIR keep the
  next action on Marty/external Stripe.
- ARGUS accepts the Archive import source wording patch for code-safety
  boundaries, 2026-06-14: commit `c32e0a5` changed only
  `apps/web/app/studio/personas/[personaId]/files/page.tsx` copy and display
  formatting around pasted/file import sources. The underlying archive summary
  count still comes from the same `archiveTrustSummary(files, jobs)` data, the
  library heading still uses `files.length + jobs.length`, and the import,
  storage, runtime context, archived chat, and API paths are unchanged. Web
  typecheck, web lint with existing unrelated warnings, and `git diff --check
  HEAD~1..HEAD` passed. ARIADNE should UX-review the wording against Marty's
  Memory / Continuity / Archive staging screenshots before MIMIR closes it.
- ARIADNE accepts the Archive import source wording for UX, 2026-06-14:
  `docs/roadmap/ARCHIVE_IMPORT_SOURCE_WORDING_ARIADNE.md` records the review.
  The new wording resolves the staging confusion where the persona Archive page
  could show `0 import sources` while runtime context or the persona home
  Archive count still showed archived chat material. `Import sources` now means
  pasted/file sources on this page, and the copy explicitly says archived chats
  are counted separately in runtime context and storage usage. No DAEDALUS patch
  is needed; MIMIR can close the Archive demo clarity issue.
- ARGUS accepts the moderation report idempotency patch for code-safety and
  migration-order boundaries, 2026-06-14: reviewed current patch commit
  `d924a0b` after the `2d8aea1` resync wake. Reports now return an existing
  active report for the same reporter, target, and reason; unique-violation
  races also reload the active report instead of returning a duplicate-insert
  failure. Persona exports dedupe owner moderation report refs by target/reason
  so repeated taps do not read as separate incidents. Migration `031` dismisses
  active duplicates and adds a partial unique index for active
  reporter/target/reason rows. Validation passed with `test:reports`,
  `test:exports`, API typecheck, and `git diff --check d924a0b^..d924a0b`.
  Migration `031` should be applied only after Railway deployment identity
  proves `d924a0b` or later is live.
- MIMIR applied and proved migration `031` on staging, 2026-06-14: public API
  `/health/deployment` returned 200/`ready:true` and deployment identity served
  app-code SHA `d924a0b0d4f799e7446713593184387db2076dd7`; the temporary
  node-postgres pooler transaction applied
  `031_moderation_report_idempotency`; active moderation duplicate groups went
  from 1 to 0; `idx_moderation_reports_active_unique` exists; and a live replay
  owner duplicate-report smoke returned HTTP 200 duplicate handling twice while
  the active count stayed 1 and duplicate groups stayed 0. No secrets, tokens,
  private IDs, or replay corpus text were recorded.
- ARGUS accepts the migration `031` staging apply/proof closeout, 2026-06-14:
  reviewed MIMIR's sanitized evidence and re-probed public
  `/health/deployment`. The public deployment probe returned 200/`ok:true`/
  `ready:true`, served app-code SHA prefix `d924a0b0d4f7`, branch `main`,
  environment `production`, and database/migrations/storage readiness `true`.
  ARGUS did not touch pooler credentials; DB duplicate-group and unique-index
  proof rests on MIMIR's sanitized transaction/smoke record. No follow-up
  repo-side blocker was found.
- ARGUS accepts the `/forums` category badge overflow fix, 2026-06-14:
  commit `202d393` changed only `apps/web/app/forums/page.tsx`, replacing the
  overflowing literal `Replies` badge text with a compact decorative marker and
  adding `minWidth: 0` to the category text column. Forum category loading,
  links, routes, auth, moderation, reports, backend API behavior, and visibility
  rules are unchanged. Web typecheck, web lint with existing unrelated warnings,
  and `git diff --check 202d393^..202d393` passed. DAEDALUS's browser evidence
  reports no badge overflow/title collision at `1365x900` or `390x844`.
- MIMIR opens Discern UI/UX parity closeout for ARIADNE, 2026-06-14:
  `docs/roadmap/DISCERN_UI_PARITY_CLOSEOUT_MIMIR.md` records the refreshed
  source truth. Discern `origin/main` remains at `037d491`, so there is no new
  upstream UI drift beyond the already audited branch. MIMIR's current verdict:
  accepted staging parity is complete enough through public shell, entry/
  onboarding copy, Discover search clarity, and parked nav/search IA. Remaining
  Discern clues are intentionally future, parked, or rejected: left rail,
  direct Discover page port, runtime kindling helpers, notes/global archive,
  persona-chat save/pin affordances, fake fallback content, broad CSS, package
  drift, backend/config deletions, and migration replacement. ARIADNE should
  verify whether one exact missing Discern UX slice still blocks staging
  rehearsal; otherwise MIMIR should close the Discern parity sweep and return to
  replay/staging proof work.
- ARIADNE accepts Discern UI/UX parity closeout for staging, 2026-06-14:
  `docs/roadmap/DISCERN_UI_PARITY_CLOSEOUT_ARIADNE.md` confirms there is no
  exact missing Discern UX slice that should block staging rehearsal. Public
  shell, entry/onboarding, Discover search, and nav/search IA were adapted or
  deliberately parked; notes/global archive, runtime kindling metadata, persona
  chat save/pin affordances, mobile nav polish, and richer public presentation
  remain future named lanes rather than generic Discern parity work. MIMIR can
  close the Discern UI sweep for staging and return to replay rehearsal,
  billing/Stripe proof, hosted-flow feedback, and concrete live issues.
- MIMIR closes the Discern UI/UX parity sweep and opens
  STAGING-FINAL-REHEARSAL-SWEEP-01 for ARIADNE, 2026-06-14:
  `docs/roadmap/STAGING_FINAL_REHEARSAL_SWEEP_MIMIR.md` asks ARIADNE to run the
  current accepted staging route as a final UX/rehearsal sweep now that Discern
  parity, billing test-mode activation UX, interaction cleanup, Archive wording,
  and moderation report idempotency are all accepted or proven. This is not a
  new generic parity lane. ARIADNE must classify each issue as pass, future
  polish, DAEDALUS blocker, or ARGUS security/visibility concern, and must wake
  MIMIR, DAEDALUS, or ARGUS with an explicit verdict path. Do not go quiet
  without a wakeup.
- ARIADNE accepts the final hosted staging rehearsal sweep, 2026-06-14:
  `docs/roadmap/STAGING_FINAL_REHEARSAL_SWEEP_ARIADNE.md` records a sanitized
  API and Chrome/CDP pass across public entry, Discover, public Space/document/
  forum, public and owner Developer Space surfaces, Studio, Memory, Continuity,
  Archive, export readback, Billing, Settings/observability, and mobile Studio/
  Memory/Archive/Continuity. Verdict: pass for human rehearsal. No DAEDALUS
  blocker or ARGUS security/visibility concern was found. Future polish remains
  narrow: seeded Archive import/library is visibly thin, and Developer Space
  methodology/field-log storytelling is thin because the seed has live state but
  no linked public documents. MIMIR should open `STAGING-DEMO-HUMAN-01` and keep
  Redis, Cloudflare, background jobs, broad export/billing expansion, and generic
  Discern parity out of scope unless new human-rehearsal evidence demands them.
- MIMIR accepts STAGING-FINAL-REHEARSAL-SWEEP-01, 2026-06-14:
  current repo-side staging posture is pass for human rehearsal. No builder or
  hostile-review lane is open from the final sweep. The next actor is Marty for
  `STAGING-DEMO-HUMAN-01`, using
  `docs/roadmap/STAGING_DEMO_NARRATIVE_ARIADNE.md`; capture only user-facing
  friction, narrative gaps, missed transitions, and concrete blockers. Keep
  Redis, Cloudflare, background jobs, full workspace/PDF/binary export, broad
  billing expansion, and generic Discern parity out of scope unless the human
  rehearsal produces new evidence.
- MIMIR opens STAGING-HUMAN-ROUTE-IMPLEMENTATION-01 for ARIADNE, 2026-06-14:
  Marty reported that the app did not remember the user despite no intentional
  logout, and asked ARIADNE to use the human routes for the remaining public
  chain, Continuity, Archive caveat, and Developer Space storytelling checks.
  `docs/roadmap/STAGING_HUMAN_ROUTE_FOLLOWUP_MIMIR.md` records the exact
  human-route implementation pass. This is not an auth-only fix lane: current
  code stores a localStorage session and 30-day auth cookie, but does not appear
  to use the stored refresh token to renew expired access tokens before clearing
  the session, so ARIADNE should test same-browser persistence with sanitized
  booleans and wake DAEDALUS if it fails without explicit sign-out. ARIADNE
  should also inspect the `/forums` category layout from Marty's screenshot
  where `Replies` appears visually oversized/colliding, and should judge the
  wider complaint that the landing page has the intended Discern/Station feel
  while the rest of the product still looks generic or vibe-coded. If that
  broader visual problem is real, ARIADNE should wake MIMIR with a ranked
  route-specific UX implementation plan or wake DAEDALUS with the first exact
  slice. Do not go quiet without a wakeup.
- ARIADNE completes STAGING-HUMAN-ROUTE-IMPLEMENTATION-01, 2026-06-14:
  `docs/roadmap/STAGING_HUMAN_ROUTE_REVIEW_ARIADNE.md` records a hosted Chrome
  pass over the public chain, forum route, UI sign-in/auth persistence,
  Continuity stop, Archive/Developer Space caveats, and cross-surface design
  coherence. Immediate same-profile auth persistence did not reproduce Marty's
  logout issue: localStorage session, `station-auth` cookie, signed-in nav,
  `/auth/me`, and `/studio` access stayed true after refresh, navigation away/
  back, and same-profile browser reopen. One DAEDALUS blocker is real:
  `/forums` category cards put the literal word `Replies` inside a 42px badge,
  causing visible overflow/collision, especially at 390 x 844. The broader
  design mismatch is also real and should be sliced: first fix `/forums`, then
  have MIMIR sequence public front door/signed-in Discover coherence, forum
  hierarchy, public Space/document/discussion, Developer Space storytelling, and
  Studio continuity/archive narrative polish.
- ARGUS requires a follow-up for the `/writing` filter wiring, 2026-06-14:
  commit `710b1ad` keeps scope narrow to
  `apps/web/components/writing/writing-index.tsx` and passes web typecheck,
  web lint, `test:community`, and `git diff --check`. Latest mode, Staff picks,
  type chips, and text search are now real component state. One blocker remains:
  the Featured tab fetches `/discover/feed?tab=featured`, whose current API
  contract returns raw `discover_feed` rows shaped as
  `item_type`/`item_id`/`created_at`, while `WritingIndex` filters on
  `item.type === "document"` and renders normalized `meta`/`createdAt` fields.
  Featured writing can therefore show an empty state even when curated featured
  document rows exist. DAEDALUS should either map raw featured rows safely in
  `/writing` or normalize the featured feed response with matching tests,
  preserving the existing public/community visibility rules.
- ARGUS accepts the `/writing` featured feed follow-up, 2026-06-14: commit
  `b4e0396` keeps the repair client-side by adding a small
  `writing-feed` normalizer and `test:writing`. Normalized document feed rows
  still pass through, raw curated `discover_feed` document rows now render on
  `/writing`, and non-document curated rows stay out of the writing surface.
  ARGUS reran web typecheck, web lint, `test:writing`, `test:community`, and
  `git diff --check b4e0396^..b4e0396`; all passed, with only the existing
  unrelated lint warnings. No backend route, auth, persistence, visibility,
  moderation, billing, provider, migration, or Discover feed policy changed.
- MIMIR accepts the `/writing` controls and Featured follow-up for the staging
  UX lane, 2026-06-14: ARGUS accepted `b4e0396`; `/forums` badge repair is
  already accepted at `cdfc99e`. The concrete "none of these buttons work"
  issue is closed for `/writing`, with `test:writing` now covering the featured
  writing-feed normalizer.
- MIMIR opens PUBLIC-DISCOVER-COHERENCE-01 for DAEDALUS, 2026-06-14:
  `docs/roadmap/PUBLIC_DISCOVER_COHERENCE_MIMIR.md` defines the next visual
  coherence slice. Target is `/discover`, because Marty correctly noted `/`
  has the intended Discern/Station front-door feel while signed-in `/discover`
  still falls back into a dark, card-stacked generic shell. DAEDALUS should
  align `/discover` with the public/editorial Station language from `/` while
  preserving Discover tabs, search semantics, public/community copy, private
  Studio exclusion, routeable result behavior, and backend/auth/feed policy.
  ARGUS reviews first, then ARIADNE performs browser/product review.
- ARGUS accepts PUBLIC-DISCOVER-COHERENCE-01 for product/browser review,
  2026-06-14: commit `037b224` changes only
  `apps/web/components/discover/discover-front-door.tsx` and
  `apps/web/app/globals.css`. The route keeps the same `restoreSession` flow,
  token-aware feed/search/sidebar calls, routeable public search helper,
  Discover tabs, public/community copy, and private Studio archive/memory/
  canon/import/continuity exclusion language. Validation passed for the
  search-dropdown tests, web typecheck, web lint, `test:community`, and
  `git diff --check 037b224^..037b224`. ARGUS did not independently run a
  browser pass; DAEDALUS recorded desktop/mobile anonymous and signed-in local
  browser evidence. ARIADNE should now judge visual/product quality, mobile
  polish, and the Featured tab with real or representative curated rows before
  MIMIR closes the slice.
- ARIADNE accepts PUBLIC-DISCOVER-COHERENCE-01 for MIMIR closeout,
  2026-06-14: `docs/roadmap/PUBLIC_DISCOVER_COHERENCE_REVIEW_ARIADNE.md`
  records a local patched browser pass with the staging API across anonymous
  and signed-in `/discover` on desktop and mobile. The route now reads as a
  public continuation of `/` rather than the old dark dashboard shell. Search
  for `replay` produced routeable Developer Space, Space, and document results
  with no Personas/private bucket; anonymous and signed-in helper copy preserved
  the public/community/private-Studio boundary; New/Rising/Featured tabs were
  usable in the seeded state; and mobile showed no document-level overflow.
  No DAEDALUS blocker or ARGUS concern remains for this Discover coherence
  slice. Global mobile nav density and future featured-feed curation quality
  stay as future polish.
- ARGUS accepts the broad Station visual language pass for ARIADNE replay,
  2026-06-14: commit `48c2a9d` moves Writing, Forums, Billing/Pricing,
  Developer Spaces, Settings, public Space list, public document detail, and
  shared Studio/Space surfaces toward the off-white Station system. ARGUS
  found no route, auth, persistence, visibility, moderation, billing, provider,
  migration, or feed-policy changes, and validation passed for web typecheck,
  web lint, Discover search tests, writing-feed tests, `test:community`, and
  `git diff --check 48c2a9d^..48c2a9d`. Risk remains product/visual rather
  than data-policy: `globals.css` now contains broad legacy inline-style
  catchers and Studio/Space surface restyling that reaches protected Studio and
  Developer manage surfaces. ARIADNE should replay the human routes on staging
  with real data, including signed-in Studio, Settings, Developer manage,
  public Space/document, and mobile overflow checks, before MIMIR treats this
  visual reconciliation as closed.
- ARGUS accepts the login persistence refresh patch for staging replay,
  2026-06-14: commit `b28df71` adds `POST /auth/refresh` and makes web session
  restoration refresh a stored refresh token once before clearing local auth
  state. ARGUS added one narrow client hardening change before closeout:
  `signOut()` now calls `restoreSession()` before `/auth/signout`, so an
  expired stored access token can be refreshed and revoked server-side instead
  of only clearing local state. Validation passed for `test:auth`, API
  typecheck, web typecheck, web lint, and `git diff --check`. ARIADNE should
  verify same-browser login persistence after deployment with sanitized
  booleans only, including refresh-after-expiry and explicit signout behavior.
- ARIADNE accepts the broad visual replay for MIMIR closeout, 2026-06-14:
  `docs/roadmap/BROAD_VISUAL_REPLAY_REVIEW_ARIADNE.md` records public,
  community, private Studio, Developer manage, Settings, Billing, public Space,
  public document, and mobile browser checks against the patched local web app
  with the Railway API observed from the browser client. Public/community/
  private copy boundaries held; Discover search stayed routeable without a
  private Persona bucket; Developer manage remained usable on desktop/mobile;
  public document detail settled with the seeded discussion attached; and no
  route-level mobile overflow was found. Future polish remains for the visually
  hybrid protected Studio workbench and dense mobile top nav, but ARIADNE found
  no DAEDALUS blocker for the broad visual language closeout.
- ARIADNE accepts the login persistence refresh/signout flow for MIMIR closeout,
  2026-06-14: `docs/roadmap/AUTH_PERSISTENCE_REVIEW_ARIADNE.md` records a
  sanitized browser pass for real `/login?redirect=/studio` form submission,
  same-browser `/studio` reload persistence, refresh-after-expiry by replacing
  the stored access token with a sentinel, explicit account-menu signout with a
  bad stored access token, and protected `/studio` redirect after signout. The
  flow preserved session/cookie state through refresh, changed the bad access
  token away from the sentinel, refreshed before `/auth/signout`, cleared local
  session and cookie after signout, and redirected signed-out protected access
  to `/login?redirect=%2Fstudio`.
- MIMIR closes the visual/auth replay decision from `872ef1a`, 2026-06-14:
  the visually hybrid protected Studio workbench and dense mobile top nav are
  future post-V3 polish, not current replay blockers. ARIADNE accepted the
  broad visual replay and auth persistence replay; no DAEDALUS/ARGUS lane
  should be opened from those polish notes unless new human rehearsal evidence
  shows functional blockage, private/public leakage, or route-level mobile
  overflow. Default next work returns to concrete staging/deployment proof and
  user-found defects.
- MIMIR answers DAEDALUS's deployment identity blocker from `77ff57e`,
  2026-06-14: accept public API deployment identity `64b664e` as sufficient for
  the current replay gate because it includes the actual replay-affecting code:
  broad visual code from `48c2a9d`, auth refresh from `b28df71`, and signout
  revocation hardening from `64b664e`. The later `872ef1a`, `9b8a470`, and
  `77ff57e` commits are docs/decision/proof commits and do not require a
  Railway redeploy by themselves. Web `/health/deployment` returning 404 is a
  proofability gap, not a replay blocker; open a narrow DAEDALUS follow-up to
  expose non-secret web deployment identity for future checks.
- ARGUS accepts the web deployment identity endpoint, 2026-06-14: commit
  `be13573` adds `apps/web/app/health/deployment/route.ts` and a small
  `deployment-identity` helper that whitelists Railway commit/service metadata
  only. The route returns `ok:true`, `ready:true`, `generatedAt`, and nullable
  identity fields; it does not list environment variables, use Railway tokens,
  expose secret-like values, or change auth/search/billing/provider/persistence
  behavior. Validation passed for `test:health`, web typecheck, web lint, and
  `git diff --check be13573^..be13573`. MIMIR can use this as the safe web
  proof target after deployment catches up.
- MIMIR closes the web deployment proof lane, 2026-06-14: live
  `https://stationweb-production.up.railway.app/health/deployment` returned
  `200`, `ok:true`, `ready:true`, and `railwayGitCommitSha` at `be13573`, so the
  Railway web service is serving the non-secret deployment identity endpoint.
  The staging proof lane is closed; next work returns to ARIADNE's human replay
  across public, Studio, continuity, archive, export, Developer Space, and
  billing paths. Do not run a full triad deployment ceremony after every change;
  only use deployment proof for staging-affecting code or live regression fixes.
- ARIADNE accepts the live staging replay after web deployment proof,
  2026-06-14: `docs/roadmap/LIVE_STAGING_REPLAY_REVIEW_ARIADNE.md` records a
  hosted Chrome/CDP pass against `https://stationweb-production.up.railway.app`.
  The public chain from `/` to Discover, public Space, public document, and
  linked forum discussion settled; signed-in Studio preserved session/cookie
  state after reload; Memory, Continuity, Archive, export manifest/bundle,
  Developer Space observer/manage, Billing, Stripe Portal, and Stripe Checkout
  test paths all passed within current staging scope. A stricter follow-up
  proved the Developer Space observer route was not stuck on `Opening
  observatory...`; anonymous and signed-in observer views both rendered the
  seeded public observatory. No DAEDALUS blocker or ARGUS visibility/security
  concern remains. Future polish is limited to thin seeded Archive/import
  material, thin Developer Space methodology/story documents, and dense global
  mobile navigation.
- MIMIR corrects the staging replay handoff, 2026-06-14: Marty is not the next
  worker for broad checking. ARIADNE owns the human rehearsal from a human eye
  view using browser/tool evidence. `docs/roadmap/ARIADNE_HUMAN_REHEARSAL.md`
  lists the exact controls, routes, buttons, forms, keyboard paths, visual
  regressions, and public/private boundaries to check. No DAEDALUS
  implementation lane is open until ARIADNE reports concrete defects.
- ARIADNE completes the human rehearsal and finds a narrow DAEDALUS
  settings-control defect, 2026-06-14:
  `docs/roadmap/ARIADNE_HUMAN_REHEARSAL_REVIEW.md` records hosted browser/tool
  evidence across anonymous public routes, the public Space/document/forum
  chain, Writing, Forums, public Developer Space observer, real-keystroke
  login, signed-in Studio/persona routes, Archive/export, Developer manage,
  Billing/Stripe test paths, and mobile checks. Verdict: do not hand back to
  Marty; open DAEDALUS for `/settings` placeholder controls. Profile, Privacy,
  and Notifications cards self-route to `/settings`; `Edit profile` and
  `Delete account` are enabled no-op buttons; notification preference
  checkboxes toggle locally without saved, unsaved, or persistence feedback.
  Product note: the `/discover` rehearsal brief names writing-style tabs/chips
  that live on `/writing`; MIMIR can decide later whether to retitle the brief
  or change Discover.
- ARGUS accepts the `/settings` placeholder safety patch, 2026-06-14: commit
  `d34f92e` changes only `apps/web/app/settings/page.tsx`. Profile, Privacy,
  and Notifications cards no longer self-link back to `/settings`; they render
  as coming-soon unavailable cards. Profile edit, notification preferences, and
  account deletion controls are disabled with explicit unavailable or
  persistence copy. No auth, billing, Stripe, privacy/visibility,
  storage/quota, archive/export, provider, migration, package, or persistence
  semantics changed. Validation passed for web typecheck, web lint with
  existing unrelated warnings, and `git diff --check d34f92e^..d34f92e`. MIMIR
  can close the settings rehearsal defect or choose the next bounded
  staging/human-rehearsal lane.
- MIMIR confirms the `/settings` fix is deployed, 2026-06-14: live
  `/health/deployment` returned web `railwayGitCommitSha` at `d34f92e`, so the
  staging web service is serving the placeholder-safety patch. The original
  settings defect is closed for code/review; ARIADNE should run one narrow live
  human-eye recheck of `/settings` only, then wake MIMIR with pass/fail. Do not
  broaden this into another full rehearsal unless the narrow recheck finds a
  concrete defect.
- ARIADNE completes the narrow live `/settings` recheck, 2026-06-14:
  `docs/roadmap/SETTINGS_PLACEHOLDER_RECHECK_ARIADNE.md` records a hosted
  Chrome/CDP desktop and mobile pass against Railway web at deployment
  `d34f92e`. The placeholder-control behavior is fixed: Profile, Privacy, and
  Notifications are no longer self-links; profile edit, notification
  preferences, and account deletion are disabled or clearly unavailable. A
  narrow DAEDALUS defect remains on mobile: at `390 x 844`, the right-side
  settings panels visually overlap the settings-card grid instead of stacking,
  obscuring the newly fixed coming-soon cards. Patch only `/settings`
  responsive layout and preserve the placeholder-safety behavior.
- MIMIR reissues the `/settings` mobile-overlap wakeup for DAEDALUS,
  2026-06-14: A2 has not yet consumed `3ac28be`. This is not a new lane; it is
  the same narrow implementation task: fix only the signed-in `/settings`
  responsive layout at phone width, preserve the placeholder-safety behavior,
  and wake ARGUS for review.
- ARGUS accepts the `/settings` mobile layout repair, 2026-06-14: commit
  `bfe60aa` changes only `apps/web/app/settings/page.tsx`. The fixed two-column
  settings shell is now a wrapping flex layout; the settings-card grid uses
  `minmax(min(100%, 240px), 1fr)`, and both main and aside columns set
  `minWidth: 0`, removing the phone-width fixed-minimum overlap risk. The
  prior coming-soon cards and disabled profile, notification, and deletion
  controls remain intact. No auth, billing, Stripe, privacy/visibility,
  storage/quota, archive/export, provider, migration, package, or persistence
  semantics changed. Validation passed for web typecheck, web lint with
  existing unrelated warnings, and `git diff --check bfe60aa^..bfe60aa`.
- MIMIR confirms the `/settings` mobile layout repair is deployed,
  2026-06-14: live `/health/deployment` returned web `railwayGitCommitSha` at
  `bfe60aa`, so staging is serving the responsive layout patch. ARIADNE should
  run one narrow human-eye phone-width recheck of signed-in `/settings` only,
  confirming the right-side panels stack or wrap without obscuring the
  settings-card grid while the placeholder-safety behavior remains intact.
- ARIADNE accepts the deployed `/settings` mobile layout repair,
  2026-06-14:
  `docs/roadmap/SETTINGS_MOBILE_LAYOUT_RECHECK_ARIADNE.md` records a narrow
  phone-width live recheck against Railway web at deployment `bfe60aa`. The
  settings-card grid and right-side settings panels no longer overlap at
  `390 x 844`; geometry checks found no card/panel intersections and document
  width stayed within the viewport. The earlier placeholder-safety behavior
  remains intact: Profile, Privacy, and Notifications are unavailable
  coming-soon cards, profile edit and account deletion are disabled, and
  notification preferences stay disabled with non-persistence copy. No
  DAEDALUS defect remains from this narrow recheck.
- MIMIR closes the `/settings` placeholder/mobile follow-up, 2026-06-14:
  ARIADNE's deployed phone-width recheck passed and did not require DAEDALUS.
  The settings placeholder-control defect and mobile overlap defect are closed.
  Do not reopen this lane unless a fresh human-eye run finds a new concrete
  `/settings` defect.
- MIMIR adds the backend/product PR sequence, 2026-06-15:
  `docs/roadmap/STATION_BACKEND_PRODUCT_PR_PLAN.md` is the source-of-truth plan
  for PR 0 through PR 6 after the accepted staging replay. PR 0 is active:
  staging alpha closure plus source/live evidence alignment. Broad UI remains
  closed unless ARIADNE finds a concrete staging-facing defect; Redis working
  memory, Cloudflare retrieval, and workers stay deferred unless replay evidence
  forces a bounded lane.
- PR 0 DAEDALUS closure/evidence alignment is ready for ARGUS review,
  2026-06-15: `docs/roadmap/STAGING_ALPHA_CLOSURE_STATUS.md` records the
  current alpha-proof boundary, source references, sanitized Railway/Supabase/
  Gemini/NVIDIA/Stripe/Redis readiness claims, live web/API health and
  deployment identity checks at `bfe60aa`, and PR 0 validation. This is not a
  product-complete backend claim; PR 1 replay memory/retrieval quality remains
  unstarted until ARGUS accepts the closure doc or requests fixes.
- PR 0 is accepted by ARGUS, 2026-06-15: the staging alpha closure/evidence
  document is conservative enough to close the accepted replay as alpha-proof,
  not as product-complete backend status. ARGUS revalidated health,
  replay-readiness, API build, the documented Windows web-build symlink failure,
  live web/API health and deployment identity at `bfe60aa`, and the
  unauthenticated replay-readiness `401` boundary. Secret-pattern review found
  no new exposed secret values in the PR 0 docs. PR 1 replay memory/retrieval
  quality is clear for MIMIR to open.
- MIMIR opens PR 1 replay memory/retrieval quality, 2026-06-15:
  `docs/roadmap/PR1_REPLAY_MEMORY_RETRIEVAL_QUALITY.md` defines the bounded
  lane. Goal: make the next replay prove Station remembered the right thing,
  ignored the wrong thing, and explained why. Scope stays inside the existing
  Gemini/OpenAI-compatible 1536-dim retrieval path; Redis memory truth,
  Cloudflare primary retrieval, workers, vector-dimension changes, broad UI,
  and private excerpt telemetry are explicitly out of scope.
- PR 1 DAEDALUS retrieval-quality slice is ready for ARGUS review,
  2026-06-15: persona runtime context now includes replay-safe retrieval trace
  metadata for selected source ids/titles/reasons, memory lifecycle skip counts,
  archive unauthoritative skips, retrieval/fallback mode, and the active
  `station_free_1536` Gemini embedding profile. The focused fixture proves the
  owner-selected memory/archive/canon context wins while rejected,
  quarantined, expired, superseded, and other-owner material stays out of
  runtime context and out of trace excerpts. Caveat: this slice improves
  explainability and skip accounting; deeper ranking/relevance tuning remains
  future PR 1 follow-up only if ARGUS/MIMIR asks for it.
- PR 1 first retrieval-trace slice is accepted by ARGUS, 2026-06-15: commit
  `94ee971` adds replay-safe context trace metadata and keeps private excerpts
  out of the trace. ARGUS patched one hostile-review edge before acceptance:
  owner-facing context traces now redact `other_owner_or_missing` skip counts
  and subtract those hidden candidates from `searched.memory`, so vector search
  cannot reveal cross-owner or stale hidden-candidate counts through metadata.
  Validation passed for persona-context, conversation-archive, continuity,
  retrieval-metadata, API build, and whitespace checks. Verdict: accept this
  explainability/skip-accounting slice, but PR 1 should continue with a
  ranking/relevance follow-up rather than close.
- MIMIR opens the PR 1 ranking/relevance follow-up, 2026-06-15:
  `docs/roadmap/PR1_RETRIEVAL_RANKING_FOLLOWUP.md` defines the bounded next
  slice. Goal: make the intended replay memory, continuity, or archive source
  rank ahead of distractors while rejected/quarantined/expired/superseded and
  other-owner material stays out. This remains inside existing Gemini/OpenAI-
  compatible 1536-dim retrieval; no Redis memory truth, Cloudflare retrieval,
  workers, provider switch, re-embed/backfill, broad UI, or private excerpt
  telemetry is in scope.
- PR 1 DAEDALUS ranking follow-up is ready for ARGUS review, 2026-06-15:
  keyword memory fallback now gives a small local relevance boost to exact
  phrase matches and title/summary matches, so an intended replay anchor can
  outrank a high-weight generic distractor without changing providers,
  dimensions, Redis, Cloudflare, workers, or backfill behavior. The focused
  retrieval fixture proves the exact replay anchor wins, the tempting distractor
  remains second, and rejected/quarantined/expired/superseded material is
  counted as skipped without entering selected trace metadata.
- PR 1 ranking follow-up is accepted by ARGUS, 2026-06-15: commit `f86e2c9`
  keeps the change inside keyword fallback ranking and tests the intended replay
  anchor against a high-weight distractor plus rejected/quarantined/expired/
  superseded candidates. Owner scoping, hidden-candidate redaction, trace shape,
  vector provider, vector dimension, Supabase RPC contract, Redis, Cloudflare,
  workers, re-embed/backfill, chat routing, and billing remain unchanged.
  Validation passed for retrieval-metadata, persona-context,
  conversation-archive, continuity, API build, and whitespace checks. Verdict:
  PR 1 can close for bounded trace/ranking scope; future vector-RPC scoring or
  backfill work should require fresh replay evidence.
- MIMIR closes PR 1 and opens PR 2 archive/import robustness, 2026-06-15:
  PR 1 is accepted for bounded trace/ranking scope; future vector-RPC scoring or
  backfill work requires fresh replay evidence. `docs/roadmap/PR2_ARCHIVE_IMPORT_ROBUSTNESS.md`
  defines the next bounded lane. Goal: prevent bad imports from poisoning
  memory/retrieval. Scope is idempotency, duplicate handling, partial-failure
  visibility, and retrieval behavior after clean/failed imports. Full worker
  queues, broad async orchestration, Redis memory truth, Cloudflare retrieval,
  provider switches, vector-dimension changes, broad UI, and private excerpt
  telemetry remain out of scope.
- PR 2 DAEDALUS archive/import robustness slice is ready for ARGUS review,
  2026-06-15: duplicate pasted-chat imports now reuse an existing completed
  chat import for the same owner, persona, and source name when authoritative
  archive rows already exist. The duplicate response is explicit
  (`duplicate:true`, `idempotent:true`) and creates no new import job or memory
  rows. Existing partial-failure and retry fixtures remain green, including
  failed import status visibility, sanitized private error redaction, retry
  reuse, and source-authoritative archive retrieval.
- PR 2 chat-import idempotency slice is accepted by ARGUS, 2026-06-15: commit
  `daa66ca` is accepted after ARGUS patched one data-loss edge. Generic
  blank-UI source names (`pasted-chat`, `pasted-archive`) no longer trigger
  source-name dedupe, so separate unnamed pasted archives are not silently
  collapsed. Explicit source-name duplicates still reuse a completed chat import
  only when authoritative archive rows exist. Validation passed for storage,
  conversation-archive, persona-context, API build, and whitespace checks.
  Verdict: PR 2 should continue with a file-import/register idempotency
  follow-up rather than close.
- MIMIR opens the PR 2 file-register idempotency follow-up, 2026-06-15:
  `docs/roadmap/PR2_FILE_IMPORT_REGISTER_IDEMPOTENCY_FOLLOWUP.md` defines the
  next bounded slice. Goal: retrying `POST /persona-files/persona/:personaId/register`
  with the same owner/persona `storagePath` must not double-charge storage,
  create duplicate file rows, create duplicate import jobs, or process the same
  uploaded source twice. Guardrail: do not dedupe by `fileName` alone, because
  same-name files at different storage paths are valid separate uploads.
- PR 2 DAEDALUS file-register idempotency follow-up is ready for ARGUS review,
  2026-06-15: `POST /persona-files/persona/:personaId/register` now treats an
  exact owner/persona/storagePath retry as an explicit duplicate/idempotent
  response before reserving storage. It reuses the existing file and safe import
  job, repairs a missing file import job without charging bytes again, or
  reports `importJobAmbiguous:true` instead of guessing when same-name file jobs
  make the current job shape ambiguous. The fixture proves exact-path retry adds
  no storage, file row, import job, or processing pass; same filename at a
  different path still registers; same path under another persona does not
  reuse; and another owner cannot reuse the original persona's registration.
- PR 2 file-register idempotency follow-up is accepted by ARGUS, 2026-06-15:
  commit `a651c7f` is accepted after ARGUS patched one lookup-failure edge.
  Duplicate file and import-job lookups now fail closed instead of falling
  through into fresh registration or repair-job creation when reads fail.
  Validation passed for storage, conversation-archive, persona-context, API
  build, and whitespace checks. Verdict: PR 2 can close for alpha replay/import
  robustness. Future hardening should treat database uniqueness/concurrent
  retry guarantees and a direct `import_jobs.persona_file_id` association as
  separate infrastructure work.
- MIMIR closes PR 2 and opens PR 3 Stripe paid-path proof, 2026-06-15:
  PR 2 is accepted for alpha replay/import robustness. `docs/roadmap/PR3_STRIPE_PAID_PATH_PROOF.md`
  defines the next bounded lane. Goal: prove one Stripe test-mode paid
  subscription activation path through Checkout Sessions plus verified webhook
  entitlement sync, or reconcile existing accepted evidence if it already proves
  the current staging/code state. Guardrails: no live-money billing, no
  fabricated subscription state, no billing UX redesign, no new pricing/tier
  strategy, and no secret/URL/customer/subscription/replay identifiers in docs.
- PR 3 DAEDALUS reconciliation is ready for ARGUS review, 2026-06-15:
  `docs/roadmap/PR3_STRIPE_PAID_PATH_RECONCILIATION.md` reconciles current main
  against the accepted `STAGING-DEMO-STRIPE-01` proof. Existing source-backed
  evidence already shows staging Stripe test-mode paid activation moved the
  replay owner from inactive/no subscription to active/subscription present,
  and ARGUS previously confirmed entitlement mutation is verified-webhook gated
  rather than browser-redirect inferred. Current code still uses subscription
  Checkout, signed webhook processing, profile entitlement sync, and separate
  token top-up grants. Focused validation passed for billing, token credits, API
  build, health, replay-readiness, and whitespace. ARGUS should now review for
  overclaim/sanitization risk and either accept PR 3 or name a precise evidence
  gap.
- PR 3 Stripe paid-path reconciliation is accepted by ARGUS, 2026-06-15:
  current code still matches the accepted `STAGING-DEMO-STRIPE-01` proof:
  subscription-mode Checkout creates hosted Billing sessions without granting
  entitlement, signed webhooks gate subscription mutation, active unknown Price
  IDs and customer/profile mismatches fail closed, and token-credit top-ups
  remain separate payment-mode grants. No second hosted Checkout payment was
  run in this pass, and no Stripe identifiers, URLs, secrets, raw webhook
  bodies, owner identifiers, tokens, cookies, payment details, or replay
  credentials were added. Validation passed for billing, token credits, API
  build, health, replay-readiness, and whitespace. Verdict: PR 3 can close for
  bounded Stripe test-mode paid activation proof only.
- MIMIR closes PR 3 and opens PR 4 Redis operational boundary hardening,
  2026-06-15: `docs/roadmap/PR4_REDIS_OPERATIONAL_BOUNDARY.md` defines the next
  bounded lane. Goal: keep Redis/Valkey/Upstash useful and boring for cache,
  idempotency, rate-limit, and short-lived queue state. Current-lane guardrail:
  do not silently treat Redis as canonical memory; future Redis-backed memory or
  working-memory design remains a separate durability/export/deletion/audit
  decision, not a blanket rejection.
- PR 4 DAEDALUS Redis operational boundary result is ready for ARGUS review,
  2026-06-15: `/health/deployment` now reports non-secret operational-cache
  provider status under `readiness.redis.operationalCache`; Upstash REST remains
  the current live adapter path, TCP Redis/Valkey is detected but disabled with
  `tcp_redis_configured_without_client`, and missing config fails closed.
  `/observability/replay-readiness` now treats the operational-cache boundary
  as setup-proven rather than a replay blocker. `.env.example` names optional
  TCP Redis/Valkey and Upstash REST variables with the current provider caveat.
  Redis/Valkey/Upstash remains cache/idempotency/rate-limit/short-lived queue
  infrastructure only; canonical memory stays out of scope pending a separate
  durability/export/deletion/audit decision. Validation passed for
  operational-cache, health, replay-readiness, API build, and whitespace.
- PR 4 Redis operational boundary result is accepted by ARGUS, 2026-06-15:
  readiness status remains non-secret, TCP Redis/Valkey config fails closed as
  configured-but-disabled without a concrete TCP client, Upstash REST is the
  only enabled provider path, cache keys stay environment and owner/persona/
  Developer Space scoped, TTLs remain short and purpose-specific, and
  replay-readiness no longer overstates cache-provider selection as a blocker.
  ARGUS patched one adjacent staging-readiness truth row so Stripe mode no
  longer contradicts the accepted PR 3 paid activation proof. Verdict: PR 4 can
  close for bounded Redis/Valkey/Upstash operational-cache boundary hardening;
  Redis-backed memory remains a future durability/export/deletion/audit lane.
- MIMIR closes PR 4 and opens PR 5 Developer Space provider policy,
  2026-06-15: `docs/roadmap/PR5_DEVELOPER_SPACE_PROVIDER_POLICY.md` defines the
  next bounded lane. Goal: make Developer Space provider/data routing explicit
  enough that staging cannot quietly send the wrong context to the wrong
  provider. Scope is provider posture explanation and policy hardening only:
  Gemini `station_free_1536` embeddings, OpenAI-compatible rollback profile,
  NVIDIA platform chat when configured, DeepSeek fallback, and private-archive
  allow/deny gates must be explainable without exposing secrets.
- PR 5 DAEDALUS Developer Space provider policy result is ready for ARGUS
  review, 2026-06-15: the existing owner-only
  `/developer-spaces/:id/provider-policy/evaluate` surface now returns a
  non-secret `decision.posture` object explaining provider policy, requested
  context, provider mode, selected provider route label, private archive gate,
  active Gemini `station_free_1536` embedding profile, and OpenAI-compatible
  rollback assumptions. Sanitized AI observability now includes the same
  posture metadata. The provider router exposes a small
  `describePlatformProviderRoute` helper so NVIDIA OpenAI-compatible chat and
  DeepSeek fallback are explainable by label without exposing keys or URLs.
  Private archive context remains denied unless `private_archive_allowed` is
  explicit, and `owner_byok_only` still fails closed for platform mode.
  Validation passed for Developer Spaces, provider-router, replay-readiness, API
  build, and whitespace.
- PR 5 Developer Space provider policy result is accepted by ARGUS,
  2026-06-15: the evaluation surface explains provider posture with non-secret
  labels, booleans, policy codes, dimensions, and allow/deny reasons only.
  Private archive still requires explicit `private_archive_allowed`, and
  `owner_byok_only` still denies platform mode. NVIDIA OpenAI-compatible chat
  and DeepSeek fallback remain labels, not exposed keys or URLs. Active
  embedding posture remains `station_free_1536` / `gemini` / `1536`, with
  `openai_1536` recorded only as paid or rollback assumption. Sanitized AI
  observability carries posture metadata only. Verdict: PR 5 can close for
  provider/data routing explanation and policy hardening; marketplace, BYOK
  storage, provider billing, provider switching, private archive provider calls,
  Redis, Cloudflare, workers, Stripe, archive/import, and UI work remain out of
  scope.

- MIMIR closes PR 5 and opens PR 6 background-job trigger audit,
  2026-06-15: `docs/roadmap/PR6_BACKGROUND_JOB_TRIGGER_AUDIT.md` defines the next
  bounded lane. Goal: avoid premature queue architecture. DAEDALUS should audit
  archive/import/export/replay evidence for a concrete worker trigger, especially
  file processing/fire-and-forget behavior, import retry/status, export readback,
  and replay route timing. If no trigger is proven, PR 6 should close as
  deferred; if a trigger is proven, name exactly one failing flow before any
  worker shell is implemented.
- PR 6 DAEDALUS background-job trigger audit is ready for ARGUS review,
  2026-06-15: current main does not prove a worker trigger. File registration
  still has a fire-and-forget immediate processing path, but accepted PR 2
  idempotency/repair behavior covers the known alpha retry pain and no
  documented replay shows unsafe completion, timeout, or unrecoverable retry
  failure. Chat imports remain synchronous with owner-scoped job status,
  sanitized errors, and retry semantics. Persona and Developer Space exports
  remain synchronous owner-only JSON/Markdown readback packages with
  failed-package visibility. Staging docs still frame archive/import/export jobs
  as protected-alpha synchronous flows. No code, route behavior, Redis,
  Cloudflare, provider, billing, archive retrieval, export scope, migration, or
  UI behavior changed.
- PR 7 DAEDALUS live replay optimization baseline is ready for ARGUS review,
  2026-06-15: live Railway web/API health, deployment readiness, replay-owner
  auth, persona lookup, context preview, private archive retrieval, owner export
  readback, observability, billing, and Developer Space routes all returned
  HTTP 200 in a sanitized single-sample measurement. Context preview used the
  accepted private-owner context shape and private archive retrieval reported
  vector mode with one chunk and no skipped sources. Observability reported four
  traces, zero failures, `5853` total tokens, `0.6045` pence estimated cost, and
  `1097` ms average latency. Billing reported tier `private` with active
  subscription status; customer/subscription fields were present but values were
  not recorded. Recommendation: no code now. No route/service, Redis/cache,
  Cloudflare, worker, provider, billing, archive, export, or UI defect was
  proven by this sample.
- PR 7 live replay optimization baseline is accepted by ARGUS, 2026-06-15: the
  sanitized single-sample measurement supports no immediate code lane. ARGUS
  found no committed private text, prompts, completions, raw response bodies,
  raw manifests, checkout/portal URLs, customer IDs, subscription IDs, owner
  IDs, persona IDs, Developer Space IDs, export IDs, trace IDs, cookies, JWTs,
  credentials, API keys, or `.env` values. Public live health probes still
  returned `ok:true` for API and web plus API deployment `ready:true`; the API
  served runtime commit `297fc0a` rather than this docs-only head, which is
  acceptable for this no-code evidence lane but must be rechecked before any
  future deployed-code proof. Verdict: close PR 7 as evidence-only/no-code and
  let MIMIR choose the next lane from evidence rather than architecture guesses.
- PR 6 background-job trigger audit is accepted by ARGUS, 2026-06-15: no
  archive/import/export/replay flow currently proves a worker trigger. The
  upload `processUploadedFile(...).catch(...)` path remains a future-trigger
  candidate, not a solved concern, but current evidence does not show concrete
  unsafe completion, timeout, or unrecoverable retry pain. Chat import
  retry/status remains owner-scoped without persisted private chat payloads, and
  persona/Developer Space exports remain synchronous owner-only JSON/Markdown
  package creation plus completed-only bundle readback. Existing LLM throttling
  and operational-cache `queue_state` support are not a broad background-worker
  implementation. Verdict: close PR 6 as no-trigger deferral; reopen workers
  only around a named failing flow with fresh evidence.
- MIMIR closes PR 6 and opens PR 7 live replay optimization baseline,
  2026-06-15: `docs/roadmap/PR7_LIVE_REPLAY_OPTIMIZATION_BASELINE.md` defines
  the next bounded lane after the backend/product foundation pass. DAEDALUS
  should measure the live Railway replay routes using ignored local replay-owner
  credentials, record only sanitized statuses/durations/counts/modes/provider
  labels, and recommend exactly one next lane or no immediate code. This is an
  evidence lane, not permission to open Cloudflare, Redis memory, workers,
  provider switching, billing expansion, export scope, archive semantics, or
  broad UI without a concrete measured finding.
- MIMIR closes PR 7 and opens PR 8 site-wide UI coherence,
  2026-06-15: `docs/roadmap/PR8_SITE_WIDE_UI_COHERENCE.md` supersedes the
  earlier too-comfortable visual closeout posture for the next active lane.
  PR 7 found no immediate backend code need, while Marty's newer human-eye
  feedback says the landing page direction has not carried through the rest of
  Station. DAEDALUS should implement a frontend-only coherence pass across the
  named public, community, Studio, Developer Space, Billing, and Settings route
  set. This is not just `/discover`, not a decorative redesign, and not a
  backend/config/auth/billing/provider lane. Live-looking controls must either
  work or stop presenting as live.
- PR 8 DAEDALUS site-wide UI coherence implementation is ready for ARGUS
  review, 2026-06-15: explicit Station page/panel/card/notice/action primitives
  now support Billing, Settings, Spaces index, Developer Spaces index, Writing,
  and Studio publishing surfaces. Studio publishing no-op actions are disabled
  and labelled unavailable while existing live forms, links, tabs, Checkout,
  portal, and Developer Space controls remain live. No backend, auth/session,
  Stripe backend, Supabase/database, provider, migration, package, or lockfile
  behavior changed. Validation is mostly green; `test:document-discussions`
  timed out twice with no completed test output even when isolated, so ARGUS
  should decide whether that current validation hang blocks PR 8 or is a
  separate test-harness issue.
- PR 8 site-wide UI coherence is accepted by ARGUS for ARIADNE rehearsal,
  2026-06-15: scope stayed inside the frontend/docs allow-list. ARGUS patched
  the new shared title/eyebrow primitives to avoid viewport-scaled type and
  nonzero letter spacing. Live controls stayed live, and Studio publishing
  no-op `Publish`, `Retry`, `View`, and `Delete` actions are disabled/labelled
  unavailable. Focused validation passed for web typecheck, web lint with
  existing warnings, studio-ui, community, Developer Spaces, Developer Space
  client, billing, and whitespace. `test:document-discussions` still times out
  in both package-script and isolated test-file forms; no API or test files
  changed in PR 8, so treat it as unrelated validation debt unless ARIADNE finds
  a document-discussion route defect. Wake ARIADNE for desktop and 390px route
  rehearsal before MIMIR marks PR 8 closed.
- ARIADNE PR 8 route rehearsal found two narrow mobile layout defects,
  2026-06-16: `docs/roadmap/PR8_UI_COHERENCE_REHEARSAL_ARIADNE.md` records a
  local patched-web/Railway-API Chrome pass across 46 desktop/mobile route
  screenshots. Desktop surfaces, Writing, Billing, Settings, Studio publishing,
  public Space/document, forum thread, Developer Space observer, Studio persona
  routes, and a longer-wait Developer Space manage recheck are acceptable for
  this slice. Remaining DAEDALUS defects: anonymous `/forums/general` clips the
  thread card's right-side score/reply/date metadata at phone width, and
  signed-in `/developer-spaces` keeps the create form and owner project card in
  a side-by-side grid that clips the owner card at phone width. Patch only those
  responsive layouts and preserve PR 8 control truth.
- PR 8 DAEDALUS mobile-defect follow-up is ready for ARGUS review,
  2026-06-16: `/forums/general` thread rows now allow score/reply/date metadata
  to wrap with the title/body instead of forcing a non-shrinking side rail, and
  signed-in `/developer-spaces` now uses the responsive Station two-column grid
  primitive instead of the old fixed `.grid-2` pair. Focused validation passed:
  web typecheck, web lint with existing warnings, `test:community`, and
  `test:developer-spaces`. No API, auth/session, billing backend, Stripe,
  provider, embedding, Railway, Supabase, migration, storage/quota, package,
  env, or persistence behavior changed.
- PR 8 mobile-defect follow-up is accepted by ARGUS for ARIADNE recheck,
  2026-06-16: the two concrete 390px defects from ARIADNE's route rehearsal
  have focused responsive fixes. Forum category thread rows now wrap the
  title/body and score/reply/date metadata, and signed-in Developer Spaces uses
  the responsive Station two-column grid that collapses below 720px. Focused
  validation passed for web typecheck, web lint with existing warnings,
  `test:community`, `test:developer-spaces`, and touched-file whitespace. Wake
  ARIADNE for a narrow 390px recheck of `/forums/general` and signed-in
  `/developer-spaces`; then ARIADNE should wake MIMIR with pass/fail.
- ARIADNE narrow PR 8 mobile recheck is fail, 2026-06-16:
  `docs/roadmap/PR8_MOBILE_LAYOUT_RECHECK_ARIADNE.md` records a local patched
  web/Railway API Chrome pass at `390 x 844`. Signed-in `/developer-spaces`
  now passes: the create form and owner project card stack, stay within the
  viewport, and keep `View observatory`/`Manage` visible. `/forums/general`
  still clips thread metadata: the score/reply/date row reaches the right edge
  and cuts off the date, with CDP reporting a widened layout viewport around
  `408px`. MIMIR should reopen only the forum-category metadata layout, not the
  Developer Spaces fix or the broader PR 8 route set.
- MIMIR opens the PR 8 forum-category mobile metadata follow-up,
  2026-06-16: `docs/roadmap/PR8_FORUM_CATEGORY_MOBILE_METADATA_FOLLOWUP.md`
  narrows the remaining work to `/forums/general` phone-width thread metadata
  clipping. DAEDALUS should patch `apps/web/app/forums/[categorySlug]/page.tsx`
  so score, reply count, and date fit inside `390px` without hiding content or
  masking overflow globally. Do not reopen Developer Spaces, the broader PR 8
  route set, backend/config/auth/billing/provider behavior, or API semantics.
- PR 8 forum-category metadata follow-up is ready for ARGUS review,
  2026-06-16: after ARIADNE's narrow recheck still found the `/forums/general`
  date clipped at `390px`, DAEDALUS changed only the forum category thread-card
  layout. Score, reply count, and date now sit in their own full-width,
  left-aligned wrapping metadata row under the title/body. Developer Spaces and
  the broader PR 8 route set were not reopened. Web typecheck, web lint with
  existing warnings, `test:community`, and `git diff --check` passed. Local
  browser check was attempted but unavailable because the temporary API process
  did not receive required Supabase env vars.
- PR 8 forum-category mobile metadata follow-up is accepted by ARGUS for
  ARIADNE final recheck, 2026-06-16: the follow-up is limited to the forum
  category thread card layout. Thread title/body now render first, and
  score/reply/date render as a separate full-width, left-aligned wrapping row
  inside the card. Developer Spaces and broader PR 8 route groups were not
  reopened. Focused validation passed for web typecheck, web lint with existing
  warnings, `test:community`, and touched-file whitespace. ARIADNE should run
  the final 390px anonymous `/forums/general` recheck and wake MIMIR with
  pass/fail.
- ARIADNE accepts the final PR 8 forum mobile metadata repair, 2026-06-16:
  `docs/roadmap/PR8_FORUM_MOBILE_FINAL_RECHECK_ARIADNE.md` records the final
  anonymous `/forums/general` Chrome/CDP pass at `390 x 844`. The page stayed
  within a `390px` document width, the replay thread card measured within the
  viewport, and `1 votes`, `1 replies`, and `13 Jun 2026` all remained visible
  inside the card. The previous right-edge metadata clipping is gone. No
  remaining PR 8 route-rehearsal defect is open from ARIADNE.
- MIMIR closes the local PR 8 route-rehearsal loop and opens PR 9 live PR8
  Railway recheck, 2026-06-16: live web/API health are `ok:true`, API readiness
  is `ready:true`, and both Railway services currently report runtime commit
  `49a8609`, the actual forum mobile metadata code fix. A4 / ARIADNE should run
  the hosted Railway route rehearsal in
  `docs/roadmap/PR9_LIVE_PR8_RAILWAY_RECHECK.md`. If live frontend defects
  appear, wake DAEDALUS directly with exact route/viewport/file clues; if the
  route set passes, wake MIMIR for PR 9 closeout and next sequencing.
- ARIADNE PR 9 live Railway recheck found one exact frontend contrast defect,
  2026-06-16:
  `docs/roadmap/PR9_LIVE_PR8_RAILWAY_RECHECK_ARIADNE.md` records a hosted
  Railway Chrome/CDP pass over the PR 8 route set. Web and API deployment
  identity both report `49a8609`, health `ok:true`, and deployment
  `ready:true`. The measured route set has no document-level overflow;
  `/forums/general` metadata is visible at `390 x 844`; signed-in
  `/developer-spaces` stacks correctly at mobile width; Discover, Studio,
  Billing, Settings, public Space/document/discussion, and Developer Space
  observer are coherent enough for PR 9. Billing controls were proven at host
  level only: `billing.stripe.com` and `checkout.stripe.com`. One DAEDALUS
  defect remains: signed-in
  `/developer-spaces/station-replay-dev-alpha/manage` uses old dark-theme text
  colors inside white/off-white cards, making owner stats, usage metrics, and
  form labels nearly unreadable. Patch only the manage-console contrast.
- PR 9 DAEDALUS manage-console contrast patch is ready for ARGUS review,
  2026-06-16: only
  `apps/web/app/developer-spaces/[slug]/manage/page.tsx` changed. Owner
  breadcrumb/header helper copy, ingestion key labels, stats, usage metrics,
  live-ingestion metadata, visual config labels, widget titles, export rows,
  project-note labels, and ingestion instruction helper copy now use readable
  light-surface colors. The command code blocks remain intentionally dark.
  Web typecheck, web lint with existing warnings, `test:developer-spaces`, and
  `git diff --check` passed. No ingestion key, visual config, export, route,
  auth/session, visibility/privacy, billing/Stripe, provider, embedding,
  Railway, Supabase, migration, storage/quota, package config, env, or
  persistence behavior changed. Browser recheck is not claimed before deploy;
  if ARGUS accepts, wake ARIADNE for the post-deploy signed-in manage recheck.
- PR 9 manage-console contrast patch is accepted by ARGUS for ARIADNE live
  browser recheck, 2026-06-16: ARGUS reviewed `a85a77b` and found the patch
  limited to readable light-surface colors and local card row borders/fills on
  the Developer Space manage page. No behavior, route semantics, auth/session,
  visibility/privacy, ingestion key, visual config, export, billing/Stripe,
  provider, embedding, Railway, Supabase, migration, storage/quota, package
  config, env, or persistence behavior changed. ARGUS reran web typecheck, web
  lint with existing warnings, and `test:developer-spaces` with 7 passing tests.
  ARIADNE should run the post-deploy signed-in
  `/developer-spaces/station-replay-dev-alpha/manage` browser recheck and wake
  MIMIR with pass/fail.
- ARIADNE accepts the post-deploy PR 9 manage-console contrast repair,
  2026-06-16:
  `docs/roadmap/PR9_LIVE_PR8_RAILWAY_RECHECK_ARIADNE.md` now records the
  signed-in live browser recheck of
  `/developer-spaces/station-replay-dev-alpha/manage` against Railway runtime
  commit `a85a77b`. Web and API health are `ok:true` and deployment readiness is
  `ready:true`. Desktop `1440 x 1200` and mobile `390 x 844` both stayed within
  document width. The owner/manage stats, usage metrics, form labels, helper
  copy, widget rows, export row title/status, project-note labels, and
  ingestion instruction copy are readable on light Station cards. Remaining
  polish note only: two small timestamp metadata spans measured about `3.26:1`
  against white; they do not recreate the original PR 9 blocker.
- Station launch-core patch is blocked for DAEDALUS follow-up before Railway
  deploy, 2026-06-17: ARGUS reviewed `d1d0eaf` hard. The ownership filters on
  `/assistant` and `/imports/archive` are present, runtime `_debug` is blocked
  in production by code, and document-type API normalization/migration paths are
  plausible. Focused validation passed for typecheck, Assistant,
  conversation-archive, continuity-publication, document-discussions,
  Developer Spaces, community, Spaces, exports, writing, Studio UI, and
  whitespace. Follow-up is still required before deploy: add a forward
  migration that merges/renames any existing `documents-and-constitutions`
  forum category into `documents-and-codexes`; make the new Studio Assistant
  and live Global Archive signed-in layouts mobile-safe and remove newly touched
  viewport-scaled title/nonzero eyebrow letter-spacing; correct the launch-core
  debug runbook so production never emits `_debug`; and add minimal hostile
  route tests for the new private `/assistant` and `/imports/archive` surfaces.
- Station launch-core DAEDALUS follow-up is ready for ARGUS review,
  2026-06-17: added forward migration
  `033_merge_document_discussion_forum_category.sql` to rename or merge
  `documents-and-constitutions` into `documents-and-codexes` and move existing
  linked document threads onto the launch category; made the new Studio
  Assistant and Global Archive layouts phone-safe by replacing the fixed
  two-column grids with responsive grids, wrapping the header/action rows, and
  removing newly touched viewport-scaled title type and nonzero eyebrow
  letter-spacing; corrected the launch-core runbook so production never emits
  `_debug`; and added hostile private-surface route tests proving
  unauthenticated `/assistant/summary` and `/imports/archive` fail, owners see
  their own assistant/archive rows, and another user's rows are absent. Scope
  stayed out of provider, billing, auth/session, persistence-shape, Developer
  Space semantics, and broader product lanes.
- Station launch-core DAEDALUS follow-up is accepted by ARGUS for MIMIR deploy
  sequencing, 2026-06-17: ARGUS reviewed `b92d339` and found the four deploy
  blockers from `5c05690` cleared. Migration `033` handles legacy/new document
  discussion category merge, the new Assistant/Archive layouts no longer use
  the blocked fixed grids or newly touched viewport-scaled/letter-spaced title
  treatment, the debug runbook matches the production no-`_debug` code path, and
  hostile route tests now cover the new private summary/archive endpoints.
  ARGUS reran typecheck, Assistant, conversation-archive,
  continuity-publication, document-discussions, Developer Spaces, community,
  Studio UI, Spaces, exports, writing, and whitespace checks successfully.
  MIMIR should take over Railway/deploy sequencing and decide any remote proof
  required before calling launch-core accepted.
- Station launch-core Railway/Supabase proof is ready for ARGUS review,
  2026-06-17: MIMIR confirmed both Railway services are serving runtime commit
  `b92d339` with `/health/deployment` reporting `ok:true` and `ready:true`.
  Migrations `032_station_document_type_alignment` and
  `033_merge_document_discussion_forum_category` were applied to the Supabase
  target through the pooler URL and recorded in
  `supabase_migrations.schema_migrations` as timestamped remote migrations.
  Non-secret DB proof after the migration shows zero legacy document types
  (`post`, `constitution`, `update`, `other`) and one Station document-type row
  currently mapped to `essay`. No legacy/new document discussion category rows
  were present in the current data set, so migration `033` is ready for future
  category creation/merge but had no live category rows to move.
- Station launch-core Railway/Supabase proof is accepted by ARGUS,
  2026-06-17: ARGUS independently re-probed public Railway web/API
  `/health/deployment`; both services report `ok:true`, `ready:true`, branch
  `main`, and commit `b92d339a1204`. API readiness reports database,
  migrations, storage, Supabase auth redirects, Stripe readiness, Gemini
  embedding profile `station_free_1536`, NVIDIA platform chat, and Upstash
  operational cache configured/ready through non-secret booleans/labels. Public
  Supabase REST category proof also returns no `documents-and-constitutions` or
  `documents-and-codexes` rows. ARGUS could not independently re-query
  `supabase_migrations.schema_migrations` from this shell because `psql` is not
  installed and direct secret-key REST use is blocked by Supabase's key guard;
  accepting that part relies on MIMIR's recorded pooler proof. `test:health` and
  whitespace checks passed. No launch-core deploy blocker remains.
- PR10 Studio Publish API Wiring is opened for DAEDALUS, 2026-06-17:
  `docs/roadmap/PR10_STUDIO_PUBLISH_API_WIRING.md` narrows the launch-core
  "finish next" list to the first product unlock: make `/studio/publish` create,
  save, and publish real owner-scoped documents through the existing document
  API, and make `/studio/publishing` read live owner document data. Approval
  queue, worker execution, social dispatch, scheduling execution, and site-wide
  UI reskin work are explicitly out of scope for this slice.
- PR10 Studio Publish API Wiring is ready for ARGUS review, 2026-06-17:
  after DAEDALUS did not respond to the initial and stronger wakeups, MIMIR
  implemented the narrow lane directly. `/studio/publish` now restores the
  signed-in session, loads owner Spaces/personas, creates or patches drafts
  through `POST /documents` and `PATCH /documents/:id`, blocks publish until a
  Space and non-private visibility are explicit, publishes through
  `POST /documents/:id/publish`, and marks rich formatting/social/scheduling
  controls as deferred instead of pretending they are live. `/studio/publishing`
  now reads owner documents through `GET /documents` and groups live rows by
  draft/published/archived status. New pure publishing helpers and
  `test:studio-ui` coverage verify slug/type/status/link behavior.
- PR10 Studio Publish API Wiring is blocked for DAEDALUS follow-up,
  2026-06-17: ARGUS found the implementation mechanically green but not
  behaviorally accepted. The publish flow lets an owner select a Space/persona
  while editing an existing draft, but `PATCH /documents/:id` ignores
  `spaceId` and `personaId`, so the UI can pass its Space-backed publish gate
  while the saved document remains unattached and publishes with no public Space
  route. Follow-up should add owner-validated Space/persona patch semantics or
  otherwise make existing-draft publishing strictly match the persisted
  document state. ARGUS also found a newly touched viewport-scaled publish-flow
  title and a dashboard row layout that should be made phone-safe before
  ARIADNE rehearsal.
- PR10 Studio Publish API Wiring blocker repair is accepted by ARGUS for
  ARIADNE rehearsal, 2026-06-17: MIMIR repaired the backend to validate and
  persist owned `spaceId` and `personaId` updates, reject other-owner
  Space/persona IDs, and keep `source_persona_id` aligned. The community route
  test now proves a draft can be attached to an owned Space/persona before
  publish and that other-owner attachments are rejected. The publish-flow title
  no longer uses viewport-scaled type, publishing dashboard rows/actions now use
  a phone-safe wrapping grid, and ARGUS reran the focused PR10 gate
  successfully. Remaining caveat: direct API calls to
  `POST /documents/:id/publish` can still publish an owner document with no
  Space; that is pre-existing API latitude, not a blocker for the repaired
  PR10 Studio UI path.
- PR10 Publish Browser Rehearsal is ready for ARIADNE, 2026-06-17:
  `docs/roadmap/PR10_PUBLISH_BROWSER_REHEARSAL_ARIADNE.md` gives the human-eye
  route checklist for `/studio/publish`, `/studio/publish?documentId=...`, and
  `/studio/publishing`, including live save/publish controls, deferred controls,
  Space/visibility gating, live dashboard rows, and phone-safe layout checks.
- PR10 Publish Browser Rehearsal is blocked by ARIADNE for follow-up,
  2026-06-17: live Railway at runtime `33cd50b` restored the signed-in replay
  owner, but the account is private/basic-tier with `canPublishDocuments:false`.
  Real keyboard save returned the API entitlement error, so ARIADNE could not
  complete the positive save/edit/publish/document-link path. ARIADNE also found
  `/studio/publish` header/lede contrast too low in the light Studio shell and
  the default title input clipped at `390 x 844`.
- PR10 Publish Browser Rehearsal follow-up is ready for ARGUS review,
  2026-06-17: MIMIR added a client entitlement preflight so private-tier users
  see a Creator-or-above requirement and cannot click Save/Publish into a known
  API 403; switched `/studio/publish` to light Station surface colors; and
  reduced the document title input size so the default title fits phone width.
  The remaining rehearsal setup caveat is that the positive save/edit/publish
  path still requires a Creator-or-above account or a staging tier adjustment.
- PR10 Publish Browser Rehearsal is blocked by ARIADNE, 2026-06-17:
  `docs/roadmap/PR10_PUBLISH_BROWSER_REHEARSAL_ARIADNE_RESULT.md` records the
  live Railway browser pass against runtime commit `33cd50b`. Web/API health and
  readiness were `ok:true`/`ready:true`, but the current replay owner reports
  `private` auth and billing tier with `canPublishDocuments:false`. With real
  keyboard input, `/studio/publish` enables `Save draft`, then returns
  `This action requires the 'creator' tier or above.` and creates no draft, so
  ARIADNE could not complete the required save, existing-draft edit,
  Space/persona persistence, publish, or new public document-link checks. The
  publish page also mixes light text into the light Studio shell, making the
  header/lede nearly invisible, and the phone title input clips even the default
  title. `/studio/publishing` itself renders live owner document rows, has
  Edit/View on the existing published row, and stays within width on desktop and
  `390 x 844`. MIMIR should decide whether the first blocker is replay-account
  setup or a DAEDALUS entitlement-preflight UI fix; DAEDALUS should repair the
  publish header contrast and phone title clipping before PR10 closes.
- PR10 Publish Browser Rehearsal follow-up is accepted by ARGUS,
  2026-06-17: `/studio/publish` now preflights `canPublishDocuments`, shows a
  Creator-or-above requirement to private/basic-tier users, and disables
  Save/Publish before the known API 403 path. The publish page now uses light
  Station shell colors, a smaller non-viewport title input, and an ARGUS-patched
  readable preview title. Focused validation passed for typecheck,
  `test:studio-ui`, `test:community`, `test:document-discussions`,
  `test:continuity-publication`, and whitespace. The remaining decision is
  staging/rehearsal policy: either rerun ARIADNE against private-tier preflight
  only, or prepare a Creator-or-above staging account for the positive
  save/edit/publish path.
- PR10 Publish Browser Rehearsal private-tier rerun is queued for ARIADNE,
  2026-06-17: MIMIR chose the immediate narrow path. ARIADNE should use live
  Railway once it serves `abc3b3d` or newer and verify only the private-tier
  entitlement preflight, visual contrast, preview toggle, deferred controls, and
  desktop/phone layout. The positive save/edit/publish path remains blocked by
  Creator-or-above staging account setup rather than by PR10 UI code.
- PR10 private-tier publish rerun is accepted by ARIADNE, 2026-06-17:
  `docs/roadmap/PR10_PRIVATE_TIER_PUBLISH_RERUN_ARIADNE.md` records the live
  Railway browser pass against runtime commit `abc3b3d`. Web/API health and
  readiness were `ok:true`/`ready:true`. The replay owner still reports
  `private` auth/billing tier and `canPublishDocuments:false`, so this pass does
  not claim positive save/edit/publish. Within MIMIR's narrowed scope,
  `/studio/publish` now shows the Creator-or-above requirement before
  save/publish, disables `Save draft` and `Publish`, avoids the previous API
  403 path, repairs header/lede contrast, keeps the default title fitting at
  `390 x 844`, toggles Preview cleanly, and keeps formatting/connectors/
  scheduling visibly deferred. `/studio/publishing` still renders live owner
  rows with Edit/View and stays within width on desktop and phone. No remaining
  private-tier rerun defect is open from ARIADNE.
- PR10 Studio Publish API Wiring is closed for the code/UI slice,
  2026-06-17: live private-tier rehearsal now passes for entitlement preflight
  and visuals. The positive save/edit/publish browser path is not claimed
  because it requires a Creator-or-above staging account or tier adjustment; it
  is tracked as staging setup, not as a PR10 code blocker.
- PR11 Publishing Approval Queue is opened for DAEDALUS, 2026-06-17:
  `docs/roadmap/PR11_PUBLISHING_APPROVAL_QUEUE.md` scopes the next launch-core
  publishing lane to durable approval/provenance state and owner-scoped API/UI
  surfaces. Workers, social dispatch, scheduled execution, large visual redesign,
  and Creator-account staging setup remain out of scope for this implementation
  slice.
- PR11 Publishing Approval Queue is ready for ARGUS review, 2026-06-17:
  DAEDALUS added durable `publishing_approval_items` and
  `publishing_approval_events` tables, mounted owner-scoped
  `/publishing/approvals` APIs, added a narrow approval state service, and wired
  Studio publish/publishing surfaces so drafts enter review and owners can move
  them through grounding, human review, approval, regeneration, cancellation,
  publication, and queue archive. Scheduling is represented but execution
  remains visibly deferred to the worker lane. Focused tests cover owner
  scoping, invalid transitions, private-source response safety, and publish
  visibility. Validation is current in
  `docs/testing/VALIDATION_BASELINE.md`; the only build caveat is the known
  Windows Next standalone symlink `EPERM` after successful compile/page
  generation.
- PR11 Publishing Approval Queue blocker repair is ready for ARGUS review,
  2026-06-17: DAEDALUS added RLS and owner policies for approval items/events,
  enforced Space-backed queue enqueue and Space-backed schedule/publish
  transitions in the API service, disabled queue actions for no-Space drafts in
  `/studio/publishing`, and added focused no-Space plus migration-policy tests.
  The repair gate passed `test:publishing-approvals` with 7 tests, typecheck,
  `test:continuity-publication`, `test:document-discussions`,
  `test:community`, and `test:studio-ui`.
- PR11 live approval-table blocker is repaired for ARGUS review, 2026-06-17:
  DAEDALUS applied migration `034_publishing_approval_queue.sql` to the linked
  Supabase target through the CLI Management API path, triggered a PostgREST
  schema reload, and proved the live tables/RLS/policies exist. A signed-in live
  Railway probe for the replay owner now returns `GET /publishing/approvals`
  `200` with `approvals=0`. `/studio/publishing` no longer catches approval
  fetch failure as empty queue state; failures now surface through the page
  error path. Local validation passed `test:publishing-approvals`,
  `test:studio-ui`, and typecheck.
- PR11 live approval-table repair is accepted by ARGUS, 2026-06-17:
  ARGUS reviewed the UI failure-surfacing change and reran
  `test:publishing-approvals`, `test:studio-ui`, typecheck, and whitespace
  checks. The page no longer silently converts approval API failure into empty
  queue truth. ARGUS did not independently replay the signed-in Railway owner
  probe from this shell, so the live `GET /publishing/approvals` 200/table proof
  remains DAEDALUS-recorded evidence. No additional local code blocker remains.
- PR11 Publishing Approval Queue is blocked for DAEDALUS follow-up,
  2026-06-17: ARGUS reran the PR11 focused gate and it is mechanically green,
  but two policy/security gaps remain. Migration `034` creates new owner-scoped
  approval tables without enabling RLS or adding owner policies, unlike the
  repo's other owner/private tables. The dashboard queue controls can also
  enqueue and publish drafts with no `space_id`, reopening the no-public-Space
  route problem inside the new queue path. Follow-up should add RLS/policies,
  enforce Space-backed queue publication at API and UI levels, and cover both
  with focused tests before ARIADNE or MIMIR acceptance.
- PR11 Publishing Approval Queue blocker repair is accepted by ARGUS,
  2026-06-17: DAEDALUS added RLS plus owner policies for the approval item/event
  tables, rejects no-Space drafts at queue enqueue, blocks scheduled/published
  queue transitions when the document is not Space-backed, and disables
  dashboard queue actions for no-Space drafts with explicit `Space required`
  copy. ARGUS reran `test:publishing-approvals`, typecheck,
  `test:continuity-publication`, `test:document-discussions`,
  `test:community`, `test:studio-ui`, and whitespace checks successfully. No
  PR11 code blocker remains; MIMIR should decide whether this API-heavy lane
  needs ARIADNE dashboard rehearsal before closeout.
- PR11 Approval Queue browser rehearsal is queued for ARIADNE, 2026-06-17:
  `docs/roadmap/PR11_APPROVAL_QUEUE_REHEARSAL_ARIADNE.md` asks for a narrow
  live human-eye pass over `/studio/publishing` and `/studio/publish`, focused
  on approval state readability, no-Space disabled actions, button feedback,
  and mobile width. Missing Creator-positive publish proof remains staging
  account setup, not a rehearsal failure.
- PR11 Approval Queue browser rehearsal is blocked by ARIADNE, 2026-06-17:
  `docs/roadmap/PR11_APPROVAL_QUEUE_REHEARSAL_ARIADNE_RESULT.md` records the
  live Railway browser/API pass against runtime commit `2797520`. Web/API health
  and readiness were `ok:true`/`ready:true`, but live
  `GET /publishing/approvals` returns
  `Could not find the table 'public.publishing_approval_items' in the schema
  cache`. `/studio/publishing` catches that approval fetch failure and renders
  the existing published row as `Not queued`, making approval state
  untrustworthy. The private-tier publish form itself passes the visible
  preflight checks: Creator-or-above copy appears, `Save draft` and
  `Send for review` are disabled, deferred controls remain deferred, and desktop
  plus `390 x 844` widths stay inside the viewport. The current replay owner has
  one published Space-backed document, zero drafts, and zero no-Space documents,
  so no-Space queue controls were not available to exercise. DAEDALUS should
  repair/apply the approval queue table path and consider surfacing approval
  fetch failures instead of silently falling back to empty queue truth.
- PR11 live approval-table repair is accepted by ARGUS and supersedes the
  ARIADNE missing-table block, 2026-06-17: DAEDALUS-recorded live proof now
  shows `GET /publishing/approvals` returning `200` for the replay owner after
  targeted migration apply and schema reload, and the local UI patch surfaces
  any future approval fetch failure instead of showing false empty queue truth.
  Remaining limitation is rehearsal data/account setup for positive queue
  transitions, not a local PR11 code blocker.
- PR11 Approval Queue entitlement follow-up is opened for DAEDALUS,
  2026-06-17: MIMIR seeded two synthetic public-safe replay drafts for the
  ARIADNE rerun, then caught a policy mismatch before handing it back to the
  browser: the private-tier replay owner has `canPublishDocuments:false`, but
  PR11 queue mutation controls/routes can still act on existing drafts. The
  follow-up in `docs/roadmap/PR11_APPROVAL_QUEUE_ENTITLEMENT_DAEDALUS.md`
  should require Creator-or-above capability for approval queue mutations while
  keeping readback available and preserving the no-Space guard.
- PR11 Approval Queue entitlement guard is ready for ARGUS review,
  2026-06-17: DAEDALUS did not move after the original wakeup or re-wake, so
  MIMIR implemented the bounded guard directly. Approval queue mutation routes
  now require Creator-or-above tier, owner readback remains available,
  `/studio/publishing` disables queue actions for private/basic users while
  keeping no-Space guard copy explicit, and focused tests cover both branches.
  `test:publishing-approvals` passed with 9 tests, `test:studio-ui` passed with
  12 tests, typecheck passed, and whitespace checks passed with CRLF warnings
  only. Direct document publish remains legacy latitude for ARGUS to note.
- PR11 Approval Queue entitlement guard is accepted by ARGUS, 2026-06-17:
  ARGUS reviewed commit `9013f7b` and accepts the bounded guard. Approval queue
  mutation routes require Creator-or-above while signed-in owner readback stays
  available, `/studio/publishing` disables queue actions for private/basic users
  with `Creator required`, and no-Space drafts still show `Space required`
  before entitlement copy. ARGUS reran `test:publishing-approvals` with 9 tests,
  `test:studio-ui` with 12 tests, typecheck, `git diff 75b5a41..9013f7b
  --check`, and `git diff --check`. Direct `POST /documents/:id/publish`
  remains documented legacy latitude and was not changed in this follow-up.
- PR11 seeded private-tier ARIADNE rerun is queued, 2026-06-17: MIMIR updated
  `docs/roadmap/PR11_APPROVAL_QUEUE_REHEARSAL_ARIADNE.md` so ARIADNE waits for
  runtime commit `9013f7b` or newer and checks the two synthetic drafts:
  Space-backed should show Creator-required disabled queue action, no-Space
  should show Space-required guard copy, and approval readback should stay
  `200` without silent empty-queue fallback. Creator-positive transitions remain
  separate staging-account proof.
- PR11 seeded private-tier approval queue rerun is accepted by ARIADNE,
  2026-06-17:
  `docs/roadmap/PR11_APPROVAL_QUEUE_RERUN_ARIADNE.md` records the live Railway
  browser/API pass against runtime commit `9013f7b`. Web/API health and
  readiness were `ok:true`/`ready:true`; direct signed-in
  `GET /publishing/approvals` returned `200`. The replay owner remains
  `private` with `canPublishDocuments:false`, and live data now includes two
  synthetic drafts: one no-Space draft and one Space-backed draft. In
  `/studio/publishing`, the no-Space draft shows disabled `Space required`
  guard copy, the Space-backed draft shows disabled `Creator required` copy,
  both rows show `Not queued`, and mobile/desktop layouts stay within width.
  `/studio/publish` still shows Creator-or-above preflight and disables
  `Save draft` / `Send for review`. Existing published rows still expose
  Edit/View. No scoped private-tier PR11 rehearsal defect remains open from
  ARIADNE; Creator-positive transitions remain separate staging-account proof.
- PR11 Publishing Approval Queue is closed for the code/private-tier safety
  slice, 2026-06-17: DAEDALUS implemented durable approval state, ARGUS accepted
  the RLS/Space-backed/entitlement repairs, and ARIADNE accepted the seeded
  private-tier live replay. Creator-positive queue transitions remain a
  separate staging-account proof, not a PR11 code blocker.
- PR12 Private Archive Search is opened for DAEDALUS, 2026-06-17:
  `docs/roadmap/PR12_PRIVATE_ARCHIVE_SEARCH.md` narrows the next launch-core
  backend lane to owner-scoped `/studio/archive` search across private archive
  sources. Workers remain deferred under the accepted PR6 no-trigger rule.
  Vector reindexing, Cloudflare retrieval, Redis memory truth, broad UI reskin,
  and publishing queue staging proof are out of scope for this slice.
- PR12 Private Archive Search is ready for ARGUS review, 2026-06-17: DAEDALUS
  stayed silent after the initial wakeup and a stronger re-wake, so MIMIR
  implemented the bounded lane directly. `GET /imports/archive/search` now
  returns owner-scoped, sanitized, capped private archive results across
  documents, memory, canon, persona files, import jobs, archived chats,
  continuity records, and Integrity Sessions. `/studio/archive` now uses that
  backend search route for active query/filter/sort controls and keeps the
  summary route for the default view. Focused coverage proves unauthenticated
  failure, owner-only results, non-owner absence, source/status filters,
  transcript non-exposure, secret redaction, and bounded no-query results.
  `test:storage`, `test:studio-ui`, typecheck, `test:conversation-archive`,
  `test:persona-context`, `test:exports`, and whitespace checks passed.
- PR12 Private Archive Search is accepted by ARGUS for code/security,
  2026-06-17: ARGUS reviewed commit `2cf7b98` and accepts the owner-scoped
  search route, capped owner-only result cards, redacted import failure
  summaries, no-query boundedness, and backend-wired `/studio/archive`
  query/filter/sort controls. ARGUS reran `test:storage` with 10 tests,
  `test:studio-ui` with 13 tests, `test:conversation-archive` with 8 tests,
  `test:persona-context` with 6 tests, `test:exports` with 3 tests, typecheck,
  `git diff 9f26b45..2cf7b98 --check`, and `git diff --check`. Because the
  Studio archive surface changed materially, ARIADNE should rehearse
  `/studio/archive` on desktop and mobile before MIMIR closes PR12.
  `docs/roadmap/PR12_ARCHIVE_SEARCH_REHEARSAL_ARIADNE.md` defines the browser
  pass.
- PR12 Archive Search browser rehearsal needs a focused UX repair,
  2026-06-17: ARIADNE checked production web/API runtime commit `2cf7b98`.
  Owner-scoped search, filters, sorts, owner-only empty copy, mobile flow, and
  unauthenticated login redirect all behaved acceptably with no horizontal
  overflow or private archive cards shown to an unauthenticated browser.
  However, global visual reconciliation CSS partially overrides
  `/studio/archive`: the page background is light while archive header/lede text
  remains dark-theme white/blue, and the mobile failed-count stat is hard to
  read. `docs/roadmap/PR12_ARCHIVE_SEARCH_REHEARSAL_ARIADNE_RESULT.md` records
  the sanitized pass. DAEDALUS should make a focused contrast patch before MIMIR
  closes PR12; do not reopen the accepted owner-scoped backend/search behavior.
- PR12 Archive Search contrast repair is ready for ARIADNE rerun,
  2026-06-17: DAEDALUS did not return the focused UX patch during MIMIR's
  foreground watch, so MIMIR repaired `ArchiveLibrary` directly. The archive
  page now uses `--station-page-*` light-surface tokens for the page, header,
  lede, panels, cards, filters, inputs, pills, links, warnings, and result
  metadata. The Failed summary card now uses a light error surface with
  readable red text on desktop and phone width. Search route behavior, result
  shape, auth behavior, filters, sort, and owner-only empty-state copy were not
  changed. `test:studio-ui`, typecheck, and whitespace checks passed; ARIADNE
  should rerun the deployed `/studio/archive` desktop/phone visual pass once the
  fix is live.
- PR12 Archive Search contrast rerun is accepted by ARIADNE, 2026-06-17:
  production web/API health served runtime commit `3360ec9`. Desktop and
  phone-width `/studio/archive` now render readable header, lede, summary cards,
  failed stat, filters, inputs, cards, match reasons, and `Open source`
  controls with no horizontal overflow. Owner-scoped summary/search still
  returns the expected replay counts, filters and sorts behave honestly, empty
  filter states preserve owner-only copy, unauthenticated browser access
  redirects to sign-in with zero archive cards, and unauthenticated API search
  remains `401`. `docs/roadmap/PR12_ARCHIVE_SEARCH_CONTRAST_RERUN_ARIADNE.md`
  records the sanitized pass. ARIADNE recommends MIMIR close PR12 without
  expanding scope into vector search, workers, Cloudflare retrieval, Redis
  memory truth, export bundles, or new archive source types.
- PR12 Private Archive Search is closed, 2026-06-17: ARGUS accepted the
  owner-scoped backend search implementation, ARIADNE accepted the deployed
  desktop/phone archive rehearsal after the focused contrast repair, and no
  remaining PR12 blocker is open. Future vector search, workers, Cloudflare
  retrieval, Redis memory truth, export bundles, and additional archive source
  types remain separate lanes.
- PR14 External Conversation Import Parsers is opened for DAEDALUS,
  2026-06-17: `docs/roadmap/PR14_EXTERNAL_CONVERSATION_IMPORTS.md` scopes the
  next launch-core implementation lane to ChatGPT and Claude parser extraction,
  safe unknown-JSON failure, owner-scoped import behavior, and preservation of
  existing import job/storage rollback guarantees. The existing
  `CLOUDFLARE_NESTSTACK_DECISION_PACKET.md` remains a draft decision packet for
  MIMIR, not a numbered implementation lane. Reddit, Discord production import,
  workers, Cloudflare retrieval, Redis memory truth, vector reindexing, public
  publishing, and broad UI reskin are out of scope.
- PR14 External Conversation Import Parsers is ready for ARGUS review,
  2026-06-17: DAEDALUS split upload parser logic out of `archive.service.ts`
  into `apps/api/src/services/imports/parsers/`, added explicit ChatGPT and
  Claude JSON parsing, preserved known plain text/Markdown and legacy
  role/content-array imports, and removed the unsafe unknown-JSON stringify
  fallback. Unknown or malformed JSON now fails with sanitized owner-visible
  import-job errors before memory chunks are created, and `.json` file names
  route through JSON parsing even if the client sends a text MIME. Existing
  owner-scoped import job, storage rollback, and text/Markdown behavior are
  preserved.
  Focused validation passed `test:conversation-archive`, `test:storage`,
  `test:persona-context`, typecheck, and whitespace checks.
- PR15 Background Job Boundary is ready for ARGUS review, 2026-06-17:
  DAEDALUS added an explicit protected-alpha file import job runner over the
  existing `import_jobs` table, changed persona file registration to report
  `jobExecution` as either `queued` or `inline_fallback`, and scoped
  `processUploadedFile` status updates to the exact job ID when available.
  Deployment readiness now distinguishes TCP Redis/Valkey queue configuration
  from Upstash REST cache-only configuration without printing secrets or
  claiming BullMQ readiness from REST alone. No migration was added; a future
  true worker should add a durable file pointer to avoid rediscovering files by
  source name. Focused validation passed `test:conversation-archive`,
  `test:storage`, `test:exports`, `test:health`, typecheck, and whitespace
  checks.
- PR16 Durable File Import Jobs is ready for ARGUS review, 2026-06-17:
  DAEDALUS added migration `035_import_job_file_pointer.sql` with nullable
  `import_jobs.file_id` referencing `persona_files`, updated DB types and import
  job selection, persists `file_id` when persona-file registration creates file
  jobs, and changed the file import runner to claim by durable job ID plus owner
  ID. The runner now loads the pointed `persona_files` row, enforces owner,
  persona, kind, file, and source-name consistency before storage download,
  treats reruns with existing archive rows as idempotent, and fails null or
  mismatched historical jobs visibly with sanitized owner-visible status instead
  of guessing. Duplicate exact storage-path registration uses exact file-job
  pointers and still returns ambiguity when multiple candidate jobs point at the
  same file. Focused validation passed `test:storage`,
  `test:conversation-archive`, `test:health`, typecheck, and whitespace checks.
- PR15 Background Job Boundary is accepted by ARGUS, 2026-06-17: ARGUS accepts
  the bounded protected-alpha job boundary. The file import runner is
  owner-scoped through `import_jobs`, reruns are idempotent when archive rows
  already exist for the persona file, failures store sanitized owner-visible
  errors without deleting previous archive rows, and readiness truthfully
  distinguishes TCP Redis/Valkey queue configuration from Upstash REST
  cache-only status. ARGUS reran `test:conversation-archive` with 15 tests,
  `test:storage` with 13 tests, `test:exports` with 3 tests, `test:health`
  with 14 tests, typecheck, `git diff 191ade0..ffe9079 --check`, and `git diff
  --check`. Remaining caveat: this is not a deployed BullMQ worker, and a future
  independent worker still needs a durable file pointer on job rows.
- PR16 Durable File Import Jobs is accepted by ARGUS, 2026-06-17: ARGUS accepts
  the nullable `import_jobs.file_id` migration, DB type update, route persistence
  of new file-job pointers, exact duplicate pointer disambiguation, safe
  historical null-pointer repair/ambiguity behavior, and durable
  `runFileImportJobById` claim path. The runner loads the `persona_files` row
  itself and validates owner, persona, kind, file pointer, file owner, and source
  name before storage download; null historical file jobs fail visibly instead
  of guessing from `source_name`. ARGUS reran `test:storage` with 13 tests,
  `test:conversation-archive` with 15 tests, `test:health` with 14 tests,
  typecheck, `git diff c440352..e548ef7 --check`, and `git diff --check`. No
  BullMQ/Redis worker, Upstash/QStash queue, Reddit/Discord import, export
  worker, candidate review, quota, Cloudflare, vector, public publishing, or UI
  scope was added.
- PR15 Background Job Boundary is closed, 2026-06-17: MIMIR accepted ARGUS's
  verdict at `c440352`. This closes the bounded job-boundary/status/readiness
  slice, not a deployed worker queue.
- PR16 Durable File Import Jobs is opened for DAEDALUS, 2026-06-17: close the
  PR15 caveat by making uploaded-file import jobs independently claimable from
  durable database state. The expected slice is a narrow file pointer on
  `import_jobs`, a runner that can load the owner-scoped `persona_files` row by
  job ID, idempotent duplicate behavior, safe ambiguous historical-row handling,
  and tests. BullMQ deployment, Reddit, export workers, candidate review, broad
  quotas, Cloudflare, vectors, Redis memory truth, public publishing, and UI
  reskin stay deferred.
- PR16 Durable File Import Jobs is closed, 2026-06-17: ARGUS accepted the file
  pointer slice at `8a85cbb`. New file import jobs persist nullable
  `import_jobs.file_id`, durable job claiming loads and validates the
  owner-scoped `persona_files` row before storage download, duplicate
  registration uses exact pointer matches or safe ambiguity, and historical
  null-pointer jobs fail visibly instead of guessing.
- PR17 Import Review Candidates is opened for DAEDALUS, 2026-06-17: parsed
  external conversation imports should become private archive source material
  plus owner-reviewable Memory/Canon candidates, not silently active runtime
  memory. The lane should extend/reuse continuity candidate machinery, keep
  imported archive chunks private and out of runtime context before review,
  preserve archived-chat candidate behavior, and prove accept/reject owner
  scoping. Full UI, Reddit, Discord, workers, quotas, Cloudflare, vector work,
  export redesign, Redis memory truth, public publishing, and reskin stay
  deferred.
- PR14 External Conversation Import Parsers is blocked for DAEDALUS follow-up,
  2026-06-17: ARGUS found that `parseImportFile` checks text MIME before JSON
  filename/extension. A file named `unknown.json` with client-provided
  `fileType: "text/plain"` is treated as raw text and would be archived as
  memory instead of failing as unsupported JSON. This violates the PR14 rule
  that unknown JSON must fail safely before archive memory creation. DAEDALUS
  should make `.json` extension authoritative over text MIME, add regression
  coverage for `.json` plus `text/plain`, preserve real `.txt`/`.md` imports,
  and rerun the PR14 gate before waking ARGUS again.
- PR14 External Conversation Import Parsers blocker repair is accepted by
  ARGUS, 2026-06-17: DAEDALUS now routes `.json` filenames through JSON parsing
  before text MIME fallback, so `unknown.json` plus `fileType: "text/plain"`
  fails safely instead of becoming raw archive memory. Legitimate
  `.txt`/`.text`/`.md`/`.markdown` imports still use the raw text/Markdown path,
  and ChatGPT, Claude, and explicit legacy role/content-array JSON support
  remain intact. ARGUS reran the failing parser probe, `test:conversation-archive`
  with 15 tests, `test:storage` with 11 tests, `test:persona-context` with
  6 tests, typecheck, `git diff 600a7e6..7c01582 --check`, and `git diff
  --check`. No remaining PR14 code/security blocker is open.
- PR14 External Conversation Import Parsers is closed, 2026-06-17: MIMIR
  accepted ARGUS's repaired verdict at `191ade0`. Candidate/review routing
  remains deferred; parsed imports still create private archive memory chunks
  through the protected-alpha import path and do not become Canon directly.
- PR15 Background Job Boundary is opened for DAEDALUS, 2026-06-17: the next
  launch-core risk is the job boundary behind imports/exports and later Reddit
  intake. The lane should prove a narrow owner-scoped queue/status/runner
  contract, distinguish TCP Redis/Valkey queue readiness from Upstash REST cache
  readiness, preserve inline fallback for protected-alpha safety, and avoid
  broad Reddit, candidate-review, export-bundle, quota, Cloudflare, vector, or
  UI work.
- PR17 Import Review Candidates is implemented by DAEDALUS and ready for ARGUS,
  2026-06-17: ChatGPT and Claude uploaded-file imports now create pending
  owner-scoped Memory/Canon review candidates backed by `persona_files` source
  references while preserving private archive chunks. Imported archive chunks
  default to quarantined lifecycle state and are excluded from persona runtime
  archive context before owner review; missing or non-active lifecycle metadata
  now fails closed for imported archive chunks at runtime while explicit owner
  archive retrieval remains searchable by default. Accepting import-backed
  Memory creates owner-scoped imported memory with persona-file provenance and
  activates it; accepting import-backed Canon records imported canon; rejecting
  leaves archive source material intact. Existing archived-chat candidate
  behavior remains covered. Deferred: full review UI, Reddit/Discord production
  import, workers, quotas, Cloudflare/vector/Redis memory work, export redesign,
  publishing, and UI reskin.
- PR17 blocker repair is accepted by ARGUS, 2026-06-17: ARGUS found that
  imported archive chunks could fail open into runtime context if
  `memory_item_lifecycle` creation was missing after ingestion. DAEDALUS repaired
  the runtime archive filter so `source_type: "import"` archive chunks require
  an explicit active lifecycle row when `includeQuarantined` is false, added a
  missing-lifecycle regression test, and preserved explicit owner archive
  retrieval as searchable source-library behavior by default. ARGUS reran the
  protected PR17 validation set and recommends MIMIR mark PR17 complete.
- PR17 Import Review Candidates is closed, 2026-06-17: MIMIR accepted ARGUS's
  repaired verdict at `8e59b4d`. Parsed ChatGPT/Claude imports now produce
  private archive source material plus owner-reviewable Memory/Canon candidates;
  imported archive chunks are excluded from runtime context unless explicitly
  active, and missing lifecycle rows fail closed.
- PR18 Operational Quota Guards is opened for DAEDALUS, 2026-06-17: before
  Reddit intake, heavier workers, export-package jobs, or partner Developer
  Space expansion, add narrow machine-readable quota guards around queued import
  work, export generation attempts, Developer Space ingestion usage, and
  embedding-producing archive writes where the current repo can support it.
  Avoid billing redesign, new pricing, Redis worker deployment, Reddit,
  Cloudflare, vector reindexing, Redis memory truth, public publishing, full UI,
  and reskin work.
- PR18 Operational Quota Guards is implemented by DAEDALUS and ready for ARGUS,
  2026-06-17: added a stable `quota_exceeded` error payload; capped active
  import jobs at 5 per owner/persona after exact duplicate file idempotency
  checks and before missing-job duplicate repair inserts;
  blocked concurrent requested/processing export packages at 1 per owner/target;
  enforced Developer Space usage limits before ingestion writes while preserving
  institutional unlimited semantics; and added a conservative 24-chunk
  per-request guard for embedding-producing archive writes when embeddings are
  configured. No migration/type change, billing redesign, Redis worker, Reddit,
  Cloudflare/vector/Redis memory, export-worker redesign, publishing, or UI work
  was added.
- PR18 import quota repair is accepted by ARGUS, 2026-06-17: ARGUS found that
  the file duplicate repair path could insert a new queued job for an existing
  `persona_files` row with no matching import job before checking the active
  import job cap. The repair now quota-checks only before that new repair-job
  insert, maps the quota error back to the stable `quota_exceeded` response, and
  preserves exact duplicate readback plus historical null-pointer pointer repair.
  `test:storage` now covers the existing-file/missing-job/5-active-jobs case and
  proves no sixth job is inserted. ARGUS reran the protected PR18 validation set
  and recommends MIMIR mark PR18 complete as an alpha quota guard lane.
- PR18 Operational Quota Guards is closed, 2026-06-17: MIMIR accepted ARGUS's
  repaired verdict at `0e5cf48`. Station now has narrow machine-readable quota
  guards for active import work, export generation attempts, Developer Space
  ingestion usage, and embedding-producing archive writes. Billing redesign,
  Redis workers, Reddit intake, export worker redesign, Cloudflare/vector/Redis
  memory work, publishing, import review UI, and UI reskin remain deferred.
- PR19 Reddit Archive Intake is opened for DAEDALUS, 2026-06-17: with parser,
  durable import job, candidate review, fail-closed runtime filtering, and quota
  foundations in place, the next bounded launch-core source is Reddit archive
  intake by upload/paste/manual source. This lane must add explicit Reddit
  parser support and review-candidate routing without requiring live Reddit API
  credentials, using social publishing OAuth, recurring pulls, workers,
  Cloudflare, vector reindexing, Redis memory truth, publishing, billing, or UI
  reskin scope.
- PR19 Reddit Archive Intake is implemented by DAEDALUS and ready for ARGUS
  review, 2026-06-17: uploaded/pasted Reddit archive JSON now has explicit
  narrow parser support for listing-style `data.children` exports and
  thread-like objects with `comments` or `children` arrays. Parsed Reddit rows
  produce stable `[reddit/<subreddit>/<author>]` archive text, safe source
  metadata, private quarantined archive chunks, and pending owner-scoped
  Memory/Canon review candidates through existing `persona_files` provenance.
  Unknown/malformed JSON still fails before archive memory creation, `.json`
  filenames remain authoritative over misleading text MIME, ChatGPT/Claude/
  legacy/text/Markdown behavior is preserved, and PR17 runtime fail-closed plus
  PR18 quota/idempotency coverage remains green. No live Reddit OAuth/API,
  recurring pull, social posting, workers, Cloudflare, vector, Redis memory
  truth, publishing, billing, Discord, or UI reskin scope was added.
- PR19 is blocked by ARGUS, 2026-06-17: local validation is green, but the new
  Reddit parser overclaims generic JSON arrays. `parseRedditExport` accepts any
  top-level array by passing it to `metadataForItems`, and `normalizeRedditItem`
  then turns an arbitrary object with a `text` field into
  `[reddit/unknown]: ...`. A probe with a one-item array containing only `text`
  currently returns `format: "reddit"` instead of throwing the unsupported JSON
  error. Repair narrowly so Reddit parsing only accepts the documented explicit
  shapes, such as listing-style `data.children` wrappers and thread-like objects
  with `comments` or `children`, or otherwise requires unmistakable
  Reddit-specific fields. Add a regression test proving arbitrary JSON arrays
  with only `text`/non-Reddit fields fail before archive memory or candidates
  are created.
- PR19 generic-array blocker repair was implemented by DAEDALUS, 2026-06-17:
  Reddit parsing no longer accepts generic top-level JSON arrays.
  Source detection is limited to Reddit listing wrappers, thread-like objects,
  or rows with unmistakable Reddit markers such as `subreddit`,
  Reddit-shaped `permalink`, or Reddit `kind` values. Individual rows without
  those markers are ignored before archive text creation. New regression
  coverage proves an arbitrary
  `[{ "text": "..." }]` JSON file throws the unsupported-format error and the
  upload processing path creates no archive memory, candidates, or storage
  usage from that payload. ChatGPT, Claude, legacy JSON, text, Markdown,
  malformed JSON sanitization, `.json` extension precedence, PR17 quarantine,
  and PR18 quota/idempotency behavior remain green.
- PR19 permalink repair is accepted by ARGUS, 2026-06-17: after the generic
  `text` array fix, ARGUS found that a plain `permalink` field still overclaimed
  non-Reddit JSON. The repair now treats `permalink` as Reddit-specific only
  when it is Reddit-shaped, such as `/r/...` or a `reddit.com/r/...` URL, while
  `subreddit`, `subreddit_name_prefixed`, and Reddit `kind` markers remain
  accepted. Parser coverage now proves generic `text` + `permalink: "/posts/1"`
  arrays fail safely, and a real `/r/...` Reddit permalink still parses.
  ARGUS reran the PR19 validation set and recommends MIMIR mark PR19 complete as
  a narrow uploaded/pasted Reddit archive intake lane.
- PR19 Reddit Archive Intake is closed, 2026-06-17: MIMIR accepted ARGUS's
  repaired verdict at `358c306`. Station now has no-config uploaded/pasted
  Reddit archive intake for narrow explicit Reddit shapes, with fail-closed
  parser behavior, private/quarantined archive chunks, pending owner-scoped
  candidates, and preserved PR18 quota/idempotency behavior.
- PR20 Discord Archive Intake is opened for DAEDALUS, 2026-06-17: with ChatGPT,
  Claude, and Reddit manual archive sources covered, the next no-config
  launch-core import source is Discord upload/paste intake. This lane should add
  explicit Discord parser support and candidate routing for clearly Discord
  export/thread shapes while rejecting generic content/text arrays. It must not
  add Discord bot/OAuth/webhook/gateway/crawler behavior, recurring pulls,
  workers, Cloudflare/vector/Redis memory work, publishing, billing, social
  posting, public community bridge, or UI reskin.
- PR20 Discord Archive Intake is implemented by DAEDALUS and ready for ARGUS
  review, 2026-06-17: uploaded/pasted Discord archive JSON now has explicit
  narrow parser support for DiscordChatExporter-style `messages` objects with
  guild/channel metadata and channel/thread objects with `messages` arrays plus
  Discord markers. Parsed Discord rows produce stable
  `[discord/<server>/<channel>/<author>]` archive text, safe source metadata,
  private quarantined archive chunks, and pending owner-scoped Memory/Canon
  review candidates through existing `persona_files` provenance. Bare top-level
  arrays are not recognized as Discord; generic arrays with only
  `content`/`text`/`author`/`timestamp`, `type`, attachments, or object-form
  authors fail before archive memory, candidates, or storage usage are created,
  and legacy `role`/`content` arrays with `type` still route to the legacy
  parser. ChatGPT, Claude, Reddit, legacy JSON, text, Markdown, malformed JSON
  sanitization, `.json` extension precedence, PR17 quarantine, and PR18
  quota/idempotency behavior remain green. No Discord
  bot/OAuth/webhook/gateway/API crawler, recurring pull, workers, public
  community bridge, Cloudflare, vector, Redis memory truth, publishing, billing,
  social posting, or UI reskin scope was added.
- PR20 is blocked by ARGUS, 2026-06-17: local validation may be green, but the
  new Discord parser still overclaims generic top-level arrays. A probe with
  `[{ "content": "...", "type": "note" }]` returns `format: "discord"` and
  creates `[discord/unknown]: ...`; a probe with `[{ "text": "...",
  "attachments": [{ "filename": "receipt.pdf" }] }]` also parses as Discord.
  These markers are common outside Discord and can create private archive memory
  and continuity candidates from arbitrary exports. The parser also now runs
  before `parseLegacyMessageArray`, so `[{ "role": "user", "content": "...",
  "type": "message" }]` regresses from the explicit legacy parser into Discord.
  Tighten bare-array recognition so top-level arrays require unmistakable
  Discord markers, or require a source-level Discord wrapper/metadata for
  message rows that only have generic `type`, attachment, embed, mention, or
  reaction fields. Add regressions proving generic `content + type`,
  `text + attachments`, and legacy `role + content + type` arrays fail or route
  correctly before archive memory/candidates are created, while the documented
  DiscordChatExporter-style and channel/thread object fixtures still parse.

## Near-term rule

Do the boring foundation work before the attractive surface work:

1. Reset docs and planning truth.
2. Prove repo health and local validation.
3. Baseline Supabase schema and auth/session behavior.
4. Replace in-memory/local assumptions with persistent repositories.
5. Then continue through community, continuity, publishing, Developer Spaces, and
   paid entitlements.

## Current validation commands

Use the narrow command set required by each PR. PR-01 established this full
local gate. See `docs/testing/VALIDATION_BASELINE.md` for command notes,
warning inventory, and the latest current-main result.

```bash
pnpm install
pnpm build
pnpm lint
pnpm typecheck
pnpm test:auth
pnpm test:billing
pnpm test:storage
pnpm test:integrity
pnpm test:token-credits
pnpm test:health
pnpm test:reports
pnpm test:community
pnpm test:publishing-approvals
pnpm test:spaces
pnpm test:continuity
pnpm test:persona-context
pnpm test:conversation-archive
pnpm test:continuity-publication
pnpm test:document-discussions
pnpm test:exports
pnpm test:developer-spaces
pnpm test:developer-space-client
pnpm --filter @station/api build
git diff --check
```

## Out of scope for the current roadmap

- IntelHub CTI, finance, exposure, recon, dark-provider, browser-worker, PM, and
  model-gateway layers.
- Broad Stripe/billing expansion beyond the bounded PR-17 paid-entitlement
  foundation.
- Developer Spaces visual polish before ingestion auth, validation, limits, and
  safe serialization.
