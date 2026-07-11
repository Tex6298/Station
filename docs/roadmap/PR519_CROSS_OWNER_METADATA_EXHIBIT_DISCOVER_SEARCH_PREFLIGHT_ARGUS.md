# PR519 - Cross-Owner Metadata Exhibit Discover Search Preflight

Owner: ARGUS / A3

Opened by: MIMIR / A1

Date opened: 2026-07-12

Status:

```text
OPEN_PREFLIGHT
```

## Why This Lane Exists

PR518B hosted proof passed:

`docs/roadmap/PR518B_CROSS_OWNER_METADATA_EXHIBIT_PUBLIC_INDEX_HOSTED_PROOF_RESULT.md`

The dedicated cross-owner index is now hosted-proven. PR518 preflight said
Discover search should be a later lane after hosted index proof, not part of
PR518A.

The next product-facing question is narrow: should bilaterally approved
metadata-only cross-owner exhibits appear in Discover search results, and if
yes, under what exact contract?

This is a preflight. Do not implement Discover search surfacing in PR519.

## Task

Decide whether DAEDALUS may implement a PR519A Discover search result group for
cross-owner metadata-only public exhibits.

Assess:

- API route(s) that power Discover search;
- web search dropdown/front-door rendering;
- result grouping and route labels;
- query matching fields;
- pagination/limit behavior;
- no-drift requirements for Discover feed, public persona, public Space, forum,
  writing, Station Press, homepage, and featured surfaces.

## Evidence To Use

Review at minimum:

- `apps/api/src/routes/discover.ts`;
- `apps/api/src/routes/persona-encounters.ts`;
- `apps/api/src/routes/persona-encounters.test.ts`;
- `apps/web/components/discover/search-dropdown.tsx`;
- `apps/web/components/discover/discover-front-door.tsx`;
- `apps/web/lib/discover-feed-controls.ts`;
- `apps/web/lib/writing-feed.ts`;
- PR518 preflight result;
- PR518A review result;
- PR518B hosted proof result;
- analogous PR510 same-owner Discover search preflight and result.

## Boundary Questions

Answer directly:

1. Is Discover search safe to include cross-owner metadata exhibits now that
   `/encounters/cross-owner` is hosted-proven?
2. Should search match only public title, summary/context note, tags, and safe
   participant display snapshots, or should any other public metadata be
   searchable?
3. What result shape is allowed? Include exact fields and labels.
4. Should the search dropdown show a separate group such as
   `Cross-owner Exhibits`, or merge into an existing group?
5. What limit/ranking behavior is safe? Avoid popularity/rising/featured unless
   explicitly justified.
6. How should pending, one-sided, wrong-scope, wrong-version, inactive-consent,
   revoked-consent, removed, retracted, malformed, wrong-schema,
   wrong-contract-version, and snapshot-drift rows behave in search?
7. What tests must prove Discover feed and non-search public surfaces still do
   not include cross-owner exhibits?
8. Is a DB index needed before implementation, or can protected alpha start
   with bounded search and route a partial-index repair only if hosted latency
   is poor?

## Guardrails

Do not recommend Discover feed inclusion in PR519A.

Do not recommend public persona, public Space, forum/community, Salon, Station
Press, public document, writing, homepage, or featured placement in PR519A.

Do not expose:

- generated words;
- generated summaries;
- transcript excerpts;
- private setup bodies;
- source bodies;
- provider payloads;
- prompts;
- private saved cross-owner artifacts;
- PR516 disposable preview output;
- raw owner ids;
- raw persona ids;
- consent ids;
- table ids;
- report counts;
- admin internals;
- removed, retracted, revoked, inactive, or partially approved rows.

Do not mix this with provider/retrieval/vector/embedding changes, billing,
social, storage, export, Archive, Memory, Canon, Continuity, Integrity, Redis,
Cloudflare, queue/worker, webhook, package, or lockfile work.

## Expected Output

Create:

```text
docs/roadmap/PR519_CROSS_OWNER_METADATA_EXHIBIT_DISCOVER_SEARCH_PREFLIGHT_RESULT.md
```

Include:

- verdict;
- whether DAEDALUS may implement PR519A;
- exact allowed search result contract;
- forbidden fields/surfaces;
- required API/web/test files;
- required validation commands;
- whether a migration/index is required now or deferred;
- next wakeup.

## Wakeup

Wake MIMIR with exactly one of:

```text
ACCEPT_PR519A_CROSS_OWNER_METADATA_EXHIBIT_DISCOVER_SEARCH_CONTRACT
BLOCK_PR519_CROSS_OWNER_METADATA_EXHIBIT_DISCOVER_SEARCH_PREFLIGHT
```
