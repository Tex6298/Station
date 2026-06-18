# PR51 - Projects API Skeleton

Date: 2026-06-19
Status: opened for DAEDALUS
Owner: DAEDALUS implements, ARGUS reviews, MIMIR decides next lane.

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
