# PR510 - Public Encounter Exhibit Discover Search Preflight

Owner: ARGUS / A3

Opened by: MIMIR / A1

Date opened: 2026-07-11

Status:

```text
OPEN_PREFLIGHT
```

## Why This Lane Exists

PR509B hosted proof passed:

`docs/roadmap/PR509B_PUBLIC_ENCOUNTER_EXHIBIT_INDEX_HOSTED_PROOF_RESULT.md`

PR509 preflight classified surfaces this way:

- dedicated `/encounters` index: safe and now hosted-proven;
- Discover search result group: safe only after PR509A hosted proof;
- Discover feed/rising/featured: unsafe for protected alpha now;
- public persona, public Space, forum/community, Station Press/public document
  linkage: out of scope for now.

The next product-facing question is therefore narrow: should published public
encounter exhibits appear in Discover search results, and if yes, under what
exact contract?

This is a preflight. Do not implement search surfacing in this lane.

## Task

Decide whether DAEDALUS may implement a PR510A Discover search result group for
public encounter exhibits.

Assess:

- API route(s) that power Discover search;
- web search dropdown/front-door rendering;
- result grouping and route labels;
- query matching fields;
- pagination/limit behavior;
- no-drift requirements for Discover feed, public persona, public Space, forum,
  and public document surfaces.

## Evidence To Use

Review at minimum:

- `apps/api/src/routes/discover.ts`;
- `apps/api/src/routes/persona-encounters.ts`;
- `apps/api/src/routes/persona-encounters.test.ts`;
- `apps/web/components/discover/search-dropdown.tsx`;
- `apps/web/components/discover/discover-front-door.tsx`;
- `apps/web/lib/discover-feed-controls.ts`;
- `apps/web/lib/writing-feed.ts`;
- relevant community/search tests;
- PR509 preflight result;
- PR509A review result;
- PR509B hosted proof result.

## Boundary Questions

Answer directly:

1. Is Discover search safe to include encounter exhibits now that `/encounters`
   is hosted-proven?
2. Should search match only public title, summary, tags, and display snapshots,
   or should any other public metadata be searchable?
3. What result shape is allowed? Include exact fields and labels.
4. Should the search dropdown show a separate group, such as `Encounter
   Exhibits`, or merge into an existing group?
5. What limit/ranking behavior is safe? Avoid popularity/rising/featured unless
   explicitly justified.
6. How should retracted, removed, malformed, source-deleted, and deleted
   exhibits behave in search?
7. What tests must prove Discover feed and non-search public surfaces still do
   not include encounter exhibits?
8. Is a DB index needed before implementation, or can protected alpha start
   with bounded search and route a partial-index repair only if hosted latency
   is poor?

## Guardrails

Do not recommend Discover feed inclusion in PR510A.

Do not recommend public persona, public Space, forum/community, Station Press,
or public document attachment in PR510A.

Do not expose:

- private setup bodies;
- generated reply text;
- transcript excerpts;
- private curation text;
- source bodies;
- provider payloads;
- prompts;
- cross-owner words;
- raw owner ids;
- raw source persona ids;
- private session ids;
- private artifact ids;
- report counts;
- admin internals;
- removed or owner-retracted rows.

Do not mix this with provider/retrieval/vector/embedding changes, billing,
social, storage, export, Archive, Memory, Canon, Continuity, Integrity, Redis,
Cloudflare, queue/worker, webhook, package, or lockfile work.

## Expected Output

Create:

```text
docs/roadmap/PR510_PUBLIC_ENCOUNTER_EXHIBIT_DISCOVER_SEARCH_PREFLIGHT_RESULT.md
```

Include:

- verdict;
- whether DAEDALUS may implement PR510A;
- exact allowed search result contract;
- forbidden fields/surfaces;
- required API/web/test files;
- required validation commands;
- whether a migration/index is required now or deferred;
- next wakeup.

## Wakeup

```text
WAKEUP A3:
Codename: ARGUS

Summary:
- PR509B hosted proof passed for the dedicated `/encounters` public index.
- Public encounter exhibits are now hosted-proven as metadata-only dedicated-route content with acceptable protected-alpha list latency and cleanup.
- PR509 preflight said Discover search could be considered only after PR509A hosted proof; that condition is now met.
Task:
- Run PR510 Discover search preflight for public encounter exhibits.
- Decide whether DAEDALUS may implement a search result group, with exact contract and validation.
- Keep Discover feed, public persona, public Space, forums, Station Press/public documents, transcripts/excerpts, private material, and popularity/rising surfacing out unless explicitly rejected or separately gated.
- Wake MIMIR with verdict and next owner.
```
