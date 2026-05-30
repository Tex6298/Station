# Station PR plan v2

This is the active Station roadmap. It supersedes the older loose next-step notes and
the prior PR backlog. Keep future planning and implementation aligned to this file
unless a later roadmap explicitly replaces it.

## Supersedes

- README "Next steps".
- Developer Spaces follow-up list in `docs/integration/intelhub-to-station-developer-spaces.md`.
- `docs/roadmap/pr-plan.md`.
- Any older informal Station roadmap notes.

## Product boundary

Do not import IntelHub CTI, exposure, recon, finance, dark-provider,
browser-worker, PM, or model-gateway layers.

Station's near-term product is continuity, publishing, archive, community, and
Developer Spaces.

## Current truth

- Station Studio Alpha scaffold exists.
- Studio routes, API persona/conversation routes, shared config/types/permissions,
  AI adapter scaffolding, in-memory local data, and the first DeepSeek-compatible
  wrapper shape exist.
- The tree has Supabase-shaped API services, migrations, and tests. API and
  frontend auth/session behavior are now proven; persistent DB repos remain
  foundation work before product expansion.
- Real Stripe and paid entitlements are not product-ready.
- Developer Spaces has a Station-native observatory slice: owner-created project
  observatories, hashed ingestion keys, node/event/snapshot ingestion endpoints,
  public observatory pages, and private management surfaces.

## Validation baseline

PRs should keep the relevant narrow gate green. Foundation PRs should converge on
this full local gate:

```bash
pnpm install
pnpm build
pnpm lint
pnpm typecheck
pnpm test:auth
pnpm test:spaces
pnpm test:continuity
pnpm test:persona-context
pnpm test:conversation-archive
pnpm test:continuity-publication
pnpm test:document-discussions
pnpm test:exports
pnpm test:developer-spaces
```

## PR-00 - Roadmap reset and source-of-truth docs

Purpose: create the new roadmap files and stop old loose notes from driving Codex.

Tasks:

- Add `docs/roadmap/STATION_PR_PLAN_V2.md`.
- Add `docs/roadmap/ACTIVE_STATUS.md`.
- Add `docs/roadmap/SUPERSEDED.md`.
- Update README so it points to this roadmap instead of keeping loose next steps as
  the source of truth.
- Mark older roadmap/follow-up documents as superseded or historical.

Acceptance:

```bash
pnpm build
pnpm lint
pnpm typecheck
```

## PR-01 - Repo health and validation baseline

Purpose: make Codex safe to work in the repo before adding more product.

Tasks:

- Confirm all package scripts run or document failures.
- Add or update `.env.example` files.
- Ensure Turbo/pnpm workspace builds cleanly.
- Add CI-equivalent local validation docs.
- Make test scripts deterministic.

Acceptance:

```bash
pnpm install
pnpm build
pnpm lint
pnpm typecheck
pnpm test:spaces
pnpm test:continuity
pnpm test:persona-context
pnpm test:conversation-archive
pnpm test:continuity-publication
pnpm test:document-discussions
pnpm test:exports
pnpm test:developer-spaces
```

## PR-02 - Supabase schema baseline

Purpose: turn the scaffold into something that can persist.

Tasks:

- Consolidate Supabase migrations.
- Define canonical tables for users/profiles, spaces, documents, conversations,
  personas, forums, comments, reports, exports, continuity records, and Developer
  Spaces.
- Add RLS policy notes, even if full RLS is completed later.
- Update `packages/db` types.
- Keep in-memory repositories available only as local/test fallback.

Acceptance:

```bash
pnpm --filter @station/types build
pnpm --filter @station/db build
pnpm typecheck
```

## PR-03 - Supabase auth/session hardening and proof

Purpose: prove and harden the existing Supabase-shaped API auth/session layer.

Tasks:

- Audit existing auth routes, controller, service, middleware, Supabase helpers,
  shared auth package, and user types.
- Prove `requireAuth`, `optionalAuth`, `/auth/me`, and auth-gated signout.
- Decide and document beta signup email-confirmation behavior.
- Normalize API/shared auth user shape where useful.
- Add or update env examples/docs for API and browser Supabase keys.
- Keep frontend auth UX and repository replacement out of scope.

Acceptance:

```bash
pnpm test:auth
pnpm typecheck
```

## PR-04 - Frontend auth and protected route flow

Purpose: make the web shell usable with real sessions.

Tasks:

- Login, signup, and logout.
- Session restore.
- Protected Studio routes.
- Public route separation.
- Auth-aware navigation.
- Friendly empty/loading/error states.
- Connect frontend forms to live auth.

Acceptance:

```bash
pnpm build
pnpm lint
pnpm typecheck
```

## PR-05 - Replace in-memory repos with persistent DB repos

Purpose: finish the biggest scaffold-to-product transition.

Tasks:

- Replace in-memory repo calls with Supabase-backed implementations.
- Keep repository interfaces stable.
- Add tests proving data survives across requests.
- Complete the transition for core Station entities before adding new features.

Acceptance:

```bash
pnpm test:spaces
pnpm test:conversation-archive
pnpm test:document-discussions
pnpm test:exports
pnpm typecheck
```

## PR-06 - Community Beta persistence and permissions

Purpose: harden existing Community Beta scaffolding.

Tasks:

- Spaces CRUD.
- Documents CRUD.
- Forum/comment persistence.
- Report route persistence.
- Discover visibility rules.
- Owner/member/public permissions.
- Moderation basics: hide, delete, lock, and report.

Acceptance:

```bash
pnpm test:spaces
pnpm test:document-discussions
pnpm build
```

## PR-07 - Continuity Alpha data model

Purpose: start the next named product milestone properly.

Tasks:

- Define continuity entities: timeline item, memory, source, version,
  conversation archive, persona context, and publication candidate.
- Add migrations and types.
- Add API skeleton.
- Add tests around data shape only.

Acceptance:

```bash
pnpm test:continuity
pnpm test:persona-context
pnpm test:conversation-archive
pnpm typecheck
```

## PR-08 - Continuity Studio UI

Purpose: make Continuity visible and usable.

Tasks:

- Continuity dashboard.
- Timeline/archive view.
- Persona context panel.
- Conversation archive view.
- Link documents and conversations into continuity records.
- Draft continuity publication flow.

Acceptance:

```bash
pnpm test:continuity
pnpm test:continuity-publication
pnpm build
```

## PR-09 - Publication and export pipeline

Purpose: turn continuity and community work into shareable artifacts.

Tasks:

- Export documents/reports.
- Export continuity archive.
- Public, private, and unlisted publication states.
- Report-route polish.
- Export metadata and provenance.
- Basic PDF, Markdown, or JSON package support, depending what already exists.

Acceptance:

```bash
pnpm test:exports
pnpm test:continuity-publication
pnpm build
```

## PR-10 - Developer Spaces hardening

Purpose: finish the existing Developer Spaces observatory patch as Station-native
product, not IntelHub cargo-culting.

Tasks:

- Harden ingestion auth.
- Add key rotation/revocation.
- Add better owner console states.
- Add ingestion validation.
- Add rate/size guardrails.
- Add public-safe serialization.
- Ensure `api_key_hash` never leaks.

Acceptance:

```bash
pnpm test:developer-spaces
pnpm build
pnpm typecheck
```

## PR-11 - Developer Spaces live updates

Purpose: replace polling with a live observatory feel.

Tasks:

- Add SSE first; add WebSocket only later if needed.
- Live node/event/snapshot updates.
- Reconnect handling.
- Public page freshness indicator.
- Owner console ingestion log stream.

Acceptance:

```bash
pnpm test:developer-spaces
pnpm build
```

## PR-12 - Developer Spaces Discover integration

Purpose: make Developer Spaces visible as public/community objects.

Tasks:

- Public Developer Space cards.
- High-signal event cards.
- Search/filter/sort.
- Public/unlisted/private visibility.
- Link Developer Spaces into normal Station Spaces.

Acceptance:

```bash
pnpm test:spaces
pnpm test:developer-spaces
pnpm build
```

## PR-13 - Linked documents, methodology, field logs

Purpose: connect Developer Spaces to Station's archive and publishing promise.

Tasks:

- Attach Station documents to Developer Spaces.
- Add methodology, findings, and field-log document templates.
- Show linked documents on public observatory pages.
- Allow owner-only draft notes and public published notes.

Acceptance:

```bash
pnpm test:document-discussions
pnpm test:developer-spaces
pnpm build
```

## PR-14 - Developer Spaces export packages and quotas

Purpose: make Developer Spaces operationally safe and portable.

Tasks:

- Export nodes/events/snapshots.
- Add usage counters.
- Add quota model.
- Add public traffic/storage/ingestion counters.
- Add owner-facing usage page.

Acceptance:

```bash
pnpm test:exports
pnpm test:developer-spaces
pnpm build
```

## PR-15 - `@station/developer-space-client`

Purpose: make ingestion easy for Animus/MUDD-style projects.

Tasks:

- Add `packages/developer-space-client`.
- Provide TypeScript client.
- Include curl examples.
- Include minimal Node example.
- Add docs for node/event/snapshot ingestion.
- Keep it tiny.

Acceptance:

```bash
pnpm --filter @station/developer-space-client build
pnpm test:developer-spaces
pnpm typecheck
```

## PR-16 - Visual config editors

Purpose: make observatories feel like Station, not raw event logs.

Tasks:

- Node Field config.
- Timeline config.
- World Map config.
- Constellation config.
- Public page respects selected visual mode.
- Sensible defaults.

Acceptance:

```bash
pnpm test:developer-spaces
pnpm build
```

## PR-17 - Stripe and paid entitlements

Purpose: monetize after core persistence, auth, and product flows are stable.

Tasks:

- Pricing config.
- Paid Space and Developer Space limits.
- Stripe checkout.
- Webhook handling.
- Entitlement enforcement.
- Billing page.

Acceptance:

```bash
pnpm build
pnpm typecheck
pnpm test:spaces
pnpm test:developer-spaces
```

## Dependency guidance

The immediate first PR is PR-00, followed by PR-01. PR-02, PR-03, and PR-05 are
the foundation block and should land before expanding into shiny Developer Spaces
visuals or paid entitlements.
