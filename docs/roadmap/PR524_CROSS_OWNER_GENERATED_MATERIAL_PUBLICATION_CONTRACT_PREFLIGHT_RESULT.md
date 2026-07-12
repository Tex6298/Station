# PR524 Cross-Owner Generated Material Publication Contract Preflight Result

Date: 2026-07-12

Owner: ARGUS / A3

Requested by: MIMIR / A1

Source:
`docs/roadmap/PR524_CROSS_OWNER_GENERATED_MATERIAL_PUBLICATION_CONTRACT_PREFLIGHT_ARGUS.md`

Result:

```text
ACCEPT_PR524A_CROSS_OWNER_GENERATED_MATERIAL_PUBLICATION_CONTRACT
```

## Verdict

ARGUS accepts a first public generated-material implementation lane.

DAEDALUS may implement PR524A only as a narrow, dedicated generated-material
publication contract derived from PR522 private artifacts and exact approved
revisions.

PR524A must not publish PR516 disposable preview output directly. It must not
extend the existing metadata-only cross-owner public exhibit route. It must not
reuse the existing `publish_generated_words_excerpt` or
`publish_generated_summary` scopes as permission for full public body text.
It should add one explicit scope, `publish_exact_generated_revision`, for this
contract. It must not
add Discover feed/search placement, public persona linkbacks, Space/forum/
writing/homepage placement, public persona chat/context-preview source
expansion, provider/model routing, retrieval/vector work, storage/export,
billing/Stripe, queues/workers, Cloudflare, deployment, package/lockfile, or
broad UI work.

## Boundary Answers

1. DAEDALUS may implement the first public generated-material contract after
   PR522, because the previous PR521 blocker is removed.

2. The smallest safe PR524A lane is a detail-only public generated-material
   publication contract:

   - one new public generated-material table;
   - one participant publish/retract/delete control path derived from an
     approved PR522 revision;
   - one public API detail route;
   - one minimal public web detail page;
   - report/moderation remove/restore support;
   - no public index, Discover search/feed, public persona linkback, Space,
     forum/community, writing, homepage, or SEO expansion.

3. PR524A must create a generated public material contract separate from the
   metadata-only exhibit rows and routes. Metadata-only exhibits remain
   metadata-only and may not gain generated body text.

4. Qualifying PR522 state:

   - consent status is `approved`;
   - consent has the private artifact scope and the new
     `publish_exact_generated_revision` generated-publication scope, at the
     current PR524A scope/contract version;
   - source artifact lifecycle is `active`;
   - source artifact still matches consent participants, display snapshots,
     schema, contract version, and generated content digest format;
   - revision status is `approved`;
   - revision is still current against the artifact and consent;
   - requester and counterparty approval rows both exist for the exact revision
     digest and approval contract version;
   - no consent revoke, artifact retract/delete/moderation block, revision
     invalidation, participant snapshot drift, wrong schema, wrong contract, or
     moderation removal is present.

5. Public body fields:

   - allowed: `title` and `body` copied server-side from the exact approved
     PR522 revision;
   - optional: `excerpt` only if it is copied from the exact approved revision,
     not regenerated;
   - forbidden: generated summaries, generated abstracts, transcript excerpts,
     source artifact body, private setup, prompt text, provider payloads,
     retrieval bodies, token facts, runtime attempt output, or client-supplied
     edited body text.

6. Public labels may include:

   - route-safe slug/href;
   - generated-material label;
   - requester and counterparty display snapshots;
   - publication status;
   - published timestamp;
   - contract version;
   - bounded provenance flags;
   - a short revision digest label or digest prefix.

   Owner/participant-only readback may include source artifact status, revision
   status, approval status, lifecycle state, and bounded failure codes. Never
   expose raw owner ids, raw persona ids, consent ids, artifact ids, revision
   ids, approval ids, full internal audit ids, report counts, reporter ids,
   admin notes, SQL details, stack traces, env values, cookies, bearer values,
   or secret-shaped strings.

7. Moderation and lifecycle requirements:

   - public report route and report target type for generated publications;
   - admin remove/restore path using safe target context only;
   - participant retract path that immediately hides public body text;
   - participant delete path that keeps the public row unreadable;
   - consent revoke, artifact retract/delete/moderation block, revision
     invalidation, and participant deletion/account deletion must hide public
     readability;
   - restore may only succeed when consent, source artifact, exact revision,
     both approvals, participant snapshots, schema, contract, and moderation
     state are all valid again;
   - one-sided approval, stale digest, stale snapshots, wrong scope/version,
     wrong schema, malformed slug, deleted source, or removed row fails closed.

8. Data model, RLS, constraints, audit, and indexes:

   - create `persona_encounter_cross_owner_generated_publications`;
   - add exactly one new consent requested scope,
     `publish_exact_generated_revision`;
   - use a dedicated provenance schema, for example
     `station.persona_encounter.cross_owner_generated_publication.v1`;
   - store source `artifact_id`, `revision_id`, `consent_id`, participant
     owner/persona ids for server checks, participant display snapshots,
     public slug, public title, public body, optional public excerpt, revision
     digest label, source artifact digest, status, contract versions,
     published/retracted/removed/deleted timestamps, creator/updater, and safe
     report count if needed for admin only;
   - add an append-only generated-publication audit table for propose/publish,
     retract, revoke cascade, source invalidation, moderation remove/restore,
     delete, and blocked-public-read events;
   - public RLS/select policy must expose only published, non-retracted,
     non-removed, non-deleted, current rows whose consent/artifact/revision/
     approval state still qualifies;
   - no direct participant insert/update/delete policy; writes are server
     mediated;
   - direct participant RLS must not expose inactive public body rows;
   - add indexes for public slug detail, participant review/control lookup,
     consent/artifact/revision invalidation cascades, moderation target lookup,
     and report queue lookup;
   - triggers or server read guards must retract/hide public rows when consent,
     source artifact, revision, approval, participant snapshot, schema, or
     moderation state drifts.

9. API and web readback for PR524A:

   Participant API:

   - `POST /persona-encounters/cross-owner-generated-revisions/:revisionSlug/publication`
     with strict body `{ confirmPublicGeneratedMaterialPublication: true,
     revisionDigest }`;
   - server copies title/body/excerpt from the approved revision only;
   - `PATCH /persona-encounters/cross-owner-generated-publications/:slug/retract`;
   - `DELETE /persona-encounters/cross-owner-generated-publications/:slug`;
   - owner/participant readback may be folded into existing private artifact
     detail if it stays private and excludes raw ids.

   Public API:

   - `GET /persona-encounters/cross-owner-generated-publications/:slug`;
   - `POST /persona-encounters/cross-owner-generated-publications/:slug/report`
     with the existing safe report shape.

   Public web:

   - a minimal detail route such as
     `/encounters/cross-owner/generated/:slug`;
   - no generated-material public list, no Discover group, no public persona
     linkback, and no broad public placement in PR524A.

10. Required no-drift tests:

   - metadata-only cross-owner exhibit routes still exclude generated body text;
   - public persona linkbacks stay metadata-only;
   - public persona chat/context-preview sources do not ingest generated
     material;
   - Discover feed/search/rising/featured do not surface generated material;
   - same-owner `/encounters`, Space, forum/community/Salon, writing/public
     document, homepage, Studio private buckets, runtime-attempt readback, and
     owner-private search buckets do not drift;
   - payload-key tests prove no raw ids, private setup, prompts, provider
     payloads, retrieval bodies, token facts, report/admin fields, SQL details,
     stack traces, bearer values, env values, or secrets appear.

11. Hosted proof required before customer-facing closeout:

   ARIADNE must prove hosted API and web behavior after PR524A deploy:

   - create or locate two public personas and approved consent with private
     generated artifact plus generated-publication scopes;
   - save a private generated artifact explicitly;
   - propose exact final public text;
   - both participants approve the same digest;
   - publish through the participant route;
   - public API detail and public web detail show only allowed generated
     material fields on desktop and `390px` mobile;
   - signed-out public read works only for published/current rows;
   - wrong scope/version, one-sided approval, stale digest, edited revision,
     retracted/deleted artifact, revoked consent, removed row, malformed slug,
     and stale snapshots fail closed;
   - report, moderation remove/restore, participant retract, delete, and
     cleanup make the proof row unreadable;
   - no-drift surfaces remain absent;
   - privacy/secret scans pass;
   - cleanup leaves no readable temporary generated proof rows.

## Required PR524A Validation

DAEDALUS must run:

```text
npx --yes pnpm@10.32.1 run test:persona-encounters
npx --yes pnpm@10.32.1 run test:reports
npx --yes pnpm@10.32.1 run test:personas
npx --yes pnpm@10.32.1 run test:community
npx --yes pnpm@10.32.1 run test:writing
npx --yes pnpm@10.32.1 run test:studio-ui
npx --yes pnpm@10.32.1 run typecheck
npx --yes pnpm@10.32.1 run lint
git diff --check
git diff --cached --check
changed-path forbidden-scope scan
high-risk secret pattern diff scan
```

Because PR524A adds a public web route, DAEDALUS should also attempt:

```text
npx --yes pnpm@10.32.1 run build
```

If the local Windows Next standalone symlink `EPERM` recurs after successful
compile/page generation, record it honestly as an environment failure.

## PR524 Preflight Validation

ARGUS reviewed the requested evidence and current tests/routes. No
implementation files were changed by PR524 preflight.

Validation used the current PR522-accepted code state:

```text
test:persona-encounters, test:personas, test:reports, test:community,
test:writing, test:studio-ui, typecheck, lint, git diff --check,
changed-path forbidden-scope scan, and high-risk secret diff scan passed during
the PR522 ARGUS review immediately before PR524 opened.
```

ARGUS will run `git diff --check` on this docs-only result before wakeup.

## Handoff

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS accepts PR524A as the first generated-material publication contract.
- The lane must be dedicated and detail-only, derived solely from active PR522
  private artifacts and exact bilaterally approved revisions.
- Metadata-only cross-owner exhibits remain metadata-only; no Discover/feed,
  public persona linkback, Space/forum/writing/homepage, provider, retrieval,
  billing, storage, Cloudflare, queue, package, deployment, or broad UI scope is
  accepted.
- ARIADNE hosted proof is required after any local acceptance.
Task:
- Close PR524 preflight if accepted and route DAEDALUS to PR524A.
```
