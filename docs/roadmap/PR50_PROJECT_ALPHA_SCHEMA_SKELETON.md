# PR50 - Project Alpha Schema Skeleton

Date: 2026-06-18
Status: opened for DAEDALUS
Owner: DAEDALUS implements, ARGUS reviews, MIMIR decides next lane.

## Purpose

Start Phase 2B without disturbing the Phase 2A Developer Pages proof.

PR49 established that current Developer Spaces are compatible with the evolved
Developer Pages picture while they remain single-owner Tier 1 Showcase Windows.
The next safe step is a boring schema/type scaffold for Projects so future
multi-account ownership, institutional ownership, project-level usage, and
Tier 2 hosted runtime have an anchor.

## Scope

Implement a schema skeleton only:

- Add `projects`.
- Add `project_members`.
- Add nullable `project_id` to `developer_spaces`.
- Add nullable `project_id` to `developer_space_usage`.
- Update generated/static DB type surfaces as this repo currently maintains
  them.
- Add focused migration/type tests or route tests proving existing Developer
  Space behavior still works with `project_id = null`.
- Update roadmap/status/validation docs.

## Required Shape

Use explicit connection-tier values so project connection depth cannot be
confused with user subscription tier:

```text
tier_1_showcase
tier_2_hosted
tier_3_lab
```

Minimum conceptual columns:

```text
projects
- id uuid primary key
- owner_user_id uuid not null references profiles(id)
- name text not null
- slug text not null
- description text
- visibility text not null default 'private'
- connection_tier text not null default 'tier_1_showcase'
- created_at timestamptz not null default now()
- updated_at timestamptz not null default now()

project_members
- id uuid primary key
- project_id uuid not null references projects(id)
- user_id uuid not null references profiles(id)
- role text not null default 'owner'
- status text not null default 'active'
- created_at timestamptz not null default now()
- updated_at timestamptz not null default now()
```

Add uniqueness/indexes needed for safe future use, at minimum:

- unique project slug;
- unique active-ish project membership per project/user;
- useful indexes for project owner and membership lookups.

Add basic check constraints for visibility, connection tier, member role, and
member status.

## Non-Scope

- No route behavior change.
- No auth or membership authorization change.
- No public response shape change unless a type requires nullable internal
  fields, and do not expose project details publicly yet.
- No UI.
- No billing or Stripe changes.
- No seed-data backfill.
- No `export_packages.project_id`; ARGUS explicitly deferred this to the
  project-aware exports lane because exports need actor audit and membership
  permissions.
- No Project attachment flow.
- No Cloudflare.
- No Tier 2 hosting, containers, database provisioning, Redis queues,
  deployment pipeline, developer agent, chat-native tools, or DexOS widgets.

## Acceptance

ARGUS can accept PR50 if:

- migrations are additive and nullable where they touch existing runtime rows;
- existing Developer Space create/read/ingest/evidence/usage/export tests still
  pass;
- `developer_spaces.project_id = null` and `developer_space_usage.project_id =
  null` preserve all current behavior;
- Project connection tier stays separate from profile subscription tier;
- RLS/policy posture is conservative and does not grant new public or
  cross-user access;
- no export-package project column is added.

## Validation

Run at minimum:

```bash
npm exec --yes pnpm@10.32.1 -- run test:developer-spaces
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

If DB type generation or schema helper checks have a local command in this
repo, run the focused command and record it. If no generator is available, patch
the static type surfaces carefully and say so.

## Handoff

Wake ARGUS with:

- exact migration/type/test files changed;
- whether any route behavior changed;
- proof that existing Developer Space behavior still works with null
  `project_id`;
- confirmation that `export_packages.project_id` was not added;
- validation results;
- any first PR51 recommendation.

If blocked, wake MIMIR with the exact blocker. Do not leave the lane silent.
