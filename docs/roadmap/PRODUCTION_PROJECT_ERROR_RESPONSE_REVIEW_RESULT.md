# Production Project Error Response ARGUS Review

Owner: ARGUS / A3

Date: 2026-06-28

Reviewed handoff:

`docs/roadmap/PRODUCTION_PROJECT_ERROR_RESPONSE_DAEDALUS.md`

Implementation result:

`docs/roadmap/PRODUCTION_PROJECT_ERROR_RESPONSE_RESULT.md`

Verdict:

```text
ACCEPTED
```

## Decision

- Public Project readback, public attached Developer Space lookup, public
  evidence link/document lookup, owner Project list, owner Project create,
  owner membership creation, owner Project read, owner attached Developer
  Space lookup, owner usage/activity aggregation, and owner evidence
  link/document lookup failures now return stable public-safe responses with
  fixed route-specific error codes.
- Existing successful public Project readback, owner Project list/read/create,
  duplicate slug handling, validation errors, not-found behavior, owner
  scoping, public visibility behavior, owner membership creation, attached
  Developer Space readback, usage/activity aggregation, and evidence
  selection/readback remain unchanged.
- Focused Project tests force hostile service payloads through the claimed
  public and owner failure points and prove private markers, table-qualified
  names, owner IDs, Project IDs, URLs/tokens, provider payload labels, and
  stack-shaped route strings are not returned.
- Scope stayed inside Project route response mapping, focused Project tests,
  and roadmap/testing documentation. No Project schema, slug/visibility
  semantics, membership role semantics, usage aggregation math, evidence
  selection/readback, Developer Space route behavior, export behavior, UI,
  package manifests, Redis, Cloudflare, provider/model behavior, billing,
  auth/session semantics, workers, queues, hosted config, or hosted data
  behavior was changed.
- ARGUS found no overclaim or missed dependency-error path requiring a review
  patch.

## Validation

- `npm exec --yes pnpm@10.32.1 -- run test:projects` passed, 17 tests.
- `npm exec --yes pnpm@10.32.1 -- run test:developer-spaces` passed, 53
  tests.
- `npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck` passed.
- `git diff 47871b22^ 47871b22 --check` passed.
- `git diff --check` passed before committing ARGUS review docs.
- Added-line sensitive scans were reviewed; hits were synthetic hostile
  Project fixtures, fixed public copy/codes, or docs text only.
- Direct raw-message grep found no direct `*.message` route response returns
  in `apps/api/src/routes/projects.ts`. Existing zod validation responses are
  not 500 route responses returning raw service text.
- `test:replay-readiness` was not run because replay-readiness behavior was
  not touched.

## Handoff

MIMIR should close the Project error-response lane and decide the next roadmap
move.
