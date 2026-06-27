# PR405 - Search/Retrieval Explainability Result

Owner: DAEDALUS
Opened by: MIMIR
Status: READY FOR ARGUS REVIEW

## Result

DAEDALUS implemented a narrow search-depth and explainability slice on current
main. The change stays on existing Discover/search surfaces and current
Supabase-backed metadata. It does not change ranking, embeddings, providers,
cache, schema, auth, billing, deployment, or private archive retrieval.

## Implementation

Files changed:

- `apps/api/src/routes/discover.ts`
- `apps/api/src/routes/community.test.ts`
- `apps/web/components/discover/search-dropdown.tsx`
- `apps/web/components/discover/search-dropdown.test.ts`
- `apps/web/components/discover/discover-front-door.tsx`
- `apps/web/app/globals.css`
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/testing/VALIDATION_BASELINE.md`

Public/community search explainability:

- Added `publicSearchResultLabels` beside the existing route-safety helpers.
- Public search rows now show compact scope/provenance readback such as
  `Public Publication / Archive import / Discussion open`,
  `Community-visible Developer Space / Observed runtime`, and
  `Public persona / Signed-in chat alpha`.
- The same helper feeds both the public home dropdown and the Discover front
  door search result list, so labels remain consistent.
- Labels are derived only from already-returned safe fields:
  `visibility`, `provenance_type`, `discussion_thread_id`,
  `visualisationType`, `publicChat`, and Space presentation metadata.
- Private owner buckets are still ignored by public result grouping and do not
  produce public links or labels.

Developer Space search depth:

- `/discover/search` now searches public/community-eligible Developer Spaces by
  `project_name`, `description`, and `slug`.
- Results are de-duped by route-safe slug and sorted by newest update before
  title fallback.
- Unsafe UUID-shaped or malformed Developer Space slugs are filtered from
  search result links.
- Returned Developer Space search rows remain minimized to current public
  fields: id, slug, projectName, description, visibility, visualisationType,
  updatedAt, and href.

## Scope Control

This PR did not add or change:

- provider/model/embedding behavior;
- Gemini/OpenAI/NVIDIA configuration;
- Redis, Upstash, Valkey, Cloudflare, vector backend, cache, worker, queue, or
  schema/migration behavior;
- search ranking beyond safe de-dupe/order for Developer Space metadata search;
- auth/session, billing, Stripe, deployment, connector intake, or live API
  ingestion;
- private archive retrieval, owner Memory runtime selection, continuity
  runtime provenance, or public exposure of owner-private search buckets;
- broad Discover redesign.

## Validation

Passed:

- `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/components/discover/search-dropdown.test.ts`
- `npm exec --yes pnpm@10.32.1 -- run test:community`
- `npm exec --yes pnpm@10.32.1 -- run test:studio-ui`
- `npm exec --yes pnpm@10.32.1 -- run test:developer-spaces`
- `npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck`
- `npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck`

- `git diff --check`
- `git diff --cached --check`

## ARGUS Review Path

Please hostile-review:

- public/community scope labels for overclaim;
- Developer Space description/slug search for private or unsafe route leakage;
- private owner bucket exclusion in public search render paths;
- document provenance labels for source-label leakage or stronger copy needs;
- whether the search-depth slice stayed inside PR405 non-goals.

Wake MIMIR with `WAKEUP A1:` if accepted, or DAEDALUS with `WAKEUP A2:` if
fixes are needed.
