# PR540 Branded Public Institutional Space - ARGUS Review

Owner: ARGUS / A3 -> DAEDALUS / A2

Date completed: 2026-07-31

Reviewed source: `02da4dbcec4b6f55b0cdcecafd4dd3d68038b6f1`

Status:

```text
BLOCK_PR540_NULL_AUTHORITY_AND_CONCURRENCY_GUARDS_FAIL_OPEN
READY_PR540_FAIL_CLOSED_DATABASE_AND_PUBLISH_TRUTH_CORRECTION_FOR_DAEDALUS
```

## Verdict

PR540 is not accepted for rehearsal. The deployed source, exact migration
ledger, retained state, public aggregation, effective raw-access boundary,
focused tests, neighboring tests, and supplied responsive evidence largely
pass. Two frozen-contract failures remain: the new database transitions fail
open for null authority/concurrency inputs, and the private DTO advertises a
publish action when Institution principal state makes publication impossible.

ARGUS made no hosted mutation. The retained Space remains published at
version/audit `5/5`, both Railway services remain on `02da4dbc`, and disposable
Auth/member residue remains `0/0`. ARIADNE must not begin the `5/5 -> 8/8`
rehearsal until a corrected source and hosted state receive independent review.

## Findings

### 1. Blocker: database guards fail open on null inputs

Migration `095` uses nullable SQL comparisons in all three service-only
functions:

- `owner_user_id <> p_actor_user_id`;
- `version <> p_expected_version`; and
- `p_action not in ('publish','unpublish')`.

In PostgreSQL these expressions evaluate to null when the corresponding input
is null. A PL/pgSQL `if` rejects only true, so null skips the intended failure
branch. ARGUS executed the exact checked-in migration in disposable PostgreSQL
and proved all of the following:

```text
null actor create: succeeded
null actor edit: edited
null expected version edit: edited
null actor publish: published
null action plus null expected version: unpublished
hosted writes: 0
```

Browser roles still have zero effective table/RPC authority, and the current
API schemas reject these nulls. This is therefore not claimed as an anonymous
browser exploit. It is still a database authority and optimistic-concurrency
failure: the functions are explicitly trusted to enforce owner-only writes and
versioned transitions even when a service caller is defective or reused.

### 2. Blocker: `canPublish` is not principal-truthful

The private serializer sets `canPublish` from owner role plus draft status
only. The database publish transition additionally requires the Institution to
be both verified and public. An owner viewing a draft while the Institution is
unverified or private therefore receives `canPublish: true` and an enabled
Publish control that can only fail.

The correction must derive `canPublish` from all three conditions and add a
focused regression for unverified and private Institution states. Creation and
draft editing may remain available; only the impossible publish action is at
issue.

## Comparison With MIMIR Review

MIMIR's fallback review correctly recorded:

- exact API/web source `02da4dbc` and migration SHA-256
  `CDFE536350C8CE9D6A3A8721348C765A6A1FD1A9962E7DFC62BAA5F5DC9A5789`;
- one exact migration ledger row and one retained published Space at `5/5`;
- zero direct browser grants, zero fixture residue, and personal Space/document
  counts `3/29`;
- the strict signed-out DTO keys with one public Project and one publication;
- focused tests, typecheck, lint, and the four public-safe responsive views; and
- no source or hosted drift in those observed surfaces.

ARGUS independently strengthened the ACL proof and confirmed zero effective,
including inherited, browser table privileges and RPC execution. Trusted
`service_role` retains exactly seven effective table privileges and three RPC
execution privileges.

The MIMIR review overclaimed that the RPCs repeat owner checks inside the
database, that writes are optimistic-versioned in all cases, that the owner is
the only database writer/publisher, and that controls are truthful. Its tests
did not exercise null database inputs or a draft under an unverified/private
Institution. Marty's explicit return of the review baton to ARGUS supersedes
that fallback acceptance; the evidence remains useful, but its verdict does
not authorize rehearsal.

## Exact Correction

DAEDALUS should make only this bounded correction:

1. Do not edit the bytes or ledger identity of applied migration `095`. Add an
   append-only corrective migration that replaces the three Space functions.
2. Reject a null actor explicitly and compare owner identity with null-safe
   semantics in create, edit, and transition.
3. Reject a null expected version explicitly before any edit/transition and
   use null-safe version comparison.
4. Reject a null or unknown transition action before selecting either branch.
5. Add actual-engine regressions proving every null case returns a bounded
   failure with zero Space/version/audit drift, while valid owner lifecycle and
   stale-version behavior still pass.
6. Make `canPublish` require owner, draft, verified Institution, and public
   Institution state; test both unavailable principal states.
7. Deploy only the corrected source and append-only migration, then prove exact
   ledger/catalog/effective ACL identity, retained `5/5`, zero residue, and the
   required focused/neighbor matrix before waking ARGUS.

Do not run the ARIADNE rehearsal, alter retained authored content, open PR541,
or broaden this correction into publication, Project, personal Space,
community, audit UI, billing, provider, or infrastructure work.

## Validation

| Command or proof | ARGUS result |
| --- | --- |
| Checked migration SHA-256 | Pass; `CDFE536350C8CE9D6A3A8721348C765A6A1FD1A9962E7DFC62BAA5F5DC9A5789` |
| Disposable exact-migration null-input proof | Block reproduced; five fail-open outcomes, hosted writes `0` |
| Read-only hosted effective ACL/catalog audit | Pass; browser table/RPC `0/0`, trusted table/RPC `7/3`, RLS `1`, policies `0` |
| Hosted source/ledger/retained/residue audit | Pass; exact source, ledger `1`, Space `1`, version/audit `5/5`, residue `0/0` |
| Signed-out DTO/raw access | Pass; strict keys, Project/publication `1/1`, leak keys `0`, anonymous table/private API `401/401` |
| `test:institution-spaces` / `test:institutions` | Pass, `4/4` and `16/16` |
| `test:institution-publications` / `test:projects` | Pass, `4/4` and `33/33` |
| Spaces/writing/community | Pass, `11/11`, `35/35`, and `57/57` |
| Auth/profile/Developer Spaces/exports | Pass, `24/24`, `5/5`, `61/61`, and `15/15` |
| API/web typecheck; web lint | Pass; zero lint warnings/errors |
| Owner/member/public supplied screenshots | Reviewed; role/layout/overflow claims reproduced visually |

ARGUS did not rerun the root build because the executable authority blocker is
already decisive. DAEDALUS's submitted `42/42` compile/page-generation receipt
remains evidence, with its documented Windows standalone symlink `EPERM`.

## Baton

DAEDALUS owns the append-only fail-closed correction and its hosted proof, then
wakes ARGUS. MIMIR and ARIADNE receive blocker awareness only; neither owns a
fallback acceptance or rehearsal while this result is active.
