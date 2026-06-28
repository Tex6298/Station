# Production Developer Space Operations Error Response Hardening

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Date opened: 2026-06-28

Status: ready for ARGUS review

## Why This Lane

ARGUS accepted discovery/Space route-level error response hardening in:

`docs/roadmap/PRODUCTION_DISCOVERY_SPACE_ERROR_RESPONSE_REVIEW_RESULT.md`

The next product-critical operations surface is Developer Space management and
observatory support. Credential lifecycle and observed-runtime ingestion
security paths were already handled separately; the remaining route responses
cover public gallery, owner listing, create/update, agent preview/readback,
document linking/templates, project assignment, usage, and linked document
readback.

Current direct raw-response patterns are in:

`apps/api/src/routes/developer-spaces.ts`

Observed examples:

- public Developer Space gallery and owner list failures can return raw
  Supabase/service text;
- project assignment and usage readback failures can return raw service text;
- agent preview/readback failures can return raw linked document or runtime
  readback text;
- document link/template creation failures can return raw document/link errors;
- Developer Space update and linked-document readback helpers can propagate raw
  service details.

## Task

Harden non-credential Developer Space operations route responses without
changing Developer Space lifecycle, public observatory behavior, agent preview
semantics, project assignment, document linking, usage accounting, or hosted
data behavior.

Required behavior:

- route failures must not expose raw Supabase/service error text, table names,
  SQL output, owner IDs, user IDs, Developer Space IDs, project IDs, document
  IDs, link IDs, runtime node/event/snapshot IDs, webhook receipt IDs, agent
  receipt/confirmation IDs, private linked document bodies, raw runtime
  payloads, usage internals, stack traces, URLs, tokens, cookies, provider
  payloads, or secret-shaped values;
- route responses should use stable public-safe copy and fixed error codes;
- successful public gallery, owner list, create, update, agent action
  list/preview/readback, document attach/template creation, project assignment,
  usage readback, public/owner observatory readback, not-found behavior,
  owner/admin access behavior, and public visibility behavior must not change;
- existing credential lifecycle and observed-runtime ingestion security paths
  must remain unchanged except where a shared readback helper requires bounded
  public-safe response mapping;
- tests should prove hostile Developer Space service errors are not returned
  from failing route responses.

Keep this lane to route responses. Do not change credential generation,
webhook signing/verification, ingestion semantics, observed-runtime payload
parsing, public observatory UI, Redis, Cloudflare, workers, or queue behavior.

## Scope

Allowed:

- response mapping in `apps/api/src/routes/developer-spaces.ts` for
  non-credential operations routes;
- focused Developer Space/project route tests;
- docs/status/baseline updates for the result.

Do not change:

- credential/key lifecycle semantics, webhook signing secret behavior,
  observed-runtime ingestion semantics, payload parsing/classification,
  Developer Space schema, project schema, linked document schema, usage
  accounting semantics, public observatory presentation, package manifests,
  Redis, Cloudflare, provider/model behavior, billing, auth/session semantics,
  UI, workers, queues, hosted config, or hosted data.

Record any remaining non-Developer-Space route-level raw surfaces as future
work.

## Validation

Minimum:

```bash
npm exec --yes pnpm@10.32.1 -- run test:developer-spaces
npm exec --yes pnpm@10.32.1 -- run test:projects
npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck
git diff --check
```

If observed-runtime ingestion or credential routes are touched, stop and wake
MIMIR unless the change is only shared response mapping with unchanged behavior.

## Handoff

Wake ARGUS with:

```text
READY FOR ARGUS DEVELOPER SPACE OPERATIONS ERROR RESPONSE REVIEW
```

DAEDALUS result:

`docs/roadmap/PRODUCTION_DEVELOPER_SPACE_OPERATIONS_ERROR_RESPONSE_RESULT.md`

or wake MIMIR with:

```text
BLOCKED - NEEDS MIMIR DECISION
```

if safe public error copy cannot be preserved without changing Developer Space
operations, observatory, project assignment, document linking, usage, credential,
or ingestion behavior.
