# PR496A - Owner Workspace Export Package Contract Result

Owner: DAEDALUS / A2

Date: 2026-07-06

Status: Ready for ARGUS review

## Result

DAEDALUS implemented the accepted PR496A owner-only workspace manifest package
contract.

The new package kind is:

```text
workspace_manifest
```

It is stored in the existing `export_packages` pattern and exposed only through
authenticated owner routes.

## Implemented

- Added migration `070_workspace_export_manifest.sql`.
- Expanded export package DB/shared types to include `workspace_manifest`.
- Added owner-authenticated API routes:
  - `GET /exports/workspace`;
  - `POST /exports/workspace`.
- Added a high-level workspace manifest schema:
  - `station.workspace.export_manifest.v1`.
- Added stored bundle readback for completed workspace manifests through the
  existing `GET /exports/:id/bundle` route.
- Added `/studio/export` owner controls to create/list workspace manifest
  packages and read back the three bundle files.
- Updated export trust helpers so `workspace_manifest` is a live scoped package
  distinct from future full archive, PDF/binary, backup, restore, share-link,
  and signed-URL work.

## Manifest Shape

Allowed top-level sections:

- `schema`
- `generatedAt`
- `package`
- `counts`
- `workspaceInventory`
- `trust`
- `excludedMaterial`
- `futureMaterial`

The inventory is high-level only:

- persona display names, visibility, short descriptions, public href when a
  public slug exists, public chat flags, and timestamps;
- Space title, slug, public flag, short description, public href for public
  Spaces, and timestamps;
- Developer Space project name, slug, visibility, visualisation type, linked
  Project name/slug when already owned, and timestamps;
- Project name, slug, visibility, description, and timestamps;
- public/published document references with title, slug, document type,
  published timestamp, public Space title/slug, and public Space href;
- export package class counts grouped by package kind/status with latest
  requested/completed timestamps.

## Boundaries Kept

- No new table, bucket, file storage, signed URL, public route, anonymous route,
  retention/expiry behavior, queue table, worker, recurring job, or background
  job contract.
- No public export access, share URL, signed URL, PDF, binary archive, original
  file bundle, managed backup, restore workflow, Station Press output, billing,
  Stripe, provider/model/runtime, Redis, Cloudflare, worker, queue, Archive
  connector pull, OAuth/API credential, public chat, or broad Studio shell work.
- Workspace manifests do not serialize owner user ids, target ids, other package
  ids, document bodies, private/draft/unlisted/community refs, raw source ids,
  storage paths, provider payloads, prompts, tokens, cookies, stack traces, SQL
  details, memory/canon/continuity bodies, chat transcript text, original file
  names, raw Developer Space nodes/events/snapshots, or private Project evidence
  rows.

## Files Touched

- `infra/supabase/migrations/070_workspace_export_manifest.sql`
- `packages/db/src/types.ts`
- `packages/types/src/export.ts`
- `apps/api/src/services/operational-quota.service.ts`
- `apps/api/src/routes/exports.ts`
- `apps/api/src/routes/exports.test.ts`
- `apps/web/components/studio/export-workspace.tsx`
- `apps/web/lib/export-trust.ts`
- `apps/web/lib/export-trust.test.ts`
- `docs/roadmap/PR496A_OWNER_WORKSPACE_EXPORT_PACKAGE_CONTRACT_RESULT.md`
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/testing/VALIDATION_BASELINE.md`
- `docs/roadmap/LANE_INDEX.md`

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:exports` | Pass | 9 export API tests passed, including workspace create/list/read/bundle, cross-owner denial, malformed bundle guard, duplicate in-progress guard, and bounded source failure. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 190 Studio UI/helper tests passed, including workspace manifest owner controls and copy boundaries. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck passed. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass | Web lint passed with no warnings or errors. |
| `git diff --check` | Pass | CRLF normalization warnings only; no whitespace errors. |
| Diff-only scope scan | Pass | Changes stayed inside the accepted PR496A schema/API/types/web/helper/test/doc files. |

## Handoff

ARGUS should review directly.

Review focus:

- migration 070 kind/target/RLS shape;
- owner-only `/exports/workspace` behavior;
- stored workspace bundle validation and malformed-state `409` copy;
- absence of raw/private/source/storage/provider/runtime/billing/public-export
  leaks;
- `/studio/export` copy and controls staying honest about manifest-only scope.

Wakeup:

```text
WAKEUP A3:
Codename: ARGUS
```
