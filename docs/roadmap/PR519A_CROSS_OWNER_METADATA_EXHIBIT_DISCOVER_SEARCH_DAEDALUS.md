# PR519A - Cross-Owner Metadata Exhibit Discover Search Group

Owner: DAEDALUS / A2

Date: 2026-07-12

Status: Ready for implementation

Source:

`docs/roadmap/PR519_CROSS_OWNER_METADATA_EXHIBIT_DISCOVER_SEARCH_PREFLIGHT_RESULT.md`

## Mission

Implement the accepted PR519A contract: expose safe, bilaterally approved,
metadata-only cross-owner encounter exhibits in Discover search only, as their
own group.

Do not broaden public surfacing. The dedicated cross-owner index and detail
surfaces are already hosted-proven by PR518B. PR519A is only the search entry
point into those surfaces.

## Required API Contract

Add a Discover search group:

```text
crossOwnerPublicEncounterExhibits
```

Required behavior:

- empty `q` returns `crossOwnerPublicEncounterExhibits: []`;
- non-empty `q` searches only public title, public summary, public tags,
  requester display snapshot, and counterparty display snapshot;
- unsafe rows are filtered before serialization using the PR518A
  active-consent public-readability floor;
- same-owner `publicEncounterExhibits` remains separate and never receives
  cross-owner rows;
- signed-in `privateResults` remains owner-scoped and separate;
- failures in the new group fail closed to an empty group or a bounded generic
  Discover error without internals;
- final group limit is small, at most `6`;
- per-field DB windows are bounded;
- results are de-duplicated by public slug before serialization;
- title matches may rank ahead of tag/display-snapshot/summary matches;
- ties sort deterministically by `published_at desc`, then slug desc.

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
- `contractVersion`, exactly the current cross-owner metadata contract version;
- `publishedAt`;
- `type`, exactly `cross_owner_encounter_exhibit`;
- `label`, exactly `Cross-owner encounter exhibit`;
- `provenance.label`, exactly
  `Cross-owner metadata-only public encounter exhibit`;
- `provenance.ownerCurated`;
- `provenance.public`;
- `provenance.crossOwner`;
- `provenance.metadataOnly`;
- `provenance.bilateralApproval`;
- `provenance.routeListed`;
- `provenance.discoverable`;
- `provenance.indexed`, which remains `false`;
- `provenance.source`;
- `provenance.note`.

Do not serialize raw ids, owner ids, persona ids, consent ids, report paths,
report counts, moderation state, admin actions, requested scopes, private setup,
generated reply text, transcript excerpts, generated summaries, prompts,
provider payloads, source bodies, cookies, tokens, env values, SQL details,
stack traces, or raw hrefs to non-cross-owner routes.

## Required Web Contract

Add the public search group as:

```text
Cross-owner Exhibits
```

Required behavior:

- add `crossOwnerPublicEncounterExhibits` to `PUBLIC_SEARCH_GROUPS`;
- keep `privateResults` excluded from public groups;
- derive routes only as `/encounters/cross-owner#<slug>` from safe public
  slugs;
- reject UUID-shaped, malformed, missing, external, admin, same-owner
  `/encounters/<slug>`, and non-encounter routes;
- label rows as `Cross-owner encounter exhibit` and
  `Cross-owner metadata-only public encounter exhibit`;
- render only public `summary` metadata;
- keep same-owner `Encounter Exhibits` separate;
- do not add report controls, persona links, Space links, forum links, document
  links, discussion affordances, cards outside search, hero work, or feed
  placement.

## Allowed Files

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

## Forbidden In This Lane

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

## Required Tests

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
- private setup, generated reply text, transcript-like markers,
  non-public-summary markers, raw owner ids, raw persona ids, consent ids,
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
- feed controls and writing feed helpers still exclude cross-owner exhibit item
  types.

## Required Validation

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

Also run changed-path, forbidden-path, and secret-shaped value scans before
waking ARGUS.

## Review Handoff

Wake ARGUS with:

- changed files;
- API/web behavior summary;
- exact tests and validation;
- any skipped validation with reason;
- any blocker or scope concern.

ARGUS should reject scope drift into feed, public persona, public Space, forum,
writing, homepage, provider/retrieval, storage, billing, Redis, Cloudflare,
queue, package, lockfile, deployment, or migration work unless MIMIR explicitly
opens a widened lane.

After local ARGUS acceptance, MIMIR should route ARIADNE for hosted Discover
search proof.
