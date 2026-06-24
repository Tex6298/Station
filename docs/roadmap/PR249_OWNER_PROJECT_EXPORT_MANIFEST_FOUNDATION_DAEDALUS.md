# PR249 - Owner Project Export Manifest Foundation

Owner: DAEDALUS
Reviewer: ARGUS
Status: Implemented - ARGUS review pending
Opened: 2026-06-24

## Frame

ARGUS completed PR248 with a `PATCH` verdict. Owner-only Project export can
proceed only as an API-only manifest foundation.

This lane must not reuse persona or Developer Space export semantics in a way
that accidentally enables Project bundles, document bodies, Developer Space raw
data, member permissions, public URLs, or background export work.

## Goal

Add owner-only Project export manifest/list/create/readback APIs with explicit
Project package targeting.

## Actor And Routes

- Authenticated Project owner only.
- No member, admin, billing, institutional, seat, or delegated export
  permission.
- Add API routes only:
  - `GET /exports/projects/:projectIdOrSlug`
  - `POST /exports/projects/:projectIdOrSlug`
- `:projectIdOrSlug` must resolve through existing owner-scoped Project read
  semantics: `projects.owner_user_id = req.user.id`.
- Non-owner reads and creates return `404`.
- Do not add public export routes, public download URLs, Project export UI, or
  broad export navigation.

## Schema And Package Target

Add a small migration for a real Project target:

- `export_packages.project_id uuid references public.projects(id) on delete cascade`;
- package kind `project_manifest`;
- target check requiring:
  - `project_manifest`: `project_id` set, `persona_id` null,
    `developer_space_id` null;
  - existing persona and Developer Space target checks remain intact;
- index on `(owner_user_id, project_id, created_at desc)` for Project packages;
- RLS policy extended so `project_manifest` rows are visible/writable only when
  the target Project is owned by `auth.uid()`.

Update DB types and quota/helper target typing for `project_manifest`. Reuse
existing synchronous export package status/readback mechanics only after the
target constraint exists.

## Manifest Scope

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
  visibility labels, project names, slugs, descriptions, visualisation type, and
  updated dates for same-owner spaces attached to the Project.
- Owner Project evidence references may include only same-owner attached
  Developer Space slug/name, link role, link visibility, document title, slug,
  document type, status, visibility, provenance type/label, timestamps, and
  route label/href if already owner-safe.
- Public evidence references may reuse the accepted `publicEvidence` shape only.
- Keep owner-only `evidence` and visitor-safe `publicEvidence` as separate
  manifest sections.
- Trust notes must explicitly say the package is owner-only, document bodies are
  omitted, public references are separate from owner evidence, and linked source
  rows remain private.

## Hard Exclusions

Do not add or expose:

- document bodies, body excerpts, file contents, binary/PDF packaging, full
  workspace export, nested Developer Space bundles, node/event/snapshot/raw
  observatory data, usage counters, storage paths, source ids, raw source
  bodies, raw link-row ids, private evidence hints in public sections, raw JSON
  dumps, SQL, stack traces, env values, or secrets;
- `/exports/:id/bundle` support for `project_manifest`; it must return a clear
  unsupported or `409` response for Project manifest packages until a separate
  Project bundle lane is approved;
- public Project export routes or unauthenticated package access;
- Project member/admin/billing export permissions;
- institutional ownership, invoices, Stripe, customer/account changes, Project
  billing/admin hierarchy;
- background jobs, queues, workers, Redis, Cloudflare, cache, hosted runtime,
  provider/model calls, or Developer Agent execution;
- broad Project UI redesign or public Project page changes.

## Required Tests

Add or update tests proving:

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

## Validation

Run:

```text
npm exec --yes pnpm@10.32.1 -- run test:exports
npm exec --yes pnpm@10.32.1 -- run test:projects
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- run lint
git diff --check
git diff --cached --check
```

Hosted rehearsal is not required for the API-only first slice if scope stays to
owner-only manifest/list/readback APIs and local tests prove the boundary.
Wake MIMIR if implementation requires UI, bundle readback, download behavior,
auth middleware changes, or any public route.

## Wakeup

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS implemented PR249 Owner Project Export Manifest Foundation.
Validation:
- List exact commands and results.
Risk:
- Project export targeting, owner-only RLS, manifest minimization, and bundle
  rejection need hostile review.
Task:
- Review PR249 against ARGUS's narrowed PR248 scope.
- Wake MIMIR with ACCEPT / FAIL / BLOCKED and whether ARIADNE hosted rehearsal
  is required.
```
