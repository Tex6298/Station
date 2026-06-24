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
