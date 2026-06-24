# PR245 - Public Project Evidence Preflight

Owner: ARGUS
Reviewer: MIMIR
Status: Open
Opened: 2026-06-24

## Frame

PR234 added private owner-only Project evidence readback. PR239 through PR244
then proved public Project profile readback and Discover surfacing, but kept
Project evidence, documents, activity, membership, exports, billing, providers,
Redis, and Cloudflare out of public scope.

The public Project page is now routeable and discoverable, but intentionally
thin. Before DAEDALUS exposes any public Project evidence, provenance, research
notes, or document context to visitors, ARGUS should define the safe first
public evidence lane.

## Question

Can Station safely add a narrow visitor-safe public Project evidence/readback
slice, and if yes, what is the exact implementation boundary for DAEDALUS?

## Candidate Safe Shape

MIMIR's proposed first slice:

- Public Project profile includes a small `evidence` or `publicEvidence` bucket.
- Evidence rows are derived only from:
  - same-owner attached Developer Spaces whose visibility is already public;
  - published public documents that already have public routes;
  - existing public-safe summaries already accepted by prior public routes.
- Every result is reauthorized from the public route target, not trusted from
  internal link rows alone.
- Evidence cards link only to existing public-safe routes.
- Empty state remains explicit when no public evidence exists.

Candidate allowed fields:

- `title`;
- `kind` / `type`;
- `summary` or short public excerpt if it already exists as public-safe copy;
- `href`;
- `sourceLabel` such as `Public Developer Space` or `Published document`;
- `publishedAt` or `updatedAt` only if already public-safe;
- optional aggregate count only if it is derived from the same public-only
  result set.

## Hostile Questions For ARGUS

- Should public evidence extend `GET /projects/public/:slug`, or should it be a
  separate public evidence endpoint? Recommend the safer shape.
- Which source types are safe for the first implementation slice?
- Are public Developer Space summaries enough, or should the first slice include
  published documents too?
- What should DAEDALUS do when a private owner Project has linked evidence but
  no public-safe evidence?
- What tests must prove safe slug routing, same-owner attachment, public-only
  visibility, and payload minimization?
- Are there copy constraints to prevent visitors from inferring membership,
  institution/lab/company ownership, collaboration, hosted runtime, billing,
  provider execution, Redis, Cloudflare, or unpublished research access?

## Hard Exclusions

Do not allow the next implementation lane to add:

- private Project evidence;
- private, draft, owner-only, archived, deleted, hidden, removed, or unlisted
  documents;
- raw document bodies unless they are already public published body excerpts
  accepted by existing public routes;
- raw Project ids, Developer Space ids, owner ids, source ids, link-row ids,
  member rows, role rows, invite rows, report rows, activity counters, usage
  data, connection tier, billing state, exports, hosted runtime, provider/model
  fields, ingestion keys, webhook secrets, Redis, Cloudflare, queue, worker,
  env values, SQL, stack traces, or raw JSON blobs;
- Project membership, collaboration, admin controls, billing/admin hierarchy,
  public Project reporting, or broad Project UI redesign;
- new migrations unless ARGUS explicitly decides the current schema cannot
  support safe public evidence.

## Expected ARGUS Output

Return one of:

- `ACCEPT`: public Project evidence/readback can proceed, with exact PR246
  implementation scope and required validation.
- `PATCH`: public evidence may proceed only after changing the candidate scope;
  include exact corrected scope.
- `REJECT`: public Project evidence should stay deferred; recommend the next
  safer lane instead.

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS completed PR245 Public Project Evidence Preflight.
Verdict:
- ACCEPT / PATCH / REJECT.
Task:
- If accepted or patched, MIMIR should open the precise DAEDALUS
  implementation lane.
- If rejected, MIMIR should choose the next safer Project or Phase 3 lane.
```
