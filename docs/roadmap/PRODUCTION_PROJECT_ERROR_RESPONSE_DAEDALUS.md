# Production Project Error Response Hardening

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Date opened: 2026-06-28

Status: ready for ARGUS review

## Why This Lane

ARGUS accepted Developer Space operations route-level error response hardening
in:

`docs/roadmap/PRODUCTION_DEVELOPER_SPACE_OPERATIONS_ERROR_RESPONSE_REVIEW_RESULT.md`

Projects are the next adjacent product surface. Developer Space project
assignment and operations are now public-safe; Project routes still return raw
service errors around public project readback, owner project CRUD, attached
Developer Spaces, usage, membership creation, and evidence loading.

Current direct raw-response patterns are in:

`apps/api/src/routes/projects.ts`

Observed examples:

- public project readback and attached Developer Space lookup can return raw
  Supabase/service text;
- owner project list/read/create failures can return raw service text;
- project owner membership creation can return raw service text;
- usage and evidence loading failures can return raw service details.

## Task

Harden Project route error responses without changing public project readback,
owner project lifecycle, evidence loading, Developer Space attachment readback,
usage aggregation, or membership behavior.

Required behavior:

- route failures must not expose raw Supabase/service error text, table names,
  SQL output, owner IDs, user IDs, Project IDs, Developer Space IDs, usage row
  IDs, membership IDs, document/evidence IDs, private document bodies,
  unpublished evidence, stack traces, URLs, tokens, cookies, provider payloads,
  or secret-shaped values;
- route responses should use stable public-safe copy and fixed error codes;
- successful public project readback, owner project list/read/create,
  duplicate slug handling, owner membership creation, Developer Space
  attachment readback, project activity/usage aggregation, evidence loading,
  not-found behavior, and owner/public visibility behavior must not change;
- tests should prove hostile Project service errors are not returned from
  failing route responses.

Keep this lane to route responses. Do not change Project schema, visibility
policy, membership semantics, evidence selection, usage accounting, Developer
Space behavior, public project UI, Redis, Cloudflare, workers, or queue
behavior.

## Scope

Allowed:

- response mapping in `apps/api/src/routes/projects.ts`;
- focused Project route tests;
- docs/status/baseline updates for the result.

Do not change:

- Project schema, slug/visibility semantics, membership role semantics, usage
  aggregation math, evidence selection/readback, Developer Space route
  behavior, export behavior, UI, package manifests, Redis, Cloudflare,
  provider/model behavior, billing, auth/session semantics, workers, queues,
  hosted config, or hosted data.

Record any remaining non-Project route-level raw surfaces as future work.

## Validation

Minimum:

```bash
npm exec --yes pnpm@10.32.1 -- run test:projects
npm exec --yes pnpm@10.32.1 -- run test:developer-spaces
npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck
git diff --check
```

If replay-readiness behavior is touched, also run:

```bash
npm exec --yes pnpm@10.32.1 -- run test:replay-readiness
```

## Handoff

Wake ARGUS with:

```text
READY FOR ARGUS PROJECT ERROR RESPONSE REVIEW
```

DAEDALUS result:

`docs/roadmap/PRODUCTION_PROJECT_ERROR_RESPONSE_RESULT.md`

or wake MIMIR with:

```text
BLOCKED - NEEDS MIMIR DECISION
```

if safe public error copy cannot be preserved without changing Project,
membership, evidence, usage, Developer Space attachment, or visibility
behavior.
