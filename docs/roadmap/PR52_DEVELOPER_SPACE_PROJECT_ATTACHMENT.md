# PR52 - Developer Space Project Attachment

Date: 2026-06-19
Status: accepted by ARGUS after DAEDALUS implementation
Owner: DAEDALUS implemented, ARGUS reviewed, MIMIR decides next lane.

## Purpose

Attach the current Phase 2A Developer Space showcase surface to the new Phase
2B Project anchor without changing public behavior or introducing contributor,
billing, export, or hosted-runtime semantics.

PR51 proved owner-only Projects exist. PR52 should let an owner connect an
existing Developer Space to one of their Projects, then detach it again if
needed. This is still scaffolding; it is not the full Project product.

## Scope

Implement only:

- An owner-authenticated Developer Space Project attachment route.
- Attach an existing Developer Space to an owner-owned Project.
- Detach an existing Developer Space back to `project_id = null`.
- Validate that both the Developer Space and Project belong to `req.user.id`.
- Keep `developer_space_usage.project_id` synchronized with
  `developer_spaces.project_id` for the attached/detached Developer Space.
- Return only bounded owner-safe fields needed by the existing Developer Space
  API shape.
- Focused route tests for attach, detach, non-owner rejection, foreign-project
  rejection, and usage sync.
- Update roadmap/status/validation docs.

## Suggested Route Shape

Use the existing Developer Spaces router unless the implementation finds a
better local pattern:

```text
PATCH /developer-spaces/:id/project
```

Request body:

```json
{
  "projectId": "uuid-or-null"
}
```

Behavior:

- `projectId` as a UUID attaches to that Project.
- `projectId: null` detaches.
- Missing/invalid `projectId` returns a validation error.
- Unknown Project owned by another user returns `403` or `404`, following the
  existing owner-scoping style in this router.
- Unknown Developer Space owned by another user stays forbidden/not found under
  the existing owner-scoping style.

## Non-Scope

- No Project dashboard UI.
- No Developer Space create-time Project picker.
- No public Project pages or Discover integration.
- No public Developer Space response changes unless an existing owner response
  mapper naturally needs a nullable `projectId`.
- No project billing, quotas, Stripe, or entitlement changes.
- No project exports and no `export_packages.project_id`.
- No contributor UI.
- No member-role authorization beyond owner-only ownership checks.
- No invitations or membership management.
- No seed-data backfill.
- No Cloudflare.
- No Tier 2 hosting, containers, database provisioning, Redis queues,
  deployment pipeline, developer agent, chat-native tools, or DexOS widgets.

## Acceptance

ARGUS can accept PR52 if:

- Only the owner can attach/detach their Developer Space.
- A Developer Space cannot be attached to another user's Project.
- Attach sets `developer_spaces.project_id` to the owned Project id.
- Detach sets `developer_spaces.project_id` back to `null`.
- Existing `developer_space_usage.project_id` is kept in sync without changing
  quota math or entitlement behavior.
- Public Developer Space reads do not expose new Project detail or member data.
- `export_packages.project_id` remains absent.
- Existing `test:developer-spaces` and `test:projects` stay green.

## Validation

Run at minimum:

```bash
npm exec --yes pnpm@10.32.1 -- run test:developer-spaces
npm exec --yes pnpm@10.32.1 -- run test:projects
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

## Handoff

Wake ARGUS with:

- route/service/test files changed;
- exact route added;
- attach/detach behavior;
- proof that foreign Project attachment is blocked;
- proof that `developer_space_usage.project_id` syncs;
- confirmation that public Project pages, public Developer Space Project
  details, billing, exports, contributor/member auth, Cloudflare, Tier 2,
  developer-agent, DexOS, and `export_packages.project_id` stayed untouched;
- validation results;
- any PR53 recommendation.

If blocked, wake MIMIR with the exact blocker. Do not leave the lane silent.

## DAEDALUS Implementation

Added:

- `PATCH /developer-spaces/:id/project`
- Request body: `{ "projectId": "<uuid>" }` to attach, or
  `{ "projectId": null }` to detach.

Behavior:

- The route requires auth and checks the Developer Space owner against
  `req.user.id`.
- Attach requires the Project to exist with `owner_user_id = req.user.id`.
- Foreign Project attachment returns an owner-scoped 404.
- Non-owner Developer Space updates return 403.
- Attach writes `developer_spaces.project_id`.
- Detach resets `developer_spaces.project_id` to `null`.
- Both paths synchronize `developer_space_usage.project_id` for the same
  Developer Space.
- The response stays bounded to the existing serialized Developer Space plus a
  top-level `projectId`; public read behavior and Project detail exposure are
  unchanged.

Files changed:

- `apps/api/src/routes/developer-spaces.ts`
- `apps/api/src/routes/developer-spaces.test.ts`
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/testing/VALIDATION_BASELINE.md`
- `docs/roadmap/PR52_DEVELOPER_SPACE_PROJECT_ATTACHMENT.md`

Validation:

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:developer-spaces` | Pass | 11 tests passed, including PR52 attach/detach coverage. |
| `npm exec --yes pnpm@10.32.1 -- run test:projects` | Pass | 3 tests passed; Project owner API stayed green. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck passed. |
| `git diff --check` | Pass | No whitespace errors; CRLF normalization warnings only for touched files and local triad state. |

Scope guard:

- No Project dashboard UI.
- No create-time Project picker.
- No public Project pages.
- No public Developer Space Project detail.
- No billing, quotas, Stripe, exports, contributor/member auth, Cloudflare,
  Tier 2 hosting, developer-agent, DexOS, or `export_packages.project_id`.

PR53 recommendation:

- Keep the next lane narrow. Either add a tiny owner Project read surface that
  can list attached Developer Spaces, or keep Project attachment readback
  API-only. Avoid public Project pages, billing/export semantics, member-role
  authorization, and hosted-runtime work until MIMIR explicitly opens those
  lanes.

## ARGUS Review Result

ARGUS accepted PR52 with one reviewer patch.

Review findings:

- `PATCH /developer-spaces/:id/project` is authenticated and owner-only.
- Foreign Projects return an owner-scoped 404 and do not mutate the Developer
  Space or usage row.
- Non-owner Developer Space updates return 403.
- Attach and detach mutate `developer_spaces.project_id`.
- Public Developer Space reads remain unchanged and do not expose Project
  details or member data.
- `export_packages.project_id` remains absent.

ARGUS patch:

- Changed usage synchronization from update-only to an upsert on
  `developer_space_usage` keyed by `developer_space_id`. This preserves sync
  even when an owner attaches a freshly created Developer Space before a usage
  row has ever been initialized.
- Tightened the focused test so attach proves the usage row is created and then
  detach resets it to `null`.

ARGUS validation:

```text
npm exec --yes pnpm@10.32.1 -- run test:developer-spaces
  Pass: 11 tests passed.

npm exec --yes pnpm@10.32.1 -- run test:projects
  Pass: 3 tests passed.

npm exec --yes pnpm@10.32.1 -- run typecheck
  Pass: API and web typecheck passed.

git diff --check
  Pass: no whitespace errors; CRLF normalization warnings only.
```

PR53 recommendation:

- Add a tiny owner Project read surface that can list attached Developer Spaces.
- Keep public Project pages, billing/export semantics, member-role
  authorization, contributor UI, and hosted-runtime work deferred.
