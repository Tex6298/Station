# PR518B - Cross-Owner Metadata Exhibit Public Index Hosted Proof Result

Owner: ARIADNE / A4

Requested by: MIMIR / A1

Date: 2026-07-12

Result:

```text
PASS_PR518B_CROSS_OWNER_METADATA_EXHIBIT_PUBLIC_INDEX_HOSTED_PROOF
```

## Summary

ARIADNE ran the hosted PR518B proof against Railway.

PR518B passes. The hosted API list endpoint and dedicated
`/encounters/cross-owner` page show a safe, bilaterally approved cross-owner
metadata-only public exhibit; blocked rows stayed absent; public detail readback
honestly reports dedicated route listing while `indexed` and `discoverable`
remain false; same-owner public exhibit behavior still works; desktop and
`390px` mobile rendering fit; blocked public surfaces did not expose the proof
row; cleanup left no readable public proof row.

## Hosted Proof

Target:

```text
https://stationweb-production.up.railway.app
https://stationapi-production.up.railway.app
```

Passed:

- API health returned `200`;
- hosted web returned `200`;
- owner, target owner, non-owner, and admin auth worked;
- one safe bilaterally approved cross-owner metadata-only public exhibit was
  created;
- `GET /persona-encounters/cross-owner-public-exhibits` returned the proof row;
- list payload exposed public slug/href, title, summary, tags, safe participant
  display snapshots, status, contract version, published timestamp, provenance
  labels, and report path only;
- list route href was `/encounters/cross-owner#<slug>`;
- list payload had `routeListed=true`, `indexed=false`, `discoverable=false`,
  `metadataOnly=true`, and `bilateralApproval=true`;
- public detail had `routeListed=true`, `indexed=false`, `discoverable=false`,
  and generated/transcript/summary/excerpt publication flags set to false;
- list/detail payloads did not expose UUID-shaped raw ids or credential-pattern
  text;
- pending, one-sided approval, wrong-scope, removed, retracted, and
  revoked-consent proof rows stayed absent from the list;
- invalid list cursor returned `400`;
- public detail, report, moderation remove, restore, consent revocation hiding,
  and participant retract behavior remained intact;
- same-owner public exhibit publish/report/remove/restore/retract regression
  passed;
- same-owner API list and `/encounters` page did not mix the cross-owner proof
  row, beyond the accepted link to `/encounters/cross-owner`;
- `/encounters/cross-owner` rendered the proof row on desktop and `390px`
  mobile without horizontal overflow or clipped proof card;
- Discover feed, Discover search, forums API, hosted Discover, hosted forums,
  hosted writing, hosted spaces, and homepage did not surface the proof row.

## Cleanup

Cleanup passed:

```text
crossPublicRowsReadable 0
tempTargetPrivate true
samePrivateSessionDeleted true
samePublicExhibitDeleted true
```

The proof cross-owner rows were retracted or otherwise made unreadable, the
temporary public target was made private, and the same-owner regression fixture
was deleted.

## Validation

```text
node .tmp\pr518b-hosted-proof.mjs
```

Result: pass.

`pnpm typecheck` was not run because this result updates documentation only and
does not touch imports or scripts.

## Next

MIMIR can close PR518B/PR518A if accepted. The dedicated cross-owner public
index is hosted-proven without opening Discover/search/feed or other blocked
surfaces.
