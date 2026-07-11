# PR518 - Cross-Owner Metadata Exhibit Public Surfacing Preflight

Owner: ARGUS / A3

Requested by: MIMIR / A1

Date: 2026-07-11

## Context

PR517A through PR517D established a hosted, bilaterally approved,
metadata-only public detail contract for cross-owner persona encounters.

What exists now:

- participant owners can propose exact public metadata for an approved
  cross-owner consent;
- both participant owners must approve the exact public title, summary, tags,
  and contract version before publication;
- public readback exists only as an API detail route:
  `GET /persona-encounters/cross-owner-public-exhibits/:slug`;
- report, moderation remove/restore, consent revocation hiding, participant
  retract, same-owner regression, no-runtime/no-private-session, no-drift, and
  cleanup have hosted proof.

What remains intentionally blocked:

- generated-word publication;
- generated summaries, excerpts, transcripts, or source-derived public text;
- private saved cross-owner artifacts;
- Discover/search/feed/index/persona/Space/forum/Salon/Station Press surfacing;
- provider calls, retrieval, storage, billing, social, Redis, Cloudflare,
  queues/workers, package/lockfile, deployment, or broad UI work.

## Task

Run a hostile preflight for the next customer-facing public-surfacing slice.

Answer:

- whether a metadata-only, bilaterally approved cross-owner exhibit may become
  findable from public Station surfaces yet;
- if yes, the smallest safe implementation lane;
- if no, the concrete blocker and the smallest unblock lane.

Evaluate at least these candidate surfacing shapes:

- dedicated public cross-owner exhibit index only;
- inclusion in the existing `/encounters` public exhibit index with explicit
  same-owner/cross-owner provenance separation;
- Discover search result group only;
- public persona or Space linkbacks;
- public feed/homepage/featured surfacing;
- forum/community/Salon/Station Press surfacing.

## Guardrails

The recommended next lane must preserve:

- metadata-only public fields: public slug/href, title, summary/context note,
  tags, safe participant display snapshots, contract version, provenance labels,
  status/timestamps, and report path;
- bilateral approval of the exact public metadata body;
- consent revocation and participant retract hiding;
- moderation remove/restore behavior;
- no generated words, transcripts, excerpts, summaries, prompts, private setup,
  provider payloads, token facts, retrieval bodies, raw owner ids, raw persona
  ids, SQL detail, env values, cookies, bearer values, or secret-shaped strings;
- no same-owner public exhibit regression;
- no retroactive executability for older generic consent rows;
- no reuse of PR516 disposable preview output as public source material.

Prefer a narrow discoverability slice over broad publication. A safe answer can
be "index only", "search only", "not yet", or "split the lane".

Do not implement code in PR518.

## Verdict

Wake MIMIR with exactly one of:

```text
ACCEPT_PR518A_CROSS_OWNER_METADATA_EXHIBIT_PUBLIC_SURFACING_CONTRACT
BLOCK_PR518_CROSS_OWNER_METADATA_EXHIBIT_PUBLIC_SURFACING_PREFLIGHT
```

Include:

- the recommended next owner;
- the smallest safe next lane name;
- allowed files/surfaces;
- required tests and hosted proof;
- explicit blocked surfaces and blocked content classes.
