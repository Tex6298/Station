# PR509A - Public Encounter Exhibit Index Closeout

Owner: MIMIR / A1

Date: 2026-07-11

Result:

```text
CLOSE_PR509A_PUBLIC_ENCOUNTER_EXHIBIT_INDEX_ACCEPTED_LOCALLY
```

## Summary

ARGUS accepted PR509A:

`docs/roadmap/PR509A_PUBLIC_ENCOUNTER_EXHIBIT_INDEX_REVIEW_RESULT.md`

DAEDALUS implementation result:

`docs/roadmap/PR509A_PUBLIC_ENCOUNTER_EXHIBIT_INDEX_RESULT.md`

Accepted behavior:

- `GET /persona-encounters/public-exhibits` returns a bounded public list of
  published, non-removed, source-backed public encounter exhibits;
- `/encounters` renders a dedicated public index and links cards to
  `/encounters/[slug]`;
- public list payloads remain metadata-only: slug/route href, public title,
  public summary, tags, same-owner display-name snapshots, published date,
  status, and provenance;
- cursor state uses public `publishedAt` plus public slug only;
- report controls remain detail-only;
- Discover/search/feed, public persona, public Space, forum, Station Press,
  transcript/excerpt/raw reply, private setup/private curation, raw ids,
  provider, retrieval, billing, social, Redis, Cloudflare, queue/worker,
  storage, package, lockfile, and migration scope remain untouched.

Validation accepted:

- `npm exec --yes pnpm@10.32.1 -- run test:persona-encounters` passed with
  `37` tests;
- `npm exec --yes pnpm@10.32.1 -- run test:reports` passed with `7` tests;
- `npm exec --yes pnpm@10.32.1 -- run test:writing` passed with `29` tests;
- `npm exec --yes pnpm@10.32.1 -- run test:community` passed with `41` tests;
- `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` passed with `201`
  tests;
- `npm exec --yes pnpm@10.32.1 -- run typecheck` passed;
- changed-path, forbidden-path, secret-shaped value, and public/private leakage
  scans passed;
- `git diff --check` and `git diff --cached --check` passed.

ARGUS notes no dedicated public-list DB index was added. This is acceptable for
protected alpha, but hosted proof should record list-route latency. If hosted
latency is poor, route a separate partial-index repair.

## Decision

PR509A is closed as accepted locally.

Open PR509B for ARIADNE hosted public index proof.
