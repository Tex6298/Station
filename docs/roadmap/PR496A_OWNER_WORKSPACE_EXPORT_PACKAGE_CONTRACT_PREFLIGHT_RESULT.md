# PR496A - Owner Workspace Export Package Contract Preflight Result

Date: 2026-07-06

Owner: ARGUS / A3

Result:

```text
ACCEPT_PR496A_OWNER_WORKSPACE_EXPORT_PACKAGE_CONTRACT
```

## ARGUS Verdict

ARGUS accepts the smallest safe real workspace package contract: an
authenticated owner-only `workspace_manifest` export package stored in the
existing `export_packages` pattern.

This is safe only as a high-level account/workspace inventory manifest. It is
not a private archive bundle, original-file package, managed backup, restore
workflow, PDF, binary archive, share link, signed URL, background job, public
download, or public export surface.

The current database/package truth only allows `persona_archive`,
`developer_space_archive`, and `project_manifest`, with exclusive target
constraints. A real workspace package cannot honestly reuse one of those kinds.
PR496A may therefore include one narrow schema/package-kind migration.

## Exact DAEDALUS Scope

Allowed files:

- `infra/supabase/migrations/070_workspace_export_manifest.sql`
- `packages/db/src/types.ts`
- `packages/types/src/export.ts`
- `apps/api/src/services/operational-quota.service.ts`
- `apps/api/src/routes/exports.ts`
- `apps/api/src/routes/exports.test.ts`
- `apps/web/components/studio/export-workspace.tsx`
- `apps/web/app/studio/export/page.tsx` only if the route wrapper needs type or
  prop wiring
- `apps/web/lib/export-trust.ts`
- `apps/web/lib/export-trust.test.ts`
- `apps/web/lib/studio-navigation.ts` and
  `apps/web/lib/studio-navigation.test.ts` only for honest `/studio/export`
  route labels
- `apps/web/lib/station-assistant-ui.ts` and
  `apps/web/lib/station-assistant-ui.test.ts` only for owner-safe export route
  label/copy checks
- `apps/api/src/services/station-assistant.service.ts` and its test only if the
  existing assistant export action copy would become dishonest after the new
  workspace manifest route exists
- focused roadmap/result docs

Do not touch public routes, public chat, billing, Stripe, provider/model
runtime, prompts, Archive connector pulls, OAuth/API credentials, Redis,
Cloudflare, workers, queues, recurring jobs, social posting, broad Studio shell
styling, global CSS, unrelated navigation, package metadata, deployment config,
or unrelated product polish.

## Schema And Package Kind

Add a new export package kind:

```text
workspace_manifest
```

The migration may only:

- expand `export_packages_kind_check` to include `workspace_manifest`;
- expand `export_packages_target_check` so `workspace_manifest` requires
  `persona_id`, `developer_space_id`, and `project_id` all to be `null`;
- update `export_packages_all_owner` so workspace rows are accessible only when
  `auth.uid() = owner_user_id`, `package_kind = 'workspace_manifest'`, and all
  target columns are null;
- add an owner/kind/created index for workspace package listing if useful.

No new table, storage bucket, signed URL, file-storage architecture, public
policy, anonymous policy, retention/expiry behavior, queue table, worker, or
background-job contract is accepted.

## API Contract

Add owner-authenticated routes under the existing `/exports` router before the
generic `/:id` route:

```text
GET /exports/workspace
POST /exports/workspace
```

Accepted behavior:

- both routes require `requireAuth`;
- `GET` lists only the signed-in owner's `workspace_manifest` rows;
- `POST` creates one owner-only workspace manifest package;
- the package row uses `package_kind = "workspace_manifest"`, format
  `json_markdown`, target columns null, and bounded included sections;
- in-progress duplicate workspace packages for the same owner are blocked by
  the existing operational quota pattern;
- completed package readback uses existing `GET /exports/:id`;
- bundle readback uses existing `GET /exports/:id/bundle`;
- workspace bundle readback must reject non-completed or malformed stored
  workspace manifests with bounded `409` copy, matching the Project manifest
  readback posture;
- responses and errors must not echo SQL/table names, stack traces, storage
  paths, hosted URLs, provider payloads, cookies, tokens, headers, owner ids, or
  secret-shaped values.

Suggested helper names:

- `WORKSPACE_INCLUDED_SECTIONS`
- `buildWorkspaceExportManifest(ownerUserId, packageId)`
- `buildWorkspaceManifestMarkdown(manifest)`
- `hasStoredWorkspaceManifestReadback(row)`
- `createWorkspaceExportPackage(ownerUserId)`

Do not create a public route, anonymous download, share URL, signed URL,
package URL, cross-owner lookup, restore action, delete/cancel workflow,
scheduled job, or package file stored outside the existing JSON/Markdown
readback response.

## Allowed Manifest Sections

The canonical manifest schema should be:

```text
station.workspace.export_manifest.v1
```

Allowed top-level sections:

- `schema`
- `generatedAt`
- `package`
- `counts`
- `workspaceInventory`
- `trust`
- `excludedMaterial`
- `futureMaterial`

Allowed `package` fields:

- current workspace package id;
- status;
- format;
- package kind.

Allowed `counts` and `workspaceInventory` material:

- aggregate counts for personas, Spaces, Developer Spaces, Projects,
  public/published document references, and existing export package classes;
- persona inventory with display name, visibility, short description, public
  href only when a public slug is available, public chat flags if already
  owner-facing, and created/updated timestamps;
- Space inventory with title, slug, `isPublic`, short description, public href
  for public Spaces, and created/updated timestamps;
- Developer Space inventory with project name, slug, visibility,
  visualisation type, high-level linked Project name/slug when already owned,
  and created/updated timestamps;
- Project inventory with name, slug, visibility, description, and
  created/updated timestamps;
- public/published document references with title, slug, document type,
  published timestamp, public href, and public Space title/slug;
- existing export package class counts grouped by package kind and status, plus
  latest requested/completed timestamps by class.

Allowed `trust` notes:

- owner-only package;
- public copies remain separate from private source rows;
- document bodies omitted;
- private source bodies omitted;
- original files omitted;
- storage paths and signed URLs omitted;
- no public export access;
- no managed backup/restore guarantee.

Allowed `excludedMaterial` and `futureMaterial` sections must be descriptive
labels only. They may name omitted classes such as raw private archive bodies,
chat transcripts, original uploaded files, PDFs, binary archives, managed
backups, restore drills, share URLs, and signed URLs. They must not include
examples containing real private content or secret-shaped values.

## Forbidden Manifest Sections

The workspace manifest must not include:

- owner user ids;
- persona ids, Space ids, Developer Space ids, Project ids, document ids,
  discussion ids, source ids, storage ids, or other raw internal ids, except
  the current export package id already exposed by existing owner package
  readback;
- package ids for other export packages;
- SQL/table names or database constraint details;
- storage paths, bucket names, signed URLs, package download URLs, private
  hosted URLs, cookies, tokens, headers, IP/user-agent values, provider keys,
  encrypted secret blobs, key hashes, last-four key material, webhook signing
  secrets, prompts, completions, provider payloads, or secret-shaped strings;
- persona awakening prompts, style notes, long private profile copy, memory
  content, canon content, continuity candidate content/rationale/source message
  ids, continuity record body/source ids/source labels, integrity transcripts,
  extracted private rules, archived chat transcript text or private summaries,
  import source names or error traces, original file names when they reveal
  private source material, storage paths, moderation report notes, or raw report
  target ids;
- Developer Space raw nodes, events, snapshots, raw ingestion data,
  provider policy internals, API key fields, runtime logs, observatory payloads,
  or webhook data;
- Project owner evidence private refs, linked source rows, collaborator/member
  rows, connection tier claims, or private document relationships;
- document bodies, document version bodies, private/draft/unlisted/community
  document refs, source labels, source types, source ids, source persona ids,
  discussion thread ids, or comments;
- public route changes, public export state, restore claims, background job
  claims, retention/expiry claims, redundancy claims, disaster-recovery claims,
  PDF/binary/print/Station Press output, billing, Stripe, provider/model calls,
  Redis, Cloudflare, queues, workers, recurring jobs, Archive connector pulls,
  OAuth/API credential flow, or external integrations.

## Required Tests

API tests in `apps/api/src/routes/exports.test.ts` must prove:

- signed-out `GET /exports/workspace` and `POST /exports/workspace` fail
  closed;
- an owner can create, list, read, and bundle a completed `workspace_manifest`;
- package row targets are all null and `packageKind` is
  `workspace_manifest`;
- duplicate in-progress workspace creation for the same owner is quota-blocked,
  while completed prior packages do not block a new request;
- cross-owner readback and bundle reads return `404`;
- non-completed and malformed stored workspace manifests return bounded `409`
  for bundle readback;
- storage/query/manifest-source failures leave a failed owner-visible package or
  return bounded copy without SQL/table/stack details;
- content summary counts match the high-level inventory;
- manifest and Markdown contain only allowed sections;
- bundle files are `README.md`, `manifest.json`, and `manifest.md` with
  integrity hashes;
- no owner ids, raw internal ids, other package ids, document bodies, source
  ids, storage paths, signed URLs, hosted URLs, provider payloads, prompts,
  tokens, cookies, key hashes, last-four key values, stack traces, SQL details,
  private snippets, or secret-shaped values leak.

Web/helper tests must prove:

- `/studio/export` exposes workspace manifest create/list/readback controls only
  on the signed-in owner surface;
- visible copy says owner-only manifest package, not full archive, backup,
  restore, PDF, binary, public download, share link, signed URL, background job,
  or launch-ready export;
- the existing live package classes remain visible and distinct from the new
  workspace manifest package;
- future/unavailable rows still name original files, PDF/binary, Station Press,
  managed backup, restore drills, share URLs, and signed URLs as out of scope;
- failure/empty/loading states are bounded and do not echo private source or
  infrastructure details;
- Station Assistant/navigation copy remains owner-safe if touched.

Required validation for DAEDALUS:

```powershell
npm exec --yes pnpm@10.32.1 -- run test:exports
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- run lint
git diff --check
git diff --cached --check
```

## Hosted Proof Required After ARGUS Review

ARIADNE hosted proof is required after ARGUS accepts the implementation because
PR496A changes schema/RLS, owner API behavior, and visible `/studio/export`
behavior.

Hosted proof must cover:

- migration `070_workspace_export_manifest.sql` applied;
- `workspace_manifest` kind and null-target check exist;
- owner-only RLS holds and no public/anonymous export package policy exists;
- owner can create/list/read/bundle one workspace manifest from
  `/studio/export`;
- signed-out and cross-owner reads fail closed;
- desktop and mobile `/studio/export` show the workspace manifest package
  without overlap or overclaim;
- bundle content has only the three accepted files and high-level inventory;
- no raw/private/source/secret/runtime/storage/provider/billing/queue/
  Cloudflare/share URL/PDF/binary/backup/restore material leaks.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| Hostile preflight review | Pass | Reviewed PR483/PR483A export scope truth, PR496 resume packet, existing export API/routes/tests, export package migrations/RLS/types, bundle readback, quota guard, `/studio/export` helper/UI, and Station Assistant/navigation entry points. |
| `npm exec --yes pnpm@10.32.1 -- run test:exports` | Pass | 7 current export API tests passed before PR496A implementation. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 190 Studio UI/helper tests passed before PR496A implementation. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typechecks replayed from cache. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass | Web lint replayed from cache with no warnings or errors. |

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARGUS accepts PR496A as ACCEPT_PR496A_OWNER_WORKSPACE_EXPORT_PACKAGE_CONTRACT.
- Build only an authenticated owner-only workspace_manifest package in the existing export_packages pattern.
- A narrow migration 070 is allowed because current package-kind/target constraints cannot honestly store a workspace package.
- Manifest content must be high-level inventory only: personas, Spaces, Developer Spaces, Projects, public/published document refs, export package class counts, trust notes, and excluded/future material.
- Do not include private bodies, raw ids, source ids, storage paths, signed URLs, share links, original files, PDF/binary output, backups, restore claims, provider/runtime work, Redis, Cloudflare, workers, queues, billing, Stripe, Archive connector pulls, or public export access.
Task:
- Implement the exact schema/API/web/type/test/doc scope in docs/roadmap/PR496A_OWNER_WORKSPACE_EXPORT_PACKAGE_CONTRACT_PREFLIGHT_RESULT.md.
- Add GET/POST /exports/workspace before /exports/:id, workspace manifest/bundle validation, and /studio/export owner controls with bounded copy.
- Run test:exports, test:studio-ui, typecheck, lint, git diff --check, and git diff --cached --check.
- Expect ARIADNE hosted proof after ARGUS review.
```
