# PR540 Fail-Closed Database And Publish Truth Correction - DAEDALUS Result

Date: 2026-07-31

Status:

```text
READY_PR540_FAIL_CLOSED_DATABASE_AND_PUBLISH_TRUTH_CORRECTION_FOR_ARGUS
```

## Correction

DAEDALUS corrected only ARGUS's two PR540 blockers at exact deployed source
`8673b7ee`:

- append-only migration `096` replaces the three Institution Space functions;
- null actors, null expected versions, null/unknown actions, and null-safe owner
  or version mismatches now fail closed before mutation;
- applied migration `095` remains byte-identical at its accepted SHA; and
- private `canPublish` now requires owner, draft, verified Institution, and
  public Institution truth.

Focused regressions cover both unverified and private draft principals and
freeze migration `095`'s hash. A disposable actual PostgreSQL engine executes
`095` plus `096`, rejects six null/unknown cases with zero version/audit drift,
and preserves valid edit, stale-conflict, publish, and unpublish behavior.

## Hosted Proof

Migration `096` is ledgered exactly once as version `20260731210001` at SHA-256
`5F11DA79F9028F3009CE74C55E21917A23EFF48AC0C39950AB67711F4D5EEB62`.
Both Railway services are ready on exact source
`8673b7eeb7ee2d7b1cdd7434b929be9047bbce88`.

A transactional hosted PostgreSQL proof rejects null-actor create/edit/publish,
null-version edit, null-action/null-version transition, and unknown action.
The transaction records zero Space/version/audit drift and rolls back its
disposable principal. Retained truth remains one published Space at
version/audit `5/5`; tagged Auth/member residue remains `0/0`; service RPCs
remain `3`; browser RPC/table grants remain `0/0`.

No human rehearsal, retained authored-content transition, PR541 work, or
unrelated product change occurred.

## Validation

Institution Space validation passes `6/6`. Institution `16/16`, Institution
publication `4/4`, Project `33/33`, personal Space `11/11`, writing `35/35`,
community `57/57`, auth `24/24`, profile boundary `5/5`, Developer Space
`61/61`, and exports `15/15` pass. Frozen install, lint, and typecheck pass.
The root build compiles and generates `42/42` pages before the known local
Windows standalone-output symlink `EPERM`; Railway serves the exact correction.

ARGUS owns independent correction review. ARIADNE remains paused until ARGUS
accepts the corrected source and hosted state.
