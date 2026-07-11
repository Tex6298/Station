# PR513C - Cross-Owner Runtime Attempt Append-Only Trigger Repair

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Status: Open

## Purpose

Repair the hosted PR513B append-only audit failure:

`docs/roadmap/PR513B_CROSS_OWNER_RUNTIME_ATTEMPT_AUDIT_HOSTED_PROOF_RESULT.md`

Hosted migration `078` created only the delete append-only trigger because the
update/delete trigger names collided after PostgreSQL identifier truncation.

## Required Repair

Implement a narrow trigger-name repair:

- add a new migration, likely `079`, that drops the truncated/collided trigger
  name if present and creates two short, distinct triggers:
  - one `BEFORE UPDATE`;
  - one `BEFORE DELETE`;
- use trigger names safely under PostgreSQL's 63-byte identifier limit;
- patch migration `078` so future fresh installs use the short non-colliding
  trigger names from the start;
- add focused tests that prove the migration source contains distinct update and
  delete trigger names and no overlong append-only trigger names;
- preserve the existing trigger function and append-only semantics.

Suggested names are intentionally short:

```text
pe_co_rt_attempts_no_update
pe_co_rt_attempts_no_delete
```

You may choose equivalent short names, but they must be distinct and under 63
bytes.

## Non-Scope

Do not add or change:

- provider-backed preview;
- provider calls;
- prompt assembly;
- generated words;
- token usage or token transactions;
- private sessions;
- public exhibits;
- reports;
- memory, canon, archive, continuity, export, jobs, queues, storage, public
  rows, or public surfacing;
- API behavior except tests/readback needed to prove the repair;
- RLS policy semantics except if needed to preserve existing behavior;
- package, lockfile, billing, provider/retrieval, Redis, Cloudflare, worker,
  webhook, deployment, browser/UI scope.

## Required Validation

Run:

```text
npm exec --yes pnpm@10.32.1 -- run test:persona-encounters
npm exec --yes pnpm@10.32.1 -- run test:reports
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
git diff --cached --check
```

Also run changed-path, forbidden-path, forbidden side-effect, and secret-shaped
diff scans.

## Review Path

Wake ARGUS after implementation.

If ARGUS accepts PR513C, MIMIR should apply hosted migration `079`, verify both
short triggers exist and fire, then route ARIADNE for a PR513D hosted rerun.

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARIADNE failed PR513B hosted proof on a narrow append-only trigger boundary.
- Hosted has the delete trigger and rejects delete, but the update trigger is missing and direct update succeeded.
- Root cause appears to be PostgreSQL identifier truncation/collision between the long update/delete trigger names in migration 078.
Task:
- Implement PR513C as a narrow trigger-name repair.
- Add migration 079 to drop the collided hosted trigger name if present and create two short distinct BEFORE UPDATE/BEFORE DELETE append-only triggers.
- Patch migration 078 so fresh installs use the same short non-colliding trigger names.
- Add focused tests for distinct under-63-byte trigger names and append-only source shape.
- Preserve all PR513A boundaries: no provider calls, prompts, generated words, token rows, private sessions, public exhibits, reports, memory/canon/archive/continuity/export/jobs/storage/public rows, package/deploy/UI/provider/retrieval/Redis/Cloudflare/billing drift.
- Run required validation and wake ARGUS with implementation result.
```
