# PR540 Branded Public Institutional Space - DAEDALUS Result

Date: 2026-07-31

Status:

```text
READY_PR540_BRANDED_PUBLIC_INSTITUTIONAL_SPACE_FOR_ARGUS
```

## Result

DAEDALUS implemented PR540 at exact deployed source `02da4dbc`. Migration
`095` creates the one-to-one service-only `institution_spaces` boundary with
immutable Institution identity, bounded authored brand fields, optimistic
draft transitions, owner-only publication authority, durable actor labels,
and paired Institution audit resources.

The private workspace gives the Institution owner create/edit/publish controls
and active members a truthful read-only view. The public Institution route
preserves its exact minimal verified identity response until a Space is
published, then adds only the bounded brand, public Institution Projects, and
published Institution work attached to those public Projects. Related-query
failure fails closed.

## Hosted Proof

| Proof | Result |
| --- | --- |
| API/web Railway source | Ready on `main` at `02da4dbcec4b6f55b0cdcecafd4dd3d68038b6f1` |
| Migration identity | `095_institution_spaces`, ledger version `20260731200001`, SHA-256 `CDFE536350C8CE9D6A3A8721348C765A6A1FD1A9962E7DFC62BAA5F5DC9A5789` |
| Raw authority | Service RPCs `3`; browser RPC/table grants `0/0`; anonymous table read `401`, service read `200` |
| Owner/member boundary | Owner lifecycle pass; active member read-only; anonymous, invited, stale, removed, unrelated, and member writes denied |
| Optimistic concurrency | Stale version loses with `409`; no overwrite |
| Public aggregation | Draft/unpublished returns minimal identity; published returns exact brand plus retained public Project/publication |
| Dependency filtering | Publication retract removes only publication; private Project removes Project and dependent publication; restoration passes |
| Principal boundary | Verification revocation returns public `404` while private owner/member read remains; restoration passes |
| Retained state | One published Space at version/audit `5/5`; publication restored published at version `18` |
| Personal compatibility | Personal Space/document counts remain `3/29`; representative personal public document read passes |
| Cleanup | Tagged Auth/member residue `0/0` |
| Browser proof | Owner desktop, member dark `390px`, public desktop, public dark `375px`; zero horizontal overflow and truthful controls |

## Validation

Focused Institution Space tests pass `4/4`; Institution tests pass `16/16`.
Institution publication `4/4`, Project `33/33`, Space `11/11`, writing `35/35`,
community `57/57`, auth `24/24`, profile boundary `5/5`, Developer Space
`61/61`, and exports `15/15` all pass. Frozen install, lint, and typecheck pass.

The root build compiles, validates types, and generates `42/42` pages before
the known local Windows standalone-output symlink copy fails with `EPERM`.
Railway builds and serves the exact source successfully.

## Review Baton

ARGUS owns independent source and hosted-state review. PR540 is not accepted or
closed by this result, and PR541 is not authorized here.
