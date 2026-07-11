# PR511A - Cross-Owner Encounter Consent Ledger Result

Owner: DAEDALUS / A2

Date: 2026-07-11

Status:

```text
READY_FOR_ARGUS_REVIEW
```

## Summary

DAEDALUS implemented PR511A as a ledger-only cross-owner consent foundation:

- added dedicated Supabase consent and append-only audit tables;
- added typed DB surfaces for consent rows, requested scopes, states, reasons,
  actor roles, and audit events;
- added authenticated API routes for invitation, participant readback, approve,
  reject, cancel, and revoke;
- kept every requested scope non-executable in API readback;
- kept cross-owner runtime, private cross-owner artifacts, public exhibits,
  excerpts, transcripts, summaries, Discover/search/feed, public surfacing,
  provider calls, retrieval, billing, storage, social, Redis, Cloudflare,
  queues/workers, package/lockfile, deployment, and broad UI out of scope.

## Files Changed

- `infra/supabase/migrations/077_persona_encounter_cross_owner_consents.sql`
- `packages/db/src/types.ts`
- `apps/api/src/routes/persona-encounters.ts`
- `apps/api/src/routes/persona-encounters.test.ts`
- `docs/roadmap/PR511A_CROSS_OWNER_ENCOUNTER_CONSENT_LEDGER_RESULT.md`
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/roadmap/LANE_INDEX.md`
- `docs/testing/VALIDATION_BASELINE.md`

No web UI, runtime helper, package, lockfile, provider, retrieval, billing,
storage, social, Redis, Cloudflare, queue, worker, webhook, deployment, forum,
Discover, public Space, public persona, or Station Press path changed.

## Schema, RLS, And Audit

Migration `077` adds:

- `persona_encounter_cross_owner_consents`;
- `persona_encounter_cross_owner_consent_audit_events`;
- participant owner/persona foreign keys;
- requester/counterparty persona-owner validation trigger;
- bounded status checks for `pending`, `approved`, `rejected`, `cancelled`,
  `revoked`, `expired`, `superseded`, `blocked_by_deletion`, and
  `moderation_locked`;
- bounded requested scope checks for the accepted PR511A labels;
- participant select and requester insert RLS for consent rows;
- participant-only RLS for audit readback;
- no direct consent update/delete policy; state transitions are mediated by
  the authenticated API route so actor role, prior status, and audit insertion
  stay coupled;
- no direct participant audit insert policy; audit writes are server-owned API
  writes so actor identity, role, event type, and transition stay bounded;
- no public select/write policy;
- audit update/delete blockers so audit events are append-only.

The migration does not loosen existing private-session or public-exhibit
same-owner constraints.

## Route Contract

New authenticated API routes:

```text
POST /persona-encounters/cross-owner-consents
GET /persona-encounters/cross-owner-consents
GET /persona-encounters/cross-owner-consents/:consentId
PATCH /persona-encounters/cross-owner-consents/:consentId/approve
PATCH /persona-encounters/cross-owner-consents/:consentId/reject
PATCH /persona-encounters/cross-owner-consents/:consentId/cancel
PATCH /persona-encounters/cross-owner-consents/:consentId/revoke
```

Behavior:

- all routes require auth;
- invitations require the requester persona to belong to the caller;
- invitations require the counterparty persona to belong to a different owner;
- list/detail/mutation routes scope rows to the two participant owners;
- nonparticipants receive bounded empty list or `404` read/mutation responses;
- requester can cancel only pending invitations;
- counterparty can approve or reject only pending invitations;
- either participant can revoke only approved consent records;
- rejected, cancelled, revoked, expired, superseded, deletion-blocked, and
  moderation-locked records cannot be approved.

## Consent State And Scope Behavior

Creation records a pending invitation and two audit events:

- `invitation_created`;
- `requester_approved`.

State transitions record:

- `counterparty_approved`;
- `counterparty_rejected`;
- `requester_cancelled`;
- `participant_revoked`.

All requested scopes serialize as:

```text
executable: false
```

The response ledger also explicitly says consent cannot be consumed for
runtime, private artifacts, public exhibits, generated words, transcripts,
summaries, or public surfacing.

## Readback And Privacy Proof

Participant readback includes only:

- opaque consent id;
- status;
- current participant role;
- participant role labels and persona name snapshots;
- bounded requested scope labels;
- non-executable ledger flags;
- bounded timestamps and reason code;
- bounded audit event metadata.

Focused tests prove readback excludes raw owner/persona ids, internal owner or
persona column names, private setup, generated replies, persona prompts,
style notes, provider payload markers, bearer markers, and nonparticipant
details.

## Forbidden-Scope Scan

Changed-path and diff scans found:

- no package or lockfile change;
- no web UI change;
- no Discover/search/feed/forum/Space/document/report route change;
- no provider, retrieval, billing, storage, social, Redis, Cloudflare, queue,
  worker, or background-job path change;
- no private-session/public-exhibit schema loosening in migration `077`;
- no secret-shaped values;
- forbidden side-effect terms appear only in negative test assertions proving
  those tables are not written by the consent ledger routes.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:persona-encounters` | Pass | 42 tests passed, including new PR511A migration, owner/auth, transition, inactive-state, privacy, and no-side-effect coverage. |
| `npm exec --yes pnpm@10.32.1 -- run test:reports` | Pass | 7 tests passed; public exhibit report/takedown behavior remains green. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 201 tests passed; visible Studio helper coverage remains green without PR511A UI changes. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | Turbo API/web typecheck passed. |
| Changed-path/forbidden-path scans | Pass | Runtime changes are limited to persona encounter API/tests plus DB types and migration. |
| Secret-shaped value scan | Pass | No API-key, private-key, GitHub token, Google key, Slack token, bearer-token-shaped, or private-key block values found in touched implementation files. |
| `git diff --check` | Pass | No whitespace errors; Git reported expected LF-to-CRLF working-copy warnings only. |
| `git diff --cached --check` | Pass | No staged whitespace errors after staging PR511A implementation and docs. |

## Wakeup

```text
WAKEUP A3:
Codename: ARGUS

Summary:
- DAEDALUS implemented PR511A cross-owner encounter consent ledger only.
- The patch adds dedicated consent/audit tables, typed DB surfaces, authenticated participant-scoped ledger routes, bounded state transitions, non-executable requested scope readback, and focused tests.
- Cross-owner runtime, private cross-owner artifacts, public exhibits, excerpts, transcripts, summaries, Discover/search/feed, public surfacing, provider/retrieval, billing/storage/social, Redis/Cloudflare, queue/worker, package/lockfile, deployment, and broad UI remain untouched.
Validation:
- npm exec --yes pnpm@10.32.1 -- run test:persona-encounters
- npm exec --yes pnpm@10.32.1 -- run test:reports
- npm exec --yes pnpm@10.32.1 -- run test:studio-ui
- npm exec --yes pnpm@10.32.1 -- run typecheck
- changed-path/forbidden-path scans
- secret-shaped value scan
- git diff --check
- git diff --cached --check
Task:
- Review PR511A as ledger-only consent/provenance work.
- Confirm owner scoping, audit append-only posture, state transitions, non-executable scope readback, and forbidden-scope boundaries.
- If accepted, wake MIMIR with the next routing decision.
```
