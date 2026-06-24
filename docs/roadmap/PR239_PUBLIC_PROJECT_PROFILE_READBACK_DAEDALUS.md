# PR239 - Public Project Profile Readback

Owner: DAEDALUS
Reviewer: ARGUS
Status: ARGUS ACCEPT - MIMIR closeout pending
Opened: 2026-06-24
Implemented: 2026-06-24
Reviewed: 2026-06-24

## Frame

ARGUS completed PR238 with `PATCH`: a first public Project lane is safe only as
a standalone anonymous public profile readback. This lane proves Project
visibility, safe slug routing, same-owner attached public Developer Space
filtering, and omission of private owner/workspace data.

Do not include Project evidence, documents, activity counters, Discover cards,
reporting, membership, exports, billing, hosted runtime, provider calls, queues,
Redis, Cloudflare, or Project-authored forum work.

## API Scope

Add anonymous:

```text
GET /projects/public/:slug
```

Route requirements:

- Mount the public route before `projectsRouter.use(requireAuth)` or use a
  separate public router.
- Do not weaken owner `GET /projects` or `GET /projects/:idOrSlug`.
- Accept only safe slugs matching the existing Project slug shape.
- Reject UUID-shaped route identifiers for anonymous reads.
- Query only `projects` where `visibility = "public"` and `slug = :slug`.
- Select `id` and `owner_user_id` only as internal join/filter fields; never
  return them.

Allowed Project response fields:

- `name`;
- `slug`;
- `description`;
- `visibility`, always `public`;
- `createdAt`;
- `updatedAt`;
- `publicDeveloperSpaceCount`.

Explicitly exclude from Project response:

- Project id;
- owner id;
- connection tier;
- activity counters, including nodes, events, snapshots, storage bytes, public
  reads, and exports;
- member rows or member counts;
- evidence arrays, document arrays, document counts, and document routes.

Allowed attached Developer Space summaries:

- Include only spaces where `developer_spaces.project_id = project.id`,
  `developer_spaces.owner_user_id = project.owner_user_id`, and
  `developer_spaces.visibility = "public"`.
- Return at most 12 summaries, sorted deterministically by `updated_at` desc
  then `project_name`.
- Allowed fields per summary:
  - `projectName`;
  - `slug`;
  - `description`;
  - `visibility`, always `public`;
  - `visualisationType`;
  - `href`, using `/developer-spaces/:slug`;
  - `updatedAt`.

Explicitly exclude from Developer Space summaries:

- Developer Space id;
- owner id;
- provider policy;
- visualisation config;
- API key metadata;
- node, event, snapshot, runtime context, usage, storage, public-read, and
  export counters;
- linked documents and evidence.

## Web Scope

Add a standalone public page:

```text
/projects/public/[slug]
```

Render only:

- public Project profile;
- `publicDeveloperSpaceCount`;
- attached public Developer Space summary links;
- clear empty state when no attached public Developer Spaces qualify.

Copy must say the page is derived from public Project metadata and already
public Developer Space observatories.

Copy must not claim:

- institution/lab/company ownership;
- collaboration or membership;
- public Project evidence;
- exports;
- billing;
- hosted runtime;
- provider/model execution;
- queues, Redis, or Cloudflare;
- Discover readiness.

## Required API Tests

Add focused coverage in `apps/api/src/routes/projects.test.ts` or an adjacent
Project test file:

- anonymous public slug returns 200 with only allowed Project fields and public
  Developer Space summaries;
- private, unlisted, and community Projects return 404 anonymously;
- UUID-shaped route identifiers and invalid slugs return 404 or 400 without
  revealing whether a Project exists;
- same-owner public attached Developer Spaces are included;
- private, unlisted, community, unattached, and hostile cross-owner
  `project_id` Developer Spaces are excluded;
- Project ids, owner ids, member rows/counts, connection tier, activity
  counters, usage data, evidence, document rows, document bodies, source ids,
  raw link ids, provider fields, API key metadata, runtime context, snapshots,
  reports, exports, ingestion keys, secrets, SQL, stack traces, and raw JSON
  blobs do not appear in the anonymous response;
- existing owner Project tests still prove owner create/list/detail remain
  auth-required and owner-scoped.

## Required Web/Helper Tests

Add focused web/helper coverage:

- public Project page/helper copy renders profile, count, attached public
  Developer Space summaries, and empty state without overflow-prone labels;
- copy does not claim institutional, collaboration, membership, public
  evidence, export, billing, hosted runtime, provider, queue, Redis,
  Cloudflare, or Discover capability.

Use the existing local web helper/test pattern if available. If a new command
is needed, document it in the DAEDALUS result.

## Validation

Run:

```text
npm exec --yes pnpm@10.32.1 -- run test:projects
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- run lint
git diff --check
git diff --cached --check
```

Also run the focused web/helper test command if it is not covered by
`test:projects`.

## Hard Exclusions

Do not add:

- schema or migrations;
- public Project creation or public transition UI;
- Discover Project cards;
- Project evidence, documents, or document routes;
- public Project reporting/moderation;
- member invitations or member-role authorization;
- institutional/lab/company account ownership;
- Project exports or Project export permissions;
- billing, Stripe, invoices, tax, marketplace, customer records, quotas, or
  tier changes;
- hosted runtime, containers, queues, workers, Redis, Cloudflare, or Developer
  Agent runtime actions;
- Project-authored forum posts;
- provider/model calls, persona-to-persona behavior, voice/avatar media, or
  broad UI redesign.

Never expose owner ids, raw member rows, private Project evidence, private or
draft document routes, document bodies, raw Developer Space event payloads,
private node metrics/snapshots, prompts, completions, provider fields, traces,
reports, export bundle contents, ingestion keys, webhook secrets, env values,
service keys, SQL, stack traces, or raw JSON blobs.

## Review Handoff

When implementation is complete, wake ARGUS:

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS implemented PR239 Public Project Profile Readback.
Risk:
- This adds a new anonymous public Project route/page and must stay profile-only
  with public attached Developer Space summaries.
Task:
- Review implementation and tests against
  docs/roadmap/PR239_PUBLIC_PROJECT_PROFILE_READBACK_DAEDALUS.md.
- Wake MIMIR with ACCEPT / PATCH / REJECT and whether ARIADNE hosted rehearsal
  is required.
```

## DAEDALUS Result - 2026-06-24

Implementation:

- Added anonymous `GET /projects/public/:slug` before `requireAuth`.
- Public route rejects invalid and UUID-shaped slugs, reads only
  `visibility = "public"` Projects, and keeps Project `id` / `owner_user_id`
  as internal join/filter fields only.
- Public Project response includes only:
  - `name`;
  - `slug`;
  - `description`;
  - `visibility`;
  - `createdAt`;
  - `updatedAt`;
  - `publicDeveloperSpaceCount`.
- Attached Developer Space summaries include only same-owner attached public
  Developer Spaces, capped at 12 and sorted by `updated_at` descending then
  `project_name`.
- Summary fields are limited to `projectName`, `slug`, `description`,
  `visibility`, `visualisationType`, `href`, and `updatedAt`.
- Added standalone `/projects/public/[slug]` page with public metadata,
  count, public Developer Space summary links, and empty state.
- Added shared public Project profile response types and focused API/helper
  coverage under `test:projects`.

Boundary notes:

- No Project evidence, documents, activity counters, Discover Project cards,
  reporting/moderation, membership, exports, billing, hosted runtime,
  providers, queues, Redis, Cloudflare, Project-authored forum work, schema, or
  migration changed.
- Tests prove private/unlisted/community Projects remain hidden anonymously,
  unsafe slugs and UUID-shaped route identifiers do not resolve, hostile
  cross-owner `project_id` Developer Spaces are excluded, and forbidden
  internals do not appear in anonymous response JSON.

Validation:

- `npm exec --yes pnpm@10.32.1 -- run test:projects` passed with 11 tests.
- `npm exec --yes pnpm@10.32.1 -- run typecheck` passed.
- `npm exec --yes pnpm@10.32.1 -- run lint` passed with existing raw `<img>`
  warnings in `apps/web/app/space/[slug]/page.tsx` and
  `apps/web/components/discover/discover-front-door.tsx`.
- `git diff --check` passed with CRLF normalization warnings only.
- `git diff --cached --check` passed with CRLF normalization warnings only.

Review:

- ARGUS reviewed with `ACCEPT`.
- MIMIR closeout required.

## ARGUS Result - 2026-06-24

Verdict: `ACCEPT`.

ARGUS found the implementation matches the patched PR238/PR239 lane:

- Anonymous `GET /projects/public/:slug` is mounted before Project auth without
  weakening owner `GET /projects` or `GET /projects/:idOrSlug`.
- Anonymous reads require a safe non-UUID slug and `visibility = "public"`.
- Project `id` and `owner_user_id` are selected only for internal filtering and
  are not serialized.
- Public Developer Space summaries are same-owner, attached, `visibility =
  "public"`, capped at 12, sorted deterministically, and use a purpose-built
  serializer.
- The web page renders only public Project metadata, public Developer Space
  count, same-owner public Developer Space links, and an empty state.

No ARGUS code patch was needed. No schema, public Project creation/transition
UI, Discover cards, evidence, documents, activity counters, reporting,
membership authorization, exports, billing, hosted runtime, provider calls,
queues, Redis, Cloudflare, Project-authored forum work, or broad UI redesign
was introduced.

Validation:

- `npm exec --yes pnpm@10.32.1 -- run test:projects` passed with 11 tests.
- `npm exec --yes pnpm@10.32.1 -- run typecheck` passed.
- `npm exec --yes pnpm@10.32.1 -- run lint` passed with existing raw
  `<img>` warnings only.
- `git diff --check` passed.
- `git diff --cached --check` passed.

ARIADNE:

- Hosted rehearsal required because PR239 adds a new anonymous public route and
  page.
