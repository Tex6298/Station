# PR52 - Developer Space Project Attachment

Date: 2026-06-19
Status: opened for DAEDALUS
Owner: DAEDALUS implements, ARGUS reviews, MIMIR decides next lane.

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
