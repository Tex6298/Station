# PR518A - Cross-Owner Metadata Exhibit Dedicated Public Index Result

Owner: DAEDALUS / A2

Date: 2026-07-11

State:

```text
READY_FOR_ARGUS_REVIEW_PR518A_CROSS_OWNER_METADATA_EXHIBIT_PUBLIC_INDEX
```

## Summary

Implemented the narrow PR518A findability slice:

- added `GET /persona-encounters/cross-owner-public-exhibits`;
- kept cross-owner exhibits out of the existing same-owner
  `/persona-encounters/public-exhibits` list;
- added `/encounters/cross-owner` as the dedicated web index route;
- added one link from `/encounters` to the dedicated cross-owner index;
- left Discover/search/feed, public persona, Space, forum/community/Salon,
  writing, Station Press, generated-word, storage, provider, billing, queue,
  deployment, package, and migration scope untouched.

## API Contract

The list endpoint is bounded and cursorable with the same public-field cursor
shape as the same-owner exhibit list: `publishedAt` plus slug.

Rows are returned only when they pass the public-readability floor:

- `status = published`;
- `published_at` is present;
- `removed_at` and `retracted_at` are absent;
- slug matches the public exhibit slug contract;
- contract version is `1`;
- provenance schema is
  `station.persona_encounter.cross_owner_public_exhibit.v1`;
- requester and counterparty metadata approvals are present;
- the linked consent is active, approved, scope version `1`, and includes
  `publish_metadata_only_public_exhibit`;
- public requester/counterparty display snapshots still match the linked
  consent snapshots.

The list payload exposes only slug, route anchor, title, public context note,
tags, safe participant display snapshots, status, contract version, published
timestamp, public provenance labels, and report path. It does not expose raw
table ids, owner ids, persona ids, consent ids, report counts, private setup,
runtime output, provider payloads, source bodies, admin state, or secrets.

## Web Contract

`/encounters/cross-owner` renders dedicated metadata-only cards with
cross-owner provenance labels and public display snapshots. The existing
same-owner `/encounters` page only links to this page; it does not mix
cross-owner rows into the same-owner list.

## Files Changed

- `apps/api/src/routes/persona-encounters.ts`
- `apps/api/src/routes/persona-encounters.test.ts`
- `apps/web/app/encounters/cross-owner/page.tsx`
- `apps/web/app/encounters/page.tsx`
- `apps/web/lib/persona-encounter-runtime.ts`
- `apps/web/lib/persona-encounter-runtime.test.ts`
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/roadmap/LANE_INDEX.md`
- `docs/testing/VALIDATION_BASELINE.md`
- `docs/roadmap/PR518A_CROSS_OWNER_METADATA_EXHIBIT_PUBLIC_INDEX_RESULT.md`

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:persona-encounters` | Pass | 74 tests passed, including the new bounded cross-owner public exhibit list, fail-closed consent/snapshot/slug/schema/version cases, unchanged detail/report/retract behavior, and same-owner list separation. |
| `npm exec --yes pnpm@10.32.1 -- run test:reports` | Pass | 8 tests passed, including same-owner and cross-owner public exhibit moderation actions. |
| `npm exec --yes pnpm@10.32.1 -- run test:community` | Pass | 44 tests passed; existing Discover/community route coverage remains green. |
| `npm exec --yes pnpm@10.32.1 -- run test:writing` | Pass | 29 tests passed; writing/feed/public persona/Space helpers remain bounded. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 215 tests passed, including the new cross-owner index source guard. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | Turbo API/web typecheck passed. |
| `git diff --check` | Pass | Whitespace check passed. |
| `git diff --cached --check` | Pass | Staged whitespace check passed. |
| Changed-path scan | Pass | Changed paths stayed inside PR518A allowed API, web index/runtime, test, and roadmap/testing docs scope. |
| Forbidden-path scan | Pass | No package/lockfile, Discover/search/feed, public persona, Space, forum/community/Salon, writing, Station Press, provider, retrieval, storage, billing, social, Redis, Cloudflare, queue, worker, migration, or deployment paths changed. |
| Secret-shaped diff scan | Pass | No secret-shaped added lines found in the staged diff. |

## Review Notes For ARGUS

- Public list `routeHref` points to the dedicated index anchor
  `/encounters/cross-owner#<slug>` because PR518A did not add a web detail
  route.
- The shared cross-owner public-readability helper now fails closed when public
  display snapshots drift away from the linked consent snapshots; this affects
  both the new list endpoint and existing public detail route.
- No hosted proof was run in this lane. The PR518 preflight recommended hosted
  proof after local ARGUS acceptance because this adds a public findability
  route.
