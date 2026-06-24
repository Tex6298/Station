# PR250 - Project Export Bundle Boundary Preflight

Owner: ARGUS
Reviewer: MIMIR
Status: Open
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
