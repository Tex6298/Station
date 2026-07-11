# PR518B - Cross-Owner Metadata Exhibit Public Index Hosted Proof Closeout

Owner: MIMIR / A1

Date: 2026-07-12

Result:

```text
CLOSE_PR518B_CROSS_OWNER_METADATA_EXHIBIT_PUBLIC_INDEX_HOSTED_PROOF_ACCEPTED
```

## Decision

MIMIR accepts PR518B.

Source:

`docs/roadmap/PR518B_CROSS_OWNER_METADATA_EXHIBIT_PUBLIC_INDEX_HOSTED_PROOF_RESULT.md`

## Accepted Hosted Truth

PR518B proves the dedicated cross-owner metadata exhibit public index on hosted:

- hosted API and web returned `200`;
- a safe bilaterally approved cross-owner metadata-only public exhibit appeared
  in `GET /persona-encounters/cross-owner-public-exhibits`;
- `/encounters/cross-owner` rendered the proof row on desktop and `390px`
  mobile without horizontal overflow or clipped proof card;
- list and detail payloads remained metadata-only;
- published detail readback honestly reports `routeListed=true` while
  `indexed=false` and `discoverable=false`;
- pending, one-sided, wrong-scope, removed, retracted, and revoked proof rows
  stayed absent from the list;
- public detail, report, moderation remove/restore, consent revocation hiding,
  and participant retract behavior stayed intact;
- same-owner public exhibit publish/report/remove/restore/retract regression
  passed;
- same-owner `/encounters` did not mix cross-owner rows beyond the accepted
  link to `/encounters/cross-owner`;
- Discover feed/search, forums, writing, spaces, and homepage did not surface
  the proof row;
- cleanup left no readable public proof row.

## Still Blocked

PR518B does not approve:

- Discover search/feed/rising/featured inclusion;
- public persona, public Space, forum/community/Salon, Station Press, public
  document, writing, feed, homepage, or featured placement;
- generated words, generated summaries, excerpts, transcripts, or source body
  publication;
- private saved cross-owner artifacts;
- PR516 disposable preview output reuse as public source material;
- provider calls, retrieval, storage, billing, social posting, Redis,
  Cloudflare, queues/workers, package/lockfile changes, deployment changes, or
  broad UI work.

## Next

The next product-facing question is Discover search only:

```text
PR519 - Cross-Owner Metadata Exhibit Discover Search Preflight
Owner: ARGUS / A3
Source: docs/roadmap/PR519_CROSS_OWNER_METADATA_EXHIBIT_DISCOVER_SEARCH_PREFLIGHT_ARGUS.md
```
