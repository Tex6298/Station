# Station PR plan

This is the PR-ready backlog for moving the current protected alpha spine toward the prepared Station MVP. Each PR should stay narrow, keep the validation gate green, and avoid claiming doc-level completion unless the acceptance criteria below are met.

## PR-01 — `fix: make remote deployment status truthful`

**Purpose:** Make the external deployment/status story match local validation.

**Deliverables**

- Resolve the failing remote deployment/status check, or document why it is non-blocking.
- Add a short deployment-status note to setup or roadmap docs.
- Keep the current local validation gate intact.

**Acceptance**

- Remote checks are green or intentionally waived in writing.
- The roadmap no longer implies remote green unless it is true.
- Local validation still passes.

**Do not include**

- Product feature work.
- Refactors unrelated to deployment status.

## PR-02 — `feat: harden conversation archive beta`

**Purpose:** Move chat archiving from protected alpha into a better user-facing archive flow.

**Deliverables**

- Soft-limit warning before archive.
- Archived transcript visible in the persona Library/Archive as a readable artifact.
- Candidate generation improved beyond simple keyword slicing.
- Candidate review supports accept, edit, reject, and defer.
- Context preview and export reference archived transcripts clearly.

**Acceptance**

- Owner can archive, review candidates, and find the transcript later.
- Archived conversations remain read-only.
- Other users cannot access transcripts or candidates.
- `pnpm test:conversation-archive` covers the main privacy and review paths.

**Do not include**

- Full external imports.
- Full document authoring/versioning.

## PR-03 — `feat: implement four onboarding paths`

**Purpose:** Match the documented onboarding model without making claims Station cannot technically support yet.

**Deliverables**

- API Bridge path scaffolded with careful continuity language.
- Document Migrator path that seeds archive/import records.
- Awakening path retained and grounded without ontological claims.
- Fresh Start path that creates persona plus first Integrity Session.
- Initial Memory/Canon/Archive/Integrity candidates where appropriate.

**Acceptance**

- Users can choose one of four paths.
- Each path creates inspectable, private foundation records.
- The flow does not imply that an external persona has literally transferred unless future API work proves it.

**Do not include**

- Production Reddit import.
- Full Station Assistant intelligence.

## PR-04 — `feat: build native document authoring and versioning`

**Purpose:** Make Station documents feel like serious authored works rather than posts.

**Deliverables**

- Draft/edit/publish UI.
- Document types aligned to the docs: essay, codex, manifesto, field_log, research, archive_note, transcript.
- Codex version history.
- Visibility and provenance preserved across edits/publishing.
- Published documents surface on Space/Discover and attach discussions.

**Acceptance**

- A Creator-tier user can draft and publish a typed document.
- A codex can be versioned without losing prior versions.
- Public copies remain distinct from private sources.

**Do not include**

- Full rich text editor perfection.
- Station Press/PDF output.

## PR-05 — `feat: add visibility-safe search and archive retrieval`

**Purpose:** Make archive and public content findable without weakening privacy.

**Deliverables**

- Private search across persona memory, canon, archive, documents, and transcripts.
- Public/community search across public documents, Spaces, and forum threads.
- Developer Space event/document search.
- Source/provenance-aware search result cards.

**Acceptance**

- Search results are enforced by API-level visibility checks.
- Private artifacts never appear in public/community search.
- Result cards expose enough provenance to understand source type.

**Do not include**

- Full vector tuning or ranking optimisation.
- External search engine integration.

## PR-06 — `feat: add Station Assistant workflow shell`

**Purpose:** Introduce the non-persona operational helper described in the docs.

**Deliverables**

- Station Assistant surface in Studio distinct from personas.
- Workflow shell for archive organization, publication, Space editing, export, and onboarding help.
- Confirmation-based actions for any state-changing task.
- Safe workspace-state summaries.

**Acceptance**

- Assistant cannot be mistaken for a persona.
- Assistant can guide at least two real workflows end-to-end with owner confirmation.
- Assistant does not expose private data to public routes.

**Do not include**

- Persona-like memory/canon for the Assistant.
- Autonomous publishing without confirmation.

## PR-07 — `feat: complete forum community beta`

**Purpose:** Move beyond document discussions into the community layer.

**Deliverables**

- Polished forum category index and category pages.
- Thread creation/reply flow protected by tier rules.
- Subcommunity scaffold for Canon/Developer users.
- Hide/remove/lock/report moderation actions.
- Forum smoke tests in CI.

**Acceptance**

- Members can browse categories, read threads, reply, and start eligible threads.
- Moderators/admins can perform basic moderation actions.
- Public/community visibility rules hold under tests.

**Do not include**

- Full reputation system.
- Notifications/social graph.

## PR-08 — `feat: add external archive intake jobs`

**Purpose:** Build the intake half of the archive trust promise.

**Deliverables**

- ChatGPT export parser.
- Claude export parser.
- Discord export scaffold if feasible.
- Reddit import job scaffold with OAuth placeholders and rate-limit awareness.
- Metadata-preserving review flow that can feed continuity candidates.

**Acceptance**

- Imported material records source metadata.
- Imports run through job records/status.
- Owner can review imported material before Memory/Canon promotion.

**Do not include**

- Large-scale recurring crawlers unless job primitives are already ready.
- Public publishing by default.

## PR-09 — `chore: add platform job and realtime primitives`

**Purpose:** Prepare the platform for archive jobs, export jobs, realtime feeds, and reliable status updates.

**Deliverables**

- Background job table/adapter or queue abstraction.
- Job status API.
- Owner-visible job status UI.
- Realtime or polling scaffold for job completion and Developer Space feeds.
- Visible failure states and retry/follow-up path.

**Acceptance**

- Export/import jobs can move through queued, running, completed, failed.
- Users can see status without inspecting logs.
- Failures are visible and recoverable.

**Do not include**

- Provider-specific job complexity unless needed for tests.

## PR-10 — `feat: add quota and usage tracking primitives`

**Purpose:** Avoid retrofitting tier enforcement later.

**Deliverables**

- Usage records for storage, token use, embedding calls, archive imports, exports, Developer Space events, and public traffic.
- Daily usage summary shape.
- Clear API errors for exceeded quotas.
- User-facing usage dashboard scaffold.

**Acceptance**

- Usage is recorded in a shared shape across user/project resources.
- Limits can be enforced without silent failure.
- Tests prove at least one limit path.

**Do not include**

- Billing product redesign.
- Hard pricing decisions beyond config placeholders.

## PR-11 — `feat: harden Developer Spaces for partner pilots`

**Purpose:** Make Developer Spaces partner-ready rather than merely demoable.

**Deliverables**

- Realtime event feed or polling fallback.
- API key rotation/audit history.
- Request limits and clearer ingest errors.
- Batch import examples and docs.
- Owner data export/download for events/snapshots.
- Visualization config validation per Node Field, Timeline, World Map, and Constellation.

**Acceptance**

- A partner can integrate with documented examples.
- Ingest failures are actionable.
- Public observatory remains safe and does not expose raw private payloads.

**Do not include**

- Full hosted compute/runtime scheduling.
- Institutional project abstraction unless PR-15 has landed.

## PR-12 — `feat: public persona pages with bounded interaction`

**Purpose:** Connect public Spaces to opted-in public personas safely.

**Deliverables**

- Public persona page for opted-in personas.
- Visitor/session message limits.
- Public-safe context assembly only.
- Owner analytics/counts scaffold.

**Acceptance**

- Visitors can interact within limits.
- Private continuity never leaks into public persona calls.
- Owners can disable public interaction.

**Do not include**

- Persona Roulette.
- Voice/avatar mode.
- Persona-to-persona encounters.

## PR-13 — `feat: mobile Studio polish pass`

**Purpose:** Make the core private surface usable on phones.

**Deliverables**

- Mobile-friendly Studio navigation.
- Chat, memory, canon, archive, candidate review, and export work at 375px width.
- Developer visualizations degrade to summary panels on mobile.

**Acceptance**

- Manual responsive smoke checks pass for Studio critical paths.
- No horizontal overflow on core Studio pages.
- Candidate review is usable on mobile.

**Do not include**

- Native mobile app work.

## PR-14 — `feat: archive export packages as portable bundles`

**Purpose:** Upgrade export manifests into actual portable archive packages.

**Deliverables**

- Background export generation.
- JSON and Markdown files assembled into a bundle.
- Original uploaded files included or referenced according to storage availability.
- Temporary download URL and expiry policy.
- Owner-only access and audit trail.

**Acceptance**

- Owner can download a portable bundle.
- Bundle contents match manifest counts.
- Non-owners cannot retrieve package or manifest.

**Do not include**

- Station Press/POD ordering.

## PR-15 — `feat: project abstraction for developer and institutional spaces`

**Purpose:** Avoid user-only ownership assumptions before institutional work starts.

**Deliverables**

- Project entity and membership model.
- Optional project_id on Spaces, Developer Spaces, Documents, and usage records.
- Role-based project access scaffold.
- Migration path preserving existing user-owned rows.

**Acceptance**

- Existing user-owned content still works.
- A project can own future Spaces/Developer Spaces.
- Membership roles can be checked by API routes.

**Do not include**

- Full institutional sales/admin portal.

## PR-16 — `feat: Station Press proof of concept`

**Purpose:** Start the physical archive lane after digital export is trustworthy.

**Deliverables**

- Select published/private export material for print preview.
- Generate a basic PDF preview.
- Keep provider/order integration disabled behind config until pricing/POD partner is decided.

**Acceptance**

- A user can preview a PDF compiled from selected Station material.
- No real order is submitted by default.
- Export/privacy rules are reused for source access.

**Do not include**

- Production print-on-demand integration.
- Payment capture.

## Dependency map

```text
PR-01 deployment truth can happen at any time.
PR-02 archive beta should precede PR-08 imports and PR-14 bundles.
PR-03 onboarding benefits from PR-02 but can start independently.
PR-04 authoring should precede deeper Discover/editorial work.
PR-05 search becomes more valuable after PR-02/04.
PR-06 Assistant becomes more useful after PR-02/03/04.
PR-07 community beta builds on document discussions already landed.
PR-09 jobs should precede production imports/exports/realtime-heavy work.
PR-10 quotas should precede partner pilots.
PR-11 partner Developer Spaces should follow PR-09/10 where possible.
PR-14 portable bundles should follow PR-09.
PR-15 project abstraction should happen before institutional work.
PR-16 Station Press should follow PR-14.
```
