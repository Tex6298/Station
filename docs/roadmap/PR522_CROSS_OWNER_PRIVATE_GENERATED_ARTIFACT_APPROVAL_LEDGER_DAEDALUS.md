# PR522 - Cross-Owner Private Generated Artifact and Exact-Text Approval Ledger

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Date opened: 2026-07-12

Status: Parked handoff; DAEDALUS not yet woken

Source:

`docs/roadmap/PR521_CROSS_OWNER_GENERATED_MATERIAL_PUBLICATION_PREFLIGHT_RESULT.md`

## Mission

Implement the private foundation ARGUS required before any generated
cross-owner material can become public.

This lane creates participant-only generated source artifacts and an exact-text
approval ledger. It does not create a public generated-material route and it
does not publish generated words.

MIMIR has documented this as the next backend unblock from PR521. The current
active baton is PR523, the companion-first persona home draft PR #1 review
path. Do not start PR522 until MIMIR wakes DAEDALUS explicitly.

## Product Contract

Add the smallest durable workflow for future generated publication:

- save a private generated cross-owner artifact visible only to eligible
  participants;
- represent an exact final public-text proposal as a revision with an immutable
  digest;
- record bilateral participant approval of that exact revision;
- reset approval when the final text, source artifact, title/body, participant
  snapshots, consent scope/version, or generated content changes;
- support participant retract, consent revoke, delete, and moderation-block
  states as private lifecycle controls;
- keep public readability closed until a later MIMIR-approved publication lane.

Do not reuse PR516 disposable preview output automatically. If a user wants
identical words to become a generated artifact, those words must enter this new
private artifact/revision/approval contract explicitly.

## API And Data Model

Prefer a narrow migration plus route/service changes that support:

- participant-only generated artifact records with persona/owner participant
  matching;
- final-text revision records with title/body or excerpt, text digest,
  contract version, source artifact reference, status, and timestamps;
- append-only approval ledger rows with participant role, approver owner,
  revision digest, approval contract version, and timestamp;
- lifecycle fields for proposed, approved, retracted, revoked, deleted,
  moderation-blocked, and invalidated states;
- bounded participant readback endpoints for artifact/revision/approval state;
- no public list/detail route for generated body text.

Use existing cross-owner consent/readability helpers where they keep scope
small. Add new helpers only when they reduce repeated boundary checks.

## Web Contract

Add only the minimal owner/participant UI needed to prove the private workflow:

- private artifact readback for eligible participants;
- exact final-text proposal/readback;
- approve/retract state readback;
- clear private-only copy;
- no public generated text placement.

Do not broad-reskin Studio or public pages. The companion UI draft PR context is
queued for a separate companion/persona-home lane and must not widen PR522.

## Allowed Files

Expected areas:

- `apps/api/src/routes/persona-encounters.ts`;
- `apps/api/src/routes/persona-encounters.test.ts`;
- migration files only if needed for the private artifact/approval contract;
- existing cross-owner runtime/consent helper files and tests;
- scoped Studio/persona encounter web files only if needed for private
  participant review;
- `docs/roadmap/*`;
- `docs/testing/*` only for validation baseline updates.

Do not touch provider/model routing, embeddings, retrieval/vector plumbing,
billing, social, storage/export, Archive, Memory, Canon, Continuity, Integrity,
Redis, Cloudflare, queues, workers, webhooks, packages, lockfiles, deployment,
public Space/forum/writing/feed/homepage placement, or broad UI surfaces.

## Public-Readability Guardrails

PR522 must keep all generated body text private. Public routes must not expose:

- generated words, summaries, abstracts, transcripts, excerpts, source text, or
  source bodies;
- private setup, prompts, provider request/response payloads, retrieval bodies,
  token facts, raw owner ids, raw persona ids, consent ids, artifact ids,
  approval ids, report counts, admin notes, SQL details, stack traces, env
  values, cookies, bearer values, or secret-shaped strings;
- PR516 disposable preview output unless explicitly saved under the new private
  artifact contract;
- any one-sided, revoked, retracted, removed, hidden, malformed, wrong-scope,
  wrong-version, missing-source, edited-after-approval, or deleted material.

Existing metadata-only public exhibits, Discover search, public persona
linkbacks, same-owner encounters, public Space, forums, writing, homepage,
public persona chat/context-preview, and owner-private buckets must not drift.

## Required Tests

Prove at minimum:

- eligible participants can create/read private generated artifacts;
- nonparticipants and public callers cannot read private artifacts, revisions,
  approval rows, or generated text;
- exact final-text revision approval requires both participants;
- editing title/body/excerpt/source artifact/participant snapshot/consent
  scope/version resets approvals;
- one-sided approval does not publish or produce public readability;
- retract, revoke, delete, moderation-block, missing source, wrong scope,
  wrong version, malformed rows, and stale participant snapshots fail closed;
- payload-key tests exclude raw ids, private setup, prompts, provider payloads,
  retrieval bodies, token facts, report/admin fields, SQL details, stack
  traces, env values, bearer values, and secret-shaped strings;
- PR516 disposable preview output is not automatically reusable as a saved
  artifact;
- public metadata-only surfaces and unrelated public/private buckets do not
  gain generated body text.

## Required Validation

Run the affected focused tests plus the cross-owner/public-surface safety set:

```text
npm exec --yes pnpm@10.32.1 -- run test:persona-encounters
npm exec --yes pnpm@10.32.1 -- run test:personas
npm exec --yes pnpm@10.32.1 -- run test:reports
npm exec --yes pnpm@10.32.1 -- run test:community
npm exec --yes pnpm@10.32.1 -- run test:writing
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
git diff --cached --check
```

Also run changed-path, forbidden-path, and secret-shaped value scans.

## Review Handoff

Wake ARGUS with:

- implementation summary;
- changed files;
- migration/RLS/constraint summary if a migration is added;
- API/web behavior summary;
- proof that no public generated route or public generated body text exists;
- exact validation commands and results;
- any blocker or intentionally deferred follow-up.

ARGUS should reject public generated publication, broad UI work, provider/model
changes, retrieval changes, Redis/Cloudflare work, billing/storage/social work,
or public placement beyond the private artifact and approval contract.
