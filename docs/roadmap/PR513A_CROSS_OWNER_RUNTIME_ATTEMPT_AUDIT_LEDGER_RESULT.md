# PR513A - Cross-Owner Runtime Attempt Audit Ledger Result

Owner: DAEDALUS / A2

Date: 2026-07-11

Status:

```text
READY_FOR_ARGUS_REVIEW
```

## Summary

DAEDALUS implemented PR513A as the bounded runtime attempt audit layer required
before any provider-backed cross-owner disposable preview:

- added migration `078` with
  `persona_encounter_cross_owner_runtime_attempts`;
- tied attempts to cross-owner consent rows by `consent_id`;
- stored only actor/participant roles, consent status, requested scope/version,
  readiness code, lifecycle status, and created/completed timestamps;
- added participant-only SELECT RLS through the parent consent row;
- added no participant insert/update/delete policies;
- made attempt rows append-only with update/delete blockers;
- added RPC helper shape
  `record_persona_encounter_cross_owner_runtime_attempt`;
- added API helper `recordCrossOwnerRuntimeAttemptAudit`;
- added participant-only readback at
  `GET /persona-encounters/cross-owner-consents/:consentId/runtime-attempts`;
- kept generic consent readback and every requested scope `executable: false`.

PR513A does not add provider-backed preview, prompt assembly, generated words,
token rows, private sessions, public exhibits, reports, memory/canon/archive/
continuity/export/jobs/storage/public rows, UI, package, provider, retrieval,
Redis, Cloudflare, Stripe, billing, workers, deployment, or public surfacing.

## Files Changed

- `infra/supabase/migrations/078_persona_encounter_cross_owner_runtime_attempts.sql`
- `packages/db/src/types.ts`
- `apps/api/src/routes/persona-encounters.ts`
- `apps/api/src/routes/persona-encounters.test.ts`
- `docs/roadmap/PR513A_CROSS_OWNER_RUNTIME_ATTEMPT_AUDIT_LEDGER_RESULT.md`
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/roadmap/LANE_INDEX.md`
- `docs/testing/VALIDATION_BASELINE.md`

## Schema And RLS

Migration `078` adds:

- `persona_encounter_cross_owner_runtime_attempts`;
- foreign key to `persona_encounter_cross_owner_consents`;
- bounded roles: `requester` and `counterparty`;
- distinct initiator/responder role constraint;
- bounded consent statuses and requested scopes matching the existing consent
  ledger;
- bounded readiness code format;
- lifecycle statuses:
  `blocked_before_provider`, `provider_succeeded`, `provider_failed`,
  `provider_empty`, `quota_exceeded`, `rate_limited`, and
  `provider_unavailable`;
- participant-only SELECT RLS by joining the consent row to
  `requester_owner_user_id` or `counterparty_owner_user_id`;
- no public/nonparticipant read path;
- no direct participant insert/update/delete policies;
- append-only update/delete triggers.

The RPC helper is `security invoker`, inserts one bounded metadata row, and
returns the inserted row for future before-provider and after-provider audit
call sites.

## API Contract

Route:

```text
GET /persona-encounters/cross-owner-consents/:consentId/runtime-attempts
```

Behavior:

- requires auth;
- returns `401` signed out;
- returns `404` for nonparticipants without row inference;
- returns participant-visible bounded attempt metadata ordered newest first;
- returns only a small consent summary with non-executable ledger flags;
- excludes raw owner ids, raw persona ids, participant persona names, prompts,
  private persona fields, provider payloads, generated words, token facts,
  source bodies, traces, SQL details, env values, cookies, bearer values, and
  secret-shaped strings.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:persona-encounters` | Pass | 48 tests passed, including PR513A migration/RLS shape, helper insert/readback, fail-closed helper behavior, participant/nonparticipant/signed-out readback, generic consent non-executable readback, privacy, and no-side-effect coverage. |
| `npm exec --yes pnpm@10.32.1 -- run test:reports` | Pass | 7 tests passed; public exhibit report/takedown behavior remains green. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 201 tests passed; PR513A adds no visible UI. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | Turbo API/web typecheck passed. |
| Changed-path scan | Pass | Changes are limited to migration `078`, DB types, persona encounter API/test files, and roadmap/testing docs. |
| Forbidden-path scan | Pass | No web UI, package/lockfile, provider service, token service, operational cache, `packages/ai`, `packages/auth`, Railway, Cloudflare, or deploy-script paths changed. |
| Secret-shaped diff scan | Pass | No API-key, private-key, GitHub token, bearer-token-shaped, provider-key env, Railway token, or private-key block values found in the diff. |
| `git diff --check` | Pass | No unstaged whitespace errors. |
| `git diff --cached --check` | Pass | No staged whitespace errors. |

## Review Handoff

ARGUS should review:

- migration `078` RLS/no-policy/append-only shape;
- RPC helper and route serialization;
- whether the metadata-only response is narrow enough;
- whether the helper failure behavior is sufficiently fail-closed for future
  preview state mutation call sites.

If ARGUS accepts PR513A, MIMIR should route ARIADNE for hosted migration/API
proof because this lane adds schema and participant-visible audit behavior.
