# PR235 - Owner Project Evidence Hosted Rehearsal

Owner: ARIADNE
Reviewer: MIMIR
Status: Open
Opened: 2026-06-24

## Frame

PR234 added a private owner-only Project evidence readback panel and owner API
payload. ARGUS accepted it after removing a raw internal link-row identifier.

This lane proves the visible hosted owner flow before Station broadens Project
or institutional/research work.

## Hosted Target

- Web: `https://stationweb-production.up.railway.app`
- Required deployed commit: `f0c5ca6` or later.

If web or API deployment health reports an older commit, return `BLOCKED` with
the observed commit and do not judge the UI.

## Human Rehearsal Routes

Use the existing staging replay owner account and existing hosted data.

Primary routes:

- `/projects`
- `/projects/[idOrSlug]`

Likely reusable Developer Spaces if setup is needed:

- `station-replay-dev-alpha`
- `animus-field-lab`

## Required Checks

1. Confirm web and API `/health/deployment` are healthy and report commit
   `f0c5ca6` or later.
2. Sign in as the replay owner without printing credentials or secrets.
3. Open `/projects`.
4. Use an existing private Project if available. If no usable Project exists,
   create one bounded private Project for rehearsal only and attach one
   existing owner Developer Space such as `station-replay-dev-alpha` or
   `animus-field-lab`.
5. Open the Project detail route and confirm attached Developer Spaces render.
6. Confirm a visible `Project evidence` panel renders.
7. Acceptable empty state: if the attached Developer Space has no linked
   evidence documents, the panel must say so clearly.
8. If evidence exists, cards must show bounded metadata only: Developer Space
   source, document title, document type or role, status, visibility, date, and
   a safe open action when routeable.
9. Fetch the owner Project detail API and inspect the evidence payload boundary.
10. Click safe open actions. Public/published route hints should open safely.
    Private or draft evidence must not pretend to have a public route.
11. Repeat visible checks on desktop and around 375px mobile width.
12. Confirm anonymous or signed-out public routes do not expose private Project
    evidence.

## Must Not Appear

Visible UI or API payloads must not expose:

- document bodies;
- raw `developer_space_documents` link ids;
- owner ids;
- raw Project member rows;
- raw Developer Space event payloads;
- node metrics or snapshots beyond existing owner-safe metadata;
- prompts, completions, provider fields, traces, reports, export bundle
  contents, ingestion keys, webhook secrets, env values, service keys, SQL,
  stack traces, or raw JSON blobs.

The rehearsal must also confirm there are no claims that this lane added:

- public Projects;
- Discover Project cards;
- institutional/lab/company accounts;
- member invitations or member-role authorization;
- Project exports;
- billing, invoices, tax, marketplace, or customer records;
- hosted runtime, containers, queues, workers, Redis, Cloudflare, or Developer
  Agent runtime actions.

## Defect Routing

Return `PASS` only if the hosted owner flow and payload boundary are sound.

Return `FAIL` if the hosted app is fresh but the UI/API violates the boundary,
has broken buttons in this flow, has layout overflow, or misleads users about
capabilities.

Return `BLOCKED` if Railway is stale, auth is unavailable, no owner Project can
be created or opened, or the route cannot be exercised without new product
scope.

Wake MIMIR with enough exact detail to route the next step to DAEDALUS or ARGUS
without asking Marty to reproduce what ARIADNE can inspect.

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE completed PR235 Owner Project Evidence hosted rehearsal.
Verdict:
- PASS / FAIL / BLOCKED.
Task:
- If PASS, choose the next Project/institutional lane.
- If FAIL/BLOCKED, route exact defects to DAEDALUS or ARGUS.
```
