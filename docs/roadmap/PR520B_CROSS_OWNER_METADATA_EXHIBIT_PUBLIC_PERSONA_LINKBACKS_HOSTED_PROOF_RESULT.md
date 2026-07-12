# PR520B - Cross-Owner Metadata Exhibit Public Persona Linkbacks Hosted Proof Result

Owner: ARIADNE / A4

Requested by: MIMIR / A1

Date: 2026-07-12

Result:

```text
PASS_PR520B_CROSS_OWNER_METADATA_EXHIBIT_PUBLIC_PERSONA_LINKBACKS_HOSTED_PROOF
```

## Summary

ARIADNE ran the hosted PR520B proof against Railway.

PR520B passes. Hosted requester and counterparty public persona pages/API
returned only eligible cross-owner metadata-only linkbacks. The other
participant stayed display-snapshot-only, the proof row routed only to
`/encounters/cross-owner#<slug>`, no-drift and privacy checks passed, desktop
and `390px` mobile rendering fit, and cleanup left no readable temporary proof
row.

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
  verified behaviorally by the deployed PR520A public persona linkback
  endpoint, visible section, readback behavior, desktop/mobile rendering,
  no-drift checks, and cleanup.

## Fixture

The proof created disposable hosted public personas for both participants:

```text
requesterCreated true
counterpartyCreated true
```

The proof then created one active approved cross-owner consent for
`publish_metadata_only_public_exhibit` at scope version `1` and one published,
non-removed, non-retracted, contract-version-1 metadata-only public exhibit.

## Probes

Passed:

- requester public persona linkback API returned the proof row;
- counterparty public persona linkback API returned the proof row;
- requester public persona page rendered the proof row;
- counterparty public persona page rendered the proof row;
- requester payload reported `participantRoleOnThisPage=requester`;
- counterparty payload reported `participantRoleOnThisPage=counterparty`;
- payload route was exactly `/encounters/cross-owner#<slug>`;
- payload exposed public title, public summary, public tags, status, contract
  version, published time, participant display snapshots, and bounded
  provenance only;
- the other participant did not expose a route, public slug, raw owner id, raw
  persona id, consent id, or profile data;
- payload JSON did not expose UUID-shaped raw ids or credential-pattern text;
- public detail readback kept `indexed=false`.

Latency:

```text
requester linkback latency 1483ms
counterparty linkback latency 1150ms
max linkback latency 1483ms
average linkback latency 1317ms
```

This is acceptable for protected alpha; no public-persona linkback index repair
blocker is opened from PR520B.

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
- one-sided proposed row stayed absent from requester and counterparty
  linkbacks;
- removed row stayed absent from requester and counterparty linkbacks;
- retracted row stayed absent from requester and counterparty linkbacks;
- revoked-consent row stayed absent from requester and counterparty linkbacks;
- wrong exhibit contract mutation was blocked by hosted DB constraint
  `pe_co_public_exhibits_contract_version_check`, then the row was retracted
  and stayed absent;
- wrong provenance schema mutation was blocked by hosted DB constraint
  `pe_co_public_exhibits_schema_check`, then the row was retracted and stayed
  absent;
- row/consent snapshot drift mutation was blocked by hosted DB constraint
  `cross-owner public exhibit display snapshots must match consent`, then the
  row was retracted and stayed absent;
- requester current-page display-name drift returned no linkback;
- counterparty current-page display-name drift returned no linkback;
- old public persona slug returned `404`;
- private public-persona control returned `404`;
- unsafe UUID-shaped slug returned `404`.

## No Drift

No-drift checks passed for:

- requester public persona context-preview;
- counterparty public persona context-preview;
- requester public persona events;
- counterparty public persona events;
- Discover feed API;
- hosted same-owner `/encounters`;
- hosted Discover page shell;
- hosted forums;
- hosted writing;
- hosted `/space` route probe;
- hosted homepage.

Public persona chat was not invoked because PR520B is not a provider/runtime
lane; PR520A local review already verified the chat/context source builders were
not expanded.

## Web Rendering

Passed:

- requester public persona page rendered on desktop `1280x900`;
- requester public persona page rendered on mobile `390x844`;
- counterparty public persona page rendered on desktop `1280x900`;
- counterparty public persona page rendered on mobile `390x844`;
- no horizontal overflow or clipped result link was detected;
- result navigation targeted `/encounters/cross-owner#<slug>`.

## Cleanup

Cleanup passed:

```text
crossPublicRowsReadable 0
createdPersonasStillPublic 0
```

Cleanup verified the temporary proof row no longer appeared in public persona
linkbacks, Discover search, dedicated cross-owner list, or public detail.

## Validation

```text
node .tmp\pr520b-hosted-proof.mjs
```

Result: pass.

`pnpm typecheck` was not run because this result updates documentation only and
does not touch imports or scripts.

## Next

MIMIR can close PR520B if accepted and choose the next product lane.
