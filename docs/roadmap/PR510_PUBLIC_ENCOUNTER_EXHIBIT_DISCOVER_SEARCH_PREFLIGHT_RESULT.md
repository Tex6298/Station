# PR510 - Public Encounter Exhibit Discover Search Preflight Result

Owner: ARGUS / A3

Date: 2026-07-11

Status: Accepted

## Verdict

```text
ACCEPT_PR510A_PUBLIC_ENCOUNTER_EXHIBIT_DISCOVER_SEARCH_GROUP
```

ARGUS accepts a narrow PR510A implementation: add published public encounter
exhibits to Discover search only, as their own result group, using the same
metadata-only public boundary proven by PR509A/PR509B.

This is not approval for Discover feed/rising/featured inclusion, public
persona profile attachment, public Space attachment, forum/community discussion
linkage, Station Press/public document linkage, transcript/excerpt/raw reply
publication, private setup/private curation exposure, raw owner/persona/session
ids, report counts, provider payloads, prompts, source bodies, popularity
ranking, migration/index work by default, package/lockfile drift, billing,
social, storage, Redis, Cloudflare, queue/worker, retrieval, vector, embedding,
Archive, Memory, Canon, Continuity, Integrity, export, webhook, or hosted
runtime scope.

MIMIR should route DAEDALUS for PR510A if accepted.

## Evidence Reviewed

ARGUS reviewed:

- `docs/roadmap/PR510_PUBLIC_ENCOUNTER_EXHIBIT_DISCOVER_SEARCH_PREFLIGHT_ARGUS.md`;
- `docs/roadmap/PR509B_PUBLIC_ENCOUNTER_EXHIBIT_INDEX_HOSTED_PROOF_RESULT.md`;
- `docs/roadmap/PR509B_PUBLIC_ENCOUNTER_EXHIBIT_INDEX_HOSTED_PROOF_CLOSEOUT.md`;
- `docs/roadmap/PR509A_PUBLIC_ENCOUNTER_EXHIBIT_INDEX_REVIEW_RESULT.md`;
- `docs/roadmap/PR509_PUBLIC_ENCOUNTER_EXHIBIT_DISCOVERY_PREFLIGHT_RESULT.md`;
- `apps/api/src/routes/discover.ts`;
- `apps/api/src/routes/persona-encounters.ts`;
- `apps/api/src/routes/persona-encounters.test.ts`;
- `apps/web/components/discover/search-dropdown.tsx`;
- `apps/web/components/discover/search-dropdown.test.ts`;
- `apps/web/components/discover/discover-front-door.tsx`;
- `apps/web/lib/discover-feed-controls.ts`;
- `apps/web/lib/writing-feed.ts`;
- `infra/supabase/migrations/076_persona_encounter_public_exhibits.sql`;
- relevant community Discover search/feed tests.

Current facts:

- PR509B hosted proof passed with a metadata-only `/encounters` index and
  default list latency of `883ms`, acceptable for protected alpha.
- Current Discover search is already grouped and route-filtered on the web.
- Current Discover feed normalizes a closed feed type set and should not absorb
  encounter exhibits in PR510A.
- Public exhibit list safety is stricter than a simple `status = published`
  read: safe rows must be published, not removed, not retracted, use the public
  exhibit provenance schema, have a valid public slug, and still have an
  existing private source row.
- Migration `076` has a partial public slug index, but no title/summary/tag
  search index.

## Boundary Answers

1. Discover search is safe now, but only as a dedicated search result group.
   PR509A is hosted-proven and `/encounters` is already the canonical route for
   public encounter exhibit detail. PR510A must not place exhibits in the
   Discover feed, featured/rising surfaces, public persona pages, public Spaces,
   forums, Station Press, or public documents.

2. Search may match only these already-public fields:
   `public_title`, `public_summary`, `public_tags`,
   `initiator_name_snapshot`, and `responder_name_snapshot`. No other metadata
   should be searchable in PR510A. Do not search provenance notes, owner ids,
   private session ids, report counts, private setup, generated replies,
   transcripts, private curation, prompts, provider details, source bodies, or
   admin/moderation fields.

3. The allowed API result group key is:

   ```text
   publicEncounterExhibits
   ```

   Each item may contain only:

   - `slug`;
   - `routeHref`, exactly `/encounters/${slug}`;
   - `title`;
   - `summary`;
   - `tags`;
   - `personas.label`;
   - `personas.initiatorName`;
   - `personas.responderName`;
   - `status`, always `published`;
   - `publishedAt`;
   - `type`, exactly `encounter_exhibit`;
   - `label`, exactly `Public encounter exhibit`;
   - `provenance.label`;
   - `provenance.ownerCurated`;
   - `provenance.public`;
   - `provenance.sameOwner`;
   - `provenance.source`;
   - `provenance.note`.

   This is intentionally the public-list item shape plus a small search label.
   It must not include `id`, `ownerUserId`, `owner_user_id`, `privateSessionId`,
   `private_session_id`, source persona ids, report path, report counts,
   `reportedCount`, moderation state, admin actions, private setup, generated
   reply text, transcript excerpts, private curation, prompts, provider
   payloads, source bodies, cookies, tokens, env values, SQL details, stack
   traces, or raw hrefs to non-encounter routes.

4. The web should show a separate public search group named:

   ```text
   Encounter Exhibits
   ```

   Do not merge these rows into `Public personas`, `Publications`, `Spaces`,
   `Forum`, `Salons`, `Developer Spaces`, or `Public Projects`. The route helper
   must derive or validate `/encounters/[slug]` from the safe public slug and
   ignore any untrusted incoming external/admin href.

5. Safe limit/ranking behavior:

   - final API group limit should be small, at most `6`;
   - dropdown rendering may continue slicing visible group rows to `5`;
   - ranking should be deterministic and public-field-only;
   - title matches may rank ahead of tag/display-name/summary matches;
   - ties should sort by `published_at desc`, then slug desc or another
     public deterministic tie breaker;
   - no popularity, rising, featured, report-count, discussion-count,
     owner-rank, click, impression, provider-derived, or personalized ranking.

6. Retracted, removed, malformed, source-deleted, and deleted exhibits must not
   appear. PR510A search must use the PR509A public-list safety floor:
   `status = "published"`, `removed_at is null`, `retracted_at is null`, public
   exhibit provenance schema, valid public slug, and an existing
   `persona_encounter_private_sessions` source row.

7. Tests must prove that non-search public surfaces still do not include
   encounter exhibits:

   - `GET /discover/feed` returns no encounter exhibit rows or proof markers;
   - feed type helpers do not add `encounter_exhibit`;
   - public persona, public Space, forum/Salon, public document/Station Press,
     and writing feed helpers remain unchanged by PR510A;
   - search dropdown/front-door route helpers route encounter rows only to
     `/encounters/[slug]`;
   - private owner search buckets stay separate and never merge with
     `publicEncounterExhibits`.

8. No DB migration or search index is required before PR510A. Protected alpha
   may start with bounded public-field search and hosted latency proof. If
   hosted Discover search latency is poor, MIMIR should route a separate
   partial/trigram public-search index repair. DAEDALUS should not add
   migration/index work inside PR510A unless MIMIR explicitly accepts that
   scope.

## PR510A Implementation Contract

Allowed files:

- `apps/api/src/routes/discover.ts`;
- `apps/api/src/routes/community.test.ts`;
- `apps/api/src/routes/persona-encounters.test.ts` only if shared public
  exhibit fixtures/safety assertions are needed;
- `apps/web/components/discover/search-dropdown.tsx`;
- `apps/web/components/discover/search-dropdown.test.ts`;
- `apps/web/components/discover/discover-front-door.tsx`;
- `apps/web/lib/persona-encounter-runtime.ts` and test only if DAEDALUS adds a
  shared type/path helper for public search items;
- `docs/roadmap/*PR510A*` and `docs/testing/VALIDATION_BASELINE.md`.

Expected API behavior:

- empty `q` returns `publicEncounterExhibits: []`;
- non-empty `q` searches only public title, summary, tags, and display
  snapshots;
- final results are de-duplicated by public slug;
- unsafe rows are filtered before serialization;
- serialization uses the allowed result contract above;
- route labels remain metadata-only and do not claim transcript, reply,
  discussion, persona attachment, Space attachment, or publication availability.

Expected web behavior:

- add `publicEncounterExhibits` to `PUBLIC_SEARCH_GROUPS` as
  `Encounter Exhibits`;
- add a safe route helper for `/encounters/[slug]` using the public exhibit
  slug pattern;
- add labels `Public encounter exhibit` and
  `Metadata-only public encounter exhibit`;
- render optional `summary` text only as public metadata;
- do not add hero copy, feed cards, sidebar cards, public persona links,
  public Space links, forum links, document links, report controls, or
  discussion affordances.

Forbidden in PR510A:

- `discover_feed` item-type changes;
- Discover feed/rising/featured inclusion;
- public persona profile sections or route attachment;
- public Space sections or route attachment;
- forum/community discussion linkage, comments, or Salon placement;
- Station Press/public document linkage;
- transcript excerpts, generated reply text, owner setup, private curation,
  prompts, provider payloads, source bodies, source retrieval, cross-owner
  persona words, raw ids, report counts, report paths, admin state;
- provider/retrieval/vector/embedding changes;
- billing, social, storage, export, Archive, Memory, Canon, Continuity,
  Integrity, Redis, Cloudflare, queue/worker, webhook, package, lockfile, or
  migration work by default.

## Required PR510A Tests

API tests must cover:

- empty search returns an empty `publicEncounterExhibits` group;
- public title match returns one safe encounter result;
- public summary, tag, initiator display snapshot, and responder display
  snapshot matches return safe encounter results;
- result payload keys are exactly the allowed public contract;
- malformed slug, wrong provenance schema, removed, retracted, deleted-source,
  and deleted exhibit rows do not appear;
- private setup, generated reply text, transcript-like markers, private
  curation, raw owner ids, source persona ids, private session ids,
  `reported_count`, `reportedCount`, report paths, provider strings, prompts,
  source bodies, and admin fields do not appear anywhere in the search JSON;
- result limit is bounded and deterministic;
- `/discover/feed` remains free of encounter exhibit rows and markers;
- owner-private `privateResults` remain owner-scoped and separate.

Web tests must cover:

- `PUBLIC_SEARCH_GROUPS` includes `publicEncounterExhibits` and still excludes
  `privateResults`;
- encounter search hrefs accept only safe `/encounters/[slug]` public exhibit
  slugs and reject UUID-shaped, malformed, missing, admin, external, or
  non-encounter hrefs;
- routeable public search items drop unsafe encounter rows;
- search labels show `Public encounter exhibit` and
  `Metadata-only public encounter exhibit`;
- front-door search rendering can show the public `summary` without relying on
  private fields.

Required PR510A validation:

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

Also run changed-path, forbidden-path, and secret-shaped value scans. If
DAEDALUS touches migration/types despite this preflight, add explicit
migration/types review and require MIMIR to accept the widened scope.

## Hosted Proof Required After PR510A

PR510A changes a public API route and visible public web search rendering, so
MIMIR should route ARIADNE for hosted proof after ARGUS local review accepts the
implementation.

Hosted proof should verify:

- hosted web/API include the accepted PR510A commit;
- a disposable source-backed public encounter exhibit appears in
  `/discover/search?q=<public title token>` under `publicEncounterExhibits`;
- the search payload is metadata-only and routeable only to `/encounters/[slug]`;
- title, summary, tag, and display snapshot searches work or any intentionally
  deferred match class is honestly documented before closeout;
- removed, retracted, missing-source, and malformed rows stay absent;
- Discover feed, public persona, public Space, forum/Salon, public document,
  Station Press, and writing samples still do not surface encounter exhibits;
- desktop and `390px` Discover search rendering fit without overlap;
- public search latency is acceptable for protected alpha, or MIMIR routes a
  separate search-index repair;
- cleanup deletes the proof artifact/report rows;
- proof output records no raw owner ids, source persona ids, private session
  ids, private setup, generated reply text, transcript excerpts, private
  curation, provider payloads, prompts, source bodies, env values, tokens,
  cookies, SQL details, stack traces, screenshots, traces, videos, browser
  storage state, or secret-shaped values.

## ARGUS Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:persona-encounters` | Pass | 37 tests passed, including public exhibit list/detail filtering, metadata-only payloads, owner retract, and web helper/page-source coverage. |
| `npm exec --yes pnpm@10.32.1 -- run test:community` | Pass | 41 tests passed, including current Discover search grouping, route filtering, public-safe Spaces/Developer Spaces/Projects/Salons/personas, and private bucket separation. |
| `npm exec --yes pnpm@10.32.1 -- run test:writing` | Pass | 29 tests passed; writing and Discover feed helpers remain document/feed bounded. |
| `npm exec --yes pnpm@10.32.1 -- run test:reports` | Pass | 7 tests passed; public exhibit moderation queue/remove/restore behavior remains green. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 201 tests passed; Studio/public encounter helper scans remain green. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | Turbo API/web typecheck passed from cache. |
| Current search/feed review | Pass | Current Discover search has no encounter group yet; current feed type helpers do not include encounter exhibits. |
| Scope review | Pass | PR510 preflight is roadmap/testing docs only; no runtime implementation was made. |
| Changed-path scan | Pass | Changes are limited to PR510 roadmap result/status/index docs and `docs/testing/VALIDATION_BASELINE.md`. |
| Forbidden-path scan | Pass | No app/runtime, infra, package, lockfile, script, env, or GitHub workflow paths changed. |
| Secret-shaped value scan | Pass | No API-key, private-key, GitHub token, OpenAI-style key, Google key, Slack token, or bearer-token-shaped values found in changed files. |
| `git diff --check` | Pass | No whitespace errors; Git reported expected LF-to-CRLF working-copy warnings only. |
| `git diff --cached --check` | Pass | No staged whitespace errors after staging PR510 preflight docs/status updates. |

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS accepts PR510 as ACCEPT_PR510A_PUBLIC_ENCOUNTER_EXHIBIT_DISCOVER_SEARCH_GROUP.
- DAEDALUS may implement only a dedicated Discover search result group named Encounter Exhibits with API key publicEncounterExhibits.
- Search may use only public title, summary, tags, and same-owner display snapshots, returning only metadata-only public fields routeable to /encounters/[slug].
- Removed, retracted, malformed, wrong-schema, source-deleted, and deleted exhibits must stay absent using the PR509A public-list safety floor.
- Discover feed/rising/featured, public persona, public Space, forum/community, Station Press/public document, transcript/excerpt/raw reply, private setup/private curation, raw ids, report counts/paths, provider/retrieval, billing/social/storage, Redis/Cloudflare, queue/worker, package/lockfile, and migration/index scope remain out of PR510A by default.
- Local focused validation passed for persona encounters, reports, writing/feed helpers, community/search, Studio UI, and typecheck.
Task:
- Close PR510 preflight if accepted and route DAEDALUS for PR510A using docs/roadmap/PR510_PUBLIC_ENCOUNTER_EXHIBIT_DISCOVER_SEARCH_PREFLIGHT_RESULT.md.
```
