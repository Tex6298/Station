# PR496B - Workspace Export Hosted Create Failure Result

Date: 2026-07-06

Owner: DAEDALUS / A2

Status: Ready for ARGUS review

Result:

```text
READY_FOR_ARGUS_REVIEW
```

## Root Cause

Hosted staging had not applied `infra/supabase/migrations/070_workspace_export_manifest.sql`.

Direct hosted schema inspection through the existing local `SUPABASE_POOLER_URL`
path showed:

- `export_packages.persona_id`, `developer_space_id`, and `project_id` were nullable;
- `export_packages_kind_check` still allowed only `persona_archive`,
  `developer_space_archive`, and `project_manifest`;
- `export_packages_target_check` still had no null-target `workspace_manifest`
  branch;
- `export_packages_all_owner` still had no owner-level `workspace_manifest`
  RLS branch.

So hosted `POST /exports/workspace` failed at the initial insert boundary before
inventory building, completion update, readback, or bundle validation could run.

## Fix

Applied the already-committed migration:

```text
infra/supabase/migrations/070_workspace_export_manifest.sql
```

No API contract or web behavior change was needed. The accepted PR496A route
logic was correct; hosted schema drift was the defect.

Added a focused local regression in `apps/api/src/routes/exports.test.ts` that
proves migration 070 carries:

- the `workspace_manifest` package kind;
- the null `persona_id` / `developer_space_id` / `project_id` target branch;
- the workspace owner index;
- the owner RLS policy/check branch.

## Hosted Verification

After applying migration 070:

| Check | Result |
| --- | --- |
| Hosted schema re-probe | Pass: constraints and owner policy include `workspace_manifest`. |
| Signed-out `GET /exports/workspace` | `401`. |
| Replay-owner auth | Pass. |
| Owner `GET /exports/workspace` before create | `200`, empty list. |
| Owner `POST /exports/workspace` | `201`. |
| Created package kind/status | `workspace_manifest`, `completed`. |
| Manifest schema | `station.workspace.export_manifest.v1`. |
| Owner `GET /exports/:id` | `200`, `workspace_manifest`. |
| Owner `GET /exports/:id/bundle` | `200`. |
| Bundle files | `README.md`, `manifest.json`, `manifest.md`. |
| Raw inventory id/key scan | No persona, Space, Developer Space, Project, or document ids appeared in readback/bundle; no owner/target keys were present. |

The bundle still contains the accepted trust/future-material labels that say
storage paths, signed URLs, share URLs, PDF/binary packages, backups, and
restore workflows are omitted or future work. Those are negative boundary
labels, not live export claims.

## Files Changed

- `apps/api/src/routes/exports.test.ts`
- `docs/roadmap/PR496B_WORKSPACE_EXPORT_HOSTED_CREATE_FAILURE_RESULT.md`
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/testing/VALIDATION_BASELINE.md`
- `docs/roadmap/LANE_INDEX.md`

## Validation

| Command | Result |
| --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:exports` | Pass: 10 tests. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass: 190 tests. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass. |
| `git diff --check` | Pass: CRLF normalization warnings only. |
| `git diff --cached --check` | Pass. |

## Handoff

ARGUS should review:

- that the hosted root cause classification is correct;
- that migration 070 is the only hosted schema repair applied;
- that the new migration-shape test is sufficient for local repo regression;
- that the hosted create/read/bundle proof stays inside the accepted owner-only,
  high-level inventory workspace manifest boundary.

Wakeup:

```text
WAKEUP A3:
Codename: ARGUS
```
