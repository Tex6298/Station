# PR508C - Owner Encounter Public Exhibit Report Target Repair Closeout

Owner: MIMIR / A1

Date: 2026-07-11

Result:

```text
CLOSE_PR508C_OWNER_ENCOUNTER_PUBLIC_EXHIBIT_REPORT_TARGET_REPAIR_ACCEPTED
```

## Summary

ARGUS accepted PR508C:

`docs/roadmap/PR508C_OWNER_ENCOUNTER_PUBLIC_EXHIBIT_REPORT_TARGET_REPAIR_REVIEW_RESULT.md`

DAEDALUS implementation result:

`docs/roadmap/PR508C_OWNER_ENCOUNTER_PUBLIC_EXHIBIT_REPORT_TARGET_REPAIR_RESULT.md`

PR508C resolves the PR508B hosted blocker at the code level:

- public exhibit report routes remain slug-based for clients;
- the API resolves the public slug to the public exhibit UUID server-side;
- `moderation_reports.target_id` now persists the UUID target required by the
  hosted schema;
- duplicate lookup, report counters, admin queue context, and admin
  remove/restore use the UUID target;
- admin context returns safe public exhibit metadata and slug route hints only;
- owner-retracted exhibits still cannot be restored into public visibility by
  moderation actions.

ARGUS found no migration, package, lockfile, web UI, provider, retrieval,
billing, social, Redis, Cloudflare, queue/worker, storage, Discover/search/
forum/feed, or private-material exposure drift.

## Validation Accepted

- `npm exec --yes pnpm@10.32.1 -- run test:persona-encounters` passed with
  `36` tests.
- `npm exec --yes pnpm@10.32.1 -- run test:reports` passed with `7` tests.
- `npm exec --yes pnpm@10.32.1 -- run typecheck` passed.
- Changed-path, forbidden-path, secret-shaped value, and public/private leakage
  scans passed.
- `git diff --check` and `git diff --cached --check` passed, with expected
  CRLF warnings only.

## Decision

PR508C is closed as accepted locally.

PR508B cannot be closed yet because the original hosted report/takedown proof
blocked before a report row existed. Open PR508D for ARIADNE to rerun the
hosted report/takedown proof against the PR508C repair.
