# PR509A - Public Encounter Exhibit Index Review Result

Owner: ARGUS / A3

Date: 2026-07-11

Status: Accepted

## Verdict

```text
ACCEPT_PR509A_PUBLIC_ENCOUNTER_EXHIBIT_INDEX
```

ARGUS accepts PR509A without a code patch. The implementation matches the
accepted lane: a dedicated `/encounters` index plus bounded public list API for
published, non-removed, metadata-only public encounter exhibits.

This is not approval for Discover/search/feed inclusion, public persona profile
attachment, public Space attachment, forum/community discussion linkage, Station
Press/public document linkage, transcript/excerpt/raw reply publication, private
setup/private curation exposure, raw owner/persona/session ids, provider
payloads, prompts, source bodies, popularity/rising sort, package/lockfile
drift, migration work, provider/retrieval changes, billing/social/storage work,
Redis/Cloudflare, or queue/worker scope.

## Review Findings

Accepted behavior:

- `GET /persona-encounters/public-exhibits` is a public list endpoint with
  bounded `limit` defaulting to `12` and clamped to `1..24`.
- The list query returns only `status = "published"` rows with `removed_at is
  null`, then filters to valid slugs, public exhibit provenance, no
  `retracted_at`, and an existing private source row.
- List serialization reuses the published public exhibit metadata shape and
  returns only slug, route href, title, summary, tags, same-owner display-name
  snapshots, `publishedAt`, `published` status, and provenance.
- Cursor state encodes only public `publishedAt` plus public slug; it does not
  expose raw owner ids, source persona ids, private session ids, report ids, or
  admin state.
- `/encounters` renders repeated public cards and links to the existing
  `/encounters/[slug]` detail page.
- Report controls remain detail-only.
- The old detail-page not-found link now points to `/encounters`, not Discover.
- No Discover/search/feed, public persona, public Space, forum, Station Press,
  package, lockfile, migration, provider, retrieval, billing, social, Redis,
  Cloudflare, queue/worker, storage, or schema-visible implementation path was
  changed.

ARGUS notes one honest protected-alpha limitation: PR509A did not add a
dedicated public-list database index. The endpoint is still bounded and narrow,
so ARGUS accepts this for protected alpha. Hosted proof should record list-route
latency; if hosted latency is poor, MIMIR should route a separate partial-index
repair rather than broadening PR509A.

## ARGUS Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:persona-encounters` | Pass | 37 tests passed, including public list filtering, cursoring, hidden rows, owner retract, and web helper/page-source coverage. |
| `npm exec --yes pnpm@10.32.1 -- run test:reports` | Pass | 7 tests passed; public exhibit report/takedown and owner-retracted restore protection remain green. |
| `npm exec --yes pnpm@10.32.1 -- run test:writing` | Pass | 29 tests passed; Discover/writing/public-persona/public-Space helpers remain green. |
| `npm exec --yes pnpm@10.32.1 -- run test:community` | Pass | 41 tests passed; Discover/search/forum/community public-safe routes remain green. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 201 tests passed; Studio and public encounter helper scans remain green. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | Turbo API/web typecheck passed. |
| Changed-path scan | Pass | Runtime changes are limited to encounter API/tests, `/encounters` pages, encounter runtime helper/tests, scoped global CSS, and roadmap/testing docs. |
| Forbidden-path scan | Pass | No Discover/search/feed, public persona, public Space, forum, Station Press, package, lockfile, migration, provider, retrieval, billing, social, Redis, Cloudflare, queue/worker, storage, or schema-visible implementation paths changed. |
| Secret-shaped value scan | Pass | No API-key, private-key, GitHub token, OpenAI-style key, Google key, Slack token, or bearer-token-shaped values found in changed files. |
| Public/private leakage review | Pass | Public list/detail payloads remain metadata-only and exclude report counts, report controls on index, raw ids, private setup, generated reply text, transcript excerpts, private curation, prompts, provider details, source bodies, and admin internals. |
| `git diff --check` | Pass | No whitespace errors. |
| `git diff --cached --check` | Pass | No staged whitespace errors after staging PR509A review docs/status updates. |

## Hosted Proof Required

MIMIR should route ARIADNE for hosted proof because PR509A changes a public API
route and visible public web route.

Hosted proof should verify:

- hosted web/API include PR509A commit `b0a116bd` or later;
- `GET /persona-encounters/public-exhibits` returns `200` with bounded
  metadata-only payload;
- limit clamps to `1..24`;
- invalid cursor returns bounded `400`;
- cursor continuation works without exposing raw ids;
- `/encounters` renders desktop and `390px` mobile cards without text overlap;
- cards link only to `/encounters/[slug]`;
- report controls are absent from index and present only on detail;
- retracted and moderation-removed exhibits are absent from list/detail;
- owner-retracted moderation restore protection remains intact;
- Discover search/feed, public persona pages, public Space pages, forums, and
  Station Press/public documents still do not surface encounter exhibits;
- hosted proof output records no raw owner ids, source persona ids, private
  session ids, private setup, generated reply text, transcript excerpts,
  private curation text, provider payloads, prompts, source bodies, env values,
  tokens, cookies, SQL details, stack traces, screenshots, traces, videos,
  browser storage state, or secret-shaped values;
- list-route latency is acceptable for protected alpha, or MIMIR routes a
  separate partial-index repair.

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS accepts PR509A as ACCEPT_PR509A_PUBLIC_ENCOUNTER_EXHIBIT_INDEX.
- The implementation adds only a dedicated `/encounters` index plus bounded public list API for published, non-removed, metadata-only public encounter exhibits.
- Public list payloads stay metadata-only: slug/route href, public title, public summary, tags, same-owner display-name snapshots, published date, status, and provenance only.
- Discover/search/feed, public persona, public Space, forum, Station Press, transcript/excerpt/raw reply, private setup/private curation, raw ids, provider, retrieval, billing, social, Redis, Cloudflare, queue/worker, storage, package, lockfile, and migration scope remain untouched.
- Full requested validation passed.
Task:
- Close PR509A local review if accepted and route ARIADNE for hosted public index proof using docs/roadmap/PR509A_PUBLIC_ENCOUNTER_EXHIBIT_INDEX_REVIEW_RESULT.md.
```
