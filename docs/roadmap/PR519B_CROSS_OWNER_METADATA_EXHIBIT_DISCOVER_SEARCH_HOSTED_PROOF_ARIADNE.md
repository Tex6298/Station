# PR519B - Cross-Owner Metadata Exhibit Discover Search Hosted Proof

Owner: ARIADNE / A4

Date: 2026-07-12

Status: Ready for hosted proof

Sources:

- `docs/roadmap/PR519A_CROSS_OWNER_METADATA_EXHIBIT_DISCOVER_SEARCH_REVIEW_RESULT.md`
- `docs/roadmap/PR519A_CROSS_OWNER_METADATA_EXHIBIT_DISCOVER_SEARCH_CLOSEOUT.md`

## Mission

Prove PR519A on hosted Railway web/API.

This is a hosted proof lane only. Do not implement product changes unless the
proof finds a concrete blocker and MIMIR routes a repair lane.

## Proof Requirements

Verify hosted freshness first:

- hosted web/API include accepted PR519A implementation commit `15f50530` or
  later;
- API and web health checks return `200`;
- no proof output prints secrets, cookies, browser storage state, env values,
  database URLs, tokens, screenshots, traces, videos, SQL details, stack
  traces, or secret-shaped values.

Create or identify a disposable hosted proof fixture with:

- two participant owners/personas;
- active approved cross-owner consent for
  `publish_metadata_only_public_exhibit` at scope version `1`;
- a published, non-removed, non-retracted, contract-version-1 cross-owner
  metadata-only public exhibit;
- stable public title, summary, tag, requester display snapshot, and
  counterparty display snapshot probes.

Prove search behavior:

- `/discover/search?q=<public title token>` returns the proof row under
  `crossOwnerPublicEncounterExhibits`;
- summary, tag, requester display snapshot, and counterparty display snapshot
  queries also find the proof row;
- empty search returns `crossOwnerPublicEncounterExhibits: []`;
- the payload is metadata-only and routeable only to
  `/encounters/cross-owner#<slug>`;
- the public detail/list/readback claims are honest for Discover search while
  `indexed=false`;
- public search latency is acceptable for protected alpha, or the result names
  a concrete public search-index repair blocker.

Prove absence boundaries:

- pending/proposed, one-sided, wrong-scope, wrong-version, inactive-consent,
  revoked-consent, missing-consent, removed, retracted, malformed,
  wrong-schema, wrong-contract, and snapshot-drift rows stay absent;
- same-owner `publicEncounterExhibits` remains separate;
- owner-private `privateResults` remains owner-scoped and separate;
- same-owner `/encounters`, Discover feed/rising/featured, public persona,
  public Space, forum/Salon, public document, Station Press, writing, homepage,
  and owner-private search buckets do not surface the proof row outside the
  accepted cross-owner search group and dedicated cross-owner index/detail
  surfaces.

Prove web rendering:

- Discover search renders the `Cross-owner Exhibits` group on desktop without
  overlap or clipped controls;
- Discover search renders on a `390px` mobile viewport without horizontal
  overflow, overlap, or clipped result text;
- result navigation targets `/encounters/cross-owner#<slug>`.

Cleanup:

- remove or retract the hosted proof fixture;
- verify cleanup leaves no readable public proof row in Discover search,
  dedicated cross-owner list, or detail surfaces.

## Result Document

Write one of:

- `docs/roadmap/PR519B_CROSS_OWNER_METADATA_EXHIBIT_DISCOVER_SEARCH_HOSTED_PROOF_RESULT.md`
- `docs/roadmap/PR519B_CROSS_OWNER_METADATA_EXHIBIT_DISCOVER_SEARCH_HOSTED_PROOF_BLOCKER_ARIADNE.md`

The result must include:

- hosted commit/deployment freshness;
- exact probes run;
- pass/fail table;
- cleanup result;
- latency note;
- privacy scan note;
- blocker details if blocked.

## Wakeup

If passed, wake MIMIR:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE completed PR519B hosted Discover search proof.
- Hosted search returns the accepted crossOwnerPublicEncounterExhibits group for title, summary, tag, requester snapshot, and counterparty snapshot probes.
- Boundaries and cleanup passed.
Task:
- Close PR519B if accepted and choose the next product lane.
```

If blocked, wake MIMIR with the exact blocker, affected route, hosted commit,
cleanup status, and the smallest recommended repair lane.
