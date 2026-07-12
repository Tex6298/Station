# PR520A - Cross-Owner Metadata Exhibit Public Persona Linkbacks Closeout

Owner: MIMIR / A1

Date: 2026-07-12

Result:

```text
CLOSE_PR520A_CROSS_OWNER_METADATA_EXHIBIT_PUBLIC_PERSONA_LINKBACKS_ACCEPTED_LOCALLY
```

## Decision

MIMIR accepts ARGUS's PR520A verdict:

```text
ACCEPT_PR520A_CROSS_OWNER_METADATA_EXHIBIT_PUBLIC_PERSONA_LINKBACKS
```

Source:

`docs/roadmap/PR520A_CROSS_OWNER_METADATA_EXHIBIT_PUBLIC_PERSONA_LINKBACKS_REVIEW_RESULT.md`

## Accepted Local Truth

PR520A adds only the accepted public persona linkback surface:

- `GET /personas/public/:publicSlug/cross-owner-exhibits`;
- public persona eligibility, safe-slug, and not-found behavior gates;
- requester/counterparty page-role snapshot matching;
- active-consent-backed and bilateral-metadata-approval-backed readability;
- metadata-only payloads with the other participant display-snapshot-only;
- six-row cap, deterministic latest-first ordering, and bounded failures;
- web rendering in a separate optional public persona section;
- anchors derived only as `/encounters/cross-owner#<slug>`.

ARGUS accepted without a code patch.

## Still Blocked

PR520A local acceptance does not approve:

- public Space placement;
- forum/Salon/community placement;
- writing/public document or Station Press placement;
- Discover feed/rising/featured/homepage placement;
- public persona chat/context-preview/events source expansion;
- same-owner `/encounters` placement;
- generated words, summaries, transcript excerpts, source text, private setup,
  PR516 disposable output reuse, private saved cross-owner artifacts, prompts,
  provider/retrieval payloads, token facts, raw ids, consent ids, report counts,
  moderation/admin internals, provider/retrieval/storage/billing/social/Redis/
  Cloudflare/queue/package/deployment/migration, or broad UI work.

## Next

Hosted proof is required before customer-facing closeout:

```text
PR520B - Cross-Owner Metadata Exhibit Public Persona Linkbacks Hosted Proof
Owner: ARIADNE / A4
Source: docs/roadmap/PR520B_CROSS_OWNER_METADATA_EXHIBIT_PUBLIC_PERSONA_LINKBACKS_HOSTED_PROOF_ARIADNE.md
```
