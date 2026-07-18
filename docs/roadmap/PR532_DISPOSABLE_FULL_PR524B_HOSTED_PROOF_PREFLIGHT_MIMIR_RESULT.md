# PR532 Disposable Full PR524B Hosted Proof Preflight Result

Date: 2026-07-18

Owner: MIMIR / A1 takeover

State:

```text
BLOCK_PR532_APPEND_ONLY_CASCADE_CLEANUP_CONTRACT
```

## Verdict

PR532 must not begin its hosted mutation sequence yet. The read-only operator
preflight proves the configured requester, counterparty, reporter, migration,
retained-corpus, route-source, Railway, and zero-residue gates are otherwise
ready, but four enabled append-only DELETE triggers make normal parent cleanup
unsafe.

No PR532 hosted mutation ran. The operator reports `mutatingCommandsRun: 0`,
five generated tables at zero rows, no active hosted writer, exact accepted
migration rows, exact retained PR528 evidence, and healthy idle Railway API/web
deployments on `main` at the expected product source.

## Blocker

The complete source/catalog audit found these enabled DELETE guards:

| Child table | Guarded parent cascade |
| --- | --- |
| `persona_encounter_cross_owner_consent_audit_events` | consent |
| `persona_encounter_cross_owner_runtime_attempts` | consent |
| `persona_encounter_cross_owner_generated_revision_approvals` | revision, artifact, consent, or approver profile |
| `persona_encounter_cross_owner_generated_publication_audits` | publication, consent, artifact, or revision |

Each child has one or more `ON DELETE CASCADE` foreign keys, while its current
trigger function unconditionally raises on DELETE. Direct child deletion is
correctly forbidden, but the same guard also fires when the product deletes a
persona and PostgreSQL cascades through consent/generated parents. Once PR532
creates audit and approval rows, cleanup can therefore return HTTP 500 and
leave the disposable fixture behind.

The consent trigger's checked-in 66-byte name is stored under PostgreSQL's
63-byte catalog form. The preflight binds that real truncated name rather than
mistaking identifier truncation for an absent guard.

## Superseded Readiness

An earlier read-only pass returned a provisional READY result before this
cleanup-contract audit was added. MIMIR superseded and archived that private
receipt before calling any mutating command. The final bound preflight checks
all four catalog guards and returns this BLOCK verdict.

## Validation

| Gate | Result |
| --- | --- |
| private operator syntax | Pass |
| final read-only hosted preflight | Blocked exactly on 4/4 unsafe delete guards |
| `test:persona-encounters` | Pass, 89/89 after the focused repair test |
| `test:reports` | Pass, 9/9 |
| `test:personas` | Pass, 18/18 |
| `@station/api typecheck` | Pass |
| DB package build | Pass |

## Disposition

Open PR532A as the smallest numbered unblock. It may change only the four
trigger functions: direct child UPDATE/DELETE must remain append-only, while a
DELETE caused by an already-absent `ON DELETE CASCADE` parent may complete.
ARGUS must review the migration before any hosted schema write. After accepted
hosted apply and catalog proof, PR532 resumes from a fresh read-only preflight.
