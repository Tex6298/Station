# PR53 - Project Attached Developer Spaces Read

Date: 2026-06-19
Status: opened for DAEDALUS
Owner: DAEDALUS implements, ARGUS reviews, MIMIR decides next lane.

## Purpose

Make the new Project anchor visibly useful to the owner by showing which
Developer Spaces are attached to a Project, without opening public Project
pages, billing, exports, contributors, or hosted runtime.

PR52 created the attachment. PR53 should make the owner Project read surface
return the attached Developer Spaces as a bounded summary.

## Scope

Implement only:

- Extend owner-only `GET /projects/:idOrSlug` to include attached Developer
  Spaces for that Project.
- Keep `GET /projects` as a Project summary list unless the implementation
  finds a very small reason to include counts.
- Return attached Developer Spaces owned by `req.user.id` and linked by
  `developer_spaces.project_id = project.id`.
- Include only bounded owner-safe Developer Space summary fields.
- Focused tests proving attached spaces appear, unattached/foreign spaces do
  not appear, and slug/id Project reads both preserve owner scoping.
- Update docs/status/validation.

## Response Shape

Recommended Project read response:

```json
{
  "project": {
    "id": "project-id",
    "ownerUserId": "owner-user",
    "name": "Project name",
    "slug": "project-slug",
    "description": null,
    "visibility": "private",
    "connectionTier": "tier_1_showcase",
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  },
  "developerSpaces": [
    {
      "id": "developer-space-id",
      "projectName": "Station Replay Dev Alpha",
      "slug": "station-replay-dev-alpha",
      "description": "Public-safe Developer Space for staging replay.",
      "visibility": "public",
      "visualisationType": "node_field",
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    }
  ]
}
```

Do not include API key material, member rows, billing state, export packages,
usage counters, private ingestion data, event payloads, evidence documents, or
Project contributor data.

## Non-Scope

- No public Project pages or Discover integration.
- No Project dashboard UI.
- No Project list dashboard counts unless trivially added and tested.
- No Developer Space attach/detach behavior changes.
- No Developer Space create-time Project picker.
- No billing, quotas, Stripe, or entitlement changes.
- No project exports and no `export_packages.project_id`.
- No contributor UI.
- No member-role authorization beyond owner-only ownership checks.
- No invitations or membership management.
- No seed-data backfill.
- No Cloudflare.
- No Tier 2 hosting, containers, database provisioning, Redis queues,
  deployment pipeline, developer agent, chat-native tools, or DexOS widgets.

## Acceptance

ARGUS can accept PR53 if:

- Project read remains authenticated and owner-scoped.
- Attached Developer Spaces are filtered by both `project_id` and
  `owner_user_id`.
- Unattached Developer Spaces do not appear.
- Another user's Developer Spaces do not appear, even if they share a Project
  id in test data.
- Public Project routes/pages are not added.
- No billing/export/member authorization semantics are introduced.
- `export_packages.project_id` remains absent.

## Validation

Run at minimum:

```bash
npm exec --yes pnpm@10.32.1 -- run test:projects
npm exec --yes pnpm@10.32.1 -- run test:developer-spaces
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

## Handoff

Wake ARGUS with:

- route/service/test files changed;
- exact response-shape change;
- proof that attached spaces appear and foreign/unattached spaces do not;
- confirmation that public Project pages, Project UI, attach/detach behavior,
  billing, exports, contributor/member auth, Cloudflare, Tier 2,
  developer-agent, DexOS, and `export_packages.project_id` stayed untouched;
- validation results;
- any PR54 recommendation.

If blocked, wake MIMIR with the exact blocker. Do not leave the lane silent.
