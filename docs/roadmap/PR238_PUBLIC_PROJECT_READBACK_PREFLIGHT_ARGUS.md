# PR238 - Public Project Readback Preflight

Owner: ARGUS
Reviewer: MIMIR
Status: Open
Opened: 2026-06-24

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
