# PR511A - Cross-Owner Encounter Consent Ledger

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Date opened: 2026-07-11

Status:

```text
OPEN_CROSS_OWNER_CONSENT_LEDGER_IMPLEMENTATION
```

## Source

ARGUS preflight:

`docs/roadmap/PR511_CROSS_OWNER_ENCOUNTER_CONSENT_PUBLICATION_PREFLIGHT_RESULT.md`

MIMIR closeout:

`docs/roadmap/PR511_CROSS_OWNER_ENCOUNTER_CONSENT_PUBLICATION_PREFLIGHT_CLOSEOUT.md`

## Purpose

Implement the first cross-owner encounter foundation as a durable,
owner-scoped consent/provenance ledger only.

PR511A must not run encounters, save cross-owner artifacts, publish metadata,
publish generated words, publish excerpts, publish transcripts, publish
summaries, or surface anything publicly.

## Accepted Product Shape

Add a ledger for a specific pair of personas owned by different users.

Allowed behavior:

- creator A can create a cross-owner invitation for one owned persona and one
  counterparty persona;
- creator B can approve, reject, or later revoke only their side;
- creator A can cancel or later revoke their side;
- both participant owners can read bounded ledger and audit readback;
- nonparticipants and signed-out users cannot discover, read, approve, reject,
  cancel, or revoke ledger rows;
- requested future scopes may be recorded, but all scopes are non-executable in
  PR511A.

Visible/API copy must be honest that approval is a consent record only. It must
not claim that an encounter can run, be saved, be published, be searched, be
shown in Salon/community surfaces, or produce an excerpt/transcript/summary.

## Required States And Scopes

Implement bounded status states:

- `pending`;
- `approved`;
- `rejected`;
- `cancelled`;
- `revoked`;
- `expired`;
- `superseded`;
- `blocked_by_deletion`;
- `moderation_locked`.

Implement bounded requested scope labels:

- `run_cross_owner_encounter`;
- `save_private_cross_owner_artifact`;
- `share_participant_metadata_between_owners`;
- `publish_metadata_only_public_exhibit`;
- `publish_generated_words_excerpt`;
- `publish_transcript`;
- `publish_generated_summary`.

All runtime, save, public, excerpt, transcript, and summary scopes must remain
non-executable. No PR511A route may consume approval as permission to perform
those actions.

## Required Audit

Record append-only audit events for:

- invitation created;
- requester approved or cancelled;
- counterparty approved or rejected;
- approval revoked by either participant;
- invitation expired;
- scope version superseded;
- persona/account deletion blocked future use;
- moderation lock applied or cleared.

Audit rows must store server-owned actor identity, actor role, event type,
status transition, bounded scope labels, timestamps, and optional bounded
reason codes. They must not store private setup text, generated replies,
prompts, provider payloads, source bodies, credentials, env values, SQL details,
stack traces, cookies, bearer values, or secret-shaped strings.

Both participant owners may read safe audit events for their pair. Admins may
read bounded audit only through existing bounded admin contexts if needed for
support/moderation. The audit is never public.

## Required API Boundary

Use the existing persona-encounters route area unless a smaller local pattern
is clearly better.

Routes may include close equivalents of:

```text
POST /persona-encounters/cross-owner-consents
GET /persona-encounters/cross-owner-consents
GET /persona-encounters/cross-owner-consents/:consentId
PATCH /persona-encounters/cross-owner-consents/:consentId/approve
PATCH /persona-encounters/cross-owner-consents/:consentId/reject
PATCH /persona-encounters/cross-owner-consents/:consentId/cancel
PATCH /persona-encounters/cross-owner-consents/:consentId/revoke
```

If you choose different names, preserve the same owner/auth semantics.

Routes must:

- require auth;
- verify requester/counterparty persona ownership structurally;
- require the counterparty persona to be owned by a different owner;
- scope every read and mutation to participant owners only;
- return bounded `404` or `403` for signed-out/nonparticipant/cross-owner
  probes without revealing row existence;
- reject extra keys, malformed scopes, unsupported statuses, raw id display
  fields, provider fields, setup/reply/excerpt/transcript fields, private
  curation fields, and public route fields;
- perform no provider call, token accounting, private-session insert,
  public-exhibit insert/update, report insert, source retrieval, storage write,
  queue/worker job, Redis/Cloudflare operation, billing action, social post, or
  package/lockfile change.

## Data Boundary

Use a dedicated migration. ARGUS suggested:

```text
infra/supabase/migrations/077_persona_encounter_cross_owner_consents.sql
```

The schema must include:

- dedicated consent and audit tables;
- participant owner/persona columns with FK constraints;
- owner-participant RLS;
- no public select/write policy;
- status and requested-scope constraints;
- immutable or append-only audit semantics;
- timestamps sufficient for expiry/supersession/revocation readback;
- safe deletion-block/moderation-lock state support.

Do not loosen existing private-session or public-exhibit same-owner constraints.

## File Scope

Allowed implementation files:

- `infra/supabase/migrations/077_persona_encounter_cross_owner_consents.sql`;
- `packages/db/src/types.ts`;
- `packages/types/src/index.ts` only if a shared consent type is needed;
- `apps/api/src/routes/persona-encounters.ts`;
- `apps/api/src/routes/persona-encounters.test.ts`;
- `apps/web/lib/persona-encounter-runtime.ts`;
- `apps/web/lib/persona-encounter-runtime.test.ts`;
- `docs/roadmap/PR511A_CROSS_OWNER_ENCOUNTER_CONSENT_LEDGER_RESULT.md`;
- `docs/roadmap/ACTIVE_STATUS.md`;
- `docs/roadmap/LANE_INDEX.md`;
- `docs/testing/VALIDATION_BASELINE.md`.

PR511A should not add visible Studio UI by default. If implementation evidence
shows a tiny web helper is unavoidable for route/type tests, record why before
touching web UI. Otherwise visible owner controls belong in a later lane after
schema/API semantics pass review.

## Forbidden Scope

Do not touch or add:

- cross-owner runtime;
- provider calls;
- generated encounter text;
- private cross-owner saved artifacts;
- public cross-owner exhibits;
- generated-word excerpts;
- transcripts;
- summaries;
- Discover/search/feed surfacing;
- public persona, Space, forum/community, Salon, Station Press, or public
  document surfacing;
- Archive, Memory, Canon, Continuity, Integrity;
- retrieval/vector/embedding code;
- billing/Stripe;
- storage buckets;
- social connectors;
- Redis;
- Cloudflare;
- queue/worker/webhook code;
- package/lockfile;
- deployment config;
- broad Studio/public UI.

## Required Tests

Prove at minimum:

- migration creates dedicated consent and audit tables with owner-participant
  RLS and no public select/write policy;
- invitations require auth and requester ownership of the requester persona;
- invitations require the counterparty persona to be owned by a different
  owner;
- nonparticipants cannot read, approve, reject, revoke, cancel, or infer rows;
- counterparty owner can approve or reject only invitations addressed to an
  owned persona;
- requester can cancel only pending invitations they created;
- either participant owner can revoke an approved consent;
- rejected, cancelled, revoked, expired, superseded, deletion-blocked, and
  moderation-locked states cannot be approved or consumed as active;
- requested scopes are bounded to accepted labels and default to
  non-executable;
- routes perform no provider call, token accounting, private-session insert,
  public-exhibit insert/update, report insert, source retrieval, storage write,
  queue/worker job, Redis/Cloudflare operation, billing action, social post, or
  package/lockfile change;
- owner readback excludes raw owner/persona ids from UI-visible payloads and
  excludes private setup, generated replies, prompts, provider payloads, source
  bodies, SQL details, stack traces, cookies, tokens, env values, and
  secret-shaped strings;
- audit events are append-only and readable only by participant owners and
  bounded admin contexts;
- existing same-owner preview/private-session/public-exhibit tests remain
  green.

Minimum validation:

```text
npm exec --yes pnpm@10.32.1 -- run test:persona-encounters
npm exec --yes pnpm@10.32.1 -- run test:reports
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
git diff --cached --check
```

Also run changed-path, forbidden-path, public/no-drift, cross-owner runtime
drift, provider/retrieval drift, package/lockfile drift,
Cloudflare/Redis/queue/worker/storage/billing/social drift, raw-id leakage, and
secret-shaped value scans.

## Result Required

Create:

```text
docs/roadmap/PR511A_CROSS_OWNER_ENCOUNTER_CONSENT_LEDGER_RESULT.md
```

Include:

- implementation summary;
- schema/RLS/audit summary;
- route contract;
- consent state behavior;
- requested-scope behavior;
- readback/privacy proof;
- forbidden-scope scan;
- validation table;
- final wakeup to ARGUS.

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS

Summary:
- ARGUS accepted PR511A as ACCEPT_PR511A_CROSS_OWNER_ENCOUNTER_CONSENT_LEDGER_ONLY.
- MIMIR closed PR511 and opened PR511A for a durable owner-scoped cross-owner consent/provenance ledger only.
- PR511A may add invitation, approval, rejection, cancellation, revocation, expiry, supersession, deletion-block, moderation-lock, participant owner readback, and append-only audit semantics.
- Requested future scopes may be recorded, but no approval can be consumed to run an encounter, save a private cross-owner artifact, publish metadata, publish generated words, publish excerpts, publish transcripts, publish summaries, or surface anything publicly.
- Cross-owner runtime, private cross-owner saved artifacts, public cross-owner exhibits, excerpts, transcripts, summaries, Discover/search/feed, Salon/community/forum/Station Press/Space/persona surfacing, provider calls, retrieval, billing, storage, social, Redis, Cloudflare, queues/workers, package/lockfile, deployment, and broad UI drift remain blocked.
Task:
- Implement PR511A using docs/roadmap/PR511A_CROSS_OWNER_ENCOUNTER_CONSENT_LEDGER_DAEDALUS.md.
- Keep scope ledger-only and wake ARGUS for review with result doc and validation.
```
