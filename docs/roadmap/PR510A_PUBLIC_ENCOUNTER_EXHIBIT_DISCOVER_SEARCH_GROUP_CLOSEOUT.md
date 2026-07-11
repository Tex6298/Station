# PR510A - Public Encounter Exhibit Discover Search Group Closeout

Owner: MIMIR / A1

Date: 2026-07-11

Result:

```text
CLOSE_PR510A_PUBLIC_ENCOUNTER_EXHIBIT_DISCOVER_SEARCH_GROUP_ACCEPTED_LOCALLY
```

## Summary

ARGUS accepted PR510A:

`docs/roadmap/PR510A_PUBLIC_ENCOUNTER_EXHIBIT_DISCOVER_SEARCH_GROUP_REVIEW_RESULT.md`

DAEDALUS implementation result:

`docs/roadmap/PR510A_PUBLIC_ENCOUNTER_EXHIBIT_DISCOVER_SEARCH_GROUP_RESULT.md`

Accepted behavior:

- `/discover/search` now returns a dedicated `publicEncounterExhibits` group;
- the public web search groups render that group as `Encounter Exhibits`;
- search uses only already-public title, summary, tags, and same-owner display
  snapshots;
- result payloads are metadata-only and route only to `/encounters/[slug]`;
- rows are filtered by the PR509A public-list safety floor: published,
  non-removed, non-retracted, valid public exhibit provenance schema, valid
  public slug, and existing private source row;
- malformed, removed, retracted, wrong-schema, source-deleted, and deleted
  exhibits stay absent;
- Discover feed/rising/featured, public persona pages, public Space pages,
  forum/community placement, Station Press/public documents, transcripts,
  excerpts, raw replies, private setup, private curation, raw ids, report
  counts/paths, provider/retrieval, billing/social/storage, Redis/Cloudflare,
  queue/worker, package/lockfile, migration, and search-index work remain out.

Validation accepted:

- `npm exec --yes pnpm@10.32.1 -- run test:persona-encounters` passed with
  `37` tests;
- `npm exec --yes pnpm@10.32.1 -- run test:reports` passed with `7` tests;
- `npm exec --yes pnpm@10.32.1 -- run test:writing` passed with `29` tests;
- `npm exec --yes pnpm@10.32.1 -- run test:community` passed with `44` tests;
- `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` passed with `201`
  tests;
- `npm exec --yes pnpm@10.32.1 -- run typecheck` passed;
- changed-path, forbidden-path, secret-shaped value, and public/private leakage
  scans passed;
- `git diff --check` and `git diff --cached --check` passed.

ARGUS notes no dedicated search index or full-text engine was added. This is
acceptable for protected alpha, but hosted proof must record
`/discover/search` latency. If hosted latency is poor, route a separate public
search-index or normalization repair.

## Decision

PR510A is closed as accepted locally.

Open PR510B for ARIADNE hosted public encounter exhibit Discover search proof.
