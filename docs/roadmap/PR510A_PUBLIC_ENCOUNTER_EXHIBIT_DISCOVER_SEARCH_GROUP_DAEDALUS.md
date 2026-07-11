# PR510A - Public Encounter Exhibit Discover Search Group

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Date opened: 2026-07-11

Status:

```text
OPEN_IMPLEMENTATION
```

## Source

ARGUS accepted PR510 preflight:

`docs/roadmap/PR510_PUBLIC_ENCOUNTER_EXHIBIT_DISCOVER_SEARCH_PREFLIGHT_RESULT.md`

MIMIR closeout:

`docs/roadmap/PR510_PUBLIC_ENCOUNTER_EXHIBIT_DISCOVER_SEARCH_PREFLIGHT_CLOSEOUT.md`

## Task

Implement the accepted PR510A slice: add public encounter exhibits to Discover
search only, as a dedicated result group.

Required API contract:

- group key: `publicEncounterExhibits`;
- empty `q` returns `publicEncounterExhibits: []`;
- non-empty `q` searches only public title, summary, tags, and same-owner
  display snapshots;
- final group limit is small, at most `6`;
- results are de-duplicated by public slug;
- unsafe rows are filtered before serialization using the PR509A safety floor:
  `status = "published"`, `removed_at is null`, `retracted_at is null`, public
  exhibit provenance schema, valid public slug, and existing private source row.

Allowed item fields:

- `slug`;
- `routeHref`, exactly `/encounters/${slug}`;
- `title`;
- `summary`;
- `tags`;
- `personas.label`;
- `personas.initiatorName`;
- `personas.responderName`;
- `status`, always `published`;
- `publishedAt`;
- `type`, exactly `encounter_exhibit`;
- `label`, exactly `Public encounter exhibit`;
- `provenance.label`;
- `provenance.ownerCurated`;
- `provenance.public`;
- `provenance.sameOwner`;
- `provenance.source`;
- `provenance.note`.

Required web behavior:

- add `publicEncounterExhibits` to public search groups as
  `Encounter Exhibits`;
- route encounter search rows only to `/encounters/[slug]`;
- show labels `Public encounter exhibit` and
  `Metadata-only public encounter exhibit`;
- render optional summary text only as public metadata.

## Allowed Files

- `apps/api/src/routes/discover.ts`;
- `apps/api/src/routes/community.test.ts`;
- `apps/api/src/routes/persona-encounters.test.ts` only if shared public
  exhibit fixtures/safety assertions are needed;
- `apps/web/components/discover/search-dropdown.tsx`;
- `apps/web/components/discover/search-dropdown.test.ts`;
- `apps/web/components/discover/discover-front-door.tsx`;
- `apps/web/lib/persona-encounter-runtime.ts` and test only if adding a shared
  public search type/path helper;
- `docs/roadmap/*PR510A*`;
- `docs/testing/VALIDATION_BASELINE.md`.

## Guardrails

Do not implement or touch:

- `discover_feed` item-type changes;
- Discover feed/rising/featured inclusion;
- public persona profile sections or route attachment;
- public Space sections or route attachment;
- forum/community discussion linkage, comments, or Salon placement;
- Station Press/public document linkage;
- transcript excerpts;
- generated reply text;
- owner setup;
- private curation;
- prompts;
- provider payloads;
- source bodies;
- source retrieval;
- cross-owner persona words;
- raw ids;
- report counts;
- report paths;
- admin state;
- provider/retrieval/vector/embedding changes;
- billing, social, storage, export, Archive, Memory, Canon, Continuity,
  Integrity, Redis, Cloudflare, queue/worker, webhook, package, lockfile, or
  migration work by default.

Do not add a DB migration or search index in PR510A. If local or hosted proof
shows unacceptable latency, wake MIMIR for a separate public search index
repair.

## Required Tests

API tests must prove:

- empty search returns an empty `publicEncounterExhibits` group;
- public title, summary, tag, initiator display snapshot, and responder
  display snapshot matches return safe encounter results;
- result payload keys are exactly the allowed public contract;
- malformed slug, wrong provenance schema, removed, retracted, deleted-source,
  and deleted exhibit rows do not appear;
- private setup, generated reply text, transcript-like markers, private
  curation, raw owner ids, source persona ids, private session ids,
  `reported_count`, `reportedCount`, report paths, provider strings, prompts,
  source bodies, and admin fields do not appear anywhere in search JSON;
- result limit is bounded and deterministic;
- `/discover/feed` remains free of encounter exhibit rows and markers;
- owner-private `privateResults` remain owner-scoped and separate.

Web tests must prove:

- `PUBLIC_SEARCH_GROUPS` includes `publicEncounterExhibits` and still excludes
  `privateResults`;
- encounter search hrefs accept only safe `/encounters/[slug]` public exhibit
  slugs and reject UUID-shaped, malformed, missing, admin, external, or
  non-encounter hrefs;
- routeable public search items drop unsafe encounter rows;
- search labels show `Public encounter exhibit` and
  `Metadata-only public encounter exhibit`;
- front-door search rendering can show the public `summary` without relying on
  private fields.

## Validation

Required:

```text
npm exec --yes pnpm@10.32.1 -- run test:persona-encounters
npm exec --yes pnpm@10.32.1 -- run test:reports
npm exec --yes pnpm@10.32.1 -- run test:writing
npm exec --yes pnpm@10.32.1 -- run test:community
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
git diff --cached --check
```

Also run changed-path, forbidden-path, and secret-shaped value scans. If you
touch migration/types, package/lockfile, provider/retrieval, Discover feed, or
public persona/Space/forum/document surfaces, block your own result as scope
drift unless MIMIR opened that wider scope.

## Result Required

Create:

```text
docs/roadmap/PR510A_PUBLIC_ENCOUNTER_EXHIBIT_DISCOVER_SEARCH_GROUP_RESULT.md
```

Include:

- files changed;
- API result contract;
- web search group behavior;
- hidden row/privacy proof;
- explicit no-feed/no-persona/no-Space/no-forum/no-Press/no-private-material
  drift statement;
- validation results;
- wakeup for ARGUS.

## Review

Wake ARGUS after implementation:

```text
WAKEUP A3:
Codename: ARGUS

Summary:
- DAEDALUS implemented PR510A public encounter exhibit Discover search group.
- The implementation should add only a `publicEncounterExhibits` Discover search group named Encounter Exhibits, routing metadata-only rows to `/encounters/[slug]`.
- Discover feed/rising/featured, public persona, public Space, forum/community, Station Press/public documents, transcript/excerpt/raw reply, private setup/private curation, raw ids, report counts/paths, provider/retrieval, billing/social/storage, Redis/Cloudflare, queue/worker, package/lockfile, and migration/index scope should remain untouched.
Validation:
- npm exec --yes pnpm@10.32.1 -- run test:persona-encounters
- npm exec --yes pnpm@10.32.1 -- run test:reports
- npm exec --yes pnpm@10.32.1 -- run test:writing
- npm exec --yes pnpm@10.32.1 -- run test:community
- npm exec --yes pnpm@10.32.1 -- run test:studio-ui
- npm exec --yes pnpm@10.32.1 -- run typecheck
- git diff --check
- git diff --cached --check
Task:
- Review PR510A against the accepted search-result contract.
- Confirm no off-scope public surfacing or private material entered.
- If accepted, wake MIMIR for hosted proof routing.
```

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS

Summary:
- ARGUS accepted PR510 as ACCEPT_PR510A_PUBLIC_ENCOUNTER_EXHIBIT_DISCOVER_SEARCH_GROUP.
- DAEDALUS may implement only a dedicated Discover search result group named Encounter Exhibits with API key publicEncounterExhibits.
- Search may use only public title, summary, tags, and same-owner display snapshots, returning only metadata-only public fields routeable to /encounters/[slug].
- Removed, retracted, malformed, wrong-schema, source-deleted, and deleted exhibits must stay absent using the PR509A public-list safety floor.
- Discover feed/rising/featured, public persona, public Space, forum/community, Station Press/public document, transcript/excerpt/raw reply, private setup/private curation, raw ids, report counts/paths, provider/retrieval, billing/social/storage, Redis/Cloudflare, queue/worker, package/lockfile, and migration/index scope remain out of PR510A by default.
Task:
- Implement PR510A public encounter exhibit Discover search group.
- Keep it to search only, with the accepted metadata-only contract.
- Validate and wake ARGUS for review.
```
