# PR518A - Cross-Owner Metadata Exhibit Dedicated Public Index Closeout

Owner: MIMIR / A1

Date: 2026-07-12

Result:

```text
CLOSE_PR518A_CROSS_OWNER_METADATA_EXHIBIT_PUBLIC_INDEX_ACCEPTED_LOCALLY
```

## Decision

MIMIR accepts PR518A locally with the ARGUS review patch.

Sources:

- `docs/roadmap/PR518A_CROSS_OWNER_METADATA_EXHIBIT_PUBLIC_INDEX_RESULT.md`
- `docs/roadmap/PR518A_CROSS_OWNER_METADATA_EXHIBIT_PUBLIC_INDEX_REVIEW_RESULT.md`

Accepted verdict:

```text
ACCEPT_PR518A_CROSS_OWNER_METADATA_EXHIBIT_PUBLIC_INDEX_WITH_ARGUS_PATCH
```

## Accepted Shape

PR518A adds the first public findability surface for cross-owner metadata-only
public exhibits:

- `GET /persona-encounters/cross-owner-public-exhibits`;
- dedicated web index `/encounters/cross-owner`;
- one link from same-owner `/encounters` to the dedicated cross-owner index;
- no cross-owner row mixing into the same-owner list.

The public list is bounded, cursorable, and consent-backed. It uses the same
public-readability floor as the public detail route and now fails closed when
safe display snapshots drift away from the linked consent snapshots.

Public payload/readback is still metadata-only: public slug/href, title,
summary/context note, tags, safe participant display snapshots, contract
version, status, published timestamp, provenance labels, and report path.

ARGUS patched stale route-listing readback so published cross-owner exhibits
now report the dedicated index honestly while Discover/search/feed remain
`false`.

## Still Blocked

PR518A does not approve:

- Discover search/feed/rising/featured inclusion;
- same-owner `/encounters` row mixing;
- public persona, public Space, forum/community/Salon, Station Press, public
  document, writing, feed, homepage, or featured placement;
- generated words, generated summaries, excerpts, transcripts, or source body
  publication;
- private saved cross-owner artifacts;
- PR516 disposable preview output reuse as public source material;
- provider calls, retrieval, storage, billing, social posting, Redis,
  Cloudflare, queues/workers, package/lockfile changes, deployment changes, or
  broad UI work.

## Validation

```text
npm exec --yes pnpm@10.32.1 -- run test:persona-encounters PASS - 74 tests
npm exec --yes pnpm@10.32.1 -- run test:reports            PASS - 8 tests
npm exec --yes pnpm@10.32.1 -- run test:community          PASS - 44 tests
npm exec --yes pnpm@10.32.1 -- run test:writing            PASS - 29 tests
npm exec --yes pnpm@10.32.1 -- run test:studio-ui          PASS - 215 tests
npm exec --yes pnpm@10.32.1 -- run typecheck               PASS
git diff --check                                            PASS
git diff --cached --check                                   PASS
```

## Next

Route ARIADNE for hosted proof:

```text
PR518B - Cross-Owner Metadata Exhibit Public Index Hosted Proof
Owner: ARIADNE / A4
Source: docs/roadmap/PR518B_CROSS_OWNER_METADATA_EXHIBIT_PUBLIC_INDEX_HOSTED_PROOF_ARIADNE.md
```
