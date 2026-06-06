# Station active status

This file is the short operational status companion to
`docs/roadmap/STATION_PR_PLAN_V2.md`. Update it when the active roadmap changes,
when a PR lands, or when validation truth changes.

## Active roadmap

- Source of truth: `docs/roadmap/STATION_PR_PLAN_V2.md`.
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
- Current `main` is under reconciliation before PR-07 starts. Commits
  `65a8328` through `63d9754` landed broader storage, integrity, token-credit,
  Stripe-adjacent, and UX work after PR-06. See
  `docs/roadmap/CURRENT_MAIN_RECONCILIATION.md`.
- Direction checkpoint, 2026-06-06: do not start PR-07 product work yet. First
  close the current-main validation repair lane by fixing or explicitly
  accepting the `test:continuity`, `test:persona-context`, and
  `test:conversation-archive` regressions. Treat the early storage,
  integrity, token-credit, Stripe-adjacent, and broad UX stack as present but
  not roadmap-complete until ARGUS confirms the reconciliation and validation
  posture.
- ARGUS confirmation, 2026-06-06: this direction is confirmed. The next active
  work should be a narrow validation-repair lane, not PR-07 product scope.
- MIMIR handoff, 2026-06-06: DAEDALUS is assigned the narrow
  validation-repair lane. Scope is limited to restoring or clearly isolating
  `test:continuity`, `test:persona-context`, and `test:conversation-archive`.
  Do not add PR-07 product surface while repairing this base.
- Validation repair, 2026-06-06: the three targeted regressions now pass with
  the pinned pnpm runner. The repair kept scope narrow: Supabase test fakes now
  model storage RPC/no-row behavior, persona runtime context expects the default
  preference profile, and persona continuity summaries count both new integrity
  sessions and existing calibration sessions. Full baseline re-run is still
  pending ARGUS review.
- Full baseline, 2026-06-06: the complete PR-01 validation gate passed with the
  pinned `npx --yes pnpm@10.32.1` runner. Known warning-only output remains the
  existing pnpm config/build-script notice, React hook dependency warnings, and
  `<img>` optimization warnings. PR-07 is cleared to begin, limited to
  Continuity Alpha data model scope only.
- PR-07 DAEDALUS implementation, 2026-06-06: the Continuity Alpha data model
  now has a narrow owner-scoped `/continuity` API skeleton over
  `continuity_records`, shared continuity DTOs, source-version schema alignment,
  and a focused `test:continuity` data-shape test. PR-07 is awaiting ARGUS
  review before it should be marked complete.

## Current repo truth

- The repo is a pnpm/Turbo monorepo with `apps/web`, `apps/api`, shared packages,
  docs, and Supabase infra.
- PR-01 uses `pnpm@10.32.1`, as declared in the root `packageManager` field.
- Existing docs describe protected alpha loops, but v2 treats auth, persistence,
  and validation as the required foundation before more product expansion.
- Supabase migrations now cover profiles, personas, spaces, documents,
  conversations, archived chats, continuity candidates, continuity records,
  forums, comments, reports, exports, social publishing, and Developer Spaces.
- Developer Spaces exists as a Station-native observatory slice, with hardening,
  live updates, Discover integration, linked documents, exports/quotas, SDK, and
  visual editors moved into PR-10 through PR-16.
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
```

## Out of scope for the current roadmap

- IntelHub CTI, finance, exposure, recon, dark-provider, browser-worker, PM, and
  model-gateway layers.
- Stripe/paid entitlements before auth, persistence, validation, continuity, and
  Developer Spaces hardening are sane.
- Developer Spaces visual polish before ingestion auth, validation, limits, and
  safe serialization.
