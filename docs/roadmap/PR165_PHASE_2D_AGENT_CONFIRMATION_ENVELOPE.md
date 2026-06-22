# PR165 - Phase 2D Agent Confirmation Envelope

Date opened: 2026-06-22
Opened by: A1 / MIMIR
Owner: DAEDALUS implements. ARGUS reviews. ARIADNE only rehearses if DAEDALUS
changes visible UI.
Status: implemented by DAEDALUS; open for ARGUS review

## Why This Lane

PR162 created the typed Developer Space agent action registry. PR163 exposed it
as a visible owner preview panel. PR164 proved the panel on hosted Railway.

The next Phase 2D risk is not "can the panel show actions?" It is "how does
Station record explicit owner intent before any future action mutates anything?"

Before `publish_to_page`, `update_layout`, `run_job`, key rotation, signing
secret creation, repo/deploy, or any other future action can become live, Station
needs a small confirmation envelope:

- owner-scoped;
- auditable;
- sanitized;
- expiring/cancellable;
- separate from execution;
- impossible to confuse with an already-executed tool.

This lane should build that envelope without enabling any mutation or execution.

## Scope

Implement a bounded Developer Space agent confirmation foundation.

Add a durable confirmation record for future agent actions. Recommended table:

```text
developer_space_agent_confirmations
```

Recommended fields:

- `id`
- `developer_space_id`
- `owner_user_id`
- `action`
- `status`
- `summary`
- `preview_hash`
- `sanitized_payload`
- `requested_at`
- `expires_at`
- `approved_at`
- `cancelled_at`
- `created_at`
- `updated_at`

Recommended status vocabulary:

- `pending`
- `approved`
- `cancelled`
- `expired`

The `approved` status records owner approval only. It must not execute the
action in this PR.

Add owner-only routes around the confirmation envelope. Suggested shape:

```text
GET  /developer-spaces/:id/agent/actions/confirmations
POST /developer-spaces/:id/agent/actions/confirmations
POST /developer-spaces/:id/agent/actions/confirmations/:confirmationId/approve
POST /developer-spaces/:id/agent/actions/confirmations/:confirmationId/cancel
```

Behavior:

- confirmations are allowed only for PR162 future-lane actions that require
  confirmation;
- read/draft preview actions should not require durable confirmations;
- unknown actions are rejected;
- non-owner/non-admin access is rejected before confirmation handling;
- records store sanitized summary/status/labels only, not raw prompts, raw
  response bodies, raw metrics, event payloads, context payloads, source refs,
  linked-document body excerpts, keys, signing material, provider payloads,
  private logs, cookies, tokens, or environment values;
- approval returns a clear "approved, execution unavailable in this lane"
  response;
- cancel is idempotent enough for owner UX;
- expired records cannot be approved;
- creating/approving/cancelling confirmations must not mutate documents, layout,
  keys, signing secrets, provider settings, observed-runtime state, billing,
  exports, public pages, repos, deployments, queues, Cloudflare, Redis workers,
  or hosted runtime.

Update shared types and DB types as needed.

## Non-Scope

- No execution route.
- No live mutation behind any action.
- No model chat loop, provider call, prompt-to-tool parser, or streaming
  assistant.
- No visible UI unless DAEDALUS finds a tiny non-risk readback affordance is
  necessary; prefer API/schema foundation first.
- No Cloudflare, Redis worker, queue, hosted runtime, repo, shell, deploy,
  billing, public page, key/signing-secret mutation, or document/layout
  mutation.
- No broad Developer Space redesign.

## Implementation Notes

Likely touched files:

- `infra/supabase/migrations/049_developer_space_agent_confirmations.sql`
- `packages/db/src/types.ts`
- `packages/types/src/developer-space.ts`
- `apps/api/src/routes/developer-spaces.ts`
- `apps/api/src/routes/developer-spaces.test.ts`
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/testing/VALIDATION_BASELINE.md`

Use existing Developer Space owner/admin loading helpers. Prefer an explicit
sanitizing serializer over returning raw rows.

If DAEDALUS finds that the confirmation table would duplicate an existing
accepted audit primitive, wake MIMIR before implementing an alternate shape.

## Acceptance

- Owner/admin can create/list/approve/cancel confirmation records for future
  Developer Agent actions.
- Non-owner access is rejected.
- Read/draft actions do not create unnecessary confirmation records.
- Unknown actions and unsupported actions are rejected safely.
- Approval is recorded but does not execute anything.
- Expired/cancelled records cannot be approved into an ambiguous state.
- No secrets/private payloads/raw logs are stored in or returned from the
  confirmation envelope.
- Tests prove no side effects for representative future actions such as
  `publish_to_page`, `run_job`, `rotate_ingestion_key`, and
  `create_webhook_signing_secret`.

## Validation

Run:

```bash
npm exec --yes pnpm@10.32.1 -- run test:developer-spaces
npm exec --yes pnpm@10.32.1 -- --filter @station/types build
npm exec --yes pnpm@10.32.1 -- --filter @station/api build
npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck
git diff --check
```

If touched type paths require it and local policy allows, also run the root
typecheck. If Windows Application Control blocks Turbo before TypeScript, record
the blocker and keep direct package checks.

## ARGUS Review Ask

ARGUS should review:

- owner/admin scoping and non-owner hostile paths;
- expiry/cancel/approve state transitions;
- proof that approved confirmations do not execute actions;
- storage/serialization leak risk;
- no accidental mutation of documents, keys, signing secrets, observed-runtime
  state, provider settings, public pages, billing, exports, queues, Cloudflare,
  Redis, hosted runtime, repos, shell, or deploy paths;
- whether the status names or copy could imply an action already ran.

## Handoff

DAEDALUS should wake ARGUS with:

- exact files touched;
- migration/table shape;
- route shape;
- confirmation status transitions;
- validation results;
- side-effect and privacy notes;
- whether visible UI changed and ARIADNE is needed.

If blocked, wake MIMIR with the exact blocker instead of going silent.
