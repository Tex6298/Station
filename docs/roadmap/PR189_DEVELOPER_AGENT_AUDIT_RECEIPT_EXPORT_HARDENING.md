# PR189 - Developer Agent Production Audit And Receipt Export Hardening

Date opened: 2026-06-23
Opened by: A1 / MIMIR
Owner: DAEDALUS
Reviewer: ARGUS
Rehearsal: ARIADNE only if visible owner/public flows change.
Status: implemented by DAEDALUS; awaiting ARGUS review

## Why This Lane

PR188 classified Developer Agent production readiness. Safe readbacks and
preview-only `draft_project_update` are production-capable now. The first
production trust gap is the owner-confirmed receipt family:

- `request_capability`
- `save_project_update_draft`
- `publish_to_page`
- `update_observatory`

Those paths already write Station state. Before Phase 2E opens new powers, the
existing receipt paths need production-grade audit, export, retention/deletion,
and reconciliation posture.

## Goal

Make owner-confirmed Developer Agent actions auditable and exportable enough
for production trust without adding new external power.

The owner should be able to answer:

- what was requested;
- what was approved;
- what execution did or did not do;
- which Station artifact or public event was affected;
- whether a retry reused an existing receipt;
- what can be exported for account/workspace records;
- what remains intentionally absent from minimized receipts.

## Scope

DAEDALUS should inspect existing confirmation and receipt models/routes/tests,
then implement the narrowest production hardening slice.

Expected work:

- Add or harden owner-only audit/readback over Developer Agent confirmations
  and execution receipts.
- Add or harden export/readback shape for the four owner-confirmed receipt
  paths listed above.
- Include confirmation state, action, created/completed timestamps, status,
  safe summary, receipt status, affected artifact label/type, and retry/
  idempotency markers where available.
- Preserve minimized payload policy: no owner ids, confirmation ids, raw target
  ids, dedupe keys, preview hashes, private document bodies, prompt/provider
  payloads, cookies, keys, tokens, connection strings, webhook payloads, or
  secret-shaped material in public or export-visible text unless already
  explicitly owner-private and sanitized.
- Add focused tests for owner scoping, non-owner denial, minimized payloads,
  idempotent receipt readback, and export/readback coverage.

## Boundaries

Do not:

- add repo push, shell, deployment, worker/job execution, key rotation, signing
  secret creation, provider calls, Cloudflare, Redis, Railway/Supabase config,
  billing, or layout mutation;
- make `update_layout`, `run_job`, `push_to_repo`, `rotate_ingestion_key`, or
  `create_webhook_signing_secret` executable;
- expose raw IDs or private payloads to public routes;
- redesign the Developer Agent UI broadly;
- claim production readiness for public mutations until ARGUS accepts this
  audit/export hardening.

Allowed:

- API/service/test work for owner-only audit/export/readback;
- small docs updates to record production-readiness truth;
- small owner UI helper only if the existing product surface already has a
  natural readback location and ARIADNE can rehearse it.

## Validation

Required:

- `npm exec --yes pnpm@10.32.1 -- run test:developer-spaces`
- `git diff --check`

If API types change:

- `npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck`

If web helpers change:

- `npm exec --yes pnpm@10.32.1 -- run test:developer-space-client`

ARGUS should review owner scoping, export/minimized payload posture, public
cleanliness, idempotency/retry truth, and overclaim boundaries.

## DAEDALUS Implementation Result

Completed on 2026-06-23.

Implemented:

- Added owner-only `GET /developer-spaces/:id/agent/actions/audit-export`.
- Added shared `DeveloperSpaceAgentAuditExport` DTOs.
- The route joins owner confirmations to receipts internally while exporting
  only minimized action, status, timestamp, safe summary, receipt, artifact,
  idempotency, boundary, and omitted-field metadata.
- Covered the four owner-confirmed receipt actions:
  `request_capability`, `save_project_update_draft`, `publish_to_page`, and
  `update_observatory`.
- Kept `update_layout`, `run_job`, `push_to_repo`, `rotate_ingestion_key`, and
  `create_webhook_signing_secret` blocked.
- Added a focused Developer Spaces test for anonymous/non-owner denial,
  owner-scoped export readback, minimized payloads, idempotency markers, all
  four receipt paths, and public cleanliness.

Validation:

- `npm exec --yes pnpm@10.32.1 -- run test:developer-spaces` passed, 43 tests.
- `npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck` passed.

Remaining review:

- ARGUS should verify owner scoping, minimized export posture, public
  cleanliness, idempotency/retry truth, and that no production-readiness claim
  outruns the protected-alpha boundary.
