# PR509 - Public Encounter Exhibit Discovery Preflight Result

Owner: ARGUS / A3

Date: 2026-07-11

Status: Accepted

## Verdict

```text
ACCEPT_PR509A_PUBLIC_ENCOUNTER_EXHIBIT_INDEX_ONLY
```

ARGUS accepts discovery expansion only as a dedicated public encounter exhibit
index lane. The next safe implementation is a small PR509A slice that makes
hosted-proven metadata-only public encounter exhibits easier to find at a
dedicated `/encounters` surface before they enter Discover search, feed,
persona, Space, forum, Station Press, or document surfaces.

This is not approval for public transcript publication, owner-selected
excerpts, raw generated responder replies, private setup, private curation,
source bodies, provider payloads, prompts, source retrieval, cross-owner persona
words, popularity/rising sort, comments, discussions, Space attachment, persona
profile attachment, Discover feed inclusion, Discover search inclusion, forum
linkage, Station Press inclusion, billing/social/storage/provider work,
queue/worker/Redis/Cloudflare work, or public launch claims.

MIMIR should route DAEDALUS for PR509A if accepted.

## Evidence Reviewed

ARGUS reviewed:

- `apps/api/src/routes/persona-encounters.ts`;
- `apps/api/src/routes/persona-encounters.test.ts`;
- `apps/api/src/routes/reports.ts`;
- `apps/api/src/routes/reports.test.ts`;
- `apps/web/app/encounters/[slug]/page.tsx`;
- `apps/web/lib/persona-encounter-runtime.ts`;
- `apps/api/src/routes/discover.ts`;
- `apps/web/components/discover/discover-front-door.tsx`;
- `apps/web/components/discover/search-dropdown.tsx`;
- `apps/web/lib/discover-feed-controls.ts`;
- `apps/web/lib/writing-feed.ts`;
- public persona route/event code in `apps/api/src/routes/personas.ts`;
- public Space route code in `apps/api/src/routes/spaces.ts`;
- migration `076_persona_encounter_public_exhibits.sql`;
- PR508/PR508A/PR508C/PR508D roadmap result docs.

Current implementation facts:

- public exhibit detail readback exposes only slug, public title, public
  summary, public tags, same-owner display-name snapshots, published date,
  provenance copy, and signed-in report affordance;
- public reads filter to `status = "published"` and non-removed rows;
- report creation by slug persists the public exhibit UUID as the moderation
  target;
- admin remove/restore is UUID-based and preserves owner-retracted protection;
- Discover feed/search currently draws from documents, threads, spaces,
  projects, developer spaces, salons, and public personas, not encounter
  exhibits;
- public persona events are derived from published documents and public
  discussions, not encounter exhibits;
- public Space pages show Space pages, documents, and eligible public personas,
  not encounter exhibits;
- `discover_feed` is a separate public-read surface with its own item-type
  contract and should not absorb encounter exhibits in PR509A.

## Surface Classification

| Surface | Classification | ARGUS decision |
| --- | --- | --- |
| Dedicated public encounter exhibit index | Safe now as PR509A | Add `/encounters` and a bounded public list API returning metadata-only published exhibits. |
| Discover search result group | Safe only after PR509A hosted proof | Do not include in PR509A; later lane must add explicit search tests and no-drift checks. |
| Discover feed new/rising/featured | Unsafe for protected alpha now | Needs separate feed item contract, moderation/popularity semantics, and likely schema/curation migration. |
| Public persona profile section | Unsafe now | Exhibit rows carry display snapshots, not safe public persona attachment/consent state. |
| Public Space section | Unsafe now | Space attachment must be an explicit owner publishing action in a later lane. |
| Forum/community discussion linkage | Unsafe now | Comments/discussion need separate moderation, visibility, and participation preflight. |
| Public document or Station Press linkage | Not worth implementing yet | This would blur exhibit metadata with documents/publications and invite excerpt/transcript pressure. |
| No surfacing yet | Too conservative | PR508D hosted proof is enough for a dedicated index, provided it remains metadata-only and isolated. |

## Boundary Answers

1. Safe metadata outside `/encounters/[slug]`:
   public slug/route href, public title, public summary, public tags,
   same-owner display-name snapshots, published date, and provenance label/copy.
   A list card should not expose `reported_count`, raw owner ids, source persona
   ids, private session ids, private setup, generated reply text, transcript
   excerpts, private curation, prompts, provider details, source bodies, or
   report/admin internals.

2. Yes, public encounter exhibits should have a dedicated index/list route
   before Discover/search/feed. It gives the product a narrow discovery
   surface whose whole job is encounter exhibits, without widening the public
   global search/feed contracts.

3. Do not attach exhibits to public persona pages in PR509A. Same-owner display
   snapshots are safe as labels, but they are not a public persona route
   contract. A later persona-attachment lane would need explicit public persona
   ids/slugs, owner intent, retract behavior, and tests for private/non-public
   persona leakage.

4. Do not attach exhibits to public Spaces in PR509A. Space placement should be
   an explicit owner publishing action with its own state, not an inference from
   owner id or persona ownership.

5. Do not add public comments or discussion now. Report remains the only public
   interaction for encounter exhibits in PR509A.

6. Safe sort/filter state is latest-only: `published_at desc`, bounded `limit`,
   and an opaque or public-field cursor. No rising, featured, popularity,
   reported-count, discussion-count, owner-rank, or provider-derived sort.

7. Discovery surfaces must hide retracted and removed exhibits immediately.
   Admin restore may re-open only eligible removed published exhibits; a row
   with owner `retracted_at` must return to `retracted` and stay absent from
   index/detail.

8. Tests must assert list/detail payloads exclude private setup, generated
   reply text, transcript excerpts, private curation text, raw private ids,
   source persona ids, owner ids, source bodies, provider payloads, prompts,
   cross-owner words, report counts, and admin internals.

## Recommended PR509A Lane

Name:

```text
PR509A - Public Encounter Exhibit Index
```

Owner: DAEDALUS / A2

Implement:

- `GET /persona-encounters/public-exhibits` as a public, bounded list endpoint;
- list only rows where `status = "published"` and `removed_at is null`;
- order by `published_at desc` with a deterministic tie breaker;
- cap `limit` to a small value such as `24`;
- use a cursor that does not expose raw private or owner ids;
- serialize card payloads from the same metadata-only public fields already
  used by `GET /persona-encounters/public-exhibits/:slug`;
- add `apps/web/app/encounters/page.tsx` as the dedicated public index;
- add small helper/type support in `apps/web/lib/persona-encounter-runtime.ts`;
- if DAEDALUS adds a migration, limit it to a single partial public-list index,
  for example on `(published_at desc, id)` where `status = 'published'` and
  `removed_at is null`;
- keep `/encounters/[slug]` as the detail route and keep report on detail only
  unless MIMIR explicitly accepts a list-card report affordance.

Allowed files:

- `apps/api/src/routes/persona-encounters.ts`;
- `apps/api/src/routes/persona-encounters.test.ts`;
- `apps/web/app/encounters/page.tsx`;
- `apps/web/app/encounters/[slug]/page.tsx` only for shared layout/link cleanup;
- `apps/web/lib/persona-encounter-runtime.ts`;
- `apps/web/lib/persona-encounter-runtime.test.ts`;
- a tightly scoped web helper/test if DAEDALUS splits card normalization;
- `apps/web/app/globals.css` only for scoped `/encounters` index layout;
- one Supabase migration only for the optional partial public-list index;
- `packages/db/src/types.ts` only if the migration/types generator requires it;
- roadmap/testing docs.

Forbidden in PR509A:

- Discover feed/search inclusion;
- `discover_feed` item-type changes;
- public persona profile sections;
- public Space sections;
- forum/community links, comments, or discussion creation;
- Station Press/public document linkage;
- owner-selected excerpts or generated reply snippets;
- raw private ids, owner ids, persona ids, private session ids, report counts,
  or admin action state in public list payloads;
- provider/retrieval/vector/embedding changes;
- billing, social, storage, export, Archive, Memory, Canon, Continuity,
  Integrity, Redis, Cloudflare, queue/worker, webhook, package, or lockfile
  work.

Required PR509A tests:

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
- web helper/page tests prove `/encounters` renders cards without overflowing
  mobile layout or claiming transcript/public discussion availability.

Required PR509A validation:

```text
npm exec --yes pnpm@10.32.1 -- run test:persona-encounters
npm exec --yes pnpm@10.32.1 -- run test:reports
npm exec --yes pnpm@10.32.1 -- run test:writing
npm exec --yes pnpm@10.32.1 -- run test:community
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

If DAEDALUS touches migration/types, add a migration/types review and a
changed-path/forbidden-path scan. If DAEDALUS touches public Discover/search
despite this handoff, block the lane as scope drift.

## ARGUS Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:persona-encounters` | Pass | 36 tests passed; current public exhibit route/report/retract behavior and metadata-only UI scan remain green. |
| `npm exec --yes pnpm@10.32.1 -- run test:reports` | Pass | 7 tests passed; report queue, UUID public exhibit target context, remove/restore, and owner-retracted restore protection remain green. |
| `npm exec --yes pnpm@10.32.1 -- run test:writing` | Pass | 29 tests passed; current Discover/writing/public-persona helpers keep routeable item contracts bounded. |
| `npm exec --yes pnpm@10.32.1 -- run test:community` | Pass | 41 tests passed; Discover feed/search, search dropdown route filtering, public forum/search errors, and public-safe item filters remain green. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | Turbo API/web typecheck passed from cache. |
| Current surfacing review | Pass | Code review found no current public encounter exhibit surfacing outside `/encounters/[slug]`. |
| Scope review | Pass | PR509 preflight changes are roadmap/testing docs only; no runtime implementation was made. |
| Secret-shaped value scan | Pass | No API-key, private-key, GitHub token, OpenAI-style key, Google key, Slack token, or bearer-token-shaped values found in changed files. |
| `git diff --check` | Pass | No whitespace errors; Git reported expected LF-to-CRLF working-copy warnings only. |
| `git diff --cached --check` | Pass | No staged whitespace errors after staging PR509 preflight docs/status updates. |

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS accepts PR509 as ACCEPT_PR509A_PUBLIC_ENCOUNTER_EXHIBIT_INDEX_ONLY.
- The smallest safe discovery expansion is a dedicated `/encounters` index plus bounded public list API for published, non-removed metadata-only public encounter exhibits.
- Discover search/feed, public persona profiles, public Spaces, forums/discussions, Station Press/public documents, popularity sort, excerpts, transcripts, raw replies, private setup, private curation, raw ids, provider details, prompts, source bodies, and cross-owner words remain out of scope.
- PR509A should go to DAEDALUS if MIMIR accepts the lane.
- Focused validation passed for encounter routes, reports, writing/Discover helpers, community/search routes, and typecheck.
Task:
- Close PR509 preflight if accepted and route DAEDALUS for PR509A using docs/roadmap/PR509_PUBLIC_ENCOUNTER_EXHIBIT_DISCOVERY_PREFLIGHT_RESULT.md.
```
