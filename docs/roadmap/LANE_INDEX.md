# Station Lane Index

Date opened: 2026-06-28

Owner: MIMIR / A1

Purpose: keep the active lane readable from outside the agent threads. This is
an index only; `docs/roadmap/ACTIVE_STATUS.md` remains the fuller operational
log.

## Current Lane

| Lane | Name | Owner | State | Source |
| --- | --- | --- | --- | --- |
| PR428 | API-backed backup/export proof | DAEDALUS / A2 | Open - implement proof | `docs/roadmap/PR428_API_BACKED_BACKUP_EXPORT_PROOF_DAEDALUS.md` |

## Recently Closed

| Lane | Name | Owner chain | State | Closeout |
| --- | --- | --- | --- | --- |
| PR428 spec | API-backed backup/export proof spec | MIMIR -> ARGUS | Accepted with persona, Developer Space, and Project export classes required | `docs/roadmap/PR428_API_BACKED_BACKUP_EXPORT_PROOF_SPEC_RESULT.md` |
| PR427 | Backup/restore local tooling acquisition | ARGUS -> MIMIR | Superseded by Marty correction in `690c26cb`; do not acquire local tooling | `docs/roadmap/PR427_BACKUP_RESTORE_LOCAL_TOOLING_DAEDALUS.md` |
| PR427 preflight | Backup/restore local tooling preflight | MIMIR -> ARGUS | Accepted local tooling path | `docs/roadmap/PR427_BACKUP_RESTORE_LOCAL_TOOLING_PREFLIGHT_RESULT.md` |
| PR426 | Post-observability next-lane selection | DAEDALUS -> MIMIR | Complete | `docs/roadmap/PR426_POST_OBSERVABILITY_NEXT_LANE_SELECTION_RESULT.md` |
| MCA-OBS-01 | Memory/Continuity/Archive observability | DAEDALUS -> ARGUS -> ARIADNE -> MIMIR | Passed human-eye gate | `docs/roadmap/FEATURE_MEMORY_CONTINUITY_ARCHIVE_OBSERVABILITY_ARIADNE_RERUN_RESULT.md` |
| PROD-PROJECT-ERR-01 | Project route error responses | DAEDALUS -> ARGUS -> MIMIR | Accepted | `docs/roadmap/PRODUCTION_PROJECT_ERROR_RESPONSE_REVIEW_RESULT.md` |
| PROD-DEVSPACE-OPS-ERR-01 | Developer Space operations error responses | DAEDALUS -> ARGUS -> MIMIR | Accepted | `docs/roadmap/PRODUCTION_DEVELOPER_SPACE_OPERATIONS_ERROR_RESPONSE_REVIEW_RESULT.md` |

## Deferred Blockers

| Lane | State | Why Deferred | Resume Condition |
| --- | --- | --- | --- |
| Backup/restore local proof | Superseded for current lane | Marty corrected that local Postgres tooling is not the intended unblock. | Reopen only by explicit MIMIR/product decision. |

## Numbering Rule

- New mainline work gets a visible lane id before DAEDALUS, ARGUS, or ARIADNE
  starts it.
- Keep the id stable through implementation, review, rehearsal, and closeout.
- Use PR-style ids when continuing existing roadmap numbering; use short named
  ids only for one-off acceptance/closeout threads.
- Update this file when MIMIR opens, closes, parks, or reroutes the current
  lane.
