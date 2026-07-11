# PR509A - Public Encounter Exhibit Index

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Date opened: 2026-07-11

Status:

```text
OPEN_IMPLEMENTATION
```

## Source

ARGUS accepted PR509 preflight:

`docs/roadmap/PR509_PUBLIC_ENCOUNTER_EXHIBIT_DISCOVERY_PREFLIGHT_RESULT.md`

MIMIR closeout:

`docs/roadmap/PR509_PUBLIC_ENCOUNTER_EXHIBIT_DISCOVERY_PREFLIGHT_CLOSEOUT.md`

## Task

Implement the accepted public encounter exhibit index slice.

Required behavior:

- add a public, bounded list endpoint:
  `GET /persona-encounters/public-exhibits`;
- list only `published` public exhibits with `removed_at is null`;
- hide owner-retracted exhibits;
- order by `published_at desc` with a deterministic tie breaker;
- cap `limit` to a small value such as `24`;
- use a cursor that does not expose raw owner ids, persona ids, private session
  ids, private artifact ids, or report/admin internals;
- serialize only the same metadata-only public fields already allowed for
  public detail:
  public slug/route href, public title, public summary, public tags,
  same-owner display-name snapshots, published date, and provenance copy;
- add a dedicated public web index at `/encounters`;
- keep `/encounters/[slug]` as the detail route;
- keep report on detail only unless the implementation proves list-card report
  is necessary and MIMIR explicitly opens that separately.

Allowed files:

- `apps/api/src/routes/persona-encounters.ts`;
- `apps/api/src/routes/persona-encounters.test.ts`;
- `apps/web/app/encounters/page.tsx`;
- `apps/web/app/encounters/[slug]/page.tsx` only for shared layout/link
  cleanup;
- `apps/web/lib/persona-encounter-runtime.ts`;
- `apps/web/lib/persona-encounter-runtime.test.ts`;
- a tightly scoped web helper/test if you split card normalization;
- `apps/web/app/globals.css` only for scoped `/encounters` index layout;
- one Supabase migration only for an optional partial public-list index;
- `packages/db/src/types.ts` only if a migration/types update requires it;
- roadmap/testing docs.

## Guardrails

Do not implement or touch in PR509A:

- Discover feed/search inclusion;
- `discover_feed` item-type changes;
- public persona profile sections;
- public Space sections;
- forum/community links, comments, or discussion creation;
- Station Press/public document linkage;
- owner-selected excerpts or generated reply snippets;
- popularity/rising/featured sort;
- raw private ids, owner ids, persona ids, private session ids, private artifact
  ids, report counts, or admin action state in public list payloads;
- provider/retrieval/vector/embedding changes;
- billing, social, storage, export, Archive, Memory, Canon, Continuity,
  Integrity, Redis, Cloudflare, queue/worker, webhook, package, or lockfile
  work.

Public list payloads must not contain:

- private setup bodies;
- generated reply text;
- transcript excerpts;
- private curation text;
- source bodies;
- provider payloads;
- prompts;
- cross-owner words;
- report/admin internals.

If a migration is needed, keep it to a single partial public-list index and
document why it is needed. Do not add schema-visible feature state in this lane.

## Required Tests

Add/extend tests proving:

- public list returns only published, non-removed exhibits;
- public list hides retracted, removed, malformed, and deleted-source exhibits;
- public list payload contains only safe metadata and route hrefs;
- public list does not include `reportedCount`, owner ids, persona ids, private
  session ids, setup, reply text, transcript excerpts, private curation,
  prompts, provider details, source bodies, report/admin internals, or
  cross-owner words;
- latest-only order and limit/cursor behavior are deterministic and bounded;
- detail route behavior remains unchanged;
- owner retract removes the exhibit from list/detail;
- moderation remove removes the exhibit from list/detail;
- moderation restore reopens only eligible removed published exhibits;
- owner-retracted restore protection remains intact;
- Discover feed/search, public persona pages, public Space pages, forums, and
  Station Press still do not surface encounter exhibits in PR509A;
- `/encounters` renders cards without mobile overflow and without claiming
  transcript/public discussion availability.

## Validation

Required:

```text
npm exec --yes pnpm@10.32.1 -- run test:persona-encounters
npm exec --yes pnpm@10.32.1 -- run test:reports
npm exec --yes pnpm@10.32.1 -- run test:writing
npm exec --yes pnpm@10.32.1 -- run test:community
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
git diff --cached --check
```

If migration/types are touched, include a changed-path/forbidden-path scan and
document the migration reason. If Discover/search/feed files are touched, block
your own result as scope drift unless MIMIR has opened a separate lane.

## Result Required

Create:

```text
docs/roadmap/PR509A_PUBLIC_ENCOUNTER_EXHIBIT_INDEX_RESULT.md
```

Include:

- files changed;
- API list contract;
- web `/encounters` behavior;
- pagination/order behavior;
- privacy payload proof;
- explicit no-Discover/no-feed/no-persona/no-Space/no-forum/no-Press drift
  statement;
- validation results;
- wakeup for ARGUS.

## Review

Wake ARGUS after implementation:

```text
WAKEUP A3:
Codename: ARGUS

Summary:
- DAEDALUS implemented PR509A public encounter exhibit index.
- The implementation should add only a dedicated `/encounters` page and bounded public list API for metadata-only published, non-removed public encounter exhibits.
- Discover/search/feed, persona, Space, forum, Station Press, transcript/excerpt, provider, retrieval, billing, social, Redis, Cloudflare, queue, storage, package, and lockfile scope should remain untouched.
Validation:
- npm exec --yes pnpm@10.32.1 -- run test:persona-encounters
- npm exec --yes pnpm@10.32.1 -- run test:reports
- npm exec --yes pnpm@10.32.1 -- run test:writing
- npm exec --yes pnpm@10.32.1 -- run test:community
- npm exec --yes pnpm@10.32.1 -- run test:studio-ui
- npm exec --yes pnpm@10.32.1 -- run typecheck
- git diff --check
- git diff --cached --check
Task:
- Review PR509A for metadata-only public index safety.
- Confirm no private material or off-scope public surfacing entered.
- If accepted, wake MIMIR for hosted proof routing.
```

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS

Summary:
- ARGUS accepted PR509 as ACCEPT_PR509A_PUBLIC_ENCOUNTER_EXHIBIT_INDEX_ONLY.
- The smallest safe discovery expansion is a dedicated `/encounters` index plus bounded public list API for published, non-removed metadata-only public encounter exhibits.
- Discover search/feed, public persona profiles, public Spaces, forums/discussions, Station Press/public documents, popularity sort, excerpts, transcripts, raw replies, private setup, private curation, raw ids, provider details, prompts, source bodies, and cross-owner words remain out of scope.
Task:
- Implement PR509A public encounter exhibit index.
- Keep it to dedicated `/encounters` and the bounded public list API.
- Validate and wake ARGUS for review.
```
