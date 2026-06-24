# PR246 - Public Project Evidence Minimal Readback

Owner: DAEDALUS
Reviewer: ARGUS
Status: ARGUS ACCEPT - PR247 hosted rehearsal open
Opened: 2026-06-24
Reviewed: 2026-06-24

## Frame

ARGUS completed PR245 with a `PATCH` verdict. Public Project evidence/readback
may proceed only as a narrowed first slice.

The private owner Project evidence serializer is not public-safe and must not
be reused for visitors. It carries owner-only semantics and can include internal
ids, private draft routes, and owner review state. PR246 must build a separate
public serializer.

## Goal

Add minimal visitor-safe evidence readback to the existing public Project
profile route:

```text
GET /projects/public/:slug
```

The new payload field is:

```text
publicEvidence: []
```

Use `publicEvidence`, not `evidence`, to keep the public shape distinct from
owner-only Project evidence.

## API Scope

- Extend the existing `GET /projects/public/:slug` response.
- Do not add a separate unauthenticated endpoint in this first slice.
- Keep existing public Project slug validation, UUID-shaped slug rejection, and
  `visibility = public` Project lookup.
- Keep the existing `developerSpaces` bucket behavior intact.
- Add a small deterministic limit, recommended
  `PUBLIC_PROJECT_EVIDENCE_LIMIT = 8`.

Allowed source predicates:

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
  `/developer-spaces/:slug`;
- `sourceLabel`, fixed to safe copy such as `Public Developer Space`;
- `publishedAt` if present;
- `updatedAt`.

Private-only evidence behavior:

- If a public Project has private owner evidence but no rows satisfying the
  public evidence predicates, return `publicEvidence: []`.
- Do not expose a private evidence count, private evidence empty-state hint, or
  copy implying hidden research exists.

## Web Scope

- Update the public Project profile UI to render the `publicEvidence` bucket if
  present.
- Use conservative copy such as `Public evidence` or `Public references`.
- If empty, use a neutral public-only empty state. Do not imply private evidence
  exists.
- Cards should link only to `/developer-spaces/:slug`.
- Do not change owner Project pages, Discover search, billing, memberships, or
  broad styling.

## Hard Exclusions

Do not add or expose:

- raw document ids, Project ids, Developer Space ids, owner ids, author ids, or
  link-row ids;
- raw document body, body excerpts, summaries, source ids, raw source labels,
  source types, source bodies, raw JSON, SQL, or stack traces;
- private, draft, owner-only, archived, deleted, hidden, removed, unlisted, or
  community-only documents;
- private, unlisted, or community Developer Spaces;
- direct public document links;
- activity counters, member rows, roles, invites, reports, exports, billing,
  connection tier, hosted runtime, providers, Redis, Cloudflare, queues,
  workers, caches, env values, or secrets;
- new migrations or broad Project UI redesign;
- copy implying membership, institution/lab/company ownership, collaboration,
  hosted runtime, billing, provider execution, Redis, Cloudflare, exports,
  unpublished research access, or private evidence availability.

## Required Tests

Add or update tests proving:

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
- Web helper copy does not imply membership, institution/lab/company ownership,
  collaboration, hosted runtime, billing, provider execution, Redis,
  Cloudflare, exports, unpublished research access, or private evidence
  availability.

## Validation

Run:

```text
npm exec --yes pnpm@10.32.1 -- run test:projects
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- run lint
git diff --check
git diff --cached --check
```

If auth middleware or public route matchers change, also run:

```text
npm exec --yes pnpm@10.32.1 -- run test:auth
```

## ARGUS Review - 2026-06-24

Verdict: `ACCEPT` with one narrow review patch.

ARGUS reviewed PR246 against the narrowed PR245 scope. The implementation
matches the approved lane:

- `GET /projects/public/:slug` adds `publicEvidence` and does not add a
  separate unauthenticated endpoint.
- The public evidence loader is separate from the owner-only Project evidence
  serializer.
- Public evidence requires a public Project, same-owner attached public
  Developer Space, same-owner public link row, and same-owner published public
  document.
- Serialized evidence is limited to `title`, `kind`, `href`, fixed
  `sourceLabel`, optional `publishedAt`, and `updatedAt`.
- Evidence links only to `/developer-spaces/:slug`.
- Private-only evidence and no-evidence Projects return neutral
  `publicEvidence: []`.
- No private owner evidence shape, direct document links, document bodies or
  excerpts, raw source labels, ids, owner/member fields, activity, reports,
  exports, billing, hosted runtime, providers, Redis, Cloudflare, queues,
  workers, migrations, or broad UI redesign were added.

ARGUS review patch:

- The public Project page now defaults missing `profile.publicEvidence` to `[]`
  so an out-of-order web/API deployment cannot crash the anonymous public page.

Validation:

- `npm exec --yes pnpm@10.32.1 -- run test:projects` passed with 13 tests.
- `npm exec --yes pnpm@10.32.1 -- run typecheck` passed.
- `npm exec --yes pnpm@10.32.1 -- run lint` passed with the existing raw
  `<img>` warnings in `apps/web/app/space/[slug]/page.tsx` and
  `apps/web/components/discover/discover-front-door.tsx`.
- `git diff --check` passed with CRLF warnings only.
- `git diff --cached --check` passed.

Hosted rehearsal:

- Required before closeout. PR246 changes anonymous public Project API payload
  and page UI, so MIMIR should open an ARIADNE hosted anonymous desktop/mobile
  public Project evidence rehearsal before closing this loop.

## MIMIR Decision - 2026-06-24

MIMIR accepts ARGUS's review and opens hosted rehearsal before closeout.

Next:

- `docs/roadmap/PR247_PUBLIC_PROJECT_EVIDENCE_HOSTED_REHEARSAL_ARIADNE.md`.

## Wakeup

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS implemented PR246 Public Project Evidence Minimal Readback.
Validation:
- List exact commands and results.
Risk:
- Public Project evidence serialization, same-owner public predicates, and
  private-evidence non-disclosure need hostile review.
Task:
- Review the PR246 implementation against ARGUS's narrowed PR245 scope.
- Confirm the private owner evidence serializer is not reused for visitors.
- Wake MIMIR with ACCEPT / FAIL / BLOCKED and whether ARIADNE hosted rehearsal
  is required.
```
