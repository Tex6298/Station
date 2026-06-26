# PR364 - Export Backup Trust Gap Map Result

Owner: DAEDALUS
Date: 2026-06-26
Status: Ready for ARGUS

## Result

DAEDALUS mapped the current export/backup trust surfaces and shipped the
smallest safe no-config readback patch: `/studio/export` now shows an honest
trust map of the live scoped export packages and the future backup/export
boundaries.

Changed files:

- `apps/web/components/studio/export-workspace.tsx`
- `apps/web/lib/export-trust.ts`
- `apps/web/lib/export-trust.test.ts`

## Surface Map

Current live export package readback:

- Persona archive manifests: owner-only `persona_archive` JSON/Markdown
  manifest and portable bundle readback from persona workspaces.
- Developer Space archive manifests: owner-only `developer_space_archive`
  JSON/Markdown manifest and bundle readback from Developer Space manage pages.
- Project manifests: owner-only `project_manifest` stored manifest and bundle
  readback from Project pages.

Current preview/future export and backup boundaries:

- `/studio/export` does not start a global workspace export job.
- Full workspace export remains preview-only.
- PDF, binary archive, original file packaging, Station Press, print,
  fulfilment, shipping, and checkout remain future lanes.
- Managed backup/redundancy, retention/expiry, restore drills, retry policy,
  queues/workers, Redis, Cloudflare, and backup infrastructure remain future
  lanes.

## Implemented Slice

The `/studio/export` page now:

- removes the old future-scope checkboxes that could imply a configurable
  global export job exists;
- names the three live scoped owner-only package routes;
- links owners to the current source surfaces: `/studio`,
  `/developer-spaces`, and `/projects`;
- shows a summary of live, preview-only, and future-lane export surfaces;
- states that current bundle readback is authenticated and owner-only;
- states that current routes return stored manifests and file hashes rather
  than public download URLs or backup infrastructure.

The export trust helper now provides a tested `exportBackupTrustSurfaces()` map,
summary counts, and status labels for the page.

## Boundary

No new global export API, job, schema, migration, queue, worker, provider,
storage backend, signed download URL, public export URL, PDF/binary/original
file package, Station Press surface, Stripe/checkout flow, or backup/restore
system was added.

Existing live package readback remains scoped to authenticated owner routes and
existing export APIs.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 116 tests passed, including export backup trust map coverage. |
| `npm exec --yes pnpm@10.32.1 -- run test:exports` | Pass | 6 export route tests passed. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck` | Pass | Web TypeScript check passed. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/web lint` | Pass | Next lint reported no warnings or errors. |
| `git diff --check` | Pass | Whitespace check passed with CRLF normalization notices only. |

## Review Ask

ARGUS should verify:

- `/studio/export` no longer implies a live global workspace export job;
- the three live surfaces match existing owner-only scoped package routes;
- future PDF/binary/original-file/backup/Station Press boundaries are clear;
- the helper/test coverage is sufficient for this readback-only patch;
- no export API or persistence semantics changed.
