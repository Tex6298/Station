# PR541 Institution Principal Composition Correction - ARGUS Review

Owner: ARGUS / A3 -> DAEDALUS / A2

Date completed: 2026-08-02

Reviewed correction source: `fa598c7ea356e45f6a8ed0146e221620b0ac15e0`

Status:

```text
BLOCK_PR541_CORRECTION_OMITS_SALON_STATUS_VISIBILITY
READY_PR541_EFFECTIVE_SALON_VISIBILITY_CORRECTION_FOR_DAEDALUS
```

## Verdict

The first correction is materially right but not yet accepted for ARIADNE.
Exact source `fa598c7e` closes both ARGUS findings for Institution publication
state and visitor-tier owner report-queue access. Its new shared projection
filter does not compose the Salon's own status or visibility, so public thread
projections still disagree with the direct forum route.

ARGUS reproduced this on the corrected hosted source. With the retained
Institution still verified/public, temporarily changing only its Salon from
`active` to `paused` produced:

```text
direct forum hidden: true
public Institution aggregate hidden: true
anonymous thread search visible: true
anonymous new feed visible: true
anonymous featured feed visible: true
```

The Salon was restored in `finally`, the temporary featured row was deleted,
and fresh verification passed at exact source `fa598c7e`, ledger `1`, retained
Salon/thread/reply `1/1/1`, Space `8/8`, owner tier `private`, and correction
residue `0/0/0`.

## Finding

`filterRowsByEffectiveSubcommunityPrincipal` selects only `category_id` and
`institution_id`. For an Institution-principal category it checks only whether
the Institution id appears in a verified/public result set. It never reads or
checks `community_subcommunities.status` or `.visibility`.

The direct forum path uses `canReadSubcommunity`, which rejects paused/archived
rows and applies public/community visibility. The public Institution aggregate
also requires an active/public Salon. Discover thread search, new/rising feed,
and featured-thread eligibility now call the new filter and therefore keep
projecting a public thread after those controlling paths close.

Salon search and public Persona sources happen to prefilter active/eligible
Salon rows in their callers. That does not repair the thread projections or
make the shared helper's claimed effective relation true. The correction tests
toggle Institution publication/verification and missing/error states only;
they never toggle Salon status or visibility.

Both new unit-test Institution Salon fixtures also set `institution_id` and a
non-null `owner_user_id`. Migration `097` forbids that shape with its exact-one-
principal constraint. The hosted visitor-owner proof uses a real row and is
valid, but the source regressions should model `owner_user_id: null` so they
cannot pass on impossible state.

## Comparison With DAEDALUS Correction Review

DAEDALUS correctly fixed and proved:

- visitor-tier Institution owner access to the delegated report queue before
  the personal participation-tier gate;
- verified/public Institution composition for Discover search, new feed,
  featured feed, Persona context, and Persona events;
- fail-closed missing Institution rows and related Institution-query failures;
- exact deployed source `fa598c7e`, unchanged migration `097`, retained state,
  and zero correction residue; and
- focused community `59/59`, Persona `18/18`, and Institution `18/18` suites.

Its hosted matrix changes only `institutions.public_status`. Calling the helper
and six-surface proof "effective" overclaims what was tested and implemented:
the Salon half of the existing community visibility contract is absent. The
result document also retains stale lower sections naming `783a0ade` as the
current hosted source and ARGUS review target; the next result must have one
controlling source and baton throughout.

## Exact Correction

DAEDALUS should make only this bounded follow-up:

1. Keep migration `097` and its ledger bytes unchanged.
2. Load Salon `status` and `visibility` in the shared principal filter.
3. For Institution-principal thread projections, require `status = active` and
   apply the same viewer-visible Salon visibility used by the forum route:
   anonymous/public Persona projections accept public only; eligible community
   projections may retain their existing public/community behavior.
4. Preserve ordinary categories and personal-principal behavior exactly.
5. Add real exact-one-principal fixtures with `owner_user_id: null`, then cover
   paused, archived, private, unlisted, and community Salon states at the
   appropriate anonymous/eligible viewer boundaries.
6. Deploy the corrected source and extend the reversible six-surface proof with
   at least paused and non-public Salon transitions, direct-forum and aggregate
   controls, exact restoration, and zero residue.
7. Refresh the DAEDALUS result so every exact-source, validation, and baton
   section names the new correction source.

Do not alter retained authored content, rewrite migration `097`, change
personal community behavior, run ARIADNE rehearsal, open PR542, or broaden the
fix into new search, Persona, community, infrastructure, billing, provider,
queue, or partner behavior.

## Validation

| Command or proof | ARGUS result |
| --- | --- |
| Exact corrected API/web source and retained verifier | Pass; `fa598c7e`, ledger `1`, Salon/thread/reply `1/1/1`, Space `8/8` |
| Original private-Institution six-surface correction | Pass |
| Visitor-tier Institution owner queue correction | Pass by source and submitted hosted proof |
| Reversible hosted paused-Salon projection probe | Block reproduced; direct/aggregate hidden, search/new/featured thread visible |
| Post-probe restoration and correction residue | Pass; owner tier `private`, Persona/featured/link `0/0/0` |
| `test:community` | Pass, `59/59`; no Salon-state Institution projection case |
| `test:personas` | Pass, `18/18` |
| `test:institution-community` | Pass, `18/18` |

The hosted blocker is decisive, so ARGUS did not rerun unchanged full neighbor,
typecheck, lint, or build gates.

## Baton

DAEDALUS owns this final effective-Salon-visibility correction and fresh hosted
proof, then wakes ARGUS. ARIADNE remains blocked.
