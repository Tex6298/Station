# PR496A - Owner Workspace Export Package Contract Review Result

Date: 2026-07-06

Owner: ARGUS / A3

Result:

```text
ACCEPT_PR496A_OWNER_WORKSPACE_EXPORT_PACKAGE_CONTRACT_IMPLEMENTATION
```

## ARGUS Verdict

ARGUS accepts the PR496A implementation with one narrow review patch applied.

The implementation matches the accepted lane: it adds a real owner-only
`workspace_manifest` package kind, a narrow migration/RLS branch, authenticated
owner workspace export routes, stored bundle validation, and bounded
`/studio/export` controls.

The workspace manifest remains high-level inventory only. It does not widen
scope into raw archive bodies, original files, storage objects, signed URLs,
public export access, background jobs, queues, Redis, Cloudflare, provider/model
runtime, billing, Stripe, Archive connector pulls, OAuth/API credentials,
backups, restore workflows, PDF/binary output, public chat, or broad Studio
shell work.

## ARGUS Patch

ARGUS applied a narrow review patch before accepting:

- `apps/api/src/routes/exports.ts` now uses a workspace-specific Markdown list
  helper for workspace manifest inventory rows instead of the persona/archive
  helper that prints an ID slot.
- `apps/api/src/routes/exports.test.ts` asserts workspace Markdown does not
  render `(undefined)` and does not expose owner/target id field names.
- `packages/types/src/export.ts` now models `workspace_manifest` packages as a
  sanitized package response without `ownerUserId` or target id fields, while
  scoped persona/Developer Space/Project packages keep their existing owner and
  target fields.

This patch keeps the API/runtime behavior narrow and only tightens the review
boundary around owner-level manifest readback.

## Review Notes

- Migration `070_workspace_export_manifest.sql` expands only the package kind
  and target constraints, adds the owner/workspace index, and recreates the
  existing owner policy with a null-target `workspace_manifest` branch.
- `GET /exports/workspace` and `POST /exports/workspace` sit before the generic
  `/:id` route and require the existing auth middleware.
- Workspace package rows are created with `package_kind = "workspace_manifest"`,
  format `json_markdown`, and null `persona_id`, `developer_space_id`, and
  `project_id` targets.
- Duplicate in-progress workspace manifests are blocked through the existing
  operational quota guard.
- Completed workspace manifests use existing owner package readback and a
  workspace-specific bundle validator that returns bounded `409` copy for
  non-completed or malformed stored readback.
- The manifest includes only allowed sections: `schema`, `generatedAt`,
  `package`, `counts`, `workspaceInventory`, `trust`, `excludedMaterial`, and
  `futureMaterial`.
- Inventory queries select only high-level fields and do not serialize owner
  ids, raw target ids, package ids for other packages, private document bodies,
  source ids, storage paths, provider payloads, prompts, tokens, cookies, SQL
  details, or stack traces.
- `/studio/export` creates/lists owner workspace manifest packages and displays
  only the accepted three bundle files, while copy keeps full archives,
  original files, PDF/binary, backup, restore, share-link, signed-URL, and
  background-job claims out of scope.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:exports` | Pass | 9 export API tests passed, including the ARGUS Markdown/type boundary assertion. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 190 Studio UI/helper tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck passed. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass | Web lint passed with no warnings or errors. |
| `git diff --check` | Pass | CRLF normalization warnings only; no whitespace errors. |
| `git diff --cached --check` | Pass | No staged whitespace errors. |

## Hosted Proof Required

Hosted ARIADNE proof is still required before MIMIR closes PR496A because this
lane changes schema/RLS, owner API behavior, and visible `/studio/export`
behavior.

Hosted proof should cover:

- migration `070_workspace_export_manifest.sql` applied;
- `workspace_manifest` kind and null-target check exist;
- owner-only RLS holds and no public/anonymous export package policy exists;
- owner can create/list/read/bundle one workspace manifest from
  `/studio/export`;
- signed-out and cross-owner reads fail closed;
- desktop and mobile `/studio/export` show the workspace manifest package
  without overlap or overclaim;
- bundle content has only `README.md`, `manifest.json`, and `manifest.md`;
- bundle content remains high-level inventory only, with no raw/private/source/
  secret/runtime/storage/provider/billing/queue/Cloudflare/share URL/PDF/
  binary/backup/restore material.

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS accepts PR496A as ACCEPT_PR496A_OWNER_WORKSPACE_EXPORT_PACKAGE_CONTRACT_IMPLEMENTATION.
- A narrow ARGUS patch removed workspace Markdown ID-slot drift and aligned the shared type with the sanitized workspace package response.
- Migration/RLS, owner-only API behavior, stored workspace bundle validation, high-level manifest inventory, /studio/export controls, and leak/overclaim boundaries passed local review.
- Hosted ARIADNE proof is still required because schema/RLS, owner API behavior, and visible /studio/export behavior changed.
Task:
- Close or route PR496A next according to MIMIR roadmap ownership.
- Expected next move is ARIADNE hosted proof for migration 070, owner create/list/read/bundle, signed-out/cross-owner denial, desktop/mobile /studio/export, three-file bundle content, and no raw/private/source/secret/runtime/storage/provider/billing/queue/Cloudflare/share/PDF/binary/backup/restore leakage.
```
