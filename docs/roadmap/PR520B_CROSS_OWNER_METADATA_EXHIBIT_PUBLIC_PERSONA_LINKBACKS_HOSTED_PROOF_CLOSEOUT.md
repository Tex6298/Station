# PR520B - Cross-Owner Metadata Exhibit Public Persona Linkbacks Hosted Proof Closeout

Owner: MIMIR / A1

Date: 2026-07-12

Result:

```text
CLOSE_PR520B_CROSS_OWNER_METADATA_EXHIBIT_PUBLIC_PERSONA_LINKBACKS_HOSTED_PROOF_ACCEPTED
```

## Decision

MIMIR accepts ARIADNE's PR520B hosted proof:

```text
PASS_PR520B_CROSS_OWNER_METADATA_EXHIBIT_PUBLIC_PERSONA_LINKBACKS_HOSTED_PROOF
```

Source:

`docs/roadmap/PR520B_CROSS_OWNER_METADATA_EXHIBIT_PUBLIC_PERSONA_LINKBACKS_HOSTED_PROOF_RESULT.md`

## Accepted Hosted Truth

PR520B proves the PR520A public persona linkback surface on hosted Railway:

- hosted API `/health` returned `200`;
- hosted web returned `200`;
- requester and counterparty public persona linkback APIs returned the proof row;
- requester and counterparty public persona pages rendered the proof row on
  desktop and `390px` mobile without overflow or clipped result text;
- page-role readback correctly reported requester and counterparty roles;
- the other participant remained display-snapshot-only, with no route, public
  slug, raw owner id, raw persona id, consent id, or profile data;
- payloads were metadata-only and routed only to
  `/encounters/cross-owner#<slug>`;
- hidden/private/ineligible/old-slug/current-name-drift controls stayed absent;
- pending, one-sided, wrong-scope, wrong-version, inactive/missing/revoked
  consent, removed, retracted, malformed, wrong-schema, wrong-contract, and
  row/consent snapshot-drift controls stayed absent or were blocked before
  surfacing;
- public persona context-preview/events, Discover feed, same-owner
  `/encounters`, Discover shell, forums, writing, `/space`, and homepage showed
  no drift;
- max measured linkback latency was `1483ms`, acceptable for protected alpha;
- cleanup left `crossPublicRowsReadable 0` and `createdPersonasStillPublic 0`.

## Next

The metadata-only cross-owner exhibit path is now routeable, searchable, and
contextually visible from participant public persona pages.

The next product capability boundary is generated cross-owner public material.
PR521 opens a hostile preflight before any generated text, transcript excerpt,
summary, or saved cross-owner artifact becomes public.

```text
PR521 - Cross-Owner Generated Material Publication Preflight
Owner: ARGUS / A3
Source: docs/roadmap/PR521_CROSS_OWNER_GENERATED_MATERIAL_PUBLICATION_PREFLIGHT_ARGUS.md
```
