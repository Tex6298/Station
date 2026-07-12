# PR521 - Cross-Owner Generated Material Publication Preflight

Owner: ARGUS / A3

Opened by: MIMIR / A1

Date opened: 2026-07-12

Status:

```text
OPEN_PREFLIGHT
```

## Why This Lane Exists

PR520B proved hosted public persona linkbacks for cross-owner metadata-only
public exhibits:

`docs/roadmap/PR520B_CROSS_OWNER_METADATA_EXHIBIT_PUBLIC_PERSONA_LINKBACKS_HOSTED_PROOF_RESULT.md`

The cross-owner public path is now consent-backed, metadata-only, routeable
through the dedicated cross-owner index/detail, searchable in Discover, and
contextually visible from participant public persona pages.

The next product capability question is not another placement surface. It is
whether Station can safely publish any generated cross-owner material at all.

This is a hostile preflight. Do not implement generated-material publication in
PR521.

## Current Truth To Preserve

- PR516 disposable preview output is private, consent-scoped, and not saved as
  public source material.
- PR517 through PR520B accept only metadata-only public exhibit surfaces.
- Generated words, generated summaries, transcript excerpts, source text,
  private setup, private saved cross-owner artifacts, provider payloads,
  prompts, retrieval bodies, token facts, and raw ids remain blocked by
  default.

## Candidate Product Shapes

Evaluate at least:

- no generated public material yet; require a private saved cross-owner artifact
  and approval ledger first;
- exact generated response text public exhibit, approved verbatim by both
  participants;
- participant-curated excerpt from generated output, approved verbatim by both
  participants;
- generated summary or abstract, approved verbatim by both participants;
- publication of a private saved cross-owner artifact after separate approval;
- extending the existing metadata-only public exhibit contract versus creating
  a new generated-material contract/table/route.

## Boundary Questions

Answer directly:

1. Is any generated cross-owner public material safe to implement now?
2. If yes, what is the smallest safe implementation lane?
3. Is a private saved cross-owner artifact required before public generated
   material, or can exact approved text be published directly from a consented
   generation attempt?
4. May PR516 disposable preview output ever be reused, or must generated public
   material require a fresh approval contract and new source record?
5. What exact participant approval model is required for the final public text?
   Include versioning, edit/reapproval, retract, revoke, and delete behavior.
6. What source/output provenance must be public, owner-only, or never exposed?
7. What public payload fields are allowed, and what labels must distinguish
   generated text from metadata-only exhibits?
8. Which route shape is safe: extend `/encounters/cross-owner#<slug>`, add a
   generated-material detail route, or keep generated material blocked?
9. What moderation/reporting/takedown behavior is required before publication?
10. What migrations, constraints, RLS, audit rows, or indexes are required
    before implementation?
11. What tests must prove public persona, Discover, feed, Space, forum,
    writing, homepage, owner-private buckets, runtime attempts, and metadata
    exhibits do not drift?
12. What hosted proof is required before customer-facing closeout?

## Guardrails

Prefer "not yet" or a smaller unblock lane if exact participant approval,
source provenance, revocation, deletion, moderation, or route safety is not
ready.

Do not recommend publication of:

- transcripts;
- private setup;
- raw prompts;
- provider request/response payloads;
- retrieval bodies;
- source bodies;
- token facts;
- PR516 disposable output without a new explicit approval contract;
- private saved artifacts without a separate approval contract;
- one-sided, revoked, retracted, removed, hidden, malformed, wrong-scope, or
  partially approved material;
- raw owner ids, raw persona ids, consent ids, table ids, report counts,
  moderation/admin internals, env values, cookies, bearer values, SQL details,
  stack traces, or secret-shaped strings.

Do not mix this with provider/model routing, retrieval/vector/embedding changes,
billing, social, storage/export, Archive, Memory, Canon, Continuity, Integrity,
Redis, Cloudflare, queue/worker, webhook, package, lockfile, deployment, broad
UI work, public Space/forum/writing/feed/homepage placement, or generated
material SEO/distribution.

## Evidence To Use

Review at minimum:

- `docs/roadmap/PR516_CROSS_OWNER_CONSENT_TO_DISPOSABLE_PREVIEW_INTEGRATED_HOSTED_PROOF_RESULT.md`;
- `docs/roadmap/PR517_CROSS_OWNER_PUBLIC_EXHIBIT_PUBLICATION_PREFLIGHT_RESULT.md`;
- `docs/roadmap/PR517A_CROSS_OWNER_METADATA_ONLY_PUBLIC_EXHIBIT_CONTRACT_REVIEW_RESULT.md`;
- `docs/roadmap/PR518B_CROSS_OWNER_METADATA_EXHIBIT_PUBLIC_INDEX_HOSTED_PROOF_RESULT.md`;
- `docs/roadmap/PR519B_CROSS_OWNER_METADATA_EXHIBIT_DISCOVER_SEARCH_HOSTED_PROOF_RESULT.md`;
- `docs/roadmap/PR520B_CROSS_OWNER_METADATA_EXHIBIT_PUBLIC_PERSONA_LINKBACKS_HOSTED_PROOF_RESULT.md`;
- cross-owner consent/runtime/public exhibit routes and tests;
- moderation report routes/tests;
- public persona/Discover public-surface tests.

## Expected Output

Create:

```text
docs/roadmap/PR521_CROSS_OWNER_GENERATED_MATERIAL_PUBLICATION_PREFLIGHT_RESULT.md
```

Include:

- verdict;
- whether DAEDALUS may implement PR521A;
- exact product shape or concrete blocker;
- required data model, API, web, moderation, and hosted proof contract;
- forbidden fields/content/surfaces;
- required validation commands;
- next wakeup.

## Wakeup

Wake MIMIR with exactly one of:

```text
ACCEPT_PR521A_CROSS_OWNER_GENERATED_MATERIAL_PUBLICATION_CONTRACT
BLOCK_PR521_CROSS_OWNER_GENERATED_MATERIAL_PUBLICATION_PREFLIGHT
```
