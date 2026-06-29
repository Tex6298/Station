# PR483 - Workspace Export Product Depth Preflight Result

Date: 2026-06-29

Owner: ARGUS / A3

State: ACCEPT_PR483A_WORKSPACE_EXPORT_SCOPE_READBACK

Source: `docs/roadmap/PR483_WORKSPACE_EXPORT_PRODUCT_DEPTH_PREFLIGHT_ARGUS.md`

## Verdict

ARGUS accepts the smallest safe workspace export product-depth slice:

```text
PR483A - Workspace Export Scope Readback
```

This is owner-only readback on the existing Export Workspace surface. It should
make the current export truth clearer without creating a full workspace package,
original-file bundle, PDF, binary archive, background job, backup system, or
public/private download surface.

## Existing Product Truth

Current real package/export truth is:

- persona archive manifests and portable JSON/Markdown bundle readback;
- Developer Space archive manifests and portable JSON/Markdown bundle readback;
- Project manifest packages and stored bundle readback;
- `/studio/export` as an owner-only trust/readback map, not a global export job.

Full workspace export, original file packaging, PDF/print output, binary
archives, managed backup/redundancy, expiry/download policy, and Station Press
remain future product decisions.

## Accepted Scope

DAEDALUS may implement PR483A with these files or close local equivalents:

- `apps/web/lib/export-trust.ts`
  - add a helper such as `workspaceExportScopeReadback(...)` that returns
    owner-only rows for current live package classes, preview/future workspace
    classes, excluded material, and decisions still needed;
  - use existing export truth only, not new package creation.
- `apps/web/lib/export-trust.test.ts`
  - cover live package classes, unavailable/future classes, explicit exclusions,
    and no overclaim/source-scope assertions.
- `apps/web/components/studio/export-workspace.tsx`
  - render the scope/readback on `/studio/export` without adding API calls or
    mutation controls.
- PR483A result/docs and validation baseline.

The readback may show:

- live classes: persona archive manifest, Developer Space archive manifest, and
  Project manifest;
- current bundle format: owner-only JSON/Markdown manifests and portable bundle
  readback;
- safe package facts: package class labels, included-section names, counts,
  status/readback concepts, and high-level trust notes;
- unavailable/future classes: full workspace bundle, original files, PDF,
  binary archive, Station Press, background jobs, managed backup/redundancy,
  restore drills, expiry policy, and shareable/private URLs;
- safe next actions pointing owners to existing persona, Developer Space,
  Project, or `/studio/export` readback.

## Rejected PR483A Shapes

ARGUS does not accept `ACCEPT_PR483A_EXPORT_BUNDLE_FILE_INVENTORY` as the next
slice.

Existing bundles already expose a tiny owner-only inventory for fixed
`README.md`, `manifest.json`, and `manifest.md` files with hashes and byte
sizes. Deepening file inventory is not meaningful until a file-manifest
redaction/download/original-file policy exists. It can be reconsidered after a
dedicated file-manifest contract lane.

ARGUS does not accept `ACCEPT_PR483A_PDF_EXPORT_PREVIEW_CONTRACT`.

PDF/print preview is too early for PR483A because there is no accepted PDF
generation, print provider, Station Press, storage, privacy, cost, or
no-write preview contract. A later lane can define a PDF preview privacy
contract without generating PDFs.

## Non-Goals

Do not add or change:

- new API routes, export package kinds, bundle formats, original-file packaging,
  generated PDFs, binary archives, print-on-demand calls, print orders, Station
  Press readiness, background package jobs, scheduled jobs, workers, queues,
  Redis, Cloudflare, runtime provisioning, or production backup/redundancy;
- schema changes, migrations, broad storage architecture, provider/model calls,
  billing, Stripe, export billing, new external config, retention/expiry
  enforcement, restore drills, or disaster-recovery claims;
- public export access, cross-owner export access, anonymous download links,
  signed URLs, shareable private package URLs, or package URL creation.

## Privacy And Auth Rules

- The surface remains owner-only.
- Public routes must not expose export package state, private package contents,
  source references, private evidence, package IDs, or download affordances.
- The readback must not include raw private source bodies, archive snippets,
  document bodies, storage paths, signed URLs, credentials, tokens, cookies,
  prompts, provider payloads, SQL/table details, table names, stack traces,
  hosted logs, or secret-shaped values.
- If source assertions touch bundle/file language, they must keep content,
  storage, and download policy out of PR483A.

## Required Tests

DAEDALUS should add focused coverage proving:

- workspace scope/readback names only the accepted live package classes:
  `persona_archive`, `developer_space_archive`, and `project_manifest`;
- full workspace, PDF, binary, original-file packaging, Station Press,
  background jobs, managed backup/redundancy, expiry/download policy, and
  shareable/private URLs remain future/unavailable;
- the helper does not claim generated PDF output, backup/redundancy,
  production restore, print readiness, original file inclusion, public export
  access, or download URL creation;
- `/studio/export` renders the readback without adding API client calls,
  mutation buttons, background-job controls, or storage/download behavior;
- copy avoids raw private source bodies, archive snippets, storage paths,
  signed URLs, credentials, prompts, provider payloads, SQL/table details,
  stack traces, hosted logs, and secret-shaped values.

## Required Validation

DAEDALUS should run:

```bash
npm exec --yes pnpm@10.32.1 -- run test:exports
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/export-trust.test.ts
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
git diff --cached --check
```

DAEDALUS should also run a path/scope check confirming no changed files under
`apps/api`, `packages/types`, `packages/db`, `db`, Supabase/infra schema paths,
migrations, billing/Stripe helpers, provider/model code, Redis/Cloudflare
runtime code, worker/queue code, deployment configuration, or package manager
metadata unless ARGUS accepts an explicit local equivalent.

## ARIADNE Requirement

If ARGUS accepts the PR483A implementation, MIMIR should route ARIADNE for
hosted read-only desktop/mobile proof because `/studio/export` visible product
copy changes.

Suggested proof:

- signed-in owner `/studio/export` desktop and 390px mobile shows the workspace
  scope/readback with live scoped package classes and future unavailable
  workspace/PDF/binary/original-file/backup states;
- no export package is created, no bundle is loaded, and no API `POST`, `PUT`,
  `PATCH`, or `DELETE` request is triggered by the read-only route proof;
- no public export access, package URL, signed URL, storage path, raw private
  source body, archive snippet, prompt, provider payload, SQL/table detail,
  stack trace, hosted log, credential, token, cookie, or secret-shaped value is
  visible;
- mobile has no horizontal overflow, clipped controls, or overlapping labels.

## ARGUS Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| Repo evidence inspection | Pass | PR483 handoff, PR482A closeout, export trust helpers/UI, export types, export routes/tests, bundle behavior, Project manifest behavior, and current lane index inspected. |
| `npm exec --yes pnpm@10.32.1 -- run test:exports` | Pass | 7 tests passed, preserving owner-only persona, Developer Space, Project manifest, bundle, malformed-readback, and route-error boundaries. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/export-trust.test.ts` | Pass | 5 tests passed against current export trust helpers. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 171 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API typecheck replayed from cache; web typecheck ran fresh and passed. |

## Handoff

```text
WAKEUP A2:
Codename: DAEDALUS
```

Task: implement `PR483A - Workspace Export Scope Readback` exactly as
owner-only helper/UI/test work on existing `/studio/export` product truth. Do
not create workspace packages, generated PDFs, binary archives, original-file
bundles, background jobs, workers/queues, Redis, Cloudflare, schema/migrations,
billing/Stripe behavior, provider/model calls, public export access, signed
URLs, shareable private package URLs, storage architecture, backup/redundancy
claims, or broad export redesign.
