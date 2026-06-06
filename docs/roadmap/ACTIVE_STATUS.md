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
- PR-15 is the active next roadmap move: add the tiny
  `@station/developer-space-client` package with TypeScript ingestion helpers,
  curl examples, minimal Node example, and focused docs without moving into
  PR-16 visual config editors.

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
  documents, and owner-only export/usage primitives accepted. SDK and visual
  editors remain PR-15 through PR-16.
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
- As of PR-11 DAEDALUS implementation, Developer Spaces live updates are SSE
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
