# PR496B - Workspace Export Hosted Create Failure Review Result

Date: 2026-07-06

Owner: ARGUS / A3

Result:

```text
ACCEPT_PR496B_WORKSPACE_EXPORT_HOSTED_CREATE_FAILURE_REPAIR
```

## ARGUS Verdict

ARGUS accepts PR496B.

The defect was correctly classified as hosted schema drift: hosted staging had
not applied `infra/supabase/migrations/070_workspace_export_manifest.sql`, so
`workspace_manifest` rows failed at the insert boundary against the old
`export_packages` package-kind/target constraints and owner policy.

No API, web, runtime, provider, billing, queue, Cloudflare, public export,
backup/restore, PDF/binary, original-file, share-link, signed-URL, or broad
Studio shell change was required. The smallest safe fix was applying the
already-accepted migration 070 to hosted and adding local regression coverage
that the migration file carries the workspace kind, null-target branch, owner
index, and owner policy/check branch.

## Review Notes

- The PR496A route logic already created `workspace_manifest` rows with null
  persona/Developer Space/Project targets and bounded browser errors.
- The documented pre-fix hosted schema probe matches the observed defect:
  owner `GET /exports/workspace` could list, but owner `POST /exports/workspace`
  failed before a package row existed.
- The documented repair applied only migration 070 through the existing local
  pooler path and did not print credentials.
- The documented post-fix hosted proof covers signed-out list denial, owner
  create `201`, owner readback `200`, owner bundle `200`, and the accepted
  three bundle files: `README.md`, `manifest.json`, and `manifest.md`.
- The added local test is appropriately focused for repo regression: if
  migration 070 loses the `workspace_manifest` kind, null-target branch, owner
  workspace index, or owner policy/check branch, `test:exports` now fails.
- The readback/bundle boundary remains the accepted high-level inventory-only
  workspace manifest. No raw owner ids, target ids, private bodies, source ids,
  storage paths, provider payloads, prompts, tokens, cookies, SQL details, stack
  traces, public export routes, signed/share URLs, backup/restore claims, or
  PDF/binary/original-file package behavior entered scope.

ARGUS did not apply a code patch for PR496B.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| PR496B review | Pass | Reviewed PR496A hosted defect, PR496B routing, DAEDALUS result, migration 070 shape, focused regression, and hosted-proof claims. |
| `npm exec --yes pnpm@10.32.1 -- run test:exports` | Pass | 10 export API tests passed, including the migration 070 shape regression. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 190 Studio UI/helper tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API typecheck ran; web typecheck replayed from cache. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass | Web lint replayed from cache with no warnings or errors. |
| `git diff --check` | Pass | CRLF normalization warnings only; no whitespace errors. |
| `git diff --cached --check` | Pass | No staged whitespace errors. |

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS accepts PR496B as ACCEPT_PR496B_WORKSPACE_EXPORT_HOSTED_CREATE_FAILURE_REPAIR.
- Root cause was hosted schema drift: migration 070 was not applied, so workspace_manifest inserts hit old export_packages constraints/policy.
- The repair stayed minimal: apply existing migration 070 to hosted and add focused migration-shape regression coverage.
- Local validation passed: test:exports, test:studio-ui, typecheck, lint, git diff --check, and git diff --cached --check.
- DAEDALUS-documented hosted proof now covers signed-out list denial, owner create/read/bundle success, exactly README.md/manifest.json/manifest.md, and no raw id/owner-target key leakage in readback/bundle.
Task:
- Close or route the PR496B/PR496A hosted workspace export lane according to MIMIR roadmap ownership.
```
