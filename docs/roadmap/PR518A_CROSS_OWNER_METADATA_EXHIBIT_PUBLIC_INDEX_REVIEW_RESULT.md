# PR518A - Cross-Owner Metadata Exhibit Dedicated Public Index Review Result

Owner: ARGUS / A3

Date: 2026-07-12

Status:

```text
ACCEPT_PR518A_CROSS_OWNER_METADATA_EXHIBIT_PUBLIC_INDEX_WITH_ARGUS_PATCH
```

## Verdict

ARGUS accepts PR518A after a narrow review patch.

The implementation matches the PR518A lane: it adds a dedicated, bounded
cross-owner metadata-only public exhibit list endpoint and a dedicated
`/encounters/cross-owner` web index, with one link from the same-owner
`/encounters` page and no mixing of cross-owner rows into the same-owner list.

## ARGUS Patch

ARGUS patched a claim-honesty issue introduced by the new index:

- published cross-owner public exhibit owner/public readback still claimed the
  exhibit was not route-listed even though PR518A added a dedicated index;
- ARGUS changed the published readback to report `routeListed: true` and updated
  owner helper copy to say `Dedicated cross-owner index`;
- `indexed` and `discoverable` remain `false` because PR518A did not add
  Discover search/feed, SEO/indexing, or broad public discovery surfaces.

## Review Findings

Accepted behavior:

- `GET /persona-encounters/cross-owner-public-exhibits` is public, bounded, and
  cursorable using public `publishedAt` plus public slug.
- The list returns only rows that are published, non-removed, non-retracted,
  valid-slug, contract-version-1, expected-provenance, bilaterally
  metadata-approved, active approved-consent backed, and display-snapshot
  matched to the linked consent.
- Public list payloads expose only slug, dedicated index anchor, title,
  summary/context note, tags, safe participant display snapshots, status,
  contract version, published timestamp, public provenance labels, and report
  path.
- Public detail/report/retract behavior remains unchanged except that published
  readback now honestly reflects the dedicated route listing.
- Same-owner `/encounters` and `/persona-encounters/public-exhibits` remain
  separate from cross-owner rows.
- No migration, package/lockfile, Discover/search/feed, public persona, Space,
  forum/community/Salon, writing, Station Press, provider, retrieval, storage,
  billing, social, Redis, Cloudflare, queue, worker, or deployment scope was
  added.

Hosted proof was not run in this lane. MIMIR should route ARIADNE for hosted
proof before closing the new public findability surface as hosted-accepted.

## Validation

ARGUS reran the requested validation after the patch:

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:persona-encounters` | Pass | 74 tests passed, including the new cross-owner public exhibit list, fail-closed fixture coverage, route-listing readback, unchanged detail/report/retract behavior, and same-owner list separation. |
| `npm exec --yes pnpm@10.32.1 -- run test:reports` | Pass | 8 tests passed, including same-owner and cross-owner public exhibit moderation actions. |
| `npm exec --yes pnpm@10.32.1 -- run test:community` | Pass | 44 tests passed; Discover/community route coverage remains green. |
| `npm exec --yes pnpm@10.32.1 -- run test:writing` | Pass | 29 tests passed; writing/feed/public persona/Space helpers remain bounded. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 215 tests passed, including cross-owner index source guards. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | Turbo API/web typecheck passed. |

## Required Hosted Proof

Route ARIADNE for hosted proof that verifies:

- hosted web/API include the accepted PR518A commit;
- a safe bilaterally approved cross-owner metadata exhibit appears in
  `/encounters/cross-owner`;
- the list payload/page is metadata-only and routeable only through accepted
  cross-owner public paths;
- revoked consent, participant retract, moderation remove, removed/retracted
  rows, malformed rows, wrong schema/version, and inactive consent rows stay
  absent;
- same-owner public exhibit publish/report/remove/restore/retract still works;
- Discover search/feed, public persona, public Space, forum/community/Salon,
  writing, public document, Station Press, homepage, and featured surfaces do
  not surface the proof row;
- desktop and `390px` mobile rendering fit without overlap;
- cleanup leaves no public proof row readable;
- proof output records no raw owner ids, raw persona ids, consent ids, private
  setup, generated reply text, transcript excerpts, summaries, provider
  payloads, prompts, source bodies, env values, tokens, cookies, SQL details,
  stack traces, screenshots, traces, videos, browser storage state, or
  secret-shaped values.

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS accepts PR518A as ACCEPT_PR518A_CROSS_OWNER_METADATA_EXHIBIT_PUBLIC_INDEX_WITH_ARGUS_PATCH.
- The implementation adds a bounded, consent-backed cross-owner metadata-only public list endpoint and dedicated /encounters/cross-owner web index without mixing same-owner rows.
- ARGUS patched stale route-listing readback so published cross-owner exhibits now honestly report the dedicated index while Discover/search/feed remain false.
- Discover search/feed, public persona, Space, forum/community/Salon, writing, Station Press, generated words, transcripts, excerpts, summaries, private saved artifacts, PR516 disposable output reuse, provider/retrieval/storage/billing/social/Redis/Cloudflare/queue/package/deployment work remain blocked.
- Full requested local validation passed.
Task:
- Close PR518A local review if accepted and route ARIADNE for hosted proof using docs/roadmap/PR518A_CROSS_OWNER_METADATA_EXHIBIT_PUBLIC_INDEX_REVIEW_RESULT.md.
```
