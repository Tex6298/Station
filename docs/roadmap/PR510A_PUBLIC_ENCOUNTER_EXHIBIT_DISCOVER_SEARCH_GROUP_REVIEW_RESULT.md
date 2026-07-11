# PR510A - Public Encounter Exhibit Discover Search Group Review Result

Owner: ARGUS / A3

Date: 2026-07-11

Status: Accepted

## Verdict

```text
ACCEPT_PR510A_PUBLIC_ENCOUNTER_EXHIBIT_DISCOVER_SEARCH_GROUP
```

ARGUS accepts PR510A without a code patch. The implementation matches the
accepted lane: public encounter exhibits now appear only in Discover search as
a dedicated `publicEncounterExhibits` group named `Encounter Exhibits`, with
metadata-only rows routed to `/encounters/[slug]`.

This is not approval for Discover feed/rising/featured inclusion, public
persona profile attachment, public Space attachment, forum/community
discussion linkage, Station Press/public document linkage, transcript/excerpt
or raw reply publication, private setup/private curation exposure, raw owner
or source persona ids, private session ids, report counts/paths, admin state,
provider/retrieval/vector/embedding changes, billing/social/storage, Redis,
Cloudflare, queue/worker, package/lockfile, migration/index work, or hosted
runtime scope.

MIMIR should route ARIADNE for hosted proof because PR510A changes public API
search output and visible Discover search rendering.

## Evidence Reviewed

ARGUS reviewed:

- `docs/roadmap/PR510_PUBLIC_ENCOUNTER_EXHIBIT_DISCOVER_SEARCH_PREFLIGHT_RESULT.md`;
- `docs/roadmap/PR510_PUBLIC_ENCOUNTER_EXHIBIT_DISCOVER_SEARCH_PREFLIGHT_CLOSEOUT.md`;
- `docs/roadmap/PR510A_PUBLIC_ENCOUNTER_EXHIBIT_DISCOVER_SEARCH_GROUP_DAEDALUS.md`;
- `docs/roadmap/PR510A_PUBLIC_ENCOUNTER_EXHIBIT_DISCOVER_SEARCH_GROUP_RESULT.md`;
- `apps/api/src/routes/discover.ts`;
- `apps/api/src/routes/community.test.ts`;
- `apps/web/components/discover/search-dropdown.tsx`;
- `apps/web/components/discover/search-dropdown.test.ts`;
- `apps/web/components/discover/discover-front-door.tsx`;
- `apps/web/lib/discover-feed-controls.ts`;
- `apps/web/lib/writing-feed.ts`;
- roadmap/status/testing docs changed in PR510A.

The implementation range reviewed was PR510A routing plus implementation
through commit `ad12809c`. A later empty handoff commit `37a3e238` restored
ARGUS as the reviewer baton after state-only commits.

## Review Findings

Accepted behavior:

- `GET /discover/search` returns `publicEncounterExhibits: []` for empty
  search.
- Non-empty search queries only already-public encounter exhibit fields:
  public title, public summary, public tags, initiator display snapshot, and
  responder display snapshot.
- The final encounter search group is bounded to at most six results.
- Results are de-duplicated by public slug and sorted deterministically:
  title match first, then tag/display-snapshot/summary rank, then
  `published_at desc`, then slug.
- Unsafe rows are filtered before serialization using the accepted safety
  floor: `status = "published"`, `removed_at is null`, `retracted_at is null`,
  public exhibit provenance schema, valid public exhibit slug, and existing
  private source row.
- API serialization returns only the accepted public contract: slug, route
  href, title, summary, tags, same-owner display snapshots, `published` status,
  published date, `encounter_exhibit` type, public label, and metadata-only
  provenance copy.
- No raw owner ids, source persona ids, private session ids, report counts,
  report paths, admin state, private setup, generated reply text, transcript
  excerpts, private curation, prompts, provider payloads, source bodies, tokens,
  cookies, SQL details, or stack traces are serialized.
- `PUBLIC_SEARCH_GROUPS` adds `publicEncounterExhibits` as
  `Encounter Exhibits`.
- Web route helpers derive `/encounters/[slug]` only from a safe public exhibit
  slug and ignore untrusted external/admin hrefs.
- Web labels show `Public encounter exhibit` and
  `Metadata-only public encounter exhibit`.
- Discover front-door search rendering can display the public `summary` field
  without reading private fields.
- Discover feed/rising/featured code paths and feed helper type sets were not
  changed.
- No public persona, public Space, forum/community, Station Press/public
  document, report, provider, retrieval, billing, social, storage, Redis,
  Cloudflare, queue/worker, package, lockfile, migration, or schema-visible
  implementation path changed.

Protected-alpha limitation:

- PR510A intentionally does not add a search index or full-text engine. The
  public-field search is bounded and suitable for protected alpha, but hosted
  proof must record `/discover/search` latency and route a separate index or
  normalization repair if search becomes slow or tag matching needs broader
  behavior.

## Hosted Proof Required

MIMIR should route ARIADNE for PR510B hosted proof.

Hosted proof should verify:

- hosted web/API include accepted PR510A commit `ad12809c` or later;
- `/discover/search?q=<public title token>` returns the disposable proof
  exhibit under `publicEncounterExhibits`;
- summary, tag, initiator display snapshot, and responder display snapshot
  queries work against the proof exhibit or any intentionally deferred match
  class is recorded before closeout;
- the payload is metadata-only and routeable only to `/encounters/[slug]`;
- malformed, removed, retracted, wrong-schema, missing-source, and deleted
  exhibits stay absent;
- Discover feed/rising/featured, public persona, public Space, forum/Salon,
  public document, Station Press, and writing samples still do not surface
  encounter exhibits;
- desktop and `390px` Discover search rendering fit without overlap;
- public search latency is acceptable for protected alpha, or MIMIR routes a
  separate public search-index repair;
- cleanup deletes the proof artifact/report rows;
- proof output records no raw owner ids, source persona ids, private session
  ids, private setup, generated reply text, transcript excerpts, private
  curation, provider payloads, prompts, source bodies, env values, tokens,
  cookies, SQL details, stack traces, screenshots, traces, videos, browser
  storage state, or secret-shaped values.

## ARGUS Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:persona-encounters` | Pass | 37 tests passed; PR509A public list/detail safety remains green. |
| `npm exec --yes pnpm@10.32.1 -- run test:reports` | Pass | 7 tests passed; public exhibit moderation queue/remove/restore remains green. |
| `npm exec --yes pnpm@10.32.1 -- run test:writing` | Pass | 29 tests passed; writing and Discover feed helpers remain document/feed bounded. |
| `npm exec --yes pnpm@10.32.1 -- run test:community` | Pass | 44 tests passed, including PR510A API/search-dropdown encounter group coverage. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 201 tests passed; Studio/public encounter helper scans remain green. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | Turbo API/web typecheck passed. |
| Current search/feed review | Pass | Encounter exhibit surfacing is limited to `/discover/search`; feed helper types do not include `encounter_exhibit`. |
| Changed-path scan | Pass | Changes are limited to PR510A review/status/index/testing docs. |
| Forbidden-path scan | Pass | No app/runtime, infra, package, lockfile, script, env, or GitHub workflow paths changed in ARGUS review. |
| Secret-shaped value scan | Pass | No API-key, private-key, GitHub token, OpenAI-style key, Google key, Slack token, or bearer-token-shaped values found in changed files. |
| `git diff --check` | Pass | No whitespace errors; Git reported expected LF-to-CRLF working-copy warnings only. |
| `git diff --cached --check` | Pass | No staged whitespace errors after staging PR510A review docs/status updates. |

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS accepts PR510A as ACCEPT_PR510A_PUBLIC_ENCOUNTER_EXHIBIT_DISCOVER_SEARCH_GROUP.
- The implementation adds only the dedicated Discover search group publicEncounterExhibits named Encounter Exhibits.
- Results are metadata-only, use only public title/summary/tags/display snapshots for search, and route only to /encounters/[slug].
- Removed, retracted, malformed, wrong-schema, source-deleted, and deleted exhibits stay absent using the PR509A safety floor.
- Discover feed/rising/featured, public persona, public Space, forum/community, Station Press/public documents, transcript/excerpt/raw reply, private setup/private curation, raw ids, report counts/paths, provider/retrieval, billing/social/storage, Redis/Cloudflare, queue/worker, package/lockfile, migration/index, and hosted runtime scope remain out.
- Full requested local validation passed.
Task:
- Close PR510A locally if accepted and route ARIADNE for hosted PR510B proof using docs/roadmap/PR510A_PUBLIC_ENCOUNTER_EXHIBIT_DISCOVER_SEARCH_GROUP_REVIEW_RESULT.md.
```
