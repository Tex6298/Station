# PR521 - Cross-Owner Generated Material Publication Preflight Result

Owner: ARGUS / A3

Requested by: MIMIR / A1

Date: 2026-07-12

Source:
`docs/roadmap/PR521_CROSS_OWNER_GENERATED_MATERIAL_PUBLICATION_PREFLIGHT_ARGUS.md`

Result:

```text
BLOCK_PR521_CROSS_OWNER_GENERATED_MATERIAL_PUBLICATION_PREFLIGHT
```

## Verdict

ARGUS does not accept a generated-material public publication lane now.
DAEDALUS may not implement PR521A as generated cross-owner public material.

Concrete blocker:

```text
CROSS_OWNER_PRIVATE_GENERATED_ARTIFACT_AND_EXACT_TEXT_APPROVAL_LEDGER_MISSING
```

The current system has a hosted-proven private/disposable cross-owner preview
path and a hosted-proven metadata-only public exhibit path. It does not yet
have a durable participant-visible source artifact for generated cross-owner
output, a versioned exact-text bilateral approval ledger for final public text,
or generated-material-specific public route, moderation, revocation, deletion,
RLS, audit, and hosted-proof contracts.

Publishing exact generated words, excerpts, summaries, abstracts, transcripts,
or private saved artifact contents now would either reuse PR516 disposable
preview output outside its accepted contract or invent a public serialization
path without the source and approval controls required for generated text.

## Evidence Reviewed

ARGUS reviewed:

- `docs/roadmap/PR521_CROSS_OWNER_GENERATED_MATERIAL_PUBLICATION_PREFLIGHT_ARGUS.md`;
- `docs/roadmap/PR516_CROSS_OWNER_CONSENT_TO_DISPOSABLE_PREVIEW_INTEGRATED_HOSTED_PROOF_RESULT.md`;
- `docs/roadmap/PR517_CROSS_OWNER_PUBLIC_EXHIBIT_PUBLICATION_PREFLIGHT_RESULT.md`;
- `docs/roadmap/PR517A_CROSS_OWNER_METADATA_ONLY_PUBLIC_EXHIBIT_CONTRACT_REVIEW_RESULT.md`;
- `docs/roadmap/PR518B_CROSS_OWNER_METADATA_EXHIBIT_PUBLIC_INDEX_HOSTED_PROOF_RESULT.md`;
- `docs/roadmap/PR519B_CROSS_OWNER_METADATA_EXHIBIT_DISCOVER_SEARCH_HOSTED_PROOF_RESULT.md`;
- `docs/roadmap/PR520B_CROSS_OWNER_METADATA_EXHIBIT_PUBLIC_PERSONA_LINKBACKS_HOSTED_PROOF_RESULT.md`;
- cross-owner consent, disposable-preview, runtime-attempt, public metadata
  exhibit, report, public persona, Discover, writing, community, and Studio UI
  route/test coverage.

Accepted current truth:

- PR516 disposable preview output is private, consent-scoped, actor-visible,
  not saved, not public, not canonical, not shareable, not a transcript,
  summary, excerpt, or source artifact, and not reusable as public source
  material by default.
- PR517 through PR520B accepted only metadata-only public exhibit surfaces:
  dedicated index/detail, Discover search group, and participant public persona
  linkbacks.
- Current public metadata surfaces exclude generated words, transcripts,
  excerpts, generated summaries, source text, private setup, PR516 output,
  provider payloads, prompts, retrieval bodies, token facts, raw ids, consent
  ids, report counts, admin internals, env values, bearer values, cookies, SQL
  details, stack traces, and secret-shaped strings.
- Current runtime-attempt audit is bounded metadata only. It is not an output
  repository and does not certify public text.

## Boundary Answers

1. No generated cross-owner public material is safe to implement now.

2. The smallest safe next lane is not public publication. It is a private,
   participant-only generated artifact and exact-text approval ledger contract.
   MIMIR should route a separate unblock lane before any public generated-text
   surface.

3. A private saved cross-owner generated artifact is required before public
   generated material. Publishing directly from a consented generation attempt
   is not safe because the attempt output is not a durable reviewed source of
   truth, and current runtime audit rows deliberately do not store public text.

4. PR516 disposable preview output may not be reused automatically. If a future
   product wants to publish identical words, those words must enter a new
   explicit generated-material source record and final-text approval contract.
   The PR516 preview itself remains private, disposable, and outside public
   source provenance.

5. The required approval model must be generated-material-specific:

   - an active participant consent with the required generated-publication
     scope and scope version;
   - a private source artifact visible only to eligible participants;
   - a canonical final public text revision and immutable text digest;
   - exact approval of that final revision by both participant owners;
   - approval timestamps, approver roles, and contract version recorded in an
     append-only ledger;
   - any edit, regenerated summary, excerpt change, title/body change, source
     artifact change, or participant snapshot change resets approval;
   - one-sided approval cannot publish or restore;
   - participant retract, consent revocation, persona deletion, owner deletion,
     moderation removal, or source artifact invalidation hides the public row;
   - restore requires the full active consent, source, approval, moderation,
     and deletion checks to pass again;
   - deletion removes public readability while preserving only bounded audit
     facts needed for safety and compliance.

6. Provenance boundaries:

   - public may show only route-safe slug/href, title, exact approved generated
     public text, generated-material label, participant display snapshots,
     public status, published time, contract version, and bounded provenance
     flags;
   - participant/owner-only readback may show source artifact status, revision,
     approval state, audit lifecycle, moderation state, and bounded failure
     reasons;
   - never expose private setup, prompts, provider request/response payloads,
     retrieval bodies, source bodies, token facts, raw owner ids, raw persona
     ids, consent ids, artifact ids, report counts, admin notes, env values,
     bearer values, cookies, SQL details, stack traces, or secret-shaped
     strings.

7. Future public payload fields, if MIMIR later accepts a generated-material
   contract, must be explicit and separate from metadata-only exhibits:
   `slug`, route-safe `href`, `title`, `body` or `excerpt` containing only the
   exact approved final public text, `kind`, `status`, `contractVersion`,
   `textRevision`, `publishedAt`, participant display snapshots, and provenance
   flags such as `generatedMaterialPublic: true`, `bilateralExactTextApproval:
   true`, `metadataOnly: false`, `indexed`, and `discoverable`. Public labels
   must say generated material, not metadata-only exhibit.

8. Safe route shape for PR521 is to keep generated material blocked. A future
   accepted lane should use a dedicated generated-material contract/table/route,
   not extend `/encounters/cross-owner#<slug>` as though generated text were
   the same product as metadata-only exhibits. Metadata-only routes may not
   embed generated body text without a new accepted route contract.

9. Required moderation/reporting/takedown before publication:

   - public report target support for generated cross-owner material;
   - admin queue context that includes only safe labels and route facts;
   - participant retract and moderation remove paths that immediately hide the
     public body;
   - restore only after active consent, exact bilateral approval, source
     validity, participant visibility, and moderation checks pass;
   - review-request behavior for eligible participants;
   - no public report counts, reporter identities, admin notes, or moderation
     internals in public payloads.

10. Required data model before implementation:

    - migration for participant-only private generated source artifacts or an
      equivalent source-of-truth table;
    - generated public material table separate from metadata-only exhibit rows;
    - append-only approval/revision ledger with exact-text digest, source
      artifact reference, participant roles, approval contract version, and
      timestamps;
    - RLS proving only participants can read private source artifacts and only
      published safe rows are publicly readable;
    - constraints for active consent, required scope/version, safe slug, source
      artifact match, row/consent participant match, non-removed,
      non-retracted, and non-deleted state;
    - audit rows for propose, approve, edit, retract, revoke, remove, restore,
      delete, and blocked-public-read attempts;
    - indexes for participant review queues, safe public slug/detail lookups,
      moderation queues, and revocation/retract cleanup.

11. Required no-drift tests before future publication:

    - public persona chat and context-preview sources do not ingest generated
      public material unless separately accepted;
    - public persona linkbacks remain metadata-only unless separately routed;
    - Discover search/feed/rising/featured, same-owner `/encounters`, public
      Space, forum/Salon/community, writing/public document, homepage, owner
      private buckets, runtime-attempt readback, and metadata-only exhibit
      routes do not drift;
    - unsafe slugs, stale snapshots, revoked consent, wrong scope/version,
      one-sided approval, edits after approval, retracted, removed, deleted,
      malformed, wrong contract, wrong schema, and missing source rows fail
      closed;
    - payload-key tests prove no raw ids, private setup, prompts, provider
      payloads, retrieval bodies, token facts, report/admin fields, SQL
      details, stack traces, bearer values, env values, or secrets appear.

12. Hosted proof before customer-facing closeout must prove fresh deployed API
    and web behavior for source creation/review, exact bilateral approval,
    public read, retract/revoke/remove/restore/delete controls, public reports,
    desktop and `390px` mobile rendering, latency, public no-drift surfaces,
    privacy scans, and cleanup leaving no readable temporary generated proof
    rows.

## Smallest Unblock Recommendation

If MIMIR wants to continue this product direction, route a private unblock lane
before public publication:

```text
Cross-Owner Private Generated Artifact and Exact-Text Approval Ledger
Owner: DAEDALUS / A2
```

Required scope:

- participant-only private saved generated artifact source record;
- no public generated-material route yet;
- exact final-text proposal/revision model;
- bilateral approval ledger for exact text, with edit/reapproval behavior;
- participant retract, consent revoke, delete, and moderation placeholders;
- API and web helper tests proving no public route, no PR516 output reuse, no
  prompt/provider/retrieval/token/raw-id leakage, and no drift into existing
  metadata-only public surfaces.

Out of scope:

- public generated text, transcript, summary, excerpt, abstract, or source body;
- public Space/forum/writing/feed/homepage placement;
- public persona chat/context-preview source expansion;
- provider/model routing, retrieval/vector/embedding, billing, storage/export,
  Archive, Memory, Canon, Continuity, Integrity, Redis, Cloudflare, queues,
  workers, webhooks, partner adapters, package/lockfile, deployment, or broad
  UI work.

## Validation

Environment note: direct `npm run test:personas` stopped before test execution
because `pnpm` was not on PATH in this shell. ARGUS reran validation through
the repo-declared `pnpm@10.32.1` using `npx`.

| Command / check | Result | Notes |
| --- | --- | --- |
| `npx --yes pnpm@10.32.1 run test:personas` | Pass | 18 tests passed, including public persona linkbacks, public context-preview, and fail-closed public persona reads. |
| `npx --yes pnpm@10.32.1 run test:persona-encounters` | Pass | 74 tests passed, including disposable preview privacy, runtime-attempt metadata audit, cross-owner metadata-only public exhibits, consent revocation, and moderation. |
| `npx --yes pnpm@10.32.1 run test:reports` | Pass | 8 tests passed, including same-owner and cross-owner public exhibit moderation behavior. |
| `npx --yes pnpm@10.32.1 run test:community` | Pass | 47 tests passed, including Discover cross-owner metadata search separation and feed/writing no-drift helpers. |
| `npx --yes pnpm@10.32.1 run test:writing` | Pass | 32 tests passed, including public persona linkback anchors and chat/context source exclusion. |
| `npx --yes pnpm@10.32.1 run test:studio-ui` | Pass | 215 tests passed, including private/disposable and metadata-only boundary copy plus redaction coverage. |
| `npx --yes pnpm@10.32.1 run typecheck` | Pass | Turbo API/web typecheck passed from cache. |
| `git diff --check` | Pass | Run after the docs-only verdict edits. |

## Next Wakeup

Wake MIMIR:

```text
WAKEUP A1:
Codename: MIMIR

BLOCK_PR521_CROSS_OWNER_GENERATED_MATERIAL_PUBLICATION_PREFLIGHT
```
