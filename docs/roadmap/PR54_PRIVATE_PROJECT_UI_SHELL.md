# PR54 - Private Project UI Shell

Date: 2026-06-19
Status: opened for DAEDALUS
Owner: DAEDALUS implements, ARGUS reviews, ARIADNE rechecks if accepted,
MIMIR decides next lane.

## Purpose

Give owners a small private Project surface that exercises the PR51-PR53 API
work without pretending public Project pages, contributor workflows, billing,
exports, or hosted runtime exist.

PR54 is an owner shell only: create/list Projects, open one Project, and see
the Developer Spaces attached to it.

## Scope

Implement only:

- Private owner `/projects` page:
  - requires sign-in or shows the existing sign-in path;
  - lists the owner Projects from `GET /projects`;
  - lets the owner create a Project through `POST /projects`;
  - links each Project to its private detail route.
- Private owner `/projects/[idOrSlug]` detail page:
  - reads `GET /projects/:idOrSlug`;
  - shows the Project summary;
  - lists attached Developer Spaces from the PR53 `developerSpaces` response;
  - links attached Developer Spaces to their existing manage/public routes as
    appropriate for existing owner UI conventions.
- Small web API/type helpers if needed.
- Focused helper tests if logic is extracted.
- Update roadmap/status/validation docs.

## UI Direction

This is a private operational shell, not a marketing page:

- Use the current Station app shell and restrained owner-workbench styling.
- Keep copy specific and short.
- Use clear empty states for no Projects and no attached Developer Spaces.
- Avoid a broad visual redesign in this PR.
- Do not add a public Project landing page.

## Non-Scope

- No public Project pages or Discover integration.
- No Project brand/marketing surface.
- No Developer Space attach/detach UI yet.
- No Developer Space create-time Project picker.
- No backend route changes unless a tiny bug fix is necessary.
- No billing, quotas, Stripe, or entitlement changes.
- No project exports and no `export_packages.project_id`.
- No contributor UI.
- No member-role authorization beyond the owner-only API already present.
- No invitations or membership management.
- No seed-data backfill.
- No Cloudflare.
- No Tier 2 hosting, containers, database provisioning, Redis queues,
  deployment pipeline, developer agent, chat-native tools, or DexOS widgets.

## Acceptance

ARGUS can accept PR54 if:

- The Project pages use only authenticated owner APIs.
- Owner Project creation/list/read work through the existing API.
- The Project detail page shows attached Developer Spaces from PR53 and does
  not fabricate data.
- Empty states are truthful and bounded.
- No public Project route/page is added.
- No attach/detach UI or backend behavior change sneaks in.
- Existing `test:projects` and `test:developer-spaces` stay green.
- Web typecheck passes.

ARIADNE should recheck after ARGUS if the UI lands:

- signed-in `/projects`;
- signed-in Project detail with attached spaces;
- empty state if no Project/attached spaces is available;
- narrow viewport fit and basic click-throughs.

## Validation

Run at minimum:

```bash
npm exec --yes pnpm@10.32.1 -- run test:projects
npm exec --yes pnpm@10.32.1 -- run test:developer-spaces
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

If a web build is useful, run it and record the known Windows standalone
symlink result if it appears after successful compile/type/page generation.

## Handoff

Wake ARGUS with:

- web files changed;
- exact pages/routes added;
- whether any backend/API file changed;
- proof that Project API tests and Developer Space tests still pass;
- confirmation that no public Project page, attach/detach UI, billing, exports,
  contributor/member auth, Cloudflare, Tier 2, developer-agent, DexOS, or
  `export_packages.project_id` work was added;
- whether ARIADNE should perform the private owner UI rehearsal;
- any PR55 recommendation.

If blocked, wake MIMIR with the exact blocker. Do not leave the lane silent.
