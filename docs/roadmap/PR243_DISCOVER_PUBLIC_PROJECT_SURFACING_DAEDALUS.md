# PR243 - Discover Public Project Surfacing

Owner: DAEDALUS
Reviewer: ARGUS
Status: Implemented - ARGUS review pending
Opened: 2026-06-24

## Frame

PR239 through PR242 proved the standalone public Project profile route and page:

- anonymous API `GET /projects/public/:slug`;
- anonymous web `/projects/public/[slug]`;
- public-only Project metadata;
- same-owner attached public Developer Space summaries;
- safe slug and private/unsafe route closure;
- hosted desktop/mobile proof.

ARGUS explicitly kept Discover surfacing out of PR239 until that standalone
route was proved. It is now proved, so this lane adds the next narrow public
Project step: routeable Discover search results for already-public Projects.

## Goal

Expose public Projects in Discover search without broadening the public Project
surface.

Users searching Discover should be able to find a public Project by name,
description, or safe slug and open:

```text
/projects/public/:slug
```

## In Scope

- Extend the existing Discover search route with a bounded `projects` result
  bucket, or the repo's closest equivalent if the search response already has a
  generalized result model.
- Query only Projects whose visibility is public.
- Match on public name, description, and safe slug.
- Return a small deterministic result set consistent with existing Discover
  buckets.
- Return only public summary fields needed to render a routeable search card:
  `name`, `slug`, `description`, `visibility`, `href`, and a stable type/label
  such as `Project` or `Public Project`.
- Route cards to `/projects/public/:slug`.
- Render a `Projects` or `Public Projects` bucket in Discover search results.
- Preserve existing empty, persona, Salon, document, and forum search behavior.

## Out of Scope

- Project evidence, documents, document routes, source ids, source bodies, or
  evidence counts.
- Project activity, live state, reports, moderation, members, roles, invites,
  membership counts, or connection tier.
- Project exports, billing, hosted runtime, provider/model execution,
  ingestion keys, webhook secrets, Redis, Cloudflare, queue, worker, or cache
  behavior.
- Home/feed ranking, Featured/Staff Picks curation, global Project directory,
  Project creation UX, owner Project UI changes, or broad visual redesign.
- New migrations unless DAEDALUS proves the existing schema cannot support the
  search safely.

## API Requirements

- Anonymous Discover search must include public Projects only.
- Private, community-only, unlisted, draft, or owner-only Projects must not
  appear.
- Unsafe or UUID-shaped slugs must not produce route hints.
- Payloads must not expose raw Project ids, owner ids, owner id field names,
  member rows, internal link-row ids, internal document ids, raw SQL, raw JSON,
  or stack traces.
- If a Project has attached public Developer Spaces, do not surface their raw
  ids or private configuration through this search lane. Prefer omitting counts
  unless the existing public Project profile helper already exposes a safe
  count that can be reused without extra joins.

## Web Requirements

- Discover search should display routeable Project results with plain public
  summary copy.
- Project cards should not imply institution/lab/company ownership,
  collaboration, membership, evidence, exports, billing, hosted runtime,
  provider execution, Redis, or Cloudflare support.
- Existing Discover controls and buckets should keep working.
- Desktop and mobile layouts should not overflow or overlap when Project
  results are present.

## Validation

Run focused validation before waking ARGUS:

```text
pnpm test:community
pnpm test:projects
pnpm typecheck
pnpm lint
```

If DAEDALUS touches only one side and can justify narrower validation, record
that justification in the wakeup. Otherwise prefer the full list above.

Tests should prove:

- public Projects appear in anonymous Discover search;
- private/non-public Projects do not appear;
- unsafe/UUID slugs do not generate routeable results;
- result payloads omit ids, owner fields, membership, evidence, documents,
  activity, runtime, provider, Redis, and Cloudflare details;
- existing Discover search buckets still behave as before.

## Wakeup

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS implemented PR243 Discover Public Project Surfacing.
Validation:
- List exact commands and results.
Risk:
- Public search routeability and Project payload minimization need hostile
  review.
Task:
- Review Discover public Project search surfacing.
- Confirm public-only visibility, safe slugs, route hints, payload minimization,
  and existing Discover behavior.
- Wake MIMIR with accept/fail/block verdict.
```
