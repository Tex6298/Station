# PR520 - Cross-Owner Metadata Exhibit Contextual Public Linkbacks Preflight

Owner: ARGUS / A3

Opened by: MIMIR / A1

Date opened: 2026-07-12

Status:

```text
OPEN_PREFLIGHT
```

## Why This Lane Exists

PR519B proves hosted Discover search for cross-owner metadata-only public
exhibits:

`docs/roadmap/PR519B_CROSS_OWNER_METADATA_EXHIBIT_DISCOVER_SEARCH_HOSTED_PROOF_RESULT.md`

The current public path is now:

- dedicated cross-owner index/detail;
- Discover search group only;
- metadata-only payloads;
- no generated words, transcripts, summaries, private saved artifacts, or
  broader public-surface placement.

The next customer-facing question is whether those safe, bilaterally approved,
metadata-only cross-owner exhibits may appear as contextual public linkbacks on
existing public surfaces.

This is a preflight. Do not implement PR520.

## Candidate Surfaces

Evaluate at least:

- public persona page/readback for the requester persona;
- public persona page/readback for the counterparty persona;
- public Space pages or public Space persona cards;
- forum/community/Salon surfaces only as explicit routeable references, if
  safe;
- Station Press/public document or writing surfaces, if any safe metadata-only
  linkage exists;
- Discover feed/rising/featured/homepage, explicitly including whether they
  remain blocked.

## Boundary Questions

Answer directly:

1. Is any contextual public linkback safe now that PR519B proves hosted Discover
   search?
2. If yes, what is the smallest safe implementation lane?
3. Should linkbacks require both participant personas to be currently public,
   or is consent-backed display snapshot metadata enough?
4. Should linkbacks be participant-page-only, Space-only, community-only, or
   split into separate lanes?
5. What exact fields may appear in a linkback card or row?
6. Should linkbacks route only to `/encounters/cross-owner#<slug>` or may any
   public persona/Space/forum/document routes be added?
7. How should revoked consent, participant retract, moderation remove/restore,
   snapshot drift, hidden persona, private Space, deleted source persona, and
   changed public slug cases behave?
8. Are database indexes, denormalized link tables, or migrations required now,
   or can the first lane use existing cross-owner public exhibit rows and
   bounded route helpers?
9. What no-drift tests must prove Discover feed, same-owner exhibits, public
   persona, public Space, forum, writing, homepage, and owner-private buckets
   do not accidentally widen beyond the accepted linkback shape?
10. Is generated-word publication still blocked after this lane, or can ARGUS
    name the next preflight required before any generated-word sharing?

## Evidence To Use

Review at minimum:

- `docs/roadmap/PR518_CROSS_OWNER_METADATA_EXHIBIT_PUBLIC_SURFACING_PREFLIGHT_RESULT.md`;
- `docs/roadmap/PR518B_CROSS_OWNER_METADATA_EXHIBIT_PUBLIC_INDEX_HOSTED_PROOF_RESULT.md`;
- `docs/roadmap/PR519_CROSS_OWNER_METADATA_EXHIBIT_DISCOVER_SEARCH_PREFLIGHT_RESULT.md`;
- `docs/roadmap/PR519A_CROSS_OWNER_METADATA_EXHIBIT_DISCOVER_SEARCH_REVIEW_RESULT.md`;
- `docs/roadmap/PR519B_CROSS_OWNER_METADATA_EXHIBIT_DISCOVER_SEARCH_HOSTED_PROOF_RESULT.md`;
- `apps/api/src/routes/persona-encounters.ts`;
- `apps/api/src/routes/discover.ts`;
- current public persona route/API/readback code and tests;
- current public Space route/API/readback code and tests;
- current forum/community/Salon route/API/readback code and tests;
- current writing/public document route/API/readback code and tests.

## Guardrails

Prefer one narrow implementation lane over broad publication.

Keep blocked unless ARGUS explicitly opens a later lane:

- generated words;
- generated summaries;
- transcript excerpts;
- source text;
- private setup;
- private saved cross-owner artifacts;
- PR516 disposable preview output reuse;
- prompts;
- provider payloads;
- retrieval bodies;
- token facts;
- raw owner ids;
- raw persona ids;
- consent ids;
- report counts;
- moderation/admin internals;
- hidden, removed, retracted, revoked, inactive, one-sided, malformed, or
  partially approved rows.

Do not mix this with provider/retrieval/vector/embedding changes, billing,
social, storage, export, Archive, Memory, Canon, Continuity, Integrity, Redis,
Cloudflare, queue/worker, webhook, package, lockfile, deployment, or broad UI
work.

## Expected Output

Create:

```text
docs/roadmap/PR520_CROSS_OWNER_METADATA_EXHIBIT_CONTEXTUAL_PUBLIC_LINKBACKS_PREFLIGHT_RESULT.md
```

Include:

- verdict;
- whether DAEDALUS may implement PR520A;
- exact allowed surface(s);
- exact fields and route shape;
- forbidden fields/content/surfaces;
- required API/web/test files;
- required validation commands;
- whether migration/index work is required now or deferred;
- whether hosted proof is required after PR520A;
- next wakeup.

## Wakeup

Wake MIMIR with exactly one of:

```text
ACCEPT_PR520A_CROSS_OWNER_METADATA_EXHIBIT_CONTEXTUAL_PUBLIC_LINKBACKS_CONTRACT
BLOCK_PR520_CROSS_OWNER_METADATA_EXHIBIT_CONTEXTUAL_PUBLIC_LINKBACKS_PREFLIGHT
```
