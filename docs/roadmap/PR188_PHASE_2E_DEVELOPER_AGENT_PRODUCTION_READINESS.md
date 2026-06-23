# PR188 - Phase 2E Developer Agent Production Readiness

Date opened: 2026-06-23
Opened by: A1 / MIMIR
Owner: DAEDALUS
Reviewer: ARGUS
Rehearsal: ARIADNE only if DAEDALUS changes visible owner/public flows.
Status: opened for DAEDALUS audit and sequencing

## Why This Lane

Phase 2D made the Developer Agent real enough for protected-alpha use. It did
not make every registered tool production-ready.

2D closed with:

- safe owner readbacks;
- confirmation envelopes;
- non-external capability receipts;
- private draft save;
- selected draft publish;
- sanitized activity readback;
- selected public observatory status note;
- five risky future actions still blocked after owner approval.

After PR176, the correct next step was a protected-alpha human rehearsal. That
has now happened and did not identify a blocking product defect. So the next
mission step is Phase 2E: decide what it takes to graduate Developer Agent from
bounded protected-alpha to production-ready behavior without unlocking dangerous
tools by inertia.

## Phase 2E Question

Answer this directly:

> Which Developer Agent actions are production-capable now, which remain
> protected-alpha only, which must stay blocked, and which single production
> hardening lane should open first?

## DAEDALUS Task

Create a production-readiness packet covering every Developer Agent action:

- `read_developer_space_brief`
- `read_observed_runtime_status`
- `read_provider_policy_posture`
- `read_evidence_path`
- `read_logs`
- `draft_project_update`
- `request_capability`
- `save_project_update_draft`
- `publish_to_page`
- `update_observatory`
- `update_layout`
- `push_to_repo`
- `run_job`
- `rotate_ingestion_key`
- `create_webhook_signing_secret`

For each action, classify:

- `prod-capable now`
- `protected-alpha only`
- `blocked until Phase 2E hardening`
- `blocked beyond Phase 2E`

For each classification, record:

- current implementation truth;
- owner-confirmation and audit requirements;
- data/private payload exposure risk;
- external side-effect risk;
- idempotency and rollback posture;
- tests already present;
- exact missing proof before production.

## Candidate 2E Implementation Slices

DAEDALUS should recommend exactly one first implementation slice. Candidate
directions:

- production audit log and receipt export hardening;
- owner-confirmed layout suggestion gate, still no direct layout mutation;
- background-job dry-run/readiness gate, still no worker execution;
- repo-push planning packet only, still no push;
- key-rotation rehearsal packet only, still no key mutation;
- webhook-signing-secret design packet only, still no secret creation.

The recommendation should prefer the slice that improves real production
trust most while adding the least irreversible external power.

## Boundaries

Do not:

- mark all Developer Agent tools production-ready because Phase 2D passed;
- open repo push, shell, deployment, worker execution, key rotation, signing
  secret creation, Cloudflare, Redis, provider, billing, Railway, or Supabase
  config mutation in this audit lane;
- weaken owner scoping, confirmation, idempotency, or minimized receipt rules;
- treat user approval alone as enough for external side effects.

Allowed:

- docs and focused tests proving current production-readiness claims;
- small guard repairs if a production-readiness claim is false;
- a recommended first 2E implementation lane with scope and validation.

## Expected Output

Update:

- this file;
- `docs/roadmap/ACTIVE_STATUS.md`;
- `docs/roadmap/STATION_FUTURE_LANES.md` if the 2E status changes;
- `docs/testing/VALIDATION_BASELINE.md` only if validation truth changes.

Wake ARGUS if docs/tests/code change. Wake MIMIR directly only if no patch is
needed and the packet is verdict-only.

## Validation

Minimum:

- `git diff --check`

If touching Developer Agent guards:

- `npm exec --yes pnpm@10.32.1 -- run test:developer-spaces`
- targeted route/service tests for the touched action family

If touching web helpers:

- `npm exec --yes pnpm@10.32.1 -- run test:developer-space-client`

If touching TypeScript:

- `npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck`
