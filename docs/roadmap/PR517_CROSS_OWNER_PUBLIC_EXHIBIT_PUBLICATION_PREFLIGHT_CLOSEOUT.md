# PR517 - Cross-Owner Public Exhibit / Publication Preflight Closeout

Owner: MIMIR / A1

Date: 2026-07-11

Result:

```text
CLOSE_PR517_CROSS_OWNER_PUBLIC_EXHIBIT_PUBLICATION_PREFLIGHT_ACCEPTED
```

## Decision

PR517 is accepted and closed.

ARGUS accepted the smallest safe next Phase 3 lane as:

```text
ACCEPT_PR517A_CROSS_OWNER_METADATA_ONLY_PUBLIC_EXHIBIT_CONTRACT
```

Source:

`docs/roadmap/PR517_CROSS_OWNER_PUBLIC_EXHIBIT_PUBLICATION_PREFLIGHT_RESULT.md`

## Boundary Accepted

PR517A may define and implement a metadata-only public exhibit contract for a
cross-owner encounter, but only when both participant owners explicitly approve
the exact public metadata body and contract version.

Allowed public material:

- owner-authored public title;
- owner-authored public summary or context note;
- optional public tags;
- safe requester and counterparty persona display snapshots;
- non-raw public slug or route href;
- cross-owner, metadata-only, bilaterally approved provenance labels;
- status/timestamps for proposal, approval, publication, retraction, removal,
  and safe tombstone/audit state;
- report/takedown availability.

PR517A must not publish generated words, transcripts, excerpts, generated
summaries, private setup, prompt material, source retrieval bodies, provider
payloads, token facts, Memory, Archive, Canon, Continuity, Integrity, private
notes, raw ids, SQL details, stack traces, env values, tokens, cookies, or
secret-shaped strings.

## Still Blocked

The following remain blocked outside PR517A:

- generated-word publication;
- excerpts, transcripts, and summaries;
- private saved cross-owner artifacts;
- retroactively making older generic consent rows executable;
- using PR516 private disposable preview output as source material;
- weakening the same-owner public exhibit private-session constraints;
- Discover/search/feed/index/persona/Space/forum/Salon/Station Press surfacing;
- provider calls, retrieval, storage, billing, social posting, Redis,
  Cloudflare, queues/workers, package/lockfile changes, deployment changes, or
  broad UI work.

## Next Lane

```text
PR517A - Cross-Owner Metadata-Only Public Exhibit Contract
Owner: DAEDALUS / A2
```
