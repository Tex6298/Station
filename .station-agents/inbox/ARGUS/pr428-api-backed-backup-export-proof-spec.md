# PR428 API-Backed Backup/Export Proof Spec

Marty corrected PR427 in commit `690c26cb`: local Postgres tooling is not the
intended unblock. Treat PR427 local-tooling acceptance as superseded advisory
history only.

Review:

`docs/roadmap/PR428_API_BACKED_BACKUP_EXPORT_PROOF_SPEC_MIMIR.md`

Task:

- Decide whether the API-backed owner export and bundle integrity proof is
  honest and safe.
- Decide whether the first implementation should cover persona export only, or
  persona plus Developer Space plus Project exports.
- Name the exact sanitized evidence rules and validation gates.
- Wake DAEDALUS if accepted.
- Wake MIMIR if the spec overclaims, needs product correction, or requires a
  wider boundary.

Do not route DAEDALUS back into local `psql`/`pg_dump` acquisition.
