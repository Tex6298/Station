# PR236 - Project Owner Id Serializer Repair

Owner: DAEDALUS
Reviewer: ARGUS
Status: Complete - ARGUS ACCEPT, MIMIR closed
Opened: 2026-06-24
Implemented: 2026-06-24
Reviewed: 2026-06-24
Closed: 2026-06-24

## Frame

ARIADNE failed PR235 because the hosted owner Project detail API still exposes
`project.ownerUserId`. PR235's boundary explicitly forbids owner ids in visible
UI or API payloads.

The evidence panel itself passed the hosted human rehearsal. This is a narrow
Project serializer repair before any broader Project or institutional work.

## Goal

Remove owner id exposure from browser-facing Project API responses while
preserving owner-only authorization and existing Project functionality.

Primary known locus:

- `apps/api/src/routes/projects.ts`
- `serializeProject()` currently maps `owner_user_id` to `ownerUserId`.

## Scope

Update Project route serializers so these responses do not include
`ownerUserId` or `owner_user_id`:

- `GET /projects`
- `POST /projects`
- `GET /projects/:idOrSlug`

Keep owner checks server-side:

- Continue querying Projects by `owner_user_id = req.user.id`.
- Continue creating owner Project membership rows.
- Continue deriving attached Developer Spaces, activity, and evidence from the
  authenticated owner.

If a server-only internal call genuinely needs an owner id, keep that value in
local variables or private row objects, not in the JSON payload returned to the
browser.

## Tests

Update focused coverage in `apps/api/src/routes/projects.test.ts`:

- project creation response does not include `project.ownerUserId`;
- project list response does not include `ownerUserId` / `owner_user_id`;
- project detail response does not include `project.ownerUserId`;
- seeded owner ids do not appear anywhere in Project response JSON unless the
  test is inspecting in-memory rows directly;
- evidence regression from PR234 remains: no raw link ids, document bodies,
  private source ids, author ids, owner ids, raw events, snapshots, provider
  fields, reports, export contents, ingestion keys, or secrets in evidence
  JSON.

Update web route types/helpers if they currently require `ownerUserId` from the
Project payload. Do not replace it with another owner identifier.

## Validation

Run:

```text
npm exec --yes pnpm@10.32.1 -- run test:projects
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- run lint
git diff --check
git diff --cached --check
```

## Hard Exclusions

Do not add or change:

- schema or migrations;
- Project membership authorization;
- public Project routes;
- Discover Project cards;
- Project exports;
- institutional/lab/company accounts;
- billing, Stripe, invoices, tax, marketplace, or customer records;
- hosted runtime, containers, queues, workers, Redis, Cloudflare, or Developer
  Agent runtime actions;
- evidence source selection, ranking, route policy, or UI design beyond what is
  required to compile after removing `ownerUserId`.

## Review Handoff

When implementation is complete, wake ARGUS:

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS repaired PR236 Project owner id serializer leakage.
Risk:
- Project owner-only API payloads must not expose owner ids while preserving
  server-side owner authorization.
Task:
- Review code and tests against
  docs/roadmap/PR236_PROJECT_OWNER_ID_SERIALIZER_REPAIR_DAEDALUS.md.
- Wake MIMIR with ACCEPT / PATCH / REJECT and whether ARIADNE needs a focused
  hosted rerun.
```

## DAEDALUS Result - 2026-06-24

Implementation:

- Removed `ownerUserId` from the Project serializer used by:
  - `GET /projects`;
  - `POST /projects`;
  - `GET /projects/:idOrSlug`.
- Preserved server-side owner authorization and writes:
  - Project queries still filter by `owner_user_id = req.user.id`;
  - Project creation still writes `owner_user_id`;
  - Project owner membership rows are still created;
  - attached Developer Space, activity, and evidence reads remain scoped to the
    authenticated owner.
- Removed the local `ownerUserId` requirement from Project web route response
  interfaces without adding another owner identifier.
- Added focused regression assertions that create/list/detail/evidence Project
  responses omit owner id field names and seeded owner ids.

Validation:

- `npm exec --yes pnpm@10.32.1 -- run test:projects` passed with 8 tests.
- `npm exec --yes pnpm@10.32.1 -- run typecheck` passed.
- `npm exec --yes pnpm@10.32.1 -- run lint` passed with existing raw `<img>`
  warnings in `apps/web/app/space/[slug]/page.tsx` and
  `apps/web/components/discover/discover-front-door.tsx`.
- `git diff --check` passed with CRLF normalization warnings only.
- `git diff --cached --check` passed with CRLF normalization warnings only.

Review:

- ARGUS reviewed with `ACCEPT`.
- MIMIR closeout required.

## ARGUS Result - 2026-06-24

Verdict: `ACCEPT`.

ARGUS found the repair matches the PR236 lane:

- Browser-facing Project create/list/detail payloads no longer include
  `project.ownerUserId` or `owner_user_id`.
- Server-side owner authorization remains intact through `owner_user_id =
  req.user.id` filters and Project owner membership writes.
- Attached Developer Space, activity, and evidence reads remain owner-scoped.
- Tests now assert create/list/detail/evidence responses omit owner id field
  names and seeded owner ids.

No ARGUS code patch was needed. No schema, public Project route, Project
membership authorization, exports, billing, hosted runtime, queue, Cloudflare,
provider, evidence route policy, or UI scope expansion was introduced.

Validation:

- `npm exec --yes pnpm@10.32.1 -- run test:projects` passed with 8 tests.
- `npm exec --yes pnpm@10.32.1 -- run typecheck` passed.
- `npm exec --yes pnpm@10.32.1 -- run lint` passed with existing raw
  `<img>` warnings only.
- `git diff --check` passed.
- `git diff --cached --check` passed.

ARIADNE:

- Focused hosted rerun required because PR236 repairs the exact hosted PR235
  API boundary failure.

## MIMIR Closeout - 2026-06-24

Decision: PR236 is accepted.

Closeout notes:

- DAEDALUS removed browser-facing Project owner id exposure while keeping
  server-side owner authorization and owner membership writes intact.
- ARGUS accepted without patch and requires a focused hosted rerun because the
  original failure was found on Railway.

Next lane:

- PR237 opens ARIADNE hosted rerun for Project list/detail API payload
  boundary and a quick visible sanity pass on the already-tested owner Project
  evidence flow.
