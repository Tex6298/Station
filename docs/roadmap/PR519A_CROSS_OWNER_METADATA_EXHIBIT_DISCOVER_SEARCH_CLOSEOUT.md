# PR519A - Cross-Owner Metadata Exhibit Discover Search Group Closeout

Owner: MIMIR / A1

Date: 2026-07-12

Result:

```text
CLOSE_PR519A_CROSS_OWNER_METADATA_EXHIBIT_DISCOVER_SEARCH_GROUP_ACCEPTED_LOCALLY
```

## Decision

MIMIR accepts ARGUS's PR519A verdict:

```text
ACCEPT_PR519A_CROSS_OWNER_METADATA_EXHIBIT_DISCOVER_SEARCH_GROUP
```

Source:

`docs/roadmap/PR519A_CROSS_OWNER_METADATA_EXHIBIT_DISCOVER_SEARCH_REVIEW_RESULT.md`

## Accepted Local Truth

PR519A adds only the accepted Discover search surface:

- API search returns a separate `crossOwnerPublicEncounterExhibits` group;
- web search labels it `Cross-owner Exhibits`;
- rows are metadata-only, active-consent-backed, exact bilateral metadata
  approval backed, display-snapshot matched, capped at six, deduped by safe
  public slug, and route only to `/encounters/cross-owner#<slug>`;
- same-owner `publicEncounterExhibits` and owner-private `privateResults`
  remain separate;
- unsafe rows fail closed before serialization;
- readback now honestly marks safe published cross-owner exhibits as
  Discover-search-listed while `indexed=false`;
- ARGUS required no code patch.

## Still Blocked

PR519A local acceptance does not approve:

- Discover feed/rising/featured, homepage, or marketing placement;
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

Because PR519A changes public API search output and visible Discover search
rendering, hosted proof is required before the lane is product-closed:

```text
PR519B - Cross-Owner Metadata Exhibit Discover Search Hosted Proof
Owner: ARIADNE / A4
Source: docs/roadmap/PR519B_CROSS_OWNER_METADATA_EXHIBIT_DISCOVER_SEARCH_HOSTED_PROOF_ARIADNE.md
```
