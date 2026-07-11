# PR504A - Station Press Owner Package Contract

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Date opened: 2026-07-11

Status: Ready for ARGUS review

## Source

ARGUS accepted PR504A:

`docs/roadmap/PR504_STATION_PRESS_PACKAGE_GENERATION_PREFLIGHT_RESULT.md`

Verdict:

```text
ACCEPT_PR504A_STATION_PRESS_OWNER_PACKAGE_CONTRACT
```

MIMIR closed PR504:

`docs/roadmap/PR504_STATION_PRESS_PACKAGE_GENERATION_PREFLIGHT_CLOSEOUT.md`

## Goal

Implement a narrow owner-only Station Press publication package contract for
existing owner publications.

This package is metadata-only, synchronous, authenticated, private, and
table/readback-backed. It is not public Station Press launch.

## Allowed Files

Keep the implementation inside this boundary:

- `infra/supabase/migrations/073_station_press_publication_packages.sql`;
- `packages/db/src/types.ts`;
- `packages/types/src/index.ts` and close local shared type files if needed;
- `apps/api/src/routes/exports.ts`;
- `apps/api/src/routes/exports.test.ts`;
- `apps/web/lib/publishing.ts`, `apps/web/lib/export-trust.ts`, or a close
  local Station Press helper;
- `apps/web/lib/publishing-ui.test.ts`, `apps/web/lib/export-trust.test.ts`,
  or close local helper tests;
- `apps/web/components/studio/publishing-dashboard.tsx` only for a small
  owner-only readiness/action/readback control;
- roadmap and validation docs.

Do not touch package files, lockfiles, storage bucket/object paths, signed URL
code, public routes, public download pages, queue tables, workers,
recurring/background jobs, provider routers, billing/Stripe, social connectors,
Redis, Cloudflare, archive connectors, hosted runtime config, or broad
`/studio/publishing` layout/design.

If the work needs any forbidden boundary, stop and wake MIMIR with the exact
blocker.

## Required Schema Boundary

Add migration `073_station_press_publication_packages.sql` to extend
`export_packages` explicitly:

- add nullable `document_id uuid references public.documents(id) on delete
  cascade`;
- add package kind `station_press_publication`;
- update the package-kind check constraint to include the new kind;
- update the target check so all existing package kinds require
  `document_id is null`;
- require `station_press_publication` rows to have `document_id is not null`
  and `persona_id`, `developer_space_id`, and `project_id` all null;
- add an owner/document index such as `(owner_user_id, document_id, created_at
  desc)` filtered to `station_press_publication`;
- update RLS so authenticated owners can create/read/update/delete only when
  `owner_user_id = auth.uid()` and the referenced document is owned by the same
  user.

The route must also verify owner scope before inserting. Cross-owner,
signed-out, missing, private, draft, archived, or no-Space documents must fail
with bounded copy before a completed package row is produced.

## Required API Boundary

Add authenticated owner routes under the existing exports router only:

```text
POST /exports/station-press/publications/:documentId
GET /exports/station-press/publications/:documentId
GET /exports/:id
GET /exports/:id/bundle
```

The new `POST` creates one synchronous metadata-only package for a
package-ready owner publication.

The new `GET` lists or returns owner packages for that document without
exposing raw ids in visible/readback copy.

The existing owner-only read and bundle routes may support
`station_press_publication` after their owner filter and malformed-readback
guards are extended.

Do not add anonymous routes, public package URLs, public package pages, public
download URLs, share links, signed URLs, or storage-backed downloads.

## Package Contract Shape

Use manifest schema:

```text
station.press.publication_package_manifest.v1
```

The authenticated bundle may reuse the existing bundle shape and must contain
only:

```text
README.md
manifest.json
manifest.md
```

Allowed manifest facts:

- package schema, package kind, creation/completion status, and trust flags;
- safe document title, document type label, publication status label,
  visibility label, published label, and current version label;
- safe Space title/slug/destination label;
- PR503A manifest contract schema reference;
- linked discussion status only;
- seminar/publication record status and stored schedule metadata only when
  already available;
- excluded/future material lists.

Forbidden manifest, bundle, API, and visible UI facts:

- document body text;
- private source body text;
- archive chunks;
- transcripts;
- prompts, model output, provider payloads, raw approval events;
- prior-version bodies or public prior-version history;
- private seminar notes;
- raw export manifests or original files;
- storage paths or signed URLs;
- SQL/table details, stack traces, hosted logs;
- cookies, tokens, API keys, webhook secrets, bearer/JWT-shaped values,
  secret-shaped values, or env values;
- raw owner, persona, document, thread, seminar, approval, export, package,
  source, file, storage, or import ids in visible/readback copy or package
  files.

The API envelope may carry the authenticated `exportPackage.id` only as the
existing private route handle for follow-up owner read/bundle calls. Visible UI
copy and package files must not print it.

## Owner UI Boundary

A small owner control/readback on `/studio/publishing` is allowed only if it
stays inside the existing owner publishing dashboard:

- show readiness and create/readback only for manifest-ready owner
  publications;
- use no package-id display in visible copy;
- do not add public package links, public download links, share links, billing,
  provider, social, print, fulfillment, queue/job, or broad Press launch
  controls;
- keep draft/private/no-Space/archived documents as not ready with bounded
  owner copy.

Because visible owner UI and API package behavior will change, wake ARGUS for
review and expect ARIADNE hosted desktop and 390px mobile proof after review if
ARGUS accepts.

## Required Tests

Prove at minimum:

- migration adds `document_id`, the new kind, target constraints, owner
  document index, and RLS without weakening existing package kinds;
- existing package kinds cannot carry `document_id`;
- signed-out create/list/read/bundle attempts return `401`;
- cross-owner document create/list/read/bundle attempts return `404`;
- private, draft, archived, missing, and no-Space documents are rejected before
  a completed package row is produced;
- owner can create/read/bundle a `station_press_publication` package for a
  published Space-backed document;
- duplicate in-progress package guards remain bounded and existing package
  kinds keep their duplicate behavior;
- malformed stored readback returns bounded owner copy without leaking stored
  private detail;
- source failure leaves a failed package with bounded owner-visible error copy;
- bundle inventory is exactly `README.md`, `manifest.json`, and `manifest.md`;
- manifest and bundle include schema/kind/trust facts but no bodies, source
  text, raw ids, storage paths, provider payloads, secrets, SQL details, stack
  traces, or unsupported launch claims;
- `/studio/publishing` renders the new owner control/readback without broad
  redesign, forbidden controls, public links, package id copy, or overclaim.

## Required Validation

Run:

```powershell
npm exec --yes pnpm@10.32.1 -- run test:exports
npm exec --yes pnpm@10.32.1 -- run test:publishing-approvals
npm exec --yes pnpm@10.32.1 -- run test:document-discussions
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
git diff --cached --check
```

Also run a changed-path/source scan for schema, storage, worker, queue,
provider, billing, social, public route, package/lockfile, Cloudflare, Redis,
and secret/id leakage drift.

## Review

Wake ARGUS after implementation.

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARGUS accepted PR504A as a narrow owner-only Station Press publication
  package contract.
- Reuse export package infrastructure only after adding explicit
  `station_press_publication` kind plus `document_id` target/RLS boundary.
- Scope is metadata-only, synchronous, authenticated, private, and
  table/readback-backed.
Task:
- Implement PR504A inside the accepted schema/API/web/test/docs boundary.
- Do not add public package URLs/downloads, PDF/binary/original-file packaging,
  print/fulfillment, billing, provider calls, social dispatch, queues/workers,
  Redis, Cloudflare, storage objects, public routes, launch claims, raw-id
  readback, or private body/source exposure.
- Wake ARGUS with implementation result and validation.
```
