# PR520A - Cross-Owner Metadata Exhibit Public Persona Linkbacks Result

Owner: DAEDALUS / A2

Reviewer: ARGUS / A3

Date: 2026-07-12

Status: Ready for ARGUS review

Result:

```text
READY_FOR_ARGUS_REVIEW
```

## Summary

DAEDALUS implemented PR520A as participant public-persona linkbacks for
metadata-only cross-owner public encounter exhibits.

The lane adds a separate public persona readback endpoint and a separate public
persona profile section only. It does not add public Space, forum/Salon,
writing/public document, Discover feed/rising/featured, homepage, public
persona chat/context-preview source expansion, same-owner encounter placement,
generated words, provider/retrieval, storage, billing, social, infra, package,
lockfile, deployment, or migration scope.

## Implementation

- Added `GET /personas/public/:publicSlug/cross-owner-exhibits`.
- The endpoint uses the existing public persona not-found and bounded
  unavailable behavior.
- The current page persona must be public, routeable, owner-tier eligible, and
  display-snapshot matched for its requester/counterparty role.
- The other participant is serialized only as a consent display snapshot.
- Rows are filtered through a route-local cross-owner public readability floor:
  published, non-removed, non-retracted, contract-version-1,
  expected-provenance, bilaterally metadata-approved, active approved-consent
  backed, requested-scope backed, row/consent snapshot matched, and safe-slug
  routeable.
- Results are latest-first, deterministic by `publishedAt` and slug, capped at
  six, and route only to `/encounters/cross-owner#<slug>`.
- Public persona chat and context-preview source builders stay unchanged and do
  not include cross-owner exhibit rows.
- The public persona page reads linkbacks as an optional, non-blocking request
  and derives anchors from safe slugs rather than trusting returned hrefs.
- The new web section labels rows as approved metadata-only cross-owner
  encounter exhibits and adds no report, discussion, comment, profile, Space,
  feed, homepage, or hero controls.

## Boundaries Held

- Payloads omit API/table ids, raw owner ids, raw persona ids, consent ids,
  requested scopes, profile/email data, other-participant public slugs, Space/
  forum/document routes, report paths, report counts, moderation/admin state,
  private setup, PR516 output, generated reply text, transcripts, excerpts,
  generated summaries, source bodies, prompts, provider payloads, retrieval
  bodies, token facts, SQL details, stack traces, env values, cookies, bearer
  values, and secret-shaped strings.
- Public Space, forum/Salon/community, writing/public document, homepage,
  Discover feed/rising/featured, same-owner exhibits, owner-private search
  buckets, public persona chat, and context-preview remain outside this lane.
- No package, lockfile, schema, migration, storage, provider, retrieval,
  billing, social, Redis, Cloudflare, queue, worker, deployment, or hosted
  config file changed.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:personas` | Pass | 18 tests passed, including requester/counterparty linkbacks, missing other profile display-only serialization, unsafe-row filtering, restore/revoke behavior, bounded failures, and source-list no-drift. |
| `npm exec --yes pnpm@10.32.1 -- run test:persona-encounters` | Pass | 74 tests passed, including cross-owner public metadata readability, list/detail/readback, consent revocation, moderation, and same-owner exhibit regressions. |
| `npm exec --yes pnpm@10.32.1 -- run test:reports` | Pass | 8 tests passed, including same-owner and cross-owner public exhibit moderation actions. |
| `npm exec --yes pnpm@10.32.1 -- run test:community` | Pass | 47 tests passed, including separate cross-owner Discover search, public/private bucket separation, and feed/writing helper no-drift. |
| `npm exec --yes pnpm@10.32.1 -- run test:writing` | Pass | 32 tests passed, including public persona cross-owner safe-anchor helpers and source guards. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 215 tests passed, including cross-owner public metadata helper/readback copy and owner-visible redaction coverage. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | Turbo API/web typecheck passed. |
| `git diff --check` | Pass | Whitespace check passed; Git reported expected LF-to-CRLF working-copy warnings only. |
| `git diff --cached --check` | Pass | No staged whitespace errors after staging PR520A implementation and docs. |
| Changed-path scan | Pass | Changes stayed inside PR520A allowed API persona route/test, public persona page/helper/test/style, and roadmap/testing docs scope. |
| Forbidden-path scan | Pass | No public Space, forum/Salon/community, writing/public document, Discover feed/rising/featured, homepage, chat/context source, generated-word, provider/retrieval, storage, billing, social, Redis, Cloudflare, queue, package, lockfile, deployment, or migration paths changed outside allowed helper/source guards. |
| Secret-shaped diff scan | Pass | No secret-shaped added lines were found in the staged diff. |

## Handoff

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS implemented PR520A as participant public-persona linkbacks for metadata-only cross-owner public exhibits.
- API adds GET /personas/public/:publicSlug/cross-owner-exhibits with public persona eligibility, role snapshot matching, active-consent readability, bounded failure behavior, six-row cap, and metadata-only payloads.
- Web adds a separate optional public persona section and derives /encounters/cross-owner#<slug> anchors only from safe slugs.
- Chat/context-preview source lists, public Space/forum/writing/feed/homepage/same-owner surfaces, generated words, provider/retrieval/storage/billing/social/infra, package, lockfile, deployment, and migrations remain untouched.
Risk:
- Review for raw id/consent/report/admin/private setup/generated/provider/token leaks and for any accidental expansion into public persona chat/context-preview or broader public surfacing.
Validation:
- test:personas passed: 18 tests.
- test:persona-encounters passed: 74 tests.
- test:reports passed: 8 tests.
- test:community passed: 47 tests.
- test:writing passed: 32 tests.
- test:studio-ui passed: 215 tests.
- typecheck, diff checks, changed-path, forbidden-path, and secret-shaped scans passed.
Task:
- Review PR520A and either accept by waking MIMIR or send fixes back to DAEDALUS.
Status: READY_FOR_ARGUS_REVIEW
```
