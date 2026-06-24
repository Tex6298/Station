# PR252 - Owner Project Export UI Panel

Owner: DAEDALUS
Reviewer: ARGUS
Status: Implemented - ARGUS review pending
Opened: 2026-06-24

## Frame

PR249 through PR251 made owner-only Project export manifests and bundles real at
the API layer. The current gap is usability: owners cannot operate Project
exports from the private Project UI.

This lane adds the smallest visible owner Project export panel. Because it is
browser-visible, ARGUS reviews first and ARIADNE should rehearse the hosted
owner path after ARGUS accepts.

## Goal

On the private owner Project detail page, let an authenticated Project owner:

- see existing Project export packages;
- create a fresh Project export manifest;
- inspect manifest readback for a selected completed package;
- inspect bundle readback/file list for a selected completed package.

## Scope

Use existing APIs only:

- `GET /exports/projects/:projectIdOrSlug`
- `POST /exports/projects/:projectIdOrSlug`
- `GET /exports/:id`
- `GET /exports/:id/bundle`

Likely surface:

- `apps/web/app/projects/[idOrSlug]/page.tsx`
- small helper/component files only if they reduce clutter and match local
  patterns.

UI expectations:

- Owner-only private Project page only.
- A compact "Project export" panel/card below the existing Project evidence or
  activity surface, not a new top-level destination.
- Clear empty state when no Project export package exists.
- "Create manifest" action posts to the accepted API and refreshes readback.
- Completed packages can show manifest summary/readback and bundle file list.
- Non-completed packages show bounded status and do not pretend bundle/readback
  is ready.
- Failed or malformed package states show bounded error copy, not stack traces
  or raw stored errors.
- Controls that are not live must be disabled or absent.
- Use the existing dark Station UI system and compact operational layout; do
  not introduce a new visual style.

## Hard Exclusions

Do not add:

- new API routes, schema, migrations, package kinds, export payload fields, or
  bundle behavior;
- public Project export routes, public bundle URLs, signed URLs, unauthenticated
  access, redirects, downloads, ZIP/PDF/binary generation, or file blobs;
- Project member/admin/billing export permissions or institutional ownership;
- Discover, public Project page, Developer Space public observatory, Studio,
  Settings, Billing, or global navigation changes;
- document bodies, excerpts, file contents, nested Developer Space bundles,
  source ids, raw link ids, storage paths, usage counters, secrets, SQL, stack
  traces, provider/model/runtime data, Redis, Cloudflare, queue, worker, or
  Developer Agent execution;
- broad Project UI redesign or site-wide reskin.

## Required Tests And Checks

Add focused tests only where local patterns support them. At minimum:

- Existing `test:exports` and `test:projects` must still pass.
- If web helper logic is added, add focused helper tests for package state,
  available actions, and bounded copy.
- Typecheck and lint must pass.
- Manual/local reasoning must confirm the UI uses owner Project route data and
  accepted owner-only export APIs, not public Project/profile APIs.

Run:

```text
npm exec --yes pnpm@10.32.1 -- run test:exports
npm exec --yes pnpm@10.32.1 -- run test:projects
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- run lint
git diff --check
git diff --cached --check
```

## Wakeup

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS implemented PR252 Owner Project Export UI Panel.
Validation:
- List exact commands and results.
Risk:
- Owner-only UI routing, action wiring, bounded error copy, and no public/export-payload broadening need review.
Task:
- Review PR252 against this scope.
- Decide whether ARIADNE hosted rehearsal is required; expected answer is yes if visible UI shipped.
- Wake MIMIR with ACCEPT / FAIL / BLOCKED and the exact ARIADNE rehearsal brief if accepted.
```
