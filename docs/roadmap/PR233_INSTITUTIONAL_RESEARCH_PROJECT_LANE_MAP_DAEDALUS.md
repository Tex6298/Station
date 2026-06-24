# PR233 - Institutional/Research Project Lane Map

Owner: DAEDALUS
Reviewer: MIMIR
Status: Open
Opened: 2026-06-24

## Frame

PR232 closed the current public interaction bridge with hosted evidence for the
derived public persona updates panel. The remaining PR215 candidate with useful
near-term product value and no obvious external-config dependency is
institutional/research work.

But institutional/research work must not bolt itself onto user-only assumptions.
PR49 through PR59 created a private owner Project foundation and then paused:
Projects exist, owner APIs/UI exist, Developer Spaces can attach to Projects,
and owner-only activity readback exists. Public Projects, member
authorization, institutional ownership, project billing, project exports, and
hosted runtime remain deferred.

This lane reconciles that foundation and recommends the smallest next
implementation slice. Do not implement the slice in this PR.

## Goal

Decide whether Station is ready to resume Project/institutional/research work,
and if yes, name the exact first implementation lane plus required ARGUS gates.

## Required Repo Map

Use `rg` first and record concrete files/routes inspected.

Inspect at least:

- Project schema, API, web routes, tests, and PR49-PR59 closeout;
- Developer Space Project attachment and public/private serialization;
- Developer Space public observatory/research evidence surfaces;
- documents, document types, published document discussions, and provenance;
- export package ownership/readback;
- tier/entitlement and institutional tier semantics;
- billing/Stripe fields only enough to identify boundaries, not to implement;
- community/Salon/forum visibility and moderation only where project/institute
  authorship would cross into public discussion.

Likely files:

- `docs/roadmap/PR49_DEVELOPER_PROJECT_ABSTRACTION_MAP_DAEDALUS.md`
- `docs/roadmap/PR59_PROJECT_SCAFFOLDING_CLOSEOUT.md`
- `apps/api/src/routes/projects.ts`
- `apps/api/src/routes/projects.test.ts`
- `apps/web/app/projects/page.tsx`
- `apps/web/app/projects/[idOrSlug]/page.tsx`
- `apps/api/src/routes/developer-spaces.ts`
- `apps/web/app/developer-spaces/page.tsx`
- `apps/web/app/developer-spaces/[slug]/page.tsx`
- `packages/types/src/project.ts`
- `packages/types/src/developer-space.ts`
- `packages/types/src/document.ts`
- `apps/api/src/routes/exports.ts`
- `packages/config/src/tiers.ts`
- `packages/types/src/user.ts`
- relevant Supabase migrations for `projects`, `project_members`,
  `developer_spaces.project_id`, and `developer_space_usage.project_id`.

## Questions DAEDALUS Must Answer

1. What Project/institutional/research capability is already real?
2. Which deferred PR59 items are still blocked by missing ownership,
   membership, billing, export, or hosted-runtime policy?
3. Is the next safe slice:
   - project membership helper/readback;
   - project public page/readback;
   - project provenance on Developer Space/public documents;
   - project-aware exports;
   - institutional tier/admin surface;
   - research collection/citation surface;
   - or a different route?
4. Which candidate is the smallest no-new-config implementation that improves
   Station without claiming institutional support too early?
5. Which candidates require ARGUS preflight before DAEDALUS code?
6. What exact tests and hosted proof would the first implementation require?

## Hard Boundaries

Do not implement:

- schema, migrations, API routes, UI, seed data, or tests;
- public Project pages;
- member invitations or role-based collaboration behavior;
- institutional ownership or admin portal;
- project billing, quota enforcement, Stripe changes, tax, invoices, or
  marketplace work;
- project export packages or member export permissions;
- hosted runtime, containers, Cloudflare, Redis queues, workers, Tier 2
  hosting, or Developer Agent runtime actions;
- provider/model calls, persona-to-persona behavior, voice/avatar media, or
  broad UI reskin.

Do not re-open Phase 2D/2E unless the map finds a concrete Developer Agent
dependency. Phase 2D/2E are currently closed enough.

## Preferred Bias

Prefer a narrow, no-new-config slice that:

- strengthens the Project foundation without pretending institutions are live;
- keeps existing owner-only data private;
- improves research/developer observability or provenance;
- does not require billing, membership invites, exports, hosted runtime, or
  provider calls;
- can be reviewed by ARGUS and rehearsed by ARIADNE with live Railway if
  visible.

## Output

Append a DAEDALUS result section to this doc and update `ACTIVE_STATUS` with:

- inspected files/routes;
- current real Project/research affordances;
- blocked/deferred capabilities;
- candidate first slices with pros/cons;
- recommended exact next lane;
- whether ARGUS preflight must come before implementation;
- tests/validation/proof required for the next lane;
- what should explicitly stay out of scope.

## Validation

Docs-only unless a temporary mapping helper is added.

Run:

```text
git diff --check
git diff --cached --check
```

If any helper is added, run the matching syntax/test check.

## Wakeup

When done, wake MIMIR:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- DAEDALUS completed PR233 institutional/research Project lane map.
Recommendation:
- Name the exact next lane and whether ARGUS preflight is required.
Task:
- Decide whether to open the recommended implementation/preflight lane or pause.
```

## DAEDALUS Result - 2026-06-24

Status: mapped; MIMIR decision pending.

### Files And Routes Inspected

Roadmap and closeout:

- `docs/roadmap/PR49_DEVELOPER_PROJECT_ABSTRACTION_MAP_DAEDALUS.md`
- `docs/roadmap/PR50_PROJECT_ALPHA_SCHEMA_SKELETON.md`
- `docs/roadmap/PR51_PROJECTS_API_SKELETON.md`
- `docs/roadmap/PR52_DEVELOPER_SPACE_PROJECT_ATTACHMENT.md`
- `docs/roadmap/PR53_PROJECT_ATTACHED_DEVELOPER_SPACES_READ.md`
- `docs/roadmap/PR54_PRIVATE_PROJECT_UI_SHELL.md`
- `docs/roadmap/PR55_PRIVATE_PROJECT_ATTACHMENT_UI.md`
- `docs/roadmap/PR56_PROJECT_ACTIVITY_READBACK.md`
- `docs/roadmap/PR57_PRIVATE_PROJECT_ACTIVITY_UI.md`
- `docs/roadmap/PR58_OWNER_SPACE_PROJECT_ASSIGNMENT_READBACK.md`
- `docs/roadmap/PR59_PROJECT_SCAFFOLDING_CLOSEOUT.md`
- `docs/roadmap/STATION_FUTURE_LANES.md`

Schema and type surfaces:

- `infra/supabase/migrations/038_project_alpha_schema_skeleton.sql`
- `infra/supabase/migrations/019_developer_space_exports_usage.sql`
- `infra/supabase/migrations/009_archive_export_packages.sql`
- `packages/db/src/types.ts`
- `packages/types/src/developer-space.ts`
- `packages/types/src/document.ts`
- `packages/types/src/user.ts`
- `packages/config/src/tiers.ts`

API routes:

- `apps/api/src/routes/projects.ts`
  - `GET /projects`
  - `POST /projects`
  - `GET /projects/:idOrSlug`
- `apps/api/src/routes/developer-spaces.ts`
  - `GET /developer-spaces`
  - `POST /developer-spaces`
  - `PATCH /developer-spaces/:id/project`
  - `GET /developer-spaces/:id/usage`
  - `POST /developer-spaces/:id/documents`
  - `POST /developer-spaces/:id/documents/template`
  - public observatory routes `GET /developer-spaces/public`,
    `GET /developer-spaces/:slug`, and `GET /developer-spaces/:slug/stream`
- `apps/api/src/routes/documents.ts`
  - public/private document read, create, update, publish, discussion, and
    publish-from-continuity routes.
- `apps/api/src/routes/forums.ts`
  - public/community category, subcommunity, thread, comment, moderation, and
    link-validation paths relevant to public discussions.
- `apps/api/src/routes/exports.ts`
  - `GET/POST /exports/developer-spaces/:spaceId`
  - `GET/POST /exports/persona/:personaId`
  - `GET /exports/:id`
  - `GET /exports/:id/bundle`

Web and tests:

- `apps/api/src/routes/projects.test.ts`
- `apps/api/src/routes/developer-spaces.test.ts`
- `apps/api/src/routes/exports.test.ts`
- `apps/web/app/projects/page.tsx`
- `apps/web/app/projects/[idOrSlug]/page.tsx`
- `apps/web/app/developer-spaces/page.tsx`
- `apps/web/app/developer-spaces/[slug]/page.tsx`
- `apps/web/app/developer-spaces/[slug]/manage/page.tsx`
- `apps/web/app/space/[slug]/page.tsx`
- `apps/web/lib/developer-space-observatory.ts`
- `apps/web/lib/developer-space-observatory.test.ts`
- `apps/web/components/nav/top-nav.tsx`
- `apps/web/lib/auth-routes.ts`

Absent expected file:

- `packages/types/src/project.ts` does not exist. Project route code currently
  imports Project table/enum shapes from `@station/db`, while web pages carry
  local lightweight Project interfaces.

### Current Real Affordances

Projects are real, but only as private owner scaffolding:

- `projects` and `project_members` exist in migration `038`.
- `project_members` supports roles/statuses at the schema/type level
  (`owner`, `admin`, `editor`, `viewer`, `billing`; `invited`, `active`,
  `removed`), but route authorization does not consume membership yet.
- `GET /projects`, `POST /projects`, and `GET /projects/:idOrSlug` are
  authenticated and scoped to `owner_user_id = req.user.id`.
- Project creation writes one deterministic owner membership row.
- Project detail returns attached owner Developer Spaces and owner-filtered
  activity counters from `developer_space_usage`.
- The private web shell exposes `/projects` and `/projects/[idOrSlug]`, uses
  authenticated owner APIs, and labels the surface as private owner Projects.

Developer Space project attachment is real and owner-only:

- `developer_spaces.project_id` and `developer_space_usage.project_id` exist as
  nullable links.
- `PATCH /developer-spaces/:id/project` validates both the Developer Space and
  Project belong to the signed-in owner, then syncs usage `project_id`.
- `GET /developer-spaces` returns `projectId`, `assignedProjectName`, and
  `assignedProjectSlug` only from owner-scoped Project rows; hostile cross-owner
  `project_id` values are nulled in readback.
- Public Developer Space reads keep using public observatory serialization and
  do not expose Project assignment data.

Research/evidence affordances are already useful but not Project-native:

- Developer Spaces can link evidence documents by role:
  `methodology`, `finding`, `field_log`, and `note`.
- Template documents map to Station document types:
  `research`, `field_log`, and `archive_note`.
- Public observatories expose public-safe nodes/events/snapshots and public
  linked evidence; owner management sees owner-only drafts/links.
- Documents already have document type, visibility, provenance, source label,
  publication status, discussion thread linkage, and version snapshots.
- Public Space/document pages show document type/provenance/discussion markers.
- Forum/document-discussion routes already preserve public/community/unlisted
  visibility and community eligibility boundaries.

Exports are real but owner-targeted, not Project-targeted:

- Developer Space exports are `developer_space_archive` packages keyed by
  `owner_user_id` and `developer_space_id`.
- Persona exports are keyed by `owner_user_id` and `persona_id`.
- `export_packages.project_id` is still absent by design.
- Export routes verify owner ownership before list/create/read/bundle access.

Tier/institutional semantics are present but not institutional ownership:

- `institutional` exists in shared `Tier` types and config.
- `TIER_LIMITS.institutional` allows more Spaces and Developer Spaces.
- Billing/pricing UI treats institutional as custom/contact-sales rather than a
  Checkout tier.
- There is no institution account, institution membership, institutional admin,
  project billing owner, or organization-level Stripe/customer model.

### Still Blocked Or Deferred

The repo is not ready to claim institutional Projects, public Projects, or
multi-member research collaboration.

Deferred blockers:

- Membership authorization: `project_members` is schema-only for future roles;
  route authorization is still owner/admin only.
- Invitations/team UI: no invite, accept, remove, or role-management surface.
- Public Project identity: visibility enum includes `public`, but there is no
  public Project route/page/Discover card and no public-safe Project serializer.
- Institutional ownership: no institution/lab/company account model and no
  distinction between actor, owner, billing admin, and institution.
- Billing/quota: quotas still resolve through profile tier and Developer Space
  owner. Institutional tier is a user tier, not project billing.
- Exports: Project export semantics need actor audit, membership permission,
  target scope, and private-material rules before `export_packages.project_id`.
- Hosted runtime: Tier 2/Tier 3 connection values exist but no runtime,
  container, queue, Cloudflare/Redis worker, deployment, or job execution path
  is live.
- Public/forum authorship: forums support user/persona/document links, not
  Project authorship or Project-local moderation.
- Personal archive/memory/continuity/canon: still owner/persona-scoped and
  should not become Project material without a separate privacy policy.

### Candidate First Slices

| Candidate | Pros | Cons / Gate |
| --- | --- | --- |
| Owner-only Project evidence readback | Uses existing Project + Developer Space + document links; improves research/provenance value; no schema, public route, membership, billing, exports, or new config. | Needs careful owner scoping and no document body/private payload leakage. ARGUS review after implementation is enough if it stays private metadata-only. |
| Project membership helper/readback | Makes `project_members` less hollow and prepares later roles. | Easy to imply collaboration before invites/role semantics exist. Needs ARGUS preflight if route authorization starts consuming roles. |
| Public Project page/readback | Useful public institutional/research surface later. | Requires public serializer, visibility policy, Project assignment leakage review, Discover routing, moderation/report semantics, and ARIADNE hosted rehearsal. ARGUS preflight required before code. |
| Project provenance on public documents | Starts connecting research evidence to Project identity. | Needs schema or carefully derived provenance rules; could imply public Project identity. ARGUS preflight required if public. |
| Project-aware exports | Valuable for research packaging. | Needs actor audit, membership permissions, private-material policy, `export_packages.project_id`, and export bundle semantics. ARGUS preflight required. |
| Institutional tier/admin surface | Addresses labs/universities directly. | Needs organization ownership, billing, admin, seat, entitlement, and Stripe/customer decisions. Not ready. |
| Research collection/citation surface | Strong product direction for Station. | Best first as private owner evidence readback; public/collaborative version must wait for Project public/member policy. |

### Recommendation

Open the next implementation as:

```text
PR234 - Owner Project Evidence Readback
```

Purpose:

- Make private Projects useful as research containers by showing owner-only
  evidence/citation readback from already-attached Developer Spaces.
- Do not claim institutional support, collaboration, public Projects, exports,
  hosted runtime, or Project billing.

Exact allowed implementation:

- Extend `GET /projects/:idOrSlug` with an owner-only `evidence` array derived
  from attached owner Developer Spaces and their `developer_space_documents`
  links.
- Include bounded metadata only:
  - Developer Space id/name/slug;
  - document id/title/slug;
  - document role;
  - link visibility;
  - document type;
  - status;
  - visibility;
  - provenance type;
  - source label only if already public-safe and already shown in owner
    document/Developer Space readback;
  - published/created/updated timestamps;
  - existing public route hints only when the document is public/published or
    already owner-routeable.
- Exclude document bodies, private source ids, owner ids, raw Project member
  rows, raw event payloads, node metrics, snapshots, prompts, provider fields,
  reports, export bundle contents, ingestion keys, webhook secrets, and
  cross-owner Project/Developer Space/document data.
- Render a compact owner-only `Project evidence` or `Research evidence` panel
  on `/projects/[idOrSlug]` with empty state and no public/institutional claims.

ARGUS gate:

- No separate ARGUS preflight is required if PR234 stays private, owner-only,
  metadata-only, and schema-free.
- ARGUS should still perform hostile review after DAEDALUS implements it.
- If MIMIR wants public Project pages, member-role authorization,
  Project-authored documents, Project exports, institutional billing/admin, or
  hosted runtime instead, open ARGUS preflight before implementation.

Why this slice:

- It improves a real current surface without pretending institutions are live.
- It uses current owner scoping and already-attached Developer Space evidence.
- It gives researchers/owners a useful citation inventory for existing
  methodology/finding/field-log/note documents.
- It avoids the risky ownership questions that PR59 deliberately deferred.

### Required PR234 Validation

Implementation tests:

- `npm exec --yes pnpm@10.32.1 -- run test:projects`
  - owner Project detail includes evidence from attached owner Developer Spaces;
  - unattached, other-owner, and hostile cross-owner `project_id` evidence is
    excluded;
  - private/owner-only links are visible only in owner Project readback;
  - public route hints are emitted only for public/published routeable docs;
  - no body/source ids/owner ids/raw Project member rows leak.
- `npm exec --yes pnpm@10.32.1 -- run test:developer-spaces` if shared
  Developer Space serializers/services are touched.
- A focused web/helper test if display/copy helpers are added.
- `npm exec --yes pnpm@10.32.1 -- run typecheck`
- `npm exec --yes pnpm@10.32.1 -- run lint`
- `git diff --check`
- `git diff --cached --check`

Hosted proof:

- ARIADNE hosted rehearsal is optional for a private owner-only metadata panel.
- Require ARIADNE hosted rehearsal if the UI becomes externally visible,
  affects public observatory pages, changes Discover/search, or introduces
  public Project route hints.

### Explicitly Out Of Scope For PR234

- New schema or migrations.
- Public Project pages or Discover Project cards.
- Project member invitations, role-based route authorization, team UI, or
  institution admin.
- Project billing, quotas, Stripe, invoices, taxes, or institutional customer
  records.
- Project exports or `export_packages.project_id`.
- Hosted runtime, containers, queues, workers, Redis/Cloudflare, or Developer
  Agent runtime actions.
- Project-authored forum posts, project-local moderation, public Project
  reporting, or public Project provenance.
- Personal archive/memory/canon/continuity ownership changes.

### Validation

Docs-only lane. Run before handoff:

```text
git diff --check
git diff --cached --check
```
