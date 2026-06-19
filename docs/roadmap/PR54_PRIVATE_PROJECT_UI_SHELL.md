# PR54 - Private Project UI Shell

Date: 2026-06-19
Status: accepted by ARGUS; wake ARIADNE for UI rehearsal and MIMIR for next-lane decision
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

## MIMIR Follow-Up Decision

After ARIADNE's rerun, route mechanics pass but PR54 should not close with the
future-tier caveat.

DAEDALUS should make a tiny UI/copy tightening patch:

- Do not expose `tier_2_hosted` or `tier_3_lab` as selectable creation options
  on `/projects`.
- Keep new Projects created from the UI on `tier_1_showcase`.
- If existing API data ever contains Tier 2 or Tier 3, the detail/read UI may
  display it as an existing stored value, but the UI must not present those
  future tiers as available choices yet.
- Use copy such as "Showcase" / "Tier 1 showcase" that does not imply hosted
  runtime, lab runtime, containers, Cloudflare, or developer-agent support.
- No backend/API behavior change.

Validation for the follow-up:

- `npm exec --yes pnpm@10.32.1 -- run test:projects`
- `npm exec --yes pnpm@10.32.1 -- run test:developer-spaces`
- `npm exec --yes pnpm@10.32.1 -- run typecheck`
- `git diff --check`

## DAEDALUS Implementation

Added private owner pages:

- `/projects`
  - restores the current session;
  - lists owner Projects from `GET /projects`;
  - creates Projects through `POST /projects`;
  - links each Project to `/projects/[idOrSlug]`;
  - shows truthful loading, signed-out, empty, success, and error states.
- `/projects/[idOrSlug]`
  - restores the current session;
  - reads `GET /projects/:idOrSlug`;
  - shows the Project summary;
  - lists attached Developer Spaces from the PR53 `developerSpaces` response;
  - links attached Developer Spaces to existing `/developer-spaces/[slug]` and
    `/developer-spaces/[slug]/manage` routes;
  - shows truthful loading, signed-out, not-found/error, and no-attachments
    states.

Changed private navigation/route guard:

- `/projects` and `/projects/:idOrSlug` are protected by the existing
  auth-route guard.
- Projects appears in signed-in top navigation and the account menu.

Files changed:

- `apps/web/app/projects/page.tsx`
- `apps/web/app/projects/[idOrSlug]/page.tsx`
- `apps/web/components/nav/top-nav.tsx`
- `apps/web/lib/auth-routes.ts`
- `apps/web/lib/auth-routes.test.ts`
- `apps/web/lib/studio-navigation.ts`
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/testing/VALIDATION_BASELINE.md`
- `docs/roadmap/PR54_PRIVATE_PROJECT_UI_SHELL.md`

Backend/API files changed:

- None.

Validation:

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:projects` | Pass | 4 tests passed; existing Project API behavior stayed green. |
| `npm exec --yes pnpm@10.32.1 -- run test:developer-spaces` | Pass | 11 tests passed; Developer Space behavior stayed green. |
| `npm exec --yes pnpm@10.32.1 -- run test:auth` | Pass | 13 tests passed; `/projects` protection is covered. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck passed. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/web build` | Partial / known Windows failure | Next compiled successfully, linted/typechecked, collected page data, and generated 31 static pages. It then failed during standalone traced-file symlink copying with `EPERM`, matching the known Windows standalone symlink failure class. |
| `git diff --check` | Pass | No whitespace errors; CRLF normalization warnings only for touched files and local triad state. |

Scope guard:

- No public Project pages.
- No Project branding/marketing surface.
- No Developer Space attach/detach UI.
- No Developer Space create-time Project picker.
- No backend route changes.
- No billing, quotas, Stripe, exports, contributor/member auth, Cloudflare,
  Tier 2 hosting, developer-agent, DexOS, or `export_packages.project_id`.

ARIADNE rehearsal request if ARGUS accepts:

- Check signed-in `/projects` create/list.
- Check signed-in Project detail with attached Developer Spaces.
- Check no-Project and no-attached-space empty states.
- Check narrow viewport fit and click-throughs to existing Developer Space
  view/manage routes.

PR55 recommendation:

- Keep the next lane observational and owner-only, such as Project activity
  readback or Project document/report linkage. Do not jump to public Project
  pages, attach/detach UI, billing/export semantics, member-role authorization,
  or hosted-runtime work without a new MIMIR instruction.

## DAEDALUS Tier UI Tightening

MIMIR reopened a tiny PR54 follow-up after ARIADNE confirmed the owner UI route
mechanics but flagged that the create form exposed future connection tiers.

Changed:

- Removed the connection-tier select from `/projects`.
- UI-created Projects now always submit `connectionTier: "tier_1_showcase"`.
- Create copy calls the current owner-created Project shape "Showcase" and
  states that hosted runtime and lab runtime are not available in this UI.
- Existing stored Tier 2/Tier 3 values still render in list/detail readback as
  neutral stored-value labels.

Files changed:

- `apps/web/app/projects/page.tsx`
- `apps/web/app/projects/[idOrSlug]/page.tsx`
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/testing/VALIDATION_BASELINE.md`
- `docs/roadmap/PR54_PRIVATE_PROJECT_UI_SHELL.md`

Validation:

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:projects` | Pass | 4 tests passed; Project API behavior stayed green. |
| `npm exec --yes pnpm@10.32.1 -- run test:developer-spaces` | Pass | 11 tests passed; Developer Space behavior stayed green. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck passed. |
| `git diff --check` | Pass | No whitespace errors; CRLF normalization warnings only for touched files and local triad state. |

Scope guard:

- No backend/API behavior change.
- No public Project page.
- No attach/detach UI.
- No billing, exports, contributor/member auth, Cloudflare, Tier 2
  implementation, hosted runtime, developer-agent, DexOS, or
  `export_packages.project_id`.

## ARGUS Review

Verdict: accepted on 2026-06-19 after one route-protection hardening patch.

ARGUS patch:

- Added `/projects/:path*` to the Next middleware matcher. DAEDALUS had added
  `/projects` to `isProtectedRoute`, but the middleware matcher did not yet
  wake for direct `/projects` or `/projects/:idOrSlug` hits.
- Added auth-route test coverage that verifies each protected route family is
  present in the middleware matcher.

Findings:

- `/projects` uses the authenticated owner API for Project list and create.
- `/projects/[idOrSlug]` uses the authenticated owner Project detail API and
  renders only the PR53 `developerSpaces` summary fields.
- Signed-out states point to the sign-in flow, and the middleware now runs for
  direct Project route hits.
- Empty states are truthful for no Projects and no attached Developer Spaces.
- No backend/API route changed.
- Public Project pages, Project branding, attach/detach UI, billing, exports,
  contributor/member authorization, Cloudflare, Tier 2 hosting,
  developer-agent, DexOS, and `export_packages.project_id` stayed out of scope.

ARGUS validation:

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:auth` | Pass | 14 tests passed, including middleware matcher coverage for `/projects/:path*`. |
| `npm exec --yes pnpm@10.32.1 -- run test:projects` | Pass | 4 tests passed; Project API behavior stayed green. |
| `npm exec --yes pnpm@10.32.1 -- run test:developer-spaces` | Pass | 11 tests passed; Developer Space behavior stayed green. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck passed. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/web build` | Partial / known Windows failure | Next compiled, linted/typechecked, collected page data, and generated 31 static pages; standalone traced-file symlink copy failed with Windows `EPERM`. |
| `git diff --check` | Pass | No whitespace errors; CRLF warnings only. |

Rehearsal request:

- ARIADNE should check signed-in `/projects`, Project creation/list behavior,
  signed-in Project detail with attached Developer Spaces, empty states, narrow
  viewport fit, and click-throughs to existing Developer Space view/manage
  routes.

Next-lane recommendation:

- Recommend marking PR54 accepted pending ARIADNE UI rehearsal.
- Recommend MIMIR choose either a small owner-only Project readback/linkage lane
  or pause Project scaffolding. Do not open public Project pages, attach/detach
  UI, billing/export semantics, member-role authorization, hosted runtime,
  Cloudflare, Tier 2 hosting, developer-agent, DexOS-widget work, or
  `export_packages.project_id` without a new scope decision.

## ARGUS Tier UI Tightening Review

Verdict: accepted on 2026-06-19.

Findings:

- `/projects` no longer exposes Tier 2 Hosted or Tier 3 Lab as selectable
  creation options.
- UI-created Projects always submit `connectionTier: "tier_1_showcase"`.
- Existing stored future-tier values still render only as neutral stored-value
  readback labels, not as available runtime promises.
- Create-form copy states that hosted runtime and lab runtime are not available
  in this UI.
- No backend/API behavior changed.
- Public Project pages, attach/detach UI, billing, exports,
  contributor/member authorization, Cloudflare, Tier 2 implementation, hosted
  runtime, developer-agent, DexOS, and `export_packages.project_id` stayed out
  of scope.

ARGUS validation:

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:projects` | Pass | 4 tests passed; Project API behavior stayed green. |
| `npm exec --yes pnpm@10.32.1 -- run test:developer-spaces` | Pass | 11 tests passed; Developer Space behavior stayed green. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck passed from cache/replay. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/web build` | Partial / known Windows failure | Next compiled, linted/typechecked, collected page data, and generated 31 static pages; standalone traced-file symlink copy failed with Windows `EPERM`. |
| `git diff --check HEAD~1..HEAD` | Pass | No whitespace errors. |

Next:

- MIMIR can send PR54 back to ARIADNE for the private owner UI rehearsal now
  that the deployed Project schema is visible and the create form no longer
  exposes future tiers.
