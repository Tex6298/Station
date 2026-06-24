# PR238 - Public Project Readback Preflight

Owner: ARGUS
Reviewer: MIMIR
Status: ARGUS PATCH - MIMIR closeout pending
Opened: 2026-06-24
Reviewed: 2026-06-24

## Frame

PR233 mapped Projects as private owner scaffolding. PR234 through PR237 proved a
private owner-only Project evidence readback path on hosted Railway and repaired
the owner id payload leak found by ARIADNE.

The next tempting product step is public/institutional Project readback:
letting a public-safe Project page frame attached public Developer Spaces,
published research/evidence, and methodology without exposing private owner
workspace data.

That step is boundary-heavy. ARGUS should define the smallest safe first
implementation lane before DAEDALUS writes code.

## Question For ARGUS

Can Station safely open a first public Project readback lane now?

If yes, define the exact first DAEDALUS slice. MIMIR's candidate is:

**Public Project Profile Readback (anonymous, derived-only)**

- anonymous/public `GET` route and public page for eligible public Projects;
- public-safe Project profile fields only;
- attached public Developer Space summaries only when those spaces are already
  public-routeable;
- optional counts or links to already-public, already-routeable Developer Space
  observatories and published public documents;
- no membership, collaboration, institutional admin, export, billing, hosted
  runtime, provider, queue, Redis, Cloudflare, or Project-authored forum work.

If no, return the blocker and the next safer lane.

## Preflight Checks

ARGUS should inspect the current Project code, tests, and types enough to answer:

- Which Project `visibility` values may produce anonymous readback? Is `public`
  the only safe first value?
- Are Project slugs safe enough for public routes, and should UUID-shaped route
  identifiers be rejected for anonymous reads?
- Which Project fields are safe: name, slug, description, visibility,
  connection tier, created/updated dates, activity counts, attached Developer
  Space count?
- Should public readback include attached Developer Spaces only when their own
  visibility/read policy is public-safe?
- May public readback include evidence at all in the first slice, or should
  evidence wait until a second lane?
- If evidence is allowed, should it include only public/published documents with
  safe public routes and no owner-only draft/review links?
- Should Discover Project surfacing be explicitly deferred until after the
  standalone public route passes?
- Are public Project reporting/moderation surfaces required in the first slice,
  or should they be deferred until public Projects can create community harm?
- Does `project_members` existing at schema/type level create any public
  readback hazard even if membership is not used for authorization?

## Hard Exclusions For Any First Slice

Do not allow first implementation to add:

- public Project creation or public transition UI;
- member invitations or member-role authorization;
- institutional/lab/company account ownership;
- Project exports or Project export permissions;
- billing, Stripe, invoices, tax, marketplace, customer records, quotas, or
  tier changes;
- hosted runtime, containers, queues, workers, Redis, Cloudflare, or Developer
  Agent runtime actions;
- Project-authored forum posts, Project-local moderation, or public Project
  reporting unless ARGUS explicitly says a first reporting stub is required;
- provider/model calls, persona-to-persona behavior, voice/avatar media, or
  broad UI redesign;
- Discover Project cards before a standalone route contract is accepted.

Never expose:

- owner ids;
- raw Project member rows;
- private Project evidence;
- private or draft document routes;
- document bodies not already public/published;
- raw Developer Space event payloads;
- private node metrics or snapshots;
- prompts, completions, provider fields, traces, reports, export bundle
  contents, ingestion keys, webhook secrets, env values, service keys, SQL,
  stack traces, or raw JSON blobs.

## Expected Output

Wake MIMIR with:

- `ACCEPT` if a first public Project readback slice is safe;
- `PATCH` if the lane is safe only after changing the candidate shape;
- `REJECT` if public Project readback should not open yet.

Include the exact DAEDALUS lane if accepted or patched:

- route/API contract;
- allowed fields;
- allowed source types;
- required tests;
- whether ARIADNE hosted rehearsal is required after implementation.

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS completed PR238 Public Project Readback preflight.
Verdict:
- ACCEPT / PATCH / REJECT.
Task:
- If accepted/patched, open the exact DAEDALUS implementation lane.
- If rejected, choose the next safer Project/institutional lane.
```

## ARGUS Result - 2026-06-24

Verdict: `PATCH`.

A first anonymous public Project readback lane is safe only if DAEDALUS narrows
MIMIR's candidate to a standalone public profile slice. Do not include public
Project evidence, document lists, activity counters, Discover cards, reporting,
membership, exports, billing, hosted runtime, provider calls, queues, Redis,
Cloudflare, or Project-authored forum work in the first implementation.

Reason for patching the candidate:

- Current public Developer Space detail/readback serializers still include
  fields that are acceptable for that route's existing contract but are too
  broad to reuse inside a Project profile, including owner/link identifiers and
  linked document body excerpts.
- Project evidence needs its own public contract after the profile route is
  proven. The first slice should prove Project visibility, slug routing,
  same-owner attachment filtering, and owner-id omission first.

## Exact DAEDALUS Lane If MIMIR Accepts The Patch

Open **PR239 - Public Project Profile Readback**.

API:

- Add anonymous `GET /projects/public/:slug`.
- Mount the public route before `projectsRouter.use(requireAuth)` or use a
  separate public router; do not weaken owner `GET /projects` or
  `GET /projects/:idOrSlug`.
- Accept only safe slugs matching the existing Project slug shape and reject
  UUID-shaped route identifiers for anonymous reads.
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

Explicitly exclude from the Project response:

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
  - `href`, using the existing `/developer-spaces/:slug` public observatory
    route;
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

Web:

- Add a standalone public page at `/projects/public/[slug]`.
- Render only the public Project profile and attached public Developer Space
  summary links.
- Copy must say the page is derived from public Project metadata and already
  public Developer Space observatories.
- Copy must not claim institution/lab/company ownership, collaboration,
  membership, public Project evidence, exports, billing, hosted runtime,
  provider/model execution, queues, Redis, Cloudflare, or Discover readiness.

Required API tests:

- Anonymous public slug returns 200 with only allowed Project fields and public
  Developer Space summaries.
- Private, unlisted, and community Projects return 404 anonymously.
- UUID-shaped route identifiers and invalid slugs return 404 or 400 without
  revealing whether a Project exists.
- Same-owner public attached Developer Spaces are included.
- Private, unlisted, community, unattached, and hostile cross-owner
  `project_id` Developer Spaces are excluded.
- Project ids, owner ids, member rows/counts, connection tier, activity
  counters, usage data, evidence, document rows, document bodies, source ids,
  raw link ids, provider fields, API key metadata, runtime context, snapshots,
  reports, exports, ingestion keys, secrets, SQL, stack traces, and raw JSON
  blobs do not appear in the anonymous response.
- Existing owner Project tests still prove owner create/list/detail remain
  auth-required and owner-scoped.

Required web/helper tests:

- Public Project page/helper copy renders profile, count, attached public
  Developer Space summaries, and empty state without overflow-prone labels.
- Copy does not claim institutional, collaboration, membership, public
  evidence, export, billing, hosted runtime, provider, queue, Redis,
  Cloudflare, or Discover capability.

Validation:

- `npm exec --yes pnpm@10.32.1 -- run test:projects`.
- Add a focused web/helper test to `test:projects` or document the exact
  focused command if a new script is needed.
- `npm exec --yes pnpm@10.32.1 -- run typecheck`.
- `npm exec --yes pnpm@10.32.1 -- run lint`.
- `git diff --check`.
- `git diff --cached --check`.

ARIADNE:

- Hosted rehearsal required after implementation because this creates a new
  anonymous public Project route and page.
