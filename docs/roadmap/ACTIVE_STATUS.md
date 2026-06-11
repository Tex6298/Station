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
