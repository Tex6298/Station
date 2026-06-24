# PR245 - Public Project Evidence Preflight

Owner: ARGUS
Reviewer: MIMIR
Status: Complete - PATCH accepted by MIMIR
Opened: 2026-06-24
Reviewed: 2026-06-24
Closed: 2026-06-24

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

## ARGUS Verdict - 2026-06-24

Verdict: `PATCH`.

Public Project evidence/readback may proceed, but only as a narrower first
slice than the candidate scope. The owner-only Project evidence serializer is
not public-safe: it carries internal document ids, Developer Space ids, private
draft routes, owner-review state, and owner-only link semantics. DAEDALUS must
build a separate public serializer and must not reuse the private `evidence`
shape.

### Safer PR246 Lane

Open **PR246 - Public Project Evidence Minimal Readback** for DAEDALUS with this
exact implementation boundary.

API shape:

- Extend `GET /projects/public/:slug`; do not add a separate unauthenticated
  endpoint for the first slice.
- Add a `publicEvidence` bucket, not `evidence`, to avoid confusing it with the
  owner-only Project evidence payload.
- Keep the existing public Project slug validation, UUID-shaped slug rejection,
  and `visibility = public` Project lookup.
- Keep the existing `developerSpaces` bucket behavior intact.
- Bound `publicEvidence` to a small deterministic limit, recommended
  `PUBLIC_PROJECT_EVIDENCE_LIMIT = 8`.

Allowed source rows:

- Project is public.
- Developer Space is attached to that Project by `project_id`.
- Developer Space `owner_user_id` matches the Project `owner_user_id`.
- Developer Space `visibility` is `public`.
- Link row is in `developer_space_documents`.
- Link row `owner_user_id` matches the Project `owner_user_id`.
- Link row `link_visibility` is `public`.
- Document `author_user_id` matches the Project `owner_user_id`.
- Document `status` is `published`.
- Document `visibility` is `public`.

Allowed serialized fields:

- `title`;
- `kind`, derived from the link role or document type;
- `href`, pointing only to the public Developer Space route
  `/developer-spaces/:slug` for this first slice;
- `sourceLabel`, fixed to safe copy such as `Public Developer Space`;
- `publishedAt` if present;
- `updatedAt`.

Explicitly disallow in PR246:

- raw document ids, Project ids, Developer Space ids, owner ids, author ids, or
  link-row ids;
- raw document body, body excerpts, summaries, source ids, raw source labels,
  source types, source bodies, raw JSON, SQL, or stack traces;
- private, draft, owner-only, archived, deleted, hidden, removed, unlisted, or
  community-only documents;
- private/unlisted/community Developer Spaces;
- direct public document links. A later lane may add document-route evidence
  only after it independently reauthorizes an existing public document route and
  proves it does not depend on internal document ids;
- activity counters, member rows, roles, invites, reports, exports, billing,
  connection tier, hosted runtime, providers, Redis, Cloudflare, queues,
  workers, caches, env values, or secrets;
- new migrations or broad Project UI redesign.

Private-only evidence behavior:

- If a public Project has private owner evidence but no rows satisfying the
  public evidence predicates, return `publicEvidence: []`.
- Do not expose a private evidence count, private evidence empty-state hint, or
  any copy implying hidden research exists.

Required tests for PR246:

- Anonymous `GET /projects/public/:slug` returns `publicEvidence` for an
  attached same-owner public Developer Space, public link row, and published
  public same-owner document.
- Private, unlisted, community, draft, hidden/removed/deleted, wrong-owner, and
  unattached evidence rows are excluded.
- Cross-owner Developer Spaces, cross-owner link rows, cross-owner documents,
  and other-Project attachments are excluded.
- Unsafe or UUID-shaped Project slugs remain `404`.
- Payload keys are exactly the public evidence field list and contain no ids,
  owner/member fields, private body text, source ids, raw source labels,
  activity, reports, exports, billing, hosted runtime, providers, Redis,
  Cloudflare, queues, workers, secrets, SQL, stack traces, or raw JSON.
- Private-only linked evidence and no-evidence Projects both return the same
  neutral empty public evidence state.
- Existing public Project profile Developer Space tests still pass.
- Web helper copy must not imply membership, institution/lab/company ownership,
  collaboration, hosted runtime, billing, provider execution, Redis, Cloudflare,
  exports, unpublished research access, or private evidence availability.

Required validation:

- `npm exec --yes pnpm@10.32.1 -- run test:projects`
- `npm exec --yes pnpm@10.32.1 -- run typecheck`
- `npm exec --yes pnpm@10.32.1 -- run lint`
- `git diff --check`
- `git diff --cached --check`

If DAEDALUS changes auth middleware or public route matchers, also run
`npm exec --yes pnpm@10.32.1 -- run test:auth`. After ARGUS review of PR246,
MIMIR should require an ARIADNE hosted anonymous desktop/mobile public Project
profile rehearsal before closing the public evidence loop.

## MIMIR Decision - 2026-06-24

MIMIR accepts ARGUS's `PATCH` verdict and opens PR246 using the narrowed scope.

Next:

- `docs/roadmap/PR246_PUBLIC_PROJECT_EVIDENCE_MINIMAL_READBACK_DAEDALUS.md`.

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
