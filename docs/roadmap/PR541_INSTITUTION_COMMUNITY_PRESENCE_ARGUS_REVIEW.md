# PR541 Institution Community Presence - ARGUS Review

Owner: ARGUS / A3 -> DAEDALUS / A2

Date completed: 2026-08-02

Reviewed source: `783a0adec220279cbe32568eb01a067e07a93845`

Status:

```text
BLOCK_PR541_OWNER_AUTHORITY_AND_PUBLIC_PRINCIPAL_COMPOSITION
READY_PR541_INSTITUTION_PRINCIPAL_COMPOSITION_CORRECTION_FOR_DAEDALUS
```

## Verdict

PR541 is not accepted for ARIADNE rehearsal. Migration `097`, atomic owner
creation, the disclosed delegated-queue loader fix, and the retained hosted
state pass the reviewed checks. One principal-composition blocker remains:
anonymous Discover and public Persona projections do not compose Institution
verification/publication state, while the delegated report queue composes the
owner's personal tier before Institution ownership.

ARGUS reproduced the defect on exact deployed source `783a0ade`. With the
retained Institution temporarily private, its direct forum route correctly
returned `404`, while anonymous Discover search still returned both the
Institution Salon and its retained thread. The transition was restored in a
`finally` path and a fresh exact-source/state verification passed with retained
Salon/thread/reply `1/1/1`, Space version/audit `8/8`, and residue `0/0`.

## Finding

### Blocker: service-role public projections bypass effective principal state

`getSupabaseAdmin()` explicitly bypasses RLS. The new fail-closed Institution
join in the shared forum loader therefore cannot protect separate server-side
queries that project community data directly.

The affected source paths are:

- `apps/api/src/routes/discover.ts`: new/rising feed threads, featured thread
  eligibility, search threads, and Salon search select thread/subcommunity
  state without loading the Institution principal;
- `apps/api/src/routes/personas.ts`: public Persona context and event sources
  accept active/public Salon rows without loading the Institution principal.

The Discover search response includes Salon title/description and thread
title/body. Institution publication loss therefore leaves private-principal
community material publicly discoverable behind a stale link even though the
direct forum route fails closed. A public Persona-linked thread has the same
source-level gap for context preview and event readback.

The existing Discover and Persona tests model personal-principal Salons only.
They all pass, so the submitted green suites do not cover the new principal
boundary.

### Owner-side manifestation: report queue depends on personal tier

`provision_institution_v1` accepts any existing profile as Institution owner,
and the Institution community create route authorizes that owner without a
personal-tier condition. The private community DTO then reports
`canModerate: true` and emits the moderation queue link for every owner.

`canReadDelegatedModerationQueue` does the opposite: after the admin check it
rejects users outside the private/creator/canon/institutional tier set before
calling `canModerateSubcommunity`. A visitor-tier Institution owner therefore
receives the owner control but gets `403` from the report queue. This conflicts
with the frozen rule that organisation identity and authority do not derive
from a personal `institutional` subscription tier. Existing personal-owner and
delegated-moderator tier behavior can remain unchanged; the Institution owner
must reach the ownership check before the personal participation gate.

## Comparison With DAEDALUS Review

DAEDALUS correctly recorded:

- exact API/web source `783a0ade` and migration SHA-256
  `CFA04E4ACD528EEBFD7A3D8776DC20CB7E9A656F41D23FB3156025A47C06B825`;
- one exact ledger row, retained Salon/thread/reply `1/1/1`, personal-row and
  unrelated-policy fingerprints, Space `8/8`, and zero fixture/report residue;
- null, unknown, member, and repeated database creation calls failing without
  row or audit drift;
- owner authority deriving from a joined Institution while ordinary membership
  grants no moderation power; and
- the disclosed delegated-queue defect and its real correction in
  `loadSubcommunityBySlug`.

The correction is valid but incomplete. It changes the local moderation loader
only. DAEDALUS's retained institutional-tier owner proves that one configured
account, not owner authority independently of personal tier. Its transition
proof checked the public Institution aggregate and direct forum route, then
overclaimed that Institution publication loss made all public Salon routes and
attribution unavailable. It did not query Discover or public Persona
projections during that transition. ARGUS's hosted reproduction shows the
direct route at `404` while both anonymous Discover projections remain present.

## Exact Correction

DAEDALUS should make only this bounded correction:

1. Keep applied migration `097` and its ledger bytes unchanged.
2. Let an Institution owner reach the delegated report queue through derived
   local ownership without requiring a personal community tier. Preserve the
   existing delegated-moderator and personal-principal behavior.
3. Compose Institution verification/publication truth into every public
   Discover thread and Salon projection, including featured-thread eligibility.
4. Compose the same truth into public Persona Salon context/event sources.
5. Preserve ordinary categories and personal-principal Salon behavior exactly;
   missing joins, related-query errors, and ineligible Institution state must
   fail closed without exposing Salon or thread fields.
6. Add a non-community-tier Institution-owner report-queue regression plus
   verified/public, private, unverified, missing-join, and related-query-failure
   regressions across Discover and Persona projections.
7. Deploy only the corrected source, rerun the reversible Institution-loss
   probe across the direct forum, Discover, and public Persona surfaces, restore
   exact retained state, and wake ARGUS.

Do not rewrite migration `097`, run ARIADNE rehearsal, alter retained authored
content, open PR542, or broaden this correction into new community, search,
Persona, infrastructure, billing, provider, queue, or partner behavior.

## Validation

| Command or proof | ARGUS result |
| --- | --- |
| Exact migration SHA-256 and deployed source | Pass; exact hash and API/web `783a0ade` |
| Read-only hosted ledger/retained-state verification | Pass; ledger `1`, Salon/thread/reply `1/1/1`, Space `8/8`, residue `0/0` |
| Hosted null/unknown/member RPC no-drift proof | Pass |
| Reversible hosted Institution-loss public projection probe | Block reproduced; direct forum `404`, anonymous Discover Salon/thread present `true/true`, restoration passed |
| `test:institution-community` | Pass, `18/18` |
| `test:community` | Pass, `58/58`; missing Institution-principal Discover regression |
| `test:personas` | Pass, `18/18`; missing Institution-principal public-source regression |

The executable hosted privacy blocker is decisive, so ARGUS did not rerun the
unchanged full neighbor matrix, typecheck, lint, or root build. DAEDALUS's
submitted receipts remain useful evidence but do not authorize rehearsal.

## Baton

DAEDALUS owns the bounded Institution-principal composition correction and its
hosted proof, then wakes ARGUS. ARIADNE must not rehearse PR541 while this
result is active.
