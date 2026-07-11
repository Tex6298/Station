# PR519 - Cross-Owner Metadata Exhibit Discover Search Preflight Closeout

Owner: MIMIR / A1

Date: 2026-07-12

Result:

```text
CLOSE_PR519_CROSS_OWNER_METADATA_EXHIBIT_DISCOVER_SEARCH_PREFLIGHT_ACCEPTED
```

## Decision

MIMIR accepts ARGUS's PR519 verdict:

```text
ACCEPT_PR519A_CROSS_OWNER_METADATA_EXHIBIT_DISCOVER_SEARCH_CONTRACT
```

Source:

`docs/roadmap/PR519_CROSS_OWNER_METADATA_EXHIBIT_DISCOVER_SEARCH_PREFLIGHT_RESULT.md`

## Accepted Next Shape

PR519A may add cross-owner metadata-only public encounter exhibits to Discover
search only.

This is a narrow search lane. It must add a separate API/web search group named
`crossOwnerPublicEncounterExhibits` / `Cross-owner Exhibits`, keep it separate
from same-owner `publicEncounterExhibits`, and route only to
`/encounters/cross-owner#<slug>`.

Search may use only already-public metadata:

- `public_title`;
- `public_summary`;
- `public_tags`;
- `requester_persona_name_snapshot`;
- `counterparty_persona_name_snapshot`.

Every row must still pass the PR518A public-readability floor: published,
non-removed, non-retracted, valid public slug, contract version `1`, expected
provenance schema, exact bilateral metadata approval, active approved consent
with `publish_metadata_only_public_exhibit` at scope version `1`, and display
snapshots matching the linked consent.

PR519A must also keep readback claims honest: a safe published row may become
Discover-search-listed, while `routeListed=true` and `indexed=false` remain
separate facts.

## Still Blocked

PR519 does not approve:

- Discover feed, rising, featured, homepage, or marketing placement;
- merging into same-owner `publicEncounterExhibits` or same-owner
  `/encounters`;
- public persona, public Space, forum/community/Salon, Station Press, public
  document, or writing placement;
- generated words, generated summaries, transcript excerpts, source text,
  private setup, PR516 disposable preview output, private saved cross-owner
  artifacts, prompts, provider payloads, retrieval bodies, token facts, raw ids,
  consent ids, report counts, report paths, moderation/admin state, or hidden
  row metadata;
- provider, retrieval, vector, embedding, billing, social, storage, export,
  Archive, Memory, Canon, Continuity, Integrity, Redis, Cloudflare,
  queue/worker, webhook, package, lockfile, deployment, or migration work by
  default.

## Next

```text
PR519A - Cross-Owner Metadata Exhibit Discover Search Group
Owner: DAEDALUS / A2
Source: docs/roadmap/PR519A_CROSS_OWNER_METADATA_EXHIBIT_DISCOVER_SEARCH_DAEDALUS.md
```
