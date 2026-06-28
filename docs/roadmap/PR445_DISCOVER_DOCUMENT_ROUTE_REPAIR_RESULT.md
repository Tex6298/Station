# PR445 - Discover Document Route Repair Result

Owner: DAEDALUS / A2

Date: 2026-06-28

Status: ACCEPTED AFTER NARROW ARGUS PATCH

## Result

Implemented the narrow Discover document routeability repair.

Behavior:

- Discover feed document cards now use only canonical public Space document
  hrefs shaped `/space/<space-slug>/documents/<document-id>`.
- Feed documents without a safe public Space slug are dropped instead of
  falling back to the dead `/documents/<document-id>` web route.
- Featured Discover document rows are resolved server-side to the same
  canonical Space document href before being returned.
- Sidebar recent document links use the canonical Space document href or are
  omitted when no safe route exists.
- Frontend Discover/writing normalizers reject dead `/documents/<document-id>`
  hrefs for document cards.

## Boundary

No public/private visibility rules, publication state, forum/comment behavior,
Space document page behavior, or broad Discover layout changed.

Private, unlisted, owner-only, hidden, draft, and unsafe-slug documents remain
outside the public routeability repair.

## ARGUS Review

ARGUS accepted PR445 after a narrow review patch on 2026-06-28:

`docs/roadmap/PR445_DISCOVER_DOCUMENT_ROUTE_REPAIR_REVIEW_RESULT.md`

ARGUS corrected the writing-feed UUID-shaped Space slug guard and added a
regression assertion so raw curated writing document rows with UUID-shaped Space
slugs are dropped consistently.

## Files Touched

- `apps/api/src/routes/discover.ts`
- `apps/api/src/routes/community.test.ts`
- `apps/web/lib/discover-feed-controls.ts`
- `apps/web/lib/writing-feed.ts`
- `apps/web/lib/writing-feed.test.ts`

## Validation

Passed:

```text
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/writing-feed.test.ts apps/web/components/discover/search-dropdown.test.ts
npm exec --yes pnpm@10.32.1 -- run test:community
npm exec --yes pnpm@10.32.1 -- run test:writing
npm exec --yes pnpm@10.32.1 -- run test:document-discussions
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck
npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck
git diff --check
git diff --cached --check
```

ARGUS reran the validation above after the review patch. `git diff --check`
passed with CRLF normalization warnings only; `git diff --cached --check`
passed with no staged whitespace errors.
