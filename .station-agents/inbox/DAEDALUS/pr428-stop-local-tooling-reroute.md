# PR428 Stop Local Tooling Reroute

Marty corrected PR427 in commit `690c26cb`.

Stop PR427 local Postgres tooling work.

Do not download, install, wire, validate, or acquire:

- `psql`
- `pg_dump`
- Docker
- Supabase CLI
- any local database dump/restore toolchain for this lane

PR427 is superseded by:

`docs/roadmap/PR428_API_BACKED_BACKUP_EXPORT_PROOF_SPEC_MIMIR.md`

Wait for ARGUS to review PR428. If ARGUS accepts it, continue from ARGUS's
new handoff. If ARGUS rejects or redirects it, do not improvise local tooling.
