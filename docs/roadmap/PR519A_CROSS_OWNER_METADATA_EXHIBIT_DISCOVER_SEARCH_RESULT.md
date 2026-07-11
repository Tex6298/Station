# PR519A - Cross-Owner Metadata Exhibit Discover Search Group Result

Owner: DAEDALUS / A2

Reviewer: ARGUS / A3

Date: 2026-07-12

Status: Ready for ARGUS review

Result:

```text
READY_FOR_ARGUS_REVIEW
```

## Summary

DAEDALUS implemented PR519A as a separate Discover search group for safe,
bilaterally approved, metadata-only cross-owner encounter exhibits:

```text
crossOwnerPublicEncounterExhibits
```

The group is search-only. It does not add Discover feed placement, same-owner
encounter mixing, public persona or Space linkbacks, forum/Salon placement,
writing/Station Press surfacing, generated words, provider work, storage,
billing, social, infra, package, lockfile, or migration scope.

## Implementation

- `GET /discover/search` now returns `crossOwnerPublicEncounterExhibits: []`
  for empty queries.
- Non-empty queries search only public title, public summary, public tags,
  requester display snapshot, and counterparty display snapshot.
- Rows fail closed unless they are published, non-removed, non-retracted,
  contract-version-1, expected-provenance, bilaterally metadata-approved,
  active approved-consent backed, requested-scope backed, display-snapshot
  matched, and safe-slug routeable.
- Search failures for the new group return an empty group instead of leaking
  internals.
- Results are deduplicated by public slug, capped at six, ranked with title
  ahead of tag/display-snapshot/summary matches, and tie-broken by
  `published_at desc` then slug desc.
- API result payloads are limited to the accepted metadata-only public contract
  and derive routes exactly as `/encounters/cross-owner#<slug>`.
- The web search dropdown adds the public group label `Cross-owner Exhibits`,
  derives cross-owner routes only from safe slugs, and keeps private result
  buckets excluded.
- Cross-owner public exhibit readback now honestly reports
  Discover-search-listed while keeping `indexed=false`.

## Boundaries Held

- Same-owner `publicEncounterExhibits` remains separate from
  `crossOwnerPublicEncounterExhibits`.
- Signed-in `privateResults` remains owner-scoped and separate.
- `/discover/feed`, writing feed helpers, same-owner encounter routes, public
  persona routes, public Space routes, forum routes, Station Press, and homepage
  surfaces do not receive cross-owner exhibit rows.
- No raw ids, consent ids, owner ids, persona ids, report fields, moderation
  state, requested scopes, private setup, generated reply text, transcript-like
  markers, private summaries, prompts, provider payloads, source bodies, SQL
  details, stack traces, env values, cookies, access tokens, or secret-shaped
  values are serialized in the new public search group.
- No package, lockfile, schema, migration, storage, provider, retrieval,
  billing, social, Redis, Cloudflare, queue, worker, deployment, or hosted
  config file changed.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:persona-encounters` | Pass | 74 tests passed, including cross-owner public metadata readback honesty and existing detail/list/report/retract boundaries. |
| `npm exec --yes pnpm@10.32.1 -- run test:reports` | Pass | 8 tests passed, including same-owner and cross-owner public exhibit moderation actions. |
| `npm exec --yes pnpm@10.32.1 -- run test:community` | Pass | 47 tests passed, including empty search, title/summary/tag/participant snapshot search, unsafe-row filtering, same-owner separation, private bucket separation, feed exclusion, payload key bounds, and fail-closed query behavior. |
| `npm exec --yes pnpm@10.32.1 -- run test:writing` | Pass | 29 tests passed; writing/feed helper boundaries remain green. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 215 tests passed, including cross-owner public metadata helper coverage. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | Turbo API/web typecheck passed. |
| `git diff --check` | Pass | Whitespace check passed; Git reported expected LF-to-CRLF working-copy warnings only. |
| `git diff --cached --check` | Pass | No staged whitespace errors after staging PR519A implementation and docs. |
| Changed-path scan | Pass | Changes stayed inside the PR519A allowed API, web search, readback helper/test, and roadmap/testing docs scope. |
| Forbidden-path scan | Pass | No feed, public persona, public Space, forum/Salon, writing, Station Press, homepage, provider, retrieval, storage, billing, social, Redis, Cloudflare, queue, package, lockfile, deployment, or migration paths changed outside the allowed test/source guards. |
| Secret-shaped diff scan | Pass | No secret-shaped added lines were found in the staged diff. |

## Handoff

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS implemented PR519A as a separate crossOwnerPublicEncounterExhibits Discover search group.
- API search is metadata-only, active-consent-backed, bilateral-approval-backed, display-snapshot matched, capped at six, fail-closed, and routeable only as /encounters/cross-owner#<slug>.
- Web search exposes the separate Cross-owner Exhibits group and derives routes only from safe slugs.
- Cross-owner public exhibit readback now says Discover-search-listed while indexed remains false.
Risk:
- Review for scope drift into feed, same-owner exhibits, public persona/Space/forum/writing/homepage, generated words, provider/retrieval/storage/billing/social/infra, package, lockfile, deployment, or migration work.
Validation:
- test:persona-encounters passed: 74 tests.
- test:reports passed: 8 tests.
- test:community passed: 47 tests.
- test:writing passed: 29 tests.
- test:studio-ui passed: 215 tests.
- typecheck, diff checks, changed-path, forbidden-path, and secret-shaped scans passed.
Task:
- Review PR519A and either accept by waking MIMIR or send fixes back to DAEDALUS.
Status: READY_FOR_ARGUS_REVIEW
```
