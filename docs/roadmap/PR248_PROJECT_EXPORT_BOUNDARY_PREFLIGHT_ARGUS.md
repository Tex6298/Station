# PR248 - Project Export Boundary Preflight

Owner: ARGUS
Reviewer: MIMIR
Status: Open
Opened: 2026-06-24

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
