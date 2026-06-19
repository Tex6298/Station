# PR58 - Owner Space Project Assignment Readback

Date: 2026-06-19
Status: accepted by ARGUS; wake ARIADNE for short owner UI rehearsal and MIMIR for next-lane decision
Owner: DAEDALUS implements, ARGUS reviews, ARIADNE rehearses only if UI copy
or behavior changes, MIMIR decides next lane.

## Purpose

Close the PR55/PR57 ambiguity around "Other Owner Developer Spaces".

The private Project detail UI can currently tell that a Developer Space is not
attached to the current Project, but `GET /developer-spaces` does not expose
whether that space is unattached or attached to a different owner Project. PR58
should give the owner UI truthful assignment readback without opening member
roles, public Project pages, billing/quota semantics, exports, or hosted
runtime.

## Scope

Implement only:

- Extend owner-only `GET /developer-spaces` so each returned owner Developer
  Space includes its current Project assignment:
  - `projectId: string | null`;
  - `projectName: string | null`;
  - `projectSlug: string | null`.
- Populate assignment fields only from owner-scoped Project rows. Do not expose
  another owner's Project data.
- Update `packages/types/src/developer-space.ts` so `DeveloperSpaceRecord`
  carries the optional assignment fields.
- Update `serializeDeveloperSpace` or the owner-list route with the smallest
  local-pattern-compatible change.
- Update private `apps/web/app/projects/[idOrSlug]/page.tsx` so candidate copy
  can distinguish:
  - spaces not attached to any Project;
  - spaces attached to a different owner Project, where attaching will move
    them here.
- Preserve existing attach/detach behavior and refresh through
  `refreshProjectState`.
- Add focused `test:developer-spaces` coverage for owner assignment readback,
  null assignment, and cross-owner exclusion.

## Non-Scope

- No schema or migration work.
- No public Project pages or public Developer Space assignment leakage.
- No contributor/member authorization, invitations, teams, or role management.
- No quota math, billing, Stripe, usage enforcement, or entitlement changes.
- No Project activity timeline, exports, `export_packages.project_id`, or
  Project export semantics.
- No Cloudflare, Tier 2 hosting, containers, queues, Redis, deployment
  pipeline, developer-agent, chat-native tools, DexOS widgets, or
  Interconnected Lab work.

## Acceptance

ARGUS can accept PR58 if:

- `GET /developer-spaces` remains authenticated and owner-scoped.
- Owner spaces attached to owner Projects include `projectId`, `projectName`,
  and `projectSlug`.
- Owner spaces with no Project return null assignment fields.
- Cross-owner Project assignment data is excluded even if test data is hostile.
- Private Project detail copy no longer has to pretend every candidate is
  simply "other"; it truthfully says whether attaching will move a space from
  another owner Project.
- Attach/detach still refreshes Project detail and owner-space state.
- No public Project route/page, billing/quota behavior, exports, member auth,
  Cloudflare, hosted runtime, developer-agent, DexOS, or
  `export_packages.project_id` work is added.

## Validation

Run at minimum:

```bash
npm exec --yes pnpm@10.32.1 -- run test:developer-spaces
npm exec --yes pnpm@10.32.1 -- run test:projects
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

If web build is run, record the known Windows standalone symlink `EPERM`
separately from compile/type/page-generation success.

## Handoff

Wake ARGUS with:

- API/service/type/UI files changed;
- exact owner-list response-shape change;
- assignment query/filter strategy;
- null assignment and cross-owner proof;
- UI copy changes;
- attach/detach refresh confirmation;
- validation results;
- scope confirmation that no public/billing/quota/export/member/Cloudflare/
  Tier 2/developer-agent/DexOS/`export_packages.project_id` work was added.

If UI copy or behavior changes and ARGUS accepts, ARGUS should wake ARIADNE for
a short human rehearsal and wake MIMIR with the verdict. ARIADNE should verify:

- private Project detail distinguishes unassigned spaces from spaces attached
  to another owner Project;
- attach still moves a space into the current Project;
- detach returns it with truthful assignment copy;
- `390px` layout has no horizontal overflow or offscreen controls.

If blocked, wake MIMIR with the exact blocker. Do not leave the lane silent.

## ARGUS Review

Verdict: accepted on 2026-06-19.

Findings:

- Owner-only `GET /developer-spaces` now returns `projectId`,
  `assignedProjectName`, and `assignedProjectSlug`.
- `projectName` remains the Developer Space display name and is not overloaded
  with Project assignment data.
- Assignment readback is populated only through owner-scoped `projects` rows.
- Null assignments return null assignment fields.
- Hostile cross-owner `project_id` values return null assignment fields and do
  not leak Project name or slug.
- Public Developer Space routes still use the normal serializer and do not
  expose assignment readback.
- Private Project detail copy distinguishes unassigned owner spaces from spaces
  already assigned to another owner Project.
- Attach/detach still refreshes Project detail and owner-space state through
  `refreshProjectState`.
- No schema, public Project page, public Developer Space assignment leakage,
  quota math, billing, exports, member authorization, Cloudflare, Tier 2
  hosting, developer-agent, DexOS, or `export_packages.project_id` work was
  added.

ARGUS validation:

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:developer-spaces` | Pass | 12 tests passed; owner assignment, null assignment, and cross-owner Project exclusion are covered. |
| `npm exec --yes pnpm@10.32.1 -- run test:projects` | Pass | 5 tests passed; Project behavior stayed green. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck passed. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/web build` | Partial / known Windows failure | Next compiled, linted/typechecked, collected page data, and generated 31 static pages; standalone traced-file symlink copy failed with Windows `EPERM`. |
| `git diff --check HEAD~1..HEAD` | Pass | No whitespace errors. |

Rehearsal request:

- ARIADNE should do a short owner Project detail rehearsal for assignment copy:
  unassigned space, assigned-to-other-owner-Project copy, attach move, detach,
  and no public assignment leakage.

## DAEDALUS Implementation

Changed:

- Extended owner-only `GET /developer-spaces`.
- Added assignment fields to `DeveloperSpaceRecord`:
  - `projectId: string | null`;
  - `assignedProjectName: string | null`;
  - `assignedProjectSlug: string | null`.
- Kept existing `DeveloperSpaceRecord.projectName` as the Developer Space
  display-name field. This avoids overloading or breaking existing Developer
  Space UI that already uses `projectName`.
- Owner-list assignment fields are populated only from Project rows where
  `projects.owner_user_id = req.user.id`.
- Owner spaces with no Project return null assignment fields.
- Owner spaces with hostile cross-owner `project_id` test data return null
  assignment fields and do not leak Project name/slug.
- Private Project detail copy now distinguishes:
  - `Not attached to a Project`;
  - `Assigned to <Project>. Attaching moves it here`.
- Attach/detach still refreshes Project detail and owner-space state through
  `refreshProjectState`.

Files changed:

- `apps/api/src/routes/developer-spaces.ts`
- `apps/api/src/routes/developer-spaces.test.ts`
- `packages/types/src/developer-space.ts`
- `apps/web/app/projects/[idOrSlug]/page.tsx`
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/testing/VALIDATION_BASELINE.md`
- `docs/roadmap/PR58_OWNER_SPACE_PROJECT_ASSIGNMENT_READBACK.md`

Validation:

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:developer-spaces` | Pass | 12 tests passed; owner assignment, null assignment, and cross-owner exclusion are covered. |
| `npm exec --yes pnpm@10.32.1 -- run test:projects` | Pass | 5 tests passed; Project behavior stayed green. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck passed. |
| `git diff --check` | Pass | No whitespace errors; CRLF normalization warnings only for touched files and local triad state. |

Scope guard:

- No schema or migration work.
- No public Project pages or public Developer Space assignment leakage.
- No quota math, billing, exports, member auth, Cloudflare, Tier 2 hosting,
  developer-agent, DexOS, or `export_packages.project_id`.

ARIADNE rehearsal request if ARGUS accepts:

- Private Project detail distinguishes unassigned spaces from spaces assigned to
  another owner Project.
- Attach still moves a space into the current Project.
- Detach returns it with truthful assignment copy.
- `390px` layout has no horizontal overflow or offscreen controls.
