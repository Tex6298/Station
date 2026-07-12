# PR519B - Cross-Owner Metadata Exhibit Discover Search Hosted Proof Result

Owner: ARIADNE / A4

Requested by: MIMIR / A1

Date: 2026-07-12

Result:

```text
PASS_PR519B_CROSS_OWNER_METADATA_EXHIBIT_DISCOVER_SEARCH_HOSTED_PROOF
```

## Summary

ARIADNE ran the hosted PR519B proof against Railway.

PR519B passes. Hosted Discover search returns the accepted
`crossOwnerPublicEncounterExhibits` group for title, summary, tag, requester
display snapshot, and counterparty display snapshot probes. The result payload
is metadata-only, routes only to `/encounters/cross-owner#<slug>`, keeps
same-owner and owner-private groups separate, renders on desktop and `390px`
mobile, and cleanup left no readable public proof row.

## Hosted Freshness

Target:

```text
https://stationweb-production.up.railway.app
https://stationapi-production.up.railway.app
```

Health:

- hosted API `/health` returned `200` with `{"ok":true}`;
- hosted web returned `200`;
- the health endpoints did not expose a commit hash, so commit freshness was
  verified behaviorally by the deployed PR519A search group, result payload,
  readback provenance, desktop/mobile rendering, no-drift checks, and cleanup.

## Probes

Passed:

- title search found the proof row in `crossOwnerPublicEncounterExhibits`;
- summary search found the proof row;
- tag search found the proof row;
- signed-in owner title search found the proof row only in the cross-owner
  group, not in `privateResults`;
- requester display snapshot search found the proof row;
- counterparty display snapshot search found the proof row;
- empty search returned `crossOwnerPublicEncounterExhibits: []`;
- public detail readback reported `discoverable=true` for Discover search while
  keeping `indexed=false`;
- result `routeHref` was exactly `/encounters/cross-owner#<slug>`;
- result JSON did not expose UUID-shaped raw ids or credential-pattern text;
- same-owner `publicEncounterExhibits` did not include the proof row;
- owner-private `privateResults` did not include the proof row.

Latency:

```text
max search latency 1420ms
average search latency 1091ms
```

This is acceptable for protected alpha; no search-index repair blocker is
opened from PR519B.

## Absence Boundaries

Passed:

- pending consent rejected with
  `persona_encounter_cross_owner_public_exhibit_consent_inactive`;
- wrong scope rejected with
  `persona_encounter_cross_owner_public_exhibit_wrong_scope`;
- wrong version rejected with
  `persona_encounter_cross_owner_public_exhibit_wrong_version`;
- malformed metadata rejected with `400`;
- missing consent rejected with `404`;
- one-sided proposed row stayed absent from Discover search;
- removed row stayed absent from Discover search;
- retracted row stayed absent from Discover search;
- revoked-consent row stayed absent from Discover search;
- wrong exhibit contract mutation was blocked by hosted DB constraint
  `pe_co_public_exhibits_contract_version_check`, then the row was retracted
  and stayed absent;
- wrong provenance schema mutation was blocked by hosted DB constraint
  `pe_co_public_exhibits_schema_check`, then the row was retracted and stayed
  absent;
- snapshot drift mutation was blocked by hosted DB constraint
  `cross-owner public exhibit display snapshots must match consent`, then the
  row was retracted and stayed absent.

No-drift checks passed for:

- Discover feed API;
- hosted same-owner `/encounters`;
- hosted Discover page shell;
- hosted forums;
- hosted writing;
- hosted spaces route;
- hosted homepage.

## Web Rendering

Passed:

- hosted `/discover` rendered the `Cross-owner Exhibits` group on desktop
  `1280x900`;
- hosted `/discover` rendered the group on mobile `390x844`;
- no horizontal overflow or clipped result link was detected;
- result navigation targeted `/encounters/cross-owner#<slug>`.

## Cleanup

Cleanup passed:

```text
crossPublicRowsReadable 0
tempTargetPrivate true
```

Cleanup verified the proof row no longer appeared in Discover search, dedicated
cross-owner list, or public detail.

## Validation

```text
node .tmp\pr519b-hosted-proof.mjs
```

Result: pass.

`pnpm typecheck` was not run because this result updates documentation only and
does not touch imports or scripts.

## Next

MIMIR can close PR519B if accepted and choose the next product lane.
