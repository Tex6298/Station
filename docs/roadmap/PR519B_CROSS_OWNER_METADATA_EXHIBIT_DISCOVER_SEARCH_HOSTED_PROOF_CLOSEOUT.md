# PR519B - Cross-Owner Metadata Exhibit Discover Search Hosted Proof Closeout

Owner: MIMIR / A1

Date: 2026-07-12

Result:

```text
CLOSE_PR519B_CROSS_OWNER_METADATA_EXHIBIT_DISCOVER_SEARCH_HOSTED_PROOF_ACCEPTED
```

## Decision

MIMIR accepts ARIADNE's PR519B hosted proof:

```text
PASS_PR519B_CROSS_OWNER_METADATA_EXHIBIT_DISCOVER_SEARCH_HOSTED_PROOF
```

Source:

`docs/roadmap/PR519B_CROSS_OWNER_METADATA_EXHIBIT_DISCOVER_SEARCH_HOSTED_PROOF_RESULT.md`

## Accepted Hosted Truth

PR519B proves the PR519A Discover search group on hosted Railway:

- hosted API `/health` returned `200`;
- hosted web returned `200`;
- hosted freshness was verified behaviorally by the deployed PR519A search
  group and readback behavior;
- `crossOwnerPublicEncounterExhibits` returned the proof row for title,
  summary, tag, requester display snapshot, and counterparty display snapshot
  probes;
- empty search returned `crossOwnerPublicEncounterExhibits: []`;
- payloads were metadata-only and routeable only to
  `/encounters/cross-owner#<slug>`;
- public detail readback honestly marked Discover-search listing with
  `discoverable=true` while keeping `indexed=false`;
- same-owner `publicEncounterExhibits` and owner-private `privateResults`
  stayed separate;
- unsafe pending/proposed, one-sided, wrong-scope, wrong-version,
  inactive/missing/revoked consent, removed, retracted, malformed,
  wrong-schema, wrong-contract, and snapshot-drift rows stayed absent or were
  blocked by hosted constraints before surfacing;
- hosted Discover search rendered on desktop and `390px` mobile without
  overflow or clipped result text;
- max measured search latency was `1420ms`, acceptable for protected alpha;
- Discover feed, same-owner `/encounters`, forums, writing, spaces, homepage,
  and the Discover page shell did not surface the proof row outside the
  accepted search group and dedicated cross-owner surfaces;
- cleanup left `crossPublicRowsReadable 0` and the temporary target private.

## Next

The next customer-facing expansion should not be more search hardening.

PR520 opens the next public-surfacing question: whether safe metadata-only
cross-owner exhibits can appear as contextual linkbacks on public persona,
public Space, and/or community surfaces, and if yes under what exact contract.

```text
PR520 - Cross-Owner Metadata Exhibit Contextual Public Linkbacks Preflight
Owner: ARGUS / A3
Source: docs/roadmap/PR520_CROSS_OWNER_METADATA_EXHIBIT_CONTEXTUAL_PUBLIC_LINKBACKS_PREFLIGHT_ARGUS.md
```
