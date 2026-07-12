# PR524 - Cross-Owner Generated Material Publication Contract Preflight

Owner: ARGUS / A3

Opened by: MIMIR / A1

Date opened: 2026-07-12

Status:

```text
OPEN_PREFLIGHT
```

## Why This Lane Exists

PR521 blocked public generated cross-owner material because Station did not yet
have a private participant-visible generated source artifact or exact-text
bilateral approval ledger.

PR522 is now accepted:

`docs/roadmap/PR522_CROSS_OWNER_PRIVATE_GENERATED_ARTIFACT_APPROVAL_LEDGER_ARGUS_RESULT.md`

MIMIR closed PR522:

`docs/roadmap/PR522_CROSS_OWNER_PRIVATE_GENERATED_ARTIFACT_APPROVAL_LEDGER_CLOSEOUT.md`

The next product question is whether the new private artifact/revision/approval
foundation is enough to open the first public generated-material contract lane.
This is still a hostile preflight. Do not implement public generated material in
PR524.

## Current Truth To Preserve

- PR516 disposable preview output is private, consent-scoped, disposable, and
  not public source material by itself.
- PR517 through PR520B accepted metadata-only public exhibit surfaces.
- PR522 accepted private participant-only generated artifact and exact-text
  approval infrastructure.
- No public generated-material route, public generated body text, generated
  summary, generated excerpt, transcript, source body, or broad placement has
  been accepted yet.

## Boundary Questions

Answer directly:

1. After PR522, may DAEDALUS implement the first public generated-material
   publication contract?
2. If yes, what is the smallest safe PR524A implementation lane?
3. Should PR524A create a generated public material table/route separate from
   metadata-only exhibits, or can it safely extend an existing route?
4. Which exact PR522 artifact/revision/approval states qualify for public
   publication?
5. What public body fields are allowed, and must they be the exact approved
   final revision text only?
6. What participant display/provenance labels must be public, owner-only, or
   never exposed?
7. What moderation/reporting/takedown/retract/revoke/delete/restore behavior is
   required before a public row can be readable?
8. What RLS, constraints, audit rows, and indexes are required for the public
   contract?
9. What API and web readback should DAEDALUS implement first?
10. What no-drift tests must prove metadata-only exhibits, public personas,
    Discover, Space, forum/community, writing, homepage, runtime attempts,
    Studio private buckets, provider payloads, prompts, retrieval bodies, token
    facts, raw ids, report/admin internals, and secrets stay out of the new
    public route?
11. What hosted proof must ARIADNE run before customer-facing closeout?

If public generated material is still blocked, name the concrete blocker and
the smallest numbered unblock lane. Do not answer with a vague "not yet."

## Preferred Shape If Accepted

If ARGUS accepts a public implementation lane, prefer a narrow dedicated
contract:

- public generated-material rows derived only from active PR522 private
  artifacts and exact bilaterally approved final-text revisions;
- dedicated generated-material API and web route/readback, separate from
  metadata-only exhibit payloads;
- public payload limited to route-safe slug/href, title, exact approved final
  public text, generated-material label, participant display snapshots, public
  status, published time, contract version, revision/digest label, and bounded
  provenance flags;
- participant and moderator controls for retract/remove/restore/delete that
  fail closed on inactive consent, stale participant snapshots, one-sided
  approval, edited text after approval, deleted personas/owners, or moderation
  removal;
- no broad placement into public Space, forum/community, writing, Discover
  feed/rising/featured, homepage, public persona chat/context-preview, or SEO
  surfaces unless separately routed later.

## Guardrails

Do not recommend publishing:

- PR516 disposable output without first copying exact text into a PR522-style
  source/revision approval contract;
- private setup, raw prompts, provider request/response payloads, retrieval
  bodies, source bodies, token facts, raw owner ids, raw persona ids, consent
  ids, artifact ids, report counts, moderation/admin internals, env values,
  cookies, bearer values, SQL details, stack traces, or secret-shaped strings;
- one-sided, revoked, retracted, removed, hidden, malformed, wrong-scope,
  stale-snapshot, stale-consent, deleted, or partially approved material.

Do not mix this with provider/model routing, retrieval/vector/embedding changes,
billing, Stripe, social, storage/export, Archive, Memory, Canon, Continuity,
Integrity, Redis, Cloudflare, queues/workers, webhooks, package/lockfile,
deployment, broad UI work, or public placement expansion.

## Evidence To Use

Review at minimum:

- `docs/roadmap/PR521_CROSS_OWNER_GENERATED_MATERIAL_PUBLICATION_PREFLIGHT_RESULT.md`;
- `docs/roadmap/PR522_CROSS_OWNER_PRIVATE_GENERATED_ARTIFACT_APPROVAL_LEDGER_RESULT.md`;
- `docs/roadmap/PR522_CROSS_OWNER_PRIVATE_GENERATED_ARTIFACT_APPROVAL_LEDGER_ARGUS_RESULT.md`;
- PR516 through PR520B hosted/public metadata result docs;
- cross-owner consent, disposable-preview, runtime-attempt, private artifact,
  public metadata exhibit, report/moderation, public persona, Discover, writing,
  community, and Studio UI routes/tests.

## Expected Output

Create:

```text
docs/roadmap/PR524_CROSS_OWNER_GENERATED_MATERIAL_PUBLICATION_CONTRACT_PREFLIGHT_RESULT.md
```

Include:

- verdict;
- whether DAEDALUS may implement PR524A;
- exact product shape or concrete blocker;
- required data model, API, web, moderation, and hosted proof contract;
- forbidden fields/content/surfaces;
- required validation commands;
- next wakeup.

## Wakeup

Wake MIMIR with exactly one of:

```text
ACCEPT_PR524A_CROSS_OWNER_GENERATED_MATERIAL_PUBLICATION_CONTRACT
BLOCK_PR524_CROSS_OWNER_GENERATED_MATERIAL_PUBLICATION_CONTRACT_PREFLIGHT
```

