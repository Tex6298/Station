# PR520B - Cross-Owner Metadata Exhibit Public Persona Linkbacks Hosted Proof

Owner: ARIADNE / A4

Date: 2026-07-12

Status: Ready for hosted proof

Sources:

- `docs/roadmap/PR520A_CROSS_OWNER_METADATA_EXHIBIT_PUBLIC_PERSONA_LINKBACKS_REVIEW_RESULT.md`
- `docs/roadmap/PR520A_CROSS_OWNER_METADATA_EXHIBIT_PUBLIC_PERSONA_LINKBACKS_CLOSEOUT.md`

## Mission

Prove PR520A on hosted Railway web/API.

This is a hosted proof lane only. Do not implement product changes unless the
proof finds a concrete blocker and MIMIR routes a repair lane.

## Proof Requirements

Verify hosted freshness:

- hosted API and web are fresh enough to include PR520A implementation commit
  `604b2d4b` or later;
- API and web health checks return `200`;
- if commit hash is not exposed, prove freshness behaviorally with the new
  public persona linkback endpoint and visible section.

Create or identify a disposable hosted proof fixture with:

- a requester public persona;
- a counterparty public persona;
- active approved cross-owner consent for
  `publish_metadata_only_public_exhibit` at scope version `1`;
- a published, non-removed, non-retracted, contract-version-1 cross-owner
  metadata-only public exhibit;
- stable public title, summary, tag, requester display snapshot, and
  counterparty display snapshot probes.

Prove public persona linkback behavior:

- requester public persona page/API returns the proof row;
- counterparty public persona page/API returns the proof row;
- the other participant is display-snapshot-only and has no route, public slug,
  raw owner id, raw persona id, consent id, or profile data;
- linkback payload is metadata-only and routes only to
  `/encounters/cross-owner#<slug>`;
- public persona readback remains usable if the optional linkback request has a
  bounded failure.

Prove absence boundaries:

- hidden, private, ineligible, old slug, unsafe slug, and current-page
  display-name drift controls return no public persona linkbacks;
- revoked consent, removed, retracted, wrong-scope, wrong-version,
  wrong-schema, wrong-contract, inactive/missing consent, one-sided approval,
  malformed rows, and row/consent snapshot drift stay absent;
- public persona chat, public persona context-preview, and public persona
  events do not include cross-owner exhibit rows;
- public Space, forum/Salon/community, writing/public document, Discover feed,
  homepage, same-owner `/encounters`, and owner-private buckets do not surface
  the proof row outside the accepted public persona section and dedicated
  cross-owner surfaces.

Prove web rendering:

- requester public persona page renders the section on desktop without overlap,
  clipped text, or broken anchors;
- counterparty public persona page renders the section on desktop without
  overlap, clipped text, or broken anchors;
- requester and counterparty pages render on a `390px` mobile viewport without
  horizontal overflow, overlap, or clipped link text;
- result navigation targets `/encounters/cross-owner#<slug>`.

Measure latency:

- record max and average latency for the new hosted endpoint;
- if latency is poor for protected alpha, name a concrete public-persona
  linkback index/repair blocker instead of widening PR520B.

Cleanup:

- remove or retract the hosted proof fixture;
- verify cleanup leaves no readable temporary proof row in public persona
  linkbacks, Discover search, dedicated cross-owner list, or public detail.

## Result Document

Write one of:

- `docs/roadmap/PR520B_CROSS_OWNER_METADATA_EXHIBIT_PUBLIC_PERSONA_LINKBACKS_HOSTED_PROOF_RESULT.md`
- `docs/roadmap/PR520B_CROSS_OWNER_METADATA_EXHIBIT_PUBLIC_PERSONA_LINKBACKS_HOSTED_PROOF_BLOCKER_ARIADNE.md`

The result must include:

- hosted freshness;
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
- ARIADNE completed PR520B hosted public persona linkback proof.
- Requester and counterparty public persona pages/API returned only eligible metadata-only linkbacks.
- Boundaries, browser rendering, latency, privacy scan, and cleanup passed.
Task:
- Close PR520B if accepted and choose the next product lane.
```

If blocked, wake MIMIR with the exact blocker, affected route, hosted
freshness, cleanup status, and the smallest recommended repair lane.
