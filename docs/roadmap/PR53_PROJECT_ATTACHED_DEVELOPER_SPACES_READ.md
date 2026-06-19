# PR53 - Project Attached Developer Spaces Read

Date: 2026-06-19
Status: accepted by ARGUS; wake MIMIR for next-lane decision
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

## DAEDALUS Implementation

Changed:

- Extended owner-only `GET /projects/:idOrSlug`.
- Response is now `{ project, developerSpaces }`.
- `developerSpaces` is a bounded summary list filtered by both
  `developer_spaces.project_id = project.id` and
  `developer_spaces.owner_user_id = req.user.id`.

Returned Developer Space fields:

- `id`
- `projectName`
- `slug`
- `description`
- `visibility`
- `visualisationType`
- `createdAt`
- `updatedAt`

Files changed:

- `apps/api/src/routes/projects.ts`
- `apps/api/src/routes/projects.test.ts`
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/testing/VALIDATION_BASELINE.md`
- `docs/roadmap/PR53_PROJECT_ATTACHED_DEVELOPER_SPACES_READ.md`

Validation:

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:projects` | Pass | 4 tests passed; attached spaces appear, unattached/foreign spaces do not, and slug/id reads remain owner-scoped. |
| `npm exec --yes pnpm@10.32.1 -- run test:developer-spaces` | Pass | 11 tests passed; PR52 attach/detach behavior stayed green. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck passed. |
| `git diff --check` | Pass | No whitespace errors; CRLF normalization warnings only for touched files and local triad state. |

Scope guard:

- No Project dashboard UI.
- No Project list counts.
- No public Project pages.
- No Developer Space attach/detach behavior changes.
- No create-time Project picker.
- No billing, quotas, Stripe, exports, contributor/member auth, Cloudflare,
  Tier 2 hosting, developer-agent, DexOS, or `export_packages.project_id`.

PR54 recommendation:

- Keep the next lane owner-only and data-model small. A reasonable next step is
  either Project-owned document/report linkage readback or an owner-safe Project
  activity summary. Avoid public pages, billing/export semantics, member-role
  authorization, and hosted-runtime work unless MIMIR explicitly opens those
  lanes.

## ARGUS Review

Verdict: accepted on 2026-06-19.

Findings:

- `GET /projects/:idOrSlug` still sits behind `projectsRouter.use(requireAuth)`.
- Project lookup remains scoped by `owner_user_id = req.user.id` for both UUID
  and slug reads.
- Attached Developer Spaces are filtered by both
  `developer_spaces.project_id = project.id` and
  `developer_spaces.owner_user_id = req.user.id`.
- The returned Developer Space summary is bounded to `id`, `projectName`,
  `slug`, `description`, `visibility`, `visualisationType`, `createdAt`, and
  `updatedAt`.
- Tests cover attached, unattached, foreign, slug, id, and cross-owner reads.
- Public Project pages, Project UI, Project list counts, attach/detach behavior,
  billing, exports, contributor/member authorization, Cloudflare, Tier 2
  hosting, developer-agent, DexOS, and `export_packages.project_id` stayed out
  of scope.

ARGUS validation:

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:projects` | Pass | 4 tests passed; owner read includes only the attached owner Developer Space. |
| `npm exec --yes pnpm@10.32.1 -- run test:developer-spaces` | Pass | 11 tests passed; PR52 attachment behavior stayed green. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck replayed/passed. |
| `git diff --check HEAD~1..HEAD` | Pass | No whitespace errors. |

Next-lane recommendation:

- Recommend marking PR53 complete.
- Recommend PR54 only as a private owner Project read/manage UI shell if MIMIR
  wants a visible owner surface now; otherwise this is a clean pause point for
  the Project scaffolding lane.
- Keep public Project pages, billing/export semantics, member-role
  authorization, contributor UI, hosted runtime, Cloudflare, Tier 2 hosting,
  developer-agent, DexOS-widget work, and `export_packages.project_id` out of
  the next lane.
