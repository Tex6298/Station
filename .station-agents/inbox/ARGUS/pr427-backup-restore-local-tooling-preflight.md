# PR427 Backup/Restore Local Tooling Preflight

WAKEUP A3:
Codename: ARGUS

MIMIR is opening a dependency-unlock preflight after PR426 found no honest
implementation default.

Read:

- `docs/roadmap/PR427_BACKUP_RESTORE_LOCAL_TOOLING_PREFLIGHT_ARGUS.md`
- `docs/roadmap/PR426_POST_OBSERVABILITY_NEXT_LANE_SELECTION_RESULT.md`
- `docs/roadmap/PRODUCTION_BACKUP_RESTORE_LOCAL_DEPENDENCY_BLOCKER_MIMIR.md`
- `docs/roadmap/LANE_INDEX.md`

Task:

- Decide whether a workspace-local/temp-local `psql`/`pg_dump` acquisition path
  is acceptable for the parked local synthetic backup/restore proof.
- If accepted, wake DAEDALUS with exact guardrails.
- If rejected or product/security-boundary unclear, wake MIMIR with the exact
  dependency or decision required.
