# Production Discovery Space Error Response Hardening

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Date opened: 2026-06-28

Status: ready for ARGUS review

## Why This Lane

ARGUS accepted discussion route-level error response hardening in:

`docs/roadmap/PRODUCTION_DISCUSSION_ERROR_RESPONSE_REVIEW_RESULT.md`

The next coherent public-chain surface is discovery and Spaces. Document and
discussion routes now have public-safe error responses; the front door and
public Space route still have direct raw service error responses.

Current direct raw-response patterns are in:

`apps/api/src/routes/discover.ts`

`apps/api/src/routes/spaces.ts`

Observed examples:

- `/discover/feed` and `/discover/sidebar` catch blocks can return raw service
  error text;
- owner Space list, create, update, delete, and page mutation failures can
  return raw Supabase text;
- public Space composition is close to public document and discussion routing,
  so public route failures should stay bounded.

## Task

Harden discovery and Space route error responses without changing public
discovery, public Space readback, Space management, Space pages, or visibility
behavior.

Required behavior:

- route failures must not expose raw Supabase/service error text, table names,
  SQL output, owner IDs, author IDs, user IDs, persona IDs, document IDs, Space
  IDs, page IDs, forum/thread IDs, private Space/page bodies, unpublished
  document/page content, discover feed internals, stack traces, URLs, tokens,
  cookies, provider payloads, or secret-shaped values;
- route responses should use stable public-safe copy and fixed error codes;
- successful `/discover/feed`, `/discover/sidebar`, `/discover/search`, public
  Space readback, owner Space list/manage/create/update/delete, Space page
  create/update, tier checks, slug conflict handling, and visibility behavior
  must not change;
- tests should prove hostile discovery/Space service errors are not returned
  from failing route responses.

Keep this lane to route responses. Do not change discovery ranking, public
visibility policy, Space presentation encoding, public page UI, forum/thread
semantics, Redis, Cloudflare, workers, or queue behavior.

## Scope

Allowed:

- response mapping in `apps/api/src/routes/discover.ts`;
- response mapping in `apps/api/src/routes/spaces.ts`;
- focused discovery/Space route tests;
- docs/status/baseline updates for the result.

Do not change:

- discovery ranking/search behavior, Space schema, page schema, Space
  presentation encoding, slug generation/validation, tier permission semantics,
  public/private visibility policy, forum/thread/comment route behavior, UI,
  package manifests, Redis, Cloudflare, provider/model behavior, billing,
  auth/session semantics, workers, queues, hosted config, or hosted data.

Record any remaining non-discovery/Space route-level raw surfaces as future
work.

## Validation

Minimum:

```bash
npm exec --yes pnpm@10.32.1 -- run test:spaces
npm exec --yes pnpm@10.32.1 -- run test:community
npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck
git diff --check
```

If public document readback or writing feed behavior changes, also run:

```bash
npm exec --yes pnpm@10.32.1 -- run test:writing
```

## Handoff

Wake ARGUS with:

```text
READY FOR ARGUS DISCOVERY SPACE ERROR RESPONSE REVIEW
```

or wake MIMIR with:

```text
BLOCKED - NEEDS MIMIR DECISION
```

if safe public error copy cannot be preserved without changing discovery,
public Space, Space management, page, or visibility behavior.

## Result

DAEDALUS completed the implementation:

`docs/roadmap/PRODUCTION_DISCOVERY_SPACE_ERROR_RESPONSE_RESULT.md`

Verdict:

```text
READY FOR ARGUS DISCOVERY SPACE ERROR RESPONSE REVIEW
```
