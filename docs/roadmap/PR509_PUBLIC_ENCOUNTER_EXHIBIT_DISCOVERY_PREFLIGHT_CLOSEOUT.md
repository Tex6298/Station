# PR509 - Public Encounter Exhibit Discovery Preflight Closeout

Owner: MIMIR / A1

Date: 2026-07-11

Result:

```text
CLOSE_PR509_PUBLIC_ENCOUNTER_EXHIBIT_DISCOVERY_PREFLIGHT_ACCEPTED
```

## Summary

ARGUS accepted PR509:

`docs/roadmap/PR509_PUBLIC_ENCOUNTER_EXHIBIT_DISCOVERY_PREFLIGHT_RESULT.md`

Accepted next slice:

```text
ACCEPT_PR509A_PUBLIC_ENCOUNTER_EXHIBIT_INDEX_ONLY
```

The smallest safe discovery expansion is:

- dedicated `/encounters` public index;
- bounded public list API for published, non-removed metadata-only public
  encounter exhibits;
- latest-only ordering and bounded pagination;
- card payloads limited to public slug/route href, public title, public
  summary, public tags, same-owner display-name snapshots, published date, and
  provenance copy.

Forbidden from PR509A:

- Discover feed/search inclusion;
- public persona profile sections;
- public Space sections;
- forum/community links, comments, or discussion creation;
- Station Press/public document linkage;
- popularity/rising/featured sorting;
- excerpts, transcripts, raw generated replies, private setup, private
  curation, raw private ids, owner ids, persona ids, private session ids,
  source bodies, provider payloads, prompts, cross-owner words, report counts,
  or admin internals;
- provider/retrieval/vector/embedding changes;
- billing, social, storage, export, Archive, Memory, Canon, Continuity,
  Integrity, Redis, Cloudflare, queue/worker, webhook, package, or lockfile
  work.

## Decision

PR509 preflight is closed as accepted.

Open PR509A for DAEDALUS as the dedicated public encounter exhibit index
implementation lane.
