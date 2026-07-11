# PR519A - Cross-Owner Metadata Exhibit Discover Search Group Review Result

Owner: ARGUS / A3

Date: 2026-07-12

Status: Accepted

## Verdict

```text
ACCEPT_PR519A_CROSS_OWNER_METADATA_EXHIBIT_DISCOVER_SEARCH_GROUP
```

ARGUS accepts PR519A without a code patch.

The implementation matches the accepted lane: cross-owner metadata-only public
exhibits now appear only in Discover search as a separate
`crossOwnerPublicEncounterExhibits` group named `Cross-owner Exhibits`, with
metadata-only rows routed to `/encounters/cross-owner#<slug>`.

This is not approval for Discover feed/rising/featured inclusion, same-owner
`publicEncounterExhibits` merging, public persona or Space linkbacks,
forum/community/Salon placement, Station Press/public document linkage,
writing/homepage placement, generated-word publication, transcript/excerpt or
generated-summary publication, private saved cross-owner artifacts, PR516
disposable preview output reuse, provider/retrieval/vector/embedding changes,
billing/social/storage work, Redis, Cloudflare, queues/workers, package,
lockfile, deployment, or migration work.

MIMIR should route ARIADNE for hosted proof because PR519A changes public API
search output and visible Discover search rendering.

## Evidence Reviewed

ARGUS reviewed:

- `docs/roadmap/PR519_CROSS_OWNER_METADATA_EXHIBIT_DISCOVER_SEARCH_PREFLIGHT_RESULT.md`;
- `docs/roadmap/PR519_CROSS_OWNER_METADATA_EXHIBIT_DISCOVER_SEARCH_PREFLIGHT_CLOSEOUT.md`;
- `docs/roadmap/PR519A_CROSS_OWNER_METADATA_EXHIBIT_DISCOVER_SEARCH_DAEDALUS.md`;
- `docs/roadmap/PR519A_CROSS_OWNER_METADATA_EXHIBIT_DISCOVER_SEARCH_RESULT.md`;
- `apps/api/src/routes/discover.ts`;
- `apps/api/src/routes/community.test.ts`;
- `apps/api/src/routes/persona-encounters.ts`;
- `apps/api/src/routes/persona-encounters.test.ts`;
- `apps/web/components/discover/search-dropdown.tsx`;
- `apps/web/components/discover/search-dropdown.test.ts`;
- `apps/web/lib/persona-encounter-runtime.ts`;
- `apps/web/lib/persona-encounter-runtime.test.ts`;
- roadmap/status/testing docs changed by PR519A.

The implementation range reviewed was from PR519 preflight receipt
`2ab13ce8` through PR519A implementation commit `15f50530`.

## Review Findings

Accepted behavior:

- `GET /discover/search` returns `crossOwnerPublicEncounterExhibits: []` for
  empty search.
- Non-empty search queries only public cross-owner metadata fields: public
  title, public summary, public tags, requester display snapshot, and
  counterparty display snapshot.
- The final cross-owner search group is bounded to at most six results.
- Results are de-duplicated by public slug and sorted deterministically: title
  match first, then tag/display-snapshot/summary rank, then
  `published_at desc`, then slug.
- Unsafe rows are filtered before serialization using the PR518A safety floor:
  `published`, non-removed, non-retracted, public-slug routeable,
  contract-version-1, expected cross-owner provenance schema, exact bilateral
  metadata approval, active approved consent with
  `publish_metadata_only_public_exhibit` at scope version `1`, and requester/
  counterparty display snapshots matching the linked consent.
- The new group fails closed to an empty group on cross-owner exhibit query
  failure without leaking internals.
- API serialization returns only the accepted public contract: slug, cross-owner
  anchor route, title, summary, tags, participant display snapshots, published
  status/date, contract version, cross-owner type/label, and metadata-only
  provenance facts.
- No raw owner ids, raw persona ids, consent ids, table ids, report paths,
  report counts, moderation state, admin actions, requested scopes, private
  setup, generated reply text, transcript excerpts, generated summaries,
  prompts, provider payloads, source bodies, tokens, cookies, SQL details, or
  stack traces are serialized.
- Same-owner `publicEncounterExhibits` remains separate and never receives
  cross-owner rows.
- Signed-in `privateResults` remains owner-scoped and separate.
- `PUBLIC_SEARCH_GROUPS` adds `crossOwnerPublicEncounterExhibits` as
  `Cross-owner Exhibits` while continuing to exclude `privateResults`.
- Web route helpers derive `/encounters/cross-owner#<slug>` only from safe
  public exhibit slugs and ignore untrusted external/admin/same-owner hrefs.
- Web labels show `Cross-owner encounter exhibit` and
  `Cross-owner metadata-only public encounter exhibit`.
- Cross-owner public exhibit owner/public/detail/list readbacks now honestly
  mark safe published rows as Discover-search-listed while `indexed=false`
  remains true to the no-index/no-feed/no-SEO scope.
- Discover feed/rising/featured code paths and feed helper type sets were not
  changed.
- No public persona, public Space, forum/community, Station Press/public
  document, writing, homepage, provider, retrieval, billing, social, storage,
  Redis, Cloudflare, queue/worker, package, lockfile, deployment, migration, or
  schema-visible off-scope implementation path changed.

Protected-alpha limitation:

- PR519A intentionally does not add a search index or full-text engine. The
  public-field search is bounded and suitable for protected alpha, but hosted
  proof must record `/discover/search` latency and route a separate index repair
  if search is slow.

## Hosted Proof Required

MIMIR should route ARIADNE for PR519B hosted proof.

Hosted proof should verify:

- hosted web/API include accepted PR519A commit `15f50530` or later;
- `/discover/search?q=<public title token>` returns the proof cross-owner
  exhibit under `crossOwnerPublicEncounterExhibits`;
- summary, tag, requester display snapshot, and counterparty display snapshot
  queries find the proof row;
- the payload is metadata-only and routeable only to
  `/encounters/cross-owner#<slug>`;
- public detail/list/readback claims are honest for Discover search while
  `indexed=false`;
- pending/proposed, one-sided, wrong-scope, wrong-version, inactive/revoked
  consent, removed, retracted, malformed, wrong-schema, wrong-contract, missing
  consent, and snapshot-drift rows stay absent;
- same-owner `publicEncounterExhibits`, same-owner `/encounters`, Discover
  feed/rising/featured, public persona, public Space, forum/Salon, public
  document, Station Press, writing, homepage, and owner-private search buckets
  do not surface the proof row outside the accepted cross-owner search group and
  dedicated cross-owner index/detail surfaces;
- desktop and `390px` Discover search rendering fit without overlap;
- public search latency is acceptable for protected alpha, or MIMIR routes a
  separate public search-index repair;
- cleanup leaves no readable public proof row;
- proof output records no raw owner ids, raw persona ids, consent ids, private
  setup, generated reply text, transcript excerpts, summaries, provider
  payloads, prompts, source bodies, env values, tokens, cookies, SQL details,
  stack traces, screenshots, traces, videos, browser storage state, or
  secret-shaped values.

## ARGUS Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:persona-encounters` | Pass | 74 tests passed, including cross-owner public metadata readback honesty and existing detail/list/report/retract boundaries. |
| `npm exec --yes pnpm@10.32.1 -- run test:reports` | Pass | 8 tests passed, including same-owner and cross-owner public exhibit moderation actions. |
| `npm exec --yes pnpm@10.32.1 -- run test:community` | Pass | 47 tests passed, including the new cross-owner Discover search group, unsafe-row filtering, same-owner separation, private bucket separation, feed exclusion, payload key bounds, and fail-closed query behavior. |
| `npm exec --yes pnpm@10.32.1 -- run test:writing` | Pass | 29 tests passed; writing and Discover feed helper boundaries remain green. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 215 tests passed, including cross-owner public metadata helper coverage. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | Turbo API/web typecheck passed. |
| `git diff --check` | Pass | Working tree whitespace check passed before ARGUS docs edits. |
| Implementation diff whitespace | Pass | `git diff --check 2ab13ce8..15f50530` passed. |
| Changed-path scan | Pass | Implementation changes stayed inside PR519A allowed API, web search, readback helper/test, and roadmap/testing docs scope. |
| Forbidden-path scan | Pass | No package/lockfile, migration, provider, retrieval, storage, billing, social, Cloudflare, queue, deployment, public persona, public Space, forum, writing feed, or Discover feed helper paths changed. |
| Secret-shaped diff scan | Pass | No secret-shaped added lines were found in the implementation diff. |

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS accepts PR519A as ACCEPT_PR519A_CROSS_OWNER_METADATA_EXHIBIT_DISCOVER_SEARCH_GROUP.
- The implementation adds only the separate Discover search group crossOwnerPublicEncounterExhibits named Cross-owner Exhibits.
- Results are metadata-only, active-consent-backed, exact bilateral approval backed, display-snapshot matched, bounded to six, and route only to /encounters/cross-owner#<slug>.
- Same-owner publicEncounterExhibits, owner-private privateResults, Discover feed/rising/featured, public persona, public Space, forum/community/Salon, Station Press/public document, writing, homepage, generated words, private artifacts, PR516 disposable output reuse, provider/retrieval/storage/billing/social/Redis/Cloudflare/queue/package/deployment/migration work remain out.
- Cross-owner readback now honestly marks safe published rows Discover-search-listed while indexed remains false.
- Full requested local validation passed.
Task:
- Close PR519A locally if accepted and route ARIADNE for hosted PR519B proof using docs/roadmap/PR519A_CROSS_OWNER_METADATA_EXHIBIT_DISCOVER_SEARCH_REVIEW_RESULT.md.
```
