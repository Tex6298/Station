# Production Export Error Response Hardening

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Date opened: 2026-06-28

Status: complete - wake ARGUS

Result:

`docs/roadmap/PRODUCTION_EXPORT_ERROR_RESPONSE_RESULT.md`

## Why This Lane

ARGUS accepted conversation/continuity route-level error response hardening in:

`docs/roadmap/PRODUCTION_CONVERSATION_CONTINUITY_ERROR_RESPONSE_REVIEW_RESULT.md`

Export routes are the next named route-level raw error surface. They handle
owner-only persona archive exports, Developer Space manifests, Project
manifests, package listing, package readback, and bundle readback.

Current direct raw-response patterns are in:

`apps/api/src/routes/exports.ts`

Observed examples:

- persona, Developer Space, and Project export package creation can return raw
  service error text;
- export package listing can return raw Supabase/service error text;
- export package completion failures can preserve raw service text into stored
  package failure state and then return it from route responses;
- manifest and bundle readback must keep owner-only privacy boundaries intact.

## Task

Harden export route error responses without changing export package lifecycle,
manifest contents, bundle readback, or owner-only access behavior.

Required behavior:

- route failures must not expose raw Supabase/storage/provider error text,
  table names, SQL output, owner IDs, persona IDs, Developer Space IDs, Project
  IDs, export package IDs, archive source IDs, private memory/canon/archive
  content, manifest excerpts, bundle internals beyond successful owner
  readback, storage paths, stack traces, URLs, tokens, cookies, provider
  payloads, or secret-shaped values;
- route responses should use stable public-safe copy and fixed error codes;
- successful persona export package creation/readback, Developer Space export
  creation/readback, Project manifest creation/readback, completed bundle
  readback, not-found behavior, conflict behavior for incomplete bundles, quota
  responses, and owner-only access behavior must not change;
- stored export failure metadata may continue to exist for owner diagnostics,
  but failing route responses must not return raw service text;
- tests should prove hostile export service errors are not returned from route
  responses.

Keep this lane to route responses and package failure recording. Do not change
export schema, manifest shape, bundle format, public/private document policy,
Developer Space usage accounting, Redis, Cloudflare, workers, or queue behavior.

## Scope

Allowed:

- response mapping in `apps/api/src/routes/exports.ts`;
- focused export route tests;
- docs/status/baseline updates for the result.

Do not change:

- manifest JSON/Markdown shape, bundle contents or MIME types, owner-only
  access control, quota math, Developer Space usage accounting semantics,
  schema, migrations, package manifests, Redis, Cloudflare, provider/model
  behavior, billing, auth/session semantics, UI, workers, queues, hosted
  config, or hosted data.

Record any remaining non-export route-level raw surfaces as future work if you
see them.

## Validation

Minimum:

```bash
npm exec --yes pnpm@10.32.1 -- run test:exports
npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck
git diff --check
```

If Developer Space usage accounting or project export helpers are touched in a
way that reaches outside export route response mapping, also run the matching
focused gate:

```bash
npm exec --yes pnpm@10.32.1 -- run test:developer-spaces
npm exec --yes pnpm@10.32.1 -- run test:projects
```

## Handoff

Wake ARGUS with:

```text
READY FOR ARGUS EXPORT ERROR RESPONSE REVIEW
```

or wake MIMIR with:

```text
BLOCKED - NEEDS MIMIR DECISION
```

if safe public error copy cannot be preserved without changing export package,
manifest, bundle, or owner-only lifecycle behavior.
