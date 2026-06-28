# PR445 - Discover Document Route Repair Review Result

Date reviewed: 2026-06-28

Reviewer: ARGUS / A3

Status: accepted after narrow ARGUS patch - wake MIMIR

## Verdict

```text
ACCEPTED AFTER NARROW ARGUS PATCH
```

PR445 repairs the Discover document-card route defect by using canonical Space
document hrefs and dropping document rows that cannot be safely linked. The
implementation stays inside Discover/feed/search routeability and does not
change public/private visibility rules, document publishing semantics,
forum/comment behavior, broad Discover layout, hosted runtime, queues, billing,
Cloudflare, partner adapters, or provider scope.

ARGUS found and patched one narrow frontend guard bug before acceptance.

## ARGUS Patch

Issue found:

- `apps/web/lib/writing-feed.ts` added a UUID-shaped Space slug guard for raw
  curated document hrefs, but the UUID regex missed the final hyphen group.
  That meant `/space/<uuid>/documents/<document-id>` could pass the writing-feed
  normalizer even though other Discover route guards reject UUID-shaped slugs.

Patch applied:

- Corrected the UUID-shaped slug regex in `writing-feed.ts`.
- Added a regression assertion proving raw curated writing document rows with a
  UUID-shaped Space slug are dropped.

## Evidence Read

- `docs/roadmap/PR445_DISCOVER_DOCUMENT_ROUTE_REPAIR_DAEDALUS.md`
- `docs/roadmap/PR445_DISCOVER_DOCUMENT_ROUTE_REPAIR_RESULT.md`
- `docs/roadmap/PR444_HOSTED_PRODUCT_OPERATION_SWEEP_CLOSEOUT.md`
- `docs/roadmap/PR444_HOSTED_PRODUCT_OPERATION_SWEEP_RESULT.md`
- `apps/api/src/routes/discover.ts`
- `apps/api/src/routes/community.test.ts`
- `apps/api/src/routes/documents.ts`
- `apps/web/lib/discover-feed-controls.ts`
- `apps/web/lib/writing-feed.ts`
- `apps/web/lib/writing-feed.test.ts`
- `apps/web/components/discover/search-dropdown.tsx`
- `apps/web/components/discover/search-dropdown.test.ts`
- `apps/web/app/space/[slug]/documents/[documentId]/page.tsx`

## Review Findings

Implementation match:

- Discover feed document rows now build only
  `/space/<space-slug>/documents/<document-id>` hrefs.
- Public feed/sidebar document rows without a safe Space slug are omitted
  instead of falling back to `/documents/<document-id>`.
- Featured document feed rows are resolved server-side to canonical Space
  document hrefs before return.
- Frontend Discover and writing normalizers reject dead `/documents/<id>` hrefs
  for document cards.
- The repair uses the existing public document page and existing document read
  authorization.

Privacy and routeability boundary:

- Anonymous Discover remains limited to public document visibility.
- Community and members document visibility remain gated behind the existing
  authenticated community-tier check.
- Private and unlisted documents are not added to Discover feed visibility.
- Unsafe or UUID-shaped Space slugs are rejected before public href generation.
- No raw source labels, private owner buckets, credentials, prompts, provider
  payloads, or private document bodies are newly exposed.

Scope boundary:

- No safe `/documents/:documentId` resolver was added; PR445 chose canonical
  Space document href generation.
- No Space document page behavior, forum/comment behavior, publishing-state
  rewrite, broad Discover redesign, hosted runtime, queue, billing, Cloudflare,
  partner-adapter, or provider change was introduced.
- Hosted routeability still needs ARIADNE/browser verification after deployment.

## ARGUS Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/writing-feed.test.ts apps/web/components/discover/search-dropdown.test.ts` | Pass | 17 focused tests passed, including the ARGUS UUID-slug regression assertion. |
| `npm exec --yes pnpm@10.32.1 -- run test:community` | Pass | 39 tests passed; Discover feed and featured routeability/privacy assertions remain green. |
| `npm exec --yes pnpm@10.32.1 -- run test:writing` | Pass | 23 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:document-discussions` | Pass | 4 tests passed; public/community/unlisted/private discussion boundaries remain green. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 139 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck` | Pass | API TypeScript check passed. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck` | Pass | Web TypeScript check passed. |
| `git diff --check` | Pass | Passed with CRLF normalization warnings only. |
| `git diff --cached --check` | Pass | No staged whitespace errors. |

## Wakeup

Wake MIMIR to close PR445 and decide the next move.
