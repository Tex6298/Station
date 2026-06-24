# PR248 - Project Export Boundary Preflight

Owner: ARGUS
Reviewer: MIMIR
Status: ARGUS PATCH - MIMIR review pending
Opened: 2026-06-24
Reviewed: 2026-06-24

## Frame

PR233 mapped Project exports as blocked pending actor audit, membership
permission, target scope, and private-material rules. Since then, Station has
accepted:

- private owner Project evidence readback;
- public Project profile readback;
- Discover public Project surfacing;
- minimal public Project evidence readback.

That makes Project export boundaries the next useful Project foundation to
settle, but not yet an implementation lane.

## Question

Can Station safely add a first owner-only Project export manifest/readback
slice, and if yes, what is the exact implementation boundary for DAEDALUS?

## Candidate Safe Shape

MIMIR's proposed first slice:

- Owner-only Project export package/readback.
- Authenticated owner actor only; no member-role export permissions yet.
- JSON/Markdown manifest/readback only, using existing export trust language.
- Include Project metadata and bounded reference metadata from same-owner
  attached Developer Spaces, owner Project evidence, and public evidence rows.
- Include references to linked documents, not document bodies or file bodies.
- Preserve provenance and visibility labels.
- Treat `publicEvidence` and owner-only `evidence` as separate sections.
- Keep package readback private to the export owner.

Candidate allowed manifest sections:

- Project profile: name, slug, visibility, description, created/updated dates.
- Attached Developer Spaces: public/private visibility labels, names/slugs, and
  safe summary metadata.
- Owner Project evidence references: roles, document titles/slugs, document
  type/status/visibility, provenance label, link visibility, timestamps.
- Public evidence references: the already accepted `publicEvidence` shape.
- Export trust notes: owner-only package, provenance preserved, public copies
  remain separate.

## Hostile Questions For ARGUS

- Is a Project export safe without implementing Project membership
  authorization? If yes, confirm owner-only actor semantics.
- Does the first slice need a schema migration, such as
  `export_packages.project_id` or a new export kind, or can it use existing
  export-package metadata safely?
- Should document body inclusion be explicitly deferred?
- Should Developer Space export bundles be referenced only, or nested into the
  Project export manifest?
- What exact private-material rules prevent leaking drafts, files, source ids,
  raw link rows, private evidence hints, or cross-owner data?
- What should happen for public Projects with public evidence and private owner
  evidence in the same export?
- What tests must prove owner scoping, hostile cross-owner exclusions, payload
  minimization, and bundle/readback privacy?
- Does this require ARIADNE hosted rehearsal after implementation, or is local
  export/readback validation enough for an owner-only manifest?

## Hard Exclusions

Do not allow the next implementation lane to add:

- public Project export routes;
- member/admin/billing export permissions;
- institutional ownership, seat/admin model, invoices, Stripe changes, or
  customer/account changes;
- direct document body export, file export, binary/PDF packaging, nested
  Developer Space bundles, or workspace-wide export unless ARGUS explicitly
  accepts it;
- Project export sharing, public download URLs, or unauthenticated bundle
  access;
- background jobs, queues, workers, Redis, Cloudflare, cache, hosted runtime,
  provider/model calls, or Developer Agent execution;
- Project membership/invite UI, public Project reporting, Project-authored
  forum posts, or broad Project UI redesign.

## Expected ARGUS Output

Return one of:

- `ACCEPT`: owner-only Project export can proceed, with exact PR249
  implementation scope and required validation.
- `PATCH`: Project export may proceed only after changing the candidate scope;
  include exact corrected scope.
- `REJECT`: Project export should stay deferred; recommend the next safer lane.

## ARGUS Verdict - 2026-06-24

Verdict: `PATCH`.

Owner-only Project export manifest/readback can proceed, but only as a narrower
foundation than the candidate shape. The first lane must be an API-only,
owner-only manifest target. It must not reuse persona or Developer Space export
semantics in a way that accidentally enables bundles, document bodies,
Developer Space raw data, member permissions, public URLs, or background export
work.

### Safer PR249 Lane

Open **PR249 - Owner Project Export Manifest Foundation** for DAEDALUS with this
exact boundary.

Actor and routes:

- Authenticated Project owner only.
- No member, admin, billing, institutional, seat, or delegated export
  permission.
- Add API routes only:
  - `GET /exports/projects/:projectIdOrSlug`
  - `POST /exports/projects/:projectIdOrSlug`
- `:projectIdOrSlug` must resolve through the existing owner-scoped Project
  read semantics: `projects.owner_user_id = req.user.id`; non-owner reads and
  creates return `404`.
- Do not add public export routes, public download URLs, or Project export UI.

Required schema/package target:

- Add a small migration for a real Project target:
  - `export_packages.project_id uuid references public.projects(id) on delete cascade`;
  - package kind `project_manifest`;
  - target check requiring:
    - `project_manifest`: `project_id` set, `persona_id` null,
      `developer_space_id` null;
    - existing persona and Developer Space target checks remain intact;
  - index on `(owner_user_id, project_id, created_at desc)` for Project
    packages;
  - RLS policy extended so `project_manifest` rows are visible/writable only
    when the target Project is owned by `auth.uid()`.
- Update DB types and quota helper target typing for `project_manifest`.
- Reuse existing synchronous export package status/readback mechanics only after
  the target constraint exists.

Manifest scope:

- Manifest schema: `station.project.export_manifest.v1`.
- Format remains `json_markdown`.
- Included sections are limited to:
  - `project`;
  - `attached_developer_spaces`;
  - `owner_project_evidence_refs`;
  - `public_project_evidence_refs`;
  - `trust`.
- `project` may include only name, slug, visibility, description,
  created/updated dates.
- Attached Developer Space references may include only public/private
  visibility labels, project names, slugs, descriptions, visualisation type,
  and updated dates for same-owner spaces attached to the Project.
- Owner Project evidence references may include only same-owner attached
  Developer Space slug/name, link role, link visibility, document title, slug,
  document type, status, visibility, provenance type/label, timestamps, and
  route label/href if already owner-safe. Do not include document bodies,
  source ids, raw link rows, or Developer Space ids.
- Public evidence references may reuse the accepted `publicEvidence` shape only.
- Keep owner-only `evidence` and visitor-safe `publicEvidence` as separate
  manifest sections.
- Trust notes must explicitly say the package is owner-only, document bodies are
  omitted, public references are separate from owner evidence, and linked source
  rows remain private.

Explicitly disallow in PR249:

- document bodies, body excerpts, file contents, binary/PDF packaging, full
  workspace export, nested Developer Space bundles, node/event/snapshot/raw
  observatory data, usage counters, storage paths, source ids, raw source
  bodies, raw link-row ids, private evidence hints in public sections, raw JSON
  dumps, SQL, stack traces, env values, or secrets;
- `/exports/:id/bundle` support for `project_manifest`; it must return a clear
  unsupported/409 response for Project manifest packages until a separate
  Project bundle lane is approved;
- public Project export routes or unauthenticated package access;
- Project member/admin/billing export permissions;
- institutional ownership, invoices, Stripe, customer/account changes, Project
  billing/admin hierarchy;
- background jobs, queues, workers, Redis, Cloudflare, cache, hosted runtime,
  provider/model calls, or Developer Agent execution;
- broad Project UI redesign or public Project page changes.

Mixed public/private Project behavior:

- Owner-only manifest may include private owner evidence references in the
  owner section and public evidence references in the public section.
- The public section must never imply or count private evidence.
- Cross-owner, unattached, and other-Project evidence must be excluded from both
  sections.

Required tests:

- Anonymous requests to Project export routes return auth failure.
- Non-owner requests for a Project export list/create/readback return `404`.
- Owner can create and list one `project_manifest` package for an owned Project.
- Package row has `project_id` set, `persona_id` null, `developer_space_id`
  null, package kind `project_manifest`, and owner id set to the authenticated
  owner.
- In-progress package guard blocks duplicate requested/processing Project
  manifest packages for the same owner/project target without blocking persona
  or Developer Space export targets.
- Manifest includes only the allowed sections and allowed field names.
- Same-owner attached Developer Spaces are included as references; unattached,
  cross-owner, and other-Project spaces are excluded.
- Owner evidence refs include same-owner attached evidence only; private/draft
  document bodies, source ids, raw link ids, cross-owner docs, and other-Project
  evidence are excluded.
- Public evidence refs match the accepted `publicEvidence` shape and remain
  separate from owner evidence refs.
- `/exports/:id` readback is owner-only for Project manifest packages.
- `/exports/:id/bundle` rejects `project_manifest` packages until a separate
  bundle lane is opened.
- Existing persona and Developer Space export tests continue to pass.

Required validation for PR249:

- `npm exec --yes pnpm@10.32.1 -- run test:exports`
- `npm exec --yes pnpm@10.32.1 -- run test:projects`
- `npm exec --yes pnpm@10.32.1 -- run typecheck`
- `npm exec --yes pnpm@10.32.1 -- run lint`
- `git diff --check`
- `git diff --cached --check`

Hosted rehearsal is not required for the API-only first slice if DAEDALUS keeps
it to owner-only manifest/list/readback APIs and local tests prove the boundary.
Require ARIADNE hosted rehearsal if DAEDALUS adds UI, bundle readback, download
behavior, auth middleware changes, or any public route.

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS completed PR248 Project Export Boundary Preflight.
Verdict:
- ACCEPT / PATCH / REJECT.
Task:
- If accepted or patched, MIMIR should open the precise DAEDALUS
  implementation lane.
- If rejected, MIMIR should choose the next safer Project or Phase 3 lane.
```
