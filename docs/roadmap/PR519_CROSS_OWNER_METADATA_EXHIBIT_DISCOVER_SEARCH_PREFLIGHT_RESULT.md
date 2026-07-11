# PR519 - Cross-Owner Metadata Exhibit Discover Search Preflight Result

Owner: ARGUS / A3

Date: 2026-07-12

Status: Accepted

## Verdict

```text
ACCEPT_PR519A_CROSS_OWNER_METADATA_EXHIBIT_DISCOVER_SEARCH_CONTRACT
```

ARGUS accepts a narrow PR519A implementation: cross-owner metadata-only public
exhibits may appear in Discover search only as a separate result group after
PR518B hosted proof.

This is not approval for Discover feed, rising, featured, public persona,
public Space, forum/community, Salon, Station Press, public document, writing,
homepage, generated words, transcripts, excerpts, generated summaries, private
saved cross-owner artifacts, PR516 disposable preview output reuse, provider,
retrieval, storage, billing, social, Redis, Cloudflare, queue, worker, package,
lockfile, deployment, migration, or broad UI work.

Recommended next owner: DAEDALUS / A2.

## Evidence Reviewed

ARGUS reviewed:

- `docs/roadmap/PR519_CROSS_OWNER_METADATA_EXHIBIT_DISCOVER_SEARCH_PREFLIGHT_ARGUS.md`;
- `docs/roadmap/PR518_CROSS_OWNER_METADATA_EXHIBIT_PUBLIC_SURFACING_PREFLIGHT_RESULT.md`;
- `docs/roadmap/PR518A_CROSS_OWNER_METADATA_EXHIBIT_PUBLIC_INDEX_REVIEW_RESULT.md`;
- `docs/roadmap/PR518B_CROSS_OWNER_METADATA_EXHIBIT_PUBLIC_INDEX_HOSTED_PROOF_RESULT.md`;
- `docs/roadmap/PR518B_CROSS_OWNER_METADATA_EXHIBIT_PUBLIC_INDEX_HOSTED_PROOF_CLOSEOUT.md`;
- `docs/roadmap/PR510_PUBLIC_ENCOUNTER_EXHIBIT_DISCOVER_SEARCH_PREFLIGHT_RESULT.md`;
- `docs/roadmap/PR510A_PUBLIC_ENCOUNTER_EXHIBIT_DISCOVER_SEARCH_GROUP_REVIEW_RESULT.md`;
- `docs/roadmap/PR510B_PUBLIC_ENCOUNTER_EXHIBIT_DISCOVER_SEARCH_HOSTED_PROOF_RESULT.md`;
- `apps/api/src/routes/discover.ts`;
- `apps/api/src/routes/persona-encounters.ts`;
- `apps/api/src/routes/persona-encounters.test.ts`;
- `apps/web/components/discover/search-dropdown.tsx`;
- `apps/web/components/discover/discover-front-door.tsx`;
- `apps/web/lib/discover-feed-controls.ts`;
- `apps/web/lib/writing-feed.ts`;
- current Discover/community and persona encounter tests.

Current accepted truth:

- PR518B hosted proof passed for the dedicated
  `GET /persona-encounters/cross-owner-public-exhibits` endpoint and
  `/encounters/cross-owner` page.
- Hosted proof showed safe, bilaterally approved cross-owner metadata-only
  public exhibits can be listed and rendered without exposing generated words,
  transcript text, summaries, excerpts, private setup, raw ids, provider data,
  prompt bodies, retrieval bodies, token facts, or secrets.
- Hosted proof kept pending, one-sided, wrong-scope, removed, retracted, and
  revoked rows absent from the dedicated index.
- Current same-owner Discover search already has a dedicated
  `publicEncounterExhibits` group. Cross-owner rows are still absent from
  Discover search/feed today.

## Boundary Answers

1. Discover search is safe now, but only as a separate cross-owner search group.
   PR519A must not merge rows into `publicEncounterExhibits`, `/encounters`,
   feed, rising, featured, public persona, public Space, forum, Salon, Station
   Press, public document, writing, homepage, or any other public surface.

2. Search may match only already-public cross-owner metadata fields:
   `public_title`, `public_summary`, `public_tags`,
   `requester_persona_name_snapshot`, and
   `counterparty_persona_name_snapshot`. No consent metadata, private setup,
   generated output, transcript, excerpt, summary body, source body, report
   count, admin field, raw id, provider field, prompt, retrieval field, or
   token fact may be searched.

3. The allowed API group key is:

   ```text
   crossOwnerPublicEncounterExhibits
   ```

   Each item may contain only:

   - `slug`;
   - `routeHref`, exactly `/encounters/cross-owner#${slug}`;
   - `title`;
   - `summary`;
   - `tags`;
   - `participants.label`, exactly `Cross-owner consent display snapshots`;
   - `participants.requesterName`;
   - `participants.counterpartyName`;
   - `status`, always `published`;
   - `contractVersion`, exactly the current cross-owner metadata contract
     version;
   - `publishedAt`;
   - `type`, exactly `cross_owner_encounter_exhibit`;
   - `label`, exactly `Cross-owner encounter exhibit`;
   - `provenance.label`, exactly
     `Cross-owner metadata-only public encounter exhibit`;
   - `provenance.ownerCurated`, `provenance.public`,
     `provenance.crossOwner`, `provenance.metadataOnly`,
     `provenance.bilateralApproval`, `provenance.routeListed`,
     `provenance.discoverable`;
   - `provenance.indexed`, which remains `false` unless MIMIR opens a later
     search-index or SEO lane;
   - `provenance.source`;
   - `provenance.note`.

   It must not include `apiPath`, `id`, `ownerUserId`, `owner_user_id`,
   `requesterOwnerUserId`, `counterpartyOwnerUserId`, raw persona ids,
   consent ids, table ids, report paths, report counts, moderation state,
   admin actions, requested scopes, private setup, generated reply text,
   transcript excerpts, generated summaries, prompts, provider payloads, source
   bodies, cookies, tokens, env values, SQL details, stack traces, or raw hrefs
   to non-cross-owner routes.

4. The web search group must be separate from same-owner exhibits:

   ```text
   Cross-owner Exhibits
   ```

   The web route helper must derive `/encounters/cross-owner#<slug>` from a
   safe public exhibit slug and ignore untrusted incoming `href` values.
   It must reject UUID-shaped, malformed, missing, external, admin, same-owner
   `/encounters/<slug>`, and non-encounter routes.

5. Safe limit and ranking behavior:

   - final API group limit must be small, at most `6`;
   - per-field DB windows must be bounded;
   - results must be de-duplicated by public slug before serialization;
   - title matches may rank ahead of tag/display-snapshot/summary matches;
   - ties should sort by `published_at desc`, then slug desc;
   - no popularity, rising, featured, report-count, discussion-count,
     owner-rank, consent-age, click, impression, provider-derived,
     embedding/vector, or personalized ranking.

6. Pending, one-sided, wrong-scope, wrong-version, inactive-consent,
   revoked-consent, missing-consent, removed, retracted, malformed,
   wrong-schema, wrong-contract-version, and snapshot-drift rows must be absent.
   Search must use the PR518A public-readability floor: published,
   non-removed, non-retracted, valid public slug, contract version `1`, expected
   provenance schema, exact bilateral metadata approval, active approved consent
   with `publish_metadata_only_public_exhibit` at scope version `1`, and
   requester/counterparty display snapshots matching the linked consent.

7. Tests must prove Discover feed and non-search public surfaces still do not
   include cross-owner exhibits: `/discover/feed`, feed helper type sets,
   public persona, public Space, forum/Salon, Station Press/public document,
   writing, homepage, featured/rising, and same-owner `/encounters` must stay
   clean except for the already accepted link from same-owner `/encounters` to
   `/encounters/cross-owner`.

8. No DB migration or search index is required before PR519A. Protected alpha
   may start with bounded public-field search. If hosted Discover search
   latency is poor, MIMIR should route a separate partial/trigram/search-index
   repair instead of widening PR519A.

## PR519A Implementation Contract

Allowed files:

- `apps/api/src/routes/discover.ts`;
- `apps/api/src/routes/community.test.ts`;
- `apps/api/src/routes/persona-encounters.ts` only for shared safe-readability
  helpers or claim-honesty updates;
- `apps/api/src/routes/persona-encounters.test.ts` only for shared safety or
  `discoverable` readback assertions;
- `apps/web/components/discover/search-dropdown.tsx`;
- `apps/web/components/discover/search-dropdown.test.ts`;
- `apps/web/components/discover/discover-front-door.tsx` only for rendering or
  helper copy that names encounter exhibits honestly;
- `apps/web/lib/persona-encounter-runtime.ts` and test only if readback helper
  copy/types must change from Discover-not-listed to Discover-search-listed;
- roadmap/testing docs.

Expected API behavior:

- empty `q` returns `crossOwnerPublicEncounterExhibits: []`;
- non-empty `q` searches only public title, public summary, public tags,
  requester display snapshot, and counterparty display snapshot;
- unsafe rows are filtered before serialization using the PR518A active-consent
  public-readability floor;
- failures in the new group fail closed to an empty group or a bounded generic
  Discover error without internals;
- same-owner `publicEncounterExhibits` remains separate and never receives
  cross-owner rows;
- signed-in `privateResults` remains owner-scoped and separate;
- published cross-owner public exhibit owner readback, public detail readback,
  list item provenance, and web helper copy must become claim-honest for the
  new search surface: `discoverable` may no longer remain `false` for a safe
  published row once PR519A adds Discover search. `routeListed` remains `true`
  and `indexed` remains `false`.

Expected web behavior:

- add `crossOwnerPublicEncounterExhibits` to `PUBLIC_SEARCH_GROUPS` as
  `Cross-owner Exhibits`;
- derive search result routes only as `/encounters/cross-owner#<slug>`;
- label rows as `Cross-owner encounter exhibit` and
  `Cross-owner metadata-only public encounter exhibit`;
- render `summary` only as public metadata;
- keep same-owner `Encounter Exhibits` separate;
- do not add report controls, persona links, Space links, forum links,
  document links, discussion affordances, cards outside search, hero work, or
  feed placement.

Forbidden in PR519A:

- Discover feed, rising, featured, or `discover_feed` item-type changes;
- merging into `publicEncounterExhibits` or same-owner `/encounters`;
- public persona profile sections or linkbacks;
- public Space sections or linkbacks;
- forum/community discussion linkage, comments, Salon placement, or Station
  Press/public document linkage;
- writing feed, homepage, featured, or marketing placement;
- generated words, generated summaries, transcript excerpts, source text,
  private setup, PR516 disposable preview output, private saved cross-owner
  artifacts, private curation, prompts, provider payloads, retrieval bodies,
  token facts, raw ids, consent ids, report counts, report paths, admin state;
- provider/retrieval/vector/embedding changes;
- billing, social, storage, export, Archive, Memory, Canon, Continuity,
  Integrity, Redis, Cloudflare, queue/worker, webhook, package, lockfile,
  deployment, or migration work by default.

## Required PR519A Tests

API tests must cover:

- empty search returns an empty `crossOwnerPublicEncounterExhibits` group;
- title, summary, tag, requester display snapshot, and counterparty display
  snapshot searches return only safe rows;
- result payload keys are exactly the allowed public contract;
- result routes are exactly `/encounters/cross-owner#<slug>`;
- result limit is bounded and deterministic;
- same-owner `publicEncounterExhibits` and cross-owner
  `crossOwnerPublicEncounterExhibits` stay separate for the same query;
- pending/proposed, one-sided, wrong-scope, wrong-version, inactive-consent,
  revoked-consent, missing-consent, removed, retracted, malformed,
  wrong-schema, wrong-contract-version, and display-snapshot-drift rows are
  absent;
- private setup, generated reply text, transcript-like markers, summary-body
  markers beyond public metadata, raw owner ids, raw persona ids, consent ids,
  report fields, provider strings, prompts, source bodies, admin fields, and
  hidden-row titles/summaries do not appear in search JSON;
- `/discover/feed` remains free of cross-owner exhibit rows, group keys, and
  markers;
- owner-private `privateResults` remain owner-scoped and separate;
- cross-owner public detail/list/owner readback claims are updated to say the
  row is Discover-search-listed while `indexed=false`.

Web tests must cover:

- `PUBLIC_SEARCH_GROUPS` includes `crossOwnerPublicEncounterExhibits` as
  `Cross-owner Exhibits` and still excludes `privateResults`;
- cross-owner search hrefs accept only safe slugs and derive
  `/encounters/cross-owner#<slug>`;
- route helpers reject UUID-shaped, malformed, missing, external, admin,
  same-owner encounter, and non-encounter hrefs;
- routeable public search items drop unsafe cross-owner rows;
- labels show `Cross-owner encounter exhibit` and
  `Cross-owner metadata-only public encounter exhibit`;
- front-door search rendering can show public `summary` without relying on
  private fields;
- feed controls and writing feed helpers still exclude cross-owner exhibit
  item types.

Required PR519A validation:

```text
npm exec --yes pnpm@10.32.1 -- run test:persona-encounters
npm exec --yes pnpm@10.32.1 -- run test:reports
npm exec --yes pnpm@10.32.1 -- run test:community
npm exec --yes pnpm@10.32.1 -- run test:writing
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
git diff --cached --check
```

Also run changed-path, forbidden-path, and secret-shaped value scans. If
DAEDALUS touches migration/types, feed, public persona, Space, forum, Station
Press, package, lockfile, Cloudflare, queue, billing, provider, retrieval,
storage, deployment, or other off-scope paths, ARGUS should treat that as
scope drift unless MIMIR explicitly accepts a widened lane.

## Hosted Proof Required After PR519A

PR519A changes public API search output and visible Discover search rendering,
so MIMIR should route ARIADNE for hosted proof after local ARGUS acceptance.

Hosted proof should verify:

- hosted web/API include the accepted PR519A commit;
- a safe bilaterally approved cross-owner metadata-only public exhibit appears
  under `crossOwnerPublicEncounterExhibits` for title, summary, tag, requester
  display snapshot, and counterparty display snapshot queries;
- the search payload is metadata-only and routeable only to
  `/encounters/cross-owner#<slug>`;
- public detail/list/readback claims are honest for Discover search while
  `indexed=false`;
- pending, one-sided, wrong-scope, wrong-version, inactive/revoked consent,
  removed, retracted, malformed, wrong-schema, wrong-contract, and
  snapshot-drift rows stay absent;
- same-owner `publicEncounterExhibits`, same-owner `/encounters`, Discover
  feed/rising/featured, public persona, public Space, forum/Salon, public
  document, Station Press, writing, homepage, and private owner search buckets
  do not surface the cross-owner proof row outside the accepted group and
  dedicated cross-owner index/detail surfaces;
- desktop and `390px` Discover search rendering fit without overlap;
- public search latency is acceptable for protected alpha, or MIMIR routes a
  separate search-index repair;
- cleanup leaves no readable public proof row;
- proof output records no raw owner ids, raw persona ids, consent ids, private
  setup, generated reply text, transcript excerpts, summaries, provider
  payloads, prompts, source bodies, env values, tokens, cookies, SQL details,
  stack traces, screenshots, traces, videos, browser storage state, or
  secret-shaped values.

## ARGUS Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:persona-encounters` | Pass | 74 tests passed, including cross-owner metadata exhibit detail/list/readback and same-owner exhibit regressions. |
| `npm exec --yes pnpm@10.32.1 -- run test:reports` | Pass | 8 tests passed, including same-owner and cross-owner public exhibit moderation actions. |
| `npm exec --yes pnpm@10.32.1 -- run test:community` | Pass | 44 tests passed, including current Discover search/feed grouping, same-owner public encounter exhibit search, and private bucket separation. |
| `npm exec --yes pnpm@10.32.1 -- run test:writing` | Pass | 29 tests passed; writing and Discover feed helper boundaries remain green. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 215 tests passed, including cross-owner public metadata helper coverage. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | Turbo API/web typecheck passed from cache. |
| Current code review | Pass | Current code has same-owner Discover search only; cross-owner rows remain absent from search/feed until PR519A. |
| Scope review | Pass | PR519 preflight is roadmap/testing docs only; no runtime implementation was made. |
| Changed-path scan | Pass | Changes are limited to PR519 roadmap/status/index docs and `docs/testing/VALIDATION_BASELINE.md`. |
| Forbidden-path scan | Pass | No app/runtime, infra, package, lockfile, Cloudflare, queue, billing, provider, retrieval, storage, deployment, or migration paths changed. |
| Secret-shaped diff scan | Pass | No secret-shaped added lines were found in the staged diff. |
| `git diff --check` | Pass | Whitespace check passed; Git reported expected LF-to-CRLF working-copy warnings only. |
| `git diff --cached --check` | Pass | No staged whitespace errors after staging PR519 preflight docs/status updates. |

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS accepts PR519 as ACCEPT_PR519A_CROSS_OWNER_METADATA_EXHIBIT_DISCOVER_SEARCH_CONTRACT.
- DAEDALUS may implement only a separate Discover search group crossOwnerPublicEncounterExhibits named Cross-owner Exhibits.
- Search may use only public title, summary, tags, requester display snapshot, and counterparty display snapshot, returning metadata-only rows routeable only to /encounters/cross-owner#<slug>.
- Rows must pass the PR518A active-consent public-readability floor, including exact bilateral metadata approval and display snapshots matching the linked consent.
- PR519A must keep readback claims honest by marking safe published rows Discover-search-listed while indexed remains false.
- Discover feed/rising/featured, public persona, public Space, forum/community/Salon, Station Press/public document, writing, homepage, generated words, transcripts, excerpts, summaries, private saved artifacts, PR516 disposable output reuse, provider/retrieval/storage/billing/social/Redis/Cloudflare/queue/package/deployment/migration work remain blocked by default.
- Full local validation passed.
Task:
- Close PR519 preflight if accepted and route DAEDALUS for PR519A using docs/roadmap/PR519_CROSS_OWNER_METADATA_EXHIBIT_DISCOVER_SEARCH_PREFLIGHT_RESULT.md.
```
