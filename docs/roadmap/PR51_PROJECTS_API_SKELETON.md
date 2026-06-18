# PR51 - Projects API Skeleton

Date: 2026-06-19
Status: accepted by ARGUS after DAEDALUS implementation
Owner: DAEDALUS implemented, ARGUS reviewed, MIMIR decides next lane.

## Purpose

Turn the PR50 Project schema anchor into the smallest useful owner-only API
surface while preserving the current Developer Pages / Developer Spaces
behavior.

PR51 is not the Project product. It is the first repository/API skeleton for
Phase 2B so later lanes can attach Developer Spaces, billing, exports,
contributors, and hosted runtime deliberately.

## Scope

Implement only:

- Owner-authenticated Project create.
- Owner-authenticated Project list for the current user.
- Owner-authenticated Project read by `id` or `slug`.
- Conservative validation for name, slug, description, visibility, and
  `connection_tier`.
- A project repository/service shape matching existing API patterns.
- Focused API tests proving owner-only access and basic validation.
- Optional: create the owner `project_members` row during Project creation if
  it stays simple and deterministic.
- Update DB/API type surfaces if the route contracts require it.
- Update roadmap/status/validation docs.

## Required Shape

Use the PR50 schema values exactly:

```text
visibility:
- private
- unlisted
- community
- public

connection_tier:
- tier_1_showcase
- tier_2_hosted
- tier_3_lab

member role, if owner member row is created:
- owner
```

API response fields should stay boring and internal-safe:

```text
id
ownerUserId
name
slug
description
visibility
connectionTier
createdAt
updatedAt
```

If the owner member row is created in this PR, expose it only if the existing
API pattern naturally calls for it. Do not invent a contributor-management API.

## Non-Scope

- No Developer Space attachment flow.
- No `developer_spaces.project_id` writes outside Project route tests.
- No project billing, quotas, Stripe, or entitlement changes.
- No project exports and no `export_packages.project_id`.
- No public project serialization or Discover integration.
- No contributor UI.
- No member-role authorization beyond owner-only project ownership.
- No invitations.
- No Project dashboard UI.
- No seed-data backfill.
- No Cloudflare.
- No Tier 2 hosting, containers, database provisioning, Redis queues,
  deployment pipeline, developer agent, chat-native tools, or DexOS widgets.

## Acceptance

ARGUS can accept PR51 if:

- All new routes require an authenticated owner.
- A user cannot read/list another user's private Project rows.
- Create/list/read are backed by the PR50 `projects` table.
- If `project_members` is touched, only a simple owner row is created and no
  member authorization semantics are introduced.
- Developer Space behavior remains unchanged and null-project compatible.
- `export_packages.project_id` remains absent.
- No UI or public surface changes appear.

## Validation

Run at minimum:

```bash
npm exec --yes pnpm@10.32.1 -- run test:developer-spaces
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

If you add a focused `test:projects` script, run and document it too. Keep the
command set narrow; this is an API skeleton, not a full staging replay lane.

## Handoff

Wake ARGUS with:

- route/service/test files changed;
- exact routes added;
- whether an owner `project_members` row is created;
- confirmation that Developer Spaces, billing, exports, public serialization,
  Cloudflare, Tier 2, developer-agent, and DexOS scopes stayed untouched;
- validation results;
- any PR52 recommendation.

If blocked, wake MIMIR with the exact blocker. Do not leave the lane silent.

## DAEDALUS Implementation

DAEDALUS added the owner-only Projects API skeleton directly on top of the PR50
schema.

Routes added:

- `POST /projects`
- `GET /projects`
- `GET /projects/:idOrSlug`

Behavior:

- All routes require `requireAuth`.
- Create validates `name`, `slug`, `description`, `visibility`, and
  `connectionTier`.
- Create writes to `projects` with `owner_user_id = req.user.id`.
- Create also writes one deterministic `project_members` row with role
  `owner` and status `active`.
- List returns only rows where `owner_user_id = req.user.id`.
- Read looks up by UUID `id` or slug and still filters by
  `owner_user_id = req.user.id`.
- Responses expose only the PR51 safe fields:
  `id`, `ownerUserId`, `name`, `slug`, `description`, `visibility`,
  `connectionTier`, `createdAt`, and `updatedAt`.

Files changed:

- `apps/api/src/routes/projects.ts`
- `apps/api/src/routes/projects.test.ts`
- `apps/api/src/app.ts`
- `package.json`
- `docs/roadmap/PR51_PROJECTS_API_SKELETON.md`
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/testing/VALIDATION_BASELINE.md`

Validation:

```bash
npm exec --yes pnpm@10.32.1 -- run test:projects
npm exec --yes pnpm@10.32.1 -- run test:developer-spaces
npm exec --yes pnpm@10.32.1 -- run typecheck
```

All passed. `git diff --check` passed with only CRLF normalization warnings.

Scope guard:

- No Developer Space attachment flow.
- No `developer_spaces.project_id` writes.
- No project billing, quotas, Stripe, exports, public Project serialization,
  contributor UI, member-role authorization, invitations, Project dashboard UI,
  seed-data backfill, Cloudflare, Tier 2 hosting, developer-agent, or
  DexOS-widget behavior.
- `export_packages.project_id` remains absent.

PR52 recommendation:

- Add the smallest Project-to-Developer-Space attachment lane only after ARGUS
  accepts this API skeleton. Keep billing, exports, public Project pages, and
  contributor/member authorization deferred.

## ARGUS Review Result

ARGUS accepted PR51.

Review findings:

- `POST /projects`, `GET /projects`, and `GET /projects/:idOrSlug` are mounted
  behind `requireAuth`.
- Create writes `owner_user_id` from the authenticated user and creates one
  simple owner `project_members` row with role `owner` and status `active`.
- List and read both filter by `owner_user_id = req.user.id`; read by UUID or
  slug preserves that owner filter.
- Response serialization exposes only the bounded PR51 Project fields and does
  not expose member rows or future billing/export state.
- No Developer Space attachment, `developer_spaces.project_id` write,
  project billing, quota, Stripe, project export, public Project
  serialization, contributor UI, member-role authorization, invitation, Project
  dashboard, seed-data backfill, Cloudflare, Tier 2 hosting, developer-agent,
  or DexOS-widget behavior was added.
- `export_packages.project_id` remains absent.

ARGUS patch:

- Added `pnpm test:projects` to `.github/workflows/ci.yml` so the new Projects
  API smoke path is enforced by CI.

ARGUS validation:

```text
npm exec --yes pnpm@10.32.1 -- run test:projects
  Pass: 3 tests passed.

npm exec --yes pnpm@10.32.1 -- run test:developer-spaces
  Pass: 10 tests passed.

npm exec --yes pnpm@10.32.1 -- run typecheck
  Pass: API and web typecheck passed.

git diff --check
  Pass: no whitespace errors; CRLF normalization warnings only.
```

PR52 recommendation:

- Add a narrow owner-only Developer Space to Project attachment lane.
- Keep project billing, project exports, public Project pages, contributor UI,
  member-role authorization, and hosted-runtime behavior deferred.
- Consider whether Project create should eventually move into an RPC/transaction
  before richer workflows depend on project/member atomicity.
