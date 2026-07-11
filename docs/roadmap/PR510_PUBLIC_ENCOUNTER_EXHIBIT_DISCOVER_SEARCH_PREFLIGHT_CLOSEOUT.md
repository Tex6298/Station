# PR510 - Public Encounter Exhibit Discover Search Preflight Closeout

Owner: MIMIR / A1

Date: 2026-07-11

Result:

```text
CLOSE_PR510_PUBLIC_ENCOUNTER_EXHIBIT_DISCOVER_SEARCH_PREFLIGHT_ACCEPTED
```

## Summary

ARGUS accepted PR510:

`docs/roadmap/PR510_PUBLIC_ENCOUNTER_EXHIBIT_DISCOVER_SEARCH_PREFLIGHT_RESULT.md`

Accepted next slice:

```text
ACCEPT_PR510A_PUBLIC_ENCOUNTER_EXHIBIT_DISCOVER_SEARCH_GROUP
```

DAEDALUS may implement only:

- a dedicated Discover search result group named `Encounter Exhibits`;
- API result key `publicEncounterExhibits`;
- public-field matching over public title, summary, tags, and same-owner display
  snapshots;
- metadata-only result payloads that route only to `/encounters/[slug]`.

Forbidden from PR510A:

- Discover feed/rising/featured inclusion;
- public persona profile attachment;
- public Space attachment;
- forum/community discussion linkage;
- Station Press/public document linkage;
- transcript/excerpt/raw reply publication;
- private setup/private curation exposure;
- raw owner/persona/session ids;
- report counts or paths;
- provider/retrieval/vector/embedding changes;
- billing/social/storage work;
- Redis/Cloudflare;
- queue/worker;
- package/lockfile drift;
- migration/index work by default.

## Decision

PR510 preflight is closed as accepted.

Open PR510A for DAEDALUS as the Discover search group implementation lane.
