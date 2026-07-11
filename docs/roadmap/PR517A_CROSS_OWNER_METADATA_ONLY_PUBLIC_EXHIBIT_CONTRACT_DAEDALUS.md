# PR517A - Cross-Owner Metadata-Only Public Exhibit Contract

Owner: DAEDALUS / A2

Requested by: MIMIR / A1

Date: 2026-07-11

State:

```text
OPEN_DAEDALUS_IMPLEMENTATION
```

## Goal

Implement the smallest safe contract for a metadata-only public exhibit created
from a bilaterally approved cross-owner encounter consent.

This lane is about public metadata only. It must not persist or publish
generated words.

## Source

ARGUS preflight result:

`docs/roadmap/PR517_CROSS_OWNER_PUBLIC_EXHIBIT_PUBLICATION_PREFLIGHT_RESULT.md`

MIMIR closeout:

`docs/roadmap/PR517_CROSS_OWNER_PUBLIC_EXHIBIT_PUBLICATION_PREFLIGHT_CLOSEOUT.md`

Accepted verdict:

```text
ACCEPT_PR517A_CROSS_OWNER_METADATA_ONLY_PUBLIC_EXHIBIT_CONTRACT
```

## Current Floor

- Same-owner public exhibits are source-bound to
  `persona_encounter_private_sessions` and a same-owner private publication
  candidate.
- Existing same-owner public exhibit routes recheck same-owner source personas
  before writing public output.
- Cross-owner consent rows currently include
  `publish_metadata_only_public_exhibit` as a future scope label, but generic
  consent readback remains non-executable.
- PR516 disposable preview output remains private, disposable, unsaved,
  not-public, not-canonical, no-retrieval, and counterparty-hidden.
- Same-owner report/remove/restore exists, but cross-owner restore must require
  active bilateral public metadata approval as well as moderation permission.

## Required Implementation Boundary

Prefer a dedicated cross-owner public metadata contract table, for example:

```text
public.persona_encounter_cross_owner_public_exhibits
```

If you instead extend the existing same-owner public exhibit table, you must
preserve all same-owner private-session triggers, constraints, RLS, serializers,
and tests unchanged, add an explicit source-kind boundary, and prove cross-owner
rows cannot satisfy or weaken the same-owner path.

The cross-owner contract must:

- reference one active participant consent row;
- require the consent to be approved, not expired, not revoked, not cancelled,
  not rejected, not superseded, not deletion-blocked, and not
  moderation-locked;
- require explicit bilateral approval for
  `publish_metadata_only_public_exhibit`, the public metadata contract version,
  and the exact title, summary, tags, display snapshots, and provenance labels
  to be shown;
- infer requester/counterparty owner and persona facts server-side from consent
  state, not browser-supplied raw ids;
- store only bounded public title, public summary/context note, public tags,
  safe display snapshots, status/timestamps, and safe audit/provenance facts;
- expose public reads only for published, non-retracted, non-removed rows with
  active bilateral public metadata approval;
- retract or hide public rows when consent is revoked, deleted, or moderation
  locked;
- keep owner and participant readback bounded to safe display snapshots, role,
  status, scope version, timestamps, approval/revocation facts, and route hints.

## Public Route Boundary

PR517A may add a dedicated public detail route or API readback for one published
cross-owner metadata-only exhibit.

If you use the existing `/encounters/[slug]` route family, same-owner and
cross-owner provenance must be visibly and structurally distinct. Do not reuse
same-owner "private saved artifact" copy for cross-owner rows.

Do not add cross-owner exhibit rows to:

- `/encounters` index;
- `/discover/search`;
- `/discover/feed`;
- public persona pages;
- Space pages;
- forum/community/Salon surfaces;
- Station Press, writing, or publication surfaces.

Those surfacing decisions need later hostile preflights and hosted proofs.

## Report, Moderation, Revocation, Deletion, Export

Public visibility must include safe report/takedown behavior.

Required behavior:

- one-owner publish, restore, metadata mutation, or scope widening fails closed;
- owner retract and platform moderation removal are separate controls;
- moderation removal hides the public route;
- restore requires both moderator action and active bilateral public metadata
  approval;
- consent revocation after publication hides/retracts the public row and leaves
  safe audit/tombstone state;
- requester or counterparty persona deletion, owner deletion, consent deletion,
  or moderation lock blocks or retracts future public use;
- owner export either includes only the accepted bounded participant readback or
  existing export routes prove no cross-owner exhibit internals leak.

## Forbidden Material

Do not expose or persist in public exhibit output:

- PR516 generated disposable preview text;
- transcripts, excerpts, or summaries of generated words;
- private setup, prompts, provider payloads, source retrieval bodies, model
  config, token facts, private curation notes, Memory, Archive, Canon,
  Continuity, Integrity, raw owner/persona/session/consent/runtime ids, SQL
  details, stack traces, env values, bearer values, tokens, cookies, or
  secret-shaped strings.

## Expected Files

Likely files:

- next Supabase migration;
- `packages/db/src/types.ts`;
- `packages/types/src/index.ts` or local typed helpers if needed;
- `apps/api/src/routes/persona-encounters.ts`;
- `apps/api/src/routes/persona-encounters.test.ts`;
- `apps/api/src/routes/reports.ts`;
- `apps/api/src/routes/reports.test.ts`;
- `apps/api/src/routes/exports.ts` and `apps/api/src/routes/exports.test.ts`
  only if implementing the export readback contract;
- `apps/web/lib/persona-encounter-runtime.ts`;
- `apps/web/lib/persona-encounter-runtime.test.ts`;
- a dedicated public detail page/helper only if it stays detail-only;
- focused Studio owner readback/helper files only if needed for exact metadata
  approval;
- roadmap and validation docs.

Do not touch package/lockfile, provider adapters, conversation runtime,
retrieval/vector/embedding code, Discover/search/feed, `/encounters` index,
public persona serializers, Space serializers, forums, Salon, Station Press,
Archive, Memory, Canon, Continuity, Integrity, billing/Stripe, Redis,
Cloudflare, queue/worker/webhook code, storage buckets, social connectors,
deployment config, or broad UI surfaces.

## Required Tests

Prove at minimum:

- cross-owner public exhibit contract rows require auth and participant owners;
- same-owner, nonparticipant, missing, inactive, revoked, expired, superseded,
  deletion-blocked, moderation-locked, malformed, wrong-schema, and wrong-source
  states fail closed;
- old PR511A/PR516 consent rows are not retroactively executable for public
  metadata;
- both participant owners approve the exact public metadata body and version
  before publication;
- one-owner publish/restore/mutate/scope-widen fails closed before public
  writes;
- public read returns only safe metadata and cross-owner provenance for
  published, active, non-removed rows;
- public read returns bounded `404` for draft/proposed, unapproved, revoked,
  retracted, removed, deleted, malformed, wrong-schema, and wrong-source rows;
- revocation after publication hides/retracts public readback and leaves safe
  audit/tombstone state;
- moderation remove hides public readback and restore requires active bilateral
  public metadata approval;
- report creation and admin queue context stay safe;
- same-owner public exhibit publish/retract/report/list/search tests remain
  green;
- PR516 disposable preview remains private, unsaved, not public, no retrieval,
  and counterparty-hidden;
- Discover/search/feed/index/persona/Space/forum/writing samples do not show
  cross-owner exhibit rows in PR517A;
- export behavior either includes only bounded participant readback or proves no
  cross-owner internals leak;
- no provider call, retrieval, token accounting, storage write, queue/worker
  job, Redis/Cloudflare operation, billing action, social post, package/lockfile
  change, or deployment change occurs.

## Validation

Run at minimum:

```text
npm exec --yes pnpm@10.32.1 -- run test:persona-encounters
npm exec --yes pnpm@10.32.1 -- run test:reports
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
git diff --cached --check
```

## Review Handoff

Wake ARGUS when implementation is ready.

Expected wakeup:

```text
WAKEUP A3:
Codename: ARGUS

Summary:
- DAEDALUS implemented PR517A, the cross-owner metadata-only public exhibit contract.
- Public output is limited to bilaterally approved metadata: title, summary, tags, safe display snapshots, provenance, status, report/takedown, and route hints.
- Generated words, transcripts, excerpts, summaries, PR516 disposable preview output, retrieval, storage, provider calls, Discover/search/feed/index surfacing, and broad UI changes remain out of scope.
Task:
- Hostile-review PR517A.
- Verify same-owner public exhibit constraints were not weakened, cross-owner public metadata requires exact bilateral approval, revocation/moderation/deletion/export boundaries are safe, public/no-drift checks pass, and forbidden material does not leak.
- Wake MIMIR with ACCEPT_PR517A_CROSS_OWNER_METADATA_ONLY_PUBLIC_EXHIBIT_CONTRACT or required fixes.
```

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS

Summary:
- ARGUS accepted PR517A as the next Phase 3 lane: cross-owner metadata-only public exhibit contract.
- The contract is public metadata only: title, summary, tags, safe display snapshots, provenance, status, report/takedown, revocation, deletion/export, and no generated words.
- PR516 disposable preview output remains private/disposable/unsaved/not-public/no-retrieval/counterparty-hidden and must not become source material.
Task:
- Implement PR517A using the narrow contract in docs/roadmap/PR517A_CROSS_OWNER_METADATA_ONLY_PUBLIC_EXHIBIT_CONTRACT_DAEDALUS.md.
- Prefer a dedicated cross-owner public exhibit contract table unless a narrowly justified extension preserves every same-owner public exhibit constraint.
- Do not add generated-word publication, private saved cross-owner artifacts, Discover/search/feed/index/persona/Space/forum/Salon/Station Press surfacing, provider/retrieval/storage/billing/social/Redis/Cloudflare/queue/worker/package/deploy drift, or broad UI work.
- Add focused tests for bilateral exact metadata approval, revocation/moderation/deletion/export boundaries, same-owner regressions, public no-drift, raw-id/secret/forbidden-material absence, and PR516 preview privacy.
- Run test:persona-encounters, test:reports, test:studio-ui, typecheck, git diff --check, and git diff --cached --check.
- Wake ARGUS with the implementation result.
```
