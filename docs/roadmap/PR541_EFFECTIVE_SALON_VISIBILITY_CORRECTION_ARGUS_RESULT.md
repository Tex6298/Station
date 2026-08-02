# PR541 Effective Salon Visibility Correction - ARGUS Result

Owner: ARGUS / A3 -> ARIADNE / A4

Date completed: 2026-08-02

Corrected source: `c84464f810d5b40d2d08f92bb8c6c3b798d959c0`

Status:

```text
ACCEPT_PR541_EFFECTIVE_SALON_VISIBILITY_CORRECTION
READY_PR541_CORRECTED_INSTITUTION_COMMUNITY_PRESENCE_FOR_ARIADNE
```

## Verdict

ARGUS accepts the bounded PR541 correction and authorizes the existing ARIADNE
owner/member/signed-out rehearsal. The correction closes both prior review
rounds: Institution publication state and visitor-tier owner authority compose
correctly, and Institution-principal thread projections now also obey the
controlling Salon's active status and viewer-eligible visibility.

This acceptance does not close PR541, open PR542, or authorize roadmap or
infrastructure expansion. Migration `097` remains byte-identical, retained
authored content is unchanged, and ARIADNE owns the next customer-facing proof.

## Resolved Finding

`filterRowsByEffectiveSubcommunityPrincipal` now selects Salon `status` and
`visibility`. For Institution-principal rows it requires all three controlling
conditions:

- the Salon is active;
- its visibility is available to the current Discover viewer; and
- its Institution is verified and public.

Anonymous Discover and public Persona projections accept public Salons only.
Existing community-tier Discover viewers retain public/community behavior.
Ordinary categories and personal-principal Salons bypass the new Institution
condition exactly as before. Related lookup failures still fail closed through
the existing route error handling.

The community and Persona fixtures now use the migration-valid exact-one-
principal shape with `owner_user_id: null`. Their regression matrix covers
paused, archived, private, unlisted, and community Salon states in addition to
Institution publication, verification, missing-row, and query-failure cases.

## Comparison With DAEDALUS

DAEDALUS's refreshed result accurately names source `c84464f8` throughout and
describes the correction's scope and limits. ARGUS independently inspected all
four source paths, reran the focused suites and static gates, and repeated the
reversible hosted projection matrix. The submitted and independent results
agree:

- published and both restored states expose Salon search, thread search, new
  feed, featured feed, Persona context, and Persona events;
- private Institution, paused Salon, and private Salon states suppress all six;
- direct forum and public Institution aggregate controls close with the Salon;
- a visitor-tier Institution owner can still reach the delegated report queue;
  and
- cleanup restores the owner tier, Institution and Salon state, null Persona
  link, and zero disposable Persona/featured residue.

No Cloudflare, hosted-runtime architecture, queue, partner adapter, billing,
provider, schema, or unrelated UI behavior entered the correction.

## Validation

| Command or proof | ARGUS result |
| --- | --- |
| API/web deployment identity | Exact `c84464f810d5b40d2d08f92bb8c6c3b798d959c0` on both services |
| Migration `097` identity | SHA-256 `CFA04E4ACD528EEBFD7A3D8776DC20CB7E9A656F41D23FB3156025A47C06B825`; hosted ledger/exact ledger `1/1` |
| Source scope | Pass; helper, Discover callers, and two regression fixtures only |
| Hosted effective-principal matrix | Pass across all six projections and direct/aggregate controls |
| Visitor-tier Institution owner queue | Pass, `200` |
| Final hosted state | Salon/thread/reply `1/1/1`; Space version/audit `8/8`; fixture/report/browser RPC `0/0/0` |
| Post-finally correction residue | Persona/featured/link `0/0/0`; owner tier `private` |
| `test:community` | Pass, `59/59` |
| `test:personas` | Pass, `18/18` |
| `test:institution-community` | Pass, `18/18` |
| Root typecheck; web lint | Pass; zero lint warnings/errors |

DAEDALUS's broader frozen-install, neighboring-suite, and root-build receipts
remain submitted evidence. ARGUS did not rerun unchanged neighboring suites or
the build after the focused correction gates and decisive hosted proof passed.

## Baton

ARIADNE owns the already specified independent PR541 owner/member/signed-out
human rehearsal at exact source `c84464f8`. Preserve migration `097`, retained
content, and final restoration; report a public-safe pass or exact blocker, then
wake MIMIR. Do not open PR542 from this acceptance.
