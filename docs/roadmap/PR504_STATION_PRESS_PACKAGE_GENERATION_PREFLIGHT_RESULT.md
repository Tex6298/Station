# PR504 - Station Press Package Generation Boundary Preflight Result

Owner: ARGUS / A3

Date: 2026-07-07

Status: Accepted

## Decision

ARGUS accepts the next safe implementation lane as:

```text
ACCEPT_PR504A_STATION_PRESS_OWNER_PACKAGE_CONTRACT
```

DAEDALUS may implement a narrow owner-only Station Press publication package
contract for existing owner publications. This is not approval for public
Station Press launch, public package URLs, public downloads, PDF or binary
generation, original-file packaging, print/fulfillment, billing, social
dispatch, provider/model calls, queues, workers, Redis, Cloudflare, or broad
publishing UI redesign.

ARGUS does not choose `ACCEPT_PR504A_STATION_PRESS_READINESS_ONLY` because the
repo already has enough owner/auth/readback and export-package precedent for a
metadata-only package contract. ARGUS does not choose
`BLOCK_PR504_STATION_PRESS_PACKAGE_GENERATION` because no storage object,
background runtime, provider, commercial, or public-route decision is required
for the accepted private contract.

## Core Finding

PR504A must not reuse `workspace_manifest`, `project_manifest`, or any existing
target class as a proxy for a publication. The current `export_packages`
contract has persona, Developer Space, Project, and owner-level workspace
targets only. A Station Press publication package needs an explicit document
target and explicit package kind so RLS, duplicate guards, readback, tests, and
UI copy all know the row is tied to one owner publication.

The safe path is to reuse the existing export package pattern while adding the
missing document-scoped boundary.

## Accepted Implementation Scope

Allowed PR504A code/docs scope:

- `infra/supabase/migrations/073_station_press_publication_packages.sql`, or
  the next available migration number if that filename is no longer free;
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

No package, lockfile, storage bucket/object path, signed URL, public route,
public download page, queue table, worker, recurring/background job, provider
router, billing/Stripe, social connector, Redis, Cloudflare, archive connector,
hosted runtime, or broad `/studio/publishing` redesign is accepted for PR504A.

## Required Schema Boundary

PR504A should extend `export_packages` explicitly:

- add nullable `document_id uuid references public.documents(id) on delete
  cascade`;
- add package kind `station_press_publication`;
- update the package-kind check constraint to include the new kind;
- update the target check so all existing kinds require `document_id is null`;
- require `station_press_publication` rows to have `document_id is not null`
  and `persona_id`, `developer_space_id`, and `project_id` all null;
- add an owner/document index such as `(owner_user_id, document_id, created_at
  desc)` filtered to `station_press_publication`;
- update RLS so the authenticated owner can create/read/update/delete only when
  `owner_user_id = auth.uid()` and the referenced document is owned by the same
  user.

The route must also verify owner scope before inserting. Cross-owner,
signed-out, missing, private, draft, archived, or no-Space documents must fail
with bounded public copy before a completed package row is produced.

## Required API Boundary

PR504A may add authenticated owner routes under the existing exports router
only. Accepted shape:

```text
POST /exports/station-press/publications/:documentId
GET /exports/station-press/publications/:documentId
GET /exports/:id
GET /exports/:id/bundle
```

The new `POST` creates one synchronous metadata-only package for a package-ready
owner publication. The new `GET` lists or returns owner packages for that
document without exposing raw ids in user-visible copy. The existing owner-only
read and bundle routes may support `station_press_publication` after their
owner filter and malformed-readback guards are extended.

Do not add anonymous routes, public package URLs, public package pages, public
download URLs, share links, signed URLs, or storage-backed downloads.

## Package Contract Shape

Suggested package manifest schema:

```text
station.press.publication_package_manifest.v1
```

The authenticated bundle may reuse the existing bundle shape and must contain
only these files:

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

- document body text, private source body text, archive chunks, transcripts,
  prompts, model output, provider payloads, raw approval events, prior-version
  bodies, public prior-version history, private seminar notes, raw export
  manifests, original files, storage paths, signed URLs, SQL/table details,
  stack traces, hosted logs, cookies, tokens, API keys, webhook secrets,
  bearer/JWT-shaped values, secret-shaped values, or env values;
- raw owner, persona, document, thread, seminar, approval, export, package,
  source, file, storage, or import ids in visible/readback copy or package
  files.

The API envelope may carry the authenticated `exportPackage.id` only as the
existing private route handle for follow-up owner read/bundle calls. Visible UI
copy and package files must not print it.

## Synchronous Generation

Queue/worker/job infrastructure is not a blocker for PR504A because the
accepted package is metadata-only and table-backed, like the existing JSON and
Markdown manifest bundles. PR504A must generate from already-authorized owner
document, publishing, discussion, seminar, and PR503A manifest-readback facts.

If DAEDALUS discovers that implementation needs PDF rendering, binary archive
assembly, original files, external storage, provider calls, public route
publishing, queue/worker execution, billing, print/fulfillment, or social
dispatch, DAEDALUS must stop and wake MIMIR instead of widening PR504A.

## Owner UI Boundary

A small owner control/readback on `/studio/publishing` is safe only if it stays
inside the existing owner publishing dashboard:

- show readiness and create/readback only for manifest-ready owner
  publications;
- use no package-id display in visible copy;
- do not add public package links, public download links, share links, billing,
  provider, social, print, fulfillment, queue/job, or broad Press launch
  controls;
- keep draft/private/no-Space/archived documents as not ready with bounded
  owner copy.

Because PR504A would change visible owner UI and API package behavior, ARGUS
review should route ARIADNE for hosted desktop and 390px mobile proof before
MIMIR closes the implementation.

## Required PR504A Tests

DAEDALUS should prove at minimum:

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

Minimum validation:

```text
npm exec --yes pnpm@10.32.1 -- run test:exports
npm exec --yes pnpm@10.32.1 -- run test:publishing-approvals
npm exec --yes pnpm@10.32.1 -- run test:document-discussions
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
git diff --cached --check
```

ARGUS review must also run a changed-path/source scan for schema, storage,
worker, queue, provider, billing, social, public route, package/lockfile,
Cloudflare, Redis, and secret/id leakage drift.

## ARGUS Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| Repo evidence inspection | Pass | PR503/PR503A/PR503B docs, PR496/PR496A package docs, current export route/types/migration, publishing helpers/tests, document discussion boundaries, and export trust boundaries were inspected. |
| `npm exec --yes pnpm@10.32.1 -- run test:exports` | Pass | 10 export API tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:publishing-approvals` | Pass | 24 API/UI publishing tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:document-discussions` | Pass | 4 document discussion tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 194 Studio UI/helper tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | Turbo typecheck passed from cache. |
| `git diff --check` | Pass | No whitespace errors. |
| `git diff --cached --check` | Pass | No staged whitespace errors. |
| Changed-path/source scan | Pass | PR504 is docs-only; existing export infrastructure has no document target yet, so PR504A must add the explicit schema/API boundary above. No current storage, worker, provider, billing, social, Cloudflare, Redis, or public-route requirement was found for the accepted metadata-only package. |

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS accepts PR504A as a narrow owner-only Station Press publication package
  contract.
- The package may reuse export package infrastructure only after adding an
  explicit `station_press_publication` kind and `document_id` target/RLS
  boundary.
- Scope stays metadata-only, synchronous, authenticated, and private: no public
  package URL/download, PDF/binary/original-file packaging, print/fulfillment,
  billing, provider calls, social dispatch, queues/workers, Redis, Cloudflare,
  storage objects, or raw/private content exposure.
Task:
- Close PR504 and decide whether to wake DAEDALUS for PR504A with the exact
  boundary above.
```
