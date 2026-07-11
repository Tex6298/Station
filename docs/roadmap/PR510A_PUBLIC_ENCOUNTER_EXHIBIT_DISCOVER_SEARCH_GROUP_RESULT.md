# PR510A - Public Encounter Exhibit Discover Search Group Result

Owner: DAEDALUS / A2

Date: 2026-07-11

Status:

```text
READY_FOR_ARGUS_REVIEW
```

## Summary

DAEDALUS implemented PR510A as the accepted search-only slice:

- `/discover/search` now returns a `publicEncounterExhibits` group;
- the web public search groups now render that group as `Encounter Exhibits`;
- encounter search rows route only to `/encounters/[slug]`;
- Discover feed/rising/featured, public persona pages, public Space pages,
  forum/community placement, Station Press/public documents, private material,
  provider/retrieval, billing/social/storage, Redis/Cloudflare, queue/worker,
  package/lockfile, migration, and search-index work remain untouched.

## Files Changed

- `apps/api/src/routes/discover.ts`
- `apps/api/src/routes/community.test.ts`
- `apps/web/components/discover/search-dropdown.tsx`
- `apps/web/components/discover/search-dropdown.test.ts`
- `apps/web/components/discover/discover-front-door.tsx`
- `docs/roadmap/PR510A_PUBLIC_ENCOUNTER_EXHIBIT_DISCOVER_SEARCH_GROUP_RESULT.md`
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/roadmap/LANE_INDEX.md`
- `docs/testing/VALIDATION_BASELINE.md`

No migration, package, lockfile, provider, retrieval, billing, social, storage,
Redis, Cloudflare, queue, worker, webhook, or schema-visible feature path was
changed.

## API Result Contract

Empty search returns:

```text
publicEncounterExhibits: []
```

Non-empty search returns at most six rows in:

```text
publicEncounterExhibits
```

Each row contains only:

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

Search uses only public title, summary, tags, and same-owner display snapshots.
The API de-duplicates by public slug, ranks title matches ahead of tag/display
snapshot/summary matches, then sorts ties by `published_at desc`.

Rows are filtered before serialization using the PR509A safety floor:

- `status = published`;
- `removed_at is null`;
- `retracted_at is null`;
- public exhibit provenance schema;
- valid public exhibit slug;
- existing private source row.

## Web Search Behavior

`PUBLIC_SEARCH_GROUPS` includes:

```text
publicEncounterExhibits -> Encounter Exhibits
```

The web route helper derives encounter hrefs only from safe public exhibit
slugs and ignores external/admin/raw `href` values. Search labels show:

- `Public encounter exhibit`;
- `Metadata-only public encounter exhibit`.

The Discover front door can render the public `summary` field for search rows
without reading private fields.

## Hidden Row And Privacy Proof

Focused tests prove:

- empty search returns an empty `publicEncounterExhibits` group;
- public title, summary, tag, initiator display snapshot, and responder display
  snapshot searches return safe encounter rows;
- result payload keys match the accepted public contract;
- malformed slug, wrong schema, removed, retracted, and deleted-source rows are
  absent;
- private setup, generated reply text, transcript-like hidden markers, raw owner
  ids, source persona ids, private session ids, report fields, provider strings,
  prompts, source-body/admin field names, and hidden-row titles/summaries do not
  appear in search JSON;
- result limit is bounded at six and deterministic;
- `/discover/feed` remains free of encounter exhibit rows and markers;
- signed-in owner-private `privateResults` remain separate from
  `publicEncounterExhibits`.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:persona-encounters` | Pass | 37 tests passed; PR509A public list/detail safety remains green. |
| `npm exec --yes pnpm@10.32.1 -- run test:reports` | Pass | 7 tests passed; public exhibit moderation queue/remove/restore remains green. |
| `npm exec --yes pnpm@10.32.1 -- run test:writing` | Pass | 29 tests passed; writing and Discover feed helpers remain document/feed bounded. |
| `npm exec --yes pnpm@10.32.1 -- run test:community` | Pass | 44 tests passed, including the new API/search-dropdown encounter group coverage. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 201 tests passed; Studio/public encounter helper scans remain green. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | Turbo API/web typecheck passed. |
| Changed-path scan | Pass | Changed runtime paths are limited to Discover search API/tests and Discover search web helpers/tests. |
| Forbidden-path scan | Pass | No feed type, public persona route, public Space route, forum/community route, Station Press/public document, migration, package, lockfile, provider, retrieval, billing, social, storage, Redis, Cloudflare, queue, or worker implementation path changed. |
| `git diff --check` | Pass | No whitespace errors; Git reported expected LF-to-CRLF working-copy warnings only. |
| `git diff --cached --check` | Pass | No staged whitespace errors after staging PR510A implementation and docs. |

## Wakeup

```text
WAKEUP A3:
Codename: ARGUS

Summary:
- DAEDALUS implemented PR510A public encounter exhibit Discover search group.
- The implementation adds only a `publicEncounterExhibits` Discover search group named Encounter Exhibits, routing metadata-only rows to `/encounters/[slug]`.
- Discover feed/rising/featured, public persona, public Space, forum/community, Station Press/public documents, transcript/excerpt/raw reply, private setup/private curation, raw ids, report counts/paths, provider/retrieval, billing/social/storage, Redis/Cloudflare, queue/worker, package/lockfile, and migration/index scope remain untouched.
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
