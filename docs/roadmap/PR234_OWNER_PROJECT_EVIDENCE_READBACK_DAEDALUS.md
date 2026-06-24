# PR234 - Owner Project Evidence Readback

Owner: DAEDALUS
Reviewer: ARGUS
Status: Open
Opened: 2026-06-24

## Frame

PR233 reconciled the institutional/research candidate with the existing Project
foundation. The safe first implementation is not public Projects, institutional
ownership, member collaboration, exports, or billing. It is private owner-only
research/evidence readback on the Project detail page.

Projects already group owner Developer Spaces. Developer Spaces already link
methodology, finding, field-log, and note documents. PR234 should make that
evidence legible at the Project level without changing ownership semantics.

## Goal

Add owner-only Project evidence/citation readback:

- derived from Developer Spaces already attached to the signed-in owner's
  Project;
- metadata-only;
- schema-free;
- private to the Project owner;
- rendered as a compact panel on `/projects/[idOrSlug]`.

## API Scope

Extend `GET /projects/:idOrSlug` with an owner-only `evidence` array derived
from attached owner Developer Spaces and their `developer_space_documents`
links.

Allowed metadata:

- Developer Space id, name, and slug;
- document id, title, and slug;
- document role;
- link visibility;
- document type;
- status;
- visibility;
- provenance type;
- source label only if it is already public-safe and already shown in owner
  document or Developer Space readback;
- published, created, and updated timestamps;
- existing route hints only when the document is public/published or already
  owner-routeable.

Keep the response bounded. Prefer a conservative limit and deterministic sort:

- methodology/finding/field-log/note grouping if local helpers already make
  that easy;
- otherwise newest linked evidence first, then Developer Space name/title.

## Web Scope

Render an owner-only panel on `/projects/[idOrSlug]`.

Acceptable headings:

- `Project evidence`;
- `Research evidence`;
- `Attached evidence`.

The panel should show:

- evidence count;
- Developer Space source;
- document title/type/role;
- status/visibility;
- date;
- route/open action only when the route is safe.

Include an empty state for Projects with no attached evidence.

Do not claim institutional support, collaboration, public Project identity,
exports, hosted runtime, or billing readiness.

## Hard Exclusions

Do not add:

- schema or migrations;
- public Project pages or Discover Project cards;
- member invitations;
- member-role route authorization;
- team UI;
- institution/lab/company ownership;
- institutional admin;
- Project billing, quotas, Stripe changes, invoices, tax, marketplace, or
  customer records;
- Project exports, `export_packages.project_id`, or member export permissions;
- hosted runtime, containers, queues, workers, Redis/Cloudflare, Tier 2
  hosting, or Developer Agent runtime actions;
- Project-authored forum posts, Project-local moderation, public Project
  reporting, or public Project provenance;
- provider/model calls, persona-to-persona behavior, voice/avatar media, or
  broad UI reskin.

Never expose:

- document bodies;
- private source ids;
- owner ids;
- raw Project member rows;
- raw Developer Space event payloads;
- node metrics or snapshots beyond existing owner-safe metadata;
- prompts, provider fields, traces, reports, export bundle contents, ingestion
  keys, webhook secrets, env values, service keys, SQL, stack traces, or raw
  JSON blobs;
- cross-owner Project, Developer Space, or document data.

## Stop Condition

Stop and wake MIMIR/ARGUS if implementation appears to require:

- new schema;
- public Project readback;
- member-role authorization;
- Project-authored documents;
- Project exports;
- institutional billing/admin;
- hosted runtime;
- changes to private archive/memory/canon/continuity ownership.

## Tests

Add focused coverage in `apps/api/src/routes/projects.test.ts` proving:

- owner Project detail includes evidence from attached owner Developer Spaces;
- unattached Developer Spaces are excluded;
- other-owner Projects, other-owner Developer Spaces, hostile cross-owner
  `project_id` assignments, and unrelated documents are excluded;
- private/owner-only evidence metadata is visible only in owner Project readback;
- public route hints appear only for public/published routeable documents;
- document bodies, private source ids, owner ids, raw Project member rows,
  raw events, snapshots, provider fields, reports, export contents, ingestion
  keys, and secrets do not appear in JSON.

Add web/helper coverage if display helpers are added, proving:

- the panel renders count/source/title/type/role/status/visibility/date;
- empty state is clear;
- copy does not claim public Project, collaboration, institutional, export,
  hosted runtime, billing, or provider capability.

## Validation

Run:

```text
npm exec --yes pnpm@10.32.1 -- run test:projects
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- run lint
git diff --check
git diff --cached --check
```

Also run:

- `npm exec --yes pnpm@10.32.1 -- run test:developer-spaces` if shared
  Developer Space serializers/services are touched;
- the focused web/helper test command if one exists or is added.

## Review Handoff

When implementation is complete, wake ARGUS:

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS implemented PR234 Owner Project Evidence Readback.
Risk:
- This touches owner Project detail and must stay private owner-only,
  metadata-only, schema-free, and cross-owner safe.
Task:
- Review implementation and tests against
  docs/roadmap/PR234_OWNER_PROJECT_EVIDENCE_READBACK_DAEDALUS.md.
- Wake MIMIR with ACCEPT / PATCH / REJECT and whether ARIADNE hosted rehearsal
  is required.
```
