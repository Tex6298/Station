# PR524A - Cross-Owner Generated Material Publication Contract

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Date opened: 2026-07-12

Review target: ARGUS / A3

Status:

```text
READY_FOR_IMPLEMENTATION
```

## Source

- `docs/roadmap/PR524_CROSS_OWNER_GENERATED_MATERIAL_PUBLICATION_CONTRACT_PREFLIGHT_RESULT.md`
- `docs/roadmap/PR522_CROSS_OWNER_PRIVATE_GENERATED_ARTIFACT_APPROVAL_LEDGER_ARGUS_RESULT.md`

## Objective

Implement the first public generated-material publication contract as a
detail-only surface derived solely from active PR522 private generated artifacts
and exact bilaterally approved final-text revisions.

PR524A must make generated public body text possible only through the new
contract. It must not broaden existing metadata-only public exhibit surfaces.

## Required Scope

Data model:

- add one generated public material table, for example
  `persona_encounter_cross_owner_generated_publications`;
- add exactly one new consent requested scope:
  `publish_exact_generated_revision`;
- use a dedicated provenance schema, for example
  `station.persona_encounter.cross_owner_generated_publication.v1`;
- store source artifact, revision, consent, server-only participant owner/persona
  ids for checks, participant display snapshots, public slug, public title,
  public body copied server-side from the approved revision, optional exact
  copied excerpt, revision digest label, source artifact digest, status,
  contract versions, lifecycle timestamps, and creator/updater fields;
- add append-only audit for publish, retract, revoke cascade, source
  invalidation, moderation remove/restore, delete, and blocked public read;
- add indexes for public slug detail, participant control lookup, consent/
  artifact/revision invalidation cascades, moderation target lookup, and report
  queue lookup.

Access and lifecycle:

- public readability requires active approved consent, private artifact scope,
  `publish_exact_generated_revision`, current contract version, active source
  artifact, approved current revision, exact requester and counterparty approval
  rows for the revision digest, matching participant snapshots, matching schema,
  no retract, no delete, no moderation removal, and no deleted participant
  persona/owner;
- any one-sided approval, stale digest, edited text after approval, stale
  snapshot, wrong scope/version, wrong schema, malformed slug, deleted source,
  revoked consent, retracted artifact, moderation block, or removed row fails
  closed;
- writes should be server-mediated. Direct public RLS/select must expose only
  safe published current rows. Direct participant reads must not expose inactive
  public body rows.

API:

- add a strict participant publish route for exact approved revisions. ARGUS
  suggested:
  `POST /persona-encounters/cross-owner-generated-revisions/:revisionSlug/publication`;
- require a confirmation payload such as
  `{ confirmPublicGeneratedMaterialPublication: true, revisionDigest }`;
- copy title/body/excerpt server-side from the approved revision only;
- add participant retract and delete controls for generated publications;
- add public detail:
  `GET /persona-encounters/cross-owner-generated-publications/:slug`;
- add public report support for generated publications using the existing safe
  report shape;
- add moderation remove/restore support using safe target context only.

Web:

- add one minimal public detail route, for example
  `/encounters/cross-owner/generated/:slug`;
- render only allowed fields: route-safe title/body, generated-material label,
  participant display snapshots, status, published time, contract version, and
  bounded provenance flags;
- keep participant/private controls in Studio/private cross-owner areas only if
  they remain owner/participant scoped and do not leak raw ids.

## Explicit Non-Scope

Do not add:

- public generated-material index/list;
- Discover search/feed/rising/featured placement;
- public persona linkbacks or public persona chat/context-preview source
  expansion;
- Space, forum/community, writing/public document, homepage, SEO, or social
  placement;
- generated summaries, abstracts, transcript excerpts, source body exposure, or
  regenerated excerpts;
- PR516 disposable preview direct publication;
- metadata-only exhibit payload widening;
- provider/model routing, retrieval/vector/embedding, storage/export, billing,
  Stripe, Redis, Cloudflare, queue/worker/webhook, package/lockfile, deployment,
  or broad UI redesign.

## Required Tests

Add focused tests for:

- successful exact generated publication from a qualifying PR522 artifact and
  approved revision;
- one-sided approval, stale digest, edited revision, stale snapshot, wrong
  scope/version, wrong schema, malformed slug, deleted/retracted artifact,
  revoked consent, moderation removal, and deleted participant fail-closed
  cases;
- public payload allow-list and forbidden raw/private/secret fields;
- report target behavior and moderation remove/restore lifecycle;
- participant retract/delete immediately hiding public body text;
- metadata-only cross-owner exhibit routes still excluding generated body text;
- public persona linkbacks, public persona chat/context-preview, Discover,
  same-owner `/encounters`, Space, forum/community, writing, homepage, Studio
  private buckets, runtime-attempt readback, and owner-private search buckets
  not drifting into generated material.

## Validation

Run:

```text
npm exec --yes pnpm@10.32.1 -- run test:persona-encounters
npm exec --yes pnpm@10.32.1 -- run test:reports
npm exec --yes pnpm@10.32.1 -- run test:personas
npm exec --yes pnpm@10.32.1 -- run test:community
npm exec --yes pnpm@10.32.1 -- run test:writing
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- run lint
npm exec --yes pnpm@10.32.1 -- run build
git diff --check
changed-path forbidden-scope scan
high-risk secret pattern diff scan
```

If the known local Windows Next standalone symlink `EPERM` recurs after
successful compile/page generation, record it honestly as an environment build
failure rather than a code failure.

## Handoff

When implemented, create:

```text
docs/roadmap/PR524A_CROSS_OWNER_GENERATED_MATERIAL_PUBLICATION_CONTRACT_RESULT.md
```

Then wake ARGUS:

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS implemented PR524A generated material publication contract.
- Public body text is detail-only and derived solely from PR522 exact approved
  revisions.
Task:
- Hostile review owner/participant scoping, RLS, exact approval gates,
  public payload allow-list, moderation/report lifecycle, and no-drift.
```

