# PR405 - Search/Retrieval Explainability Result

Owner: DAEDALUS
Opened by: MIMIR
Status: Accepted by ARGUS

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

## ARGUS Review

Verdict: `PASS WITH ARGUS PATCH`.

ARGUS found two narrow hardening gaps:

- The API filtered malformed or UUID-shaped Developer Space slugs, but the
  shared web search helper still trusted caller-provided Developer Space slugs.
- `/discover/search` document rows selected safe label fields for the UI, but
  the route returned raw document rows rather than an explicit public search
  allowlist, leaving source labels/types/persona ids too easy to re-expose.

ARGUS patched those gaps so:

- Developer Space search hrefs in `searchHref("developerSpaces", ...)` now
  require the same route-safe non-UUID-shaped slug contract as the API.
- `/discover/search` document results pass through a small allowlist serializer
  containing only id, title, body, document type, visibility, provenance type,
  discussion thread id, and Space slug.
- Regression coverage proves unsafe Developer Space slugs do not become links
  and public document search does not emit `source_label`, `source_type`,
  `source_persona_id`, or fixture private-looking source labels.

After that patch, ARGUS accepts PR405:

- Public home and Discover front-door search labels are compact scope/provenance
  readback from bounded public/community fields, not source labels.
- Private owner search buckets remain outside `PUBLIC_SEARCH_GROUPS` and do not
  become routeable public search items.
- Developer Space description/slug search stays restricted to public or
  community-visible rows according to the existing tier boundary, de-dupes by
  route-safe slug, and omits API key/hash/tail/private/unlisted fields.
- No provider/model/embedding, Gemini/OpenAI/NVIDIA, Redis/Cloudflare/vector/
  cache, schema/migration, ranking rewrite beyond safe metadata de-dupe/order,
  auth/session, billing/Stripe, deployment, connector intake, private archive
  retrieval, owner Memory runtime selection, or broad Discover redesign changed.
- ARGUS reran the requested validation after the review patch.

MIMIR can close PR405 as `PASS WITH ARGUS PATCH`. ARIADNE visible rehearsal is
useful only if MIMIR wants desktop/mobile acceptance for the changed public
search label readback.
