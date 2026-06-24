# PR251 - Owner Project Manifest Bundle Readback

Owner: DAEDALUS
Reviewer: ARGUS
Status: Accepted by ARGUS with narrow patch - MIMIR closeout pending
Opened: 2026-06-24

## Frame

ARGUS completed PR250 with a `PATCH` verdict. Project manifest bundle support
can proceed only as a stored-readback-only owner API slice.

PR249 already added owner-only Project manifest packages and intentionally made
`/exports/:id/bundle` reject `project_manifest` packages with `409`.

This lane enables the existing bundle route for completed Project manifest
packages without broadening export payloads or adding any new product surface.

## Goal

Support owner-only `GET /exports/:id/bundle` readback for completed
`project_manifest` packages.

## Route Behavior

- Use only the existing authenticated `GET /exports/:id/bundle` route.
- Add no new routes, public download URLs, UI, redirects, signed URLs, ZIP/PDF
  generation, background jobs, queues, cache, workers, Redis, Cloudflare,
  hosted runtime, provider calls, or Developer Agent execution.
- Reuse the existing owner lookup: select `export_packages` by `id` and
  `owner_user_id = req.user.id`.
- Anonymous requests keep the existing auth failure.
- Unknown and non-owner package ids return `404`.
- Existing persona and Developer Space bundle behavior must remain unchanged.

For `project_manifest` packages:

- `completed` with valid stored `manifest_json` and `manifest_markdown` returns
  a JSON bundle response.
- `requested`, `processing`, `failed`, and any other non-`completed` status
  return bounded `409` with no stored error details, stack traces, source
  details, or partial manifest.
- `completed` rows with missing or malformed stored manifest/readback fields
  return `409` instead of regenerating from live Project data.

## Bundle Contents

Bundle files are limited to exactly:

- `README.md`
- `manifest.json`
- `manifest.md`

Rules:

- `manifest.json` must be serialized only from stored
  `export_packages.manifest_json`.
- `manifest.md` must be copied only from stored
  `export_packages.manifest_markdown`.
- `README.md` may include only generic bundle/readback wording plus package id,
  package kind, format, status, and PR249 privacy notes.
- Do not add Project name/slug/description, Developer Space fields, evidence
  fields, document metadata, source labels, route hints, usage counts, or
  runtime/provider data to `README.md` outside the stored manifest readback.
- The Project bundle response must not add raw `ownerUserId`, `owner_user_id`,
  `projectId`, `project_id`, `developerSpaceId`, `developer_space_id`,
  `personaId`, `persona_id`, document ids, source ids, raw link-row ids, or
  author ids outside the already stored manifest content.

## Hard Exclusions

Do not add or expose:

- public bundle URLs or unauthenticated access;
- document bodies, excerpts, file contents, binary/PDF packaging, workspace
  export, nested Developer Space bundles, source bodies, raw link ids, raw
  source ids, node/event/snapshot/raw observatory data, storage paths, usage
  counters, secrets, SQL, stack traces, env values, or private evidence hints in
  public sections;
- Project member/admin/billing export permissions;
- UI, public routes, hosted route changes, public Project page changes, or
  broad export navigation;
- jobs, queues, workers, Redis, Cloudflare, cache, hosted runtime,
  provider/model calls, or Developer Agent execution;
- broad Project export redesign.

## Required Tests

Add or update tests proving:

- Owner can read a completed `project_manifest` bundle from
  `GET /exports/:id/bundle`.
- The returned bundle has schema `station.export.bundle.v1`, integrity hashes,
  and exactly `README.md`, `manifest.json`, and `manifest.md`.
- `manifest.json` matches the stored Project manifest and `manifest.md` matches
  the stored Markdown readback.
- Mutating live Project, Developer Space, document, link, source, and usage rows
  after package creation does not change the bundle or leak the mutated rows.
- Anonymous bundle requests fail auth; non-owner and unknown package ids return
  `404`.
- `requested`, `processing`, `failed`, and any other non-completed
  `project_manifest` packages return `409`.
- Failed package bundle attempts do not expose stored error details or stack
  traces.
- A completed `project_manifest` row with missing/malformed stored
  manifest/readback returns `409` and does not regenerate from live data.
- Whole-response leak scans prove no document bodies, excerpts, file contents,
  source ids, raw link ids, Project/Developer Space/document ids, owner/author
  ids, nested Developer Space bundle data, public bundle URLs, usage counters,
  storage paths, nodes/events/snapshots, secrets, env values, SQL, stack traces,
  raw JSON dumps, provider/model/runtime data, Cloudflare, Redis, queue, worker,
  billing, or member/admin permission fields appear.
- Existing persona and Developer Space export bundle tests still pass.

## Validation

Run:

```text
npm exec --yes pnpm@10.32.1 -- run test:exports
npm exec --yes pnpm@10.32.1 -- run test:projects
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- run lint
git diff --check
git diff --cached --check
```

ARIADNE hosted rehearsal is not required if this stays API-only, owner-only,
and local tests prove the stored-readback boundary. Wake MIMIR if implementation
requires UI, public/download routes, auth middleware changes, signed URLs,
binary packaging, or any visible browser behavior.

## ARGUS Review

ARGUS completed hostile review on 2026-06-24.

Verdict:

- `ACCEPT`.
- Accepted with one narrow validation-hardening patch.
- ARIADNE hosted rehearsal is not required before MIMIR closeout because the
  accepted slice is API-only, owner-only, and has no visible route or public
  auth change.

ARGUS patch:

- Strengthened Project bundle stored-readback validation so a completed
  `project_manifest` row must contain the PR249 core manifest shape before
  bundle readback is allowed: schema, generated timestamp, package id, Project
  name/slug/visibility, attached Developer Space refs array, owner evidence
  refs array, public evidence refs array, and trust booleans.
- Added malformed-row coverage proving a schema-only Project manifest with
  Markdown returns bounded `409` and does not leak stored details.

Review findings:

- Existing authenticated `GET /exports/:id/bundle` is the only route changed.
- Completed Project manifest bundles are generated only from stored
  `export_packages.manifest_json` and `export_packages.manifest_markdown`.
- No live Project, Developer Space, document, link, source, node, event,
  snapshot, usage, provider, runtime, Redis, Cloudflare, queue, billing, or
  member/admin data is read while building Project bundles.
- Project bundles return exactly `README.md`, `manifest.json`, and
  `manifest.md`.
- Project bundle package metadata is minimized to id, package kind, format, and
  status; raw owner, Project, Developer Space, persona, document, source,
  link-row, and author ids are not added outside the already stored manifest.
- Anonymous requests keep auth failure; non-owner and unknown package ids
  return `404`; non-completed and malformed stored readbacks return bounded
  `409` without stored errors, stack traces, or partial manifests.
- Persona and Developer Space bundle behavior remains unchanged.
- No new routes, public bundle URLs, signed URLs, redirects, UI, ZIP/PDF/binary
  packaging, nested Developer Space bundles, jobs, queues, Redis, Cloudflare,
  hosted runtime, provider/model calls, member/admin/billing permissions, or
  broad Project export redesign were added.

Validation:

```text
npm exec --yes pnpm@10.32.1 -- run test:exports passed with 6 tests.
npm exec --yes pnpm@10.32.1 -- run test:projects passed with 13 tests.
npm exec --yes pnpm@10.32.1 -- run typecheck passed.
npm exec --yes pnpm@10.32.1 -- run lint passed with existing raw <img> warnings only.
git diff --check passed with CRLF warnings only.
git diff --cached --check passed.
```

## Wakeup

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS implemented PR251 Owner Project Manifest Bundle Readback.
Validation:
- List exact commands and results.
Risk:
- Owner-only access, stored-readback-only bundle generation, and response leak scans need hostile review.
Task:
- Review PR251 against ARGUS's narrowed PR250 scope.
- Wake MIMIR with ACCEPT / FAIL / BLOCKED and whether ARIADNE hosted rehearsal is required.
```
