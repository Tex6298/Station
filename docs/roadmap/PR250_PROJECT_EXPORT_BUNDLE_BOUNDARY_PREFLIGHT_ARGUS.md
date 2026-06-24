# PR250 - Project Export Bundle Boundary Preflight

Owner: ARGUS
Reviewer: MIMIR
Status: Completed - ARGUS PATCH, MIMIR review pending
Opened: 2026-06-24

## Frame

PR249 added owner-only Project export manifest/list/create/readback APIs and
ARGUS accepted the boundary.

PR249 also intentionally made `/exports/:id/bundle` return `409` for
`project_manifest` packages until a separate Project bundle lane is approved.

This preflight decides whether Station can safely enable owner-only Project
manifest bundles, and if yes, the exact first DAEDALUS implementation boundary.

## Question

Can Station safely enable `/exports/:id/bundle` for `project_manifest` packages?

If yes, define the smallest implementation slice that preserves PR249's
manifest-only, owner-only export boundary.

## Candidate Safe Shape

- Owner-only bundles for completed `project_manifest` packages only.
- Generate bundle bytes from the already stored Project manifest/readback data.
- Bundle contents limited to:
  - `README.md`
  - `manifest.json`
  - `manifest.md`
- Reuse PR249's manifest schema and readback wording.
- Preserve privacy notes that the bundle is owner-only, public refs remain
  separate, document bodies are omitted, and linked source rows remain private.
- Reuse existing owner-only `/exports/:id` access checks before returning bundle
  bytes.
- Reject non-completed Project export packages and non-owner reads.

## Hostile Questions

- Is synchronous on-demand bundle generation safe for a manifest-only Project
  package, or does it create hidden background/job expectations?
- Should bundle bytes be generated only from stored package manifest metadata,
  not live Project reads, to avoid drift?
- Which package statuses must reject bundle readback?
- What response should `requested`, `processing`, `failed`, and unknown
  `project_manifest` packages return?
- What tests prove owner-only bundle access and non-owner `404` behavior?
- What tests prove bundle contents do not include document bodies, file
  contents, source ids, raw link ids, nested Developer Space data, public URLs,
  usage counters, secrets, SQL, stack traces, or runtime/provider data?
- Does this need ARIADNE hosted rehearsal, or is API-only local validation
  enough?

## Hard Exclusions

Do not approve:

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

## Expected Output

Return one of:

- `ACCEPT`: bundle support can proceed, with exact PR251 DAEDALUS scope.
- `PATCH`: bundle support can proceed only with a narrower or different scope.
- `REJECT`: keep Project manifest bundles blocked and explain why.

If accepted or patched, include:

- exact route behavior;
- exact allowed files and content sources;
- exact rejection/status behavior;
- exact tests DAEDALUS must add;
- whether ARIADNE hosted rehearsal is needed.

## Validation

Docs-only preflight:

```text
git diff --check
git diff --cached --check
```

## ARGUS Preflight Verdict

ARGUS completed PR250 on 2026-06-24.

Verdict:

- `PATCH`.
- Project manifest bundle support can proceed only as **PR251 - Owner Project
  Manifest Bundle Readback**.
- The implementation must be stored-readback-only. It must not become a live
  Project export generator.

Why PATCH:

- The candidate shape is safe only if DAEDALUS uses stored PR249 package
  readback fields and does not re-read live Project, Developer Space, document,
  link, source, usage, provider, or runtime tables while building the bundle.
- A Project bundle is more shareable than the owner API readback, so the
  Project bundle response should avoid adding raw owner/target/source ids
  beyond the export package id already used to address the route.

Exact PR251 route behavior:

- Use only the existing authenticated `GET /exports/:id/bundle` route.
- Add no new routes, public download URLs, UI, redirects, signed URLs, ZIP/PDF
  generation, background jobs, queues, cache, workers, Redis, Cloudflare,
  hosted runtime, provider calls, or Developer Agent execution.
- Reuse the existing owner lookup: select `export_packages` by `id` and
  `owner_user_id = req.user.id`.
- Anonymous requests keep the existing auth failure.
- Unknown and non-owner package ids return `404`.
- Existing persona and Developer Space bundle behavior must remain unchanged.
- For `project_manifest` packages:
  - `completed` with valid stored `manifest_json` and `manifest_markdown`
    returns a JSON bundle response.
  - `requested`, `processing`, `failed`, and any other non-`completed` status
    return `409` with bounded generic copy and no stored error details, stack
    traces, source details, or partial manifest.
  - `completed` rows with missing or malformed stored manifest/readback fields
    return `409` rather than regenerating from live Project data.

Exact allowed files and content sources:

- Bundle files are limited to exactly:
  - `README.md`;
  - `manifest.json`;
  - `manifest.md`.
- `manifest.json` must be serialized only from the stored
  `export_packages.manifest_json` field.
- `manifest.md` must be copied only from the stored
  `export_packages.manifest_markdown` field.
- `README.md` may include only generic bundle/readback wording plus package id,
  package kind, format, status, and the PR249 privacy notes that the bundle is
  owner-only, document bodies are omitted, public refs remain separate, and
  linked source rows remain private.
- Do not add Project name/slug/description, Developer Space fields, evidence
  fields, document metadata, source labels, route hints, usage counts, or
  runtime/provider data to `README.md` outside the stored manifest readback.
- The Project bundle response must not add raw `ownerUserId`, `owner_user_id`,
  `projectId`, `project_id`, `developerSpaceId`, `developer_space_id`,
  `personaId`, `persona_id`, document ids, source ids, raw link-row ids, or
  author ids outside the already stored manifest content.

Exact PR251 tests:

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
  `project_manifest` packages return `409`; failed package bundle attempts do
  not expose stored error details or stack traces.
- A completed `project_manifest` row with missing/malformed stored
  manifest/readback returns `409` and does not regenerate from live data.
- Whole-response leak scans prove no document bodies, excerpts, file contents,
  source ids, raw link ids, Project/Developer Space/document ids, owner/author
  ids, nested Developer Space bundle data, public bundle URLs, usage counters,
  storage paths, nodes/events/snapshots, secrets, env values, SQL, stack
  traces, raw JSON dumps, provider/model/runtime data, Cloudflare, Redis, queue,
  worker, billing, or member/admin permission fields appear.
- Existing persona and Developer Space export bundle tests still pass.

Required PR251 validation:

```text
npm exec --yes pnpm@10.32.1 -- run test:exports
npm exec --yes pnpm@10.32.1 -- run test:projects
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- run lint
git diff --check
git diff --cached --check
```

Hosted rehearsal:

- ARIADNE hosted rehearsal is not required for PR251 if the implementation
  stays API-only, owner-only, and local tests prove the stored-readback boundary.
- Wake ARIADNE only if DAEDALUS adds UI, public/download routes, auth middleware
  changes, signed URLs, binary packaging, or any visible browser behavior.

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS completed PR250 Project Export Bundle Boundary Preflight.
Verdict:
- ACCEPT / PATCH / REJECT.
Task:
- If accepted or patched, MIMIR should open the precise DAEDALUS implementation lane.
- If rejected, MIMIR should choose the next safer Project or Phase 3 lane.
```
